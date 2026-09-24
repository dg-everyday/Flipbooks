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
 * Usage
 *   <banner-slider media-base="https://dailygrace.faith/media/"></banner-slider>
 *   <script type="module" src="./apps/components/banner-slider.js"></script>
 *
 * Attributes
 *   media-base      Base URL for the banners and book symbols.
 *                   Default: https://dailygrace.faith/media/
 *   verses-src      verses.json with each day's reflection, resolved against
 *                   the page. Default: assets/verses.json
 *   flipbook-href   The Flipbook page, resolved against the page. An earlier
 *                   day adds ?date=YYYY-MM-DD so it opens on that day's week.
 *                   Default: apps/pages/flipbook.html
 *   past-days       How many days back the banner can be swiped. Default: 7
 *
 * "Today" is the Asia/Manila date, when each day's devotional goes live.
 * Files are resolved from the date and its verse:
 *   <media-base>banner/<month>/daily-grace-<YYYY-MM-DD>.webp
 *   <media-base>images/symbols/<Book>-symbol.svg
 *
 * Methods      previous(), next()  step a day back or forward, with the slide
 *              goTo(daysAgo)       jump to a day, without it
 * Properties   daysAgo (read-only), date (read-only, YYYY-MM-DD)
 * Events       daychange  detail: { daysAgo, date, name, verse }
 *                `name` is the day as verses.json keys it ("September 24, 2026")
 *                and `verse` its entry there, or null until verses.json has
 *                loaded or when it has none. Fires once for today on
 *                connect, on every change of day, and again for the day shown
 *                once verses.json arrives.
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

const DEFAULT_MEDIA_BASE = 'https://dailygrace.faith/media/';
// const DEFAULT_MEDIA_BASE = 'http://localhost:9001/media/';
const DEFAULT_VERSES_SRC = 'assets/verses.json';
const DEFAULT_FLIPBOOK_HREF = 'apps/pages/flipbook.html';
const DEFAULT_PAST_DAYS = 7;
const TIME_ZONE = 'Asia/Manila';

// Citations use "Psalm"; the symbol library files that book under its plural name.
const SYMBOL_BOOK_NAMES = { Psalm: 'Psalms' };
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
const HINT_STORAGE_KEY = 'dailygrace.banner-hint';
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
  .stage.dragging { cursor: grabbing; }
  .stage:focus-visible .banner {
    outline: 2px solid var(--banner-slider-focus);
    outline-offset: -2px;
  }
  .banner {
    display: block;
    width: 100%;
    height: auto;
    -webkit-user-drag: none;
  }
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
  .reflection:disabled { cursor: default; }
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
    new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, year: 'numeric', month: 'numeric', day: 'numeric' })
      .formatToParts(new Date())
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)]),
  );
}

/**
 * Names and files for the day `daysAgo` before `today`. The date is built at
 * UTC midnight and formatted in UTC, so the arithmetic never trips over a
 * clock change.
 */
function devotionalDay(today, daysAgo, mediaBase) {
  const date = new Date(Date.UTC(today.year, today.month - 1, today.day - daysAgo));
  const format = (options) => date.toLocaleDateString('en-US', { timeZone: 'UTC', ...options });
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const iso = `${date.getUTCFullYear()}-${month}-${day}`;
  return {
    daysAgo,
    iso,
    name: format({ month: 'long', day: 'numeric', year: 'numeric' }),
    banner: `${mediaBase}banner/${format({ month: 'long' }).toLowerCase()}/daily-grace-${iso}.webp`,
  };
}

