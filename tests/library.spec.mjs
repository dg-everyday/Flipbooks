/**
 * The Daily Grace Archives (apps/pages/library.html): every complete day from
 * September 11, 2026 up to today in Manila, by month, book or the reader's own
 * days; a day opens in a sheet that Back closes. The media host is stubbed
 * out (every file missing), so tiles show their text and nothing waits on R2.
 */
import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const PAGE = "/apps/pages/library.html";
// 10 a.m. in Manila on Saturday, October 31, 2026: 51 days in the Library.
const TODAY = new Date("2026-10-31T10:00:00+08:00");

const tile = (page, date) => page.locator(`#lib-content .lib-tile[data-date="${date}"]`);
const sheet = (page) => page.locator("dialog.day-sheet");

test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(TODAY);
    await page.route(/dailygrace\.faith\/media\//, (route) => route.fulfill({ status: 404 }));
});

test.describe("Daily Grace Archives", () => {
    test("shows the days from September 11 to today, and no others", async ({ page }) => {
        await page.goto(PAGE);
        await expect(page.locator("#lib-content .lib-tile")).toHaveCount(51);
        await expect(tile(page, "2026-09-11")).toHaveCount(1);
        await expect(tile(page, "2026-10-31")).toHaveCount(1);
        await expect(tile(page, "2026-09-10")).toHaveCount(0);
        await expect(tile(page, "2026-11-01")).toHaveCount(0);
        // This week: Sunday the 25th to today, all in the Library, none prayed.
        await expect(page.locator(".lib-week-day a")).toHaveCount(7);
    });

    test("folds each month to its three newest days, and the pull tab opens it", async ({ page }) => {
        await page.goto(PAGE);
        const october = page.locator("#month-2026-10");
        await expect(october.locator(".lib-tile:visible")).toHaveCount(3);
        for (const date of ["2026-10-31", "2026-10-30", "2026-10-29"]) {
            await expect(tile(page, date)).toBeVisible();
        }
        await expect(tile(page, "2026-10-28")).toBeHidden();
        await expect(page.locator("#month-2026-09 .lib-tile:visible")).toHaveCount(3);

        await october.getByRole("button", { name: "Show all 31 days of October 2026" }).click();
        await expect(october.locator(".lib-tile:visible")).toHaveCount(31);
        await expect(october.getByRole("button", { name: "Show all 31 days of October 2026" })).toBeHidden();
        // September stays folded.
        await expect(page.locator("#month-2026-09 .lib-tile:visible")).toHaveCount(3);

        // The chevrons, turned up, fold October back.
        await october.getByRole("button", { name: "Fold October 2026 back to its 3 newest days" }).click();
        await expect(october.locator(".lib-tile:visible")).toHaveCount(3);
        await expect(october.getByRole("button", { name: "Show all 31 days of October 2026" })).toBeVisible();
        await expect(october.getByRole("button", { name: /^Fold October/ })).toBeHidden();
    });

    test("a link to a month opens it whole", async ({ page }) => {
        await page.goto(`${PAGE}#month/2026-09`);
        await expect(page.locator("#month-2026-09 .lib-tile:visible")).toHaveCount(20);
        await expect(page.getByRole("button", { name: /^Fold September 2026/ })).toBeVisible();
        await expect(page.locator("#month-2026-10 .lib-tile:visible")).toHaveCount(3);
        // Every month has its own weekday names for the calendar.
        for (const month of ["2026-09", "2026-10"]) {
            await expect(page.locator(`#month-${month} .lib-weekdays span`)).toHaveCount(7);
        }
    });

    test("opens a day from its tile, and Back closes it", async ({ page }) => {
        await page.goto(PAGE);
        await page.getByRole("button", { name: "Show all 31 days of October 2026" }).click();
        await tile(page, "2026-10-01").click();
        await expect(sheet(page)).toBeVisible();
        await expect(page).toHaveURL(/#day\/2026-10-01$/);
        await expect(page.locator("#day-title")).toHaveText("Grace is sufficient");
        await expect(page.locator(".day-verse blockquote")).toContainText("My grace is sufficient for thee");
        await expect(page.locator(".day-prayer")).toContainText("Your grace is enough");
        await expect(sheet(page).locator("poster-card")).toHaveAttribute("date", "2026-10-01");
        await expect(sheet(page).locator("daily-moment")).toHaveAttribute("date", "2026-10-01");
        await expect(sheet(page).locator(".day-flipbook")).toHaveAttribute("href", "flipbook.html?date=2026-10-01");

        await page.goBack();
        await expect(sheet(page)).toBeHidden();
        await expect(page).toHaveURL(/library\.html$/);
    });

    test("a link to a day opens it, and closing stays on the Library", async ({ page }) => {
        await page.goto(`${PAGE}#day/2026-10-15`);
        await expect(sheet(page)).toBeVisible();
        await sheet(page).getByRole("button", { name: "Close this day" }).click();
        await expect(sheet(page)).toBeHidden();
        await expect(page).toHaveURL(/library\.html$/);
        await expect(tile(page, "2026-10-15")).toBeVisible();
    });

    test("steps a day back and forward, stopping at today and the first day", async ({ page }) => {
        await page.goto(`${PAGE}#day/2026-10-31`);
        await expect(sheet(page).locator(".day-step.is-after")).toHaveText("Today is the newest");
        await sheet(page).locator("a.day-step.is-before").click();
        await expect(page).toHaveURL(/#day\/2026-10-30$/);
        await expect(page.locator(".day-when-long")).toHaveText("Friday, October 30, 2026");

        await page.goto(`${PAGE}#day/2026-09-11`);
        await expect(sheet(page).locator(".day-step.is-before")).toHaveText("The first day");
    });

    test("turns away days before the Library and days to come", async ({ page }) => {
        await page.goto(`${PAGE}#day/2026-09-10`);
        await expect(page.locator(".lib-toast")).toHaveText("The Daily Grace Archives begin on September 11, 2026.");
        await expect(sheet(page)).toBeHidden();

        await page.goto(`${PAGE}#day/2026-11-01`);
        await expect(page.locator(".lib-toast")).toHaveText("That day isn't here yet.");
        await expect(sheet(page)).toBeHidden();
    });

    test("lists a book's days in the book's order", async ({ page }) => {
        await page.goto(PAGE);
        await page.getByRole("tab", { name: "Books" }).click();
        await page.locator('a.lib-book[href="#book/Psalms"]').click();
        await expect(page.locator("#lib-book-title")).toHaveText("Psalms");
        const refs = await page.locator("#lib-content .lib-ref").allTextContents();
        expect(refs.length).toBeGreaterThan(5);
        for (const ref of refs) {
            expect(ref).toMatch(/^Psalm \d/);
        }
        const chapters = refs.map((ref) => Number(/^Psalm (\d+)/.exec(ref)[1]));
        expect(chapters).toEqual([...chapters].sort((a, b) => a - b));
    });

    test("finds days by verse and by word", async ({ page }) => {
        await page.goto(PAGE);
        const search = page.getByRole("searchbox", { name: "Search the Daily Grace Archives" });
        await search.fill("Psalm 23");
        const refs = await page.locator("#lib-content .lib-ref").allTextContents();
        expect(refs.length).toBeGreaterThan(0);
        for (const ref of refs) {
            expect(ref).toMatch(/^Psalm 23:/);
        }
        await search.fill("sufficient");
        await expect(tile(page, "2026-10-01")).toBeVisible();
    });

    test("shows the reader's prayed days and answers", async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem("dailygrace:moment:done", JSON.stringify(["2026-10-01"]));
            localStorage.setItem(
                "dailygrace:moment:answers",
                JSON.stringify({ "2026-10-01": "My worry about work." }),
            );
        });
        await page.goto(PAGE);
        await expect(tile(page, "2026-10-01")).toHaveAttribute("aria-label", /Moment done/);
        await page.getByRole("tab", { name: "My days" }).click();
        await expect(tile(page, "2026-10-01")).toBeVisible();
        await expect(page.locator(".lib-answers")).toContainText("My worry about work.");

        await page.locator('.lib-answers a[href="#day/2026-10-01"]').click();
        await expect(sheet(page).locator(".day-answer")).toContainText("My worry about work.");
    });

    test("shows a day's title when its thumbnail is missing", async ({ page }) => {
        await page.goto(PAGE);
        const first = tile(page, "2026-10-31");
        await expect(first).toHaveClass(/no-thumb/);
        await expect(first.locator(".lib-thumb-text")).toBeVisible();
    });
});

