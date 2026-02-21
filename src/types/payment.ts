import { Timestamp } from 'firebase/firestore';

export interface Payment {
  orderId: string;
  uid: string;
  packageId: string;
  expectedAmountKRW: number;
  paymentKey: string | null;
  tossStatus: string | null;
  tossResponse: Record<string, unknown> | null;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  creditsGranted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  confirmedAt: Timestamp | null;
  failReason: string | null;
}
