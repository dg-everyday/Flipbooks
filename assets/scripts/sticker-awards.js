/**
 * Sticker awards: which stickers the reader has earned, worked out from the
 * running totals in sticker-progress.js by the rules in
 * docs/stickers/distribution-plan.md. Each series rewards one thing:
 *   AG  The Whole Armour of God  the six "firsts", one piece each, in AG order
 *   BS  Bible Sayings            each memory verse learned
 *   HB  Heroes of the Bible      the first Daily Moment, then every 10th
 *   FS  Fruit of the Spirit      every 4th faithful week (5+ Moments in a week)
 *   DK  Did You Know?            the first day with a right trivia answer,
 *                                then every 10th such day
 *   FT  Food for Thought         the first day it was opened, then every 10th
 *   BK  Books of the Bible       the first time the reader meets each book
 * Within a series stickers come in ID order. On reaching 10, 25, 50 and 100
 * stickers, and on completing a series, the reader also gets a surprise: a
 * random sticker they don't have yet from BS, HB, FS, DK or FT. A path whose
 * series has run out gives nothing more.
 *
 * The stickers are assets/stickers.json; their pictures are on the media host
 * at the entry's filename, .webp (600 × 600) for the app and .png (full size)
 * to save.
 *
 * Kept in localStorage (when it is available), on this device only:
 *   dailygrace:stickers
 *     started    the day the collection began
 *     welcomed   true once the first gift has been shown
 *     earned     { "HB-01": { day, path, n, first, book, reason, seen } }
 *                path: firsts, verses, moments, weeks, trivia, food, books
 *                or surprise; n: the path's nth sticker; seen: false until
 *                the reader has been shown it
 *     surprises  the surprises already given: "album-10", "series-FS", …
 *
 * Exports      SERIES, FIRSTS        the series (with `how`, a line, and `guide`,
 *                                    the full rule) and the six firsts, in order
 *              ALBUM_MILESTONES      the album sizes that bring a surprise
 *              loadStickers()        the stickers, from stickers.json
 *              checkAwards()         award what is due; resolves to the new IDs
 *              award(…)              the rules alone, for testing
 *              readCollection()      what has been earned
 *              pendingGifts()        the IDs earned but not yet shown
 *              markSeen(ids), markWelcomed()
 *              goals(progress, collection, stickers)  the next gift on each path
 *              earnedFor(entry, sticker)  "For finishing 10 Daily Moments"
 *              stickerImage(sticker, { full })  its picture's URL
 *              formatDay(iso)        "October 18, 2026"
 */

import { readProgress } from "./sticker-progress.js?v=20261018-1";
import { MEDIA_BASE_URL } from "../../apps/settings/settings.js?v=20261009-1";

const STORE_KEY = "dailygrace:stickers";
const STICKERS_URL = new URL("../stickers.json", import.meta.url).href;
const TIME_ZONE = "Asia/Manila";

// The first sticker on these paths comes at once, then one every EVERY.
const EVERY = 10;
// Faithful weeks for each Fruit of the Spirit.
const WEEKS_EACH = 4;
// Moments in a week that make it faithful (as in sticker-progress.js).
const FAITHFUL_DAYS = 5;
export const ALBUM_MILESTONES = [10, 25, 50, 100];
const SURPRISE_GROUPS = ["BS", "HB", "FS", "DK", "FT"];

