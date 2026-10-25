/**
 * Shared helpers for the Daily Grace Kids tests (kids-*.spec.mjs).
 *
 * The kids page's pictures and voices live on the media host. The tests stand
 * in a small local picture for every image and refuse every sound, so they run
 * offline, quickly and the same each time, and so every run also proves that
 * the page carries on when a sound can't play. Tests that need the media host
 * itself to fail pass { images: false }.
 */
import { readFileSync } from "node:fs";
import { expect } from "@playwright/test";

export const KIDS = "/apps/pages/kids.html";
export const DATA = JSON.parse(readFileSync(new URL("../assets/kids/kids-data.json", import.meta.url), "utf8"));
export const STORIES = DATA.stories;
export const FIRST = STORIES[0];

const PICTURE = readFileSync(new URL("../assets/images/kids/icon-192.png", import.meta.url));
const MEDIA = "https://dailygrace.faith/media/**";

/** Stands in for the media host: a local picture for images, nothing for sounds. */
export async function stubMedia(page, { images = true } = {}) {
    const requests = [];
    await page.route(MEDIA, (route) => {
        const url = route.request().url();
        requests.push(url);
        if (images && /\.(webp|png|jpe?g)(\?|$)/i.test(url)) {
            return route.fulfill({
                status: 200,
                contentType: "image/png",
                headers: { "Access-Control-Allow-Origin": "*" },
                body: PICTURE,
            });
        }
        return route.fulfill({ status: 404, headers: { "Access-Control-Allow-Origin": "*" }, body: "" });
    });
    return requests;
}

/** Collects the page's errors; check them with expectNoErrors at the end. */
export function watchErrors(page) {
    const errors = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
        // Missing pictures and sounds are expected here: the media is stubbed.
        if (m.type() === "error" && !/Failed to load resource|404|net::ERR/.test(m.text())) {
            errors.push(`console: ${m.text()}`);
        }
    });
    return errors;
}

export function expectNoErrors(errors) {
    expect(errors, errors.join("\n")).toEqual([]);
}

export const child = (id, name, band = "lambs", avatar = "KA-03") => ({ id, name, band, avatar, created: "2026-10-01" });
export const ANNA = child("c0001aa", "Anna", "lions", "KA-03");
export const BEN = child("c0002bb", "Ben", "lambs", "KA-25");

/**
 * Puts values in the kids store before the page's scripts run, once per tab:
 * a reload keeps whatever the page has saved since. `raw` writes strings as
 * they are (for damaged values); everything else is written as JSON.
 */
export async function seed(page, { children, current, settings, progress, stickers, explorer, journal, usage, raw } = {}) {
    await page.addInitScript((s) => {
        if (sessionStorage.getItem("kids-test-seeded")) {
            return;
        }
        sessionStorage.setItem("kids-test-seeded", "1");
        const put = (key, value) => localStorage.setItem(`dailygrace:kids:${key}`, JSON.stringify(value));
        if (s.children) {
            put("profiles", { children: s.children, current: s.current ?? null });
        }
        if (s.settings) {
            put("settings", s.settings);
        }
        for (const [id, value] of Object.entries(s.progress ?? {})) {
            put(`${id}:progress`, value);
        }
        for (const [id, value] of Object.entries(s.stickers ?? {})) {
            put(`${id}:stickers`, value);
        }
        for (const [id, value] of Object.entries(s.explorer ?? {})) {
            put(`${id}:explorer`, value);
        }
        for (const [id, value] of Object.entries(s.journal ?? {})) {
            put(`${id}:journal`, value);
        }
        if (s.usage) {
            const d = new Date();
            const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            put("usage", { day: s.usage.day ?? day, minutes: s.usage.minutes ?? 0, extra: s.usage.extra ?? 0 });
        }
        for (const [key, value] of Object.entries(s.raw ?? {})) {
            localStorage.setItem(`dailygrace:kids:${key}`, value);
        }
        // The landscape tip would sit over the foot of the screen.
        sessionStorage.setItem("dailygrace:kids:landscape-hint", "1");
    }, { children, current, settings, progress, stickers, explorer, journal, usage, raw });
}

/** A story's record with the given steps done (and finished when all five are). */
export function stop(steps = ["watch", "find", "play", "verse", "talk"], extra = {}) {
    const all = ["watch", "find", "play", "verse", "talk"];
    const done = Object.fromEntries(all.map((s) => [s, steps.includes(s)]));
    const finished = all.every((s) => done[s]);
    return { steps: done, talkLater: false, finishedOn: finished ? "2026-10-20" : null, times: finished ? 1 : 0, ...extra };
}

