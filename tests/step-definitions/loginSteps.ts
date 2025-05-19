import {
    Given,
    When,
    Then,
    Before,
    BeforeAll,
    AfterAll,
    defineParameterType,
} from '@cucumber/cucumber';
import {expect, Page} from '@playwright/test';
import {CustomWorld} from '../support/world';

// Define custom parameter types for better readability and reuse
defineParameterType({
    name: 'credential_type',
    regexp: /username|password/,
    transformer(value) {
        return value;
    },
});

defineParameterType({
    name: 'validation_state',
    regexp: /valid|invalid|empty|special characters/,
    transformer(value) {
        return value;
    },
});

// Page object model for login page
class LoginPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Locators using Playwright's recommended role-based and label-based selectors
    get usernameInput() {
        return this.page.getByLabel('Username', {exact: true});
    }
    get passwordInput() {
        return this.page.getByLabel('Password', {exact: true});
    }
    get submitButton() {
        return this.page.getByRole('button', {name: 'Submit'});
    }
    get logoutLink() {
        return this.page.getByRole('link', {name: 'Log out'});
    }
    get errorMessage() {
        return this.page.locator('#error');
    }
    get successHeading() {
        return this.page.getByRole('heading', {name: 'Logged In Successfully'});
    }
    get testLoginHeading() {
        return this.page.getByRole('heading', {name: 'Test login'});
    }

    // Page actions
    async navigateToLoginPage() {
        await this.page.goto(
            'https://practicetestautomation.com/practice-test-login/',
            {
                waitUntil: 'networkidle',
            }
        );
        await expect(this.testLoginHeading).toBeVisible();
    }

    async enterCredential(type: string, value: string) {
        const input =
            type === 'username' ? this.usernameInput : this.passwordInput;
        await input.fill(value);
    }

    async submitForm() {
        await Promise.all([
            this.page.waitForLoadState('networkidle'),
            this.submitButton.click(),
        ]);
    }

    async expectSuccessMessage() {
        await expect(this.successHeading).toBeVisible();
    }

    async expectErrorMessage(message: string) {
        await expect(this.errorMessage).toContainText(message);
    }

    async expectRedirection(urlPattern: string) {
        await expect(this.page).toHaveURL(new RegExp(urlPattern));
    }
}

// Test context
let world: CustomWorld;
let page: Page;
let loginPage: LoginPage;

// Hooks for setup and teardown
BeforeAll(async function () {
    world = new CustomWorld();
    world.testName = 'Login_Test';
    await world.setup();
});

Before(async function () {
    page = world.page;
    loginPage = new LoginPage(page);
});

AfterAll(async function () {
    await world.teardown();
});

// Step definitions
Given('I am on the login page', async function () {
    try {
        await loginPage.navigateToLoginPage();
    } catch (error: any) {
        throw new Error(`Failed to load login page: ${error.message}`);
    }
});

When(
    'I enter {validation_state} {credential_type} {string}',
    async function (state: string, type: string, value: string) {
        await loginPage.enterCredential(type, value);
    }
);

When(
    'I enter {string} {credential_type} {string}',
    async function (state: string, type: string, value: string) {
        await loginPage.enterCredential(type, value);
    }
);

When('I submit the login form', async function () {
    await loginPage.submitForm();
});

Then('I should see a success message', async function () {
    await loginPage.expectSuccessMessage();
});

Then('I should be redirected to {string}', async function (urlPattern: string) {
    await loginPage.expectRedirection(urlPattern);
});

Then(
    'the page should display {string} or {string}',
    async function (text1: string, text2: string) {
        const pattern = new RegExp(`${text1}|${text2}`, 'i');
        await expect(page.getByText(pattern)).toBeVisible();
    }
);

Then('the logout option should be available', async function () {
    await expect(loginPage.logoutLink).toBeVisible();
});

Then(
    'I should see an error indicating {string}',
    async function (errorMessage: string) {
        await loginPage.expectErrorMessage(errorMessage);
    }
);
