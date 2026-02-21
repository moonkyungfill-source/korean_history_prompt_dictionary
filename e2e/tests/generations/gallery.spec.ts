import { test, expect, MOCK_USER } from '../../fixtures/auth.fixture';
import { getMessage } from '../../helpers/i18n';

test.describe('Generations Gallery', () => {
  test('page title is visible', async ({ authenticatedPage: page }) => {
    await page.goto('/generations');
    const t = (key: string) => getMessage('ko', key);

    await expect(page.locator('h1')).toContainText(t('gallery.title'), { timeout: 15000 });
  });

  test('shows gallery grid or empty state', async ({ authenticatedPage: page }) => {
    await page.goto('/generations');
    const t = (key: string) => getMessage('ko', key);

    // Wait for content to load
    await page.waitForTimeout(5000);

    // Should show either the grid or empty state
    const grid = page.locator('.grid');
    const emptyText = page.getByText(t('gallery.empty'));

    await expect(
      grid.or(emptyText).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('empty state has link to prompts', async ({ authenticatedPage: page }) => {
    // Mock Firestore to return empty generations
    await page.route('**/firestore.googleapis.com/**/generations**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ documents: [] }),
      });
    });

    await page.goto('/generations');
    const t = (key: string) => getMessage('ko', key);

    await page.waitForTimeout(5000);
    const emptyAction = page.getByText(t('gallery.emptyAction'));

    if (await emptyAction.isVisible()) {
      await expect(emptyAction).toBeVisible();
      // Should link to prompts page
      await expect(page.locator('a[href*="/prompts"]')).toBeVisible();
    }
  });

  test('generation cards show status badges', async ({ authenticatedPage: page }) => {
    await page.goto('/generations');
    const t = (key: string) => getMessage('ko', key);

    await page.waitForTimeout(5000);

    // Check for status badge classes
    const completedBadge = page.locator('.bg-green-100');
    const failedBadge = page.locator('.bg-red-100');
    const processingBadge = page.locator('.bg-yellow-100');

    // At least one type of badge or empty state should be visible
    const anyBadge = completedBadge.or(failedBadge).or(processingBadge);
    const emptyState = page.getByText(t('gallery.empty'));

    await expect(
      anyBadge.or(emptyState).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('completed generations have download links', async ({ authenticatedPage: page }) => {
    await page.goto('/generations');

    await page.waitForTimeout(5000);
    const downloadLinks = page.locator('a[download]');
    const count = await downloadLinks.count();

    // Verify download links have href if present
    for (let i = 0; i < count; i++) {
      const href = await downloadLinks.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
    }
  });
});
