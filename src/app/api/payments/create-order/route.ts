import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/verifyToken';
import { adminDb } from '@/lib/firebase/admin';
import { CREDIT_PACKAGES } from '@/lib/constants/creditPackages';
import { FieldValue } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const authResult = await verifyToken(req);
  if (!authResult) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { uid } = authResult;

  try {
    const { packageId } = await req.json();

    const pkg = CREDIT_PACKAGES[packageId];
    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const orderId = `order_${uuidv4()}`;

    await adminDb.collection('payments').doc(orderId).set({
      orderId,
      uid,
      packageId: pkg.id,
      expectedAmountKRW: pkg.priceKRW,
      paymentKey: null,
      tossStatus: null,
      tossResponse: null,
      status: 'pending',
      creditsGranted: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      confirmedAt: null,
      failReason: null,
    });

    return NextResponse.json({
      orderId,
      amount: pkg.priceKRW,
      orderName: `${pkg.credits} Credits`,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
