import {
  Given,
  When,
  Then,
  After,
  Before,
  BeforeAll,
  AfterAll,
} from "@cucumber/cucumber";
import { expect, chromium, Page, Browser } from "@playwright/test";
import { startTracing, stopTracing } from "../support/hooks";
import { CustomWorld } from "../support/world";

let page: Page;
let browser: Browser;

const world = new CustomWorld();

// Run your test logic...
BeforeAll(async function () {
  // Manually start tracing
  await startTracing(world);
});

Before(async function () {
  // browser = await chromium.launch({ headless: false });
  // const context = await browser.newContext();
  page = world.page;
  // Manually start tracing
  await startTracing(world);
});

Given("I open the login page", async () => {
  await page.goto("https://practicetestautomation.com/practice-test-login/");
});

When(
  "I enter username {string} and password {string}",
  async (username: string, password: string) => {
    await page.fill("#username", username);
    await page.fill("#password", password);
  }
);

When("I click the login button", async () => {
  await page.click("#submit");
});

Then("I should see the welcome message", async () => {
  await page.waitForSelector("text=Logged In Successfully");
  const message = await page.textContent("h1");
  expect(message).toContain("Logged In Successfully");
});

// ✅ Verify URL contains "practicetestautomation.com/logged-in-successfully/"
Then("The URL should contain {string}", async (expectedURL: string) => {
  await page.waitForLoadState("domcontentloaded");
  expect(page.url()).toContain(expectedURL);
});

// ✅ Verify page contains "Congratulations" or "successfully logged in"
Then(
  "The page should contain text {string} or {string}",
  async (text1: string, text2: string) => {
    const pageContent = await page.textContent("body");
    expect(pageContent).toMatch(new RegExp(`${text1}|${text2}`, "i"));
  }
);

// ✅ Verify the Log out button is displayed
Then("The Log out button should be visible", async () => {
  // class = wp-block-button__link has-text-color has-background has-very-dark-gray-background-color
  // console.log("🔎 Checking if the page is loaded...");
  // await page.waitForLoadState("domcontentloaded");

  // console.log("🔎 Checking if the Log out button exists...");
  // const logoutButton = page.getByRole("button", { name: "Log out" });

  // console.log("🔎 Checking if the Log out button is visible...");
  // await expect(logoutButton).toBeVisible();

  // console.log("✅ Log out button is visible!");

  // const logoutButton = page.getByRole("button", { name: "Log out" });
  // await expect(logoutButton).toBeVisible();
  const button = page.locator(".wp-block-button__link");
  await expect(button).toBeVisible();
});

Then("I should see an error message {string}", async (errorMessage: string) => {
  await page.waitForSelector("text=" + errorMessage);
  const errorText = await page.textContent("div#error"); // Adjust selector if needed
  expect(errorText).toContain(errorMessage);
});

// After(async function () {
//   await browser.close();
// });

AfterAll(async function () {
  // Manually stop tracing
  await stopTracing(world);
});
