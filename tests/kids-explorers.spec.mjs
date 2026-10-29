/**
 * Daily Grace Kids Explorers (ages 9 to 12): the data, the rules, the store,
 * and the screens. An Explorer reads each story in its kids flipbook (with the
 * KJV pills), investigates, plays, learns the whole verse and answers in a
 * private journal; finishing stories unlocks Field Guide cards and ranks. The
 * two harder side trails show only when a grown-up allows them, and the
 * journal is private unless the child shares an answer.
 */
import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import {
    DATA, child, expectNoErrors, go, hash, passGate, readStore, seed, stop, stubMedia, watchErrors,
} from "./kids-helpers.mjs";

const XDATA = JSON.parse(readFileSync(new URL("../assets/kids/explorers-data.json", import.meta.url), "utf8"));
const MIA = child("c0003cc", "Mia", "explorers", "KA-07");
const xstory = (id) => XDATA.stories.find((s) => s.id === id);
const once = (name) => test.skip(test.info().project.name !== name, `runs on ${name} only`);

/** Runs `fn(store, rules, xdata)` in the page with fresh copies of the modules. */
function withModules(page, fn, arg) {
    return page.evaluate(async ({ source, arg }) => {
        const fresh = Math.random();
        const store = await import(`/assets/scripts/kids/store.js?fresh=${fresh}`);
        const rules = await import(`/assets/scripts/kids/rules.js?fresh=${fresh}`);
        const xdata = await (await fetch("/assets/kids/explorers-data.json")).json();
        // eslint-disable-next-line no-new-func
        return new Function("store", "rules", "xdata", "arg", `return (${source})(store, rules, xdata, arg);`)(store, rules, xdata, arg);
    }, { source: fn.toString(), arg });
}

