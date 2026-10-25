/**
 * Daily Grace Kids: what is kept on this device, and nothing else. No child's
 * name or progress ever leaves it.
 *
 * localStorage keys:
 *   dailygrace:kids:profiles          { children: [{ id, name, band, avatar, created, readAloud }], current }
 *   dailygrace:kids:settings          { timeLimit, narration, sound, readTogether, bigText,
 *                                       readingFont, lessMotion, mapInOrder, harderStories }
 *   dailygrace:kids:<child>:progress  { stops: { <story>: { steps: { watch, find, play, verse, talk },
 *                                       talkLater, finishedOn, times } }, firsts: { … },
 *                                       pairsWins, lastStory, lastTalk }
 *   dailygrace:kids:<child>:stickers  { earned: { <id>: { path, day, seen } } }
 *   dailygrace:kids:<child>:explorer  Explorers (ages 9 to 12): { stops: { <story>: { steps, talkLater,
 *                                       finishedOn, times, days: { <step>: day }, verse: { level, learned } } },
 *                                       cards: { <card>: { day, seen } }, quest: { <card>: true },
 *                                       trainWins, lastThink: { story, question, day } }
 *   dailygrace:kids:<child>:journal   { answers: { <story>: { text, shared, day } } }, private by default
 *   dailygrace:kids:usage             { day, minutes, extra }
 *
 * Everything read back is checked and cleaned, so a value damaged by hand, by
 * an old version or by a full disk can't break the page: anything unusable is
 * replaced by its default. When storage is blocked or full (a private window,
 * a quota), the store keeps working in memory for this visit and says so
 * (`persistent` turns false, and a "storagechange" event fires on `events`).
 *
 * Steps only ever turn on: progress never goes backwards.
 */

const PREFIX = "dailygrace:kids:";
export const MAX_CHILDREN = 4;
export const MAX_NAME = 20;
export const BANDS = ["lambs", "lions", "explorers"];
export const MAX_JOURNAL = 600;
export const TIME_LIMITS = [0, 15, 30, 45];
export const DEFAULT_SETTINGS = Object.freeze({
    timeLimit: 0,
    narration: true,
    sound: true,
    readTogether: false,
    bigText: false,
    readingFont: false,
    lessMotion: false,
    mapInOrder: false,
    // Explorers: the two heaviest side trails show only when a grown-up turns this on.
    harderStories: false,
});
const STEP_KEYS = ["watch", "find", "play", "verse", "talk"];
const FIRST_KEYS = ["watch", "find", "play", "verse", "talk", "map"];

export const events = new EventTarget();
const memory = new Map();
let persistent = true;

export function isPersistent() {
    return persistent;
}

function lost(error) {
    if (persistent) {
        persistent = false;
        console.warn("Daily Grace Kids: progress can't be saved on this device right now.", error);
        events.dispatchEvent(new CustomEvent("storagechange", { detail: { persistent: false } }));
    }
}

function read(key) {
    if (memory.has(key)) {
        return memory.get(key);
    }
    let value = null;
    try {
        const raw = localStorage.getItem(PREFIX + key);
        value = raw === null ? null : JSON.parse(raw);
    } catch (error) {
        // Blocked storage throws on access; a damaged value throws on parse.
        if (error instanceof SyntaxError) {
            value = null;
        } else {
            lost(error);
        }
    }
    memory.set(key, value);
    return value;
}

function write(key, value) {
    memory.set(key, value);
    try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (error) {
        lost(error);
    }
}

function remove(key) {
    memory.delete(key);
    try {
        localStorage.removeItem(PREFIX + key);
    } catch (error) {
        lost(error);
    }
}

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const todayKey = today;

/** A name as it may be kept: trimmed, single-spaced, at most MAX_NAME characters. */
export function cleanName(name) {
    // Tabs and line breaks become spaces; other control characters go.
    const text = String(name ?? "").replace(/\s+/g, " ").replace(/[\u0000-\u001f\u007f]/g, "").trim();
    return Array.from(text).slice(0, MAX_NAME).join("");
}

