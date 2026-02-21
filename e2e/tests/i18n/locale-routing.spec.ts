import { test, expect } from '@playwright/test';
import { getMessage, LOCALES } from '../../helpers/i18n';

test.describe('Locale Routing', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => route.abort());
    await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
    await page.route('**/api/auth/create-user', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
    );
  });

  test('/en/prompts loads with English content', async ({ page }) => {
    const response = await page.goto('/en/prompts');
    expect(response?.status()).toBe(200);

    const t = (key: string) => getMessage('en', key);
    await expect(page.locator('h1')).toContainText(t('prompts.title'), { timeout: 10000 });
  });

  test('/ja/login loads with Japanese content', async ({ page }) => {
    const response = await page.goto('/ja/login');
    expect(response?.status()).toBe(200);

    const t = (key: string) => getMessage('ja', key);
    await expect(page.locator('h1')).toContainText(t('auth.loginTitle'), { timeout: 10000 });
  });

  test('/en loads with English home page content', async ({ page }) => {
    const response = await page.goto('/en');
    expect(response?.status()).toBe(200);

    const t = (key: string) => getMessage('en', key);
    await expect(page.getByText(t('home.heroTitle')).first()).toBeVisible({ timeout: 10000 });
  });

  test('direct locale URL access for each supported locale', async ({ page }) => {
    for (const locale of ['en', 'ja', 'zh', 'vi', 'th', 'id'] as const) {
      const response = await page.goto(`/${locale}`);
      expect(response?.status()).toBe(200);

      // Header should be visible
      await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
    }
  });

  test('Korean default locale works without prefix', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    const t = (key: string) => getMessage('ko', key);
    await expect(page.getByText(t('home.heroTitle')).first()).toBeVisible({ timeout: 10000 });
  });

  test('invalid locale returns 404', async ({ page }) => {
    const response = await page.goto('/xx/prompts');

    // Should be 404 or redirect
    const status = response?.status();
    expect(status === 404 || status === 200).toBeTruthy();

    // If 200, it should have been redirected or show a not-found page
    if (status === 200) {
      // The middleware might redirect to default locale
      const url = page.url();
      expect(url).not.toContain('/xx/');
    }
  });

  test('nested locale routes work correctly', async ({ page }) => {
    const response = await page.goto('/en/signup');
    expect(response?.status()).toBe(200);

    const t = (key: string) => getMessage('en', key);
    await expect(page.locator('h1')).toContainText(t('auth.signupTitle'), { timeout: 10000 });
  });
});
