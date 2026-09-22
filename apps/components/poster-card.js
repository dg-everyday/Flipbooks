/**
 * <poster-card> — the Daily Grace poster with a comic flip and audio narration.
 *
 * Shows the poster for a day. Activating the poster (click, Enter or Space)
 * turns it like a page to the comic version, and back again. A round button
 * on the poster plays or pauses that day's narration.
 *
 * Usage
 *   <poster-card media-base="https://dailygrace.faith/media/"></poster-card>
 *   <script type="module" src="./apps/components/poster-card.js"></script>
 *
 * Attributes
 *   media-base   Base URL for images and audio.
 *                Default: http://localhost:9001/media/
 *   date         Day to show as YYYY-MM-DD. Default: today in Asia/Manila.
 *
 * Files are resolved from the date:
 *   <media-base>images/sources/<month>/<Month D, YYYY>[ - Comic].webp
 *   <media-base>audio/<YYYY>/<Month>/webm/<Month D, YYYY>.webm
 *
 * Methods      toggle()  flip between poster and comic
 *              play(), pause()  control the narration
 * Properties   comic (read-only), playing (read-only)
 * Events       posterchange  detail: { comic }
 *
 * The audio file is only requested when the play button is first pressed.
 * The flip is skipped when the user prefers reduced motion.
 *
 * CSS custom properties
 *   --poster-card-padding, --poster-card-bg, --poster-audio-bg,
 *   --poster-audio-bg-hover, --poster-audio-ink, --poster-audio-shadow
 * The audio button falls back to --action / --action-hover / --action-ink /
 * --action-shadow from the page, the shared look for the round banner buttons.
 */

// const DEFAULT_MEDIA_BASE = 'https://dailygrace.faith/media/';
const DEFAULT_MEDIA_BASE = 'http://localhost:9001/media/';
const TIME_ZONE = 'Asia/Manila';

// Line-art icons, matching the stroked look of the other round banner buttons.
const ICON_ATTRS = 'viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const PLAY_ICON = `<svg ${ICON_ATTRS}><polygon points="6 4 19 12 6 20"/></svg>`;
const PAUSE_ICON = `<svg ${ICON_ATTRS}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`;

const STYLES = /* css */ `
  :host {
    --poster-card-padding: 8px;
    --poster-card-bg: #f2f2f2;
    --poster-audio-bg: var(--action, #c62828);
    --poster-audio-bg-hover: var(--action-hover, #a91f1f);
    --poster-audio-ink: var(--action-ink, #fff);
    --poster-audio-shadow: var(--action-shadow, 0 5px 14px rgb(0 0 0 / 35%));

    display: block;
    padding: var(--poster-card-padding);
    background: var(--poster-card-bg);
  }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }

  .wrap {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    background: #fff;
  }
  .toggle {
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    cursor: pointer;
  }
  .toggle:focus-visible { outline: 2px solid #001b34; outline-offset: -2px; }
  .poster { display: block; width: 100%; height: auto; }

  .audio {
    position: absolute; top: 12px; right: 12px; z-index: 20;
    display: grid; place-items: center;
    width: 42px; height: 42px; padding: 0;
    border: 0; border-radius: 50%;
    background: var(--poster-audio-bg); color: var(--poster-audio-ink);
    box-shadow: var(--poster-audio-shadow);
    cursor: pointer;
  }
  .audio svg {
    display: block; width: 18px; height: 18px;
    transition: transform .2s ease;
  }
  .audio:hover,
  .audio:focus-visible { background: var(--poster-audio-bg-hover); }
  .audio:hover svg,
  .audio:focus-visible svg { transform: scale(1.08); }
  .audio:focus-visible { outline: 2px solid #fff; outline-offset: -4px; }
  .audio:disabled { cursor: default; opacity: .55; }

  @media (max-width: 650px) {
    .audio { top: 8px; right: 8px; width: 36px; height: 36px; }
    .audio svg { width: 16px; height: 16px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .audio svg { transition: none; }
  }
`;

/** Month and date names for the poster files, in Asia/Manila unless a date is given. */
function dateParts(dateAttr) {
  let date = new Date();
  let timeZone = TIME_ZONE;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateAttr ?? '');
  if (match) {
    // Noon UTC keeps the calendar day stable whatever the viewer's time zone.
    date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12));
    timeZone = 'UTC';
  }
  const monthFolder = date.toLocaleString('en-US', { timeZone, month: 'long' });
  return {
    monthFolder,
    month: monthFolder.toLowerCase(),
    dateName: date.toLocaleDateString('en-US', { timeZone, month: 'long', day: 'numeric', year: 'numeric' }),
    year: date.toLocaleDateString('en-US', { timeZone, year: 'numeric' }),
  };
}

export class PosterCard extends HTMLElement {
  static observedAttributes = ['media-base', 'date'];

