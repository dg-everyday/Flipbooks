/**
 * <flip-book> — a page-turning reader as a web component.
 *
 * Custom element names must contain a hyphen, so the tag is <flip-book>
 * (the class is exported as `Flipbook`).
 *
 * The component owns the stage: loading message, book shadow, single-page
 * book (portrait / narrow screens) and two-page spread (landscape desktop).
 * It renders whatever page list it is handed and knows nothing about where
 * those pages came from — the calling page decides that. The toolbar (home,
 * prev/next, zoom buttons) also lives in your page and drives the component
 * through its public methods.
 *
 * Usage
 *   <flip-book id="reader"></flip-book>
 *   <script type="module">
 *     import './flip-book.js';
 *     document.getElementById('reader').pages = [ ... ];
 *   </script>
 *
 * The `pages` property is the whole input. Each entry is either a plain image
 * URL string or a descriptor:
 *
 *   @typedef {Object} FlipPage
 *   @property {string}  [src]          Image URL, already resolved. Omit for a blank leaf.
 *   @property {string}  [alt]          Alt text. Falls back to `Page {n}`.
 *   @property {string}  [audio]        Narration URL. Present → a play button is drawn.
 *   @property {FlipAction} [action]    A small pill drawn at the page's top right
 *                                      (left of the play button when there is one);
 *                                      a tap fires `pageaction`.
 *   @property {string}  [id]           Opaque caller key, echoed back on `pagechange`.
 *   @property {FlipPlaceholder} [placeholder]  Render this instead of the image.
 *
 *   @typedef {Object} FlipAction
 *   @property {string}  label          The pill's text, kept short ("KJV").
 *   @property {string}  [title]        Its accessible name and tooltip.
 *
 *   @typedef {Object} FlipPlaceholder
 *   @property {boolean} [logo]         Show the circular logo mark.
 *   @property {string}  [title]        Large bold line.
 *   @property {string}  [badge]        Accent line beneath the title.
 *   @property {string}  [label]        Small caps line.
 *   @property {string}  [headline]     Emphasised line (a date, a number).
 *   @property {string}  [body]         Small closing line.
 *
 * Resolution order per page: `placeholder` wins, else `src`, else a blank leaf.
 * Every feature is opt-in by presence, so `pages = ['a.webp', 'b.webp']` is a
 * complete, valid call.
 *
 * Attributes
 *   aspect       Page aspect ratio as "W/H" or a decimal. Default 9/16. Used
 *                until the first image reports its own natural size.
 *   label        Accessible name for the stage, and the noun in the loading
 *                message. Default "flipbook".
 *   empty-text   Message shown when `pages` is set to an empty list.
 *   end-page     "off" suppresses the trailing blank endpaper. Default on.
 *   flip         "up" binds the book along its top edge, like a steno notebook:
 *                pages flip upward (swipe up or tap the lower half to go on, swipe
 *                down or tap the upper half to go back), in a single page at any
 *                screen size. Default: bound at the left, turning sideways.
 *   flip-sound   Page-turn sound. A URL (resolved against the page) replaces the
 *                default ../../assets/audio/page_flip.webm; "off" disables it.
 *
 * Methods      next(), prev(), zoomIn(), zoomOut(), resetZoom()
 * Properties   pages (get/set), page (read-only, current index),
 *              pageCount (read-only), zoom (get/set, 1–3.5)
 * Events       ready       detail: { pageCount }
 *              pagechange  detail: { index, pageCount, id }
 *              pageaction  a page's action pill was tapped, detail: { index, id }
 *              finish      the last page is on show, once each time pages is
 *                          set, detail: { pageCount } (without the end leaf)
 *              error       detail: { message }
 *
 * Sizing: the host fills its parent (flex: 1 in a column flex container).
 * In flip="up" the wheel scrolls the page; it only zooms with Ctrl held (a
 * trackpad pinch), so a book embedded in a page does not trap the scrolling.
 *
 * CSS custom properties
 *   --flipbook-navy, --flipbook-shadow
 *   --flipbook-future-paper   url() for placeholder pages
 *   --flipbook-end-paper      url() for blank/end pages
 *   --flipbook-wire           url() list for the wire binding (later entries are fallbacks)
 *   --flipbook-wire-top       url() for the rings along the top edge of a flip="up" book
 *   --flipbook-logo           url() for the logo on placeholder pages
 */

const DEFAULT_FLIP_SOUND = new URL(
    "../../assets/audio/page_flip.webm",
    import.meta.url,
).href;
const DEFAULT_ASPECT = 9 / 16;
const TURN_MS = 340; // one half of a page turn

// Single-page (portrait) geometry. The book sits against the left edge with the
// spring touching it, so the stage reserves the spring's overhang on the left
// and a gutter on the right; the page takes everything in between.
const WIRE_WIDTH = 40; // drawn width of the spring
const WIRE_OVERHANG = 28; // how far it reaches past the page edge
const STAGE_PAD = 3; // .stage padding on every side but the left
const RIGHT_GUTTER = 14; // paper showing to the right of the page

// Top-bound (flip="up") geometry: a short row of straight rings along the edge.
const UP_WIRE_HEIGHT = 24; // drawn height of the ring tile
const UP_WIRE_WIDTH = 28; // drawn width of the ring tile (one ring)
const UP_OVERHANG = 14; // how far the rings reach above the page edge

// Artwork is fetched for the pages around the one on show, not all at once,
// so the first page is up as soon as its own image arrives and the rest
// follow a few turns ahead of the reader.
const LOAD_BEHIND = 2;
const LOAD_AHEAD = 4;

const PLAY_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
const PAUSE_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';

