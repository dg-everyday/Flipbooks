/**
 * Daily Grace Kids, the stories: every story can be played to the end at both
 * ages; what a story earns (a leaf, a fruit, a flower, a bird, stickers) comes
 * once and only once; the steps keep their order the first time; the map's
 * "in order" setting holds; links that skip ahead, unknown links and Back all
 * land somewhere sensible; and quick or repeated taps don't count twice.
 */
import { test, expect } from "@playwright/test";
import {
    ANNA, BEN, DATA, FIRST, KIDS, STORIES, appStarted, expectNoErrors, go, hash, playFind, playOrder, playStory, playVerse, playWatch,
    readStore, seed, stop, stubMedia, watchErrors,
} from "./kids-helpers.mjs";

const road = DATA.map.road.filter((p) => p.story).map((p) => STORIES.find((s) => s.id === p.story));

test.beforeEach(async ({ page }) => {
    test.skip(test.info().project.name !== "ipad", "the flows run on the tablet; layout runs everywhere (kids-device)");
    await stubMedia(page);
});

for (const story of STORIES) {
    for (const who of [BEN, ANNA]) {
        test(`${story.title}: played to the end by ${who.band}`, async ({ page }) => {
            const errors = watchErrors(page);
            await seed(page, { children: [who], current: who.id });
            await playStory(page, story, who.band);
            const reward = page.locator(".screen.reward");
            await expect(reward.locator("h1")).toHaveText(`Well done, ${who.name}!`);
            await expect(reward.locator(".r-leaf")).toContainText("+1 leaf");
            await expect(reward.locator(".r-fruit")).toContainText("+1 fruit");
            await expect(reward.locator(".r-flower")).toContainText("+1 flower");
            // A bird when this story was the only one left in its part of the map.
            const alone = STORIES.filter((s) => s.section === story.section).length === 1;
            await expect(reward.locator(".r-bird")).toHaveCount(alone ? 1 : 0);
            const saved = await readStore(page, who.id);
            expect(saved.progress.stops[story.id]).toMatchObject({
                steps: { watch: true, find: true, play: true, verse: true, talk: true }, times: 1,
            });
            expect(saved.progress.lastTalk.question).toBe(story.talk.ask[0]);
            // The first story's gifts come two at a time.
            expect(Object.keys(saved.stickers.earned)).toHaveLength(2);
            expectNoErrors(errors);
        });
    }
}

test("after the first story: home shows the tree, Nari, the next story and one more sticker", async ({ page }) => {
    await seed(page, { children: [ANNA], current: ANNA.id });
    await playStory(page, road[0], "lions");
    await page.locator(".screen.reward [data-go='#/stickers']").click();
    await expect(page.locator(".stickers .sub")).toHaveText("2 stickers so far");
    await go(page, "/home");
    await expect(page.locator(".tally .c-leaf")).toHaveText("1");
    await expect(page.locator(".tally .c-fruit")).toHaveText("1");
    await expect(page.locator(".tally .c-flower")).toHaveText("1");
    await expect(page.locator(".tally .c-bird")).toHaveText("1");
    await expect(page.locator(".keep-going")).toContainText(road[1].title);
    await expect(page.locator(".nari-line")).toContainText(`${DATA.nari.stages[1].min - 1} more stories to grow!`);
    await expect(page.locator("#kids-toast")).toHaveText("You have a new sticker!");
    await expect(page.locator(".nav-stickers .new-badge")).toHaveText("1");
    await go(page, "/map");
    await expect(page.locator(".count-pill")).toHaveText(`1 of ${STORIES.length}`);
    await expect(page.locator(`.map-stop.done[data-story="${road[0].id}"]`)).toBeVisible();
    await expect(page.locator(`.map-stop.next[data-story="${road[1].id}"]`)).toBeVisible();
});

