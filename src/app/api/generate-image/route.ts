import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/verifyToken';
import { adminDb, getAdminStorage } from '@/lib/firebase/admin';
import { spendCredits, refundCredits } from '@/lib/payments/credits';
import { IMAGE_GENERATION_COST } from '@/lib/constants/creditPackages';
import { generateImageWithImagen } from '@/lib/firebase/ai';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const authResult = await verifyToken(req);
  if (!authResult) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uid } = authResult;

  try {
    const { promptId } = await req.json();

    if (!promptId) {
      return NextResponse.json({ error: 'Missing promptId' }, { status: 400 });
    }

    // Get prompt
    const promptDoc = await adminDb.collection('prompts').doc(promptId).get();
    if (!promptDoc.exists) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    const promptData = promptDoc.data()!;

    // Validate prompt is published
    if (promptData.status !== 'published') {
      return NextResponse.json({ error: 'PROMPT_NOT_PUBLISHED' }, { status: 403 });
    }

    const generationId = uuidv4();

    // Spend credits (will throw if insufficient)
    try {
      await spendCredits({
        uid,
        credits: IMAGE_GENERATION_COST,
        promptId,
        generationId,
        description: 'image_generation',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Insufficient credits') {
        return NextResponse.json({ error: 'INSUFFICIENT_CREDITS' }, { status: 402 });
      }
      throw error;
    }

    // Create generation document
    const genRef = adminDb.collection('generations').doc(generationId);
    await genRef.set({
      id: generationId,
      uid,
      promptId,
      promptText: promptData.promptText,
      status: 'processing',
      imageUrl: null,
      storagePath: null,
      creditsCharged: IMAGE_GENERATION_COST,
      createdAt: FieldValue.serverTimestamp(),
      completedAt: null,
    });

    // Increment usage count
    await adminDb.collection('prompts').doc(promptId).update({
      usageCount: FieldValue.increment(1),
    });

    // Generate image using Firebase AI Logic (Imagen)
    try {
      const result = await generateImageWithImagen(promptData.promptText);

      // Upload to Firebase Storage
      const bucket = getAdminStorage().bucket();
      const filePath = `generations/${uid}/${generationId}.png`;
      const file = bucket.file(filePath);

      await file.save(result.imageData, {
        metadata: {
          contentType: result.mimeType,
          metadata: { uid, generationId, promptId },
        },
      });

      // Make the file publicly readable
      await file.makePublic();
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      await genRef.update({
        status: 'completed',
        imageUrl,
        storagePath: filePath,
        completedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json({
        generationId,
        imageUrl,
        status: 'completed',
      });
    } catch (apiError) {
      console.error('Image generation failed:', apiError);

      // Refund credits on failure
      await refundCredits({
        uid,
        credits: IMAGE_GENERATION_COST,
        generationId,
        description: 'generation_failed_refund',
      });

      await genRef.update({
        status: 'failed',
        completedAt: FieldValue.serverTimestamp(),
      });

      return NextResponse.json(
        { error: 'GENERATION_FAILED' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in generate-image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
