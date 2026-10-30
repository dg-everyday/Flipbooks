/**
 * Notes on bookmarks: a few words the reader keeps with a bookmark, to come
 * back to, change or take off later, and to share with friends.
 *
 * When something is bookmarked, the store that keeps it (card-bookmarks.js, or
 * the verses' own in bible-search-results.js) calls askForNote(), and a small
 * box asks for a note: Save keeps it, Skip leaves the bookmark without one.
 * Taking the bookmark off takes its note with it (deleteNote()). In My
 * Bookmarks (<bookmark-manager>) each saved card carries a
 * <bookmark-note-box> from noteBox(): the note, a button to add or edit it,
 * and Share, which hands the item, the note and a link to the phone's share
 * sheet, or copies them where there is none.
 *
 * Notes are kept on this device, in localStorage under
 * dailygrace:bookmarks:notes, as { "<list key>": { "<id>": { text, updated } } },
 * so each note belongs to one bookmark of one list (dailygrace:bookmarks:facts, …).
 *
 * Usage
 *   import { askForNote, deleteNote, noteBox, readNote } from "./bookmark-notes.js?v=…";
 *   askForNote(key, id, title);   // once a bookmark is added
 *   deleteNote(key, id);          // once it is taken off
 *   card.append(noteBox(key, id, { title, text, reference, url }));
 *   readNote(key, id);            // the note, or ""
 *
 * card-bookmarks.js and bookmark-manager.js import this file with a ?v= token:
 * keep the two the same, or a second copy of the module loads.
 */

import { registerFonts } from "../../assets/scripts/fonts.js";

const NOTES_KEY = "dailygrace:bookmarks:notes";

/** The longest note kept, in characters: a few lines, as a post would be. */
export const NOTE_LIMIT = 280;

// Where a shared bookmark points when its list has no page of its own.
const SITE_URL = "https://dailygrace.faith/";

const ICON_ATTRS =
    'viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const PENCIL_ICON = `<svg ${ICON_ATTRS}><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></svg>`;
const SHARE_ICON = `<svg ${ICON_ATTRS}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>`;
const RIBBON_ICON = `<svg ${ICON_ATTRS}><path d="M6 3h12v18l-6-4.5L6 21z" fill="currentColor"/></svg>`;

// ------------------------------------------------------------------ the notes

/** Every box and list on the page hears here when a note changes. */
export const noteChanges = new EventTarget();

// The notes, parsed from storage once and kept until they change here or in
// another tab.
let saved = null;

window.addEventListener("storage", (event) => {
    if (event.key !== NOTES_KEY && event.key !== null) {
        return;
    }
    saved = null;
    noteChanges.dispatchEvent(new Event("change"));
});

/** Storage can be refused (private browsing, a full quota): a read falls back to none. */
function readAll() {
    if (!saved) {
        try {
            const value = JSON.parse(localStorage.getItem(NOTES_KEY));
            saved =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value
                    : {};
        } catch {
            saved = {};
        }
    }
    return saved;
}

/** The note on one bookmark, or "" if it has none. */
export function readNote(key, id) {
    const note = readAll()[key]?.[String(id)];
    return typeof note?.text === "string" ? note.text : "";
}

/**
 * Keeps text as the note on one bookmark; empty text takes the note off.
 * Returns false if the note could not be saved.
 */
export function writeNote(key, id, text) {
    const note = String(text ?? "")
        .trim()
        .slice(0, NOTE_LIMIT);
    if (note === readNote(key, id)) {
        return true;
    }
    const all = readAll();
    const notes = { ...all[key] };
    if (note) {
        notes[id] = { text: note, updated: new Date().toISOString() };
    } else {
        delete notes[id];
    }
    const next = { ...all, [key]: notes };
    if (!Object.keys(notes).length) {
        delete next[key];
    }
    try {
        localStorage.setItem(NOTES_KEY, JSON.stringify(next));
    } catch {
        return false;
    }
    saved = next;
    noteChanges.dispatchEvent(new Event("change"));
    return true;
}

/** Takes the note off a bookmark, if it has one. */
export function deleteNote(key, id) {
    return writeNote(key, id, "");
}

// ------------------------------------------------------------------ sharing

/** What a shared bookmark says: the item, the reader's note, and where it is from. */
export function shareText({ title, text, reference }, note) {
    const item = [title, text, reference ? `(${reference})` : ""]
        .filter(Boolean)
        .join("\n");
    return [item, note ? `My note: ${note}` : "", "Shared from Daily Grace"]
        .filter(Boolean)
        .join("\n\n");
}

