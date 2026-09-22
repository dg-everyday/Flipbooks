/**
 * <did-you-know> — "Did you know? Essential Bible Facts" as a web component.
 *
 * Shows a banner with a refresh button and a list of random facts. Each fact
 * has the book symbol, a title, the fact text and its Bible reference. The
 * refresh button draws a new batch that never repeats the previous one.
 *
 * Usage
 *   <did-you-know></did-you-know>
 *   <script type="module" src="./apps/components/did-you-know.js"></script>
 *
 * Attributes
 *   media-base   Base URL for book symbols (images/symbols/<Book>-symbol.svg).
 *                Default: http://localhost:9001/media/
 *   src          URL of the SQLite database holding the did_you_know table,
 *                resolved against the page.
 *                Default: ../../assets/db/didyouknow.db (relative to this file)
 *   count        Facts per batch. Default: 5
 *
 * Methods      refresh()  show a new batch
 * Events       ready         fired once facts are loaded, detail: { total }
 *              refresh       fired after each batch, detail: { ids }
 *              error         detail: { message }
 *              verse-request a reference was clicked, detail: { reference, book }
 *                            (bubbles and crosses the shadow boundary)
 *
 * Data: the facts come from the did_you_know table (id, Title, Fact,
 * Reference_verse, Book, Similar_books) in assets/db/didyouknow.db, read once
 * through sql.js. Only the columns shown on a card are selected.
 *
 * Fonts: Germania One (titles) and Strait (text) are registered on the
 * document by assets/scripts/fonts.js, because browsers do not reliably load @font-face
 * rules declared inside a shadow root.
 *
 * CSS custom properties
 *   --dyk-navy, --dyk-ink, --dyk-reference, --dyk-symbol-size,
 *   --dyk-action, --dyk-action-hover, --dyk-action-ink, --dyk-action-shadow
 * The refresh button falls back to --action / --action-hover / --action-ink /
 * --action-shadow from the page, the shared look for the round banner buttons.
 */

import { registerFonts } from '../../assets/scripts/fonts.js';

// const DEFAULT_MEDIA_BASE = 'https://dailygrace.faith/media/';
const DEFAULT_MEDIA_BASE = 'http://localhost:9001/media/';
const DEFAULT_COUNT = 5;

const asset = (path) => new URL(path, import.meta.url).href;

const BANNER_URL = asset('../../assets/images/did-you-know.webp');
const REFRESH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 3.5 21 8.5 16 8.5"/><path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1L21 8.5"/></svg>';
const DEFAULT_SRC = asset('../../assets/db/didyouknow.db');
const SQL_JS_BASE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.14.2/';
const FACTS_QUERY = 'SELECT id, Title, Fact, Reference_verse, Book FROM did_you_know';

/**
 * sql.js is started once per page. assets/scripts/sql_script.js shares its
 * instance through window.loadSqlJs; start our own when the component is used
 * on a page that does not include that script.
 */
function getSqlJs() {
  if (typeof window.loadSqlJs === 'function') return window.loadSqlJs();
  if (typeof window.initSqlJs !== 'function') {
    return Promise.reject(new Error('sql.js was not loaded. Check the sql-wasm.js script on the page.'));
  }
  return window.initSqlJs({ locateFile: (file) => SQL_JS_BASE_URL + file });
}

