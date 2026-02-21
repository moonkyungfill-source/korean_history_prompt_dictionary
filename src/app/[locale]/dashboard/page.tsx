'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, Link } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useTranslations } from 'next-intl';

const STATUS_LABELS: Record<string, string> = {
  processing: 'statusProcessing',
  failed: 'statusFailed',
  completed: 'statusCompleted',
};

interface RecentGeneration {
  id: string;
  promptText: string;
  status: string;
  imageUrl: string | null;
  createdAt: { seconds: number };
}

export default function DashboardPage() {
  const { user, creditBalance, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations('dashboard');
  const tGallery = useTranslations('gallery');
  const [recentGenerations, setRecentGenerations] = useState<RecentGeneration[]>([]);
  const [loadingGenerations, setLoadingGenerations] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchRecent = async () => {
      try {
        const q = query(
          collection(db, 'generations'),
          where('uid', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(6)
        );
        const snapshot = await getDocs(q);
        setRecentGenerations(
          snapshot.docs.map((doc) => doc.data() as RecentGeneration)
        );
      } catch (error) {
        console.error('Error fetching recent generations:', error);
      } finally {
        setLoadingGenerations(false);
      }
    };

    fetchRecent();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('title')}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">{t('creditBalance')}</div>
          <div className="text-3xl font-bold text-gray-900">
            {creditBalance.toLocaleString()}
          </div>
          <Link
            href="/credits/purchase"
            className="inline-block mt-3 text-sm text-blue-600 hover:underline"
          >
            {t('purchaseCredits')} &rarr;
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">{t('welcome')}</div>
          <div className="text-xl font-semibold text-gray-900 truncate">
            {user.displayName || user.email}
          </div>
          <Link
            href="/credits"
            className="inline-block mt-3 text-sm text-blue-600 hover:underline"
          >
            {t('viewTransactions')} &rarr;
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">{t('promptExplore')}</div>
          <div className="text-xl font-semibold text-gray-900">
            {t('koreanHistoryPrompts')}
          </div>
          <Link
            href="/prompts"
            className="inline-block mt-3 text-sm text-blue-600 hover:underline"
          >
            {t('browsePrompts')} &rarr;
          </Link>
        </div>
      </div>

      {/* Recent Generations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('recentGenerations')}</h2>
          <Link
            href="/generations"
            className="text-sm text-blue-600 hover:underline"
          >
            {t('viewAll')} &rarr;
          </Link>
        </div>

        {loadingGenerations ? (
          <LoadingSpinner />
        ) : recentGenerations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500 mb-4">{t('noGenerations')}</p>
            <Link
              href="/prompts"
              className="text-blue-600 hover:underline"
            >
              {t('generateFromPrompts')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {recentGenerations.map((gen) => (
              <div
                key={gen.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {gen.imageUrl ? (
                    <img
                      src={gen.imageUrl}
                      alt="Generated"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">
                      {tGallery(STATUS_LABELS[gen.status] || 'statusFailed')}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {gen.promptText}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