const STYLES = /* css */ `
  :host {
    --flipbook-navy: #071d35;
    --flipbook-shadow: rgba(0, 0, 0, .38);
    --flipbook-future-paper: url('../../assets/images/specialty-paper.svg');
    --flipbook-end-paper: url('../../assets/images/end-paper.svg');
    --flipbook-wire: url('../../assets/images/wire-binding.svg?v=3');
    --flipbook-wire-top: url('../../assets/images/wire-binding-top.svg');
    --flipbook-logo: url('../../assets/images/dg-icon-02-flat-256.webp');


    display: block;
    position: relative;
    flex: 1 1 0;
    min-height: 0;
    height: 100%;
    overflow: hidden;
    color: #fff;
  }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }

  .stage {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
    perspective: 2200px; perspective-origin: 50% 50%;
    cursor: grab;
    touch-action: none;
  }
  .stage.dragging { cursor: grabbing; }

  .book-shadow {
    position: absolute; width: min(92vw, 560px); height: min(78vh, 1000px);
    border-radius: 12px; background: rgba(0, 0, 0, .32); filter: blur(24px);
    transform: translateY(20px) scale(.96); pointer-events: none;
  }

  /* Width and height are set from JS (fitBookToViewport). */
  .book {
    position: relative;
    flex-shrink: 0;
    height: 100%;
    aspect-ratio: var(--flipbook-aspect, 9 / 16);
    transform-style: flat;
    isolation: isolate;
    will-change: transform;
  }
  .desktop-spread { display: none; }

  .page {
    position: absolute; inset: 0; transform-style: flat;
    transform-origin: left center;
    border-radius: 5px 9px 9px 5px;
    overflow: hidden;
    box-shadow: 8px 10px 25px var(--flipbook-shadow);
    background: #eee;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  .page[hidden] { display: none; }
  .page img {
    width: 100%; height: 100%; object-fit: contain; display: block;
    background: #eee;
    user-select: none; -webkit-user-drag: none;
  }

  /* Pages not yet released */
  .page.future-page,
  .desktop-spread .future-page {
    background: #f3ead7 var(--flipbook-future-paper) repeat;
    box-shadow: inset 0 0 32px rgba(126, 103, 65, .12);
    overflow: hidden;
    container-type: inline-size;
  }
  .future-page img,
  .future-page .audio-play { visibility: hidden; }
  .future-page .audio-play { pointer-events: none; }

  .availability-message {
    -webkit-user-select: none; user-select: none;
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    margin: 0; padding: 8%;
    color: #000;
    font-family: Georgia, 'Times New Roman', serif;
    line-height: 1.05;
    text-align: center;
  }
  .availability-logo {
    display: block; flex-shrink: 0;
    width: 96px; height: 96px;
    border: 3px solid #fff; border-radius: 50%;
    margin-bottom: 2%;
    background: var(--flipbook-logo) center / contain no-repeat;
  }
  .availability-title,
  .availability-comic { font-size: max(14px, 5cqw); font-weight: 900; }
  .availability-comic { margin-top: 1%; color: #008080; }
  .availability-detail {
    width: 100%; margin-top: 4%;
    font-family: Arial, Helvetica, sans-serif; font-weight: 800;
  }
  .availability-label { font-size: max(12px, 3.2cqw); }
  .availability-date { margin-top: 1.5%; color: #800000; font-size: max(16px, 6cqw); }
  .availability-verse {
    margin-top: 2%; color: #000;
    font-family: Arial, Helvetica, sans-serif;
    font-size: max(12px, 3cqw); font-weight: 700; line-height: 1.2;
  }

  /* Blank / end pages */
  .page.end-page,
  .desktop-spread .blank-page,
  .desktop-spread .end-page {
    background: #d6b995 var(--flipbook-end-paper) repeat;
    box-shadow: inset 0 0 32px rgba(112, 78, 43, .14);
  }

  .loading {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: #f7eddb; color: var(--flipbook-navy);
    z-index: 50; font-size: 16px; text-align: center; padding: 1rem;
  }

  /* Single page (portrait / narrow) */
  @media (max-width: 600px), (orientation: portrait) {
    /* No padding on the left: the spring is meant to touch that edge. */
    .stage {
      padding: ${STAGE_PAD}px ${STAGE_PAD}px ${STAGE_PAD}px 0;
      justify-content: flex-start;
    }
    /* The margin is the spring's overhang, so the page starts just far enough
       in for the spring to land flush against the left edge of the stage. Any
       width the page cannot use then shows as paper on the right. */
    .book { margin-left: ${WIRE_OVERHANG}px; }
    /* Pin the drop shadow to the same span instead of letting it follow the
       flex alignment out to the left edge. */
    .book-shadow {
      left: ${WIRE_OVERHANG}px; right: ${RIGHT_GUTTER}px; width: auto;
      transform: translateY(20px) scale(.96);
    }
    .book::after {
      content: "";
      position: absolute; top: 0; bottom: 0; left: -${WIRE_OVERHANG}px;
      width: ${WIRE_WIDTH}px;
      background-image: var(--flipbook-wire);
      background-position: center top;
      background-size: ${WIRE_WIDTH}px 28px;
      background-repeat: repeat-y;
      pointer-events: none;
      z-index: 100;
    }
  }

  /* Two-page spread (landscape desktop) */
  @media (min-width: 601px) and (orientation: landscape) {
    .book { display: none; }
    .desktop-spread {
      position: relative;
      display: flex;
      flex-shrink: 0;
      transform-origin: center;
      will-change: transform;
      width: min(calc(100% - 80px), 1120px);
      height: 92%;
      justify-content: center;
      gap: 16px;
      padding: 0;
      overflow: hidden;
      border-radius: 5px 9px 9px 5px;
      box-shadow: 8px 10px 25px var(--flipbook-shadow);
      /* Warm paper edges fall into a narrow, dark crease at the spine. */
      background:
        linear-gradient(to right,
          #eee4d2 0%, #d0bfa3 18%, #95816a 38%,
          #514337 49%, #44382e 51%, #8c7862 64%,
          #cbbb9f 82%, #eee4d2 100%) center / 16px 100% no-repeat,
        #eee;
    }
    .desktop-spread .spread-page {
      position: relative;
      flex: 1 1 0; min-width: 0; width: 0; height: 100%;
    }
    /* Repeated metal loops bridge the spine and the punched page edges. */
    .desktop-spread::after {
      content: "";
      position: absolute; top: 0; bottom: 0; left: 50%;
      width: 40px;
      transform: translateX(-50%);
      background-image: var(--flipbook-wire);
      background-position: center top;
      background-size: 40px 28px;
      background-repeat: repeat-y;
      pointer-events: none;
      z-index: 3;
    }
    .desktop-spread .spread-page img {
      width: 100%; height: 100%; object-fit: contain;
      background: #eee; user-select: none; -webkit-user-drag: none;
    }
    .desktop-spread .spread-page:first-child { cursor: w-resize; }
    .desktop-spread .spread-page:last-child { cursor: e-resize; }
  }

  /* Upward flip (flip="up"): the book hangs from a row of short, straight
     rings along its top edge, in a single page at any size. Placed after the
     media blocks to win over both of them. */
  :host([flip="up"]) .stage {
    padding: 0 ${STAGE_PAD}px ${STAGE_PAD}px;
    justify-content: center; align-items: flex-start;
  }
  :host([flip="up"]) .book-shadow,
  :host([flip="up"]) .desktop-spread { display: none; }
  :host([flip="up"]) .book { display: block; margin: ${UP_OVERHANG}px 0 0; }
  :host([flip="up"]) .page { border-radius: 5px 5px 9px 9px; }
  /* A soft shadow under the whole book, as the side-bound one has. */
  :host([flip="up"]) .book::before {
    content: "";
    position: absolute; inset: 0;
    border-radius: 12px; background: rgba(0, 0, 0, .32); filter: blur(24px);
    transform: translateY(20px) scale(.96);
    pointer-events: none; z-index: -1;
  }
  :host([flip="up"]) .book::after {
    content: "";
    position: absolute; top: -${UP_OVERHANG}px; left: 0; right: 0; bottom: auto;
    width: auto; height: ${UP_WIRE_HEIGHT}px;
    background-image: var(--flipbook-wire-top);
    background-position: center top;
    background-size: ${UP_WIRE_WIDTH}px ${UP_WIRE_HEIGHT}px;
    background-repeat: repeat-x;
    transform: none;
    pointer-events: none;
    z-index: 100;
  }

  /* Narration button */
  .audio-play {
    appearance: none;
    position: absolute; top: 0; left: 0; z-index: 6;
    width: 44px; height: 44px; min-width: 44px; padding: 0;
    border-radius: 50%;
    border: 2px solid rgba(217, 168, 79, .95);
    background: #c62828; color: #f7f0df;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(0, 0, 0, .35);
    cursor: pointer; line-height: 1;
    touch-action: manipulation;
    opacity: 0; pointer-events: none;
  }
  .audio-play.is-placed { opacity: 1; pointer-events: auto; }
  .audio-play svg { display: block; width: 26px; height: 26px; }
  .audio-play:hover,
  .audio-play:focus-visible { background: #a91f1f; color: #fff; }
  .audio-play:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
  .audio-play.is-playing { background: #c62828; color: #fff; border-color: #f0c66c; }

  /* A page's action pill (FlipAction): small and white on red, at the page's
     top right. Its tap area reaches 44px beyond the pill itself. */
  .page-action {
    appearance: none;
    position: absolute; top: 0; left: 0; z-index: 6;
    min-width: 0; height: 26px; padding: 0 10px;
    border: 0; border-radius: 999px;
    background: #c62828; color: #fff;
    font: 800 12px/26px system-ui, -apple-system, "Segoe UI", sans-serif;
    letter-spacing: .06em;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .35);
    cursor: pointer;
    touch-action: manipulation;
    opacity: 0; pointer-events: none;
  }
  .page-action::before { content: ""; position: absolute; inset: -9px -6px; }
  .page-action.is-placed { opacity: 1; pointer-events: auto; }
  .page-action:hover { background: #a91f1f; }
  .page-action:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
  .future-page .page-action { visibility: hidden; pointer-events: none; }
`;

