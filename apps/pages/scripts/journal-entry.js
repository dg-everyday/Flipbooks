/**
 * My Faith Journal: one entry, read or written (journal.js shows it in the
 * page pane).
 *
 *   readHtml(entry)    the entry as a page: its day and kind, title, the
 *                      day's verse and question, the reader's words, the
 *                      bookmarks put into it, categories and, for a prayer,
 *                      whether it was answered
 *   EntryEditor        writes an entry: kind, day, title, the words (bold,
 *                      lists, quotes), bookmarks as cards, categories, a
 *                      flag and, for a prayer, its answer. It saves at
 *                      every pause in typing; a new entry is only written
 *                      once something is in it. Bookmarks are added from
 *                      the picker, by "Add to journal" in a bookmark folder,
 *                      or by dragging one onto the entry.
 *
 * Scripture in a card is the bookmark's own text and cannot be edited.
 */

import {
    addEntry,
    bodyText,
    cleanBody,
    todayIso,
    updateEntry,
} from "../../../assets/scripts/journal/store.js?v=20261106-1";
import {
    ICONS,
    KIND_LABELS,
    KIND_ONE,
    KIND_ORDER,
    cardHtml,
    escapeHtml,
    formatDay,
} from "./journal-ui.js?v=20261106-2";

// What a dragged bookmark carries (journal.js sets it).
export const BOOKMARK_TYPE = "application/x-dailygrace-bookmark";
const SAVE_PAUSE = 700;

const categoryList = (text) =>
    [...new Set(String(text ?? "").split(",").map((part) => part.trim()).filter(Boolean))];

function verseHtml(entry) {
    if (!entry.verse && !entry.prompt) {
        return "";
    }
    return `
      <div class="entry-context">
        ${entry.verse ? `<p class="entry-verse">${escapeHtml(entry.verse)}</p>` : ""}
        ${entry.prompt ? `<p class="entry-prompt">${escapeHtml(entry.prompt)}</p>` : ""}
      </div>`;
}

