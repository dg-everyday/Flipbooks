/**
 * Sharing a story from the home page's Stories row (story-carousel.js): each
 * cover carries a share pill at its top left, and a tap shares a link to the
 * story (never a picture) through the device's share sheet, or copies the link
 * where there is no share sheet. The link is the story's own page, which the
 * deploy writes (assets/scripts/build-story-pages.mjs): it previews with the
 * story's cover and forwards to the story's flipbook. The Kids row has no share
 * pill, since the deploy writes no pages for its stories.
 *
 * The row is shown on a page of its own here, away from the home page's
 * welcome. Every picture on the media host is a stand-in, and the rest of it
 * is missing, so nothing waits on R2.
 */
import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const STAND_IN = "assets/images/apple-touch-icon.png";
const stories = JSON.parse(readFileSync("assets/stories.json", "utf8")).sort((a, b) => a.sequence - b.sequence);
const FIRST = stories[0];
const FIRST_LINK = `https://dailygrace.faith/s/${FIRST.id}.html`;

const ROW_PAGE = `<!doctype html><html><head><meta charset="utf-8"></head><body>
<story-carousel src="/assets/stories.json" reader="/apps/pages/stories.html"></story-carousel>
<kids-stories></kids-stories>
<script type="module" src="/apps/components/story-carousel.js?v=20261122-1"></script>
<script type="module" src="/apps/components/kids-stories.js?v=20261122-1"></script>
</body></html>`;

// The first story's real card, in the row and on screen.
const firstShare = (page) =>
    page.locator("story-carousel li:not([aria-hidden]) .pill-share").first();
// WebKit on Windows never finds anything in the row "stable" (the play pill and
// the folded corner neither), though it stays put; so the tap does not wait on it.
const tap = (locator) => locator.click({ force: true });

/** A device whose share sheet takes links, or has none (`none`). */
async function shareSheet(page, kind) {
    await page.addInitScript((kind) => {
        window.shared = [];
        if (kind === "none") {
            delete Navigator.prototype.share;
            delete Navigator.prototype.canShare;
            return;
        }
        navigator.share = async (data) => {
            window.shared.push({ files: data.files ?? [], title: data.title, text: data.text, url: data.url });
        };
    }, kind);
}

async function open(page) {
    await page.route("**/story-row-test.html", (route) =>
        route.fulfill({ body: ROW_PAGE, contentType: "text/html; charset=utf-8" }),
    );
    await page.goto("/story-row-test.html", { waitUntil: "domcontentloaded" });
    await expect(firstShare(page)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
    await page.route(/dailygrace\.faith\/media\//, (route) => {
        if (/\.(webp|png|jpe?g)$/.test(new URL(route.request().url()).pathname)) {
            return route.fulfill({ path: STAND_IN, contentType: "image/png" });
        }
        return route.fulfill({ status: 404 });
    });
});

test("each story's cover has a share pill at its top left that shares a link to the story", async ({ page }) => {
    await shareSheet(page, "links");
    await open(page);
    // Top left of the cover: nearer its left edge than its right.
    const pill = await firstShare(page).boundingBox();
    const cover = await page.locator("story-carousel li:not([aria-hidden]) .cover").first().boundingBox();
    expect(pill.x - cover.x).toBeLessThan(40);
    expect(pill.y - cover.y).toBeLessThan(40);

    await tap(firstShare(page));
    await expect.poll(() => page.evaluate(() => window.shared.length)).toBe(1);
    const [shared] = await page.evaluate(() => window.shared);
    expect(shared.files).toHaveLength(0);
    expect(shared.url).toBe(FIRST_LINK);
    expect(shared.title).toBe(`${FIRST.title} - a Bible story from Daily Grace`);
    // The link only in `url`, so no app pastes it twice.
    expect(shared.text).not.toContain("https://");
});

test("the Kids row has no share pill", async ({ page }) => {
    await open(page);
    await expect(page.locator("kids-stories .cover").first()).toBeAttached();
    await expect(page.locator("kids-stories .pill-share")).toHaveCount(0);
});

test("with no share sheet, the link is copied, and it says so", async ({ page, context }) => {
    test.skip(test.info().project.name !== "desktop", "clipboard permissions are Chromium's");
    await shareSheet(page, "none");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await open(page);
    await tap(firstShare(page));
    await expect(page.locator(".story-share-note")).toHaveText("Link copied");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(FIRST_LINK);
    await expect(page.locator(".story-share-note")).toBeHidden({ timeout: 4000 });
});

// What the deploy writes, made here into a folder of its own, without asking
// the media host for anything.
function buildStoryPages() {
    const folder = mkdtempSync(join(tmpdir(), "story-pages-"));
    execFileSync(process.execPath, [
        fileURLToPath(new URL("../assets/scripts/build-story-pages.mjs", import.meta.url)),
        folder,
        "--offline",
    ]);
    return folder;
}

test("a page is written for each story, with its cover for the preview", async () => {
    const folder = buildStoryPages();
    expect(readdirSync(join(folder, "s")).filter((name) => name.endsWith(".html"))).toHaveLength(stories.length);
    const html = readFileSync(join(folder, "s", `${FIRST.id}.html`), "utf8");
    const cover = FIRST.cover_page.replace(/^media:/, "https://dailygrace.faith/media/");
    expect(html).toContain(`<meta property="og:image" content="${cover}" />`);
    expect(html).toContain(`<meta property="og:url" content="${FIRST_LINK}" />`);
    expect(html).toContain('<meta name="robots" content="noindex" />');
    // Crawlers follow a refresh and would preview the reader instead.
    expect(html).not.toContain("http-equiv");
});

test("the shared link opens the story's flipbook", async ({ page }) => {
    const folder = buildStoryPages();
    // The story pages live only in the published copy, so this one is served by hand.
    await page.route(`**/s/${FIRST.id}.html`, (route) =>
        route.fulfill({ path: join(folder, "s", `${FIRST.id}.html`), contentType: "text/html; charset=utf-8" }),
    );
    await page.goto(`/s/${FIRST.id}.html`, { waitUntil: "commit" });
    await page.waitForURL(`**/apps/pages/stories.html?story=${FIRST.id}`, { waitUntil: "commit" });
});
