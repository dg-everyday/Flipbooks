/**
 * My Faith Journal: the "Word book" dialog (journal.js opens it). It makes
 * one year of the journal into a .docx (assets/scripts/journal/word-book.js)
 * and hands it to the share sheet or downloads it. My Diary is left out
 * unless the reader ticks it.
 */

import { entriesForYear } from "../../../assets/scripts/journal/store.js?v=20261106-1";
import { makeWordBook } from "../../../assets/scripts/journal/word-book.js?v=20261106-1";
import { deliver } from "./journal-backup.js?v=20261106-1";
import { BOOKMARK_LABELS, ICONS, KIND_ONE } from "./journal-ui.js?v=20261106-1";

export async function openWordDialog(dialog, year) {
    const entries = await entriesForYear(year);
    const diary = entries.filter((entry) => entry.kind === "diary").length;
    dialog.innerHTML = `
      <div class="dialog-frame">
        <header class="dialog-head">
          <h2 id="word-title">Word book</h2>
          <button class="icon-button" type="button" data-close aria-label="Close">${ICONS.close}</button>
        </header>
        <section class="backup-part">
          <p>Your ${year} journal as a Word document: a chapter for each month, each day with its verse,
          your words and the bookmarks you put in. Open it in Word or Google Docs, print it, or keep it.</p>
          <form class="word-form">
            ${
                diary
                    ? `<label class="check"><input type="checkbox" name="diary" /> Include My Diary (${diary} ${diary === 1 ? "entry" : "entries"})</label>`
                    : ""
            }
            <button class="button primary" type="submit" ${entries.length ? "" : "disabled"}>${ICONS.backup} Make the Word book</button>
            <p class="dialog-note" role="status" aria-live="polite">${
                entries.length ? `${entries.length} ${entries.length === 1 ? "entry" : "entries"} in ${year}.` : `Nothing written in ${year} yet.`
            }</p>
          </form>
        </section>
      </div>`;

    const form = dialog.querySelector(".word-form");
    const note = form.querySelector(".dialog-note");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const button = form.querySelector("button");
        button.disabled = true;
        note.classList.remove("error");
        note.textContent = "Making your Word book…";
        try {
            const book = makeWordBook({
                year,
                entries,
                kindLabels: KIND_ONE,
                cardLabels: BOOKMARK_LABELS,
                includeDiary: Boolean(form.elements.diary?.checked),
            });
            const how = await deliver(book.blob, book.fileName, { title: `My Faith Journal ${year}` });
            note.textContent =
                how === "cancelled"
                    ? "The Word book was not saved."
                    : `Your Word book is ready: ${book.entries} ${book.entries === 1 ? "entry" : "entries"}.`;
        } catch (error) {
            console.warn("The Word book could not be made:", error);
            note.classList.add("error");
            note.textContent = "The Word book could not be made. Please try again.";
        } finally {
            button.disabled = false;
        }
    });

    // Set, not added: the dialog is opened again and again.
    dialog.onclick = (event) => {
        if (event.target === dialog || event.target.closest("[data-close]")) {
            dialog.close();
        }
    };
    dialog.showModal();
}

