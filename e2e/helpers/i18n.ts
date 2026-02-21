import * as fs from 'fs';
import * as path from 'path';

type Messages = Record<string, Record<string, string>>;

const messagesCache: Record<string, Messages> = {};

/**
 * Load i18n messages for a given locale.
 */
export function loadMessages(locale: string): Messages {
  if (messagesCache[locale]) return messagesCache[locale];

  const filePath = path.resolve(__dirname, '../../messages', `${locale}.json`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const messages = JSON.parse(content) as Messages;
  messagesCache[locale] = messages;
  return messages;
}

/**
 * Get a translated message by dot-notated key.
 * Example: getMessage('ko', 'auth.loginTitle') => '로그인'
 */
export function getMessage(locale: string, key: string, params?: Record<string, string | number>): string {
  const messages = loadMessages(locale);
  const parts = key.split('.');
  const namespace = parts[0];
  const messageKey = parts[1];

  let text = messages[namespace]?.[messageKey];
  if (!text) return key;

  if (params) {
    for (const [param, value] of Object.entries(params)) {
      text = text.replace(`{${param}}`, String(value));
    }
  }

  return text;
}

/**
 * List of supported locales.
 */
export const LOCALES = ['ko', 'en', 'ja', 'zh', 'vi', 'th', 'id'] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Public routes accessible without auth.
 */
export const PUBLIC_ROUTES = ['/', '/prompts', '/login', '/signup'] as const;

/**
 * Protected routes requiring auth.
 */
export const PROTECTED_ROUTES = ['/dashboard', '/generations', '/credits', '/credits/purchase'] as const;

/**
 * Build URL for a locale and path.
 * Korean (default) has no prefix due to 'as-needed' strategy.
 */
export function buildLocalePath(locale: string, routePath: string): string {
  if (locale === 'ko') return routePath;
  return `/${locale}${routePath}`;
}
