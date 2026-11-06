/**
 * <banner-slider> — the Daily Grace banner, swipeable through the past week.
 *
 * Shows a day's banner under a heading with the symbol of that day's Bible
 * book, its reflection beneath, and a round button that opens the Flipbook.
 * The heading is the page's <h1>: "Your Daily Grace Today", or the date for
 * an earlier day. It opens on today. Swiping right pulls in the day
 * before, like paging back through a book, up to `past-days` days back;
 * swiping left comes forward again. Today is as far forward as it goes, since
 * tomorrow's devotional is not out yet. With the banner focused, the arrow
 * keys do the same. Tapping the reflection expands it; changing the day
 * collapses it again.
 *
 * Tapping the banner (or Enter with it focused) opens the day's verse in the
 * page's passage popup (verse-popup.js): the KJV, with the Berean Standard
 * Bible wording open under each verse. A swipe is not a tap, and the Flipbook
 * button keeps its own.
 *
 * Usage
 *   <banner-slider></banner-slider>
 *   <script type="module" src="./apps/components/banner-slider.js"></script>
 *
 * Attributes
 *   media-base      Base URL for the banners and book symbols.
 *                   Default: media_base_url in apps/settings/appsettings.json
 *   verses-base     Folder of the month files with each day's reflection
 *                   (<YYYY>/<month>.json, see daily-verses.js), resolved
 *                   against the page. Default: assets/verses/
 *   flipbook-href   The Flipbook page, resolved against the page. An earlier
 *                   day adds ?date=YYYY-MM-DD so it opens on that day's week.
 *                   Default: apps/pages/flipbook.html
 *   past-days       How many days back the banner can be swiped. Default: 7
 *   archives-href   The Daily Grace Archives page, resolved against the page.
 *                   Swiping on past the oldest day uncovers a panel leading
 *                   there, opened at the month before that day.
 *                   Default: apps/pages/library.html
 *
 * "Today" is the Asia/Manila date, when each day's devotional goes live. A
 * page left open past midnight moves on to the new day by itself.
 * Files are resolved from the date and its verse:
 *   <media-base>banner/<YYYY>/<month>/daily-grace-<YYYY-MM-DD>.mp4   (optional)
 *   <media-base>banner/<YYYY>/<month>/daily-grace-<YYYY-MM-DD>.webp
 *   <media-base>images/symbols/<Book>-symbol.svg
 *
 * When a day has a video, it plays over the banner, muted and looping, once
 * it has started; until then, and for good when there is none or it cannot
 * play (a missing file, autoplay refused), the banner image shows as before.
 * The image stays underneath, giving the banner its size and alt text. The
 * video waits for the page to finish loading, so it never shares the
 * connection with the banner and poster being read; with reduced motion
 * preferred, or Save-Data on, it is not loaded.
 *
 * Methods      previous(), next()  step a day back or forward, with the slide
 * Properties   daysAgo (read-only), date (read-only, YYYY-MM-DD)
 * Events       daychange  detail: { daysAgo, date, name, verse }
 *                `name` is the day as the verse files key it ("September 24, 2026")
 *                and `verse` its entry there, or null until its month has
 *                loaded or when it has none. Fires once for today on
 *                connect, on every change of day, and again for the day shown
 *                once the verses arrive.
 *
 * The Archives: on the oldest day, a swipe on to the right (or the left arrow
 * key) slides the banner partly aside to uncover a panel, "More you missed
 * on... Daily Grace Archives", that links to the Archives. Let go past half of
 * it and it stays open; a swipe back, a tap on the banner or the right arrow
 * key closes it.
 *
 * Swipe hint: about a second after today's banner is on screen, it nudges
 * right to show the edge of yesterday's, then springs back, so readers learn
 * it can be swiped. It waits while something covers the banner (the trivia
 * quiz), plays at most once per visit, and stops for good once the reader has
 * swiped or after three visits (localStorage "dailygrace.banner-hint"). A
 * touch cuts it short.
 *
 * The slide and the hint are skipped when the user prefers reduced motion.
 *
 * CSS custom properties
 *   --banner-slider-gutter, --banner-slider-ink, --banner-slider-heading-ink,
 *   --banner-slider-focus,
 *   --banner-action-bg, --banner-action-bg-hover, --banner-action-ink,
 *   --banner-action-shadow
 * The Flipbook button falls back to --action / --action-hover / --action-ink /
 * --action-shadow from the page, the shared look for the round banner buttons.
 */

import {
    DEFAULT_VERSES_BASE,
    loadVerses,
    versesFileUrl,
} from "./daily-verses.js?v=20261004-1";
import { MEDIA_BASE_URL } from "../settings/settings.js?v=20261009-1";

// Settles once the page has finished loading. The extras (the video, the
// banners a swipe away) wait for it, so what is read first arrives first.
const pageLoaded = new Promise((resolve) => {
    if (document.readyState === "complete") {
        resolve();
    } else {
        window.addEventListener("load", resolve, { once: true });
    }
});

// The passage popup, loaded on the first tap. Its ?v= token is not stamped by
// the deploy, so bump it here when verse-popup.js changes.
const POPUP_MODULE = "./verse-popup.js?v=20261106-1";

const DEFAULT_MEDIA_BASE = MEDIA_BASE_URL;
const DEFAULT_FLIPBOOK_HREF = "apps/pages/flipbook.html";
const DEFAULT_ARCHIVES_HREF = "apps/pages/library.html";
// The Daily Grace Archives' icon, as in the menu.
const ARCHIVES_ICON = new URL(
    "../../assets/images/study-guide-icons/grace-library.svg",
    import.meta.url,
).href;
const DEFAULT_PAST_DAYS = 7;
const TIME_ZONE = "Asia/Manila";
// How often an open page checks whether midnight has passed.
const DATE_CHECK_INTERVAL = 60_000;
const DAY_MS = 86400000;