test.describe("data", () => {
    test.beforeEach(() => once("desktop"));

    test("thirteen stories on the trail, five of them side trails and two of those harder", () => {
        expect(XDATA.road).toHaveLength(13);
        expect(XDATA.stories.map((s) => s.id).sort()).toEqual([...XDATA.road].sort());
        expect(XDATA.stories.filter((s) => s.side).map((s) => s.id).sort()).toEqual(
            ["for-his-oaths-sake", "help-thou-mine-unbelief", "into-his-hand", "one-thing-thou-lackest", "while-he-lingered"]);
        expect(XDATA.stories.filter((s) => s.harder).map((s) => s.id).sort()).toEqual(["for-his-oaths-sake", "while-he-lingered"]);
        // Every live story of the younger children is on the trail.
        for (const s of DATA.stories) {
            expect(XDATA.road).toContain(s.id);
        }
    });

    test("each story has its flipbook, verse, six clues, eight statements, Think & Talk and a page left out", () => {
        for (const s of XDATA.stories) {
            const flip = JSON.parse(readFileSync(new URL(`../${s.flipbook}`, import.meta.url), "utf8"));
            expect(s.pages, s.id).toEqual(flip.pages.map((p) => p.image));
            expect(s.verse.text.length, s.id).toBeGreaterThan(20);
            expect(s.investigate.questions, s.id).toHaveLength(6);
            for (const q of s.investigate.questions) {
                expect(q.text.length, `${s.id}: ${q.q}`).toBeGreaterThan(10);
                if (s.investigate.mode === "scene") {
                    expect(q.spots.length, q.q).toBeGreaterThan(0);
                } else {
                    expect(q.choices, q.q).toContain(q.page);
                    expect(new Set(q.choices).size, q.q).toBe(3);
                    expect(Math.max(...q.choices), q.q).toBeLessThan(s.pages.length);
                }
            }
            expect(s.investigate.mode, s.id).toBe(s.side ? "pages" : "scene");
            expect(s.rightOrNot, s.id).toHaveLength(8);
            expect(new Set(s.rightOrNot.slice(0, 3).map((r) => r.right)).size, s.id).toBe(2);
            for (const r of s.rightOrNot) {
                expect(r.verse.length, r.text).toBeGreaterThan(10);
            }
            expect(s.think.talk, s.id).toHaveLength(2);
            expect(s.think.pray && s.think.prayAudio, s.id).toBeTruthy();
            expect(s.order.pages.length, s.id).toBeGreaterThanOrEqual(6);
            expect(s.order.odd.story, s.id).not.toBe(s.id);
            expect(s.note.length > 0 || !s.harder, s.id).toBe(true);
        }
    });

    test("48 Field Guide cards on four shelves; every card is earned by a story, Map Quest or the Book Train", () => {
        const cards = XDATA.fieldGuide.cards;
        expect(cards).toHaveLength(48);
        const shelf = (id) => cards.filter((c) => c.shelf === id).length;
        expect([shelf("people"), shelf("places"), shelf("creatures"), shelf("things")]).toEqual([24, 12, 6, 6]);
        for (const c of cards) {
            expect(c.facts, c.id).toHaveLength(3);
            expect(c.text.length, c.id).toBeGreaterThan(10);
            expect(c.stories.length > 0 || c.train, c.id).toBe(true);
            expect(c.image, c.id).toMatch(/^media:kids\//);
        }
        // Every story gives at least one card.
        for (const s of XDATA.stories) {
            expect(s.cards.length, s.id).toBeGreaterThan(0);
        }
        expect(XDATA.mapQuest.places.map((p) => p.card).sort()).toEqual(cards.filter((c) => c.quest).map((c) => c.id).sort());
        expect(XDATA.bookTrain.groups.flatMap((g) => g.books)).toHaveLength(66);
        expect(XDATA.ranks.map((r) => [r.name, r.min])).toEqual([["Scout", 0], ["Tracker", 4], ["Navigator", 8], ["Trailblazer", 11]]);
    });

    test("Who Said It? has a reference and a recording for every saying", () => {
        for (const s of XDATA.stories) {
            for (const w of s.whoSaid) {
                expect(w.text, `${s.id} ${w.reference}`).toContain(w.quote.replace(/[“”]/g, "").slice(0, 12));
                expect(w.audio, w.reference).toMatch(/^media:kids\/audio\//);
                expect(w.portraits.length, w.reference).toBeGreaterThan(0);
            }
        }
    });
});

test.describe("rules and store", () => {
    test.beforeEach(async ({ page }) => {
        once("desktop");
        await page.goto("/assets/fonts/Andika-OFL.txt");
    });

    test("the trail, ranks and cards are counted from the record, never twice", async ({ page }) => {
        const out = await withModules(page, (store, rules, xdata) => {
            const done = { steps: { watch: true, find: true, play: true, verse: true, talk: true }, talkLater: false, finishedOn: "2026-10-20", times: 1, verse: { level: 6, learned: true } };
            const record = { stops: { "where-art-thou": done, "too-many-for-me": done, "and-ruth-with-her": done }, cards: {}, quest: {}, trainWins: 0 };
            const road = rules.explorerRoad(xdata, {}).map((s) => s.id);
            const roadHarder = rules.explorerRoad(xdata, { harderStories: true }).map((s) => s.id);
            const tally = rules.explorerTally(record, xdata);
            const due = rules.dueCards(record, xdata);
            const withCards = { ...record, cards: Object.fromEntries(due.map((id) => [id, { day: "2026-10-20" }])) };
            const four = { ...withCards, stops: { ...withCards.stops, "the-fourth-man-in-the-fire": done } };
            return {
                road: road.length, roadHarder: roadHarder.length,
                hidden: rules.isExplorerOpen("while-he-lingered", record, xdata, {}),
                shown: rules.isExplorerOpen("while-he-lingered", record, xdata, { harderStories: true }),
                inOrder: rules.isExplorerOpen("how-much-more", record, xdata, { mapInOrder: true }),
                next: rules.nextExplorerStory(record, xdata, {})?.id,
                tally,
                rank: rules.rankFor(tally.finished, xdata).name,
                rank4: rules.rankFor(rules.explorerTally(four, xdata).finished, xdata).name,
                nextRank: rules.nextRank(3, xdata).more,
                due: due.length,
                dueAgain: rules.dueCards(withCards, xdata).length,
                quest: rules.dueCards({ ...withCards, quest: { patmos: true } }, xdata),
                train: rules.dueCards({ ...withCards, trainWins: 1 }, xdata),
                week: rules.thisWeek({ stops: { a: { days: { watch: "2026-10-24", verse: "2026-10-10" } } } }, "2026-10-25"),
                stickers: rules.dueStickers({ stops: {}, firsts: {} }, {}, { stories: [], stickers: { list: [{ id: "HB-01", group: "HB" }], paths: [{ group: "HB", path: "stops", first: 1, every: 3 }] } }, { finished: 1 }),
            };
        });
        expect(out.road).toBe(11);
        expect(out.roadHarder).toBe(13);
        expect(out.hidden).toBe(false);
        expect(out.shown).toBe(true);
        // In order: Teach Us to Pray waits for the stories before it.
        expect(out.inOrder).toBe(false);
        expect(out.next).toBe("into-his-hand");
        expect(out.tally).toMatchObject({ finished: 3, verses: 3, talks: 3, cards: 0 });
        expect(out.rank).toBe("Scout");
        expect(out.rank4).toBe("Tracker");
        expect(out.nextRank).toBe(1);
        // Hiding in the Garden gives 4 cards, Gideon 7, Ruth 5.
        expect(out.due).toBe(16);
        expect(out.dueAgain).toBe(0);
        expect(out.quest).toEqual(["patmos"]);
        expect(out.train).toEqual(["scroll"]);
        expect(out.week).toEqual({ read: 1, verses: 0 });
        expect(out.stickers).toEqual([{ id: "HB-01", path: "stops" }]);
    });

    test("the Explorer record and journal are cleaned; practices move on; removing a child removes both", async ({ page }) => {
        const out = await withModules(page, (store) => {
            const mia = store.addChild({ name: "Mia", band: "explorers", avatar: "KA-07", readAloud: true });
            localStorage.setItem(`dailygrace:kids:${mia.id}:explorer`, JSON.stringify({
                stops: { "x y": {}, "where-art-thou": { steps: { watch: "yes", find: true }, verse: { level: 99 } } },
                cards: { adam: { day: "nope" }, "<b>": {} }, quest: { patmos: true, egypt: "yes" }, trainWins: -3,
            }));
            store.refresh();
            const record = store.explorer(mia.id);
            const levels = [];
            for (let i = 0; i < 8; i += 1) {
                levels.push(store.practiseVerse(mia.id, "and-ruth-with-her").verse.level);
            }
            const learned = store.practiseVerse(mia.id, "and-ruth-with-her", { had: true });
            const again = store.practiseVerse(mia.id, "and-ruth-with-her", { had: true });
            const step1 = store.completeExplorerStep(mia.id, "and-ruth-with-her", "watch").wasNew;
            const step2 = store.completeExplorerStep(mia.id, "and-ruth-with-her", "watch").wasNew;
            const firsts = store.progress(mia.id).firsts;
            const cards = store.unlockCards(mia.id, ["ruth", "ruth", "naomi"]);
            const cardsAgain = store.unlockCards(mia.id, ["ruth"]);
            store.saveJournal(mia.id, "and-ruth-with-her", `  <img src=x onerror=alert(1)>\u0000\r\n\n\n\nline ${"x".repeat(700)}`, true);
            const j = store.journal(mia.id).answers["and-ruth-with-her"];
            store.saveJournal(mia.id, "and-ruth-with-her", "   ", false);
            const removed = store.journal(mia.id).answers["and-ruth-with-her"] ?? null;
            store.saveJournal(mia.id, "where-art-thou", "kept", false);
            store.removeChild(mia.id);
            return {
                child: { band: mia.band, readAloud: mia.readAloud },
                stops: Object.keys(record.stops), steps: record.stops["where-art-thou"].steps, level: record.stops["where-art-thou"].verse.level,
                cards: Object.keys(record.cards), quest: record.quest, trainWins: record.trainWins,
                levels, learnedNow: learned.learnedNow, againNow: again.learnedNow,
                step1, step2, firstWatch: firsts.watch === true, newCards: cards, cardsAgain,
                journal: { start: j.text.slice(0, 25), length: Array.from(j.text).length, shared: j.shared, noBreaks: !/\n{3}/.test(j.text) },
                removed,
                left: [`${mia.id}:explorer`, `${mia.id}:journal`].map((k) => localStorage.getItem(`dailygrace:kids:${k}`)),
            };
        });
        expect(out.child).toEqual({ band: "explorers", readAloud: true });
        expect(out.stops).toEqual(["where-art-thou"]);
        expect(out.steps).toEqual({ watch: false, find: true, play: false, verse: false, talk: false });
        expect(out.level).toBe(6);
        expect(out.cards).toEqual(["adam"]);
        expect(out.quest).toEqual({ patmos: true });
        expect(out.trainWins).toBe(0);
        expect(out.levels).toEqual([1, 2, 3, 4, 5, 6, 6, 6]);
        expect(out.learnedNow).toBe(true);
        expect(out.againNow).toBe(false);
        expect([out.step1, out.step2, out.firstWatch]).toEqual([true, false, true]);
        expect(out.newCards).toEqual(["ruth", "naomi"]);
        expect(out.cardsAgain).toEqual([]);
        expect(out.journal).toEqual({ start: "<img src=x onerror=alert(", length: 600, shared: true, noBreaks: true });
        expect(out.removed).toBeNull();
        expect(out.left).toEqual([null, null]);
    });
});

// ----------------------------------------------------------------- the screens
/** Turns the reader to its last page; the reader then says the story was read. */
async function readToTheEnd(page) {
    await page.locator("flip-book").evaluate(async (book) => {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));
        for (let t = 0; t < 100 && book.pageCount === 0; t += 1) {
            await wait(50);
        }
        for (let tries = 0; tries < 40; tries += 1) {
            const before = book.page;
            book.next();
            for (let t = 0; t < 40 && book.page === before; t += 1) {
                await wait(50);
            }
            if (book.page === before) {
                break;
            }
        }
    });
}

