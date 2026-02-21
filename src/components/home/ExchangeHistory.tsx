'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface ExchangeItem {
  key: string;
  emoji: string;
  year: string;
  locales: string[];
  eraLink: string;
}

const EXCHANGE_ITEMS: ExchangeItem[] = [
  {
    key: 'Vietnam',
    emoji: '🇻🇳',
    year: '1224',
    locales: ['vi'],
    eraLink: 'goryeo',
  },
  {
    key: 'Thailand',
    emoji: '🇹🇭',
    year: '1393',
    locales: ['th'],
    eraLink: 'joseon',
  },
  {
    key: 'Indonesia',
    emoji: '🇮🇩',
    year: '1394',
    locales: ['id'],
    eraLink: 'joseon',
  },
];

export default function ExchangeHistory() {
  const t = useTranslations('home');
  const locale = useLocale();

  // Sort: user's country first, then by year
  const sortedItems = [...EXCHANGE_ITEMS].sort((a, b) => {
    const aMatch = a.locales.includes(locale) ? -1 : 0;
    const bMatch = b.locales.includes(locale) ? -1 : 0;
    if (aMatch !== bMatch) return aMatch - bMatch;
    return parseInt(a.year) - parseInt(b.year);
  });

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
          {t('exchangeHistoryTitle')}
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          {t('exchangeHistoryDesc')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedItems.map((item) => (
            <div
              key={item.key}
              className={`relative p-6 bg-white rounded-xl border-2 transition-shadow hover:shadow-lg ${
                item.locales.includes(locale)
                  ? 'border-amber-400 shadow-md'
                  : 'border-gray-200'
              }`}
            >
              {item.locales.includes(locale) && (
                <div className="absolute -top-3 left-4 px-3 py-0.5 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
                  YOUR HISTORY
                </div>
              )}
              <div className="text-4xl mb-3">{item.emoji}</div>
              <div className="text-xs text-amber-700 font-mono mb-1">{item.year}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t(`exchange${item.key}` as any)}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {t(`exchange${item.key}Desc` as any)}
              </p>
              <Link
                href={`/prompts?era=${item.eraLink}`}
                className="text-sm text-amber-700 hover:text-amber-900 font-medium"
              >
                {t('exchangeExplore')} &rarr;
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
