/**
 * The Daily Grace Kids page (apps/pages/daily-grace-kids.html), opened from
 * the menu: the way into the kids app, and the row of Kids Stories from
 * assets/kids-stories.json, each opening its retelling from
 * assets/kids/stories/<id>.json in the story reader.
 */
import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { expectNoErrors, stubMedia, watchErrors } from "./kids-helpers.mjs";

const PAGE = "/apps/pages/daily-grace-kids.html";
const LIST = JSON.parse(readFileSync(new URL("../assets/kids-stories.json", import.meta.url), "utf8"));
const FIRST = LIST.toSorted((a, b) => a.sequence - b.sequence)[0];

test.beforeEach(async ({ page }) => {
    await stubMedia(page);
});

test("the page fits the width, with the kids card and the Kids Stories row in sequence order", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(PAGE);
    await expect(page.locator(".topbar .brand-logo")).toHaveAttribute("alt", "Daily Grace Kids");
    await expect(page.locator(".topbar a.home")).toHaveAttribute("href", "../../index.html");

    await expect(page.locator("kids-card .heading")).toHaveText("Explorer");
    const card = page.locator("kids-card a.card");
    expect(await card.evaluate((a) => a.href)).toMatch(/\/apps\/pages\/kids\.html$/);

    const row = page.locator("kids-stories");
    await expect(row.locator(".heading")).toHaveText("Kids Stories for Rascals");
    await expect.poll(() => row.evaluate((r) => r.stories.length)).toBe(LIST.length);
    const ids = await row.evaluate((r) => r.stories.map((s) => s.id));
    expect(ids).toEqual(LIST.toSorted((a, b) => a.sequence - b.sequence).map((s) => s.id));
    // The real cards, not the copies that make the row loop.
    const covers = row.locator(".item:not([aria-hidden]) .cover");
    await expect(covers).toHaveCount(LIST.length);
    await expect(covers.first()).toHaveAttribute("src", new RegExp(`/media/kids/stories/${FIRST.id}/_00\\.webp$`));

    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, "sideways scrolling").toBeLessThanOrEqual(1);
    expectNoErrors(errors);
});

test("a story's folded corner opens the kids retelling, and Home comes back here", async ({ page }) => {
    // WebKit on Windows never fires "load" on the story reader (see smoke.spec.mjs).
    test.skip(test.info().project.name !== "desktop", "runs on the desktop");
    const errors = watchErrors(page);
    const story = JSON.parse(readFileSync(new URL(`../assets/kids/stories/${FIRST.id}.json`, import.meta.url), "utf8"));
    await page.goto(PAGE);
    const ear = page.locator("kids-stories .item:not([aria-hidden]) .dog-ear").first();
    await expect(ear).toHaveAttribute("href", new RegExp(`/apps/pages/stories\\.html\\?set=kids&story=${FIRST.id}$`));
    // The two sets can share a title, so it is the file read that tells them apart.
    const read = page.waitForResponse((r) => r.url().endsWith(`/assets/kids/stories/${FIRST.id}.json`));
    await ear.click();
    expect((await read).ok()).toBe(true);
    await expect(page).toHaveURL(new RegExp(`stories\\.html\\?set=kids&story=${FIRST.id}$`));
    await expect(page).toHaveTitle(`Daily Grace — ${story.title}`);
    // The comic cover carries the title; the topbar shows only the kids logo.
    await expect(page.locator("#storyName")).toBeHidden();
    await expect(page.locator(".brand-logo")).toHaveAttribute("src", /\/kids\/daily-grace-kids-logo\.webp$/);
    await expect(page.locator(".brand-logo")).toHaveAttribute("alt", "Daily Grace Kids");
    await page.locator("#home").click();
    await expect(page).toHaveURL(/\/apps\/pages\/daily-grace-kids\.html$/);
    expectNoErrors(errors);
});

test("the stories for everyone still read from assets/stories", async ({ page }) => {
    // WebKit on Windows never fires "load" on the story reader (see smoke.spec.mjs).
    test.skip(test.info().project.name !== "desktop", "runs on the desktop");
    const story = JSON.parse(readFileSync(new URL(`../assets/stories/${FIRST.id}.json`, import.meta.url), "utf8"));
    const read = page.waitForResponse((r) => /\/assets\/(kids\/)?stories\/[^/]+\.json$/.test(r.url()));
    await page.goto(`/apps/pages/stories.html?story=${FIRST.id}`);
    expect(new URL((await read).url()).pathname).toBe(`/assets/stories/${FIRST.id}.json`);
    await expect(page.locator("#storyName")).toBeVisible();
    await expect(page.locator("#storyName")).toHaveText(story.title);
    await expect(page.locator(".brand-logo")).toHaveAttribute("alt", "Daily Grace");
});
