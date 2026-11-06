/**
 * My Faith Journal: what is kept on this device, and nothing else. No entry
 * leaves it, except in a backup file the reader makes (backup.js).
 *
 * The journal lives in IndexedDB, not localStorage: a year of writing can
 * outgrow the few megabytes localStorage gives the whole site (see
 * docs/faith-journal/plan.md, "Does a year of My Faith Journal fit?").
 *
 * Database "dailygrace-journal", version 1:
 *   entries   { id, year, day, kind, title, body, fields, verse, prompt,
 *               cards, mood, categories, flag, prayer, source, sourceKey,
 *               edited, created, updated, original, versions }
 *             indexes: year, day, sourceKey (unique; only entries the app
 *             wrote from somewhere else, such as a Moment's answer, have one)
 *   volumes   { year, opened, closed }   one for each year the journal has
 *   meta      key → value: what has been imported, persistence, settings
 *
 * An entry belongs to the year of its day (YYYY-MM-DD, Asia/Manila like the
 * rest of the app). Its body is a small, cleaned piece of HTML: paragraphs,
 * line breaks, bold, italic, lists and quotes, nothing else (cleanBody).
 * Its other parts, which differ by kind (what I'm thankful for, a quote and
 * its source, for whom a prayer is…; kinds.js), are plain text in `fields`.
 * Changing an entry's title or body keeps the one before it: `original` is
 * the entry as first written, `versions` the last MAX_VERSIONS before now.
 * A closed volume's entries can be read but not changed.
 *
 * Exports      KINDS, MAX_VERSIONS, JOURNAL_CHANGE
 *              todayIso()                     today in Manila, YYYY-MM-DD
 *              addEntry(fields)               the new entry
 *              getEntry(id), entryBySource(sourceKey)
 *              updateEntry(id, changes, { fromSource })
 *              deleteEntry(id, { remember }), wasRemoved(sourceKey)
 *              entriesForYear(year), entriesForDay(day)
 *              volumes(), getMeta(key, fallback), setMeta(key, value)
 *              allEntries()                   every year's entries
 *              closePastYears()               closes the years before this
 *                                             one, carrying open prayers on
 *              requestPersistence()           asks the browser to keep it all
 *              dumpJournal(), loadJournal(dump, { mode })   for backups
 *              cleanBody(html), textToBody(text), bodyText(html)
 * Events       JOURNAL_CHANGE on window, detail: { action, id }
 */

import { FIELD_KEYS, FIELD_LIMIT, MOODS } from "./kinds.js?v=20261106-1";

const DB_NAME = "dailygrace-journal";
const DB_VERSION = 1;
const TIME_ZONE = "Asia/Manila";

export const KINDS = ["log", "discovery", "diary", "notebook", "prayer"];
export const MAX_VERSIONS = 5;
export const JOURNAL_CHANGE = "dailygrace:journalchange";

// The meta key under which entries the reader took out are remembered, so an
// import does not bring them back.
const REMOVED_SOURCES = "removedSources";

let dbRequest = null;

/* ---------- The database ---------- */

function openDb() {
    if (!dbRequest) {
        dbRequest = new Promise((resolve, reject) => {
            if (!("indexedDB" in globalThis)) {
                reject(new Error("IndexedDB is not available"));
                return;
            }
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (event) => {
                const db = request.result;
                // Each step brings an older database up to the next version.
                if (event.oldVersion < 1) {
                    const entries = db.createObjectStore("entries", { keyPath: "id" });
                    entries.createIndex("year", "year");
                    entries.createIndex("day", "day");
                    entries.createIndex("sourceKey", "sourceKey", { unique: true });
                    db.createObjectStore("volumes", { keyPath: "year" });
                    db.createObjectStore("meta");
                }
            };
            request.onsuccess = () => {
                const db = request.result;
                // Another tab opening a newer version: let it, and open again next time.
                db.onversionchange = () => {
                    db.close();
                    dbRequest = null;
                };
                resolve(db);
            };
            request.onerror = () => reject(request.error);
            request.onblocked = () => reject(new Error("The journal is open in an older tab"));
        }).catch((error) => {
            dbRequest = null;
            throw error;
        });
    }
    return dbRequest;
}

