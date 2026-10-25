/**
 * The KJV notes of the Daily Grace Kids flipbooks: on a page whose picture
 * puts God's, Jesus' or an angel's words simply, the story reader shows a
 * "KJV" button with the same words in the King James Bible, word for word
 * from the KJV database, the spoken words marked. Pages without such words
 * show no button; on a wide screen, the two pages on show are both covered.
 */
import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { expectNoErrors, stubMedia, watchErrors } from "./kids-helpers.mjs";

const story = (id) => JSON.parse(readFileSync(new URL(`../assets/kids/stories/${id}.json`, import.meta.url), "utf8"));
const reader = (id) => `/apps/pages/stories.html?set=kids&story=${id}`;
// The story reader never fires "load" in WebKit (Safari's engine), even before
// these notes: the page works, so the tests wait for the page to be parsed.

/**
 * Turns the reader to page `n` (0 is the cover), or to the spread holding it,
 * waiting out each page-turn animation before the next.
 */
async function turnTo(page, n) {
    await page.locator("flip-book").evaluate(async (book, target) => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));
        while (book.pageCount === 0) {
            await wait(50);
        }
        for (let tries = 0; book.page < target && tries < 60; tries += 1) {
            const before = book.page;
            book.next();
            for (let t = 0; t < 40 && book.page === before; t += 1) {
                await wait(50);
            }
            // A spread moves two pages at a time: stop on the one holding it.
            if (book.page + 1 === target && book.page !== before && !matchMedia("(max-width: 600px), (orientation: portrait)").matches) {
                break;
            }
        }
    }, n);
}

test.beforeEach(async ({ page }) => {
    await stubMedia(page);
});

test("every note in the stories is the whole KJV verse, with its quote inside it", () => {
    test.skip(test.info().project.name !== "desktop", "data only: runs once");
    const ids = JSON.parse(readFileSync(new URL("../assets/kids-stories.json", import.meta.url), "utf8")).map((s) => s.id);
    let notes = 0;
    for (const id of ids) {
        for (const p of story(id).pages) {
            for (const note of p.kjv ?? []) {
                notes += 1;
                expect(note.text, `${id} ${note.ref}`).toContain(note.quote);
                expect(note.ref, id).toMatch(/^[1-3]?\s?[A-Za-z]+ \d+:\d+(-\d+)?$/);
                expect(note.who, id).toBeTruthy();
            }
        }
    }
    expect(notes).toBe(53);
});

test("a page where Jesus speaks has the KJV button; a page where he does not has none", async ({ page }) => {
    test.skip(test.info().project.name !== "ipad", "one upright tablet: one page at a time");
    const errors = watchErrors(page);
    await page.goto(reader("forbid-them-not"), { waitUntil: "domcontentloaded" });
    await expect(page.locator("flip-book")).toBeVisible();
    const button = page.locator(".kjv-btn");
    // The cover and the first pages: no words of Jesus.
    await expect(button).toBeHidden();
    await turnTo(page, 3);
    await expect(button).toBeHidden();
    // Page 5: "God's kingdom belongs to people like these children."
    await turnTo(page, 5);
    await expect(button).toBeVisible();
    await button.click();
    const dialog = page.locator("dialog.kjv-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".kjv-who")).toHaveText("Jesus");
    await expect(dialog.locator(".kjv-ref")).toHaveText("Mark 10:14");
    await expect(dialog.locator(".kjv-verse strong")).toHaveText("for of such is the kingdom of God.");
    await expect(dialog.locator(".kjv-verse")).toContainText("Suffer the little children to come unto me");
    await dialog.locator(".kjv-close").click();
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
    // Turning the page while it is open closes it.
    await button.click();
    await page.locator("flip-book").evaluate((book) => book.next());
    await expect(dialog).toBeHidden();
    expectNoErrors(errors);
});

test("stories without words of God, Jesus or an angel have no KJV button at all", async ({ page }) => {
    test.skip(test.info().project.name !== "ipad", "one upright tablet");
    await page.goto(reader("and-ruth-with-her"), { waitUntil: "domcontentloaded" });
    await expect(page.locator("flip-book")).toBeVisible();
    await turnTo(page, 6);
    await expect(page.locator(".kjv-btn")).toHaveCount(0);
});

test("on a wide screen, the notes of both pages on show are offered, each verse once", async ({ page }) => {
    test.skip(test.info().project.name !== "desktop", "a landscape screen shows two pages");
    await page.goto(reader("help-thou-mine-unbelief"), { waitUntil: "domcontentloaded" });
    await expect(page.locator("flip-book")).toBeVisible();
    // Page 6 (two notes) shares its spread with page 5 (one note).
    await turnTo(page, 6);
    const shown = await page.locator("flip-book").evaluate((book) => book.page);
    const pages = story("help-thou-mine-unbelief").pages;
    const expected = [...(pages[shown].kjv ?? []), ...(pages[shown + 1]?.kjv ?? [])].map((n) => n.ref);
    expect(expected.length).toBeGreaterThan(1);
    await page.locator(".kjv-btn").click();
    const refs = await page.locator("dialog.kjv-dialog .kjv-ref").allTextContents();
    expect(refs).toEqual(expected);
});

test("the grown-up stories (no KJV notes) are unchanged", async ({ page }) => {
    test.skip(test.info().project.name !== "desktop", "runs once");
    await page.goto("/apps/pages/stories.html?story=into-his-hand", { waitUntil: "domcontentloaded" });
    await expect(page.locator("flip-book")).toBeVisible();
    await expect(page.locator(".kjv-btn")).toHaveCount(0);
});
