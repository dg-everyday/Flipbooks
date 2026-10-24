/**
 * Daily Grace Kids: what is kept on this device, and nothing else. No child's
 * name or progress ever leaves it.
 *
 * localStorage keys:
 *   dailygrace:kids:profiles          { children: [{ id, name, band, avatar, created }], current }
 *   dailygrace:kids:settings          { timeLimit, narration, sound, readTogether, bigText,
 *                                       readingFont, lessMotion, mapInOrder }
 *   dailygrace:kids:<child>:progress  { stops: { <story>: { steps: { watch, find, play, verse, talk },
 *                                       talkLater, finishedOn, times } }, firsts: { … },
 *                                       pairsWins, lastStory, lastTalk }
 *   dailygrace:kids:<child>:stickers  { earned: { <id>: { path, day, seen } } }
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
export const BANDS = ["lambs", "lions"];
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
export function addChild({ name, band, avatar }) {
    const p = profiles();
    if (p.children.length >= MAX_CHILDREN) {
        throw new Error("full");
    }
    const child = cleanChild({ id: newId(), name, band, avatar, created: today() });
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
