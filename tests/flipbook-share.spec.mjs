/**
 * Sharing the week from the Flipbook (apps/pages/flipbook.html,
 * apps/pages/scripts/flipbook-share.js, <flip-book>'s `share` page option):
 * only the week's cover carries a share button, and a tap shares a link to
 * the Flipbook (never a picture) through the device's share sheet, or copies
 * the link where there is no share sheet. Every picture on the media host is a stand-in, and the
 * rest of it is missing, so nothing waits on R2. The share sheet is stood in
 * for, and records what it was given.
 */
import { test, expect } from "@playwright/test";

const PAGE = "/apps/pages/flipbook.html";
// 10 a.m. in Manila on Friday, November 20, 2026: week 47, November 15–21.
const TODAY = new Date("2026-11-20T10:00:00+08:00");
const WEEK_LINK = "https://dailygrace.faith/apps/pages/flipbook.html?date=2026-11-03";
const TODAY_LINK = "https://dailygrace.faith/apps/pages/flipbook.html?date=2026-11-20";
const STAND_IN = "assets/images/apple-touch-icon.png";

const shareButtons = (page) => page.locator("flip-book .page-share");
// The book is drawn twice, a single page and a two-page spread, one on show at a time.
const coverShare = (page) => page.locator("flip-book .page-share.is-placed").filter({ visible: true });
const note = (page) => page.locator(".share-note");

/** A device whose share sheet takes files (`files`), only links, or is missing (`none`). */
async function shareSheet(page, kind) {
    await page.addInitScript((kind) => {
        window.shared = [];
        if (kind === "none") {
            delete Navigator.prototype.share;
            delete Navigator.prototype.canShare;
            return;
        }
        navigator.canShare = (data) => kind === "files" || !data?.files;
        navigator.share = async (data) => {
            window.shared.push({
                files: (data.files ?? []).map((file) => ({ name: file.name, type: file.type, size: file.size })),
                title: data.title,
                text: data.text,
                url: data.url,
            });
        };
    }, kind);
}

/** The page, once the cover's share button is on show. WebKit on Windows never
    fires "load" on the Flipbook (see smoke.spec.mjs), so this waits for the DOM. */
async function open(page, path) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(coverShare(page)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(TODAY);
    await page.route(/dailygrace\.faith\/media\//, (route) => {
        if (/\/images\//.test(route.request().url())) {
            return route.fulfill({ path: STAND_IN, contentType: "image/png" });
        }
        return route.fulfill({ status: 404 });
    });
});

test("only the week's cover has a share button, and it shares a link to the Flipbook, not a picture", async ({ page }) => {
    await shareSheet(page, "files");
    await open(page, `${PAGE}?date=2026-11-03`);
    // One for the cover in each drawing of the book, and none for the days.
    await expect(shareButtons(page)).toHaveCount(2);

    await coverShare(page).click();
    await expect.poll(() => page.evaluate(() => window.shared.length)).toBe(1);
    const [shared] = await page.evaluate(() => window.shared);
    // November 3, 2026 falls in the week of November 1–7.
    expect(shared.files).toHaveLength(0);
    expect(shared.url).toBe(WEEK_LINK);
    expect(shared.title).toBe("Daily Grace Flipbook for the week of November 1 – 7, 2026");
    // The link only in `url`, so no app pastes it twice.
    expect(shared.text).toBe("Daily Grace Flipbook for the week of November 1 – 7, 2026");
    // No menu of its own: the device's share sheet is the menu.
    await expect(page.locator("#share-menu")).toHaveCount(0);
});

test("with no date, the link names today, so it opens on this week", async ({ page }) => {
    await shareSheet(page, "files");
    await open(page, PAGE);
    await coverShare(page).click();
    await expect.poll(() => page.evaluate(() => window.shared.length)).toBe(1);
    const [shared] = await page.evaluate(() => window.shared);
    expect(shared.url).toBe(TODAY_LINK);
    expect(shared.title).toBe("Daily Grace Flipbook for the week of November 15 – 21, 2026");
});

test("a share sheet that takes only links is sent the same link", async ({ page }) => {
    await shareSheet(page, "links");
    await open(page, `${PAGE}?date=2026-11-03`);
    await coverShare(page).click();
    await expect.poll(() => page.evaluate(() => window.shared.length)).toBe(1);
    const [shared] = await page.evaluate(() => window.shared);
    expect(shared.files).toHaveLength(0);
    expect(shared.url).toBe(WEEK_LINK);
});

test("the shared link opens the Flipbook directly, on the same week", async ({ page }) => {
    await page.goto(WEEK_LINK.replace("https://dailygrace.faith", ""), { waitUntil: "domcontentloaded" });
    await expect(page.locator("#library")).toHaveAttribute("href", "library.html#month/2026-11");
    await expect(coverShare(page)).toBeVisible();
});

test("with no share sheet, the link is copied, and it says so", async ({ page, context }) => {
    test.skip(test.info().project.name !== "desktop", "clipboard permissions are Chromium's");
    await shareSheet(page, "none");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await open(page, `${PAGE}?date=2026-11-03`);
    await coverShare(page).click();
    await expect(note(page)).toHaveText("Link copied");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(WEEK_LINK);
    await expect(note(page)).toBeHidden({ timeout: 4000 });
});

test("a tap on the share button does not turn the page", async ({ page }) => {
    await shareSheet(page, "files");
    await open(page, `${PAGE}?date=2026-11-03`);
    const turned = page.evaluate(
        () =>
            new Promise((resolve) => {
                document.querySelector("flip-book").addEventListener("pagechange", () => resolve(true), { once: true });
                setTimeout(() => resolve(false), 1500);
            }),
    );
    await coverShare(page).click();
    expect(await turned).toBe(false);
    await expect(coverShare(page)).toBeVisible();
});
