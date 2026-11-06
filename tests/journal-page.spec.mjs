/**
 * My Faith Journal's page (apps/pages/journal.html): Today and writing an
 * entry, a bookmark put into an entry, Moment answers in the Daily Log, the
 * album inside the journal, backups, the menu's way in, and a phone's one
 * pane at a time. Bookmarking itself is left as it was.
 */
import { readFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

const JOURNAL = "/apps/pages/journal.html";

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        if (sessionStorage.getItem("seeded")) {
            return;
        }
        sessionStorage.setItem("seeded", "1");
        localStorage.setItem("dailygrace:avatar", "AV-01");
        // Today's trivia already played, so no quiz opens over the home page.
        const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
        localStorage.setItem("dailygrace.trivia", JSON.stringify({ day, count: 99, last: Date.now() }));
        localStorage.setItem("dailygrace:bookmarks:sayings", JSON.stringify(["let-there-be-light"]));
        localStorage.setItem(
            "dailygrace:bookmarks:notes",
            JSON.stringify({
                "dailygrace:bookmarks:sayings": {
                    "let-there-be-light": { text: "A new start", updated: "2026-11-01T00:00:00.000Z" },
                },
            }),
        );
        localStorage.setItem("dailygrace:moment:answers", JSON.stringify({ "2026-10-04": "Trusting Him." }));
    });
});

