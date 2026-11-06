/**
 * My Faith Journal's Today page, phase 2 (docs/faith-journal/plan.md): a new
 * year closes the last one (read, never changed) and carries its open
 * prayers on; welcome back after days away; milestones that only count up;
 * memories of a month, a week and a year ago; a learned memory verse coming
 * back with words left out; and a gentle reminder to back up. The clock is
 * fixed, in Manila.
 */
import { test, expect } from "@playwright/test";

const JOURNAL = "/apps/pages/journal.html";
const STORE = "/assets/scripts/journal/store.js?v=20261106-3";
const at = (iso) => new Date(`${iso}T09:00:00+08:00`);

/** Opens the journal and waits for Today, so nothing is written while it is still being drawn. */
async function open(page) {
    await page.goto(JOURNAL);
    await expect(page.locator("section.today")).toBeVisible();
}

/** Writes entries straight into the journal; each: addEntry's fields. */
function write(page, entries) {
    return page.evaluate(
        async ([url, list]) => {
            const store = await import(url);
            for (const fields of list) {
                await store.addEntry(fields);
            }
        },
        [STORE, entries],
    );
}

test("a new year closes the last one, keeps it to read, and carries its open prayers on", async ({ page, isMobile }) => {
    test.skip(isMobile, "it moves between folders, side by side on a wide screen");
    await page.clock.setFixedTime(at("2026-12-30"));
    await open(page);
    await write(page, [
        { day: "2026-12-29", kind: "log", title: "Year's end", body: "<p>Thankful.</p>" },
        { day: "2026-12-30", kind: "prayer", title: "For Dad's work", body: "<p>A new job</p>" },
        { day: "2026-12-30", kind: "prayer", title: "For Mum", body: "<p>Healing</p>", prayer: { answered: true, answeredOn: "2026-12-30", note: "Home" } },
    ]);

    await page.clock.setFixedTime(at("2027-01-03"));
    await page.reload();
    const closing = page.locator(".today-card.closing");
    await expect(closing).toContainText("Your 2026 journal is complete");
    await expect(closing.locator("h3")).toHaveText("3 entries on 2 days.");
    await expect(closing.getByRole("link", { name: "Your Year's Journey in Grace" })).toHaveAttribute("href", "library.html#journey/2026");

    // The open prayer came along into 2027; the answered one stayed.
    await page.locator('a.folder[data-folder="prayer"]').click();
    const rows = page.locator(".list-pane a.row");
    await expect(rows).toHaveCount(1);
    await expect(rows.first().locator(".row-title")).toHaveText("For Dad's work");
    await rows.first().click();
    await expect(page.locator(".entry-read .eyebrow")).toContainText("carried over from 2026");
    await expect(page.locator(".entry-read [data-action='edit']")).toBeVisible();

    // 2026 is read, never changed.
    await page.locator('button.year[data-year="2026"]').click();
    await expect(page.locator(".list-pane .closed-note")).toHaveText("2026 · closed");
    await page.locator(".list-pane a.row", { hasText: "Year's end" }).click();
    await expect(page.locator(".entry-read .closed-note")).toContainText("closed and kept as it is");
    await expect(page.locator(".entry-read [data-action='edit']")).toHaveCount(0);
    const refused = await page.evaluate(async (url) => {
        const store = await import(url);
        const [entry] = await store.entriesForYear(2026);
        try {
            await store.updateEntry(entry.id, { body: "<p>changed</p>" });
            return "changed";
        } catch (error) {
            return error.message;
        }
    }, STORE);
    expect(refused).toContain("closed");

    // Done: the closing card is not shown again.
    await page.locator('a.folder[data-folder="today"]').click();
    await page.locator(".today-card.closing").getByRole("button", { name: "Done" }).click();
    await expect(page.locator(".today-card.closing")).toHaveCount(0);
    await page.reload();
    await expect(page.locator("section.today")).toBeVisible();
    await expect(page.locator(".today-card.closing")).toHaveCount(0);
});

test("welcome back after days away, with no count of the days missed", async ({ page }) => {
    await page.clock.setFixedTime(at("2026-11-01"));
    await page.goto(JOURNAL);
    await expect(page.locator("section.today")).toBeVisible();
    await expect(page.locator(".welcome")).toHaveCount(0);

    await page.clock.setFixedTime(at("2026-11-02"));
    await page.reload();
    await expect(page.locator("section.today")).toBeVisible();
    await expect(page.locator(".welcome")).toHaveCount(0);

    await page.clock.setFixedTime(at("2026-11-06"));
    await page.reload();
    await expect(page.locator(".welcome")).toHaveText("Welcome back. Today's page is open.");
    await expect(page.locator("section.today")).not.toContainText(/\d+ days? (missed|away)/);
});

