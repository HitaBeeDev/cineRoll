import { test, expect, type Page } from '@playwright/test';

/**
 * The archive count is an odometer: one animated slot per character. Two
 * invariants keep it readable, and both are easy to break by touching the
 * formatter or the slot keys.
 *
 * 1. The block never changes width. A three-character placeholder standing in
 *    for a four-digit number re-slots every digit the moment the count lands,
 *    which briefly stacked two glyphs in one slot and pushed them over the
 *    label above and the tagline below.
 * 2. A settled roll leaves one glyph per slot — nothing animating, nothing left
 *    behind.
 */

type OdometerState = {
  value: string;
  slotCount: number;
  glyphsPerSlot: number[];
  width: number;
};

// A fresh context lands on the taste-check onboarding, which never renders the
// count. The cookie the flow sets on completion is what the page reads.
const skipOnboarding = (page: Page) =>
  page.context().addCookies([
    { name: 'cineroll_onboarded', value: 'true', url: 'http://localhost:3000' },
  ]);

const odometer = (page: Page) =>
  page.getByText('The Archive', { exact: true }).locator('xpath=following-sibling::span[1]');

const readOdometer = (page: Page): Promise<OdometerState> =>
  odometer(page).evaluate((element) => {
    const slots = [...element.children].filter((child) => child.getAttribute('aria-hidden') === 'true');

    return {
      value: element.querySelector('.sr-only')?.textContent ?? '',
      slotCount: slots.length,
      // The sizing character is static; every animated glyph is absolute.
      glyphsPerSlot: slots.map(
        (slot) => [...slot.children].filter((child) => getComputedStyle(child).position === 'absolute').length,
      ),
      width: Math.round(element.getBoundingClientRect().width),
    };
  });

test('the count keeps its width from placeholder to number', async ({ page }) => {
  // Hold the catalogue count in flight long enough to read the placeholder.
  await page.route('**/api/random/count**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await route.continue();
  });

  await skipOnboarding(page);
  await page.goto('/');

  const placeholder = await readOdometer(page);
  expect(placeholder.value, 'placeholder while the count loads').toMatch(/^·+$/);

  await expect
    .poll(async () => (await readOdometer(page)).value, { timeout: 15_000 })
    .toMatch(/^\d+$/);

  const resolved = await readOdometer(page);
  expect(resolved.value.length, 'the number is as wide as the placeholder').toBe(placeholder.value.length);
  expect(resolved.width, 'the block does not reflow as the count lands').toBe(placeholder.width);
});

test('a settled roll leaves one glyph per slot', async ({ page }) => {
  await skipOnboarding(page);
  await page.goto('/');

  await expect
    .poll(async () => (await readOdometer(page)).value, { timeout: 15_000 })
    .toMatch(/^\d+$/);
  const before = await readOdometer(page);

  await page.getByRole('button', { name: 'Short', exact: true }).click();

  await expect
    .poll(async () => (await readOdometer(page)).value, { timeout: 15_000 })
    .not.toBe(before.value);
  // Longer than the 0.28s roll, so anything still present is left behind.
  await page.waitForTimeout(1000);

  const after = await readOdometer(page);
  expect(after.value).toMatch(/^\d+$/);
  expect(after.slotCount, 'the slot count is fixed').toBe(before.slotCount);
  expect(after.width, 'a filter change does not reflow the block').toBe(before.width);
  expect(after.glyphsPerSlot, 'no slot still holds a second glyph').toEqual(
    Array(after.slotCount).fill(1),
  );
});
