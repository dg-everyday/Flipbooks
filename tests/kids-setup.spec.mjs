/**
 * Daily Grace Kids, first steps: the welcome, the grown-up gate (hold, then
 * type the number in words), adding, editing and removing children, the
 * four-child limit, and names that try to be HTML. On the upright iPad, the
 * device Daily Grace Kids is made for.
 */
import { test, expect } from "@playwright/test";
import {
    ANNA, BEN, KIDS, child, expectNoErrors, go, hash, holdGate, passGate, readStore, seed, stubMedia, typeGate, watchErrors,
} from "./kids-helpers.mjs";

test.beforeEach(async ({ page }) => {
    test.skip(test.info().project.name !== "ipad", "the flows run on the tablet; layout runs everywhere (kids-device)");
    await stubMedia(page);
});

test("first visit: Nari's welcome, the gate, then the first explorer and home", async ({ page }) => {
    const errors = watchErrors(page);
    await seed(page, {});
    await go(page, "/");
    await expect(page.locator(".screen.welcome h1")).toHaveText("Hello! I'm Nari.");
    // Children can't get to home or the map before a grown-up sets one up.
    await page.goto(`${KIDS}#/map`);
    await expect.poll(() => hash(page)).toBe("#/");
    await page.locator("[data-start]").click();
    await expect(page.locator("dialog.gate h2")).toHaveText("Set up an explorer");
    await passGate(page);
    await expect.poll(() => hash(page)).toBe("#/corner/add");
    await expect(page.locator("#child-name")).toBeFocused();

    // An empty name is refused, with the reason.
    await page.locator("#child-name").fill("    ");
    await page.locator("form button[type=submit]").click();
    await expect(page.locator("#name-error")).toHaveText("Please type the child's first name.");

    await page.locator("#child-name").fill("  Anna   Maria ");
    await page.locator('input[name="band"][value="lions"]').check();
    await page.locator(".avatar-choice input").nth(4).check();
    await page.locator("form button[type=submit]").click();
    await expect.poll(() => hash(page)).toBe("#/home");
    await expect(page.locator(".home h1")).toHaveText("Hi, Anna Maria!");
    await expect(page.locator(".keep-going")).toContainText("Your first story");

    const saved = await readStore(page);
    expect(saved.profiles.children).toHaveLength(1);
    expect(saved.profiles.children[0]).toMatchObject({ name: "Anna Maria", band: "lions" });
    expect(saved.profiles.current).toBe(saved.profiles.children[0].id);
    expectNoErrors(errors);
});

test("the gate: closing, Escape, a short hold and a wrong number all keep children out", async ({ page }) => {
    await seed(page, { children: [ANNA], current: ANNA.id });
    await go(page, "/home");
    const corner = page.locator("[data-corner]");

    await corner.click();
    await page.locator("dialog.gate [data-close]").click();
    await expect(page.locator("dialog.gate")).toHaveCount(0);
    await expect.poll(() => hash(page)).toBe("#/home");

    await corner.click();
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog.gate")).toHaveCount(0);

    // Letting go too soon starts the hold again.
    await corner.click();
    await page.locator("dialog.gate .hold").hover();
    await page.mouse.down();
    await page.waitForTimeout(1500);
    await page.mouse.up();
    await page.waitForTimeout(2000);
    await expect(page.locator("dialog.gate .gate-type-step")).toBeHidden();

    // A wrong number: told, cleared, and still closed.
    const digits = await holdGate(page);
    const wrong = digits === "99" ? "98" : "99";
    await typeGate(page, wrong);
    await expect(page.locator("dialog.gate .gate-message")).toContainText("not quite it");
    await expect(page.locator("dialog.gate .gate-entry span").first()).toHaveText("");
    // Delete and Clear work, and then the right number opens it.
    await typeGate(page, digits[0]);
    await page.locator('dialog.gate .key[data-key="back"]').click();
    await typeGate(page, "1");
    await page.locator('dialog.gate .key[data-key="clear"]').click();
    await typeGate(page, digits);
    await expect.poll(() => hash(page)).toBe("#/corner");
    await expect(page.locator(".corner h1")).toHaveText("Grown-ups' Corner");
});

test("the gate works from the keyboard: hold Space, then type", async ({ page }) => {
    await seed(page, { children: [ANNA], current: ANNA.id });
    await go(page, "/");
    await page.locator("[data-corner]").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("dialog.gate .hold")).toBeFocused();
    await passGate(page, { key: " " });
    await expect.poll(() => hash(page)).toBe("#/corner");
});

