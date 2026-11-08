/**
 * The Living Voice (apps/pages/living-voice.html, apps/components/living-voice-card.js):
 * the pocket player opening on the next chapter, its Albums, Tracks and Now
 * playing screens, the chapter beside it (read along, its words, its question),
 * picking up where the reader left off on the page and on the home card,
 * auto-play into the next chapter, speed, sleep timer and auto-play settings,
 * previous and next, and "Write my answer" in My Faith Journal.
 *
 * The recordings are replaced by a three-second silence
 * (tests/fixtures/bible-walk-silence.webm), so nothing waits on R2.
 */
import { test, expect } from "@playwright/test";

const PAGE = "/apps/pages/living-voice.html";
const KEY = "dailygrace:bible-walk";
const desktopOnly = () => test.skip(test.info().project.name !== "desktop", "runs on the desktop");

async function silence(page) {
    await page.route("**/audio/bible-walk/**", (route) =>
        route.fulfill({ path: "tests/fixtures/bible-walk-silence.webm", contentType: "audio/webm" }),
    );
}

/** The home page without its first-visit popups, and the reader's listening so far. */
async function seed(page, progress = null) {
    await page.addInitScript(
        ([key, saved]) => {
            if (sessionStorage.getItem("seeded")) {
                return;
            }
            sessionStorage.setItem("seeded", "1");
            localStorage.setItem("dailygrace:avatar", "AV-01");
            const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
            localStorage.setItem("dailygrace.trivia", JSON.stringify({ day, count: 99, last: Date.now() }));
            if (saved) {
                localStorage.setItem(key, JSON.stringify(saved));
            }
        },
        [KEY, progress],
    );
}

const lcd = (page) => page.locator(".device .lcd");
const button = (page, name) => page.locator(`.device [data-btn="${name}"]`);
const noSideways = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

test("a new listener's player opens on the first chapter, with the chapter beside it", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(PAGE);

    await expect(page.locator(".dev-brand")).toHaveText("The Living Voice");
    await expect(lcd(page).locator(".lcd-title")).toHaveText("Now playing");
    await expect(lcd(page).locator(".now-title")).toHaveText("How to Walk Through a Chapter");
    await expect(lcd(page).locator(".now-meta")).toContainText("Track 1 of 18");
    await expect(lcd(page).locator(".upnext")).toContainText("Meet Mark · Meet the Book of Mark");
    await expect(lcd(page).locator(".t-left")).toHaveText("-4:08");
    await expect(button(page, "play")).toHaveAttribute("aria-label", "Play");
    await expect(page).toHaveURL(/#walk-00$/);

    const chapter = page.locator(".chapter");
    await expect(chapter.locator("h2")).toHaveText("How to Walk Through a Chapter");
    await expect(chapter.locator(".question")).toContainText("what do you hope to find?");
    await expect(chapter.getByRole("button", { name: /^Read / })).toHaveCount(0);

    expect(await noSideways(page)).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
});

