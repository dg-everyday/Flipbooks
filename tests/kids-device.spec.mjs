/**
 * Daily Grace Kids on real devices and in bad conditions: the daily time
 * limit; damaged, blocked or full storage; the media host or the story data
 * failing; two tabs at once; the grown-ups' settings; printables, stickers and
 * the games corner. The layout checks and the home page's card run on every
 * screen (tablets, phones, desktop); the rest on the upright iPad.
 */
import { test, expect } from "@playwright/test";
import {
    ANNA, BEN, DATA, FIRST, KIDS, STORIES, expectNoErrors, go, hash, passGate, readStore, seed, stop, stubMedia, watchErrors,
} from "./kids-helpers.mjs";

const tabletOnly = () => test.skip(test.info().project.name !== "ipad", "runs on the tablet");
const finished = (ids) => ({ stops: Object.fromEntries(ids.map((id) => [id, stop()])), firsts: { watch: true, find: true, play: true, verse: true, talk: true } });
const section = STORIES.find((s) => STORIES.filter((t) => t.section === s.section).length === 1).section;

test.beforeEach(async ({ page }) => {
    await stubMedia(page);
});

// ------------------------------------------------------------------ every screen
test.describe("on every screen", () => {
    for (const [name, path] of [["home", "/home"], ["map", "/map"], ["watch", `/stop/${FIRST.id}/watch`], ["find", `/stop/${FIRST.id}/find`], ["who", "/"], ["stickers", "/stickers"], ["games", "/games"]]) {
        test(`${name}: fits the width, with big enough buttons and no errors`, async ({ page }) => {
            const errors = watchErrors(page);
            await seed(page, {
                children: [ANNA, BEN],
                current: ANNA.id,
                progress: { [ANNA.id]: finished([FIRST.id]) },
                stickers: { [ANNA.id]: { earned: { "AG-01": { path: "firsts" }, "HB-01": { path: "stops" } } } },
            });
            await go(page, path);
            await page.waitForLoadState("networkidle");
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
            expect(overflow, "sideways scrolling").toBeLessThanOrEqual(1);
            // Every visible button is at least 44 px each way (except text links).
            const small = await page.evaluate(() => [...document.querySelectorAll("#kids-app button:not(.link-btn)")]
                .filter((b) => b.offsetParent !== null)
                .map((b) => ({ label: b.getAttribute("aria-label") || b.textContent.trim().slice(0, 30), ...b.getBoundingClientRect().toJSON() }))
                .filter((r) => r.width < 43.5 || r.height < 43.5)
                .map((r) => `${r.label}: ${Math.round(r.width)}×${Math.round(r.height)}`));
            expect(small).toEqual([]);
            expectNoErrors(errors);
        });
    }

    test("the home page's Daily Grace Kids card: the banner video plays near the screen and links to the kids page", async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem("dailygrace:avatar", "AV-01");
            const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
            localStorage.setItem("dailygrace.trivia", JSON.stringify({ day, count: 99, last: Date.now() }));
        });
        // The video waits for the page to load, so it never competes with the
        // banner and poster.
        let loaded = false;
        let early = false;
        page.on("load", () => {
            loaded = true;
        });
        page.on("request", (r) => {
            if (r.url().includes("daily-grace-kids-banner.mp4") && !loaded) {
                early = true;
            }
        });
        await page.goto("/");
        await page.waitForLoadState("load");
        const card = page.locator("kids-card");
        await expect(card.locator("img")).toHaveAttribute("src", /daily-grace-kids-banner\.webp$/);
        await card.scrollIntoViewIfNeeded();
        const video = card.locator("video");
        await expect(video).toHaveAttribute("src", /daily-grace-kids-banner\.mp4$/);
        expect(await video.evaluate((v) => v.muted && v.loop && v.playsInline)).toBe(true);
        // The cards above fill in as they come near the screen and can push
        // this one back below it, where the video rightly pauses: keep it in view.
        await expect.poll(async () => {
            await card.scrollIntoViewIfNeeded();
            return video.evaluate((v) => !v.paused && v.currentTime > 0);
        }, { timeout: 20_000 }).toBe(true);
        expect(early, "the video was fetched before the page had loaded").toBe(false);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(1);
        await card.locator("a.card").click();
        await expect(page).toHaveURL(/apps\/pages\/kids\.html/);
        await expect(page.locator("#kids-app .screen")).toBeVisible();
    });
});