test("once passed, the gate stays open for ten minutes, then asks again", async ({ page }) => {
    await page.clock.install();
    await seed(page, { children: [ANNA], current: ANNA.id });
    await go(page, "/corner");
    await passGate(page, { clock: true });
    await expect(page.locator(".corner h1")).toBeVisible();
    await page.locator(".corner [data-go]").first().click();
    await expect.poll(() => hash(page)).toBe("#/home");
    await page.clock.fastForward("05:00");
    await page.locator("[data-corner]").click();
    await expect(page.locator(".corner h1")).toBeVisible();
    await expect(page.locator("dialog.gate")).toHaveCount(0);
    await page.locator(".corner [data-go]").first().click();
    await page.clock.fastForward("06:00");
    await page.locator("[data-corner]").click();
    await expect(page.locator("dialog.gate")).toBeVisible();
});

test("a direct link to the Corner asks for the gate; closing it goes home", async ({ page }) => {
    await seed(page, { children: [ANNA], current: ANNA.id });
    await page.goto(`${KIDS}#/corner/child/${ANNA.id}`);
    await expect(page.locator("dialog.gate")).toBeVisible();
    await page.locator("dialog.gate [data-close]").click();
    await expect.poll(() => hash(page)).toBe("#/home");
});

test("names that look like HTML, or are long or unusual, show as typed and never run", async ({ page }) => {
    const errors = watchErrors(page);
    const evil = `<img src=x onerror="window.__pwned=1">`;
    await seed(page, {
        children: [
            child("c0000x1", evil, "lambs"),
            child("c0000x2", "Zoë 李 👧🏽 Ñ", "lions"),
            child("c0000x3", `"'><svg onload=window.__pwned=2>`, "lambs"),
        ],
        current: "c0000x1",
    });
    await go(page, "/");
    // Cleaned to twenty characters, then shown as text.
    await expect(page.locator(".child-name").first()).toHaveText(evil.slice(0, 20));
    await expect(page.locator(".child-name").nth(1)).toHaveText("Zoë 李 👧🏽 Ñ");
    await go(page, "/home");
    await expect(page.locator(".home h1")).toHaveText(`Hi, ${evil.slice(0, 20)}!`);
    await page.locator("[data-corner]").click();
    await passGate(page);
    await expect(page.locator(".corner-child h3").first()).toHaveText(evil.slice(0, 20));
    await page.locator(`[data-edit="c0000x3"]`).click();
    await expect(page.locator(".form-screen h1")).toContainText(`"'><svg`);
    await expect(page.locator("#child-name")).toHaveValue(`"'><svg onload=windo`);
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
    expect(await page.locator("#kids-app img[src='x']").count()).toBe(0);
    expectNoErrors(errors);
});

test("up to four children: the fourth fills the device, and adding is no longer offered", async ({ page }) => {
    await seed(page, { children: [ANNA, BEN, child("c0003cc", "Cy")], current: ANNA.id });
    await go(page, "/");
    await expect(page.locator(".child-card[data-child]")).toHaveCount(3);
    await page.locator("[data-add]").click();
    await passGate(page);
    await page.locator("#child-name").fill("Dee");
    await page.locator("form button[type=submit]").click();
    await expect.poll(() => hash(page)).toBe("#/home");
    await expect(page.locator(".home h1")).toHaveText("Hi, Dee!");
    await go(page, "/");
    await expect(page.locator(".child-card[data-child]")).toHaveCount(4);
    await expect(page.locator("[data-add]")).toHaveCount(0);
    // The gate is still open; the Corner says why there is no "Add".
    await go(page, "/corner");
    await expect(page.locator(".corner")).toContainText("Up to 4 children can be added on one device.");
    // A direct link to the form goes back to the Corner.
    await page.goto(`${KIDS}#/corner/add`);
    await expect.poll(() => hash(page)).toBe("#/corner");
});

test("editing a child changes their name, age and picture; Cancel changes nothing", async ({ page }) => {
    await seed(page, { children: [ANNA, BEN], current: BEN.id });
    await go(page, "/corner");
    await passGate(page);
    await page.locator(`[data-edit="${BEN.id}"]`).click();
    await page.locator("#child-name").fill("Benjamin");
    await page.locator(".form-screen [data-cancel]").first().click();
    await expect.poll(() => hash(page)).toBe("#/corner");
    expect((await readStore(page)).profiles.children[1].name).toBe("Ben");

    await page.locator(`[data-edit="${BEN.id}"]`).click();
    await page.locator("#child-name").fill("Benjamin");
    await page.locator('input[name="band"][value="lions"]').check();
    await page.locator(".avatar-choice input").nth(7).check();
    await page.locator("form button[type=submit]").click();
    await expect.poll(() => hash(page)).toBe("#/corner");
    const saved = (await readStore(page)).profiles.children[1];
    expect(saved).toMatchObject({ id: BEN.id, name: "Benjamin", band: "lions" });
    expect(saved.avatar).not.toBe(BEN.avatar);
    // The explorer's link to a child who isn't there goes back to the Corner.
    await page.goto(`${KIDS}#/corner/child/cnobody`);
    await expect.poll(() => hash(page)).toBe("#/corner");
});

