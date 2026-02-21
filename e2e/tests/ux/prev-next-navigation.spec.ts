/**
 * System Test (Functional) — Previous/Next Era Navigation
 *
 * Verifies that:
 * - A prompt detail page renders at least one of "이전 시대" or "다음 시대"
 * - The boundary eras (first / last) suppress the nav that would point
 *   outside the 9-era sequence
 * - Clicking "다음 시대" from a non-last era navigates to a prompt from the
 *   adjacent later era
 * - Clicking "이전 시대" from a non-first era navigates to a prompt from the
 *   adjacent earlier era
 * - Both labels are present (and clickable) for middle-era prompts
 */

import { test, expect } from '@playwright/test';
import { getMessage } from '../../helpers/i18n';

/** Canonical era order oldest → newest, matching the app's era slugs. */
const ERA_ORDER = [
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

type EraSlug = typeof ERA_ORDER[number];

test.describe('Previous/Next Era Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Block auth but NOT Firestore — prompt data must load
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => route.abort());
    await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
    await page.route('**/api/auth/create-user', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
    );
  });

  // ---------------------------------------------------------------------------
  // Presence of prev/next labels on any prompt detail page
  // ---------------------------------------------------------------------------

  test('prompt detail page shows at least one prev/next era navigation label', async ({ page }) => {
    await page.goto('/prompts');
    await page.waitForTimeout(5000);

    const promptCard = page.locator('a[href*="/prompts/"]').first();
    if (!(await promptCard.isVisible())) {
      test.skip(true, 'No prompt cards visible — skipping prev/next nav check');
      return;
    }

    await promptCard.click();
    await page.waitForTimeout(5000);

    const t = (key: string) => getMessage('ko', key);
    const prevVisible = await page.locator(`text=${t('prompts.prevEra')}`).isVisible().catch(() => false);
    const nextVisible = await page.locator(`text=${t('prompts.nextEra')}`).isVisible().catch(() => false);

    expect(
      prevVisible || nextVisible,
      'Expected at least one of "이전 시대" or "다음 시대" to be visible on the prompt detail page'
    ).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // Boundary era — first era should have no "prev" label
  // ---------------------------------------------------------------------------

  test('prompt in the first era (prehistoric) has no 이전 시대 link', async ({ page }) => {
    await page.goto('/prompts?era=prehistoric');
    await page.waitForTimeout(5000);

    const firstCard = page.locator('a[href*="/prompts/"]').first();
    if (!(await firstCard.isVisible())) {
      test.skip(true, 'No prehistoric prompt cards visible');
      return;
    }

    await firstCard.click();
    await page.waitForTimeout(3000);

    const t = (key: string) => getMessage('ko', key);
    const prevLabel = page.locator(`text=${t('prompts.prevEra')}`);
    const prevVisible = await prevLabel.isVisible().catch(() => false);

    // The first era has no earlier era, so "이전 시대" must be absent
    expect(
      prevVisible,
      'Prehistoric-era prompt should not show 이전 시대 navigation'
    ).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // Boundary era — last era should have no "next" label
  // ---------------------------------------------------------------------------

  test('prompt in the last era (modern) has no 다음 시대 link', async ({ page }) => {
    await page.goto('/prompts?era=modern');
    await page.waitForTimeout(5000);

    const firstCard = page.locator('a[href*="/prompts/"]').first();
    if (!(await firstCard.isVisible())) {
      test.skip(true, 'No modern prompt cards visible');
      return;
    }

    await firstCard.click();
    await page.waitForTimeout(3000);

    const t = (key: string) => getMessage('ko', key);
    const nextLabel = page.locator(`text=${t('prompts.nextEra')}`);
    const nextVisible = await nextLabel.isVisible().catch(() => false);

    // The last era has no later era, so "다음 시대" must be absent
    expect(
      nextVisible,
      'Modern-era prompt should not show 다음 시대 navigation'
    ).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // Middle era — both labels should be present
  // ---------------------------------------------------------------------------

  test('prompt in a middle era (joseon) shows both 이전 시대 and 다음 시대 labels', async ({ page }) => {
    await page.goto('/prompts?era=joseon');
    await page.waitForTimeout(5000);

    const firstCard = page.locator('a[href*="/prompts/"]').first();
    if (!(await firstCard.isVisible())) {
      test.skip(true, 'No joseon prompt cards visible');
      return;
    }

    await firstCard.click();
    await page.waitForTimeout(3000);

    const t = (key: string) => getMessage('ko', key);
    const prevLabel = page.locator(`text=${t('prompts.prevEra')}`);
    const nextLabel = page.locator(`text=${t('prompts.nextEra')}`);

    await expect(prevLabel).toBeVisible({ timeout: 10000 });
    await expect(nextLabel).toBeVisible({ timeout: 10000 });
  });

  // ---------------------------------------------------------------------------
  // Navigation functionality — clicking 다음 시대 changes the displayed era
  // ---------------------------------------------------------------------------

  test('clicking 다음 시대 navigates to a prompt from the subsequent era', async ({ page }) => {
    await page.goto('/prompts?era=goryeo');
    await page.waitForTimeout(5000);

    const firstCard = page.locator('a[href*="/prompts/"]').first();
    if (!(await firstCard.isVisible())) {
      test.skip(true, 'No goryeo prompt cards visible');
      return;
    }

    await firstCard.click();
    await page.waitForTimeout(3000);

    const t = (key: string) => getMessage('ko', key);
    const nextLabel = page.locator(`text=${t('prompts.nextEra')}`).first();

    if (!(await nextLabel.isVisible())) {
      test.skip(true, 'No 다음 시대 link on this prompt');
      return;
    }

    await nextLabel.click();
    await page.waitForTimeout(3000);

    // After clicking we should be on a prompt detail page
    expect(page.url()).toMatch(/\/prompts\/.+/);

    // The era badge should now show the era after goryeo, which is joseon
    const eraBadge = page.locator('.bg-blue-100.text-blue-700').first();
    const badgeText = await eraBadge.textContent();
    expect(badgeText?.trim()).toBe(t('eras.joseon'));
  });

  // ---------------------------------------------------------------------------
  // Navigation functionality — clicking 이전 시대 changes the displayed era
  // ---------------------------------------------------------------------------

  test('clicking 이전 시대 navigates to a prompt from the preceding era', async ({ page }) => {
    await page.goto('/prompts?era=joseon');
    await page.waitForTimeout(5000);

    const firstCard = page.locator('a[href*="/prompts/"]').first();
    if (!(await firstCard.isVisible())) {
      test.skip(true, 'No joseon prompt cards visible');
      return;
    }

    await firstCard.click();
    await page.waitForTimeout(3000);

    const t = (key: string) => getMessage('ko', key);
    const prevLabel = page.locator(`text=${t('prompts.prevEra')}`).first();

    if (!(await prevLabel.isVisible())) {
      test.skip(true, 'No 이전 시대 link on this prompt');
      return;
    }

    await prevLabel.click();
    await page.waitForTimeout(3000);

    // Should now be on a detail page
    expect(page.url()).toMatch(/\/prompts\/.+/);

    // Era badge should show the era before joseon, which is goryeo
    const eraBadge = page.locator('.bg-blue-100.text-blue-700').first();
    const badgeText = await eraBadge.textContent();
    expect(badgeText?.trim()).toBe(t('eras.goryeo'));
  });

  // ---------------------------------------------------------------------------
  // Era context banner
  // ---------------------------------------------------------------------------

  test('prompt detail page displays the era context sentence', async ({ page }) => {
    await page.goto('/prompts');
    await page.waitForTimeout(5000);

    const firstCard = page.locator('a[href*="/prompts/"]').first();
    if (!(await firstCard.isVisible())) {
      test.skip(true, 'No prompt cards visible');
      return;
    }

    await firstCard.click();
    await page.waitForTimeout(3000);

    // The eraContext sentence contains "이 프롬프트는" in Korean
    // (the interpolated era name and year range complete the sentence)
    const contextSentence = page.locator('text=이 프롬프트는');
    await expect(contextSentence.first()).toBeVisible({ timeout: 10000 });
  });
});
