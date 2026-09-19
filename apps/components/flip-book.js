/**
 * <flip-book> — the Daily Grace weekly flipbook reader as a web component.
 *
 * Custom element names must contain a hyphen, so the tag is <flip-book>
 * (the class is exported as `Flipbook`).
 *
 * The component owns the stage: loading message, book shadow, single-page
 * book (portrait / narrow screens) and two-page spread (landscape desktop).
 * The toolbar (home, prev/next, zoom buttons) lives in your page and drives
 * the component through its public methods.
 *
 * Usage
 *   <flip-book id="reader"></flip-book>
 *   <script type="module" src="./flip-book.js"></script>
 *
 * Attributes
 *   media-base   Base URL for images and audio.
 *                Default: https://dailygrace.faith/media/
 *   verses-src   URL of verses.json (resolved against the page).
 *                Default: ../../assets/verses.json
 *
 * Methods      next(), prev(), zoomIn(), zoomOut(), resetZoom()
 * Properties   page (read-only, current index), pageCount (read-only),
 *              zoom (get/set, 1–3.5)
 * Events       ready       fired once pages are loaded
 *              pagechange  detail: { index, pageCount }
 *              error       detail: { message }
 *
 * Sizing: the host fills its parent (flex: 1 in a column flex container).
 *
 * CSS custom properties
 *   --flipbook-navy, --flipbook-gold, --flipbook-shadow
 *   --flipbook-future-paper   url() for not-yet-available pages
 *   --flipbook-end-paper      url() for blank/end pages
 *   --flipbook-wire           url() list for the wire binding (later entries are fallbacks)
 *   --flipbook-logo           url() for the logo on future pages
 */

const DEFAULT_MEDIA_BASE = 'https://dailygrace.faith/media/';
const DEFAULT_VERSES_SRC = '../../assets/verses.json';

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july',
  'august', 'september', 'october', 'november', 'december'];

const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
const PAUSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';

const STYLES = /* css */ `
  :host {
    --flipbook-navy: #071d35;
    --flipbook-gold: #d9a84f;
    --flipbook-shadow: rgba(0, 0, 0, .38);
    --flipbook-future-paper: url('../../assets/images/specialty-paper.svg');
    --flipbook-end-paper: url('../../assets/images/end-paper.svg');
    --flipbook-wire: url('../../assets/images/wire-binding.svg?v=3');
    --flipbook-logo: url('../../assets/images/dg-icon-5.webp');


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
    aspect-ratio: 9 / 16;
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
    .stage { padding: 3px; }
    .book::after {
      content: "";
      position: absolute; top: 0; bottom: 0; left: -28px;
      width: 40px;
      background-image: var(--flipbook-wire);
      background-position: center top;
      background-size: 40px 28px;
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
`;

const TEMPLATE = /* html */ `
  <style>${STYLES}</style>
  <div class="stage" id="stage" role="region" aria-label="Daily Grace flipbook">
    <div class="loading" id="loading" role="status">Preparing your Daily Grace flipbook…</div>
    <div class="book-shadow"></div>
    <div class="book" id="book" role="group" aria-label="Daily Grace flipbook"></div>
    <div class="desktop-spread" id="desktopSpread" role="group" aria-label="Daily Grace flipbook spread"></div>
  </div>
`;

/* ---------- Pure helpers ---------- */

function getCurrentWeekDates(today = new Date()) {
  // Start of current week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const formatted = date.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    });
    dates.push(`${formatted}.webp`);
    dates.push(`${formatted} - Comic.webp`);
  }
  return dates;
}

// Sunday-based calendar weeks, matching getCurrentWeekDates(). UTC arithmetic avoids DST shifts.
function coverPaths(today = new Date()) {
  const year = today.getFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const day = Date.UTC(year, today.getMonth(), today.getDate());
  const week = Math.floor(((day - start.getTime()) / 86400000 + start.getUTCDay()) / 7) + 1;
  return [
    `images/coverpages/${year}/${year}-WEEK${week}.webp`,
    `images/coverpages/${year}/${year}-404.webp`
  ];
}

function imageFileName(src) {
  try {
    return decodeURIComponent(new URL(src, window.location.href).pathname.split('/').pop() || '');
  } catch {
    return decodeURIComponent((src.split('/').pop() || '').split('?')[0]);
  }
}

function isComicImage(src) {
  return / - Comic\.[^.]+$/i.test(imageFileName(src));
}

function hasNarration(src) {
  return !isComicImage(src) && !/\/coverpages\//.test(src);
}