function cleanChild(child) {
    if (!isObject(child) || typeof child.id !== "string" || !/^[a-z0-9-]{4,40}$/.test(child.id)) {
        return null;
    }
    const name = cleanName(child.name);
    if (!name) {
        return null;
    }
    return {
        id: child.id,
        name,
        band: BANDS.includes(child.band) ? child.band : "lambs",
        avatar: typeof child.avatar === "string" && /^KA-\d{2}$/.test(child.avatar) ? child.avatar : "KA-00",
        created: typeof child.created === "string" ? child.created : today(),
        // Explorers read for themselves: Nari and the verses are read aloud on
        // their own only when this is on (a tap always plays them).
        readAloud: child.readAloud === true,
    };
}

// ------------------------------------------------------------------ profiles
export function profiles() {
    const raw = read("profiles");
    const children = [];
    const seen = new Set();
    for (const c of Array.isArray(raw?.children) ? raw.children : []) {
        const child = cleanChild(c);
        if (child && !seen.has(child.id) && children.length < MAX_CHILDREN) {
            seen.add(child.id);
            children.push(child);
        }
    }
    const current = children.some((c) => c.id === raw?.current) ? raw.current : null;
    return { children, current };
}

function saveProfiles(p) {
    write("profiles", { children: p.children, current: p.current });
    events.dispatchEvent(new CustomEvent("profileschange"));
}

function newId() {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    return "c" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Adds a child; resolves to the child, or throws when four are already here or the name is empty. */
export function addChild({ name, band, avatar, readAloud }) {
    const p = profiles();
    if (p.children.length >= MAX_CHILDREN) {
        throw new Error("full");
    }
    const child = cleanChild({ id: newId(), name, band, avatar, readAloud, created: today() });
    if (!child) {
        throw new Error("name");
    }
    p.children.push(child);
    saveProfiles(p);
    return child;
}

export function updateChild(id, changes) {
    const p = profiles();
    const index = p.children.findIndex((c) => c.id === id);
    if (index < 0) {
        return null;
    }
    const child = cleanChild({ ...p.children[index], ...changes, id });
    if (!child) {
        throw new Error("name");
    }
    p.children[index] = child;
    saveProfiles(p);
    return child;
}

/** Removes a child and everything kept for them. */
export function removeChild(id) {
    const p = profiles();
    p.children = p.children.filter((c) => c.id !== id);
    if (p.current === id) {
        p.current = null;
    }
    saveProfiles(p);
    remove(`${id}:progress`);
    remove(`${id}:stickers`);
    remove(`${id}:explorer`);
    remove(`${id}:journal`);
}

export function setCurrent(id) {
    const p = profiles();
    p.current = p.children.some((c) => c.id === id) ? id : null;
    saveProfiles(p);
}

export function currentChild() {
    const p = profiles();
    return p.children.find((c) => c.id === p.current) ?? null;
}

// ------------------------------------------------------------------ settings
export function settings() {
    const raw = read("settings");
    const s = { ...DEFAULT_SETTINGS };
    if (isObject(raw)) {
        for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
            if (key === "timeLimit") {
                s.timeLimit = TIME_LIMITS.includes(raw.timeLimit) ? raw.timeLimit : value;
            } else if (typeof raw[key] === "boolean") {
                s[key] = raw[key];
            }
        }
    }
    return s;
}

export function updateSettings(changes) {
    const s = { ...settings(), ...changes };
    write("settings", s);
    const clean = settings();
    events.dispatchEvent(new CustomEvent("settingschange", { detail: clean }));
    return clean;
}

// ------------------------------------------------------------------ progress
function cleanStop(stop) {
    const steps = {};
    for (const key of STEP_KEYS) {
        steps[key] = stop?.steps?.[key] === true;
    }
    return {
        steps,
        talkLater: stop?.talkLater === true,
        finishedOn: typeof stop?.finishedOn === "string" ? stop.finishedOn : null,
        times: Math.max(0, Math.floor(Number(stop?.times) || 0)),
    };
}

