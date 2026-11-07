/**
 * Bible Walk (apps/pages/bible-walk.html, apps/components/bible-walk-card.js):
 * the plans with what is ready and what is coming, one episode with its player,
 * the chapter to read along, its words and its question, the walk picking up
 * where the reader left off on the page and on the home card, playing on while
 * the plans are open, and "Write my answer" in My Faith Journal.
 *
 * The recordings are replaced by a three-second silence
 * (tests/fixtures/bible-walk-silence.webm), so nothing waits on R2.
 */
import { test, expect } from "@playwright/test";

const PAGE = "/apps/pages/bible-walk.html";
const KEY = "dailygrace:bible-walk";
const desktopOnly = () => test.skip(test.info().project.name !== "desktop", "runs on the desktop");

async function silence(page) {
    await page.route("**/audio/bible-walk/**", (route) =>
        route.fulfill({ path: "tests/fixtures/bible-walk-silence.webm", contentType: "audio/webm" }),
    );
}

/** The home page without its first-visit popups, and the reader's walk so far. */
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

const noSideways = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

test("the plans show where to start, what is ready, and what is coming", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(PAGE);

    const next = page.locator(".up-next");
    await expect(next.locator(".eyebrow")).toHaveText("Start here · First Steps");
    await expect(next.locator(".up-next-title")).toHaveText("How to Walk Through a Chapter");

    const plan = page.locator("#plan-first-steps");
    await expect(plan.locator("h2")).toHaveText("First Steps");
    await expect(plan.locator(".ep-link")).toHaveCount(3);
    // The next chapter to come has its own row; the rest share one.
    await expect(plan.locator(".ep.is-soon .ep-label")).toHaveText(["Mark 2", "Mark 3 to Mark 16"]);
    await expect(plan.locator(".ep-link").nth(2)).toContainText("Mark 1");
    await expect(plan.locator(".ep-link").nth(2)).toContainText("Prepare Ye the Way");
    await expect(plan).toContainText("0 of 18 heard");

    const later = page.locator("#plan-big-picture");
    await expect(later).toHaveClass(/is-soon/);
    await expect(later).toContainText("Coming soon · 31 episodes");

    expect(await noSideways(page)).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
});

test("an episode has its player, the chapter to read, its words and its question", async ({ page }) => {
    await page.goto(`${PAGE}#mark-01`);
    const episode = page.locator(".episode");
    await expect(episode.locator("h1")).toHaveText("Prepare Ye the Way");
    await expect(episode.locator(".episode-label")).toHaveText("Mark 1 · 8 min");
    await expect(episode.locator(".t-total")).toHaveText("7:36");
    await expect(episode.locator(".big-play")).toHaveAttribute("aria-label", "Play");
    await expect(episode.locator(".question")).toContainText("What is one thing you will lay down today to follow Jesus?");
    await expect(episode.getByRole("link", { name: "Write my answer" })).toHaveAttribute("href", "journal.html#log/walk/mark-01");

    await episode.locator(".transcript summary").click();
    await expect(episode.locator(".transcript-body")).toContainText("A man with leprosy kneels in the dust");
    await expect(episode.locator(".transcript-body")).toContainText("Verse 15.");

    await expect(episode.locator(".nav-prev")).toContainText("Meet the Book of Mark");
    await expect(episode.locator(".nav-next")).toContainText("Mark 2 · coming soon");
    expect(await noSideways(page)).toBeLessThanOrEqual(1);

    await episode.getByRole("button", { name: "Read Mark 1" }).click();
    await expect(page.locator("passage-reader")).toBeAttached();

    // An intro has no chapter to read.
    await page.goto(`${PAGE}#walk-00`);
    await expect(page.locator(".episode h1")).toHaveText("How to Walk Through a Chapter");
    await expect(page.locator(".episode").getByRole("button", { name: /^Read / })).toHaveCount(0);
});