/** Runs work(stores) in one transaction; resolves with its result once committed. */
async function inTransaction(names, mode, work) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(names, mode);
        const stores = Object.fromEntries(names.map((name) => [name, tx.objectStore(name)]));
        let result;
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error ?? new Error("The journal could not be saved"));
        Promise.resolve(work(stores, tx)).then(
            (value) => {
                result = value;
            },
            (error) => {
                try {
                    tx.abort();
                } catch {
                    // Already finished: nothing was left to undo.
                }
                reject(error);
            },
        );
    });
}

const done = (request) =>
    new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

function announce(action, id) {
    window.dispatchEvent(new CustomEvent(JOURNAL_CHANGE, { detail: { action, id } }));
}

/* ---------- Days ---------- */

/** Today in Manila, as YYYY-MM-DD. */
export function todayIso() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}

function isDay(value) {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function newId() {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
        b.toString(16).padStart(2, "0"),
    ).join("");
}

/* ---------- Bodies ---------- */

// What an entry's body may hold; anything else is unwrapped to its text.
const BODY_TAGS = new Map([
    ["P", "p"],
    ["DIV", "p"],
    ["BR", "br"],
    ["STRONG", "strong"],
    ["B", "strong"],
    ["EM", "em"],
    ["I", "em"],
    ["UL", "ul"],
    ["OL", "ol"],
    ["LI", "li"],
    ["BLOCKQUOTE", "blockquote"],
]);
// Dropped with everything inside them.
const DROPPED_TAGS = new Set(["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT", "IFRAME", "OBJECT", "SVG", "MATH"]);

function copyClean(from, to, doc) {
    for (const node of from.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            to.append(doc.createTextNode(node.textContent));
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const name = node.tagName.toUpperCase();
            if (DROPPED_TAGS.has(name)) {
                continue;
            }
            const tag = BODY_TAGS.get(name);
            if (tag) {
                const element = doc.createElement(tag);
                to.append(element);
                copyClean(node, element, doc);
            } else {
                copyClean(node, to, doc);
            }
        }
    }
}

/** The body cut down to the tags an entry may hold, with no attributes. */
export function cleanBody(html) {
    // DOMParser documents are inert: nothing in them loads or runs.
    const source = new DOMParser().parseFromString(String(html ?? ""), "text/html").body;
    const doc = document.implementation.createHTMLDocument("");
    const out = doc.createElement("div");
    copyClean(source, out, doc);
    return out.innerHTML.trim();
}

/** Plain text as a body: blank lines part paragraphs, single line breaks stay. */
export function textToBody(text) {
    const doc = document.implementation.createHTMLDocument("");
    const out = doc.createElement("div");
    const paragraphs = String(text ?? "")
        .replace(/\r\n?/g, "\n")
        .split(/\n\s*\n/)
        .map((part) => part.trim())
        .filter(Boolean);
    for (const paragraph of paragraphs) {
        const p = doc.createElement("p");
        paragraph.split("\n").forEach((line, index) => {
            if (index > 0) {
                p.append(doc.createElement("br"));
            }
            p.append(doc.createTextNode(line));
        });
        out.append(p);
    }
    return out.innerHTML;
}

/** A body's words, for search and previews. */
export function bodyText(html) {
    const body = new DOMParser().parseFromString(String(html ?? ""), "text/html").body;
    body.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
    body.querySelectorAll("p, li, blockquote").forEach((block) => block.append("\n"));
    return body.textContent.replace(/\n{2,}/g, "\n").trim();
}

/* ---------- Entries ---------- */

function cleanList(value) {
    return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()) : [];
}

const snippet = (value, length) => (typeof value === "string" ? value.slice(0, length) : "");

/**
 * Bookmarks put into an entry. Each keeps a copy of what it showed (title,
 * text, reference) so the entry reads the same without loading the Bible or
 * the study files, and after the bookmark itself is taken off.
 */
function cleanCards(value) {
    return Array.isArray(value)
        ? value
              .filter((card) => card && typeof card.kind === "string" && card.id != null)
              .map((card) => ({
                  kind: card.kind,
                  id: String(card.id),
                  title: snippet(card.title, 200),
                  text: snippet(card.text, 2000),
                  reference: snippet(card.reference, 200),
              }))
        : [];
}

/** The plain parts of an entry (kinds.js), each a string; empty ones dropped. */
function cleanFields(value) {
    const fields = {};
    if (value && typeof value === "object") {
        for (const key of FIELD_KEYS) {
            if (typeof value[key] === "string" && value[key].trim()) {
                fields[key] = value[key].slice(0, FIELD_LIMIT);
            }
        }
    }
    return fields;
}