/**
 * Shares a bookmark and its note through the phone's share sheet, or copies
 * them where there is none. Resolves to 'shared', 'copied', 'cancelled' or
 * 'failed'.
 */
export async function shareBookmark(item, note) {
    const text = shareText(item, note);
    const url = item.url || SITE_URL;
    const data = { title: `${item.title} · Daily Grace`, text, url };
    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
        try {
            await navigator.share(data);
            return "shared";
        } catch (error) {
            if (error?.name === "AbortError") {
                return "cancelled";
            }
            // Refused (a desktop with nothing to share to, say): copy instead.
        }
    }
    try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        return "copied";
    } catch {
        return "failed";
    }
}

// ------------------------------------------------------------------ the box that asks

const EDITOR_STYLES = /* css */ `
  :host { display: contents; }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }
  dialog {
    width: min(440px, 92vw);
    padding: 20px 20px 16px;
    border: 0;
    border-radius: 18px;
    background: #f3e7d2;
    color: #10253b;
    box-shadow: 0 24px 60px rgb(0 27 52 / 45%);
    font: 400 1rem/1.45 'Roboto', Arial, sans-serif;
  }
  dialog::backdrop { background: rgb(0 27 52 / 55%); }
  dialog[open] { animation: note-in .24s cubic-bezier(.2, .9, .25, 1.2); }
  @keyframes note-in { from { opacity: 0; transform: scale(.94) translateY(12px); } }
  h2 { margin: 0 0 14px; font-weight: normal; }
  .eyebrow {
    display: flex; align-items: center; gap: 6px;
    font: 700 .75rem/1.2 'Roboto', Arial, sans-serif;
    letter-spacing: .1em; text-transform: uppercase;
    color: #805b18;
  }
  .eyebrow svg { width: 14px; height: 18px; color: #a8810c; }
  .eyebrow:not(.added) svg { display: none; }
  .title {
    display: block; margin-top: 4px;
    font: 400 1.35rem/1.2 'Germania One', Georgia, serif;
    color: #001b34;
    overflow-wrap: anywhere;
  }
  label { display: block; margin-bottom: 6px; font-size: .875rem; font-weight: 500; }
  /* 16px text, or iPhones zoom in on the box. */
  textarea {
    display: block; width: 100%; min-height: 7em; resize: vertical;
    padding: 10px 12px;
    border: 1px solid #c9b48a; border-radius: 10px;
    background: #fffdf8; color: inherit;
    font: 400 1rem/1.45 'Roboto', Arial, sans-serif;
  }
  textarea:focus { outline: 2px solid #c6922e; outline-offset: 1px; }
  .count { margin: 4px 0 0; text-align: right; font-size: .75rem; color: #56606e; }
  .error { margin: 6px 0 0; font-size: .875rem; color: #b3261e; }
  .actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; margin-top: 14px; }
  button {
    min-height: 44px; padding: 10px 16px;
    border: 1px solid transparent; border-radius: 999px;
    font: 500 .9375rem/1 'Roboto', Arial, sans-serif;
    cursor: pointer;
  }
  button:focus-visible { outline: 2px solid #c6922e; outline-offset: 2px; }
  /* Quieter than Save, and narrow enough for all three to share a phone's row. */
  .remove {
    margin-right: auto; padding-inline: 4px;
    background: none; color: #b3261e;
    text-decoration: underline; text-underline-offset: 3px;
  }
  .skip { background: #fffaf1; color: #001b34; border-color: #c9b48a; }
  .save { background: #001b34; color: #fff; }
  .save:hover { background: #0b2e52; }
  @media (prefers-reduced-motion: reduce) {
    dialog[open] { animation: none; }
  }
`;

const EDITOR_HTML = `
  <dialog aria-labelledby="note-heading">
    <form method="dialog">
      <h2 id="note-heading">
        <span class="eyebrow">${RIBBON_ICON}<span class="eyebrow-text"></span></span>
        <span class="title"></span>
      </h2>
      <label for="note-text"></label>
      <textarea id="note-text" maxlength="${NOTE_LIMIT}" rows="4"
        placeholder="Why does this matter to you? A thought, a prayer, a name…"></textarea>
      <p class="count" aria-live="polite"></p>
      <p class="error" role="alert" hidden>Your note could not be saved on this device.</p>
      <div class="actions">
        <button type="button" class="remove">Remove note</button>
        <button type="button" class="skip"></button>
        <button type="submit" class="save">Save note</button>
      </div>
    </form>
  </dialog>`;

