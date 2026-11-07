/**
 * My Faith Journal, for journal.html (docs/faith-journal/plan.md): the
 * reader's logbook of their walk with God, kept on this device.
 *
 * Three panes, as in a mail program: the folders, the list, and the open
 * page. A wide screen shows all three side by side; a phone shows one at a
 * time, with a back button.
 *
 *   Folders   Today · All entries · Daily Log · Discoveries · My Diary ·
 *             Notebook · Prayer List · Flagged; the six kinds of bookmark;
 *             My Sticker Album; the years of the journal; the year as a
 *             Word book (journal-word.js); Backup & restore; How My Faith
 *             Journal works (<dg-guide>). A ? beside
 *             the Bookmarks and Stickers headings opens Bookmarking 101 and
 *             How to earn stickers.
 *             An entry dragged onto a kind's folder moves to that kind.
 *   List      the folder's entries, newest first, grouped Today / Yesterday /
 *             This week / by month, with a search; in a bookmark folder, the
 *             bookmarks with their notes, each with "Add to journal" (and
 *             draggable onto an entry being written).
 *   Page      an entry, read or written (journal-entry.js); Today
 *             (journal-today.js, with "Write today's log" in the bar above
 *             it); or the Sticker Album (stickers.js).
 *
 * Bookmarking itself is unchanged: My Bookmarks (<bookmark-manager>) opens
 * from the bookmark folders, and the journal only reads the bookmarks and
 * their notes (bookmark-manager's items()). Answers to the Daily Moment come
 * in as Daily Log entries (assets/scripts/journal/moment-answers.js).
 *
 * The address keeps the place: #<folder>, #<folder>/entry/<id> (reading),
 * #<folder>/edit/<id> (writing), #<folder>/new/<kind>, #<folder>/write/<day>
 * (that day's Daily Log entry, ready to write in: the Moment's answer if one
 * was written, else a new entry with the day's verse and question; the
 * Moment's Amen screen links here), #<folder>/walk/<episode id> (the answer
 * to a Bible Walk episode's question: the one written before, else a new
 * Daily Log entry with the question; "Write my answer" on bible-walk.html
 * links here), and #folders (a phone's folder pane). Folders: today, all, log, discovery, diary,
 * notebook, prayer, flagged, stickers, bookmarks:<kind>.
 */

import * as store from "../../../assets/scripts/journal/store.js?v=20261106-3";
import { importMomentAnswers } from "../../../assets/scripts/journal/moment-answers.js?v=20261106-3";
import { fieldsText, moodLabel } from "../../../assets/scripts/journal/kinds.js?v=20261106-1";
import { BOOKMARK_KINDS } from "../../components/bookmark-manager.js?v=20261106-1";
import { start as startAlbum } from "./stickers.js?v=20261030-1";
import { BOOKMARK_TYPE, EntryEditor, readHtml } from "./journal-entry.js?v=20261106-3";
import { openBackupDialog } from "./journal-backup.js?v=20261106-3";
import { openWordDialog } from "./journal-word.js?v=20261106-3";
import { dayVerse, noteVisit, todayAction, todayHtml } from "./journal-today.js?v=20261106-3";
import {
    BOOKMARK_LABELS,
    ICONS,
    KIND_LABELS,
    KIND_ORDER,
    addDays,
    cardFromBookmark,
    escapeHtml,
    monthName,
    shortDay,
} from "./journal-ui.js?v=20261106-2";

const ENTRY_TYPE = "application/x-dailygrace-entry";
const STICKERS_KEY = "dailygrace:stickers";
const PHONE = matchMedia("(max-width: 899px)");

const FOLDER_TITLES = {
    today: "Today",
    all: "All entries",
    flagged: "Flagged",
    stickers: "My Sticker Album",
    ...KIND_LABELS,
};

const state = {
    year: Number(store.todayIso().slice(0, 4)),
    folder: "today",
    open: null, // { id, edit } or { kind } for a new entry
    phoneFolders: false,
    entries: [],
    search: "",
    draft: null, // what the next new entry starts with
    closedYears: new Set(), // years whose journal is closed: read, not changed
    welcomeBack: false,
    milestone: null,
};

let els = null;
let editor = null;
let album = null;
const bookmarkItems = new Map();

