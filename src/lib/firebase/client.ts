import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _analytics: Analytics | null = null;

function getApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return _app;
}

export function getClientAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getApp());
  }
  return _auth;
}

export function getClientDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getApp());
  }
  return _db;
}

// Analytics - only initializes in browser (SSR-safe)
export async function getClientAnalytics(): Promise<Analytics | null> {
  if (_analytics) return _analytics;
  const supported = await isSupported();
  if (supported) {
    _analytics = getAnalytics(getApp());
  }
  return _analytics;
}

// Lazy proxy exports - only initialize when actually accessed at runtime
export const auth = new Proxy({} as Auth, {
  get(_, prop) {
    const a = getClientAuth();
    const value = (a as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(a);
    }
    return value;
  },
});

export const db = new Proxy({} as Firestore, {
  get(_, prop) {
    const d = getClientDb();
    const value = (d as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(d);
    }
    return value;
  },
});
