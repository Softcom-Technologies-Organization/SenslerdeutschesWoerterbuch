import { expect, Page, Route, TestInfo } from '@playwright/test';

type WordDetails = {
  id: number;
  term: string;
  formattedDescription: string;
};

const backendBaseUrl = process.env.BACKEND_BASE_URL ?? 'http://backend.localhost';
const backendAdminUsername = process.env.DJANGO_SUPERUSER_USERNAME ?? 'admin';
const backendAdminPassword = process.env.DJANGO_SUPERUSER_PASSWORD ?? 'ChangeMeInProduction!';

/**
 * Builds a per-test screenshot directory path based on the Playwright test title.
 */
export function getScreenshotDir(testInfo: TestInfo): string {
  return `test-results/${testInfo.title}`;
}

/**
 * Builds an absolute backend URL from a backend-relative pathname.
 */
export function getBackendUrl(pathname: string): string {
  return new URL(pathname, backendBaseUrl).toString();
}

/**
 * Returns the configured Django superuser username for backend admin tests.
 */
export function getBackendAdminUsername(): string {
  return backendAdminUsername;
}

/**
 * Signs into Django admin using the configured superuser credentials.
 */
export async function loginToBackendAdmin(page: Page) {
  await page.goto(getBackendUrl('/admin'));

  await expect(page).toHaveURL(hasPathname('/admin/login/'));
  await page.getByLabel('Username').fill(backendAdminUsername);
  await page.getByLabel('Password').fill(backendAdminPassword);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(hasPathname('/admin/'));
}

/**
 * Builds a Playwright URL predicate that matches an exact pathname without using a regex.
 */
export function hasPathname(pathname: string) {
  return (url: URL): boolean => url.pathname === pathname;
}

/**
 * Mocks the search page bootstrap requests, including tag loading, search backend status,
 * and a deterministic query response for the known test word.
 */
export async function mockSearchBootstrap(page: Page) {
  await page.route('**/api/dictionary/search/tags', async (route: Route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route('**/api/dictionary/search/status', async (route: Route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ status: 'available', indexExists: true, docCount: 1 }),
    });
  });

  await page.route('**/api/dictionary/search/query**', async (route: Route) => {
    const requestUrl = new URL(route.request().url());
    const term = requestUrl.searchParams.get('term') ?? '';

    if (term === 'beckertrǜtscha') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          hits: {
            total: { value: 1 },
            hits: [
              {
                _id: '4242',
                _source: {
                  id: 4242,
                  term: 'Becker·trǜtscha',
                  description: 'vom Bäcker hergestellter Zopf',
                  tags: [],
                },
              },
            ],
          },
        }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        hits: {
          total: { value: 0 },
          hits: [],
        },
      }),
    });
  });
}

/**
 * Mocks the word detail endpoint for a specific dictionary entry.
 */
export async function mockWordDetails(page: Page, word: WordDetails) {
  await page.route(`**/api/dictionary/word/${word.id}/`, async (route: Route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        id: word.id,
        term: word.term,
        'formatted-description': word.formattedDescription,
      }),
    });
  });
}

/**
 * Mocks the search page bootstrap requests to simulate an unavailable search backend.
 */
export async function mockSearchEngineDown(page: Page) {
  await page.route('**/api/dictionary/search/tags', async (route: Route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.route('**/api/dictionary/search/status', async (route: Route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'unavailable' }),
    });
  });

  await page.route('**/api/dictionary/search/query**', async (route: Route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        hits: {
          total: { value: 0 },
          hits: [],
        },
      }),
    });
  });
}