test("playing a story again earns nothing twice, and the stickers due still arrive one by one, never doubled", async ({ page }) => {
    // Two whole stories and ten loads of home: more than the usual 30 s on a
    // real connection.
    test.setTimeout(120_000);
    await seed(page, { children: [ANNA], current: ANNA.id });
    await playStory(page, FIRST, "lions");
    await playStory(page, FIRST, "lions");
    const reward = page.locator(".screen.reward");
    await expect(reward).toContainText("You finished it again!");
    await expect(reward.locator(".reward-items")).toHaveCount(0);
    let saved = await readStore(page, ANNA.id);
    expect(saved.progress.stops[FIRST.id].times).toBe(2);
    // The first story earned 9 stickers in all: 6 firsts, a hero, a saying, an
    // animal. Each visit home (a fresh load of the page) gives one more.
    await go(page, "/home");
    for (let i = 0; i < 10; i += 1) {
        await page.reload();
        await appStarted(page);
        await expect(page.locator(".screen.home")).toBeVisible();
    }
    saved = await readStore(page, ANNA.id);
    const ids = Object.keys(saved.stickers.earned);
    expect(ids).toHaveLength(9);
    expect(ids.filter((id) => id.startsWith("AG"))).toHaveLength(6);
    await go(page, "/home");
    await expect(page.locator(".tally .c-leaf")).toHaveText("1");
    await expect(page.locator(".tally .c-flower")).toHaveText("1");
});

test("a reload of the reward screen shows the same rewards and gifts, without giving more", async ({ page }) => {
    await seed(page, { children: [ANNA], current: ANNA.id });
    await playStory(page, FIRST, "lions");
    const reward = page.locator(".screen.reward");
    const gift = await reward.locator(".gift h2").textContent();
    const before = Object.keys((await readStore(page, ANNA.id)).stickers.earned);
    await page.reload();
    await expect(reward.locator(".r-leaf")).toContainText("+1 leaf");
    await expect(reward.locator(".r-fruit")).toContainText("+1 fruit");
    await expect(reward.locator(".r-flower")).toContainText("+1 flower");
    await expect(reward.locator(".r-bird")).toHaveCount(1);
    await expect(reward).not.toContainText("finished it again");
    await expect(reward.locator(".gift h2")).toHaveText(gift);
    expect(Object.keys((await readStore(page, ANNA.id)).stickers.earned)).toEqual(before);
    // Left, then back: the reward is over, so home.
    await reward.locator("[data-go='#/map']").click();
    await expect.poll(() => hash(page)).toBe("#/map");
    await page.goBack();
    await expect.poll(() => hash(page)).toBe("#/home");
    // A link to the reward of a story finished another day: home too.
    await page.goto(`${KIDS}#/reward/${FIRST.id}`);
    await expect.poll(() => hash(page)).toBe("#/home");
});

test("Maybe later finishes the story without a flower; talking another time adds it", async ({ page }) => {
    await seed(page, { children: [BEN], current: BEN.id });
    await playStory(page, FIRST, "lambs", { later: true });
    const reward = page.locator(".screen.reward");
    await expect(reward.locator(".r-leaf")).toBeVisible();
    await expect(reward.locator(".r-flower")).toHaveCount(0);
    let saved = await readStore(page, BEN.id);
    expect(saved.progress.stops[FIRST.id]).toMatchObject({ talkLater: true, steps: { talk: false } });
    expect(saved.progress.lastTalk).toBeNull();
    // A finished story can open at any step.
    await go(page, `/stop/${FIRST.id}/talk`);
    await page.locator("[data-talked]").click();
    await expect(reward.locator(".r-flower")).toContainText("+1 flower");
    await expect(reward.locator(".r-leaf")).toHaveCount(0);
    saved = await readStore(page, BEN.id);
    expect(saved.progress.stops[FIRST.id].steps.talk).toBe(true);
});

test("two quick taps on We talked about it count the story once and keep its rewards", async ({ page }) => {
    await seed(page, { children: [ANNA], current: ANNA.id, progress: { [ANNA.id]: { stops: { [FIRST.id]: stop(["watch", "find", "play", "verse"]) } } } });
    await go(page, `/stop/${FIRST.id}/talk`);
    await page.locator("[data-talked]").dblclick();
    await expect(page.locator(".screen.reward .r-leaf")).toContainText("+1 leaf");
    await expect(page.locator(".screen.reward .r-flower")).toBeVisible();
    expect((await readStore(page, ANNA.id)).progress.stops[FIRST.id].times).toBe(1);
});

