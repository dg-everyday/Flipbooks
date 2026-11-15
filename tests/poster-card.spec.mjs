/**
 * <poster-card> asks for its poster with CORS, as the share button needs. A
 * browser that stumbles on that request must not leave the card blank: the
 * poster is asked for once more as a plain image. The media host is stubbed.
 */
import { deflateSync } from "node:zlib";
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

/** A plain PNG, `width` by `height`, small on the wire however large it is. */
function png(width, height) {
    const table = Array.from({ length: 256 }, (_, n) => {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        return c >>> 0;
    });
    const crc = (bytes) => {
        let c = 0xffffffff;
        for (const byte of bytes) {
            c = table[(c ^ byte) & 0xff] ^ (c >>> 8);
        }
        return (c ^ 0xffffffff) >>> 0;
    };
    const chunk = (type, data) => {
        const body = Buffer.concat([Buffer.from(type), data]);
        const length = Buffer.alloc(4);
        length.writeUInt32BE(data.length);
        const sum = Buffer.alloc(4);
        sum.writeUInt32BE(crc(body));
        return Buffer.concat([length, body, sum]);
    };
    const header = Buffer.alloc(13);
    header.writeUInt32BE(width, 0);
    header.writeUInt32BE(height, 4);
    header.set([8, 2, 0, 0, 0], 8); // 8 bits a channel, RGB
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk("IHDR", header),
        chunk("IDAT", deflateSync(Buffer.alloc((1 + 3 * width) * height))),
        chunk("IEND", Buffer.alloc(0)),
    ]);
}

test.describe("the picture the poster card shares", () => {
    test.beforeEach(({}, testInfo) => {
        test.skip(!["desktop", "iphone"].includes(testInfo.project.name), "one screen per engine is enough");
    });

    for (const [name, width, height, expected] of [
        ["a full-size poster is scaled down to 2048 on its long side", 2700, 4800, [1152, 2048]],
        ["a small poster is shared at its own size", 941, 1672, [941, 1672]],
    ]) {
        test(name, async ({ page }) => {
            // A share sheet that takes files, and keeps what it is given.
            await page.addInitScript(() => {
                navigator.canShare = () => true;
                navigator.share = async (data) => {
                    window.shared = data;
                };
            });
            const body = png(width, height);
            await openDay(page, (route) =>
                route.fulfill({ body, contentType: "image/png", headers: { "access-control-allow-origin": "*" } }),
            );
            await expect.poll(() => poster(page).evaluate((img) => img.naturalWidth)).toBe(width);
            await page.locator("poster-card").first().locator("button.share").click();
            await expect.poll(() => page.evaluate(() => window.shared?.files?.[0]?.name)).toBe(
                "Daily Grace - October 1, 2026.jpg",
            );
            const size = await page.evaluate(async () => {
                const file = window.shared.files[0];
                const bitmap = await createImageBitmap(file);
                return { type: file.type, size: [bitmap.width, bitmap.height] };
            });
            expect(size).toEqual({ type: "image/jpeg", size: expected });
        });
    }
});
