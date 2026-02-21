import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ko', 'en', 'ja', 'zh', 'vi', 'th', 'id'],
  defaultLocale: 'ko',
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
