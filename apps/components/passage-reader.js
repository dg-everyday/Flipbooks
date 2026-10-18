/**
 * <passage-reader> — a passage of Scripture in three tabs: the King James
 * Bible, the Berean Standard Bible, and an interlinear of the Hebrew or Greek.
 *
 * Opened from the outline of a book on the Books of the Bible page
 * (bible-books.js): "Genesis 1-11, Creation, fall, flood and Babel". The KJV
 * comes from assets/db/dailygrace.db (sql_script.js, added to the page if need
 * be), with the words of Jesus in red (assets/red-letter.json, as in the
 * search results; tools/red-letter); the BSB, with its section headings and parallel references, from the
 * chapter files in assets/annotations; the interlinear from the chapter files
 * in assets/interlinear (tools/interlinear: STEPBible.org, CC BY 4.0), each
 * word with its Strong's number, transliteration, the original, an English
 * gloss and its grammar, Hebrew right to left, and under them the glosses
 * in that order as one line ("Word for word"). Tapping a word turns it faint
 * yellow and opens its entry in Strong's dictionary under the verse, as in
 * the explanation popup (strongs-entry.js). Where the Old Testament turns to
 * Aramaic (Daniel 2:4-7:28, Ezra 4:8-6:18 and 7:12-26, Jeremiah 10:11) and
 * back, a note says so; those words are marked "arc" in the data. A tab is filled the first time
 * it is shown, one chapter at a time as the reader scrolls. References in the
 * headings are pills that open the passage on top (scripture-refs.js).
 *
 * Usage
 *   import { showPassageReader } from './passage-reader.js?v=…';
 *   showPassageReader({ book: 'Genesis', range: '1-11', title: 'Creation, fall, flood and Babel' });
 *   // range: "1-11", "16", "10:1-22:16" or "1:1-14"
 *
 * Methods      open({ book, range, title, tab })  tab: "kjv" (default), "bsb" or "interlinear"
 *              close()
 * The page cannot scroll while it is open. Escape, the close button or a tap
 * outside the panel close it.
 */

import { PILL_STYLES, linkScripture } from "./scripture-refs.js?v=20261018-1";
import { STRONGS_ENTRY_STYLES, loadStrongsEntry, strongsEntryNode } from "./strongs-entry.js?v=20261016-1";

const asset = (path) => new URL(path, import.meta.url).href;
const SQL_SCRIPT = asset("../../assets/scripts/sql_script.js?v=20261016-2");
const ANNOTATIONS = asset("../../assets/annotations/");
const INTERLINEAR = asset("../../assets/interlinear/");
const RED_LETTER = asset("../../assets/red-letter.json");

const TABS = [
    { id: "kjv", label: "King James Bible" },
    { id: "bsb", label: "BSB" },
    { id: "interlinear", label: "Interlinear" },
];
const CREDITS = {
    kjv: "King James Version. Public domain. The words of Jesus are in red.",
    bsb: "Berean Standard Bible, with its section headings. Public domain.",
    interlinear:
        "Hebrew, Aramaic and Greek words, glosses and grammar from STEPBible.org (Tyndale House, Cambridge), CC BY 4.0. " +
        "The Greek is the text used by the KJV translators (Scrivener 1894). Each word: Strong's number, " +
        "transliteration, the original, an English gloss, its grammar.",
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/** "1-11" -> chapters 1 to 11; "10:1-22:16" and "1:1-14" carry verse limits. */
export function parseRange(range) {
    const m = String(range)
        .trim()
        .match(/^(\d+)(?::(\d+))?(?:\s*[-–]\s*(\d+)(?::(\d+))?)?$/);
    if (!m) {
        return null;
    }
    const c1 = Number(m[1]);
    const v1 = m[2] ? Number(m[2]) : 1;
    let c2;
    let v2;
    if (!m[3]) {
        c2 = c1;
        v2 = m[2] ? v1 : Infinity;
    } else if (m[2] && !m[4]) {
        // "1:1-14": verses within one chapter.
        c2 = c1;
        v2 = Number(m[3]);
    } else {
        c2 = Number(m[3]);
        v2 = m[4] ? Number(m[4]) : Infinity;
    }
    const chapters = [];
    for (let c = c1; c <= c2; c++) {
        chapters.push({
            chapter: c,
            from: c === c1 ? v1 : 1,
            to: c === c2 ? v2 : Infinity,
        });
    }
    return chapters;
}

/** "Genesis 1–11", "Proverbs 10:1–22:16". */
function rangeLabel(book, range) {
    return `${book} ${String(range).replace(/\s*-\s*/, "–")}`;
}

// ------------------------------------------------------------------ data

let databaseReady = null;

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => {
            script.remove();
            reject(new Error(`Unable to load ${src}`));
        };
        document.head.append(script);
    });
}

