/**
 * <dg-guide> — the Daily Grace guides, each a sheet of its own: full screen on
 * a phone and a centred card on a wider screen.
 *
 *   journal     How My Faith Journal works: Today, the five kinds of entry,
 *               writing, finding, bookmarks and stickers, each year, and
 *               keeping it safe
 *   bookmarks   Bookmarking 101: what can be kept and where, how to add and
 *               remove them, putting them into My Faith Journal, notes and
 *               sharing, and how many the reader has of each kind
 *   stickers    How to earn stickers: every series, what earns it, and how
 *               far the reader has got toward the next one
 *
 * Each guide ends with a way into My Faith Journal: Today, its bookmark
 * folders, or its Sticker Album. The journal guide links to the other two.
 * My Faith Journal opens them beside what they explain: How My Faith Journal
 * works at the foot of its folders, and the ? beside its Bookmarks and
 * Stickers headings. On the home page the
 * avatar's menu opens the journal guide (<dg-menu>).
 *
 * Usage
 *   <dg-guide id="guide"></dg-guide>
 *   <script type="module" src="./apps/components/dg-guide.js"></script>
 *   document.getElementById("guide").show("bookmarks");
 *
 * Attributes
 *   journal-href  My Faith Journal, resolved against the page.
 *                 Default: apps/pages/journal.html, beside this component
 *   open          set while a guide is open (read-only); the page uses it to
 *                 stop the page behind scrolling
 *
 * Methods      show(kind)   open a guide: "journal", "bookmarks" or "stickers"
 *              close()
 *
 * Fonts: Germania One and Strait are registered on the document by
 * assets/scripts/fonts.js, because browsers do not reliably load @font-face
 * rules declared inside a shadow root.
 */

import { registerFonts } from "../../assets/scripts/fonts.js";
import {
    ALBUM_MILESTONES,
    FIRSTS,
    SERIES,
    checkAwards,
    goals,
    loadStickers,
    readCollection,
    stickerImage,
} from "../../assets/scripts/sticker-awards.js?v=20261030-1";
import { readProgress } from "../../assets/scripts/sticker-progress.js?v=20261018-1";

const asset = (path) => new URL(path, import.meta.url).href;

const STICKERS_ICON = asset("../../assets/images/study-guide-icons/stickers.svg");
// Beside this component, so it is found from any page.
const DEFAULT_JOURNAL = asset("../pages/journal.html");

// The kinds of bookmark, as <bookmark-manager> shows them: where each is kept
// (card-bookmarks.js and bible-search-results.js), how many fit, and how to
// add one.
const BOOKMARK_KINDS = [
    {
        name: "Bible verses",
        key: "dailygrace:bookmarks",
        limit: 100,
        how: "Look up a passage or search by words with the search box at the top, then press and hold a verse.",
    },
    {
        name: "Did You Know",
        key: "dailygrace:bookmarks:facts",
        limit: 50,
        how: "Hold the “Did you know?” card on the home page, or a question on the Did You Know page.",
    },
    {
        name: "Bible Sayings",
        key: "dailygrace:bookmarks:sayings",
        limit: 50,
        how: "Hold a saying on the home page’s Bible Sayings card or on the Bible Sayings page.",
    },
    {
        name: "Questions",
        key: "dailygrace:bookmarks:guidance",
        limit: 50,
        how: "Hold “Today’s Guiding Question”, or on the Questions We All Ask page hold a tile or tap its Bookmark button.",
    },
    {
        name: "Blueprint",
        key: "dailygrace:bookmarks:blueprint",
        limit: 50,
        how: "Hold “Following Today’s God Blueprint”, or on the Following God’s Blueprint page hold a tile or tap its Bookmark button.",
    },
    {
        name: "Jesus’ Words",
        key: "dailygrace:bookmarks:red-letter",
        limit: 50,
        how: "Hold “Jesus’ Spoken Words” on the home page, or a saying on the Red-Lettered Quotes page.",
    },
];

const ICON_ATTRS =
    'viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const BOOKMARK_ICON = `<svg ${ICON_ATTRS}><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>`;
const JOURNAL_ICON = `<svg ${ICON_ATTRS}><path d="M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2z"/><path d="M5 19a2 2 0 0 1 2-2h12"/><path d="M9 7h6M9 11h4"/></svg>`;
const CLOSE_ICON = `<svg ${ICON_ATTRS}><path d="m6 6 12 12M18 6 6 18"/></svg>`;
const CHECK_ICON = `<svg ${ICON_ATTRS} stroke-width="3"><polyline points="5 12 10 17 19 7"/></svg>`;

