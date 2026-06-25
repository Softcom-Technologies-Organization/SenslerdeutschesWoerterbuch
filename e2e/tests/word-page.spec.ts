import { test, expect } from '@playwright/test';
import { getScreenshotDir, hasPathname, mockWordDetails } from './helpers';

test.describe('word page', () => {
  test('load word details from a direct deep link', async ({ page }, testInfo) => {
    await test.step('mock the direct word detail response', async () => {
      await mockWordDetails(page, {
        id: 4242,
        term: 'Becker·trǜtscha',
        formattedDescription: 'vom Bäcker hergestellter Zopf',
      });
    });

    await test.step('open the word page directly', async () => {
      await page.goto('/word/4242');
    });

    await test.step('verify the word detail content is rendered', async () => {
      await expect(page).toHaveURL(hasPathname('/word/4242'));
      const wordHeading = page.getByRole('heading', { level: 1 });
      await expect(wordHeading).toBeVisible();
      await expect(wordHeading).toContainText('Becker');
      await expect(wordHeading).toContainText('trǜtscha');
      await expect(page.getByText('vom Bäcker hergestellter Zopf')).toBeVisible();
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/word-direct-link.png` });
    });
  });

  test('display an error when the word detail request fails', async ({ page }, testInfo) => {
    await test.step('mock a failing word detail request', async () => {
      await page.route('**/api/dictionary/word/999999/', async (route) => {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Not found' }),
        });
      });
    });

    await test.step('open the missing word page', async () => {
      await page.goto('/word/999999');
    });

    await test.step('verify the error state is rendered', async () => {
      await expect(
        page.getByText('Error loading word details. Please try again later.'),
      ).toBeVisible();
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/word-error-state.png` });
    });
  });
});
