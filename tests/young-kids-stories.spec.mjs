/**
 * <young-kids-stories> on the Daily Grace Kids page: the young explorers'
 * stories from assets/young-kids-stories.json, in a notebook that flips upward
 * (<flip-book flip="up">).
 */
import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { expectNoErrors, stubMedia, watchErrors } from "./kids-helpers.mjs";

const PAGE = "/apps/pages/daily-grace-kids.html";
const LIST = JSON.parse(readFileSync(new URL("../assets/young-kids-stories.json", import.meta.url), "utf8")).toSorted(
    (a, b) => a.sequence - b.sequence,
);

// The covers are 9:16, and the caption's offset is worked out for that shape,
// so the stand-in picture is 9:16 too (the shared one is square).
const COVER = '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640"><rect width="360" height="640" fill="#2b6e48"/></svg>';

test.beforeEach(async ({ page }) => {
    await stubMedia(page);
    // Routes added later are tried first.
    await page.route(/\/media\/kids\/stories\/young\/.*\.webp$/, (route) =>
        route.fulfill({ status: 200, contentType: "image/svg+xml", headers: { "Access-Control-Allow-Origin": "*" }, body: COVER }),
    );
});

test("the notebook follows the kids card and holds one page per story, in order", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(PAGE);
    const order = await page.evaluate(() => [...document.querySelector("main").children].map((el) => el.localName));
    expect(order.slice(0, 2)).toEqual(["kids-card", "young-kids-stories"]);

    const shelf = page.locator("young-kids-stories");
    await expect.poll(() => shelf.evaluate((el) => el.stories.length)).toBe(LIST.length);
    expect(await shelf.evaluate((el) => el.stories.map((s) => s.id))).toEqual(LIST.map((s) => s.id));
    await expect(shelf.locator(".title")).toHaveText(LIST[0].title);
    await expect(shelf.locator(".about")).toHaveText(LIST[0].description);
    await expect(shelf.locator(".heading")).toHaveText("Kids Stories for Rugrats");

    // The caption keeps to the page's width, and the page fills the case.
    const lefts = await shelf.evaluate((el) => {
        const book = el.shadowRoot.querySelector("flip-book").shadowRoot.getElementById("book");
        const title = el.shadowRoot.querySelector(".title").getBoundingClientRect();
        const page = book.getBoundingClientRect();
        const desk = el.shadowRoot.querySelector(".desk").getBoundingClientRect();
        return { left: title.left - page.left, right: title.right - page.right, fill: page.width / desk.width };
    });
    expect(Math.abs(lefts.left), "caption starts with the page").toBeLessThanOrEqual(2);
    expect(Math.abs(lefts.right), "caption ends with the page").toBeLessThanOrEqual(2);
    // Wide like the kids app's reader: the page takes most of the case.
    expect(lefts.fill).toBeGreaterThan(0.85);
    await expect(shelf.locator("flip-book")).toHaveAttribute("flip", "up");

    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, "sideways scrolling").toBeLessThanOrEqual(1);
    expectNoErrors(errors);
});

test("the pages turn on a hinge along the top, and a swipe up moves on, a swipe down goes back", async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto(PAGE);
    const shelf = page.locator("young-kids-stories");
    await expect(shelf.locator(".title")).toHaveText(LIST[0].title);
    await shelf.scrollIntoViewIfNeeded();

    // Stays in one single page, even on a wide screen.
    const hinge = await shelf.locator("flip-book").evaluate((book) => {
        const root = book.shadowRoot;
        const bookEl = root.getElementById("book");
        const spread = root.getElementById("desktopSpread");
        const stage = root.getElementById("stage").getBoundingClientRect();
        const rect = bookEl.getBoundingClientRect();
        return {
            bookShown: getComputedStyle(bookEl).display,
            spreadShown: getComputedStyle(spread).display,
            // The rings' overhang above the page, inside the stage.
            gap: rect.top - stage.top,
            inside: rect.left >= stage.left && rect.right <= stage.right && rect.bottom <= stage.bottom,
        };
    });
    expect(hinge.bookShown).toBe("block");
    expect(hinge.spreadShown).toBe("none");
    expect(hinge.gap).toBeGreaterThanOrEqual(14);
    expect(hinge.inside).toBe(true);

    // A swipe up turns forward, a swipe down back.
    // The book is taller than the screen: swipe across the part in view.
    await shelf.locator("flip-book").evaluate((book) => book.scrollIntoView({ block: "center" }));
    const box = await shelf.locator("flip-book").boundingBox();
    const x = box.x + box.width / 2;
    const swipe = async (from, to) => {
        await page.mouse.move(x, from);
        await page.mouse.down();
        await page.mouse.move(x, (from + to) / 2, { steps: 4 });
        await page.mouse.move(x, to, { steps: 4 });
        await page.mouse.up();
    };
    const y = Math.min(box.y + box.height / 2, page.viewportSize().height / 2);
    await expect(shelf.locator("flip-book")).toHaveJSProperty("pageCount", LIST.length);
    await swipe(y + 90, y - 90);
    await expect(shelf.locator(".title")).toHaveText(LIST[1].title);
    await swipe(y + 90, y - 90);
    await expect(shelf.locator(".title")).toHaveText(LIST[2].title);
    await swipe(y - 90, y + 90);
    await expect(shelf.locator(".title")).toHaveText(LIST[1].title);
    expectNoErrors(errors);
});

test("the last story is the last page, with no blank leaf after it", async ({ page }) => {
    await page.goto(PAGE);
    const shelf = page.locator("young-kids-stories");
    await expect(shelf.locator("flip-book")).toHaveJSProperty("pageCount", LIST.length);
    for (let i = 1; i < LIST.length; i++) {
        await shelf.evaluate((el) => el.next());
        await expect(shelf.locator(".title")).toHaveText(LIST[i].title);
    }
    // The last story is the last page: another turn stays put.
    await shelf.evaluate((el) => el.next());
    await page.waitForTimeout(500);
    await expect(shelf.locator(".title")).toHaveText(LIST.at(-1).title);
});
