'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { auth } from '@/lib/firebase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EraTimeline from '@/components/prompts/EraTimeline';
import { EraKey, CategoryKey } from '@/types/prompt';

const ERA_ORDER: EraKey[] = [
  'prehistoric', 'gojoseon', 'threeKingdoms', 'northSouth',
  'goryeo', 'joseon', 'koreanEmpire', 'japaneseOccupation', 'modern',
];

// Map API error codes to i18n keys
const ERROR_CODE_MAP: Record<string, string> = {
  INSUFFICIENT_CREDITS: 'insufficientCredits',
  GENERATION_FAILED: 'refunded',
  PROMPT_NOT_PUBLISHED: 'promptNotPublished',
};

interface PromptDetail {
  id: string;
  title: Record<string, string>;
  era: EraKey;
  category: CategoryKey;
  promptText: string;
  thumbnailUrl: string | null;
  tags: string[];
  usageCount: number;
}

export default function PromptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, creditBalance } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('generation');
  const tPrompts = useTranslations('prompts');
  const tCommon = useTranslations('common');
  const tEras = useTranslations('eras');
  const tCats = useTranslations('categories');
  const [prompt, setPrompt] = useState<PromptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [insufficientCredits, setInsufficientCredits] = useState(false);
  const [prevPrompt, setPrevPrompt] = useState<{ id: string; title: Record<string, string>; era: EraKey } | null>(null);
  const [nextPrompt, setNextPrompt] = useState<{ id: string; title: Record<string, string>; era: EraKey } | null>(null);

  const getTitle = (titleMap: Record<string, string>) =>
    titleMap[locale] || titleMap['ko'] || '';

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'prompts', id));
        if (docSnap.exists()) {
          setPrompt({ id: docSnap.id, ...docSnap.data() } as PromptDetail);
        }
      } catch (err) {
        console.error('Error fetching prompt:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompt();
  }, [id]);

  useEffect(() => {
    if (!prompt || prompt.era === 'all') return;
    const currentIndex = ERA_ORDER.indexOf(prompt.era);

    const fetchAdjacent = async (era: EraKey, setter: Function) => {
      try {
        const q = query(
          collection(db, 'prompts'),
          where('status', '==', 'published'),
          where('era', '==', era),
          orderBy('usageCount', 'desc'),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0];
          setter({ id: d.id, title: d.data().title, era: d.data().era });
        }
      } catch (err) {
        console.error('Error fetching adjacent prompt:', err);
      }
    };

    if (currentIndex > 0) {
      fetchAdjacent(ERA_ORDER[currentIndex - 1], setPrevPrompt);
    }
    if (currentIndex < ERA_ORDER.length - 1) {
      fetchAdjacent(ERA_ORDER[currentIndex + 1], setNextPrompt);
    }
  }, [prompt]);

  const handleCopy = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt.promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateClick = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (creditBalance < 1) {
      setError(t('insufficientCredits'));
      setInsufficientCredits(true);
      return;
    }
    setShowConfirm(true);
  };

  const handleGenerate = async () => {
    setShowConfirm(false);
    setGenerating(true);
    setError('');
    setInsufficientCredits(false);

    try {
      if (!auth.currentUser) {
        router.push('/login');
        return;
      }
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ promptId: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorCode = data.error || '';
        // Map error code to translated message
        const i18nKey = ERROR_CODE_MAP[errorCode];
        if (i18nKey) {
          if (errorCode === 'INSUFFICIENT_CREDITS') {
            setInsufficientCredits(true);
          }
          throw new Error(t(i18nKey));
        }
        throw new Error(t('failed'));
      }

      setGeneratedImage(data.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon('error'));
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl text-gray-600">{tPrompts('notFound')}</h1>
        <Link href="/prompts" className="text-blue-600 hover:underline mt-4 inline-block">
          {tPrompts('backToListLink')}
        </Link>
      </div>
    );
  }

  const displayTitle = getTitle(prompt.title);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/prompts"
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block"
      >
        &larr; {tPrompts('backToList')}
      </Link>

      <div className="mb-6">
        {prompt && <EraTimeline currentEra={prompt.era} />}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Thumbnail */}
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          {generatedImage ? (
            <img
              src={generatedImage}
              alt={displayTitle}
              className="w-full h-full object-contain"
            />
          ) : prompt.thumbnailUrl ? (
            <img
              src={prompt.thumbnailUrl}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl">🏛️</div>
          )}
        </div>

        <div className="p-6">
          {/* Title & Meta */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {displayTitle}
          </h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              {tEras(prompt.era)}
            </span>
            <span className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
              {tCats(prompt.category)}
            </span>
            <span className="text-sm text-gray-400 ml-2">
              {tPrompts('usageCount', { count: prompt.usageCount.toLocaleString() })}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {prompt.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Prompt Text */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{tPrompts('promptLabel')}</span>
              <button
                onClick={handleCopy}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                {copied ? tCommon('copied') : tCommon('copy')}
              </button>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap font-mono text-sm">
              {prompt.promptText}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
              {insufficientCredits && (
                <Link
                  href="/credits/purchase"
                  className="block mt-1 text-sm underline"
                >
                  {t('purchaseCredits')}
                </Link>
              )}
            </div>
          )}

          {/* Credit Confirmation Dialog */}
          {showConfirm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900 mb-3">
                {t('confirmMessage', { balance: creditBalance })}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('confirmButton')}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {tCommon('cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleGenerateClick}
              disabled={generating}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {generating ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>{t('generating')}</span>
                </>
              ) : (
                t('generateButton')
              )}
            </button>

            {generatedImage && (
              <a
                href={generatedImage}
                download={`${displayTitle}.png`}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {tCommon('download')}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Previous/Next Era Navigation */}
      <div className="flex items-center justify-between mt-8 gap-4">
        <div className="flex-1">
          {prevPrompt && (
            <Link
              href={`/prompts/${prevPrompt.id}`}
              className="flex items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
            >
              <span className="text-gray-400 group-hover:text-blue-600">&larr;</span>
              <div>
                <div className="text-xs text-gray-500">{tPrompts('prevEra')}</div>
                <div className="text-sm font-medium text-gray-900">{tEras(prevPrompt.era)}</div>
                <div className="text-xs text-gray-500 line-clamp-1">
                  {prevPrompt.title[locale] || prevPrompt.title['ko'] || ''}
                </div>
              </div>
            </Link>
          )}
        </div>
        <div className="flex-1 text-right">
          {nextPrompt && (
            <Link
              href={`/prompts/${nextPrompt.id}`}
              className="flex items-center justify-end gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
            >
              <div className="text-right">
                <div className="text-xs text-gray-500">{tPrompts('nextEra')}</div>
                <div className="text-sm font-medium text-gray-900">{tEras(nextPrompt.era)}</div>
                <div className="text-xs text-gray-500 line-clamp-1">
                  {nextPrompt.title[locale] || nextPrompt.title['ko'] || ''}
                </div>
              </div>
              <span className="text-gray-400 group-hover:text-blue-600">&rarr;</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