test("removing a child asks first, then deletes everything kept for them", async ({ page }) => {
    await seed(page, {
        children: [ANNA, BEN],
        current: ANNA.id,
        progress: { [ANNA.id]: { stops: { "where-art-thou": { steps: { watch: true } } } } },
        stickers: { [ANNA.id]: { earned: { "AG-01": { path: "firsts" } } } },
    });
    await go(page, "/corner");
    await passGate(page);
    await page.locator(`[data-edit="${ANNA.id}"]`).click();
    await page.locator("[data-remove]").click();
    await expect(page.locator("dialog.ask")).toContainText("Remove Anna?");
    await page.locator("dialog.ask [data-no]").click();
    expect((await readStore(page)).profiles.children).toHaveLength(2);

    await page.locator("[data-remove]").click();
    await page.locator("dialog.ask [data-yes]").click();
    await expect.poll(() => hash(page)).toBe("#/corner");
    const left = await page.evaluate((id) => Object.keys(localStorage).filter((k) => k.includes(id)), ANNA.id);
    expect(left).toEqual([]);
    const saved = await readStore(page);
    expect(saved.profiles.children.map((c) => c.name)).toEqual(["Ben"]);
    expect(saved.profiles.current).toBeNull();
    // Anna was the explorer: home now asks who is exploring.
    await page.goto(`${KIDS}#/home`);
    await expect.poll(() => hash(page)).toBe("#/");
    await expect(page.locator(".child-card[data-child]")).toHaveCount(1);
});

test("the way back to Daily Grace: the logo and the home button at the top, and a button in the Corner", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("dailygrace:avatar", "AV-01"));
    const logo = page.locator("a.kids-logo");
    const home = page.locator('a.home-btn[aria-label="Back to Daily Grace"]');
    // On the welcome, before any child is set up.
    await seed(page, {});
    await go(page, "/");
    await expect(page.locator(".screen.welcome")).toBeVisible();
    await expect(logo).toHaveAttribute("href", "http://localhost:4173/");
    await expect(home).toHaveAttribute("href", "http://localhost:4173/");
    await expect(logo.locator("img")).toHaveJSProperty("complete", true);
    expect(await logo.locator("img").evaluate((i) => i.naturalWidth)).toBe(720);
    // On Who's exploring?, both big enough to tap.
    await page.evaluate((c) => localStorage.setItem("dailygrace:kids:profiles", JSON.stringify({ children: [c], current: c.id })), ANNA);
    await page.reload();
    await expect(page.locator(".screen.who")).toBeVisible();
    for (const link of [logo, home]) {
        const box = await link.boundingBox();
        expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
    }
    // In the Grown-ups' Corner.
    await go(page, "/corner");
    await passGate(page);
    await expect(page.locator(".back-to-dg")).toHaveAttribute("href", "http://localhost:4173/");
    // Each lands on the Daily Grace home page.
    for (const link of [home, logo]) {
        await go(page, "/");
        await link.click();
        await expect(page).toHaveURL("http://localhost:4173/");
        await expect(page.locator("#daily-devotional")).toBeVisible();
    }
});

test("Who's exploring? switches between children, each with their own tree", async ({ page }) => {
    await seed(page, {
        children: [ANNA, BEN],
        current: ANNA.id,
        progress: { [BEN.id]: { stops: { "where-art-thou": { steps: { watch: true, find: true, play: true, verse: true, talk: true }, finishedOn: "2026-10-20", times: 1 } } } },
    });
    await go(page, "/");
    await expect(page.locator(`[data-child="${BEN.id}"] .leaves`)).toContainText("1 leaf");
    await expect(page.locator(`[data-child="${ANNA.id}"] .leaves`)).toContainText("0 leaves");
    await page.locator(`[data-child="${BEN.id}"]`).click();
    await expect(page.locator(".home h1")).toHaveText("Hi, Ben!");
    await expect(page.locator(".tally .c-leaf")).toHaveText("1");
    // The back arrow at the top left leads back to Who's exploring?
    await page.locator('.home [aria-label="Back to Who\'s exploring?"]').click();
    await expect(page.locator(".screen.who")).toBeVisible();
    await page.locator(`[data-child="${ANNA.id}"]`).click();
    await expect(page.locator(".home h1")).toHaveText("Hi, Anna!");
    await expect(page.locator(".tally .c-leaf")).toHaveText("0");
    // So does the explorer's picture.
    await page.locator(".home .avatar-btn").click();
    await expect(page.locator(".screen.who")).toBeVisible();
});
