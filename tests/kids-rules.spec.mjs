/**
 * Daily Grace Kids without a browser: the story data is whole and consistent,
 * and the rules (assets/scripts/kids/rules.js) count leaves, birds, Nari's
 * stage and stickers right, never twice and never backwards. These run once,
 * on the desktop project: they don't depend on the screen.
 */
import { test, expect } from "@playwright/test";
import * as rules from "../assets/scripts/kids/rules.js";
import { DATA, STORIES, stop } from "./kids-helpers.mjs";

test.beforeEach(() => {
    test.skip(test.info().project.name !== "desktop", "no screen involved: runs once");
});

const finishedAll = (ids) => ({ stops: Object.fromEntries(ids.map((id) => [id, stop()])), firsts: {} });
const MEDIA = /^media:[a-z0-9/_.-]+\.(webp|png|jpg|webm)$/;

test.describe("story data", () => {
    test("every story has six panels told for both ages, each with its picture and voices", () => {
        expect(STORIES.length).toBe(8);
        for (const s of STORIES) {
            expect(s.panels, s.id).toHaveLength(6);
            for (const p of s.panels) {
                expect(p.image, s.id).toMatch(MEDIA);
                expect(p.lambs.trim().length, s.id).toBeGreaterThan(10);
                expect(p.lions.trim().length, s.id).toBeGreaterThan(10);
                expect(p.audio.lambs, s.id).toMatch(MEDIA);
                expect(p.audio.lions, s.id).toMatch(MEDIA);
                expect(p.ref, s.id).toMatch(/\d+:\d+/);
            }
            expect(s.titleAudio, s.id).toMatch(MEDIA);
            expect(s.badge, s.id).toMatch(MEDIA);
        }
    });

    test("each verse is built from its own words, and the missing word is really in it", () => {
        for (const s of STORIES) {
            const v = s.verse;
            expect(v.chunks.join(" "), s.id).toBe(v.text);
            for (const chunk of v.chunks) {
                expect(chunk.split(" ").length, `${s.id}: "${chunk}"`).toBeLessThanOrEqual(4);
            }
            expect(v.text, s.id).toMatch(new RegExp(`\\b${v.blank}\\b`));
            expect(v.choices, s.id).toContain(v.blank);
            expect(new Set(v.choices).size, s.id).toBe(v.choices.length);
            expect(v.choices.length, s.id).toBe(3);
            expect(v.plain.length, s.id).toBeGreaterThan(5);
            expect(v.audio, s.id).toMatch(MEDIA);
        }
    });

    test("Look & Find spots sit on the picture, and the youngest have fewer to find", () => {
        for (const s of STORIES) {
            expect(s.find.lambsCount, s.id).toBeLessThanOrEqual(s.find.items.length);
            expect(s.find.lambsCount, s.id).toBeGreaterThanOrEqual(1);
            for (const item of s.find.items) {
                expect(item.spots.length, `${s.id}: ${item.label}`).toBeGreaterThan(0);
                for (const [x, y, r] of item.spots) {
                    for (const n of [x, y]) {
                        expect(n, `${s.id}: ${item.label}`).toBeGreaterThan(0);
                        expect(n, `${s.id}: ${item.label}`).toBeLessThan(1);
                    }
                    expect(r, `${s.id}: ${item.label}`).toBeGreaterThan(0);
                    expect(r, `${s.id}: ${item.label}`).toBeLessThan(0.5);
                }
            }
            expect(new Set(s.find.items.map((i) => i.label)).size, s.id).toBe(s.find.items.length);
        }
    });

    test("each story's games have what they need", () => {
        for (const s of STORIES) {
            const truths = s.rightOrNot.map((r) => r.right);
            expect(s.rightOrNot.length, s.id).toBeGreaterThanOrEqual(3);
            // The youngest get the first three: both answers turn up there too.
            expect(new Set(truths.slice(0, 3)).size, s.id).toBe(2);
            for (const g of s.games) {
                if (g.type === "who-said") {
                    expect(s.whoSaid.length, s.id).toBeGreaterThanOrEqual(2);
                    expect(new Set(s.whoSaid.map((w) => w.id)).size, s.id).toBe(s.whoSaid.length);
                    for (const w of s.whoSaid) {
                        expect(w.portraits.length, `${s.id}: ${w.name}`).toBeGreaterThan(0);
                    }
                } else if (g.type === "gather") {
                    expect(g.lambs, s.id).toBeGreaterThanOrEqual(1);
                    expect(g.lions, s.id).toBeLessThanOrEqual(DATA.count.length);
                    expect(g.otherImages.length, s.id).toBeGreaterThan(0);
                } else {
                    expect(g.type, s.id).toBe("colour");
                }
            }
            expect(s.colouring.image, s.id).toMatch(MEDIA);
            expect(s.colouring.print, s.id).toMatch(/\.png$/);
            expect(s.talk.ask.length, s.id).toBeGreaterThan(0);
        }
        expect(DATA.count).toHaveLength(12);
        expect(DATA.pairs.cards.length).toBeGreaterThanOrEqual(6);
    });

    test("the road holds every story once, on a clearing that exists", () => {
        const onRoad = DATA.map.road.filter((p) => p.story).map((p) => p.story);
        expect(onRoad.sort()).toEqual(STORIES.map((s) => s.id).sort());
        const used = new Set();
        for (const place of DATA.map.road) {
            const section = DATA.map.sections.find((s) => s.id === place.section);
            expect(section, place.story ?? place.soon).toBeTruthy();
            expect(place.clearing, place.story ?? place.soon).toBeLessThan(section.clearings.length);
            const key = `${place.section}/${place.clearing}`;
            expect(used.has(key), `two places on ${key}`).toBe(false);
            used.add(key);
        }
        for (const s of STORIES) {
            expect(DATA.map.road.find((p) => p.story === s.id).section, s.id).toBe(s.section);
        }
    });

    test("stages grow in order and every sticker series is there", () => {
        const mins = (list) => list.map((s) => s.min);
        expect(mins(DATA.nari.stages)).toEqual([...mins(DATA.nari.stages)].sort((a, b) => a - b));
        expect(mins(DATA.tree.stages)).toEqual([...mins(DATA.tree.stages)].sort((a, b) => a - b));
        expect(DATA.nari.stages[0].min).toBe(0);
        expect(DATA.tree.stages[0].min).toBe(0);
        const groups = Object.groupBy(DATA.stickers.list, (s) => s.group);
        expect(groups.AG).toHaveLength(6);
        expect(groups.AN).toHaveLength(26);
        for (const path of DATA.stickers.paths) {
            expect(groups[path.group]?.length, path.group).toBeGreaterThan(0);
        }
        expect(new Set(DATA.stickers.list.map((s) => s.id)).size).toBe(DATA.stickers.list.length);
    });
});

