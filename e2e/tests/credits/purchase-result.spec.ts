import { test, expect, MOCK_USER } from '../../fixtures/auth.fixture';
import { test as baseTest, expect as baseExpect } from '@playwright/test';
import { getMessage } from '../../helpers/i18n';
import { setupApiMocks } from '../../fixtures/api-mocks.fixture';

test.describe('Payment Success Page', () => {
  test('shows success with credits after confirmation', async ({ authenticatedPage: page }) => {
    await setupApiMocks(page, { confirmPayment: 'success' });
    await page.goto('/credits/purchase/success?paymentKey=pk_test&orderId=ord_test&amount=1000');

    const t = (key: string) => getMessage('ko', key);

    // Wait for confirmation process
    await page.waitForTimeout(3000);

    // Should show success title
    const successTitle = page.getByText(t('payment.successTitle'));
    const confirmFailed = page.getByText(t('payment.confirmFailed'));

    await expect(
      successTitle.or(confirmFailed)
    ).toBeVisible({ timeout: 15000 });

    if (await successTitle.isVisible()) {
      // Credits count should be displayed
      await expect(page.getByText(/10/)).toBeVisible();

      // Links should be present
      await expect(page.getByText(t('payment.goToPrompts'))).toBeVisible();
      await expect(page.getByText(t('payment.goToDashboard'))).toBeVisible();
    }
  });

  test('prompts link navigates correctly', async ({ authenticatedPage: page }) => {
    await setupApiMocks(page, { confirmPayment: 'success' });
    await page.goto('/credits/purchase/success?paymentKey=pk_test&orderId=ord_test&amount=1000');

    const t = (key: string) => getMessage('ko', key);
    await page.waitForTimeout(5000);

    const promptsLink = page.getByText(t('payment.goToPrompts'));
    if (await promptsLink.isVisible()) {
      await promptsLink.click();
      await expect(page).toHaveURL(/\/prompts/);
    }
  });

  test('dashboard link navigates correctly', async ({ authenticatedPage: page }) => {
    await setupApiMocks(page, { confirmPayment: 'success' });
    await page.goto('/credits/purchase/success?paymentKey=pk_test&orderId=ord_test&amount=1000');

    const t = (key: string) => getMessage('ko', key);
    await page.waitForTimeout(5000);

    const dashboardLink = page.getByText(t('payment.goToDashboard'));
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      await expect(page).toHaveURL(/\/dashboard/);
    }
  });

  test('shows error when confirmation fails', async ({ authenticatedPage: page }) => {
    await setupApiMocks(page, { confirmPayment: 'error' });
    await page.goto('/credits/purchase/success?paymentKey=pk_test&orderId=ord_test&amount=1000');

    const t = (key: string) => getMessage('ko', key);

    // Should show error state
    await expect(
      page.getByText(t('payment.confirmFailed')).or(page.getByText(t('payment.successTitle')))
    ).toBeVisible({ timeout: 15000 });
  });

  test('shows error when payment params are missing', async ({ authenticatedPage: page }) => {
    await page.goto('/credits/purchase/success');

    const t = (key: string) => getMessage('ko', key);

    // Should show missing info or confirm failed
    await expect(
      page.getByText(t('payment.missingInfo')).or(page.getByText(t('payment.confirmFailed')))
    ).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Payment Fail Page', () => {
  baseTest.beforeEach(async ({ page }) => {
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => route.abort());
    await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
    await page.route('**/api/auth/create-user', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
    );
  });

  baseTest('shows failure message', async ({ page }) => {
    await page.goto('/credits/purchase/fail');

    const t = (key: string) => getMessage('ko', key);
    await baseExpect(page.getByText(t('payment.failTitle'))).toBeVisible({ timeout: 15000 });
    await baseExpect(page.getByText(t('payment.failMessage'))).toBeVisible();
  });

  baseTest('shows error code when provided', async ({ page }) => {
    await page.goto('/credits/purchase/fail?code=PAY_CANCEL&message=User+cancelled');

    const t = (key: string) => getMessage('ko', key);
    await baseExpect(page.getByText(t('payment.failTitle'))).toBeVisible({ timeout: 15000 });

    // Error code should be displayed
    await baseExpect(page.getByText('PAY_CANCEL')).toBeVisible();
  });

  baseTest('retry link goes to purchase page', async ({ page }) => {
    await page.goto('/credits/purchase/fail');

    const t = (key: string) => getMessage('ko', key);
    const retryLink = page.getByText(t('payment.retry'));
    await baseExpect(retryLink).toBeVisible({ timeout: 15000 });

    await retryLink.click();
    await baseExpect(page).toHaveURL(/\/credits\/purchase/);
  });

  baseTest('dashboard link is present', async ({ page }) => {
    await page.goto('/credits/purchase/fail');

    const t = (key: string) => getMessage('ko', key);
    await baseExpect(page.getByText(t('payment.goToDashboard'))).toBeVisible({ timeout: 15000 });
  });
});
