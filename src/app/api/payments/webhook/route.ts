import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { CREDIT_PACKAGES } from '@/lib/constants/creditPackages';
import { grantCredits } from '@/lib/payments/credits';
import { verifyWebhookSignature } from '@/lib/payments/webhook';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('toss-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);
    const { orderId, paymentKey, status } = data;

    if (status !== 'DONE') {
      return NextResponse.json({ message: 'Ignored non-DONE status' });
    }

    // Check if credits already granted (idempotency)
    const paymentRef = adminDb.collection('payments').doc(orderId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      console.error(`Webhook: Payment ${orderId} not found`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const paymentData = paymentDoc.data()!;

    if (paymentData.creditsGranted) {
      return NextResponse.json({ message: 'Credits already granted' });
    }

    // Safety net: grant credits
    const pkg = CREDIT_PACKAGES[paymentData.packageId];
    if (!pkg) {
      console.error(`Webhook: Invalid package ${paymentData.packageId}`);
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    // Atomically mark as granted to prevent double-spend from concurrent webhook calls
    const alreadyGranted = await adminDb.runTransaction(async (transaction) => {
      const freshDoc = await transaction.get(paymentRef);
      if (freshDoc.data()?.creditsGranted) {
        return true;
      }
      transaction.update(paymentRef, {
        paymentKey,
        tossStatus: status,
        status: 'confirmed',
        creditsGranted: true,
        confirmedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return false;
    });

    if (alreadyGranted) {
      return NextResponse.json({ message: 'Credits already granted' });
    }

    await grantCredits({
      uid: paymentData.uid,
      credits: pkg.credits,
      packageId: pkg.id,
      amountKRW: pkg.priceKRW,
      paymentKey,
      orderId,
    });

    return NextResponse.json({ message: 'Credits granted via webhook' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
