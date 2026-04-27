import { test, expect } from '@playwright/test';
import { getScreenshotDir, mockSearchBootstrap, mockSearchEngineDown, mockWordDetails } from './helpers';

test.describe('search page', () => {
  test('search functionality without autocomplete', async ({ page }, testInfo) => {
    test.setTimeout(60000);

    await test.step('open search and enter a known term', async () => {
      await page.goto('/');
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/landing.png` });

      const searchField = page.getByRole('textbox', { name: 'Suechi' });
      await expect(searchField).toBeVisible();
      await searchField.fill('beckertrǜtscha');
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/suggestions.png` });
      await searchField.press('Enter');
    });

    await test.step('verify the matching result appears', async () => {
      await expect(page.getByRole('link', { name: 'Becker·trǜtscha' })).toBeVisible();
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/results.png` });
    });

    await test.step('open the result and verify the word details', async () => {
      await page.getByRole('link', { name: 'Becker·trǜtscha' }).click();
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/details.png` });
      await expect(page.getByText('vom Bäcker hergestellter Zopf')).toBeVisible();
    });
  });

  test('make a random search and check if one result is displayed', async ({ page }, testInfo) => {
    await test.step('open search and confirm no query is prefilled', async () => {
      await page.goto('/');
      const searchField = page.getByRole('textbox', { name: 'Suechi' });
      const searchFieldInputValue = await searchField.inputValue();
      expect(searchFieldInputValue.length).toBe(0);
    });

    await test.step('trigger a random search', async () => {
      const randomSearchButton = page.getByRole('button', { name: 'Yyrgend iis Wort' });
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/before-research.png` });
      await expect(randomSearchButton).toBeVisible();
      await randomSearchButton.click();
    });

    await test.step('verify at least one result card is shown', async () => {
      const resultCards = page.locator('mat-card');
      await expect(resultCards.first()).toBeVisible();
    });
  });

  test('search functionality with filter', async ({ page }) => {
    test.setTimeout(60000);
    await test.step('open search and apply the Schimpfwort filter', async () => {
      await page.goto('/');

      const tagFilter = page.getByRole('combobox', { name: 'Aaziige na Tag' });
      await tagFilter.click();
      const tagOption = page.getByRole('option', { name: 'Schimpfwort' });
      await expect(tagOption).toBeVisible();
      await tagOption.click();
      await tagFilter.press('Escape');
    });

    await test.step('verify filtered results expose tag chips', async () => {
      const tagChip = page.locator('mat-card .result-tag').first();
      await expect(tagChip).toBeVisible();
    });
  });

  test('make a random search with a tag filter and check if one result is displayed', async ({ page }, testInfo) => {
    await test.step('open search and confirm no query is prefilled', async () => {
      await page.goto('/');
      const searchField = page.getByRole('textbox', { name: 'Suechi' });
      const searchFieldInputValue = await searchField.inputValue();
      expect(searchFieldInputValue.length).toBe(0);
    });

    await test.step('apply the Schimpfwort filter', async () => {
      const tagFilter = page.getByRole('combobox', { name: 'Aaziige na Tag' });
      await tagFilter.click();
      const tagOption = page.getByRole('option', { name: 'Schimpfwort' });
      await expect(tagOption).toBeVisible();
      await tagOption.click();
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/tag-filter-applied.png` });
      await tagFilter.press('Escape');
    });

    await test.step('run a random search within the active filter', async () => {
      const randomSearchButton = page.getByRole('button', { name: 'Yyrgend iis Wort' });
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/before-research.png` });
      await expect(randomSearchButton).toBeVisible();
      await randomSearchButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/after-research.png` });
    });

    await test.step('verify filtered random results are rendered', async () => {
      const resultCards = page.locator('mat-card');
      await expect(resultCards.first()).toBeVisible();

      const tagChip = page.locator('mat-card .result-tag').first();
      await expect(tagChip).toBeVisible();
    });
  });

  test('display message if no result is found but elastic works', async ({ page }, testInfo) => {
    await test.step('search for a term that has no results', async () => {
      await page.goto('/');
      const searchField = page.getByRole('textbox', { name: 'Suechi' });
      await expect(searchField).toBeVisible();
      await searchField.fill('adsfadsfasdf');
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/search-input.png` });
    });

    await test.step('verify the empty-state message is shown', async () => {
      await expect(page.getByTestId('no-searchresult-msg')).toBeVisible();
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/no-result-message.png` });
    });
  });

  test('preserve the last search term when navigating back from a word page', async ({ page }, testInfo) => {
    await test.step('mock search and word detail responses', async () => {
      await mockSearchBootstrap(page);
      await mockWordDetails(page, {
        id: 4242,
        term: 'Becker·trǜtscha',
        formattedDescription: 'vom Bäcker hergestellter Zopf',
      });
    });

    await test.step('search for the mocked word and open its detail page', async () => {
      await page.goto('/search');

      const searchField = page.getByRole('textbox', { name: 'Suechi' });
      await searchField.fill('beckertrǜtscha');
      await expect(page.getByRole('link', { name: 'Becker·trǜtscha' })).toBeVisible();

      await page.getByRole('link', { name: 'Becker·trǜtscha' }).click();
      await expect(page).toHaveURL(/.*\/word\/4242/);
    });

    await test.step('return to search and verify the last query is restored', async () => {
      const logoLink = page.locator('mat-toolbar').getByRole('link', { name: 'Senslerdeutsches Wörterbuch' });
      await logoLink.click();

      const searchField = page.getByRole('textbox', { name: 'Suechi' });
      await expect(page).toHaveURL(/.*\/search/);
      await expect(searchField).toHaveValue('beckertrǜtscha');
      await expect(page.getByRole('link', { name: 'Becker·trǜtscha' })).toBeVisible();
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/search-restored.png` });
    });
  });

  test('display a warning when the search engine is unavailable', async ({ page }, testInfo) => {
    await test.step('mock the degraded search backend state', async () => {
      await mockSearchEngineDown(page);
    });

    await test.step('open search with the backend unavailable', async () => {
      await page.goto('/search');
    });

    await test.step('verify the warning banner is shown', async () => {
      await expect(page.getByText(/Achtung:/)).toBeVisible();
      await expect(page.getByRole('link', { name: 'GitHub Issues' })).toBeVisible();
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/search-engine-down.png` });
    });
  });
});