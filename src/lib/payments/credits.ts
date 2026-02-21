import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

interface GrantCreditsParams {
  uid: string;
  credits: number;
  packageId: string;
  amountKRW: number;
  paymentKey: string;
  orderId: string;
}

interface SpendCreditsParams {
  uid: string;
  credits: number;
  promptId: string;
  generationId: string;
  description: string;
}

interface RefundCreditsParams {
  uid: string;
  credits: number;
  generationId: string;
  description: string;
}

export async function grantCredits({
  uid,
  credits,
  packageId,
  amountKRW,
  paymentKey,
  orderId,
}: GrantCreditsParams): Promise<void> {
  if (credits <= 0) {
    throw new Error('Credit amount must be positive');
  }
  const userRef = adminDb.collection('users').doc(uid);
  const txId = uuidv4();

  await adminDb.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const currentBalance = userDoc.data()!.creditBalance as number;
    const newBalance = currentBalance + credits;

    transaction.update(userRef, {
      creditBalance: newBalance,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const txRef = userRef.collection('transactions').doc(txId);
    transaction.set(txRef, {
      id: txId,
      type: 'purchase',
      creditsBefore: currentBalance,
      creditsAfter: newBalance,
      creditsDelta: credits,
      packageId,
      amountKRW,
      paymentKey,
      orderId,
      description: 'credit_purchase',
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}

export async function spendCredits({
  uid,
  credits,
  promptId,
  generationId,
  description,
}: SpendCreditsParams): Promise<void> {
  if (credits <= 0) {
    throw new Error('Credit amount must be positive');
  }
  const userRef = adminDb.collection('users').doc(uid);
  const txId = uuidv4();

  await adminDb.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const currentBalance = userDoc.data()!.creditBalance as number;
    if (currentBalance < credits) {
      throw new Error('Insufficient credits');
    }

    const newBalance = currentBalance - credits;

    transaction.update(userRef, {
      creditBalance: newBalance,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const txRef = userRef.collection('transactions').doc(txId);
    transaction.set(txRef, {
      id: txId,
      type: 'spend',
      creditsBefore: currentBalance,
      creditsAfter: newBalance,
      creditsDelta: -credits,
      promptId,
      generationId,
      description,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}

export async function refundCredits({
  uid,
  credits,
  generationId,
  description,
}: RefundCreditsParams): Promise<void> {
  if (credits <= 0) {
    throw new Error('Credit amount must be positive');
  }
  const userRef = adminDb.collection('users').doc(uid);
  const txId = uuidv4();

  await adminDb.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const currentBalance = userDoc.data()!.creditBalance as number;
    const newBalance = currentBalance + credits;

    transaction.update(userRef, {
      creditBalance: newBalance,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const txRef = userRef.collection('transactions').doc(txId);
    transaction.set(txRef, {
      id: txId,
      type: 'refund',
      creditsBefore: currentBalance,
      creditsAfter: newBalance,
      creditsDelta: credits,
      generationId,
      description,
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}
