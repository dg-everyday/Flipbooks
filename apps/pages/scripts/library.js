/**
 * The Grace Library — drives library.html.
 *
 * Every complete Daily Grace day from September 11, 2026 up to today, from
 * the index in assets/library/ (assets/scripts/library-index.js, built by
 * tools/library/). Three views: Months (newest first, as a calendar on wide
 * screens), Books (the 66 books, those with days to open) and My days (the
 * Moments the reader has prayed and the answers they wrote, kept on this
 * device by <daily-moment>). A search finds a day by theme, words or
 * reference ("Psalm 23", "sufficient"), and This week shows the days of the
 * week so far, done or still to catch up.
 *
 * A day opens in a sheet over the page: its <poster-card> (poster and comic,
 * narration, share), the KJV verse, the reflection, the reader's answer or
 * the day's question, the prayer, its <daily-moment> and the way to that
 * week's Flipbook, with the day before and after a tap, a swipe or an arrow
 * key away. A Moment prayed here marks the day done, but only today's counts
 * toward the stickers (assets/scripts/sticker-progress.js).
 *
 * The URL keeps the place: #day/2026-10-01 opens a day (Back closes it),
 * #books, #book/Psalms, #mine and #month/2026-10 pick the view. The last view
 * is remembered on the device (dailygrace:library:view).
 */

import {
    h,
    fetchJson,
    guideInfoButton,
    titleWithInfo,
    scrollUnderTopbar,
} from "./study-utils.js?v=20261024-1";
import {
    loadLibrary,
    dateOf,
    dayName,
    addDays,
    thumbUrl,
    symbolUrl,
    daysForReference,
} from "../../../assets/scripts/library-index.js?v=20261031-1";
import { loadVerses } from "../../components/daily-verses.js?v=20261004-1";
import {
    PullTab,
    PULL_TAB_ICON,
    PULL_TAB_STYLES,
} from "../../components/pull-tab.js?v=20260925-1";

const BOOKS = "assets/book-metadata.json";
const VERSES_BASE = new URL("../../../assets/verses/", import.meta.url).href;
const DONE_KEY = "dailygrace:moment:done";
const ANSWERS_KEY = "dailygrace:moment:answers";
const VIEW_KEY = "dailygrace:library:view";
const OLD_TESTAMENT = 39;
const TOAST_MS = 3200;
// A swipe in the day sheet: this far across, and more across than down.
const SWIPE_PX = 60;
// A month shows its newest days until its pull tab is pulled.
const MONTH_PREVIEW = 3;
// Wide screens lay a month out as a calendar (library-page.css).
const CALENDAR = window.matchMedia("(min-width: 900px)");
// Tiles slide in one after another, this far apart, all within REVEAL_MAX.
const REVEAL_STEP = 25;
const REVEAL_MAX = 450;

const SHARE_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>';
const FLIPBOOK_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';

// ------------------------------------------------------------------ helpers

function readStore(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value ?? fallback;
    } catch {
        return fallback;
    }
}

function writeStore(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Unsaved, the Library simply opens on Months next time.
    }
}

const format = (iso, options) =>
    dateOf(iso).toLocaleDateString("en-US", { timeZone: "UTC", ...options });
const longDate = (iso) =>
    format(iso, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const shortDate = (iso) => format(iso, { weekday: "short", month: "short", day: "numeric" });
const monthLabel = (month) => format(`${month}-01`, { month: "long", year: "numeric" });

/** Where a day's verse sits in its book, for listing a book's days in order. */
function placeOf(ref) {
    const match = /(\d+)(?::(\d+))?\D*$/.exec(ref.replace(/-.*$/, ""));
    return match ? Number(match[1]) * 1000 + Number(match[2] ?? 0) : 0;
}

function svg(markup) {
    const span = h("span", { class: "lib-icon", "aria-hidden": "true" });
    // A fixed string from this file, never data.
    span.innerHTML = markup;
    return span;
}

/**
 * Slides tiles into place one after another, as the home page's pull tab
 * reveals its cards, but quicker, since a month holds many more.
 */
function revealTiles(tiles) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }
    tiles.forEach((tile, index) => {
        tile.animate(
            [
                { opacity: 0, transform: "translateY(-14px)" },
                { opacity: 1, transform: "none" },
            ],
            {
                duration: 380,
                delay: Math.min(index * REVEAL_STEP, REVEAL_MAX),
                easing: "cubic-bezier(.2, .8, .3, 1)",
                fill: "backwards",
            },
        );
    });
}