export function progress(childId) {
    const raw = read(`${childId}:progress`);
    const stops = {};
    if (isObject(raw?.stops)) {
        for (const [id, stop] of Object.entries(raw.stops)) {
            if (/^[a-z0-9-]{1,60}$/.test(id) && isObject(stop)) {
                stops[id] = cleanStop(stop);
            }
        }
    }
    const firsts = {};
    for (const key of FIRST_KEYS) {
        if (raw?.firsts?.[key] === true) {
            firsts[key] = true;
        }
    }
    return {
        stops,
        firsts,
        pairsWins: Math.max(0, Math.floor(Number(raw?.pairsWins) || 0)),
        lastStory: typeof raw?.lastStory === "string" ? raw.lastStory : null,
        lastTalk: isObject(raw?.lastTalk) && typeof raw.lastTalk.story === "string" ? raw.lastTalk : null,
    };
}

function saveProgress(childId, p) {
    write(`${childId}:progress`, p);
    events.dispatchEvent(new CustomEvent("progresschange", { detail: { child: childId } }));
}

/**
 * Marks a step of a story done (steps never turn off). Returns the updated
 * progress and whether the step was new, so the caller rewards it once.
 */
export function completeStep(childId, storyId, step, extra = {}) {
    if (!STEP_KEYS.includes(step)) {
        throw new Error(`unknown step ${step}`);
    }
    const p = progress(childId);
    const stop = p.stops[storyId] ?? cleanStop(null);
    // "Later" on Talk Together: the step was reached, so the story can finish,
    // but nobody talked, so it earns no flower.
    const later = step === "talk" && extra.later === true;
    let wasNew = false;
    if (later) {
        stop.talkLater = true;
    } else {
        wasNew = !stop.steps[step];
        stop.steps[step] = true;
        p.firsts[step] = true;
    }
    p.stops[storyId] = stop;
    p.lastStory = storyId;
    if (step === "talk" && !later && extra.question) {
        p.lastTalk = { story: storyId, question: String(extra.question).slice(0, 300), day: today() };
    }
    saveProgress(childId, p);
    return { progress: p, wasNew };
}

/** Records that a story was finished (again): its date and how many times. */
export function finishStory(childId, storyId) {
    const p = progress(childId);
    const stop = p.stops[storyId] ?? cleanStop(null);
    const first = !stop.finishedOn;
    stop.finishedOn = stop.finishedOn ?? today();
    stop.times += 1;
    p.stops[storyId] = stop;
    saveProgress(childId, p);
    return { progress: p, first };
}

export function setFirst(childId, key) {
    const p = progress(childId);
    if (FIRST_KEYS.includes(key) && !p.firsts[key]) {
        p.firsts[key] = true;
        saveProgress(childId, p);
    }
    return p;
}

export function addPairsWin(childId) {
    const p = progress(childId);
    p.pairsWins += 1;
    saveProgress(childId, p);
    return p;
}

// ------------------------------------------------------------------ stickers
export function stickers(childId) {
    const raw = read(`${childId}:stickers`);
    const earned = {};
    if (isObject(raw?.earned)) {
        for (const [id, e] of Object.entries(raw.earned)) {
            if (/^[A-Z]{2}-\d{2}$/.test(id) && isObject(e) && typeof e.path === "string") {
                earned[id] = { path: e.path, day: typeof e.day === "string" ? e.day : today(), seen: e.seen === true };
            }
        }
    }
    return { earned };
}

export function giveStickers(childId, due) {
    if (!due.length) {
        return [];
    }
    const s = stickers(childId);
    const given = [];
    for (const { id, path } of due) {
        if (!s.earned[id]) {
            s.earned[id] = { path, day: today(), seen: false };
            given.push(id);
        }
    }
    write(`${childId}:stickers`, s);
    return given;
}

export function markStickersSeen(childId) {
    const s = stickers(childId);
    let changed = false;
    for (const e of Object.values(s.earned)) {
        if (!e.seen) {
            e.seen = true;
            changed = true;
        }
    }
    if (changed) {
        write(`${childId}:stickers`, s);
    }
}

