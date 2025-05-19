import {setWorldConstructor, World} from '@cucumber/cucumber';
import {chromium, BrowserContext, Page, Browser} from '@playwright/test';
import path from 'path';

export class CustomWorld extends World {
    page!: Page;
    context!: BrowserContext;
    browser!: Browser;
    testName?: string;

    constructor(options: any = {}) {
        super(options);
        // Store test name for trace files
        this.testName = options?.pickle?.name;
    }

    async setup() {
        // Launch browser with proper configuration
        this.browser = await chromium.launch({
            // Use environment variable to control headless mode
            headless: process.env.HEADLESS !== 'false',
        });

        // Create context with proper viewport and permissions
        this.context = await this.browser.newContext({
            viewport: {width: 1280, height: 720},
            acceptDownloads: true,
            recordVideo: {
                dir: 'test-results/videos',
                size: {width: 1280, height: 720},
            },
        });

        // Create page and set default timeout
        this.page = await this.context.newPage();
        this.page.setDefaultTimeout(5000);

        // Start tracing with enhanced options
        await this.context.tracing.start({
            screenshots: true,
            snapshots: true,
            sources: true,
            title: this.testName || 'Unnamed Test',
        });

        // Listen for console errors
        this.page.on('console', (msg) => {
            if (msg.type() === 'error') {
                console.error(`Browser Console Error: ${msg.text()}`);
            }
        });

        // Listen for uncaught errors
        this.page.on('pageerror', (error) => {
            console.error(`Uncaught Error: ${error.message}`);
        });
    }

    async teardown() {
        if (this.context) {
            // Save trace with meaningful name
            // const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const timestamp = new Date()
                .toLocaleString('en-GB', {
                    timeZone: 'Asia/Bangkok',
                    hour12: false,
                })
                .replace(/[/:, ]/g, '-');
            const tracePath = path.join(
                process.cwd(),
                'test-results/traces',
                `${this.testName || 'unnamed'}-${timestamp}.zip`
            );

            await this.context.tracing.stop({
                path: tracePath,
            });

            console.log(`✅ Trace saved to: ${tracePath}`);
            await this.context.close();
        }

        if (this.browser) {
            await this.browser.close();
            console.log('🔄 Browser closed successfully');
        }
    }
}

setWorldConstructor(CustomWorld);
