/**
 * The Daily Grace Kids store (assets/scripts/kids/store.js) in a real browser:
 * names are cleaned, there are never more than four children, damaged values
 * read back as defaults, steps only ever turn on, the time limit adds up, and
 * blocked storage falls back to memory instead of breaking. Runs once, on the
 * desktop project.
 */
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    test.skip(test.info().project.name !== "desktop", "no screen involved: runs once");
    // Any page of the site gives the store its origin.
    await page.goto("/assets/fonts/Andika-OFL.txt");
});

/** Runs `fn(store)` in the page with a fresh copy of the store module. */
function withStore(page, fn, arg) {
    return page.evaluate(async ({ source, arg }) => {
        const store = await import(`/assets/scripts/kids/store.js?fresh=${Math.random()}`);
        // eslint-disable-next-line no-new-func
        return new Function("store", "arg", `return (${source})(store, arg);`)(store, arg);
    }, { source: fn.toString(), arg });
}

test("names are trimmed, single-spaced, stripped of control characters and cut at twenty", async ({ page }) => {
    const names = await withStore(page, (store) => [
        store.cleanName("  Anna   Maria  "),
        store.cleanName("Ben\u0000\u0007\n\tJr"),
        store.cleanName("A".repeat(50)),
        store.cleanName("Zoë 李 😀 Ñ"),
        store.cleanName("😀".repeat(25)),
        store.cleanName(null),
        store.cleanName("   "),
        store.cleanName(42),
    ]);
    expect(names).toEqual(["Anna Maria", "Ben Jr", "A".repeat(20), "Zoë 李 😀 Ñ", "😀".repeat(20), "", "", "42"]);
});

test("children: up to four, an empty name refused, the avatar and age checked", async ({ page }) => {
    const result = await withStore(page, (store) => {
        const out = {};
        const a = store.addChild({ name: "Anna", band: "lions", avatar: "KA-03" });
        out.id = /^c[0-9a-f]{12}$/.test(a.id);
        try {
            store.addChild({ name: "   ", band: "lambs", avatar: "KA-01" });
        } catch (e) {
            out.empty = e.message;
        }
        const odd = store.addChild({ name: "<b>Bo</b>", band: "explorers", avatar: "../../x" });
        out.odd = { name: odd.name, band: odd.band, avatar: odd.avatar };
        store.addChild({ name: "Cy", band: "lambs", avatar: "KA-05" });
        store.addChild({ name: "Di", band: "lambs", avatar: "KA-06" });
        try {
            store.addChild({ name: "Ed", band: "lambs", avatar: "KA-07" });
        } catch (e) {
            out.fifth = e.message;
        }
        out.count = store.profiles().children.length;
        try {
            store.updateChild(a.id, { name: "" });
        } catch (e) {
            out.blankEdit = e.message;
        }
        out.unknownEdit = store.updateChild("cnope", { name: "X" });
        out.edited = store.updateChild(a.id, { name: "  Annie ", band: "lambs" }).name;
        return out;
    });
    expect(result).toEqual({
        id: true,
        empty: "name",
        // The name is kept as typed (the page escapes it); the age and picture fall back.
        odd: { name: "<b>Bo</b>", band: "lambs", avatar: "KA-00" },
        fifth: "full",
        count: 4,
        blankEdit: "name",
        unknownEdit: null,
        edited: "Annie",
    });
});

test("removing a child deletes their progress and stickers, and forgets them as the current one", async ({ page }) => {
    const result = await withStore(page, (store) => {
        const a = store.addChild({ name: "Anna", band: "lions", avatar: "KA-03" });
        const b = store.addChild({ name: "Ben", band: "lambs", avatar: "KA-04" });
        store.setCurrent(a.id);
        store.completeStep(a.id, "where-art-thou", "watch");
        store.giveStickers(a.id, [{ id: "AG-01", path: "firsts" }]);
        store.completeStep(b.id, "where-art-thou", "watch");
        store.removeChild(a.id);
        return {
            current: store.currentChild(),
            left: store.profiles().children.map((c) => c.name),
            keys: Object.keys(localStorage).filter((k) => k.includes(a.id)),
            ben: store.progress(b.id).stops["where-art-thou"].steps.watch,
            unknownCurrent: (store.setCurrent("cnope"), store.profiles().current),
        };
    });
    expect(result).toEqual({ current: null, left: ["Ben"], keys: [], ben: true, unknownCurrent: null });
});

