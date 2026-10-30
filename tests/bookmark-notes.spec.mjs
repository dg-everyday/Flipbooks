/**
 * Notes on bookmarks (apps/components/bookmark-notes.js): a new bookmark asks
 * for a note; My Bookmarks shows it, edits it, takes it off and shares it; and
 * taking the bookmark off takes its note too. The home page's Bible Sayings
 * card is used, since its sayings are a plain JSON file.
 */
import { test, expect } from "@playwright/test";

const NOTES = "dailygrace:bookmarks:notes";
const SAYINGS = "dailygrace:bookmarks:sayings";

const notes = (page) =>
    page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}"), NOTES);

/**
 * Presses a card for longer than the hold that bookmarks it. hover() scrolls
 * it into view and puts the pointer on it in one go: the page scrolls
 * smoothly, and cards above it may still be growing.
 */
async function hold(page, locator) {
    await locator.hover();
    await page.mouse.down();
    await page.waitForTimeout(700);
    await page.mouse.up();
}

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        // An avatar, so no picker; today's trivia already played, so no quiz.
        localStorage.setItem("dailygrace:avatar", "AV-01");
        const day = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Manila",
        }).format(new Date());
        localStorage.setItem(
            "dailygrace.trivia",
            JSON.stringify({ day, count: 99, last: Date.now() }),
        );
        // What the share sheet is handed.
        window.sharedBookmarks = [];
        navigator.canShare = () => true;
        navigator.share = async (data) => {
            window.sharedBookmarks.push(data);
        };
    });
});

test.describe("notes on bookmarks", () => {
    test.skip(({ isMobile }) => isMobile, "one screen is enough for the flow");

    test("a bookmark asks for a note, and My Bookmarks keeps, edits, shares and removes it", async ({ page }) => {
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto("/");
        await page.waitForLoadState("load");

        const card = page.locator("#bible-sayings");
        await card.scrollIntoViewIfNeeded();
        const first = card.locator(".saying").first();
        await expect(first).toBeVisible({ timeout: 15_000 });
        const id = await first.getAttribute("data-id");
        const title = await first.locator(".open").textContent();

        // Bookmarking opens the note box, named for the saying.
        await hold(page, first.locator(".open"));
        const editor = page.locator("bookmark-note-editor dialog");
        await expect(editor).toBeVisible();
        await expect(editor.locator(".eyebrow")).toHaveText("Bookmarked");
        await expect(editor.locator(".title")).toHaveText(title);
        await expect(editor.locator("textarea")).toBeFocused();
        await editor.locator("textarea").fill("  Remember this for Mum  ");
        await expect(editor.locator(".count")).toHaveText("25/280");
        await editor.locator(".save").click();
        await expect(editor).toBeHidden();
        expect((await notes(page))[SAYINGS][id].text).toBe("Remember this for Mum");

        // My Bookmarks shows the note on the saying's card.
        await page.evaluate(() => document.getElementById("bookmarks").open());
        await page.locator("#bookmarks-tab-sayings").click();
        const saved = page.locator(`bookmark-manager bible-sayings .saying[data-id="${id}"]`);
        const box = saved.locator("bookmark-note-box");
        await expect(box.locator(".note-text")).toHaveText("Remember this for Mum");
        await expect(box.locator(".edit")).toHaveText("Edit note");

        // Share hands the saying, the note and a link to the share sheet.
        await box.locator(".share").click();
        const [shared] = await page.evaluate(() => window.sharedBookmarks);
        expect(shared.text).toContain(title);
        expect(shared.text).toContain("My note: Remember this for Mum");
        expect(shared.text).toContain("Shared from Daily Grace");
        expect(shared.url).toContain("bible-sayings.html");

        // Editing changes it; Remove note takes it off.
        await box.locator(".edit").click();
        await expect(editor.locator("textarea")).toHaveValue("Remember this for Mum");
        await expect(editor.locator(".skip")).toHaveText("Cancel");
        await editor.locator("textarea").fill("Read it again on Sunday");
        await editor.locator(".save").click();
        await expect(box.locator(".note-text")).toHaveText("Read it again on Sunday");
        await box.locator(".edit").click();
        await editor.locator(".remove").click();
        await expect(box.locator(".note")).toBeHidden();
        await expect(box.locator(".edit")).toHaveText("Add note");
        expect(await notes(page)).toEqual({});

        // A note added from My Bookmarks goes when the bookmark does.
        await box.locator(".edit").click();
        await editor.locator("textarea").fill("Gone with the bookmark");
        await editor.locator(".save").click();
        await hold(page, saved.locator(".open"));
        await expect(saved).not.toHaveClass(/\bbookmarked\b/);
        await expect(box).toBeHidden();
        expect(await notes(page)).toEqual({});
        expect(errors).toEqual([]);
    });

    test("Skip keeps the bookmark without a note", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("load");
        const card = page.locator("#bible-sayings");
        await card.scrollIntoViewIfNeeded();
        const first = card.locator(".saying").first();
        await expect(first).toBeVisible({ timeout: 15_000 });
        const id = await first.getAttribute("data-id");

        await hold(page, first.locator(".open"));
        const editor = page.locator("bookmark-note-editor dialog");
        await expect(editor).toBeVisible();
        await expect(editor.locator(".remove")).toBeHidden();
        await editor.locator(".skip").click();
        await expect(editor).toBeHidden();
        await expect(first).toHaveClass(/\bbookmarked\b/);
        expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), SAYINGS)).toEqual([id]);
        expect(await notes(page)).toEqual({});
    });
});