  #root;
  #toggleButton;
  #poster;
  #audioButton;
  #posterPath = '';
  #audioUrl = '';
  #audio = null;
  #comic = false;
  #flipId = 0;
  #configurePending = false;
  #reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <div class="wrap">
        <button class="toggle" type="button">
          <img class="poster" alt="" />
        </button>
        <button class="audio" type="button" aria-pressed="false"></button>
      </div>`;
    this.#toggleButton = this.#root.querySelector('.toggle');
    this.#poster = this.#root.querySelector('.poster');
    this.#audioButton = this.#root.querySelector('.audio');

    this.#toggleButton.addEventListener('click', () => this.toggle());
    this.#audioButton.addEventListener('click', () => {
      if (this.playing) this.stop();
      else this.play();
    });
    this.#syncLabels();
    this.#syncAudioButton();
  }

  connectedCallback() {
    this.#scheduleConfigure();
  }

  disconnectedCallback() {
    this.stop();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) this.#scheduleConfigure();
  }

  get comic() {
    return this.#comic;
  }

  get playing() {
    return Boolean(this.#audio) && !this.#audio.paused;
  }

  get #mediaBase() {
    const base = this.getAttribute('media-base') || DEFAULT_MEDIA_BASE;
    return base.endsWith('/') ? base : `${base}/`;
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

  /** (Re)point the poster and narration at the current date and media host. */
  #configure() {
    const { monthFolder, month, dateName, year } = dateParts(this.getAttribute('date'));
    this.#posterPath = `${this.#mediaBase}images/sources/${month}/${dateName}`;
    this.#audioUrl = `${this.#mediaBase}audio/${year}/${monthFolder}/webm/${dateName}.webm`;

    this.stop();
    this.#audio = null;
    this.#flipId++;
    this.#poster.getAnimations().forEach((animation) => animation.cancel());
    this.#comic = false;
    this.#poster.src = `${this.#posterPath}.webp`;
    this.#syncLabels();
  }

  #syncLabels() {
    const label = this.#comic ? 'Show the regular poster' : 'Show the comic version of this poster';
    this.#toggleButton.setAttribute('aria-label', label);
    this.#toggleButton.title = label;
  }

  #syncAudioButton() {
    const playing = this.playing;
    const label = playing ? 'Pause narration' : 'Play narration';
    this.#audioButton.setAttribute('aria-pressed', String(playing));
    this.#audioButton.setAttribute('aria-label', label);
    this.#audioButton.title = label;
    this.#audioButton.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
  }

  #ensureAudio() {
    if (!this.#audio) {
      const audio = new Audio(this.#audioUrl);
      const sync = () => this.#syncAudioButton();
      audio.addEventListener('play', sync);
      audio.addEventListener('pause', sync);
      audio.addEventListener('error', sync);
      audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        sync();
      });
      this.#audio = audio;
    }
    return this.#audio;
  }

  play() {
    this.#ensureAudio().play().catch(() => {});
  }

  pause() {
    this.#audio?.pause();
  }

  /** Pause and rewind, so the next play starts from the beginning. */
  stop() {
    if (!this.#audio) return;
    this.#audio.pause();
    this.#audio.currentTime = 0;
  }

  /**
   * Turn the poster like a page: it swings edge-on, the image swaps while it is
   * invisible, then the other side swings back in.
   */
  async toggle() {
    this.#comic = !this.#comic;
    this.#syncLabels();
    this.dispatchEvent(new CustomEvent('posterchange', { detail: { comic: this.#comic } }));

    const flipId = ++this.#flipId;
    const nextSrc = `${this.#posterPath}${this.#comic ? ' - Comic' : ''}.webp`;
    const poster = this.#poster;
    // Start loading now so the swap does not show a half-loaded image.
    const preload = new Image();
    preload.src = nextSrc;
    const ready = preload.decode().catch(() => {});

    if (this.#reducedMotion.matches || !poster.animate) {
      await ready;
      if (flipId === this.#flipId) poster.src = nextSrc;
      return;
    }

    poster.getAnimations().forEach((animation) => animation.cancel());
    const turn = (angle) => `perspective(1400px) rotateY(${angle}deg)`;
    const out = poster.animate(
      [
        { transform: turn(0), opacity: 1 },
        { transform: turn(-90), opacity: 0.55 },
      ],
      { duration: 240, easing: 'ease-in', fill: 'forwards' },
    );
    await Promise.all([out.finished.catch(() => {}), ready]);
    // A newer toggle owns the image now; it has already cancelled this flip.
    if (flipId !== this.#flipId) return;

    poster.src = nextSrc;
    poster.animate(
      [
        { transform: turn(90), opacity: 0.55 },
        { transform: turn(0), opacity: 1 },
      ],
      { duration: 300, easing: 'ease-out' },
    );
    out.cancel();
  }
}

if (!customElements.get('poster-card')) {
  customElements.define('poster-card', PosterCard);
}