test("damaged values read back as defaults, and bad entries are dropped", async ({ page }) => {
    await page.evaluate(() => {
        const set = (k, v) => localStorage.setItem(`dailygrace:kids:${k}`, v);
        set("profiles", JSON.stringify({
            children: [
                { id: "cgood01", name: "Anna", band: "lions", avatar: "KA-03" },
                { id: "cgood01", name: "Anna again", band: "lions", avatar: "KA-03" },
                { id: "BAD ID!", name: "Bad", band: "lions", avatar: "KA-03" },
                { id: "cnoname", name: "   ", band: "lions", avatar: "KA-03" },
                "not a child",
                null,
                { id: "cgood02", name: "Ben", band: 7, avatar: 3 },
                { id: "cgood03", name: "Cy" },
                { id: "cgood04", name: "Di" },
                { id: "cgood05", name: "Ed" },
            ],
            current: "cgood09",
        }));
        set("settings", "[1, 2, 3]");
        set("cgood01:progress", JSON.stringify({
            stops: {
                "where-art-thou": { steps: { watch: "yes", find: true, play: 1 }, times: "many", finishedOn: 5 },
                "../evil": { steps: { watch: true } },
                "too-many-for-me": "done",
            },
            firsts: { watch: "true", find: true, nonsense: true },
            pairsWins: "lots",
            lastTalk: { question: "no story" },
        }));
        set("cgood01:stickers", JSON.stringify({ earned: { "AG-01": { path: "firsts", seen: "yes" }, "<script>": { path: "x" }, "HB-01": { day: 3 } } }));
        set("cgood02:progress", "{not json");
        set("usage", JSON.stringify({ day: "1999-01-01", minutes: 999, extra: 999 }));
    });
    const result = await withStore(page, (store) => ({
        profiles: store.profiles(),
        settings: store.settings(),
        progress: store.progress("cgood01"),
        broken: store.progress("cgood02"),
        stickers: store.stickers("cgood01"),
        usage: store.usage(),
        persistent: store.isPersistent(),
    }));
    expect(result.profiles.children.map((c) => [c.id, c.name, c.band, c.avatar])).toEqual([
        ["cgood01", "Anna", "lions", "KA-03"],
        ["cgood02", "Ben", "lambs", "KA-00"],
        ["cgood03", "Cy", "lambs", "KA-00"],
        ["cgood04", "Di", "lambs", "KA-00"],
    ]);
    expect(result.profiles.current).toBeNull();
    expect(result.settings).toEqual({ timeLimit: 0, narration: true, sound: true, readTogether: false, bigText: false, readingFont: false, lessMotion: false, mapInOrder: false });
    expect(Object.keys(result.progress.stops)).toEqual(["where-art-thou"]);
    expect(result.progress.stops["where-art-thou"]).toEqual({
        steps: { watch: false, find: true, play: false, verse: false, talk: false }, talkLater: false, finishedOn: null, times: 0,
    });
    expect(result.progress.firsts).toEqual({ find: true });
    expect(result.progress.pairsWins).toBe(0);
    expect(result.progress.lastTalk).toBeNull();
    expect(result.broken).toEqual({ stops: {}, firsts: {}, pairsWins: 0, lastStory: null, lastTalk: null });
    expect(Object.keys(result.stickers.earned)).toEqual(["AG-01"]);
    expect(result.stickers.earned["AG-01"].seen).toBe(false);
    // Yesterday's minutes don't count today.
    expect(result.usage.minutes).toBe(0);
    expect(result.persistent).toBe(true);
});

test("settings keep only known values; the time limit only its four choices", async ({ page }) => {
    const result = await withStore(page, (store) => [
        store.updateSettings({ timeLimit: 30, bigText: true, sound: "loud", hacker: true }),
        store.updateSettings({ timeLimit: 17 }),
    ]);
    expect(result[0]).toMatchObject({ timeLimit: 30, bigText: true, sound: true });
    expect(result[0]).not.toHaveProperty("hacker");
    expect(result[1].timeLimit).toBe(0);
});

