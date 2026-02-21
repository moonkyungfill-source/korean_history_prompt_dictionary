import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/verifyToken';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

const WELCOME_CREDITS = 5;

export async function POST(req: NextRequest) {
  const authResult = await verifyToken(req);
  if (!authResult) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uid } = authResult;

  try {
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return NextResponse.json({ message: 'User already exists' });
    }

    // Get user info from Firebase Auth
    const { adminAuth } = await import('@/lib/firebase/admin');
    const firebaseUser = await adminAuth.getUser(uid);

    // Use transaction to atomically create user + welcome credits
    const txId = uuidv4();
    await adminDb.runTransaction(async (transaction) => {
      transaction.set(userRef, {
        uid,
        email: firebaseUser.email ?? '',
        displayName: firebaseUser.displayName ?? null,
        photoURL: firebaseUser.photoURL ?? null,
        creditBalance: WELCOME_CREDITS,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const txRef = userRef.collection('transactions').doc(txId);
      transaction.set(txRef, {
        id: txId,
        type: 'purchase',
        creditsBefore: 0,
        creditsAfter: WELCOME_CREDITS,
        creditsDelta: WELCOME_CREDITS,
        description: 'welcome_bonus',
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ message: 'User created', welcomeCredits: WELCOME_CREDITS }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
