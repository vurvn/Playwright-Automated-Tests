import {
    Given,
    When,
    Then,
    Before,
    BeforeAll,
    AfterAll,
} from '@cucumber/cucumber';
import {expect, Page, Browser, Locator} from '@playwright/test';
import {CustomWorld} from '../support/world';

let page: Page;
let browser: Browser;
const world = new CustomWorld();

// Reusable locators following Playwright best practices
const getLocators = (page: Page) => ({
    usernameInput: page.getByLabel('Username', {exact: true}),
    passwordInput: page.getByLabel('Password', {exact: true}),
    submitButton: page.getByRole('button', {name: 'Submit'}),
    logoutLink: page.getByRole('link', {name: 'Log out'}),
    errorMessage: page.locator('#error'),
    successHeading: page.getByRole('heading', {name: 'Logged In Successfully'}),
    testLoginHeading: page.getByRole('heading', {name: 'Test login'}),
});

BeforeAll(async function () {
    await world.setup();
});

Before(async function () {
    page = world.page;
});

Given('I open the login page', async () => {
    const locators = getLocators(page);

    await page.goto('https://practicetestautomation.com/practice-test-login/', {
        waitUntil: 'networkidle',
    });

    // Verify the login form is loaded
    await expect(locators.testLoginHeading).toBeVisible();
});

When(
    'I enter username {string} and password {string}',
    async (username: string, password: string) => {
        const locators = getLocators(page);

        await locators.usernameInput.fill(username);
        await locators.passwordInput.fill(password);
    }
);

When('I click the login button', async () => {
    const locators = getLocators(page);

    // Wait for navigation and network idle
    await Promise.all([
        page.waitForLoadState('networkidle'),
        locators.submitButton.click(),
    ]);
});

Then('I should see the welcome message', async () => {
    const locators = getLocators(page);

    // Web-first assertion
    await expect(locators.successHeading).toBeVisible();
});

Then('The URL should contain {string}', async (expectedURL: string) => {
    // Web-first URL assertion
    await expect(page).toHaveURL(new RegExp(expectedURL));
});

Then(
    'The page should contain text {string} or {string}',
    async (text1: string, text2: string) => {
        const pattern = new RegExp(`${text1}|${text2}`, 'i');
        // Web-first text assertion
        await expect(page.getByText(pattern)).toBeVisible();
    }
);

Then('The Log out button should be visible', async () => {
    const locators = getLocators(page);

    // Web-first assertion for logout button
    await expect(locators.logoutLink).toBeVisible();
});

Then('I should see an error message {string}', async (errorMessage: string) => {
    const locators = getLocators(page);

    // Web-first assertion for error message
    await expect(locators.errorMessage).toContainText(errorMessage);
});

AfterAll(async function () {
    await world.teardown();
});