const cleanMood = (value) => (MOODS.some((mood) => mood.key === value) ? value : null);

function cleanPrayer(value) {
    if (!value || typeof value !== "object") {
        return null;
    }
    return {
        answered: Boolean(value.answered),
        answeredOn: isDay(value.answeredOn) ? value.answeredOn : null,
        note: typeof value.note === "string" ? value.note : "",
    };
}

/** Writes a new entry; its year's volume is opened if it is the first. */
export async function addEntry(fields = {}) {
    const day = isDay(fields.day) ? fields.day : todayIso();
    const kind = KINDS.includes(fields.kind) ? fields.kind : "log";
    const now = new Date().toISOString();
    const entry = {
        id: newId(),
        year: Number(day.slice(0, 4)),
        day,
        kind,
        title: typeof fields.title === "string" ? fields.title.trim() : "",
        body: cleanBody(fields.body),
        verse: typeof fields.verse === "string" ? fields.verse : "",
        prompt: typeof fields.prompt === "string" ? fields.prompt : "",
        cards: cleanCards(fields.cards),
        fields: cleanFields(fields.fields),
        mood: cleanMood(fields.mood),
        categories: cleanList(fields.categories),
        flag: Boolean(fields.flag),
        prayer: kind === "prayer" ? (cleanPrayer(fields.prayer) ?? cleanPrayer({})) : null,
        edited: false,
        created: now,
        updated: now,
        versions: [],
    };
    if (typeof fields.source === "string" && typeof fields.sourceKey === "string") {
        entry.source = fields.source;
        entry.sourceKey = fields.sourceKey;
    }
    entry.original = { title: entry.title, body: entry.body, created: now };

    await inTransaction(["entries", "volumes"], "readwrite", async ({ entries, volumes }) => {
        const volume = await done(volumes.get(entry.year));
        if (volume?.closed) {
            throw new Error(`The ${entry.year} journal is closed`);
        }
        if (!volume) {
            volumes.put({ year: entry.year, opened: now, closed: null });
        }
        entries.add(entry);
    });
    announce("add", entry.id);
    return entry;
}

export async function getEntry(id) {
    return (await inTransaction(["entries"], "readonly", ({ entries }) => done(entries.get(id)))) ?? null;
}

export async function entryBySource(sourceKey) {
    return (
        (await inTransaction(["entries"], "readonly", ({ entries }) =>
            done(entries.index("sourceKey").get(sourceKey)),
        )) ?? null
    );
}

/**
 * Changes an entry. A new title or body keeps the old one in `versions`,
 * unless { newVersion: false }: the editor saves at every pause in typing,
 * and keeps a version only for the first save each time an entry is opened.
 * Changes from the reader mark the entry `edited`; changes the app makes from
 * an entry's source ({ fromSource: true }) do not, and are kept out of the
 * versions, since the reader did not write them here. A new day moves the
 * entry to that day's year.
 */
