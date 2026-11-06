/**
 * My Faith Journal: one entry, read or written (journal.js shows it in the
 * page pane). Each kind of entry has its own parts (assets/scripts/journal/
 * kinds.js): the Daily Log what happened, what I'm thankful for, what I
 * learned and tomorrow; Discoveries what I found, what it means and where
 * it fits; My Diary a mood and an open page; the Notebook a quote, its
 * source and notes; the Prayer List for whom, the prayer and its answer.
 * Every part is optional.
 *
 *   readHtml(entry)    the entry as a page: its day and kind, title, the
 *                      day's verse and question, then each part that has
 *                      something in it, under its own label, and its
 *                      categories
 *   EntryEditor        writes an entry: kind, day, title, its kind's parts
 *                      (the main words with bold, lists and quotes; the rest
 *                      plain), bookmarks as cards, categories and a flag.
 *                      Changing the kind lays the entry out as that kind,
 *                      keeping everything written. It saves at every pause in
 *                      typing; a new entry is only written once something is
 *                      in it. Bookmarks are added with "Add a bookmark" or
 *                      "Add to journal" in a bookmark folder (on a wide
 *                      screen one can also be dragged onto the entry,
 *                      though nothing asks for it).
 *
 * Scripture in a card is the bookmark's own text and cannot be edited.
 */

import {
    addEntry,
    bodyText,
    cleanBody,
    todayIso,
    updateEntry,
} from "../../../assets/scripts/journal/store.js?v=20261106-3";
import { MOODS, moodLabel, sections } from "../../../assets/scripts/journal/kinds.js?v=20261106-1";
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

/** Plain words as HTML: line breaks kept. */
const plainHtml = (text) => escapeHtml(text).replace(/\r?\n/g, "<br>");

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

function answerHtml(entry) {
    const prayer = entry.prayer;
    if (!prayer) {
        return "";
    }
    return `<p class="entry-prayer ${prayer.answered ? "answered" : ""}">${
        prayer.answered
            ? `Answered${prayer.answeredOn ? ` on ${escapeHtml(formatDay(prayer.answeredOn, { weekday: false }))}` : ""}${prayer.note ? `: ${escapeHtml(prayer.note)}` : ""}`
            : "Still praying"
    }</p>`;
}

const part = (label, html) => `
      <section class="entry-part">
        <h3 class="part-label">${escapeHtml(label)}</h3>
        ${html}
      </section>`;