/** The entry as a page; a closed year's entry has no Edit or Delete. */
export function readHtml(entry, { closed = false } = {}) {
    const body = cleanBody(entry.body);
    const prayer =
        entry.kind === "prayer" && entry.prayer
            ? `<p class="entry-prayer ${entry.prayer.answered ? "answered" : ""}">${
                  entry.prayer.answered
                      ? `Answered${entry.prayer.answeredOn ? ` on ${escapeHtml(formatDay(entry.prayer.answeredOn, { weekday: false }))}` : ""}${entry.prayer.note ? `: ${escapeHtml(entry.prayer.note)}` : ""}`
                      : "Still praying"
              }</p>`
            : "";
    return `
      <article class="entry-read">
        <header class="entry-head">
          <p class="eyebrow">${escapeHtml(formatDay(entry.day))} · ${escapeHtml(KIND_ONE[entry.kind] ?? "Entry")}${
              entry.source === "moment" ? " · from the day's Moment" : ""
          }${entry.carriedFrom ? ` · carried over from ${escapeHtml(String(entry.carriedFrom.year))}` : ""}</p>
          ${entry.title ? `<h2 class="entry-title">${escapeHtml(entry.title)}</h2>` : ""}
          ${entry.flag ? `<span class="entry-flag" title="Flagged">${ICONS.flag} Flagged</span>` : ""}
        </header>
        ${verseHtml(entry)}
        ${body ? `<div class="entry-body">${body}</div>` : `<p class="entry-empty">Nothing written yet.</p>`}
        ${entry.cards.length ? `<div class="cards">${entry.cards.map((card) => cardHtml(card)).join("")}</div>` : ""}
        ${prayer}
        ${
            entry.categories.length
                ? `<ul class="chips" aria-label="Categories">${entry.categories.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>`
                : ""
        }
        ${
            closed
                ? `<p class="closed-note">From your ${escapeHtml(String(entry.year))} journal, closed and kept as it is.</p>`
                : `<div class="entry-actions">
          <button class="button primary" type="button" data-action="edit">${ICONS.edit} Edit</button>
          <button class="button quiet" type="button" data-action="delete">${ICONS.trash} Delete</button>
        </div>`
        }
      </article>`;
}

export class EntryEditor {
    #root;
    #entry;
    #draft;
    #cards;
    #firstSave = true;
    #timer = null;
    #saving = Promise.resolve();
    #onSaved;
    #onDone;
    #onPick;

    /**
     * entry: the entry to change, or null for a new one made from `draft`
     * ({ day, kind, verse, prompt, cards }). onSaved(entry, { created }) after
     * each save; onDone() when the reader is finished; onPick() opens the
     * bookmark picker.
     */
    constructor(root, { entry = null, draft = {}, onSaved, onDone, onPick }) {
        this.#root = root;
        this.#entry = entry;
        this.#draft = draft;
        this.#cards = [...(entry?.cards ?? draft.cards ?? [])];
        this.#onSaved = onSaved;
        this.#onDone = onDone;
        this.#onPick = onPick;
        this.#render();
    }

    get id() {
        return this.#entry?.id ?? null;
    }

    /** Puts a bookmark into the entry (once). */
    addCard(card) {
        if (!this.#cards.some((c) => c.kind === card.kind && c.id === card.id)) {
            this.#cards.push(card);
            this.#renderCards();
            this.save();
        }
    }

    /** Saves now; resolves once everything typed so far is kept. */
    save() {
        clearTimeout(this.#timer);
        this.#timer = null;
        this.#saving = this.#saving
            .then(() => this.#write())
            .catch((error) => {
                console.warn("The journal entry could not be saved:", error);
                const closed = /journal is closed/.test(error?.message ?? "");
                this.#status(closed ? "Not saved: that year's journal is closed." : "Not saved. Is the device full?", { error: true });
            });
        return this.#saving;
    }

    #render() {
        const source = this.#entry ?? { day: todayIso(), kind: "log", title: "", body: "", categories: [], flag: false, ...this.#draft };
        const prayer = source.prayer ?? { answered: false, note: "" };
        this.#root.innerHTML = `
      <form class="entry-edit" autocomplete="off">
        <div class="edit-bar">
          <label class="visually-hidden" for="edit-kind">Kind of entry</label>
          <select id="edit-kind" name="kind">
            ${KIND_ORDER.map((kind) => `<option value="${kind}" ${kind === source.kind ? "selected" : ""}>${escapeHtml(KIND_LABELS[kind])}</option>`).join("")}
          </select>
          <label class="visually-hidden" for="edit-day">Day</label>
          <input id="edit-day" name="day" type="date" value="${escapeHtml(source.day)}" min="${todayIso().slice(0, 4)}-01-01" required />
          <button class="icon-button flag-toggle" type="button" aria-pressed="${source.flag ? "true" : "false"}" title="Flag it to come back to">${ICONS.flag}<span class="visually-hidden">Flag</span></button>
          <span class="edit-status" role="status" aria-live="polite"></span>
          <button class="button primary" type="button" data-action="done">Done</button>
        </div>
        ${verseHtml(source)}
        <label class="visually-hidden" for="edit-title">Title</label>
        <input id="edit-title" class="edit-title" name="title" type="text" maxlength="140" placeholder="Title (if you like)" value="${escapeHtml(source.title)}" />
        <div class="toolbar" role="toolbar" aria-label="Writing">
          <button type="button" data-command="bold" title="Bold"><b>B</b></button>
          <button type="button" data-command="insertUnorderedList" title="List">• List</button>
          <button type="button" data-command="formatBlock" data-value="<blockquote>" title="Quote">❝ Quote</button>
          <button type="button" data-command="formatBlock" data-value="<p>" title="Plain text">¶</button>
          <button type="button" data-action="pick">${ICONS.bookmark} Add a bookmark</button>
        </div>
        <div class="edit-body" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Your words" data-placeholder="Write a line, or as much as you like…">${cleanBody(source.body)}</div>
        <div class="cards drop-zone" aria-label="Bookmarks in this entry"></div>
        <fieldset class="edit-prayer" ${source.kind === "prayer" ? "" : "hidden"}>
          <legend>This prayer</legend>
          <label class="check"><input type="checkbox" name="answered" ${prayer.answered ? "checked" : ""} /> Answered</label>
          <input name="answerNote" type="text" maxlength="280" placeholder="How was it answered?" value="${escapeHtml(prayer.note ?? "")}" />
        </fieldset>
        <label class="edit-categories">Categories
          <input name="categories" type="text" maxlength="200" placeholder="Family, Work, To pray" value="${escapeHtml(source.categories.join(", "))}" />
        </label>
      </form>`;

        const form = this.#root.querySelector("form");
        const body = form.querySelector(".edit-body");
        this.#renderCards();

        form.addEventListener("submit", (event) => event.preventDefault());
        form.addEventListener("input", () => this.#schedule());
        form.addEventListener("change", (event) => {
            if (event.target.name === "kind") {
                form.querySelector(".edit-prayer").hidden = event.target.value !== "prayer";
            }
            this.#schedule();
        });
        form.querySelector(".flag-toggle").addEventListener("click", (event) => {
            const button = event.currentTarget;
            button.setAttribute("aria-pressed", button.getAttribute("aria-pressed") === "true" ? "false" : "true");
            this.save();
        });
        form.querySelector('[data-action="done"]').addEventListener("click", async () => {
            await this.save();
            this.#onDone?.(this.#entry);
        });
        form.querySelector('[data-action="pick"]').addEventListener("click", () => this.#onPick?.());

        // The toolbar keeps the selection in the text: mousedown would take it.
        const toolbar = form.querySelector(".toolbar");
        toolbar.addEventListener("mousedown", (event) => {
            if (event.target.closest("[data-command]")) {
                event.preventDefault();
            }
        });
        toolbar.addEventListener("click", (event) => {
            const button = event.target.closest("[data-command]");
            if (button) {
                body.focus();
                document.execCommand(button.dataset.command, false, button.dataset.value ?? null);
                this.#schedule();
            }
        });

        // New lines are paragraphs, and pasted text arrives cleaned.
        body.addEventListener("focus", () => document.execCommand("defaultParagraphSeparator", false, "p"));
        body.addEventListener("paste", (event) => {
            event.preventDefault();
            const html = event.clipboardData.getData("text/html");
            const text = event.clipboardData.getData("text/plain");
            const clean = html ? cleanBody(html) : escapeHtml(text).replace(/\r?\n/g, "<br>");
            document.execCommand("insertHTML", false, clean);
        });

        // A bookmark dragged from a bookmark folder.
        for (const zone of [body, form.querySelector(".drop-zone")]) {
            zone.addEventListener("dragover", (event) => {
                if (event.dataTransfer.types.includes(BOOKMARK_TYPE)) {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "copy";
                    form.classList.add("dropping");
                }
            });
            zone.addEventListener("dragleave", () => form.classList.remove("dropping"));
            zone.addEventListener("drop", (event) => {
                const data = event.dataTransfer.getData(BOOKMARK_TYPE);
                form.classList.remove("dropping");
                if (data) {
                    event.preventDefault();
                    try {
                        this.addCard(JSON.parse(data));
                    } catch {
                        // Not a bookmark after all.
                    }
                }
            });
        }
        this.#status(this.#entry ? "" : "New entry");
    }

    #renderCards() {
        const zone = this.#root.querySelector(".drop-zone");
        zone.innerHTML =
            this.#cards.map((card) => cardHtml(card, { removable: true })).join("") +
            `<p class="drop-hint">Drag a bookmark here, or use “Add a bookmark”.</p>`;
        zone.querySelectorAll(".card-remove").forEach((button) => {
            button.addEventListener("click", () => {
                const card = button.closest(".card");
                this.#cards = this.#cards.filter((c) => !(c.kind === card.dataset.kind && c.id === card.dataset.id));
                this.#renderCards();
                this.save();
            });
        });
    }

    #schedule() {
        clearTimeout(this.#timer);
        this.#status("…");
        this.#timer = setTimeout(() => this.save(), SAVE_PAUSE);
    }

    #status(text, { error = false } = {}) {
        const status = this.#root.querySelector(".edit-status");
        if (status) {
            status.textContent = text;
            status.classList.toggle("error", error);
        }
    }

    #fields() {
        const form = this.#root.querySelector("form");
        const answered = form.elements.answered.checked;
        const before = this.#entry?.prayer;
        return {
            kind: form.elements.kind.value,
            day: form.elements.day.value || this.#entry?.day || todayIso(),
            title: form.elements.title.value,
            body: form.querySelector(".edit-body").innerHTML,
            cards: this.#cards,
            categories: categoryList(form.elements.categories.value),
            flag: form.querySelector(".flag-toggle").getAttribute("aria-pressed") === "true",
            prayer: {
                answered,
                answeredOn: answered ? (before?.answeredOn ?? todayIso()) : null,
                note: form.elements.answerNote.value,
            },
        };
    }

    async #write() {
        if (!this.#root.isConnected) {
            return;
        }
        const fields = this.#fields();
        if (!this.#entry) {
            // Nothing in it yet: nothing to keep.
            if (!fields.title.trim() && !bodyText(fields.body) && !fields.cards.length) {
                this.#status("New entry");
                return;
            }
            this.#entry = await addEntry({ ...this.#draft, ...fields });
            this.#firstSave = false;
            this.#status("Saved");
            this.#onSaved?.(this.#entry, { created: true });
            return;
        }
        this.#entry = await updateEntry(this.#entry.id, fields, { newVersion: this.#firstSave });
        this.#firstSave = false;
        this.#status("Saved");
        this.#onSaved?.(this.#entry, { created: false });
    }
}
