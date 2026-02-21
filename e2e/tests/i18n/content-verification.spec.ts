import { test, expect } from '@playwright/test';
import { getMessage } from '../../helpers/i18n';

const LOCALES_TO_TEST = ['ko', 'en'] as const;

test.describe('i18n Content Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => route.abort());
    await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
    await page.route('**/api/auth/create-user', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
    );
  });

  for (const locale of LOCALES_TO_TEST) {
    test.describe(`[${locale}]`, () => {
      const t = (key: string, params?: Record<string, string | number>) =>
        getMessage(locale, key, params);
      const prefix = locale === 'ko' ? '' : `/${locale}`;

      test('home page text matches message file', async ({ page }) => {
        await page.goto(`${prefix}/`);

        // Hero title
        await expect(page.getByText(t('home.heroTitle')).first()).toBeVisible({ timeout: 10000 });

        // Hero subtitle
        await expect(page.getByText(t('home.heroSubtitle')).first()).toBeVisible();

        // Browse prompts button
        await expect(page.getByText(t('home.browsePrompts')).first()).toBeVisible();

        // Features section
        await expect(page.getByText(t('home.features')).first()).toBeVisible();

        // CTA
        await expect(page.getByText(t('home.ctaTitle')).first()).toBeVisible();
      });

      test('prompts page text matches message file', async ({ page }) => {
        await page.goto(`${prefix}/prompts`);

        // Page title
        await expect(page.locator('h1')).toContainText(t('prompts.title'), { timeout: 10000 });

        // Era label
        await expect(page.getByText(t('eras.all')).first()).toBeVisible();
      });

      test('login page text matches message file', async ({ page }) => {
        await page.goto(`${prefix}/login`);

        // Title
        await expect(page.locator('h1')).toContainText(t('auth.loginTitle'), { timeout: 10000 });

        // Labels
        await expect(page.locator('label[for="email"]')).toContainText(t('auth.email'));
        await expect(page.locator('label[for="password"]')).toContainText(t('auth.password'));

        // Submit button
        await expect(page.locator('button[type="submit"]')).toContainText(t('auth.loginButton'));

        // Or divider
        await expect(page.getByText(t('auth.orDivider'))).toBeVisible();

        // Google login
        await expect(page.getByText(t('auth.googleLogin'))).toBeVisible();

        // No account text
        await expect(page.getByText(t('auth.noAccount'))).toBeVisible();
      });

      test('signup page text matches message file', async ({ page }) => {
        await page.goto(`${prefix}/signup`);

        // Title
        await expect(page.locator('h1')).toContainText(t('auth.signupTitle'), { timeout: 10000 });

        // Labels
        await expect(page.locator('label[for="displayName"]')).toContainText(t('auth.name'));
        await expect(page.locator('label[for="email"]')).toContainText(t('auth.email'));
        await expect(page.locator('label[for="password"]')).toContainText(t('auth.password'));
        await expect(page.locator('label[for="confirmPassword"]')).toContainText(t('auth.confirmPassword'));

        // Submit button
        await expect(page.locator('button[type="submit"]')).toContainText(t('auth.signupButton'));

        // Google signup
        await expect(page.getByText(t('auth.googleSignup'))).toBeVisible();

        // Has account
        await expect(page.getByText(t('auth.hasAccount'))).toBeVisible();
      });

      test('footer text matches message file', async ({ page }) => {
        await page.goto(`${prefix}/`);

        await expect(page.locator('footer')).toContainText(t('footer.tagline'));
      });

      test('nav links match message file', async ({ page }) => {
        await page.goto(`${prefix}/`);

        // Prompts nav
        await expect(page.locator('header').getByText(t('nav.prompts')).first()).toBeVisible({ timeout: 10000 });
      });
    });
  }
});