// Each guide: its eyebrow, its title, and the way into the journal at its foot.
const GUIDES = {
    journal: { eyebrow: "My Faith Journal", title: "How it works", foot: "Open My Faith Journal", hash: "today" },
    bookmarks: { eyebrow: "My Bookmarks", title: "Bookmarking 101", foot: "Open my bookmarks in My Faith Journal", hash: "bookmarks:verses" },
    stickers: { eyebrow: "My Sticker Album", title: "How to earn stickers", foot: "Open my album in My Faith Journal", hash: "stickers" },
};

const STYLES = /* css */ `
  :host {
    --dg-navy: var(--navy, #001b34);
    --dg-gold: var(--gold, #c6922e);
    --dg-gold-light: var(--gold-light, #e1b65d);
    --dg-gold-ink: #7d5a12;
    --dg-paper: #fffaf1;
    --dg-cream: #f6eedf;
    --dg-menu-cream: var(--cream, #f3e7d2);
    --dg-ink: #10253b;
    --dg-muted: #56606e;
    --dg-line: #e2d5bb;
    display: contents;
  }
  * { box-sizing: border-box; }
  button { font: inherit; }
  [hidden] { display: none !important; }
  /* ----- The guide sheet ----- */
  .guide {
    width: 100%; max-width: 100%;
    height: 100%; max-height: 100%;
    margin: 0; padding: 0; border: 0;
    background: var(--dg-cream);
    color: var(--dg-ink);
    overflow: hidden;
  }
  .guide::backdrop { background: rgb(0 27 52 / 72%); }
  @media (min-width: 600px) {
    .guide {
      width: 560px;
      height: min(860px, calc(100% - 48px));
      margin: auto;
      border-radius: 24px;
      box-shadow: 0 30px 80px rgb(0 0 0 / 45%);
    }
  }
  .guide[open] { animation: rise .25s ease both; }
  @keyframes rise { from { opacity: 0; transform: translateY(16px); } }
  .guide-frame { display: flex; flex-direction: column; height: 100%; }
  .guide-head {
    display: flex; align-items: center; gap: 12px;
    padding: max(14px, env(safe-area-inset-top)) 10px 14px 18px;
    background: var(--dg-navy); color: #fff;
  }
  .guide-icon { display: grid; place-items: center; flex: none; width: 40px; height: 40px; color: var(--dg-gold-light); }
  .guide-icon img { width: 40px; height: 40px; }
  .guide-icon svg { width: 30px; height: 30px; }
  .guide-icon[data-kind="stickers"] svg,
  .guide-icon[data-kind="bookmarks"] img { display: none; }
  .steps { display: grid; gap: 8px; margin: 10px 0 0; padding-left: 1.3em; }
  .kinds { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
  .kinds li { display: grid; gap: 2px; }
  .kinds strong { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: var(--dg-navy); }
  .guide-head div { flex: 1; min-width: 0; }
  .eyebrow { margin: 0; color: var(--dg-gold-light); font: 700 .78rem/1.2 'Strait', 'Roboto', sans-serif; letter-spacing: .14em; text-transform: uppercase; }
  .guide-head h2 { margin: 0; font: 400 1.7rem/1.1 'Germania One', Georgia, serif; letter-spacing: .02em; }
  .close {
    display: grid; place-items: center; flex: none;
    width: 44px; height: 44px; padding: 0;
    border: 0; border-radius: 50%;
    background: none; color: inherit; cursor: pointer;
  }
  .close svg { width: 22px; height: 22px; }
  .close:focus-visible { outline: 2px solid currentColor; outline-offset: -4px; }
  .guide-body {
    flex: 1; min-height: 0; overflow-y: auto;
    padding: 18px 18px 8px;
    font: 400 1.02rem/1.45 'Strait', 'Roboto', sans-serif;
  }
  .intro { margin: 0 0 16px; }
  .tally { display: flex; align-items: baseline; gap: 8px; margin: 0 0 6px; }
  .tally strong { color: var(--dg-navy); font: 400 2rem/1 'Germania One', Georgia, serif; }
  .series {
    margin: 0 0 12px; padding: 14px;
    border: 1px solid var(--dg-line); border-radius: 14px;
    background: var(--dg-paper);
  }
  .series-head { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .thumb { flex: none; width: 56px; height: 56px; }
  .thumb img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 3px 4px rgb(16 37 59 / 25%)); }
  .thumb.empty { border: 2px dashed rgb(198 146 46 / 50%); border-radius: 12px; }
  .series-head h3 { flex: 1; margin: 0; color: var(--dg-navy); font: 400 1.3rem/1.1 'Germania One', Georgia, serif; letter-spacing: .02em; }
  .count { flex: none; padding: 2px 9px; border-radius: 999px; background: rgb(198 146 46 / 14%); color: var(--dg-gold-ink); font-size: .85rem; font-weight: 700; }
  .series p { margin: 0; }
  .next { margin-top: 10px !important; color: var(--dg-gold-ink); font-weight: 700; }
  .bar { height: 6px; margin-top: 6px; border-radius: 3px; background: rgb(198 146 46 / 18%); overflow: hidden; }
  .bar span { display: block; height: 100%; border-radius: inherit; background: var(--dg-gold); }
  .firsts { display: grid; gap: 6px; margin: 10px 0 0; padding: 0; list-style: none; }
  .firsts li { display: flex; align-items: center; gap: 8px; }
  .tick { display: grid; place-items: center; flex: none; width: 22px; height: 22px; border: 1.5px solid #c9b78f; border-radius: 50%; color: #fff; }
  .tick svg { width: 13px; height: 13px; }
  .firsts .done { color: var(--dg-muted); }
  .firsts .done .tick { border: 0; background: var(--dg-gold); }
  .surprise { border-color: rgb(198 146 46 / 55%); background: linear-gradient(180deg, #fff6e2, var(--dg-paper)); }
  .note { margin: 4px 0 12px; color: var(--dg-muted); font-size: .9rem; }
  .guide-foot { padding: 12px 18px max(20px, env(safe-area-inset-bottom)); }
  .album {
    display: flex; align-items: center; justify-content: center;
    width: 100%; min-height: 52px; border: 0; border-radius: 999px;
    cursor: pointer;
    background: var(--dg-navy); color: #fff;
    font: 700 1.05rem 'Strait', 'Roboto', sans-serif;
    text-decoration: none;
  }
  .album:focus-visible { outline: 3px solid var(--dg-gold); outline-offset: 2px; }
  .album[hidden] { display: none; }
  .guide-icon[data-kind="journal"] img { display: none; }
  .guide-icon .journal-icon { display: none; }
  .guide-icon[data-kind="journal"] .journal-icon { display: block; }
  .guide-icon[data-kind="journal"] .bookmark-icon { display: none; }
  .more { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
  .more button {
    min-height: 40px; padding: 6px 14px;
    border: 1px solid var(--dg-gold); border-radius: 999px;
    background: #fff; color: var(--dg-navy);
    font: 700 .95rem 'Strait', 'Roboto', sans-serif;
    cursor: pointer;
  }
  .more button:focus-visible { outline: 3px solid var(--dg-gold); outline-offset: 2px; }

  @media (prefers-reduced-motion: reduce) {
    .guide[open] { animation: none; }
  }
`;