const TEMPLATE = /* html */ `
  <style>${STYLES}</style>
  <div class="stage" id="stage" role="region" aria-label="flipbook">
    <div class="loading" id="loading" role="status">Preparing your flipbook…</div>
    <div class="book-shadow"></div>
    <div class="book" id="book" role="group" aria-label="flipbook"></div>
    <div class="desktop-spread" id="desktopSpread" role="group" aria-label="flipbook spread"></div>
  </div>
`;

/* ---------- Pure helpers ---------- */

// A page entry may be a bare image URL or a full descriptor; both become the
// same shape so nothing downstream has to re-check. Unknown keys are dropped
// rather than carried, so a typo fails loudly instead of silently doing nothing.
function normalizePage(entry) {
    if (entry == null) {
        return { src: null, alt: "", audio: null, action: null, id: null, placeholder: null };
    }
    if (typeof entry === "string") {
        return {
            src: entry || null,
            alt: "",
            audio: null,
            action: null,
            id: null,
            placeholder: null,
        };
    }
    const placeholder =
        entry.placeholder && typeof entry.placeholder === "object"
            ? {
                  logo: !!entry.placeholder.logo,
                  title: entry.placeholder.title || "",
                  badge: entry.placeholder.badge || "",
                  label: entry.placeholder.label || "",
                  headline: entry.placeholder.headline || "",
                  body: entry.placeholder.body || "",
              }
            : null;
    return {
        src: entry.src || null,
        alt: typeof entry.alt === "string" ? entry.alt : "",
        audio: entry.audio || null,
        action:
            entry.action && typeof entry.action.label === "string" && entry.action.label
                ? { label: entry.action.label, title: entry.action.title || entry.action.label }
                : null,
        id: entry.id ?? null,
        placeholder,
    };
}

function normalizePages(list) {
    return Array.isArray(list) ? list.map(normalizePage) : [];
}