test("steps only turn on; a step done again is not new; Talk later finishes without a flower", async ({ page }) => {
    const result = await withStore(page, (store) => {
        const id = "cabcd01";
        const out = {};
        out.first = store.completeStep(id, "where-art-thou", "watch").wasNew;
        out.again = store.completeStep(id, "where-art-thou", "watch").wasNew;
        try {
            store.completeStep(id, "where-art-thou", "dance");
        } catch (e) {
            out.unknown = e.message;
        }
        for (const step of ["find", "play", "verse"]) {
            store.completeStep(id, "where-art-thou", step);
        }
        const later = store.completeStep(id, "where-art-thou", "talk", { later: true });
        out.later = { wasNew: later.wasNew, talk: later.progress.stops["where-art-thou"].steps.talk, talkLater: later.progress.stops["where-art-thou"].talkLater };
        out.lastTalkAfterLater = later.progress.lastTalk;
        const f1 = store.finishStory(id, "where-art-thou");
        const f2 = store.finishStory(id, "where-art-thou");
        out.finish = [f1.first, f2.first, f2.progress.stops["where-art-thou"].times];
        const talked = store.completeStep(id, "where-art-thou", "talk", { question: "Q".repeat(400) });
        out.talked = talked.wasNew;
        out.question = talked.progress.lastTalk.question.length;
        out.firsts = Object.keys(talked.progress.firsts).sort();
        store.addPairsWin(id);
        store.addPairsWin(id);
        out.pairs = store.progress(id).pairsWins;
        out.firstMap = store.setFirst(id, "map").firsts.map;
        out.firstBogus = store.setFirst(id, "bogus").firsts.bogus;
        return out;
    });
    expect(result).toEqual({
        first: true,
        again: false,
        unknown: "unknown step dance",
        later: { wasNew: false, talk: false, talkLater: true },
        lastTalkAfterLater: null,
        finish: [true, false, 2],
        talked: true,
        question: 300,
        firsts: ["find", "play", "talk", "verse", "watch"],
        pairs: 2,
        firstMap: true,
        firstBogus: undefined,
    });
});

test("stickers are given once each and marked seen", async ({ page }) => {
    const result = await withStore(page, (store) => {
        const id = "cabcd02";
        const given1 = store.giveStickers(id, [{ id: "AG-01", path: "firsts" }, { id: "HB-01", path: "stops" }]);
        const given2 = store.giveStickers(id, [{ id: "AG-01", path: "firsts" }, { id: "BS-01", path: "verses" }]);
        const none = store.giveStickers(id, []);
        const unseen = Object.values(store.stickers(id).earned).filter((e) => !e.seen).length;
        store.markStickersSeen(id);
        const after = Object.values(store.stickers(id).earned).filter((e) => !e.seen).length;
        return { given1, given2, none, unseen, after, total: Object.keys(store.stickers(id).earned).length };
    });
    expect(result).toEqual({ given1: ["AG-01", "HB-01"], given2: ["BS-01"], none: [], unseen: 3, after: 0, total: 3 });
});

test("the time limit: minutes add up, extra time is capped, no limit means no end", async ({ page }) => {
    const result = await withStore(page, (store) => {
        const out = {};
        out.none = store.minutesLeft();
        store.updateSettings({ timeLimit: 15 });
        store.addUsage(10);
        store.addUsage(-50);
        out.afterTen = store.minutesLeft();
        store.addUsage(6);
        out.over = store.minutesLeft();
        store.addExtraTime(15);
        out.extra = store.minutesLeft();
        for (let i = 0; i < 30; i += 1) {
            store.addExtraTime(15);
        }
        out.capped = store.usage().extra;
        return out;
    });
    expect(result).toEqual({ none: Infinity, afterTen: 5, over: -1, extra: 14, capped: 240 });
});

test("blocked storage: the store keeps working in memory and says so", async ({ page }) => {
    await page.addInitScript(() => {
        Object.defineProperty(window, "localStorage", {
            configurable: true,
            get() {
                throw new DOMException("The operation is insecure.", "SecurityError");
            },
        });
    });
    await page.reload();
    const result = await withStore(page, (store) => {
        let told = false;
        store.events.addEventListener("storagechange", () => {
            told = true;
        });
        const a = store.addChild({ name: "Anna", band: "lions", avatar: "KA-03" });
        store.setCurrent(a.id);
        store.completeStep(a.id, "where-art-thou", "watch");
        return { persistent: store.isPersistent(), told, current: store.currentChild()?.name, watch: store.progress(a.id).stops["where-art-thou"].steps.watch };
    });
    expect(result).toEqual({ persistent: false, told: true, current: "Anna", watch: true });
});

test("a full disk: writes fail but the visit goes on in memory", async ({ page }) => {
    await page.addInitScript(() => {
        Storage.prototype.setItem = () => {
            throw new DOMException("Quota exceeded", "QuotaExceededError");
        };
    });
    await page.reload();
    const result = await withStore(page, (store) => {
        const a = store.addChild({ name: "Anna", band: "lions", avatar: "KA-03" });
        store.completeStep(a.id, "where-art-thou", "verse");
        return { persistent: store.isPersistent(), verse: store.progress(a.id).stops["where-art-thou"].steps.verse, kids: store.profiles().children.length };
    });
    expect(result).toEqual({ persistent: false, verse: true, kids: 1 });
});
