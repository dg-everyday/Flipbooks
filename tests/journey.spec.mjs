/**
 * "Your Year's Journey in Grace": the home page's <journey-card> from
 * December 29 to January 10 (Manila), and the journey itself in the Daily
 * Grace Archives (#journey/<year>), read from what the device has kept. The
 * media host is stubbed out (every file missing), so nothing waits on R2.
 */
import { test, expect } from "@playwright/test";

const ARCHIVES = "/apps/pages/library.html";
const at = (iso) => new Date(`${iso}T09:00:00+08:00`);

// 2026 as a reader might have kept it: Moments from September to December,
// one faithful week (October 4-8), two answers, verses, books and stickers.
function seed(page, { full = true } = {}) {
    return page.addInitScript((full) => {
        const done = ["2026-09-12", "2026-09-20", "2026-10-04", "2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-11-15", "2026-12-20"];
        localStorage.setItem("dailygrace:moment:done", JSON.stringify(done));
        localStorage.setItem("dailygrace:moment:answers", JSON.stringify({ "2026-10-04": "Trusting Him.", "2026-12-20": "Peace." }));
        localStorage.setItem("dailygrace:avatar", "AV-01");
        if (full) {
            localStorage.setItem("dailygrace:memory:learned", JSON.stringify([{ verse: "Psalm 23:1", week: "2026-09-13" }, { verse: "John 14:27", week: "2026-10-25" }]));
            localStorage.setItem("dailygrace:stickers", JSON.stringify({ started: "2026-09-12", welcomed: true, surprises: [], earned: { "HB-01": { day: "2026-09-12", seen: true }, "BS-01": { day: "2026-10-05", seen: true } } }));
        }
    }, full);
}

// The books met live with the sticker progress, which the home page's own
// sticker scripts also read; set only on the Archives, which do not load them.
function seedBooks(page) {
    return page.addInitScript(() => {
        localStorage.setItem("dailygrace:stickers:counts", JSON.stringify({ books: { Psalms: "2026-09-13", John: "2026-10-03", Romans: "2026-10-07" } }));
    });
}

