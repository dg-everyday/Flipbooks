/**
 * My Faith Journal backups: one file holding everything Daily Grace keeps on
 * this device, locked with a password the reader chooses.
 *
 * What goes in: every localStorage key that starts with "dailygrace" (the
 * bookmarks and their notes, stickers, Moments, memory verses, the avatar,
 * Kids progress, …) and the whole journal database (store.js).
 *
 * The file (.dgjournal) is JSON:
 *   { format: "dailygrace-journal-backup", version: 1, created,
 *     kdf: { name: "PBKDF2", hash: "SHA-256", iterations, salt },
 *     cipher: { name: "AES-GCM", iv }, compression: "gzip" | "none",
 *     data }
 * `data` is the payload, gzipped when the browser can, then encrypted with
 * AES-GCM under a key made from the password (PBKDF2), all in the browser.
 * Salt, iv and data are base64. Only `created` can be read without the
 * password. A forgotten password cannot be recovered, by anyone.
 *
 * The payload:
 *   { format, version, created, storage: { <key>: <raw string> },
 *     journal: { entries, volumes, meta } }
 *
 * Exports      makeBackup(password)            { blob, fileName, summary }
 *              openBackup(file, password)      the payload, with its summary
 *              restoreBackup(payload, { mode })  puts it back on this device
 *              summarize(payload)              { created, entries, years, bookmarks, stickers }
 *              BackupError                     .code: "short-password",
 *                                              "not-a-backup", "newer-version",
 *                                              "wrong-password", "damaged"
 */

import { dumpJournal, loadJournal } from "./store.js?v=20261106-3";

export const BACKUP_FORMAT = "dailygrace-journal-backup";
export const BACKUP_VERSION = 1;
export const MIN_PASSWORD = 6;
const ITERATIONS = 600_000;
const STORAGE_PREFIX = "dailygrace";
const BOOKMARK_KEYS = [
    "dailygrace:bookmarks",
    "dailygrace:bookmarks:facts",
    "dailygrace:bookmarks:sayings",
    "dailygrace:bookmarks:guidance",
    "dailygrace:bookmarks:blueprint",
    "dailygrace:bookmarks:red-letter",
];
const NOTES_KEY = "dailygrace:bookmarks:notes";
const STICKERS_KEY = "dailygrace:stickers";

export class BackupError extends Error {
    constructor(code, message) {
        super(message);
        this.name = "BackupError";
        this.code = code;
    }
}

/* ---------- Bytes ---------- */

function toBase64(bytes) {
    let text = "";
    // In slices, since one call with a large array overflows the stack.
    for (let i = 0; i < bytes.length; i += 0x8000) {
        text += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(text);
}

function fromBase64(text) {
    const raw = atob(text);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) {
        bytes[i] = raw.charCodeAt(i);
    }
    return bytes;
}

async function streamThrough(bytes, transform) {
    const stream = new Blob([bytes]).stream().pipeThrough(transform);
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function passwordKey(password, salt, iterations) {
    const base = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(String(password).normalize("NFC")),
        "PBKDF2",
        false,
        ["deriveKey"],
    );
    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
        base,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
    );
}

/* ---------- What is kept ---------- */

function readStorage() {
    const storage = {};
    try {
        for (let i = 0; i < localStorage.length; i += 1) {
            const key = localStorage.key(i);
            if (key?.startsWith(STORAGE_PREFIX)) {
                storage[key] = localStorage.getItem(key);
            }
        }
    } catch {
        // Storage blocked: the backup still holds the journal.
    }
    return storage;
}

function countList(raw) {
    try {
        const value = JSON.parse(raw);
        if (Array.isArray(value)) {
            return value.length;
        }
        if (value && typeof value === "object") {
            return Object.keys(value).length;
        }
    } catch {
        // Unreadable: counted as none.
    }
    return 0;
}

/** What a payload holds, for the reader to check before restoring. */
export function summarize(payload) {
    const entries = payload.journal?.entries ?? [];
    const storage = payload.storage ?? {};
    let stickers = 0;
    try {
        const kept = JSON.parse(storage[STICKERS_KEY] ?? "null");
        stickers = kept?.earned ? Object.keys(kept.earned).length : countList(storage[STICKERS_KEY]);
    } catch {
        stickers = 0;
    }
    return {
        created: payload.created,
        entries: entries.length,
        years: [...new Set(entries.map((entry) => entry.year))].sort(),
        bookmarks: BOOKMARK_KEYS.reduce((sum, key) => sum + countList(storage[key]), 0),
        stickers,
    };
}

/* ---------- Making a backup ---------- */

function fileStamp(date) {
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(date);
    return day;
}

