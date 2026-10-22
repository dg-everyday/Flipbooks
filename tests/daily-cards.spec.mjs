/**
 * The home page's daily cards show one item a day, the same for everyone:
 * Today's Food for Thought, Today's Guiding Question, Jesus' Spoken Words and
 * Following Today's God Blueprint. Within a Manila day a reload shows the same
 * item; the next day shows another; a page left open moves on at midnight.
 */
import { test, expect } from "@playwright/test";

// Each card, and the property that holds the item it shows.
const CARDS = [
    { selector: "daily-food-for-thought", prop: "topic" },
    { selector: "daily-guidance", prop: "topic" },
    { selector: "red-letter-quotes#red-letter", prop: "saying" },
    { selector: "gods-blueprint#gods-blueprint", prop: "item" },
];

// 10 a.m. in Manila on two days in a row.
const DAY_ONE = new Date("2026-10-23T10:00:00+08:00");
const DAY_TWO = new Date("2026-10-24T10:00:00+08:00");

/** The id each card shows, once all of them have loaded. */
async function shownIds(page) {
    const ids = [];
    for (const { selector, prop } of CARDS) {
        const card = page.locator(selector).first();
        // The cards load their file when they come near the screen.
        await card.scrollIntoViewIfNeeded();
        await expect
            .poll(() => card.evaluate((el, p) => el[p]?.id ?? null, prop), {
                timeout: 15_000,
            })
            .not.toBeNull();
        ids.push(await card.evaluate((el, p) => el[p].id, prop));
    }
    return ids;
}

test.describe("daily cards", () => {
    test.skip(({ isMobile }) => isMobile, "one screen is enough for the date logic");

    test("show the same items all day and new ones the next day", async ({ page }) => {
        await page.clock.setFixedTime(DAY_ONE);
        await page.goto("/");
        const first = await shownIds(page);

        await page.reload();
        expect(await shownIds(page)).toEqual(first);

        await page.clock.setFixedTime(DAY_TWO);
        await page.reload();
        const next = await shownIds(page);
        next.forEach((id, i) => {
            expect(id, CARDS[i].selector).not.toBe(first[i]);
        });
    });

    test("move on at midnight on a page left open", async ({ page }) => {
        await page.clock.install({ time: new Date("2026-10-23T23:58:00+08:00") });
        await page.goto("/");
        const before = await shownIds(page);

        // Past midnight; the cards check the date every minute.
        await page.clock.fastForward("05:00");
        for (const [i, { selector, prop }] of CARDS.entries()) {
            const card = page.locator(selector).first();
            await expect
                .poll(() => card.evaluate((el, p) => el[p]?.id, prop))
                .not.toBe(before[i]);
        }
    });
});