// A page shows its placeholder if it has one, otherwise its image, otherwise
// nothing at all — which is how a blank leaf is expressed.
function isBlank(page) {
    return !page || (!page.src && !page.placeholder);
}

function parseAspect(value) {
    if (!value) {
        return DEFAULT_ASPECT;
    }
    const parts = String(value).split("/");
    const ratio =
        parts.length === 2
            ? Number(parts[0]) / Number(parts[1])
            : Number(value);
    return Number.isFinite(ratio) && ratio > 0 ? ratio : DEFAULT_ASPECT;
}

function sameAudioUrl(a, b) {
    if (!a || !b) {
        return false;
    }
    try {
        return decodeURI(a) === decodeURI(b);
    } catch {
        return a === b;
    }
}

function containedImageBox(img) {
    const frameW = img.clientWidth;
    const frameH = img.clientHeight;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    if (!natW || !natH || !frameW || !frameH) {
        return { left: 0, top: 0, width: frameW, height: frameH };
    }
    const scale = Math.min(frameW / natW, frameH / natH);
    const width = natW * scale;
    const height = natH * scale;
    return {
        left: (frameW - width) / 2,
        top: (frameH - height) / 2,
        width,
        height,
    };
}

// Spread mode pairs the opening blank with page 1, then pages 2–3, 4–5, etc.
function spreadStart(index) {
    return Math.floor((index + 1) / 2) * 2 - 1;
}

// `axis` is "Y" for a page hinged at its left edge, "X" for one hinged at the top.
async function animateSpreadHalf(page, from, to, origin, axis = "Y") {
    if (!page) {
        return;
    }
    const animation = page.animate(
        [
            {
                transform: `perspective(1600px) rotate${axis}(${from}deg)`,
                filter: "brightness(1)",
            },
            {
                transform: `perspective(1600px) rotate${axis}(${to}deg)`,
                filter: to === 0 ? "brightness(1)" : "brightness(.65)",
            },
        ],
        {
            duration: TURN_MS,
            easing: "cubic-bezier(.4, 0, .2, 1)",
            fill: "forwards",
        },
    );
    page.style.transformOrigin = origin;
    page.style.zIndex = "2";
    try {
        // A book scrolled out of view can leave `finished` unsettled; the turn
        // must still complete, so it never waits longer than the turn itself.
        await Promise.race([
            animation.finished,
            new Promise((resolve) => setTimeout(resolve, TURN_MS + 160)),
        ]);
    } finally {
        animation.cancel();
        page.style.transformOrigin = "";
        page.style.zIndex = "";
    }
}

/* ---------- Component ---------- */

export class Flipbook extends HTMLElement {
    #root;
    #stage;
    #book;
    #loading;
    #desktopSpread;

    #pages = [];
    #endLeaves = 0; // blank leaves this component appended, not the caller

    #current = 0; // page index; -1 is the opening blank in spread mode
    #zoom = 1;
    #panX = 0;
    #panY = 0;
    #pointerStart = null;
    #pinchStart = null;
    #gesturePinched = false;
    #animating = false;
    #activePointers = new Map();
    #lastReported = null;
    #finished = false; // the last page has been on show

