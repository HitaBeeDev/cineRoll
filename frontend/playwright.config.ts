import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config — CineRoll frontend.
 *
 * Solo-portfolio scope: chromium only (no cross-browser matrix), screenshots on
 * failure, and a local dev server started automatically. E2E specs live in ./e2e.
 *
 * Run:  npm run test:e2e            (headless)
 *       npm run test:e2e -- --ui    (interactive)
 *
 * The frontend calls the backend API (NEXT_PUBLIC_API_URL, default :4000), so a
 * meaningful run needs the backend + seeded DB up too. Point at another origin
 * with PLAYWRIGHT_BASE_URL (e.g. a deployed URL) to skip the local dev server.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // Fail CI if a stray test.only is committed.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Start the local app for the run; reuse one already running (not on CI).
  // Skipped when PLAYWRIGHT_BASE_URL points at an external origin.
  ...(process.env.PLAYWRIGHT_BASE_URL
    ? {}
    : {
      webServer: {
        command: 'NEXT_PUBLIC_API_URL=http://127.0.0.1:4010 npm run dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
    }),
});
