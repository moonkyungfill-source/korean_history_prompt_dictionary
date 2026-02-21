/**
 * System Test (Non-functional: i18n) — New Translation Key Verification
 *
 * These are pure Node.js unit-style tests executed by Playwright's test runner.
 * They read the messages JSON files directly (no browser required) and assert:
 *
 *   1. Every new "home.*" key exists and is non-empty in all 7 locales
 *   2. Every new "prompts.*" key exists and is non-empty in all 7 locales
 *   3. The "prompts.eraContext" value contains exactly the {era} and {years}
 *      interpolation placeholders in every locale
 *   4. No locale falls back to the raw key string (which getMessage returns
 *      when the key is genuinely missing)
 *
 * The tests use getMessage() which returns the raw key path (e.g.
 * "home.timelineTitle") when the key is absent — so a truthiness check
 * combined with a length check and an exact-key exclusion catches both
 * missing keys and empty strings.
 */

import { test, expect } from '@playwright/test';
import { getMessage } from '../../helpers/i18n';

const ALL_LOCALES = ['ko', 'en', 'ja', 'zh', 'vi', 'th', 'id'] as const;
type SupportedLocale = typeof ALL_LOCALES[number];

/**
 * New keys introduced with the Exchange History and Timeline UX features.
 * Each entry is the dot-notated key passed to getMessage().
 */
const NEW_HOME_KEYS = [
  'home.exchangeHistoryTitle',
  'home.exchangeHistoryDesc',
  'home.exchangeVietnam',
  'home.exchangeVietnamDesc',
  'home.exchangeThailand',
  'home.exchangeThailandDesc',
  'home.exchangeIndonesia',
  'home.exchangeIndonesiaDesc',
  'home.exchangeExplore',
  'home.timelineTitle',
  'home.timelineDesc',
] as const;

/**
 * New keys introduced with the chronological sort, prev/next navigation,
 * and era-context banner features.
 */
const NEW_PROMPT_KEYS = [
  'prompts.prevEra',
  'prompts.nextEra',
  'prompts.sortByEra',
  'prompts.sortByPopular',
  'prompts.eraContext',
] as const;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Returns true when getMessage returned the raw key (key not found in messages).
 * getMessage falls back to the input key string when lookup fails.
 */
function isFallback(key: string, value: string): boolean {
  return value === key;
}

// ---------------------------------------------------------------------------
// Per-locale home key tests
// ---------------------------------------------------------------------------

for (const locale of ALL_LOCALES) {
  test.describe(`Locale: ${locale}`, () => {
    test('all new home.* keys are present and non-empty', () => {
      for (const key of NEW_HOME_KEYS) {
        const value = getMessage(locale, key);

        expect(
          isFallback(key, value),
          `Key "${key}" is missing in ${locale}.json (getMessage returned the raw key)`
        ).toBe(false);

        expect(
          value,
          `Key "${key}" is falsy in ${locale}.json`
        ).toBeTruthy();

        expect(
          value.length,
          `Key "${key}" is an empty string in ${locale}.json`
        ).toBeGreaterThan(0);
      }
    });

    test('all new prompts.* keys are present and non-empty', () => {
      for (const key of NEW_PROMPT_KEYS) {
        const value = getMessage(locale, key);

        expect(
          isFallback(key, value),
          `Key "${key}" is missing in ${locale}.json (getMessage returned the raw key)`
        ).toBe(false);

        expect(
          value,
          `Key "${key}" is falsy in ${locale}.json`
        ).toBeTruthy();

        expect(
          value.length,
          `Key "${key}" is an empty string in ${locale}.json`
        ).toBeGreaterThan(0);
      }
    });
  });
}

// ---------------------------------------------------------------------------
// eraContext interpolation placeholders — all locales
// ---------------------------------------------------------------------------

test.describe('prompts.eraContext interpolation placeholders', () => {
  test('all locales include {era} placeholder in eraContext', () => {
    for (const locale of ALL_LOCALES) {
      const value = getMessage(locale, 'prompts.eraContext');

      expect(
        value,
        `${locale}: prompts.eraContext is missing or empty`
      ).toBeTruthy();

      expect(
        value.includes('{era}'),
        `${locale}: prompts.eraContext is missing the {era} placeholder — got: "${value}"`
      ).toBe(true);
    }
  });

  test('all locales include {years} placeholder in eraContext', () => {
    for (const locale of ALL_LOCALES) {
      const value = getMessage(locale, 'prompts.eraContext');

      expect(
        value,
        `${locale}: prompts.eraContext is missing or empty`
      ).toBeTruthy();

      expect(
        value.includes('{years}'),
        `${locale}: prompts.eraContext is missing the {years} placeholder — got: "${value}"`
      ).toBe(true);
    }
  });

  test('interpolation produces the expected output when params are supplied', () => {
    // Spot-check Korean and English with concrete values
    const koValue = getMessage('ko', 'prompts.eraContext', { era: '고려시대', years: '918-1392' });
    expect(koValue).toContain('고려시대');
    expect(koValue).toContain('918-1392');
    expect(koValue).not.toContain('{era}');
    expect(koValue).not.toContain('{years}');

    const enValue = getMessage('en', 'prompts.eraContext', { era: 'Goryeo Dynasty', years: '918-1392' });
    expect(enValue).toContain('Goryeo Dynasty');
    expect(enValue).toContain('918-1392');
    expect(enValue).not.toContain('{era}');
    expect(enValue).not.toContain('{years}');
  });
});

// ---------------------------------------------------------------------------
// Regression guard — pre-existing keys are not regressed
// ---------------------------------------------------------------------------

test.describe('Regression: pre-existing home.* keys still present in all locales', () => {
  const existingHomeKeys = [
    'home.heroTitle',
    'home.heroSubtitle',
    'home.browsePrompts',
    'home.eraTitle',
    'home.ctaTitle',
  ] as const;

  for (const locale of ALL_LOCALES) {
    test(`${locale}: pre-existing home keys are intact`, () => {
      for (const key of existingHomeKeys) {
        const value = getMessage(locale, key);

        expect(
          isFallback(key, value),
          `Regression: "${key}" is now missing in ${locale}.json`
        ).toBe(false);

        expect(
          value.length,
          `Regression: "${key}" is empty in ${locale}.json`
        ).toBeGreaterThan(0);
      }
    });
  }
});

test.describe('Regression: pre-existing prompts.* keys still present in all locales', () => {
  const existingPromptKeys = [
    'prompts.title',
    'prompts.searchPlaceholder',
    'prompts.noResults',
    'prompts.loadMore',
    'prompts.backToList',
    'prompts.notFound',
  ] as const;

  for (const locale of ALL_LOCALES) {
    test(`${locale}: pre-existing prompt keys are intact`, () => {
      for (const key of existingPromptKeys) {
        const value = getMessage(locale, key);

        expect(
          isFallback(key, value),
          `Regression: "${key}" is now missing in ${locale}.json`
        ).toBe(false);

        expect(
          value.length,
          `Regression: "${key}" is empty in ${locale}.json`
        ).toBeGreaterThan(0);
      }
    });
  }
});
