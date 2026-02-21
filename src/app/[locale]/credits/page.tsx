'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, Link } from '@/i18n/navigation';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import TransactionList from '@/components/credits/TransactionList';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function CreditsPage() {
  const { user, creditBalance, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations('credits');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('title')}</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white mb-8">
        <div className="text-sm opacity-80 mb-1">{t('currentBalance')}</div>
        <div className="text-4xl font-bold mb-4">
          {creditBalance.toLocaleString()} {t('creditUnit')}
        </div>
        <Link
          href="/credits/purchase"
          className="inline-block px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
        >
          {t('purchase')}
        </Link>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('transactionHistory')}</h2>
        <TransactionList />
      </div>
    </div>
  );
}
