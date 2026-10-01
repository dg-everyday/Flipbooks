import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Shuffle the "sequence" of assets/stories.json before publishing, so the story
// carousel opens on a different order of cards each day. The shuffle is seeded
// with today's date in Manila: every deploy on the same day (a push, a rerun)
// gives the same order, and the next day's scheduled deploy gives a new one.
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
const today = `${parts.year}-${parts.month}-${parts.day}`;

// FNV-1a hash of the date, then mulberry32: small, seeded, good enough to shuffle.
function seededRandom(text) {
    let seed = 0x811c9dc5;
    for (const char of text) {
        seed = Math.imul(seed ^ char.codePointAt(0), 0x01000193);
    }
    return () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const random = seededRandom(today);
const path = fileURLToPath(new URL("../stories.json", import.meta.url));
const text = readFileSync(path, "utf8");
const stories = JSON.parse(text);
if (!Array.isArray(stories) || stories.length === 0) {
    throw new Error("Expected a non-empty list of stories in assets/stories.json");
}

// 1..n in a random order (Fisher–Yates).
const order = stories.map((_, i) => i + 1);
for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
}

const field = /("sequence"\s*:\s*)-?\d+(?:\.\d+)?/g;
let output;
if (stories.every((story) => Number.isFinite(story?.sequence)) && [...text.matchAll(field)].length === stories.length) {
    // Swap only the numbers so the surrounding formatting survives untouched.
    let index = 0;
    output = text.replace(field, (_, key) => `${key}${order[index++]}`);
} else {
    // A story is missing its sequence: rewrite the file, putting it after the id.
    const eol = text.includes("\r\n") ? "\r\n" : "\n";
    const updated = stories.map(({ id, sequence, ...rest }, i) => ({ id, sequence: order[i], ...rest }));
    output = JSON.stringify(updated, null, 4).replace(/\n/g, eol) + eol;
}
writeFileSync(path, output);

const ids = stories.map((story, i) => [order[i], story.id]).sort((a, b) => a[0] - b[0]);
console.log(`Story sequence for ${today}: ${ids.map(([, id]) => id).join(", ")}`);