test("List steps back to the tracks and the albums, and a track opens on Now playing", async ({ page }) => {
    await page.goto(PAGE);
    await button(page, "list").click();
    await expect(lcd(page).locator(".lcd-title")).toHaveText("First Steps");
    const tracks = lcd(page).locator(".row.track");
    await expect(tracks).toHaveCount(18);
    await expect(lcd(page).locator(".row.track:not([disabled])")).toHaveCount(3);
    await expect(tracks.nth(3)).toContainText("Mark 2");
    await expect(tracks.nth(3)).toContainText("Coming soon");

    await button(page, "list").click();
    await expect(lcd(page).locator(".lcd-title")).toHaveText("The Living Voice");
    const albums = lcd(page).locator(".row.album");
    await expect(albums.nth(0)).toContainText("First Steps");
    await expect(albums.nth(0)).toContainText("18 tracks · 0 heard");
    await expect(albums.nth(1)).toBeDisabled();
    await expect(albums.nth(1)).toContainText("Coming soon · 31 episodes");

    await albums.nth(0).click();
    await lcd(page).locator('[data-track="mark-01"]').click();
    await expect(lcd(page).locator(".now-title")).toHaveText("Prepare Ye the Way");
    await expect(lcd(page).locator(".now-meta")).toContainText("Track 3 of 18");
    await expect(lcd(page).locator(".upnext")).toContainText("Mark 2 · coming soon");
    await expect(page).toHaveURL(/#mark-01$/);
});

test("a chapter beside the player: read along, its words, and Write my answer", async ({ page }) => {
    await page.goto(`${PAGE}#mark-01`);
    const chapter = page.locator(".chapter");
    await expect(chapter.locator("h2")).toHaveText("Mark 1: Prepare Ye the Way");
    await expect(chapter.locator(".question")).toContainText("What is one thing you will lay down today to follow Jesus?");
    await expect(chapter.getByRole("link", { name: "Write my answer" })).toHaveAttribute("href", "journal.html#log/walk/mark-01");
    await chapter.locator(".transcript summary").click();
    await expect(chapter.locator(".transcript-body")).toContainText("A man with leprosy kneels in the dust");
    await chapter.getByRole("button", { name: "Read Mark 1" }).click();
    await expect(page.locator("passage-reader")).toBeAttached();
});

test("the player picks up where the reader left off, and so does the home card", async ({ page }) => {
    await seed(page, { done: { "walk-00": "2026-11-07", "mark-00": "2026-11-07" }, pos: { "mark-01": 120 }, last: "mark-01", speed: 1 });
    await page.goto(PAGE);
    await expect(lcd(page).locator(".now-title")).toHaveText("Prepare Ye the Way");
    await expect(lcd(page).locator(".t-now")).toHaveText("2:00");

    await button(page, "list").click();
    await expect(lcd(page).locator('[data-track="walk-00"] .num.heard')).toBeVisible();
    await expect(lcd(page).locator('[data-track="mark-00"] .num.heard')).toBeVisible();
    await button(page, "list").click();
    await expect(lcd(page).locator(".row.album").nth(0)).toContainText("2 heard");

    await page.goto("/");
    const order = await page.locator(".devotional-stack > *").evaluateAll((els) => els.map((e) => e.id));
    expect(order.indexOf("living-voice-card")).toBe(order.indexOf("memory-verse") + 1);
    const card = page.locator("living-voice-card");
    await expect(card.locator(".title")).toHaveText("The Living Voice");
    await expect(card.locator(".step")).toHaveText("Continue: Mark 1, Prepare Ye the Way · 6 min left");
    await expect(card.locator("a.card")).toHaveAttribute("href", /apps\/pages\/living-voice\.html#mark-01$/);
    expect(await noSideways(page)).toBeLessThanOrEqual(1);
    await card.locator("a.card").click();
    await expect(page.locator(".now-title")).toHaveText("Prepare Ye the Way");
});

test("a new listener's home card starts with the first chapter", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    const card = page.locator("living-voice-card");
    await expect(card.locator(".step")).toHaveText("Start here: How to Walk Through a Chapter · 4 min");
    await expect(card.locator("a.card")).toHaveAttribute("href", /living-voice\.html#walk-00$/);
});

test("a chapter that ends is ticked off and the next one plays by itself", async ({ page }) => {
    desktopOnly();
    await silence(page);
    await page.goto(`${PAGE}#walk-00`);
    await button(page, "play").click();
    await expect(button(page, "play")).toHaveAttribute("aria-label", "Pause");
    await expect(page.locator(".device")).toHaveClass(/is-playing/);

    // The silence ends: heard, and auto-play moves on to Meet the Book of Mark.
    await expect(lcd(page).locator(".now-title")).toHaveText("Meet the Book of Mark", { timeout: 10_000 });
    await expect(page).toHaveURL(/#mark-00$/);
    await expect(button(page, "play")).toHaveAttribute("aria-label", "Pause");
    const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), KEY);
    expect(Object.keys(saved.done)).toContain("walk-00");

    // With auto-play off, the next chapter waits.
    await lcd(page).locator('[data-act="auto"]').click();
    await expect(lcd(page).locator('[data-act="auto"]')).toHaveText("Auto-play off");
    await expect(lcd(page).locator(".now-title")).toHaveText("Meet the Book of Mark");
    await expect(button(page, "play")).toHaveAttribute("aria-label", "Play", { timeout: 10_000 });
    await expect(lcd(page).locator(".now-title")).toHaveText("Meet the Book of Mark");
});

test("next, previous, speed and the sleep timer", async ({ page }) => {
    desktopOnly();
    await page.goto(`${PAGE}#walk-00`);
    await button(page, "next").click();
    await expect(lcd(page).locator(".now-title")).toHaveText("Meet the Book of Mark");
    await button(page, "next").click();
    await expect(lcd(page).locator(".now-title")).toHaveText("Prepare Ye the Way");
    // Mark 2 is not recorded yet: next stays on Mark 1.
    await button(page, "next").click();
    await expect(lcd(page).locator(".now-title")).toHaveText("Prepare Ye the Way");
    await button(page, "prev").click();
    await expect(lcd(page).locator(".now-title")).toHaveText("Meet the Book of Mark");

    // Forward 30 seconds, then Previous goes back to the start of the chapter.
    await button(page, "forward").click();
    await expect(lcd(page).locator(".t-now")).toHaveText("0:30");
    await button(page, "prev").click();
    await expect(lcd(page).locator(".t-now")).toHaveText("0:00");
    await expect(lcd(page).locator(".now-title")).toHaveText("Meet the Book of Mark");

    const speed = lcd(page).locator('[data-act="speed"]');
    await speed.click();
    await expect(speed).toHaveText("1.25×");
    const sleep = lcd(page).locator('[data-act="sleep"]');
    await expect(sleep).toHaveText("Sleep off");
    await sleep.click();
    await expect(sleep).toHaveText("Sleep 15:00");
    await sleep.click();
    await expect(sleep).toHaveText("Sleep 30:00");
    await sleep.click();
    await expect(sleep).toHaveText("Sleep: end of chapter");
    await page.reload();
    await expect(lcd(page).locator('[data-act="speed"]')).toHaveText("1.25×");
});

test("Write my answer opens a Daily Log entry with the question, and opens it again later", async ({ page, isMobile }) => {
    test.skip(isMobile, "the journal's three panes need a wide screen");
    await seed(page);
    await page.goto(`/apps/pages/journal.html#log/walk/mark-01`);
    const editor = page.locator(".entry-edit");
    await expect(editor).toBeVisible();
    await expect(editor.locator("#edit-kind")).toHaveValue("log");
    await expect(editor).toContainText("The Living Voice · Mark 1: Prepare Ye the Way");
    await expect(editor).toContainText("What is one thing you will lay down today to follow Jesus?");
    await editor.locator(".edit-body").click();
    await page.keyboard.type("My worry about work.");
    await expect(editor.locator(".edit-status")).toHaveText("Saved");
    await editor.getByRole("button", { name: "Done" }).click();
    await expect(page.locator(".entry-read .entry-body")).toHaveText("My worry about work.");

    // The same link later opens that answer, not a second entry.
    await page.goto(PAGE);
    await page.goto(`/apps/pages/journal.html#log/walk/mark-01`);
    await expect(page.locator(".entry-edit .edit-body")).toHaveText("My worry about work.");
    await page.locator('a.folder[data-folder="log"]').click();
    await expect(page.locator(".list-pane .row-text", { hasText: "My worry about work." })).toHaveCount(1);
});