test("milestones count up once each, and a backup is gently asked for", async ({ page }) => {
    await page.clock.setFixedTime(at("2026-11-06"));
    await open(page);
    await write(page, [{ day: "2026-11-06", body: "<p>One</p>" }]);
    await page.reload();
    const milestone = page.locator(".today-card.milestone");
    await expect(milestone).toContainText("Your first entry.");
    await milestone.getByRole("button", { name: "Thank you" }).click();
    await expect(milestone).toHaveCount(0);
    await page.reload();
    await expect(page.locator("section.today")).toBeVisible();
    await expect(page.locator(".today-card.milestone")).toHaveCount(0);

    // Ten entries, none backed up: the 10th entry, and a reminder.
    await write(page, Array.from({ length: 9 }, (_, i) => ({ day: "2026-11-05", body: `<p>Entry ${i + 2}</p>` })));
    await page.reload();
    await expect(page.locator(".today-card.milestone")).toContainText("Your 10th entry.");
    await expect(page.locator(".today-card.reminder")).toContainText("A backup keeps it safe");
    await expect(page.locator(".so-far")).toHaveText("Your journal so far in 2026: 10 entries on 2 days.");
});

test("a journal that begins with entries already in it says how many", async ({ page }) => {
    await page.clock.setFixedTime(at("2026-11-06"));
    // Moment answers from before the journal: three entries on the first visit.
    await page.addInitScript(() => {
        localStorage.setItem(
            "dailygrace:moment:answers",
            JSON.stringify({ "2026-11-01": "One", "2026-11-02": "Two", "2026-11-03": "Three" }),
        );
    });
    await open(page);
    await expect(page.locator(".today-card.milestone")).toContainText("Your journal has begun: 3 entries kept so far.");
});

test("memories: a year, a month and a week ago", async ({ page }) => {
    await page.clock.setFixedTime(at("2026-11-06"));
    await open(page);
    await write(page, [
        { day: "2025-11-06", title: "Last year today", body: "<p>Then</p>" },
        { day: "2026-10-06", title: "A month back", body: "<p>October</p>" },
        { day: "2026-10-30", title: "A week back", body: "<p>Last week</p>" },
        { day: "2026-10-20", title: "Not a memory", body: "<p>No</p>" },
    ]);
    await page.reload();
    const memories = page.locator(".memories");
    await expect(memories.locator(".memory-label")).toHaveText(["A year ago today", "A month ago", "A week ago"]);
    await expect(memories).toContainText("Last year today");
    await expect(memories).toContainText("A month back");
    await expect(memories).toContainText("A week back");
    await expect(memories).not.toContainText("Not a memory");

    // A memory opens, and from a closed year it is read only.
    await memories.locator("a.row", { hasText: "Last year today" }).click();
    await expect(page.locator(".entry-read .entry-title")).toHaveText("Last year today");
    await expect(page.locator(".entry-read [data-action='edit']")).toHaveCount(0);
});

test("a learned memory verse comes back with words left out", async ({ page }) => {
    await page.clock.setFixedTime(at("2026-11-06"));
    await page.addInitScript(() => {
        localStorage.setItem("dailygrace:memory:learned", JSON.stringify([{ verse: "Romans 12:12", week: "2026-10-04" }]));
    });
    await page.goto(JOURNAL);
    const recall = page.locator(".today-card.recall");
    await expect(recall.locator("cite")).toHaveText("Romans 12:12");
    // "Rejoicing in hope; patient in tribulation; continuing instant in prayer."
    const blanks = recall.locator(".blank");
    await expect(blanks).toHaveCount(2);
    await blanks.first().click();
    await expect(blanks.first()).toHaveText("patient");
    await recall.getByRole("button", { name: "I remembered it" }).click();
    await expect(recall).toContainText("It will come back again before long.");

    // Shown once a word was peeked at: it comes back as soon as before.
    const reviews = await page.evaluate(async (url) => (await import(url)).getMeta("verseReviews", {}), STORE);
    expect(reviews["Romans 12:12"]).toEqual({ count: 0, last: "2026-11-06" });
    await page.reload();
    await expect(page.locator("section.today")).toBeVisible();
    await expect(page.locator(".today-card.recall")).toHaveCount(0);
});
