/**
 * <sticker-gifts> — gives the reader their stickers, and on the home page
 * shows their Sticker Album.
 *
 * Whenever the reader's progress changes (sticker-progress.js), it works out
 * what they have earned (sticker-awards.js). New stickers are shown as a
 * gift once nothing else is open: after the Moment's Amen, after the trivia
 * verdict, after "I had it" on the memory verse, at the end of a story. One
 * sticker gets the whole screen; several come together in a grid, and the
 * very first time as a welcome to the album.
 *
 * With the `card` attribute it is also a card on the page: the album banner
 * (assets/images/my-sticker-album-banner.webp) with "My Sticker Album" over
 * its plain right-hand side, then the latest stickers, how many of the 188
 * the reader has, and the next one to aim for, linking to the album.
 *
 * Usage
 *   <sticker-gifts card></sticker-gifts>
 *   <script type="module" src="./apps/components/sticker-gifts.js"></script>
 *
 * Attributes
 *   card        show the album card on the page
 *   album-href  the Sticker Album page, resolved against the page.
 *               Default: apps/pages/stickers.html
 *
 * Methods      reveal()  show any stickers not yet shown, now
 * Events       giftshown  detail: { ids }
 *
 * Fonts: Germania One and Strait are registered on the document by
 * assets/scripts/fonts.js, because browsers do not reliably load @font-face
 * rules declared inside a shadow root.
 */

import { registerFonts } from "../../assets/scripts/fonts.js";
import {
    checkAwards,
    earnedFor,
    goals,
    loadStickers,
    markSeen,
    markWelcomed,
    pendingGifts,
    readCollection,
    stickerImage,
} from "../../assets/scripts/sticker-awards.js?v=20261018-1";
import { readProgress } from "../../assets/scripts/sticker-progress.js?v=20261018-1";

const asset = (path) => new URL(path, import.meta.url).href;

const DEFAULT_ALBUM = "apps/pages/stickers.html";
const BANNER_URL = asset("../../assets/images/my-sticker-album-banner.webp");
// After something is earned, a moment's pause before looking for a quiet
// moment to show it; then a look every POLL_MS until nothing has been open
// for QUIET_LOOKS looks in a row (a Moment can hand over to the memory verse).
const FIRST_PAUSE_MS = 1200;
const POLL_MS = 600;
const QUIET_LOOKS = 2;
// The latest stickers fanned out on the card.
const CARD_STICKERS = 3;

const ICON_ATTRS =
    'viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const CLOSE_ICON = `<svg ${ICON_ATTRS}><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>`;
const DOUBLE_NEXT_ICON = `<svg ${ICON_ATTRS}><polyline points="5 6 11 12 5 18"/><polyline points="13 6 19 12 13 18"/></svg>`;
const GIFT_ICON = `<svg ${ICON_ATTRS}><rect x="3" y="8" width="18" height="13" rx="1.5"/><path d="M12 8v13M3 12h18"/><path d="M12 8c-1.5-3-5-4-5.5-2S9 8 12 8zm0 0c1.5-3 5-4 5.5-2S15 8 12 8z"/></svg>`;

