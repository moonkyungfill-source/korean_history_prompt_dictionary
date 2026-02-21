import { adminAuth } from '@/lib/firebase/admin';
import { NextRequest } from 'next/server';

export async function verifyToken(req: NextRequest): Promise<{ uid: string } | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}
