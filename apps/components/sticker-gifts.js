/**
 * <sticker-gifts> — gives the reader their stickers, and on the home page
 * shows their Sticker Album.
 *
 * Whenever the reader's progress changes (sticker-progress.js), it works out
 * what they have earned (sticker-awards.js). New stickers are shown as a
 * gift once nothing else is open: after the Moment's Amen, after the trivia
 * verdict, after "I had it" on the memory verse, at the end of a story. One
 * sticker gets the whole screen, with a button that shares it through the
 * phone's share sheet (assets/scripts/sticker-share.js); several come
 * together in a grid, and the very first time as a welcome to the album.
 *
 * With the `card` attribute it is also a card on the page: the album banner
 * with "My Sticker Album" over its plain right-hand side, then the latest
 * stickers, how many of the 188 the reader has, and the next one to aim for,
 * linking to the album. The banner changes with the day of the week in
 * Asia/Manila, and the card below it takes the banner's own colour:
 *   Monday–Wednesday   my-sticker-album-banner-emerald.webp     emerald
 *   Thursday–Friday    my-sticker-album-banner.webp             navy
 *   Saturday–Sunday    my-sticker-album-banner-apple-red.webp   apple red
 *
 * With `invite-after`, a reader who leaves the page untouched that many
 * minutes (no tap, key, scroll or mouse move) is invited to earn stickers:
 * "You can earn a sticker while using the Daily Grace App", with their next
 * goal. It waits while the page is hidden, a dialog is open or narration is
 * playing, comes at most once a visit, and not at all once every sticker is
 * earned. It has no buttons: a tap on it or anywhere on the page, or
 * Escape, closes it.
 *
 * Usage
 *   <sticker-gifts card invite-after="5"></sticker-gifts>
 *   <script type="module" src="./apps/components/sticker-gifts.js"></script>
 *
 * Attributes
 *   card          show the album card on the page
 *   album-href    the Sticker Album page, resolved against the page.
 *                 Default: apps/pages/stickers.html
 *   invite-after  minutes untouched before the invitation; none without it.
 *                 Read when the element is connected.
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
} from "../../assets/scripts/sticker-awards.js?v=20261030-1";
import { readProgress } from "../../assets/scripts/sticker-progress.js?v=20261018-1";
import {
    SHARE_NOTES,
    prepareShare,
    shareSticker,
} from "../../assets/scripts/sticker-share.js?v=20261030-1";

const asset = (path) => new URL(path, import.meta.url).href;
// The share icon of the poster's share button (poster-card.js).
const SHARE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>`;

const DEFAULT_ALBUM = "apps/pages/stickers.html";
const STICKERS_ICON = asset("../../assets/images/study-guide-icons/stickers.svg");
// What counts as the reader using the page, for the invitation.
const ACTIVITY_EVENTS = [
    "pointerdown",
    "pointermove",
    "keydown",
    "wheel",
    "scroll",
    "touchstart",
];
// The banners, each with the colour of its plain right-hand side, which the
// card below the banner takes so the two read as one piece.
const BANNERS = {
    emerald: {
        src: asset("../../assets/images/my-sticker-album-banner-emerald.webp"),
        colour: "#004126",
    },
    navy: {
        src: asset("../../assets/images/my-sticker-album-banner.webp"),
        colour: "#001c34",
    },
    appleRed: {
        src: asset("../../assets/images/my-sticker-album-banner-apple-red.webp"),
        colour: "#990b12",
    },
};
// The banner for each day of the week, Sunday first.
const BANNER_BY_DAY = [
    "appleRed",
    "emerald",
    "emerald",
    "emerald",
    "navy",
    "navy",
    "appleRed",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Today's banner, by the day of the week in Asia/Manila. */
