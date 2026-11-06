/**
 * My Faith Journal, phase 0 (docs/faith-journal/plan.md): the journal kept in
 * IndexedDB (assets/scripts/journal/store.js), the Moment's answers written
 * into it (moment-answers.js), and password-locked backups (backup.js). The
 * modules are loaded into a plain page, the not-found page, so nothing else
 * runs. WebKit is covered by the iPhone and iPad projects.
 */
import { test, expect } from "@playwright/test";

const STORE = "/assets/scripts/journal/store.js?v=20261106-1";
const MOMENTS = "/assets/scripts/journal/moment-answers.js?v=20261106-1";
const BACKUP = "/assets/scripts/journal/backup.js?v=20261106-1";

test.beforeEach(async ({ page }) => {
    await page.goto("/404.html");
});

test.describe("the journal store", () => {
    test("keeps entries by year, keeps old versions, and cleans what is written", async ({ page }) => {
        const result = await page.evaluate(async (url) => {
            const store = await import(url);
            const first = await store.addEntry({
                day: "2026-11-06",
                kind: "diary",
                title: "  Tonight  ",
                body: '<p onclick="x()">Thank <b>you</b><script>alert(1)</script><img src=x onerror=alert(1)></p>',
            });
            await store.addEntry({ day: "2027-01-02", body: "<p>New year</p>" });
            let edited = first;
            for (let i = 1; i <= 7; i += 1) {
                edited = await store.updateEntry(first.id, { body: `<p>Draft ${i}</p>` });
            }
            const years = (await store.volumes()).map((v) => v.year);
            const in2026 = await store.entriesForYear(2026);
            await store.deleteEntry(first.id);
            return {
                firstBody: first.body,
                firstTitle: first.title,
                year: first.year,
                kind: first.kind,
                versions: edited.versions.map((v) => v.body),
                original: edited.original.body,
                edited: edited.edited,
                body: edited.body,
                years,
                count2026: in2026.length,
                afterDelete: await store.getEntry(first.id),
                plain: store.bodyText("<p>One<br>two</p><ul><li>three</li></ul>"),
                fromText: store.textToBody("Line one\nline two\n\nNext <para>"),
            };
        }, STORE);

        expect(result.firstBody).toBe("<p>Thank <strong>you</strong></p>");
        expect(result.firstTitle).toBe("Tonight");
        expect(result.year).toBe(2026);
        expect(result.kind).toBe("diary");
        expect(result.body).toBe("<p>Draft 7</p>");
        expect(result.versions).toEqual(["<p>Draft 2</p>", "<p>Draft 3</p>", "<p>Draft 4</p>", "<p>Draft 5</p>", "<p>Draft 6</p>"]);
        expect(result.original).toBe("<p>Thank <strong>you</strong></p>");
        expect(result.edited).toBe(true);
        expect(result.years).toEqual([2026, 2027]);
        expect(result.count2026).toBe(1);
        expect(result.afterDelete).toBeNull();
        expect(result.plain).toBe("One\ntwo\nthree");
        expect(result.fromText).toBe("<p>Line one<br>line two</p><p>Next &lt;para&gt;</p>");
    });
});