/** Answers every Investigate clue. */
async function investigate(page, story) {
    const game = page.locator("kids-investigate");
    for (const q of story.investigate.questions) {
        await expect(game.locator(".question")).toHaveText(q.q);
        if (story.investigate.mode === "scene") {
            const scene = game.locator(".scene");
            const box = await scene.boundingBox();
            const [x, y] = q.spots[0];
            await scene.click({ position: { x: x * box.width, y: y * box.height } });
        } else {
            await game.locator(`.page[data-page="${q.page}"]`).click();
        }
        await expect(game.locator(".answer")).toBeVisible();
        await expect(game.locator(".answer cite")).toHaveText(q.ref);
        await game.locator("[data-next]").click();
    }
    await expect(page.locator(".done-row")).toBeVisible();
}

async function playExplorerStory(page, story, { answer = "", share = false } = {}) {
    await go(page, `/stop/${story.id}/watch`);
    await expect(page.locator("flip-book")).toBeVisible();
    await readToTheEnd(page);
    await page.locator(".done-row [data-next]").click();
    await investigate(page, story);
    await page.locator(".done-row [data-next]").click();
    const order = page.locator("kids-story-order");
    await expect(order.locator(".tile").first()).toBeVisible();
    // The page from another story is left out first (panel -1), then the rest in order.
    const panels = await order.locator(".tile").evaluateAll((tiles) => tiles.map((t) => Number(t.dataset.panel)).sort((a, b) => a - b));
    expect(panels[0]).toBe(-1);
    for (const p of panels) {
        await order.locator(`.tile[data-panel="${p}"]`).click();
    }
    await expect(page.locator(".more-games")).toBeVisible();
    await page.locator(".more-games > .next-row [data-next]").click();
    const verse = page.locator("kids-verse-practice");
    for (let i = 0; i < 3; i += 1) {
        await verse.locator('[data-action="read"]').click();
    }
    await expect(verse.locator(".done h3")).toHaveText("Practice done");
    await page.locator(".done-row [data-next]").click();
    await expect(page.locator(".journal-card")).toBeVisible();
    if (answer) {
        await page.locator(".journal-card textarea").fill(answer);
        if (share) {
            await page.locator("[data-share]").check();
        }
        await page.locator("[data-save]").click();
    }
    await page.locator("[data-talked]").click();
    await expect(page.locator(".screen.reward")).toBeVisible();
}

