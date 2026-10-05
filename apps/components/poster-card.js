/**
 * <poster-card> — the Daily Grace poster with a comic flip and audio narration.
 *
 * Shows the poster for a day. Activating the poster (click, Enter or Space)
 * turns it like a page to the comic version, and back again; a dog-eared
 * bottom right corner, lifting now and then, hints at it. A round button
 * on the poster plays or pauses that day's narration, and one left of it shares
 * the image on show, poster or comic, as a picture through the phone's share
 * sheet (Messenger, Viber, Facebook and the rest). Pressing and holding the
 * poster for half a second copies the link to that image instead.
 *
 * Sharing sends a JPEG, which every chat app accepts; the WebP files are not
 * taken everywhere. A browser that cannot share files shares the image's
 * link, and one with no share sheet at all copies it.
 *
 * When the day has a video, it plays over the poster, muted and looping, as
 * on <banner-slider>, while the card is on screen. Until it is playing, and
 * for good when there is none or it cannot play (a missing file, autoplay
 * refused), the poster image shows as before. The comic side has no video.
 * Sharing and the long-press copy always send the image, never the video.
 *
 * Usage
 *   <poster-card media-base="https://dailygrace.faith/media/"></poster-card>
 *   <script type="module" src="./apps/components/poster-card.js"></script>
 *
 * Attributes
 *   media-base   Base URL for images and audio.
 *                Default: https://dailygrace.faith/media/
 *   date         Day to show as YYYY-MM-DD. Default: today in Asia/Manila,
 *                moving on to the new day when the page is left open past
 *                midnight.
 *
 * Files are resolved from the date:
 *   <media-base>images/sources/<YYYY>/<month>/<Month D, YYYY>[ - Comic].webp
 *   <media-base>images/sources/<YYYY>/<month>/<Month D, YYYY>.mp4   (optional)
 *   <media-base>audio/<YYYY>/<Month>/webm/<Month D, YYYY>.webm
 *
 * Methods      toggle()  flip between poster and comic
 *              play(), pause()  control the narration
 *              share()  share the image on show
 * Properties   comic (read-only), playing (read-only),
 *              imageUrl (read-only)  link to the image on show
 * Events       posterchange  detail: { comic }
 *              copy          the image link was copied, detail: { url, comic }
 *              share         the share sheet sent it on, detail: { url, comic, as }
 *                            where `as` is 'image' or 'link'
 *
 * The audio file is only requested when the play button is first pressed,
 * and the video when it first plays. The flip is skipped, and the video not
 * loaded, when the user prefers reduced motion; the video is not loaded with
 * Save-Data on either.
 *
 * CSS custom properties
 *   --poster-card-padding, --poster-card-bg, --poster-audio-bg,
 *   --poster-audio-bg-hover, --poster-audio-ink, --poster-audio-shadow
 * The audio button falls back to --action / --action-hover / --action-ink /
 * --action-shadow from the page, the shared look for the round banner buttons.
 */

const DEFAULT_MEDIA_BASE = 'https://dailygrace.faith/media/';
// const DEFAULT_MEDIA_BASE = 'http://localhost:9001/media/';
const TIME_ZONE = 'Asia/Manila';
// How often an open page checks whether midnight has passed.
const DATE_CHECK_INTERVAL = 60_000;

// The same half-second hold the verse cards and the DG emblem use.
const HOLD_MS = 500;
const HOLD_SLOP = 10;
const COPY_NOTES = { copied: 'Link copied', failed: "Couldn't copy the link" };
// Safari refuses a share that comes too long after the tap, as the first one
// can while the picture is still being made; by the second tap it is ready.
const SHARE_RETRY_NOTE = 'Tap share again';

const SITE_URL = 'https://dailygrace.faith/';
const SHARE_TYPE = 'image/jpeg';
const SHARE_QUALITY = 0.9;
// Web Share with files: Chrome on Android and Windows, Safari on iPhone and Mac.
const CAN_SHARE_FILES = (() => {
  try {
    return Boolean(navigator.canShare?.({ files: [new File([''], 'test.jpg', { type: SHARE_TYPE })] }));
  } catch {
    return false;
  }
})();

