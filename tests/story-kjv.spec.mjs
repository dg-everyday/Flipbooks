/**
 * The KJV notes of the Daily Grace Kids flipbooks: on a page whose picture
 * puts God's, Jesus' or an angel's words simply, the story reader draws a
 * small "KJV" pill at the page's top right; it opens the same words in the
 * King James Bible, word for word from the KJV database, the spoken words
 * marked. Pages without such words have none; on a wide screen, each page of
 * the spread has its own.
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

/** The KJV pills on show: one on each page in view that has notes. */
const pills = (page) => page.locator("flip-book .page-action").filter({ visible: true });

test("a page where Jesus speaks wears a KJV pill at its top right; a page where he does not has none", async ({ page }) => {
    test.skip(test.info().project.name !== "ipad", "one upright tablet: one page at a time");
    const errors = watchErrors(page);
    await page.goto(reader("forbid-them-not"), { waitUntil: "domcontentloaded" });
    await expect(page.locator("flip-book")).toBeVisible();
    // The cover and the first pages: no words of Jesus.
    await expect(pills(page)).toHaveCount(0);
    await turnTo(page, 3);
    await expect(pills(page)).toHaveCount(0);
    // Page 5: "God's kingdom belongs to people like these children."
    await turnTo(page, 5);
    const pill = pills(page);
    await expect(pill).toHaveCount(1);
    await expect(pill).toHaveText("KJV");
    // White on red, small, in the top right corner of the page's picture.
    const look = await pill.evaluate((b) => { const s = getComputedStyle(b); return { color: s.color, background: s.backgroundColor, height: b.offsetHeight }; });
    expect(look).toEqual({ color: "rgb(255, 255, 255)", background: "rgb(198, 40, 40)", height: 26 });
    const art = await page.locator("flip-book .page:not([hidden]) img").boundingBox();
    const box = await pill.boundingBox();
    expect(art.x + art.width - (box.x + box.width)).toBeLessThan(30);
    expect(box.y - art.y).toBeLessThan(40);
    // A tap opens the verse, and does not turn the page.
    await pill.click();
    expect(await page.locator("flip-book").evaluate((book) => book.page)).toBe(5);
    const dialog = page.locator("dialog.kjv-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".kjv-who")).toHaveText("Jesus");
    await expect(dialog.locator(".kjv-ref")).toHaveText("Mark 10:14");
    await expect(dialog.locator(".kjv-verse strong")).toHaveText("for of such is the kingdom of God.");
    await expect(dialog.locator(".kjv-verse")).toContainText("Suffer the little children to come unto me");
    await dialog.locator(".kjv-close").click();
    await expect(dialog).toBeHidden();
    // Turning the page while it is open closes it.
    await pill.click();
    await expect(dialog).toBeVisible();
    await page.locator("flip-book").evaluate((book) => book.next());
    await expect(dialog).toBeHidden();
    expectNoErrors(errors);
});

test("stories without words of God, Jesus or an angel have no KJV pill at all", async ({ page }) => {
    test.skip(test.info().project.name !== "ipad", "one upright tablet");
    await page.goto(reader("and-ruth-with-her"), { waitUntil: "domcontentloaded" });
    await expect(page.locator("flip-book")).toBeVisible();
    await turnTo(page, 6);
    await expect(page.locator("flip-book .page-action")).toHaveCount(0);
});

test("on a wide screen, each page of the spread has its own pill and its own verses", async ({ page }) => {
    test.skip(test.info().project.name !== "desktop", "a landscape screen shows two pages");
    await page.goto(reader("help-thou-mine-unbelief"), { waitUntil: "domcontentloaded" });
    await expect(page.locator("flip-book")).toBeVisible();
    // Page 6 (two notes) shares its spread with page 5 (one note).
    await turnTo(page, 6);
    const shown = await page.locator("flip-book").evaluate((book) => book.page);
    const pages = story("help-thou-mine-unbelief").pages;
    const onShow = [shown, shown + 1].filter((i) => pages[i]?.kjv?.length);
    expect(onShow.length).toBe(2);
    await expect(pills(page)).toHaveCount(2);
    const dialog = page.locator("dialog.kjv-dialog");
    for (const [n, i] of onShow.entries()) {
        await pills(page).nth(n).click();
        await expect(dialog).toBeVisible();
        expect(await dialog.locator(".kjv-ref").allTextContents()).toEqual(pages[i].kjv.map((note) => note.ref));
        await dialog.locator(".kjv-close").click();
        await expect(dialog).toBeHidden();
    }
});

test("the grown-up stories (no KJV notes) are unchanged", async ({ page }) => {
    test.skip(test.info().project.name !== "desktop", "runs once");
    await page.goto("/apps/pages/stories.html?story=into-his-hand", { waitUntil: "domcontentloaded" });
    await expect(page.locator("flip-book")).toBeVisible();
    await expect(page.locator("flip-book .page-action")).toHaveCount(0);
});