test("the first time through, a link to a later step opens the first step not done", async ({ page }) => {
    await seed(page, { children: [ANNA], current: ANNA.id, progress: { [ANNA.id]: { stops: { [FIRST.id]: stop(["watch"]) } } } });
    for (const step of ["verse", "talk", "play", "play/who-said"]) {
        await page.goto(`${KIDS}#/stop/${FIRST.id}/${step}`);
        await expect.poll(() => hash(page)).toBe(`#/stop/${FIRST.id}/find`);
        await expect(page.locator("kids-look-find")).toBeVisible();
    }
    // Without a step: the first one not done.
    await page.goto(`${KIDS}#/stop/${FIRST.id}`);
    await expect.poll(() => hash(page)).toBe(`#/stop/${FIRST.id}/find`);
    // Watching again is always allowed.
    await page.goto(`${KIDS}#/stop/${FIRST.id}/watch`);
    await expect(page.locator(".screen.watch")).toBeVisible();
    // The paw prints show one done, the second here.
    await page.goto(`${KIDS}#/stop/${FIRST.id}/find`);
    await expect(page.locator(".paw.done")).toHaveCount(1);
    await expect(page.locator(".paw.here")).toHaveAttribute("aria-label", "Look & Find");
});

test("unknown and broken links land somewhere sensible", async ({ page }) => {
    const errors = watchErrors(page);
    await seed(page, { children: [ANNA], current: ANNA.id });
    const cases = [
        ["/nowhere", "#/"],
        ["/stop/no-such-story", "#/map"],
        [`/stop/${FIRST.id}/dance`, `#/stop/${FIRST.id}/watch`],
        [`/reward/${FIRST.id}`, "#/home"],
        ["/reward/no-such-story", "#/home"],
        ["/games/colour/no-such-story", "#/games"],
        ["/print/verse/no-such-story", "#/corner"],
        [`/print/certificate/${ANNA.id}/map-01`, "#/corner"],
        ["/print/nothing", "#/corner"],
        ["/rest", "#/home"],
        ["/%E0%A4%A", "#/"],
    ];
    for (const [from, to] of cases) {
        await page.goto(`${KIDS}#${from}`);
        await expect.poll(() => hash(page), { message: from }).toBe(to);
    }
    expectNoErrors(errors);
});

test("a game this story doesn't have goes back to Play", async ({ page }) => {
    await seed(page, { children: [ANNA], current: ANNA.id, progress: { [ANNA.id]: { stops: { [FIRST.id]: stop(["watch", "find"]) } } } });
    expect(FIRST.games.some((g) => g.type === "gather")).toBe(false);
    await page.goto(`${KIDS}#/stop/${FIRST.id}/play/gather`);
    await expect.poll(() => hash(page)).toBe(`#/stop/${FIRST.id}/play`);
    await expect(page.locator("kids-story-order")).toBeVisible();
});

test("Stories in order: later stories stay shut until the ones before are finished", async ({ page }) => {
    await seed(page, { children: [BEN], current: BEN.id, settings: { mapInOrder: true } });
    await go(page, "/map");
    await expect(page.locator(`.map-stop[data-story="${road[0].id}"]`)).not.toHaveClass(/locked/);
    await expect(page.locator(".map-stop.locked")).toHaveCount(road.length - 1);
    await page.locator(`.map-stop[data-story="${road[1].id}"]`).click();
    await expect(page.locator("#kids-toast")).toHaveText("Finish the stories before this one first.");
    await expect.poll(() => hash(page)).toBe("#/map");
    // A link straight to a shut story goes back to the map.
    await page.goto(`${KIDS}#/stop/${road[2].id}/watch`);
    await expect.poll(() => hash(page)).toBe("#/map");
    // A story still to come only says so.
    await page.locator(".map-stop.soon").first().click();
    await expect(page.locator("#kids-toast")).toContainText("is coming soon!");
    await expect.poll(() => hash(page)).toBe("#/map");

    await playStory(page, road[0], "lambs");
    await go(page, "/map");
    await expect(page.locator(`.map-stop[data-story="${road[1].id}"]`)).not.toHaveClass(/locked/);
    await expect(page.locator(".map-stop.locked")).toHaveCount(road.length - 2);
    await page.locator(`.map-stop[data-story="${road[1].id}"]`).click();
    await expect.poll(() => hash(page)).toBe(`#/stop/${road[1].id}/watch`);
});

