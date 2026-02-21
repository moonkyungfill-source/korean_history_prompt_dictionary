/**
 * Acceptance Test — UX Principles: 흐름과 맥락 (Flow & Context)
 *
 * These tests verify the core UX principles documented in CLAUDE.md:
 *
 *   1. Navigation structure mirrors historical chronology
 *   2. Every content transition includes contextual links (timeline + prev/next)
 *   3. Users never see isolated facts without timeline context
 *   4. Cross-cultural bridge — SEA exchange history is discoverable from
 *      the home page by all audiences
 *
 * A secondary describe block covers i18n acceptance for the three SEA locales
 * (Vietnamese, Thai, Indonesian): each locale must render the exchange history
 * section with their home country highlighted and produce zero JS errors.
 */

import { test, expect, type Page } from '@playwright/test';
import { getMessage } from '../../helpers/i18n';

// ---------------------------------------------------------------------------
// Shared Firebase block helper
// ---------------------------------------------------------------------------

async function blockFirebase(page: Page) {
  await page.route('**/identitytoolkit.googleapis.com/**', (route) => route.abort());
  await page.route('**/firestore.googleapis.com/**', (route) => route.abort());
  await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
  await page.route('**/api/auth/create-user', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
  );
}

// ---------------------------------------------------------------------------
// PRINCIPLE 1-4: 흐름과 맥락
// ---------------------------------------------------------------------------