test.describe("the Moment's answers in the journal", () => {
    test("are written in, follow the Moment until edited, and stay out once taken out", async ({ page }) => {
        const result = await page.evaluate(
            async ([storeUrl, momentsUrl]) => {
                const store = await import(storeUrl);
                const moments = await import(momentsUrl);
                // Answers kept before the journal existed.
                localStorage.setItem(
                    "dailygrace:moment:answers",
                    JSON.stringify({ "2026-09-12": "Trusting Him.", "2026-10-04": "Peace.", bad: "x" }),
                );
                const imported = await moments.importMomentAnswers();
                const again = await moments.importMomentAnswers();

                // Today's answer, then a changed answer.
                await moments.captureMomentAnswer("2026-11-06", "First thought", { verse: "Mark 4:39", question: "What storm?" });
                const followed = await moments.captureMomentAnswer("2026-11-06", "Second thought", { verse: "Mark 4:39", question: "What storm?" });

                // The reader edits it in the journal: the Moment no longer changes it.
                await store.updateEntry(followed.id, { body: "<p>My own words</p>" });
                const kept = await moments.captureMomentAnswer("2026-11-06", "Third thought");

                // Taken out of the journal: not written again, by either way in.
                const october = await store.entryBySource("moment:2026-10-04");
                await store.deleteEntry(october.id);
                await moments.captureMomentAnswer("2026-10-04", "Peace again.");
                await moments.importMomentAnswers();

                // An emptied answer takes out an entry the reader never changed.
                await moments.captureMomentAnswer("2026-11-05", "Short-lived");
                await moments.captureMomentAnswer("2026-11-05", "   ");

                return {
                    imported,
                    again,
                    followedBody: followed.body,
                    followedVerse: followed.verse,
                    followedPrompt: followed.prompt,
                    followedVersions: followed.versions.length,
                    keptBody: kept.body,
                    october: await store.entryBySource("moment:2026-10-04"),
                    emptied: await store.entryBySource("moment:2026-11-05"),
                    september: (await store.entryBySource("moment:2026-09-12"))?.body,
                };
            },
            [STORE, MOMENTS],
        );

        expect(result.imported).toBe(2);
        expect(result.again).toBe(0);
        expect(result.followedBody).toBe("<p>Second thought</p>");
        expect(result.followedVerse).toBe("Mark 4:39");
        expect(result.followedPrompt).toBe("What storm?");
        expect(result.followedVersions).toBe(0);
        expect(result.keptBody).toBe("<p>My own words</p>");
        expect(result.october).toBeNull();
        expect(result.emptied).toBeNull();
        expect(result.september).toBe("<p>Trusting Him.</p>");
    });
});

test.describe("the Moment's answers, typed", () => {
    test("every keystroke saving: the journal ends with the last answer, and a cleared one can come back", async ({ page }) => {
        const result = await page.evaluate(
            async ([storeUrl, momentsUrl]) => {
                const store = await import(storeUrl);
                const moments = await import(momentsUrl);
                // A quick typist: one save per keystroke, none waited on.
                const word = "Peace, be still";
                const saves = [];
                for (let i = 1; i <= word.length; i += 1) {
                    saves.push(moments.captureMomentAnswer("2026-11-06", word.slice(0, i)));
                }
                await Promise.all(saves);
                const typed = (await store.entryBySource("moment:2026-11-06"))?.body;

                // Cleared, then written again.
                await moments.captureMomentAnswer("2026-11-06", "");
                const cleared = await store.entryBySource("moment:2026-11-06");
                await moments.captureMomentAnswer("2026-11-06", "Again");
                const back = (await store.entryBySource("moment:2026-11-06"))?.body;
                return { typed, cleared, back, count: (await store.entriesForDay("2026-11-06")).length };
            },
            [STORE, MOMENTS],
        );
        expect(result.typed).toBe("<p>Peace, be still</p>");
        expect(result.cleared).toBeNull();
        expect(result.back).toBe("<p>Again</p>");
        expect(result.count).toBe(1);
    });

    test("an answer written in today's Moment reaches the journal", async ({ page, isMobile }) => {
        test.skip(isMobile, "one screen is enough for the flow");
        await page.addInitScript(() => {
            // An avatar, so no picker; today's trivia already played, so no quiz.
            localStorage.setItem("dailygrace:avatar", "AV-01");
            const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
            localStorage.setItem("dailygrace.trivia", JSON.stringify({ day, count: 99, last: Date.now() }));
        });
        await page.goto("/");
        const moment = page.locator("#daily-moment");
        await expect(moment).toBeVisible({ timeout: 15_000 });
        await page.evaluate(() => document.getElementById("daily-moment").open());
        const answer = moment.locator("textarea");
        const next = moment.locator(".next");
        for (let i = 0; i < 20 && !(await answer.isVisible()); i += 1) {
            await next.click();
        }
        await answer.pressSequentially("Kept in my journal");

        await expect
            .poll(
                () =>
                    page.evaluate(async (storeUrl) => {
                        const store = await import(storeUrl);
                        const entry = await store.entryBySource(`moment:${store.todayIso()}`);
                        return entry ? { body: entry.body, kind: entry.kind, verse: Boolean(entry.verse), prompt: Boolean(entry.prompt) } : null;
                    }, STORE),
                { timeout: 10_000 },
            )
            .toEqual({ body: "<p>Kept in my journal</p>", kind: "log", verse: true, prompt: true });
    });
});