test.beforeEach(async ({ page }) => {
    await page.route(/dailygrace\.faith\/media\//, (route) => route.fulfill({ status: 404 }));
    await page.addInitScript(() => {
        // Today's trivia already shown, so it does not cover the page.
        const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
        localStorage.setItem("dailygrace.trivia", JSON.stringify({ day, count: 99, last: Date.now() }));
    });
});

test.describe("the home page's journey card", () => {
    test("is hidden before December 29", async ({ page }) => {
        await page.clock.setFixedTime(at("2026-11-15"));
        await seed(page);
        await page.goto("/");
        await expect(page.locator("journey-card")).toBeHidden();
    });

    test("opens the year's journey from December 29", async ({ page }) => {
        await page.clock.setFixedTime(at("2026-12-30"));
        await seed(page);
        await page.goto("/");
        const card = page.locator("journey-card");
        await expect(card).toBeVisible();
        await expect(card).toContainText("Look back on the 9 Moments you prayed with God this year");
        await expect(card.locator("a")).toHaveAttribute("href", /apps\/pages\/library\.html#journey\/2026$/);
    });

    test("still offers last year's journey in early January, then steps aside", async ({ page }) => {
        await seed(page);
        await page.clock.setFixedTime(at("2027-01-05"));
        await page.goto("/");
        await expect(page.locator("journey-card")).toContainText("2026 with Daily Grace");

        await page.clock.setFixedTime(at("2027-01-11"));
        await page.goto("/");
        await expect(page.locator("journey-card")).toBeHidden();
    });

    test("is not shown to a reader who prayed no Moment that year", async ({ page }) => {
        await page.clock.setFixedTime(at("2026-12-30"));
        await page.goto("/");
        await expect(page.locator("journey-card")).toBeHidden();
    });
});

test.describe("the journey in the Daily Grace Archives", () => {
    test("walks through the year, one card at a time", async ({ page }) => {
        await page.clock.setFixedTime(at("2026-12-30"));
        await seed(page);
        await seedBooks(page);
        await page.goto(`${ARCHIVES}#journey/2026`);
        const journey = page.locator("dialog.journey");
        await expect(journey).toBeVisible();
        await expect(journey.locator(".journey-count")).toHaveText("1/6");
        await expect(journey).toContainText("Your Year's Journey in Grace");
        await expect(journey).toContainText("You prayed 9 Moments with God, from September 12, 2026 to December 20, 2026.");

        await journey.locator(".journey-next").click();
        await expect(journey).toContainText("1faithful week, 5 days or more");
        await expect(journey).toContainText("Octoberthe month you came most often");
        await expect(journey).toContainText("2answers written, kept only on this phone");
        await journey.locator(".journey-next").click();
        await expect(journey.locator(".journey-verses li")).toHaveCount(2);
        await journey.locator(".journey-next").click();
        await expect(journey.locator(".journey-books li")).toHaveCount(3);
        await journey.locator(".journey-next").click();
        await expect(journey).toContainText("2 stickers");
        await journey.locator(".journey-next").click();
        await expect(journey.locator("blockquote")).toHaveText("“Thou crownest the year with thy goodness; and thy paths drop fatness.”");
        await expect(journey.locator(".journey-next")).toBeHidden();
    });

    test("leaves out the cards with nothing to show", async ({ page }) => {
        await page.clock.setFixedTime(at("2026-12-30"));
        await seed(page, { full: false });
        await page.goto(`${ARCHIVES}#journey/2026`);
        await expect(page.locator("dialog.journey .journey-count")).toHaveText("1/3");
    });

    test("is gentle with a year that has no Moment yet", async ({ page }) => {
        await page.clock.setFixedTime(at("2026-12-30"));
        await page.goto(`${ARCHIVES}#journey/2026`);
        const journey = page.locator("dialog.journey");
        await expect(journey.locator(".journey-count")).toHaveText("1/2");
        await expect(journey).toContainText("Your journey is just beginning");
    });

    test("stays in My days after January 10", async ({ page }) => {
        await page.clock.setFixedTime(at("2027-02-01"));
        await seed(page);
        await page.goto(`${ARCHIVES}#mine`);
        const entry = page.locator("a.lib-journey");
        await expect(entry).toContainText("Your Year's Journey in Grace");
        await entry.click();
        await expect(page.locator("dialog.journey")).toBeVisible();
        await page.locator("dialog.journey .journey-close").click();
        await expect(page.locator("dialog.journey")).toBeHidden();
        await expect(page).toHaveURL(/library\.html#mine$/);
    });

    test("makes a picture of the journey to save or share", async ({ page }) => {
        await page.clock.setFixedTime(at("2026-12-30"));
        await seed(page);
        await page.addInitScript(() => {
            navigator.canShare = () => true;
            navigator.share = async (data) => {
                window.sharedFile = { name: data.files[0].name, type: data.files[0].type, size: data.files[0].size };
            };
        });
        await page.goto(`${ARCHIVES}#journey/2026`);
        const journey = page.locator("dialog.journey");
        await expect(journey.locator(".journey-count")).toHaveText("1/5");
        // On to the last card.
        for (let i = 0; i < 8 && (await journey.locator(".journey-next").isVisible()); i++) {
            await journey.locator(".journey-next").click();
        }
        await journey.locator(".journey-share").click();
        await expect.poll(() => page.evaluate(() => window.sharedFile?.name ?? null), { timeout: 15_000 }).toBe("daily-grace-journey-2026.jpg");
        const shared = await page.evaluate(() => window.sharedFile);
        expect(shared.type).toBe("image/jpeg");
        expect(shared.size).toBeGreaterThan(10_000);
    });
});