const escapeHtml = (text) =>
    String(text ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export class DgGuide extends HTMLElement {
    static observedAttributes = ["journal-href"];

    #root;
    #guide;
    #kind = null;

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: "open" });
        this.#root.innerHTML = `
      <style>${STYLES}</style>
      <dialog class="guide" aria-labelledby="guide-title">
        <div class="guide-frame">
          <header class="guide-head">
            <span class="guide-icon"><img src="${STICKERS_ICON}" alt="" width="40" height="40" loading="lazy" /><span class="bookmark-icon">${BOOKMARK_ICON}</span><span class="journal-icon">${JOURNAL_ICON}</span></span>
            <div>
              <p class="eyebrow"></p>
              <h2 id="guide-title"></h2>
            </div>
            <button class="close" type="button" aria-label="Close" title="Close">${CLOSE_ICON}</button>
          </header>
          <div class="guide-body"></div>
          <div class="guide-foot">
            <a class="album journal-link"></a>
          </div>
        </div>
      </dialog>`;
        this.#guide = this.#root.querySelector(".guide");
        this.#guide.addEventListener("close", () => this.toggleAttribute("open", false));
        this.#guide.addEventListener("click", (event) => {
            if (event.target === this.#guide) {
                this.#guide.close();
                return;
            }
            // From the journal guide to the other two.
            const other = event.target.closest("[data-guide]");
            if (other) {
                this.show(other.dataset.guide);
            }
        });
        this.#root.querySelector(".close").addEventListener("click", () => this.#guide.close());
        // Going into the journal: on the journal page itself only its address
        // changes, so the guide closes first.
        this.#root.querySelector(".journal-link").addEventListener("click", () => this.#guide.close());
    }

    connectedCallback() {
        registerFonts();
    }

    attributeChangedCallback() {
        if (this.#kind) {
            this.#renderFoot();
        }
    }

    /** Opens a guide: "journal", "bookmarks" or "stickers". */
    async show(kind) {
        const guide = GUIDES[kind] ? kind : "journal";
        this.#kind = guide;
        this.#root.querySelector(".guide-head .eyebrow").textContent = GUIDES[guide].eyebrow;
        this.#root.querySelector("#guide-title").textContent = GUIDES[guide].title;
        this.#root.querySelector(".guide-icon").dataset.kind = guide;
        this.#renderFoot();
        const body = this.#root.querySelector(".guide-body");
        if (!this.#guide.open) {
            this.#guide.showModal();
        }
        this.toggleAttribute("open", true);
        body.scrollTop = 0;
        if (guide === "journal") {
            body.innerHTML = journalGuideHtml();
        } else if (guide === "bookmarks") {
            body.innerHTML = bookmarksGuideHtml();
        } else {
            body.innerHTML = `<p class="intro">Loading…</p>`;
            try {
                await checkAwards();
                const stickers = await loadStickers();
                if (this.#kind === "stickers") {
                    body.innerHTML = guideHtml(stickers, readCollection(), readProgress());
                }
            } catch (error) {
                console.warn("The sticker guide could not be loaded:", error);
                body.innerHTML = `<p class="intro">The sticker guide could not be loaded. Please try again later.</p>`;
            }
        }
    }

    close() {
        this.#guide.close();
    }

    #renderFoot() {
        const journal = new URL(this.getAttribute("journal-href") || DEFAULT_JOURNAL, document.baseURI).href;
        const link = this.#root.querySelector(".journal-link");
        link.href = `${journal}#${GUIDES[this.#kind].hash}`;
        link.textContent = GUIDES[this.#kind].foot;
    }
}

