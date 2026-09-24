// Verify every asset the site references actually exists, before it ships.
//
// Broken references are invisible at runtime: the symbol <img> tags hide
// themselves in onerror, so a 404 leaves no trace in the UI or the console.
// This is the only place that notices.
//
//   node assets/scripts/check-assets.mjs                 local + remote
//   node assets/scripts/check-assets.mjs --skip-remote   local only (offline)
//   node assets/scripts/check-assets.mjs --warn-remote   remote misses warn, never fail
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const skipRemote = process.argv.includes("--skip-remote");
const warnRemote = process.argv.includes("--warn-remote");

const failures = [];
const warnings = [];
const fail = (msg) => failures.push(msg);

// --- Pass 1: local references resolve to files in the tree ------------------

// Every file that can point at another file we ship.
const SOURCES = [
    "index.html",
    "apps/pages/flipbook.html",
    "apps/pages/stories.html",
    "assets/styles/styles.css",
    "assets/styles/flipbook-page.css",
    "apps/components/flip-book.js",
    "apps/pages/scripts/daily-grace-week.js",
    "apps/pages/scripts/stories.js",
];
const REFERENCE = /(?:src|href)="([^"]+)"|url\(\s*['"]?([^'")]+?)['"]?\s*\)/g;
const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\?)/i;

let checked = 0;
for (const source of SOURCES) {
    const path = resolve(ROOT, source);
    if (!existsSync(path)) {
        fail(`source file is missing: ${source}`);
        continue;
    }
    const text = readFileSync(path, "utf8");
    for (const [, attr, css] of text.matchAll(REFERENCE)) {
        const raw = attr ?? css;
        if (!raw || EXTERNAL.test(raw)) continue;
        const ref = raw.split(/[?#]/)[0];
        if (!ref) continue;
        // Root-relative paths resolve from the site root, the rest from the file.
        const target = ref.startsWith("/")
            ? resolve(ROOT, `.${ref}`)
            : resolve(dirname(path), ref);
        checked += 1;
        if (!existsSync(target)) fail(`${source} -> ${raw} (no such file)`);
    }
}

// --- Pass 1b: story manifests point at files we ship ------------------------

// Story images live in JSON, not in src/href, so pass 1 cannot see them. A bad
// path here shows as a blank page rather than an error, so it is checked too.
// Manifest paths are written relative to the site root; absolute URLs are the
// media host's problem, not ours.
const STORY_DIR = resolve(ROOT, "assets/stories");
if (existsSync(STORY_DIR)) {
    for (const file of readdirSync(STORY_DIR)) {
        if (!file.endsWith(".json")) continue;
        const source = `assets/stories/${file}`;
        let manifest;
        try {
            manifest = JSON.parse(readFileSync(resolve(STORY_DIR, file), "utf8"));
        } catch (error) {
            fail(`${source} is not valid JSON (${error.message})`);
            continue;
        }
        const pages = Array.isArray(manifest) ? manifest : manifest?.pages;
        if (!Array.isArray(pages)) {
            fail(`${source} has no pages array`);
            continue;
        }
        for (const [i, page] of pages.entries()) {
            for (const key of ["image", "audio"]) {
                const raw = page?.[key];
                if (!raw || EXTERNAL.test(raw)) continue;
                checked += 1;
                if (!existsSync(resolve(ROOT, `.${raw.startsWith("/") ? "" : "/"}${raw}`))) {
                    fail(`${source} page ${i + 1} ${key} -> ${raw} (no such file)`);
                }
            }
        }
    }
}

// --- Pass 2: book symbols exist on the media host ---------------------------

// The media library is deployed separately, so its files cannot be checked on
// disk. Read the URL rules out of the shipped source rather than restating
// them here: a copy would drift from the code it is meant to be checking.
const readScript = (file) => readFileSync(resolve(ROOT, file), "utf8");
const mediaBase = readScript("assets/scripts/script.js").match(
    /^const MEDIA_BASE_URL = ['"]([^'"]+)['"]/m,
)?.[1];
if (!mediaBase) fail("could not read MEDIA_BASE_URL from assets/scripts/script.js");

// The same map is inlined in three files; a mismatch is a bug waiting to ship.
const MAP_HOLDERS = [
    "apps/components/banner-slider.js",
    "apps/components/bible-search-results.js",
    "apps/components/did-you-know.js",
];
const maps = new Map();
for (const file of MAP_HOLDERS) {
    const literal = readScript(file).match(/const SYMBOL_BOOK_NAMES = (\{[^}]*\})/)?.[1];
    if (!literal) {
        fail(`could not read SYMBOL_BOOK_NAMES from ${file}`);
        continue;
    }
    maps.set(file, literal.replace(/['"\s]/g, ""));
}
const distinct = new Set(maps.values());
if (distinct.size > 1) {
    fail(`SYMBOL_BOOK_NAMES differs between files: ${[...maps].map(([f, m]) => `${f}=${m}`).join(" | ")}`);
}

const symbolNames = Object.fromEntries(
    [...(distinct.values().next().value ?? "")
        .replace(/^\{|\}$/g, "")
        .split(",")
        .filter(Boolean)
        .map((pair) => pair.split(":"))],
);
const symbolUrl = (book) =>
    `${mediaBase}images/symbols/${encodeURIComponent(symbolNames[book] ?? book)}-symbol.svg`;

const verses = JSON.parse(readFileSync(resolve(ROOT, "assets/verses.json"), "utf8"));
const books = [
    ...new Set(verses.map((item) => String(item.verse).replace(/\s+\d.*$/, "").trim())),
].sort();

if (!skipRemote && mediaBase) {
    const results = await Promise.all(
        books.map(async (book) => {
            const url = symbolUrl(book);
            try {
                const response = await fetch(url, { method: "HEAD" });
                return { book, url, ok: response.ok, status: response.status };
            } catch (error) {
                return { book, url, ok: false, status: error.message };
            }
        }),
    );
    for (const { book, url, ok, status } of results) {
        if (ok) continue;
        // A host that is down should never block publishing the day's devotional.
        (warnRemote ? warnings : failures).push(`${book} -> ${url} (${status})`);
    }
    checked += books.length;
}

// --- Report -----------------------------------------------------------------

// The same file is often referenced more than once; report each problem once.
const unique = (list) => [...new Set(list)];
for (const warning of unique(warnings)) console.warn(`warning: ${warning}`);
const broken = unique(failures);
if (broken.length) {
    for (const failure of broken) console.error(`missing: ${failure}`);
    console.error(`\n${broken.length} broken reference(s) out of ${checked} checked.`);
    process.exit(1);
}
console.log(`${checked} references checked across ${SOURCES.length} files and ${books.length} books; all resolve.`);