test.describe("on a wide screen", () => {
    test.skip(({ isMobile }) => isMobile, "the three panes need a wide screen");

    test("Today asks the day's question, and today's log is written, kept and read back", async ({ page }) => {
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(JOURNAL);

        const today = page.locator("section.today");
        await expect(today.locator(".today-question")).toBeVisible();
        // Today shows the day's poster, the other kinds in one pill, and no
        // backup line; "Write today's log" is in the bar above the page.
        await expect(today.locator("poster-card.today-poster")).toBeVisible();
        await expect(today.locator(".kind-pill button")).toHaveText(["Discoveries", "My Diary", "Notebook", "Prayer List"]);
        await expect(today).not.toContainText("Your journal is kept only on this device");
        const write = page.locator(".page-bar.with-actions").getByRole("button", { name: "Write today's log" });
        await expect(write).toBeVisible();
        // Its right edge lines up with the Home button's.
        const [writeBox, homeBox] = await Promise.all([write.boundingBox(), page.locator(".topbar a.home").boundingBox()]);
        expect(Math.abs(writeBox.x + writeBox.width - (homeBox.x + homeBox.width))).toBeLessThanOrEqual(2);
        await write.click();

        const editor = page.locator(".entry-edit");
        await expect(editor).toBeVisible();
        await expect(editor.locator("#edit-kind")).toHaveValue("log");
        await editor.locator(".edit-body").click();
        await page.keyboard.type("Grace for today.");
        await editor.locator("#edit-title").fill("A quiet morning");
        await expect(editor.locator(".edit-status")).toHaveText("Saved");
        await editor.getByRole("button", { name: "Done" }).click();

        const read = page.locator(".entry-read");
        await expect(read.locator(".entry-title")).toHaveText("A quiet morning");
        await expect(read.locator(".entry-body")).toHaveText("Grace for today.");
        await expect(read.locator(".entry-context")).toBeVisible();

        // It is in the Daily Log, and still there after a reload.
        await page.locator('a.folder[data-folder="log"]').click();
        await expect(page.locator(".list-pane .row-title", { hasText: "A quiet morning" })).toBeVisible();
        await page.reload();
        await page.locator('a.folder[data-folder="log"]').click();
        await expect(page.locator(".list-pane .row-title", { hasText: "A quiet morning" })).toBeVisible();

        // The Moment's answer from before the journal is in the Daily Log too.
        await expect(page.locator(".list-pane .row-text", { hasText: "Trusting Him." })).toBeVisible();

        // Search finds it; a word not in the journal finds nothing.
        await page.locator(".list-pane .search input").fill("quiet");
        await expect(page.locator(".list-pane a.row")).toHaveCount(1);
        await page.locator(".list-pane .search input").fill("zebra");
        await expect(page.locator(".list-pane .rows")).toContainText("Nothing matches");
        expect(errors).toEqual([]);
    });

    test("a bookmark, with its note, goes into an entry as a card; the bookmark itself stays", async ({ page }) => {
        await page.goto(JOURNAL);
        await page.locator('a.folder[data-folder="bookmarks:sayings"]').click();
        const row = page.locator(".bookmark-row").first();
        await expect(row.locator(".row-title")).toHaveText("Let there be light");
        await expect(row.locator(".row-note")).toHaveText("A new start");

        await row.getByRole("button", { name: "Add to journal" }).click();
        const editor = page.locator(".entry-edit");
        await expect(editor.locator("#edit-kind")).toHaveValue("discovery");
        await expect(editor.locator(".card strong")).toHaveText("Let there be light");
        await editor.locator(".edit-body").click();
        await page.keyboard.type("Where it all began.");
        await expect(editor.locator(".edit-status")).toHaveText("Saved");
        await editor.getByRole("button", { name: "Done" }).click();
        await expect(page.locator(".entry-read .card strong")).toHaveText("Let there be light");

        // Bookmarking is untouched: the bookmark and its note are still kept.
        const kept = await page.evaluate(() => ({
            list: JSON.parse(localStorage.getItem("dailygrace:bookmarks:sayings")),
            notes: JSON.parse(localStorage.getItem("dailygrace:bookmarks:notes")),
        }));
        expect(kept.list).toEqual(["let-there-be-light"]);
        expect(kept.notes["dailygrace:bookmarks:sayings"]["let-there-be-light"].text).toBe("A new start");

        // My Bookmarks still opens from the journal.
        await page.locator('a.folder[data-folder="bookmarks:sayings"]').click();
        await page.getByRole("button", { name: "My Bookmarks" }).click();
        await expect(page.locator("bookmark-manager .bookmarks-dialog")).toBeVisible();
    });

    test("the Sticker Album opens inside the journal, and a backup can be made", async ({ page }) => {
        await page.goto(JOURNAL);
        await page.locator('a.folder[data-folder="stickers"]').click();
        await expect(page.locator(".page-pane .album .shelf").first()).toBeVisible({ timeout: 15_000 });

        await page.locator('button[data-action="backup"]').first().click();
        const dialog = page.locator("#backup");
        await expect(dialog).toBeVisible();
        await dialog.locator('input[name="password"]').first().fill("grace be with you");
        await dialog.locator('input[name="again"]').fill("grace be with you");
        const download = page.waitForEvent("download");
        await dialog.getByRole("button", { name: "Make a backup" }).click();
        expect((await download).suggestedFilename()).toMatch(/^My Faith Journal backup .*\.dgjournal$/);
        await expect(dialog.locator(".backup-form .dialog-note")).toContainText("Backed up");
    });

    test("the year becomes a Word book, with My Diary left out unless ticked", async ({ page }) => {
        await page.goto(JOURNAL);
        // A diary entry and a Discovery with a bookmark in it.
        await page.evaluate(async () => {
            const store = await import("/assets/scripts/journal/store.js?v=20261106-1");
            await store.addEntry({ day: "2026-10-05", kind: "diary", title: "Only mine", body: "<p>Private words</p>" });
            await store.addEntry({
                day: "2026-10-06",
                kind: "discovery",
                title: "Light & life",
                body: "<p>It <strong>began</strong> with a word.</p><ul><li>light</li></ul><blockquote><p>A quote</p></blockquote>",
                cards: [{ kind: "sayings", id: "let-there-be-light", title: "Let there be light", text: "And God said, Let there be light: and there was light.", reference: "Genesis 1:3" }],
            });
        });

        const save = async (tickDiary) => {
            await page.locator('button[data-action="word"]').click();
            const dialog = page.locator("#word");
            await expect(dialog).toBeVisible();
            if (tickDiary) {
                await dialog.locator('input[name="diary"]').check();
            }
            const download = page.waitForEvent("download");
            await dialog.getByRole("button", { name: "Make the Word book" }).click();
            const file = await download;
            expect(file.suggestedFilename()).toBe("My Faith Journal 2026.docx");
            const bytes = await readFile(await file.path());
            await dialog.locator("[data-close]").click();
            return bytes;
        };

        // Stored without compression, so the document's XML can be read in the file.
        const book = (await save(false)).toString("utf8");
        expect(book.startsWith("PK\u0003\u0004")).toBe(true);
        for (const part of ["[Content_Types].xml", "word/document.xml", "word/styles.xml", "word/footer1.xml"]) {
            expect(book).toContain(part);
        }
        expect(book).toContain("Discovery: Light &amp; life");
        expect(book).toContain('<w:b/></w:rPr><w:t xml:space="preserve">began</w:t>');
        expect(book).toContain("And God said, Let there be light: and there was light.");
        expect(book).toContain("Trusting Him.");
        expect(book).toContain("October 2026");
        expect(book).not.toContain("Private words");

        const withDiary = (await save(true)).toString("utf8");
        expect(withDiary).toContain("Private words");
    });

    test("the Moment's Amen screen leads to the day's entry, ready to write in", async ({ page }) => {
        // A day with an answer opens that answer's entry ...
        await page.goto(`${JOURNAL}#today/write/2026-10-04`);
        const editor = page.locator(".entry-edit");
        await expect(editor.locator(".edit-body")).toHaveText("Trusting Him.");
        await expect(page).toHaveURL(/#today\/edit\//);

        // ... and a day without one starts a Daily Log entry with the day's verse.
        await page.goto(`${JOURNAL}#today/write/2026-11-01`);
        await expect(editor.locator("#edit-kind")).toHaveValue("log");
        await expect(editor.locator("#edit-day")).toHaveValue("2026-11-01");
        await expect(editor.locator(".entry-verse")).toHaveText("Psalm 103:1-2");

        // The Amen screen's link.
        await page.addInitScript(() => {
            const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
            localStorage.setItem("dailygrace.trivia", JSON.stringify({ day, count: 99, last: Date.now() }));
        });
        await page.goto("/");
        const moment = page.locator("#daily-moment");
        await expect(moment).toBeVisible({ timeout: 15_000 });
        await page.evaluate(() => document.getElementById("daily-moment").open());
        const link = moment.locator("a.action.journal");
        for (let i = 0; i < 30 && !(await link.isVisible()); i += 1) {
            await moment.locator(".next").click();
        }
        const today = await page.evaluate(() => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date()));
        await expect(link).toHaveAttribute("href", new RegExp(`/apps/pages/journal\\.html#today/write/${today}$`));
    });

    test("only the panes scroll: the page has no scrollbar of its own", async ({ page }) => {
        await page.goto(JOURNAL);
        await expect(page.locator("section.today poster-card")).toBeVisible();
        const overflow = await page.evaluate(() => ({
            page: document.documentElement.scrollHeight - document.documentElement.clientHeight,
            body: document.body.scrollHeight - document.body.clientHeight,
            footer: Math.round(document.querySelector(".page-footer").getBoundingClientRect().bottom) - innerHeight,
        }));
        expect(overflow).toEqual({ page: 0, body: 0, footer: 0 });
    });

    test("the avatar's menu holds My Faith Journal and its guide", async ({ page }) => {
        await page.goto("/");
        const menu = page.locator("dg-menu");
        await expect(menu.locator(".item")).toHaveCount(3);
        await expect(menu.locator('[data-action="avatar"]')).toHaveCount(1);
        await expect(menu.locator('[data-action="journal"]')).toHaveAttribute("href", /apps\/pages\/journal\.html$/);

        // How My Faith Journal works, from the avatar's menu.
        const guide = page.locator("dg-guide");
        await page.evaluate(() => document.getElementById("dg-menu").open());
        await menu.getByRole("menuitem", { name: "How My Faith Journal works" }).click();
        await expect(guide.locator("#guide-title")).toHaveText("How it works");
        await expect(guide.locator(".journal-link")).toHaveAttribute("href", /journal\.html#today$/);
        await guide.locator(".close").click();
        await expect(guide.locator("dialog")).toBeHidden();

        // Help, from the three lines, says where the guides are; it opens none itself.
        await page.evaluate(() => document.getElementById("site-menu").showHelp());
        const help = page.locator("study-guide-menu .help-dialog");
        await expect(help).toContainText("the ? beside the Bookmarks and Stickers headings");
        await expect(help.locator("[data-guide]")).toHaveCount(0);
    });

    test("the journal opens its guides beside what they explain", async ({ page }) => {
        await page.goto(JOURNAL);
        const guide = page.locator("dg-guide");

        // No ? at the top: the guide is at the foot of the folders.
        await expect(page.locator(".topbar button")).toHaveCount(0);
        // How My Faith Journal works, which leads to the others.
        await page.locator(".folders-pane").getByRole("button", { name: "How My Faith Journal works" }).click();
        await expect(guide.locator("#guide-title")).toHaveText("How it works");
        await expect(guide.locator(".guide-body")).toContainText("Five kinds of entry");
        await guide.locator(".guide-body").getByRole("button", { name: "How to earn stickers" }).click();
        await expect(guide.locator("#guide-title")).toHaveText("How to earn stickers");
        await guide.locator(".close").click();

        // An empty Bookmarks folder shows how to bookmark.
        await page.locator('a.folder[data-folder="bookmarks:facts"]').click();
        await expect(page.locator(".list-pane .empty-help")).toContainText("press and hold a verse or a card");

        // The ? beside the Bookmarks heading: Bookmarking 101.
        const folders = page.locator(".folders-pane");
        await folders.getByRole("button", { name: "Bookmarking 101" }).click();
        await expect(guide.locator("#guide-title")).toHaveText("Bookmarking 101");
        // Its way into the journal closes the guide and opens the folder.
        await guide.locator(".journal-link").click();
        await expect(guide.locator("dialog")).toBeHidden();
        await expect(page).toHaveURL(/#bookmarks:verses$/);

        // The ? beside the Stickers heading: How to earn stickers.
        await folders.getByRole("button", { name: "How to earn stickers" }).click();
        await expect(guide.locator("#guide-title")).toHaveText("How to earn stickers");
        await expect(guide.locator(".guide-body .tally")).toBeVisible({ timeout: 15_000 });
    });
});

test.describe("on a phone", () => {
    test.skip(({ isMobile }) => !isMobile, "one pane at a time is for phones");

    test("shows one pane at a time, with a way back", async ({ page }) => {
        await page.goto(JOURNAL);
        const journal = page.locator("#journal");
        await expect(journal).toHaveAttribute("data-show", "page");
        await expect(page.locator("section.today .today-question")).toBeVisible();
        const footer = page.locator(".page-footer");
        await expect(footer).toHaveCSS("color", "rgb(91, 104, 120)");

        await page.locator(".page-pane").getByRole("button", { name: "Back", exact: true }).click();
        await expect(journal).toHaveAttribute("data-show", "folders");
        // Only the navy folders on show: no footer.
        await expect(footer).toBeHidden();
        await page.locator('a.folder[data-folder="log"]').click();
        await expect(journal).toHaveAttribute("data-show", "list");
        await expect(footer).toBeVisible();
        await page.locator(".list-pane a.row").first().click();
        await expect(journal).toHaveAttribute("data-show", "page");
        await expect(page.locator(".entry-read .entry-body")).toHaveText("Trusting Him.");
        await page.locator(".page-pane").getByRole("button", { name: "Back", exact: true }).click();
        await expect(journal).toHaveAttribute("data-show", "list");
    });
});
