/**
 * The memory verse's daily step (apps/components/memory-verse.js): one step
 * on for each day practised this week, and, once begun, one more for each day
 * missed (up to two), so five days practised in any week reach "Say it",
 * while a reader who comes every day takes all seven steps. The week of
 * November 1 to 7, 2026 (Manila) is used.
 */
import { test, expect } from "@playwright/test";

const at = (iso) => new Date(`${iso}T09:00:00+08:00`);
const WEEK = "2026-11-01";

/** The step today's practice opens on ("Day n/7"), with these days practised. */
async function stepOn(page, today, practised) {
    await page.clock.setFixedTime(at(today));
    await page.addInitScript(
        ([week, days]) => {
            localStorage.setItem("dailygrace:avatar", "AV-01");
            const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
            localStorage.setItem("dailygrace.trivia", JSON.stringify({ day, count: 99, last: Date.now() }));
            localStorage.setItem("dailygrace:memory:progress", JSON.stringify({ [week]: days }));
        },
        [WEEK, practised],
    );
    await page.goto("/");
    const verse = page.locator("#memory-verse");
    await expect(verse).toBeVisible({ timeout: 15_000 });
    await page.evaluate(() => document.getElementById("memory-verse").open());
    const count = verse.locator(".count");
    await expect(count).toBeVisible();
    return count.textContent();
}

test.describe("the memory verse's step", () => {
    test.skip(({ isMobile }) => isMobile, "the same on every screen");

    test("a reader who comes every day takes every step", async ({ page }) => {
        expect(await stepOn(page, "2026-11-06", ["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05"])).toBe("Day 6/7");
    });

    test("five days practised with two missed reach Say it on Saturday", async ({ page }) => {
        // Missed Monday and Friday.
        expect(await stepOn(page, "2026-11-07", ["2026-11-01", "2026-11-03", "2026-11-04", "2026-11-05"])).toBe("Day 7/7");
    });

    test("a start after Sunday begins at the beginning, then catches up", async ({ page }) => {
        expect(await stepOn(page, "2026-11-03", [])).toBe("Day 1/7");
    });

    test("begun on Tuesday, Wednesday's step makes up for Sunday and Monday", async ({ page }) => {
        expect(await stepOn(page, "2026-11-04", ["2026-11-03"])).toBe("Day 4/7");
    });

    test("no more than two missed days are made up", async ({ page }) => {
        // Practised only Sunday; Saturday: 1 step on, 2 made up (of 5 missed).
        expect(await stepOn(page, "2026-11-07", ["2026-11-01"])).toBe("Day 4/7");
    });
});
