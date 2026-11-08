/**
 * The Living Voice (worked on as "Bible Walk", the name its data and files
 * keep): the plans and episodes (assets/bible-walk/walk.json, built by
 * tools/bible-walk/build_bible_walk.py) and how far this reader has walked.
 * Shared by the page (apps/pages/scripts/living-voice.js) and its home card
 * (apps/components/living-voice-card.js), so both name the same next chapter.
 *
 * Progress is kept on this device only, in localStorage under PROGRESS_KEY:
 *   {
 *     pos:   { "<episode id>": seconds listened to, while not finished },
 *     done:  { "<episode id>": "YYYY-MM-DD" (Manila) the day it was finished },
 *     last:  the episode last played,
 *     speed: the playback speed chosen,
 *     auto:  whether the next chapter plays by itself when one ends (default on)
 *   }
 * Nothing is counted as a streak, and a missed day loses nothing: the walk
 * always picks up at the next chapter not heard yet.
 *
 * Exports  PROGRESS_KEY, loadWalk(), readProgress(), saveProgress(progress),
 *          todayIso(), nextStep(walk, progress), planCounts(plan, walk, progress),
 *          planOf(walk, id)
 */

export const PROGRESS_KEY = "dailygrace:bible-walk";

const WALK_URL = new URL("../../bible-walk/walk.json", import.meta.url);
const TIME_ZONE = "Asia/Manila";

let walkRequest = null;

/** The plans and episodes; fetched once per page. */
export function loadWalk() {
    if (!walkRequest) {
        walkRequest = fetch(WALK_URL).then((response) => {
            if (!response.ok) {
                throw new Error(`The Living Voice data: HTTP ${response.status}`);
            }
            return response.json();
        });
        walkRequest.catch(() => {
            // A failed fetch may be tried again later.
            walkRequest = null;
        });
    }
    return walkRequest;
}

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

/** This reader's progress; an empty one when there is none or storage is off. */
export function readProgress() {
    let saved = null;
    try {
        saved = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    } catch {
        // Storage is off, or the value is broken: start afresh.
    }
    const progress = isObject(saved) ? saved : {};
    return {
        pos: isObject(progress.pos) ? progress.pos : {},
        done: isObject(progress.done) ? progress.done : {},
        last: typeof progress.last === "string" ? progress.last : null,
        speed: typeof progress.speed === "number" ? progress.speed : 1,
        auto: typeof progress.auto === "boolean" ? progress.auto : true,
    };
}

export function saveProgress(progress) {
    try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
        // Storage is full or off: the walk still plays, it only forgets.
    }
}

/** Today in Manila, YYYY-MM-DD, like the rest of Daily Grace. */
export function todayIso() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}

/** The first plan that includes the episode, or null. */
export function planOf(walk, id) {
    return walk.plans.find((plan) => plan.episodes.some((episode) => episode.id === id)) ?? null;
}

/**
 * Where the walk goes next:
 *   { status: "resume", id, plan }    the episode last played, part-way through
 *   { status: "next", id, plan }      the next episode not heard yet
 *   { status: "waiting", label, plan } the next chapter is not recorded yet
 *   { status: "finished" }            every episode heard
 * The plan of the episode last played is looked at first.
 */
export function nextStep(walk, progress) {
    const last = progress.last;
    if (last && walk.episodes[last] && !progress.done[last] && (progress.pos[last] ?? 0) > 5) {
        return { status: "resume", id: last, plan: planOf(walk, last) };
    }
    const current = last ? planOf(walk, last) : null;
    const plans = current ? [current, ...walk.plans.filter((plan) => plan !== current)] : walk.plans;
    let waiting = null;
    for (const plan of plans) {
        for (const { id, label } of plan.episodes) {
            if (progress.done[id]) {
                continue;
            }
            if (walk.episodes[id]) {
                return { status: "next", id, plan };
            }
            if (!waiting) {
                waiting = { status: "waiting", label, plan };
            }
            break;
        }
    }
    return waiting ?? { status: "finished" };
}

/** { heard, ready, total } for a plan: episodes finished, recorded, and in all. */
export function planCounts(plan, walk, progress) {
    let heard = 0;
    let ready = 0;
    for (const { id } of plan.episodes) {
        if (walk.episodes[id]) {
            ready += 1;
        }
        if (progress.done[id]) {
            heard += 1;
        }
    }
    return { heard, ready, total: plan.episodes.length };
}
