import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/verifyToken';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

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

    // Get prompt data for snapshot
    const promptDoc = await adminDb.collection('prompts').doc(promptId).get();
    if (!promptDoc.exists) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    const promptData = promptDoc.data()!;

    // Check if already bookmarked
    const bookmarkRef = adminDb
      .collection('users')
      .doc(uid)
      .collection('bookmarks')
      .doc(promptId);

    const existingBookmark = await bookmarkRef.get();
    if (existingBookmark.exists) {
      return NextResponse.json({ message: 'Already bookmarked' });
    }

    // Add bookmark and increment count atomically
    await adminDb.runTransaction(async (transaction) => {
      transaction.set(bookmarkRef, {
        promptId,
        promptSnapshot: {
          title: promptData.title,
          era: promptData.era,
          thumbnailUrl: promptData.thumbnailUrl || null,
        },
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.update(adminDb.collection('prompts').doc(promptId), {
        bookmarkCount: FieldValue.increment(1),
      });
    });

    return NextResponse.json({ message: 'Bookmarked' }, { status: 201 });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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

    const bookmarkRef = adminDb
      .collection('users')
      .doc(uid)
      .collection('bookmarks')
      .doc(promptId);

    const existingBookmark = await bookmarkRef.get();
    if (!existingBookmark.exists) {
      return NextResponse.json({ message: 'Not bookmarked' }, { status: 404 });
    }

    // Remove bookmark and decrement count atomically (prevent negative)
    const promptRef = adminDb.collection('prompts').doc(promptId);
    await adminDb.runTransaction(async (transaction) => {
      const promptDoc = await transaction.get(promptRef);
      const currentCount = promptDoc.exists ? (promptDoc.data()!.bookmarkCount ?? 0) : 0;

      transaction.delete(bookmarkRef);

      if (currentCount > 0) {
        transaction.update(promptRef, {
          bookmarkCount: FieldValue.increment(-1),
        });
      }
    });

    return NextResponse.json({ message: 'Bookmark removed' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