// Citations use "Psalm"; the symbol library files that book under its plural name.
const SYMBOL_BOOK_NAMES = { Psalm: "Psalms" };
const bookSymbolUrl = (mediaBase, book) =>
    `${mediaBase}images/symbols/${encodeURIComponent(SYMBOL_BOOK_NAMES[book] ?? book)}-symbol.svg`;

// A press has to move this far, in px, before it counts as a drag.
const DRAG_SLOP = 8;
// Share of the banner's width a swipe must travel to change the day.
const SWIPE_SHARE = 0.18;
// Longest a slide waits, in ms, for the next day's banner to finish loading.
const DECODE_WAIT = 300;

// The swipe hint: once the banner has been on screen this long, in ms, it
// nudges aside to show yesterday's, so readers learn they can swipe. It
// stops for good once they have swiped, and after HINT_LIMIT visits.
const HINT_DELAY = 1200;
const HINT_LIMIT = 3;
// While something covers the banner (the trivia quiz), check again this often.
const HINT_RETRY = 1000;
const HINT_STORAGE_KEY = "dailygrace.banner-hint";
// Space, in px, between yesterday's banner and today's while they slide.
const PEEK_GAP = 12;

const FLIPBOOK_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
</svg>`;

const STYLES = /* css */ `
  :host {
    --banner-slider-gutter: 10px;
    --banner-slider-ink: #222;
    --banner-slider-heading-ink: #111;
    --banner-slider-focus: var(--navy, #001b34);
    --banner-action-bg: var(--action, #c62828);
    --banner-action-bg-hover: var(--action-hover, #a91f1f);
    --banner-action-ink: var(--action-ink, #fff);
    --banner-action-shadow: var(--action-shadow, 0 5px 14px rgb(0 0 0 / 35%));

    display: block;
  }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }

  .heading {
    display: flex;
    align-items: center;
    gap: 4px;
    /* The book symbol's height, held until the verse brings the symbol. */
    min-height: 36px;
    margin: 18px 8px 6px;
    color: var(--banner-slider-heading-ink);
    font: 400 clamp(1.0625rem, .95rem + .5vw, 1.25rem)/1.3 'Strait', 'Roboto', Arial, sans-serif;
  }
  .symbol {
    flex: 0 0 auto;
    width: 36px;
    height: 36px;
    padding: 4px;
    border-radius: 50%;
    background: #fff;
    object-fit: contain;
  }
  .symbol[hidden] { display: none; }

  /* Vertical panning stays with the page; horizontal drags are the swipe. The
     day sliding out is clipped at the banner's edges. */
  .stage {
    position: relative;
    padding-inline: var(--banner-slider-gutter);
    overflow-x: clip;
    touch-action: pan-y;
    user-select: none;
    -webkit-user-select: none;
  }
  .stage:focus-visible { outline: none; }
  /* A tap on the banner opens the day's verse. */
  .stage.has-verse { cursor: pointer; }
  .stage.dragging { cursor: grabbing; }
  .stage:focus-visible .slide {
    outline: 2px solid var(--banner-slider-focus);
    outline-offset: -2px;
  }
  .banner {
    display: block;
    width: 100%;
    height: auto;
    -webkit-user-drag: none;
  }
  /* The banner and its video, which slide together. */
  .slide { position: relative; z-index: 1; }
  /* Past the oldest day, under the banner: the way to the Daily Grace
     Archives, uncovered as the banner slides aside (--archives-width). */
  .archives {
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--banner-slider-gutter);
    width: var(--archives-width, 200px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px;
    /* A cream a shade darker than the page, so the panel shows against it. */
    background: #eadcc0;
    color: var(--navy, #001b34);
    text-align: center;
    text-decoration: none;
    visibility: hidden;
  }
  .stage.archives-showing .archives { visibility: visible; }
  .archives:focus-visible { outline: 2px solid var(--navy, #001b34); outline-offset: -5px; }
  .archives-lead {
    color: #7a5a1c;
    font: 400 clamp(.9rem, .8rem + .5vw, 1.1rem)/1.15 'Germania One', Georgia, serif;
  }
  /* Under the words, the pull tab's double chevrons, bobbing: it can be tapped. */
  .archives-arrow {
    display: block;
    width: clamp(24px, 5cqw, 32px);
    height: auto;
    overflow: visible;
  }
  .archives-arrow .chevron {
    fill: none;
    stroke: var(--navy, #001b34);
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    animation: archives-bob 1.8s ease-in-out infinite;
  }
  .archives-arrow .chevron-top { stroke: #c6922e; }
  .archives-arrow .chevron-bottom { animation-delay: .12s; }
  @keyframes archives-bob {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(3px); }
  }
  .archives-icon {
    width: clamp(40px, 9cqw, 58px);
    height: auto;
  }
  .archives-name {
    color: var(--navy, #001b34);
    font: 400 clamp(1.15rem, .95rem + 1vw, 1.7rem)/1.05 'Germania One', Georgia, serif;
  }
  /* The day's video, over its banner, fading in once it is playing. */
  .video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    pointer-events: none;
    transition: opacity .3s ease;
  }
  .video.playing { opacity: 1; }
  /* Yesterday's banner, just off the left edge, shown only during the swipe hint. */
  .peek {
    position: absolute;
    top: 0;
    left: var(--banner-slider-gutter);
    width: calc(100% - 2 * var(--banner-slider-gutter));
    height: auto;
    visibility: hidden;
    pointer-events: none;
  }
  .peek.showing { visibility: visible; }

  .flipbook {
    position: absolute;
    /* Over the banner, which has its own layer above the Archives panel. */
    z-index: 2;
    top: 14px;
    right: calc(var(--banner-slider-gutter) + 9px);
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: var(--banner-action-bg);
    color: var(--banner-action-ink);
    box-shadow: var(--banner-action-shadow);
  }
  .flipbook svg { display: block; width: 42%; height: 42%; }
  /* Scale the button with the banner it sits on, so it stays in proportion from
     phone to desktop. Browsers without container queries keep the fixed size above. */
  @supports (container-type: inline-size) {
    .stage { container-type: inline-size; }
    .flipbook {
      top: 2.5cqw;
      right: calc(var(--banner-slider-gutter) + 2.5cqw);
      width: clamp(38px, 7cqw, 56px);
      height: auto;
      aspect-ratio: 1;
    }
  }
  .flipbook:hover { background: var(--banner-action-bg-hover); }
  .flipbook:focus-visible {
    background: var(--banner-action-bg-hover);
    outline: 2px solid #fff;
    outline-offset: -4px;
  }
  /* A soft warm glow breathes around the button, a quiet hint that the
     Flipbook is there. It sits on its own layer so the button's shadow stays. */
  .flipbook::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    pointer-events: none;
    animation: flipbook-glow 2.8s ease-in-out infinite;
  }
  .flipbook:hover::after,
  .flipbook:focus-visible::after { animation-play-state: paused; }
  @keyframes flipbook-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgb(255 214 140 / 0%), 0 0 4px 0 rgb(255 214 140 / 0%); }
    50% { box-shadow: 0 0 0 3px rgb(255 214 140 / 55%), 0 0 16px 6px rgb(255 214 140 / 45%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .archives-arrow .chevron { animation: none; }
    .flipbook::after {
      animation: none;
      box-shadow: 0 0 0 2px rgb(255 214 140 / 45%), 0 0 10px 3px rgb(255 214 140 / 30%);
    }
  }

  .reflection {
    display: block;
    width: calc(100% - 16px);
    margin: 6px 8px 12px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--banner-slider-ink);
    text-align: left;
    font: clamp(1rem, .95rem + .3vw, 1.125rem)/1.4 'Strait', 'Roboto', Arial, sans-serif;
    cursor: pointer;
  }
  .reflection:focus-visible {
    outline: 2px solid var(--banner-slider-focus);
    outline-offset: -2px;
  }
  /* While the reflection loads, hold the three lines it will fill. */
  .reflection:disabled { min-height: 4.2em; cursor: default; }
  .reflection[aria-expanded="false"] .reflection-text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    overflow: hidden;
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
`;

/** Today's calendar date in Asia/Manila, as numbers. */
function manilaToday() {
    return Object.fromEntries(
        new Intl.DateTimeFormat("en-US", {
            timeZone: TIME_ZONE,
            year: "numeric",
            month: "numeric",
            day: "numeric",
        })
            .formatToParts(new Date())
            .filter(({ type }) => type !== "literal")
            .map(({ type, value }) => [type, Number(value)]),
    );
}

/**
 * Names and files for the day `daysAgo` before `today`. The date is built at
 * UTC midnight and formatted in UTC, so the arithmetic never trips over a
 * clock change.
 */
function devotionalDay(today, daysAgo, mediaBase) {
    const date = new Date(
        Date.UTC(today.year, today.month - 1, today.day - daysAgo),
    );
    const format = (options) =>
        date.toLocaleDateString("en-US", { timeZone: "UTC", ...options });
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const iso = `${date.getUTCFullYear()}-${month}-${day}`;
    return {
        daysAgo,
        iso,
        name: format({ month: "long", day: "numeric", year: "numeric" }),
        banner: `${mediaBase}banner/${date.getUTCFullYear()}/${format({ month: "long" }).toLowerCase()}/daily-grace-${iso}.webp`,
        video: `${mediaBase}banner/${date.getUTCFullYear()}/${format({ month: "long" }).toLowerCase()}/daily-grace-${iso}.mp4`,
    };
}

// Whether the reader has swiped, and how many visits have shown the hint.
// Storage can be refused (private mode); the hint then shows once per visit.
function readHintState() {
    try {
        const stored = JSON.parse(localStorage.getItem(HINT_STORAGE_KEY));
        return {
            swiped: stored?.swiped === true,
            shown: Number(stored?.shown) || 0,
        };
    } catch {
        return { swiped: false, shown: 0 };
    }
}

function writeHintState(state) {
    try {
        localStorage.setItem(HINT_STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Unsaved, the hint may show again next visit.
    }
}

export class BannerSlider extends HTMLElement {
    static observedAttributes = [
        "media-base",
        "verses-base",
        "flipbook-href",
        "past-days",
        "archives-href",
    ];

    #root;
    #headingText;
    #symbol;
    #stage;
    #slide;
    #banner;
    #video;
    #peek;
    #flipbook;
    #archives;
    // Whether the Archives panel is held open beside the oldest day.
    #archivesOpen = false;
    #reflection;
    #reflectionText;
    #reflectionAction;

    #today = manilaToday();
    #dateTimer = 0;
    #day = null;
    // The swipeable days' verses by day name once they arrive; false if they
    // could not be loaded.
    #verses = null;
    // The source and month files #verses was asked for.
    #versesKey = null;
    #preloaded = new Set();
    #configurePending = false;

    #drag = null;
    #sliding = false;
    #suppressClick = false;
    #reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // The video plays only while the banner is on screen and the tab showing.
    #visible = true;
    #viewObserver = null;

    // The swipe hint: 'idle' until connected, 'armed' while it waits to play,
    // 'playing', then 'done' for the rest of the page's life.
    #hint = "idle";
    #hintObserver = null;
    #hintTimer = 0;
    #hintAnimations = [];

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: "open" });
        this.#root.innerHTML = `
      <style>${STYLES}</style>
      <h1 class="heading">
        <img class="symbol" alt="" width="36" height="36" hidden />
        <span class="heading-text" aria-live="polite">Your Daily Grace Today</span>
      </h1>
      <div class="stage" role="group" aria-roledescription="carousel" tabindex="0"
        aria-label="Daily Grace for the past week. Swipe, or use the arrow keys, to change the day. Tap the banner, or press Enter, to read the day's verse.">
        <img class="peek" alt="" width="1920" height="1024" draggable="false" />
        <a class="archives" tabindex="-1" aria-hidden="true" draggable="false">
          <span class="archives-lead">More you missed on…</span>
          <svg class="archives-arrow" viewBox="0 0 24 24" aria-hidden="true"><path class="chevron chevron-top" d="M5 4.5l7 7 7-7"/><path class="chevron chevron-bottom" d="M5 11.5l7 7 7-7"/></svg>
          <img class="archives-icon" src="${ARCHIVES_ICON}" alt="" width="64" height="64" draggable="false" />
          <span class="archives-name">Daily Grace Archives</span>
        </a>
        <div class="slide">
          <img class="banner" alt="" width="1920" height="1024" fetchpriority="high" draggable="false" />
          <video class="video" width="1920" height="1024" muted loop playsinline preload="auto"
            disablepictureinpicture disableremoteplayback aria-hidden="true" tabindex="-1"></video>
        </div>
        <a class="flipbook">${FLIPBOOK_ICON}</a>
      </div>
      <button class="reflection" type="button" aria-expanded="false" disabled>
        <span class="reflection-text">Loading today's reflection…</span>
        <span class="reflection-action visually-hidden"></span>
      </button>`;
        this.#headingText = this.#root.querySelector(".heading-text");
        this.#symbol = this.#root.querySelector(".symbol");
        this.#stage = this.#root.querySelector(".stage");
        this.#slide = this.#root.querySelector(".slide");
        this.#banner = this.#root.querySelector(".banner");
        this.#video = this.#root.querySelector(".video");
        this.#peek = this.#root.querySelector(".peek");
        this.#flipbook = this.#root.querySelector(".flipbook");
        this.#archives = this.#root.querySelector(".archives");
        this.#reflection = this.#root.querySelector(".reflection");
        this.#reflectionText = this.#root.querySelector(".reflection-text");
        this.#reflectionAction = this.#root.querySelector(".reflection-action");

        this.#symbol.addEventListener("load", () => {
            this.#symbol.hidden = false;
        });
        this.#symbol.addEventListener("error", () => {
            this.#symbol.hidden = true;
        });
        // The video shows only once it is playing the day on show; until then,
        // or if it fails, the banner image beneath it does.
        this.#video.muted = true;
        this.#video.addEventListener("playing", () => {
            if (this.#video.getAttribute("src") === this.#day?.video) {
                this.#video.classList.add("playing");
            }
        });
        this.#video.addEventListener("error", () =>
            this.#video.classList.remove("playing"),
        );
        this.#reflection.addEventListener("click", () => {
            this.#setExpanded(
                this.#reflection.getAttribute("aria-expanded") !== "true",
            );
        });
        this.#stage.addEventListener("pointerdown", (event) =>
            this.#onPointerDown(event),
        );
        this.#stage.addEventListener("pointermove", (event) =>
            this.#onPointerMove(event),
        );
        this.#stage.addEventListener("pointerup", (event) =>
            this.#onPointerEnd(event),
        );
        this.#stage.addEventListener("pointercancel", (event) =>
            this.#onPointerEnd(event),
        );
        // A swipe that ends on the Flipbook button is not a tap on it.
        this.#stage.addEventListener(
            "click",
            (event) => {
                if (!this.#suppressClick) {
                    return;
                }
                event.preventDefault();
                event.stopPropagation();
            },
            true,
        );
        // A tap on the banner, not a swipe and not the Flipbook button, opens the verse.
        this.#stage.addEventListener("click", (event) => {
            const path = event.composedPath();
            if (
                this.#suppressClick ||
                path.includes(this.#flipbook) ||
                path.includes(this.#archives)
            ) {
                return;
            }
            if (this.#archivesOpen) {
                this.#closeArchives(this.#archivesWidth());
                return;
            }
            this.#openVerse();
        });
        this.#stage.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && event.target === this.#stage) {
                event.preventDefault();
                this.#openVerse();
                return;
            }
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                return;
            }
            event.preventDefault();
            if (event.key === "ArrowLeft") {
                this.previous();
            } else {
                this.next();
            }
        });
    }

    connectedCallback() {
        this.#scheduleConfigure();
        this.#armHint();
        this.#dateTimer = setInterval(this.#checkDate, DATE_CHECK_INTERVAL);
        document.addEventListener("visibilitychange", this.#checkDate);
        document.addEventListener("visibilitychange", this.#syncVideo);
        this.#viewObserver = new IntersectionObserver(([entry]) => {
            this.#visible = entry.isIntersecting;
            this.#syncVideo();
        });
        this.#viewObserver.observe(this.#stage);
    }

    disconnectedCallback() {
        this.#stopHint();
        clearInterval(this.#dateTimer);
        document.removeEventListener("visibilitychange", this.#checkDate);
        document.removeEventListener("visibilitychange", this.#syncVideo);
        this.#viewObserver?.disconnect();
        this.#viewObserver = null;
        this.#video.pause();
    }

    // Past midnight in Manila, today's banner gives way to the new day's. An
    // earlier day stays on show, now one more day back, as far as past-days
    // allows. Background tabs throttle the timer, so coming back into view
    // checks too.
    #checkDate = () => {
        if (document.hidden || this.#sliding || this.#drag) {
            return;
        }
        const today = manilaToday();
        const elapsed = Math.round(
            (Date.UTC(today.year, today.month - 1, today.day) -
                Date.UTC(
                    this.#today.year,
                    this.#today.month - 1,
                    this.#today.day,
                )) /
                DAY_MS,
        );
        if (!elapsed) {
            return;
        }
        this.#today = today;
        this.#preloaded.clear();
        const daysAgo = this.daysAgo
            ? Math.min(Math.max(this.daysAgo + elapsed, 0), this.#pastDays)
            : 0;
        this.#show(daysAgo);
        this.#refreshVerses();
    };

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.isConnected) {
            this.#scheduleConfigure();
        }
    }

    get daysAgo() {
        return this.#day?.daysAgo ?? 0;
    }

    get date() {
        return (
            this.#day?.iso ?? devotionalDay(this.#today, 0, this.#mediaBase).iso
        );
    }

    /** Step back a day, sliding the earlier one in from the left. */
    previous() {
        if (this.#atOldest && !this.#archivesOpen) {
            this.#openArchives(0);
            return Promise.resolve();
        }
        return this.#step(-1);
    }

    /** Step forward a day, toward today; with the Archives open, close them. */
    next() {
        if (this.#archivesOpen) {
            this.#closeArchives(this.#archivesWidth());
            return Promise.resolve();
        }
        return this.#step(1);
    }

    get #mediaBase() {
        const base = this.getAttribute("media-base") || DEFAULT_MEDIA_BASE;
        return base.endsWith("/") ? base : `${base}/`;
    }

    get #pastDays() {
        const days = Number.parseInt(this.getAttribute("past-days") ?? "", 10);
        return Number.isFinite(days) && days >= 0 ? days : DEFAULT_PAST_DAYS;
    }

    // Upgrade fires attributeChangedCallback per attribute, then connectedCallback;
    // coalesce them into a single configure.
    #scheduleConfigure() {
        if (this.#configurePending) {
            return;
        }
        this.#configurePending = true;
        queueMicrotask(() => {
            this.#configurePending = false;
            this.#configure();
        });
    }

    #configure() {
        this.#preloaded.clear();
        this.#show(Math.min(this.daysAgo, this.#pastDays));
        this.#refreshVerses();
    }

    // Load the month files the swipeable days fall in, which change when the
    // range crosses into a new month. Only a new source goes back to
    // "Loading…"; a month joining at midnight leaves the day shown as it is.
    #refreshVerses() {
        const base = new URL(
            this.getAttribute("verses-base") || DEFAULT_VERSES_BASE,
            document.baseURI,
        ).href;
        const names = Array.from(
            { length: this.#pastDays + 1 },
            (_, daysAgo) =>
                devotionalDay(this.#today, daysAgo, this.#mediaBase).name,
        );
        const key = [
            base,
            ...new Set(names.map((name) => versesFileUrl(base, name))),
        ].join("|");
        if (key === this.#versesKey) {
            return;
        }
        if (!this.#versesKey?.startsWith(`${base}|`)) {
            this.#verses = null;
            this.#showVerse();
        }
        this.#versesKey = key;
        this.#loadVerses(base, names, key);
    }

    async #loadVerses(base, names, key) {
        let verses;
        try {
            verses = await loadVerses(base, names);
        } catch (error) {
            console.warn("Daily Grace reflections could not be loaded:", error);
            verses = false;
        }
        if (key !== this.#versesKey) {
            return;
        }
        this.#verses = verses;
        this.#showVerse();
        this.#emitDay();
    }

    #show(daysAgo) {
        this.#resetArchives();
        const day = devotionalDay(this.#today, daysAgo, this.#mediaBase);
        this.#day = day;
        this.#banner.src = day.banner;
        this.#banner.alt = `Daily Grace devotional for ${day.name}`;
        this.#showVideo(day);
        this.#headingText.textContent = daysAgo
            ? `Your Daily Grace for ${day.name.replace(/, \d+$/, "")}`
            : "Your Daily Grace Today";

        // An earlier day opens the Flipbook on the week that day belongs to.
        const href =
            this.getAttribute("flipbook-href") || DEFAULT_FLIPBOOK_HREF;
        let link = href;
        if (daysAgo) {
            const url = new URL(href, document.baseURI);
            url.searchParams.set("date", day.iso);
            link = url.href;
        }
        const label = daysAgo
            ? `Open the Flipbook for the week of ${day.name}`
            : "Open this week's Flipbook";
        this.#flipbook.href = link;
        this.#flipbook.setAttribute("aria-label", label);
        this.#flipbook.title = label;

        this.#showVerse();
        this.#preloadAround(day.banner, daysAgo);
        this.#emitDay();
    }

    // Play the day's video over its banner, if it has one. A missing file, or a
    // browser that refuses to autoplay, leaves the banner image showing.
    #showVideo(day) {
        const video = this.#video;
        video.classList.remove("playing");
        if (this.#reducedMotion.matches || navigator.connection?.saveData) {
            if (video.hasAttribute("src")) {
                video.removeAttribute("src");
                video.load();
            }
            return;
        }
        if (video.getAttribute("src") === day.video) {
            this.#syncVideo();
            return;
        }
        if (document.readyState !== "complete") {
            video.pause();
            pageLoaded.then(() => {
                if (this.#day === day) {
                    this.#showVideo(day);
                }
            });
            return;
        }
        video.src = day.video;
        this.#syncVideo();
    }

    // Plays the day's video while the banner can be seen; pauses it otherwise.
    #syncVideo = () => {
        const video = this.#video;
        if (!video.getAttribute("src") || video.error) {
            return;
        }
        if (this.#visible && !document.hidden) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    };

    #verseFor(day) {
        return this.#verses ? (this.#verses.get(day.name) ?? null) : null;
    }

    async #openVerse() {
        const reference = this.#day && this.#verseFor(this.#day)?.verse;
        if (!reference) {
            return;
        }
        try {
            const { showPassage } = await import(POPUP_MODULE);
            showPassage(reference, { bsb: true });
        } catch (error) {
            console.warn(`The verse popup could not open ${reference}:`, error);
        }
    }

    #showVerse() {
        const verse = this.#day && this.#verseFor(this.#day);
        if (verse) {
            const book = verse.verse.replace(/\s+\d.*$/, "").trim();
            const symbol = bookSymbolUrl(this.#mediaBase, book);
            if (this.#symbol.getAttribute("src") !== symbol) {
                this.#symbol.src = symbol;
            }
            this.#reflectionText.textContent = verse.reflection;
            this.#reflection.disabled = false;
            this.#setExpanded(false);
            this.#stage.classList.add("has-verse");
            return;
        }
        this.#stage.classList.remove("has-verse");
        this.#symbol.hidden = true;
        this.#symbol.removeAttribute("src");
        this.#reflection.disabled = true;
        this.#reflection.setAttribute("aria-expanded", "false");
        this.#reflectionAction.textContent = "";
        this.#reflectionText.textContent =
            this.#verses === null
                ? "Loading today's reflection…"
                : this.#verses === false
                  ? "Today's reflection is unavailable. Please try again later."
                  : "This day's reflection is unavailable.";
    }

    #setExpanded(expanded) {
        this.#reflection.setAttribute("aria-expanded", String(expanded));
        this.#reflectionAction.textContent = expanded
            ? "Collapse reflection"
            : "Expand reflection";
    }

    #emitDay() {
        const day = this.#day;
        this.dispatchEvent(
            new CustomEvent("daychange", {
                detail: {
                    daysAgo: day.daysAgo,
                    date: day.iso,
                    name: day.name,
                    verse: this.#verseFor(day),
                },
                bubbles: true,
                composed: true,
            }),
        );
    }

    // Warm the cache for the banners one swipe away, so they are ready to slide
    // in. They wait for the banner on show and for the page to finish loading,
    // and then ask for little, so they never hold up the day being read or the
    // poster below it.
    #preloadAround(banner, daysAgo) {
        Promise.all([this.#banner.decode().catch(() => {}), pageLoaded]).then(
            () => {
                if (this.#day?.banner !== banner) {
                    return;
                } // the reader has moved on
                this.#preload(daysAgo + 1);
                this.#preload(daysAgo - 1);
            },
        );
    }

    #preload(daysAgo) {
        if (daysAgo < 0 || daysAgo > this.#pastDays) {
            return;
        }
        const { banner } = devotionalDay(this.#today, daysAgo, this.#mediaBase);
        if (this.#preloaded.has(banner)) {
            return;
        }
        this.#preloaded.add(banner);
        const image = new Image();
        image.fetchPriority = "low";
        image.src = banner;
    }

    /* ----- Sliding ----- */

    // -1 steps back a day, +1 steps forward.
    #canStep(step) {
        const target = this.daysAgo - step;
        return target >= 0 && target <= this.#pastDays;
    }

    #setOffset(px) {
        this.#slide.style.transform = px ? `translateX(${px}px)` : "";
    }

    async #step(step, fromOffset = 0) {
        if (this.#sliding || !this.#canStep(step)) {
            return;
        }
        // The reader has found the swipe; the hint is not needed again.
        this.#stopHint();
        const hint = readHintState();
        if (!hint.swiped) {
            writeHintState({ ...hint, swiped: true });
        }
        const target = this.daysAgo - step;
        if (this.#reducedMotion.matches) {
            this.#setOffset(0);
            this.#show(target);
            return;
        }
        this.#sliding = true;
        // Stepping back carries the old banner off to the right and brings the
        // earlier day in from the left, the way a swipe to the right pulls it in.
        const away = (step < 0 ? 1 : -1) * this.#stage.clientWidth;
        const leaving = this.#slide.animate(
            [
                { transform: `translateX(${fromOffset}px)`, opacity: 1 },
                { transform: `translateX(${away}px)`, opacity: 0 },
            ],
            {
                duration: 180,
                easing: "cubic-bezier(.4, 0, 1, 1)",
                fill: "forwards",
            },
        );
        await leaving.finished.catch(() => {});
        this.#setOffset(0);
        this.#show(target);
        // Hold the new banner off stage until it can be drawn, so it never slides
        // in half loaded, but only briefly: on a slow connection the reader keeps
        // swiping and the banner fills in where it lands. A missing banner still
        // comes in, showing its alt text.
        await Promise.race([
            this.#banner.decode().catch(() => {}),
            new Promise((resolve) => setTimeout(resolve, DECODE_WAIT)),
        ]);
        leaving.cancel();
        await this.#slide
            .animate(
                [
                    { transform: `translateX(${-away}px)`, opacity: 0 },
                    { transform: "none", opacity: 1 },
                ],
                { duration: 280, easing: "cubic-bezier(.2, .9, .25, 1)" },
            )
            .finished.catch(() => {});
        this.#sliding = false;
    }

    /* ----- The Archives, past the oldest day ----- */

    get #atOldest() {
        return this.#pastDays > 0 && this.daysAgo === this.#pastDays;
    }

    // As wide as the panel's words need, in step with the banner's size.
    #archivesWidth() {
        return Math.round(
            Math.min(Math.max(this.#banner.offsetWidth * 0.3, 150), 230),
        );
    }

    // Shows the panel under the banner (or hides it), leading to the Archives
    // at the month of the last day before the oldest one here.
    #showArchives(show) {
        this.#stage.classList.toggle("archives-showing", show);
        this.#archives.tabIndex = show ? 0 : -1;
        this.#archives.setAttribute("aria-hidden", String(!show));
        if (!show) {
            return;
        }
        this.#stage.style.setProperty(
            "--archives-width",
            `${this.#archivesWidth()}px`,
        );
        const before = new Date(Date.parse(`${this.date}T00:00:00Z`) - DAY_MS)
            .toISOString()
            .slice(0, 7);
        const url = new URL(
            this.getAttribute("archives-href") || DEFAULT_ARCHIVES_HREF,
            document.baseURI,
        );
        url.hash = `month/${before}`;
        this.#archives.href = url.href;
        this.#archives.setAttribute(
            "aria-label",
            "More days you missed: open the Daily Grace Archives",
        );
    }

    #openArchives(fromOffset) {
        const width = this.#archivesWidth();
        this.#stopHint();
        this.#showArchives(true);
        this.#archivesOpen = true;
        this.#setOffset(width);
        if (!this.#reducedMotion.matches && fromOffset !== width) {
            this.#slide.animate(
                [
                    { transform: `translateX(${fromOffset}px)` },
                    { transform: `translateX(${width}px)` },
                ],
                { duration: 260, easing: "cubic-bezier(.2, .9, .25, 1)" },
            );
        }
    }

    #closeArchives(fromOffset) {
        this.#archivesOpen = false;
        this.#archives.tabIndex = -1;
        this.#archives.setAttribute("aria-hidden", "true");
        this.#setOffset(0);
        if (this.#reducedMotion.matches || !fromOffset) {
            this.#showArchives(false);
            return;
        }
        this.#slide
            .animate(
                [
                    { transform: `translateX(${fromOffset}px)` },
                    { transform: "none" },
                ],
                { duration: 220, easing: "cubic-bezier(.2, .9, .25, 1)" },
            )
            .finished.then(() => {
                if (!this.#archivesOpen) {
                    this.#showArchives(false);
                }
            })
            .catch(() => {});
    }

    // A new day on show (or a new date at midnight) starts with it closed.
    #resetArchives() {
        if (
            this.#archivesOpen ||
            this.#stage.classList.contains("archives-showing")
        ) {
            this.#archivesOpen = false;
            this.#setOffset(0);
            this.#showArchives(false);
        }
    }

    #snapBack(fromOffset) {
        this.#setOffset(0);
        if (!fromOffset || this.#reducedMotion.matches) {
            return;
        }
        this.#slide.animate(
            [
                { transform: `translateX(${fromOffset}px)` },
                { transform: "none" },
            ],
            { duration: 220, easing: "cubic-bezier(.2, .9, .25, 1)" },
        );
    }

    /* ----- Swipe hint ----- */

    // Wait for the banner to be mostly on screen, then play the hint once.
    #armHint() {
        if (
            this.#hint !== "idle" ||
            this.#reducedMotion.matches ||
            !this.#pastDays
        ) {
            return;
        }
        const { swiped, shown } = readHintState();
        if (swiped || shown >= HINT_LIMIT) {
            return;
        }
        this.#hint = "armed";
        // Scrolled away before the delay is up, it waits for the next time.
        this.#hintObserver = new IntersectionObserver(
            ([entry]) => {
                clearTimeout(this.#hintTimer);
                if (entry.isIntersecting) {
                    this.#hintTimer = setTimeout(
                        () => this.#playHint(),
                        HINT_DELAY,
                    );
                }
            },
            { threshold: 0.6 },
        );
        this.#hintObserver.observe(this.#stage);
    }

    #stopHint() {
        this.#hint = "done";
        this.#hintObserver?.disconnect();
        this.#hintObserver = null;
        clearTimeout(this.#hintTimer);
        for (const animation of this.#hintAnimations) {
            animation.cancel();
        }
        this.#hintAnimations = [];
        this.#peek.classList.remove("showing");
    }

    // True while something else, such as the trivia quiz, sits over the banner.
    // A dialog in another component's shadow root is found as that component.
    #covered() {
        const box = this.#stage.getBoundingClientRect();
        return (
            document.elementFromPoint(
                box.left + box.width / 2,
                box.top + box.height / 2,
            ) !== this
        );
    }

    // Today's banner nudges right, pulling yesterday's in from the left edge,
    // and springs back: the first part of a swipe, played for the reader.
    async #playHint() {
        if (this.#hint !== "armed") {
            return;
        }
        // Only on today, and only while nothing else is moving the banner.
        if (this.daysAgo !== 0 || this.#sliding || this.#drag) {
            this.#stopHint();
            return;
        }
        if (document.hidden || this.#covered()) {
            this.#hintTimer = setTimeout(() => this.#playHint(), HINT_RETRY);
            return;
        }
        // The hint fetches yesterday's banner, so it waits for the page to
        // finish loading rather than slow today's banner and poster.
        if (document.readyState !== "complete") {
            pageLoaded.then(() => this.#playHint());
            return;
        }
        this.#hint = "playing";
        this.#hintObserver.disconnect();
        this.#hintObserver = null;

        const yesterday = devotionalDay(this.#today, 1, this.#mediaBase).banner;
        if (this.#peek.getAttribute("src") !== yesterday) {
            this.#peek.src = yesterday;
        }
        const [today, peek] = await Promise.allSettled([
            this.#banner.decode(),
            this.#peek.decode(),
        ]);
        // A touch while the banners decoded has already stopped the hint. With no
        // banner for today there is nothing to nudge; with none for yesterday the
        // nudge still shows that the banner moves.
        if (this.#hint !== "playing") {
            return;
        }
        if (today.status === "rejected") {
            this.#stopHint();
            return;
        }

        const width = this.#banner.offsetWidth;
        const nudge = Math.round(Math.min(Math.max(width * 0.14, 48), 140));
        const frames = (from) => [
            {
                transform: `translateX(${from}px)`,
                easing: "cubic-bezier(.3, 0, .2, 1)",
            },
            { transform: `translateX(${from + nudge}px)`, offset: 0.4 },
            {
                transform: `translateX(${from + nudge}px)`,
                offset: 0.55,
                easing: "cubic-bezier(.34, 1.56, .64, 1)",
            },
            { transform: `translateX(${from}px)` },
        ];
        const timing = { duration: 1400 };
        this.#hintAnimations = [this.#slide.animate(frames(0), timing)];
        if (peek.status === "fulfilled") {
            this.#peek.classList.add("showing");
            this.#hintAnimations.push(
                this.#peek.animate(frames(-(width + PEEK_GAP)), timing),
            );
        }
        const state = readHintState();
        writeHintState({ ...state, shown: state.shown + 1 });

        await Promise.all(
            this.#hintAnimations.map((animation) => animation.finished),
        ).catch(() => {});
        if (this.#hint === "playing") {
            this.#stopHint();
        }
    }

    /* ----- Swiping ----- */

    // The reader's finger is followed only once a press has clearly moved
    // sideways; an upward or downward one is left to scroll the page.
    #onPointerDown(event) {
        // A touch mid-hint takes over from it.
        this.#stopHint();
        if (this.#sliding || !event.isPrimary || event.button !== 0) {
            return;
        }
        this.#drag = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            offset: 0,
            active: false,
            // Dragging the banner while the Archives are open starts from there.
            base: this.#archivesOpen ? this.#archivesWidth() : 0,
            archives: false,
        };
    }

    #onPointerMove(event) {
        const drag = this.#drag;
        if (!drag || event.pointerId !== drag.id) {
            return;
        }
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        if (!drag.active) {
            if (Math.abs(dx) < DRAG_SLOP && Math.abs(dy) < DRAG_SLOP) {
                return;
            }
            if (Math.abs(dy) >= Math.abs(dx)) {
                this.#drag = null;
                return;
            }
            drag.active = true;
            this.#stage.setPointerCapture(event.pointerId);
            this.#stage.classList.add("dragging");
        }
        // Past the oldest day the banner uncovers the Archives: it follows the
        // finger as far as the panel is wide, then resists.
        if (drag.base || (dx > 0 && this.#atOldest)) {
            const width = this.#archivesWidth();
            let offset = drag.base + dx;
            if (offset > width) {
                offset = width + (offset - width) / 4;
            } else if (offset < 0) {
                offset /= 4;
            }
            drag.archives = true;
            drag.offset = offset;
            this.#showArchives(true);
            this.#setOffset(offset);
            return;
        }
        // Pulling toward a day that is not there gives a little, then resists.
        const step = dx > 0 ? -1 : 1;
        drag.offset = this.#canStep(step) ? dx : dx / 4;
        this.#setOffset(drag.offset);
    }

    #onPointerEnd(event) {
        const drag = this.#drag;
        if (!drag || event.pointerId !== drag.id) {
            return;
        }
        this.#drag = null;
        if (!drag.active) {
            return;
        }
        this.#stage.classList.remove("dragging");
        this.#suppressClick = true;
        setTimeout(() => {
            this.#suppressClick = false;
        });
        if (drag.archives) {
            const keep =
                event.type === "pointerup"
                    ? drag.offset >= this.#archivesWidth() / 2
                    : Boolean(drag.base);
            if (keep) {
                this.#openArchives(drag.offset);
            } else {
                this.#closeArchives(drag.offset);
            }
            return;
        }
        const step = drag.offset > 0 ? -1 : 1;
        const far =
            Math.abs(drag.offset) >= this.#stage.clientWidth * SWIPE_SHARE;
        if (event.type === "pointerup" && far && this.#canStep(step)) {
            this.#step(step, drag.offset);
        } else {
            this.#snapBack(drag.offset);
        }
    }
}

if (!customElements.get("banner-slider")) {
    customElements.define("banner-slider", BannerSlider);
}