export async function makeBackup(password) {
    if (typeof password !== "string" || password.length < MIN_PASSWORD) {
        throw new BackupError("short-password", `The password needs at least ${MIN_PASSWORD} characters.`);
    }
    const now = new Date();
    const payload = {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        created: now.toISOString(),
        storage: readStorage(),
        journal: await dumpJournal(),
    };
    let data = new TextEncoder().encode(JSON.stringify(payload));
    let compression = "none";
    if ("CompressionStream" in globalThis) {
        data = await streamThrough(data, new CompressionStream("gzip"));
        compression = "gzip";
    }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await passwordKey(password, salt, ITERATIONS);
    const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data));
    const file = {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        created: payload.created,
        kdf: { name: "PBKDF2", hash: "SHA-256", iterations: ITERATIONS, salt: toBase64(salt) },
        cipher: { name: "AES-GCM", iv: toBase64(iv) },
        compression,
        data: toBase64(sealed),
    };
    return {
        blob: new Blob([JSON.stringify(file)], { type: "application/json" }),
        fileName: `My Faith Journal backup ${fileStamp(now)}.dgjournal`,
        summary: summarize(payload),
    };
}

/* ---------- Opening one ---------- */

/** Reads and unlocks a backup file (a File, Blob or its text). */
export async function openBackup(file, password) {
    let outer;
    try {
        outer = JSON.parse(typeof file === "string" ? file : await file.text());
    } catch {
        throw new BackupError("not-a-backup", "This file is not a My Faith Journal backup.");
    }
    if (outer?.format !== BACKUP_FORMAT || !outer.kdf || !outer.cipher || typeof outer.data !== "string") {
        throw new BackupError("not-a-backup", "This file is not a My Faith Journal backup.");
    }
    if (outer.version > BACKUP_VERSION) {
        throw new BackupError("newer-version", "This backup was made by a newer Daily Grace. Reload the page and try again.");
    }
    let data;
    try {
        const key = await passwordKey(password ?? "", fromBase64(outer.kdf.salt), outer.kdf.iterations);
        data = new Uint8Array(
            await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(outer.cipher.iv) }, key, fromBase64(outer.data)),
        );
    } catch {
        // AES-GCM cannot tell a wrong password from a changed file.
        throw new BackupError("wrong-password", "That password does not open this backup.");
    }
    try {
        if (outer.compression === "gzip") {
            data = await streamThrough(data, new DecompressionStream("gzip"));
        }
        const payload = JSON.parse(new TextDecoder().decode(data));
        if (payload?.format !== BACKUP_FORMAT || typeof payload.storage !== "object" || typeof payload.journal !== "object") {
            throw new Error("Unexpected payload");
        }
        return { ...payload, summary: summarize(payload) };
    } catch {
        throw new BackupError("damaged", "This backup is damaged and cannot be restored.");
    }
}

/* ---------- Restoring ---------- */

function parseOr(raw, fallback) {
    try {
        return JSON.parse(raw) ?? fallback;
    } catch {
        return fallback;
    }
}

/** One bookmark list: this device's, newest first, then the backup's others. */
function joinBookmarks(here, there) {
    const mine = parseOr(here, []);
    const theirs = parseOr(there, []);
    const list = Array.isArray(mine) ? [...mine] : [];
    for (const id of Array.isArray(theirs) ? theirs : []) {
        if (!list.includes(id)) {
            list.push(id);
        }
    }
    return JSON.stringify(list);
}

/** The notes on bookmarks: every note from both, the later one where both have it. */
function joinNotes(here, there) {
    const mine = parseOr(here, {});
    const theirs = parseOr(there, {});
    const joined = { ...mine };
    for (const [list, notes] of Object.entries(theirs ?? {})) {
        const kept = { ...joined[list] };
        for (const [id, note] of Object.entries(notes ?? {})) {
            if (!kept[id] || String(note?.updated) > String(kept[id]?.updated)) {
                kept[id] = note;
            }
        }
        joined[list] = kept;
    }
    return JSON.stringify(joined);
}

/**
 * Puts an opened backup back on this device.
 *   "replace"  this device's Daily Grace keys and journal become the backup's
 *   "merge"    what is here stays; keys this device lacks are filled in, and
 *              journal entries are joined (see loadJournal in store.js)
 * Bookmarks and their notes are never taken away, in either mode: the
 * device's and the backup's are always joined.
 * The page should reload afterwards, so every part reads the restored data.
 */
export async function restoreBackup(payload, { mode = "replace" } = {}) {
    const storage = Object.entries(payload.storage ?? {}).filter(
        ([key, value]) => key.startsWith(STORAGE_PREFIX) && typeof value === "string",
    );
    await loadJournal(payload.journal, { mode });
    try {
        if (mode === "replace") {
            Object.keys(readStorage())
                .filter((key) => !BOOKMARK_KEYS.includes(key) && key !== NOTES_KEY)
                .forEach((key) => localStorage.removeItem(key));
        }
        for (const [key, value] of storage) {
            const here = localStorage.getItem(key);
            if (BOOKMARK_KEYS.includes(key)) {
                localStorage.setItem(key, joinBookmarks(here, value));
            } else if (key === NOTES_KEY) {
                localStorage.setItem(key, joinNotes(here, value));
            } else if (mode === "replace" || here === null) {
                localStorage.setItem(key, value);
            }
        }
    } catch {
        throw new BackupError("damaged", "The journal was restored, but this browser would not take back the bookmarks and stickers.");
    }
}
