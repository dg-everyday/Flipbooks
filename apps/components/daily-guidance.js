/**
 * <daily-guidance> — today's question from Questions We All Ask on a navy card, as a web component.
 *
 * Shows the Daily Grace emblem, the "Today's Guiding Question" heading and one
 * topic from guidance-for-life.json: its question, a short answer, one verse,
 * one thing to try, and a link that opens the topic on the Questions We All Ask
 * page. A round button in the top-right corner plays or pauses the topic's
 * narration, <audio-base><id>.webm; the file is only requested when the button
 * is first pressed, and a new topic stops it. The button beside it opens the
 * topic as a PDF in a new tab, made on the reader's device by
 * assets/scripts/bookmarks-pdf.js, which loads on the first press (as on the
 * Questions We All Ask page). Its Bible references are pills
 * that open the passage (scripture-refs.js). A different topic is picked at
 * random each time the page is opened, and again when the browser brings the
 * page back from its back/forward cache.
 * The last topic shown is remembered in localStorage (when it is available) so
 * the same one never comes up twice in a row.
 *
 * Holding the card for half a second bookmarks its topic: a gold glow spreads
 * from the finger and the card takes a ribbon. Holding it again removes the
 * bookmark. Up to 50 topic ids are kept in localStorage, newest first (see
 * card-bookmarks.js), shared with the tiles on the Questions We All Ask page.
 * With the bookmarks attribute the component shows the bookmarked topics as a
 * list instead of the card, which is how the page's bookmarks popup uses it.
 *
 * Usage
 *   <daily-guidance></daily-guidance>
 *   <script type="module" src="./apps/components/daily-guidance.js"></script>
 *
 * Attributes
 *   guidance-src   guidance-for-life.json, resolved against the page.
 *                  Default: assets/guidance-for-life.json
 *   page-href      the Questions We All Ask page; the topic's id is added as the
 *                  hash. Default: apps/pages/guidance-for-life.html
 *   audio-base     where the narrations are; the topic's id and .webm are added.
 *                  Default: https://dailygrace.faith/media/audio/questions-we-all-ask/
 *   bookmarks      Present: no card; show the bookmarked topics, newest first.
 *                  Call showBookmarks() to bring the list up to date.
 *
 * Properties   topic (read-only)  the topic shown, or null until it loads
 *              bookmarks (read-only)  the bookmarked topic ids, newest first
 *              playing (read-only)  whether the narration is playing
 * Methods      next()  show another topic at random
 *              play(), pause()  control the narration
 *              showBookmarks()  show the bookmarked topics, newest first
 *              bookmarkedItems()  resolves to the bookmarked topics themselves,
 *                                 newest first, fetching the file if need be
 * Events       ready   a topic is shown, detail: { id }
 *              bookmarkchange  a hold added or removed a bookmark,
 *                              detail: { id, result: 'added' | 'removed' }
 *              error   detail: { message }
 *
 * Fonts: Germania One (title) and Strait (text) are registered on the
 * document by assets/scripts/fonts.js, because browsers do not reliably load
 * @font-face rules declared inside a shadow root.
 *
 * CSS custom properties
 *   --guidance-navy, --guidance-navy-2, --guidance-gold, --guidance-cream
 * These fall back to --navy, --navy-2, --gold-light and --cream from the page.
 */

import { registerFonts } from '../../assets/scripts/fonts.js';
// The same ?v= token as the other components' imports, so the page loads one
// copy of the module and every list hears every bookmark change.
import {
  BOOKMARK_STYLES, CardHold, bookmarkNote, bookmarkStore, showBookmarkResult,
} from './card-bookmarks.js?v=20260927-1';
import { PILL_STYLES, linkScripture, refPill } from './scripture-refs.js?v=20261002-1';

const DEFAULT_SRC = 'assets/guidance-for-life.json';
const DEFAULT_PAGE = 'apps/pages/guidance-for-life.html';
const DEFAULT_AUDIO_BASE = 'https://dailygrace.faith/media/audio/questions-we-all-ask/';
// The id of the topic shown last, so the next visit shows a different one.
const LAST_KEY = 'dailygrace:guidance:last';

const asset = (path) => new URL(path, import.meta.url).href;

const EMBLEM_URL = asset('../../assets/images/dg-icon-02-flat-256.webp');

