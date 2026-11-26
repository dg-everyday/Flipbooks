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
        return route.fulfill({
            contentType: "text/html",
            // A stand-in player that keeps the commands it is sent.
            body: "<!doctype html><title>player</title><script>window.commands = []; addEventListener('message', (e) => commands.push(e.data));</script>",
        });
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
    await expect(card(page).locator(".status")).toHaveText("Start here: Episode 1 · Sold");
    await expect(card(page).locator(".part")).toHaveCount(5);
    await expect(chip(page, "ep1")).toBeEnabled();
    await expect(chip(page, "ep1")).toContainText("1:25");
    await expect(chip(page, "ep2")).toBeEnabled();
    await expect(chip(page, "ep3")).toBeDisabled();
    await expect(chip(page, "ep3")).toContainText("Wed 7 PM");
    await expect(chip(page, "ep4")).toBeDisabled();
    await expect(chip(page, "full")).toContainText("Full story");
    await expect(card(page).locator(".other")).toHaveText("An Older Reel");
    // No link out to the YouTube playlist: everything plays here.
    await expect(card(page).locator(".playlist")).toHaveCount(0);

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
    await expect(dialog(page).locator(".now-part")).toHaveText("Episode 1: Sold");
    await expect(dialog(page).locator(".yt")).toHaveAttribute("href", "https://www.youtube.com/shorts/FRAMED00001");
    await expect(dialog(page).locator(".back")).toBeHidden();
    await expect(dialog(page).locator(".forward")).toHaveAttribute("aria-label", "Next: Episode 2");

    await dialog(page).locator(".forward").click();
    await expect(iframe(page)).toHaveAttribute("src", /embed\/FRAMED00002\?/);
    await expect(dialog(page).locator(".now-part")).toHaveText("Episode 2: The Offer");
    // Episode 3 is not out yet, so there is no next.
    await expect(dialog(page).locator(".forward")).toBeHidden();

    await dialog(page).locator(".close").click();
    await expect(dialog(page)).toBeHidden();
    await expect(iframe(page)).toHaveCount(0);
    await expect(chip(page, "ep1")).toHaveClass(/watched/);
    await expect(chip(page, "ep2")).toHaveClass(/watched/);
    await expect(card(page).locator(".status")).toHaveText("Episode 3 · The Garment arrives Wed 7 PM");

    const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), WATCHED);
    expect(saved).toEqual({ framed: ["ep1", "ep2"] });
});

test("a returning viewer is offered their next part", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-12-15T20:00:00+08:00"));
    await setUp(page, { watched: { framed: ["ep1"] } });
    await page.goto(PAGE);
    await expect(card(page).locator(".status")).toHaveText("New: Episode 2 · The Offer");
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
    await expect(dialog(page).locator(".go-next")).toHaveText("Episode 2: The Offer (5)");
    await page.clock.runFor(5500);
    await expect(iframe(page)).toHaveAttribute("src", /FRAMED00002/);
    await expect(dialog(page).locator(".ended")).toBeHidden();
});