const STYLES = /* css */ `
  :host {
    --gift-navy: var(--navy, #001b34);
    --gift-navy-2: #0a2f52;
    --gift-gold: var(--gold, #c6922e);
    --gift-gold-light: var(--gold-light, #e1b65d);
    display: block;
    padding-inline: 10px;
  }
  :host(:not([card])) { display: contents; }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }
  button { font: inherit; }
  [hidden] { display: none !important; }

  /* ----- The album card -----
     Navy with a gold edge: the banner across the top, its title on the
     banner's plain right-hand side, then the latest stickers fanned out on
     the left of a row with the count and the next goal. */
  .card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgb(225 182 93 / 40%);
    border-left: 5px solid var(--gift-gold);
    border-radius: 10px;
    background:
      radial-gradient(circle at 12% 20%, rgb(225 182 93 / 22%) 0 2px, transparent 3px),
      radial-gradient(circle at 70% 15%, rgb(255 255 255 / 30%) 0 1.5px, transparent 2.5px),
      radial-gradient(circle at 88% 80%, rgb(225 182 93 / 25%) 0 2px, transparent 3px),
      radial-gradient(120% 120% at 0% 0%, rgb(225 182 93 / 16%) 0%, transparent 55%),
      linear-gradient(180deg, var(--gift-navy-2) 0%, var(--gift-navy) 100%);
    color: #fff;
    text-decoration: none;
    box-shadow: 0 10px 26px rgb(0 27 52 / 26%);
    transition: transform .15s ease, box-shadow .15s ease;
  }
  .card:hover { transform: translateY(-1px); box-shadow: 0 14px 32px rgb(0 27 52 / 32%); }
  /* The banner's scene fills its left side; the title sits on the plain
     navy to the right, sized to the banner's width. */
  .banner { position: relative; display: block; container-type: inline-size; }
  .banner img { display: block; width: 100%; height: auto; aspect-ratio: 1376 / 411; }
  .banner-title {
    position: absolute;
    top: 50%; right: 5%;
    width: 42%;
    transform: translateY(-50%);
    color: var(--gift-gold-light);
    font: 400 clamp(1.3rem, 8cqi, 3rem)/1.02 'Germania One', Georgia, serif;
    letter-spacing: .02em;
    text-align: center;
    text-shadow: 0 2px 0 rgb(0 0 0 / 35%), 0 0 18px rgb(225 182 93 / 35%);
    text-wrap: balance;
  }
  .row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    column-gap: 14px;
    padding: 14px 14px 16px 18px;
  }
  .card:focus-visible { outline: 3px solid var(--gift-gold-light); outline-offset: 3px; }
  .fan { position: relative; width: 96px; height: 80px; flex: none; }
  .fan img {
    position: absolute; top: 4px;
    width: 72px; height: 72px;
    object-fit: contain;
    filter: drop-shadow(0 4px 6px rgb(0 0 0 / 35%));
  }
  .fan img:nth-child(1) { left: 0; transform: rotate(-10deg); }
  .fan img:nth-child(2) { left: 12px; transform: rotate(4deg); }
  .fan img:nth-child(3) { left: 24px; transform: rotate(12deg); }
  .fan .empty {
    position: absolute; inset: 4px 12px;
    display: grid; place-items: center;
    border: 2px dashed rgb(225 182 93 / 60%); border-radius: 16px;
    color: var(--gift-gold-light);
  }
  .fan .empty svg { width: 36px; height: 36px; }
  .text { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .count { color: #fff; font: 400 1.4rem/1.15 'Germania One', Georgia, serif; letter-spacing: .02em; }
  .next { color: #cfd8e6; font: 400 .95rem/1.3 'Strait', 'Roboto', sans-serif; text-wrap: pretty; }
  .bar { height: 5px; margin-top: 5px; border-radius: 3px; background: rgb(255 255 255 / 16%); overflow: hidden; }
  .bar span { display: block; height: 100%; border-radius: inherit; background: var(--gift-gold-light); }
  .chevron { color: var(--gift-gold-light); }
  .chevron svg { display: block; width: 30px; height: 30px; stroke-width: 3.4; }

  /* ----- The gift ----- */
  dialog {
    width: 100%; max-width: 100%;
    height: 100%; max-height: 100%;
    margin: 0; padding: 0; border: 0;
    background:
      radial-gradient(90% 60% at 50% 30%, #12406b 0%, transparent 70%),
      var(--gift-navy);
    color: #fff;
    overflow: hidden;
  }
  dialog::backdrop { background: rgb(0 27 52 / 72%); }
  @media (min-width: 600px) {
    dialog {
      width: 480px;
      height: min(820px, calc(100% - 48px));
      margin: auto;
      border-radius: 24px;
      box-shadow: 0 30px 80px rgb(0 0 0 / 45%);
    }
  }
  .frame { display: flex; flex-direction: column; height: 100%; }
  .top { display: flex; padding: max(12px, env(safe-area-inset-top)) 8px 0; }
  .close {
    display: grid; place-items: center;
    width: 44px; height: 44px; padding: 0;
    border: 0; border-radius: 50%;
    background: none; color: inherit;
    cursor: pointer;
  }
  .close svg { width: 22px; height: 22px; }
  .close:focus-visible { outline: 2px solid currentColor; outline-offset: -4px; }
  .body {
    display: flex; flex: 1; flex-direction: column; align-items: center; gap: 14px;
    min-height: 0; overflow-y: auto;
    padding: 0 28px 12px;
    text-align: center;
  }
  .body > * { flex-shrink: 0; }
  .body > :first-child { margin-top: auto; }
  .body > :last-child { margin-bottom: auto; }
  .label {
    margin: 0;
    color: var(--gift-gold-light);
    font: 700 .85rem/1.2 'Strait', 'Roboto', sans-serif;
    letter-spacing: .16em; text-transform: uppercase;
  }
  .heading { margin: 0; font: 400 2.2rem/1.1 'Germania One', Georgia, serif; letter-spacing: .02em; }
  .heading:focus { outline: none; }
  .lead { margin: 0; color: #cfd8e6; font: 400 1.1rem/1.45 'Strait', 'Roboto', sans-serif; text-wrap: pretty; }
  .why { margin: 0; color: var(--gift-gold-light); font: 700 1.05rem/1.35 'Strait', 'Roboto', sans-serif; }

  /* One sticker: big, popping in over slowly turning rays of light. */
  .burst { position: relative; display: grid; place-items: center; width: min(78vw, 320px); aspect-ratio: 1; }
  .burst::before {
    content: ""; position: absolute; inset: -12%;
    border-radius: 50%;
    background: repeating-conic-gradient(rgb(225 182 93 / 22%) 0 9deg, transparent 9deg 22deg);
    mask: radial-gradient(circle, #000 25%, transparent 70%);
    animation: turn 24s linear infinite;
  }
  .burst img {
    position: relative;
    width: 100%; height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 12px 24px rgb(0 0 0 / 45%));
    animation: pop .7s cubic-bezier(.2, 1.4, .4, 1) both;
  }
  @keyframes turn { to { transform: rotate(1turn); } }
  @keyframes pop {
    from { opacity: 0; transform: scale(.3) rotate(-14deg); }
    to { opacity: 1; transform: none; }
  }
  .verse { margin: 0; color: #f2f5fa; font: 400 1.15rem/1.5 Georgia, 'Times New Roman', serif; text-wrap: pretty; }
  .ref { margin: -6px 0 0; color: var(--gift-gold-light); font: 700 1rem Georgia, serif; }

  /* Several stickers: a grid of them. */
  .grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 14px 10px;
    width: 100%;
    margin: 4px 0 0; padding: 0; list-style: none;
  }
  .grid a { display: flex; flex-direction: column; align-items: center; gap: 4px; color: inherit; text-decoration: none; }
  .grid img {
    width: 100%; height: auto; aspect-ratio: 1; object-fit: contain;
    filter: drop-shadow(0 6px 10px rgb(0 0 0 / 40%));
    animation: pop .6s cubic-bezier(.2, 1.4, .4, 1) both;
  }
  .grid strong { font: 400 1rem/1.15 'Germania One', Georgia, serif; letter-spacing: .02em; }
  .grid small { color: #cfd8e6; font: 400 .85rem/1.25 'Strait', 'Roboto', sans-serif; }
  .grid a:focus-visible { outline: 3px solid var(--gift-gold-light); outline-offset: 2px; border-radius: 8px; }

  .nav {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 20px max(24px, env(safe-area-inset-bottom));
  }
  .main, .second {
    display: flex; flex: 1; align-items: center; justify-content: center;
    min-height: 54px; padding: 0 18px;
    border: 0; border-radius: 999px;
    font: 700 1.1rem 'Strait', 'Roboto', sans-serif;
    text-decoration: none;
    cursor: pointer;
  }
  .main { background: var(--gift-gold-light); color: var(--gift-navy); }
  .second { flex: none; border: 1.5px solid rgb(255 255 255 / 35%); background: none; color: #fff; }
  .main:focus-visible, .second:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }

  @media (prefers-reduced-motion: reduce) {
    .card { transition: none; }
    .burst::before, .burst img, .grid img { animation: none; }
  }
`;

