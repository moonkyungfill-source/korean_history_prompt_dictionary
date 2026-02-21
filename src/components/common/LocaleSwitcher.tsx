'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing, Locale } from '@/i18n/routing';
import { useState, useRef, useEffect } from 'react';

const LOCALE_LABELS: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  id: 'Indonesia',
};

const LOCALE_FLAGS: Record<string, string> = {
  ko: '🇰🇷',
  en: '🇺🇸',
  ja: '🇯🇵',
  zh: '🇨🇳',
  vi: '🇻🇳',
  th: '🇹🇭',
  id: '🇮🇩',
};

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleChange = (newLocale: Locale) => {
    setOpen(false);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Change language"
        aria-expanded={open}
      >
        <span>{LOCALE_FLAGS[locale]}</span>
        <span className="hidden sm:inline">{LOCALE_LABELS[locale]}</span>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleChange(loc)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 ${
                loc === locale ? 'text-blue-600 font-medium' : 'text-gray-700'
              }`}
            >
              <span>{LOCALE_FLAGS[loc]}</span>
              <span>{LOCALE_LABELS[loc]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