function isFuturePage(src, today = new Date()) {
  if (!src) return false;
  const match = imageFileName(src).match(/^([A-Za-z]+) (\d{1,2}), (\d{4})(?: - Comic)?\.webp$/i);
  if (!match) return false;
  const month = MONTHS.indexOf(match[1].toLowerCase());
  if (month < 0) return false;
  const pageDate = new Date(Number(match[3]), month, Number(match[2]));
  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return pageDate > currentDate;
}

function sameAudioUrl(a, b) {
  if (!a || !b) return false;
  try { return decodeURI(a) === decodeURI(b); }
  catch { return a === b; }
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
  return { left: (frameW - width) / 2, top: (frameH - height) / 2, width, height };
}

// Spread mode pairs the opening blank with page 1, then pages 2–3, 4–5, etc.
function spreadStart(index) {
  return Math.floor((index + 1) / 2) * 2 - 1;
}

async function animateSpreadHalf(page, from, to, origin) {
  if (!page) return;
  const animation = page.animate([
    { transform: `perspective(1600px) rotateY(${from}deg)`, filter: 'brightness(1)' },
    { transform: `perspective(1600px) rotateY(${to}deg)`,
      filter: to === 0 ? 'brightness(1)' : 'brightness(.65)' }
  ], {
    duration: 340,
    easing: 'cubic-bezier(.4, 0, .2, 1)',
    fill: 'forwards'
  });
  page.style.transformOrigin = origin;
  page.style.zIndex = '2';
  try {
    await animation.finished;
  } finally {
    animation.cancel();
    page.style.transformOrigin = '';
    page.style.zIndex = '';
  }
}

/* ---------- Component ---------- */

export class Flipbook extends HTMLElement {
  #root;
  #stage;
  #book;
  #loading;
  #desktopSpread;

  #images = [];
  #verses = new Map();
  #mediaBase = DEFAULT_MEDIA_BASE;

  #current = 0;   // image index; -1 is the opening blank in spread mode
  #zoom = 1;
  #panX = 0;
  #panY = 0;
  #pointerStart = null;
  #pinchStart = null;
  #gesturePinched = false;
  #animating = false;
  #activePointers = new Map();
  #lastReported = null;