const escapeHtml = (text) =>
    String(text ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Whether any dialog is open on the page, in a component's shadow root or not. */
function anyDialogOpen(root = document) {
    if (root.querySelector("dialog[open]")) {
        return true;
    }
    for (const element of root.querySelectorAll("*")) {
        if (element.shadowRoot && anyDialogOpen(element.shadowRoot)) {
            return true;
        }
    }
    return false;
}

export class StickerGifts extends HTMLElement {
    static observedAttributes = ["card", "album-href"];

    #root;
    #card;
    #dialog;
    #timer = 0;
    #quietLooks = 0;
    #checking = null;
    #onProgress = () => this.#check();

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: "open" });
        this.#root.innerHTML = `
      <style>${STYLES}</style>
      <a class="card" hidden>
        <span class="banner" aria-hidden="true">
          <img src="${BANNER_URL}" alt="" width="1376" height="411" loading="lazy" decoding="async" />
          <span class="banner-title">My Sticker Album</span>
        </span>
        <span class="row">
          <span class="fan" aria-hidden="true"></span>
          <span class="text">
            <span class="count"></span>
            <span class="next"></span>
            <span class="bar" aria-hidden="true"><span></span></span>
          </span>
          <span class="chevron" aria-hidden="true">${DOUBLE_NEXT_ICON}</span>
        </span>
      </a>
      <dialog aria-labelledby="gift-title">
        <div class="frame">
          <div class="top">
            <button class="close" type="button" aria-label="Close">${CLOSE_ICON}</button>
          </div>
          <div class="body"></div>
          <div class="nav">
            <button class="second" type="button">Close</button>
            <a class="main">Open my album</a>
          </div>
        </div>
      </dialog>`;
        this.#card = this.#root.querySelector(".card");
        this.#dialog = this.#root.querySelector("dialog");
        for (const button of this.#root.querySelectorAll(".close, .second")) {
            button.addEventListener("click", () => this.#dialog.close());
        }
        this.#dialog.addEventListener("click", (event) => {
            if (event.target === this.#dialog) {
                this.#dialog.close();
            }
        });
    }

    connectedCallback() {
        registerFonts();
        document.addEventListener("stickerprogress", this.#onProgress);
        this.#check();
    }

    disconnectedCallback() {
        document.removeEventListener("stickerprogress", this.#onProgress);
        clearTimeout(this.#timer);
        this.#timer = 0;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.isConnected) {
            this.#renderCard();
        }
    }

    get #albumHref() {
        return new URL(
            this.getAttribute("album-href") || DEFAULT_ALBUM,
            document.baseURI,
        ).href;
    }

    /** Award what is due, then show it when the page is quiet. */
    async #check() {
        // One check at a time; a change during it is caught by the next.
        if (this.#checking) {
            await this.#checking;
        }
        this.#checking = checkAwards()
            .catch((error) => {
                console.warn("Stickers could not be checked:", error);
                return [];
            })
            .finally(() => {
                this.#checking = null;
            });
        await this.#checking;
        await this.#renderCard();
        if (pendingGifts().length) {
            this.#waitForQuiet(FIRST_PAUSE_MS);
        }
    }

    #waitForQuiet(delay = POLL_MS) {
        if (this.#timer) {
            return;
        }
        this.#timer = setTimeout(() => {
            this.#timer = 0;
            const quiet =
                document.visibilityState === "visible" &&
                !this.#dialog.open &&
                !anyDialogOpen();
            this.#quietLooks = quiet ? this.#quietLooks + 1 : 0;
            if (this.#quietLooks >= QUIET_LOOKS) {
                this.#quietLooks = 0;
                this.reveal();
            } else {
                this.#waitForQuiet();
            }
        }, delay);
    }

    /** Show any stickers not yet shown. */
    async reveal() {
        const ids = pendingGifts();
        if (!ids.length || this.#dialog.open) {
            return;
        }
        let stickers;
        try {
            stickers = await loadStickers();
        } catch {
            return;
        }
        const byId = new Map(stickers.map((sticker) => [sticker.id, sticker]));
        const collection = readCollection();
        const gifts = ids
            .map((id) => ({ sticker: byId.get(id), entry: collection.earned[id] }))
            .filter((gift) => gift.sticker);
        if (!gifts.length) {
            return;
        }
        const welcome = !collection.welcomed;
        const body = this.#root.querySelector(".body");
        body.innerHTML =
            gifts.length === 1 && !welcome
                ? this.#oneHtml(gifts[0])
                : this.#manyHtml(gifts, welcome);
        const main = this.#root.querySelector(".main");
        const album = new URL(this.#albumHref);
        if (gifts.length === 1) {
            album.hash = gifts[0].sticker.id;
        }
        main.href = album.href;
        main.textContent =
            gifts.length === 1 ? "See it in my album" : "Open my album";

        markSeen(ids);
        markWelcomed();
        this.#dialog.showModal();
        this.#root.querySelector(".heading")?.focus();
        this.#renderCard();
        this.dispatchEvent(new CustomEvent("giftshown", { detail: { ids } }));
    }

    #oneHtml({ sticker, entry }) {
        const verse = sticker.verse
            ? `<p class="verse">${escapeHtml(sticker.verse)}</p>`
            : "";
        const ref =
            sticker.verse && sticker.reference
                ? `<p class="ref">${escapeHtml(sticker.reference)}</p>`
                : "";
        return `
          <p class="label">A gift for you</p>
          <div class="burst"><img src="${escapeHtml(stickerImage(sticker))}" alt="${escapeHtml(sticker.title)} sticker" width="600" height="600" /></div>
          <h2 class="heading" id="gift-title" tabindex="-1">${escapeHtml(sticker.title)}</h2>
          <p class="why">${escapeHtml(earnedFor(entry, sticker))}</p>
          ${verse}${ref}`;
    }

    #manyHtml(gifts, welcome) {
        const heading = welcome
            ? "Welcome to your Sticker Album"
            : `${gifts.length} new stickers!`;
        const lead = welcome
            ? `<p class="lead">You have already earned ${gifts.length === 1 ? "your first sticker" : `${gifts.length} stickers`} for what you have done in Daily Grace. Keep going to fill your album: there are 188 to collect.</p>`
            : `<p class="lead">Here is what you have earned.</p>`;
        const items = gifts
            .map(({ sticker, entry }) => {
                const href = new URL(this.#albumHref);
                href.hash = sticker.id;
                return `
            <li><a href="${escapeHtml(href.href)}">
              <img src="${escapeHtml(stickerImage(sticker))}" alt="" width="600" height="600" />
              <strong>${escapeHtml(sticker.title)}</strong>
              <small>${escapeHtml(earnedFor(entry, sticker))}</small>
            </a></li>`;
            })
            .join("");
        return `
          <p class="label">${welcome ? "A gift for you" : "Gifts for you"}</p>
          <h2 class="heading" id="gift-title" tabindex="-1">${heading}</h2>
          ${lead}
          <ul class="grid">${items}</ul>`;
    }

    async #renderCard() {
        const show = this.hasAttribute("card");
        this.#card.hidden = !show;
        if (!show) {
            return;
        }
        let stickers;
        try {
            stickers = await loadStickers();
        } catch {
            this.#card.hidden = true;
            return;
        }
        const byId = new Map(stickers.map((sticker) => [sticker.id, sticker]));
        const collection = readCollection();
        const earned = Object.entries(collection.earned)
            .filter(([id]) => byId.has(id))
            .sort((a, b) => a[1].day.localeCompare(b[1].day));
        const latest = earned.slice(-CARD_STICKERS).map(([id]) => byId.get(id));

        this.#card.href = this.#albumHref;
        this.#card.querySelector(".fan").innerHTML = latest.length
            ? latest
                  .map(
                      (sticker) =>
                          `<img src="${escapeHtml(stickerImage(sticker))}" alt="" width="600" height="600" loading="lazy" decoding="async" />`,
                  )
                  .join("")
            : `<span class="empty">${GIFT_ICON}</span>`;
        this.#card.querySelector(".count").textContent = earned.length
            ? `${earned.length} of ${stickers.length} stickers`
            : "Start your sticker album";

        const goal = pickGoal(goals(readProgress(), collection, stickers));
        this.#card.querySelector(".next").textContent = goal
            ? `Next: ${goal.text}.`
            : "You have every sticker. Well done!";
        const bar = this.#card.querySelector(".bar");
        bar.hidden = !goal;
        if (goal) {
            bar.firstElementChild.style.width = `${Math.round((goal.done / goal.step) * 100)}%`;
        }
        this.#card.setAttribute(
            "aria-label",
            `My Sticker Album: ${this.#card.querySelector(".count").textContent}. ${this.#card.querySelector(".next").textContent}`,
        );
    }
}

/**
 * The goal for the card: the next first while the Armour is unfinished, else
 * the closest of the counted paths, else this week's memory verse or the
 * bookshelf.
 */
function pickGoal(list) {
    const firsts = list.find((goal) => goal.group === "AG");
    if (firsts) {
        return firsts;
    }
    const counted = list
        .filter((goal) => !["BS", "BK"].includes(goal.group))
        .sort((a, b) => a.remaining - b.remaining);
    return counted[0] ?? list.find((goal) => goal.group === "BS") ?? list[0];
}

if (!customElements.get("sticker-gifts")) {
    customElements.define("sticker-gifts", StickerGifts);
}