function todaysBanner() {
    const weekday = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        weekday: "short",
    }).format(new Date());
    return BANNERS[BANNER_BY_DAY[Math.max(0, WEEKDAYS.indexOf(weekday))]];
}
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
     A gold edge, the banner across the top with its title on the banner's
     plain right-hand side, then the latest stickers fanned out on the left
     of a row with the count and the next goal. The card is the banner's own
     colour (--album-colour, set with the banner), with a few sparkles. */
  .card {
    --album-colour: var(--gift-navy);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgb(225 182 93 / 40%);
    border-left: 5px solid var(--gift-gold);
    border-radius: 10px;
    background:
      radial-gradient(circle at 12% 70%, rgb(225 182 93 / 22%) 0 2px, transparent 3px),
      radial-gradient(circle at 70% 75%, rgb(255 255 255 / 30%) 0 1.5px, transparent 2.5px),
      radial-gradient(circle at 88% 92%, rgb(225 182 93 / 25%) 0 2px, transparent 3px),
      var(--album-colour);
    color: #fff;
    text-decoration: none;
    box-shadow: 0 10px 26px rgb(0 27 52 / 26%);
    transition: transform .15s ease, box-shadow .15s ease;
  }
  .card:hover { transform: translateY(-1px); box-shadow: 0 14px 32px rgb(0 27 52 / 32%); }
  /* The banner's scene fills its left side; the title sits on the plain
     colour to the right, sized to the banner's width. */
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
  /* The arrow keeps nudging toward the album, as on the memory verse card,
     and hurries on hover. */
  .chevron { animation: nudge 1.8s ease-in-out infinite; }
  .card:hover .chevron { animation-duration: .9s; }
  @keyframes nudge {
    0%, 60%, 100% { transform: translateX(0); }
    30% { transform: translateX(6px); }
  }

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
  .share {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    min-height: 46px; padding: 0 22px;
    border: 1.5px solid var(--gift-gold-light); border-radius: 999px;
    background: none; color: var(--gift-gold-light);
    font: 700 1.02rem 'Strait', 'Roboto', sans-serif;
    cursor: pointer;
  }
  .share svg { width: 18px; height: 18px; }
  .share:hover { background: rgb(225 182 93 / 14%); }
  .share:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }
  .share[aria-busy="true"] { opacity: .7; cursor: progress; }
  .share-note { min-height: 1.3em; margin: -6px 0 0; color: #cfd8e6; font: 400 .95rem 'Strait', 'Roboto', sans-serif; }

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

  /* ----- The invitation: a card in the middle of the screen, on any size,
     with the album's star over its rays of light. ----- */
  dialog.invite {
    width: min(380px, calc(100% - 32px));
    /* A modal dialog is pinned to every edge, so "auto" would fill the screen. */
    height: fit-content;
    max-height: calc(100% - 32px);
    margin: auto;
    border-radius: 24px;
    /* The album banner's apple red, glowing lighter behind the star. */
    background:
      radial-gradient(90% 60% at 50% 25%, #c21f2a 0%, transparent 70%),
      ${BANNERS.appleRed.colour};
    box-shadow: 0 30px 80px rgb(0 0 0 / 45%);
    overflow-y: auto;
  }
  .invite { cursor: pointer; }
  .invite .lead { color: #f7e3e4; }
  .invite[open] { animation: rise .3s ease both; }
  @keyframes rise { from { opacity: 0; transform: translateY(16px) scale(.97); } }
  .invite .body { gap: 12px; padding: 28px 24px 24px; overflow: visible; }
  .invite .burst { width: 132px; margin-bottom: 4px; }
  .invite .heading { font-size: 1.95rem; }

  @media (prefers-reduced-motion: reduce) {
    .card { transition: none; }
    .chevron, .burst::before, .burst img, .grid img, .invite[open] { animation: none; }
  }
`;

const escapeHtml = (text) =>
    String(text ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Whether a component on the page is playing narration (its `playing` is true). */
function anyPlaying(root = document) {
    for (const element of root.querySelectorAll("*")) {
        if (element.playing === true) {
            return true;
        }
        if (element.shadowRoot && anyPlaying(element.shadowRoot)) {
            return true;
        }
    }
    return false;
}

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
    // The sticker given on its own, which the Share button sends.
    #gift = null;
    #timer = 0;
    #quietLooks = 0;
    #checking = null;
    #invite;
    #inviteAfter = 0;
    #inviteTimer = 0;
    #invited = false;
    #lastActive = 0;
    #onActivity = () => {
        this.#lastActive = Date.now();
    };
    // Progress made while the page is still loading is checked once it has
    // loaded (#onLoad), with everything else.
    #onProgress = () => {
        if (document.readyState === "complete") {
            this.#check();
        }
    };
    #onLoad = () => this.#check();
    // Coming back to the page on another day may bring another banner.
    #onVisible = () => {
        if (document.visibilityState === "visible") {
            this.#showBanner();
            // Coming back to the page counts as using it.
            this.#onActivity();
        }
    };

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: "open" });
        this.#root.innerHTML = `
      <style>${STYLES}</style>
      <a class="card" hidden>
        <span class="banner" aria-hidden="true">
          <img alt="" width="1376" height="411" loading="lazy" decoding="async" />
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
      </dialog>
      <dialog class="invite" aria-labelledby="invite-title" aria-describedby="invite-lead">
        <div class="body">
          <div class="burst"><img src="${STICKERS_ICON}" alt="" width="132" height="132" loading="lazy" /></div>
          <p class="label">Stickers to collect</p>
          <h2 class="heading" id="invite-title" tabindex="-1">You can earn a sticker!</h2>
          <p class="lead" id="invite-lead">You can earn a sticker while using the Daily Grace App. Each one goes into your own Sticker Album.</p>
          <p class="why invite-next" hidden></p>
        </div>
      </dialog>`;
        this.#card = this.#root.querySelector(".card");
        this.#dialog = this.#root.querySelector("dialog");
        this.#invite = this.#root.querySelector(".invite");
        // A tap on the invitation or anywhere around it closes it (a modal
        // dialog takes every tap on the page); Escape does too.
        this.#invite.addEventListener("click", () => this.#invite.close());
        for (const button of this.#dialog.querySelectorAll(".close, .second")) {
            button.addEventListener("click", () => this.#dialog.close());
        }
        this.#dialog.addEventListener("click", (event) => {
            if (event.target === this.#dialog) {
                this.#dialog.close();
                return;
            }
            const share = event.target.closest(".share");
            if (share) {
                this.#share(share);
            }
        });
    }

    /** Shares the sticker given on its own, saying how it went under the button. */
    async #share(button) {
        const note = this.#root.querySelector(".share-note");
        if (!this.#gift || button.getAttribute("aria-busy") === "true") {
            return;
        }
        note.textContent = "";
        button.setAttribute("aria-busy", "true");
        try {
            note.textContent = SHARE_NOTES[await shareSticker(this.#gift)];
        } finally {
            button.removeAttribute("aria-busy");
        }
    }

    connectedCallback() {
        registerFonts();
        document.addEventListener("stickerprogress", this.#onProgress);
        document.addEventListener("visibilitychange", this.#onVisible);
        // Working out the awards reads the sticker list and the month's verses,
        // so it waits for the page to finish loading first.
        if (document.readyState === "complete") {
            this.#check();
        } else {
            window.addEventListener("load", this.#onLoad, { once: true });
        }
        this.#watchIdle();
    }

    disconnectedCallback() {
        document.removeEventListener("stickerprogress", this.#onProgress);
        document.removeEventListener("visibilitychange", this.#onVisible);
        window.removeEventListener("load", this.#onLoad);
        clearTimeout(this.#timer);
        this.#timer = 0;
        this.#stopWatchingIdle();
    }

    // Upgrade calls this for the attributes already set, before
    // connectedCallback; until the page has loaded, the first check draws the
    // card instead.
    attributeChangedCallback(name, oldValue, newValue) {
        if (
            oldValue !== newValue &&
            this.isConnected &&
            document.readyState === "complete"
        ) {
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
        const single = gifts.length === 1 && !welcome;
        body.innerHTML = single
            ? this.#oneHtml(gifts[0])
            : this.#manyHtml(gifts, welcome);
        this.#gift = single ? gifts[0].sticker : null;
        if (single) {
            // Made while the reader looks, so a tap on Share can send it at once.
            prepareShare(this.#gift).catch(() => {});
        }
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
          ${verse}${ref}
          <button class="share" type="button">${SHARE_ICON}Share my sticker</button>
          <p class="share-note" role="status"></p>`;
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

    /* ----- The invitation ----- */

    // Watch for the reader leaving the page untouched for `invite-after`
    // minutes. Activity only notes the time; a single timer looks again when
    // the quiet would be up.
    #watchIdle() {
        const minutes = Number.parseFloat(this.getAttribute("invite-after"));
        if (this.#invited || !(minutes > 0)) {
            return;
        }
        this.#inviteAfter = minutes * 60_000;
        this.#onActivity();
        for (const type of ACTIVITY_EVENTS) {
            document.addEventListener(type, this.#onActivity, {
                capture: true,
                passive: true,
            });
        }
        this.#scheduleIdleCheck(this.#inviteAfter);
    }

    #stopWatchingIdle() {
        for (const type of ACTIVITY_EVENTS) {
            document.removeEventListener(type, this.#onActivity, {
                capture: true,
            });
        }
        clearTimeout(this.#inviteTimer);
        this.#inviteTimer = 0;
    }

    #scheduleIdleCheck(delay) {
        clearTimeout(this.#inviteTimer);
        this.#inviteTimer = setTimeout(() => this.#checkIdle(), delay);
    }

    #checkIdle() {
        const left = this.#inviteAfter - (Date.now() - this.#lastActive);
        if (left > 0) {
            this.#scheduleIdleCheck(left);
            return;
        }
        // Reading the Moment, listening to narration or being away from the
        // page is not idling: the quiet starts over.
        if (document.hidden || anyDialogOpen() || anyPlaying()) {
            this.#onActivity();
            this.#scheduleIdleCheck(this.#inviteAfter);
            return;
        }
        this.#showInvite();
    }

    /** Invite the reader to earn stickers, with their next goal. */
    async #showInvite() {
        this.#invited = true;
        this.#stopWatchingIdle();
        const next = this.#invite.querySelector(".invite-next");
        try {
            const stickers = await loadStickers();
            const goal = pickGoal(
                goals(readProgress(), readCollection(), stickers),
            );
            if (!goal) {
                return; // every sticker is earned
            }
            next.textContent = `Next: ${goal.text}.`;
            next.hidden = false;
        } catch {
            next.hidden = true;
        }
        // Something opened while the stickers loaded: wait for another quiet.
        if (!this.isConnected || anyDialogOpen()) {
            this.#invited = false;
            if (this.isConnected) {
                this.#watchIdle();
            }
            return;
        }
        this.#invite.showModal();
        this.#invite.querySelector(".heading").focus();
    }

    /** Today's banner, with the card in its colour. */
    #showBanner() {
        const banner = todaysBanner();
        const img = this.#root.querySelector(".banner img");
        if (img.getAttribute("src") !== banner.src) {
            img.src = banner.src;
        }
        this.#card.style.setProperty("--album-colour", banner.colour);
    }

    async #renderCard() {
        const show = this.hasAttribute("card");
        this.#card.hidden = !show;
        if (!show) {
            return;
        }
        this.#showBanner();
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