/* ---------- Places ---------- */

function isFolder(folder) {
    return (
        Object.hasOwn(FOLDER_TITLES, folder) ||
        BOOKMARK_KINDS.some(({ key }) => folder === `bookmarks:${key}`)
    );
}

/** The place in the address, or null when the address is not the journal's (a sticker's #HB-01). */
function parseHash() {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (!hash) {
        return { folder: "today", open: null, phoneFolders: false };
    }
    if (hash === "folders") {
        return { folder: state.folder, open: null, phoneFolders: true };
    }
    const [folder, what, id] = hash.split("/");
    if (!isFolder(folder)) {
        return null;
    }
    if ((what === "entry" || what === "edit") && id) {
        return { folder, open: { id, edit: what === "edit" }, phoneFolders: false };
    }
    if (what === "new") {
        return { folder, open: { kind: KIND_LABELS[id] ? id : "log" }, phoneFolders: false };
    }
    if (what === "write") {
        return { folder, open: { write: /^\d{4}-\d{2}-\d{2}$/.test(id ?? "") ? id : store.todayIso() }, phoneFolders: false };
    }
    if (what === "walk" && /^[a-z0-9-]+$/.test(id ?? "")) {
        return { folder, open: { walk: id }, phoneFolders: false };
    }
    return { folder, open: null, phoneFolders: false };
}

function hashFor(folder, open) {
    if (!open) {
        return `#${folder}`;
    }
    if (open.kind) {
        return `#${folder}/new/${open.kind}`;
    }
    return `#${folder}/${open.edit ? "edit" : "entry"}/${open.id}`;
}

function go(folder, open = null) {
    const hash = hashFor(folder, open);
    if (location.hash === hash) {
        route();
    } else {
        location.hash = hash;
    }
}

const samePage = (a, b) =>
    (a === null && b === null) ||
    (a !== null && b !== null && a.id === b.id && a.edit === b.edit && a.kind === b.kind);

/** Where #…/write/<day> leads: the day's Moment entry, or a new Daily Log entry for the day. */
async function resolveWrite(day) {
    const answered = await store.entryBySource(`moment:${day}`);
    if (answered) {
        return { id: answered.id, edit: true };
    }
    const verse = await dayVerse(day);
    state.draft = { day, verse: verse?.verse ?? "", prompt: verse?.question ?? "" };
    return { kind: "log" };
}

/**
 * Where #…/walk/<episode id> leads: the answer to that Bible Walk episode's
 * question written before, else a new Daily Log entry with the question.
 */
async function resolveWalk(id) {
    const sourceKey = `walk:${id}`;
    const answered = await store.entryBySource(sourceKey);
    if (answered) {
        return { id: answered.id, edit: true };
    }
    let episode = null;
    try {
        const { loadWalk } = await import("../../../assets/scripts/bible-walk/progress.js?v=20261107-1");
        episode = (await loadWalk()).episodes[id] ?? null;
    } catch {
        // Offline or no such episode: an empty Daily Log entry still opens.
    }
    state.draft = episode
        ? {
              verse: `Bible Walk · ${episode.chapter ? `${episode.label}: ${episode.title}` : episode.title}`,
              prompt: episode.question,
              source: "walk",
              sourceKey,
          }
        : null;
    return { kind: "log" };
}

async function route() {
    const target = parseHash();
    if (!target) {
        return;
    }
    if (target.open?.write) {
        target.open = await resolveWrite(target.open.write);
        history.replaceState(null, "", hashFor(target.folder, target.open));
    }
    if (target.open?.walk) {
        target.open = await resolveWalk(target.open.walk);
        history.replaceState(null, "", hashFor(target.folder, target.open));
    }
    // Today and the album are pages of their own; elsewhere an open entry
    // stays open while another folder is browsed.
    const ownPage = (folder) => folder === "today" || folder === "stickers";
    const keepPage = samePage(state.open, target.open) && !ownPage(state.folder) && !ownPage(target.folder);
    if (editor && !keepPage) {
        await editor.save();
        editor = null;
    }
    const folderChanged = target.folder !== state.folder;
    state.folder = target.folder;
    state.open = target.open;
    state.phoneFolders = target.phoneFolders;
    if (folderChanged) {
        state.search = "";
    }
    renderFolders();
    await renderList();
    if (!keepPage || !els.page.hasChildNodes()) {
        await renderPage();
    }
    els.root.dataset.show = state.phoneFolders
        ? "folders"
        : state.open || state.folder === "today" || state.folder === "stickers"
          ? "page"
          : "list";
    els.root.dataset.wide = state.folder === "stickers" ? "true" : "false";
}