/** The Bible database, opened by sql_script.js (added to the page if need be). */
function database() {
    if (!databaseReady) {
        databaseReady = (async () => {
            if (typeof window.initDatabase !== "function") {
                await loadScript(SQL_SCRIPT);
            }
            await window.initDatabase();
        })().catch((error) => {
            databaseReady = null; // the next open tries again
            throw error;
        });
    }
    return databaseReady;
}

// Where the words of Jesus fall in each KJV verse: { book_id: { "chapter:verse":
// [[start, end], …] } }. A file that fails to load leaves the text in black.
let redLetters = null;

function loadRedLetters() {
    if (!redLetters) {
        redLetters = loadJson(RED_LETTER).catch((error) => {
            console.warn("Red-letter text unavailable:", error);
            redLetters = null;
            return {};
        });
    }
    return redLetters;
}

/** A verse's text as nodes, with the words of Jesus (ranges) in red spans. */
function redLetterNodes(text, ranges) {
    if (!ranges?.length) {
        return [text];
    }
    const nodes = [];
    let last = 0;
    for (const [start, end] of ranges) {
        if (start > last) {
            nodes.push(text.slice(last, start));
        }
        nodes.push(el("span", "red-letter", text.slice(start, end)));
        last = end;
    }
    nodes.push(text.slice(last));
    return nodes;
}

// Chapter files, shared by every reader: one fetch per file.
const fileCache = new Map();