test.describe("rules", () => {
    test("a story counts as finished only with all four steps and Talk Together reached", () => {
        expect(rules.isFinished(undefined)).toBe(false);
        expect(rules.isFinished({})).toBe(false);
        expect(rules.isFinished(stop(["watch", "find", "play", "verse"]))).toBe(false);
        expect(rules.isFinished(stop(["watch", "find", "play", "verse"], { talkLater: true }))).toBe(true);
        expect(rules.isFinished(stop(["find", "play", "verse", "talk"]))).toBe(false);
        expect(rules.isFinished(stop())).toBe(true);
    });

    test("tally: one leaf per story, fruit per verse, flower per talk, bird per finished part of the map", () => {
        expect(rules.tally(null, DATA)).toMatchObject({ leaves: 0, fruit: 0, flowers: 0, birds: 0 });
        const p = { stops: { [STORIES[0].id]: stop(), [STORIES[1].id]: stop(["watch", "find", "play", "verse"], { talkLater: true }), [STORIES[2].id]: stop(["watch", "verse"]) } };
        // Stories 1 and 2 share the second part of the map, so it isn't done yet.
        expect(rules.tally(p, DATA)).toMatchObject({ leaves: 2, fruit: 3, flowers: 1, birds: 1, watched: 3, finds: 2 });
        // A story that isn't in the data (an old record) counts for nothing.
        p.stops["no-such-story"] = stop();
        expect(rules.tally(p, DATA).leaves).toBe(2);
        // Pairs wins that are damaged count as none.
        expect(rules.tally({ ...p, pairsWins: "lots" }, DATA).pairs).toBe(0);
        expect(rules.tally({ ...p, pairsWins: -4 }, DATA).pairs).toBe(0);
    });

    test("a part of the map is done only when every story in it is finished", () => {
        const both = finishedAll(STORIES.filter((s) => s.section === "map-04").map((s) => s.id));
        expect(rules.sectionsDone(both, DATA)).toEqual(["map-04"]);
        const one = finishedAll([STORIES.find((s) => s.section === "map-04").id]);
        expect(rules.sectionsDone(one, DATA)).toEqual([]);
        expect(rules.sectionsDone(finishedAll(STORIES.map((s) => s.id)), DATA).length).toBe(new Set(STORIES.map((s) => s.section)).size);
    });

    test("Nari and the tree grow at their thresholds, and the next stage says how many more", () => {
        for (const stage of DATA.nari.stages) {
            expect(rules.nariStage(stage.min, DATA).stage).toBe(stage.stage);
        }
        expect(rules.nariStage(999, DATA)).toBe(DATA.nari.stages.at(-1));
        expect(rules.nextNariStage(0, DATA)).toEqual({ stage: DATA.nari.stages[1], more: DATA.nari.stages[1].min });
        expect(rules.nextNariStage(DATA.nari.stages.at(-1).min, DATA)).toBeNull();
        expect(rules.treeStage(0, DATA)).toBe(DATA.tree.stages[0]);
        expect(rules.treeStage(DATA.tree.stages[1].min, DATA)).toBe(DATA.tree.stages[1]);
        expect(rules.treeStage(DATA.tree.stages[1].min - 1, DATA)).toBe(DATA.tree.stages[0]);
    });

    test("the next story follows the road, skipping finished ones, then none", () => {
        const road = rules.road(DATA);
        expect(road.map((s) => s.id)).toEqual(DATA.map.road.filter((p) => p.story).map((p) => p.story));
        expect(rules.nextStory(null, DATA).id).toBe(road[0].id);
        expect(rules.nextStory(finishedAll([road[0].id]), DATA).id).toBe(road[1].id);
        // Finishing out of order: the first unfinished one on the road.
        expect(rules.nextStory(finishedAll([road[1].id]), DATA).id).toBe(road[0].id);
        expect(rules.nextStory(finishedAll(road.map((s) => s.id)), DATA)).toBeNull();
    });

    test("in order, a story opens once those before it are finished; a finished one stays open", () => {
        const road = rules.road(DATA);
        expect(rules.isOpen(road[3].id, null, DATA, false)).toBe(true);
        expect(rules.isOpen(road[0].id, null, DATA, true)).toBe(true);
        expect(rules.isOpen(road[1].id, null, DATA, true)).toBe(false);
        expect(rules.isOpen(road[1].id, finishedAll([road[0].id]), DATA, true)).toBe(true);
        expect(rules.isOpen(road[2].id, finishedAll([road[0].id]), DATA, true)).toBe(false);
        // Finished before the setting was turned on: still open.
        expect(rules.isOpen(road[5].id, finishedAll([road[5].id]), DATA, true)).toBe(true);
        expect(rules.isOpen("no-such-story", null, DATA, false)).toBe(false);
    });

    test("stickers: what each path has earned, each once, with the series taking turns", () => {
        const s0 = STORIES[0].id;
        const p = { stops: { [s0]: stop() }, firsts: { watch: true, find: true, play: true, verse: true, talk: true, map: true }, pairsWins: 0 };
        const due = rules.dueStickers(p, {}, DATA);
        const groups = due.map((d) => d.id.slice(0, 2));
        // 6 firsts, 1 hero (first story), 1 saying (first verse), 0 fruit (4th talk), 1 animal (a find).
        expect(groups.filter((g) => g === "AG")).toHaveLength(6);
        expect(groups.filter((g) => g === "HB")).toHaveLength(1);
        expect(groups.filter((g) => g === "BS")).toHaveLength(1);
        expect(groups.filter((g) => g === "FS")).toHaveLength(0);
        expect(groups.filter((g) => g === "AN")).toHaveLength(1);
        expect(new Set(due.map((d) => d.id)).size).toBe(due.length);
        // The first round has one from each series that has one due.
        expect(groups.slice(0, 4)).toEqual(["AG", "HB", "BS", "AN"]);

        // Given one at a time (as on coming home), the series still take turns.
        const earned = {};
        const order = [];
        for (let i = 0; i < due.length; i += 1) {
            const next = rules.dueStickers(p, earned, DATA)[0];
            earned[next.id] = { path: next.path };
            order.push(next.id.slice(0, 2));
        }
        expect(order.slice(0, 4)).toEqual(["AG", "HB", "BS", "AN"]);
        expect(order.slice(4)).toEqual(["AG", "AG", "AG", "AG", "AG"]);
        expect(rules.dueStickers(p, earned, DATA)).toEqual([]);
    });

    test("stickers: thresholds for every third story, every fourth talk, and animals from pairs", () => {
        const ids = STORIES.map((s) => s.id);
        const count = (p, group) => rules.dueStickers(p, {}, DATA).filter((d) => d.id.startsWith(group)).length;
        expect(count(finishedAll(ids.slice(0, 3)), "HB")).toBe(1);
        expect(count(finishedAll(ids.slice(0, 4)), "HB")).toBe(2);
        expect(count(finishedAll(ids.slice(0, 7)), "HB")).toBe(3);
        expect(count(finishedAll(ids.slice(0, 3)), "FS")).toBe(0);
        expect(count(finishedAll(ids.slice(0, 4)), "FS")).toBe(1);
        expect(count(finishedAll(ids.slice(0, 8)), "FS")).toBe(2);
        expect(count({ stops: {}, firsts: {}, pairsWins: 3 }, "AN")).toBe(3);
        // A series that runs out gives no more.
        expect(count({ stops: {}, firsts: {}, pairsWins: 500 }, "AN")).toBe(26);
        // Already earned: never due again.
        const earned = Object.fromEntries(DATA.stickers.list.filter((s) => s.group === "AN").map((s) => [s.id, { path: "animals" }]));
        expect(rules.dueStickers({ stops: {}, firsts: {}, pairsWins: 500 }, earned, DATA)).toEqual([]);
    });

    test("tree pieces take turns along the spots, birds sit on perches, and the nest comes with the first bird", () => {
        const stage = DATA.tree.stages.at(-1);
        expect(rules.piecesFor({ leaves: 0, fruit: 0, flowers: 0, birds: 0 }, stage)).toEqual([]);
        const pieces = rules.piecesFor({ leaves: 2, fruit: 1, flowers: 1, birds: 1 }, stage);
        expect(pieces.map((p) => p.kind)).toEqual(["leaf", "fruit", "flower", "leaf", "bird", "nest"]);
        expect(pieces.find((p) => p.kind === "leaf" && p.n === 2)).toBeTruthy();
        // More than the spots: the extra pieces are counted, not drawn.
        const many = rules.piecesFor({ leaves: 500, fruit: 500, flowers: 500, birds: 50 }, stage);
        expect(many.filter((p) => p.kind !== "bird" && p.kind !== "nest")).toHaveLength(stage.spots.length);
        expect(many.filter((p) => p.kind === "bird")).toHaveLength(stage.perches.length);
        expect(many.filter((p) => p.kind === "nest")).toHaveLength(1);
        for (const p of many) {
            expect(p.x).toBeGreaterThan(0);
            expect(p.x).toBeLessThan(1);
        }
    });
});
