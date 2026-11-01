/**
 * "Help keep Daily Grace free" (<support-dialog>): how to give, opened from
 * the menu's "Support Daily Grace" and the footer's link. No amount is ever
 * asked for.
 */
import { test, expect } from "@playwright/test";

const dialog = (page) => page.locator("support-dialog dialog");

test.beforeEach(async ({ page }) => {
    await page.route(/dailygrace\.faith\/media\//, (route) => route.fulfill({ status: 404 }));
    await page.addInitScript(() => {
        // An avatar, and today's trivia already shown, so no popup is in the way.
        localStorage.setItem("dailygrace:avatar", "AV-01");
        const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
        localStorage.setItem("dailygrace.trivia", JSON.stringify({ day, count: 99, last: Date.now() }));
    });
    await page.goto("/");
});

test("the menu's Support Daily Grace opens it", async ({ page }) => {
    await page.locator("study-guide-menu").evaluate((menu) => menu.open());
    await page.locator("study-guide-menu").locator('[data-show="support"]').click();
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page).locator("#support-title")).toHaveText("Help keep Daily Grace free");
});

test("the footer's link opens it, with both ways to give", async ({ page }) => {
    const link = page.locator("site-footer .footer-support");
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page).getByRole("link", { name: "Give with PayPal" })).toHaveAttribute(
        "href",
        "https://www.paypal.com/paypalme/edwinvillapando",
    );
    await expect(dialog(page)).toContainText("0998 560 3624");
    await expect(dialog(page)).toContainText("+63 998 560 3624");
    await expect(dialog(page)).toContainText("There is no set amount");
    await expect(dialog(page).locator("cite")).toHaveText("2 Corinthians 9:7 (KJV)");

    await dialog(page).getByRole("button", { name: "Close" }).click();
    await expect(dialog(page)).toBeHidden();
});

test("asks for no amount", async ({ page }) => {
    await page.locator("support-dialog").evaluate((el) => el.open());
    const text = await dialog(page).textContent();
    expect(text).not.toMatch(/₱\s?\d|\$\s?\d|PHP\s?\d/);
});

test("copies the GCash number", async ({ page, browserName, context }) => {
    test.skip(browserName !== "chromium", "only Chromium lets a test read the clipboard");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator("support-dialog").evaluate((el) => el.open());
    const copy = dialog(page).locator("button.copy");
    await expect(copy).toHaveText("Copy the number");
    await copy.click();
    await expect(copy).toHaveText("Copied: open GCash and paste it");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("09985603624");
});
