import { test, expect } from '@playwright/test';
import { LOCALES, PUBLIC_ROUTES, buildLocalePath } from '../helpers/i18n';

const ROUTES_TO_TEST = ['/', '/prompts', '/login', '/signup'] as const;

for (const locale of LOCALES) {
  for (const route of ROUTES_TO_TEST) {
    test(`[${locale}] ${route} loads successfully`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));

      const url = buildLocalePath(locale, route);
      const response = await page.goto(url);

      // HTTP 200
      expect(response?.status()).toBe(200);

      // No JS errors
      expect(errors).toEqual([]);

      // Header renders
      await expect(page.locator('header')).toBeVisible();

      // Footer renders
      await expect(page.locator('footer')).toBeVisible();
    });
  }

  // Home page extra check
  test(`[${locale}] home page has hero section`, async ({ page }) => {
    const url = buildLocalePath(locale, '/');
    await page.goto(url);

    // Hero title should be visible
    await expect(page.locator('h1').first()).toBeVisible();
  });
}
