/**
 * "Arrange my home page" (<card-arranger>): the reader puts the home page's
 * cards in their own order, all but today's banner and poster, and the order
 * is kept on this device for the next visit.
 */
import { test, expect } from "@playwright/test";

const KEY = "dailygrace:card-order";
const USUAL = [
    "daily-moment",
    "journey-card",
    "memory-verse",
    "bible-walk-card",
    "daily-food-for-thought",
    "daily-guidance",
    "did-you-know",
    "story-carousel",
    "red-letter",
    "bible-sayings",
    "gods-blueprint",
    "sticker-gifts",
    "kids-card",
    "my-faith-journal",
];

const sheet = (page) => page.locator("card-arranger dialog");
const rows = (page) => page.locator("card-arranger .cards .row");
const row = (page, id) => page.locator(`card-arranger .cards .row[data-id="${id}"]`);

/** The cards in the order the page shows them: DOM order, then CSS order. */
const shownOrder = (page) =>
    page.locator("#devotional-stack").evaluate((stack) =>
        [...stack.children]
            .map((card, index) => ({ id: card.id, index, order: Number(card.style.order) || 0 }))
            .sort((a, b) => a.order - b.order || a.index - b.index)
            .map(({ id }) => id),
    );

const listedOrder = (page) =>
    rows(page).evaluateAll((items) => items.map((item) => item.dataset.id));

async function setUp(page, saved) {
    await page.route(/dailygrace\.faith\/media\//, (route) => route.fulfill({ status: 404 }));
    await page.addInitScript(
        ([key, order]) => {
            // An avatar, and today's trivia already shown, so no popup is in the way.
            localStorage.setItem("dailygrace:avatar", "AV-01");
            const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
            localStorage.setItem("dailygrace.trivia", JSON.stringify({ day, count: 99, last: Date.now() }));
            // Only on the first load, so a reload keeps what the test saved.
            if (order && !sessionStorage.getItem("seeded")) {
                localStorage.setItem(key, JSON.stringify(order));
                sessionStorage.setItem("seeded", "1");
            }
        },
        [KEY, saved ?? null],
    );
    await page.goto("/");
    // The menu item does nothing until the sheet's script has loaded.
    await page.waitForFunction(() => customElements.get("card-arranger"));
}

/** Opens the sheet the only way the page offers: the avatar's menu. */
async function openSheet(page) {
    await page.locator("dg-menu").evaluate((menu) => menu.open());
    await page.locator("dg-menu").locator('[data-action="arrange"]').click();
    await expect(sheet(page)).toBeVisible();
    await sheet(page).evaluate((dialog) =>
        Promise.all(dialog.getAnimations().map((animation) => animation.finished)),
    );
}

test("the banner and poster stay first; every other card is listed, in the usual order", async ({ page }) => {
    await setUp(page);
    await openSheet(page);
    await expect(page.locator("card-arranger .fixed .row")).toHaveText([
        /Today's banner and today's poster\s*Always at the top/,
    ]);
    expect(await listedOrder(page)).toEqual(USUAL);
    await expect(row(page, "journey-card")).toContainText("Not showing today");
    await expect(page.locator("card-arranger .reset")).toBeDisabled();
});

test("the arrows move a card, on the page at once, and the order is remembered", async ({ page }) => {
    await setUp(page);
    await openSheet(page);
    await row(page, "kids-card").locator(".up").click();
    await row(page, "kids-card").locator(".up").click();
    const moved = [...USUAL];
    moved.splice(moved.indexOf("kids-card"), 1);
    moved.splice(moved.indexOf("gods-blueprint"), 0, "kids-card");
    expect(await listedOrder(page)).toEqual(moved);
    await expect(page.locator("card-arranger [role=status]")).toHaveText("Daily Grace Kids, 11 of 14.");

    await page.locator("card-arranger .done").click();
    await expect(sheet(page)).toBeHidden();
    const shown = await shownOrder(page);
    expect(shown.slice(0, 2)).toEqual(["banner-slider", "poster-card"]);
    expect(shown.slice(2)).toEqual(moved);
    // On the page too: Daily Grace Kids now sits above Following God's Blueprint.
    const kids = await page.locator("#kids-card").boundingBox();
    const blueprint = await page.locator("#gods-blueprint").boundingBox();
    expect(kids.y).toBeLessThan(blueprint.y);

    await page.reload();
    const children = await page
        .locator("#devotional-stack")
        .evaluate((stack) => [...stack.children].map((card) => card.id));
    expect(children).toEqual(["banner-slider", "poster-card", ...moved]);
});

test("a card can be dragged by its handle", async ({ page }) => {
    await setUp(page);
    await openSheet(page);
    const grip = row(page, "daily-food-for-thought").locator(".grip");
    const target = await row(page, "did-you-know").boundingBox();
    const box = await grip.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, target.y + target.height * 0.75, { steps: 12 });
    await page.mouse.up();
    const order = await listedOrder(page);
    expect(order.indexOf("daily-food-for-thought")).toBeGreaterThan(order.indexOf("did-you-know"));
    expect([...order].sort()).toEqual([...USUAL].sort());
    const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), KEY);
    expect(saved).toEqual(order);
});

test("Back to the usual order undoes it, and forgets the saved order", async ({ page }) => {
    await setUp(page, ["my-faith-journal", ...USUAL.slice(0, -1)]);
    let children = await page
        .locator("#devotional-stack")
        .evaluate((stack) => [...stack.children].map((card) => card.id));
    expect(children.slice(0, 3)).toEqual(["banner-slider", "poster-card", "my-faith-journal"]);

    await openSheet(page);
    await page.locator("card-arranger .reset").click();
    expect(await listedOrder(page)).toEqual(USUAL);
    expect((await shownOrder(page)).slice(2)).toEqual(USUAL);
    expect(await page.evaluate((key) => localStorage.getItem(key), KEY)).toBeNull();

    await page.reload();
    children = await page
        .locator("#devotional-stack")
        .evaluate((stack) => [...stack.children].map((card) => card.id));
    expect(children.slice(2)).toEqual(USUAL);
});

test("a card the saved order doesn't know keeps its usual place after the card before it", async ({ page }) => {
    // Saved before Daily Grace Kids was a card, with one card that is gone.
    const saved = ["gone-card", ...USUAL.filter((id) => id !== "kids-card").reverse()];
    await setUp(page, saved);
    const children = await page
        .locator("#devotional-stack")
        .evaluate((stack) => [...stack.children].map((card) => card.id));
    const cards = children.slice(2);
    expect([...cards].sort()).toEqual([...USUAL].sort());
    // Usually after My Sticker Album, so it follows it here too.
    expect(cards.indexOf("kids-card")).toBe(cards.indexOf("sticker-gifts") + 1);
    expect(cards[0]).toBe("my-faith-journal");
});

test("only the DG emblem's menu opens it: the page has no button for it", async ({ page }) => {
    await setUp(page);
    await expect(page.locator("main").getByRole("button", { name: /arrange/i })).toHaveCount(0);
    await page.locator("dg-menu").evaluate((menu) => menu.open());
    await page.locator("dg-menu").locator('[data-action="arrange"]').click();
    await expect(sheet(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet(page)).toBeHidden();
});
