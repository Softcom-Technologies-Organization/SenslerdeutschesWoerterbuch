import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, ".env") });

function getHostname(value: string): string {
  try {
    return new URL(value).hostname;
  } catch {
    return value;
  }
}

// Determine execution environment
const IS_DOCKER = process.env.IS_DOCKER === "true";
let frontendUrl = "http://localhost:4200";
if (IS_DOCKER) {
  // Now process.env.FRONTEND_DOMAIN is "frontend.localhost"
  frontendUrl = process.env.FRONTEND_DOMAIN ?? "http://traefik";
}
const dockerResolvedHosts = Array.from(
  new Set(
    [process.env.FRONTEND_DOMAIN, process.env.BACKEND_BASE_URL]
      .filter((value): value is string => Boolean(value))
      .map(getHostname)
      .filter(hostname => hostname !== 'traefik')
  )
);
const IS_CI = !!process.env.CI;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR ?? 'test-results',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      "html",
      {
        host: "0.0.0.0",
        port: 9323,
        outputFolder: process.env.PLAYWRIGHT_HTML_DIR ?? 'playwright-report'
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: frontendUrl,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: IS_DOCKER && dockerResolvedHosts.length > 0
            ? [
                `--host-resolver-rules=${dockerResolvedHosts.map(hostname => `MAP ${hostname} traefik`).join(',')}`,
              ]
            : [],
        },
      },
    },
  ],
});