/** The series, in album order. */
export const SERIES = [
    {
        group: "AG",
        name: "The Whole Armour of God",
        one: "piece of the Armour of God",
        how: "One piece for each thing you try for the first time.",
        guide: "Each time you try a part of Daily Grace for the first time, the lion cub puts on another piece of armour. There are six firsts: finish a Daily Moment, practise this week's memory verse, read a Bible story to the last page (from the Stories row on the home page, or Kids Stories for Rascals on the Daily Grace Kids page), get a Bible Trivia question right, write an answer in a Daily Moment, and learn a memory verse.",
    },
    {
        group: "BS",
        name: "Bible Sayings",
        one: "Bible Saying",
        how: "One for each memory verse you learn.",
        guide: "Practise the week's memory verse a minute a day, from the card below today's Moment. On the last practice, say it from memory and tap “I had it”: each verse you learn earns a Bible Saying.",
    },
    {
        group: "HB",
        name: "Heroes of the Bible",
        one: "Hero of the Bible",
        how: "One for your first Daily Moment, then one every 10 Moments.",
        guide: "Read today's Daily Moment all the way to Amen. Your first one earns a hero, and so does every 10th Moment after that. Only today's Moment counts, so come back each day.",
    },
    {
        group: "FS",
        name: "Fruit of the Spirit",
        one: "Fruit of the Spirit",
        how: "One every 4 faithful weeks: weeks with a Daily Moment on 5 days or more.",
        guide: "A faithful week is a Sunday-to-Saturday week with a Daily Moment on 5 days or more, so missing a day or two does not lose it. Every 4 faithful weeks earn a Fruit of the Spirit.",
    },
    {
        group: "DK",
        name: "Did You Know?",
        one: "Did You Know? sticker",
        how: "One for your first right answer in Bible Trivia, then one every 10 days you get one right.",
        guide: "Bible Trivia pops up on the home page now and then, asking which book a fact comes from. Your first right answer earns a sticker; after that, every 10th day you get one right earns another.",
    },
    {
        group: "FT",
        name: "Food for Thought",
        one: "Food for Thought sticker",
        how: "One the first day you open the day's Food for Thought, then one every 10 days you do.",
        guide: "Open today's Food for Thought: tap “Read the full serving” or its verse. The first day earns a sticker, then every 10th day you open it.",
    },
    {
        group: "BK",
        name: "Books of the Bible",
        one: "book",
        how: "Each book fills in the first time you meet it: in Bible Trivia, a Daily Moment or a memory verse.",
        guide: "A book of the Bible fills in on your shelf the first time you meet it: a right Bible Trivia answer about that book, a Daily Moment whose verse comes from it, or a memory verse from it.",
    },
];

/** The six firsts, each worth a piece of the Armour of God. */
export const FIRSTS = [
    {
        key: "moment",
        todo: "Finish a Daily Moment",
        done: "finishing your first Daily Moment",
    },
    {
        key: "practice",
        todo: "Practise this week's memory verse",
        done: "your first memory verse practice",
    },
    {
        key: "story",
        todo: "Read a Bible story to the last page",
        done: "reading your first story to the last page",
    },
    {
        key: "trivia",
        todo: "Get a Bible Trivia question right",
        done: "your first right answer in Bible Trivia",
    },
    {
        key: "answer",
        todo: "Write an answer in a Daily Moment",
        done: "writing your first answer in a Daily Moment",
    },
    {
        key: "verse",
        todo: "Learn a memory verse",
        done: "learning your first memory verse",
    },
];

// The first now, then one every EVERY: how many are due after `count`, and
// the count at which the nth comes.
const firstThenEvery = {
    due: (count) => (count > 0 ? 1 + Math.floor(count / EVERY) : 0),
    at: (n) => (n === 1 ? 1 : (n - 1) * EVERY),
};

// Every path but the firsts and the books: its series, its count, and how
// many stickers that count is worth.
const PATHS = {
    verses: {
        group: "BS",
        count: (p) => p.verses.count,
        due: (count) => count,
        at: (n) => n,
    },
    moments: {
        group: "HB",
        count: (p) => p.moments.count,
        ...firstThenEvery,
    },
    weeks: {
        group: "FS",
        count: (p) => p.weeks.count,
        due: (count) => Math.floor(count / WEEKS_EACH),
        at: (n) => n * WEEKS_EACH,
    },
    trivia: {
        group: "DK",
        count: (p) => p.triviaDays.count,
        ...firstThenEvery,
    },
    food: {
        group: "FT",
        count: (p) => p.foodDays.count,
        ...firstThenEvery,
    },
};

/* ---------- Days ---------- */

function manilaToday() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

/** "2026-10-18" → "October 18, 2026". */
export function formatDay(iso) {
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
        timeZone: "UTC",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
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
        // Private mode or a full store: the gifts are worked out again next time.
    }
}

function emptyCollection(today) {
    return { started: today, welcomed: false, earned: {}, surprises: [] };
}

/** What has been earned. */
export function readCollection() {
    return readStore(STORE_KEY, null) ?? emptyCollection(manilaToday());
}

/** The IDs earned but not yet shown, in the order they were earned. */
export function pendingGifts() {
    return Object.entries(readCollection().earned)
        .filter(([, entry]) => !entry.seen)
        .map(([id]) => id);
}

export function markSeen(ids) {
    const collection = readStore(STORE_KEY, null);
    if (!collection) {
        return;
    }
    for (const id of ids) {
        if (collection.earned[id]) {
            collection.earned[id].seen = true;
        }
    }
    writeStore(STORE_KEY, collection);
}

export function markWelcomed() {
    const collection = readStore(STORE_KEY, null);
    if (collection) {
        collection.welcomed = true;
        writeStore(STORE_KEY, collection);
    }
}

