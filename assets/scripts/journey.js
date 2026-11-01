/**
 * "Your Year's Journey in Grace": a reader's year with Daily Grace, read from
 * what this device has kept. Shared by the home page's <journey-card> and the
 * Daily Grace Archives (#journey), which shows it.
 *
 * The journey is offered from December 29 to January 10 in Manila: at the end
 * of a year for that year, in January for the year just ended. After that it
 * stays in the Archives' My days, and #journey/2026 opens any year.
 *
 * Read only, never written, and nothing leaves the device:
 *   dailygrace:moment:done        the days whose Moment reached Amen
 *   dailygrace:moment:answers     the answers written, by day (counted only)
 *   dailygrace:memory:learned     the memory verses learned: { verse, week }
 *   dailygrace:stickers           the stickers earned: earned[id].day
 *   dailygrace:stickers:counts    the books of the Bible met: books[name] = day
 *
 * Usage
 *   import { journeyYear, inJourneyWindow, readJourney } from ".../journey.js?v=…";
 */

const TIME_ZONE = "Asia/Manila";
// The window, as month-day, on either side of the new year.
const OPENS = "12-29";
const CLOSES = "01-10";
// A week with this many Moments is a faithful one, as for the stickers.
const FAITHFUL_DAYS = 5;

/** Today in Manila, as YYYY-MM-DD. */
export function manilaToday() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

/** Whether the journey is offered today: December 29 to January 10. */
export function inJourneyWindow(today = manilaToday()) {
    const monthDay = today.slice(5);
    return monthDay >= OPENS || monthDay <= CLOSES;
}

/** The year the journey looks back on: this one from December 29, else the last. */
export function journeyYear(today = manilaToday()) {
    const year = Number(today.slice(0, 4));
    return today.slice(5) >= OPENS ? year : year - 1;
}

function readStore(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value ?? fallback;
    } catch {
        return fallback;
    }
}

const sundayOf = (iso) => {
    const date = new Date(`${iso}T00:00:00Z`);
    return new Date(date.getTime() - date.getUTCDay() * 86_400_000)
        .toISOString()
        .slice(0, 10);
};

/**
 * The reader's journey in `year`, from this device:
 *   { year, prayed: [iso…] oldest first, answers, faithfulWeeks,
 *     bestMonth: "2026-10" | null, verses: [reference…], books: [name…],
 *     stickers: [id…] }
 * Everything is empty for a reader with nothing kept that year.
 */
export function readJourney(year) {
    const inYear = (iso) => typeof iso === "string" && iso.startsWith(`${year}-`);
    const prayed = [...new Set(readStore("dailygrace:moment:done", []))]
        .filter(inYear)
        .sort();

    const answers = Object.entries(readStore("dailygrace:moment:answers", {}))
        .filter(([iso, text]) => inYear(iso) && String(text ?? "").trim())
        .length;

    const weeks = new Map();
    const months = new Map();
    for (const iso of prayed) {
        const sunday = sundayOf(iso);
        weeks.set(sunday, (weeks.get(sunday) ?? 0) + 1);
        const month = iso.slice(0, 7);
        months.set(month, (months.get(month) ?? 0) + 1);
    }
    const faithfulWeeks = [...weeks.values()].filter((n) => n >= FAITHFUL_DAYS).length;
    let bestMonth = null;
    for (const [month, n] of months) {
        if (!bestMonth || n > months.get(bestMonth)) {
            bestMonth = month;
        }
    }

    const verses = readStore("dailygrace:memory:learned", [])
        .filter((item) => inYear(item?.week))
        .map((item) => item.verse)
        .filter(Boolean);

    const books = Object.entries(readStore("dailygrace:stickers:counts", {})?.books ?? {})
        .filter(([, day]) => inYear(day))
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([book]) => book);

    const stickers = Object.entries(readStore("dailygrace:stickers", {})?.earned ?? {})
        .filter(([, entry]) => inYear(entry?.day))
        .sort((a, b) => String(a[1].day).localeCompare(String(b[1].day)))
        .map(([id]) => id);

    return { year, prayed, answers, faithfulWeeks, bestMonth, verses, books, stickers };
}

/** Whether the reader kept anything at all in `year`. */
export function hasJourney(journey) {
    return Boolean(
        journey.prayed.length ||
            journey.verses.length ||
            journey.books.length ||
            journey.stickers.length,
    );
}