function loadJson(url) {
    if (!fileCache.has(url)) {
        const request = fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Unable to load ${url} (${response.status})`);
                }
                return response.json();
            })
            .catch((error) => {
                fileCache.delete(url);
                throw error;
            });
        fileCache.set(url, request);
    }
    return fileCache.get(url);
}

const chapterFile = (base, bookId, chapter) =>
    new URL(`${encodeURIComponent(bookId)}/${Number(chapter)}.json`, base).href;

// ------------------------------------------------------------------ styles

const STYLES = /* css */ `
  :host { display: contents; }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }

  dialog {
    width: min(880px, 96vw);
    height: min(900px, 92vh);
    height: min(900px, 92dvh);
    max-width: none;
    max-height: none;
    padding: 0;
    border: 0;
    border-radius: 16px;
    background: #fffaf1;
    color: #10253b;
    box-shadow: 0 24px 60px rgb(0 27 52 / 40%);
    overflow: hidden;
  }
  dialog[open] { display: flex; flex-direction: column; }
  dialog::backdrop { background: rgb(0 27 52 / 60%); backdrop-filter: blur(3px); }
  dialog:focus { outline: none; }

  .head {
    position: relative;
    flex: none;
    padding: 16px 60px 0 22px;
    background: linear-gradient(135deg, #001b34, #062944);
    color: #f3e7d2;
  }
  .eyebrow {
    margin: 0;
    color: #e1b65d;
    font: 700 .78rem/1.3 'Strait', 'Roboto', sans-serif;
    letter-spacing: .14em;
    text-transform: uppercase;
  }
  h2 {
    margin: 4px 0 12px;
    color: #fff;
    font: 400 clamp(1.4rem, 1.2rem + 1vw, 1.9rem)/1.15 'Germania One', Georgia, serif;
  }
  .close {
    position: absolute; top: 12px; right: 12px;
    display: grid; place-items: center;
    width: 40px; height: 40px; padding: 0;
    border: 0; border-radius: 50%;
    background: rgb(255 255 255 / 10%);
    color: #f3e7d2;
    font: 400 1.7rem/1 'Roboto', Arial, sans-serif;
    cursor: pointer;
  }
  .close:hover { background: rgb(255 255 255 / 20%); }
  .close:focus-visible { outline: 2px solid #e1b65d; outline-offset: 2px; }

  .tabs { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; }
  .tabs::-webkit-scrollbar { display: none; }
  .tab {
    flex: none;
    padding: 9px 16px 10px;
    border: 0;
    border-radius: 10px 10px 0 0;
    background: rgb(255 255 255 / 10%);
    color: #f3e7d2;
    font: 700 .95rem/1.2 'Strait', 'Roboto', sans-serif;
    letter-spacing: .02em;
    cursor: pointer;
  }
  .tab:hover { background: rgb(255 255 255 / 18%); }
  .tab[aria-selected="true"] { background: #fffaf1; color: #001b34; }
  .tab:focus-visible { outline: 2px solid #e1b65d; outline-offset: -2px; }

  .body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    overscroll-behavior: contain;
    padding: 18px 26px 26px;
    --scripture-ref-color: #2f5d8a;
  }
  .panel { max-width: 70ch; margin: 0 auto; }
  .panel.interlinear { max-width: none; }
  .message { color: #5b6878; font: 1rem/1.5 'Roboto', Arial, sans-serif; }
  .credit {
    margin: 26px 0 0;
    padding-top: 12px;
    border-top: 1px solid rgb(198 146 46 / 28%);
    color: #5b6878;
    font: .78rem/1.5 'Roboto', Arial, sans-serif;
  }
  .more { height: 1px; }

  /* Text: the verses of a section run on as one paragraph, each with its number. */
  .chapter-title {
    margin: 22px 0 8px;
    color: #001b34;
    font: 400 1.5rem/1.2 'Germania One', Georgia, serif;
  }
  .chapter-title:first-child { margin-top: 0; }
  .psalm-title {
    margin: 0 0 10px;
    color: #5b4a2e;
    font: 400 1rem/1.45 Georgia, 'Times New Roman', serif;
  }
  .text {
    margin: 0 0 12px;
    font: 400 1.12rem/1.6 'Strait', 'Roboto', sans-serif;
    text-wrap: pretty;
  }
  /* The words of Jesus, as many printed Bibles set them. */
  .red-letter { color: #b3261e; }
  sup {
    margin-right: 2px;
    color: #2f5d8a;
    font: 700 .68rem/0 'Roboto', Arial, sans-serif;
  }
  .h0 {
    margin: 22px 0 4px;
    color: #001b34;
    font: 400 1.35rem/1.2 'Germania One', Georgia, serif;
    letter-spacing: .04em;
  }
  .h1 {
    margin: 18px 0 2px;
    color: #001b34;
    font: 700 1.08rem/1.3 'Strait', 'Roboto', sans-serif;
  }
  .h2 {
    margin: 14px 0 2px;
    color: #31445a;
    font: 700 1rem/1.3 'Strait', 'Roboto', sans-serif;
    letter-spacing: .02em;
  }
  .h3 {
    margin: 14px 0 2px;
    color: #805b18;
    font: 700 .82rem/1.3 'Roboto', Arial, sans-serif;
    letter-spacing: .14em;
  }
  .refs {
    margin: 0 0 8px;
    color: #2f5d8a;
    font: 400 .95rem/1.4 'Strait', 'Roboto', sans-serif;
  }

  /* Interlinear: each verse a row of words; a word is a small column. */
  .verse-row {
    display: flex;
    align-items: flex-start;
    gap: 6px 4px;
    margin: 0 0 14px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgb(198 146 46 / 18%);
  }
  .verse-row .num {
    flex: none;
    min-width: 2.2em;
    padding-top: 30px;
    color: #9b2335;
    font: 700 .9rem/1 'Roboto', Arial, sans-serif;
    text-align: center;
  }
  .words { display: flex; flex-wrap: wrap; gap: 10px 14px; flex: 1; }
  .words[dir="rtl"] { direction: rtl; }
  .word {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 3.2em;
    margin: -4px -6px;
    padding: 4px 6px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: inherit;
    text-align: center;
    direction: ltr;
    font: inherit;
  }
  /* A word with a Strong's number opens its dictionary entry: no box, only a
     faint yellow behind it while its entry is open. */
  button.word { cursor: pointer; -webkit-tap-highlight-color: transparent; }
  button.word:hover { background: rgb(255 226 140 / 22%); }
  button.word:focus-visible { outline: 2px solid #c6922e; outline-offset: 1px; }
  button.word[aria-expanded="true"] { background: rgb(255 226 140 / 55%); }
  .entry {
    flex-basis: 100%;
    direction: ltr;
  }
  .entry .il-entry-item { margin-top: 4px; }
  .word .strong { color: #2f5d8a; font: 400 .66rem/1.3 'Roboto', Arial, sans-serif; }
  .word .xlit { color: #2f5d8a; font: italic 400 .8rem/1.3 Georgia, 'Times New Roman', serif; }
  .word .orig {
    color: #10253b;
    font: 400 1.45rem/1.35 'SBL Hebrew', 'Ezra SIL', 'Gentium Plus', 'Times New Roman', serif;
  }
  .word .orig:lang(grc) { font-size: 1.2rem; }
  .word .gloss { color: #b05a00; font: 400 .82rem/1.25 'Strait', 'Roboto', sans-serif; max-width: 9em; }
  .word .grammar { color: #2f5d8a; font: 400 .62rem/1.3 'Roboto', Arial, sans-serif; }
  /* The glosses in the original's order as one line, so the order is plain
     however the words wrap. A line of its own, read left to right. */
  /* Where the text turns to Aramaic, or back to Hebrew. */
  .lang-note {
    margin: 4px 0 14px;
    padding: 8px 12px;
    border-left: 3px solid #c6922e;
    border-radius: 6px;
    background: rgb(255 226 140 / 22%);
    color: #5a4a32;
    font: 400 .95rem/1.45 'Strait', 'Roboto', sans-serif;
  }
  .lang-note b { color: #001b34; }
  .reading {
    flex-basis: 100%;
    margin: 2px 0 0;
    direction: ltr;
    text-align: left;
    color: #5a4a32;
    font: 400 .9rem/1.45 'Strait', 'Roboto', sans-serif;
  }
  .reading b { color: #b05a00; font-weight: 600; }

  @media (max-width: 600px) {
    dialog { width: 100vw; height: 100dvh; border-radius: 0; }
    .head { padding: 14px 54px 0 16px; }
    .body { padding: 14px 16px 22px; }
    .tab { padding: 8px 12px 9px; font-size: .9rem; }
    .words { gap: 8px 10px; }
    .word .orig { font-size: 1.3rem; }
  }
${STRONGS_ENTRY_STYLES}
${PILL_STYLES}`;

// ------------------------------------------------------------------ rendering

const ARAMAIC_NOTE = "a language close to Hebrew, written with the same letters.";

/**
 * The note where the text changes language: to Aramaic ("arc") or back to
 * Hebrew ("he"), at the start of the passage, at a verse, or partway through one.
 */
function languageNote(language, verse, { first, partway }) {
    const note = el("p", "lang-note");
    const name = el("b", null, language === "arc" ? "Aramaic. " : "Hebrew. ");
    let text;
    if (language === "arc") {
        text = first && !partway
            ? `This part of the book was written in Aramaic, ${ARAMAIC_NOTE}`
            : partway
                ? `Partway through verse ${verse} the text turns to Aramaic, ${ARAMAIC_NOTE}`
                : `From here the text is in Aramaic, ${ARAMAIC_NOTE}`;
    } else {
        text = partway
            ? `Partway through verse ${verse} the text turns back to Hebrew.`
            : "From here the text is in Hebrew again.";
    }
    note.append(name, text);
    return note;
}

/** "Word for word: in beginning · he created · God …", the glosses in order. */
function readingLine(words) {
    const line = document.createElement("p");
    line.className = "reading";
    const label = document.createElement("b");
    label.textContent = "Word for word: ";
    line.append(label, words.map((word) => word[2]).filter(Boolean).join(" · "));
    return line;
}

const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) {
        node.className = cls;
    }
    if (text != null) {
        node.textContent = text;
    }
    return node;
};

function headingNodes(headings) {
    const nodes = [];
    for (const heading of headings || []) {
        nodes.push(el("h3", `h${heading.level}`, heading.title));
        if (heading.refs) {
            const refs = el("p", "refs", `(${heading.refs})`);
            linkScripture(refs);
            nodes.push(refs);
        }
    }
    return nodes;
}

function verseNumber(verse) {
    return el("sup", null, String(verse));
}

// ------------------------------------------------------------------ element

export class PassageReader extends HTMLElement {
    #root;
    #dialog;
    #els;
    #request = 0;
    #passage = null;
    #savedOverflow = null;

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: "open" });
        this.#root.innerHTML = `
      <style>${STYLES}</style>
      <dialog aria-labelledby="reader-title">
        <header class="head">
          <p class="eyebrow"></p>
          <h2 id="reader-title"></h2>
          <button class="close" type="button" aria-label="Close">×</button>
          <div class="tabs" role="tablist" aria-label="Translation">
            ${TABS.map((t) => `<button class="tab" type="button" role="tab" id="tab-${t.id}" data-tab="${t.id}" aria-controls="panel-${t.id}" aria-selected="false">${t.label}</button>`).join("")}
          </div>
        </header>
        <div class="body">
          ${TABS.map((t) => `<section class="panel ${t.id}" role="tabpanel" id="panel-${t.id}" aria-labelledby="tab-${t.id}" hidden></section>`).join("")}
        </div>
      </dialog>`;
        const $ = (s) => this.#root.querySelector(s);
        this.#dialog = $("dialog");
        this.#els = {
            eyebrow: $(".eyebrow"),
            title: $("h2"),
            body: $(".body"),
            tabs: [...this.#root.querySelectorAll(".tab")],
            panels: Object.fromEntries(TABS.map((t) => [t.id, $(`#panel-${t.id}`)])),
        };
        $(".close").addEventListener("click", () => this.close());
        this.#dialog.addEventListener("cancel", (event) => {
            event.preventDefault();
            this.close();
        });
        // A tap on the dimmed page around the panel closes it.
        this.#dialog.addEventListener("click", (event) => {
            if (event.target === this.#dialog) {
                this.close();
            }
        });
        this.#dialog.addEventListener("close", () => this.#unlockScroll());
        for (const tab of this.#els.tabs) {
            tab.addEventListener("click", () => this.#select(tab.dataset.tab));
            tab.addEventListener("keydown", (event) => this.#arrowKeys(event));
        }
        this.#els.panels.interlinear.addEventListener("click", (event) => {
            const word = event.target.closest("button.word");
            if (word) {
                this.#toggleEntry(word);
            }
        });
    }

    /**
     * Open (or close) a word's dictionary entry, under its verse's words. One
     * entry is open at a time.
     */
    async #toggleEntry(word) {
        const panel = this.#els.panels.interlinear;
        const opening = word.getAttribute("aria-expanded") !== "true";
        for (const other of panel.querySelectorAll('button.word[aria-expanded="true"]')) {
            other.setAttribute("aria-expanded", "false");
        }
        for (const open of panel.querySelectorAll(".entry")) {
            open.remove();
        }
        if (!opening) {
            return;
        }
        word.setAttribute("aria-expanded", "true");
        const number = word.dataset.strongs;
        // A dictionary file that fails to load shows a note in the entry.
        const entry = await loadStrongsEntry(number).catch(() => null);
        if (word.getAttribute("aria-expanded") !== "true") {
            return;
        }
        const box = el("div", "entry");
        box.id = word.getAttribute("aria-controls");
        box.setAttribute("aria-live", "polite");
        box.append(strongsEntryNode(number, entry));
        word.parentElement.append(box);
        box.scrollIntoView({ block: "nearest", behavior: reducedMotion.matches ? "auto" : "smooth" });
    }

    /** Open a passage: { book: "Genesis", range: "1-11", title, tab }. */
    open({ book, range, title = "", tab = "kjv" }) {
        const chapters = parseRange(range);
        if (!book || !chapters) {
            return;
        }
        this.#request++;
        this.#passage = { book, chapters, request: this.#request, bookId: null, loaded: {} };
        this.#els.eyebrow.textContent = rangeLabel(book, range);
        this.#els.title.textContent = title || rangeLabel(book, range);
        this.#dialog.setAttribute("aria-label", `${rangeLabel(book, range)}${title ? `, ${title}` : ""}`);
        for (const panel of Object.values(this.#els.panels)) {
            panel.replaceChildren();
        }
        if (!this.#dialog.open) {
            this.#dialog.showModal();
            this.#lockScroll();
            if (!reducedMotion.matches) {
                this.#dialog.animate(
                    [{ transform: "scale(.94) translateY(16px)", opacity: 0 }, { transform: "none", opacity: 1 }],
                    { duration: 320, easing: "cubic-bezier(.2,.9,.25,1.1)" },
                );
            }
        }
        this.#select(tab);
    }

    close() {
        this.#request++;
        if (this.#dialog.open) {
            this.#dialog.close();
        }
    }

    #lockScroll() {
        const html = document.documentElement;
        this.#savedOverflow = html.style.overflow;
        html.style.overflow = "hidden";
    }

    #unlockScroll() {
        document.documentElement.style.overflow = this.#savedOverflow ?? "";
        this.#savedOverflow = null;
    }

    #arrowKeys(event) {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
            return;
        }
        const tabs = this.#els.tabs;
        const index = tabs.indexOf(event.currentTarget);
        const next = tabs[(index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
        next.focus();
        this.#select(next.dataset.tab);
    }

    #select(id) {
        if (!this.#els.panels[id]) {
            id = "kjv";
        }
        for (const tab of this.#els.tabs) {
            tab.setAttribute("aria-selected", String(tab.dataset.tab === id));
            tab.tabIndex = tab.dataset.tab === id ? 0 : -1;
        }
        for (const [key, panel] of Object.entries(this.#els.panels)) {
            panel.hidden = key !== id;
        }
        this.#els.body.scrollTop = 0;
        const passage = this.#passage;
        if (passage && !passage.loaded[id]) {
            passage.loaded[id] = true;
            this.#fill(id, passage);
        }
    }

    /** The KJV rows of one chapter of the passage, within its verse limits. */
    async #kjvRows(passage, part) {
        await database();
        const rows = window
            .getVerses(passage.book, part.chapter)
            .filter((r) => r.verse >= part.from && r.verse <= part.to);
        if (rows.length && !passage.bookId) {
            passage.bookId = rows[0].book_id;
        }
        return rows;
    }

    async #bookId(passage) {
        if (!passage.bookId) {
            await this.#kjvRows(passage, passage.chapters[0]);
        }
        return passage.bookId;
    }

    /** Fill a tab chapter by chapter, the next one when the reader nears the end. */
    async #fill(id, passage) {
        const panel = this.#els.panels[id];
        const status = el("p", "message", "Loading…");
        panel.replaceChildren(status);
        const sentinel = el("div", "more");
        const credit = el("p", "credit", CREDITS[id]);
        let next = 0;
        let busy = false;
        const live = () => passage.request === this.#request;

        const loadNext = async () => {
            if (busy || next >= passage.chapters.length || !live()) {
                return;
            }
            busy = true;
            const part = passage.chapters[next++];
            try {
                const nodes = await this.#render(id, passage, part);
                if (!live()) {
                    return;
                }
                status.remove();
                sentinel.before(...nodes);
            } catch (error) {
                console.warn(`The ${id} text could not be loaded:`, error);
                if (live()) {
                    status.textContent = "This passage could not be loaded. Please try again.";
                    panel.prepend(status);
                }
                next = passage.chapters.length;
            } finally {
                busy = false;
            }
            if (next >= passage.chapters.length) {
                observer.disconnect();
                sentinel.replaceWith(credit);
            } else if (sentinel.getBoundingClientRect().top < this.#els.body.getBoundingClientRect().bottom + 600) {
                loadNext();
            }
        };
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    loadNext();
                }
            },
            { root: this.#els.body, rootMargin: "0px 0px 600px 0px" },
        );
        panel.append(sentinel);
        observer.observe(sentinel);
        loadNext();
    }

    async #render(id, passage, part) {
        if (id === "kjv") {
            return this.#renderKjv(passage, part);
        }
        const bookId = await this.#bookId(passage);
        const annotations = await loadJson(chapterFile(ANNOTATIONS, bookId, part.chapter));
        if (id === "bsb") {
            return this.#renderBsb(passage, part, annotations);
        }
        const interlinear = await loadJson(chapterFile(INTERLINEAR, bookId, part.chapter));
        return this.#renderInterlinear(passage, part, annotations, interlinear);
    }

    #chapterTitle(passage, chapter) {
        return el(
            "h3",
            "chapter-title",
            passage.bookId === "Ps" ? `Psalm ${chapter}` : `Chapter ${chapter}`,
        );
    }

    async #renderKjv(passage, part) {
        const [rows, red] = await Promise.all([this.#kjvRows(passage, part), loadRedLetters()]);
        const chapterRed = red[passage.bookId] ?? {};
        const nodes = [this.#chapterTitle(passage, part.chapter)];
        if (passage.bookId === "Ps" && part.from === 1 && typeof window.getPsalmTitle === "function") {
            const title = window.getPsalmTitle(part.chapter);
            if (title) {
                nodes.push(el("p", "psalm-title", title));
            }
        }
        const text = el("p", "text");
        for (const row of rows) {
            text.append(
                verseNumber(row.verse),
                ...redLetterNodes(row.text, chapterRed[`${part.chapter}:${row.verse}`]),
                " ",
            );
        }
        nodes.push(text);
        return nodes;
    }

    /** The chapter's verses in the passage, in order, from its annotation file. */
    #verseKeys(annotations, part, extra = []) {
        return [...new Set([...Object.keys(annotations), ...extra])]
            .map(Number)
            .filter((v) => v >= part.from && v <= part.to)
            .sort((a, b) => a - b);
    }

    #renderBsb(passage, part, annotations) {
        const nodes = [this.#chapterTitle(passage, part.chapter)];
        let text = null;
        for (const verse of this.#verseKeys(annotations, part)) {
            const bsb = annotations[verse]?.translations?.bsb;
            if (!bsb) {
                continue;
            }
            if (bsb.headings?.length) {
                nodes.push(...headingNodes(bsb.headings));
                text = null;
            }
            if (bsb.title) {
                nodes.push(el("p", "psalm-title", bsb.title));
                text = null;
            }
            if (!text) {
                text = el("p", "text");
                nodes.push(text);
            }
            text.append(verseNumber(verse), `${bsb.text} `);
        }
        return nodes;
    }

    #renderInterlinear(passage, part, annotations, interlinear) {
        const nodes = [this.#chapterTitle(passage, part.chapter)];
        const rtl = interlinear.lang === "he";
        const keys = Object.keys(interlinear.verses)
            .map(Number)
            .filter((v) => v === 0 ? part.from === 1 : v >= part.from && v <= part.to)
            .sort((a, b) => a - b);
        for (const verse of keys) {
            const headings = annotations[verse]?.translations?.bsb?.headings;
            if (headings?.length) {
                nodes.push(...headingNodes(headings));
            }
            // The Old Testament's language so far in this passage: a note
            // where a verse's words change it.
            if (rtl) {
                const languages = interlinear.verses[verse].map((w) => w[5] ?? "he");
                const current = passage.language ?? "he";
                const changeAt = languages.findIndex((l) => l !== current);
                if (changeAt >= 0) {
                    nodes.push(languageNote(languages[changeAt], verse, {
                        first: passage.language === undefined,
                        partway: changeAt > 0,
                    }));
                }
                passage.language = languages.at(-1);
            }
            const row = el("div", "verse-row");
            row.append(el("span", "num", verse === 0 ? "title" : String(verse)));
            const words = el("div", "words");
            words.dir = rtl ? "rtl" : "ltr";
            const entryId = `entry-${part.chapter}-${verse}`;
            for (const [orig, xlit, gloss, strongs, grammar, language] of interlinear.verses[verse]) {
                const word = el(strongs ? "button" : "span", "word");
                if (strongs) {
                    word.type = "button";
                    word.dataset.strongs = strongs;
                    word.setAttribute("aria-expanded", "false");
                    word.setAttribute("aria-controls", entryId);
                }
                const original = el("span", "orig", orig);
                original.lang = rtl ? language ?? "he" : "grc";
                original.dir = rtl ? "rtl" : "ltr";
                word.append(
                    el("span", "strong", strongs),
                    el("span", "xlit", xlit),
                    original,
                    el("span", "gloss", gloss),
                    el("span", "grammar", grammar),
                );
                words.append(word);
            }
            words.append(readingLine(interlinear.verses[verse]));
            row.append(words);
            nodes.push(row);
        }
        return nodes;
    }
}

if (!customElements.get("passage-reader")) {
    customElements.define("passage-reader", PassageReader);
}

/** Open a passage in the page's reader, adding the reader if need be. */
export function showPassageReader(options) {
    let reader = document.querySelector("passage-reader");
    if (!reader) {
        reader = document.createElement("passage-reader");
        document.body.append(reader);
    }
    reader.open(options);
    return reader;
}