test("Back and Forward move between screens; leaving a story goes to the map", async ({ page }) => {
    await seed(page, { children: [ANNA], current: ANNA.id });
    await go(page, "/home");
    await page.locator(".nav-map").click();
    await expect(page.locator(".screen.map")).toBeVisible();
    await page.locator(`.map-stop[data-story="${FIRST.id}"]`).click();
    await expect(page.locator(".screen.watch")).toBeVisible();
    await page.goBack();
    await expect(page.locator(".screen.map")).toBeVisible();
    await page.goForward();
    await expect(page.locator(".screen.watch")).toBeVisible();
    // The map button at the top right goes to the Journey Map ...
    await page.locator('[data-leave][aria-label="Journey Map"]').click();
    await expect.poll(() => hash(page)).toBe("#/map");
    // ... and the arrow at the top left goes home.
    await page.locator(`.map-stop[data-story="${FIRST.id}"]`).click();
    await page.locator('[data-home][aria-label="Back to Daily Grace Kids home"]').click();
    await expect.poll(() => hash(page)).toBe("#/home");
    await page.locator(".nav-map").click();
    await page.locator(".map [data-go]").click();
    await expect.poll(() => hash(page)).toBe("#/home");
});

test("Watch & Listen: arrows, swipes and the keyboard move through the pictures", async ({ page }) => {
    await seed(page, { children: [ANNA], current: ANNA.id });
    await go(page, `/stop/${FIRST.id}/watch`);
    const text = page.locator(".story-text");
    await expect(text).toHaveText(FIRST.panels[0].lions);
    await expect(page.locator("[data-prev]")).toBeDisabled();
    await page.keyboard.press("ArrowRight");
    await expect(text).toHaveText(FIRST.panels[1].lions);
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(text).toHaveText(FIRST.panels[0].lions);
    // A swipe to the left: the next picture.
    const art = page.locator(".panel-art");
    const box = await art.boundingBox();
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 5 });
    await page.mouse.up();
    await expect(text).toHaveText(FIRST.panels[1].lions);
    await expect(page.locator(".dots")).toHaveAttribute("aria-label", "Picture 2 of 6");
    // The last picture: Next becomes "Look & Find".
    for (let i = 0; i < 6; i += 1) {
        await page.keyboard.press("ArrowRight");
    }
    await expect(text).toHaveText(FIRST.panels[5].lions);
    await expect(page.locator("[data-fwd]")).toBeHidden();
    await expect(page.locator("[data-done]")).toBeVisible();
    // The youngest hear and read the simpler telling.
    await page.evaluate((id) => {
        const p = JSON.parse(localStorage.getItem("dailygrace:kids:profiles"));
        p.children[0].band = "lambs";
        localStorage.setItem("dailygrace:kids:profiles", JSON.stringify(p));
    }, ANNA.id);
    await page.reload();
    await expect(text).toHaveText(FIRST.panels[0].lambs);
});

test("Look & Find: the ring is drawn where the child tapped; from the keyboard, round the spot", async ({ page }) => {
    await seed(page, { children: [ANNA], current: ANNA.id, progress: { [ANNA.id]: { stops: { [FIRST.id]: stop(["watch"]) } } } });
    await go(page, `/stop/${FIRST.id}/find`);
    const find = page.locator("kids-look-find");
    await expect(find.locator(".scene.ready")).toBeVisible();
    const centre = (box) => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });

    // A tap off the middle of a spot (as on a thing that sits to one side of it).
    const spot = find.locator('.spot[data-i="0"]').first();
    const box = await spot.boundingBox();
    const at = { x: box.x + box.width * 0.3, y: box.y + box.height * 0.7 };
    await page.mouse.click(at.x, at.y);
    const ring = find.locator(".ring").first();
    await expect(ring).toBeVisible();
    const ringCentre = centre(await ring.boundingBox());
    expect(Math.abs(ringCentre.x - at.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(ringCentre.y - at.y)).toBeLessThanOrEqual(2);

    // From the keyboard there is no tap: the ring goes round the spot.
    const second = find.locator('.spot[data-i="1"]').first();
    await second.focus();
    await page.keyboard.press("Enter");
    const ring2 = find.locator(".ring").nth(1);
    await expect(ring2).toBeVisible();
    const spotCentre = centre(await second.boundingBox());
    const ring2Centre = centre(await ring2.boundingBox());
    expect(Math.abs(ring2Centre.x - spotCentre.x)).toBeLessThanOrEqual(2);
    expect(Math.abs(ring2Centre.y - spotCentre.y)).toBeLessThanOrEqual(2);
    await expect(find.locator(".count .n")).toHaveText("2");
});

