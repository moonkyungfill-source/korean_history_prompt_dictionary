import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const LOCALES = ['ko', 'en', 'ja', 'zh', 'vi', 'th', 'id'];

const REQUIRED_PROMPT_KEYS = [
  'prevEra',
  'nextEra',
  'sortByEra',
  'sortByPopular',
  'eraContext',
];

const REQUIRED_HOME_KEYS = [
  'exchangeHistoryTitle',
  'exchangeHistoryDesc',
  'exchangeVietnam',
  'exchangeVietnamDesc',
  'exchangeThailand',
  'exchangeThailandDesc',
  'exchangeIndonesia',
  'exchangeIndonesiaDesc',
  'exchangeExplore',
  'timelineTitle',
  'timelineDesc',
];

// Path to the messages directory (two levels up from tests/integration/)
const MESSAGES_DIR = path.resolve(__dirname, '../../messages');

// ---------------------------------------------------------------------------
// Helper to load and parse a locale file
// ---------------------------------------------------------------------------

function loadLocale(locale: string): Record<string, any> {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('i18n message files — required keys', () => {
  describe('all 7 files are valid JSON', () => {
    LOCALES.forEach((locale) => {
      it(`${locale}.json is valid JSON`, () => {
        const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
        expect(() => {
          const raw = fs.readFileSync(filePath, 'utf-8');
          JSON.parse(raw);
        }).not.toThrow();
      });
    });
  });

  describe('each locale has all required prompts keys', () => {
    LOCALES.forEach((locale) => {
      it(`${locale} has all required prompts keys`, () => {
        const messages = loadLocale(locale);
        const promptsSection = messages['prompts'];

        expect(promptsSection).toBeDefined();

        REQUIRED_PROMPT_KEYS.forEach((key) => {
          expect(promptsSection, `${locale}/prompts.${key} is missing`).toHaveProperty(key);
        });
      });
    });
  });

  describe('each locale has all required home keys', () => {
    LOCALES.forEach((locale) => {
      it(`${locale} has all required home keys`, () => {
        const messages = loadLocale(locale);
        const homeSection = messages['home'];

        expect(homeSection).toBeDefined();

        REQUIRED_HOME_KEYS.forEach((key) => {
          expect(homeSection, `${locale}/home.${key} is missing`).toHaveProperty(key);
        });
      });
    });
  });

  describe('no key has an empty string value', () => {
    LOCALES.forEach((locale) => {
      it(`${locale} prompts section — no empty string values`, () => {
        const messages = loadLocale(locale);
        const promptsSection = messages['prompts'] as Record<string, string>;

        REQUIRED_PROMPT_KEYS.forEach((key) => {
          const value = promptsSection[key];
          expect(
            value,
            `${locale}/prompts.${key} must not be an empty string`
          ).not.toBe('');
          expect(
            typeof value,
            `${locale}/prompts.${key} must be a string`
          ).toBe('string');
        });
      });

      it(`${locale} home section — no empty string values`, () => {
        const messages = loadLocale(locale);
        const homeSection = messages['home'] as Record<string, string>;

        REQUIRED_HOME_KEYS.forEach((key) => {
          const value = homeSection[key];
          expect(
            value,
            `${locale}/home.${key} must not be an empty string`
          ).not.toBe('');
          expect(
            typeof value,
            `${locale}/home.${key} must be a string`
          ).toBe('string');
        });
      });
    });
  });

  describe('eraContext key includes {era} and {years} placeholders', () => {
    LOCALES.forEach((locale) => {
      it(`${locale} eraContext contains {era} and {years}`, () => {
        const messages = loadLocale(locale);
        const eraContext: string = messages['prompts']['eraContext'];

        expect(
          eraContext,
          `${locale}/prompts.eraContext must contain {era} placeholder`
        ).toContain('{era}');

        expect(
          eraContext,
          `${locale}/prompts.eraContext must contain {years} placeholder`
        ).toContain('{years}');
      });
    });
  });

  describe('message files exist for all locales', () => {
    LOCALES.forEach((locale) => {
      it(`messages/${locale}.json exists`, () => {
        const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });

  describe('complete locale coverage', () => {
    it('exactly 7 locale files are present', () => {
      const files = fs
        .readdirSync(MESSAGES_DIR)
        .filter((f) => f.endsWith('.json'));
      expect(files).toHaveLength(LOCALES.length);
    });

    it('all expected locale codes are covered', () => {
      const files = fs
        .readdirSync(MESSAGES_DIR)
        .filter((f) => f.endsWith('.json'))
        .map((f) => f.replace('.json', ''));

      LOCALES.forEach((locale) => {
        expect(files).toContain(locale);
      });
    });
  });
});
