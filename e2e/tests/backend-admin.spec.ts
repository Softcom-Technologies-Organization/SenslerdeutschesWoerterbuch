import { test, expect } from '@playwright/test';
import { getBackendUrl, getScreenshotDir, hasPathname, loginToBackendAdmin } from './helpers';

test.describe('backend admin', () => {
  test('backend admin login screen is accessible', async ({ page }, testInfo) => {
    await test.step('open the backend admin entry point', async () => {
      await page.goto(getBackendUrl('/admin'));
    });

    await test.step('verify the login screen is rendered', async () => {
      await expect(page).toHaveURL(hasPathname('/admin/login/'));
      await expect(page.getByLabel('Username')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/backend-admin-login.png` });
    });
  });

  test('backend admin login succeeds with configured superuser', async ({ page }, testInfo) => {
    await test.step('sign into Django admin', async () => {
      await loginToBackendAdmin(page);
    });

    await test.step('verify the admin index is available', async () => {
      await expect(page.getByRole('link', { name: 'Words' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Tags' })).toBeVisible();
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/backend-admin-index.png` });
    });
  });

  test('backend admin logout returns to the login screen', async ({ page }, testInfo) => {
    await test.step('sign into Django admin', async () => {
      await loginToBackendAdmin(page);
    });

    await test.step('log out from the admin session', async () => {
      await page.getByText('Log out').click();
    });

    await test.step('verify the logged out screen is rendered', async () => {
      await expect(page).toHaveURL(hasPathname('/admin/logout/'));
      await expect(page.getByText('Logged out')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Log in again' })).toBeVisible();
      await page.screenshot({ path: `${getScreenshotDir(testInfo)}/backend-admin-logout.png` });
    });
  });
});