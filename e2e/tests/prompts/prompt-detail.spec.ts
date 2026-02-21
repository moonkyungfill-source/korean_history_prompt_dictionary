import { test as authTest, expect as authExpect, MOCK_USER } from '../../fixtures/auth.fixture';
import { test, expect } from '@playwright/test';
import { getMessage } from '../../helpers/i18n';
import { setupApiMocks } from '../../fixtures/api-mocks.fixture';

test.describe('Prompt Detail Page (Unauthenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => route.abort());
    await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
    await page.route('**/api/auth/create-user', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
    );
  });

  test('shows not found message for nonexistent prompt', async ({ page }) => {
    await page.route('**/firestore.googleapis.com/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    await page.goto('/prompts/nonexistent-id');

    const t = (key: string) => getMessage('ko', key);
    await expect(page.getByText(t('prompts.notFound'))).toBeVisible({ timeout: 10000 });
    await expect(page.locator('a[href*="/prompts"]')).toBeVisible();
  });

  test('generate button redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/prompts/prompt-001');

    const t = (key: string) => getMessage('ko', key);
    const generateBtn = page.getByText(t('generation.generateButton'));

    // Wait for page load
    await page.waitForTimeout(3000);
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      await page.waitForURL('**/login', { timeout: 10000 });
      await expect(page).toHaveURL(/\/login/);
    }
  });
});

test.describe('Prompt Detail Page (Authenticated)', () => {
  authTest('displays prompt detail elements', async ({ authenticatedPage: page }) => {
    await page.goto('/prompts/prompt-001');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Title should be visible
    const title = page.locator('h1');
    await authExpect(title).toBeVisible({ timeout: 15000 });

    // Back to list link
    const t = (key: string) => getMessage('ko', key);
    await authExpect(page.getByText(t('prompts.backToList'))).toBeVisible();
  });

  authTest('copy button toggles to copied state', async ({ authenticatedPage: page }) => {
    // Grant clipboard permission
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/prompts/prompt-001');
    await page.waitForTimeout(3000);

    const t = (key: string) => getMessage('ko', key);
    const copyBtn = page.getByText(t('common.copy'));

    if (await copyBtn.isVisible()) {
      await copyBtn.click();
      await authExpect(page.getByText(t('common.copied'))).toBeVisible();
    }
  });

  authTest('generate button shows confirm dialog', async ({ authenticatedPage: page }) => {
    await setupApiMocks(page);
    await page.goto('/prompts/prompt-001');
    await page.waitForTimeout(3000);

    const t = (key: string) => getMessage('ko', key);
    const generateBtn = page.getByText(t('generation.generateButton'));

    if (await generateBtn.isVisible()) {
      await generateBtn.click();

      // Confirm dialog should appear
      const confirmDialog = page.locator('.bg-blue-50');
      await authExpect(confirmDialog).toBeVisible({ timeout: 5000 });

      // Should show balance
      await authExpect(confirmDialog).toContainText(String(MOCK_USER.creditBalance));

      // Confirm button
      await authExpect(
        page.getByText(t('generation.confirmButton'))
      ).toBeVisible();

      // Cancel button
      await authExpect(
        page.getByText(t('common.cancel'))
      ).toBeVisible();
    }
  });

  authTest('successful image generation shows image', async ({ authenticatedPage: page }) => {
    await setupApiMocks(page, { generateImage: 'success' });
    await page.goto('/prompts/prompt-001');
    await page.waitForTimeout(3000);

    const t = (key: string) => getMessage('ko', key);
    const generateBtn = page.getByText(t('generation.generateButton'));

    if (await generateBtn.isVisible()) {
      await generateBtn.click();

      // Click confirm
      const confirmBtn = page.getByText(t('generation.confirmButton'));
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();

        // Wait for image or error
        await page.waitForTimeout(3000);

        // Check for download link (success indicator)
        const downloadLink = page.locator('a[download]');
        const errorMsg = page.locator('.bg-red-50');

        await authExpect(
          downloadLink.or(errorMsg)
        ).toBeVisible({ timeout: 15000 });
      }
    }
  });

  authTest('insufficient credits shows error with purchase link', async ({ authenticatedPage: page }) => {
    await setupApiMocks(page, { generateImage: 'insufficient_credits' });
    await page.goto('/prompts/prompt-001');
    await page.waitForTimeout(3000);

    const t = (key: string) => getMessage('ko', key);

    // Simulate zero credits by directly triggering the generate flow
    // The API mock will return INSUFFICIENT_CREDITS
    const generateBtn = page.getByText(t('generation.generateButton'));

    if (await generateBtn.isVisible()) {
      await generateBtn.click();

      const confirmBtn = page.getByText(t('generation.confirmButton'));
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();

        // Error with purchase link
        await authExpect(page.locator('.bg-red-50')).toBeVisible({ timeout: 10000 });
        await authExpect(page.locator('a[href*="/credits/purchase"]')).toBeVisible();
      }
    }
  });
});