/**
 * <bookmark-note-editor>: the box that asks for a note, one per page, added
 * by askForNote() and editNote(). Only its buttons and Escape close it: a tap
 * beside it could be the end of the hold that opened it, and must not lose a
 * note half written.
 */
class BookmarkNoteEditor extends HTMLElement {
    #dialog;
    #eyebrow;
    #title;
    #label;
    #text;
    #count;
    #error;
    #remove;
    #skip;
    // The bookmark being noted: { key, id, resolve }.
    #current = null;

    constructor() {
        super();
        const root = this.attachShadow({ mode: "open" });
        root.innerHTML = `<style>${EDITOR_STYLES}</style>${EDITOR_HTML}`;
        this.#dialog = root.querySelector("dialog");
        this.#eyebrow = root.querySelector(".eyebrow");
        this.#title = root.querySelector(".title");
        this.#label = root.querySelector("label");
        this.#text = root.querySelector("textarea");
        this.#count = root.querySelector(".count");
        this.#error = root.querySelector(".error");
        this.#remove = root.querySelector(".remove");
        this.#skip = root.querySelector(".skip");

        this.#text.addEventListener("input", () => this.#updateCount());
        root.querySelector("form").addEventListener("submit", (event) => {
            event.preventDefault();
            this.#save(this.#text.value);
        });
        this.#remove.addEventListener("click", () => this.#save(""));
        this.#skip.addEventListener("click", () => this.#finish(null));
        this.#dialog.addEventListener("cancel", (event) => {
            event.preventDefault();
            this.#finish(null);
        });
    }

    connectedCallback() {
        registerFonts();
    }

    /**
     * Opens the box for one bookmark. Resolves to the note saved, "" if it was
     * taken off, or null if it was left as it was.
     */
    edit({ key, id, title = "", added = false }) {
        // One at a time: a box still open is left as it was.
        this.#finish(null);
        const note = readNote(key, id);
        this.#eyebrow.classList.toggle("added", added);
        this.#eyebrow.querySelector(".eyebrow-text").textContent = added
            ? "Bookmarked"
            : note
              ? "Your note"
              : "Add a note";
        this.#title.textContent = title;
        this.#title.hidden = !title;
        this.#label.textContent = added
            ? "Add a note (optional)"
            : "Your note on this bookmark";
        this.#text.value = note;
        this.#skip.textContent = added ? "Skip" : "Cancel";
        this.#remove.hidden = !note;
        this.#error.hidden = true;
        this.#updateCount();
        return new Promise((resolve) => {
            this.#current = { key, id, resolve };
            this.#dialog.showModal();
            this.#text.focus();
        });
    }

    #updateCount() {
        this.#count.textContent = `${this.#text.value.length}/${NOTE_LIMIT}`;
    }

    #save(text) {
        const current = this.#current;
        if (!current) {
            return;
        }
        if (!writeNote(current.key, current.id, text)) {
            this.#error.hidden = false;
            return;
        }
        this.#finish(readNote(current.key, current.id));
    }

    #finish(result) {
        const current = this.#current;
        if (!current) {
            return;
        }
        this.#current = null;
        if (this.#dialog.open) {
            this.#dialog.close();
        }
        current.resolve(result);
    }
}

let editor = null;

function noteEditor() {
    if (!editor) {
        editor = document.createElement("bookmark-note-editor");
        document.body.append(editor);
    }
    return editor;
}

/** Asks for a note on a bookmark just added. Resolves as BookmarkNoteEditor.edit() does. */
export function askForNote(key, id, title) {
    return noteEditor().edit({ key, id, title, added: true });
}

/** Opens a bookmark's note to add to, change or take off. */
export function editNote(key, id, title) {
    return noteEditor().edit({ key, id, title });
}

// ------------------------------------------------------------------ the note on a card