/** Everything kept for a child, read straight from storage. */
export function readStore(page, childId) {
    return page.evaluate((id) => {
        const get = (key) => JSON.parse(localStorage.getItem(`dailygrace:kids:${key}`) ?? "null");
        return {
            profiles: get("profiles"),
            settings: get("settings"),
            progress: id ? get(`${id}:progress`) : null,
            stickers: id ? get(`${id}:stickers`) : null,
            explorer: id ? get(`${id}:explorer`) : null,
            journal: id ? get(`${id}:journal`) : null,
            usage: get("usage"),
        };
    }, childId);
}

export async function go(page, hash) {
    await page.goto(`${KIDS}#${hash}`);
    await appStarted(page);
}

/**
 * Waits until kids.js has drawn its first screen. kids.html shows "Opening
 * Daily Grace Kids…" until then, which is a .screen too; on a slow
 * connection (the live site) a test must not take that for the page.
 */
export async function appStarted(page) {
    await expect(page.locator("#kids-app")).not.toContainText("Opening Daily Grace Kids…", { timeout: 15_000 });
    await expect(page.locator("#kids-app .screen")).toBeVisible();
}

export async function hash(page) {
    return page.evaluate(() => location.hash);
}

const WORDS = { "twenty-three": "23", "forty-one": "41", "thirty-six": "36", "fifty-two": "52", seventeen: "17", "sixty-four": "64" };

/** Holds the gate's button for three seconds (by mouse, or by `key`) and leaves the number to type. */
export async function holdGate(page, { key = null, clock = false } = {}) {
    const gate = page.locator("dialog.gate");
    await expect(gate).toBeVisible();
    const hold = gate.locator(".hold");
    if (key) {
        await hold.focus();
        await page.keyboard.down(key);
    } else {
        await hold.hover();
        await page.mouse.down();
    }
    if (clock) {
        await page.clock.runFor(3100);
    } else {
        await page.waitForTimeout(3200);
    }
    if (key) {
        await page.keyboard.up(key);
    } else {
        await page.mouse.up();
    }
    await expect(gate.locator(".gate-type-step")).toBeVisible();
    return WORDS[(await gate.locator(".gate-words").textContent()).trim()];
}

export async function typeGate(page, digits) {
    for (const d of digits) {
        await page.locator(`dialog.gate .key[data-key="${d}"]`).click();
    }
}

/** Passes the grown-up gate. */
export async function passGate(page, options) {
    const digits = await holdGate(page, options);
    await typeGate(page, digits);
    await expect(page.locator("dialog.gate")).toHaveCount(0);
}

// ------------------------------------------------------------- playing a story
export async function playWatch(page, story) {
    await expect(page.locator(".screen.watch")).toBeVisible();
    for (let i = 1; i < story.panels.length; i += 1) {
        await page.locator("[data-fwd]").click();
    }
    await page.locator("[data-done]").click();
}

export async function playFind(page, story, band) {
    const game = page.locator("kids-look-find");
    await expect(game.locator(".scene.ready")).toBeVisible();
    const count = band === "lions" ? story.find.items.length : story.find.lambsCount;
    for (let i = 0; i < count; i += 1) {
        // Spots can overlap; a click goes straight to the item's own button.
        await game.locator(`.spot[data-i="${i}"]`).first().dispatchEvent("click");
    }
    await expect(page.locator(".done-row")).toBeVisible();
    await page.locator(".done-row [data-next]").click();
}

export async function playOrder(page) {
    const game = page.locator("kids-story-order");
    await expect(game.locator(".tile").first()).toBeVisible();
    const order = await game.locator(".tile").evaluateAll((tiles) => tiles.map((t) => Number(t.dataset.panel)).sort((a, b) => a - b));
    for (const p of order) {
        await game.locator(`.tile[data-panel="${p}"]`).click();
    }
    await expect(page.locator(".more-games")).toBeVisible();
}

export async function playVerse(page, story, band) {
    const game = page.locator("kids-verse-builder");
    if (band === "lions") {
        for (let i = 0; i < story.verse.chunks.length; i += 1) {
            await game.locator(`[data-chunk="${i}"]`).click();
        }
    } else {
        await game.locator(`[data-word="${story.verse.blank}"]`).click();
    }
    await expect(page.locator(".done-row")).toBeVisible();
}

/** Plays a whole story from its first step to the reward screen. */
export async function playStory(page, story, band, { later = false } = {}) {
    await go(page, `/stop/${story.id}/watch`);
    await playWatch(page, story);
    await playFind(page, story, band);
    await playOrder(page);
    await page.locator(".more-games > .next-row [data-next]").click();
    await playVerse(page, story, band);
    await page.locator(".done-row [data-next]").click();
    await expect(page.locator(".talk-card")).toBeVisible();
    await page.locator(later ? "[data-later]" : "[data-talked]").click();
    await expect(page.locator(".screen.reward")).toBeVisible();
}