// ------------------------------------------------------------------ explorers
const VERSE_LEVELS = 7;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[a-z0-9-]{1,60}$/;

function cleanExplorerStop(stop) {
    const days = {};
    for (const key of STEP_KEYS) {
        if (typeof stop?.days?.[key] === "string" && DAY.test(stop.days[key])) {
            days[key] = stop.days[key];
        }
    }
    const level = Math.floor(Number(stop?.verse?.level) || 0);
    return {
        ...cleanStop(stop),
        days,
        verse: { level: Math.max(0, Math.min(VERSE_LEVELS - 1, level)), learned: stop?.verse?.learned === true },
    };
}

/** A child's Explorer record (ages 9 to 12), checked and cleaned. */
export function explorer(childId) {
    const raw = read(`${childId}:explorer`);
    const stops = {};
    if (isObject(raw?.stops)) {
        for (const [id, stop] of Object.entries(raw.stops)) {
            if (ID.test(id) && isObject(stop)) {
                stops[id] = cleanExplorerStop(stop);
            }
        }
    }
    const cards = {};
    if (isObject(raw?.cards)) {
        for (const [id, card] of Object.entries(raw.cards)) {
            if (ID.test(id) && isObject(card)) {
                cards[id] = { day: typeof card.day === "string" && DAY.test(card.day) ? card.day : today(), seen: card.seen === true };
            }
        }
    }
    const quest = {};
    if (isObject(raw?.quest)) {
        for (const [id, done] of Object.entries(raw.quest)) {
            if (ID.test(id) && done === true) {
                quest[id] = true;
            }
        }
    }
    const think = raw?.lastThink;
    return {
        stops,
        cards,
        quest,
        trainWins: Math.max(0, Math.floor(Number(raw?.trainWins) || 0)),
        lastThink: isObject(think) && typeof think.story === "string" && typeof think.question === "string"
            ? { story: think.story, question: think.question.slice(0, 300), day: typeof think.day === "string" ? think.day : today() }
            : null,
    };
}

function saveExplorer(childId, record) {
    write(`${childId}:explorer`, record);
    events.dispatchEvent(new CustomEvent("progresschange", { detail: { child: childId } }));
}

/**
 * Marks a step of an Explorer story done (steps never turn off), noting the
 * day. The first time a step is done counts as a "first" for the stickers, as
 * for the younger children. Returns the record and whether the step was new.
 */
export function completeExplorerStep(childId, storyId, step, extra = {}) {
    if (!STEP_KEYS.includes(step)) {
        throw new Error(`unknown step ${step}`);
    }
    const record = explorer(childId);
    const stop = record.stops[storyId] ?? cleanExplorerStop(null);
    // "Later" on Think & Talk: the step was reached, so the story can finish,
    // but nobody talked, so it counts no talk.
    const later = step === "talk" && extra.later === true;
    let wasNew = false;
    if (later) {
        stop.talkLater = true;
    } else {
        wasNew = !stop.steps[step];
        stop.steps[step] = true;
        stop.days[step] = stop.days[step] ?? today();
    }
    record.stops[storyId] = stop;
    if (step === "talk" && !later && extra.question) {
        record.lastThink = { story: storyId, question: String(extra.question).slice(0, 300), day: today() };
    }
    saveExplorer(childId, record);
    if (!later) {
        setFirst(childId, step);
    }
    return { record, wasNew };
}

/** Records that an Explorer story was finished (again): its date and how many times. */
export function finishExplorerStory(childId, storyId) {
    const record = explorer(childId);
    const stop = record.stops[storyId] ?? cleanExplorerStop(null);
    const first = !stop.finishedOn;
    stop.finishedOn = stop.finishedOn ?? today();
    stop.times += 1;
    record.stops[storyId] = stop;
    saveExplorer(childId, record);
    return { record, first };
}

/**
 * One verse practice done: the next one opens the next practice (seven in
 * all, the last one again once reached). `had` on the last ("I had it")
 * marks the verse learned. Returns the verse's state and whether it was just
 * learned.
 */