// Line-art icons, matching the stroked look of the other round banner buttons.
const ICON_ATTRS = 'viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const PLAY_ICON = `<svg ${ICON_ATTRS}><polygon points="6 4 19 12 6 20"/></svg>`;
const PAUSE_ICON = `<svg ${ICON_ATTRS}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`;
const SHARE_ICON = `<svg ${ICON_ATTRS}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>`;

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
  /* The poster and its video, which turn together. */
  .face { position: relative; display: block; }
  .poster {
    display: block; width: 100%; height: auto;
    /* A long press copies the link; keep the phone's image menu out of it. */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
  /* The day's video, over its poster, fading in once it is playing. */
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

  /* A gold glow builds around the poster's edge while it is held. */
  .wrap::after {
    content: "";
    position: absolute; inset: 0; z-index: 10;
    box-shadow: inset 0 0 0 0 rgb(214 170 40 / 0%);
    pointer-events: none;
    transition: box-shadow .25s ease;
  }
  .wrap.holding::after {
    box-shadow: inset 0 0 0 4px rgb(214 170 40 / 85%), inset 0 0 44px 12px rgb(214 170 40 / 45%);
    transition: box-shadow ${HOLD_MS}ms cubic-bezier(.25, .7, .35, 1);
  }
  .copy-note {
    position: absolute; bottom: 18px; left: 50%; z-index: 30;
    padding: 6px 16px;
    border-radius: 999px;
    background: rgb(0 27 52 / 90%);
    color: #fff;
    white-space: nowrap;
    font: 500 .9375rem/1.4 'Roboto', Arial, sans-serif;
    box-shadow: 0 6px 16px rgb(0 0 0 / 30%);
    pointer-events: none;
    animation: copy-note 1.8s ease forwards;
  }
  .copy-note.failed { background: #c62828; }
  @keyframes copy-note {
    0% { opacity: 0; transform: translate(-50%, 6px); }
    12%, 78% { opacity: 1; transform: translate(-50%, 0); }
    100% { opacity: 0; transform: translate(-50%, 0); }
  }
  .visually-hidden {
    position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .audio,
  .share {
    position: absolute; top: 12px; right: 12px; z-index: 20;
    display: grid; place-items: center;
    width: 42px; height: 42px; padding: 0;
    border: 0; border-radius: 50%;
    background: var(--poster-audio-bg); color: var(--poster-audio-ink);
    box-shadow: var(--poster-audio-shadow);
    cursor: pointer;
  }
  /* Left of the play button, a button's width and a gap further in. */
  .share { right: 64px; }
  .audio svg,
  .share svg {
    display: block; width: 18px; height: 18px;
    transition: transform .2s ease;
  }
  .audio:hover,
  .audio:focus-visible,
  .share:hover,
  .share:focus-visible { background: var(--poster-audio-bg-hover); }
  .audio:hover svg,
  .audio:focus-visible svg,
  .share:hover svg,
  .share:focus-visible svg { transform: scale(1.08); }
  .audio:focus-visible,
  .share:focus-visible { outline: 2px solid #fff; outline-offset: -4px; }
  .audio:disabled,
  .share:disabled { cursor: default; opacity: .55; }

  /* A dog-eared corner: the poster's bottom right corner folded back, as if
     something lay under the page. Every few seconds it lifts a little further,
     then settles. Taps go through it to the poster, which turns to the comic. */
  .dog-ear {
    --ear: 30px;
    position: absolute; right: 0; bottom: 0; z-index: 15;
    width: var(--ear); height: var(--ear);
    pointer-events: none;
    filter: drop-shadow(-2px -2px 3px rgb(0 0 0 / 35%));
    animation: ear-lift 4.5s ease-in-out 1.5s infinite;
    transition: opacity .2s ease, width .2s ease, height .2s ease;
  }
  /* What the fold uncovers: the card behind the poster. */
  .dog-ear::before,
  .dog-ear::after {
    content: "";
    position: absolute; inset: 0;
  }
  .dog-ear::before {
    background: var(--poster-card-bg);
    clip-path: polygon(100% 0, 100% 100%, 0 100%);
  }
  /* The back of the folded corner. */
  .dog-ear::after {
    border-top-left-radius: 5px;
    background: linear-gradient(135deg, #fffaf0 0%, #efe3c8 60%, #d9c49b 100%);
    clip-path: polygon(0 0, 100% 0, 0 100%);
  }
  @media (hover: hover) {
    .wrap:hover .dog-ear { animation: none; --ear: 40px; }
  }
  /* Out of the way while the page turns. */
  .wrap.turning .dog-ear { opacity: 0; transition-duration: .1s; }
  @keyframes ear-lift {
    0%, 62%, 100% { width: var(--ear); height: var(--ear); }
    74% { width: calc(var(--ear) * 1.6); height: calc(var(--ear) * 1.6); }
    84% { width: calc(var(--ear) * 1.2); height: calc(var(--ear) * 1.2); }
    92% { width: calc(var(--ear) * 1.35); height: calc(var(--ear) * 1.35); }
  }

  @media (max-width: 650px) {
    .audio,
    .share { top: 8px; right: 8px; width: 36px; height: 36px; }
    .share { right: 52px; }
    .audio svg,
    .share svg { width: 16px; height: 16px; }
    .dog-ear { --ear: 24px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .audio svg,
    .share svg { transition: none; }
    .dog-ear { animation: none; }
    .copy-note { animation-name: copy-note-fade; }
    @keyframes copy-note-fade { 0%, 78% { opacity: 1; } 100% { opacity: 0; } }
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

/**
 * The image at `src` as a JPEG file to share, named after it:
 * "Daily Grace - October 3, 2026 - Comic.jpg".
 */
async function shareFile(src) {
  const response = await fetch(src);
  if (!response.ok) throw new Error(`Unable to load ${src} (${response.status})`);
  const bitmap = await createImageBitmap(await response.blob());
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext('2d');
  // JPEG has no transparency; anything see-through would turn black.
  context.fillStyle = '#fff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('Unable to encode the image'))), SHARE_TYPE, SHARE_QUALITY);
  });
  const name = decodeURIComponent(new URL(src).pathname.split('/').pop()).replace(/\.[^.]+$/, '');
  return new File([blob], `Daily Grace - ${name}.jpg`, { type: SHARE_TYPE });
}

export class PosterCard extends HTMLElement {
  static observedAttributes = ['media-base', 'date'];

  #root;
  #toggleButton;
  #face;
  #poster;
  #video;
  #audioButton;
  #shareButton;
  // The images on show today as files to share, by src: { promise, file }.
  #shareFiles = new Map();
  #sharing = false;
  #wrap;
  #status;
  #hold = null;
  #pressed = false;
  // The hold ends with the finger lifting, and the click that follows would
  // otherwise turn the poster.
  #swallowClick = false;
  // A copy the browser refused outside a gesture, retried when the finger lifts.
  #pendingCopy = null;
  #posterPath = '';
  #dateName = '';
  #dateTimer = 0;
  #audioUrl = '';
  #videoUrl = '';
  #visible = false;
  #viewObserver = null;
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
          <!-- The posters' usual size, so the card holds its space while one
               loads instead of pushing the page down when it lands. -->
          <span class="face">
            <img class="poster" alt="" width="941" height="1672" />
            <video class="video" width="941" height="1672" muted loop playsinline preload="auto"
              disablepictureinpicture disableremoteplayback aria-hidden="true" tabindex="-1"></video>
          </span>
        </button>
        <span class="dog-ear" aria-hidden="true"></span>
        <button class="audio" type="button" aria-pressed="false"></button>
        <button class="share" type="button">${SHARE_ICON}</button>
      </div>
      <p class="visually-hidden" role="status" aria-atomic="true"></p>`;
    this.#wrap = this.#root.querySelector('.wrap');
    this.#status = this.#root.querySelector('[role="status"]');
    this.#toggleButton = this.#root.querySelector('.toggle');
    this.#face = this.#root.querySelector('.face');
    this.#poster = this.#root.querySelector('.poster');
    this.#video = this.#root.querySelector('.video');
    this.#audioButton = this.#root.querySelector('.audio');
    this.#shareButton = this.#root.querySelector('.share');

    this.#toggleButton.addEventListener('click', (event) => {
      if (this.#swallowClick) {
        this.#swallowClick = false;
        event.preventDefault();
        return;
      }
      this.toggle();
    });
    this.#poster.draggable = false;
    // The video shows only once it is playing the day on show; until then,
    // and when it fails, the poster image beneath stands in.
    this.#video.muted = true;
    this.#video.addEventListener('playing', () => {
      if (this.#video.getAttribute('src') === this.#videoUrl) this.#video.classList.add('playing');
    });
    this.#video.addEventListener('error', () => this.#video.classList.remove('playing'));
    this.#listenForHold();
    this.#audioButton.addEventListener('click', () => {
      if (this.playing) this.stop();
      else this.play();
    });
    this.#shareButton.addEventListener('click', () => this.share());
    // Make the file while the reader looks, so a tap can share it at once.
    this.#poster.addEventListener('load', () => {
      const src = this.#poster.src;
      const idle = window.requestIdleCallback ?? ((callback) => setTimeout(callback, 200));
      idle(() => {
        if (this.#poster.src === src) this.#shareFileFor(src);
      });
    });
    this.#syncLabels();
    this.#syncAudioButton();
  }

  connectedCallback() {
    this.#scheduleConfigure();
    this.#dateTimer = setInterval(this.#checkDate, DATE_CHECK_INTERVAL);
    document.addEventListener('visibilitychange', this.#checkDate);
    document.addEventListener('visibilitychange', this.#syncVideo);
    this.#viewObserver = new IntersectionObserver(([entry]) => {
      this.#visible = entry.isIntersecting;
      this.#syncVideo();
    });
    this.#viewObserver.observe(this.#wrap);
  }

  disconnectedCallback() {
    this.stop();
    clearInterval(this.#dateTimer);
    document.removeEventListener('visibilitychange', this.#checkDate);
    document.removeEventListener('visibilitychange', this.#syncVideo);
    this.#viewObserver?.disconnect();
    this.#viewObserver = null;
    this.#video.pause();
  }

  // The day's video loops over the poster while the card is on screen and the
  // poster, not the comic, is up; not at all when the reader asks for less
  // motion or to save data. It is first fetched when it first plays. A day
  // without one fails once and is left alone, the poster image showing.
  #syncVideo = () => {
    const video = this.#video;
    const play = this.#visible && !document.hidden && !this.#comic && this.#videoUrl
      && !this.#reducedMotion.matches && !navigator.connection?.saveData;
    if (!play) {
      video.pause();
      return;
    }
    if (video.getAttribute('src') !== this.#videoUrl) video.src = this.#videoUrl;
    else if (video.error) return;
    video.play().catch(() => {});
  };

  // Past midnight in Manila, today's poster gives way to the new day's. A
  // fixed `date` stays put, and narration playing at midnight finishes first.
  // Background tabs throttle the timer, so coming back into view checks too.
  #checkDate = () => {
    if (document.hidden || this.hasAttribute('date') || this.playing) return;
    if (dateParts(null).dateName !== this.#dateName) this.#scheduleConfigure();
  };

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) this.#scheduleConfigure();
  }

  #listenForHold() {
    const toggle = this.#toggleButton;
    toggle.addEventListener('pointerdown', (event) => {
      this.#swallowClick = false;
      this.#pendingCopy = null;
      if (!event.isPrimary || event.button !== 0) return;
      this.#pressed = true;
      this.#cancelHold();
      this.#wrap.classList.add('holding');
      this.#hold = {
        x: event.clientX,
        y: event.clientY,
        timer: setTimeout(() => this.#completeHold(), HOLD_MS),
      };
    });
    toggle.addEventListener('pointermove', (event) => {
      const hold = this.#hold;
      if (hold && Math.hypot(event.clientX - hold.x, event.clientY - hold.y) > HOLD_SLOP) {
        this.#cancelHold();
      }
    });
    toggle.addEventListener('pointerup', () => {
      this.#pressed = false;
      this.#cancelHold();
      // Lifting the finger is a fresh gesture, which a strict browser needs.
      const url = this.#pendingCopy;
      this.#pendingCopy = null;
      if (url) this.#copy(url).then((copied) => this.#showCopyNote(copied, url));
    });
    for (const type of ['pointercancel', 'pointerleave']) {
      toggle.addEventListener(type, () => {
        this.#pressed = false;
        this.#cancelHold();
      });
    }
    // Enter and Space still turn the poster after a hold that never clicked.
    toggle.addEventListener('keydown', () => { this.#swallowClick = false; });
    // A long press would otherwise open the phone's image menu.
    toggle.addEventListener('contextmenu', (event) => {
      if (this.#hold || this.#swallowClick) event.preventDefault();
    });
  }

  #cancelHold() {
    if (!this.#hold) return;
    clearTimeout(this.#hold.timer);
    this.#hold = null;
    this.#wrap.classList.remove('holding');
  }

  async #completeHold() {
    this.#hold = null;
    this.#wrap.classList.remove('holding');
    this.#swallowClick = true;
    navigator.vibrate?.(15);
    const url = this.imageUrl;
    if (await this.#copy(url)) {
      this.#showCopyNote(true, url);
    } else if (this.#pressed) {
      // Safari only allows clipboard writes inside a gesture; try again on release.
      this.#pendingCopy = url;
    } else {
      this.#showCopyNote(false, url);
    }
  }

  async #copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // No Clipboard API (an insecure origin) or the write was refused: fall
      // back to the old selection copy.
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
      document.body.append(field);
      field.select();
      let copied = false;
      try {
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      }
      field.remove();
      return copied;
    }
  }

  #showCopyNote(copied, url) {
    this.#showNote(COPY_NOTES[copied ? 'copied' : 'failed'], !copied);
    if (copied) {
      this.dispatchEvent(new CustomEvent('copy', { detail: { url, comic: this.#comic } }));
    }
  }

  /** A pill over the poster's foot that fades out, read out by screen readers too. */
  #showNote(text, failed = false) {
    this.#wrap.querySelector('.copy-note')?.remove();
    const note = document.createElement('span');
    note.className = `copy-note${failed ? ' failed' : ''}`;
    note.setAttribute('aria-hidden', 'true');
    note.textContent = text;
    note.addEventListener('animationend', () => note.remove(), { once: true });
    this.#wrap.append(note);
    this.#status.textContent = `${text}.`;
  }

  /** The image at `src` as a file to share, made once and kept for the day. */
  #shareFileFor(src) {
    if (!CAN_SHARE_FILES || !src) return Promise.resolve(null);
    let entry = this.#shareFiles.get(src);
    if (!entry) {
      entry = { file: null, promise: null };
      entry.promise = shareFile(src).then(
        (file) => (entry.file = file),
        (error) => {
          // A blip loading the image should not stop a later tap from trying again.
          console.warn('The poster could not be prepared for sharing:', error);
          this.#shareFiles.delete(src);
          return null;
        },
      );
      this.#shareFiles.set(src, entry);
    }
    return entry.promise;
  }

  /**
   * Share the image on show through the phone's share sheet: as a picture
   * where the browser can share files, as its link where it can only share
   * links, and by copying the link where it has no share sheet at all.
   */
  async share() {
    if (this.#sharing) return;
    const url = this.imageUrl;
    const comic = this.#comic;
    const title = `Daily Grace${comic ? ' comic' : ''} for ${this.#dateName}`;
    const text = `${title} · ${SITE_URL}`;
    const done = (as) => this.dispatchEvent(new CustomEvent('share', { detail: { url, comic, as } }));

    if (!navigator.share) {
      this.#showCopyNote(await this.#copy(url), url);
      return;
    }

    this.#sharing = true;
    // Ready already, the file goes straight to share() inside the tap; still
    // being made, the wait may cost Safari's permission (see the catch).
    let file = this.#shareFiles.get(url)?.file;
    try {
      file ??= await this.#shareFileFor(url);
      if (file && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title, text });
        done('image');
      } else {
        await navigator.share({ title, text, url });
        done('link');
      }
    } catch (error) {
      // The reader closed the share sheet without choosing anything.
      if (error.name === 'AbortError') return;
      if (error.name === 'NotAllowedError' && file) {
        this.#showNote(SHARE_RETRY_NOTE);
        return;
      }
      console.warn('The poster could not be shared:', error);
      this.#showCopyNote(await this.#copy(url), url);
    } finally {
      this.#sharing = false;
    }
  }

  /** Link to the image on show: the poster, or the comic once turned. */
  get imageUrl() {
    return this.#poster.src;
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
    this.#dateName = dateName;
    this.#posterPath = `${this.#mediaBase}images/sources/${year}/${month}/${dateName}`;
    this.#audioUrl = `${this.#mediaBase}audio/${year}/${monthFolder}/webm/${dateName}.webm`;
    this.#videoUrl = `${this.#posterPath}.mp4`;

    this.stop();
    this.#audio = null;
    this.#shareFiles.clear();
    this.#flipId++;
    this.#face.getAnimations().forEach((animation) => animation.cancel());
    this.#wrap.classList.remove('turning');
    this.#comic = false;
    this.#poster.src = `${this.#posterPath}.webp`;
    this.#video.classList.remove('playing');
    this.#video.hidden = false;
    this.#syncVideo();
    this.#syncLabels();
  }

  #syncLabels() {
    const label = this.#comic ? 'Show the regular poster' : 'Show the comic version of this poster';
    this.#toggleButton.setAttribute('aria-label', label);
    this.#toggleButton.title = label;
    const shareLabel = this.#comic ? 'Share this comic' : 'Share this poster';
    this.#shareButton.setAttribute('aria-label', shareLabel);
    this.#shareButton.title = shareLabel;
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
    const face = this.#face;
    // Start loading now so the swap does not show a half-loaded image.
    const preload = new Image();
    preload.src = nextSrc;
    const ready = preload.decode().catch(() => {});

    if (this.#reducedMotion.matches || !face.animate) {
      await ready;
      if (flipId === this.#flipId) this.#showSide(nextSrc);
      return;
    }

    face.getAnimations().forEach((animation) => animation.cancel());
    this.#wrap.classList.add('turning');
    const turn = (angle) => `perspective(1400px) rotateY(${angle}deg)`;
    const out = face.animate(
      [
        { transform: turn(0), opacity: 1 },
        { transform: turn(-90), opacity: 0.55 },
      ],
      { duration: 240, easing: 'ease-in', fill: 'forwards' },
    );
    await Promise.all([out.finished.catch(() => {}), ready]);
    // A newer toggle owns the image now; it has already cancelled this flip.
    if (flipId !== this.#flipId) return;

    this.#showSide(nextSrc);
    const back = face.animate(
      [
        { transform: turn(90), opacity: 0.55 },
        { transform: turn(0), opacity: 1 },
      ],
      { duration: 300, easing: 'ease-out' },
    );
    out.cancel();
    await back.finished.catch(() => {});
    if (flipId === this.#flipId) this.#wrap.classList.remove('turning');
  }

  // The swap at the middle of a turn: the comic has no video, so it goes with
  // the poster and comes back with it, carrying on where it left off.
  #showSide(src) {
    this.#poster.src = src;
    this.#video.hidden = this.#comic;
    this.#syncVideo();
  }
}

if (!customElements.get('poster-card')) {
  customElements.define('poster-card', PosterCard);
}
