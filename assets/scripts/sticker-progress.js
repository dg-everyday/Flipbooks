/**
 * Sticker progress: running totals of what the reader has done, kept so the
 * Sticker feature (docs/stickers/distribution-plan.md) can give them credit
 * for all they have done. sticker-awards.js turns the totals into stickers.
 *
 * Usage
 *   <script type="module" src="assets/scripts/sticker-progress.js"></script>
 *
 * It listens on the document, in the capture phase so it also hears events
 * that do not bubble, for:
 *   <daily-moment>           momentcomplete  a Moment finished (today's only)
 *   <memory-verse>           memorypractice  a practice done, or a verse learned
 *   <bible-trivia>           answered        a trivia answer, right or wrong
 *   <daily-food-for-thought> read            the reader opened today's topic
 * A finished story is reported by its page with recordStory(slug), since only
 * the page knows which story is open.
 *
 * The first time it runs it fills in what the app had already saved: finished
 * Moments, faithful weeks and written answers from dailygrace:moment:*, and
 * learned verses (with their books) from dailygrace:memory:*. The books of
 * the Moments finished before then are looked up once in the month verse
 * files (dailygrace:moment:done keeps about a year of days).
 *
 * Kept in localStorage (when it is available), on this device only:
 *   dailygrace:stickers:counts
 *     started      the day recording began (YYYY-MM-DD)
 *     firsts       the day of each first: moment, practice, story, trivia,
 *                  answer, verse (null until it happens)
 *     moments      Moments finished              { count, last: day }
 *     answers      Moments finished with a written answer { count, last: day }
 *     weeks        faithful weeks, 5+ Moments in a Sunday–Saturday week
 *                  { count, sunday, days } (days: Moments in that week so far)
 *     verses       memory verses learned         { count, last: week's Sunday }
 *     triviaDays   days with a right trivia answer { count, last: day }
 *     triviaToday  right answers today, for the bookshelf's cap { day, right }
 *     foodDays     days today's Food for Thought was opened { count, last: day }
 *     stories      the stories read to the last page, by slug
 *     books        the books of the Bible met, { "Genesis": day }
 *     pastMoments  true once the books of earlier Moments have been looked up
 *
 * Exports      readProgress()     a copy of the totals
 *              recordStory(slug)  a story was read to its last page
 * Events       stickerprogress    on the document, after the totals change
 *
 * Import it with the same ?v= token everywhere, or the page loads two copies
 * and counts everything twice.
 */

import { loadVerses } from "../../apps/components/daily-verses.js?v=20261004-1";

const STORE_KEY = "dailygrace:stickers:counts";
const MOMENT_DONE_KEY = "dailygrace:moment:done";
const MOMENT_ANSWERS_KEY = "dailygrace:moment:answers";
const MEMORY_PROGRESS_KEY = "dailygrace:memory:progress";
const MEMORY_LEARNED_KEY = "dailygrace:memory:learned";

const VERSES_BASE = new URL("../verses/", import.meta.url).href;

const TIME_ZONE = "Asia/Manila";
const DAY_MS = 86_400_000;
// A week with this many Moments is a faithful one.
const FAITHFUL_DAYS = 5;
// Right trivia answers a day that count toward the bookshelf.
const TRIVIA_BOOKS_PER_DAY = 3;

/* ---------- Days ---------- */

function manilaToday() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

/** The Sunday starting the week of `iso` (both YYYY-MM-DD). */
function sundayOf(iso) {
    const date = new Date(`${iso}T00:00:00Z`);
    return new Date(date.getTime() - date.getUTCDay() * DAY_MS)
        .toISOString()
        .slice(0, 10);
}

/** The book of a reference: "Psalm 23:1" → "Psalms", "1 John 4:8" → "1 John". */
function bookOf(reference) {
    const book = String(reference ?? "")
        .trim()
        .replace(/\s+\d+(:.*)?$/, "");
    if (book === "Psalm") {
        return "Psalms";
    }
    return book || null;
}

/* ---------- Storage, on this device only ---------- */

function readStore(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value ?? fallback;
    } catch {
        return fallback;
    }
}

function writeStore(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Private mode or a full store: nothing is recorded, nothing breaks.
    }
}

function emptyProgress(today) {
    return {
        started: today,
        firsts: {
            moment: null,
            practice: null,
            story: null,
            trivia: null,
            answer: null,
            verse: null,
        },
        moments: { count: 0, last: null },
        answers: { count: 0, last: null },
        weeks: { count: 0, sunday: null, days: 0 },
        verses: { count: 0, last: null },
        triviaDays: { count: 0, last: null },
        triviaToday: { day: null, right: 0 },
        foodDays: { count: 0, last: null },
        stories: [],
        books: {},
    };
}

/** The totals, started from what the app had already saved the first time. */
function load() {
    const stored = readStore(STORE_KEY, null);
    if (stored) {
        return stored;
    }
    const progress = seed(emptyProgress(manilaToday()));
    writeStore(STORE_KEY, progress);
    return progress;
}

function update(change) {
    const progress = load();
    change(progress);
    writeStore(STORE_KEY, progress);
    document.dispatchEvent(new CustomEvent("stickerprogress"));
}

/* ---------- Credit for what was saved before recording began ---------- */