test.describe('UX Acceptance: 흐름과 맥락 (Flow & Context)', () => {
  test.beforeEach(async ({ page }) => {
    await blockFirebase(page);
  });

  // PRINCIPLE 1: Navigation structure mirrors historical chronology ----------

  test('PRINCIPLE 1 — homepage timeline section is present and labelled correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const t = (key: string) => getMessage('ko', key);

    // The timeline section heading must match the i18n key value exactly
    await expect(
      page.locator(`text=${t('home.timelineTitle')}`).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('PRINCIPLE 1 — homepage has era links for all 9 historical periods', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const eraKeys = [
      'prehistoric',
      'gojoseon',
      'threeKingdoms',
      'northSouth',
      'goryeo',
      'joseon',
      'koreanEmpire',
      'japaneseOccupation',
      'modern',
    ] as const;

    for (const era of eraKeys) {
      const link = page.locator(`a[href*="era=${era}"]`);
      expect(
        await link.count(),
        `Era "${era}" must have at least one link on the homepage`
      ).toBeGreaterThanOrEqual(1);
    }
  });

  // PRINCIPLE 2: Every content transition includes contextual links ----------

  test('PRINCIPLE 2 — prompt detail page renders an era timeline navigation landmark', async ({ page }) => {
    await page.goto('/prompts');
    await page.waitForTimeout(5000);

    const card = page.locator('a[href*="/prompts/"]').first();
    if (!(await card.isVisible())) {
      test.skip(true, 'No prompt cards visible');
      return;
    }

    await card.click();
    await page.waitForTimeout(5000);

    // Timeline navigation landmark must be present for keyboard / AT users
    await expect(page.locator('[role="navigation"]')).toBeVisible({ timeout: 10000 });
  });

  test('PRINCIPLE 2 — prompt detail page includes at least one prev/next era label', async ({ page }) => {
    await page.goto('/prompts');
    await page.waitForTimeout(5000);

    const card = page.locator('a[href*="/prompts/"]').first();
    if (!(await card.isVisible())) {
      test.skip(true, 'No prompt cards visible');
      return;
    }

    await card.click();
    await page.waitForTimeout(5000);

    const t = (key: string) => getMessage('ko', key);
    // Match either label — regex locator counts both simultaneously
    const prevNext = page.locator(`text=/${t('prompts.prevEra')}|${t('prompts.nextEra')}/`);
    expect(
      await prevNext.count(),
      'Prompt detail must show 이전 시대 or 다음 시대 (or both)'
    ).toBeGreaterThanOrEqual(1);
  });

  // PRINCIPLE 3: No isolated facts — era badge + timeline always present -----

  test('PRINCIPLE 3 — prompt detail page always shows an era badge', async ({ page }) => {
    await page.goto('/prompts');
    await page.waitForTimeout(5000);

    const card = page.locator('a[href*="/prompts/"]').first();
    if (!(await card.isVisible())) {
      test.skip(true, 'No prompt cards visible');
      return;
    }

    await card.click();
    await page.waitForTimeout(3000);

    // The era badge (blue chip) must be visible — the user must always know
    // which historical era the content belongs to
    const eraBadge = page.locator('.bg-blue-100.text-blue-700').first();
    await expect(eraBadge).toBeVisible({ timeout: 10000 });
  });

  test('PRINCIPLE 3 — prompt detail page always shows the era timeline alongside content', async ({ page }) => {
    await page.goto('/prompts');
    await page.waitForTimeout(5000);

    const card = page.locator('a[href*="/prompts/"]').first();
    if (!(await card.isVisible())) {
      test.skip(true, 'No prompt cards visible');
      return;
    }

    await card.click();
    await page.waitForTimeout(3000);

    // Timeline nav must co-exist with prompt content on the same page
    await expect(page.locator('[role="navigation"]')).toBeVisible({ timeout: 10000 });

    // The prompt text area (monospace block) should also be present
    const promptMono = page.locator('.font-mono').first();
    await expect(promptMono).toBeVisible({ timeout: 10000 });
  });

  // PRINCIPLE 4: Cross-cultural bridge — SEA exchange history discoverable ---

  test('PRINCIPLE 4 — Korean homepage surfaces the exchange history section heading', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const t = (key: string) => getMessage('ko', key);

    await expect(
      page.locator(`text=${t('home.exchangeHistoryTitle')}`).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('PRINCIPLE 4 — Korean homepage shows all 3 SEA country exchange cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const t = (key: string) => getMessage('ko', key);

    await expect(page.locator(`text=${t('home.exchangeVietnam')}`).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${t('home.exchangeThailand')}`).first()).toBeVisible();
    await expect(page.locator(`text=${t('home.exchangeIndonesia')}`).first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 수준별 학습 (Leveled Learning) — i18n acceptance for SEA locales
// ---------------------------------------------------------------------------

test.describe('UX Acceptance: 수준별 학습 (Leveled Learning) — i18n Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await blockFirebase(page);
  });

  const seaLocales = [
    { locale: 'vi', label: 'Vietnamese' },
    { locale: 'th', label: 'Thai' },
    { locale: 'id', label: 'Indonesian' },
  ] as const;

  for (const { locale, label } of seaLocales) {
    // Capture errors per-test with a closure so the array is fresh each run
    test(`${label} (${locale}) homepage renders without JS errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await blockFirebase(page);
      await page.goto(`/${locale}`);
      await page.waitForLoadState('networkidle');

      expect(errors, `JS errors on /${locale}: ${errors.join(', ')}`).toEqual([]);
    });

    test(`${label} (${locale}) homepage renders exchange history section`, async ({ page }) => {
      await blockFirebase(page);
      await page.goto(`/${locale}`);
      await page.waitForLoadState('networkidle');

      const t = (key: string) => getMessage(locale, key);

      await expect(
        page.locator(`text=${t('home.exchangeHistoryTitle')}`).first()
      ).toBeVisible({ timeout: 15000 });
    });

    test(`${label} (${locale}) homepage shows YOUR HISTORY badge for home country`, async ({ page }) => {
      await blockFirebase(page);
      await page.goto(`/${locale}`);
      await page.waitForLoadState('networkidle');

      // The home-country card must be visually distinguished with a YOUR HISTORY badge
      await expect(
        page.locator('text=YOUR HISTORY').first()
      ).toBeVisible({ timeout: 10000 });
    });

    test(`${label} (${locale}) homepage timeline section is visible`, async ({ page }) => {
      await blockFirebase(page);
      await page.goto(`/${locale}`);
      await page.waitForLoadState('networkidle');

      const t = (key: string) => getMessage(locale, key);

      await expect(
        page.locator(`text=${t('home.timelineTitle')}`).first()
      ).toBeVisible({ timeout: 15000 });
    });

    test(`${label} (${locale}) homepage has era filter links`, async ({ page }) => {
      await blockFirebase(page);
      await page.goto(`/${locale}`);
      await page.waitForLoadState('networkidle');

      const eraLinks = page.locator('a[href*="/prompts?era="]');
      const count = await eraLinks.count();

      expect(
        count,
        `Expected era filter links on /${locale} homepage, found ${count}`
      ).toBeGreaterThanOrEqual(9);
    });
  }
});
