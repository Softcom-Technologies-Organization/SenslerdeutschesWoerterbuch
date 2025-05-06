import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/SenslerdeutschesWoerterbuch/);
});

test('search functionality without autocomplete', async ({ page }) => {
  // Increase timeout for GitHub Actions
  test.setTimeout(60000);

  await page.goto('/');
  await page.screenshot({ path: `test-results/landing.png` });
  
  /**
   * Search for "beckertrütscha" and expect to find the entry "Becker·trǜtscha", which should contain as description visible on the
   * details page "vom Bäcker hergestellter Zopf"
   * Note: The Autocomplete component from Angular Material defaults to role=combobox. Seems weird, but it is what it is.
   */
  const searchField = page.getByRole('textbox', { name: 'Suechi' })
  await expect(searchField).toBeVisible();
  await searchField.fill('beckertrütscha');
  await page.screenshot({ path: `test-results/suggestions.png` });
  await searchField.press('Enter');
  await expect(page.getByRole('link', { name: 'Becker·trǜtscha' })).toBeVisible();
  await page.screenshot({ path: `test-results/results.png` });
  await page.getByRole('link', { name: 'Becker·trǜtscha' }).click();
  await page.screenshot({ path: `test-results/details.png` });
  await expect(page.getByText('vom Bäcker hergestellter Zopf')).toBeVisible();
});

test('navigate to Info page via toolbar', async ({ page }) => {
  await page.goto('/');

  // Find and click the "Infos" button in the toolbar
  const infoButton = page.locator('mat-toolbar').getByRole('link', { name: 'Infos' });
  await expect(infoButton).toBeVisible();
  await infoButton.click();

  // Verify the URL changed to /about
  await expect(page).toHaveURL(/.*\/about/);

  // Verify some content specific to the Info page is visible
  // (Adjust the selector based on your actual Info page content)
  await expect(page.getByRole('heading', { name: 'Über das Projekt' })).toBeVisible();
  await page.screenshot({ path: `test-results/info-page.png` });
});

test('navigate to Feedback page via toolbar', async ({ page }) => {
  await page.goto('/');

  // Find and click the "Fragen?" button in the toolbar
  const feedbackButton = page.locator('mat-toolbar').getByRole('link', { name: 'Fragen?' });
  await expect(feedbackButton).toBeVisible();
  await feedbackButton.click();

  // Verify the URL changed to /feedback
  await expect(page).toHaveURL(/.*\/feedback/);

  // Verify some content specific to the Feedback page is visible
  // (Adjust the selector based on your actual Feedback page content)
  await expect(page.getByRole('heading', { name: 'Fragen, Hinweise oder Verbesserungsvorschläge?' })).toBeVisible(); // Assuming a heading exists
  await page.screenshot({ path: `test-results/feedback-page.png` });
});

test('navigate to Info page and back to Home/Search via toolbar icon', async ({ page }) => {
  await page.goto('/');

  // Navigate to Info page first
  const infoButton = page.locator('mat-toolbar').getByRole('link', { name: 'Infos' });
  await expect(infoButton).toBeVisible();
  await infoButton.click();
  await expect(page).toHaveURL(/.*\/about/);

  // Find and click the logo/icon link in the toolbar
  const logoLink = page.locator('mat-toolbar').getByRole('link', { name: 'Senslerdeutsches Wörterbuch' });
  await expect(logoLink).toBeVisible();
  await logoLink.click();

  // Verify the URL changed back to the root or search page
  // Depending on your routing, it might be '/' or '/search'
  await expect(page).toHaveURL(/.*\/search/); // Or use /.*\/search/ if it redirects

  // Verify that the search input field is visible again, confirming landing/search page
  const searchField = page.getByRole('textbox', { name: 'Suechi' });
  await expect(searchField).toBeVisible();
  await page.screenshot({ path: `test-results/back-to-home.png` });
});