function seed(progress) {
    const done = [...new Set(readStore(MOMENT_DONE_KEY, []))].sort();
    if (done.length) {
        progress.firsts.moment = done[0];
        progress.moments = { count: done.length, last: done.at(-1) };

        const byWeek = new Map();
        for (const day of done) {
            const sunday = sundayOf(day);
            byWeek.set(sunday, (byWeek.get(sunday) ?? 0) + 1);
        }
        const latest = [...byWeek.keys()].sort().at(-1);
        progress.weeks = {
            count: [...byWeek.values()].filter((n) => n >= FAITHFUL_DAYS).length,
            sunday: latest,
            days: byWeek.get(latest),
        };

        const answers = readStore(MOMENT_ANSWERS_KEY, {});
        const answered = done.filter((day) => String(answers[day] ?? "").trim());
        if (answered.length) {
            progress.firsts.answer = answered[0];
            progress.answers = { count: answered.length, last: answered.at(-1) };
        }
    }

    const practised = Object.values(readStore(MEMORY_PROGRESS_KEY, {}))
        .flat()
        .sort();
    if (practised.length) {
        progress.firsts.practice = practised[0];
    }

    const learned = [...readStore(MEMORY_LEARNED_KEY, [])].sort((a, b) =>
        String(a.week).localeCompare(String(b.week)),
    );
    if (learned.length) {
        // The week's Sunday stands in for the day: the exact day was not kept.
        progress.firsts.verse = learned[0].week;
        progress.verses = { count: learned.length, last: learned.at(-1).week };
        for (const item of learned) {
            addBook(progress, item.verse, item.week);
        }
    }
    return progress;
}

/** The books of the Moments finished before recording began, looked up once. */
async function creditPastMoments() {
    if (load().pastMoments) {
        return;
    }
    const days = readStore(MOMENT_DONE_KEY, []);
    const names = new Map(days.map((day) => [dayName(day), day]));
    let entries = new Map();
    if (names.size) {
        try {
            entries = await loadVerses(VERSES_BASE, [...names.keys()]);
        } catch {
            return; // offline: try again next time
        }
    }
    update((progress) => {
        for (const [name, day] of [...names].sort((a, b) => a[1].localeCompare(b[1]))) {
            addBook(progress, entries.get(name)?.verse, day);
        }
        progress.pastMoments = true;
    });
}

/** "2026-10-01" → "October 1, 2026", the verse files' day names. */
function dayName(iso) {
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
        timeZone: "UTC",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

/* ---------- Recording ---------- */

function markFirst(progress, name, day) {
    if (!progress.firsts[name]) {
        progress.firsts[name] = day;
    }
}

function addBook(progress, reference, day) {
    const book = bookOf(reference);
    if (book && !progress.books[book]) {
        progress.books[book] = day;
    }
}

function recordMoment({ date, verse }) {
    const today = manilaToday();
    // Only today's Moment counts, not a pinned or past day.
    if (date !== today) {
        return;
    }
    update((progress) => {
        if (progress.moments.last === today) {
            return; // opened again after Amen
        }
        markFirst(progress, "moment", today);
        progress.moments = { count: progress.moments.count + 1, last: today };
        addBook(progress, verse, today);

        const sunday = sundayOf(today);
        const weeks = progress.weeks;
        const days = weeks.sunday === sunday ? weeks.days + 1 : 1;
        progress.weeks = {
            count: days === FAITHFUL_DAYS ? weeks.count + 1 : weeks.count,
            sunday,
            days,
        };

        const answer = readStore(MOMENT_ANSWERS_KEY, {})[today];
        if (String(answer ?? "").trim()) {
            markFirst(progress, "answer", today);
            progress.answers = { count: progress.answers.count + 1, last: today };
        }
    });
}

function recordPractice({ week, learned }) {
    const today = manilaToday();
    update((progress) => {
        markFirst(progress, "practice", today);
        if (!learned || progress.verses.last === week) {
            return;
        }
        markFirst(progress, "verse", today);
        progress.verses = { count: progress.verses.count + 1, last: week };
        const item = readStore(MEMORY_LEARNED_KEY, []).find(
            (entry) => entry.week === week,
        );
        addBook(progress, item?.verse, today);
    });
}

function recordTrivia({ book, correct }) {
    if (!correct) {
        return;
    }
    const today = manilaToday();
    update((progress) => {
        markFirst(progress, "trivia", today);
        if (progress.triviaDays.last !== today) {
            progress.triviaDays = {
                count: progress.triviaDays.count + 1,
                last: today,
            };
        }
        const right =
            progress.triviaToday.day === today ? progress.triviaToday.right : 0;
        if (right < TRIVIA_BOOKS_PER_DAY) {
            progress.triviaToday = { day: today, right: right + 1 };
            addBook(progress, book, today);
        }
    });
}

function recordFood({ date }) {
    const today = manilaToday();
    if (date !== today) {
        return;
    }
    update((progress) => {
        if (progress.foodDays.last !== today) {
            progress.foodDays = { count: progress.foodDays.count + 1, last: today };
        }
    });
}

/** A story was read to its last page. */
export function recordStory(slug) {
    if (!slug) {
        return;
    }
    const today = manilaToday();
    update((progress) => {
        markFirst(progress, "story", today);
        if (!progress.stories.includes(slug)) {
            progress.stories.push(slug);
        }
    });
}

/** A copy of the totals. */
export function readProgress() {
    return structuredClone(load());
}

/* ---------- Listening ---------- */

const HANDLERS = {
    momentcomplete: ["daily-moment", recordMoment],
    memorypractice: ["memory-verse", recordPractice],
    answered: ["bible-trivia", recordTrivia],
    read: ["daily-food-for-thought", recordFood],
};

for (const [type, [tag, record]] of Object.entries(HANDLERS)) {
    document.addEventListener(
        type,
        (event) => {
            if (event.target.localName === tag) {
                record(event.detail ?? {});
            }
        },
        true,
    );
}

// Start recording (and take credit for what is already saved) on the first
// visit, not only on the first event.
load();
creditPastMoments();
