'use client';

import { useEffect } from 'react';
import { getClientAnalytics } from '@/lib/firebase/client';

export default function FirebaseAnalytics() {
  useEffect(() => {
    getClientAnalytics();
  }, []);

  return null;
}