test("quick and repeated taps in the games count once", async ({ page }) => {
    await seed(page, { children: [ANNA], current: ANNA.id, progress: { [ANNA.id]: { stops: { [FIRST.id]: stop(["watch"]) } } } });
    await go(page, `/stop/${FIRST.id}/find`);
    const find = page.locator("kids-look-find");
    await expect(find.locator(".scene.ready")).toBeVisible();
    const spot = find.locator('.spot[data-i="0"]').first();
    for (let i = 0; i < 5; i += 1) {
        await spot.dispatchEvent("click");
    }
    await expect(find.locator(".count .n")).toHaveText("1");
    // An item with several spots counts once, whichever is tapped.
    const many = FIRST.find.items.findIndex((item) => item.spots.length > 1);
    if (many >= 0) {
        for (const s of await find.locator(`.spot[data-i="${many}"]`).all()) {
            await s.dispatchEvent("click");
        }
        await expect(find.locator(".count .n")).toHaveText("2");
    }
    // A tap away from everything: a ring, nothing found.
    const scene = await find.locator(".scene").boundingBox();
    await page.mouse.click(scene.x + 3, scene.y + 3);
    await expect(find.locator(".count .n")).toHaveText(many >= 0 ? "2" : "1");

    await playFind(page, FIRST, "lions");
    const order = page.locator("kids-story-order");
    const tiles = await order.locator(".tile").evaluateAll((t) => t.map((x) => Number(x.dataset.panel)));
    const wrong = tiles.find((p) => p !== 0);
    // Two wrong tries: the right picture glows.
    await order.locator(`.tile[data-panel="${wrong}"]`).click();
    await order.locator(`.tile[data-panel="${wrong}"]`).click();
    await expect(order.locator('.tile[data-panel="0"]')).toHaveClass(/glow/);
    await order.locator('.tile[data-panel="0"]').dblclick();
    await expect(order.locator(".slot.filled")).toHaveCount(1);
    for (const p of tiles.filter((n) => n !== 0).sort((a, b) => a - b)) {
        await order.locator(`.tile[data-panel="${p}"]`).click();
    }
    await expect(page.locator(".more-games")).toBeVisible();
    expect((await readStore(page, ANNA.id)).progress.stops[FIRST.id].steps.play).toBe(true);
});

test("My Verse: a wrong word is gently refused, then the right one glows; lions build it in order", async ({ page }) => {
    await seed(page, { children: [BEN], current: BEN.id, progress: { [BEN.id]: { stops: { [FIRST.id]: stop(["watch", "find", "play"]) } } } });
    await go(page, `/stop/${FIRST.id}/verse`);
    const verse = page.locator("kids-verse-builder");
    await expect(verse.locator(".plain b")).toHaveText("In plain words (not the Bible's own words)");
    await expect(verse.locator(".ref")).toContainText("King James Bible");
    const wrong = FIRST.verse.choices.find((w) => w !== FIRST.verse.blank);
    await verse.locator(`[data-word="${wrong}"]`).click();
    await expect(verse.locator(".feedback")).toContainText("Almost!");
    await verse.locator(`[data-word="${wrong}"]`).click();
    await expect(verse.locator(`[data-word="${FIRST.verse.blank}"]`)).toHaveClass(/glow/);
    await playVerse(page, FIRST, "lambs");
    await expect(verse.locator("[data-gap]")).toHaveText(FIRST.verse.blank);
    await expect(page.locator(".fruit-note")).toBeVisible();
    // Again: no new fruit.
    await page.reload();
    await expect(page.locator(".done-row")).toBeVisible();
    await expect(page.locator(".fruit-note")).toBeHidden();
});

