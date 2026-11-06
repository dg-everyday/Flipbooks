/**
 * My Faith Journal: the Today page (journal.js draws it in the page pane).
 * From the top:
 *
 *   Welcome back      after three days or more away, a warm word, and never
 *                     a count of the days missed
 *   A closed year     once a new year begins, last year's journal is closed
 *                     (store.js closePastYears): its count, the Word book,
 *                     a backup and the Year's Journey, until the reader is done
 *   A milestone       counts that only go up: the 1st, 10th, 25th … entry,
 *                     the first answered prayer; each shown once
 *   The day           its poster, animated as on the home page
 *                     (<poster-card>) and as wide as the page, its question,
 *                     and the other kinds of entry, each in a pill ("Write
 *                     today's log" is in the bar above the page, journal.js)
 *   Memories          what the reader wrote on this day in earlier years, a
 *                     month ago and a week ago
 *   A verse you learned   a memory verse learned on the home page comes back
 *                     now and then (after 3, 7, 14, 30, 60 and then every 120
 *                     days) with every fourth word left out; a tap shows it
 *   Written today, and the journal so far (this year's entries, days and
 *   answered prayers), then a gentle reminder to back up when the journal
 *   has never been backed up or not for a month.
 *
 * Nothing here is a streak: nothing is lost by missing a day.
 */

import * as store from "../../../assets/scripts/journal/store.js?v=20261106-1";
import { loadVerses } from "../../components/daily-verses.js?v=20261004-1";
import { lastBackup } from "./journal-backup.js?v=20261106-2";
import {
    ICONS,
    KIND_LABELS,
    KIND_ORDER,
    addDays,
    escapeHtml,
    formatDay,
    verseFileName,
} from "./journal-ui.js?v=20261106-2";

const VERSES_BASE = new URL("../../../assets/verses/", import.meta.url).href;
const LEARNED_KEY = "dailygrace:memory:learned";
const AWAY_DAYS = 3;
const BACKUP_DAYS = 30;
const BACKUP_AFTER_ENTRIES = 5;
const MILESTONES = [1, 10, 25, 50, 100, 200, 365, 500, 750, 1000];
const REVIEW_DAYS = [3, 7, 14, 30, 60, 120];
const MEMORY_ROWS = 4;

export function daysBetween(from, to) {
    return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86400000);
}

/* ---------- Verses ---------- */

/** The day's entry in the verse files (verse, text, question …), or null. */
export async function dayVerse(day) {
    const name = verseFileName(day);
    try {
        return (await loadVerses(VERSES_BASE, [name])).get(name) ?? null;
    } catch {
        return null;
    }
}

/** A learned memory verse's words, from its week's verse files. */
async function weekVerseText(sunday, reference) {
    const names = Array.from({ length: 7 }, (_, i) => verseFileName(addDays(sunday, i)));
    try {
        const days = await loadVerses(VERSES_BASE, names);
        for (const name of names) {
            const entry = days.get(name);
            if (entry?.verse === reference) {
                return entry.text;
            }
        }
    } catch {
        // No verse file: nothing to bring back.
    }
    return null;
}

/* ---------- Once a visit ---------- */

/** Notes this visit; resolves to whether the reader has been away a while. */
export async function noteVisit() {
    const today = store.todayIso();
    const last = await store.getMeta("lastVisit");
    await store.setMeta("lastVisit", today);
    return Boolean(last) && daysBetween(last, today) >= AWAY_DAYS;
}

/* ---------- Parts of the page ---------- */

const ordinal = (n) => {
    const tens = n % 100;
    const suffix = tens >= 11 && tens <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th";
    return `${n}${suffix}`;
};

/** A milestone's words; `count` is how many entries the journal holds now. */
const MILESTONE_TEXT = (id, count) => {
    if (id === "prayer-answered") {
        return "Your first answered prayer is kept in your journal.";
    }
    const n = Number(id.split("-")[1]);
    if (n === 1) {
        // Entries brought in (Moment answers, a backup) may already be many.
        return count > 1 ? `Your journal has begun: ${count} entries kept so far.` : "Your first entry. Your journal has begun.";
    }
    return `Your ${ordinal(n)} entry. Look how much of your walk with God you have kept.`;
};

