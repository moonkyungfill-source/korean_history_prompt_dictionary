import { initializeApp, getApps, cert, applicationDefault, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Use service account key if available, otherwise fall back to ADC
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }

  // Application Default Credentials (local dev with gcloud auth)
  return initializeApp({
    credential: applicationDefault(),
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

let _adminAuth: Auth | null = null;
let _adminDb: Firestore | null = null;
let _adminStorage: Storage | null = null;

export function getAdminAuth(): Auth {
  if (!_adminAuth) {
    _adminAuth = getAuth(getAdminApp());
  }
  return _adminAuth;
}

export function getAdminDb(): Firestore {
  if (!_adminDb) {
    _adminDb = getFirestore(getAdminApp());
  }
  return _adminDb;
}

export function getAdminStorage(): Storage {
  if (!_adminStorage) {
    _adminStorage = getStorage(getAdminApp());
  }
  return _adminStorage;
}

// Convenience lazy aliases via Proxy
export const adminAuth = new Proxy({} as Auth, {
  get(_, prop) {
    return (getAdminAuth() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const adminDb = new Proxy({} as Firestore, {
  get(_, prop) {
    const db = getAdminDb();
    const value = (db as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(db);
    }
    return value;
  },
});

export const adminStorage = new Proxy({} as Storage, {
  get(_, prop) {
    const s = getAdminStorage();
    const value = (s as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(s);
    }
    return value;
  },
});
