import { Before, After } from "@cucumber/cucumber";
import { CustomWorld } from "./world";
/**
 * Function to start tracing before each test scenario
 */
export async function startTracing(world: CustomWorld) {
  console.log("⏳ Starting test and enabling tracing...");
  await world.setup();
}

/**
 * Function to stop tracing and save the trace file after each test scenario
 */
export async function stopTracing(world: CustomWorld) {
  console.log("🛑 Stopping test and saving trace file...");
  await world.teardown();
}

// Hook: Runs before each scenario
Before(async function (this: CustomWorld) {
  await this.setup();
  await this.context.tracing.start({ screenshots: true, snapshots: true });
});

// Hook: Runs after each scenario
After(async function (this: CustomWorld) {
  if (this.context) {
    console.log("🛑 Stopping trace before closing context...");
    await this.context.tracing.stop({ path: `trace-${Date.now()}.zip` });
  }

  if (this.browser) {
    console.log("🔄 Closing browser...");
    await this.browser.close();
  }
});

Before(async function (this: CustomWorld) {
  console.log("⏳ Starting test and enabling tracing...");
  await this.setup();
});

After(async function (this: CustomWorld) {
  console.log("🛑 Stopping test and saving trace file...");
  await this.teardown();
});
