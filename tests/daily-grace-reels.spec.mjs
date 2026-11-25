/**
 * Daily Grace Reels (apps/components/daily-grace-reels.js): the card stays
 * hidden until a part is out, shows the newest drama with its parts, reveals a
 * scheduled part at its release time, plays a part in the full-screen player
 * from youtube-nocookie.com (previous, next, close), counts down into the next
 * part when one ends, remembers what was watched, previews before launch with
 * ?reels-preview, and says so when offline.
 *
 * The card is tested on its own page (tests/fixtures/daily-grace-reels.html)
 * with its own data, and YouTube is replaced by an empty page.
 */
import { test, expect } from "@playwright/test";

const PAGE = "/tests/fixtures/daily-grace-reels.html";
const WATCHED = "dailygrace:reels-watched";

const episode = (id, part, title, youtubeId, release, extra = {}) => ({
    id,
    part,
    title,
    name: `Framed · Part ${part}: ${title}`,
    passage: "Genesis 39",
    description: `${title}.`,
    youtube_id: youtubeId,
    release,
    duration: 80,
    cover: "",
    ...extra,
});

/** An older drama with one part out, then Framed: parts 1–2 out by Dec 15, part 3 scheduled, part 4 and the full cut not uploaded. */
const DATA = {
    series: "Daily Grace Reels",
    playlist_id: "",
    dramas: [
        {
            id: "older",
            title: "An Older Reel",
            passage: "Genesis 1",
            description: "An earlier drama.",
            cover: "",
            episodes: [episode("ep1", 1, "Beginning", "OLDER000001", "2026-12-01T19:00:00+08:00")],
        },
        {
            id: "framed",
            title: "Framed",
            passage: "Genesis 39",
            description: "Sold, trusted, framed.",
            cover: "",
            playlist_id: "PLtest",
            episodes: [
                episode("ep1", 1, "Sold", "FRAMED00001", "2026-12-14T19:00:00+08:00", { duration: 85 }),
                episode("ep2", 2, "The Offer", "FRAMED00002", "2026-12-15T19:00:00+08:00", { duration: 77 }),
                episode("ep3", 3, "The Garment", "FRAMED00003", "2026-12-16T19:00:00+08:00"),
                episode("ep4", 4, "Trusted Again", "", "2026-12-17T19:00:00+08:00"),
                { ...episode("full", 0, "The Full Story", "", "2026-12-19T19:00:00+08:00"), kind: "full" },
            ],
        },
    ],
};

const NOTHING_OUT = {
    dramas: [{ ...DATA.dramas[1], episodes: DATA.dramas[1].episodes.map((item) => ({ ...item, youtube_id: "" })) }],
};

async function setUp(page, { data = DATA, watched = null } = {}) {
    const youtube = [];
    await page.route("**/assets/dg-reels.json", (route) =>
        route.fulfill({ contentType: "application/json", body: JSON.stringify(data) }),
    );
    await page.route(/youtube(-nocookie)?\.com/, (route) => {
        youtube.push(route.request().url());
        return route.fulfill({ contentType: "text/html", body: "<!doctype html><title>player</title>" });
    });
    await page.addInitScript(
        ([key, saved]) => {
            if (saved && !sessionStorage.getItem("seeded")) {
                sessionStorage.setItem("seeded", "1");
                localStorage.setItem(key, JSON.stringify(saved));
            }
        },
        [WATCHED, watched],
    );
    return youtube;
}

const card = (page) => page.locator("daily-grace-reels");
const chip = (page, id) => page.locator(`daily-grace-reels .part[data-ep="${id}"]`);
const dialog = (page) => page.locator("daily-grace-reels dialog");
const iframe = (page) => page.locator("daily-grace-reels dialog iframe");

test("the card stays hidden until a part is out", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-12-20T12:00:00+08:00"));
    await setUp(page, { data: NOTHING_OUT });
    await page.goto(PAGE);
    await page.waitForFunction(() => customElements.get("daily-grace-reels"));
    await page.waitForTimeout(300);
    await expect(card(page)).toBeHidden();
});

test("the newest drama shows its parts: out, scheduled and still to come", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.clock.setFixedTime(new Date("2026-12-15T20:00:00+08:00"));
    const youtube = await setUp(page);
    await page.goto(PAGE);

    await expect(card(page)).toBeVisible();
    await expect(card(page).locator(".title")).toHaveText("Framed");
    await expect(card(page).locator(".passage")).toHaveText("Genesis 39 · KJV");
    await expect(card(page).locator(".status")).toHaveText("Start here: Part 1 · Sold");
    await expect(card(page).locator(".part")).toHaveCount(5);
    await expect(chip(page, "ep1")).toBeEnabled();
    await expect(chip(page, "ep1")).toContainText("1:25");
    await expect(chip(page, "ep2")).toBeEnabled();
    await expect(chip(page, "ep3")).toBeDisabled();
    await expect(chip(page, "ep3")).toContainText("Wed 7 PM");
    await expect(chip(page, "ep4")).toBeDisabled();
    await expect(chip(page, "full")).toContainText("Full story");
    await expect(card(page).locator(".other")).toHaveText("An Older Reel");
    await expect(card(page).locator(".playlist")).toHaveAttribute("href", /list=PLtest/);

    // Our own covers only: nothing is fetched from YouTube until a part is opened.
    expect(youtube).toEqual([]);
    expect(errors).toEqual([]);
});

