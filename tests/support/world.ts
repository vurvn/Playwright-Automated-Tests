import { setWorldConstructor, World } from "@cucumber/cucumber";
import { chromium, BrowserContext, Page } from "@playwright/test";

export class CustomWorld extends World {
  page!: Page;
  context!: BrowserContext;
  browser: any;

  constructor(options: any = {}) {
    super(options);
  }

  async setup() {
    // Launch browser
    const browser = await chromium.launch({ headless: false });
    this.context = await browser.newContext();
    this.page = await this.context.newPage();

    // ✅ Start tracing (for each scenario)
    await this.context.tracing.start({
      screenshots: true, // Captures screenshots at key events
      snapshots: true, // Captures DOM snapshots
    });
  }

  async teardown() {
    if (this.context) {
      console.log("🛑 Stopping trace before teardown...");
      await this.context.tracing.stop({ path: `trace-${Date.now()}.zip` });
    }

    if (this.browser) {
      console.log("🔄 Closing browser in teardown...");
      await this.browser.close();
    }
  }
}

setWorldConstructor(CustomWorld);
