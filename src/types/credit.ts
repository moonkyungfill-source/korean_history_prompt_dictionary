import { Timestamp } from 'firebase/firestore';

export interface Transaction {
  id: string;
  type: 'purchase' | 'spend' | 'refund';
  creditsBefore: number;
  creditsAfter: number;
  creditsDelta: number;
  packageId?: string;
  amountKRW?: number;
  paymentKey?: string;
  orderId?: string;
  promptId?: string;
  generationId?: string;
  description: string;
  createdAt: Timestamp;
}
