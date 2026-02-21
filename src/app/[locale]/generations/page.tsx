'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, Link } from '@/i18n/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useTranslations, useLocale } from 'next-intl';

const PAGE_SIZE = 20;

interface GenerationItem {
  id: string;
  promptId: string;
  promptText: string;
  status: string;
  imageUrl: string | null;
  creditsCharged: number;
  createdAt: { seconds: number };
}

export default function GenerationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations('gallery');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [generations, setGenerations] = useState<GenerationItem[]>([]);
  const [loadingGenerations, setLoadingGenerations] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchGenerations = async () => {
      try {
        const q = query(
          collection(db, 'generations'),
          where('uid', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(PAGE_SIZE)
        );
        const snapshot = await getDocs(q);
        setGenerations(
          snapshot.docs.map((doc) => doc.data() as GenerationItem)
        );
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
      } catch (error) {
        console.error('Error fetching generations:', error);
      } finally {
        setLoadingGenerations(false);
      }
    };

    fetchGenerations();
  }, [user]);

  const loadMore = useCallback(async () => {
    if (!user || !lastDoc || loadingMore) return;

    setLoadingMore(true);
    try {
      const q = query(
        collection(db, 'generations'),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE),
        startAfter(lastDoc)
      );
      const snapshot = await getDocs(q);
      setGenerations((prev) => [
        ...prev,
        ...snapshot.docs.map((doc) => doc.data() as GenerationItem),
      ]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching more generations:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [user, lastDoc, loadingMore]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('title')}</h1>

      {loadingGenerations ? (
        <LoadingSpinner />
      ) : generations.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🎨</div>
          <p className="text-gray-500 mb-4">{t('empty')}</p>
          <Link
            href="/prompts"
            className="text-blue-600 hover:underline"
          >
            {t('emptyAction')}
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {generations.map((gen) => (
              <div
                key={gen.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {gen.imageUrl ? (
                    <img
                      src={gen.imageUrl}
                      alt="Generated"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">
                      {gen.status === 'processing'
                        ? t('statusProcessing')
                        : gen.status === 'failed'
                        ? t('statusFailed')
                        : t('statusProcessing')}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                    {gen.promptText}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {gen.createdAt
                        ? new Date(gen.createdAt.seconds * 1000).toLocaleDateString(locale)
                        : ''}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          gen.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : gen.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {gen.status === 'completed'
                          ? t('statusCompleted')
                          : gen.status === 'failed'
                          ? t('statusFailed')
                          : t('statusProcessing')}
                      </span>
                      {gen.imageUrl && (
                        <a
                          href={gen.imageUrl}
                          download={`generation-${gen.id}.png`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {tCommon('download')}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {loadingMore ? tCommon('loading') : t('loadMore')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
