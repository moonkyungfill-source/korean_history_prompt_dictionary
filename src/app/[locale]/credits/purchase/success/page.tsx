'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { auth } from '@/lib/firebase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Link } from '@/i18n/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const t = useTranslations('payment');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [credits, setCredits] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');

      if (!paymentKey || !orderId || !amount) {
        setStatus('error');
        setErrorMessage(t('missingInfo'));
        return;
      }

      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          setStatus('error');
          setErrorMessage(t('confirmError'));
          return;
        }
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || t('confirmError'));
        }

        setCredits(data.credits);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : t('confirmError'));
      }
    };

    if (user) {
      confirmPayment();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchParams]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600">{t('confirming')}</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{t('confirmFailed')}</h1>
        <p className="text-gray-600 mb-6">{errorMessage}</p>
        <Link
          href="/credits/purchase"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('retry')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">{t('successTitle')}</h1>
      <p className="text-gray-600 mb-2">
        {t('successMessage', { credits })}
      </p>
      <div className="flex flex-col gap-3 mt-6">
        <Link
          href="/prompts"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('goToPrompts')}
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t('goToDashboard')}
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  const t = useTranslations('payment');

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">{t('confirming')}</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
