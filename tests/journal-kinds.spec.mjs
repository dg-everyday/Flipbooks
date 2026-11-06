/**
 * My Faith Journal's kinds of entry, each with its own parts
 * (assets/scripts/journal/kinds.js): the Daily Log's captain's log, the
 * Notebook's quote and source, My Diary's mood, the Prayer List's for whom,
 * Discoveries' "What I found". Every part is optional; changing the kind
 * keeps what was written; search and the Word book read the parts too.
 */
import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

const JOURNAL = "/apps/pages/journal.html";
const STORE = "/assets/scripts/journal/store.js?v=20261106-3";

test.skip(({ isMobile }) => isMobile, "the parts are the same on every screen");

async function open(page) {
    await page.goto(JOURNAL);
    await expect(page.locator("section.today")).toBeVisible();
}

test("the Daily Log is a captain's log, and only the parts written in show on its page", async ({ page }) => {
    await open(page);
    await page.locator(".page-bar").getByRole("button", { name: "Write today's log" }).click();
    const editor = page.locator(".entry-edit");
    // With the day's question: the answer first, then the log's parts.
    await expect(editor.locator(".part-label")).toHaveText([
        "My answer",
        "What happened today",
        "What I’m thankful for",
        "What I learned",
        "Tomorrow, with God’s help…",
        "Bookmarks in this entry",
    ]);
    await editor.getByLabel("What I’m thankful for").fill("My family\nA quiet morning");
    await editor.getByLabel("Tomorrow, with God’s help…").fill("Call Grandma");
    await expect(editor.locator(".edit-status")).toHaveText("Saved");
    await editor.getByRole("button", { name: "Done" }).click();

    const read = page.locator(".entry-read");
    await expect(read.locator(".part-label")).toHaveText(["What I’m thankful for", "Tomorrow, with God’s help…"]);
    await expect(read.locator(".part-text").first()).toHaveText("My familyA quiet morning");
    await expect(read.locator(".part-text br")).toHaveCount(1);

    // Search finds words in any part.
    await page.locator('a.folder[data-folder="log"]').click();
    await page.locator(".list-pane .search input").fill("grandma");
    await expect(page.locator(".list-pane a.row")).toHaveCount(1);
    await expect(page.locator(".list-pane a.row .row-text")).toContainText("My family");
});

test("changing the kind lays the entry out again, and keeps everything written", async ({ page }) => {
    await open(page);
    await page.locator(".today-more").getByRole("button", { name: "Notebook" }).click();
    const editor = page.locator(".entry-edit");
    await expect(editor.locator(".part-label")).toHaveText(["A quote worth keeping", "Its source", "My notes", "Bookmarks in this entry"]);
    await editor.getByLabel("A quote worth keeping").fill("Be still, and know that I am God");
    await editor.getByLabel("Its source").fill("Psalm 46:10");
    await editor.locator(".edit-body").click();
    await page.keyboard.type("Said slowly at night.");
    await expect(editor.locator(".edit-status")).toHaveText("Saved");

    // As a Discovery: its own parts, with the notes as "What it means".
    await editor.locator("#edit-kind").selectOption("discovery");
    await expect(editor.locator(".part-label")).toHaveText(["What I found", "A verse or place in Scripture", "What it means", "Where it fits in my life"]);
    await expect(editor.locator(".edit-body")).toHaveText("Said slowly at night.");
    await expect(editor.locator(".edit-status")).toHaveText("Saved");

    // Back to the Notebook: the quote and its source were kept.
    await editor.locator("#edit-kind").selectOption("notebook");
    await expect(editor.getByLabel("A quote worth keeping")).toHaveValue("Be still, and know that I am God");
    await expect(editor.getByLabel("Its source")).toHaveValue("Psalm 46:10");
    await expect(editor.locator(".edit-status")).toHaveText("Saved");
    const saved = await page.evaluate(async (url) => {
        const store = await import(url);
        const [entry] = await store.allEntries();
        return { kind: entry.kind, fields: entry.fields };
    }, STORE);
    expect(saved).toEqual({ kind: "notebook", fields: { quote: "Be still, and know that I am God", source: "Psalm 46:10" } });
});

test("My Diary keeps a mood, the Prayer List for whom, and the Word book shows the parts", async ({ page }) => {
    await open(page);
    await page.locator(".today-more").getByRole("button", { name: "My Diary" }).click();
    let editor = page.locator(".entry-edit");
    await expect(editor.locator(".part-label")).toHaveText(["How I feel", "What is on your heart?", "Bookmarks in this entry"]);
    await editor.getByRole("button", { name: "Thankful" }).click();
    await expect(editor.getByRole("button", { name: "Thankful" })).toHaveAttribute("aria-pressed", "true");
    await expect(editor.locator(".edit-status")).toHaveText("Saved");
    await editor.getByRole("button", { name: "Done" }).click();
    await expect(page.locator(".entry-read .entry-mood")).toHaveText("Thankful");

    await page.locator('a.folder[data-folder="today"]').click();
    await page.locator(".today-more").getByRole("button", { name: "Prayer List" }).click();
    editor = page.locator(".entry-edit");
    await expect(editor.locator(".part-label")).toHaveText(["For whom, or what about", "My prayer", "Bookmarks in this entry"]);
    await editor.getByLabel("For whom, or what about").fill("Mum's health");
    await editor.getByLabel("Answered").check();
    await editor.getByPlaceholder("How was it answered?").fill("She is home");
    await expect(editor.locator(".edit-status")).toHaveText("Saved");
    await editor.getByRole("button", { name: "Done" }).click();
    const read = page.locator(".entry-read");
    await expect(read.locator(".part-label")).toHaveText(["For whom, or what about"]);
    await expect(read.locator(".entry-prayer")).toContainText("Answered");

    // The Word book: each part under its label (My Diary ticked in).
    await page.locator('button[data-action="word"]').click();
    const dialog = page.locator("#word");
    await dialog.locator('input[name="diary"]').check();
    const download = page.waitForEvent("download");
    await dialog.getByRole("button", { name: "Make the Word book" }).click();
    const book = (await readFile(await (await download).path())).toString("utf8");
    expect(book).toContain('<w:pStyle w:val="PartLabel"/></w:pPr><w:r><w:t xml:space="preserve">For whom, or what about</w:t>');
    expect(book).toContain("Mum&#39;s health".replace("&#39;", "'"));
    expect(book).toContain(">How I feel<");
    expect(book).toContain(">Thankful<");
    expect(book).toContain("Answered on");
});

test("a Discovery from a bookmark shows it first, as what was found", async ({ page }) => {
    await page.addInitScript(() => {
        if (!sessionStorage.getItem("seeded")) {
            sessionStorage.setItem("seeded", "1");
            localStorage.setItem("dailygrace:bookmarks:sayings", JSON.stringify(["let-there-be-light"]));
        }
    });
    await open(page);
    await page.locator('a.folder[data-folder="bookmarks:sayings"]').click();
    await page.locator(".bookmark-row").first().getByRole("button", { name: "Add to journal" }).click();
    const editor = page.locator(".entry-edit");
    const first = editor.locator(".edit-part").first();
    await expect(first.locator(".part-label")).toHaveText("What I found");
    await expect(first.locator(".card strong")).toHaveText("Let there be light");
    await editor.getByLabel("Where it fits in my life").fill("Starting again this week");
    await expect(editor.locator(".edit-status")).toHaveText("Saved");
    await editor.getByRole("button", { name: "Done" }).click();
    await expect(page.locator(".entry-read").locator(".part-label")).toHaveText(["What I found", "Where it fits in my life"]);
});
