import { test, expect, MOCK_USER } from '../../fixtures/auth.fixture';
import { getMessage } from '../../helpers/i18n';

test.describe('Credits Page', () => {
  test('page title is visible', async ({ authenticatedPage: page }) => {
    await page.goto('/credits');
    const t = (key: string) => getMessage('ko', key);

    await expect(page.locator('h1')).toContainText(t('credits.title'), { timeout: 15000 });
  });

  test('balance card is visible', async ({ authenticatedPage: page }) => {
    await page.goto('/credits');
    const t = (key: string) => getMessage('ko', key);

    // Balance card with gradient
    const balanceCard = page.locator('.bg-gradient-to-r');
    await expect(balanceCard).toBeVisible({ timeout: 15000 });

    // Current balance label
    await expect(balanceCard).toContainText(t('credits.currentBalance'));

    // Credit unit label
    await expect(balanceCard).toContainText(t('credits.creditUnit'));
  });

  test('purchase credits link is present', async ({ authenticatedPage: page }) => {
    await page.goto('/credits');
    const t = (key: string) => getMessage('ko', key);

    const purchaseLink = page.locator('a[href*="/credits/purchase"]');
    await expect(purchaseLink).toBeVisible({ timeout: 15000 });
    await expect(purchaseLink).toContainText(t('credits.purchase'));
  });

  test('transaction history section is visible', async ({ authenticatedPage: page }) => {
    await page.goto('/credits');
    const t = (key: string) => getMessage('ko', key);

    await expect(page.getByText(t('credits.transactionHistory'))).toBeVisible({ timeout: 15000 });
  });

  test('shows no transactions message or transaction list', async ({ authenticatedPage: page }) => {
    await page.goto('/credits');
    const t = (key: string) => getMessage('ko', key);

    await page.waitForTimeout(5000);

    // Either shows transactions or "no transactions" message
    const noTx = page.getByText(t('credits.noTransactions'));
    const txList = page.locator('table, .divide-y');

    await expect(
      noTx.or(txList).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
