'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
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
import PromptCard from './PromptCard';
import { EraKey, CategoryKey } from '@/types/prompt';

const PAGE_SIZE = 24;

// Chronological era order for sorting
const ERA_ORDER_INDEX: Record<string, number> = {
  prehistoric: 0,
  gojoseon: 1,
  threeKingdoms: 2,
  northSouth: 3,
  goryeo: 4,
  joseon: 5,
  koreanEmpire: 6,
  japaneseOccupation: 7,
  modern: 8,
};

interface PromptItem {
  id: string;
  title: Record<string, string>;
  era: EraKey;
  category: CategoryKey;
  tags: string[];
  keywords: string[];
  usageCount: number;
  thumbnailUrl: string | null;
}

interface PromptListProps {
  era: EraKey;
  category: CategoryKey;
  searchQuery: string;
}

export default function PromptList({ era, category, searchQuery }: PromptListProps) {
  const t = useTranslations('prompts');
  const locale = useLocale();
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const buildQuery = useCallback(
    (cursor?: QueryDocumentSnapshot<DocumentData>) => {
      const constraints: Parameters<typeof query>[1][] = [
        where('status', '==', 'published'),
      ];

      if (era !== 'all') {
        constraints.push(where('era', '==', era));
      }

      if (category !== 'all') {
        constraints.push(where('category', '==', category));
      }

      // Single keyword search via array-contains
      if (searchQuery.trim()) {
        const keyword = searchQuery.trim().toLowerCase();
        constraints.push(where('keywords', 'array-contains', keyword));
      }

      constraints.push(orderBy('usageCount', 'desc'));
      constraints.push(limit(PAGE_SIZE));

      if (cursor) {
        constraints.push(startAfter(cursor));
      }

      return query(collection(db, 'prompts'), ...constraints);
    },
    [era, category, searchQuery]
  );

  // Reset and fetch first page when filters change
  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      setPrompts([]);
      setLastDoc(null);
      setHasMore(true);

      try {
        const q = buildQuery();
        const snapshot = await getDocs(q);
        let items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PromptItem[];

        // Supplementary client-side title filter when search query is present
        if (searchQuery.trim()) {
          const lowerQuery = searchQuery.trim().toLowerCase();
          items = items.filter(
            (item) => {
              const displayTitle = item.title[locale] || item.title['ko'] || '';
              return displayTitle.toLowerCase().includes(lowerQuery) ||
                (item.keywords || []).some((kw) => kw.toLowerCase().includes(lowerQuery));
            }
          );
        }

        // Sort by chronological era order (primary), then by usageCount (secondary)
        items.sort((a, b) => {
          const eraA = ERA_ORDER_INDEX[a.era] ?? 99;
          const eraB = ERA_ORDER_INDEX[b.era] ?? 99;
          if (eraA !== eraB) return eraA - eraB;
          return b.usageCount - a.usageCount;
        });

        setPrompts(items);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
      } catch (error) {
        console.error('Error fetching prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [era, category, searchQuery, buildQuery, locale]);

  const loadMore = async () => {
    if (!lastDoc || loadingMore) return;

    setLoadingMore(true);
    try {
      const q = buildQuery(lastDoc);
      const snapshot = await getDocs(q);
      let items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PromptItem[];

      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.trim().toLowerCase();
        items = items.filter(
          (item) => {
            const displayTitle = item.title[locale] || item.title['ko'] || '';
            return displayTitle.toLowerCase().includes(lowerQuery) ||
              (item.keywords || []).some((kw) => kw.toLowerCase().includes(lowerQuery));
          }
        );
      }

      // Sort by chronological era order (primary), then by usageCount (secondary)
      items.sort((a, b) => {
        const eraA = ERA_ORDER_INDEX[a.era] ?? 99;
        const eraB = ERA_ORDER_INDEX[b.era] ?? 99;
        if (eraA !== eraB) return eraA - eraB;
        return b.usageCount - a.usageCount;
      });

      setPrompts((prev) => [...prev, ...items]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching more prompts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-xl h-64 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {t('noResults')}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} {...prompt} />
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {loadingMore ? t('loadingMore') : t('loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}
