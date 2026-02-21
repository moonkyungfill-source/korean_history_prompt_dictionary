import { test, expect } from '@playwright/test';
import { PROTECTED_ROUTES } from '../../helpers/i18n';

test.describe('Protected Routes', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure unauthenticated state — block Firebase auth
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ users: [] }),
      });
    });
    await page.route('**/firestore.googleapis.com/**', (route) => route.abort());
    await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
    await page.route('**/api/auth/create-user', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
    );
  });

  for (const route of PROTECTED_ROUTES) {
    test(`${route} redirects to /login when unauthenticated`, async ({ page }) => {
      await page.goto(route);

      // Should redirect to login page
      await page.waitForURL('**/login', { timeout: 15000 });
      await expect(page).toHaveURL(/\/login/);
    });
  }
});