export async function updateEntry(id, changes = {}, { fromSource = false, newVersion = true } = {}) {
    let updated = null;
    await inTransaction(["entries", "volumes"], "readwrite", async ({ entries, volumes }) => {
        const entry = await done(entries.get(id));
        if (!entry) {
            throw new Error("No such entry");
        }
        const volume = await done(volumes.get(entry.year));
        if (volume?.closed) {
            throw new Error(`The ${entry.year} journal is closed`);
        }
        const next = { ...entry };
        if (isDay(changes.day) && changes.day !== entry.day) {
            next.day = changes.day;
            next.year = Number(changes.day.slice(0, 4));
            const target = await done(volumes.get(next.year));
            if (target?.closed) {
                throw new Error(`The ${next.year} journal is closed`);
            }
            if (!target) {
                volumes.put({ year: next.year, opened: new Date().toISOString(), closed: null });
            }
        }
        if ("title" in changes) {
            next.title = String(changes.title ?? "").trim();
        }
        if ("body" in changes) {
            next.body = cleanBody(changes.body);
        }
        if ("kind" in changes && KINDS.includes(changes.kind)) {
            next.kind = changes.kind;
            next.prayer = changes.kind === "prayer" ? (next.prayer ?? cleanPrayer({})) : null;
        }
        if ("cards" in changes) {
            next.cards = cleanCards(changes.cards);
        }
        if ("mood" in changes) {
            next.mood = cleanMood(changes.mood);
        }
        if ("fields" in changes) {
            next.fields = cleanFields(changes.fields);
        }
        if ("categories" in changes) {
            next.categories = cleanList(changes.categories);
        }
        if ("flag" in changes) {
            next.flag = Boolean(changes.flag);
        }
        if ("prayer" in changes && next.kind === "prayer") {
            next.prayer = cleanPrayer(changes.prayer);
        }
        if ("verse" in changes) {
            next.verse = typeof changes.verse === "string" ? changes.verse : "";
        }
        if ("prompt" in changes) {
            next.prompt = typeof changes.prompt === "string" ? changes.prompt : "";
        }
        const rewritten =
            next.title !== entry.title ||
            next.body !== entry.body ||
            JSON.stringify(next.fields ?? {}) !== JSON.stringify(entry.fields ?? {});
        if (rewritten && !fromSource && newVersion) {
            next.versions = [...entry.versions, { title: entry.title, body: entry.body, fields: entry.fields ?? {}, updated: entry.updated }].slice(
                -MAX_VERSIONS,
            );
        }
        if (!fromSource) {
            next.edited = true;
        }
        next.updated = new Date().toISOString();
        entries.put(next);
        updated = next;
    });
    announce("update", id);
    return updated;
}

/**
 * Takes an entry out. One the app wrote from a source is not written again,
 * unless the app itself takes it out ({ remember: false }).
 */
export async function deleteEntry(id, { remember = true } = {}) {
    await inTransaction(["entries", "meta"], "readwrite", async ({ entries, meta }) => {
        const entry = await done(entries.get(id));
        if (!entry) {
            return;
        }
        if (entry.sourceKey && remember) {
            const removed = (await done(meta.get(REMOVED_SOURCES))) ?? [];
            if (!removed.includes(entry.sourceKey)) {
                meta.put([...removed, entry.sourceKey], REMOVED_SOURCES);
            }
        }
        entries.delete(id);
    });
    announce("delete", id);
}

/** Whether the reader took out the entry written from this source. */
export async function wasRemoved(sourceKey) {
    const removed = await getMeta(REMOVED_SOURCES, []);
    return removed.includes(sourceKey);
}

const newestFirst = (a, b) => b.day.localeCompare(a.day) || b.created.localeCompare(a.created);

/** The year's entries, newest day first. */
export async function entriesForYear(year) {
    const list = await inTransaction(["entries"], "readonly", ({ entries }) =>
        done(entries.index("year").getAll(Number(year))),
    );
    return list.sort(newestFirst);
}

export async function entriesForDay(day) {
    const list = await inTransaction(["entries"], "readonly", ({ entries }) =>
        done(entries.index("day").getAll(day)),
    );
    return list.sort(newestFirst);
}

/** Every year the journal has, oldest first. */
export async function volumes() {
    return inTransaction(["volumes"], "readonly", ({ volumes }) => done(volumes.getAll()));
}

/** Every entry of every year, newest day first. */
export async function allEntries() {
    const list = await inTransaction(["entries"], "readonly", ({ entries }) => done(entries.getAll()));
    return list.sort(newestFirst);
}

/**
 * Closes every year before this one (Manila) that is still open: its entries
 * can be read but not changed from then on. Each prayer of that year still
 * waiting for an answer is carried into this year as a new Prayer List entry
 * for today, noting where it came from (`carriedFrom`), so no open prayer is
 * left behind in a closed book. Bookmarks and stickers live outside the
 * journal and carry on by themselves. Resolves to the years closed, with how
 * many prayers each carried: [{ year, carried }].
 */
