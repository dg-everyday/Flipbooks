/**
 * Every reader chooses an avatar. On the home page, a reader without one gets
 * the avatar picker, which cannot be closed until they choose, and no Bible
 * trivia that visit. The chosen avatar replaces the DG emblem at the top, is
 * remembered, and can be changed from the DG menu.
 */
import { test, expect } from "@playwright/test";

const picker = (page) => page.locator("avatar-picker dialog");
const triviaOpen = (page) =>
    page.evaluate(
        () => document.querySelector("bible-trivia")?.shadowRoot?.querySelector("dialog")?.open ?? false,
    );

test.describe("avatars", () => {
    test.skip(({ isMobile }) => isMobile, "one screen is enough for the flow");

    test("a new reader must choose an avatar, and gets no trivia meanwhile", async ({ page }) => {
        await page.goto("/");
        await expect(picker(page)).toBeVisible();
        await expect(page.locator("avatar-picker .close")).toBeHidden();

        // Neither Escape nor a tap outside closes it.
        await page.keyboard.press("Escape");
        await page.mouse.click(5, 5);
        await expect(picker(page)).toBeVisible();

        // The trivia would have opened 800 ms after load.
        await page.waitForLoadState("load");
        await page.waitForTimeout(2500);
        expect(await triviaOpen(page)).toBe(false);

        // Choosing: the button names the hero, then the picker closes.
        const choose = page.locator("avatar-picker .choose");
        await expect(choose).toBeDisabled();
        await page.locator('avatar-picker .hero[data-id="AV-01"]').click();
        await expect(choose).toHaveText("Choose Noah");
        await choose.click();
        await expect(picker(page)).toBeHidden();

        const icon = page.locator("#dg-open-icon");
        await expect(icon).toHaveAttribute("src", /images\/avatars\/adults\/AV-01-noah-128\.webp$/);
        expect(await page.evaluate(() => localStorage.getItem("dailygrace:avatar"))).toBe("AV-01");

        // Remembered: no picker next time, and the avatar shows at once.
        await page.reload();
        await expect(icon).toHaveAttribute("src", /AV-01-noah-128\.webp$/);
        await expect(picker(page)).toBeHidden();
    });

    test("a reader with an avatar still gets the trivia", async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem("dailygrace:avatar", "AV-01"));
        await page.goto("/");
        await expect.poll(() => triviaOpen(page), { timeout: 15_000 }).toBe(true);
        await expect(picker(page)).toBeHidden();
    });

    test("the avatar can be changed from the DG menu", async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem("dailygrace:avatar", "AV-01");
            // Today's trivia already shown, so it does not get in the way.
            const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
            localStorage.setItem("dailygrace.trivia", JSON.stringify({ day, count: 99, last: Date.now() }));
        });
        await page.goto("/");
        await page.locator("#dg-open").click();
        await page.locator('dg-menu [data-action="avatar"]').click();
        await expect(picker(page)).toBeVisible();
        await expect(page.locator("avatar-picker .eyebrow")).toHaveText("My avatar");
        await expect(page.locator('avatar-picker .hero[data-id="AV-01"]')).toHaveAttribute("aria-pressed", "true");

        // It can be closed without changing anything.
        await page.keyboard.press("Escape");
        await expect(picker(page)).toBeHidden();

        await page.locator("#dg-open").click();
        await page.locator('dg-menu [data-action="avatar"]').click();
        await page.locator('avatar-picker .hero[data-id="AV-02"]').click();
        await page.locator("avatar-picker .choose").click();
        await expect(page.locator("#dg-open-icon")).toHaveAttribute("src", /AV-02-abraham-128\.webp$/);
    });
});
