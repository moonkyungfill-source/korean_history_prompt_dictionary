'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';

interface AuthContextType {
  user: FirebaseUser | null;
  creditBalance: number;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  creditBalance: 0,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [creditBalance, setCreditBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setCreditBalance(0);
        setLoading(false);
        return;
      }

      // Create user document if first login — await before marking as loaded
      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          console.error('create-user API error:', res.status, await res.text());
        }
      } catch (error) {
        console.error('Failed to create user document:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  // Listen to credit balance changes in real-time
  useEffect(() => {
    if (!user) return;

    const unsubSnapshot = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          setCreditBalance(snapshot.data().creditBalance ?? 0);
        }
      },
      (error) => {
        console.error('Error listening to user doc:', error);
      }
    );

    return () => unsubSnapshot();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, creditBalance, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