/** How My Faith Journal works. */
function journalGuideHtml() {
    return `
      <p class="intro">My Faith Journal is your own logbook of your walk with God: each day’s verse and your words about it, your prayers, your bookmarks and your stickers, all in one place. A single line is a whole entry, and nothing is lost by missing a day.</p>
      <section class="series">
        <div class="series-head"><h3>Open it</h3></div>
        <p>Tap your avatar (or the DG emblem) at the top of the home page, then My Faith Journal. After the Daily Moment, Add a line to My Faith Journal on the Amen screen opens that day’s entry, with your answer to the day’s question already in it.</p>
      </section>
      <section class="series">
        <div class="series-head"><h3>Today</h3></div>
        <p>The journal opens on Today: the day’s poster, its question, and Write today’s log at the top right. The pills below begin another kind of entry. Further down are what you wrote today, memories (this day a year ago, a month ago and a week ago), now and then a memory verse you learned, with a few words left out to fill in, and your journal so far.</p>
      </section>
      <section class="series">
        <div class="series-head"><h3>Five kinds of entry</h3></div>
        <ul class="kinds">
          <li><strong>Daily Log</strong><span>The day: what happened, what you learned, what you are thankful for. Your answer to the Daily Moment’s question is kept here by itself.</span></li>
          <li><strong>Discoveries</strong><span>What you found in Scripture: a verse, a fact, a person, a place, often with a bookmark in it.</span></li>
          <li><strong>My Diary</strong><span>What is on your heart. It is left out of the Word book unless you choose to put it in.</span></li>
          <li><strong>Notebook</strong><span>Quotes, ideas, verses to remember, a letter to your future self.</span></li>
          <li><strong>Prayer List</strong><span>Prayers you are bringing to God. Mark one Answered, with a line on how, when the answer comes.</span></li>
        </ul>
      </section>
      <section class="series">
        <div class="series-head"><h3>Write</h3></div>
        <ol class="steps">
          <li>Tap Write today’s log, a pill, or New in a folder.</li>
          <li>Write as little or as much as you like. B makes words bold, List makes a list, and Quote sets words apart. A title is up to you.</li>
          <li>Add a bookmark puts one in as a card, with its exact words.</li>
          <li>Choose the kind and the day at the top, flag an entry to come back to, and give it categories, such as Family or Work.</li>
          <li>It saves itself each time you pause; Saved shows at the top. Tap Done to read it back. Edit and Delete are under it.</li>
        </ol>
      </section>
      <section class="series">
        <div class="series-head"><h3>Find</h3></div>
        <p>The folders list each kind, with Flagged for the entries you flagged. Search finds words, verses, categories and bookmarks. On a wide screen the folders, the list and the page sit side by side, and an entry dragged onto a folder moves to that kind. On a phone you see one at a time: the arrow at the top goes back.</p>
      </section>
      <section class="series">
        <div class="series-head"><h3>Bookmarks and stickers</h3></div>
        <p>Each kind of bookmark has a folder, with Add to journal on each one. Your Sticker Album is under Stickers.</p>
        <div class="more">
          <button type="button" data-guide="bookmarks">Bookmarking 101</button>
          <button type="button" data-guide="stickers">How to earn stickers</button>
        </div>
      </section>
      <section class="series">
        <div class="series-head"><h3>Each year</h3></div>
        <p>A new journal begins every 1 January. Last year’s is closed and kept as it is, to read whenever you like, under Years. Prayers still waiting for an answer come with you into the new year, and your bookmarks and stickers stay. Tap the year as a Word book to keep the whole year as a document, a chapter for each month, ready to print or keep.</p>
      </section>
      <section class="series">
        <div class="series-head"><h3>Keep it safe</h3></div>
        <p>Your journal is kept only on this device. Backup &amp; restore makes one file of it, with your bookmarks, stickers and progress, locked with a password you choose. Keep the file somewhere safe, such as your Files, Drive or email.</p>
        <p class="next">Write the password down: no one, not even Daily Grace, can open the backup without it. To restore, choose the file and type its password, on this device or a new one. Your bookmarks and notes are always kept.</p>
      </section>
      <p class="note">Nothing you write leaves this device, unless you make a backup or a Word book and send it on yourself.</p>`;
}

