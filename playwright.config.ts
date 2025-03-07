import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  testDir: "./tests", // Directory containing test files

  /* Enable parallel test execution */
  fullyParallel: true,

  /* Fail the build if 'test.only' is left in the code (useful for CI) */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests only on CI */
  retries: process.env.CI ? 2 : 0,

  /* Limit workers in CI to prevent overloading */
  workers: process.env.CI ? 1 : undefined,

  /* Test report configuration */
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "playwright-report/results.json" }],
  ],

  /* Global test settings */
  use: {
    /* Base URL for testing (set in .env or default to localhost) */
    baseURL: process.env.BASE_URL || "http://127.0.0.1:3000",

    /* Capture traces for debugging failures */
    trace: "on-first-retry",

    /* Screenshot on failure */
    screenshot: "only-on-failure",

    /* Video recording (disabled by default, enable if needed) */
    video: process.env.CI ? "retain-on-failure" : "off",

    /* Headless mode (can be controlled via environment variables) */
    headless: process.env.HEADLESS === "true",
  },

  /* Configure testing across different browsers */
  projects: [
    {
      name: "chromium", // npx playwright test --project=chromium //Runs tests only in Chromium
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  /* Output directory for test artifacts */
  outputDir: "test-results",

  /* Global timeout for each test */
  timeout: 60000, // 60 seconds per test
});
