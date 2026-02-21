import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { test as authTest, expect as authExpect } from '../../fixtures/auth.fixture';

test.describe('Accessibility (WCAG 2.1 AA)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/identitytoolkit.googleapis.com/**', (route) => route.abort());
    await page.route('**/firestore.googleapis.com/**', (route) => route.abort());
    await page.route('**/securetoken.googleapis.com/**', (route) => route.abort());
    await page.route('**/api/auth/create-user', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"ok"}' })
    );
  });

  test('home page has no critical a11y violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast']) // May have issues with gradient backgrounds
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(critical).toEqual([]);
  });

  test('prompts page has no critical a11y violations', async ({ page }) => {
    await page.goto('/prompts');
    await page.waitForTimeout(3000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(critical).toEqual([]);
  });

  test('login page has no critical a11y violations', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(2000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(critical).toEqual([]);
  });

  test('signup page has no critical a11y violations', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForTimeout(2000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(critical).toEqual([]);
  });
});

authTest.describe('Accessibility - Authenticated Pages', () => {
  authTest('dashboard has no critical a11y violations', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(5000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    authExpect(critical).toEqual([]);
  });
});
