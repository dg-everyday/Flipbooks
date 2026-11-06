/**
 * My Faith Journal: what the journal's screens share (journal.js,
 * journal-entry.js, journal-backup.js): the names of the kinds of entry,
 * days written out, bookmarks as cards, and the icons.
 */

export const escapeHtml = (text) =>
    String(text ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The kinds of entry, in the folder pane's order. */
export const KIND_LABELS = {
    log: "Daily Log",
    discovery: "Discoveries",
    diary: "My Diary",
    notebook: "Notebook",
    prayer: "Prayer List",
};
export const KIND_ORDER = ["log", "discovery", "diary", "notebook", "prayer"];
// One entry's kind, in the singular, for its own page.
export const KIND_ONE = {
    log: "Daily Log",
    discovery: "Discovery",
    diary: "My Diary",
    notebook: "Notebook",
    prayer: "Prayer",
};

/* ---------- Days ---------- */

// A YYYY-MM-DD day at noon UTC, so no time zone can move it to another day.
const asDate = (iso) => new Date(`${iso}T12:00:00Z`);

/** "Friday, November 6, 2026" */
export function formatDay(iso, { weekday = true } = {}) {
    return new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC",
        weekday: weekday ? "long" : undefined,
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(asDate(iso));
}

/** "Nov 6" */
export function shortDay(iso) {
    return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" }).format(asDate(iso));
}

/** "November 2026" */
export function monthName(iso) {
    return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", year: "numeric" }).format(asDate(iso));
}

/** The day's name in the verse files: "November 6, 2026". */
export function verseFileName(iso) {
    return formatDay(iso, { weekday: false });
}

export function addDays(iso, days) {
    const date = asDate(iso);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
}

/* ---------- Bookmarks as cards ---------- */

/**
 * A bookmark as a card in an entry: { kind, id, title, text, reference },
 * the kind being bookmark-manager's (verses, facts, sayings, guidance,
 * blueprint, redLetter).
 */
export function cardFromBookmark(kind, item) {
    switch (kind) {
        case "verses": {
            const reference = `${item.book_name} ${item.chapter}:${item.verse}`;
            return { kind, id: String(item.docid), title: reference, text: item.text ?? "", reference };
        }
        case "facts":
            return { kind, id: String(item.id), title: item.title ?? "", text: item.text ?? "", reference: item.reference ?? "" };
        case "sayings":
            return {
                kind,
                id: String(item.id),
                title: item.saying ?? "",
                text: item.kjv_text || item.meaning || "",
                reference: item.reference ?? "",
            };
        case "guidance":
            return { kind, id: String(item.id), title: item.name || item.question || "", text: item.summary ?? "", reference: "" };
        case "blueprint":
            return { kind, id: String(item.id), title: item.name ?? "", text: item.summary || item.plain || "", reference: "" };
        case "redLetter":
            return {
                kind,
                id: String(item.id),
                title: item.name || item.reference || "",
                text: item.text ?? "",
                reference: item.reference ?? "",
            };
        default:
            return { kind, id: String(item.id ?? ""), title: item.title ?? "", text: item.text ?? "", reference: "" };
    }
}

export const BOOKMARK_LABELS = {
    verses: "Bible Verse",
    facts: "Did You Know",
    sayings: "Bible Saying",
    guidance: "Guidance for Life",
    blueprint: "God's Blueprint",
    redLetter: "Jesus' Words",
};

/** A card's HTML; `removable` adds a button to take it out of the entry. */
export function cardHtml(card, { removable = false } = {}) {
    const reference = card.reference && card.reference !== card.title ? `<cite>${escapeHtml(card.reference)}</cite>` : "";
    return `
      <figure class="card" data-kind="${escapeHtml(card.kind)}" data-id="${escapeHtml(card.id)}">
        <figcaption><span class="card-kind">${escapeHtml(BOOKMARK_LABELS[card.kind] ?? "Bookmark")}</span>
          <strong>${escapeHtml(card.title)}</strong></figcaption>
        ${card.text ? `<p>${escapeHtml(card.text)}</p>` : ""}
        ${reference}
        ${removable ? `<button class="card-remove" type="button" aria-label="Take ${escapeHtml(card.title)} out of this entry" title="Take out">${ICONS.close}</button>` : ""}
      </figure>`;
}

/* ---------- Icons ---------- */

const ICON = (paths) =>
    `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

export const ICONS = {
    today: ICON('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    all: ICON('<path d="M4 6h16M4 12h16M4 18h10"/>'),
    log: ICON('<path d="M4 4h12l4 4v12H4z"/><path d="M8 10h8M8 14h8M8 18h5"/>'),
    discovery: ICON('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'),
    diary: ICON('<path d="M6 3h11a1 1 0 0 1 1 1v17l-6.5-3L5 21V4a1 1 0 0 1 1-1z"/>'),
    notebook: ICON('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
    prayer: ICON('<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/>'),
    flag: ICON('<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>'),
    bookmark: ICON('<path d="M6 3h12v18l-6-4-6 4z"/>'),
    stickers: ICON('<path d="M12 2l2.9 6.9L22 9.3l-5.5 4.6L18.2 21 12 17.3 5.8 21l1.7-7.1L2 9.3l7.1-.4z"/>'),
    book: ICON('<path d="M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2z"/><path d="M5 19a2 2 0 0 1 2-2h12"/><path d="M9 7h6M9 11h4"/>'),
    backup: ICON('<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>'),
    year: ICON('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    help: ICON('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7"/><path d="M12 17h.01"/>'),
    plus: ICON('<path d="M12 5v14M5 12h14"/>'),
    back: ICON('<path d="m15 6-6 6 6 6"/>'),
    close: ICON('<path d="M6 6l12 12M18 6 6 18"/>'),
    search: ICON('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    edit: ICON('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
    trash: ICON('<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    menu: ICON('<path d="M4 6h16M4 12h16M4 18h16"/>'),
};