const BOX_STYLES = /* css */ `
  :host {
    display: block;
    margin-top: 10px;
    color: #10253b;
    font: 400 .875rem/1.45 'Roboto', Arial, sans-serif;
    text-align: left;
  }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }
  .note {
    margin: 0 0 8px;
    padding: 8px 12px;
    border-left: 3px solid #c6922e;
    border-radius: 4px 10px 10px 4px;
    background: #fff8e8;
  }
  .note-label {
    margin: 0;
    font-size: .6875rem; font-weight: 700;
    letter-spacing: .08em; text-transform: uppercase;
    color: #805b18;
  }
  .note-text { margin: 2px 0 0; white-space: pre-wrap; overflow-wrap: anywhere; }
  .actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  button {
    display: inline-flex; align-items: center; gap: 6px;
    min-height: 36px; padding: 6px 14px;
    border: 1px solid rgb(198 146 46 / 55%); border-radius: 999px;
    background: #fffaf1; color: #001b34;
    font: 500 .8125rem/1 'Roboto', Arial, sans-serif;
    cursor: pointer;
  }
  button:hover { background: #f8efdd; }
  button:focus-visible { outline: 2px solid #c6922e; outline-offset: 2px; }
  button svg { width: 16px; height: 16px; flex: none; }
  .share { background: #001b34; border-color: #001b34; color: #fff; }
  .share:hover { background: #0b2e52; }
  .status { font-size: .75rem; color: #56606e; }
`;

/**
 * <bookmark-note-box>: a bookmark's note on its card in a bookmarks list, with
 * Add note or Edit note, and Share. Made by noteBox(); it follows the note as
 * it changes, here or in another tab.
 */
class BookmarkNoteBox extends HTMLElement {
    #key = null;
    #id = null;
    // What sharing says: { title, text, reference, url }.
    #item = { title: "" };
    #note;
    #noteText;
    #edit;
    #share;
    #status;
    #statusTimer = 0;

    constructor() {
        super();
        const root = this.attachShadow({ mode: "open" });
        root.innerHTML = `<style>${BOX_STYLES}</style>
          <div class="note" hidden>
            <p class="note-label">My note</p>
            <p class="note-text"></p>
          </div>
          <div class="actions">
            <button type="button" class="edit">${PENCIL_ICON}<span></span></button>
            <button type="button" class="share">${SHARE_ICON}<span>Share</span></button>
            <span class="status" role="status"></span>
          </div>`;
        this.#note = root.querySelector(".note");
        this.#noteText = root.querySelector(".note-text");
        this.#edit = root.querySelector(".edit");
        this.#share = root.querySelector(".share");
        this.#status = root.querySelector(".status");
        this.#edit.addEventListener("click", () =>
            editNote(this.#key, this.#id, this.#item.title),
        );
        this.#share.addEventListener("click", () => this.#shareIt());
    }

    connectedCallback() {
        noteChanges.addEventListener("change", this.#render);
        this.#render();
    }

    disconnectedCallback() {
        noteChanges.removeEventListener("change", this.#render);
        clearTimeout(this.#statusTimer);
    }

    /** Which bookmark this is, and what sharing it says: { title, text, reference, url }. */
    show(key, id, item) {
        this.#key = key;
        this.#id = id;
        this.#item = item;
        this.#render();
    }

    #render = () => {
        if (this.#key === null) {
            return;
        }
        const note = readNote(this.#key, this.#id);
        this.#note.hidden = !note;
        this.#noteText.textContent = note;
        this.#edit.querySelector("span").textContent = note
            ? "Edit note"
            : "Add note";
        const title = this.#item.title;
        this.#edit.setAttribute(
            "aria-label",
            `${note ? "Edit your note on" : "Add a note to"} ${title}`,
        );
        this.#share.setAttribute(
            "aria-label",
            `Share ${title}${note ? " with your note" : ""}`,
        );
    };

    async #shareIt() {
        const result = await shareBookmark(
            this.#item,
            readNote(this.#key, this.#id),
        );
        const message = {
            copied: "Copied: paste it into a post or a message.",
            failed: "This browser could not share or copy it.",
        }[result];
        clearTimeout(this.#statusTimer);
        this.#status.textContent = message ?? "";
        if (message) {
            this.#statusTimer = setTimeout(() => {
                this.#status.textContent = "";
            }, 4000);
        }
    }
}

/** The note box for one bookmark's card: item is { title, text, reference, url } for sharing. */
export function noteBox(key, id, item) {
    const box = document.createElement("bookmark-note-box");
    box.show(key, id, item);
    return box;
}

if (!customElements.get("bookmark-note-editor")) {
    customElements.define("bookmark-note-editor", BookmarkNoteEditor);
}
if (!customElements.get("bookmark-note-box")) {
    customElements.define("bookmark-note-box", BookmarkNoteBox);
}
