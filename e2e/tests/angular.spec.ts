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