test.describe("ways into the Daily Grace Archives", () => {
    test("the menu lists it just before Daily Grace Kids", async ({ page }) => {
        await page.goto("/");
        const hrefs = await page
            .locator("study-guide-menu")
            .locator(".menu-nav a.menu-item")
            .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
        const library = hrefs.findIndex((href) => /apps\/pages\/library\.html$/.test(href));
        expect(library).toBeGreaterThan(0);
        expect(hrefs[library + 1]).toMatch(/apps\/pages\/daily-grace-kids\.html$/);
    });

    test("the banner uncovers it past its oldest day", async ({ page }) => {
        await page.addInitScript(() => {
            // An avatar, and today's trivia already shown, so neither popup
            // covers the banner.
            localStorage.setItem("dailygrace:avatar", "AV-01");
            const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
            localStorage.setItem("dailygrace.trivia", JSON.stringify({ day, count: 99, last: Date.now() }));
        });
        await page.goto("/");
        const banner = page.locator("banner-slider");
        const panel = banner.locator("a.archives");
        // One day back is the oldest, to keep the test short.
        await banner.evaluate((el) => el.setAttribute("past-days", "1"));
        await expect(panel).toBeHidden();

        // A step back reaches the oldest day; the next one uncovers the panel.
        await banner.evaluate((el) => el.previous());
        await expect.poll(() => banner.evaluate((el) => el.daysAgo)).toBe(1);
        await expect(panel).toBeHidden();
        await banner.evaluate((el) => el.previous());
        await expect(panel).toBeVisible();
        await expect(panel).toHaveAttribute("href", /apps\/pages\/library\.html#month\/2026-10$/);
        await expect(panel).toContainText("Daily Grace Archives");
        // The Flipbook button stays on top of the banner, over its own layer.
        const flipbookOnTop = await banner.evaluate((el) => {
            const button = el.shadowRoot.querySelector(".flipbook");
            const box = button.getBoundingClientRect();
            const hit = el.shadowRoot.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
            return Boolean(hit?.closest(".flipbook"));
        });
        expect(flipbookOnTop).toBe(true);
        // The day stays the oldest; forward closes the panel first.
        expect(await banner.evaluate((el) => el.daysAgo)).toBe(1);
        await banner.evaluate((el) => el.next());
        await expect(panel).toBeHidden();
        expect(await banner.evaluate((el) => el.daysAgo)).toBe(1);
    });

    test("the homepage has no link under the banner any more", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator("#library-link")).toHaveCount(0);
    });

    test("today's Amen offers a missed day this week", async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem("dailygrace:moment:done", JSON.stringify(["2026-10-26"]));
            // An avatar, and today's trivia already shown, so neither popup
            // opens over the Moment.
            localStorage.setItem("dailygrace:avatar", "AV-01");
            const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
            localStorage.setItem("dailygrace.trivia", JSON.stringify({ day, count: 99, last: Date.now() }));
        });
        await page.goto("/");
        const moment = page.locator("daily-moment#daily-moment");
        await expect(moment).toBeVisible();
        await moment.evaluate((el) => el.open());
        const amen = moment.locator("h2.amen");
        // A plain DOM click: WebKit on the iPad can hang scrolling the Respond
        // screen's button into view, and the way through is not under test.
        for (let step = 0; step < 20 && !(await amen.isVisible()); step++) {
            await moment.locator("button.next").evaluate((button) => button.click());
        }
        // Sunday the 25th is the first day this week without a Moment.
        await expect(moment.getByRole("link", { name: /Catch up in the Daily Grace Archives/ })).toHaveAttribute(
            "href",
            /apps\/pages\/library\.html#day\/2026-10-25$/,
        );
    });

    test("Bible search shows a verse's Daily Grace day under it", async ({ page }) => {
        await page.goto("/");
        const results = page.locator("bible-search-results#search-results");
        // The rows the search would give for Psalm 23:1-2 and 6.
        await results.evaluate((panel) =>
            panel.showVerses([
                { docid: 14659, book_name: "Psalms", chapter: 23, verse: 1, text: "The LORD is my shepherd; I shall not want." },
                { docid: 14660, book_name: "Psalms", chapter: 23, verse: 2, text: "He maketh me to lie down in green pastures: he leadeth me beside the still waters." },
                { docid: 14664, book_name: "Psalms", chapter: 23, verse: 6, text: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever." },
            ]),
        );
        const strips = results.locator(".daily-grace-day");
        await expect(strips).toHaveCount(1);
        await expect(strips).toHaveAttribute("href", /apps\/pages\/library\.html#day\/2026-09-13$/);
        await expect(strips).toContainText("The Lord provides");
        await expect(results.locator('.verse-card[data-place="Psalms|23|1"] .daily-grace')).toHaveCount(1);
        // Verse 6 is November 28's verse: not until that day.
        await expect(results.locator('.verse-card[data-place="Psalms|23|6"] .daily-grace')).toHaveCount(0);
    });

    test("a verse's Daily Grace day shows once its day has come", async ({ page }) => {
        await page.clock.setFixedTime(new Date("2026-11-28T09:00:00+08:00"));
        await page.goto("/");
        const results = page.locator("bible-search-results#search-results");
        await results.evaluate((panel) =>
            panel.showVerses([
                { docid: 14664, book_name: "Psalms", chapter: 23, verse: 6, text: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever." },
            ]),
        );
        await expect(results.locator(".daily-grace-day")).toHaveAttribute("href", /#day\/2026-11-28$/);
    });

    test("the results can be brought back to a verse further down", async ({ page }) => {
        await page.goto("/");
        const results = page.locator("bible-search-results#search-results");
        // Psalm 119:1-60: three batches of 24, of which only the first is drawn.
        const found = await results.evaluate(async (panel) => {
            const rows = Array.from({ length: 60 }, (_, i) => ({
                docid: 15000 + i,
                book_name: "Psalms",
                chapter: 119,
                verse: i + 1,
                text: `Verse ${i + 1}.`,
            }));
            panel.showVerses(rows);
            return panel.revealVerse("Psalms|119|50");
        });
        expect(found).toBe(true);
        await expect(results.locator('.verse-card[data-place="Psalms|119|50"]')).toBeInViewport();
    });

    test("closing a day opened from another page goes back to it", async ({ page }) => {
        await page.goto("/apps/pages/did-you-know.html");
        // As a link from that page would: the Library knows where it came from.
        await page.evaluate(() => {
            location.href = "/apps/pages/library.html#day/2026-10-01";
        });
        await expect(sheet(page)).toBeVisible();
        await sheet(page).getByRole("button", { name: "Close this day" }).click();
        await expect(page).toHaveURL(/did-you-know\.html$/);
    });

    test("the search finds Psalm 23 as well as Psalms 23", async ({ page, isMobile }) => {
        test.skip(isMobile, "one screen is enough; it loads sql.js from the CDN");
        test.setTimeout(60_000);
        await page.addInitScript(() => {
            localStorage.setItem("dailygrace:avatar", "AV-01");
            const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
            localStorage.setItem("dailygrace.trivia", JSON.stringify({ day, count: 99, last: Date.now() }));
        });
        await page.goto("/");
        const results = page.locator("bible-search-results#search-results");
        for (const query of ["Psalm 23", "Psalms 23"]) {
            await page.locator("#search-query").fill(query);
            await page.locator("#search-query").press("Enter");
            await expect(results.locator(".verse-card")).toHaveCount(6, { timeout: 45_000 });
        }
    });

    test("a past day's Amen says catch-ups earn no sticker", async ({ page }) => {
        await page.goto(`${PAGE}#day/2026-10-28`);
        const moment = sheet(page).locator("daily-moment");
        await expect(moment).toBeVisible();
        await moment.evaluate((el) => el.open());
        const amen = moment.locator("h2.amen");
        for (let step = 0; step < 20 && !(await amen.isVisible()); step++) {
            await moment.locator("button.next").evaluate((button) => button.click());
        }
        await expect(moment.locator(".amen-note")).toHaveText(
            "October 28 is marked done. Only a day's own Moment, prayed on that day, counts toward stickers.",
        );
    });

    test("the Flipbook links to its week's month", async ({ page }) => {
        await page.goto("/apps/pages/flipbook.html?date=2026-10-01", { waitUntil: "domcontentloaded" });
        await expect(page.locator("#library")).toHaveAttribute("href", "library.html#month/2026-10");
    });
});

test.describe("a page for each day, for link previews", () => {
    test.skip(({ isMobile, browserName }) => isMobile || browserName !== "chromium", "one screen is enough");

    // What the deploy writes, made here into a folder of its own.
    function buildDayPages(today) {
        const folder = mkdtempSync(join(tmpdir(), "day-pages-"));
        copyFileSync(new URL("../sitemap.xml", import.meta.url), join(folder, "sitemap.xml"));
        execFileSync(process.execPath, [
            fileURLToPath(new URL("../assets/scripts/build-day-pages.mjs", import.meta.url)),
            folder,
            "--today",
            today,
        ]);
        return folder;
    }

    test("are written for the released days only, with the day's banner", async () => {
        const folder = buildDayPages("2026-10-31");
        const page = readFileSync(join(folder, "d", "2026-10-01.html"), "utf8");
        expect(page).toContain('<meta property="og:image" content="https://dailygrace.faith/media/banner/2026/october/daily-grace-2026-10-01.webp" />');
        expect(page).toContain('<meta property="og:url" content="https://dailygrace.faith/d/2026-10-01.html" />');
        expect(page).toContain("<title>Grace is sufficient — Daily Grace for October 1, 2026</title>");
        expect(page).toContain("My grace is sufficient for thee");
        expect(existsSync(join(folder, "d", "2026-09-11.html"))).toBe(true);
        expect(existsSync(join(folder, "d", "2026-09-10.html"))).toBe(false);
        expect(existsSync(join(folder, "d", "2026-11-01.html"))).toBe(false);
        const sitemap = readFileSync(join(folder, "sitemap.xml"), "utf8");
        expect(sitemap).toContain("<loc>https://dailygrace.faith/d/2026-10-31.html</loc>");
        expect(sitemap.trim().endsWith("</urlset>")).toBe(true);
    });

    test("send a reader on to the day in the Archives", async ({ page }) => {
        const folder = buildDayPages("2026-10-31");
        await page.route("**/d/2026-10-01.html", (route) =>
            route.fulfill({ path: join(folder, "d", "2026-10-01.html"), contentType: "text/html" }),
        );
        await page.goto("/d/2026-10-01.html");
        await expect(page).toHaveURL(/apps\/pages\/library\.html#day\/2026-10-01$/);
        await expect(page.locator("#day-title")).toHaveText("Grace is sufficient");
    });

    test("welcome a first visit and keep it in the Archives", async ({ page }) => {
        // As the day page forwards: from Messenger, say, to here with ?from=link.
        await page.goto(`${PAGE}?from=link#day/2026-10-01`, { referer: "http://localhost:4173/d/2026-10-01.html" });
        await expect(sheet(page)).toBeVisible();
        await expect(page).toHaveURL(/library\.html#day\/2026-10-01$/);
        const welcome = sheet(page).locator(".lib-welcome");
        await expect(welcome).toContainText("Someone shared this day with you");
        await expect(welcome.getByRole("link", { name: "Start with today ›" })).toHaveAttribute("href", "../../index.html");
        // The next day has no welcome; it went with the shared one.
        await sheet(page).locator("a.day-step.is-after").click();
        await expect(sheet(page).locator(".lib-welcome")).toHaveCount(0);

        // Closing stays in the Archives, which greet them too.
        await sheet(page).getByRole("button", { name: "Close this day" }).click();
        await expect(sheet(page)).toBeHidden();
        await expect(page).toHaveURL(/library\.html$/);
        await expect(page.locator("#view > .lib-welcome")).toBeVisible();
    });

    test("say nothing new to a reader who knows Daily Grace", async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem("dailygrace:avatar", "AV-01"));
        await page.goto(`${PAGE}?from=link#day/2026-10-01`);
        await expect(sheet(page)).toBeVisible();
        await expect(page.locator(".lib-welcome")).toHaveCount(0);
    });

    test("are what the Archives' share button sends", async ({ page }) => {
        await page.addInitScript(() => {
            navigator.share = async (data) => {
                window.sharedData = data;
            };
        });
        await page.goto(`${PAGE}#day/2026-10-01`);
        await sheet(page).getByRole("button", { name: "Share a link to this day" }).click();
        const shared = await page.evaluate(() => window.sharedData);
        expect(shared.url).toMatch(/\/d\/2026-10-01\.html$/);
    });
});

// The index is generated (tools/library/build_library_index.py); a forgotten
// rebuild after the verse files change must not pass unnoticed.
test("the Library index is in step with assets/verses/", async ({ isMobile, browserName }) => {
    test.skip(isMobile || browserName !== "chromium", "a check of the files, not of a screen");
    const read = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
    const { start, years } = read("assets/library/index.json");
    const indexed = new Map();
    for (const year of years) {
        for (const day of read(`assets/library/${year}.json`).days) {
            indexed.set(day.date, day.ref);
        }
    }
    const verses = new Map();
    for (const year of readdirSync(new URL("../assets/verses/", import.meta.url))) {
        for (const file of readdirSync(new URL(`../assets/verses/${year}/`, import.meta.url))) {
            for (const entry of read(`assets/verses/${year}/${file}`)) {
                const iso = new Date(`${entry.id} 12:00 UTC`).toISOString().slice(0, 10);
                if (iso >= start) {
                    verses.set(iso, entry.verse);
                }
            }
        }
    }
    expect([...indexed.keys()].sort()).toEqual([...verses.keys()].sort());
    for (const [date, ref] of indexed) {
        expect(ref, date).toBe(verses.get(date));
    }
});