test.describe("screens", () => {
    test.beforeEach(async ({ page }) => {
        once("ipad");
        await stubMedia(page);
    });

    test("a grown-up adds an Explorer; Read aloud is offered only for 9 to 12; the Field Journal opens", async ({ page }) => {
        const errors = watchErrors(page);
        await seed(page, {});
        await go(page, "/");
        await page.locator("[data-start]").click();
        await passGate(page);
        await page.locator("#child-name").fill("Mia");
        const readAloud = page.locator(".read-aloud");
        await expect(readAloud).toBeHidden();
        await page.locator('input[name="band"][value="explorers"]').check();
        await expect(readAloud).toBeVisible();
        await readAloud.locator("input").check();
        await page.locator('button[type="submit"]').click();
        await expect(page.locator(".explorer-home")).toBeVisible();
        await expect(page.locator(".explorer-home h1")).toHaveText("Hi, Mia!");
        await expect(page.locator(".rank-text h2")).toHaveText("Scout");
        await expect(page.locator(".keep-going b")).toHaveText(xstory("where-art-thou").title);
        await expect(page.locator("html")).toHaveClass(/kids-explorer/);
        const id = await page.evaluate(() => JSON.parse(localStorage.getItem("dailygrace:kids:profiles")).current);
        const saved = await readStore(page, id);
        expect(saved.profiles.children[0]).toMatchObject({ name: "Mia", band: "explorers", readAloud: true });
        expectNoErrors(errors);
    });

    test("an Explorer plays a story to the end: cards for the Field Guide, the next rank, and the journal kept private", async ({ page }) => {
        test.setTimeout(120_000);
        const errors = watchErrors(page);
        const done = stop();
        await seed(page, {
            children: [MIA], current: MIA.id,
            explorer: { [MIA.id]: { stops: { "where-art-thou": done, "too-many-for-me": done, "the-fourth-man-in-the-fire": done } } },
        });
        const story = xstory("and-ruth-with-her");
        await playExplorerStory(page, story, { answer: "<b>Ruth</b> stayed with Naomi" });
        await expect(page.locator(".rank-up h2")).toHaveText("Tracker");
        // The story's cards (and those of the stories seeded without theirs).
        const shown = await page.locator(".new-cards figcaption").allTextContents();
        for (const id of story.cards) {
            expect(shown).toContain(XDATA.fieldGuide.cards.find((c) => c.id === id).name);
        }
        const saved = await readStore(page, MIA.id);
        expect(saved.explorer.stops[story.id].finishedOn).toBeTruthy();
        expect(Object.keys(saved.explorer.cards)).toEqual(expect.arrayContaining(story.cards));
        expect(saved.journal.answers[story.id]).toMatchObject({ text: "<b>Ruth</b> stayed with Naomi", shared: false });
        expect(saved.explorer.lastThink).toMatchObject({ story: story.id, question: story.think.talk[0] });
        // The younger children's record is untouched.
        expect(saved.progress?.stops?.[story.id]).toBeUndefined();
        // The Field Guide: the new cards, which open with their verse.
        await page.locator('[data-go="#/guide"]').last().click();
        await expect(page.locator(".guide-card .new-badge").first()).toBeVisible();
        await page.locator('.guide-card[data-card="ruth"]').click();
        const card = page.locator(".card-dialog");
        await expect(card.locator("h2")).toHaveText("Ruth");
        await expect(card.locator("blockquote cite")).toHaveText("Ruth 4:17");
        await expect(card.locator(".facts li")).toHaveCount(3);
        await card.locator("[data-close]").click();
        // A private answer shows only as "answered" in the Corner.
        await go(page, "/corner");
        await passGate(page);
        const panel = page.locator(".corner-child");
        await expect(panel.locator(".tally")).toContainText("Tracker");
        await panel.locator(".journal-shared summary").click();
        await expect(panel.locator(".journal-shared")).toContainText("No answers shared yet.");
        await expect(panel.locator(".journal-shared")).toContainText("1 more answer is private");
        await expect(panel).not.toContainText("stayed with Naomi");
        expectNoErrors(errors);
    });

    test("a shared journal answer shows in the Corner as plain text, never as HTML", async ({ page }) => {
        await seed(page, {
            children: [MIA], current: MIA.id,
            journal: { [MIA.id]: { answers: { "where-art-thou": { text: "<img src=x onerror=\"window.hacked=1\">God looks for us", shared: true, day: "2026-10-24" } } } },
        });
        await go(page, "/corner");
        await passGate(page);
        const shared = page.locator(".journal-shared");
        await shared.locator("summary").click();
        await expect(shared.locator(".answer-text")).toHaveText("<img src=x onerror=\"window.hacked=1\">God looks for us");
        await expect(shared.locator("img")).toHaveCount(0);
        expect(await page.evaluate(() => window.hacked)).toBeUndefined();
    });

    test("the harder stories are off until a grown-up turns them on, and a direct link waits too", async ({ page }) => {
        await seed(page, { children: [MIA], current: MIA.id });
        await go(page, "/map");
        await expect(page.locator(".map-stop.side")).toHaveCount(3);
        await expect(page.locator('[data-story="while-he-lingered"]')).toHaveCount(0);
        await expect(page.locator(".count-pill")).toHaveText("0 of 11");
        await go(page, "/stop/for-his-oaths-sake");
        await expect.poll(() => hash(page)).toBe("#/map");
        await go(page, "/corner");
        await passGate(page);
        await page.locator('[data-setting="harderStories"]').check({ force: true });
        await go(page, "/map");
        await expect(page.locator(".map-stop.side")).toHaveCount(5);
        await expect(page.locator(".count-pill")).toHaveText("0 of 13");
        await go(page, "/stop/for-his-oaths-sake");
        await expect(page.locator(".trail-note")).toContainText("harder stories");
        await expect(page.locator(".grown-up-note")).toBeVisible();
    });

    test("Read shows the KJV pill on a page where Jesus speaks, and Read the chapter opens the Bible", async ({ page }) => {
        await seed(page, { children: [MIA], current: MIA.id });
        await go(page, "/stop/forbid-them-not/watch");
        const book = page.locator("flip-book");
        await expect(book).toBeVisible();
        await book.evaluate(async (b) => {
            const wait = (ms) => new Promise((r) => setTimeout(r, ms));
            while (b.pageCount === 0) {
                await wait(50);
            }
            for (let tries = 0; tries < 20 && b.page < 5; tries += 1) {
                const before = b.page;
                b.next();
                for (let t = 0; t < 40 && b.page === before; t += 1) {
                    await wait(50);
                }
            }
        });
        const pill = page.locator("flip-book .page-action").filter({ visible: true });
        await expect(pill).toHaveCount(1);
        await pill.click();
        await expect(page.locator("dialog.kjv-dialog .kjv-ref")).toHaveText("Mark 10:14");
        await page.locator("dialog.kjv-dialog .kjv-close").click();
        await page.locator("[data-chapter]").click();
        await expect(page.locator("passage-reader")).toBeAttached({ timeout: 10_000 });
    });

    test("Who Said It? asks who, then where it is written", async ({ page }) => {
        await seed(page, { children: [MIA], current: MIA.id, explorer: { [MIA.id]: { stops: { "too-many-for-me": stop(["watch", "find", "play"]) } } } });
        const story = xstory("too-many-for-me");
        await go(page, `/stop/${story.id}/play/who-said`);
        const who = page.locator("kids-who-said");
        for (let n = 0; n < story.whoSaid.length; n += 1) {
            const quote = (await who.locator(".quote p").textContent()).replace(/^“|”$/g, "");
            const saying = story.whoSaid.find((w) => w.quote === quote);
            await expect(who.locator(".quote cite")).toHaveText("Where is it written? Find out next.");
            await who.locator(`[data-person="${saying.id}"]`).click();
            await expect(who.locator(".ref")).toHaveCount(3);
            await who.locator(`.ref[data-ref="${saying.reference}"]`).click();
            await expect(who.locator(".quote cite")).toHaveText(saying.reference);
            if (n < story.whoSaid.length - 1) {
                await expect(who.locator(".ref")).toHaveCount(0, { timeout: 6000 });
            }
        }
        await expect(who.locator(".feedback")).toContainText("It's in");
    });

    test("Map Quest pins a place and its card goes in the Field Guide; the Book Train brings the scroll", async ({ page }) => {
        await seed(page, { children: [MIA], current: MIA.id });
        await go(page, "/games");
        await page.locator('[data-play="#/games/map-quest"]').click();
        const quest = page.locator("kids-map-quest");
        const place = XDATA.mapQuest.places.find((p) => p.card === "patmos");
        await quest.locator('[data-card="patmos"]').click();
        const map = quest.locator(".map");
        const box = await map.boundingBox();
        // Far off first: not there.
        await map.click({ position: { x: box.width * 0.95, y: box.height * 0.95 } });
        await expect(quest.locator(".feedback")).toContainText("Not quite");
        await map.click({ position: { x: place.x * box.width, y: place.y * box.height } });
        await expect(quest.locator(".pin")).toHaveCount(1);
        let saved = await readStore(page, MIA.id);
        expect(saved.explorer.quest).toEqual({ patmos: true });
        expect(Object.keys(saved.explorer.cards)).toEqual(["patmos"]);
        // The Book Train: the carriages, then one carriage's books.
        await go(page, "/games/book-train");
        const train = page.locator("kids-book-train");
        for (let i = 0; i < XDATA.bookTrain.groups.length; i += 1) {
            await train.locator(`.car[data-group="${i}"]`).click();
        }
        await expect(train.locator(".book").first()).toBeVisible({ timeout: 5000 });
        const count = await train.locator(".book").count();
        for (let i = 0; i < count; i += 1) {
            await train.locator(`.book[data-book="${i}"]`).click();
        }
        await expect(train.locator(".feedback")).toContainText("All aboard");
        saved = await readStore(page, MIA.id);
        expect(saved.explorer.trainWins).toBe(1);
        expect(Object.keys(saved.explorer.cards)).toContain("scroll");
    });

    test("an Explorer moved up from Young Lions keeps the tree, and finds it behind a tap", async ({ page }) => {
        await seed(page, {
            children: [MIA], current: MIA.id,
            progress: { [MIA.id]: { stops: { "where-art-thou": stop() }, firsts: {} } },
        });
        await go(page, "/home");
        await page.locator("[data-tree]").click();
        await expect(page.locator(".tree-dialog .tree")).toHaveAttribute("aria-label", /1 leaf/);
    });
});