test("a part plays in the player, steps to the next, and is ticked when closed", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-12-15T20:00:00+08:00"));
    await setUp(page);
    await page.goto(PAGE);

    await chip(page, "ep1").click();
    await expect(dialog(page)).toBeVisible();
    await expect(iframe(page)).toHaveAttribute("src", /^https:\/\/www\.youtube-nocookie\.com\/embed\/FRAMED00001\?/);
    await expect(iframe(page)).toHaveAttribute("src", /autoplay=1/);
    await expect(dialog(page).locator(".now-part")).toHaveText("Part 1: Sold");
    await expect(dialog(page).locator(".yt")).toHaveAttribute("href", "https://www.youtube.com/shorts/FRAMED00001");
    await expect(dialog(page).locator(".back")).toBeHidden();
    await expect(dialog(page).locator(".forward")).toHaveAttribute("aria-label", "Next: Part 2");

    await dialog(page).locator(".forward").click();
    await expect(iframe(page)).toHaveAttribute("src", /embed\/FRAMED00002\?/);
    await expect(dialog(page).locator(".now-part")).toHaveText("Part 2: The Offer");
    // Part 3 is not out yet, so there is no next.
    await expect(dialog(page).locator(".forward")).toBeHidden();

    await dialog(page).locator(".close").click();
    await expect(dialog(page)).toBeHidden();
    await expect(iframe(page)).toHaveCount(0);
    await expect(chip(page, "ep1")).toHaveClass(/watched/);
    await expect(chip(page, "ep2")).toHaveClass(/watched/);
    await expect(card(page).locator(".status")).toHaveText("Part 3 · The Garment arrives Wed 7 PM");

    const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), WATCHED);
    expect(saved).toEqual({ framed: ["ep1", "ep2"] });
});

test("a returning viewer is offered their next part", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-12-15T20:00:00+08:00"));
    await setUp(page, { watched: { framed: ["ep1"] } });
    await page.goto(PAGE);
    await expect(card(page).locator(".status")).toHaveText("New: Part 2 · The Offer");
    await expect(chip(page, "ep2")).toHaveClass(/next/);
    await card(page).locator(".cover").click();
    await expect(iframe(page)).toHaveAttribute("src", /embed\/FRAMED00002\?/);
});

test("when a part ends, the next one starts after a countdown", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-12-15T20:00:00+08:00") });
    await setUp(page);
    await page.goto(PAGE);
    await chip(page, "ep1").click();
    await expect(iframe(page)).toHaveAttribute("src", /FRAMED00001/);

    const player = page.frameLocator("daily-grace-reels dialog iframe");
    await player.locator("title").waitFor({ state: "attached" });
    const frame = page.frames().find((item) => item.url().includes("FRAMED00001"));
    await frame.evaluate(() => parent.postMessage(JSON.stringify({ event: "onStateChange", info: 0 }), "*"));

    await expect(dialog(page).locator(".ended")).toBeVisible();
    await expect(dialog(page).locator(".go-next")).toHaveText("Part 2: The Offer (5)");
    await page.clock.runFor(5500);
    await expect(iframe(page)).toHaveAttribute("src", /FRAMED00002/);
    await expect(dialog(page).locator(".ended")).toBeHidden();
});

test("a scheduled part appears at its release time", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-12-16T18:59:30+08:00") });
    await setUp(page);
    await page.goto(PAGE);
    await expect(chip(page, "ep3")).toBeDisabled();
    await page.clock.runFor(60_000);
    await expect(chip(page, "ep3")).toBeEnabled();
    await expect(chip(page, "ep3")).toContainText("The Garment");
});

test("?reels-preview shows every uploaded part before launch", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-30T12:00:00+08:00"));
    await setUp(page);
    await page.goto(`${PAGE}?reels-preview`);
    await expect(card(page)).toBeVisible();
    await expect(chip(page, "ep3")).toBeEnabled();
    await expect(chip(page, "ep4")).toBeDisabled();
});

test("offline, the player says to connect instead of loading YouTube", async ({ page, context }) => {
    await page.clock.setFixedTime(new Date("2026-12-15T20:00:00+08:00"));
    const youtube = await setUp(page);
    await page.goto(PAGE);
    await expect(card(page)).toBeVisible();
    await context.setOffline(true);
    await chip(page, "ep1").click();
    await expect(dialog(page).locator(".notice")).toBeVisible();
    await expect(iframe(page)).toHaveCount(0);
    await context.setOffline(false);
    expect(youtube).toEqual([]);
});

test.describe("on a 24-hour clock", () => {
    test.use({ locale: "en-GB" });

    test("a part to come keeps its minutes (19:00, not 19)", async ({ page }) => {
        await page.clock.setFixedTime(new Date("2026-12-15T20:00:00+08:00"));
        await setUp(page);
        await page.goto(PAGE);
        await expect(chip(page, "ep3")).toContainText("Wed 19:00");
    });
});