export async function closePastYears() {
    const today = todayIso();
    const thisYear = Number(today.slice(0, 4));
    const now = new Date().toISOString();
    const closed = [];
    await inTransaction(["entries", "volumes"], "readwrite", async ({ entries, volumes }) => {
        const open = (await done(volumes.getAll())).filter((volume) => volume.year < thisYear && !volume.closed);
        if (!open.length) {
            return;
        }
        if (!(await done(volumes.get(thisYear)))) {
            volumes.put({ year: thisYear, opened: now, closed: null });
        }
        for (const volume of open) {
            const yearEntries = await done(entries.index("year").getAll(volume.year));
            const waiting = yearEntries.filter((entry) => entry.kind === "prayer" && !entry.prayer?.answered);
            for (const prayer of waiting) {
                const carried = {
                    ...prayer,
                    id: newId(),
                    year: thisYear,
                    day: today,
                    flag: prayer.flag,
                    edited: false,
                    carriedFrom: { id: prayer.id, year: volume.year, day: prayer.day },
                    created: now,
                    updated: now,
                    versions: [],
                    original: { title: prayer.title, body: prayer.body, created: now },
                };
                delete carried.source;
                delete carried.sourceKey;
                entries.add(carried);
            }
            volumes.put({ ...volume, closed: now });
            closed.push({ year: volume.year, carried: waiting.length });
        }
    });
    if (closed.length) {
        announce("close", null);
    }
    return closed;
}

/* ---------- Meta ---------- */

export async function getMeta(key, fallback = null) {
    const value = await inTransaction(["meta"], "readonly", ({ meta }) => done(meta.get(key)));
    return value ?? fallback;
}

export async function setMeta(key, value) {
    await inTransaction(["meta"], "readwrite", ({ meta }) => {
        meta.put(value, key);
    });
}

/**
 * Asks the browser to keep the journal even when the device runs short of
 * space. Asked once; the answer is kept in meta as { asked, granted }.
 * Browsers may say no (Safari often does outside a Home Screen app), which is
 * why backups matter.
 */
export async function requestPersistence() {
    const known = await getMeta("persistence");
    if (known?.granted) {
        return true;
    }
    let granted = false;
    try {
        granted = (await navigator.storage?.persisted?.()) || (await navigator.storage?.persist?.()) || false;
    } catch {
        granted = false;
    }
    await setMeta("persistence", { asked: new Date().toISOString(), granted });
    return granted;
}

/* ---------- Backups ---------- */

/** Everything in the journal, as plain data. */
export async function dumpJournal() {
    return inTransaction(["entries", "volumes", "meta"], "readonly", async ({ entries, volumes, meta }) => {
        const [entryList, volumeList, keys, values] = await Promise.all([
            done(entries.getAll()),
            done(volumes.getAll()),
            done(meta.getAllKeys()),
            done(meta.getAll()),
        ]);
        return {
            entries: entryList,
            volumes: volumeList,
            meta: Object.fromEntries(keys.map((key, i) => [key, values[i]])),
        };
    });
}

/**
 * Puts a dump back. "replace" empties the journal first. "merge" keeps what
 * is here and adds what is not: an entry in both is kept in whichever was
 * changed last, and the lists of removed entries are joined.
 */
export async function loadJournal(dump, { mode = "replace" } = {}) {
    const entryList = Array.isArray(dump?.entries) ? dump.entries.filter((e) => e && typeof e.id === "string") : [];
    const volumeList = Array.isArray(dump?.volumes) ? dump.volumes.filter((v) => v && Number.isInteger(v.year)) : [];
    const metaMap = dump?.meta && typeof dump.meta === "object" ? dump.meta : {};

    await inTransaction(["entries", "volumes", "meta"], "readwrite", async ({ entries, volumes, meta }) => {
        if (mode === "replace") {
            entries.clear();
            volumes.clear();
            meta.clear();
            entryList.forEach((entry) => entries.put(entry));
            volumeList.forEach((volume) => volumes.put(volume));
            Object.entries(metaMap).forEach(([key, value]) => meta.put(value, key));
            return;
        }
        for (const entry of entryList) {
            const here = await done(entries.get(entry.id));
            if (!here || String(entry.updated) > String(here.updated)) {
                // A different entry here may already hold the same source.
                if (!here && entry.sourceKey) {
                    const twin = await done(entries.index("sourceKey").get(entry.sourceKey));
                    if (twin) {
                        continue;
                    }
                }
                entries.put(entry);
            }
        }
        for (const volume of volumeList) {
            const here = await done(volumes.get(volume.year));
            if (!here) {
                volumes.put(volume);
            }
        }
        for (const [key, value] of Object.entries(metaMap)) {
            const here = await done(meta.get(key));
            if (key === REMOVED_SOURCES && Array.isArray(here) && Array.isArray(value)) {
                meta.put([...new Set([...here, ...value])], key);
            } else if (here === undefined) {
                meta.put(value, key);
            }
        }
    });
    announce("restore", null);
}
