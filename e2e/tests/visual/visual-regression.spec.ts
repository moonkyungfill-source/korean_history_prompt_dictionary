import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => route.abort());
    await page.route('**/firestore.googleapis.com/**', (route) => route.abort());
    await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
    await page.route('**/api/auth/create-user', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
    );
  });

  test('home page (ko) visual snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Wait for all images and fonts to load
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('home-ko.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('home page (en) visual snapshot', async ({ page }) => {
    await page.goto('/en');
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('home-en.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('login page visual snapshot', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('login-ko.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('prompts page visual snapshot', async ({ page }) => {
    await page.goto('/prompts');
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('prompts-ko.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
});
