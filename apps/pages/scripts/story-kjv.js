/**
 * The "KJV" button of the story reader (stories.html).
 *
 * The Daily Grace Kids flipbooks tell each story in simple words, and the
 * words God, Jesus or an angel speak are drawn into the pictures in those
 * simple words too. A page where they speak carries, in its manifest, the
 * same words in the King James Bible:
 *
 *   { "kjv": [{ "who": "Jesus", "ref": "Mark 10:14",
 *               "text": "<the whole verse, word for word>",
 *               "quote": "<the spoken words, found in text>" }] }
 *
 * (written by docs/kids/prompt-scripts/kjv_notes.py, which checks every quote
 * against the KJV database). While such a page is on show, a gold "KJV"
 * button appears in the top bar; it opens the verses, with the spoken words
 * marked. On a wide screen the reader shows two pages, and the notes of both
 * are offered.
 *
 * Usage
 *   import { kjvNotes } from "./scripts/story-kjv.js";
 *   kjvNotes(reader, story, document.querySelector(".tools"));
 */

// The same rule <flip-book> uses for one page at a time (flip-book.js).
const SINGLE_PAGE = "(max-width: 600px), (orientation: portrait)";

const CLOSE_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

/** Builds a verse with its spoken words marked, as DOM nodes (never as HTML). */
function verseNodes(note) {
    const p = document.createElement("p");
    p.className = "kjv-verse";
    const at = note.quote ? note.text.indexOf(note.quote) : -1;
    if (at < 0) {
        p.textContent = note.text;
    } else {
        const strong = document.createElement("strong");
        strong.textContent = note.quote;
        p.append(note.text.slice(0, at), strong, note.text.slice(at + note.quote.length));
    }
    return p;
}

/**
 * Wires the KJV button and dialog to a reader showing `story`. Does nothing
 * when no page of the story has notes.
 */
export function kjvNotes(reader, story, tools) {
    const pages = story.pages ?? [];
    if (!pages.some((page) => Array.isArray(page.kjv) && page.kjv.length)) {
        return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "kjv-btn";
    button.textContent = "KJV";
    button.title = "In the King James Bible";
    button.setAttribute("aria-haspopup", "dialog");
    button.hidden = true;
    tools.prepend(button);

    const dialog = document.createElement("dialog");
    dialog.className = "kjv-dialog";
    dialog.setAttribute("aria-labelledby", "kjv-title");
    dialog.innerHTML = `
      <div class="kjv-card">
        <button type="button" class="kjv-close" aria-label="Close">${CLOSE_ICON}</button>
        <p class="kjv-eyebrow">The words in the picture</p>
        <h2 id="kjv-title">In the King James Bible</h2>
        <p class="kjv-intro">The picture tells these words simply, for children. Here they are as the King James Bible gives them.</p>
        <div class="kjv-list"></div>
      </div>`;
    document.body.append(dialog);
    const list = dialog.querySelector(".kjv-list");
    const single = window.matchMedia(SINGLE_PAGE);
    let index = 0;

    const notesOnShow = () => {
        const shown = single.matches ? [index] : [index, index + 1];
        const seen = new Set();
        const notes = [];
        for (const i of shown) {
            for (const note of pages[i]?.kjv ?? []) {
                // A verse that two pages share is shown once.
                const key = `${note.ref}|${note.quote}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    notes.push(note);
                }
            }
        }
        return notes;
    };
    const update = () => {
        const count = notesOnShow().length;
        button.hidden = count === 0;
        button.setAttribute("aria-label", count === 1
            ? "The words on this page in the King James Bible"
            : "The words on these pages in the King James Bible");
    };

    reader.addEventListener("pagechange", (event) => {
        index = event.detail.index;
        update();
        if (dialog.open) {
            dialog.close();
        }
    });
    single.addEventListener("change", update);

    button.addEventListener("click", () => {
        list.replaceChildren(...notesOnShow().map((note) => {
            const item = document.createElement("section");
            item.className = "kjv-note";
            const who = document.createElement("p");
            who.className = "kjv-who";
            who.textContent = note.who || "";
            const ref = document.createElement("p");
            ref.className = "kjv-ref";
            ref.textContent = note.ref;
            item.append(who, verseNodes(note), ref);
            return item;
        }));
        dialog.showModal();
        dialog.querySelector(".kjv-close").focus();
    });
    dialog.querySelector(".kjv-close").addEventListener("click", () => dialog.close());
    // A tap on the dimmed page around the card closes it too.
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
            dialog.close();
        }
    });
    dialog.addEventListener("close", () => button.focus());
    update();
}