test("Play's other games: each can be played, and Next waits for Story in Order", async ({ page }) => {
    // Gather & Count drops one thing at a time, gently: ten take a while.
    test.setTimeout(90_000);
    const errors = watchErrors(page);
    const story = STORIES.find((s) => s.games.some((g) => g.type === "who-said") && s.games.some((g) => g.type === "gather"));
    await seed(page, { children: [ANNA], current: ANNA.id, progress: { [ANNA.id]: { stops: { [story.id]: stop(["watch", "find"]) } } } });

    // Before Story in Order, Next leads back to it.
    await go(page, `/stop/${story.id}/play/right-or-not`);
    await expect(page.locator(".next-row [data-next]")).toContainText("Story in Order");
    const ron = page.locator("kids-right-or-not");
    for (let i = 0; i < story.rightOrNot.length; i += 1) {
        await expect(ron.locator(".step")).toHaveText(`${i + 1} of ${story.rightOrNot.length}`);
        await ron.locator(`.answer[data-answer="${story.rightOrNot[i].right ? "yes" : "no"}"]`).click();
        await expect(ron.locator(".why")).toHaveText(story.rightOrNot[i].why);
        await ron.locator("[data-next]").click();
    }
    expect((await readStore(page, ANNA.id)).progress.firsts.play).toBe(true);

    await go(page, `/stop/${story.id}/play/who-said`);
    const who = page.locator("kids-who-said");
    for (let round = 0; round < story.whoSaid.length; round += 1) {
        await expect(who.locator(".step")).toHaveText(`${round + 1} of ${story.whoSaid.length}`);
        const quote = (await who.locator(".quote p").textContent()).replace(/^“|”$/g, "");
        const index = story.whoSaid.findIndex((w) => w.quote === quote);
        await who.locator(`[data-person="${story.whoSaid[index].id}"]`).click();
        await expect(who.locator(".feedback")).toContainText("said it");
    }

    await go(page, `/stop/${story.id}/play/gather`);
    const gather = page.locator("kids-gather");
    await gather.locator("[data-start]").click();
    const game = story.games.find((g) => g.type === "gather");
    // Tap each falling lamp (the older children also see other things fall).
    await expect.poll(async () => {
        const things = await gather.locator(`.thing[aria-label="${game.name}"]:not([disabled])`).all();
        for (const t of things) {
            await t.dispatchEvent("click").catch(() => {});
        }
        return gather.locator(".tally .n").textContent();
    }, { timeout: 60_000, intervals: [400] }).toBe(String(game.lions));
    await expect(gather.locator(".feedback")).toHaveText(`You caught ${game.lions}!`);

    // Story in Order opens My Verse.
    await go(page, `/stop/${story.id}/play`);
    await playOrder(page);
    await page.locator(".more-games [data-game='gather']").click();
    await expect(page.locator(".next-row [data-next]")).toContainText("My Verse");
    expectNoErrors(errors);
});

test("Colour It In fills a space with the chosen colour; Undo and Start over work", async ({ page }) => {
    const story = STORIES.find((s) => s.games.some((g) => g.type === "colour"));
    await seed(page, { children: [ANNA], current: ANNA.id, progress: { [ANNA.id]: { stops: { [story.id]: stop(["watch", "find", "play"]) } } } });
    await go(page, `/stop/${story.id}/play/colour`);
    const colour = page.locator("kids-colour");
    const canvas = colour.locator("canvas");
    await expect(canvas).toBeVisible();
    await colour.locator(".swatch").nth(5).click();
    const pixel = () => canvas.evaluate((c) => Array.from(c.getContext("2d").getImageData(Math.floor(c.width * 0.05), Math.floor(c.height * 0.05), 1, 1).data.slice(0, 3)));
    const before = await pixel();
    const box = await canvas.boundingBox();
    await page.mouse.click(box.x + box.width * 0.05, box.y + box.height * 0.05);
    await expect.poll(pixel).not.toEqual(before);
    await colour.locator("[data-undo]").click();
    await expect.poll(pixel).toEqual(before);
    await page.mouse.click(box.x + box.width * 0.05, box.y + box.height * 0.05);
    await colour.locator("[data-clear]").click();
    await expect.poll(pixel).toEqual(before);
});
