import { Page, Route, TestInfo } from '@playwright/test';

type WordDetails = {
  id: number;
  term: string;
  formattedDescription: string;
};

/**
 * Builds a per-test screenshot directory path based on the Playwright test title.
 */
export function getScreenshotDir(testInfo: TestInfo): string {
  return `test-results/${testInfo.title}`;
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