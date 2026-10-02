import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Shuffle the "sequence" of assets/stories.json before publishing, so the story
// carousel opens on a different order of cards each day. The order depends only
// on the date in Manila and each story's id: every deploy on the same day (a
// push, a rerun) gives the same order, the next day's scheduled deploy gives a
// new one, and the card that leads is never the one that led the day before.
//
// Usage
//   node assets/scripts/update-stories-sequence.mjs [--date YYYY-MM-DD] [--dry-run]
//     --date     shuffle for that day instead of today in Manila
//     --dry-run  print the order without writing assets/stories.json

// How many days back the "never the same first card twice running" rule is
// replayed from; see dailyOrder().
const LOOKBACK_DAYS = 30;

function parseArgs(argv) {
    const options = { date: null, dryRun: false };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === "--dry-run") options.dryRun = true;
        else if (arg === "--date") options.date = argv[++i];
        else if (arg.startsWith("--date=")) options.date = arg.slice("--date=".length);
        else throw new Error(`Unknown argument: ${arg}`);
    }
    if (options.date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(options.date ?? "")) {
        throw new Error("--date expects YYYY-MM-DD");
    }
    return options;
}

/** Today's date in Manila, as YYYY-MM-DD. */
function manilaToday() {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Manila",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
            .formatToParts(new Date())
            .map(({ type, value }) => [type, value]),
    );
    return `${parts.year}-${parts.month}-${parts.day}`;
}

/** The YYYY-MM-DD date `days` days after `date` (before, when negative). */
function addDays(date, days) {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

// FNV-1a, finished with murmur3's fmix32. Without the finish, texts that
// differ only in their last characters, as consecutive dates do, hash to
// related values, and some stories came first far more often than others.
function hash32(text) {
    let h = 0x811c9dc5;
    for (const char of text) {
        h = Math.imul(h ^ char.codePointAt(0), 0x01000193);
    }
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return h >>> 0;
}

/**
 * The ids in the day's order, before the first-card rule: each story is placed
 * by a hash of the date and its own id, so its place does not depend on where
 * it sits in the file or on how many stories there are.
 */
function rank(ids, date) {
    return ids
        .map((id) => [hash32(`${date}|${id}`), id])
        .sort((a, b) => a[0] - b[0] || (a[1] < b[1] ? -1 : 1))
        .map(([, id]) => id);
}

/**
 * The ids in the day's order, the first never the one that led the day
 * before: when it would be, the first two change places. Whether yesterday's
 * first card was itself moved depends on the day before that, so the rule is
 * replayed from LOOKBACK_DAYS back. Replays started on neighbouring days agree
 * from the first day whose leader was not moved, which comes within a day or
 * two. Past days are replayed with today's stories, so on the day a story is
 * added or removed the rule can, rarely, miss.
 */
function dailyOrder(ids, date) {
    let order = [];
    let previousFirst = null;
    for (let back = LOOKBACK_DAYS; back >= 0; back--) {
        order = rank(ids, addDays(date, -back));
        if (order.length > 1 && order[0] === previousFirst) {
            [order[0], order[1]] = [order[1], order[0]];
        }
        previousFirst = order[0];
    }
    return order;
}

const options = parseArgs(process.argv.slice(2));
const date = options.date ?? manilaToday();
const path = fileURLToPath(new URL("../stories.json", import.meta.url));
const text = readFileSync(path, "utf8");
const stories = JSON.parse(text);
if (!Array.isArray(stories) || stories.length === 0) {
    throw new Error("Expected a non-empty list of stories in assets/stories.json");
}
const ids = stories.map((story) => story?.id);
for (const [i, id] of ids.entries()) {
    if (typeof id !== "string" || id === "") throw new Error(`Story ${i + 1} in assets/stories.json has no id`);
    if (ids.indexOf(id) !== i) throw new Error(`Story id "${id}" appears twice in assets/stories.json`);
}

const order = dailyOrder(ids, date);
const sequence = new Map(order.map((id, i) => [id, i + 1]));
const sequences = ids.map((id) => sequence.get(id));

const field = /("sequence"\s*:\s*)-?\d+(?:\.\d+)?/g;
let output;
if (stories.every((story) => Number.isFinite(story.sequence)) && [...text.matchAll(field)].length === stories.length) {
    // Swap only the numbers so the surrounding formatting survives untouched.
    let index = 0;
    output = text.replace(field, (_, key) => `${key}${sequences[index++]}`);
} else {
    // A story is missing its sequence: rewrite the file, putting it after the id.
    const eol = text.includes("\r\n") ? "\r\n" : "\n";
    const updated = stories.map(({ id, sequence: _, ...rest }, i) => ({ id, sequence: sequences[i], ...rest }));
    output = JSON.stringify(updated, null, 4).replace(/\n/g, eol) + eol;
}
if (!options.dryRun) writeFileSync(path, output);

console.log(`Story sequence for ${date}${options.dryRun ? " (dry run, not written)" : ""}: ${order.join(", ")}`);