/** The entry as a page; a closed year's entry has no Edit or Delete. */
export function readHtml(entry, { closed = false } = {}) {
    const parts = sections(entry)
        .map((section) => {
            if (section.body) {
                const body = cleanBody(entry.body);
                return body ? part(section.label, `<div class="entry-body">${body}</div>`) : "";
            }
            if (section.key) {
                const text = entry.fields?.[section.key] ?? "";
                return text.trim() ? part(section.label, `<p class="part-text">${plainHtml(text)}</p>`) : "";
            }
            if (section.cards) {
                return entry.cards.length
                    ? part(section.label, `<div class="cards">${entry.cards.map((card) => cardHtml(card)).join("")}</div>`)
                    : "";
            }
            if (section.mood) {
                return entry.mood ? part(section.label, `<p class="entry-mood">${escapeHtml(moodLabel(entry.mood))}</p>`) : "";
            }
            if (section.answer) {
                return entry.kind === "prayer" ? answerHtml(entry) : "";
            }
            return "";
        })
        .join("");
    const written = parts.replace(/<p class="entry-prayer[^>]*>Still praying<\/p>/, "").trim();
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
        ${written ? parts : `<p class="entry-empty">Nothing written yet.</p>${parts}`}
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
    #values;
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
        const source = entry ?? { day: todayIso(), kind: "log", title: "", body: "", categories: [], flag: false, ...draft };
        // What is being written, kept here so a change of kind keeps it all.
        this.#values = {
            kind: source.kind ?? "log",
            day: source.day ?? todayIso(),
            title: source.title ?? "",
            body: cleanBody(source.body),
            fields: { ...(source.fields ?? {}) },
            mood: source.mood ?? null,
            cards: [...(source.cards ?? [])],
            categories: [...(source.categories ?? [])],
            flag: Boolean(source.flag),
            prayer: { answered: false, answeredOn: null, note: "", ...(source.prayer ?? {}) },
            verse: source.verse ?? "",
            prompt: source.prompt ?? "",
        };
        this.#onSaved = onSaved;
        this.#onDone = onDone;
        this.#onPick = onPick;
        this.#render();
        this.#status(this.#entry ? "" : "New entry");
    }

    get id() {
        return this.#entry?.id ?? null;
    }

    /** Puts a bookmark into the entry (once). */
    addCard(card) {
        this.#capture();
        if (!this.#values.cards.some((c) => c.kind === card.kind && c.id === card.id)) {
            this.#values.cards.push(card);
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

    /* ---------- Drawing ---------- */

    #partHtml(section) {
        const values = this.#values;
        if (section.body) {
            return `
          <section class="edit-part">
            <span class="part-label" id="label-body">${escapeHtml(section.label)}</span>
            <div class="toolbar" role="toolbar" aria-label="Writing">
              <button type="button" data-command="bold" title="Bold"><b>B</b></button>
              <button type="button" data-command="insertUnorderedList" title="List">• List</button>
              <button type="button" data-command="formatBlock" data-value="<blockquote>" title="Quote">❝ Quote</button>
              <button type="button" data-command="formatBlock" data-value="<p>" title="Plain text">¶</button>
            </div>
            <div class="edit-body" contenteditable="true" role="textbox" aria-multiline="true" aria-labelledby="label-body" data-placeholder="${escapeHtml(section.placeholder ?? "")}">${values.body}</div>
          </section>`;
        }
        if (section.key) {
            const id = `field-${section.key}`;
            const value = escapeHtml(values.fields[section.key] ?? "");
            return `
          <section class="edit-part">
            <label class="part-label" for="${id}">${escapeHtml(section.label)}</label>
            ${
                section.single
                    ? `<input id="${id}" class="edit-field" data-field="${section.key}" type="text" maxlength="200" placeholder="${escapeHtml(section.placeholder ?? "")}" value="${value}" />`
                    : `<textarea id="${id}" class="edit-field" data-field="${section.key}" rows="2" placeholder="${escapeHtml(section.placeholder ?? "")}">${value}</textarea>`
            }
          </section>`;
        }
        if (section.cards) {
            return `
          <section class="edit-part">
            <span class="part-label">${escapeHtml(section.label)}</span>
            <div class="cards drop-zone" aria-label="${escapeHtml(section.label)}"></div>
            <button class="button small add-card" type="button" data-action="pick">${ICONS.bookmark} Add a bookmark</button>
          </section>`;
        }
        if (section.mood) {
            return `
          <section class="edit-part">
            <span class="part-label" id="label-mood">${escapeHtml(section.label)}</span>
            <div class="moods" role="group" aria-labelledby="label-mood">
              ${MOODS.map(
                  (mood) =>
                      `<button type="button" class="mood" data-mood="${mood.key}" aria-pressed="${values.mood === mood.key ? "true" : "false"}">${escapeHtml(mood.label)}</button>`,
              ).join("")}
            </div>
          </section>`;
        }
        if (section.answer) {
            return `
          <fieldset class="edit-prayer">
            <legend>${escapeHtml(section.label)}</legend>
            <label class="check"><input type="checkbox" name="answered" ${values.prayer.answered ? "checked" : ""} /> Answered</label>
            <input name="answerNote" type="text" maxlength="280" placeholder="How was it answered?" value="${escapeHtml(values.prayer.note ?? "")}" />
          </fieldset>`;
        }
        return "";
    }

    #render() {
        const values = this.#values;
        this.#root.innerHTML = `
      <form class="entry-edit" autocomplete="off">
        <div class="edit-bar">
          <label class="visually-hidden" for="edit-kind">Kind of entry</label>
          <select id="edit-kind" name="kind">
            ${KIND_ORDER.map((kind) => `<option value="${kind}" ${kind === values.kind ? "selected" : ""}>${escapeHtml(KIND_LABELS[kind])}</option>`).join("")}
          </select>
          <label class="visually-hidden" for="edit-day">Day</label>
          <input id="edit-day" name="day" type="date" value="${escapeHtml(values.day)}" min="${todayIso().slice(0, 4)}-01-01" required />
          <button class="icon-button flag-toggle" type="button" aria-pressed="${values.flag ? "true" : "false"}" title="Flag it to come back to">${ICONS.flag}<span class="visually-hidden">Flag</span></button>
          <span class="edit-status" role="status" aria-live="polite"></span>
          <button class="button primary" type="button" data-action="done">Done</button>
        </div>
        ${verseHtml(values)}
        <label class="visually-hidden" for="edit-title">Title</label>
        <input id="edit-title" class="edit-title" name="title" type="text" maxlength="140" placeholder="Title (if you like)" value="${escapeHtml(values.title)}" />
        ${sections(values).map((section) => this.#partHtml(section)).join("")}
        <label class="edit-categories">Categories
          <input name="categories" type="text" maxlength="200" placeholder="Family, Work, To pray" value="${escapeHtml(values.categories.join(", "))}" />
        </label>
      </form>`;

        const form = this.#root.querySelector("form");
        const body = form.querySelector(".edit-body");
        this.#renderCards();

        form.addEventListener("submit", (event) => event.preventDefault());
        form.addEventListener("input", () => this.#schedule());
        form.addEventListener("change", (event) => {
            if (event.target.name === "kind") {
                // Laid out again as the new kind, with everything written kept.
                this.#capture();
                this.#values.kind = event.target.value;
                this.#render();
                this.#root.querySelector("#edit-kind").focus();
            }
            this.#schedule();
        });
        form.addEventListener("click", (event) => {
            const mood = event.target.closest(".mood");
            if (mood) {
                const on = mood.getAttribute("aria-pressed") !== "true";
                form.querySelectorAll(".mood").forEach((other) => other.setAttribute("aria-pressed", "false"));
                mood.setAttribute("aria-pressed", on ? "true" : "false");
                this.save();
            }
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
        form.querySelector('[data-action="pick"]')?.addEventListener("click", () => this.#onPick?.());

        // The plain parts grow with what is written in them.
        form.querySelectorAll("textarea.edit-field").forEach((area) => {
            const fit = () => {
                area.style.height = "auto";
                area.style.height = `${area.scrollHeight + 2}px`;
            };
            area.addEventListener("input", fit);
            requestAnimationFrame(fit);
        });

        if (body) {
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
        }

        // A bookmark dragged from a bookmark folder.
        for (const zone of [body, form.querySelector(".drop-zone")].filter(Boolean)) {
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
    }

    #renderCards() {
        const zone = this.#root.querySelector(".drop-zone");
        if (!zone) {
            return;
        }
        zone.innerHTML = this.#values.cards.map((card) => cardHtml(card, { removable: true })).join("");
        zone.querySelectorAll(".card-remove").forEach((button) => {
            button.addEventListener("click", () => {
                const card = button.closest(".card");
                this.#values.cards = this.#values.cards.filter((c) => !(c.kind === card.dataset.kind && c.id === card.dataset.id));
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

    /* ---------- Saving ---------- */

    /** Reads the form into what is being written; parts not on show stay as they were. */
    #capture() {
        const form = this.#root.querySelector("form");
        if (!form) {
            return;
        }
        const values = this.#values;
        values.kind = form.elements.kind.value;
        values.day = form.elements.day.value || values.day || todayIso();
        values.title = form.elements.title.value;
        const body = form.querySelector(".edit-body");
        if (body) {
            values.body = body.innerHTML;
        }
        form.querySelectorAll("[data-field]").forEach((field) => {
            values.fields[field.dataset.field] = field.value;
        });
        if (form.querySelector(".moods")) {
            values.mood = form.querySelector('.mood[aria-pressed="true"]')?.dataset.mood ?? null;
        }
        values.categories = categoryList(form.elements.categories.value);
        values.flag = form.querySelector(".flag-toggle").getAttribute("aria-pressed") === "true";
        if (form.elements.answered) {
            const answered = form.elements.answered.checked;
            values.prayer = {
                answered,
                answeredOn: answered ? (values.prayer.answeredOn ?? todayIso()) : null,
                note: form.elements.answerNote.value,
            };
        }
    }

    async #write() {
        if (!this.#root.isConnected) {
            return;
        }
        this.#capture();
        const { kind, day, title, body, fields, mood, cards, categories, flag, prayer } = this.#values;
        const changes = { kind, day, title, body, fields, mood, cards, categories, flag, prayer };
        if (!this.#entry) {
            // Nothing in it yet: nothing to keep.
            const anything =
                title.trim() || bodyText(body) || cards.length || mood || Object.values(fields).some((text) => text.trim());
            if (!anything) {
                this.#status("New entry");
                return;
            }
            this.#entry = await addEntry({ ...this.#draft, ...changes });
            this.#firstSave = false;
            this.#status("Saved");
            this.#onSaved?.(this.#entry, { created: true });
            return;
        }
        this.#entry = await updateEntry(this.#entry.id, changes, { newVersion: this.#firstSave });
        this.#firstSave = false;
        this.#status("Saved");
        this.#onSaved?.(this.#entry, { created: false });
    }
}