/**
 * A custom element with its attributes, made from markup as the home page
 * does. document.createElement() refuses an element whose constructor sets
 * attributes (<daily-moment> hides itself until its day loads); parsed
 * markup is upgraded instead, where that is allowed.
 */
function element(tag, attrs) {
    const template = document.createElement("template");
    template.innerHTML = `<${tag}></${tag}>`;
    const node = template.content.firstElementChild;
    for (const [key, value] of Object.entries(attrs)) {
        node.setAttribute(key, value);
    }
    return document.importNode(node, true);
}

// ------------------------------------------------------------------ the page

export async function start(view) {
    let lib;
    let books;
    try {
        [lib, books] = await Promise.all([
            loadLibrary(),
            fetchJson(BOOKS).then((meta) => Object.keys(meta)),
        ]);
    } catch (error) {
        console.error("The Grace Library could not be loaded:", error);
        view.replaceChildren(
            h(
                "p",
                { class: "status" },
                "The Grace Library needs a connection to open. Your finished days are safe on this device.",
            ),
        );
        return;
    }

    const byDate = new Map(lib.days.map((day) => [day.date, day]));
    // The months pulled open, kept while the page is open.
    const expanded = new Set();
    // The pull tab's look, written for a shadow root, serves the page as well.
    document.head.append(h("style", {}, PULL_TAB_STYLES));
    const state = { tab: "months", book: null, query: "" };
    let done = new Set();
    let answers = {};
    const refreshMine = () => {
        done = new Set(readStore(DONE_KEY, []));
        answers = readStore(ANSWERS_KEY, {});
    };
    refreshMine();

    // ---------------------------------------------------------------- tiles

    function tileLabel(day) {
        const parts = [`${longDate(day.date)}: ${day.title}, ${day.ref}`];
        if (day.date === lib.today) {
            parts.push("today");
        }
        if (done.has(day.date)) {
            parts.push("Moment done");
        }
        return parts.join(", ");
    }

    function tile(day, style) {
        const image = h("img", {
            src: thumbUrl(day.date),
            alt: "",
            width: 240,
            height: 427,
            loading: "lazy",
            decoding: "async",
        });
        const link = h(
            "a",
            {
                class: "lib-tile",
                href: `#day/${day.date}`,
                "data-date": day.date,
                "aria-label": tileLabel(day),
                style,
            },
            h(
                "span",
                { class: "lib-thumb" },
                image,
                h("span", { class: "lib-thumb-text", "aria-hidden": "true" }, day.title),
            ),
            h(
                "span",
                { class: "lib-badges", "aria-hidden": "true" },
                day.date === lib.today && h("span", { class: "lib-badge is-today" }, "Today"),
                done.has(day.date) && h("span", { class: "lib-badge is-done", title: "Moment done" }, "✓"),
            ),
            h("span", { class: "lib-date", "aria-hidden": "true" }, shortDate(day.date)),
            h("span", { class: "lib-title", "aria-hidden": "true" }, day.title),
            h("span", { class: "lib-ref", "aria-hidden": "true" }, day.ref),
        );
        // No thumbnail yet: the tile shows the day's title on navy instead.
        image.addEventListener("error", () => link.classList.add("no-thumb"), { once: true });
        return link;
    }

    const grid = (days) => h("div", { class: "lib-grid" }, days.map((day) => tile(day)));

    // ---------------------------------------------------------------- hero

    const search = h("input", {
        type: "search",
        class: "search",
        autocomplete: "off",
        placeholder: "Search a theme, a word or a verse…",
        "aria-label": "Search the Grace Library",
    });
    search.addEventListener("input", () => {
        state.query = search.value;
        renderContent();
    });

    const TABS = [
        { key: "months", label: "Months" },
        { key: "books", label: "Books" },
        { key: "mine", label: "My days" },
    ];
    const tabs = h(
        "div",
        { class: "lib-tabs", role: "tablist", "aria-label": "Show the days by" },
        TABS.map(({ key, label }) =>
            h(
                "button",
                {
                    type: "button",
                    role: "tab",
                    id: `tab-${key}`,
                    "data-tab": key,
                    "aria-controls": "lib-content",
                },
                label,
            ),
        ),
    );
    tabs.addEventListener("click", (event) => {
        const button = event.target.closest("[data-tab]");
        if (!button) {
            return;
        }
        setView({ tab: button.dataset.tab, book: null });
    });
    tabs.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
            return;
        }
        const keys = TABS.map((tab) => tab.key);
        const step = event.key === "ArrowRight" ? 1 : -1;
        const next = keys[(keys.indexOf(state.tab) + step + keys.length) % keys.length];
        setView({ tab: next, book: null });
        tabs.querySelector(`[data-tab="${next}"]`).focus();
    });

    const stats = h("ul", { class: "stats" });
    function renderStats() {
        const bookCount = new Set(lib.days.map((day) => day.book)).size;
        const prayed = lib.days.filter((day) => done.has(day.date)).length;
        stats.replaceChildren(
            h("li", {}, h("b", {}, String(lib.days.length)), "days"),
            h("li", {}, h("b", {}, String(bookCount)), "books of the Bible"),
            h("li", {}, h("b", {}, String(prayed)), prayed === 1 ? "Moment you've prayed" : "Moments you've prayed"),
        );
    }

    const hero = h(
        "section",
        { class: "hero" },
        h("p", { class: "eyebrow" }, "Every Daily Grace day"),
        h("h1", {}, titleWithInfo("Grace Library", guideInfoButton())),
        h(
            "p",
            { class: "lede" },
            `Every Daily Grace day since ${format(lib.start, { month: "long", day: "numeric", year: "numeric" })}, ` +
                "ready to read, hear and pray again. Tap a day to open its poster, comic, narration, reflection and prayer.",
        ),
        stats,
        h("div", { class: "finder" }, search),
        tabs,
    );

    // ---------------------------------------------------------------- this week

    const week = h("section", { class: "panel lib-week", "aria-labelledby": "lib-week-title" });
    function renderWeek() {
        const sunday = addDays(lib.today, -dateOf(lib.today).getUTCDay());
        let released = 0;
        let prayed = 0;
        const cells = Array.from({ length: 7 }, (_, i) => {
            const iso = addDays(sunday, i);
            const letter = format(iso, { weekday: "narrow" });
            const name = format(iso, { weekday: "long" });
            const day = byDate.get(iso);
            if (!day) {
                const why = iso > lib.today ? "still to come" : "not in the Library";
                return h(
                    "li",
                    { class: `lib-week-day ${iso > lib.today ? "is-later" : "is-none"}` },
                    h("span", { "aria-label": `${name}: ${why}` }, letter),
                );
            }
            released += 1;
            const isDone = done.has(iso);
            if (isDone) {
                prayed += 1;
            }
            return h(
                "li",
                { class: `lib-week-day${isDone ? " is-done" : ""}${iso === lib.today ? " is-today" : ""}` },
                h(
                    "a",
                    {
                        href: `#day/${iso}`,
                        "aria-label": `${name}, ${day.title}: ${isDone ? "Moment done" : "not done yet, tap to catch up"}`,
                    },
                    letter,
                    h("i", { "aria-hidden": "true" }, isDone ? "✓" : ""),
                ),
            );
        });
        const note =
            released === 0
                ? "The Library's first days are coming."
                : prayed === released
                  ? "All caught up. Well done."
                  : `${prayed} of ${released} done. Tap a day to catch up.`;
        week.replaceChildren(
            h(
                "div",
                { class: "lib-week-head" },
                h("h2", { id: "lib-week-title" }, "This week"),
                h("p", { class: "lib-week-note" }, note),
            ),
            h("ol", { class: "lib-week-days" }, cells),
        );
    }

    // ---------------------------------------------------------------- views

    const count = h("p", { class: "result-count", "aria-live": "polite" });
    const content = h("div", { id: "lib-content", role: "tabpanel" });

    function monthsView() {
        const groups = new Map();
        for (const day of lib.days) {
            const month = day.date.slice(0, 7);
            if (!groups.has(month)) {
                groups.set(month, []);
            }
            groups.get(month).push(day);
        }
        // Each month its own row of weekday names: a node shows in one place only.
        const weekdays = () =>
            Array.from({ length: 7 }, (_, i) =>
                h("span", {}, format(addDays("2026-09-13", i), { weekday: "short" })),
            );
        return [...groups].reverse().map(([month, days]) => {
            const prayed = days.filter((day) => done.has(day.date)).length;
            const firstColumn = dateOf(days[0].date).getUTCDay() + 1;
            const collapsed = days.length > MONTH_PREVIEW && !expanded.has(month);
            const tiles = days.map((day, i) => tile(day, `--o:${-i}`));
            const section = h(
                "section",
                {
                    class: `panel lib-month${collapsed ? " is-collapsed" : ""}`,
                    id: `month-${month}`,
                    "aria-labelledby": `month-${month}-title`,
                },
                h(
                    "header",
                    { class: "lib-month-head" },
                    h("h2", { id: `month-${month}-title` }, monthLabel(month)),
                    lib.months.get(month) && h("p", { class: "lib-month-theme" }, lib.months.get(month)),
                    h("p", { class: "lib-month-count" }, `${prayed} of ${days.length} done`),
                ),
                h("div", { class: "lib-weekdays", "aria-hidden": "true" }, weekdays()),
                h(
                    "div",
                    { class: "lib-grid lib-calendar", style: `--first:${firstColumn}` },
                    // Oldest first, as a calendar on wide screens; phones turn
                    // the order round (CSS order) to put the newest day first.
                    tiles,
                ),
            );
            if (days.length > MONTH_PREVIEW) {
                section.append(...monthToggles(section, month, tiles, collapsed));
            }
            return section;
        });
    }

    /**
     * Under a month of more than MONTH_PREVIEW days: folded, the pull tab of
     * the home page's fact cards, which a pull or a tap opens; opened, the
     * same chevrons turned up, which fold it back to its newest days.
     */
    function monthToggles(section, month, tiles, collapsed) {
        const name = monthLabel(month);
        const more = tiles.length - MONTH_PREVIEW;
        const pull = h("button", {
            type: "button",
            class: "pull-tab",
            "aria-label": `Show all ${tiles.length} days of ${name}`,
            title: `${more} more ${more === 1 ? "day" : "days"}`,
            hidden: !collapsed,
        });
        const fold = h("button", {
            type: "button",
            class: "pull-tab lib-fold",
            "aria-label": `Fold ${name} back to its ${MONTH_PREVIEW} newest days`,
            title: "Show fewer days",
            hidden: collapsed,
        });
        // A fixed string from pull-tab.js, never data.
        pull.innerHTML = PULL_TAB_ICON;
        fold.innerHTML = PULL_TAB_ICON;

        const tab = new PullTab(pull, {
            onPull: () => {
                expanded.add(month);
                // The tiles that were folded away, in the order they show:
                // newest first on a phone, the calendar's order on a wide screen.
                const folded = tiles.slice(0, -MONTH_PREVIEW);
                const shown = CALENDAR.matches ? folded : folded.reverse();
                section.classList.remove("is-collapsed");
                revealTiles(CALENDAR.matches ? tiles : shown);
                tab.hide({ animate: true, focus: shown[0] });
                fold.hidden = false;
            },
        });
        fold.addEventListener("click", () => {
            expanded.delete(month);
            section.classList.add("is-collapsed");
            fold.hidden = true;
            tab.show();
            pull.focus({ preventScroll: true });
            // The month shrinks under the reader: bring its heading back up.
            scrollUnderTopbar(section);
        });
        return [pull, fold];
    }

    function booksView() {
        const counts = new Map();
        for (const day of lib.days) {
            counts.set(day.book, (counts.get(day.book) ?? 0) + 1);
        }
        if (state.book) {
            const days = lib.days
                .filter((day) => day.book === state.book)
                .sort((a, b) => placeOf(a.ref) - placeOf(b.ref) || a.date.localeCompare(b.date));
            return [
                h(
                    "section",
                    { class: "panel lib-book-days", "aria-labelledby": "lib-book-title" },
                    h(
                        "header",
                        { class: "lib-month-head" },
                        h("a", { class: "lib-back", href: "#books" }, "‹ All books"),
                        h(
                            "h2",
                            { id: "lib-book-title" },
                            h("img", { class: "lib-book-symbol", src: symbolUrl(state.book), alt: "", width: 40, height: 40 }),
                            state.book,
                        ),
                        h(
                            "p",
                            { class: "lib-month-count" },
                            days.length
                                ? `${days.length} ${days.length === 1 ? "day" : "days"}, in the order of the book`
                                : "No day from this book yet.",
                        ),
                    ),
                    days.length > 0 && grid(days),
                ),
            ];
        }
        const shelf = (title, names) =>
            h(
                "section",
                { class: "panel lib-shelf", "aria-label": title },
                h("h2", {}, title),
                h(
                    "ul",
                    { class: "lib-books" },
                    names.map((book) => {
                        const n = counts.get(book) ?? 0;
                        const inner = [
                            h("img", { class: "lib-book-symbol", src: symbolUrl(book), alt: "", width: 40, height: 40, loading: "lazy" }),
                            h("span", { class: "lib-book-name" }, book),
                            h("span", { class: "chip-count" }, String(n)),
                        ];
                        return h(
                            "li",
                            {},
                            n
                                ? h("a", { class: "lib-book", href: `#book/${encodeURIComponent(book)}`, "aria-label": `${book}: ${n} ${n === 1 ? "day" : "days"}` }, inner)
                                : h("span", { class: "lib-book is-empty", "aria-label": `${book}: no day yet` }, inner),
                        );
                    }),
                ),
            );
        return [
            shelf("Old Testament", books.slice(0, OLD_TESTAMENT)),
            shelf("New Testament", books.slice(OLD_TESTAMENT)),
            h("p", { class: "status lib-note" }, "More books join as new days are added."),
        ];
    }

    function mineView() {
        const prayed = lib.days.filter((day) => done.has(day.date)).reverse();
        const written = lib.days
            .filter((day) => String(answers[day.date] ?? "").trim())
            .reverse();
        if (!prayed.length && !written.length) {
            return [
                h(
                    "section",
                    { class: "panel lib-empty" },
                    h("h2", {}, "Your days will gather here"),
                    h(
                        "p",
                        {},
                        "Each Moment with God you pray, here or on the home page, shows up here with a ✓, and so does every answer you write. They stay on this device.",
                    ),
                    h("a", { class: "lib-button", href: "../../index.html#daily-devotional" }, "Start today's Moment"),
                ),
            ];
        }
        return [
            h(
                "section",
                { class: "panel lib-mine", "aria-labelledby": "lib-prayed" },
                h("h2", { id: "lib-prayed" }, "Moments you've prayed"),
                prayed.length
                    ? grid(prayed)
                    : h("p", { class: "lib-note" }, "None yet. Open a day and tap its Moment."),
            ),
            h(
                "section",
                { class: "panel lib-mine", "aria-labelledby": "lib-written" },
                h("h2", { id: "lib-written" }, "Your answers"),
                written.length
                    ? h(
                          "ul",
                          { class: "lib-answers" },
                          written.map((day) =>
                              h(
                                  "li",
                                  {},
                                  h(
                                      "a",
                                      { href: `#day/${day.date}` },
                                      h("span", { class: "lib-answer-when" }, `${shortDate(day.date)} · ${day.title}`),
                                      h("span", { class: "lib-answer-text" }, answers[day.date]),
                                  ),
                              ),
                          ),
                      )
                    : h("p", { class: "lib-note" }, "The answers you write in a Moment's Respond step show up here."),
            ),
        ];
    }

    function searchResults(query) {
        const byReference = daysForReference(lib.days, query);
        let found = byReference;
        if (!found || !found.length) {
            const words = query.toLowerCase().split(/\s+/).filter(Boolean);
            found = lib.days.filter((day) => {
                const text = `${day.title} ${day.summary} ${day.ref} ${day.book}`.toLowerCase();
                return words.every((word) => text.includes(word));
            });
        }
        found = [...found].reverse();
        count.textContent = found.length
            ? `${found.length} ${found.length === 1 ? "day matches" : "days match"} "${query}"`
            : "";
        return found.length
            ? [h("section", { class: "panel lib-results" }, grid(found))]
            : [h("p", { class: "status" }, "No day matches that search. Try a word such as \"peace\", or a verse such as \"Psalm 23\".")];
    }

    function renderContent() {
        for (const button of tabs.querySelectorAll("[data-tab]")) {
            const selected = button.dataset.tab === state.tab;
            button.setAttribute("aria-selected", String(selected));
            button.tabIndex = selected ? 0 : -1;
        }
        content.setAttribute("aria-labelledby", `tab-${state.tab}`);
        const query = state.query.trim();
        count.textContent = "";
        if (!lib.days.length) {
            content.replaceChildren(h("p", { class: "status" }, "The Library's first days are coming soon."));
            return;
        }
        if (query) {
            content.replaceChildren(...searchResults(query));
        } else if (state.tab === "books") {
            content.replaceChildren(...booksView());
        } else if (state.tab === "mine") {
            content.replaceChildren(...mineView());
        } else {
            content.replaceChildren(...monthsView());
        }
    }

    /** Everything that shows the reader's own record, after a Moment. */
    function renderMine() {
        const top = window.scrollY;
        refreshMine();
        renderStats();
        renderWeek();
        renderContent();
        window.scrollTo({ top, behavior: "instant" });
    }

    const viewHash = () => {
        if (state.tab === "books") {
            return state.book ? `#book/${encodeURIComponent(state.book)}` : "#books";
        }
        return state.tab === "mine" ? "#mine" : "";
    };

    function setView(next, { push = false } = {}) {
        Object.assign(state, next);
        writeStore(VIEW_KEY, state.tab);
        const url = location.pathname + location.search + viewHash();
        if (push) {
            history.pushState(null, "", url);
        } else {
            history.replaceState(null, "", url);
        }
        renderContent();
    }

    // ---------------------------------------------------------------- the day sheet

    const sheet = h("dialog", { class: "day-sheet", "aria-labelledby": "day-title" });
    const toast = h("p", { class: "lib-toast", role: "status", hidden: true });
    let toastTimer = 0;
    function say(message) {
        // Over an open sheet, the toast has to be in it to be seen.
        (sheet.open ? sheet : document.body).append(toast);
        toast.textContent = message;
        toast.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.hidden = true;
        }, TOAST_MS);
    }

    let openDayIso = null;
    // Opened by a tap here (so Back closes it), or straight from a link.
    let openedInPage = false;
    let loadId = 0;
    let respond = null;
    let sheetChanged = false;

    function respondBlock(day, entry) {
        const answer = String(answers[day.date] ?? "").trim();
        return answer
            ? h(
                  "section",
                  { class: "day-block day-answer" },
                  h("h3", {}, "Your answer"),
                  h("p", {}, answer),
                  entry?.question && h("p", { class: "day-question-small" }, entry.question),
              )
            : h(
                  "section",
                  { class: "day-block" },
                  h("h3", {}, "To consider"),
                  h("p", {}, entry?.question || "What is God saying to you through this verse today?"),
              );
    }

    function renderSheet(day) {
        const thisLoad = ++loadId;
        openDayIso = day.date;
        const at = lib.days.indexOf(day);
        const before = lib.days[at - 1];
        const after = lib.days[at + 1];

        const close = h("button", { type: "button", class: "day-close", "aria-label": "Close this day" }, "×");
        close.addEventListener("click", closeDay);
        const share = h("button", { type: "button", class: "day-share", "aria-label": "Share a link to this day", title: "Share a link to this day" });
        share.append(svg(SHARE_ICON));
        share.addEventListener("click", () => shareDay(day));

        let currentEntry = null;
        const verse = h("blockquote", {}, "Loading the verse…");
        respond = h("div", { class: "day-respond" }, respondBlock(day, null));
        const reflection = h("section", { class: "day-block" }, h("h3", {}, "Reflection"));
        const prayer = h("section", { class: "day-block day-prayer", hidden: true }, h("h3", {}, "Prayer"));

        const moment = element("daily-moment", {
            date: day.date,
            "verses-base": "../../assets/verses/",
            "flipbook-href": "flipbook.html",
            "library-href": "library.html",
        });
        moment.addEventListener("momentcomplete", () => {
            sheetChanged = true;
            refreshMine();
            respond.replaceChildren(respondBlock(day, currentEntry));
        });

        const step = (target, label, cls) =>
            target
                ? h(
                      "a",
                      {
                          class: `day-step ${cls}`,
                          href: `#day/${target.date}`,
                          "aria-label": `${label}: ${longDate(target.date)}, ${target.title}`,
                          onclick: (event) => {
                              event.preventDefault();
                              showDay(target.date);
                          },
                      },
                      cls === "is-before" ? `‹ ${shortDate(target.date)}` : `${shortDate(target.date)} ›`,
                  )
                : h("span", { class: `day-step ${cls} is-end` }, cls === "is-before" ? "The first day" : "Today is the newest");

        sheet.replaceChildren(
            h(
                "div",
                { class: "day-frame" },
                h(
                    "header",
                    { class: "day-bar" },
                    close,
                    h("p", { class: "day-when" }, longDate(day.date)),
                    share,
                ),
                h(
                    "div",
                    { class: "day-body" },
                    element("poster-card", { date: day.date }),
                    h("p", { class: "eyebrow" }, lib.months.get(day.date.slice(0, 7)) || "The day's theme"),
                    h("h2", { id: "day-title", tabindex: "-1" }, day.title),
                    h("figure", { class: "day-verse" }, verse, h("figcaption", {}, day.ref)),
                    reflection,
                    respond,
                    prayer,
                    moment,
                    h(
                        "a",
                        { class: "lib-button day-flipbook", href: `flipbook.html?date=${day.date}` },
                        svg(FLIPBOOK_ICON),
                        "Read this week's Flipbook",
                    ),
                ),
                h("nav", { class: "day-nav", "aria-label": "Other days" }, step(before, "The day before", "is-before"), step(after, "The day after", "is-after")),
            ),
        );
        sheet.querySelector(".day-body").scrollTop = 0;

        loadVerses(VERSES_BASE, [dayName(day.date)])
            .then((entries) => {
                if (thisLoad !== loadId) {
                    return;
                }
                currentEntry = entries.get(dayName(day.date)) ?? null;
                if (!currentEntry) {
                    verse.textContent = "This day's verse could not be found.";
                    return;
                }
                verse.textContent = currentEntry.text;
                reflection.append(
                    ...String(currentEntry.reflection)
                        .split(/\n\s*\n/)
                        .filter((part) => part.trim())
                        .map((part) => h("p", {}, part.trim())),
                );
                respond.replaceChildren(respondBlock(day, currentEntry));
                if (currentEntry.prayer) {
                    prayer.append(h("p", {}, currentEntry.prayer));
                    prayer.hidden = false;
                }
            })
            .catch((error) => {
                if (thisLoad === loadId) {
                    console.warn("The day's verse could not be loaded:", error);
                    verse.textContent = "This day's verse needs a connection to load.";
                }
            });
    }

    /** Move the open sheet to another day; Back still closes the sheet. */
    function showDay(iso) {
        const day = byDate.get(iso);
        if (!day) {
            return;
        }
        history.replaceState(null, "", `${location.pathname}${location.search}#day/${iso}`);
        renderSheet(day);
        sheet.querySelector("#day-title").focus({ preventScroll: true });
    }

    function openDay(iso) {
        const day = byDate.get(iso);
        if (!day) {
            say(
                iso < lib.start
                    ? `The Grace Library begins on ${format(lib.start, { month: "long", day: "numeric", year: "numeric" })}.`
                    : iso > lib.today
                      ? "That day isn't here yet."
                      : "That day isn't in the Library.",
            );
            history.replaceState(null, "", location.pathname + location.search + viewHash());
            hideSheet();
            return;
        }
        if (openDayIso !== iso || !sheet.open) {
            renderSheet(day);
        }
        if (!sheet.open) {
            sheet.showModal();
            document.documentElement.classList.add("day-sheet-open");
        }
        sheet.querySelector("#day-title").focus({ preventScroll: true });
    }

    function hideSheet() {
        if (!sheet.open) {
            return;
        }
        sheet.close();
    }

    sheet.addEventListener("close", () => {
        document.documentElement.classList.remove("day-sheet-open");
        const was = openDayIso;
        openDayIso = null;
        loadId += 1;
        // Stop the narration and video with the poster.
        sheet.replaceChildren();
        if (sheetChanged) {
            sheetChanged = false;
            renderMine();
        }
        content.querySelector(`.lib-tile[data-date="${was}"]`)?.focus({ preventScroll: true });
    });

    // A day opened straight from another Daily Grace page (a verse's strip in
    // the Bible search, the Moment's catch-up link) closes back to that page,
    // which picks up where the reader left it. Only the first time: after
    // that the reader is browsing the Library.
    let cameFromSite = false;
    try {
        const from = new URL(document.referrer);
        cameFromSite =
            from.origin === location.origin &&
            from.pathname !== location.pathname &&
            history.length > 1;
    } catch {
        cameFromSite = false;
    }

    function closeDay() {
        if (openedInPage || cameFromSite) {
            openedInPage = false;
            cameFromSite = false;
            history.back();
            return;
        }
        history.replaceState(null, "", location.pathname + location.search + viewHash());
        hideSheet();
    }

    sheet.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeDay();
    });
    sheet.addEventListener("click", (event) => {
        if (event.target === sheet) {
            closeDay();
        }
    });
    sheet.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
            return;
        }
        if (event.target.closest("input, textarea, [contenteditable]")) {
            return;
        }
        const target = sheet.querySelector(event.key === "ArrowLeft" ? "a.day-step.is-before" : "a.day-step.is-after");
        if (target) {
            event.preventDefault();
            showDay(target.getAttribute("href").slice(5));
        }
    });

    // A sideways swipe on the sheet's text (not the poster, which turns, or
    // the Moment's card) steps a day.
    let swipe = null;
    sheet.addEventListener("pointerdown", (event) => {
        if (event.pointerType === "mouse" || event.target.closest("poster-card, daily-moment, a, button")) {
            swipe = null;
            return;
        }
        swipe = { x: event.clientX, y: event.clientY };
    });
    sheet.addEventListener("pointerup", (event) => {
        if (!swipe) {
            return;
        }
        const dx = event.clientX - swipe.x;
        const dy = event.clientY - swipe.y;
        swipe = null;
        if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < 2 * Math.abs(dy)) {
            return;
        }
        const target = sheet.querySelector(dx > 0 ? "a.day-step.is-before" : "a.day-step.is-after");
        if (target) {
            showDay(target.getAttribute("href").slice(5));
        }
    });
    sheet.addEventListener("pointercancel", () => {
        swipe = null;
    });

    async function shareDay(day) {
        const url = `${location.origin}${location.pathname}#day/${day.date}`;
        const title = `Daily Grace — ${day.title}`;
        if (navigator.share) {
            try {
                await navigator.share({ title, text: `${day.title} (${day.ref}), ${longDate(day.date)}`, url });
                return;
            } catch (error) {
                if (error.name === "AbortError") {
                    return;
                }
            }
        }
        try {
            await navigator.clipboard.writeText(url);
            say("Link copied");
        } catch {
            say("Couldn't copy the link");
        }
    }

    // ---------------------------------------------------------------- routes

    let rendered = false;

    function route({ fromNavigation }) {
        const hash = decodeURIComponent(location.hash.slice(1));
        const dayMatch = /^day\/(\d{4}-\d{2}-\d{2})$/.exec(hash);
        if (dayMatch) {
            if (fromNavigation && !sheet.open) {
                openedInPage = true;
            }
            // Arriving straight on a day, the Library is drawn behind it too.
            if (!rendered) {
                expanded.add(dayMatch[1].slice(0, 7));
                const saved = readStore(VIEW_KEY, "months");
                Object.assign(state, { tab: TABS.some((t) => t.key === saved) ? saved : "months", book: null });
                renderContent();
                rendered = true;
            }
            openDay(dayMatch[1]);
            return;
        }
        openedInPage = false;
        cameFromSite = false;
        hideSheet();
        const bookMatch = /^book\/(.+)$/.exec(hash);
        const monthMatch = /^month\/(\d{4}-\d{2})$/.exec(hash);
        let next = { tab: "months", book: null };
        if (bookMatch) {
            next = { tab: "books", book: books.includes(bookMatch[1]) ? bookMatch[1] : null };
        } else if (hash === "books") {
            next = { tab: "books", book: null };
        } else if (hash === "mine") {
            next = { tab: "mine", book: null };
        } else if (!fromNavigation && !hash) {
            const saved = readStore(VIEW_KEY, "months");
            next = { tab: TABS.some((t) => t.key === saved) ? saved : "months", book: null };
        }
        if (monthMatch) {
            expanded.add(monthMatch[1]);
        }
        // Back from a day lands on the view it was opened from, already drawn.
        const same = rendered && !monthMatch && next.tab === state.tab && next.book === state.book;
        Object.assign(state, next);
        writeStore(VIEW_KEY, state.tab);
        if (!same) {
            renderContent();
            rendered = true;
        }
        if (monthMatch) {
            document.getElementById(`month-${monthMatch[1]}`)?.scrollIntoView();
        } else if (fromNavigation && state.tab === "books") {
            content.scrollIntoView({ block: "start" });
        }
    }

    renderStats();
    renderWeek();
    view.replaceChildren(hero, week, count, content);
    document.body.append(sheet, toast);
    window.addEventListener("hashchange", () => route({ fromNavigation: true }));
    route({ fromNavigation: false });
}
