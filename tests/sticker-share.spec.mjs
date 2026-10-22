/**
 * Earned stickers can be shared: from the Sticker Album's sticker view and
 * from the "A gift for you" popup. Where the browser can share files, a JPEG of
 * the sticker on a cream square goes to the share sheet; with no share sheet,
 * the sticker's link is copied. The share sheet itself is stood in for, so the
 * test sees exactly what would be sent.
 */
import { test, expect } from "@playwright/test";

const STICKER = { id: "BS-01", title: "God Takes Care of Me" };

/** Earned stickers, as sticker-awards.js keeps them. */
function collection({ seen }) {
    return JSON.stringify({
        started: "2026-10-20",
        welcomed: true,
        earned: {
            [STICKER.id]: { day: "2026-10-20", path: "verses", n: 1, seen },
        },
        surprises: [],
    });
}

/** Stands in for the share sheet: what is shared lands in window.__shared. */
function fakeShareSheet() {
    window.__shared = [];
    navigator.canShare = (data) => Boolean(data);
    navigator.share = async (data) => {
        const file = data.files?.[0];
        let size = null;
        if (file) {
            const bitmap = await createImageBitmap(file);
            size = [bitmap.width, bitmap.height];
        }
        window.__shared.push({
            title: data.title,
            text: data.text,
            url: data.url ?? null,
            file: file ? { name: file.name, type: file.type, size } : null,
        });
    };
}

const sharedPicture = {
    name: `Daily Grace sticker - ${STICKER.title}.jpg`,
    type: "image/jpeg",
    size: [800, 800],
};

test.describe("sharing stickers", () => {
    test.skip(({ browserName, isMobile }) => browserName !== "chromium" || isMobile,
        "the share sheet is stood in for; one browser is enough");

    test("the album shares the sticker as a picture", async ({ page }) => {
        await page.addInitScript(fakeShareSheet);
        await page.addInitScript((value) => {
            localStorage.setItem("dailygrace:stickers", value);
        }, collection({ seen: true }));
        await page.goto(`/apps/pages/stickers.html#${STICKER.id}`);

        const share = page.locator(".sticker-share");
        await expect(share).toBeVisible();
        await share.click();
        await expect.poll(() => page.evaluate(() => window.__shared.length)).toBe(1);
        const [sent] = await page.evaluate(() => window.__shared);
        expect(sent.file).toEqual(sharedPicture);
        expect(sent.text).toContain(`"${STICKER.title}"`);
        expect(sent.text).toContain("https://dailygrace.faith/");
    });

    test("the album copies the link where there is no share sheet", async ({ page, context }) => {
        await context.grantPermissions(["clipboard-read", "clipboard-write"]);
        await page.addInitScript(() => {
            delete Navigator.prototype.share;
            delete Navigator.prototype.canShare;
        });
        await page.addInitScript((value) => {
            localStorage.setItem("dailygrace:stickers", value);
        }, collection({ seen: true }));
        await page.goto(`/apps/pages/stickers.html#${STICKER.id}`);

        await page.locator(".sticker-share").click();
        await expect(page.locator(".sticker-note")).toHaveText("Link to the sticker copied");
        expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(
            /\/stickers\/bible-sayings\/BS-01-god-takes-care-of-me\.png$/,
        );
    });

    test("the gift popup shares the new sticker", async ({ page }) => {
        await page.addInitScript(fakeShareSheet);
        await page.addInitScript((value) => {
            localStorage.setItem("dailygrace:stickers", value);
        }, collection({ seen: false }));
        await page.goto("/");
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => document.querySelector("sticker-gifts").reveal());

        const share = page.locator("sticker-gifts dialog .share");
        await expect(share).toBeVisible();
        await expect(page.locator("sticker-gifts #gift-title")).toHaveText(STICKER.title);
        await share.click();
        await expect.poll(() => page.evaluate(() => window.__shared.length)).toBe(1);
        const [sent] = await page.evaluate(() => window.__shared);
        expect(sent.file).toEqual(sharedPicture);
    });
});
