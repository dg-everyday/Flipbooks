/**
 * Playwright tests for Daily Grace. Run with `npm test`, or `npm run test:ui`
 * to watch them in a window. The tests run against tests/serve.mjs, a local
 * copy of the site on five screens. The tablets, held upright, come first: they
 * are the recommended device for Daily Grace Kids; the rest of the site must
 * still work on phones and computers.
 */
import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

export default defineConfig({
    testDir: "tests",
    timeout: 30_000,
    fullyParallel: true,
    reporter: [["list"], ["html", { open: "never" }]],
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        timezoneId: "Asia/Manila",
    },
    projects: [
        { name: "ipad", use: { ...devices["iPad (gen 7)"] } },
        { name: "android-tablet", use: { ...devices["Galaxy Tab S4"] } },
        { name: "desktop", use: { ...devices["Desktop Chrome"] } },
        { name: "android", use: { ...devices["Pixel 7"] } },
        { name: "iphone", use: { ...devices["iPhone 15"] } },
    ],
    webServer: {
        command: "node tests/serve.mjs",
        url: `http://localhost:${PORT}/`,
        reuseExistingServer: true,
        env: { PORT: String(PORT) },
    },
});
