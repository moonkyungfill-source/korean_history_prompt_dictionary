'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LoadingSpinner from '@/components/common/LoadingSpinner';

function FailContent() {
  const searchParams = useSearchParams();
  const t = useTranslations('payment');
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">{t('failTitle')}</h1>
      <p className="text-gray-600 mb-2">
        {errorMessage || t('failMessage')}
      </p>
      {errorCode && (
        <p className="text-sm text-gray-400 mb-6">{t('errorCode', { code: errorCode })}</p>
      )}
      <div className="flex flex-col gap-3 mt-6">
        <Link
          href="/credits/purchase"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('retry')}
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

export default function PaymentFailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <FailContent />
    </Suspense>
  );
}
