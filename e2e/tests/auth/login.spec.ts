import { test, expect } from '@playwright/test';
import { getMessage } from '../../helpers/i18n';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Block Firebase to prevent real initialization
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => route.abort());
    await page.route('**/firestore.googleapis.com/**', (route) => route.abort());
    await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
    await page.route('**/api/auth/create-user', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
    );
    await page.goto('/login');
  });

  test('renders form labels with i18n (ko)', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);

    await expect(page.locator('h1')).toContainText(t('auth.loginTitle'));
    await expect(page.locator('label[for="email"]')).toContainText(t('auth.email'));
    await expect(page.locator('label[for="password"]')).toContainText(t('auth.password'));
  });

  test('HTML5 validation prevents empty field submission', async ({ page }) => {
    // Try to submit empty form — email input has required attribute
    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveAttribute('required', '');

    const passwordInput = page.locator('#password');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('shows error on invalid credentials (Firebase rejection)', async ({ page }) => {
    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Firebase call will fail due to route abort
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 10000 });
  });

  test('shows login button with correct text', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toContainText(t('auth.loginButton'));
  });

  test('shows loading state during login attempt', async ({ page }) => {
    // Delay the Firebase response
    await page.route('**/identitytoolkit.googleapis.com/**', async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      route.abort();
    });

    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');

    const t = (key: string) => getMessage('ko', key);
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('Google login button exists', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);
    const googleButton = page.locator(`button:has-text("${t('auth.googleLogin')}")`);
    await expect(googleButton).toBeVisible();
  });

  test('has signup link', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);
    const signupLink = page.locator('a[href*="/signup"]');
    await expect(signupLink).toBeVisible();
    await expect(signupLink).toContainText(t('auth.signupButton'));
  });

  test('signup link navigates to signup page', async ({ page }) => {
    await page.click('a[href*="/signup"]');
    await expect(page).toHaveURL(/\/signup/);
  });

  test('or divider is visible', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);
    await expect(page.getByText(t('auth.orDivider'))).toBeVisible();
  });
});