test.describe("backups", () => {
    test("lock with a password, restore everything, and never take away bookmarks or notes", async ({ page }) => {
        const result = await page.evaluate(
            async ([storeUrl, backupUrl]) => {
                const store = await import(storeUrl);
                const backup = await import(backupUrl);

                localStorage.setItem("dailygrace:bookmarks", JSON.stringify([101, 102]));
                localStorage.setItem(
                    "dailygrace:bookmarks:notes",
                    JSON.stringify({ "dailygrace:bookmarks": { 101: { text: "Old note", updated: "2026-10-01T00:00:00.000Z" } } }),
                );
                localStorage.setItem("dailygrace:avatar", "AV-07");
                localStorage.setItem("dailygrace:stickers", JSON.stringify({ earned: { "HB-01": {}, "HB-02": {} } }));
                localStorage.setItem("someone-else", "not ours");
                await store.addEntry({ day: "2026-11-06", body: "<p>Kept safe</p>" });

                let short = null;
                try {
                    await backup.makeBackup("12345");
                } catch (error) {
                    short = error.code;
                }
                const made = await backup.makeBackup("grace be with you");
                const fileText = await made.blob.text();

                // The device after the backup: a new bookmark and a newer note, a new avatar.
                localStorage.setItem("dailygrace:bookmarks", JSON.stringify([103]));
                localStorage.setItem(
                    "dailygrace:bookmarks:notes",
                    JSON.stringify({ "dailygrace:bookmarks": { 103: { text: "New note", updated: "2026-11-06T00:00:00.000Z" } } }),
                );
                localStorage.setItem("dailygrace:avatar", "AV-02");
                await store.addEntry({ day: "2026-11-07", body: "<p>Written after</p>" });

                let wrong = null;
                try {
                    await backup.openBackup(fileText, "wrong password");
                } catch (error) {
                    wrong = error.code;
                }
                let notOne = null;
                try {
                    await backup.openBackup('{"hello":1}', "grace be with you");
                } catch (error) {
                    notOne = error.code;
                }

                const opened = await backup.openBackup(new Blob([fileText]), "grace be with you");
                await backup.restoreBackup(opened, { mode: "replace" });

                const entries = await store.entriesForYear(2026);
                return {
                    short,
                    wrong,
                    notOne,
                    fileName: made.fileName,
                    readable: fileText.includes("Kept safe"),
                    summary: opened.summary,
                    bookmarks: JSON.parse(localStorage.getItem("dailygrace:bookmarks")),
                    notes: JSON.parse(localStorage.getItem("dailygrace:bookmarks:notes")),
                    avatar: localStorage.getItem("dailygrace:avatar"),
                    other: localStorage.getItem("someone-else"),
                    bodies: entries.map((e) => e.body),
                };
            },
            [STORE, BACKUP],
        );

        expect(result.short).toBe("short-password");
        expect(result.wrong).toBe("wrong-password");
        expect(result.notOne).toBe("not-a-backup");
        expect(result.fileName).toMatch(/^My Faith Journal backup \d{4}-\d{2}-\d{2}\.dgjournal$/);
        expect(result.readable).toBe(false);
        expect(result.summary).toMatchObject({ entries: 1, years: [2026], bookmarks: 2, stickers: 2 });
        // Replace mode: the journal and the avatar are the backup's ...
        expect(result.bodies).toEqual(["<p>Kept safe</p>"]);
        expect(result.avatar).toBe("AV-07");
        // ... but bookmarks and notes are joined, never taken away.
        expect(result.bookmarks).toEqual([103, 101, 102]);
        expect(Object.keys(result.notes["dailygrace:bookmarks"]).sort()).toEqual(["101", "103"]);
        // Only Daily Grace's own keys are touched.
        expect(result.other).toBe("not ours");
    });
});