test.describe("the Read step on every screen", () => {
    // A 9:16 stand-in, the shape of the story pages (the shared one is square).
    const PAGE = '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="640"><rect width="360" height="640" fill="#2b6e48"/></svg>';

    test.beforeEach(async ({ page }) => {
        await stubMedia(page);
        await page.route(/\/media\/.*\.webp$/, (route) =>
            route.fulfill({ status: 200, contentType: "image/svg+xml", headers: { "Access-Control-Allow-Origin": "*" }, body: PAGE }),
        );
    });

    test("the flipbook is bound at the top and nearly as wide as the screen; the buttons follow below it", async ({ page }) => {
        const errors = watchErrors(page);
        await seed(page, { children: [MIA], current: MIA.id });
        await go(page, "/stop/where-art-thou/watch");
        const book = page.locator("flip-book");
        await expect(book).toHaveAttribute("flip", "up");
        await expect.poll(() => book.evaluate((b) => b.shadowRoot.getElementById("book").getBoundingClientRect().width)).toBeGreaterThan(0);
        // Wide enough to read: the page takes the width, not the height left over.
        const { pageWidth, room } = await book.evaluate((b) => ({
            pageWidth: b.shadowRoot.getElementById("book").getBoundingClientRect().width,
            room: b.closest(".read").clientWidth,
        }));
        expect(pageWidth / room).toBeGreaterThan(0.85);
        // The screen scrolls to the buttons instead of squeezing the book.
        const bookBottom = await book.evaluate((b) => b.getBoundingClientRect().bottom);
        const toolsTop = await page.locator(".read-tools").evaluate((t) => t.getBoundingClientRect().top);
        expect(toolsTop).toBeGreaterThanOrEqual(bookBottom);
        await page.locator("[data-listen]").scrollIntoViewIfNeeded();
        await expect(page.locator("[data-listen]")).toBeInViewport();
        expectNoErrors(errors);
    });
});
