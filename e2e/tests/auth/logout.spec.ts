import { test, expect } from '../../fixtures/auth.fixture';
import { getMessage } from '../../helpers/i18n';

test.describe('Logout Flow', () => {
  test('user menu opens and shows logout option', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    const t = (key: string) => getMessage('ko', key);

    // Click user menu button
    const userMenuBtn = page.locator('button[aria-label="User menu"]');
    await expect(userMenuBtn).toBeVisible({ timeout: 15000 });
    await userMenuBtn.click();

    // Menu should be visible with logout option
    const menu = page.locator('[role="menu"]');
    await expect(menu).toBeVisible();

    const logoutBtn = menu.locator(`[role="menuitem"]:has-text("${t('common.logout')}")`);
    await expect(logoutBtn).toBeVisible();
  });

  test('clicking logout navigates to home and changes header', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    const t = (key: string) => getMessage('ko', key);

    // Open user menu and click logout
    await page.locator('button[aria-label="User menu"]').click();
    await page.locator(`[role="menuitem"]:has-text("${t('common.logout')}")`).click();

    // Should navigate away from dashboard
    await page.waitForURL('**/');

    // Header should show login/signup buttons (unauthenticated state)
    // The login link should appear after auth state changes
    await expect(page.locator(`header a[href*="/login"]`)).toBeVisible({ timeout: 10000 });
  });
});