const STYLES = /* css */ `
  :host {
    --dyk-navy: #001b34;
    --dyk-ink: #10253b;
    --dyk-reference: #c62828;
    --dyk-action: var(--action, #c62828);
    --dyk-action-hover: var(--action-hover, #a91f1f);
    --dyk-action-ink: var(--action-ink, #fff);
    --dyk-action-shadow: var(--action-shadow, 0 5px 14px rgb(0 0 0 / 35%));
    --dyk-symbol-size: 64px;
    --symbol-column: 6.25rem;

    display: block;
    color: var(--dyk-ink);
  }
  section { display: grid; gap: 18px; }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }

  .visually-hidden {
    position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .banner { position: relative; line-height: 0; }
  .banner-image {
    display: block; width: 100%; height: auto; border-radius: 6px;
  }
  .refresh {
    position: absolute; top: 8px; right: 8px;
    display: grid; place-items: center;
    width: 42px; height: 42px; padding: 0;
    border: 0; border-radius: 50%;
    background: var(--dyk-action); color: var(--dyk-action-ink);
    box-shadow: var(--dyk-action-shadow);
    cursor: pointer;
  }
  .refresh svg {
    display: block; width: 18px; height: 18px;
    transition: transform .2s ease;
  }
  .refresh:hover,
  .refresh:focus-visible { background: var(--dyk-action-hover); }
  .refresh:hover svg,
  .refresh:focus-visible svg { transform: scale(1.08); }
  .refresh:focus-visible { outline: 2px solid #fff; outline-offset: -4px; }
  .refresh:disabled { cursor: default; opacity: .55; }
  .refresh.is-spinning svg { animation: spin .6s ease; }
  @keyframes spin { from { rotate: 0deg; } to { rotate: 360deg; } }

  .list { display: grid; gap: 14px; }
  .message {
    margin: 0; padding: 16px 4px; color: #4f5c65;
    font: 1rem/1.5 'Roboto', Arial, sans-serif;
  }

  .fact {
    display: grid;
    grid-template-columns: var(--symbol-column) minmax(0, 1fr);
    align-items: start;
    padding: 18px 0;
    border: 1px solid rgb(0 27 52 / 16%);
    border-radius: 6px;
    background: rgb(255 255 255 / 16%);
  }
  .symbol {
    width: var(--dyk-symbol-size); height: var(--dyk-symbol-size);
    justify-self: center; object-fit: contain;
  }
  .body {
    min-width: 0; padding: 0 18px;
    border-left: 1px solid rgb(128 91 24 / 35%);
  }
  .title {
    margin: 0 0 8px; color: var(--dyk-navy); overflow-wrap: anywhere;
    font: 400 clamp(1.25rem, 1.1rem + .6vw, 1.5rem)/1.2 'Germania One', Georgia, serif;
  }
  .text {
    margin: 0;
    font: 400 clamp(1rem, .95rem + .3vw, 1.125rem)/1.5 'Strait', 'Roboto', sans-serif;
  }
  .reference {
    display: inline-block;
    margin: 12px 0 0; padding: 4px 0;
    border: 0; background: none;
    color: var(--dyk-reference); cursor: pointer;
    font: 400 clamp(.9375rem, .9rem + .2vw, 1rem)/1.4 'Strait', 'Roboto', sans-serif;
    text-decoration: underline;
    text-decoration-color: rgb(198 40 40 / 35%);
    text-underline-offset: 3px;
  }
  .reference:hover { text-decoration-color: currentColor; }
  .reference:focus-visible {
    outline: 2px solid var(--dyk-reference); outline-offset: 3px; border-radius: 3px;
  }

  @media (max-width: 650px) {
    :host { --symbol-column: 5.25rem; --dyk-symbol-size: 52px; }
    .refresh { top: 4px; right: 4px; width: 36px; height: 36px; }
    .refresh svg { width: 16px; height: 16px; }
    .body { padding-inline: 12px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .refresh svg, .refresh.is-spinning svg { transition: none; animation: none; }
  }
`;

export class DidYouKnow extends HTMLElement {
  static observedAttributes = ['media-base', 'src', 'count'];