  #audio = new Audio();
  #singlePageQuery = window.matchMedia('(max-width: 600px), (orientation: portrait)');
  #abort = null;
  #resizeObserver = null;
  #loadId = 0;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = TEMPLATE;
    this.#stage = this.#root.getElementById('stage');
    this.#book = this.#root.getElementById('book');
    this.#loading = this.#root.getElementById('loading');
    this.#desktopSpread = this.#root.getElementById('desktopSpread');
  }

  connectedCallback() {
    this.#abort = new AbortController();
    this.#bindEvents(this.#abort.signal);
    this.#load();
  }

  disconnectedCallback() {
    this.#loadId++; // discard any load still in flight
    this.#abort?.abort();
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
    this.#stopAudio();
  }

  /* ----- Public API ----- */

  next() { this.#turnPage(1); }
  prev() { this.#turnPage(-1); }
  zoomIn() { this.#setZoom(this.#zoom + 0.25); }
  zoomOut() { this.#setZoom(this.#zoom - 0.25); }
  resetZoom() { this.#resetFit(); }

  get page() { return this.#current; }
  get pageCount() { return this.#images.length; }
  get zoom() { return this.#zoom; }
  set zoom(value) { this.#setZoom(Number(value) || 1); }

  /* ----- Helpers ----- */

  #isSinglePage() { return this.#singlePageQuery.matches; }
  #visibleBook() { return this.#isSinglePage() ? this.#book : this.#desktopSpread; }
  #emit(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
  #prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ----- Loading ----- */

  #loadImage(path) {
    const src = new URL(path, this.#mediaBase).href;
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async #loadVerses() {
    try {
      const url = this.getAttribute('verses-src') || DEFAULT_VERSES_SRC;
      const response = await fetch(new URL(url, window.location.href));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const verses = await response.json();
      return new Map(verses
        .filter(item => typeof item?.id === 'string' && typeof item.verse === 'string')
        .map(item => [item.id, item.verse]));
    } catch (error) {
      console.warn('Unable to load verses:', error);
      return new Map();
    }
  }

  async #load() {
    const run = ++this.#loadId;

    this.#mediaBase = this.getAttribute('media-base') || DEFAULT_MEDIA_BASE;
    this.#images = [];
    this.#current = 0;
    this.#lastReported = null;
    this.#book.replaceChildren();
    this.#desktopSpread.replaceChildren();
    this.#loading.hidden = false;
    this.#loading.style.display = '';
    this.#loading.textContent = 'Preparing your Daily Grace flipbook…';

    try {
      const today = new Date();
      const dates = getCurrentWeekDates(today);
      const [cover, fallback] = coverPaths(today);
      const coverPromise = this.#loadImage(cover).then(src => src || this.#loadImage(fallback));

      const [coverImage, availableImages, verses] = await Promise.all([
        coverPromise,
        Promise.all(dates.map(fileName => {
          const month = fileName.split(' ')[0].toLowerCase();
          return this.#loadImage(`images/sources/${month}/${fileName}`);
        })),
        this.#loadVerses()
      ]);
      if (run !== this.#loadId) return;

      this.#verses = verses;
      this.#images = [coverImage, ...availableImages].filter(Boolean);
      if (this.#images.length === 0) {
        this.#loading.textContent = 'No pages are available for this week yet.';
        return;
      }

      // A real final page keeps the blank reachable in both single and spread modes.
      this.#images.push(null);
      this.#buildPages();
      await Promise.all([...this.#book.querySelectorAll('img')].map(img => new Promise(resolve => {
        if (img.complete) resolve(); else { img.onload = resolve; img.onerror = resolve; }
      })));
      if (run !== this.#loadId) return;

      this.#loading.style.display = 'none';
      this.#resetFit();
      this.#render();
      requestAnimationFrame(() => this.#positionPlayButtons());

      this.#resizeObserver = new ResizeObserver(() => this.#resetFit());
      this.#resizeObserver.observe(this.#stage);
      this.#emit('ready', { pageCount: this.#images.length });
    } catch (error) {
      if (run !== this.#loadId) return;
      this.#loading.textContent = `Unable to prepare flipbook: ${error.message}`;
      this.#emit('error', { message: error.message });
    }
  }

  /* ----- Future-page placeholder ----- */

  #updateFuturePage(page, src) {
    const future = isFuturePage(src);
    page.classList.toggle('future-page', future);
    const existing = page.querySelector('.availability-message');
    if (!future) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;

    const date = imageFileName(src).match(/^([A-Za-z]+ \d{1,2}, \d{4})/)[1];
    const message = document.createElement('div');
    message.className = 'availability-message';

    const logo = document.createElement('span');
    logo.className = 'availability-logo';
    logo.setAttribute('aria-hidden', 'true');
    message.appendChild(logo);

    const title = document.createElement('div');
    title.className = 'availability-title';
    title.textContent = 'DAILY GRACE';
    message.appendChild(title);

    if (isComicImage(src)) {
      const comic = document.createElement('div');
      comic.className = 'availability-comic';
      comic.textContent = 'COMIC';
      message.appendChild(comic);
    }

    const detail = document.createElement('div');
    detail.className = 'availability-detail';
    const label = document.createElement('div');
    label.className = 'availability-label';
    label.textContent = 'WILL BE AVAILABLE IN';
    const releaseDate = document.createElement('div');
    releaseDate.className = 'availability-date';
    releaseDate.textContent = date;
    detail.append(label, releaseDate);

    const pageVerse = this.#verses.get(date);
    if (pageVerse) {
      const verse = document.createElement('div');
      verse.className = 'availability-verse';
      verse.textContent = pageVerse;
      detail.appendChild(verse);
    }
    message.appendChild(detail);
    page.appendChild(message);
  }

  /* ----- Audio ----- */

  #audioUrlForImage(src) {
    const baseName = imageFileName(src).replace(/\.[^.]+$/, '');
    const month = (baseName.match(/^([A-Za-z]+)\b/) || [])[1]
      || new Date().toLocaleString('en-US', { month: 'long' });
    return new URL(`audio/${month}/mp3/${baseName}.mp3`, this.#mediaBase).href;
  }

  #playPageAudio(src) {
    if (!hasNarration(src)) return;
    const url = this.#audioUrlForImage(src);
    if (sameAudioUrl(this.#audio.src, url) && !this.#audio.paused) {
      this.#stopAudio();
      return;
    }
    this.#audio.src = url;
    this.#audio.play().catch(() => {});
  }

  #stopAudio() {
    this.#audio.pause();
    this.#audio.currentTime = 0;
    this.#syncPlayButtons();
  }

  #syncPlayButtons() {
    const playingUrl = !this.#audio.paused && this.#audio.src ? this.#audio.src : '';
    this.#root.querySelectorAll('.audio-play').forEach(btn => {
      const on = playingUrl && sameAudioUrl(playingUrl, this.#audioUrlForImage(btn.dataset.src));
      btn.classList.toggle('is-playing', !!on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? 'Pause narration' : 'Play narration');
      btn.innerHTML = on ? PAUSE_ICON : PLAY_ICON;
    });
  }

  #createPlayButton(src) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'audio-play';
    btn.dataset.src = src;
    btn.setAttribute('aria-label', 'Play narration');
    btn.innerHTML = PLAY_ICON;
    const stopStageGesture = e => e.stopPropagation();
    btn.addEventListener('pointerdown', stopStageGesture);
    btn.addEventListener('pointerup', stopStageGesture);
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.#playPageAudio(src);
    });
    return btn;
  }

  #positionPlayButton(btn) {
    const img = btn.parentElement && btn.parentElement.querySelector('img');
    if (!img || !img.naturalWidth) return;
    const box = containedImageBox(img);
    const size = btn.offsetWidth || 44;
    const inset = 12;
    btn.style.top = `${box.top + inset}px`;
    btn.style.left = `${box.left + box.width - inset - size}px`;
    btn.classList.add('is-placed');
  }

  #positionPlayButtons() {
    this.#root.querySelectorAll('.audio-play').forEach(btn => this.#positionPlayButton(btn));
  }

  /* ----- Layout and rendering ----- */

  #fitBookToViewport() {
    const stageRect = this.#stage.getBoundingClientRect();
    // Leave room for the spring extending beyond the left edge in single-page mode.
    const availableW = Math.max(1, stageRect.width - (this.#isSinglePage() ? 64 : 16));
    const availableH = Math.max(1, stageRect.height - 16);

    // Artwork is portrait. Use the actual first image ratio when loaded.
    const firstImg = this.#book.querySelector('img');
    const ratio = firstImg && firstImg.naturalWidth && firstImg.naturalHeight
      ? firstImg.naturalWidth / firstImg.naturalHeight
      : 9 / 16;

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
    this.#images.forEach((src, i) => {
      const page = document.createElement('div');
      page.className = 'page';
      page.hidden = true;
      page.style.zIndex = String(this.#images.length - i);

      if (!src) {
        page.classList.add('end-page');
        page.setAttribute('aria-label', 'Blank end page');
        this.#book.appendChild(page);
        return;
      }

      const img = document.createElement('img');
      img.src = src;
      img.alt = `Daily Grace page ${i + 1}`;
      img.draggable = false;
      page.appendChild(img);
      if (hasNarration(src)) page.appendChild(this.#createPlayButton(src));
      img.addEventListener('load', () => this.#positionPlayButtons());
      this.#book.appendChild(page);
    });
  }

  #render() {
    this.#current = this.#isSinglePage() ? Math.max(0, this.#current) : spreadStart(this.#current);
    [...this.#book.children].forEach((page, i) => {
      page.hidden = i !== Math.max(0, this.#current);
      page.style.zIndex = '1';
      this.#updateFuturePage(page, this.#images[i]);
    });
    this.#renderDesktopSpread();
    this.#updateZoom();

    if (this.#lastReported !== this.#current) {
      this.#lastReported = this.#current;
      this.#emit('pagechange', { index: this.#current, pageCount: this.#images.length });
    }
  }

  #renderDesktopSpread() {
    this.#desktopSpread.replaceChildren();
    const start = spreadStart(this.#current);
    [start, start + 1].forEach(index => {
      const src = this.#images[index];
      const wrap = document.createElement('div');
      wrap.className = 'spread-page';
      this.#updateFuturePage(wrap, src);
      this.#desktopSpread.appendChild(wrap);
      if (!src) {
        const isEndPage = index >= 0;
        wrap.classList.add(isEndPage ? 'end-page' : 'blank-page');
        wrap.setAttribute('aria-label', isEndPage ? 'Blank end page' : 'Blank page');
        return;
      }
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Daily Grace page ${index + 1}`;
      img.draggable = false;
      wrap.appendChild(img);
      if (hasNarration(src)) wrap.appendChild(this.#createPlayButton(src));
      img.addEventListener('load', () => this.#positionPlayButtons());
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
    if (this.#animating || next < first || next >= this.#images.length) return;

    this.#stopAudio();
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
          if (direction > 0) {
            await animateSpreadHalf(outgoing, 0, -90, 'left center');
          } else {
            await animateSpreadHalf(incoming, -90, 0, 'left center');
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
        const outgoing = direction > 0
          ? this.#desktopSpread.lastElementChild
          : this.#desktopSpread.firstElementChild;
        await animateSpreadHalf(outgoing, 0, direction > 0 ? -90 : 90,
          direction > 0 ? 'left center' : 'right center');
      }
      this.#current = next;
      this.#render();
      if (animateSpread && !this.#isSinglePage()) {
        const incoming = direction > 0
          ? this.#desktopSpread.firstElementChild
          : this.#desktopSpread.lastElementChild;
        await animateSpreadHalf(incoming, direction > 0 ? 90 : -90, 0,
          direction > 0 ? 'right center' : 'left center');
      }
    } finally {
      this.#animating = false;
    }
  }

  /* ----- Zoom and pan ----- */

  #updateZoom() {
    const target = this.#visibleBook();
    target.style.transformOrigin = 'center center';
    target.style.transform = `translate3d(${this.#panX}px,${this.#panY}px,0) scale(${this.#zoom})`;
  }

  #clampPan() {
    const stageRect = this.#stage.getBoundingClientRect();
    const bookRect = this.#visibleBook().getBoundingClientRect();
    const maxX = Math.max(0, (bookRect.width - stageRect.width) / 2);
    const maxY = Math.max(0, (bookRect.height - stageRect.height) / 2);
    const binderWidth = this.#isSinglePage() ? 28 * this.#zoom : 0;
    const maxRight = Math.max(0, (bookRect.width - stageRect.width) / 2 + binderWidth);
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
    if (this.#zoom === 1) { this.#panX = 0; this.#panY = 0; }
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
    if (!el || el.closest('.audio-play')) return;
    if (!el.closest('.page, .spread-page')) return;
    const rect = this.#visibleBook().getBoundingClientRect();
    if (x < rect.left + rect.width / 2) this.prev(); else this.next();
  }

  #bindEvents(signal) {
    const stage = this.#stage;
    const activePointers = this.#activePointers;
    activePointers.clear();

    this.#audio.addEventListener('play', () => this.#syncPlayButtons(), { signal });
    this.#audio.addEventListener('pause', () => this.#syncPlayButtons(), { signal });
    this.#audio.addEventListener('ended', () => this.#stopAudio(), { signal });

    this.#singlePageQuery.addEventListener('change', () => {
      if (this.#images.length === 0) return;
      this.#render();
      this.#resetFit();
    }, { signal });

    // Mouse wheel zoom (trackpads and desktop mice).
    stage.addEventListener('wheel', e => {
      e.preventDefault();
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      this.#setZoom(this.#zoom * Math.exp(-e.deltaY * 0.001), x, y);
    }, { passive: false, signal });

    // Pointer gestures: swipe to turn pages, drag when zoomed, pinch to zoom.
    stage.addEventListener('pointerdown', e => {
      if (activePointers.size === 0) this.#gesturePinched = false;
      stage.setPointerCapture(e.pointerId);
      this.#pointerStart = {
        x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY, t: performance.now()
      };
      stage.classList.add('dragging');

      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activePointers.size === 2) {
        this.#gesturePinched = true;
        const a = [...activePointers.values()];
        this.#pinchStart = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
      }
    }, { signal });

    stage.addEventListener('pointermove', e => {
      const start = this.#pointerStart;
      if (start && this.#zoom > 1 && activePointers.size < 2) {
        this.#panX += e.clientX - start.lastX;
        this.#panY += e.clientY - start.lastY;
        start.lastX = e.clientX;
        start.lastY = e.clientY;
        this.#clampPan();
        this.#updateZoom();
      }

      if (!activePointers.has(e.pointerId)) return;
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activePointers.size === 2) {
        this.#gesturePinched = true;
        const a = [...activePointers.values()];
        const d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
        if (this.#pinchStart) this.#setZoom(this.#zoom * d / this.#pinchStart);
        this.#pinchStart = d;
      }
    }, { signal });

    const clearPointer = e => {
      activePointers.delete(e.pointerId);
      if (activePointers.size < 2) this.#pinchStart = null;
    };

    stage.addEventListener('pointerup', e => {
      clearPointer(e);
      stage.classList.remove('dragging');
      const start = this.#pointerStart;
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const dt = performance.now() - start.t;
      this.#pointerStart = null;

      const isSwipe = Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25 && dt < 700;
      if (this.#gesturePinched || this.#zoom > 1) return;
      if (isSwipe) {
        if (dx < 0) this.next(); else this.prev();
        return;
      }
      this.#handlePageTap(e.clientX, e.clientY);
    }, { signal });

    stage.addEventListener('pointercancel', e => {
      clearPointer(e);
      stage.classList.remove('dragging');
      this.#pointerStart = null;
    }, { signal });

    // Keyboard controls.
    window.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return; // leave browser zoom alone
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
      if (e.key === '+' || e.key === '=') this.zoomIn();
      if (e.key === '-') this.zoomOut();
      if (e.key === '0') this.resetZoom();
    }, { signal });
  }
}

if (!customElements.get('flip-book')) {
  customElements.define('flip-book', Flipbook);
}