function guideHtml(stickers, collection, progress) {
    const earned = collection.earned;
    const have = Object.keys(earned).length;
    const nextGoals = goals(progress, collection, stickers);
    const sections = SERIES.map((series) => {
        const shelf = stickers
            .filter((sticker) => sticker.group === series.group)
            .sort((a, b) => a.id.localeCompare(b.id));
        const mine = shelf.filter((sticker) => earned[sticker.id]);
        const latest = mine
            .map((sticker) => [sticker, earned[sticker.id].day])
            .sort((a, b) => a[1].localeCompare(b[1]))
            .at(-1)?.[0];
        const thumb = latest
            ? `<span class="thumb"><img src="${escapeHtml(stickerImage(latest))}" alt="" width="600" height="600" loading="lazy" decoding="async" /></span>`
            : `<span class="thumb empty"></span>`;
        const goal = nextGoals.find((item) => item.group === series.group);
        let next = `<p class="next">You have them all. Well done!</p>`;
        if (goal) {
            const percent = Math.round((goal.done / goal.step) * 100);
            next = `<p class="next">Next: ${escapeHtml(goal.text)}.</p>
              <div class="bar" aria-hidden="true"><span style="width: ${percent}%"></span></div>`;
        }
        const firsts =
            series.group === "AG"
                ? `<ul class="firsts">${FIRSTS.map((first) => {
                      const done = Boolean(progress.firsts?.[first.key]);
                      return `<li class="${done ? "done" : ""}"><span class="tick">${done ? CHECK_ICON : ""}</span>${escapeHtml(first.todo)}</li>`;
                  }).join("")}</ul>`
                : "";
        return `
          <section class="series">
            <div class="series-head">${thumb}<h3>${escapeHtml(series.name)}</h3><span class="count">${mine.length} of ${shelf.length}</span></div>
            <p>${escapeHtml(series.guide)}</p>
            ${firsts}
            ${goal?.group === "AG" ? "" : next}
          </section>`;
    }).join("");

    const milestone = ALBUM_MILESTONES.find((count) => count > have);
    const surprise = milestone
        ? `Your next surprise comes at ${milestone} stickers, or when you complete a series.`
        : "Your next surprise comes when you complete a series.";
    return `
      <p class="tally"><strong>${have}</strong> of ${stickers.length} stickers so far</p>
      <p class="intro">Stickers are gifts for what you do in Daily Grace. Each series is earned a different way, and a new sticker pops up as soon as you earn it. Your album is in My Faith Journal, under Stickers.</p>
      ${sections}
      <section class="series surprise">
        <div class="series-head"><h3>Surprise gifts</h3></div>
        <p>On reaching ${ALBUM_MILESTONES.join(", ").replace(/, (\d+)$/, " and $1")} stickers, and each time you complete a series, you also get a surprise: a sticker you don't have yet.</p>
        <p class="next">${escapeHtml(surprise)}</p>
      </section>
      <p class="note">Your stickers are kept on this device, and go into My Faith Journal’s backups. They stay in your album from year to year, even after a year’s journal is closed.</p>`;
}