/* ---------- Data ---------- */

async function loadEntries() {
    state.entries = await store.entriesForYear(state.year);
}

function readList(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function stickerCount() {
    try {
        return Object.keys(JSON.parse(localStorage.getItem(STICKERS_KEY))?.earned ?? {}).length;
    } catch {
        return 0;
    }
}

/**
 * One kind of bookmark, from My Bookmarks, read once until the bookmarks
 * change. Each kind on its own: a folder need not wait for the Bible and the
 * facts databases to load.
 */
function loadBookmarkKind(kind) {
    if (!bookmarkItems.has(kind)) {
        bookmarkItems.set(
            kind,
            els.bookmarks.items([kind]).then(
                (items) => items[kind] ?? [],
                (error) => {
                    bookmarkItems.delete(kind);
                    throw error;
                },
            ),
        );
    }
    return bookmarkItems.get(kind);
}

/** Every bookmark, kind by kind: { verses: [...], facts: [...], … }. */
async function loadBookmarkItems() {
    const kinds = BOOKMARK_KINDS.map(({ key }) => key);
    const lists = await Promise.all(kinds.map(loadBookmarkKind));
    return Object.fromEntries(kinds.map((key, i) => [key, lists[i]]));
}

function folderEntries(folder) {
    const today = store.todayIso();
    switch (folder) {
        case "all":
            return state.entries;
        case "today":
            return state.entries.filter((entry) => entry.day === today);
        case "flagged":
            return state.entries.filter((entry) => entry.flag);
        default:
            return KIND_LABELS[folder] ? state.entries.filter((entry) => entry.kind === folder) : [];
    }
}

function matches(entry, search) {
    if (!search) {
        return true;
    }
    const haystack = [
        entry.title,
        store.bodyText(entry.body),
        fieldsText(entry),
        moodLabel(entry.mood),
        entry.verse,
        entry.prompt,
        entry.categories.join(" "),
        entry.cards.map((card) => `${card.title} ${card.text}`).join(" "),
    ]
        .join(" ")
        .toLowerCase();
    return search
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every((word) => haystack.includes(word));
}

/* ---------- Folders ---------- */

/** The ? at the right of a folder heading, opening that part's guide. */
function groupHelp(guide, title) {
    return `<button class="group-help" type="button" data-action="guide" data-guide="${guide}" aria-label="${escapeHtml(title)}" title="${escapeHtml(title)}">${ICONS.help}</button>`;
}

function renderFolders() {
    const current = state.folder;
    const link = (folder, label, icon, count = null) => `
      <a class="folder" href="#${folder}" data-folder="${folder}" ${folder === current ? 'aria-current="page"' : ""}>
        <span class="folder-icon">${icon}</span>
        <span class="folder-label">${escapeHtml(label)}</span>
        ${count === null ? "" : `<span class="count">${count}</span>`}
      </a>`;
    const count = (folder) => folderEntries(folder).length;
    const thisYear = Number(store.todayIso().slice(0, 4));

    els.folders.innerHTML = `
      <nav aria-label="My Faith Journal">
        <h2 class="pane-title">My Faith Journal <span class="year-badge">${state.year}</span></h2>
        ${link("today", "Today", ICONS.today)}
        ${link("all", "All entries", ICONS.all, count("all"))}
        ${KIND_ORDER.map((kind) => link(kind, KIND_LABELS[kind], ICONS[kind], count(kind))).join("")}
        ${link("flagged", "Flagged", ICONS.flag, count("flagged"))}
        <h3 class="folder-group">Bookmarks${groupHelp("bookmarks", "Bookmarking 101")}</h3>
        ${BOOKMARK_KINDS.map(({ key, label, store: storeKey }) =>
            link(`bookmarks:${key}`, label, ICONS.bookmark, readList(storeKey).length),
        ).join("")}
        <h3 class="folder-group">Stickers${groupHelp("stickers", "How to earn stickers")}</h3>
        ${link("stickers", "My Sticker Album", ICONS.stickers, stickerCount())}
        <h3 class="folder-group">Years</h3>
        <div class="years"></div>
        <button class="folder backup-button" type="button" data-action="word">
          <span class="folder-icon">${ICONS.book}</span><span class="folder-label">${state.year} as a Word book</span>
        </button>
        <button class="folder" type="button" data-action="backup">
          <span class="folder-icon">${ICONS.backup}</span><span class="folder-label">Backup &amp; restore</span>
        </button>
        <button class="folder help-button" type="button" data-action="guide" data-guide="journal">
          <span class="folder-icon">${ICONS.help}</span><span class="folder-label">How My Faith Journal works</span>
        </button>
      </nav>`;

    store.volumes().then((volumes) => {
        state.closedYears = new Set(volumes.filter((v) => v.closed).map((v) => v.year));
        const years = [...new Set([thisYear, ...volumes.map((v) => v.year)])].sort((a, b) => b - a);
        const shelf = els.folders.querySelector(".years");
        if (shelf) {
            shelf.innerHTML = years
                .map(
                    (year) =>
                        `<button class="year" type="button" data-year="${year}" aria-pressed="${year === state.year}" ${
                            state.closedYears.has(year) ? `title="Closed: kept to read"` : ""
                        }>${ICONS.year} ${year}${state.closedYears.has(year) ? '<span class="visually-hidden"> (closed)</span>' : ""}</button>`,
                )
                .join("");
        }
    });
}

/* ---------- The list ---------- */

function groupName(day, today) {
    if (day === today) {
        return "Today";
    }
    if (day > today) {
        return "Days ahead";
    }
    if (day === addDays(today, -1)) {
        return "Yesterday";
    }
    if (day > addDays(today, -7)) {
        return "This week";
    }
    return monthName(day);
}

/** An entry's first words: its main words, else its other parts, a bookmark or the day's question. */
function preview(entry) {
    const text = `${store.bodyText(entry.body)} ${fieldsText(entry)}`.replace(/\s+/g, " ").trim();
    return text || entry.cards[0]?.title || entry.prompt || "";
}

function entryRowsHtml(list) {
    if (!list.length) {
        return "";
    }
    const today = store.todayIso();
    let group = null;
    let html = "";
    for (const entry of list) {
        const name = groupName(entry.day, today);
        if (name !== group) {
            group = name;
            html += `<h3 class="list-group">${escapeHtml(name)}</h3>`;
        }
        const open = state.open?.id === entry.id;
        html += `
          <a class="row" href="${hashFor(state.folder, { id: entry.id, edit: false })}" data-id="${entry.id}" draggable="true" ${open ? 'aria-current="true"' : ""}>
            <span class="row-top">
              <span class="row-title">${escapeHtml(entry.title || KIND_LABELS[entry.kind])}</span>
              <span class="row-day">${escapeHtml(shortDay(entry.day))}</span>
            </span>
            <span class="row-text">${escapeHtml(preview(entry).slice(0, 140))}</span>
            <span class="row-meta">
              ${state.folder === "all" || state.folder === "flagged" || state.folder === "today" ? `<span class="tag">${escapeHtml(KIND_LABELS[entry.kind])}</span>` : ""}
              ${entry.verse ? `<span class="tag verse">${escapeHtml(entry.verse)}</span>` : ""}
              ${entry.categories.map((c) => `<span class="tag">${escapeHtml(c)}</span>`).join("")}
              ${entry.flag ? `<span class="row-flag" title="Flagged">${ICONS.flag}</span>` : ""}
              ${entry.kind === "prayer" && entry.prayer?.answered ? `<span class="tag answered">Answered</span>` : ""}
            </span>
          </a>`;
    }
    return html;
}

function bookmarkRowsHtml(kind, items) {
    return items
        .map((item) => {
            const card = cardFromBookmark(kind, item);
            return `
          <div class="row bookmark-row" draggable="true" data-card="${escapeHtml(JSON.stringify(card))}">
            <span class="row-top"><span class="row-title">${escapeHtml(card.title)}</span></span>
            ${card.text ? `<span class="row-text">${escapeHtml(card.text.slice(0, 160))}</span>` : ""}
            ${item.note ? `<span class="row-note">${escapeHtml(item.note)}</span>` : ""}
            <span class="row-actions"><button class="button small" type="button" data-action="add-card">${ICONS.plus} Add to journal</button></span>
          </div>`;
        })
        .join("");
}

/** An empty bookmark folder: how to bookmark, from Bookmarking 101. */
function emptyBookmarksHtml() {
    return `
      <div class="empty-help">
        <p><strong>Nothing bookmarked here yet.</strong></p>
        <ol>
          <li>On the home page or a study page, press and hold a verse or a card for half a second.</li>
          <li>It glows gold and a ribbon appears: it is bookmarked.</li>
          <li>Add a note on why it matters, or Skip. It then shows here, ready to put into an entry.</li>
        </ol>
        <button class="link-button" type="button" data-action="guide" data-guide="bookmarks">${ICONS.help} The whole of Bookmarking 101</button>
      </div>`;
}

function emptyText(folder) {
    if (state.search) {
        return "Nothing matches your search.";
    }
    if (folder.startsWith("bookmarks:")) {
        return "Nothing bookmarked here yet. Hold a card on the home page to bookmark it.";
    }
    if (folder === "flagged") {
        return "Flag an entry to find it here again.";
    }
    if (folder === "today") {
        return "Nothing written today yet.";
    }
    return "No entries yet. A single line is a whole entry.";
}

async function renderList() {
    const folder = state.folder;
    const bookmarkKind = folder.startsWith("bookmarks:") ? folder.slice("bookmarks:".length) : null;
    const title = bookmarkKind
        ? BOOKMARK_KINDS.find(({ key }) => key === bookmarkKind)?.label
        : FOLDER_TITLES[folder];
    const newKind = KIND_LABELS[folder] ? folder : "log";

    els.list.innerHTML = `
      <div class="pane-bar">
        <button class="icon-button phone-only" type="button" data-action="folders" aria-label="Folders">${ICONS.menu}</button>
        <h2 class="pane-title">${escapeHtml(title ?? "")}</h2>
        ${
            bookmarkKind
                ? `<button class="button small" type="button" data-action="manage">${ICONS.bookmark} My Bookmarks</button>`
                : state.closedYears.has(state.year)
                  ? `<span class="closed-note">${state.year} · closed</span>`
                  : `<button class="button small primary" type="button" data-action="new" data-kind="${newKind}">${ICONS.plus} New</button>`
        }
      </div>
      <label class="search">
        <span class="visually-hidden">Search</span>${ICONS.search}
        <input type="search" placeholder="Search ${escapeHtml((title ?? "").toLowerCase())}" value="${escapeHtml(state.search)}" />
      </label>
      <div class="rows" aria-live="polite"></div>`;
    await renderRows();
}

async function renderRows() {
    const rows = els.list.querySelector(".rows");
    if (!rows) {
        return;
    }
    const folder = state.folder;
    if (folder.startsWith("bookmarks:")) {
        const kind = folder.slice("bookmarks:".length);
        // Nothing kept of this kind: say how to bookmark at once, without
        // waiting for the Bible or the facts to load.
        const storeKey = BOOKMARK_KINDS.find(({ key }) => key === kind)?.store;
        if (!readList(storeKey).length) {
            rows.innerHTML = emptyBookmarksHtml();
            return;
        }
        rows.innerHTML = `<p class="status">Opening your bookmarks…</p>`;
        try {
            const items = await loadBookmarkKind(kind);
            if (state.folder !== folder) {
                return;
            }
            const shown = items.filter((item) => {
                const card = cardFromBookmark(kind, item);
                return matches(
                    { title: card.title, body: "", verse: card.reference, prompt: item.note ?? "", categories: [], cards: [card] },
                    state.search,
                );
            });
            rows.innerHTML = shown.length
                ? bookmarkRowsHtml(kind, shown)
                : state.search
                  ? `<p class="status">${escapeHtml(emptyText(folder))}</p>`
                  : emptyBookmarksHtml();
        } catch (error) {
            console.warn("The bookmarks could not be read:", error);
            rows.innerHTML = `<p class="status">Your bookmarks could not be opened. Check your connection and try again.</p>`;
        }
        return;
    }
    if (folder === "stickers") {
        rows.innerHTML = "";
        return;
    }
    const list = folderEntries(folder).filter((entry) => matches(entry, state.search));
    rows.innerHTML = list.length ? entryRowsHtml(list) : `<p class="status">${escapeHtml(emptyText(folder))}</p>`;
}

/* ---------- The page ---------- */

/** The bar above the page: Back and its title on a phone, and `actions` at its right. */
function pageBar(title, actions = "") {
    return `
      <div class="pane-bar page-bar${actions ? " with-actions" : ""}">
        <button class="icon-button phone-only" type="button" data-action="back" aria-label="Back">${ICONS.back}</button>
        <h2 class="pane-title phone-only">${escapeHtml(title)}</h2>
        ${actions ? `<div class="bar-actions">${actions}</div>` : ""}
      </div>`;
}

async function renderPage() {
    const page = els.page;
    const open = state.open;

    if (open?.kind) {
        const draft = { kind: open.kind, day: store.todayIso(), ...(state.draft ?? {}) };
        state.draft = null;
        page.innerHTML = `${pageBar("New entry")}<div class="page-body"></div>`;
        editor = makeEditor(page.querySelector(".page-body"), null, draft);
        page.querySelector(".edit-body")?.focus();
        return;
    }
    if (open?.id) {
        const entry = state.entries.find((e) => e.id === open.id) ?? (await store.getEntry(open.id));
        if (!entry) {
            page.innerHTML = `${pageBar("")}<p class="status">This entry is no longer in your journal.</p>`;
            return;
        }
        page.innerHTML = `${pageBar(KIND_LABELS[entry.kind])}<div class="page-body"></div>`;
        const body = page.querySelector(".page-body");
        // A closed year's entries are read, never changed.
        const closed = state.closedYears.has(entry.year);
        if (open.edit && !closed) {
            editor = makeEditor(body, entry, {});
        } else {
            body.innerHTML = readHtml(entry, { closed });
        }
        return;
    }
    if (state.folder === "stickers") {
        page.innerHTML = `${pageBar("My Sticker Album")}`;
        if (!album) {
            album = document.createElement("div");
            album.className = "album";
            album.innerHTML = `<p class="status">Opening your sticker album…</p>`;
            startAlbum(album, els.sticker);
        }
        page.append(album);
        return;
    }
    if (state.folder === "today") {
        const write = `<button class="button small primary" type="button" data-action="write-today">${ICONS.edit} Write today's log</button>`;
        page.innerHTML = `${pageBar("Today", write)}<div class="page-body">${await todayHtml({ state, hashFor })}</div>`;
        return;
    }
    page.innerHTML = `<div class="page-empty"><p>Choose an entry, or write a new one.</p></div>`;
}

function makeEditor(container, entry, draft) {
    return new EntryEditor(container, {
        entry,
        draft,
        onSaved: async (saved, { created }) => {
            if (created) {
                // From now on it is this entry's page, without drawing it again.
                state.open = { id: saved.id, edit: true };
                history.replaceState(null, "", hashFor(state.folder, state.open));
                store.requestPersistence().catch(() => {});
            }
        },
        onDone: (saved) => {
            editor = null;
            go(state.folder === "today" && !saved ? "today" : state.folder, saved ? { id: saved.id, edit: false } : null);
        },
        onPick: () => openPicker(),
    });
}

/* ---------- Bookmarks into entries ---------- */

function addCard(card) {
    if (editor) {
        editor.addCard(card);
        toast(`“${card.title}” is in the entry.`);
        return;
    }
    // No entry being written: the bookmark starts a Discovery.
    state.draft = { cards: [card] };
    go("discovery", { kind: "discovery" });
}

async function openPicker() {
    const dialog = els.picker;
    dialog.innerHTML = `
      <div class="dialog-frame">
        <header class="dialog-head">
          <h2 id="picker-title">Add a bookmark</h2>
          <button class="icon-button" type="button" data-close aria-label="Close">${ICONS.close}</button>
        </header>
        <label class="search">${ICONS.search}<span class="visually-hidden">Search</span><input type="search" placeholder="Search your bookmarks" /></label>
        <div class="picker-list"><p class="status">Opening your bookmarks…</p></div>
      </div>`;
    dialog.onclick = (event) => {
        if (event.target === dialog || event.target.closest("[data-close]")) {
            dialog.close();
            return;
        }
        const row = event.target.closest("[data-card]");
        if (row) {
            addCard(JSON.parse(row.dataset.card));
            dialog.close();
        }
    };
    dialog.showModal();

    let cards = [];
    try {
        const items = await loadBookmarkItems();
        cards = BOOKMARK_KINDS.flatMap(({ key }) => (items[key] ?? []).map((item) => cardFromBookmark(key, item)));
    } catch {
        dialog.querySelector(".picker-list").innerHTML = `<p class="status">Your bookmarks could not be opened.</p>`;
        return;
    }
    const list = dialog.querySelector(".picker-list");
    const draw = (search) => {
        const shown = cards.filter((card) => matches({ title: card.title, body: "", verse: card.reference, prompt: "", categories: [], cards: [card] }, search));
        list.innerHTML = shown.length
            ? shown
                  .map(
                      (card) => `
              <button class="row picker-row" type="button" data-card="${escapeHtml(JSON.stringify(card))}">
                <span class="row-top"><span class="row-title">${escapeHtml(card.title)}</span><span class="tag">${escapeHtml(BOOKMARK_LABELS[card.kind])}</span></span>
                ${card.text ? `<span class="row-text">${escapeHtml(card.text.slice(0, 120))}</span>` : ""}
              </button>`,
                  )
                  .join("")
            : `<p class="status">${cards.length ? "Nothing matches your search." : "Nothing bookmarked yet. Hold a card on the home page to bookmark it."}</p>`;
    };
    draw("");
    dialog.querySelector("input").addEventListener("input", (event) => draw(event.target.value));
}

/* ---------- Little things ---------- */

function toast(text) {
    const note = document.createElement("p");
    note.className = "toast";
    note.setAttribute("role", "status");
    note.textContent = text;
    document.body.append(note);
    setTimeout(() => note.remove(), 3200);
}

let refreshing = null;
/** Something changed in the journal: draw the folders and the list again. */
function refresh() {
    if (refreshing) {
        return;
    }
    refreshing = setTimeout(async () => {
        refreshing = null;
        await loadEntries();
        renderFolders();
        // Keep the search box (and its focus) while the rows change.
        await renderRows();
    }, 150);
}

/* ---------- Start ---------- */

/**
 * Draws the journal into `root`. `bookmarks` is the page's
 * <bookmark-manager>; `sticker`, `picker`, `backup` and `word` are its
 * dialogs, and `guide` its <dg-guide>.
 */
export async function start({ root, bookmarks, sticker, picker, backup, word, guide }) {
    root.innerHTML = `
      <section class="pane folders-pane" aria-label="Folders"></section>
      <section class="pane list-pane" aria-label="List"></section>
      <section class="pane page-pane" aria-label="Page"></section>`;
    els = {
        root,
        bookmarks,
        sticker,
        picker,
        backup,
        folders: root.querySelector(".folders-pane"),
        list: root.querySelector(".list-pane"),
        page: root.querySelector(".page-pane"),
    };

    try {
        // A new year closes the last one before anything is drawn.
        await store.closePastYears();
        state.closedYears = new Set((await store.volumes()).filter((v) => v.closed).map((v) => v.year));
        state.welcomeBack = await noteVisit();
        await importMomentAnswers();
        await loadEntries();
    } catch (error) {
        console.error("The journal could not be opened:", error);
        root.innerHTML = `<p class="status">Your journal could not be opened. This browser may be in private mode, where nothing can be kept.</p>`;
        return;
    }

    // Folders, rows and buttons, wherever they are drawn.
    root.addEventListener("click", async (event) => {
        const folderLink = event.target.closest("a.folder[data-folder]");
        const target = folderLink?.dataset.folder;
        if (folderLink && !PHONE.matches && state.open && target !== "today" && target !== "stickers") {
            // On a wide screen the open page stays while another folder is browsed.
            event.preventDefault();
            go(target, state.open);
            return;
        }
        const button = event.target.closest("button[data-action], button.year");
        if (!button) {
            return;
        }
        if (button.matches("button.year")) {
            state.year = Number(button.dataset.year);
            await loadEntries();
            go("all");
            return;
        }
        switch (button.dataset.action) {
            case "folders":
                go("folders");
                break;
            case "back":
                go(state.open ? state.folder : "folders");
                break;
            case "new":
                state.draft = null;
                go(KIND_LABELS[state.folder] ? state.folder : button.dataset.kind, { kind: button.dataset.kind });
                break;
            case "write-today":
                state.draft = state.todayVerse ? { verse: state.todayVerse.verse, prompt: state.todayVerse.question ?? "" } : null;
                go("today", { kind: "log" });
                break;
            case "edit":
                go(state.folder, { id: state.open.id, edit: true });
                break;
            case "delete":
                if (confirm("Delete this entry from your journal?")) {
                    await store.deleteEntry(state.open.id);
                    await loadEntries();
                    go(state.folder);
                }
                break;
            case "manage":
                bookmarks.open();
                break;
            case "add-card":
                addCard(JSON.parse(button.closest("[data-card]").dataset.card));
                break;
            case "backup":
                openBackupDialog(backup);
                break;
            case "guide":
                guide?.show(button.dataset.guide);
                break;
            case "word":
                if (editor) {
                    await editor.save();
                }
                openWordDialog(word, state.year);
                break;
            default:
                if (button.dataset.action.startsWith("today:")) {
                    await todayAction(button.dataset.action, button, {
                        state,
                        redraw: renderPage,
                        openWord: (year) => openWordDialog(word, year),
                    });
                }
                break;
        }
    });

    root.addEventListener("input", (event) => {
        if (event.target.matches(".list-pane .search input")) {
            state.search = event.target.value;
            renderRows();
        }
    });

    // Dragging: a bookmark onto the entry being written, an entry onto a kind's folder.
    root.addEventListener("dragstart", (event) => {
        const bookmark = event.target.closest?.(".bookmark-row");
        if (bookmark) {
            event.dataTransfer.setData(BOOKMARK_TYPE, bookmark.dataset.card);
            event.dataTransfer.setData("text/plain", JSON.parse(bookmark.dataset.card).title);
            event.dataTransfer.effectAllowed = "copy";
            return;
        }
        const row = event.target.closest?.("a.row[data-id]");
        if (row) {
            event.dataTransfer.setData(ENTRY_TYPE, row.dataset.id);
            event.dataTransfer.effectAllowed = "move";
        }
    });
    root.addEventListener("dragover", (event) => {
        const folder = event.target.closest?.("a.folder[data-folder]");
        if (folder && KIND_LABELS[folder.dataset.folder] && event.dataTransfer.types.includes(ENTRY_TYPE)) {
            event.preventDefault();
            folder.classList.add("drop-target");
        }
    });
    root.addEventListener("dragleave", (event) => {
        event.target.closest?.("a.folder")?.classList.remove("drop-target");
    });
    root.addEventListener("drop", async (event) => {
        const folder = event.target.closest?.("a.folder[data-folder]");
        const id = event.dataTransfer.getData(ENTRY_TYPE);
        if (folder && id && KIND_LABELS[folder.dataset.folder]) {
            event.preventDefault();
            folder.classList.remove("drop-target");
            if (editor?.id === id) {
                await editor.save();
            }
            await store.updateEntry(id, { kind: folder.dataset.folder }, { newVersion: false });
            toast(`Moved to ${KIND_LABELS[folder.dataset.folder]}.`);
        }
    });

    // Bookmarks change in My Bookmarks: read them again when it closes.
    new MutationObserver(() => {
        if (!bookmarks.hasAttribute("open")) {
            bookmarkItems.clear();
            renderFolders();
            renderRows();
        }
    }).observe(bookmarks, { attributes: true, attributeFilter: ["open"] });

    window.addEventListener(store.JOURNAL_CHANGE, refresh);
    window.addEventListener("hashchange", route);
    // Leaving the page: keep what was typed.
    window.addEventListener("pagehide", () => editor?.save());
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            editor?.save();
        }
    });

    await route();
}
