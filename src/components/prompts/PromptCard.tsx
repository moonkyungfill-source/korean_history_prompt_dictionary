'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { EraKey, CategoryKey } from '@/types/prompt';

interface PromptCardProps {
  id: string;
  title: Record<string, string>;
  era: EraKey;
  category: CategoryKey;
  tags: string[];
  usageCount: number;
  thumbnailUrl: string | null;
}

export default function PromptCard({
  id,
  title,
  era,
  category,
  tags,
  usageCount,
  thumbnailUrl,
}: PromptCardProps) {
  const t = useTranslations('prompts');
  const tEras = useTranslations('eras');
  const tCats = useTranslations('categories');
  const locale = useLocale();

  const displayTitle = title[locale] || title['ko'] || '';

  return (
    <Link
      href={`/prompts/${id}`}
      className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-4xl">🏛️</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{displayTitle}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
            {tEras(era)}
          </span>
          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
            {tCats(category)}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs text-gray-500"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-400">
          {t('usageCount', { count: usageCount.toLocaleString() })}
        </div>
      </div>
    </Link>
  );
}
