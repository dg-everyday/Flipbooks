/**
 * <dg-menu> — the menu under the DG emblem at the top of the home page: the
 * reader's own things. (Once the reader has chosen an avatar, it shows in
 * place of the emblem; see <avatar-picker>.)
 *
 *   Change my avatar      opens <avatar-picker>
 *   My Bookmarks          opens <bookmark-manager>
 *   My Sticker Album      goes to the album, with how many stickers so far
 *   ────────────
 *   Bookmarking 101       a guide to bookmarks: what can be kept and where,
 *                         how to add and remove them, notes and sharing,
 *                         and how many the reader has of each kind
 *   How to earn stickers  a guide to every series: what earns it, and how
 *                         far the reader has got toward the next one
 *
 * The menu drops down from the emblem; a tap outside it, Escape or choosing
 * an item closes it. Each guide is a sheet of its own, full screen on a phone
 * and a centred card on a wider screen. (The study guides, Help and About
 * live in the hamburger menu, <study-guide-menu>.)
 *
 * Usage
 *   <button id="dg-open" aria-haspopup="menu" aria-expanded="false">…</button>
 *   <dg-menu opener="dg-open" bookmarks="bookmarks"></dg-menu>
 *   <script type="module" src="./apps/components/dg-menu.js"></script>
 *
 * Attributes
 *   opener      id of the button that opens the menu; its aria-expanded
 *               follows the menu, and focus returns to it on close
 *   bookmarks   id of the page's <bookmark-manager>
 *   avatar-picker  id of the page's <avatar-picker>
 *   album-href  the Sticker Album page, resolved against the page.
 *               Default: apps/pages/stickers.html
 *   open        set by the component while the menu or the guide is open
 *               (read-only); the page uses it to stop the page behind scrolling
 *
 * Methods      open(), close(), showGuide(), showBookmarksGuide()
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
} from "../../assets/scripts/sticker-awards.js?v=20261018-1";
import { readProgress } from "../../assets/scripts/sticker-progress.js?v=20261018-1";

const asset = (path) => new URL(path, import.meta.url).href;

const STICKERS_ICON = asset("../../assets/images/study-guide-icons/stickers.svg");
const DEFAULT_ALBUM = "apps/pages/stickers.html";

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
const AVATAR_ICON = `<svg ${ICON_ATTRS}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.7 18.4a6 6 0 0 1 10.6 0"/></svg>`;
const QUESTION_ICON = `<svg ${ICON_ATTRS}><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7"/><circle cx="12" cy="17" r=".6" fill="currentColor"/></svg>`;
const CLOSE_ICON = `<svg ${ICON_ATTRS}><path d="m6 6 12 12M18 6 6 18"/></svg>`;
const CHECK_ICON = `<svg ${ICON_ATTRS} stroke-width="3"><polyline points="5 12 10 17 19 7"/></svg>`;

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

  /* ----- The menu: a small card dropping down from the emblem ----- */
  .menu {
    position: fixed;
    inset: auto;
    width: min(280px, calc(100vw - 16px));
    margin: 0; padding: 8px;
    border: 1px solid rgb(198 146 46 / 35%);
    border-radius: 16px;
    /* The study guides' drawer (<study-guide-menu>): cream, lighter at the top left. */
    background:
      radial-gradient(120% 60% at 0% 0%, #fffaf0 0%, transparent 60%),
      var(--dg-menu-cream);
    color: var(--dg-navy);
    box-shadow: 0 18px 44px rgb(0 27 52 / 30%);
    transform-origin: top left;
  }
  .menu[open] { animation: drop .18s cubic-bezier(.2, 1.2, .4, 1) both; }
  .menu::backdrop { background: rgb(0 27 52 / 18%); }
  @keyframes drop { from { opacity: 0; transform: scale(.9) translateY(-6px); } }
  .menu ul { display: grid; margin: 0; padding: 0; list-style: none; }
  .item {
    display: flex; align-items: center; gap: 12px;
    width: 100%; min-height: 50px;
    padding: 6px 10px;
    border: 0; border-radius: 10px;
    background: none; color: inherit;
    font: 700 1rem/1.2 'Strait', 'Roboto', sans-serif;
    text-align: left; text-decoration: none;
    cursor: pointer;
  }
  .item:hover { background: rgb(198 146 46 / 12%); }
  .item:focus-visible { outline: 2px solid var(--dg-navy); outline-offset: -2px; }
  .item-icon { display: grid; place-items: center; flex: none; width: 36px; height: 36px; color: var(--dg-gold-ink); }
  .item-icon svg { width: 24px; height: 24px; }
  .item-icon img { width: 34px; height: 34px; }
  .item-text { display: grid; gap: 1px; }
  /* Tight leading, as in the study guides' menu, so a description that wraps
     reads as one block. */
  .item-text small { color: var(--dg-muted); font-weight: 400; font-size: .85rem; line-height: 1.2; }
  /* The rule gives the guides below some room from the reader's own things. */
  .rule { height: 1px; margin: 12px 10px; background: var(--dg-line); }
  /* With a line under it, the icon sits beside the title, not halfway down
     the description, as in the study guides' menu. */
  .item:has(small) { align-items: flex-start; }
  /* The two guides are one line each, so they sit closer, as one pair. */
  .item.guide-item { min-height: 40px; padding-block: 2px; }

  /* ----- How to earn stickers ----- */
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

  @media (prefers-reduced-motion: reduce) {
    .menu[open], .guide[open] { animation: none; }
  }
`;

const escapeHtml = (text) =>
    String(text ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export class DgMenu extends HTMLElement {
    static observedAttributes = ["opener", "album-href"];

    #root;
    #menu;
    #guide;
    #opener = null;
    #onOpenerClick = () => {
        if (this.#menu.open) {
            this.close();
        } else {
            this.open();
        }
    };

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: "open" });
        this.#root.innerHTML = `
      <style>${STYLES}</style>
      <dialog class="menu" aria-label="My Daily Grace">
        <ul role="menu">
          <li role="none">
            <button class="item" type="button" role="menuitem" data-action="avatar" aria-haspopup="dialog">
              <span class="item-icon">${AVATAR_ICON}</span>
              <span class="item-text">Change my avatar<small>The Bible hero who is your picture</small></span>
            </button>
          </li>
          <li role="none">
            <button class="item" type="button" role="menuitem" data-action="bookmarks">
              <span class="item-icon">${BOOKMARK_ICON}</span>
              <span class="item-text">My Bookmarks<small>The verses, facts, sayings and more you have kept, with your notes</small></span>
            </button>
          </li>
          <li role="none">
            <a class="item" role="menuitem" data-action="album">
              <span class="item-icon"><img src="${STICKERS_ICON}" alt="" width="34" height="34" loading="lazy" /></span>
              <span class="item-text">My Sticker Album<small class="album-count"></small></span>
            </a>
          </li>
          <li role="separator" class="rule"></li>
          <li role="none">
            <button class="item guide-item" type="button" role="menuitem" data-action="bookmarks-guide" aria-haspopup="dialog">
              <span class="item-icon">${QUESTION_ICON}</span>
              <span class="item-text">Bookmarking 101</span>
            </button>
          </li>
          <li role="none">
            <button class="item guide-item" type="button" role="menuitem" data-action="guide" aria-haspopup="dialog">
              <span class="item-icon">${QUESTION_ICON}</span>
              <span class="item-text">How to earn stickers</span>
            </button>
          </li>
        </ul>
      </dialog>
      <dialog class="guide" aria-labelledby="guide-title">
        <div class="guide-frame">
          <header class="guide-head">
            <span class="guide-icon"><img src="${STICKERS_ICON}" alt="" width="40" height="40" loading="lazy" />${BOOKMARK_ICON}</span>
            <div>
              <p class="eyebrow"></p>
              <h2 id="guide-title"></h2>
            </div>
            <button class="close" type="button" aria-label="Close" title="Close">${CLOSE_ICON}</button>
          </header>
          <div class="guide-body"></div>
          <div class="guide-foot">
            <a class="album">Open my album</a>
            <button class="album open-bookmarks" type="button">Open My Bookmarks</button>
          </div>
        </div>
      </dialog>`;
        this.#menu = this.#root.querySelector(".menu");
        this.#guide = this.#root.querySelector(".guide");

        this.#menu.addEventListener("click", (event) => {
            if (event.target === this.#menu) {
                this.close();
                return;
            }
            const action = event.target.closest("[data-action]")?.dataset.action;
            if (action === "avatar") {
                this.close();
                document.getElementById(this.getAttribute("avatar-picker") ?? "")?.open();
            } else if (action === "bookmarks") {
                this.close();
                document.getElementById(this.getAttribute("bookmarks") ?? "")?.open();
            } else if (action === "guide") {
                this.close();
                this.showGuide();
            } else if (action === "bookmarks-guide") {
                this.close();
                this.showBookmarksGuide();
            }
        });
        this.#menu.addEventListener("close", () => this.#closed());
        this.#guide.addEventListener("close", () => this.#closed());
        this.#guide.addEventListener("click", (event) => {
            if (event.target === this.#guide) {
                this.#guide.close();
            }
        });
        this.#root
            .querySelector(".close")
            .addEventListener("click", () => this.#guide.close());
        this.#root
            .querySelector(".open-bookmarks")
            .addEventListener("click", () => {
                this.#guide.close();
                document.getElementById(this.getAttribute("bookmarks") ?? "")?.open();
            });
    }

    connectedCallback() {
        registerFonts();
        this.#wireOpener();
        this.#renderLinks();
    }

    disconnectedCallback() {
        this.#opener?.removeEventListener("click", this.#onOpenerClick);
        this.#opener = null;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue || !this.isConnected) {
            return;
        }
        if (name === "opener") {
            this.#wireOpener();
        } else {
            this.#renderLinks();
        }
    }

    #wireOpener() {
        this.#opener?.removeEventListener("click", this.#onOpenerClick);
        this.#opener = document.getElementById(this.getAttribute("opener") ?? "");
        this.#opener?.addEventListener("click", this.#onOpenerClick);
    }

    #renderLinks() {
        const href = new URL(
            this.getAttribute("album-href") || DEFAULT_ALBUM,
            document.baseURI,
        ).href;
        this.#root.querySelector('[data-action="album"]').href = href;
        this.#root.querySelector(".album").href = href;
    }

    /** Opens the menu below the emblem. */
    async open() {
        if (this.#menu.open) {
            return;
        }
        const box = this.#opener?.getBoundingClientRect();
        this.#menu.style.top = `${Math.round((box?.bottom ?? 56) + 8)}px`;
        this.#menu.style.left = `${Math.round(Math.max(8, box?.left ?? 8))}px`;
        this.#menu.showModal();
        this.toggleAttribute("open", true);
        this.#opener?.setAttribute("aria-expanded", "true");
        this.#root.querySelector(".item").focus();

        // The album's count, once the stickers are known.
        try {
            const stickers = await loadStickers();
            const have = Object.keys(readCollection().earned).length;
            this.#root.querySelector(".album-count").textContent =
                `${have} of ${stickers.length} stickers`;
        } catch {
            // Without the list the item still opens the album.
        }
    }

    close() {
        this.#menu.close();
    }

    #closed() {
        const open = this.#menu.open || this.#guide.open;
        this.toggleAttribute("open", open);
        if (!this.#menu.open) {
            this.#opener?.setAttribute("aria-expanded", "false");
        }
        if (!open) {
            this.#opener?.focus({ preventScroll: true });
        }
    }

    /** Shows the guide sheet as one guide or the other; returns its body. */
    #openGuide(kind) {
        const stickers = kind === "stickers";
        this.#root.querySelector(".guide-head .eyebrow").textContent = stickers
            ? "My Sticker Album"
            : "My Bookmarks";
        this.#root.querySelector("#guide-title").textContent = stickers
            ? "How to earn stickers"
            : "Bookmarking 101";
        this.#root.querySelector(".guide-icon").dataset.kind = kind;
        this.#root.querySelector("a.album").hidden = !stickers;
        this.#root.querySelector(".open-bookmarks").hidden = stickers;
        const body = this.#root.querySelector(".guide-body");
        if (!this.#guide.open) {
            this.#guide.showModal();
        }
        this.toggleAttribute("open", true);
        body.scrollTop = 0;
        return body;
    }

    /** Opens the guide to bookmarks, with how many the reader has of each kind. */
    showBookmarksGuide() {
        this.#openGuide("bookmarks").innerHTML = bookmarksGuideHtml();
    }

    /** Opens the guide to earning stickers, with the reader's progress. */
    async showGuide() {
        const body = this.#openGuide("stickers");
        body.innerHTML = `<p class="intro">Loading…</p>`;
        try {
            await checkAwards();
            const stickers = await loadStickers();
            body.innerHTML = guideHtml(stickers, readCollection(), readProgress());
        } catch (error) {
            console.warn("The sticker guide could not be loaded:", error);
            body.innerHTML = `<p class="intro">The sticker guide could not be loaded. Please try again later.</p>`;
        }
    }
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
      <p class="intro">Stickers are gifts for what you do in Daily Grace. Each series is earned a different way, and a new sticker pops up as soon as you earn it.</p>
      ${sections}
      <section class="series surprise">
        <div class="series-head"><h3>Surprise gifts</h3></div>
        <p>On reaching ${ALBUM_MILESTONES.join(", ").replace(/, (\d+)$/, " and $1")} stickers, and each time you complete a series, you also get a surprise: a sticker you don't have yet.</p>
        <p class="next">${escapeHtml(surprise)}</p>
      </section>
      <p class="note">Your stickers are kept on this device.</p>`;
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
      <p class="intro">Bookmarks keep the verses and lessons you want to come back to, all in one place, each with a note of your own if you like.</p>
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
        <p>Tap the DG emblem (or your avatar) at the top of the home page, then My Bookmarks. Tap a kind at the top (Bible Verses, Did You Know, Bible Sayings, Questions, Blueprint or Jesus’ Words) to switch between them.</p>
        <p class="next">Tap the red PDF button beside the title to open them all as one PDF, with your notes, ready to save, print or share.</p>
      </section>
      <section class="series">
        <div class="series-head"><h3>Notes and sharing</h3></div>
        <p>A note can be up to 280 characters: a sentence or two on why it matters, a prayer, or a name to remember. Under each bookmark in My Bookmarks, tap Add note or Edit note to write, change or remove it.</p>
        <p class="next">Tap Share to send the bookmark, with your note and a link to Daily Grace, to a friend, a group chat or a post. Where your browser can’t share, it is copied for you to paste.</p>
      </section>
      <section class="series">
        <div class="series-head"><h3>When a list is full</h3></div>
        <p>Each kind keeps up to its limit: 100 verses, and 50 of everything else. To make room, open My Bookmarks and hold one there to remove it.</p>
      </section>
      <p class="note">Bookmarks and notes are kept on this device. Clearing this browser’s data for Daily Grace removes them.</p>`;
}

if (!customElements.get("dg-menu")) {
    customElements.define("dg-menu", DgMenu);
}