/** The milestone just reached, if any; each is shown once. */
async function freshMilestone(all) {
    const reached = MILESTONES.filter((n) => all.length >= n).map((n) => `entries-${n}`);
    if (all.some((entry) => entry.kind === "prayer" && entry.prayer?.answered)) {
        reached.push("prayer-answered");
    }
    const seen = await store.getMeta("milestones", []);
    const fresh = reached.filter((id) => !seen.includes(id));
    if (!fresh.length) {
        return null;
    }
    await store.setMeta("milestones", [...seen, ...fresh]);
    // An answered prayer first; otherwise the biggest count reached.
    return fresh.includes("prayer-answered") ? "prayer-answered" : fresh.at(-1);
}

/** The most recently closed year whose closing the reader has not finished with. */
async function closingYear() {
    const done = await store.getMeta("closingsSeen", []);
    const closed = (await store.volumes())
        .filter((volume) => volume.closed && !done.includes(volume.year))
        .sort((a, b) => b.year - a.year);
    return closed[0]?.year ?? null;
}

function sameDayLastMonth(today) {
    const [year, month, day] = today.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 2, day, 12));
    // March 31 has no February 31: no "a month ago" that day.
    return date.getUTCDate() === day ? date.toISOString().slice(0, 10) : null;
}

function memories(today, all) {
    const groups = [];
    const earlier = all.filter((entry) => entry.day.slice(5) === today.slice(5) && entry.day < today);
    for (const year of [...new Set(earlier.map((entry) => entry.year))].sort((a, b) => b - a)) {
        const ago = Number(today.slice(0, 4)) - year;
        groups.push({ label: ago === 1 ? "A year ago today" : `${ago} years ago today`, entries: earlier.filter((e) => e.year === year) });
    }
    const month = sameDayLastMonth(today);
    if (month) {
        groups.push({ label: "A month ago", entries: all.filter((entry) => entry.day === month) });
    }
    groups.push({ label: "A week ago", entries: all.filter((entry) => entry.day === addDays(today, -7)) });
    return groups.filter((group) => group.entries.length);
}

/** A learned verse due to come back, with its words, or null. */
async function dueVerse(today) {
    let learned = [];
    try {
        learned = JSON.parse(localStorage.getItem(LEARNED_KEY)) ?? [];
    } catch {
        learned = [];
    }
    if (!Array.isArray(learned) || !learned.length) {
        return null;
    }
    const reviews = await store.getMeta("verseReviews", {});
    let due = null;
    for (const item of learned) {
        if (!item?.verse || !/^\d{4}-\d{2}-\d{2}$/.test(item.week ?? "")) {
            continue;
        }
        // Learned in its week: counted from that week's Saturday.
        const review = reviews[item.verse] ?? { count: 0, last: addDays(item.week, 6) };
        const wait = REVIEW_DAYS[Math.min(review.count, REVIEW_DAYS.length - 1)];
        const over = daysBetween(review.last, today) - wait;
        if (over >= 0 && (!due || over > due.over)) {
            due = { ...item, over };
        }
    }
    if (!due) {
        return null;
    }
    const text = await weekVerseText(due.week, due.verse);
    return text ? { verse: due.verse, text } : null;
}

function blanksHtml(text) {
    let index = 0;
    return text
        .split(/(\s+)/)
        .map((part) => {
            if (!part.trim()) {
                return part;
            }
            index += 1;
            // Every fourth word that has letters in it.
            if (index % 4 === 0 && /[A-Za-z]/.test(part)) {
                return `<button class="blank" type="button" data-action="today:reveal" data-word="${escapeHtml(part)}" aria-label="Show the hidden word">${"_".repeat(Math.min(Math.max(part.length, 3), 9))}</button>`;
            }
            return escapeHtml(part);
        })
        .join("");
}

