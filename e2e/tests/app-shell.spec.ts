import { test, expect } from '@playwright/test';
import { getScreenshotDir, hasPathname } from './helpers';

test.describe('app shell and navigation', () => {
  test('has title', async ({ page }) => {
    await test.step('open the home page', async () => {
      await page.goto('/');
    });

    await test.step('verify the document title', async () => {
      await expect(page).toHaveTitle(/SenslerdeutschesWoerterbuch/);
    });
  });

  test('navigate to Info page via toolbar', async ({ page }, testInfo) => {
    await test.step('open the home page', async () => {
      await page.goto('/');
    });

    await test.step('navigate to the info page from the toolbar', async () => {
      const infoButton = page.locator('mat-toolbar').getByRole('link', { name: 'Infos' });
      await expect(infoButton).toBeVisible();
      await infoButton.click();
    });

    await test.step('verify the info page content', async () => {
      await expect(page).toHaveURL(hasPathname('/about'));
      await expect(page.getByRole('heading', { name: 'Über das Projekt' })).toBeVisible();
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/info-page.png` });
    });
  });

  test('navigate to Feedback page via toolbar', async ({ page }, testInfo) => {
    await test.step('open the home page', async () => {
      await page.goto('/');
    });

    await test.step('navigate to the feedback page from the toolbar', async () => {
      const feedbackButton = page.locator('mat-toolbar').getByRole('link', { name: 'Fragen?' });
      await expect(feedbackButton).toBeVisible();
      await feedbackButton.click();
    });

    await test.step('verify the feedback page content', async () => {
      await expect(page).toHaveURL(hasPathname('/feedback'));
      await expect(
        page.getByRole('heading', { name: 'Fragen, Hinweise oder Verbesserungsvorschläge?' }),
      ).toBeVisible();
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/feedback-page.png` });
    });
  });

  test('navigate to Info page and back to Home/Search via toolbar icon', async ({
    page,
  }, testInfo) => {
    await test.step('open the home page and move to the info page', async () => {
      await page.goto('/');

      const infoButton = page.locator('mat-toolbar').getByRole('link', { name: 'Infos' });
      await expect(infoButton).toBeVisible();
      await infoButton.click();
      await expect(page).toHaveURL(hasPathname('/about'));
    });

    await test.step('return to search with the toolbar logo', async () => {
      const logoLink = page
        .locator('mat-toolbar')
        .getByRole('link', { name: 'Senslerdeutsches Wörterbuch' });
      await expect(logoLink).toBeVisible();
      await logoLink.click();
    });

    await test.step('verify the search page is visible again', async () => {
      await expect(page).toHaveURL(hasPathname('/search'));
      await expect(page.getByRole('textbox', { name: 'Suechi' })).toBeVisible();
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/back-to-home.png` });
    });
  });

  test('redirect unknown routes back to search', async ({ page }, testInfo) => {
    await test.step('visit an unknown route', async () => {
      await page.goto('/this-route-does-not-exist');
    });

    await test.step('verify the app redirects back to search', async () => {
      await expect(page).toHaveURL(hasPathname('/search'));
      await expect(page.getByRole('textbox', { name: 'Suechi' })).toBeVisible();
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/unknown-route-redirect.png` });
    });
  });
});