    #audio = new Audio();
    #flipSound = new Audio(DEFAULT_FLIP_SOUND);
    #singlePageQuery = window.matchMedia(
        "(max-width: 600px), (orientation: portrait)",
    );
    #abort = null;
    #resizeObserver = null;
    #loadId = 0;

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: "open" });
        this.#root.innerHTML = TEMPLATE;
        this.#stage = this.#root.getElementById("stage");
        this.#book = this.#root.getElementById("book");
        this.#loading = this.#root.getElementById("loading");
        this.#desktopSpread = this.#root.getElementById("desktopSpread");
    }

    connectedCallback() {
        this.#abort = new AbortController();
        this.#bindEvents(this.#abort.signal);
        this.#applyAttributes();

        // If the page assigned `pages` before this module finished loading, the
        // assignment landed on the instance as a plain own property and is now
        // shadowing the accessor. Re-run it through the setter and delete the
        // shadow, or the value would sit there unread forever.
        if (Object.prototype.hasOwnProperty.call(this, "pages")) {
            const pending = this.pages;
            delete this.pages;
            this.pages = pending;
            return;
        }
        if (this.#pages.length) {
            this.#renderPages();
        }
    }

    disconnectedCallback() {
        this.#loadId++; // discard any load still in flight
        this.#abort?.abort();
        this.#resizeObserver?.disconnect();
        this.#resizeObserver = null;
        this.#stopAudio();
        this.#flipSound.pause();
    }

    /* ----- Public API ----- */

    next() {
        this.#turnPage(1);
    }
    prev() {
        this.#turnPage(-1);
    }
    zoomIn() {
        this.#setZoom(this.#zoom + 0.25);
    }
    zoomOut() {
        this.#setZoom(this.#zoom - 0.25);
    }
    resetZoom() {
        this.#resetFit();
    }

    // Returns what the caller set, without the end leaf the component adds.
    get pages() {
        return this.#pages.slice(0, this.#pages.length - this.#endLeaves);
    }
    set pages(value) {
        this.#pages = normalizePages(value);
        // A trailing blank leaf keeps the last real page reachable in both single
        // and spread modes. It is binding, not content, so the component adds it.
        this.#endLeaves =
            this.getAttribute("end-page") !== "off" && this.#pages.length
                ? 1
                : 0;
        if (this.#endLeaves) {
            this.#pages.push(normalizePage(null));
        }
        if (this.isConnected) {
            this.#renderPages();
        }
    }

    get page() {
        return this.#current;
    }
    get pageCount() {
        return this.#pages.length;
    }
    get zoom() {
        return this.#zoom;
    }
    set zoom(value) {
        this.#setZoom(Number(value) || 1);
    }

    /* ----- Helpers ----- */

    #isUp() {
        return this.getAttribute("flip") === "up";
    }
    #isSinglePage() {
        return this.#isUp() || this.#singlePageQuery.matches;
    }
    #visibleBook() {
        return this.#isSinglePage() ? this.#book : this.#desktopSpread;
    }
    #emit(name, detail) {
        this.dispatchEvent(
            new CustomEvent(name, { detail, bubbles: true, composed: true }),
        );
    }
    #prefersReducedMotion() {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    /* ----- Loading ----- */

    #applyAttributes() {
        const label = this.getAttribute("label") || "flipbook";
        this.#stage.setAttribute("aria-label", label);
        this.#book.setAttribute("aria-label", label);
        this.#desktopSpread.setAttribute("aria-label", `${label} spread`);
        this.#loading.textContent = `Preparing your ${label}…`;

        const aspect = this.getAttribute("aspect");
        if (aspect) {
            this.style.setProperty(
                "--flipbook-aspect",
                aspect.replace("/", " / "),
            );
        }
    }

    async #renderPages() {
        const run = ++this.#loadId;

        this.#current = 0;
        this.#lastReported = null;
        this.#finished = false;
        this.#book.replaceChildren();
        this.#desktopSpread.replaceChildren();
        this.#resizeObserver?.disconnect();
        this.#resizeObserver = null;
        this.#stopAudio();
        this.#loading.hidden = false;
        this.#loading.style.display = "";
        this.#applyAttributes();

        try {
            if (this.#pages.length === 0) {
                this.#loading.textContent =
                    this.getAttribute("empty-text") ||
                    "No pages available yet.";
                return;
            }

            this.#buildPages();
            // Hold the overlay until the first page's artwork has arrived, so it does
            // not flash in at the wrong size before #resetFit measures it. Page 0 is
            // on show first in both modes, and has the connection to itself: the
            // pages around it start once it is up (#render).
            const first = this.#loadPage(0, "high");
            if (first) {
                await new Promise((resolve) => {
                    if (first.complete) {
                        resolve();
                    } else {
                        first.onload = resolve;
                        first.onerror = resolve;
                    }
                });
            }
            if (run !== this.#loadId) {
                return;
            }

            this.#loading.style.display = "none";
            this.#resetFit();
            this.#render();
            requestAnimationFrame(() => this.#positionPlayButtons());

            this.#resizeObserver = new ResizeObserver(() => this.#resetFit());
            this.#resizeObserver.observe(this.#stage);
            this.#emit("ready", { pageCount: this.#pages.length });
        } catch (error) {
            if (run !== this.#loadId) {
                return;
            }
            this.#loading.textContent = `Unable to prepare pages: ${error.message}`;
            this.#emit("error", { message: error.message });
        }
    }

    /* ----- Placeholder pages ----- */

    #updatePlaceholder(el, page) {
        const spec = page && page.placeholder;
        el.classList.toggle("future-page", !!spec);
        const existing = el.querySelector(".availability-message");
        if (!spec) {
            if (existing) {
                existing.remove();
            }
            return;
        }
        if (existing) {
            return;
        }

        const message = document.createElement("div");
        message.className = "availability-message";

        if (spec.logo) {
            const logo = document.createElement("span");
            logo.className = "availability-logo";
            logo.setAttribute("aria-hidden", "true");
            message.appendChild(logo);
        }

        if (spec.title) {
            const title = document.createElement("div");
            title.className = "availability-title";
            title.textContent = spec.title;
            message.appendChild(title);
        }

        if (spec.badge) {
            const badge = document.createElement("div");
            badge.className = "availability-comic";
            badge.textContent = spec.badge;
            message.appendChild(badge);
        }

        if (spec.label || spec.headline || spec.body) {
            const detail = document.createElement("div");
            detail.className = "availability-detail";
            if (spec.label) {
                const label = document.createElement("div");
                label.className = "availability-label";
                label.textContent = spec.label;
                detail.appendChild(label);
            }
            if (spec.headline) {
                const headline = document.createElement("div");
                headline.className = "availability-date";
                headline.textContent = spec.headline;
                detail.appendChild(headline);
            }
            if (spec.body) {
                const body = document.createElement("div");
                body.className = "availability-verse";
                body.textContent = spec.body;
                detail.appendChild(body);
            }
            message.appendChild(detail);
        }
        el.appendChild(message);
    }

    /* ----- Audio ----- */

    #playPageAudio(url) {
        if (!url) {
            return;
        }
        if (sameAudioUrl(this.#audio.src, url) && !this.#audio.paused) {
            this.#stopAudio();
            return;
        }
        this.#audio.src = url;
        this.#audio.play().catch(() => {});
    }

    #playFlipSound() {
        const setting = this.getAttribute("flip-sound");
        if (setting === "off") {
            return;
        }
        const url = setting
            ? new URL(setting, document.baseURI).href
            : DEFAULT_FLIP_SOUND;
        if (!sameAudioUrl(this.#flipSound.src, url)) {
            this.#flipSound.src = url;
        }
        this.#flipSound.currentTime = 0;
        this.#flipSound.play().catch(() => {});
    }

    #stopAudio() {
        this.#audio.pause();
        this.#audio.currentTime = 0;
        this.#syncPlayButtons();
    }

    #syncPlayButtons() {
        const playingUrl =
            !this.#audio.paused && this.#audio.src ? this.#audio.src : "";
        this.#root.querySelectorAll(".audio-play").forEach((btn) => {
            const on =
                playingUrl && sameAudioUrl(playingUrl, btn.dataset.audio);
            btn.classList.toggle("is-playing", !!on);
            btn.setAttribute("aria-pressed", on ? "true" : "false");
            btn.setAttribute(
                "aria-label",
                on ? "Pause narration" : "Play narration",
            );
            btn.innerHTML = on ? PAUSE_ICON : PLAY_ICON;
        });
    }

    #createPlayButton(url) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "audio-play";
        btn.dataset.audio = url;
        btn.setAttribute("aria-label", "Play narration");
        btn.innerHTML = PLAY_ICON;
        const stopStageGesture = (e) => e.stopPropagation();
        btn.addEventListener("pointerdown", stopStageGesture);
        btn.addEventListener("pointerup", stopStageGesture);
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.#playPageAudio(url);
        });
        return btn;
    }

    #createActionButton(action, index, id) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "page-action";
        btn.dataset.index = String(index);
        btn.textContent = action.label;
        btn.title = action.title;
        btn.setAttribute("aria-label", action.title);
        btn.setAttribute("aria-haspopup", "dialog");
        const stopStageGesture = (e) => e.stopPropagation();
        btn.addEventListener("pointerdown", stopStageGesture);
        btn.addEventListener("pointerup", stopStageGesture);
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.#emit("pageaction", { index, id });
        });
        return btn;
    }

    #positionPlayButton(btn) {
        const img = btn.parentElement && btn.parentElement.querySelector("img");
        if (!img || !img.naturalWidth) {
            return;
        }
        const box = containedImageBox(img);
        const size = btn.offsetWidth || 44;
        const inset = 12;
        let right = box.left + box.width - inset;
        // An action pill sits left of the play button when the page has both.
        if (btn.classList.contains("page-action")) {
            const play = btn.parentElement.querySelector(".audio-play");
            if (play) {
                right -= (play.offsetWidth || 44) + 8;
            }
            btn.style.top = `${box.top + inset + 9}px`;
        } else {
            btn.style.top = `${box.top + inset}px`;
        }
        btn.style.left = `${right - size}px`;
        btn.classList.add("is-placed");
    }

    #positionPlayButtons() {
        this.#root
            .querySelectorAll(".audio-play, .page-action")
            .forEach((btn) => this.#positionPlayButton(btn));
    }

    /* ----- Layout and rendering ----- */

    #fitBookToViewport() {
        const stageRect = this.#stage.getBoundingClientRect();
        // In single-page mode the page gives up the spring's overhang on the left
        // and the gutter on the right, and keeps the rest of the viewport width.
        const single = this.#isSinglePage();
        const up = this.#isUp();
        let availableW = stageRect.width - 16;
        let availableH = stageRect.height - 16;
        if (up) {
            // The rings hang above the page, so the height gives up their overhang.
            availableW = stageRect.width - STAGE_PAD * 2;
            availableH = stageRect.height - UP_OVERHANG - STAGE_PAD - 6;
        } else if (single) {
            availableW = stageRect.width - (WIRE_OVERHANG + RIGHT_GUTTER + STAGE_PAD);
            availableH = stageRect.height - (STAGE_PAD * 2 + 6);
        }
        availableW = Math.max(1, availableW);
        availableH = Math.max(1, availableH);

        // Use the actual first image ratio once loaded; the attribute is the
        // stand-in that keeps the first paint from jumping.
        const firstImg = this.#book.querySelector("img");
        const ratio =
            firstImg && firstImg.naturalWidth && firstImg.naturalHeight
                ? firstImg.naturalWidth / firstImg.naturalHeight
                : parseAspect(this.getAttribute("aspect"));

        let h = availableH;
        let w = h * ratio;
        if (w > availableW) {
            w = availableW;
            h = w / ratio;
        }
        this.#book.style.width = `${Math.floor(w)}px`;
        this.#book.style.height = `${Math.floor(h)}px`;

        const spreadH = Math.min(availableH, (availableW - 16) / (2 * ratio));
        this.#desktopSpread.style.width = `${Math.floor(spreadH * ratio * 2 + 16)}px`;
        this.#desktopSpread.style.height = `${Math.floor(spreadH)}px`;

        // Keep zoom/pan independent of the fit calculation.
        if (this.#zoom === 1) {
            this.#panX = 0;
            this.#panY = 0;
            this.#updateZoom();
        }
        requestAnimationFrame(() => this.#positionPlayButtons());
    }

    #buildPages() {
        this.#pages.forEach((entry, i) => {
            const page = document.createElement("div");
            page.className = "page";
            page.hidden = true;
            page.style.zIndex = String(this.#pages.length - i);

            if (isBlank(entry)) {
                page.classList.add("end-page");
                page.setAttribute("aria-label", "Blank end page");
                this.#book.appendChild(page);
                return;
            }

            // A placeholder page still carries the image element so the two modes
            // share one layout; .future-page just hides it behind the paper, so its
            // artwork is never fetched. The rest is fetched by #loadAround.
            const img = document.createElement("img");
            if (entry.src && !entry.placeholder) {
                img.dataset.src = entry.src;
            }
            img.alt = entry.alt || `Page ${i + 1}`;
            img.draggable = false;
            page.appendChild(img);
            if (entry.audio) {
                page.appendChild(this.#createPlayButton(entry.audio));
            }
            if (entry.action) {
                page.appendChild(this.#createActionButton(entry.action, i, entry.id));
            }
            img.addEventListener("load", () => this.#positionPlayButtons());
            this.#book.appendChild(page);
        });
    }

    // Starts page `index`'s artwork downloading, if it has any still to fetch,
    // and returns its image once it has a source.
    #loadPage(index, priority) {
        const img = this.#book.children[index]?.querySelector("img");
        if (img?.dataset.src) {
            img.fetchPriority = priority;
            img.src = img.dataset.src;
            delete img.dataset.src;
        }
        return img?.getAttribute("src") ? img : null;
    }

    // Starts the artwork downloading for the pages around `index`, the pages on
    // show first. A spread shows two, so they are both on show.
    #loadAround(index) {
        const shown = this.#isSinglePage() ? 1 : 2;
        const from = Math.max(0, index - LOAD_BEHIND);
        const to = Math.min(this.#book.children.length - 1, index + LOAD_AHEAD);
        for (let i = from; i <= to; i++) {
            this.#loadPage(i, i >= index && i < index + shown ? "high" : "low");
        }
    }

    #render() {
        this.#current = this.#isSinglePage()
            ? Math.max(0, this.#current)
            : spreadStart(this.#current);
        this.#loadAround(Math.max(0, this.#current));
        [...this.#book.children].forEach((page, i) => {
            page.hidden = i !== Math.max(0, this.#current);
            page.style.zIndex = "1";
            this.#updatePlaceholder(page, this.#pages[i]);
        });
        this.#renderDesktopSpread();
        this.#updateZoom();

        if (this.#lastReported !== this.#current) {
            this.#lastReported = this.#current;
            this.#emit("pagechange", {
                index: this.#current,
                pageCount: this.#pages.length,
                id: this.#pages[this.#current]?.id ?? null,
            });
        }

        // The last of the caller's pages is on show, once per page list. A
        // spread shows the page at #current and the one after it.
        const last = this.#pages.length - this.#endLeaves - 1;
        const lastShown = this.#isSinglePage()
            ? this.#current === last
            : this.#current <= last && last <= this.#current + 1;
        if (!this.#finished && last >= 0 && lastShown) {
            this.#finished = true;
            this.#emit("finish", { pageCount: last + 1 });
        }
    }

    #renderDesktopSpread() {
        this.#desktopSpread.replaceChildren();
        const start = spreadStart(this.#current);
        [start, start + 1].forEach((index) => {
            const entry = this.#pages[index];
            const wrap = document.createElement("div");
            wrap.className = "spread-page";
            this.#updatePlaceholder(wrap, entry);
            this.#desktopSpread.appendChild(wrap);
            if (isBlank(entry)) {
                // Index -1 is the opening leaf, which exists only in spread mode and
                // has no descriptor behind it; anything else is a real blank page.
                const isEndPage = index >= 0;
                wrap.classList.add(isEndPage ? "end-page" : "blank-page");
                wrap.setAttribute(
                    "aria-label",
                    isEndPage ? "Blank end page" : "Blank page",
                );
                return;
            }
            const img = document.createElement("img");
            if (entry.src && !entry.placeholder) {
                img.src = entry.src;
            }
            img.alt = entry.alt || `Page ${index + 1}`;
            img.draggable = false;
            wrap.appendChild(img);
            if (entry.audio) {
                wrap.appendChild(this.#createPlayButton(entry.audio));
            }
            if (entry.action) {
                wrap.appendChild(this.#createActionButton(entry.action, index, entry.id));
            }
            img.addEventListener("load", () => this.#positionPlayButtons());
        });
        this.#syncPlayButtons();
        requestAnimationFrame(() => this.#positionPlayButtons());
    }

    /* ----- Page turning ----- */

    async #turnPage(direction) {
        const single = this.#isSinglePage();
        const step = single ? 1 : 2;
        const next = this.#current + direction * step;
        const first = single ? 0 : -1;
        if (this.#animating || next < first || next >= this.#pages.length) {
            return;
        }

        this.#stopAudio();
        this.#playFlipSound();
        this.#animating = true;
        const animate = !this.#prefersReducedMotion();

        try {
            if (single && animate) {
                const outgoing = this.#book.children[this.#current];
                const incoming = this.#book.children[next];
                // Keep the destination underneath a forward turn. On a backward turn,
                // the previous page swings over the current page from the left.
                incoming.hidden = false;
                try {
                    // A page hinged at its left edge swings to -90 degrees; one
                    // hinged at the top swings up to +90, its lower edge coming
                    // toward the reader.
                    const up = this.#isUp();
                    const open = up ? 90 : -90;
                    const hinge = up ? "center top" : "left center";
                    const axis = up ? "X" : "Y";
                    if (direction > 0) {
                        await animateSpreadHalf(outgoing, 0, open, hinge, axis);
                    } else {
                        await animateSpreadHalf(incoming, open, 0, hinge, axis);
                    }
                    this.#current = next;
                } finally {
                    this.#render();
                }
                return;
            }

            const animateSpread = !single && animate;
            if (animateSpread) {
                // Fold the outgoing page toward the spine, then unfold the new page away from it.
                const outgoing =
                    direction > 0
                        ? this.#desktopSpread.lastElementChild
                        : this.#desktopSpread.firstElementChild;
                await animateSpreadHalf(
                    outgoing,
                    0,
                    direction > 0 ? -90 : 90,
                    direction > 0 ? "left center" : "right center",
                );
            }
            this.#current = next;
            this.#render();
            if (animateSpread && !this.#isSinglePage()) {
                const incoming =
                    direction > 0
                        ? this.#desktopSpread.firstElementChild
                        : this.#desktopSpread.lastElementChild;
                await animateSpreadHalf(
                    incoming,
                    direction > 0 ? 90 : -90,
                    0,
                    direction > 0 ? "right center" : "left center",
                );
            }
        } finally {
            this.#animating = false;
        }
    }

    /* ----- Zoom and pan ----- */

    #updateZoom() {
        const target = this.#visibleBook();
        target.style.transformOrigin = "center center";
        target.style.transform = `translate3d(${this.#panX}px,${this.#panY}px,0) scale(${this.#zoom})`;
    }

    #clampPan() {
        const stageRect = this.#stage.getBoundingClientRect();
        const bookRect = this.#visibleBook().getBoundingClientRect();
        const maxX = Math.max(0, (bookRect.width - stageRect.width) / 2);
        const maxY = Math.max(0, (bookRect.height - stageRect.height) / 2);
        const binderWidth = this.#isSinglePage() && !this.#isUp()
            ? WIRE_OVERHANG * this.#zoom
            : 0;
        const maxRight = Math.max(
            0,
            (bookRect.width - stageRect.width) / 2 + binderWidth,
        );
        this.#panX = Math.max(-maxX, Math.min(maxRight, this.#panX));
        this.#panY = Math.max(-maxY, Math.min(maxY, this.#panY));
    }

    #setZoom(z, centerX = null, centerY = null) {
        const old = this.#zoom;
        this.#zoom = Math.max(1, Math.min(3.5, z));
        if (centerX !== null && centerY !== null && this.#zoom !== old) {
            // Keep the point under the user's fingers/mouse roughly stationary.
            const r = this.#zoom / old;
            this.#panX = centerX - (centerX - this.#panX) * r;
            this.#panY = centerY - (centerY - this.#panY) * r;
        }
        if (this.#zoom === 1) {
            this.#panX = 0;
            this.#panY = 0;
        }
        this.#updateZoom();
        this.#clampPan();
        this.#updateZoom();
    }

    #resetFit() {
        this.#zoom = 1;
        this.#panX = 0;
        this.#panY = 0;
        this.#fitBookToViewport();
        this.#updateZoom();
    }

    /* ----- Input ----- */

    #handlePageTap(x, y) {
        const el = this.#root.elementFromPoint(x, y);
        if (!el || el.closest(".audio-play, .page-action")) {
            return;
        }
        if (!el.closest(".page, .spread-page")) {
            return;
        }
        const rect = this.#visibleBook().getBoundingClientRect();
        const before = this.#isUp()
            ? y < rect.top + rect.height / 2
            : x < rect.left + rect.width / 2;
        if (before) {
            this.prev();
        } else {
            this.next();
        }
    }

    #bindEvents(signal) {
        const stage = this.#stage;
        const activePointers = this.#activePointers;
        activePointers.clear();

        this.#audio.addEventListener("play", () => this.#syncPlayButtons(), {
            signal,
        });
        this.#audio.addEventListener("pause", () => this.#syncPlayButtons(), {
            signal,
        });
        this.#audio.addEventListener("ended", () => this.#stopAudio(), {
            signal,
        });

        this.#singlePageQuery.addEventListener(
            "change",
            () => {
                if (this.#pages.length === 0) {
                    return;
                }
                this.#render();
                this.#resetFit();
            },
            { signal },
        );

        // Mouse wheel zoom (trackpads and desktop mice).
        stage.addEventListener(
            "wheel",
            (e) => {
                // Hung from the top, the book sits inside a scrolling page.
                if (this.#isUp() && !e.ctrlKey) {
                    return;
                }
                e.preventDefault();
                const rect = stage.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                this.#setZoom(this.#zoom * Math.exp(-e.deltaY * 0.001), x, y);
            },
            { passive: false, signal },
        );

        // Pointer gestures: swipe to turn pages, drag when zoomed, pinch to zoom.
        stage.addEventListener(
            "pointerdown",
            (e) => {
                if (activePointers.size === 0) {
                    this.#gesturePinched = false;
                }
                stage.setPointerCapture(e.pointerId);
                this.#pointerStart = {
                    x: e.clientX,
                    y: e.clientY,
                    lastX: e.clientX,
                    lastY: e.clientY,
                    t: performance.now(),
                };
                stage.classList.add("dragging");

                activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
                if (activePointers.size === 2) {
                    this.#gesturePinched = true;
                    const a = [...activePointers.values()];
                    this.#pinchStart = Math.hypot(
                        a[0].x - a[1].x,
                        a[0].y - a[1].y,
                    );
                }
            },
            { signal },
        );

        stage.addEventListener(
            "pointermove",
            (e) => {
                const start = this.#pointerStart;
                if (start && this.#zoom > 1 && activePointers.size < 2) {
                    this.#panX += e.clientX - start.lastX;
                    this.#panY += e.clientY - start.lastY;
                    start.lastX = e.clientX;
                    start.lastY = e.clientY;
                    this.#clampPan();
                    this.#updateZoom();
                }

                if (!activePointers.has(e.pointerId)) {
                    return;
                }
                activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
                if (activePointers.size === 2) {
                    this.#gesturePinched = true;
                    const a = [...activePointers.values()];
                    const d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
                    if (this.#pinchStart) {
                        this.#setZoom((this.#zoom * d) / this.#pinchStart);
                    }
                    this.#pinchStart = d;
                }
            },
            { signal },
        );

        const clearPointer = (e) => {
            activePointers.delete(e.pointerId);
            if (activePointers.size < 2) {
                this.#pinchStart = null;
            }
        };

        stage.addEventListener(
            "pointerup",
            (e) => {
                clearPointer(e);
                stage.classList.remove("dragging");
                const start = this.#pointerStart;
                if (!start) {
                    return;
                }
                const dx = e.clientX - start.x;
                const dy = e.clientY - start.y;
                const dt = performance.now() - start.t;
                this.#pointerStart = null;

                // Along the axis the pages turn on: up for the top-bound book.
                const [along, across] = this.#isUp() ? [dy, dx] : [dx, dy];
                const isSwipe =
                    Math.abs(along) > 55 &&
                    Math.abs(along) > Math.abs(across) * 1.25 &&
                    dt < 700;
                if (this.#gesturePinched || this.#zoom > 1) {
                    return;
                }
                if (isSwipe) {
                    if (along < 0) {
                        this.next();
                    } else {
                        this.prev();
                    }
                    return;
                }
                this.#handlePageTap(e.clientX, e.clientY);
            },
            { signal },
        );

        stage.addEventListener(
            "pointercancel",
            (e) => {
                clearPointer(e);
                stage.classList.remove("dragging");
                this.#pointerStart = null;
            },
            { signal },
        );

        // Keyboard controls.
        window.addEventListener(
            "keydown",
            (e) => {
                if (e.ctrlKey || e.metaKey || e.altKey) {
                    return;
                } // leave browser zoom alone
                if (e.key === "ArrowLeft") {
                    this.prev();
                }
                if (e.key === "ArrowRight") {
                    this.next();
                }
                if (e.key === "+" || e.key === "=") {
                    this.zoomIn();
                }
                if (e.key === "-") {
                    this.zoomOut();
                }
                if (e.key === "0") {
                    this.resetZoom();
                }
            },
            { signal },
        );
    }
}

if (!customElements.get("flip-book")) {
    customElements.define("flip-book", Flipbook);
}
