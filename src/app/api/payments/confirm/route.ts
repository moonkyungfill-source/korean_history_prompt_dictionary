import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/verifyToken';
import { adminDb } from '@/lib/firebase/admin';
import { CREDIT_PACKAGES } from '@/lib/constants/creditPackages';
import { confirmPayment } from '@/lib/payments/toss';
import { grantCredits } from '@/lib/payments/credits';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  const authResult = await verifyToken(req);
  if (!authResult) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uid } = authResult;

  try {
    const { paymentKey, orderId, amount } = await req.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify payment document exists and belongs to user
    const paymentRef = adminDb.collection('payments').doc(orderId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const paymentData = paymentDoc.data()!;

    if (paymentData.uid !== uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (paymentData.creditsGranted) {
      return NextResponse.json({ message: 'Credits already granted' });
    }

    // Verify amount matches expected
    if (amount !== paymentData.expectedAmountKRW) {
      await paymentRef.update({
        status: 'failed',
        failReason: 'Amount mismatch',
        updatedAt: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    // Confirm with Toss
    const tossResponse = await confirmPayment({ paymentKey, orderId, amount });

    // Get package details
    const pkg = CREDIT_PACKAGES[paymentData.packageId];
    if (!pkg) {
      throw new Error('Invalid package ID in payment');
    }

    // Atomically mark as granted BEFORE granting credits to prevent double-spend
    const alreadyGranted = await adminDb.runTransaction(async (transaction) => {
      const freshDoc = await transaction.get(paymentRef);
      if (freshDoc.data()?.creditsGranted) {
        return true; // Already processed by concurrent request
      }
      transaction.update(paymentRef, {
        creditsGranted: true,
        paymentKey,
        tossStatus: tossResponse.status,
        tossResponse: tossResponse as Record<string, unknown>,
        status: 'confirmed',
        confirmedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return false;
    });

    if (alreadyGranted) {
      return NextResponse.json({ message: 'Credits already granted' });
    }

    // Grant credits (safe — payment doc already marked as granted)
    await grantCredits({
      uid,
      credits: pkg.credits,
      packageId: pkg.id,
      amountKRW: pkg.priceKRW,
      paymentKey,
      orderId,
    });

    return NextResponse.json({
      message: 'Payment confirmed',
      credits: pkg.credits,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment confirmation failed' },
      { status: 500 }
    );
  }
}
