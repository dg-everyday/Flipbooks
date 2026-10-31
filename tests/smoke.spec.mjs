/**
 * Smoke tests: the main pages open without script errors. Pictures, audio and
 * fonts from the media host or a CDN may fail offline; those are not counted,
 * only errors thrown by the page's own scripts.
 */
import { test, expect } from "@playwright/test";

const PAGES = [
    { path: "/", title: /Grace for Today/ },
    { path: "/apps/pages/stickers.html" },
    { path: "/apps/pages/stories.html" },
    { path: "/apps/pages/daily-grace-kids.html", title: "Daily Grace Kids" },
    { path: "/apps/pages/flipbook.html" },
    { path: "/apps/pages/library.html", title: "Daily Grace Archives" },
];

for (const { path, title } of PAGES) {
    test(`${path} opens without script errors`, async ({ page }) => {
        const errors = [];
        page.on("pageerror", (error) => {
            errors.push(error.message);
        });
        const response = await page.goto(path, { waitUntil: "domcontentloaded" });
        expect(response?.status()).toBe(200);
        if (title) {
            await expect(page).toHaveTitle(title);
        }
        // Wait for the network to go quiet rather than for "load": WebKit on
        // Windows never fires "load" on the stories and flipbook pages, though
        // nothing is left loading.
        await page.waitForLoadState("networkidle");
        expect(errors).toEqual([]);
    });
}
