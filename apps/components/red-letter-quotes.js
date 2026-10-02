/**
 * <red-letter-quotes> — one of Jesus' best-known sayings on a red-letter card, as a web component.
 *
 * The card is the crimson, gilt-framed cover of a red-letter Bible. It
 * carries the Red-Lettered Quotes icon, the "Jesus' Spoken Words" heading and
 * the saying's theme, then tells the saying in order: where and when Jesus
 * said it, his words printed in red on a cream page (numbered when they run
 * over more than one verse, and set larger the shorter they are), the
 * reference, and one thing to carry into today. The saying's name is shown
 * only when it adds something, as in "The good Samaritan"; most names are
 * just the opening words of the quote. Links open the saying, and the whole
 * passage it belongs to, on the Red-Lettered Quotes page. Its Bible
 * references are pills that open the passage (scripture-refs.js). A red
 * round button beside the heading opens the saying in full as a PDF in a new
 * tab, made on the reader's device by assets/scripts/bookmarks-pdf.js, which
 * loads on the first press.
 * A different saying is picked at random each time the page is opened, and
 * again when the browser brings the page back from its back/forward cache.
 * The last saying shown is remembered in localStorage (when it is available)
 * so the same one never comes up twice in a row.
 *
 * Usage
 *   <red-letter-quotes></red-letter-quotes>
 *   <script type="module" src="./apps/components/red-letter-quotes.js"></script>
 *
 * Attributes
 *   quotes-src     red-letter-quotes.json, resolved against the page.
 *                  Default: assets/red-letter-quotes.json
 *   page-href      the Red-Lettered Quotes page; the saying's or passage's id
 *                  is added as the hash. Default: apps/pages/red-lettered-quotes.html
 *   theme          Only pick sayings from this theme, e.g. "I am" or
 *                  "From the cross". Unknown themes fall back to every saying.
 *
 * Properties   saying (read-only)  the saying shown, or null until it loads
 * Methods      next()  show another saying at random
 * Events       ready   a saying is shown, detail: { id }
 *              error   detail: { message }
 *
 * Fonts: Germania One (title) and Strait (text) are registered on the
 * document by assets/scripts/fonts.js, because browsers do not reliably load
 * @font-face rules declared inside a shadow root.
 *
 * CSS custom properties
 *   --red-letter-ink, --red-letter-cover, --red-letter-paper, --red-letter-gold
 * The last falls back to --gold-light from the page.
 */

import { registerFonts } from '../../assets/scripts/fonts.js';
import { PILL_STYLES, linkScripture } from './scripture-refs.js?v=20261002-1';

const DEFAULT_SRC = 'assets/red-letter-quotes.json';
const DEFAULT_PAGE = 'apps/pages/red-lettered-quotes.html';
// The id of the saying shown last, so the next visit shows a different one.
const LAST_KEY = 'dailygrace:red-letter:last';

const asset = (path) => new URL(path, import.meta.url).href;

const ICON_URL = asset('../../assets/images/study-guide-icons/red-lettered-quotes.webp');

const ICON_ATTRS = 'viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const PLACE_ICON = `<svg ${ICON_ATTRS}><path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
const TODAY_ICON = `<svg ${ICON_ATTRS}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;
const PDF_ICON = `<svg ${ICON_ATTRS}><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>`;
// The same URL as script.js's bookmarks PDF, so the page loads the module once.
const PDF_MODULE = asset('../../assets/scripts/bookmarks-pdf.js?v=20261003-1');

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

// The quotes file is shared by every instance, so it is fetched once.
const quotesCache = new Map();

/** Words only, for telling whether a saying's name just repeats its quote. */
const words = (text) => (text ?? '').toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();

function readQuotes(url) {
  if (!quotesCache.has(url)) {
    const request = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${url} (${response.status})`);
        return response.json();
      })
      .then((data) => {
        const sayings = Array.isArray(data?.sayings) ? data.sayings : [];
        if (!sayings.length) throw new Error(`No sayings in ${url}`);
        // Each saying keeps the verses it covers, cut from the passage it sits
        // in, and that passage, so the card can number them and link to it.
        const passages = (data.shelves || []).flatMap((shelf) => shelf.passages || []);
        for (const saying of sayings) {
          const passage = passages.find((p) => p.sayings?.includes(saying.id));
          const range = saying.reference?.match(/:(\d+)(?:-(\d+))?$/);
          const from = Number(range?.[1]);
          const to = Number(range?.[2] || range?.[1]);
          saying.verses = passage?.verses.filter((v) => v.v >= from && v.v <= to) ?? [];
          saying.passage = passage
            ? { id: passage.id, reference: passage.reference, length: passage.verses.length }
            : null;
          saying.namesItself = !words(saying.text).includes(words(saying.name));
        }
        return sayings;
      })
      .catch((error) => {
        quotesCache.delete(url);
        throw error;
      });
    quotesCache.set(url, request);
  }
  return quotesCache.get(url);
}

