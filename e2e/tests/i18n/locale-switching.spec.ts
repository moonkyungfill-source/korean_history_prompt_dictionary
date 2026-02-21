import { test, expect } from '@playwright/test';
import { getMessage, LOCALES } from '../../helpers/i18n';

test.describe('Locale Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => route.abort());
    await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
    await page.route('**/api/auth/create-user', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
    );
  });

  test('locale dropdown shows 7 options', async ({ page }) => {
    await page.goto('/');

    // Open locale switcher
    const localeButton = page.locator('button[aria-label="Change language"]');
    await expect(localeButton).toBeVisible({ timeout: 10000 });
    await localeButton.click();

    // Should see 7 locale options
    const localeOptions = page.locator('button[aria-label="Change language"] + div button, button[aria-label="Change language"] ~ div button');

    // Wait for dropdown to appear
    await page.waitForTimeout(500);

    // Count visible options in the dropdown
    const dropdown = page.locator('.z-50').last();
    const options = dropdown.locator('button');
    await expect(options).toHaveCount(7);
  });

  test('switching to English changes URL and content', async ({ page }) => {
    await page.goto('/');

    // Open locale switcher
    await page.locator('button[aria-label="Change language"]').click();
    await page.waitForTimeout(500);

    // Click English option
    const dropdown = page.locator('.z-50').last();
    await dropdown.getByText('English').click();

    // URL should have /en prefix
    await page.waitForURL('**/en**', { timeout: 10000 });
    await expect(page).toHaveURL(/\/en/);

    // Content should be in English
    const enTitle = getMessage('en', 'home.heroTitle');
    await expect(page.getByText(enTitle).first()).toBeVisible({ timeout: 10000 });
  });

  test('switching back to Korean removes URL prefix', async ({ page }) => {
    await page.goto('/en');

    // Open locale switcher
    await page.locator('button[aria-label="Change language"]').click();
    await page.waitForTimeout(500);

    // Click Korean option
    const dropdown = page.locator('.z-50').last();
    await dropdown.locator('button').filter({ hasText: '한국어' }).click();

    // URL should not have locale prefix (ko is default)
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).not.toMatch(/\/ko\//);

    // Content should be in Korean
    const koTitle = getMessage('ko', 'home.heroTitle');
    await expect(page.getByText(koTitle).first()).toBeVisible({ timeout: 10000 });
  });

  test('locale switch preserves current path', async ({ page }) => {
    await page.goto('/prompts');

    // Switch to English
    await page.locator('button[aria-label="Change language"]').click();
    await page.waitForTimeout(500);
    const dropdown = page.locator('.z-50').last();
    await dropdown.getByText('English').click();

    // Should be on /en/prompts
    await page.waitForURL('**/en/prompts**', { timeout: 10000 });
    await expect(page).toHaveURL(/\/en\/prompts/);
  });

  test('each locale shows correct site name', async ({ page }) => {
    // Test ko and en locale site names
    await page.goto('/');
    const koName = getMessage('ko', 'common.siteName');
    await expect(page.getByText(koName).first()).toBeVisible({ timeout: 10000 });

    await page.goto('/en');
    const enName = getMessage('en', 'common.siteName');
    await expect(page.getByText(enName).first()).toBeVisible({ timeout: 10000 });
  });
});