/* ---------- The stickers ---------- */

let stickersRequest = null;

/** The stickers, from stickers.json. A failed fetch is forgotten, so it can be retried. */
export function loadStickers() {
    if (!stickersRequest) {
        stickersRequest = fetch(STICKERS_URL)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Unable to load ${STICKERS_URL} (${response.status})`,
                    );
                }
                return response.json();
            })
            .catch((error) => {
                stickersRequest = null;
                throw error;
            });
    }
    return stickersRequest;
}

/** The sticker's picture: the 600 × 600 .webp, or with `full` the full-size .png. */
export function stickerImage(sticker, { full = false } = {}) {
    const file = full
        ? sticker.filename
        : sticker.filename.replace(/\.png$/, ".webp");
    return `${MEDIA_BASE_URL}${file}`;
}

function byGroup(stickers) {
    const groups = {};
    for (const sticker of [...stickers].sort((a, b) =>
        a.id.localeCompare(b.id),
    )) {
        if (!groups[sticker.group]) {
            groups[sticker.group] = [];
        }
        groups[sticker.group].push(sticker);
    }
    return groups;
}

/* ---------- The rules ---------- */

/**
 * Adds to `collection` every sticker `progress` has earned, and returns the
 * IDs added. `random` picks the surprises.
 */
export function award(
    progress,
    collection,
    stickers,
    { today = manilaToday(), random = Math.random } = {},
) {
    const earned = collection.earned;
    const groups = byGroup(stickers);
    const added = [];
    const give = (sticker, how) => {
        earned[sticker.id] = { day: today, ...how, seen: false };
        added.push(sticker.id);
    };
    const nextIn = (group) =>
        (groups[group] ?? []).find((sticker) => !earned[sticker.id]);
    const given = (path) =>
        Object.values(earned).filter((entry) => entry.path === path);

    // The firsts, in the order they happened, each with the next piece.
    const firstsGiven = new Set(given("firsts").map((entry) => entry.first));
    const firstsDone = FIRSTS.map((first, order) => ({
        key: first.key,
        order,
        day: progress.firsts?.[first.key],
    }))
        .filter((first) => first.day && !firstsGiven.has(first.key))
        .sort((a, b) => a.day.localeCompare(b.day) || a.order - b.order);
    for (const first of firstsDone) {
        const sticker = nextIn("AG");
        if (!sticker) {
            break;
        }
        give(sticker, { path: "firsts", first: first.key });
    }

    // The counted paths.
    for (const [name, path] of Object.entries(PATHS)) {
        const due = path.due(path.count(progress));
        for (let n = given(name).length + 1; n <= due; n++) {
            const sticker = nextIn(path.group);
            if (!sticker) {
                break;
            }
            give(sticker, { path: name, n });
        }
    }

    // The bookshelf, in the order the books were met.
    const books = new Map((groups.BK ?? []).map((sticker) => [sticker.title, sticker]));
    const met = Object.entries(progress.books ?? {}).sort((a, b) =>
        a[1].localeCompare(b[1]),
    );
    for (const [book] of met) {
        const sticker = books.get(book);
        if (sticker && !earned[sticker.id]) {
            give(sticker, { path: "books", book });
        }
    }

    // Surprises. Each one can reach another milestone, so look again after it.
    let looking = true;
    while (looking) {
        looking = false;
        const total = Object.keys(earned).length;
        const reasons = [
            ...ALBUM_MILESTONES.filter((count) => total >= count).map(
                (count) => `album-${count}`,
            ),
            ...SERIES.filter(({ group }) =>
                (groups[group] ?? []).every((sticker) => earned[sticker.id]),
            ).map(({ group }) => `series-${group}`),
        ].filter((reason) => !collection.surprises.includes(reason));
        if (!reasons.length) {
            break;
        }
        const reason = reasons[0];
        collection.surprises.push(reason);
        const pool = stickers.filter(
            (sticker) =>
                SURPRISE_GROUPS.includes(sticker.group) && !earned[sticker.id],
        );
        if (pool.length) {
            give(pool[Math.floor(random() * pool.length)], {
                path: "surprise",
                reason,
            });
        }
        looking = true;
    }
    return added;
}

/** Awards whatever is due. Resolves to the IDs added. */
export async function checkAwards() {
    const stickers = await loadStickers();
    const stored = readStore(STORE_KEY, null);
    const collection = stored ?? emptyCollection(manilaToday());
    const added = award(readProgress(), collection, stickers);
    if (added.length || !stored) {
        writeStore(STORE_KEY, collection);
    }
    return added;
}

/* ---------- Words ---------- */

function ordinal(n) {
    const tens = n % 100;
    if (tens >= 11 && tens <= 13) {
        return `${n}th`;
    }
    return `${n}${{ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th"}`;
}

/** Why the sticker was given: "For finishing 10 Daily Moments". */
export function earnedFor(entry, sticker) {
    switch (entry.path) {
        case "firsts": {
            const first = FIRSTS.find((item) => item.key === entry.first);
            return `For ${first?.done ?? "trying something new"}`;
        }
        case "verses":
            return entry.n === 1
                ? "For learning your first memory verse"
                : `For learning your ${ordinal(entry.n)} memory verse`;
        case "moments": {
            const at = PATHS.moments.at(entry.n);
            return at === 1
                ? "For finishing your first Daily Moment"
                : `For finishing ${at} Daily Moments`;
        }
        case "weeks":
            return `For ${PATHS.weeks.at(entry.n)} faithful weeks of Daily Moments`;
        case "trivia": {
            const at = PATHS.trivia.at(entry.n);
            return at === 1
                ? "For your first right answer in Bible Trivia"
                : `For right answers in Bible Trivia on ${at} days`;
        }
        case "food": {
            const at = PATHS.food.at(entry.n);
            return at === 1
                ? "For opening your first Food for Thought"
                : `For opening Food for Thought on ${at} days`;
        }
        case "books":
            return `For meeting ${entry.book ?? sticker?.title} for the first time`;
        case "surprise": {
            const [kind, value] = String(entry.reason).split("-");
            if (kind === "album") {
                return `A surprise for reaching ${value} stickers`;
            }
            const series = SERIES.find((item) => item.group === value);
            return `A surprise for completing ${series?.name ?? "a set"}`;
        }
        default:
            return "A gift";
    }
}

/**
 * The next gift on each path that still has stickers to give, in album order:
 * { group, text, remaining, done, step } (done of step, for a progress bar).
 * The firsts come as { group: "AG", todo: [the firsts still to do] }.
 */
export function goals(progress, collection, stickers) {
    const groups = byGroup(stickers);
    const earned = collection.earned;
    const left = (group) =>
        (groups[group] ?? []).some((sticker) => !earned[sticker.id]);
    const list = [];

    if (left("AG")) {
        const todo = FIRSTS.filter((first) => !progress.firsts?.[first.key]);
        if (todo.length) {
            list.push({
                group: "AG",
                text: `${todo[0].todo} for a piece of the Armour of God`,
                todo,
                remaining: 1,
                done: FIRSTS.length - todo.length,
                step: FIRSTS.length,
            });
        }
    }

    const counted = [
        ["verses", "memory verse", "memory verses"],
        ["moments", "Daily Moment", "Daily Moments"],
        ["weeks", "faithful week", "faithful weeks"],
        ["trivia", "day with a right trivia answer", "days with a right trivia answer"],
        ["food", "day of Food for Thought", "days of Food for Thought"],
    ];
    for (const [name, one, many] of counted) {
        const path = PATHS[name];
        if (!left(path.group)) {
            continue;
        }
        const count = path.count(progress);
        const nextAt = path.at(path.due(count) + 1);
        const previousAt = path.due(count) ? path.at(path.due(count)) : 0;
        const remaining = nextAt - count;
        const series = SERIES.find((item) => item.group === path.group);
        let text = `${remaining} more ${remaining === 1 ? one : many} for your next ${series.one}`;
        if (name === "verses") {
            text = "Learn this week's memory verse for your next Bible Saying";
        }
        const goal = {
            group: path.group,
            text,
            remaining,
            done: count - previousAt,
            step: nextAt - previousAt,
        };
        if (name === "weeks") {
            goal.week = thisWeeksMoments(progress);
            goal.text += ` (this week: ${goal.week} of ${FAITHFUL_DAYS} Moments)`;
        }
        list.push(goal);
    }

    const books = groups.BK ?? [];
    const met = books.filter((sticker) => earned[sticker.id]).length;
    if (met < books.length) {
        list.push({
            group: "BK",
            text: `${met} of ${books.length} books met. Bible Trivia is a good way to meet more`,
            remaining: books.length - met,
            done: met,
            step: books.length,
        });
    }
    return list;
}

function thisWeeksMoments(progress) {
    const today = new Date(`${manilaToday()}T00:00:00Z`);
    const sunday = new Date(today.getTime() - today.getUTCDay() * 86_400_000)
        .toISOString()
        .slice(0, 10);
    return progress.weeks.sunday === sunday ? progress.weeks.days : 0;
}
