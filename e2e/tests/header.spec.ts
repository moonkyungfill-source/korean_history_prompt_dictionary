import { test as authTest, expect as authExpect, MOCK_USER } from '../fixtures/auth.fixture';
import { test, expect } from '@playwright/test';
import { getMessage } from '../helpers/i18n';

test.describe('Header (Unauthenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => route.abort());
    await page.route('**/firestore.googleapis.com/**', (route) => route.abort());
    await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
    await page.route('**/api/auth/create-user', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
    );
    await page.goto('/');
  });

  test('logo links to home', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);
    const logo = page.locator(`header a[href="/"]`);
    await expect(logo).toBeVisible({ timeout: 10000 });
    await expect(logo).toContainText(t('common.siteName'));
  });

  test('prompts nav link is visible', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);
    // Desktop nav — hidden on mobile
    const promptsLink = page.locator('header nav').getByText(t('nav.prompts'));
    await expect(promptsLink).toBeVisible({ timeout: 10000 });
  });

  test('login and signup buttons are visible (desktop)', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);

    await page.waitForTimeout(3000);

    const loginLink = page.locator('header').getByText(t('common.login')).first();
    const signupLink = page.locator('header').getByText(t('common.signup')).first();

    await expect(loginLink).toBeVisible({ timeout: 10000 });
    await expect(signupLink).toBeVisible();
  });

  test('dashboard and gallery links are NOT visible', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);
    await page.waitForTimeout(3000);

    // Dashboard and gallery should not be in nav for unauthenticated users
    const dashboardLink = page.locator('header nav').getByText(t('nav.dashboard'));
    const galleryLink = page.locator('header nav').getByText(t('nav.gallery'));

    await expect(dashboardLink).not.toBeVisible();
    await expect(galleryLink).not.toBeVisible();
  });

  test('locale switcher is present', async ({ page }) => {
    const localeBtn = page.locator('button[aria-label="Change language"]');
    await expect(localeBtn).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Header (Authenticated)', () => {
  authTest('dashboard and gallery links are visible', async ({ authenticatedPage: page }) => {
    await page.goto('/');
    const t = (key: string) => getMessage('ko', key);

    await page.waitForTimeout(5000);

    const dashboardLink = page.locator('header nav').getByText(t('nav.dashboard'));
    const galleryLink = page.locator('header nav').getByText(t('nav.gallery'));

    await authExpect(dashboardLink).toBeVisible({ timeout: 15000 });
    await authExpect(galleryLink).toBeVisible();
  });

  authTest('credit badge is visible', async ({ authenticatedPage: page }) => {
    await page.goto('/');
    await page.waitForTimeout(5000);

    const creditBadge = page.locator('header a[href*="/credits"]');
    await authExpect(creditBadge).toBeVisible({ timeout: 15000 });
  });

  authTest('user menu button is visible', async ({ authenticatedPage: page }) => {
    await page.goto('/');
    await page.waitForTimeout(5000);

    const userMenuBtn = page.locator('button[aria-label="User menu"]');
    await authExpect(userMenuBtn).toBeVisible({ timeout: 15000 });
  });

  authTest('user menu shows email and options', async ({ authenticatedPage: page }) => {
    await page.goto('/');
    await page.waitForTimeout(5000);

    await page.locator('button[aria-label="User menu"]').click();

    const menu = page.locator('[role="menu"]');
    await authExpect(menu).toBeVisible();

    // Email should be shown
    await authExpect(menu).toContainText(MOCK_USER.email);

    // Credits link in menu
    const t = (key: string) => getMessage('ko', key);
    await authExpect(
      menu.locator(`[role="menuitem"]:has-text("${t('nav.credits')}")`)
    ).toBeVisible();

    // Logout option
    await authExpect(
      menu.locator(`[role="menuitem"]:has-text("${t('common.logout')}")`)
    ).toBeVisible();
  });
});

test.describe('Header (Mobile)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('hamburger menu button is visible on mobile', async ({ page }) => {
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => route.abort());
    await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
    await page.route('**/api/auth/create-user', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
    );
    await page.goto('/');

    const hamburger = page.locator('button[aria-label="Toggle menu"]');
    await expect(hamburger).toBeVisible({ timeout: 10000 });
  });

  test('mobile menu opens on hamburger click', async ({ page }) => {
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => route.abort());
    await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
    await page.route('**/api/auth/create-user', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
    );
    await page.goto('/');

    await page.locator('button[aria-label="Toggle menu"]').click();

    const t = (key: string) => getMessage('ko', key);

    // Mobile menu should show nav links
    await page.waitForTimeout(500);

    // Prompts link in mobile menu
    const mobilePrompts = page.locator('header nav').getByText(t('nav.prompts'));
    await expect(mobilePrompts.first()).toBeVisible({ timeout: 5000 });

    // Login link in mobile menu (unauthenticated)
    await page.waitForTimeout(3000);
    const mobileLogin = page.locator('header nav').getByText(t('common.login'));
    await expect(mobileLogin.first()).toBeVisible();
  });
});
