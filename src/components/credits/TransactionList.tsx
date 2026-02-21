'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useTranslations } from 'next-intl';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/components/auth/AuthProvider';

// Map server-side description type codes to i18n keys
const DESCRIPTION_CODE_MAP: Record<string, string> = {
  credit_purchase: 'descCreditPurchase',
  image_generation: 'descImageGeneration',
  generation_failed_refund: 'descGenerationRefund',
  welcome_bonus: 'descWelcomeBonus',
};

interface TransactionItem {
  id: string;
  type: 'purchase' | 'spend' | 'refund';
  creditsDelta: number;
  description: string;
  createdAt: { seconds: number };
}

export default function TransactionList() {
  const { user } = useAuth();
  const t = useTranslations('credits');
  const tCommon = useTranslations('common');
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const txQuery = query(
          collection(db, 'users', user.uid, 'transactions'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        const snapshot = await getDocs(txQuery);
        const items = snapshot.docs.map((doc) => doc.data() as TransactionItem);
        setTransactions(items);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">{tCommon('loading')}</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('noTransactions')}
      </div>
    );
  }

  const typeLabel = {
    purchase: t('typePurchase'),
    spend: t('typeSpend'),
    refund: t('typeRefund'),
  };

  const typeColor = {
    purchase: 'text-green-600',
    spend: 'text-red-600',
    refund: 'text-blue-600',
  };

  const getDescription = (desc: string): string => {
    const i18nKey = DESCRIPTION_CODE_MAP[desc];
    if (i18nKey) {
      try {
        return t(i18nKey);
      } catch {
        return desc;
      }
    }
    // Fallback: show raw description for legacy data
    return desc;
  };

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200"
        >
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  tx.type === 'purchase'
                    ? 'bg-green-100 text-green-700'
                    : tx.type === 'spend'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {typeLabel[tx.type]}
              </span>
              <span className="text-sm text-gray-900">{getDescription(tx.description)}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {tx.createdAt
                ? new Date(tx.createdAt.seconds * 1000).toLocaleString()
                : ''}
            </div>
          </div>
          <div className={`text-lg font-semibold ${typeColor[tx.type]}`}>
            {tx.creditsDelta > 0 ? '+' : ''}
            {tx.creditsDelta}
          </div>
        </div>
      ))}
    </div>
  );
}
