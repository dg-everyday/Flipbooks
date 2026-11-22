/**
 * The Bible Study Guides menu (<study-guide-menu>): the guides as a grid of
 * icons, three to a row; a hold on one shows what it covers without opening
 * it; Support, Help and About at the foot, Support first.
 */
import { test, expect } from "@playwright/test";

const menu = (page) => page.locator("study-guide-menu");
const drawer = (page) => menu(page).locator(".menu-dialog");
const guides = (page) => menu(page).locator(".menu-grid a.menu-item");
const peek = (page) => menu(page).locator(".menu-peek");

test.beforeEach(async ({ page }) => {
    await page.route(/dailygrace\.faith\/media\//, (route) => route.fulfill({ status: 404 }));
    await page.addInitScript(() => {
        // An avatar, and today's trivia already shown, so no popup is in the way.
        localStorage.setItem("dailygrace:avatar", "AV-01");
        const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
        localStorage.setItem("dailygrace.trivia", JSON.stringify({ day, count: 99, last: Date.now() }));
    });
    await page.goto("/");
    await menu(page).evaluate((element) => element.open());
    // Let the drawer finish sliding in, so the icons are where they stay.
    await drawer(page).evaluate((dialog) =>
        Promise.all(dialog.getAnimations().map((animation) => animation.finished)),
    );
});

/** Holds the mouse on a guide's icon for longer than the half-second hold. */
async function hold(page, item) {
    const box = await item.locator(".menu-tile").boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(700);
    await page.mouse.up();
}

test("the guides are icons on 60 px tiles, three to a row", async ({ page }) => {
    const boxes = [];
    for (let i = 0; i < 4; i += 1) {
        boxes.push(await guides(page).nth(i).locator(".menu-tile").boundingBox());
    }
    expect(Math.round(boxes[0].width)).toBe(60);
    expect(Math.round(boxes[0].height)).toBe(60);
    expect(Math.abs(boxes[1].y - boxes[0].y)).toBeLessThanOrEqual(1);
    expect(Math.abs(boxes[2].y - boxes[0].y)).toBeLessThanOrEqual(1);
    expect(boxes[3].y).toBeGreaterThan(boxes[0].y + 60);
    await expect(guides(page).first().locator(".menu-label")).toHaveText("Books of the Bible");
});

test("Support comes first at the foot, then Help and About", async ({ page }) => {
    const order = await menu(page)
        .locator(".menu-foot [data-show]")
        .evaluateAll((buttons) => buttons.map((button) => button.dataset.show));
    expect(order).toEqual(["support", "help", "about"]);
    await expect(menu(page).locator('[data-show="support"]')).toHaveAccessibleName("Support Daily Grace");
});

test("a guide's description is read out with its title", async ({ page }) => {
    await expect(guides(page).first()).toHaveAccessibleName(/^Books of the Bible.*All 66 books/);
});

test("holding a guide shows what it covers, and doesn't open it", async ({ page }) => {
    const item = guides(page).nth(2); // Bible Characters, after Books of the Bible and The Living Voice
    await hold(page, item);
    await expect(peek(page)).toBeVisible();
    await expect(peek(page).locator(".menu-peek-title")).toHaveText("Bible Characters");
    await expect(peek(page).locator(".menu-peek-text")).toHaveText(
        "The people of the Bible, from Adam to the first church, and why they matter",
    );
    // A tap on the bubble opens the same guide.
    expect(await peek(page).getAttribute("href")).toBe(await item.getAttribute("href"));
    await expect(page).toHaveURL(/\/(index\.html)?$/);
    await expect(drawer(page)).toBeVisible();

    // A tap elsewhere only puts the bubble away.
    await menu(page).locator(".menu-header").click();
    await expect(peek(page)).toBeHidden();
    await expect(drawer(page)).toBeVisible();
});

test("a held guide near the foot keeps its bubble on screen", async ({ page }) => {
    const item = guides(page).last();
    await item.scrollIntoViewIfNeeded();
    await hold(page, item);
    await expect(peek(page)).toBeVisible();
    const tile = await item.locator(".menu-tile").boundingBox();
    const bubble = await peek(page).boundingBox();
    const view = page.viewportSize();
    // Wherever it sits, the bubble is all on screen and clear of the icon.
    expect(bubble.y).toBeGreaterThanOrEqual(0);
    expect(bubble.y + bubble.height).toBeLessThanOrEqual(view.height);
    const clear = bubble.y + bubble.height <= tile.y || bubble.y >= tile.y + tile.height;
    expect(clear).toBe(true);
});

test("Escape puts the bubble away first, then closes the menu", async ({ page }) => {
    await hold(page, guides(page).first());
    await expect(peek(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(peek(page)).toBeHidden();
    await expect(drawer(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer(page)).toBeHidden();
});

test("a quick tap still opens the guide", async ({ page }) => {
    await guides(page).first().click();
    await expect(page).toHaveURL(/apps\/pages\/bible-books\.html$/);
});

test("the drawer is gold Mon–Wed, aluminium Thu–Fri, navy on Saturday and wet-look red on Sunday, by Manila's calendar", async ({ page }) => {
    const reopenAt = async (time) => {
        await menu(page).evaluate((element) => element.close());
        await page.clock.setFixedTime(time);
        await menu(page).evaluate((element) => element.open());
    };
    const title = drawer(page).locator(".menu-header h2");
    const aboutEmblem = menu(page).locator('[data-show="about"] .foot-emblem:visible');
    const background = () => drawer(page).evaluate((dialog) => getComputedStyle(dialog).backgroundImage);
    const expectTheme = async (theme) => {
        await expect(drawer(page)).toHaveAttribute("data-theme", theme);
        if (theme === "gold" || theme === "aluminum") {
            await expect(drawer(page)).toHaveClass(/\bis-light\b/);
            await expect(title).toHaveCSS("color", "rgb(0, 27, 52)");
            await expect(aboutEmblem).toHaveClass(/\bon-light\b/);
        } else {
            await expect(drawer(page)).not.toHaveClass(/\bis-light\b/);
            await expect(title).toHaveCSS("color", "rgb(243, 231, 210)");
            await expect(aboutEmblem).not.toHaveClass(/\bon-light\b/);
        }
    };

    // Monday morning: brushed gold.
    await reopenAt(new Date("2026-11-23T09:00:00+08:00"));
    await expectTheme("gold");
    expect(await background()).toContain("rgb(237, 205, 124)");

    // Wednesday, half an hour before midnight in Manila: still gold.
    await reopenAt(new Date("2026-11-25T23:30:00+08:00"));
    await expectTheme("gold");

    // Thursday in Manila, though still Wednesday in UTC: brushed aluminium,
    // the same light dress in silver.
    await reopenAt(new Date("2026-11-26T00:30:00+08:00"));
    await expectTheme("aluminum");
    expect(await background()).toContain("rgb(238, 241, 244)");

    // Friday, half an hour before midnight in Manila: still aluminium.
    await reopenAt(new Date("2026-11-27T23:30:00+08:00"));
    await expectTheme("aluminum");

    // Saturday in Manila, though still Friday in UTC: navy aurora, with no
    // tooled line.
    await reopenAt(new Date("2026-11-28T00:30:00+08:00"));
    await expectTheme("navy");
    expect(await drawer(page).evaluate((dialog) => getComputedStyle(dialog).outlineStyle)).toBe("none");

    // Sunday in Manila, though still Saturday in UTC: wet-look red car paint,
    // with its metallic flake, and no tooled line.
    await reopenAt(new Date("2026-11-29T00:30:00+08:00"));
    await expectTheme("red-paint");
    const paint = await drawer(page).evaluate((dialog) => {
        const style = getComputedStyle(dialog);
        return { background: style.backgroundImage, outline: style.outlineStyle };
    });
    expect(paint.background).toContain("rgb(192, 13, 34)");
    expect(paint.background).toContain("data:image/svg+xml");
    expect(paint.outline).toBe("none");

    // Monday in Manila, though still Sunday in UTC: gold again.
    await reopenAt(new Date("2026-11-30T00:30:00+08:00"));
    await expectTheme("gold");
});
