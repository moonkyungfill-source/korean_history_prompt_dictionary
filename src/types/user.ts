import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  creditBalance: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