// Whether the reader has swiped, and how many visits have shown the hint.
// Storage can be refused (private mode); the hint then shows once per visit.
function readHintState() {
  try {
    const stored = JSON.parse(localStorage.getItem(HINT_STORAGE_KEY));
    return { swiped: stored?.swiped === true, shown: Number(stored?.shown) || 0 };
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
  static observedAttributes = ['media-base', 'verses-src', 'flipbook-href', 'past-days'];

  #root;
  #headingText;
  #symbol;
  #stage;
  #banner;
  #peek;
  #flipbook;
  #reflection;
  #reflectionText;
  #reflectionAction;

  #today = manilaToday();
  #day = null;
  // verses.json by day name once it arrives; false if it could not be loaded.
  #verses = null;
  #versesSrc = null;
  #preloaded = new Set();
  #configurePending = false;

  #drag = null;
  #sliding = false;
  #suppressClick = false;
  #reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // The swipe hint: 'idle' until connected, 'armed' while it waits to play,
  // 'playing', then 'done' for the rest of the page's life.
  #hint = 'idle';
  #hintObserver = null;
  #hintTimer = 0;
  #hintAnimations = [];

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <h1 class="heading">
        <img class="symbol" alt="" width="36" height="36" hidden />
        <span class="heading-text" aria-live="polite">Your Daily Grace Today</span>
      </h1>
      <div class="stage" role="group" aria-roledescription="carousel" tabindex="0"
        aria-label="Daily Grace for the past week. Swipe, or use the arrow keys, to change the day.">
        <img class="peek" alt="" width="1920" height="1024" draggable="false" />
        <img class="banner" alt="" width="1920" height="1024" fetchpriority="high" draggable="false" />
        <a class="flipbook">${FLIPBOOK_ICON}</a>
      </div>
      <button class="reflection" type="button" aria-expanded="false" disabled>
        <span class="reflection-text">Loading today's reflection…</span>
        <span class="reflection-action visually-hidden"></span>
      </button>`;
    this.#headingText = this.#root.querySelector('.heading-text');
    this.#symbol = this.#root.querySelector('.symbol');
    this.#stage = this.#root.querySelector('.stage');
    this.#banner = this.#root.querySelector('.banner');
    this.#peek = this.#root.querySelector('.peek');
    this.#flipbook = this.#root.querySelector('.flipbook');
    this.#reflection = this.#root.querySelector('.reflection');
    this.#reflectionText = this.#root.querySelector('.reflection-text');
    this.#reflectionAction = this.#root.querySelector('.reflection-action');

    this.#symbol.addEventListener('load', () => { this.#symbol.hidden = false; });
    this.#symbol.addEventListener('error', () => { this.#symbol.hidden = true; });
    this.#reflection.addEventListener('click', () => {
      this.#setExpanded(this.#reflection.getAttribute('aria-expanded') !== 'true');
    });
    this.#stage.addEventListener('pointerdown', (event) => this.#onPointerDown(event));
    this.#stage.addEventListener('pointermove', (event) => this.#onPointerMove(event));
    this.#stage.addEventListener('pointerup', (event) => this.#onPointerEnd(event));
    this.#stage.addEventListener('pointercancel', (event) => this.#onPointerEnd(event));
    // A swipe that ends on the Flipbook button is not a tap on it.
    this.#stage.addEventListener('click', (event) => {
      if (!this.#suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    this.#stage.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') this.previous();
      else this.next();
    });
  }

  connectedCallback() {
    this.#scheduleConfigure();
    this.#armHint();
  }

  disconnectedCallback() {
    this.#stopHint();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) this.#scheduleConfigure();
  }

  get daysAgo() {
    return this.#day?.daysAgo ?? 0;
  }

  get date() {
    return this.#day?.iso ?? devotionalDay(this.#today, 0, this.#mediaBase).iso;
  }

  /** Step back a day, sliding the earlier one in from the left. */
  previous() {
    return this.#step(-1);
  }

  /** Step forward a day, toward today. */
  next() {
    return this.#step(1);
  }

  /** Show the day `daysAgo` days before today at once, clamped to the range. */
  goTo(daysAgo) {
    const target = Math.min(Math.max(Math.round(Number(daysAgo) || 0), 0), this.#pastDays);
    this.#stopHint();
    this.#show(target);
  }

  get #mediaBase() {
    const base = this.getAttribute('media-base') || DEFAULT_MEDIA_BASE;
    return base.endsWith('/') ? base : `${base}/`;
  }

  get #pastDays() {
    const days = Number.parseInt(this.getAttribute('past-days') ?? '', 10);
    return Number.isFinite(days) && days >= 0 ? days : DEFAULT_PAST_DAYS;
  }

  // Upgrade fires attributeChangedCallback per attribute, then connectedCallback;
  // coalesce them into a single configure.
  #scheduleConfigure() {
    if (this.#configurePending) return;
    this.#configurePending = true;
    queueMicrotask(() => {
      this.#configurePending = false;
      this.#configure();
    });
  }

  #configure() {
    this.#preloaded.clear();
    this.#show(Math.min(this.daysAgo, this.#pastDays));
    const versesSrc = new URL(this.getAttribute('verses-src') || DEFAULT_VERSES_SRC, document.baseURI).href;
    if (versesSrc !== this.#versesSrc) {
      this.#versesSrc = versesSrc;
      this.#loadVerses(versesSrc);
    }
  }

  async #loadVerses(src) {
    this.#verses = null;
    this.#showVerse();
    let verses;
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`Unable to load ${src} (${response.status})`);
      const list = await response.json();
      verses = new Map(list.map((item) => [item.id, item]));
    } catch (error) {
      console.warn('Daily Grace reflections could not be loaded:', error);
      verses = false;
    }
    if (src !== this.#versesSrc) return;
    this.#verses = verses;
    this.#showVerse();
    this.#emitDay();
  }

  #show(daysAgo) {
    const day = devotionalDay(this.#today, daysAgo, this.#mediaBase);
    this.#day = day;
    this.#banner.src = day.banner;
    this.#banner.alt = `Daily Grace devotional for ${day.name}`;
    this.#headingText.textContent = daysAgo
      ? `Your Daily Grace for ${day.name.replace(/, \d+$/, '')}`
      : 'Your Daily Grace Today';

    // An earlier day opens the Flipbook on the week that day belongs to.
    const href = this.getAttribute('flipbook-href') || DEFAULT_FLIPBOOK_HREF;
    let link = href;
    if (daysAgo) {
      const url = new URL(href, document.baseURI);
      url.searchParams.set('date', day.iso);
      link = url.href;
    }
    const label = daysAgo
      ? `Open the Flipbook for the week of ${day.name}`
      : "Open this week's Flipbook";
    this.#flipbook.href = link;
    this.#flipbook.setAttribute('aria-label', label);
    this.#flipbook.title = label;

    this.#showVerse();
    this.#preload(daysAgo + 1);
    this.#preload(daysAgo - 1);
    this.#emitDay();
  }

  #verseFor(day) {
    return this.#verses ? this.#verses.get(day.name) ?? null : null;
  }

  #showVerse() {
    const verse = this.#day && this.#verseFor(this.#day);
    if (verse) {
      const book = verse.verse.replace(/\s+\d.*$/, '').trim();
      const symbol = bookSymbolUrl(this.#mediaBase, book);
      if (this.#symbol.getAttribute('src') !== symbol) this.#symbol.src = symbol;
      this.#reflectionText.textContent = verse.reflection;
      this.#reflection.disabled = false;
      this.#setExpanded(false);
      return;
    }
    this.#symbol.hidden = true;
    this.#symbol.removeAttribute('src');
    this.#reflection.disabled = true;
    this.#reflection.setAttribute('aria-expanded', 'false');
    this.#reflectionAction.textContent = '';
    this.#reflectionText.textContent =
      this.#verses === null ? "Loading today's reflection…"
      : this.#verses === false ? "Today's reflection is unavailable. Please try again later."
      : "This day's reflection is unavailable.";
  }

  #setExpanded(expanded) {
    this.#reflection.setAttribute('aria-expanded', String(expanded));
    this.#reflectionAction.textContent = expanded ? 'Collapse reflection' : 'Expand reflection';
  }

  #emitDay() {
    const day = this.#day;
    this.dispatchEvent(new CustomEvent('daychange', {
      detail: { daysAgo: day.daysAgo, date: day.iso, name: day.name, verse: this.#verseFor(day) },
      bubbles: true,
      composed: true,
    }));
  }

  // Warm the cache for the banners one swipe away, so they are ready to slide in.
  #preload(daysAgo) {
    if (daysAgo < 0 || daysAgo > this.#pastDays) return;
    const { banner } = devotionalDay(this.#today, daysAgo, this.#mediaBase);
    if (this.#preloaded.has(banner)) return;
    this.#preloaded.add(banner);
    new Image().src = banner;
  }

  /* ----- Sliding ----- */

  // -1 steps back a day, +1 steps forward.
  #canStep(step) {
    const target = this.daysAgo - step;
    return target >= 0 && target <= this.#pastDays;
  }

  #setOffset(px) {
    this.#banner.style.transform = px ? `translateX(${px}px)` : '';
  }

  async #step(step, fromOffset = 0) {
    if (this.#sliding || !this.#canStep(step)) return;
    // The reader has found the swipe; the hint is not needed again.
    this.#stopHint();
    const hint = readHintState();
    if (!hint.swiped) writeHintState({ ...hint, swiped: true });
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
    const leaving = this.#banner.animate(
      [
        { transform: `translateX(${fromOffset}px)`, opacity: 1 },
        { transform: `translateX(${away}px)`, opacity: 0 },
      ],
      { duration: 180, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' },
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
    await this.#banner.animate(
      [
        { transform: `translateX(${-away}px)`, opacity: 0 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: 280, easing: 'cubic-bezier(.2, .9, .25, 1)' },
    ).finished.catch(() => {});
    this.#sliding = false;
  }

  #snapBack(fromOffset) {
    this.#setOffset(0);
    if (!fromOffset || this.#reducedMotion.matches) return;
    this.#banner.animate(
      [{ transform: `translateX(${fromOffset}px)` }, { transform: 'none' }],
      { duration: 220, easing: 'cubic-bezier(.2, .9, .25, 1)' },
    );
  }

  /* ----- Swipe hint ----- */

  // Wait for the banner to be mostly on screen, then play the hint once.
  #armHint() {
    if (this.#hint !== 'idle' || this.#reducedMotion.matches || !this.#pastDays) return;
    const { swiped, shown } = readHintState();
    if (swiped || shown >= HINT_LIMIT) return;
    this.#hint = 'armed';
    // Scrolled away before the delay is up, it waits for the next time.
    this.#hintObserver = new IntersectionObserver(([entry]) => {
      clearTimeout(this.#hintTimer);
      if (entry.isIntersecting) this.#hintTimer = setTimeout(() => this.#playHint(), HINT_DELAY);
    }, { threshold: 0.6 });
    this.#hintObserver.observe(this.#stage);
  }

  #stopHint() {
    this.#hint = 'done';
    this.#hintObserver?.disconnect();
    this.#hintObserver = null;
    clearTimeout(this.#hintTimer);
    for (const animation of this.#hintAnimations) animation.cancel();
    this.#hintAnimations = [];
    this.#peek.classList.remove('showing');
  }

  // True while something else, such as the trivia quiz, sits over the banner.
  // A dialog in another component's shadow root is found as that component.
  #covered() {
    const box = this.#stage.getBoundingClientRect();
    return document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2) !== this;
  }

  // Today's banner nudges right, pulling yesterday's in from the left edge,
  // and springs back: the first part of a swipe, played for the reader.
  async #playHint() {
    if (this.#hint !== 'armed') return;
    // Only on today, and only while nothing else is moving the banner.
    if (this.daysAgo !== 0 || this.#sliding || this.#drag) {
      this.#stopHint();
      return;
    }
    if (document.hidden || this.#covered()) {
      this.#hintTimer = setTimeout(() => this.#playHint(), HINT_RETRY);
      return;
    }
    this.#hint = 'playing';
    this.#hintObserver.disconnect();
    this.#hintObserver = null;

    const yesterday = devotionalDay(this.#today, 1, this.#mediaBase).banner;
    if (this.#peek.getAttribute('src') !== yesterday) this.#peek.src = yesterday;
    const [today, peek] = await Promise.allSettled([this.#banner.decode(), this.#peek.decode()]);
    // A touch while the banners decoded has already stopped the hint. With no
    // banner for today there is nothing to nudge; with none for yesterday the
    // nudge still shows that the banner moves.
    if (this.#hint !== 'playing') return;
    if (today.status === 'rejected') {
      this.#stopHint();
      return;
    }

    const width = this.#banner.offsetWidth;
    const nudge = Math.round(Math.min(Math.max(width * 0.14, 48), 140));
    const frames = (from) => [
      { transform: `translateX(${from}px)`, easing: 'cubic-bezier(.3, 0, .2, 1)' },
      { transform: `translateX(${from + nudge}px)`, offset: 0.4 },
      { transform: `translateX(${from + nudge}px)`, offset: 0.55, easing: 'cubic-bezier(.34, 1.56, .64, 1)' },
      { transform: `translateX(${from}px)` },
    ];
    const timing = { duration: 1400 };
    this.#hintAnimations = [this.#banner.animate(frames(0), timing)];
    if (peek.status === 'fulfilled') {
      this.#peek.classList.add('showing');
      this.#hintAnimations.push(this.#peek.animate(frames(-(width + PEEK_GAP)), timing));
    }
    const state = readHintState();
    writeHintState({ ...state, shown: state.shown + 1 });

    await Promise.all(this.#hintAnimations.map((animation) => animation.finished)).catch(() => {});
    if (this.#hint === 'playing') this.#stopHint();
  }

  /* ----- Swiping ----- */

  // The reader's finger is followed only once a press has clearly moved
  // sideways; an upward or downward one is left to scroll the page.
  #onPointerDown(event) {
    // A touch mid-hint takes over from it.
    this.#stopHint();
    if (this.#sliding || !event.isPrimary || event.button !== 0) return;
    this.#drag = { id: event.pointerId, x: event.clientX, y: event.clientY, offset: 0, active: false };
  }

  #onPointerMove(event) {
    const drag = this.#drag;
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.active) {
      if (Math.abs(dx) < DRAG_SLOP && Math.abs(dy) < DRAG_SLOP) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        this.#drag = null;
        return;
      }
      drag.active = true;
      this.#stage.setPointerCapture(event.pointerId);
      this.#stage.classList.add('dragging');
    }
    // Pulling toward a day that is not there gives a little, then resists.
    const step = dx > 0 ? -1 : 1;
    drag.offset = this.#canStep(step) ? dx : dx / 4;
    this.#setOffset(drag.offset);
  }

  #onPointerEnd(event) {
    const drag = this.#drag;
    if (!drag || event.pointerId !== drag.id) return;
    this.#drag = null;
    if (!drag.active) return;
    this.#stage.classList.remove('dragging');
    this.#suppressClick = true;
    setTimeout(() => { this.#suppressClick = false; });
    const step = drag.offset > 0 ? -1 : 1;
    const far = Math.abs(drag.offset) >= this.#stage.clientWidth * SWIPE_SHARE;
    if (event.type === 'pointerup' && far && this.#canStep(step)) {
      this.#step(step, drag.offset);
    } else {
      this.#snapBack(drag.offset);
    }
  }
}

if (!customElements.get('banner-slider')) {
  customElements.define('banner-slider', BannerSlider);
}
