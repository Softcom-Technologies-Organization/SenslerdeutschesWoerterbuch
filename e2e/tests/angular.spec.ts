import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await expect(page).toHaveTitle(/SenslerdeutschesWoerterbuch/);
});


test('search functionality without autocomplete', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  
  /**
   * Search for "wundere" and expect to find the entry "wùndere", which should contain as description visible on the
   * details page "sich wundern, sich fragen"
   * Note: The Autocomplete component from Angular Material defaults to role=combobox. Seems weird, but it is what it is.
   */
  const searchField = page.getByRole('combobox', { name: 'Search...' });
  await expect(searchField).toBeVisible();
  await searchField.fill('wundere');
  await searchField.press('Enter');
  await page.getByRole('link', { name: 'wùndere' }).click();
  await expect(page.getByText('sich wundern, sich fragen')).toBeVisible();
});