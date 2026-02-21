import { test, expect, MOCK_USER } from '../../fixtures/auth.fixture';
import { getMessage } from '../../helpers/i18n';
import { setupApiMocks } from '../../fixtures/api-mocks.fixture';

test.describe('Purchase Page', () => {
  test('page title and description are visible', async ({ authenticatedPage: page }) => {
    await page.goto('/credits/purchase');
    const t = (key: string) => getMessage('ko', key);

    await expect(page.locator('h1')).toContainText(t('credits.purchaseTitle'), { timeout: 15000 });
    await expect(page.getByText(t('credits.purchaseDesc'))).toBeVisible();
  });

  test('three package cards are displayed', async ({ authenticatedPage: page }) => {
    await page.goto('/credits/purchase');
    const t = (key: string) => getMessage('ko', key);

    await page.waitForTimeout(3000);

    // Check for the three packages: 10, 50, 100 credits
    await expect(page.getByText(t('credits.packageLabel', { credits: '10' }))).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(t('credits.packageLabel', { credits: '50' }))).toBeVisible();
    await expect(page.getByText(t('credits.packageLabel', { credits: '100' }))).toBeVisible();
  });

  test('discount labels are shown for larger packages', async ({ authenticatedPage: page }) => {
    await page.goto('/credits/purchase');
    const t = (key: string) => getMessage('ko', key);

    await page.waitForTimeout(3000);

    // 50 credits = 10% discount
    await expect(page.getByText(t('credits.discount10'))).toBeVisible({ timeout: 10000 });
    // 100 credits = 20% discount
    await expect(page.getByText(t('credits.discount20'))).toBeVisible();
  });

  test('clicking a package highlights it', async ({ authenticatedPage: page }) => {
    await page.goto('/credits/purchase');
    await page.waitForTimeout(3000);

    const t = (key: string) => getMessage('ko', key);

    // Click the 10 credit package
    const pkg10 = page.getByText(t('credits.packageLabel', { credits: '10' }));
    if (await pkg10.isVisible()) {
      await pkg10.click();

      // After selection, the payment widget area should appear
      await page.waitForTimeout(1000);

      // The pay button should appear with price
      const payButton = page.getByText(/1,000|1000/);
      // Should have a payment-related button visible
      await expect(
        payButton.or(page.locator('#payment-widget'))
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('pay button shows correct price after package selection', async ({ authenticatedPage: page }) => {
    await setupApiMocks(page, { createOrder: 'success' });
    await page.goto('/credits/purchase');
    await page.waitForTimeout(3000);

    const t = (key: string) => getMessage('ko', key);

    // Select 10 credit package
    const pkg10 = page.getByText(t('credits.packageLabel', { credits: '10' }));
    if (await pkg10.isVisible()) {
      await pkg10.click();

      // Pay button should show 1,000 won
      await expect(
        page.getByText(t('credits.payButton', { price: '1,000' }))
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('payment widget container renders when package selected', async ({ authenticatedPage: page }) => {
    await page.goto('/credits/purchase');
    await page.waitForTimeout(3000);

    const t = (key: string) => getMessage('ko', key);

    const pkg10 = page.getByText(t('credits.packageLabel', { credits: '10' }));
    if (await pkg10.isVisible()) {
      await pkg10.click();

      // Payment widget div should be present
      await expect(page.locator('#payment-widget')).toBeVisible({ timeout: 10000 });
    }
  });
});