test("the walk picks up where it was left, on the page and on the home card", async ({ page }) => {
    await seed(page, { done: { "walk-00": "2026-11-07", "mark-00": "2026-11-07" }, pos: { "mark-01": 120 }, last: "mark-01", speed: 1 });
    await page.goto(PAGE);
    const next = page.locator(".up-next");
    await expect(next).toContainText("Continue · First Steps");
    await expect(next).toContainText("6 min left");
    const plan = page.locator("#plan-first-steps");
    await expect(plan.locator(".ep.is-heard")).toHaveCount(2);
    await expect(plan).toContainText("2 of 18 heard");
    await expect(plan.locator(".ep-link").nth(2)).toContainText("6 min left");

    // The episode's slider starts where the reader stopped.
    await page.goto(`${PAGE}#mark-01`);
    await expect(page.locator(".t-now")).toHaveText("2:00");

    await page.goto("/");
    const order = await page.locator(".devotional-stack > *").evaluateAll((els) => els.map((e) => e.id));
    expect(order.indexOf("bible-walk-card")).toBe(order.indexOf("memory-verse") + 1);
    const card = page.locator("bible-walk-card");
    await expect(card.locator(".step")).toHaveText("Continue: Mark 1, Prepare Ye the Way · 6 min left");
    await expect(card.locator("a.card")).toHaveAttribute("href", /apps\/pages\/bible-walk\.html#mark-01$/);
    expect(await noSideways(page)).toBeLessThanOrEqual(1);
    await card.locator("a.card").click();
    await expect(page.locator(".episode h1")).toHaveText("Prepare Ye the Way");
});

test("a new reader's home card starts the walk", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    const card = page.locator("bible-walk-card");
    await expect(card.locator(".step")).toHaveText("Start here: How to Walk Through a Chapter · 4 min");
    await expect(card.locator("a.card")).toHaveAttribute("href", /bible-walk\.html#walk-00$/);
});

test("an episode plays on while the plans are open, and is ticked off once heard", async ({ page }) => {
    desktopOnly();
    await silence(page);
    await page.goto(`${PAGE}#walk-00`);
    const play = page.locator(".big-play");
    await play.click();
    await expect(play).toHaveAttribute("aria-label", "Pause");

    // Back to the plans while it plays: the bar at the foot keeps it.
    await page.locator(".back-link").click();
    const mini = page.locator("#mini-player");
    await expect(mini).toBeVisible();
    await expect(mini).toContainText("How to Walk Through a Chapter");

    // The silence ends: heard, ticked, and the walk moves on.
    await expect(page.locator("#plan-first-steps .ep.is-heard")).toHaveCount(1, { timeout: 10_000 });
    await expect(mini).toBeHidden();
    await expect(page.locator(".up-next")).toContainText("Up next · First Steps");
    await expect(page.locator(".up-next")).toContainText("Meet the Book of Mark");
    const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), KEY);
    expect(Object.keys(saved.done)).toEqual(["walk-00"]);
    expect(saved.last).toBe("walk-00");

    // The speed is remembered.
    await page.goto(`${PAGE}#mark-00`);
    await page.locator("[data-speed]").click();
    await expect(page.locator("[data-speed]")).toHaveText("1.25×");
    await page.reload();
    await expect(page.locator("[data-speed]")).toHaveText("1.25×");
});

test("Write my answer opens a Daily Log entry with the question, and opens it again later", async ({ page, isMobile }) => {
    test.skip(isMobile, "the journal's three panes need a wide screen");
    await seed(page);
    await page.goto(`/apps/pages/journal.html#log/walk/mark-01`);
    const editor = page.locator(".entry-edit");
    await expect(editor).toBeVisible();
    await expect(editor.locator("#edit-kind")).toHaveValue("log");
    await expect(editor).toContainText("Bible Walk · Mark 1: Prepare Ye the Way");
    await expect(editor).toContainText("What is one thing you will lay down today to follow Jesus?");
    await editor.locator(".edit-body").click();
    await page.keyboard.type("My worry about work.");
    await expect(editor.locator(".edit-status")).toHaveText("Saved");
    await editor.getByRole("button", { name: "Done" }).click();
    await expect(page.locator(".entry-read .entry-body")).toHaveText("My worry about work.");

    // The same link later opens that answer, not a second entry.
    await page.goto("/apps/pages/bible-walk.html");
    await page.goto(`/apps/pages/journal.html#log/walk/mark-01`);
    await expect(page.locator(".entry-edit .edit-body")).toHaveText("My worry about work.");
    await page.locator('a.folder[data-folder="log"]').click();
    await expect(page.locator(".list-pane .row-text", { hasText: "My worry about work." })).toHaveCount(1);
});
