import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const isRemote = Boolean(process.env.E2E_BASE_URL);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["line"]] : "line",
  use: {
    baseURL,
    trace: "on-first-retry",
    // The wizard tests exercise logic, not WebGL: reduced motion makes the scene render its
    // static fallback, which keeps headless runs fast and deterministic. scene.spec.ts opts out.
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: isRemote
    ? undefined
    : {
        command: "pnpm dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