const STYLES = /* css */ `
  :host {
    --red-letter-ink: #b3191c;
    --red-letter-cover: #8e1216;
    --red-letter-paper: #fffaf0;
    --red-letter-gold: var(--gold-light, #e1b65d);

    display: block;
    padding-inline: 10px;
    /* Room on top of the stack's gap, so the cover's deep shadow does not
       crowd the cards above and below it. */
    margin-block: 8px 16px;
  }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }
  p { margin: 0; text-wrap: pretty; }

  /* The cover of a red-letter Bible: crimson leather inside a gilt frame,
     with the words of Jesus on a cream page laid on it. */
  article.card {
    position: relative;
    overflow: hidden;
    border: 1px solid rgb(225 182 93 / 35%);
    border-radius: 18px;
    background:
      repeating-linear-gradient(135deg, rgb(0 0 0 / 4%) 0 2px, transparent 2px 6px),
      radial-gradient(70% 55% at 15% 0%, rgb(255 140 120 / 30%) 0%, transparent 70%),
      radial-gradient(60% 50% at 100% 100%, rgb(20 0 0 / 45%) 0%, transparent 70%),
      linear-gradient(160deg, #c3222a 0%, var(--red-letter-cover) 48%, #520a0d 100%);
    color: #fff;
    box-shadow: 0 14px 34px rgb(82 10 13 / 38%), inset 0 1px 0 rgb(255 255 255 / 18%);
  }
  article.card::before {
    content: "";
    position: absolute;
    inset: 9px;
    border: 1px solid rgb(225 182 93 / 55%);
    outline: 1px solid rgb(225 182 93 / 22%);
    outline-offset: 3px;
    border-radius: 12px;
    pointer-events: none;
  }

  header {
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    width: min(36em, 100%);
    margin: 0 auto;
    padding: 28px 30px 18px;
  }
  /* A gilt rule under the heading. */
  header::after {
    content: "";
    position: absolute;
    left: 30px; right: 30px; bottom: 0;
    height: 1px;
    background: linear-gradient(90deg, var(--red-letter-gold), rgb(225 182 93 / 0%));
  }
  .emblem {
    flex: none;
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    padding: 8px;
    border-radius: 50%;
    background: var(--red-letter-paper);
    box-shadow: 0 0 0 2px var(--red-letter-gold), 0 0 0 7px rgb(225 182 93 / 18%), 0 8px 18px rgb(0 0 0 / 35%);
  }
  .emblem img { display: block; width: 100%; height: 100%; object-fit: contain; }
  .heading { flex: 1; min-width: 0; }

  /* Opens the saying as a PDF: the red round button of the other cards
     (gods-blueprint.js, daily-guidance.js), from the page's shared --action
     colours, with a gilt ring so it stands out on the crimson cover. */
  .pdf {
    flex: none;
    align-self: center;
    display: grid; place-items: center;
    width: 42px; height: 42px; padding: 0;
    border: 0; border-radius: 50%;
    background: var(--action, #c62828); color: var(--action-ink, #fff);
    box-shadow: 0 0 0 2px var(--red-letter-gold), var(--action-shadow, 0 5px 14px rgb(0 0 0 / 35%));
    cursor: pointer;
    transition: background-color .15s ease;
  }
  .pdf svg {
    display: block; width: 18px; height: 18px;
    transition: transform .2s ease;
  }
  .pdf:hover { background: var(--action-hover, #a91f1f); }
  .pdf:hover svg { transform: scale(1.08); }
  .pdf:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
  /* While the PDF is being made. */
  .pdf:disabled { cursor: progress; opacity: .7; }
  .pdf:disabled svg { animation: pdf-wait 1s ease-in-out infinite; }
  @keyframes pdf-wait { 50% { transform: translateY(2px); } }
  .visually-hidden {
    position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }
  .title {
    margin: 0;
    color: #fff;
    font: 400 clamp(1.4rem, 1.25rem + .7vw, 1.8rem)/1.1 'Germania One', Georgia, serif;
    letter-spacing: .02em;
    text-shadow: 0 2px 6px rgb(0 0 0 / 30%);
  }
  .theme {
    margin-top: 5px;
    color: #ffd88a;
    font: 700 .76rem/1.3 'Strait', 'Roboto', sans-serif;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  /* ---- the saying ---------------------------------------------------- */
  .body {
    width: min(36em, 100%);
    margin: 0 auto;
    padding: 20px 30px 30px;
  }
  .body.enter { animation: rl-in .35s ease both; }
  @keyframes rl-in { from { opacity: 0; transform: translateY(6px); } }

  .status {
    color: #ffe6dc;
    font: 400 1.05rem/1.5 'Strait', 'Roboto', sans-serif;
    text-align: center;
  }
  .name {
    margin: 0 0 10px;
    color: #fff;
    font: 400 clamp(1.3rem, 1.15rem + .6vw, 1.6rem)/1.2 'Germania One', Georgia, serif;
  }
  .setting {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    color: #ffe6dc;
    font: italic 400 clamp(.98rem, .95rem + .2vw, 1.08rem)/1.45 Georgia, 'Times New Roman', serif;
  }
  .setting svg { flex: none; width: 16px; height: 16px; margin-top: .25em; color: var(--red-letter-gold); }

  /* Jesus' words, in red on a cream page, as a red-letter Bible prints them. */
  figure {
    position: relative;
    margin: 18px 0 0;
    padding: 24px 24px 18px 54px;
    border-radius: 14px;
    background:
      radial-gradient(120% 90% at 50% 0%, #fff 0%, transparent 70%),
      linear-gradient(180deg, var(--red-letter-paper) 0%, #f5e8cf 100%);
    box-shadow:
      inset 0 0 0 1px rgb(198 146 46 / 45%),
      inset 4px 0 0 var(--red-letter-ink),
      0 12px 26px rgb(40 0 0 / 38%);
  }
  figure::before {
    content: "\\201C";
    position: absolute;
    left: 14px;
    top: 10px;
    color: rgb(179 25 28 / 28%);
    font: 400 4.6rem/1 Georgia, serif;
    pointer-events: none;
  }
  blockquote {
    margin: 0;
    color: var(--red-letter-ink);
    font: 400 clamp(1.08rem, 1rem + .35vw, 1.25rem)/1.55 Georgia, 'Times New Roman', serif;
  }
  /* The shorter the saying, the larger it is set. */
  blockquote.short { font-size: clamp(1.45rem, 1.2rem + 1.1vw, 1.95rem); line-height: 1.35; }
  blockquote.medium { font-size: clamp(1.2rem, 1.08rem + .55vw, 1.45rem); line-height: 1.45; }
  .verse { margin: 0 0 .4em; }
  .verse:last-child { margin-bottom: 0; }
  .verse sup {
    margin-right: 4px;
    color: #9a7428;
    font: 700 .55em/1 'Strait', 'Roboto', sans-serif;
    vertical-align: .6em;
  }
  figcaption {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 14px;
    color: #9a7428;
    font: 700 .78rem/1.3 'Strait', 'Roboto', sans-serif;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  figcaption::before {
    content: "";
    width: 28px;
    height: 1px;
    background: currentColor;
    opacity: .6;
  }

  /* One thing to carry into today. */
  .today {
    margin-top: 22px;
    padding: 14px 18px 16px;
    border-left: 4px solid var(--red-letter-gold);
    border-radius: 0 12px 12px 0;
    background: rgb(0 0 0 / 20%);
  }
  .today-label {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
    color: #ffd88a;
    font: 700 .76rem/1.3 'Strait', 'Roboto', sans-serif;
    letter-spacing: .14em;
    text-transform: uppercase;
  }
  .today-label svg { width: 15px; height: 15px; }
  .today-text {
    color: #fff;
    font: 400 clamp(1.05rem, 1rem + .25vw, 1.18rem)/1.45 'Strait', 'Roboto', sans-serif;
  }

  /* ---- links ----------------------------------------------------------- */
  .links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px 18px;
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px dashed rgb(255 216 138 / 40%);
  }
  .more {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 8px 20px;
    border-radius: 999px;
    background: var(--red-letter-gold);
    color: #3d0608;
    font: 700 1rem/1.2 'Strait', 'Roboto', sans-serif;
    text-decoration: none;
    box-shadow: 0 6px 14px rgb(0 0 0 / 28%);
    transition: background-color .15s ease, transform .15s ease;
  }
  .more:hover { background: #f0c66c; transform: translateY(-1px); }
  .more:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
  .passage {
    color: #ffe3a3;
    font: 400 1rem/1.4 'Strait', 'Roboto', sans-serif;
    text-decoration: underline;
    text-decoration-color: rgb(255 227 163 / 45%);
    text-underline-offset: 3px;
  }
  .passage:hover { text-decoration-color: currentColor; }
  .passage:focus-visible { outline: 2px solid #fff; outline-offset: 3px; border-radius: 3px; }

  @media (max-width: 650px) {
    header { gap: 12px; padding: 24px 22px 16px; }
    header::after { left: 22px; right: 22px; }
    .title { font-size: clamp(1.2rem, 1rem + 1.4vw, 1.4rem); }
    .emblem { width: 48px; height: 48px; padding: 7px; }
    .pdf { width: 38px; height: 38px; }
    .pdf svg { width: 16px; height: 16px; }
    .body { padding: 18px 22px 26px; }
    figure { padding: 20px 18px 16px 42px; }
    figure::before { left: 10px; top: 8px; font-size: 3.8rem; }
    .links { justify-content: center; }
  }
  @media (prefers-reduced-motion: reduce) {
    .body.enter { animation: none; }
    .more, .pdf, .pdf svg { transition: none; }
    .more:hover, .pdf:hover svg { transform: none; }
    .pdf:disabled svg { animation: none; }
  }
${PILL_STYLES}`;