// Line-art icons, matching the play button on the poster (poster-card.js).
const ICON_ATTRS = 'viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const PLAY_ICON = `<svg ${ICON_ATTRS}><polygon points="6 4 19 12 6 20"/></svg>`;
const PAUSE_ICON = `<svg ${ICON_ATTRS}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`;
const PDF_ICON = `<svg ${ICON_ATTRS}><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>`;
// The same URL as script.js's bookmarks PDF, so the page loads the module once.
const PDF_MODULE = asset('../../assets/scripts/bookmarks-pdf.js?v=20261002-5');

/**
 * A new tab for a PDF, opened at once, inside the press: browsers block a tab
 * opened later, once the PDF is ready. It says what is coming until the PDF
 * replaces it. As the bookmarks PDF does (script.js).
 */
function openPdfTab(title) {
  const tab = window.open('', '_blank');
  if (!tab) return null;
  try {
    tab.document.title = title;
    tab.document.body.style.cssText =
      'margin:0;display:grid;place-items:center;min-height:100vh;'
      + 'background:#f3e7d2;color:#001b34;font:600 1.1rem/1.4 system-ui,sans-serif';
    tab.document.body.textContent = 'Preparing your PDF…';
  } catch {
    // Some browsers keep the new tab to themselves; it still loads the PDF.
  }
  return tab;
}

// Shared with the Questions We All Ask page (guidance-for-life.js), which uses the same key.
const bookmarks = bookmarkStore('dailygrace:bookmarks:guidance',
  { isId: (id) => typeof id === 'string' && id !== '', limit: 50 });

// The guidance file is shared by every instance, so the card and the bookmarks
// popup fetch it once between them.
const guidanceCache = new Map();