test("the home card shows the still picture only, with reduced motion or Save-Data", async ({ browser }) => {
    tabletOnly();
    for (const options of [{ reducedMotion: "reduce" }, {}]) {
        const context = await browser.newContext(options);
        const page = await context.newPage();
        if (!options.reducedMotion) {
            await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } }));
        }
        await page.addInitScript(() => localStorage.setItem("dailygrace:avatar", "AV-01"));
        await page.goto("/");
        const card = page.locator("kids-card");
        await card.scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        expect(await card.locator("video").count()).toBe(0);
        await expect(card.locator("img")).toBeVisible();
        await context.close();
    }
});

test("the home card keeps the still picture when the video can't play", async ({ page }) => {
    tabletOnly();
    // A browser that can't play the file refuses play() so. (Routing the file
    // to a 404 isn't reliable: video range requests can slip past the route.)
    await page.addInitScript(() => {
        localStorage.setItem("dailygrace:avatar", "AV-01");
        HTMLVideoElement.prototype.play = () => Promise.reject(new DOMException("unsupported", "NotSupportedError"));
    });
    await page.goto("/");
    const card = page.locator("kids-card");
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator("video")).toHaveCount(0);
    await expect(card.locator("img")).toBeVisible();
});

test("the menu offers Daily Grace Kids", async ({ page }) => {
    tabletOnly();
    await page.addInitScript(() => {
        localStorage.setItem("dailygrace:avatar", "AV-01");
        // Today's trivia already shown, so it doesn't cover the menu.
        const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
        localStorage.setItem("dailygrace.trivia", JSON.stringify({ day, count: 99, last: Date.now() }));
    });
    await page.goto("/");
    await page.locator("#menu-open").click();
    const item = page.locator('study-guide-menu a.menu-item[href$="apps/pages/kids.html"]');
    // Nari's icon and, level with it, the Daily Grace Kids logo alone.
    const icon = item.locator("img.menu-icon");
    const logo = item.locator("img.menu-logo");
    await expect(logo).toHaveAttribute("alt", "Daily Grace Kids");
    await expect(item.locator("small")).toHaveCount(0);
    for (const img of [icon, logo]) {
        await expect.poll(() => img.evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
    }
    const middle = async (l) => {
        const b = await l.boundingBox();
        return b.y + b.height / 2;
    };
    expect(Math.abs((await middle(icon)) - (await middle(logo)))).toBeLessThanOrEqual(2);
});

// ------------------------------------------------------------------ time limit
test.describe("the daily time limit", () => {
    test.beforeEach(() => tabletOnly());

    test("when today's time is up, Nari sleeps; a grown-up can add fifteen minutes", async ({ page }) => {
        await seed(page, { children: [ANNA], current: ANNA.id, settings: { timeLimit: 15 }, usage: { minutes: 15 } });
        for (const path of ["/home", "/map", `/stop/${FIRST.id}/watch`, "/stickers", "/games/pairs"]) {
            await page.goto(`${KIDS}#${path}`);
            await expect.poll(() => hash(page), { message: path }).toBe("#/rest");
        }
        await expect(page.locator(".rest h1")).toHaveText("Time to rest");
        // Grown-ups' things still open.
        await go(page, "/corner");
        await passGate(page);
        await expect(page.locator(".corner h1")).toBeVisible();
        await go(page, "/rest");
        await page.locator("[data-more]").click();
        // The gate was just passed: no second gate.
        await expect.poll(() => hash(page)).toBe("#/home");
        await expect(page.locator("#kids-toast")).toHaveText("15 more minutes.");
        expect((await readStore(page)).usage.extra).toBe(15);
    });

    test("the clock counts while a child plays, and the limit sends them to rest", async ({ page }) => {
        await page.clock.install();
        await seed(page, { children: [ANNA], current: ANNA.id, settings: { timeLimit: 15 }, usage: { minutes: 14.8 } });
        await go(page, `/stop/${FIRST.id}/watch`);
        await page.clock.runFor(15_500);
        await expect.poll(() => hash(page)).toBe("#/rest");
        expect((await readStore(page)).usage.minutes).toBeCloseTo(15.05, 2);
    });

    test("the clock doesn't count in the Grown-ups' Corner or while the page is hidden", async ({ page }) => {
        await page.clock.install();
        await seed(page, { children: [ANNA], current: ANNA.id, settings: { timeLimit: 15 }, usage: { minutes: 5 } });
        await go(page, "/corner");
        await passGate(page, { clock: true });
        await page.clock.runFor(60_000);
        expect((await readStore(page)).usage.minutes).toBe(5);
        await go(page, "/home");
        await page.evaluate(() => {
            Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
        });
        await page.clock.runFor(60_000);
        expect((await readStore(page)).usage.minutes).toBe(5);
    });

    test("yesterday's minutes don't count today, and Off means no limit", async ({ page }) => {
        await seed(page, { children: [ANNA], current: ANNA.id, settings: { timeLimit: 15 }, usage: { day: "2001-01-01", minutes: 500 } });
        await go(page, "/home");
        await expect(page.locator(".screen.home")).toBeVisible();
        await page.evaluate(() => {
            const d = new Date();
            const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            localStorage.setItem("dailygrace:kids:usage", JSON.stringify({ day, minutes: 500, extra: 0 }));
            localStorage.setItem("dailygrace:kids:settings", JSON.stringify({ timeLimit: 0 }));
        });
        await page.reload();
        await expect(page.locator(".screen.home")).toBeVisible();
    });

    test("choosing a limit in the Corner is kept and announced", async ({ page }) => {
        await seed(page, { children: [ANNA], current: ANNA.id });
        await go(page, "/corner");
        await passGate(page);
        await page.locator('[data-limit="30"]').click();
        await expect(page.locator('[data-limit="30"]')).toHaveAttribute("aria-checked", "true");
        await expect(page.locator('[data-limit="0"]')).toHaveAttribute("aria-checked", "false");
        await expect(page.locator("#kids-toast")).toHaveText("Time limit: 30 minutes a day.");
        expect((await readStore(page)).settings.timeLimit).toBe(30);
    });
});

// ------------------------------------------------------------------ bad conditions
test.describe("when things go wrong", () => {
    test.beforeEach(() => tabletOnly());

    test("damaged storage: the page starts, keeps what is good, and plays on", async ({ page }) => {
        const errors = watchErrors(page);
        await seed(page, {
            raw: {
                profiles: JSON.stringify({ children: [ANNA, { id: "bad id", name: "X" }, { id: ANNA.id, name: "Dup" }, null, 7], current: ANNA.id }),
                settings: "{oops",
                [`${ANNA.id}:progress`]: JSON.stringify({ stops: { [FIRST.id]: { steps: { watch: "yes" } }, "<img>": { steps: { watch: true } } }, pairsWins: "lots" }),
                [`${ANNA.id}:stickers`]: "[]",
                usage: "null",
            },
        });
        await go(page, "/");
        await expect(page.locator(".child-card[data-child]")).toHaveCount(1);
        await page.locator(".child-card[data-child]").click();
        await expect(page.locator(".home h1")).toHaveText("Hi, Anna!");
        await expect(page.locator(".tally .c-leaf")).toHaveText("0");
        await playWatchQuick(page);
        expectNoErrors(errors);
    });

    test("profiles that aren't JSON at all: the welcome, as on a first visit", async ({ page }) => {
        const errors = watchErrors(page);
        await seed(page, { raw: { profiles: "<<<not json" } });
        await go(page, "/");
        await expect(page.locator(".screen.welcome")).toBeVisible();
        expectNoErrors(errors);
    });

    test("blocked storage: a warning, and the visit still works", async ({ page }) => {
        const errors = watchErrors(page);
        await page.addInitScript(() => {
            Object.defineProperty(window, "localStorage", {
                configurable: true,
                get() {
                    throw new DOMException("The operation is insecure.", "SecurityError");
                },
            });
        });
        await go(page, "/");
        await expect(page.locator("#kids-storage-warning")).toContainText("can't be saved");
        await page.locator("[data-start]").click();
        await passGate(page);
        await page.locator("#child-name").fill("Mia");
        await page.locator("form button[type=submit]").click();
        await expect(page.locator(".home h1")).toHaveText("Hi, Mia!");
        await page.locator(".keep-going").click();
        await expect(page.locator(".screen.watch")).toBeVisible();
        expectNoErrors(errors);
    });

    test("the media host down: soft placeholders, a message in Look & Find, and the story still moves on", async ({ page }) => {
        const errors = watchErrors(page);
        await page.unrouteAll();
        await stubMedia(page, { images: false });
        await seed(page, { children: [ANNA], current: ANNA.id, progress: { [ANNA.id]: { stops: { [FIRST.id]: stop(["watch"]) } } } });
        await go(page, "/home");
        await expect.poll(() => page.locator("#kids-app img.broken").count()).toBeGreaterThan(0);
        await go(page, `/stop/${FIRST.id}/find`);
        await expect(page.locator("kids-look-find .loading")).toContainText("can't be shown right now");
        // Taps wait for the picture, but the names can still be heard.
        await page.locator('kids-look-find [data-say="0"]').click();
        await go(page, `/stop/${FIRST.id}/watch`);
        await page.locator("[data-fwd]").click();
        await expect(page.locator(".story-text")).toHaveText(FIRST.panels[1].lions);
        expectNoErrors(errors);
    });

    test("the stories can't be loaded: a clear message and Try again", async ({ page }) => {
        let fail = true;
        await page.route("**/assets/kids/kids-data.json*", (route) => (fail ? route.fulfill({ status: 503, body: "" }) : route.continue()));
        await page.goto(`${KIDS}#/`);
        await expect(page.locator(".lede")).toContainText("couldn't be loaded");
        fail = false;
        await page.locator("[data-retry]").click();
        await expect(page.locator(".screen.welcome, .screen.who")).toBeVisible();
    });

    test("narration and sounds off: no voice or sound is fetched", async ({ page }) => {
        const requests = await stubMediaRequests(page);
        await seed(page, { children: [ANNA], current: ANNA.id, settings: { narration: false, sound: false } });
        await go(page, `/stop/${FIRST.id}/watch`);
        await page.locator("[data-fwd]").click();
        await page.locator("[data-play]").click();
        await page.waitForTimeout(500);
        expect(requests.filter((u) => u.endsWith(".webm"))).toEqual([]);
    });

    test("narration off, sounds on: the voice only plays when asked for", async ({ page }) => {
        // What the voice player is asked to play.
        await page.addInitScript(() => {
            window.__played = [];
            const play = HTMLMediaElement.prototype.play;
            HTMLMediaElement.prototype.play = function () {
                window.__played.push(this.src);
                return play.call(this);
            };
        });
        const played = () => page.evaluate(() => window.__played.filter((u) => /\/audio\/stops\//.test(u)));
        await seed(page, { children: [ANNA], current: ANNA.id, settings: { narration: false } });
        await go(page, `/stop/${FIRST.id}/watch`);
        await page.waitForTimeout(800);
        // The story isn't told by itself, not even its first picture.
        expect(await played()).toEqual([]);
        await page.locator("[data-fwd]").click();
        await page.waitForTimeout(300);
        expect(await played()).toEqual([]);
        // Asked for: heard.
        await page.locator("[data-play]").click();
        await expect.poll(played).toEqual([expect.stringMatching(/\/lions-02\.webm$/)]);
    });
});

/** The voice and sound requests the page makes (the media stub already answers them). */
async function stubMediaRequests(page) {
    const requests = [];
    page.on("request", (r) => {
        if (r.url().startsWith("https://dailygrace.faith/media/")) {
            requests.push(r.url());
        }
    });
    return requests;
}

async function playWatchQuick(page) {
    await page.locator(".keep-going").click();
    await expect(page.locator(".screen.watch")).toBeVisible();
    await page.locator("[data-fwd]").click();
}

// ------------------------------------------------------------------ two tabs
test.describe("two tabs", () => {
    test.beforeEach(() => tabletOnly());

    test("another tab's clock doesn't interrupt a story, and a child removed elsewhere is noticed", async ({ context, page }) => {
        await seed(page, { children: [ANNA, BEN], current: ANNA.id });
        await go(page, `/stop/${FIRST.id}/watch`);
        await page.locator("[data-fwd]").click();
        await page.locator("[data-fwd]").click();
        await expect(page.locator(".dots")).toHaveAttribute("aria-label", "Picture 3 of 6");

        const other = await context.newPage();
        await stubMedia(other);
        await other.goto(`${KIDS}#/home`);
        await expect(other.locator(".home h1")).toHaveText("Hi, Anna!");
        // The other tab's minutes and progress: this one stays on picture 3.
        await other.evaluate(() => {
            localStorage.setItem("dailygrace:kids:usage", JSON.stringify({ day: "2026-10-24", minutes: 3, extra: 0 }));
            localStorage.setItem("dailygrace:kids:c0002bb:progress", JSON.stringify({ stops: {} }));
        });
        await page.waitForTimeout(300);
        await expect(page.locator(".dots")).toHaveAttribute("aria-label", "Picture 3 of 6");

        // Anna is removed in the other tab: this tab's home asks who is exploring.
        await go(page, "/home");
        await other.evaluate((id) => {
            const p = JSON.parse(localStorage.getItem("dailygrace:kids:profiles"));
            p.children = p.children.filter((c) => c.id !== id);
            p.current = null;
            localStorage.setItem("dailygrace:kids:profiles", JSON.stringify(p));
        }, ANNA.id);
        await expect.poll(() => hash(page)).toBe("#/");
        await expect(page.locator(".child-card[data-child]")).toHaveCount(1);
    });

    test("a story finished in one tab shows on the other tab's map", async ({ context, page }) => {
        await seed(page, { children: [ANNA], current: ANNA.id });
        await go(page, "/map");
        await expect(page.locator(".count-pill")).toHaveText(`0 of ${STORIES.length}`);
        const other = await context.newPage();
        await other.goto(`${KIDS}#/home`);
        await other.evaluate(([id, story]) => {
            localStorage.setItem(`dailygrace:kids:${id}:progress`, JSON.stringify({ stops: { [story]: { steps: { watch: true, find: true, play: true, verse: true, talk: true }, finishedOn: "2026-10-24", times: 1 } } }));
        }, [ANNA.id, FIRST.id]);
        await expect(page.locator(".count-pill")).toHaveText(`1 of ${STORIES.length}`);
    });
});

// ------------------------------------------------------------------ settings
test.describe("grown-ups' settings", () => {
    test.beforeEach(() => tabletOnly());

    test("each switch is kept and changes the page at once", async ({ page }) => {
        await seed(page, { children: [ANNA], current: ANNA.id });
        await go(page, "/corner");
        await passGate(page);
        const html = page.locator("html");
        for (const [key, cls] of [["bigText", "kids-big-text"], ["readingFont", "kids-reading-font"], ["lessMotion", "kids-less-motion"], ["readTogether", "kids-read-together"]]) {
            await page.locator(`label.toggle:has([data-setting="${key}"])`).click();
            await expect(html).toHaveClass(new RegExp(cls));
            expect((await readStore(page)).settings[key]).toBe(true);
        }
        await page.reload();
        await passGate(page);
        await expect(html).toHaveClass(/kids-big-text/);
        await expect(page.locator('[data-setting="bigText"]')).toBeChecked();
        // Read Together shows its banner on a story; Less motion reaches the games.
        await go(page, `/stop/${FIRST.id}/watch`);
        await expect(page.locator(".read-together-bar")).toBeVisible();
        await page.locator("[data-leave]").click();
        await page.evaluate((id) => localStorage.setItem(`dailygrace:kids:${id}:progress`, JSON.stringify({ stops: { "where-art-thou": { steps: { watch: true } } } })), ANNA.id);
        await page.reload();
        await go(page, `/stop/${FIRST.id}/find`);
        await expect(page.locator("kids-look-find")).toHaveAttribute("less-motion", "");
        // Turning one off (the reload closed the gate again).
        await go(page, "/corner");
        await passGate(page);
        await page.locator('label.toggle:has([data-setting="bigText"])').click();
        await expect(html).not.toHaveClass(/kids-big-text/);
    });
});

// ------------------------------------------------------------------ printables, stickers, games
test.describe("printables, stickers and games", () => {
    test.beforeEach(() => tabletOnly());

    test("verse cards and certificates are offered once earned, and print", async ({ page }) => {
        const story = STORIES.find((s) => s.section === section);
        await seed(page, { children: [{ ...ANNA, name: "<b>Anna</b>" }], current: ANNA.id, progress: { [ANNA.id]: finished([story.id]) } });
        await page.addInitScript(() => {
            window.print = () => {
                window.__printed = (window.__printed ?? 0) + 1;
            };
        });
        await go(page, "/corner");
        await passGate(page);
        await page.locator(".prints summary").click();
        await expect(page.locator(".prints a")).toHaveCount(2);
        await page.locator(".prints a", { hasText: "Verse card" }).click();
        await expect(page.locator(".print-verse")).toHaveText(story.verse.text.charAt(0).toUpperCase() + story.verse.text.slice(1));
        await expect(page.locator(".print-ref")).toHaveText(story.verse.ref);
        await page.locator("[data-print]").click();
        expect(await page.evaluate(() => window.__printed)).toBe(1);
        await page.locator(".print-screen [data-go]").click();
        await page.locator(".prints summary").click();
        await page.locator(".prints a", { hasText: "Certificate" }).click();
        await expect(page.locator(".print-name")).toHaveText("<b>Anna</b>");
        await expect(page.locator(".print-line")).toContainText(DATA.map.sections.find((s) => s.id === section).name);
        // The bar is left off the printed page.
        await page.emulateMedia({ media: "print" });
        await expect(page.locator(".print-screen header")).toBeHidden();
        await expect(page.locator(".print-page")).toBeVisible();
    });

    test("stickers: the shelf shows what's earned, the new ones are marked once, and a sticker opens with its verse", async ({ page }) => {
        await seed(page, { children: [ANNA], current: ANNA.id, stickers: { [ANNA.id]: { earned: { "AG-01": { path: "firsts" }, "AN-01": { path: "animals", seen: true } } } } });
        await go(page, "/home");
        await expect(page.locator(".nav-stickers .new-badge")).toHaveText("1");
        await page.locator(".nav-stickers").click();
        await expect(page.locator(".stickers .sub")).toHaveText("2 stickers so far");
        await expect(page.locator(".sticker .new-badge")).toHaveCount(1);
        await page.locator('[data-sticker="AG-01"]').click();
        const dialog = page.locator(".sticker-dialog");
        await expect(dialog).toBeVisible();
        const ag = DATA.stickers.list.find((s) => s.id === "AG-01");
        await expect(dialog.locator("h2")).toHaveText(ag.title);
        await expect(dialog).toContainText(`Earned for ${DATA.stickers.firsts.watch}`);
        await dialog.locator("[data-close]").click();
        await expect(dialog).toBeHidden();
        await page.reload();
        await expect(page.locator(".sticker .new-badge")).toHaveCount(0);
        await go(page, "/home");
        await expect(page.locator(".nav-stickers .new-badge")).toHaveCount(0);
    });

    test("Two by Two: a win is counted and brings an animal sticker; three quick taps turn only two cards", async ({ page }) => {
        await seed(page, { children: [BEN], current: BEN.id });
        await go(page, "/games/pairs");
        const game = page.locator("kids-pairs");
        const cards = game.locator(".card");
        await expect(cards).toHaveCount(8);
        const ids = await cards.evaluateAll((c) => c.map((x) => x.dataset.id));
        // Two that don't match, then a third tap at once: it waits.
        const a = 0;
        const b = ids.findIndex((id) => id !== ids[a]);
        const c = ids.findIndex((id, i) => i !== a && i !== b);
        await cards.nth(a).click();
        await cards.nth(b).click();
        await cards.nth(c).click();
        await expect(game.locator(".card.up")).toHaveCount(2);
        await expect(game.locator(".card.up")).toHaveCount(0, { timeout: 3000 });
        // Then every pair.
        for (const id of new Set(ids)) {
            const [i, j] = ids.flatMap((x, n) => (x === id ? [n] : []));
            await cards.nth(i).click();
            await cards.nth(j).click();
        }
        await expect(game.locator(".feedback")).toHaveText("You found every pair!");
        await expect(page.locator("#kids-toast")).toContainText("A gift for you");
        const saved = await readStore(page, BEN.id);
        expect(saved.progress.pairsWins).toBe(1);
        expect(Object.keys(saved.stickers.earned).some((id) => id.startsWith("AN"))).toBe(true);
    });

    test("Colour It In lists only the stories watched", async ({ page }) => {
        await seed(page, { children: [ANNA], current: ANNA.id, progress: { [ANNA.id]: { stops: { [STORIES[3].id]: stop(["watch"]) } } } });
        await go(page, "/games");
        await expect(page.locator(".colour-list button")).toHaveCount(1);
        await page.locator(".colour-list button").click();
        await expect.poll(() => hash(page)).toBe(`#/games/colour/${STORIES[3].id}`);
        await expect(page.locator("kids-colour canvas")).toBeVisible();
        await page.locator("kids-colour [data-done]").click();
        await expect.poll(() => hash(page)).toBe("#/games");
        // Nothing watched: told how to start.
        await page.evaluate((id) => localStorage.removeItem(`dailygrace:kids:${id}:progress`), ANNA.id);
        await page.reload();
        await expect(page.locator(".games .empty")).toContainText("Watch a story first");
    });

    test("the landscape tip shows on a tablet held sideways, can be closed, and stays closed for the visit", async ({ page }) => {
        await page.goto(`${KIDS}#/`);
        const tip = page.locator(".orientation-hint");
        await expect(tip).toBeHidden();
        await page.setViewportSize({ width: 1080, height: 810 });
        await expect(tip).toBeVisible();
        await tip.locator("button").click();
        await expect(tip).toHaveCount(0);
        await page.reload();
        await expect(page.locator("#kids-app .screen")).toBeVisible();
        await expect(page.locator(".orientation-hint")).toHaveCount(0);
    });
});
