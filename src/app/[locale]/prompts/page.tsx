'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ERA_KEYS, CATEGORY_KEYS, EraKey, CategoryKey } from '@/types/prompt';
import CategoryFilter from '@/components/prompts/CategoryFilter';
import PromptList from '@/components/prompts/PromptList';

export default function PromptsPage() {
  const t = useTranslations('prompts');
  const tEras = useTranslations('eras');
  const tCats = useTranslations('categories');

  const [selectedEra, setSelectedEra] = useState<EraKey>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('title')}</h1>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        <CategoryFilter
          keys={ERA_KEYS}
          getLabel={(key) => tEras(key)}
          selected={selectedEra}
          onSelect={(key) => setSelectedEra(key as EraKey)}
          label={t('era')}
        />
        <CategoryFilter
          keys={CATEGORY_KEYS}
          getLabel={(key) => tCats(key)}
          selected={selectedCategory}
          onSelect={(key) => setSelectedCategory(key as CategoryKey)}
          label={t('category')}
        />
      </div>

      {/* Prompt Grid */}
      <PromptList
        era={selectedEra}
        category={selectedCategory}
        searchQuery={searchQuery}
      />
    </div>
  );
}
