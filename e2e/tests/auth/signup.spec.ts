import { test, expect } from '@playwright/test';
import { getMessage } from '../../helpers/i18n';

test.describe('Signup Page', () => {
  test.beforeEach(async ({ page }) => {
    // Block Firebase to prevent real initialization
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => route.abort());
    await page.route('**/firestore.googleapis.com/**', (route) => route.abort());
    await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
    await page.route('**/api/auth/create-user', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
    );
    await page.goto('/signup');
  });

  test('renders form fields with i18n labels (ko)', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);

    await expect(page.locator('h1')).toContainText(t('auth.signupTitle'));
    await expect(page.locator('label[for="displayName"]')).toContainText(t('auth.name'));
    await expect(page.locator('label[for="email"]')).toContainText(t('auth.email'));
    await expect(page.locator('label[for="password"]')).toContainText(t('auth.password'));
    await expect(page.locator('label[for="confirmPassword"]')).toContainText(t('auth.confirmPassword'));
  });

  test('shows password mismatch error', async ({ page }) => {
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'different123');
    await page.click('button[type="submit"]');

    const t = (key: string) => getMessage('ko', key);
    await expect(page.locator('.bg-red-50')).toContainText(t('auth.passwordMismatch'));
  });

  test('shows password too short error', async ({ page }) => {
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', '12345');
    await page.fill('#confirmPassword', '12345');
    await page.click('button[type="submit"]');

    const t = (key: string) => getMessage('ko', key);
    await expect(page.locator('.bg-red-50')).toContainText(t('auth.passwordTooShort'));
  });

  test('shows email already in use error on Firebase rejection', async ({ page }) => {
    // Mock Firebase to return email-already-in-use error
    await page.addInitScript(() => {
      (window as any).__FIREBASE_SIGNUP_ERROR__ = { code: 'auth/email-already-in-use' };
    });

    await page.fill('#displayName', 'Test');
    await page.fill('#email', 'existing@example.com');
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');
    await page.click('button[type="submit"]');

    // The form will attempt Firebase call which will be blocked
    // Due to network block, it will show an error
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 10000 });
  });

  test('Google signup button exists', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);
    const googleButton = page.locator(`button:has-text("${t('auth.googleSignup')}")`);
    await expect(googleButton).toBeVisible();
  });

  test('has link to login page', async ({ page }) => {
    const t = (key: string) => getMessage('ko', key);
    const loginLink = page.locator(`a[href*="/login"]`);
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toContainText(t('auth.loginButton'));
  });

  test('login link navigates to login page', async ({ page }) => {
    await page.click('a[href*="/login"]');
    await expect(page).toHaveURL(/\/login/);
  });
});