  #root;
  #list;
  #refreshButton;
  #status;
  #facts = [];
  #shownIds = new Set();
  #loading = null;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <section role="region" aria-label="Did you know? Essential Bible Facts">
        <div class="banner">
          <img class="banner-image" src="${BANNER_URL}" alt="" width="2560" height="640" loading="lazy" />
          <button class="refresh" type="button" aria-label="Show more Bible facts"
                  title="Show more Bible facts" disabled>
            ${REFRESH_ICON}
          </button>
        </div>
        <div class="list"><p class="message">Loading Bible facts…</p></div>
        <p class="visually-hidden" role="status" aria-atomic="true"></p>
      </section>`;
    this.#list = this.#root.querySelector('.list');
    this.#refreshButton = this.#root.querySelector('.refresh');
    this.#status = this.#root.querySelector('[role="status"]');

    this.#refreshButton.addEventListener('click', () => {
      this.refresh();
      this.#refreshButton.classList.remove('is-spinning');
      void this.#refreshButton.offsetWidth; // restart the spin on repeat clicks
      this.#refreshButton.classList.add('is-spinning');
    });
    this.#refreshButton.addEventListener('animationend', () => {
      this.#refreshButton.classList.remove('is-spinning');
    });
  }

  connectedCallback() {
    registerFonts();
    if (!this.#facts.length) this.#load();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.isConnected) return;
    if (name === 'src') {
      this.#facts = [];
      this.#shownIds = new Set();
      this.#load();
    } else if (this.#facts.length) {
      // media-base changes symbol URLs; count changes the batch size.
      this.#render(this.#currentFacts());
    }
  }

  get #mediaBase() {
    const base = this.getAttribute('media-base') || DEFAULT_MEDIA_BASE;
    return base.endsWith('/') ? base : `${base}/`;
  }

  get #count() {
    const count = Number.parseInt(this.getAttribute('count'), 10);
    return count > 0 ? count : DEFAULT_COUNT;
  }

  #currentFacts() {
    const shown = this.#facts.filter((fact) => this.#shownIds.has(fact.id));
    return shown.length ? shown : this.#pick();
  }

  /** Reads every fact out of the database, then closes it again. */
  async #read(src) {
    const [SQL, response] = await Promise.all([
      getSqlJs(),
      fetch(new URL(src, document.baseURI), { cache: 'force-cache' }),
    ]);
    if (!response.ok) throw new Error(`Unable to load ${src} (${response.status})`);

    const bytes = new Uint8Array(await response.arrayBuffer());
    const header = new TextDecoder().decode(bytes.subarray(0, 15));
    if (!header.startsWith('SQLite format 3')) {
      throw new Error(`${src} is not a valid SQLite database.`);
    }

    const database = new SQL.Database(bytes);
    try {
      const statement = database.prepare(FACTS_QUERY);
      const facts = [];
      while (statement.step()) {
        const row = statement.getAsObject();
        facts.push({
          id: row.id,
          title: row.Title,
          text: row.Fact,
          reference: row.Reference_verse,
          book: row.Book,
        });
      }
      statement.free();
      return facts;
    } finally {
      // The rows are kept in memory; the database file itself is not needed.
      database.close();
    }
  }

  #load() {
    const src = this.getAttribute('src') || DEFAULT_SRC;
    const loading = (this.#loading = this.#read(src)
      .then((facts) => {
        if (loading !== this.#loading) return; // superseded by a newer src
        this.#facts = facts.filter((fact) => fact.title && fact.text);
        if (!this.#facts.length) throw new Error('No Bible facts are available.');
        this.#refreshButton.disabled = false;
        this.refresh();
        this.dispatchEvent(new CustomEvent('ready', { detail: { total: this.#facts.length } }));
      })
      .catch((error) => {
        if (loading !== this.#loading) return;
        console.warn('Bible facts could not be loaded:', error);
        const message = document.createElement('p');
        message.className = 'message';
        message.textContent = 'Bible facts could not be loaded. Please reload the page to try again.';
        this.#list.replaceChildren(message);
        this.dispatchEvent(new CustomEvent('error', { detail: { message: error.message } }));
      }));
  }

  /** Draws from facts not in the previous batch, so a refresh never repeats. */
  #pick() {
    const count = this.#count;
    const unseen = this.#facts.filter((fact) => !this.#shownIds.has(fact.id));
    const pool = unseen.length >= count ? unseen : this.#facts.slice();
    for (let index = pool.length - 1; index > 0; index--) {
      const swap = Math.floor(Math.random() * (index + 1));
      [pool[index], pool[swap]] = [pool[swap], pool[index]];
    }
    return pool.slice(0, Math.min(count, pool.length));
  }

  #createFact(fact) {
    const card = document.createElement('article');
    card.className = 'fact';

    const symbol = document.createElement('img');
    symbol.className = 'symbol';
    symbol.width = 64;
    symbol.height = 64;
    symbol.alt = '';
    symbol.loading = 'lazy';
    // Keep the column width so facts stay aligned when a symbol is missing.
    symbol.onerror = () => { symbol.style.visibility = 'hidden'; };
    if (fact.book) {
      symbol.src = `${this.#mediaBase}images/symbols/${encodeURIComponent(fact.book)}-symbol.svg`;
    } else {
      symbol.style.visibility = 'hidden';
    }

    const body = document.createElement('div');
    body.className = 'body';
    const title = document.createElement('h4');
    title.className = 'title';
    title.textContent = fact.title;
    const text = document.createElement('p');
    text.className = 'text';
    text.textContent = fact.text;
    body.append(title, text);

    if (fact.reference) {
      // The reference opens the passage itself; the page decides how to show it.
      const reference = document.createElement('button');
      reference.type = 'button';
      reference.className = 'reference';
      reference.textContent = `(${fact.reference})`;
      reference.setAttribute('aria-label', `Read ${fact.reference}`);
      reference.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('verse-request', {
          bubbles: true,
          composed: true,
          detail: { reference: fact.reference, book: fact.book ?? null },
        }));
      });
      body.append(reference);
    }

    card.append(symbol, body);
    return card;
  }

  #render(facts) {
    this.#shownIds = new Set(facts.map((fact) => fact.id));
    this.#list.replaceChildren(...facts.map((fact) => this.#createFact(fact)));
    this.#status.textContent = `${facts.length} Bible facts shown, starting with ${facts[0].title}.`;
  }

  /** Show a new batch of facts, none repeated from the previous batch. */
  refresh() {
    if (!this.#facts.length) return;
    const facts = this.#pick();
    this.#render(facts);
    this.dispatchEvent(new CustomEvent('refresh', { detail: { ids: facts.map((fact) => fact.id) } }));
  }
}

if (!customElements.get('did-you-know')) {
  customElements.define('did-you-know', DidYouKnow);
}