/** How many bookmarks of one kind are kept on this device. */
function bookmarkCount(key) {
    try {
        const ids = JSON.parse(localStorage.getItem(key));
        return Array.isArray(ids) ? ids.length : 0;
    } catch {
        return 0;
    }
}

function bookmarksGuideHtml() {
    const kinds = BOOKMARK_KINDS.map((kind) => {
        const count = Math.min(bookmarkCount(kind.key), kind.limit);
        return `
          <li>
            <strong>${escapeHtml(kind.name)}<span class="count">${count} of ${kind.limit}</span></strong>
            <span>${escapeHtml(kind.how)}</span>
          </li>`;
    }).join("");
    return `
      <p class="intro">Bookmarks keep the verses and lessons you want to come back to, each with a note of your own if you like. They live in My Faith Journal, where any of them can go into an entry.</p>
      <section class="series">
        <div class="series-head"><h3>Add a bookmark</h3></div>
        <ol class="steps">
          <li>Press and hold a verse or a card for half a second.</li>
          <li>It glows gold, then a ribbon appears on it: it is bookmarked.</li>
          <li>A box asks for a note: a few words on why it matters to you. Save it, or Skip.</li>
          <li>Hold it again the same way to remove the bookmark, and its note with it.</li>
        </ol>
      </section>
      <section class="series">
        <div class="series-head"><h3>What you can bookmark</h3></div>
        <ul class="kinds">${kinds}</ul>
      </section>
      <section class="series">
        <div class="series-head"><h3>See your bookmarks</h3></div>
        <p>Tap your avatar (or the DG emblem) at the top of the home page, then My Faith Journal. Under Bookmarks there is a folder for each kind, with your note under each bookmark. Search finds one by its words or your note.</p>
        <p class="next">The My Bookmarks button at the top of a Bookmarks folder opens them all together: there you can remove one, write or change a note, share it, or tap the red PDF button for one PDF of them all.</p>
      </section>
      <section class="series">
        <div class="series-head"><h3>Put a bookmark in your journal</h3></div>
        <ol class="steps">
          <li>In a Bookmarks folder, tap Add to journal. It starts a Discovery with the bookmark in it, or goes into the entry you are writing.</li>
          <li>While writing an entry, tap Add a bookmark to choose one. On a wide screen you can also drag a bookmark onto the entry.</li>
          <li>It shows as a card with its exact words, which cannot be changed. The card stays in the entry even if you later remove the bookmark.</li>
        </ol>
      </section>
      <section class="series">
        <div class="series-head"><h3>Notes and sharing</h3></div>
        <p>A note can be up to 280 characters: a sentence or two on why it matters, a prayer, or a name to remember. Under each bookmark in My Bookmarks, tap Add note or Edit note to write, change or remove it.</p>
        <p class="next">Tap Share to send the bookmark, with your note and a link to Daily Grace, to a friend, a group chat or a post. Where your browser can’t share, it is copied for you to paste.</p>
      </section>
      <section class="series">
        <div class="series-head"><h3>When a list is full</h3></div>
        <p>Each kind keeps up to its limit: 100 verses, and 50 of everything else. To make room, open My Bookmarks from a Bookmarks folder in My Faith Journal, and hold one there to remove it.</p>
      </section>
      <p class="note">Bookmarks and notes are kept on this device, and go into My Faith Journal’s backups. A restore always keeps the bookmarks already here. They stay with you from year to year.</p>`;
}

if (!customElements.get("dg-guide")) {
    customElements.define("dg-guide", DgGuide);
}
