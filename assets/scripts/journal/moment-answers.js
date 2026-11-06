/**
 * The Daily Grace Moment's answers in My Faith Journal.
 *
 * The Moment keeps its answers in localStorage (dailygrace:moment:answers),
 * only the last 60 days of them. Each answer is also written into the
 * journal as that day's Daily Log entry, where it is kept for good:
 *
 *   captureMomentAnswer(day, text, { verse, question })
 *       called by <daily-moment> whenever an answer is saved. The first
 *       answer of a day writes its entry; a changed answer rewrites it,
 *       until the reader changes the entry in the journal (from then on the
 *       journal's words are theirs and stay); an emptied answer takes out an
 *       entry the reader never changed.
 *   importMomentAnswers()
 *       writes an entry for every answer kept in localStorage that the
 *       journal does not have yet (answers from before the journal existed).
 *       It never changes an entry that is already there.
 *
 * An entry the reader took out of the journal is never written again.
 * Each entry's sourceKey is "moment:<YYYY-MM-DD>".
 */

import {
    addEntry,
    deleteEntry,
    entryBySource,
    requestPersistence,
    textToBody,
    updateEntry,
    wasRemoved,
} from "./store.js?v=20261106-1";

const ANSWERS_KEY = "dailygrace:moment:answers";
const SOURCE = "moment";

const sourceKey = (day) => `${SOURCE}:${day}`;

// The Moment saves on every keystroke. Writes for one day go one at a time,
// and only the latest answer waiting is written, so a quick typist never
// leaves an older answer in the journal.
const waiting = new Map();
const writing = new Map();

/** Resolves with the day's entry (or null) once every answer given so far is written. */
export function captureMomentAnswer(day, text, options = {}) {
    const key = sourceKey(day);
    waiting.set(key, { text, options });
    if (!writing.has(key)) {
        writing.set(key, writeWaiting(day, key));
    }
    return writing.get(key);
}

async function writeWaiting(day, key) {
    let entry = null;
    try {
        while (waiting.has(key)) {
            const { text, options } = waiting.get(key);
            waiting.delete(key);
            entry = await writeAnswer(day, key, text, options);
        }
    } finally {
        // In the same step as the last look at `waiting`: an answer given
        // from now on starts a new run rather than joining this finished one.
        writing.delete(key);
    }
    return entry;
}

async function writeAnswer(day, key, text, { verse = "", question = "" } = {}) {
    const written = String(text ?? "").trim();
    const entry = await entryBySource(key);

    if (!written) {
        // Emptied in the Moment, not taken out by the reader: an answer
        // written again later comes back.
        if (entry && !entry.edited) {
            await deleteEntry(entry.id, { remember: false });
        }
        return null;
    }
    if (entry) {
        if (entry.edited) {
            return entry;
        }
        return updateEntry(entry.id, { body: textToBody(written), verse, prompt: question }, { fromSource: true });
    }
    if (await wasRemoved(key)) {
        return null;
    }
    const added = await addEntry({
        day,
        kind: "log",
        body: textToBody(written),
        verse,
        prompt: question,
        source: SOURCE,
        sourceKey: key,
    });
    // The reader has started writing: ask the browser to keep it. Never
    // waited on, since a browser may ask the reader first.
    requestPersistence().catch(() => {});
    return added;
}

/** Brings in the answers kept before the journal; returns how many were added. */
export async function importMomentAnswers() {
    let answers = {};
    try {
        answers = JSON.parse(localStorage.getItem(ANSWERS_KEY)) ?? {};
    } catch {
        return 0;
    }
    let added = 0;
    for (const [day, text] of Object.entries(answers)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || typeof text !== "string" || !text.trim()) {
            continue;
        }
        const key = sourceKey(day);
        if ((await entryBySource(key)) || (await wasRemoved(key))) {
            continue;
        }
        await addEntry({ day, kind: "log", body: textToBody(text), source: SOURCE, sourceKey: key });
        added += 1;
    }
    return added;
}
