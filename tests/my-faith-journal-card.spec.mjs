/**
 * The home page's way into My Faith Journal (apps/components/my-faith-journal.js):
 * after the Daily Grace Kids card, the still picture first, the video only
 * after the page has loaded and while on screen, the still picture alone with
 * reduced motion, Save-Data or a video that can't play, and the card opening
 * the journal. The layout runs on every screen; the rest on the desktop.
 */
import { test, expect } from "@playwright/test";

const desktopOnly = () => test.skip(test.info().project.name !== "desktop", "runs on the desktop");

const seed = () => {
    localStorage.setItem("dailygrace:avatar", "AV-01");
    // Today's trivia already played, so no quiz opens over the home page.
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
    localStorage.setItem("dailygrace.trivia", JSON.stringify({ day, count: 99, last: Date.now() }));
};

test("the card follows Daily Grace Kids, plays its video once loaded and opens the journal", async ({ page }) => {
    await page.addInitScript(seed);
    let loaded = false;
    let early = false;
    page.on("load", () => {
        loaded = true;
    });
    page.on("request", (r) => {
        if (r.url().includes("my-faith-journal.mp4") && !loaded) {
            early = true;
        }
    });
    await page.goto("/");
    await page.waitForLoadState("load");
    const order = await page.locator(".devotional-stack > *").evaluateAll((els) => els.map((e) => e.localName));
    expect(order.indexOf("my-faith-journal")).toBe(order.indexOf("kids-card") + 1);

    const card = page.locator("my-faith-journal");
    await expect(card.locator("img")).toHaveAttribute("src", /my-faith-journal\.webp$/);
    await card.scrollIntoViewIfNeeded();
    const video = card.locator("video");
    await expect(video).toHaveAttribute("src", /my-faith-journal\.mp4$/);
    expect(await video.evaluate((v) => v.muted && v.loop && v.playsInline)).toBe(true);
    await expect.poll(async () => {
        await card.scrollIntoViewIfNeeded();
        return video.evaluate((v) => !v.paused && v.currentTime > 0);
    }, { timeout: 20_000 }).toBe(true);
    expect(early, "the video was fetched before the page had loaded").toBe(false);

    await expect(card.locator(".go")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    await card.locator("a.card").click();
    await expect(page).toHaveURL(/apps\/pages\/journal\.html/);
});

test("the card shows the still picture only, with reduced motion or Save-Data", async ({ browser }) => {
    desktopOnly();
    for (const options of [{ reducedMotion: "reduce" }, {}]) {
        const context = await browser.newContext(options);
        const page = await context.newPage();
        if (!options.reducedMotion) {
            await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } }));
        }
        await page.addInitScript(seed);
        await page.goto("/");
        const card = page.locator("my-faith-journal");
        await card.scrollIntoViewIfNeeded();
        await page.waitForTimeout(800);
        expect(await card.locator("video").count()).toBe(0);
        await expect(card.locator("img")).toBeVisible();
        await context.close();
    }
});

test("the card keeps the still picture when the video can't play", async ({ page }) => {
    desktopOnly();
    await page.addInitScript(seed);
    await page.addInitScript(() => {
        HTMLVideoElement.prototype.play = () => Promise.reject(new DOMException("unsupported", "NotSupportedError"));
    });
    await page.goto("/");
    const card = page.locator("my-faith-journal");
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator("video")).toHaveCount(0);
    await expect(card.locator("img")).toBeVisible();
});
