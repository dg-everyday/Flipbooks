/**
 * The Grace Library's index: every complete Daily Grace day from the
 * Library's first day (September 11, 2026) up to today in Manila.
 *
 * Reads assets/library/index.json ({ start, years }) and one file per year,
 * assets/library/<YYYY>.json ({ year, months, days }), written by
 * tools/library/build_library_index.py. A day is
 *   { date: "2026-10-01", ref: "2 Corinthians 12:9", book: "2 Corinthians",
 *     title: "Grace is sufficient", summary: "…", video?: true, missing?: [] }
 * where `missing` marks a day the media audit found incomplete; it stays out.
 * Only the years up to this one are fetched, and a day after today is never
 * returned, though the files hold the days to come.
 *
 * Usage
 *   import { loadLibrary } from "../../assets/scripts/library-index.js?v=…";
 *   const { start, days, months } = await loadLibrary();
 *
 * Import it with the same ?v= token everywhere.
 */

import { parseReference } from "../../apps/components/scripture-refs.js?v=20261024-1";
import { MEDIA_BASE_URL } from "../../apps/settings/settings.js?v=20261009-1";

const INDEX_BASE = new URL("../library/", import.meta.url);
const TIME_ZONE = "Asia/Manila";

/** Today in Manila, when each day's devotional goes live, as YYYY-MM-DD. */
export function manilaToday() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

/** "2026-10-01" as a Date at midnight UTC, for formatting and arithmetic. */
export function dateOf(iso) {
    return new Date(`${iso}T00:00:00Z`);
}

/** "2026-10-01" → "October 1, 2026", the verse files' and media's day name. */
export function dayName(iso) {
    return dateOf(iso).toLocaleDateString("en-US", {
        timeZone: "UTC",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

/** The day `n` days after `iso` (before, for a negative n). */
export function addDays(iso, n) {
    return new Date(dateOf(iso).getTime() + n * 86_400_000)
        .toISOString()
        .slice(0, 10);
}

/** The day's poster at thumbnail size (tools/library/make_thumbs.py). */
export function thumbUrl(iso, base = MEDIA_BASE_URL) {
    const date = dateOf(iso);
    const month = date
        .toLocaleDateString("en-US", { timeZone: "UTC", month: "long" })
        .toLowerCase();
    return `${base}images/thumbs/${date.getUTCFullYear()}/${month}/${encodeURIComponent(dayName(iso))}.webp`;
}

/** A book's symbol, as on the banner and in the search results. */
export function symbolUrl(book, base = MEDIA_BASE_URL) {
    return `${base}images/symbols/${encodeURIComponent(book)}-symbol.svg`;
}

let loading = null;

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Unable to load ${url} (${response.status})`);
    }
    return response.json();
}

async function load() {
    const today = manilaToday();
    const index = await fetchJson(new URL("index.json", INDEX_BASE));
    const thisYear = Number(today.slice(0, 4));
    const years = index.years.filter((year) => year <= thisYear);
    const files = await Promise.all(
        years.map((year) => fetchJson(new URL(`${year}.json`, INDEX_BASE))),
    );
    const months = new Map();
    const days = [];
    for (const file of files) {
        for (const [month, theme] of Object.entries(file.months)) {
            months.set(month, theme);
        }
        for (const day of file.days) {
            if (day.date >= index.start && day.date <= today && !day.missing?.length) {
                days.push(day);
            }
        }
    }
    days.sort((a, b) => a.date.localeCompare(b.date));
    return { start: index.start, today, days, months };
}

/**
 * The Library: { start, today, days, months }, days oldest first and months
 * a Map of "YYYY-MM" to the month's emphasis. Fetched once per page; a
 * failure is forgotten, so it can be tried again.
 */
export function loadLibrary() {
    if (!loading) {
        loading = load().catch((error) => {
            loading = null;
            throw error;
        });
    }
    return loading;
}

// A place in a book as one number, so ranges compare: chapter, then verse.
const at = (chapter, verse) =>
    chapter * 1000 + (verse === Infinity ? 999 : verse);

/** Whether two parsed references ({ book, ranges }) share any verse. */
function overlaps(a, b) {
    return (
        a.book === b.book &&
        a.ranges.some(([c1, v1, c2, v2]) =>
            b.ranges.some(
                ([d1, w1, d2, w2]) =>
                    at(c1, v1) <= at(d2, w2) && at(d1, w1) <= at(c2, v2),
            ),
        )
    );
}

/**
 * The days whose verse falls in `reference` ("Psalm 23", "John 3:16"), or
 * null when it is not a Bible reference.
 */
export function daysForReference(days, reference) {
    const wanted = parseReference(reference);
    if (!wanted) {
        return null;
    }
    return days.filter((day) => {
        const own = parseReference(day.ref);
        return own && overlaps(own, wanted);
    });
}
