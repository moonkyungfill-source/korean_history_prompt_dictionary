/**
 * System Test (Functional) — Exchange History Section
 *
 * Verifies that:
 * - The homepage exchange history section renders in Korean (ko, default locale)
 * - All three country cards are visible in Korean
 * - English locale renders section title and Vietnam card in English
 * - SEA locales (vi, th, id) each surface a "YOUR HISTORY" badge on
 *   their home country's card
 * - Exchange history cards link to the correct era filter pages
 *   (Vietnam → goryeo, Thailand/Indonesia → joseon)
 */

import { test, expect } from '@playwright/test';

test.describe('Exchange History Section', () => {
  test.beforeEach(async ({ page }) => {
    // Block Firebase auth — section must render for unauthenticated visitors
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => route.abort());
    await page.route('**/firestore.googleapis.com/**', (route) => route.abort());
    await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
    await page.route('**/api/auth/create-user', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
    );
  });

  // ---------------------------------------------------------------------------
  // Korean (default locale)
  // ---------------------------------------------------------------------------

  test('homepage (ko) shows exchange history section heading', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('text=당신의 나라와 한국의 역사').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('homepage (ko) displays all 3 country cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=베트남-한국 교류사').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=태국-한국 교류사').first()).toBeVisible();
    await expect(page.locator('text=인도네시아-한국 교류사').first()).toBeVisible();
  });

  test('homepage (ko) shows descriptive text for each country', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Vietnam card — Goryeo-era migration event year
    await expect(page.locator('text=1224').first()).toBeVisible({ timeout: 10000 });

    // Thailand card — Joseon-era Ayutthaya event year
    await expect(page.locator('text=1393').first()).toBeVisible();

    // Indonesia card — Joseon-era Java event year
    await expect(page.locator('text=1394').first()).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // English locale
  // ---------------------------------------------------------------------------

  test('homepage (en) renders section heading in English', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator("text=Your Country's Connection to Korea").first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('homepage (en) shows Vietnam card in English', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('text=Vietnam-Korea Exchange History').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('homepage (en) shows all 3 English-language country cards', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Vietnam-Korea Exchange History').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Thailand-Korea Exchange History').first()).toBeVisible();
    await expect(page.locator('text=Indonesia-Korea Exchange History').first()).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Vietnamese locale — "YOUR HISTORY" badge + Vietnam card ordering
  // ---------------------------------------------------------------------------

  test('homepage (vi) shows YOUR HISTORY badge', async ({ page }) => {
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('text=YOUR HISTORY').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('homepage (vi) places Vietnam card first in the exchange history grid', async ({ page }) => {
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');

    // Scope to the exchange history section (identified by its amber gradient background)
    // to avoid matching the Features section grid that appears higher on the page.
    const exchangeSection = page.locator('section.bg-gradient-to-b').filter({ hasText: '1224' });
    const cards = exchangeSection.locator('.grid > div');
    const firstCardText = await cards.first().textContent();
    expect(firstCardText).toContain('1224');
  });

  test('homepage (vi) shows section heading in Vietnamese', async ({ page }) => {
    await page.goto('/vi');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('text=Lịch sử kết nối giữa đất nước bạn và Hàn Quốc').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ---------------------------------------------------------------------------
  // Thai locale — "YOUR HISTORY" badge on Thailand card
  // ---------------------------------------------------------------------------

  test('homepage (th) shows YOUR HISTORY badge', async ({ page }) => {
    await page.goto('/th');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('text=YOUR HISTORY').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('homepage (th) places Thailand card first in the exchange history grid', async ({ page }) => {
    await page.goto('/th');
    await page.waitForLoadState('networkidle');

    // Scope to the exchange history section (identified by its amber gradient background)
    // to avoid matching the Features section grid that appears higher on the page.
    const exchangeSection = page.locator('section.bg-gradient-to-b').filter({ hasText: '1393' });
    const cards = exchangeSection.locator('.grid > div');
    const firstCardText = await cards.first().textContent();
    expect(firstCardText).toContain('1393');
  });

  // ---------------------------------------------------------------------------
  // Indonesian locale — "YOUR HISTORY" badge on Indonesia card
  // ---------------------------------------------------------------------------

  test('homepage (id) shows YOUR HISTORY badge', async ({ page }) => {
    await page.goto('/id');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('text=YOUR HISTORY').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('homepage (id) places Indonesia card first in the exchange history grid', async ({ page }) => {
    await page.goto('/id');
    await page.waitForLoadState('networkidle');

    // Scope to the exchange history section (identified by its amber gradient background)
    // to avoid matching the Features section grid that appears higher on the page.
    const exchangeSection = page.locator('section.bg-gradient-to-b').filter({ hasText: '1394' });
    const cards = exchangeSection.locator('.grid > div');
    const firstCardText = await cards.first().textContent();
    expect(firstCardText).toContain('1394');
  });

  // ---------------------------------------------------------------------------
  // Link destinations — era filter correctness
  // ---------------------------------------------------------------------------

  test('exchange history Vietnam card links to goryeo era', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // The Vietnam/Goryeo card should link to the goryeo-filtered prompt list
    const goryeoLink = page.locator('a[href*="era=goryeo"]').first();
    await expect(goryeoLink).toBeVisible({ timeout: 10000 });
  });

  test('exchange history Thailand and Indonesia cards link to joseon era', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Both Thailand (Ayutthaya→Joseon) and Indonesia (Java→Joseon) cards
    // should link to the joseon-filtered prompt list — expect at least 2
    const joseonLinks = page.locator('a[href*="era=joseon"]');
    const count = await joseonLinks.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('explore exchange history CTA is present on ko homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // "교류사 탐험하기" CTA links somewhere (era filter or dedicated page)
    const exploreLinks = page.locator('text=교류사 탐험하기');
    expect(await exploreLinks.count()).toBeGreaterThanOrEqual(1);
  });
});
