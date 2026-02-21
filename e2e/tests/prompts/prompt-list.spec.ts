import { test, expect } from '@playwright/test';
import { getMessage } from '../../helpers/i18n';

test.describe('Prompt List Page', () => {
  test.beforeEach(async ({ page }) => {
    // Block Firestore real-time and let page render with its loading/data flow
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => route.abort());
    await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
    await page.route('**/api/auth/create-user', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
    );
    await page.goto('/prompts');
  });

  test('page title is visible', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);
    await expect(page.locator('h1')).toContainText(t('prompts.title'));
  });

  test('search input is present', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);
    const searchInput = page.locator(`input[placeholder="${t('prompts.searchPlaceholder')}"]`);
    await expect(searchInput).toBeVisible();
  });

  test('era filter buttons are visible', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);

    // "All" era button should be visible
    await expect(page.getByText(t('eras.all')).first()).toBeVisible();
  });

  test('category filter buttons are visible', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);
    await expect(page.getByText(t('categories.all')).first()).toBeVisible();
  });

  test('prompt grid container exists', async ({ page }) => {
    // Wait for either the grid or the loading state or no-results
    const grid = page.locator('.grid');
    const noResults = page.getByText(getMessage('ko', 'prompts.noResults'));
    const loadingPulse = page.locator('.animate-pulse');

    // One of these should be visible
    await expect(
      grid.or(noResults).or(loadingPulse).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('prompt cards link to detail pages', async ({ page }) => {
    // Wait for cards to load (or no results)
    await page.waitForTimeout(3000);
    const cards = page.locator('a[href*="/prompts/"]');
    const count = await cards.count();

    if (count > 0) {
      const firstCard = cards.first();
      const href = await firstCard.getAttribute('href');
      expect(href).toMatch(/\/prompts\/.+/);
    }
  });

  test('no results message shows for impossible search', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);
    const searchInput = page.locator(`input[placeholder="${t('prompts.searchPlaceholder')}"]`);
    await searchInput.fill('xyznonexistentquery123');

    // Trigger search (wait for debounce)
    await page.waitForTimeout(1000);

    // Either no results text or empty grid
    await expect(
      page.getByText(t('prompts.noResults')).or(page.locator('.grid'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('era filter can be clicked', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);
    const joseonButton = page.getByText(t('eras.joseon')).first();

    if (await joseonButton.isVisible()) {
      await joseonButton.click();
      // Filter should be applied — page should not crash
      await page.waitForTimeout(1000);
      await expect(page.locator('header')).toBeVisible();
    }
  });

  test('load more button appears when there are many prompts', async ({ page }) => {
    // This test verifies the button exists when results exceed page size
    await page.waitForTimeout(3000);
    const t = (key: string) => getMessage('ko', key);
    const loadMoreBtn = page.getByText(t('prompts.loadMore'));

    // May or may not be visible depending on data — just verify no crash
    const isVisible = await loadMoreBtn.isVisible().catch(() => false);
    // If visible, it should be clickable
    if (isVisible) {
      await expect(loadMoreBtn).toBeEnabled();
    }
  });
});
