import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:3099',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  webServer: {
    command: isCI ? 'npm run build && npm start -- -p 3099' : 'npm run dev -- -p 3099',
    port: 3099,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium-ko',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'ko-KR',
      },
    },
    {
      name: 'firefox-ko',
      use: {
        ...devices['Desktop Firefox'],
        locale: 'ko-KR',
      },
    },
    {
      name: 'webkit-ko',
      use: {
        ...devices['Desktop Safari'],
        locale: 'ko-KR',
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        locale: 'ko-KR',
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
        locale: 'ko-KR',
      },
    },
    {
      name: 'chromium-en',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'en-US',
      },
    },
    {
      name: 'chromium-ja',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'ja-JP',
      },
    },
  ],
});
