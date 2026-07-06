import { test, expect } from '@playwright/test';

/**
 * Smoke test — the homepage loads and renders its shell. This is the seed E2E
 * spec that proves the Playwright setup works end-to-end; broader flows (browse
 * → filter → roll → save) get their own specs on top of this.
 */
test('homepage responds and renders content', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.ok(), 'GET / should return a 2xx').toBeTruthy();

  // The app shell rendered something (not a blank/error page).
  await expect(page.locator('body')).not.toBeEmpty();
});
