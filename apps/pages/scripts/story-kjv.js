/**
 * The "KJV" pills of the story reader (stories.html).
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
 * against the KJV database). Such a page wears a small white-on-red "KJV"
 * pill at its top right, drawn by <flip-book> as the page's action; a tap
 * opens that page's verses, with the spoken words marked.
 *
 * Usage
 *   import { withKjvPills, kjvNotes } from "./scripts/story-kjv.js";
 *   kjvNotes(reader, story);
 *   reader.pages = withKjvPills(toFlipPages(story), story);
 */

const CLOSE_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

const notesOf = (page) => (Array.isArray(page?.kjv) ? page.kjv : []);

/** The reader's pages, with a KJV pill on each page that has notes. */
export function withKjvPills(flipPages, story) {
    return flipPages.map((page, i) => (notesOf(story.pages?.[i]).length
        ? { ...page, action: { label: "KJV", title: "These words in the King James Bible" } }
        : page));
}

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
 * Opens a page's verses when its KJV pill is tapped. Does nothing when no
 * page of the story has notes.
 */
export function kjvNotes(reader, story) {
    const pages = story.pages ?? [];
    if (!pages.some((page) => notesOf(page).length)) {
        return;
    }
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
    let opener = null;

    reader.addEventListener("pageaction", (event) => {
        const notes = notesOf(pages[event.detail.index]);
        if (!notes.length) {
            return;
        }
        list.replaceChildren(...notes.map((note) => {
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
        // Focus goes back to that page's pill (inside the reader) when the card closes.
        const pills = reader.shadowRoot ? [...reader.shadowRoot.querySelectorAll(".page-action")] : [];
        opener = pills.find((pill) => pill.offsetParent && pill.dataset.index === String(event.detail.index)) ?? null;
        dialog.showModal();
        dialog.querySelector(".kjv-close").focus();
    });
    reader.addEventListener("pagechange", () => {
        if (dialog.open) {
            dialog.close();
        }
    });
    dialog.querySelector(".kjv-close").addEventListener("click", () => dialog.close());
    // A tap on the dimmed page around the card closes it too.
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
            dialog.close();
        }
    });
    dialog.addEventListener("close", () => {
        if (opener?.isConnected) {
            opener.focus();
        }
    });
}
