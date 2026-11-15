/**
 * <poster-card> asks for its poster with CORS, as the share button needs. A
 * browser that stumbles on that request must not leave the card blank: the
 * poster is asked for once more as a plain image. The media host is stubbed.
 */
import { test, expect } from "@playwright/test";

const PAGE = "/apps/pages/library.html#day/2026-10-01";
const POSTER = /dailygrace\.faith\/media\/images\/sources\/2026\/october\/October(%20| )1,(%20| )2026\.webp/;
// A one-pixel PNG; the browser goes by the content type, not the file's name.
const PIXEL = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
);

const poster = (page) => page.locator("poster-card").first().locator("img.poster");

async function openDay(page, answer) {
    const asked = [];
    await page.route(/dailygrace\.faith\/media\//, (route) => route.fulfill({ status: 404 }));
    await page.route(POSTER, (route) => {
        const cors = Boolean(route.request().headers().origin);
        asked.push(cors ? "cors" : "plain");
        return answer(route, cors);
    });
    await page.goto(PAGE);
    return asked;
}

test.describe("the poster card's picture", () => {
    // Chromium on the desktop and WebKit on the iPhone.
    test.beforeEach(({}, testInfo) => {
        test.skip(!["desktop", "iphone"].includes(testInfo.project.name), "one screen per engine is enough");
    });

    test("is asked for again as a plain image when the CORS request fails", async ({ page }) => {
        const asked = await openDay(page, (route, cors) =>
            cors ? route.abort() : route.fulfill({ body: PIXEL, contentType: "image/png" }),
        );
        await expect.poll(() => poster(page).evaluate((img) => img.naturalWidth)).toBe(1);
        expect(await poster(page).evaluate((img) => img.crossOrigin)).toBeNull();
        expect(asked).toEqual(["cors", "plain"]);
    });

    test("stays a CORS image when that request succeeds", async ({ page }) => {
        const asked = await openDay(page, (route) =>
            route.fulfill({
                body: PIXEL,
                contentType: "image/png",
                headers: { "access-control-allow-origin": "*" },
            }),
        );
        await expect.poll(() => poster(page).evaluate((img) => img.naturalWidth)).toBe(1);
        expect(await poster(page).evaluate((img) => img.crossOrigin)).toBe("anonymous");
        expect(asked).toEqual(["cors"]);
    });

    test("gives up after the one retry when there is no poster", async ({ page }) => {
        const asked = await openDay(page, (route) => route.fulfill({ status: 404 }));
        await expect.poll(() => asked.length).toBe(2);
        await page.waitForTimeout(500);
        expect(asked).toEqual(["cors", "plain"]);
    });
});
