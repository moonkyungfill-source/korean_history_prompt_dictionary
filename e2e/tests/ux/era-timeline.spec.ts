/**
 * System Test (Functional) — Era Timeline Component
 *
 * Verifies that:
 * - The homepage renders all 9 era timeline items
 * - Era links exist for both the horizontal timeline and the era grid
 * - The prompt detail page renders the timeline navigation
 * - The active era is marked with aria-current="page" on the detail page
 */

import { test, expect } from '@playwright/test';

test.describe('Era Timeline Component', () => {
  test.beforeEach(async ({ page }) => {
    // Block Firebase/external auth calls — pages must render without auth
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => route.abort());
    await page.route('**/firestore.googleapis.com/**', (route) => route.abort());
    await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
    await page.route('**/api/auth/create-user', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
    );
  });

  test('homepage displays the timeline section heading', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // The Korean timeline section heading should be visible
    const timelineHeading = page.locator('text=한국사 타임라인').first();
    await expect(timelineHeading).toBeVisible({ timeout: 10000 });
  });

  test('homepage has era links covering all 9 historical periods', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Both the horizontal timeline strip and the era grid card section
    // each produce one <a href="/prompts?era=..."> per era, giving 18+ total
    const eraLinks = page.locator('a[href*="/prompts?era="]');
    const count = await eraLinks.count();
    expect(count).toBeGreaterThanOrEqual(9);
  });

  test('homepage era links include all 9 expected era slugs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const expectedEras = [
      'prehistoric',
      'gojoseon',
      'threeKingdoms',
      'northSouth',
      'goryeo',
      'joseon',
      'koreanEmpire',
      'japaneseOccupation',
      'modern',
    ];

    for (const era of expectedEras) {
      const link = page.locator(`a[href*="era=${era}"]`);
      expect(
        await link.count(),
        `Expected at least one link for era "${era}"`
      ).toBeGreaterThanOrEqual(1);
    }
  });

  test('homepage timeline items appear before the era grid section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // The timeline section heading should be in the DOM before the era grid heading
    const timelineHeading = page.locator('text=한국사 타임라인').first();
    const eraGridHeading = page.locator('text=시대별 프롬프트').first();

    await expect(timelineHeading).toBeVisible({ timeout: 10000 });

    // Verify positional ordering: timeline heading bounding box top < era grid top
    const timelineBox = await timelineHeading.boundingBox();
    const eraGridBox = await eraGridHeading.boundingBox();

    if (timelineBox && eraGridBox) {
      expect(timelineBox.y).toBeLessThan(eraGridBox.y);
    }
  });

  test('prompt detail page renders a navigation landmark for the era timeline', async ({ page }) => {
    await page.goto('/prompts');
    await page.waitForTimeout(3000);

    const firstCard = page.locator('a[href*="/prompts/"]').first();
    if (!(await firstCard.isVisible())) {
      test.skip(true, 'No prompt cards available — skipping detail page check');
      return;
    }

    await firstCard.click();
    await page.waitForTimeout(2000);

    // The era timeline on the detail page must expose a navigation role
    // so keyboard and assistive technology users can navigate it
    const timelineNav = page.locator('[role="navigation"]');
    await expect(timelineNav).toBeVisible({ timeout: 10000 });
  });

  test('prompt detail page marks the current era with aria-current="page"', async ({ page }) => {
    await page.goto('/prompts');
    await page.waitForTimeout(3000);

    const firstCard = page.locator('a[href*="/prompts/"]').first();
    if (!(await firstCard.isVisible())) {
      test.skip(true, 'No prompt cards available — skipping aria-current check');
      return;
    }

    await firstCard.click();
    await page.waitForTimeout(2000);

    // Exactly one era item should carry aria-current="page" to indicate the active era
    const activeEra = page.locator('[aria-current="page"]');
    await expect(activeEra).toBeVisible({ timeout: 10000 });
  });

  test('era timeline links on detail page navigate to filtered prompt list', async ({ page }) => {
    await page.goto('/prompts');
    await page.waitForTimeout(3000);

    const firstCard = page.locator('a[href*="/prompts/"]').first();
    if (!(await firstCard.isVisible())) {
      test.skip(true, 'No prompt cards available — skipping link navigation check');
      return;
    }

    await firstCard.click();
    await page.waitForTimeout(2000);

    // Find a non-active era link in the timeline and click it
    const timelineNav = page.locator('[role="navigation"]');
    await expect(timelineNav).toBeVisible({ timeout: 10000 });

    const nonActiveEraLink = timelineNav.locator('a[href*="/prompts?era="]:not([aria-current="page"])').first();
    if (await nonActiveEraLink.isVisible()) {
      const href = await nonActiveEraLink.getAttribute('href');
      await nonActiveEraLink.click();

      // Should land on the prompts list filtered by the clicked era
      await page.waitForURL('**/prompts**', { timeout: 8000 });
      expect(page.url()).toContain('era=');
    }
  });
});