export function practiseVerse(childId, storyId, { had = false } = {}) {
    const record = explorer(childId);
    const stop = record.stops[storyId] ?? cleanExplorerStop(null);
    const verse = stop.verse;
    const wasLearned = verse.learned;
    if (verse.level === VERSE_LEVELS - 1) {
        verse.learned = verse.learned || had === true;
    } else {
        verse.level += 1;
    }
    record.stops[storyId] = stop;
    saveExplorer(childId, record);
    return { verse, learnedNow: verse.learned && !wasLearned };
}

/** Puts Field Guide cards in the child's guide; returns the ones that are new. */
export function unlockCards(childId, ids) {
    const record = explorer(childId);
    const added = [];
    for (const id of ids) {
        if (ID.test(id) && !record.cards[id]) {
            record.cards[id] = { day: today(), seen: false };
            added.push(id);
        }
    }
    if (added.length) {
        saveExplorer(childId, record);
    }
    return added;
}

export function markCardsSeen(childId) {
    const record = explorer(childId);
    let changed = false;
    for (const card of Object.values(record.cards)) {
        if (!card.seen) {
            card.seen = true;
            changed = true;
        }
    }
    if (changed) {
        saveExplorer(childId, record);
    }
}

/** A place pinned on the map in Map Quest. */
export function pinPlace(childId, cardId) {
    const record = explorer(childId);
    if (ID.test(cardId) && !record.quest[cardId]) {
        record.quest[cardId] = true;
        saveExplorer(childId, record);
    }
    return record;
}

export function addTrainWin(childId) {
    const record = explorer(childId);
    record.trainWins += 1;
    saveExplorer(childId, record);
    return record;
}

// ------------------------------------------------------------------ the journal
/**
 * A child's Field Journal: their own answers to Think & Talk, plain text,
 * private unless the child shares one with their grown-up. Never sent
 * anywhere, and removed with the child.
 */
export function journal(childId) {
    const raw = read(`${childId}:journal`);
    const answers = {};
    if (isObject(raw?.answers)) {
        for (const [id, answer] of Object.entries(raw.answers)) {
            if (ID.test(id) && isObject(answer) && typeof answer.text === "string") {
                const text = cleanJournalText(answer.text);
                if (text) {
                    answers[id] = { text, shared: answer.shared === true, day: typeof answer.day === "string" ? answer.day : today() };
                }
            }
        }
    }
    return { answers };
}

/** Journal text as it may be kept: line breaks but no other control characters, at most MAX_JOURNAL characters. */
export function cleanJournalText(text) {
    const clean = String(text ?? "")
        .replace(/\r\n?/g, "\n")
        .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    return Array.from(clean).slice(0, MAX_JOURNAL).join("");
}

/** Saves the child's answer for a story (empty text removes it). */
export function saveJournal(childId, storyId, text, shared) {
    const j = journal(childId);
    const clean = cleanJournalText(text);
    if (clean) {
        j.answers[storyId] = { text: clean, shared: shared === true, day: today() };
    } else {
        delete j.answers[storyId];
    }
    write(`${childId}:journal`, j);
    return j;
}

// ------------------------------------------------------------------ time used today
export function usage() {
    const raw = read("usage");
    const day = today();
    if (!isObject(raw) || raw.day !== day) {
        return { day, minutes: 0, extra: 0 };
    }
    return {
        day,
        minutes: Math.max(0, Number(raw.minutes) || 0),
        extra: Math.max(0, Math.min(240, Number(raw.extra) || 0)),
    };
}

export function addUsage(minutes) {
    const u = usage();
    u.minutes += Math.max(0, minutes);
    write("usage", u);
    return u;
}

export function addExtraTime(minutes) {
    const u = usage();
    u.extra = Math.min(240, u.extra + minutes);
    write("usage", u);
    return u;
}

/** Minutes left today, or Infinity with no limit. */
export function minutesLeft() {
    const limit = settings().timeLimit;
    if (!limit) {
        return Infinity;
    }
    const u = usage();
    return limit + u.extra - u.minutes;
}

/** Forgets what was read, so the next read sees changes another tab made. */
export function refresh() {
    memory.clear();
}