/** localStorage, which can be missing or throw (private windows, blocked storage). */
function remember(id) {
  try { localStorage.setItem(LAST_KEY, id); } catch { /* the pick still works, it may just repeat */ }
}
function lastShown() {
  try { return localStorage.getItem(LAST_KEY); } catch { return null; }
}

/** A saying at random, never the one shown last when there is a choice. */
function pickSaying(sayings, avoid) {
  const choices = sayings.length > 1 ? sayings.filter((s) => s.id !== avoid) : sayings;
  return choices[Math.floor(Math.random() * choices.length)];
}

const tidy = (text) => (text ?? '').replace(/\s+/g, ' ').trim();

export class RedLetterQuotes extends HTMLElement {
  static observedAttributes = ['quotes-src', 'page-href', 'theme'];

  #els;
  #status;
  #saying = null;
  #sayings = [];
  #loading = null;
  // Coming back with the Back button can restore the page from the
  // back/forward cache without reloading it; show a new saying then too.
  #onPageShow = (event) => {
    if (event.persisted) this.next();
  };

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>${STYLES}</style>
      <article class="card" aria-labelledby="title">
        <header>
          <div class="emblem"><img src="${ICON_URL}" alt="" width="38" height="38" /></div>
          <div class="heading">
            <h3 class="title" id="title">Jesus' Spoken Words</h3>
            <p class="theme" hidden></p>
          </div>
          <button class="pdf" type="button" title="Open as a PDF" hidden>${PDF_ICON}</button>
        </header>
        <div class="body">
          <p class="status" aria-live="polite">Loading the words of Jesus…</p>
          <h4 class="name" hidden></h4>
          <p class="setting" hidden>${PLACE_ICON}<span></span></p>
          <figure hidden><blockquote></blockquote><figcaption></figcaption></figure>
          <div class="today" hidden>
            <p class="today-label">${TODAY_ICON}For today</p>
            <p class="today-text"></p>
          </div>
          <p class="links" hidden>
            <a class="more">What it means <span aria-hidden="true">→</span></a>
            <a class="passage" hidden></a>
          </p>
        </div>
      </article>
      <p class="visually-hidden" role="status" aria-atomic="true"></p>`;
    const $ = (selector) => root.querySelector(selector);
    this.#els = {
      theme: $('.theme'), body: $('.body'), loading: $('.status'), name: $('.name'),
      setting: $('.setting'), settingText: $('.setting span'), figure: $('figure'),
      quote: $('blockquote'), reference: $('figcaption'), today: $('.today'),
      todayText: $('.today-text'), links: $('.links'), more: $('.more'),
      passage: $('.passage'), pdf: $('.pdf'),
    };
    this.#status = $('[role="status"]');
    this.#els.pdf.addEventListener('click', () => this.#openPdf());
  }

  connectedCallback() {
    registerFonts();
    addEventListener('pageshow', this.#onPageShow);
    if (!this.#loading) this.#load();
  }

  disconnectedCallback() {
    removeEventListener('pageshow', this.#onPageShow);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.isConnected) return;
    this.#load();
  }

  get saying() {
    return this.#saying;
  }

  /** Show another saying at random. */
  next() {
    if (!this.#sayings.length) return;
    this.#show(pickSaying(this.#sayings, this.#saying?.id ?? lastShown()));
    this.dispatchEvent(new CustomEvent('ready', { detail: { id: this.#saying.id } }));
  }

  get #src() {
    return new URL(this.getAttribute('quotes-src') || DEFAULT_SRC, document.baseURI).href;
  }

  #pageHref(id) {
    const page = new URL(this.getAttribute('page-href') || DEFAULT_PAGE, document.baseURI);
    page.hash = id;
    return page.href;
  }

  /** The saying as a PDF, in a new tab (or downloaded, if the tab is blocked). */
  async #openPdf() {
    const saying = this.#saying;
    const button = this.#els.pdf;
    if (!saying || button.disabled) return;
    const tab = openPdfTab(`${saying.name} — Red-Lettered Quotes — Daily Grace`);
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    this.#status.textContent = `Making the PDF of ${saying.name}…`;
    try {
      const { makeRedLetterPdf } = await import(PDF_MODULE);
      const { blob, filename } = await makeRedLetterPdf(saying);
      const url = URL.createObjectURL(blob);
      // Kept long enough for the tab to load it, and to reload it for a while.
      setTimeout(() => URL.revokeObjectURL(url), 10 * 60 * 1000);
      if (tab && !tab.closed) {
        tab.location.href = url;
        this.#status.textContent = `${saying.name}: the PDF has opened in a new tab.`;
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        this.shadowRoot.append(link);
        link.click();
        link.remove();
        this.#status.textContent = `${saying.name}: your browser blocked the new tab, so the PDF was downloaded instead.`;
      }
    } catch (error) {
      tab?.close();
      console.warn('The words of Jesus could not be made into a PDF:', error);
      this.#status.textContent = 'The PDF could not be made. Please check your connection and try again.';
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  }

  #load() {
    const loading = (this.#loading = readQuotes(this.#src)
      .then((sayings) => {
        if (loading !== this.#loading) return; // superseded by a newer src
        const theme = this.getAttribute('theme');
        const inTheme = sayings.filter((s) => s.theme === theme);
        this.#sayings = inTheme.length ? inTheme : sayings;
        this.#saying = null;
        this.next();
      })
      .catch((error) => {
        if (loading !== this.#loading) return;
        console.warn('The words of Jesus could not be loaded:', error);
        this.#loading = null;
        this.#saying = null;
        this.#sayings = [];
        const els = this.#els;
        for (const el of [els.theme, els.pdf, els.name, els.setting, els.figure, els.today, els.links]) {
          el.hidden = true;
        }
        els.loading.textContent = 'The words of Jesus are unavailable. Please try again later.';
        els.loading.hidden = false;
        this.dispatchEvent(new CustomEvent('error', { detail: { message: error.message } }));
      }));
  }

  #show(saying) {
    const els = this.#els;
    this.#saying = saying;
    remember(saying.id);
    els.loading.hidden = true;
    els.theme.textContent = saying.theme || '';
    els.theme.hidden = !saying.theme;
    // Most names are the quote's own opening words; those would only repeat it.
    els.name.textContent = saying.name;
    els.name.hidden = !saying.namesItself;
    els.settingText.textContent = tidy(saying.context);
    els.setting.hidden = !saying.context;

    // A group of verses is numbered; a single verse stands on its own.
    const verses = saying.verses.length ? saying.verses : [{ text: saying.text }];
    els.quote.replaceChildren(...verses.map((verse) => {
      const p = document.createElement('p');
      p.className = 'verse';
      if (verses.length > 1) {
        const sup = document.createElement('sup');
        sup.textContent = verse.v;
        p.append(sup);
      }
      p.append(tidy(verse.text));
      return p;
    }));
    const length = tidy(saying.text).length;
    els.quote.className = length <= 90 ? 'short' : length <= 220 ? 'medium' : '';
    els.reference.textContent = saying.reference || '';
    linkScripture(els.reference);
    els.figure.hidden = false;

    els.todayText.textContent = tidy(saying.today);
    els.today.hidden = !saying.today;

    els.more.href = this.#pageHref(saying.id);
    els.more.setAttribute('aria-label', `What it means: ${saying.name}`);
    // The whole passage is only worth a link when it says more than the card.
    const passage = saying.passage;
    const more = passage && passage.length > saying.verses.length;
    if (more) {
      els.passage.href = this.#pageHref(passage.id);
      els.passage.textContent = `Read all of ${passage.reference}`;
    }
    els.passage.hidden = !more;
    els.links.hidden = false;
    els.pdf.hidden = false;
    els.pdf.setAttribute('aria-label', `Open as a PDF in a new tab: ${saying.name}`);

    // Ease the new saying in.
    els.body.classList.remove('enter');
    void els.body.offsetWidth;
    els.body.classList.add('enter');
  }
}

if (!customElements.get('red-letter-quotes')) {
  customElements.define('red-letter-quotes', RedLetterQuotes);
}