function readGuidance(url) {
  if (!guidanceCache.has(url)) {
    const request = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${url} (${response.status})`);
        return response.json();
      })
      .then((data) => {
        const topics = Array.isArray(data?.topics) ? data.topics : [];
        if (!topics.length) throw new Error(`No guidance topics in ${url}`);
        return topics;
      })
      .catch((error) => {
        guidanceCache.delete(url);
        throw error;
      });
    guidanceCache.set(url, request);
  }
  return guidanceCache.get(url);
}

const STYLES = /* css */ `
  :host {
    --guidance-navy: var(--navy, #001b34);
    --guidance-navy-2: var(--navy-2, #062944);
    --guidance-gold: var(--gold-light, #e1b65d);
    --guidance-cream: var(--cream, #f3e7d2);

    display: block;
    padding-inline: 10px;
  }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }

  article.card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 38px 30px 32px;
    border: 1px solid rgb(225 182 93 / 40%);
    border-radius: 18px;
    background:
      radial-gradient(120% 80% at 50% 0%, rgb(225 182 93 / 16%) 0%, transparent 60%),
      linear-gradient(180deg, var(--guidance-navy-2) 0%, var(--guidance-navy) 100%);
    color: var(--guidance-cream);
    box-shadow: 0 12px 30px rgb(0 27 52 / 28%), inset 0 1px 0 rgb(255 255 255 / 8%);
    text-align: center;
  }
  /* A gold star in the top-left and bottom-right corners. They are elements
     of their own: the card's ::before and ::after hold the bookmark glow and
     ribbon (card-bookmarks.js). */
  .star {
    position: absolute;
    color: var(--guidance-gold);
    font-size: 1rem;
    line-height: 1;
    opacity: .8;
    pointer-events: none;
  }
  .star.top { top: 11px; left: 16px; }
  .star.bottom { right: 16px; bottom: 11px; }
  /* A navy glow would not show on the navy card; removing glows cream. The
     ribbon is gold, set in from the rounded corner. */
  article.card.bookmarked { --glow: 243 231 210; }
  article.card.bookmarked::after { right: 120px; background: var(--guidance-gold); }

  /* Plays the topic's narration, and opens it as a PDF: the red round button
     of the poster's narration (poster-card.js), from the page's shared
     --action colours. */
  .audio, .pdf {
    position: absolute; top: 16px; right: 16px; z-index: 2;
    display: grid; place-items: center;
    width: 42px; height: 42px; padding: 0;
    border: 0; border-radius: 50%;
    background: var(--action, #c62828); color: var(--action-ink, #fff);
    box-shadow: var(--action-shadow, 0 5px 14px rgb(0 0 0 / 35%));
    cursor: pointer;
    transition: background-color .15s ease;
  }
  .pdf { right: 68px; }
  .audio svg, .pdf svg {
    display: block; width: 18px; height: 18px;
    transition: transform .2s ease;
  }
  .audio:hover, .pdf:hover,
  .audio[aria-pressed="true"] { background: var(--action-hover, #a91f1f); }
  .audio:hover svg, .pdf:hover svg { transform: scale(1.08); }
  .audio:focus-visible, .pdf:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
  /* While the PDF is being made. */
  .pdf:disabled { cursor: progress; opacity: .7; }
  .pdf:disabled svg { animation: pdf-wait 1s ease-in-out infinite; }
  @keyframes pdf-wait { 50% { transform: translateY(2px); } }

  .emblem {
    display: grid;
    place-items: center;
    width: 78px;
    height: 78px;
    margin: 0 auto 22px;
    border-radius: 50%;
    background: var(--guidance-navy);
    box-shadow: 0 0 0 2px var(--guidance-gold), 0 0 0 8px rgb(225 182 93 / 16%), 0 8px 20px rgb(0 0 0 / 35%);
  }
  .emblem img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .title {
    margin: 0 0 22px;
    color: #fff;
    font: 400 clamp(1.5rem, 1.3rem + .9vw, 1.875rem)/1.2 'Germania One', Georgia, serif;
    letter-spacing: .02em;
  }
  /* Short gold rule under the title. */
  .title::after {
    content: "";
    display: block;
    width: 56px;
    height: 2px;
    margin: 14px auto 0;
    border-radius: 2px;
    background: linear-gradient(90deg, transparent, var(--guidance-gold), transparent);
  }
  p { margin: 0; max-width: 34em; text-wrap: pretty; }

  .section {
    margin-bottom: 6px;
    color: var(--guidance-gold);
    font: 700 .78rem/1.3 'Strait', 'Roboto', sans-serif;
    letter-spacing: .12em;
    text-transform: uppercase;
  }
  .question {
    color: #fff;
    font: 400 clamp(1.3rem, 1.15rem + .6vw, 1.6rem)/1.25 'Strait', 'Roboto', sans-serif;
  }
  .summary {
    margin-top: 12px;
    font: 400 clamp(1.05rem, 1rem + .3vw, 1.2rem)/1.45 'Strait', 'Roboto', sans-serif;
  }

  /* One verse from the topic, set as a quotation. */
  figure {
    max-width: 34em;
    margin: 20px 0 0;
    padding: 12px 18px;
    border-left: 3px solid var(--guidance-gold);
    border-radius: 0 10px 10px 0;
    background: rgb(255 255 255 / 6%);
    text-align: left;
  }
  blockquote {
    margin: 0;
    font: 400 clamp(1rem, .96rem + .25vw, 1.12rem)/1.45 'Strait', 'Roboto', sans-serif;
  }
  figcaption {
    margin-top: 6px;
    color: var(--guidance-gold);
    font: 700 .76rem/1.3 'Strait', 'Roboto', sans-serif;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .practice {
    width: min(420px, 92%);
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid rgb(225 182 93 / 35%);
    color: var(--guidance-gold);
    font: 400 clamp(1.0625rem, 1rem + .3vw, 1.1875rem)/1.4 Georgia, 'Times New Roman', serif;
  }
  .practice b { font-weight: 400; color: #fff; }

  .more {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    margin-top: 22px;
    padding: 8px 20px;
    border-radius: 999px;
    background: var(--guidance-gold);
    color: var(--guidance-navy);
    font: 700 1rem/1.2 'Strait', 'Roboto', sans-serif;
    text-decoration: none;
    transition: background-color .15s ease, transform .15s ease;
  }
  .more:hover { background: #f0c66c; transform: translateY(-1px); }
  .more:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
  [hidden] { display: none !important; }

  /* A list of bookmarks, in the popup: a header and cards in place of the card. */
  .saved { display: none; }
  :host([bookmarks]) { padding-inline: 0; }
  :host([bookmarks]) .card { display: none; }
  :host([bookmarks]) .saved { display: grid; gap: 10px; }
  .bookmarks-header {
    padding: 18px;
    border: 1px solid rgb(0 27 52 / 20%);
    border-radius: 8px;
    background: rgb(255 255 255 / 24%);
  }
  .bookmarks-title {
    margin: 0;
    color: var(--guidance-navy);
    font: 400 1.375rem/1.3 'Strait', 'Roboto', sans-serif;
  }
  .bookmarks-summary {
    margin: 8px 0 0;
    max-width: none;
    color: #10253b;
    font: 400 1.125rem/1.45 'Strait', 'Roboto', sans-serif;
  }
  .list { display: grid; gap: 6px; }
  .message {
    margin: 0; padding: 16px; color: #4f5c65;
    font: 1rem/1.5 'Roboto', Arial, sans-serif;
  }
  .topic {
    padding: 18px 20px;
    border: 1px solid rgb(0 27 52 / 16%);
    border-left: 4px solid #c6922e;
    border-radius: 6px;
    background: rgb(255 255 255 / 16%);
    color: #10253b;
  }
  .topic p { max-width: none; }
  .topic-section {
    margin-bottom: 4px;
    color: #805b18;
    font: 700 .75rem/1.3 'Strait', 'Roboto', sans-serif;
    letter-spacing: .12em;
    text-transform: uppercase;
  }
  .topic-name {
    margin: 0 0 4px;
    color: var(--guidance-navy);
    font: 400 clamp(1.25rem, 1.1rem + .6vw, 1.5rem)/1.2 'Germania One', Georgia, serif;
  }
  .topic-question {
    margin-bottom: 8px;
    color: var(--guidance-navy);
    font: 400 clamp(1.0625rem, 1rem + .3vw, 1.1875rem)/1.35 'Strait', 'Roboto', sans-serif;
  }
  .topic-summary,
  .topic-practice {
    font: 400 clamp(1rem, .95rem + .3vw, 1.125rem)/1.5 'Strait', 'Roboto', sans-serif;
  }
  .topic-practice { margin-top: 8px; color: #805b18; }
  .topic-practice b { color: var(--guidance-navy); }
  .topic-link {
    display: inline-block;
    margin-top: 10px;
    color: #c62828;
    font: 400 1rem/1.4 'Strait', 'Roboto', sans-serif;
    text-decoration: underline;
    text-decoration-color: rgb(198 40 40 / 35%);
    text-underline-offset: 3px;
  }
  .topic-link:hover { text-decoration-color: currentColor; }
  .topic-link:focus-visible { outline: 2px solid #c62828; outline-offset: 3px; border-radius: 3px; }
  .visually-hidden {
    position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  @media (max-width: 650px) {
    article.card { padding: 27px 23px; }
    .audio, .pdf { top: 12px; right: 12px; width: 38px; height: 38px; }
    .pdf { right: 58px; }
    .audio svg, .pdf svg { width: 16px; height: 16px; }
    article.card.bookmarked::after { right: 106px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .more, .audio, .audio svg, .pdf, .pdf svg { transition: none; }
    .more:hover, .audio:hover svg, .pdf:hover svg { transform: none; }
    .pdf:disabled svg { animation: none; }
  }
${BOOKMARK_STYLES}
${PILL_STYLES}`;

/** localStorage, which can be missing or throw (private windows, blocked storage). */
function remember(id) {
  try { localStorage.setItem(LAST_KEY, id); } catch { /* the pick still works, it may just repeat */ }
}
function lastShown() {
  try { return localStorage.getItem(LAST_KEY); } catch { return null; }
}

/** A topic at random, never the one shown last when there is a choice. */
function pickTopic(topics, avoid) {
  const choices = topics.length > 1 ? topics.filter((t) => t.id !== avoid) : topics;
  return choices[Math.floor(Math.random() * choices.length)];
}

const tidy = (text) => (text ?? '').replace(/\s+/g, ' ').trim();

export class DailyGuidance extends HTMLElement {
  static observedAttributes = ['guidance-src', 'page-href', 'audio-base'];

  #root;
  #els;
  #status;
  #topic = null;
  #topics = [];
  #loading = null;
  #hold;
  #listHold;
  #audio = null;
  // Coming back with the Back button can restore the page from the
  // back/forward cache without reloading it; show a new topic then too.
  #onPageShow = (event) => {
    if (event.persisted && !this.hasAttribute('bookmarks')) this.next();
  };

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <article class="card bookmarkable" aria-labelledby="title">
        <span class="star top" aria-hidden="true">✦</span>
        <span class="star bottom" aria-hidden="true">✦</span>
        <button class="pdf" type="button" title="Open as a PDF" hidden>${PDF_ICON}</button>
        <button class="audio" type="button" aria-pressed="false" hidden></button>
        <div class="emblem">
          <img src="${EMBLEM_URL}" alt="Daily Grace" width="78" height="78" />
        </div>
        <h3 class="title" id="title">Today's Guiding Question</h3>
        <p class="section" hidden></p>
        <p class="question" aria-live="polite">Loading today's question…</p>
        <p class="summary" hidden></p>
        <figure hidden><blockquote></blockquote><figcaption></figcaption></figure>
        <p class="practice" hidden><b>Try this:</b> <span></span></p>
        <a class="more" hidden>Read the full answer <span aria-hidden="true">→</span></a>
      </article>
      <section class="saved" aria-label="Bookmarked questions">
        <header class="bookmarks-header" hidden>
          <h3 class="bookmarks-title">Bookmarked questions</h3>
          <p class="bookmarks-summary"></p>
        </header>
        <div class="list"><p class="message">Loading your questions…</p></div>
      </section>
      <p class="visually-hidden" role="status" aria-atomic="true"></p>`;
    const $ = (selector) => this.#root.querySelector(selector);
    this.#els = {
      section: $('.section'), question: $('.question'), summary: $('.summary'),
      figure: $('figure'), verse: $('blockquote'), reference: $('figcaption'),
      practice: $('.practice'), practiceText: $('.practice span'), more: $('.more'),
      audio: $('.audio'), pdf: $('.pdf'),
      card: $('.card'), header: $('.bookmarks-header'), summaryLine: $('.bookmarks-summary'),
      list: $('.list'),
    };
    this.#status = $('[role="status"]');
    this.#els.audio.addEventListener('click', () => {
      if (this.playing) this.pause();
      else this.play();
    });
    this.#syncAudioButton();
    this.#els.pdf.addEventListener('click', () => this.#openPdf());

    // Holding the card bookmarks today's topic; holding a topic in the list
    // takes its bookmark off (and puts it back). The links and the play
    // button are not held.
    this.#hold = new CardHold(this.#els.card, {
      selector: '.card',
      exclude: 'a, button',
      onHold: (card) => { if (this.#topic) this.#toggle(this.#topic, card); },
    });
    this.#listHold = new CardHold(this.#els.list, {
      selector: '.topic',
      exclude: 'a, button',
      onHold: (card) => {
        const topic = this.#topics.find((t) => t.id === card.dataset.id);
        if (topic) this.#toggle(topic, card);
      },
    });
  }

  connectedCallback() {
    registerFonts();
    addEventListener('pageshow', this.#onPageShow);
    bookmarks.addEventListener('change', this.#syncBookmarks);
    this.#syncBookmarks();
    // A bookmarks list waits for showBookmarks() to ask for the file.
    if (!this.#loading && !this.hasAttribute('bookmarks')) this.#load();
  }

  disconnectedCallback() {
    removeEventListener('pageshow', this.#onPageShow);
    bookmarks.removeEventListener('change', this.#syncBookmarks);
    this.#hold.cancel();
    this.#listHold.cancel();
    this.#stopAudio();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.isConnected) return;
    // A new audio base only changes where the next play reads from.
    if (name === 'audio-base') this.#stopAudio();
    else this.#load();
  }

  get topic() {
    return this.#topic;
  }

  get playing() {
    return Boolean(this.#audio) && !this.#audio.paused;
  }

  /** Play the topic's narration, from where it was paused. */
  play() {
    if (!this.#topic) return;
    if (!this.#audio) {
      const audio = new Audio(this.#audioUrl(this.#topic.id));
      const sync = () => { if (audio === this.#audio) this.#syncAudioButton(); };
      audio.addEventListener('play', sync);
      audio.addEventListener('pause', sync);
      audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        sync();
      });
      audio.addEventListener('error', () => {
        if (audio !== this.#audio) return;
        this.#audio = null; // the next press tries again
        this.#syncAudioButton();
        this.#status.textContent = 'The narration could not be played. Please try again later.';
      });
      this.#audio = audio;
    }
    this.#audio.play().catch((error) => {
      if (error.name !== 'AbortError') console.warn("Today's guiding question could not be played:", error);
    });
  }

  pause() {
    this.#audio?.pause();
  }

  /** The bookmarked topic ids, newest first. */
  get bookmarks() {
    return bookmarks.read();
  }

  /** The bookmarked topics, newest first, as they are in the guidance file. */
  async bookmarkedItems() {
    const topics = await readGuidance(this.#src);
    const byId = new Map(topics.map((topic) => [topic.id, topic]));
    return bookmarks.read().map((id) => byId.get(id)).filter(Boolean);
  }

  /** Show another topic at random. */
  next() {
    if (!this.#topics.length) return;
    this.#show(pickTopic(this.#topics, this.#topic?.id ?? lastShown()));
    this.dispatchEvent(new CustomEvent('ready', { detail: { id: this.#topic.id } }));
  }

  /**
   * Show the bookmarked topics, newest first. A topic taken off here keeps its
   * card, without the ribbon, so holding it again puts the bookmark back.
   */
  showBookmarks() {
    if (!this.#topics.length) {
      // Loaded on first use; the bookmarks show once the topics arrive.
      if (!this.#loading) this.#load();
      return;
    }
    const els = this.#els;
    const topics = bookmarks.read()
      .map((id) => this.#topics.find((topic) => topic.id === id))
      .filter(Boolean);
    els.header.hidden = !topics.length;
    if (!topics.length) {
      const message = document.createElement('p');
      message.className = 'message';
      message.textContent = 'No bookmarked questions yet. Hold “Today’s Guiding Question”, '
        + 'or a question on the Questions We All Ask page, for half a second to bookmark it.';
      els.list.replaceChildren(message);
      this.#status.textContent = message.textContent;
      return;
    }
    els.summaryLine.textContent = this.#bookmarksSummary();
    els.list.replaceChildren(...topics.map((topic) => this.#createTopic(topic)));
    this.#status.textContent = `Bookmarked questions. ${this.#bookmarksSummary()}`;
  }

  get #src() {
    return new URL(this.getAttribute('guidance-src') || DEFAULT_SRC, document.baseURI).href;
  }

  #audioUrl(id) {
    const base = new URL(this.getAttribute('audio-base') || DEFAULT_AUDIO_BASE, document.baseURI);
    return new URL(`${encodeURIComponent(id)}.webm`, base).href;
  }

  /** Stop the narration and let it go, so the next play starts afresh. */
  #stopAudio() {
    const audio = this.#audio;
    if (!audio) return;
    this.#audio = null;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    this.#syncAudioButton();
  }

  /** Today's topic as a PDF, in a new tab (or downloaded, if the tab is blocked). */
  async #openPdf() {
    const topic = this.#topic;
    const button = this.#els.pdf;
    if (!topic || button.disabled) return;
    const tab = openPdfTab(`${topic.name} — Questions We All Ask — Daily Grace`);
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    this.#status.textContent = `Making the PDF of ${topic.name}…`;
    try {
      const { makeGuidancePdf } = await import(PDF_MODULE);
      const { blob, filename } = await makeGuidancePdf(topic);
      const url = URL.createObjectURL(blob);
      // Kept long enough for the tab to load it, and to reload it for a while.
      setTimeout(() => URL.revokeObjectURL(url), 10 * 60 * 1000);
      if (tab && !tab.closed) {
        tab.location.href = url;
        this.#status.textContent = `${topic.name}: the PDF has opened in a new tab.`;
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        this.#root.append(link);
        link.click();
        link.remove();
        this.#status.textContent = `${topic.name}: your browser blocked the new tab, so the PDF was downloaded instead.`;
      }
    } catch (error) {
      tab?.close();
      console.warn("Today's question could not be made into a PDF:", error);
      this.#status.textContent = 'The PDF could not be made. Please check your connection and try again.';
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  }

  #syncAudioButton() {
    const button = this.#els.audio;
    const playing = this.playing;
    const label = playing ? 'Pause the narration' : 'Play the narration';
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', label);
    button.title = label;
    button.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
  }

  #pageHref(id) {
    const page = new URL(this.getAttribute('page-href') || DEFAULT_PAGE, document.baseURI);
    page.hash = id;
    return page.href;
  }

  #bookmarksSummary() {
    return `${bookmarks.read().length} of ${bookmarks.limit} saved questions, newest first. `
      + 'Hold a question to remove its bookmark.';
  }

  #toggle(topic, card) {
    const result = bookmarks.toggle(topic.id);
    showBookmarkResult(card, result, bookmarks.limit);
    this.#status.textContent = `${topic.name}: ${bookmarkNote(result, bookmarks.limit)}`;
    if (result === 'added' || result === 'removed') {
      this.dispatchEvent(new CustomEvent('bookmarkchange', { detail: { id: topic.id, result } }));
    }
  }

  #syncBookmarks = () => {
    const els = this.#els;
    els.card.classList.toggle('bookmarked', Boolean(this.#topic && bookmarks.has(this.#topic.id)));
    for (const card of els.list.querySelectorAll('.topic')) {
      card.classList.toggle('bookmarked', bookmarks.has(card.dataset.id));
    }
    if (!els.header.hidden) els.summaryLine.textContent = this.#bookmarksSummary();
  };

  #createTopic(topic) {
    const line = (tag, className, text) => {
      const element = document.createElement(tag);
      if (className) element.className = className;
      element.textContent = text;
      return element;
    };
    const card = document.createElement('article');
    card.className = 'topic bookmarkable';
    card.dataset.id = topic.id;
    card.classList.toggle('bookmarked', bookmarks.has(topic.id));
    if (topic.section) card.append(line('p', 'topic-section', topic.section));
    card.append(line('h4', 'topic-name', topic.name));
    if (topic.question) card.append(line('p', 'topic-question', topic.question));
    if (topic.summary) card.append(line('p', 'topic-summary', tidy(topic.summary)));
    if (topic.practice) {
      const practice = line('p', 'topic-practice', ` ${tidy(topic.practice)}`);
      practice.prepend(line('b', '', 'Try this:'));
      card.append(practice);
    }
    linkScripture(card);
    const link = line('a', 'topic-link', 'Read the full answer →');
    link.href = this.#pageHref(topic.id);
    link.setAttribute('aria-label', `Read the full answer: ${topic.name}`);
    card.append(link);
    return card;
  }

  #load() {
    const loading = (this.#loading = readGuidance(this.#src)
      .then((topics) => {
        if (loading !== this.#loading) return; // superseded by a newer src
        this.#topics = topics;
        this.#topic = null;
        if (this.hasAttribute('bookmarks')) this.showBookmarks();
        else this.next();
      })
      .catch((error) => {
        if (loading !== this.#loading) return;
        console.warn("Today's question could not be loaded:", error);
        this.#loading = null;          // a bookmarks list can ask again
        this.#topic = null;
        this.#topics = [];
        this.#stopAudio();
        this.#els.audio.hidden = true;
        this.#els.pdf.hidden = true;
        this.#els.question.textContent = "Today's question is unavailable. Please try again later.";
        const message = document.createElement('p');
        message.className = 'message';
        message.textContent = 'Your bookmarked questions could not be loaded. Please try again.';
        this.#els.list.replaceChildren(message);
        this.dispatchEvent(new CustomEvent('error', { detail: { message: error.message } }));
      }));
  }

  #show(topic) {
    const els = this.#els;
    // The narration belongs to the topic it was started on.
    if (topic !== this.#topic) this.#stopAudio();
    this.#topic = topic;
    remember(topic.id);
    els.section.textContent = topic.section || '';
    els.section.hidden = !topic.section;
    els.question.textContent = topic.question || topic.name;
    els.summary.textContent = tidy(topic.summary);
    linkScripture(els.summary);
    els.summary.hidden = !topic.summary;
    // The first teaching leads each topic (Jesus' words, where he spoke to it).
    const teaching = topic.teachings?.[0];
    els.verse.textContent = tidy(teaching?.text);
    els.reference.replaceChildren(refPill(teaching?.reference || ''));
    els.figure.hidden = !teaching?.text;
    els.practiceText.textContent = tidy(topic.practice);
    linkScripture(els.practiceText);
    els.practice.hidden = !topic.practice;
    els.more.href = this.#pageHref(topic.id);
    els.more.setAttribute('aria-label', `Read the full answer: ${topic.name}`);
    els.more.hidden = false;
    els.audio.hidden = false;
    els.pdf.hidden = false;
    els.pdf.setAttribute('aria-label', `Open as a PDF in a new tab: ${topic.name}`);
    this.#syncBookmarks();
  }
}

if (!customElements.get('daily-guidance')) {
  customElements.define('daily-guidance', DailyGuidance);
}