function rowHtml(entry, hashFor) {
    const text = store.bodyText(entry.body).replace(/\s+/g, " ") || entry.cards[0]?.title || entry.prompt || "";
    return `<a class="row" href="${hashFor("today", { id: entry.id, edit: false })}">
      <span class="row-top"><span class="row-title">${escapeHtml(entry.title || KIND_LABELS[entry.kind])}</span>
      <span class="row-day">${escapeHtml(formatDay(entry.day, { weekday: false }))}</span></span>
      <span class="row-text">${escapeHtml(text.slice(0, 140))}</span></a>`;
}

/* ---------- The page ---------- */

/**
 * The Today page. ctx: { state, hashFor }; state.welcomeBack is set once a
 * visit (noteVisit), and state.milestone and state.todayVerse are kept here.
 */
export async function todayHtml({ state, hashFor }) {
    const today = store.todayIso();
    const thisYear = Number(today.slice(0, 4));
    const [verse, all, last, closing] = await Promise.all([dayVerse(today), store.allEntries(), lastBackup(), closingYear()]);
    state.todayVerse = verse;
    const milestone = await freshMilestone(all);
    if (milestone) {
        state.milestone = milestone;
    }
    const yearEntries = all.filter((entry) => entry.year === thisYear);
    const todays = all.filter((entry) => entry.day === today);
    const recall = await dueVerse(today);
    const groups = memories(today, all);

    let closingHtml = "";
    if (closing) {
        const closed = all.filter((entry) => entry.year === closing);
        const days = new Set(closed.map((entry) => entry.day)).size;
        closingHtml = `
          <section class="today-card closing">
            <p class="eyebrow">${ICONS.book} Your ${closing} journal is complete</p>
            <h3>${closed.length} ${closed.length === 1 ? "entry" : "entries"} on ${days} ${days === 1 ? "day" : "days"}.</h3>
            <p>It is closed now and kept as it is, to read whenever you like. Prayers still waiting for an answer have come with you into ${thisYear}.</p>
            <div class="card-actions">
              <button class="button small primary" type="button" data-action="today:word" data-year="${closing}">${ICONS.book} Make the ${closing} Word book</button>
              <button class="button small" type="button" data-action="backup">${ICONS.backup} Back up</button>
              <a class="button small" href="library.html#journey/${closing}">Your Year's Journey in Grace</a>
              <button class="link-button" type="button" data-action="today:closing-done" data-year="${closing}">Done</button>
            </div>
          </section>`;
    }

    const backupDue =
        (!last && all.length >= BACKUP_AFTER_ENTRIES) ||
        (last && daysBetween(last, today) >= BACKUP_DAYS && all.some((entry) => entry.updated.slice(0, 10) > last));
    const answered = yearEntries.filter((entry) => entry.kind === "prayer" && entry.prayer?.answered).length;
    const yearDays = new Set(yearEntries.map((entry) => entry.day)).size;

    return `
      <section class="today">
        ${state.welcomeBack ? `<p class="welcome">Welcome back. Today's page is open.</p>` : ""}
        ${closingHtml}
        ${
            state.milestone
                ? `<section class="today-card milestone"><p>${ICONS.stickers} ${escapeHtml(MILESTONE_TEXT(state.milestone, all.length))}</p>
                   <button class="link-button" type="button" data-action="today:milestone-done">Thank you</button></section>`
                : ""
        }
        <p class="eyebrow">${escapeHtml(formatDay(today))}</p>
        <poster-card class="today-poster" aria-label="Today's poster${verse ? `: ${escapeHtml(verse.verse)}` : ""}"></poster-card>
        <h2 class="today-question">${escapeHtml(verse?.question || "What is one thing from today you do not want to forget?")}</h2>
        <div class="today-more">
          <span class="today-more-label">Or begin</span>
          <div class="kind-pill" role="group" aria-label="Begin another kind of entry">
            ${KIND_ORDER.filter((kind) => kind !== "log")
                .map((kind) => `<button type="button" data-action="new" data-kind="${kind}">${ICONS[kind]}${escapeHtml(KIND_LABELS[kind])}</button>`)
                .join("")}
          </div>
        </div>
        ${
            todays.length
                ? `<h3 class="list-group">Written today</h3><div class="rows">${todays.map((entry) => rowHtml(entry, hashFor)).join("")}</div>`
                : `<p class="quiet">A single line is a whole entry.</p>`
        }
        ${
            groups.length
                ? `<section class="memories"><h3 class="list-group">${ICONS.year} Memories</h3>${groups
                      .slice(0, MEMORY_ROWS)
                      .map((group) => `<p class="memory-label">${escapeHtml(group.label)}</p><div class="rows">${group.entries.slice(0, 2).map((entry) => rowHtml(entry, hashFor)).join("")}</div>`)
                      .join("")}</section>`
                : ""
        }
        ${
            recall
                ? `<section class="today-card recall" data-verse="${escapeHtml(recall.verse)}">
                     <p class="eyebrow">A verse you learned</p>
                     <p class="recall-text">${blanksHtml(recall.text)}</p>
                     <cite>${escapeHtml(recall.verse)}</cite>
                     <div class="card-actions">
                       <button class="button small primary" type="button" data-action="today:remembered">I remembered it</button>
                       <button class="button small" type="button" data-action="today:show-verse">Show me the verse</button>
                     </div>
                   </section>`
                : ""
        }
        ${
            yearEntries.length
                ? `<p class="so-far">Your journal so far in ${thisYear}: ${yearEntries.length} ${yearEntries.length === 1 ? "entry" : "entries"} on ${yearDays} ${yearDays === 1 ? "day" : "days"}${answered ? `, ${answered} ${answered === 1 ? "prayer" : "prayers"} answered` : ""}.</p>`
                : ""
        }
        ${
            backupDue
                ? `<section class="today-card reminder"><p>${ICONS.backup} ${
                      last
                          ? `Your last backup was on ${escapeHtml(formatDay(last, { weekday: false }))}. A fresh one keeps everything since then safe.`
                          : "Your journal lives only on this device. A backup keeps it safe if the phone is lost or the browser clears its data."
                  }</p><button class="button small primary" type="button" data-action="backup">Back up now</button></section>`
                : ""
        }
      </section>`;
}

/**
 * The Today page's own buttons (data-action "today:…"). ctx: { state,
 * redraw, openWord(year) }.
 */
export async function todayAction(action, button, { state, redraw, openWord }) {
    switch (action) {
        case "today:reveal":
            button.textContent = button.dataset.word;
            button.classList.add("shown");
            button.disabled = true;
            break;
        case "today:show-verse":
            button
                .closest(".recall")
                .querySelectorAll(".blank:not(.shown)")
                .forEach((blank) => {
                    blank.textContent = blank.dataset.word;
                    blank.classList.add("shown");
                    blank.disabled = true;
                });
            button.closest(".recall").querySelector('[data-action="today:remembered"]').textContent = "Done";
            button.remove();
            break;
        case "today:remembered": {
            const card = button.closest(".recall");
            const reviews = await store.getMeta("verseReviews", {});
            const before = reviews[card.dataset.verse] ?? { count: 0 };
            // Shown the verse first: it comes back as soon as before, not later.
            const peeked = card.querySelector(".blank.shown") !== null;
            reviews[card.dataset.verse] = { count: peeked ? before.count : before.count + 1, last: store.todayIso() };
            await store.setMeta("verseReviews", reviews);
            card.innerHTML = `<p class="eyebrow">A verse you learned</p><p>“Thy word have I hid in mine heart.” (Psalm 119:11) It will come back again before long.</p>`;
            break;
        }
        case "today:milestone-done":
            state.milestone = null;
            button.closest(".milestone")?.remove();
            break;
        case "today:closing-done": {
            const done = await store.getMeta("closingsSeen", []);
            await store.setMeta("closingsSeen", [...new Set([...done, Number(button.dataset.year)])]);
            await redraw();
            break;
        }
        case "today:word":
            openWord(Number(button.dataset.year));
            break;
        default:
            break;
    }
}