test("Watch on YouTube pauses the part here before YouTube opens", async ({ page, context }) => {
    await page.clock.setFixedTime(new Date("2026-12-15T20:00:00+08:00"));
    await setUp(page);
    // The new tab goes nowhere real.
    await context.route(/youtube\.com\/shorts/, (route) => route.fulfill({ contentType: "text/html", body: "<title>YouTube</title>" }));
    await page.goto(PAGE);
    await chip(page, "ep1").click();
    const player = page.frameLocator("daily-grace-reels dialog iframe");
    await player.locator("title").waitFor({ state: "attached" });
    const frame = page.frames().find((item) => item.url().includes("FRAMED00001"));

    const popup = page.waitForEvent("popup");
    await dialog(page).locator(".yt").click();
    await (await popup).close();
    await expect
        .poll(() => frame.evaluate(() => window.commands.map((data) => JSON.parse(data)).filter((data) => data.event === "command").map((data) => data.func)))
        .toEqual(["pauseVideo"]);
    // The player stays open on the same part, ready to carry on.
    await expect(dialog(page)).toBeVisible();
    await expect(iframe(page)).toHaveAttribute("src", /FRAMED00001/);
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

test("the player fits the window, with nothing to scroll", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-12-15T20:00:00+08:00"));
    await setUp(page);
    await page.goto(PAGE);
    for (const size of [{ width: 640, height: 1300 }, { width: 1400, height: 800 }, { width: 390, height: 660 }]) {
        await page.setViewportSize(size);
        await chip(page, "ep1").click();
        await expect(dialog(page)).toBeVisible();
        const fit = await dialog(page).evaluate((d) => {
            const frame = d.querySelector(".frame").getBoundingClientRect();
            return {
                overflow: d.scrollWidth > d.clientWidth || d.scrollHeight > d.clientHeight,
                inside: frame.left >= 0 && frame.top >= 0 && frame.right <= innerWidth + 0.5 && frame.bottom <= innerHeight + 0.5,
                ratio: frame.width / frame.height,
            };
        });
        expect(fit.overflow, `${size.width}x${size.height}`).toBe(false);
        expect(fit.inside, `${size.width}x${size.height}`).toBe(true);
        expect(fit.ratio).toBeCloseTo(9 / 16, 2);
        // The page behind doesn't scroll, so no page scrollbar shows beside the player.
        expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");
        await dialog(page).locator(".close").click();
        await expect(dialog(page)).toBeHidden();
        // Scrolling comes back with the close event, a moment after the player closes.
        await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe("");
    }
});

test("the episodes slide sideways with no scrollbar and no buttons; a mouse drag and the arrow keys move them", async ({ page }) => {
    test.skip(test.info().project.name !== "desktop", "a mouse and keyboard");
    await page.clock.setFixedTime(new Date("2026-12-15T20:00:00+08:00"));
    await setUp(page);
    await page.setViewportSize({ width: 420, height: 900 });
    await page.goto(PAGE);
    const strip = card(page).locator(".parts");
    await expect(chip(page, "ep1")).toContainText("Episode 1");
    const box = await strip.evaluate((el) => ({ scroll: el.scrollWidth > el.clientWidth, bar: el.offsetHeight - el.clientHeight }));
    expect(box.scroll).toBe(true);
    expect(box.bar).toBe(0);
    await expect(card(page).locator(".rail button:not(.part)")).toHaveCount(0);

    // A drag to the left slides the strip on, and opens nothing.
    const area = await strip.boundingBox();
    await page.mouse.move(area.x + 300, area.y + 60);
    await page.mouse.down();
    await page.mouse.move(area.x + 40, area.y + 60, { steps: 10 });
    await page.mouse.up();
    await expect.poll(() => strip.evaluate((el) => el.scrollLeft)).toBeGreaterThan(50);
    await expect(dialog(page)).toBeHidden();

    // The arrow keys step between the episodes that are out, and bring them into view.
    await chip(page, "ep2").focus({ preventScroll: true });
    await page.keyboard.press("ArrowRight");
    await expect(chip(page, "ep2")).toBeFocused(); // Episodes 3 and 4 and the full story aren't out yet.
    await page.keyboard.press("ArrowLeft");
    await expect(chip(page, "ep1")).toBeFocused();
    await expect.poll(() => strip.evaluate((el) => el.scrollLeft)).toBeLessThan(10);
    // A plain click still opens one.
    await chip(page, "ep1").click();
    await expect(dialog(page)).toBeVisible();
});

test("the share button, top right in the share red, shares a link to the card", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-12-15T20:00:00+08:00"));
    await page.addInitScript(() => {
        window.__shared = [];
        navigator.share = async (data) => {
            window.__shared.push(data);
        };
    });
    await setUp(page);
    await page.goto(PAGE);
    const share = card(page).locator(".share");
    await expect(share).toBeVisible();
    await expect(share).toHaveAttribute("aria-label", "Share Framed");
    // The same red as the poster's share button (--action, #c62828).
    expect(await share.evaluate((b) => getComputedStyle(b).backgroundColor)).toBe("rgb(198, 40, 40)");
    const cardBox = await card(page).locator(".card").boundingBox();
    const shareBox = await share.boundingBox();
    expect(cardBox.x + cardBox.width - (shareBox.x + shareBox.width)).toBeLessThan(24);
    expect(shareBox.y - cardBox.y).toBeLessThan(24);

    await share.click();
    const shared = await page.evaluate(() => window.__shared);
    expect(shared).toHaveLength(1);
    expect(shared[0].url).toMatch(/#daily-grace-reels$/);
    expect(shared[0].title).toContain("Framed");
});

test("with no share sheet, the share button copies the link", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-12-15T20:00:00+08:00"));
    await page.addInitScript(() => {
        window.__copied = [];
        Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
        Object.defineProperty(navigator, "clipboard", {
            value: { writeText: async (text) => window.__copied.push(text) },
            configurable: true,
        });
    });
    await setUp(page);
    await page.goto(PAGE);
    await card(page).locator(".share").click();
    await expect(page.locator(".reels-share-note")).toHaveText("Link copied");
    expect(await page.evaluate(() => window.__copied)).toEqual([expect.stringMatching(/#daily-grace-reels$/)]);
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
