/**
 * <did-you-know> — "Did you know? Essential Bible Facts" as a web component.
 *
 * Shows a banner with a refresh button and a list of random facts. Each fact
 * has the book symbol, a title, the fact text and its Bible reference. Every
 * title finishes the banner's "Did you know?" as a question, and a card first
 * shows only the symbol and that question: tapping it (or pressing Enter on
 * the question) opens the fact and its reference beneath, and tapping again
 * folds them away. The refresh button draws a new batch that never repeats
 * the previous one.
 * Pulling down (or tapping) the chevrons under the list adds another batch
 * of facts not yet shown, up to 20 in all; then the chevrons fold away until
 * the next refresh.
 *
 * Holding a fact for half a second bookmarks it: a gold glow spreads from the
 * finger and the card takes a ribbon. Holding it again removes the bookmark.
 * Up to 50 fact ids are kept in localStorage, newest first (see
 * card-bookmarks.js). With the bookmarks attribute the component shows only
 * the bookmarked facts, under a header and with no banner, which is how the
 * page's bookmarks popup uses it; those cards start open.
 *
 * Usage
 *   <did-you-know></did-you-know>
 *   <script type="module" src="./apps/components/did-you-know.js"></script>
 *
 * Attributes
 *   media-base   Base URL for book symbols (images/symbols/<Book>-symbol.svg).
 *                Default: media_base_url in apps/settings/appsettings.json
 *   src          URL of the SQLite database holding the did_you_know table,
 *                resolved against the page.
 *                Default: ../../assets/db/didyouknow.db (relative to this file)
 *   count        Facts per batch. Default: 5
 *   page-href    The Did You Know page, resolved against the page. An open
 *                fact links to itself there (#fact-<id>), among the rest of
 *                its book's facts, and a link under the list opens the page.
 *                Default: apps/pages/did-you-know.html
 *   bookmarks    Present: no banner and no pull tab; show the bookmarked
 *                facts, newest first. Call showBookmarks() to bring the list
 *                up to date.
 *
 * Methods      refresh()        show a new batch
 *              more()           add a batch below the list, up to 20 facts
 *              showBookmarks()  show the bookmarked facts, newest first
 *              bookmarkedItems()  resolves to the bookmarked facts themselves,
 *                               newest first, reading the database if need be
 * Properties   bookmarks (read-only): the bookmarked fact ids, newest first
 * Events       ready         fired once facts are loaded, detail: { total }
 *              refresh       fired after each batch, detail: { ids }
 *              more          fired after more() adds facts, detail: { ids }
 *              bookmarkchange  a hold added or removed a bookmark,
 *                            detail: { id, result: 'added' | 'removed' }
 *              error         detail: { message }
 *              verse-request a reference pill was tapped, detail: { reference, label }
 *                            (bubbles and crosses the shadow boundary; unless
 *                            cancelled, the passage opens in <verse-popup>)
 *
 * Data: the facts come from the did_you_know table (id, Title, Fact,
 * Reference_verse, Book, Similar_books) in assets/db/didyouknow.db, read once
 * through sql.js and shared by every instance on the page. Only the columns
 * shown on a card are selected. Once the page has loaded, the database is
 * fetched when the card comes within a screen of view, or, with the
 * bookmarks attribute, on the first showBookmarks().
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
import { openDatabase, query } from '../../assets/scripts/sqlite-db.js';
import {
  BOOKMARK_STYLES, CardHold, bookmarkNote, bookmarkStore, showBookmarkResult,
} from './card-bookmarks.js?v=20260927-1';
import { PULL_TAB_ICON, PULL_TAB_STYLES, PullTab, revealCards } from './pull-tab.js?v=20260925-1';
import { PILL_STYLES, linkScripture, refPill } from './scripture-refs.js?v=20261002-1';
import { MEDIA_BASE_URL } from '../settings/settings.js?v=20261009-1';

// Citations use "Psalm"; the symbol library files that book under its plural name.
const SYMBOL_BOOK_NAMES = { Psalm: 'Psalms' };
const bookSymbolUrl = (mediaBase, book) =>
  `${mediaBase}images/symbols/${encodeURIComponent(SYMBOL_BOOK_NAMES[book] ?? book)}-symbol.svg`;

const DEFAULT_MEDIA_BASE = MEDIA_BASE_URL;
const DEFAULT_PAGE = 'apps/pages/did-you-know.html';
const DEFAULT_COUNT = 5;
// Pulling for more stops once the list holds this many facts.
const MAX_FACTS = 20;

const asset = (path) => new URL(path, import.meta.url).href;

const BANNER_URL = asset('../../assets/images/did-you-know-1440.webp');
const REFRESH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 3.5 21 8.5 16 8.5"/><path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1L21 8.5"/></svg>';
// The database is fetched with force-cache, so bump the token whenever its rows
// change. <bible-trivia> uses the same token, so the page caches one copy.
const DEFAULT_SRC = asset('../../assets/db/didyouknow.db?v=20260929-2');
const CHEVRON_ICON = '<svg class="fact-chevron" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
const FACTS_QUERY = 'SELECT id, Title, Fact, Reference_verse, Book FROM did_you_know';

const bookmarks = bookmarkStore('dailygrace:bookmarks:facts', { isId: Number.isSafeInteger, limit: 50 });

// The facts are shared by every instance, so the page's list and its bookmarks
// popup read the database once between them.
const factsCache = new Map();

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [items[index], items[swap]] = [items[swap], items[index]];
  }
  return items;
}

/** Reads every fact out of the database, then closes it again. */
function readFacts(url) {
  if (!factsCache.has(url)) {
    const request = openDatabase(url)
      .then((database) => {
        try {
          return query(database, FACTS_QUERY).map((row) => ({
            id: row.id,
            title: row.Title,
            text: row.Fact,
            reference: row.Reference_verse,
            book: row.Book,
          }));
        } finally {
          // The rows are kept in memory; the database file itself is not needed.
          database.close();
        }
      })
      .catch((error) => {
        factsCache.delete(url);
        throw error;
      });
    factsCache.set(url, request);
  }
  return factsCache.get(url);
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
  /* A list of bookmarks: a header in place of the banner. */
  :host([bookmarks]) section { gap: 10px; }
  :host([bookmarks]) .banner { display: none; }
  :host([bookmarks]) .message { padding: 16px; }
  .bookmarks-header {
    padding: 18px;
    border: 1px solid rgb(0 27 52 / 20%);
    border-radius: 8px;
    background: rgb(255 255 255 / 24%);
  }
  .bookmarks-title {
    margin: 0; color: var(--dyk-navy);
    font: 400 1.375rem/1.3 'Strait', 'Roboto', sans-serif;
  }
  .bookmarks-summary {
    margin: 8px 0 0;
    font: 400 1.125rem/1.45 'Strait', 'Roboto', sans-serif;
  }
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

  .list { display: grid; gap: 6px; }
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
  .fact { cursor: pointer; }
  .title {
    margin: 0; color: var(--dyk-navy); overflow-wrap: anywhere;
    font: 400 clamp(1.25rem, 1.1rem + .6vw, 1.5rem)/1.2 'Germania One', Georgia, serif;
  }
  /* The question is the button that opens the card; the whole card opens it
     too, but this is what a keyboard or screen reader reaches. It is at least
     as tall as the symbol, so a closed card sits the question beside it. */
  .toggle {
    display: flex; align-items: center; gap: 12px;
    width: 100%; min-height: var(--dyk-symbol-size); padding: 0;
    border: 0; background: none; color: inherit;
    font: inherit; text-align: left; cursor: pointer;
  }
  .toggle:focus-visible {
    outline: 2px solid var(--dyk-navy); outline-offset: 4px; border-radius: 3px;
  }
  .question { flex: 1; min-width: 0; }
  .fact-chevron {
    flex: none; width: 20px; height: 20px;
    color: var(--dyk-reference);
    transition: transform .25s ease;
  }
  .fact.open .fact-chevron { transform: rotate(180deg); }
  /* The answer folds away under the question. Rows animate from 0fr to 1fr;
     visibility keeps a closed answer out of reach of the tab key and screen
     readers, and switches only once the fold has finished. */
  .details {
    display: grid; grid-template-rows: 0fr;
    transition: grid-template-rows .25s ease;
  }
  .fact.open .details { grid-template-rows: 1fr; }
  .details-inner {
    min-height: 0; overflow: hidden; visibility: hidden;
    transition: visibility 0s linear .25s;
  }
  .fact.open .details-inner { visibility: visible; transition-delay: 0s; }
  .text {
    margin: 0; padding-top: 8px;
    font: 400 clamp(1rem, .95rem + .3vw, 1.125rem)/1.5 'Strait', 'Roboto', sans-serif;
  }
  /* The fact's reference, a pill that opens the passage (scripture-refs.js). */
  .reference {
    margin: 12px 0 0;
    font: 400 clamp(.9375rem, .9rem + .2vw, 1rem)/1.4 'Strait', 'Roboto', sans-serif;
  }
  .details { --scripture-ref-color: var(--dyk-reference); }
  /* The reference, and a link to the fact among the rest of its book's on
     the Did You Know page. */
  .fact-foot {
    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
    gap: 8px 14px;
  }
  .fact-more {
    color: var(--dyk-navy);
    font: 600 .9375rem/1.3 'Strait', 'Roboto', sans-serif;
    text-decoration: underline;
    text-decoration-color: rgb(0 27 52 / 30%);
    text-underline-offset: 3px;
  }
  .fact-more:hover { text-decoration-color: currentColor; }
  .fact-more:focus-visible { outline: 2px solid var(--dyk-navy); outline-offset: 3px; border-radius: 3px; }

  /* Every fact, on the Did You Know page. */
  .see-all {
    justify-self: center;
    display: inline-flex; align-items: center; gap: 8px;
    min-height: 44px; padding: 8px 20px;
    border: 1px solid rgb(0 27 52 / 22%); border-radius: 999px;
    background: rgb(255 255 255 / 40%);
    color: var(--dyk-navy);
    font: 600 1rem/1.2 'Strait', 'Roboto', sans-serif;
    text-decoration: none;
    transition: background-color .15s ease, border-color .15s ease;
  }
  .see-all:hover { background: rgb(255 255 255 / 75%); border-color: rgb(0 27 52 / 40%); }
  .see-all:focus-visible { outline: 2px solid var(--dyk-navy); outline-offset: 3px; }
  :host([bookmarks]) .see-all { display: none; }

  /* The chevrons tuck up under the last fact rather than sit a full gap away. */
  .pull-tab { margin-top: -14px; }
  :host([bookmarks]) .pull-tab { display: none; }

  @media (max-width: 650px) {
    :host { --symbol-column: 5.25rem; --dyk-symbol-size: 52px; }
    .refresh { top: 4px; right: 4px; width: 36px; height: 36px; }
    .refresh svg { width: 16px; height: 16px; }
    .body { padding-inline: 12px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .refresh svg, .refresh.is-spinning svg { transition: none; animation: none; }
    .fact-chevron, .details, .details-inner, .see-all { transition: none; }
  }
${BOOKMARK_STYLES}
${PULL_TAB_STYLES}
${PILL_STYLES}`;

export class DidYouKnow extends HTMLElement {
  static observedAttributes = ['media-base', 'src', 'count'];

  #root;
  #list;
  #refreshButton;
  #status;
  #bookmarksHeader;
  #facts = [];
  #shownIds = new Set();
  #loading = null;
  #nearObserver = null;
  #hold;
  #pullTab;
  #showingBookmarks = false;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <section role="region" aria-label="Did you know? Essential Bible Facts">
        <div class="banner">
          <img class="banner-image" src="${BANNER_URL}" alt="" width="1440" height="360" loading="lazy" />
          <button class="refresh" type="button" aria-label="Show more Bible facts"
                  title="Show more Bible facts" disabled>
            ${REFRESH_ICON}
          </button>
        </div>
        <header class="bookmarks-header" hidden>
          <h3 class="bookmarks-title">Bookmarked facts</h3>
          <p class="bookmarks-summary"></p>
        </header>
        <div class="list"><p class="message">Loading Bible facts…</p></div>
        <button class="pull-tab" type="button" hidden aria-label="Show more Bible facts"
                title="Pull down or tap for more facts">
          ${PULL_TAB_ICON}
        </button>
        <a class="see-all">Explore every Bible fact <span aria-hidden="true">→</span></a>
        <p class="visually-hidden" role="status" aria-atomic="true"></p>
      </section>`;
    this.#list = this.#root.querySelector('.list');
    this.#refreshButton = this.#root.querySelector('.refresh');
    this.#status = this.#root.querySelector('[role="status"]');
    this.#bookmarksHeader = this.#root.querySelector('.bookmarks-header');

    this.#refreshButton.addEventListener('click', () => {
      this.refresh();
      this.#refreshButton.classList.remove('is-spinning');
      void this.#refreshButton.offsetWidth; // restart the spin on repeat clicks
      this.#refreshButton.classList.add('is-spinning');
    });
    this.#refreshButton.addEventListener('animationend', () => {
      this.#refreshButton.classList.remove('is-spinning');
    });

    this.#pullTab = new PullTab(this.#root.querySelector('.pull-tab'), { onPull: () => this.more() });

    // Tapping a card opens or closes it. A reference pill is a button of its
    // own, its link goes to the Did You Know page and a hold swallows its
    // click, so none of those toggles the card.
    this.#list.addEventListener('click', (event) => {
      const card = event.target.closest('.fact');
      if (!card || event.target.closest('.scripture-ref, a')) return;
      // Selecting text in an open card should not fold it away.
      if (!event.target.closest('.toggle') && document.getSelection()?.toString()) return;
      this.#setOpen(card, !card.classList.contains('open'));
    });

    // Holding a reference or the link does nothing; they have taps of their own.
    this.#hold = new CardHold(this.#list, {
      selector: '.fact',
      exclude: '.scripture-ref, a',
      onHold: (card) => {
        const id = Number(card.dataset.id);
        const result = bookmarks.toggle(id);
        showBookmarkResult(card, result, bookmarks.limit);
        this.#status.textContent = `${card.querySelector('.title').textContent}: ${bookmarkNote(result, bookmarks.limit)}`;
        if (result === 'added' || result === 'removed') {
          this.dispatchEvent(new CustomEvent('bookmarkchange', { detail: { id, result } }));
        }
      },
    });
  }

  connectedCallback() {
    registerFonts();
    this.#root.querySelector('.see-all').href = this.#pageHref();
    bookmarks.addEventListener('change', this.#syncBookmarks);
    this.#syncBookmarks();
    if (!this.#facts.length) this.#loadWhenNear();
  }

  disconnectedCallback() {
    bookmarks.removeEventListener('change', this.#syncBookmarks);
    this.#hold.cancel();
    this.#nearObserver?.disconnect();
    this.#nearObserver = null;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.isConnected) return;
    if (name === 'src') {
      this.#facts = [];
      this.#shownIds = new Set();
      this.#load();
    } else if (this.#showingBookmarks) {
      this.showBookmarks();
    } else if (this.#facts.length) {
      // media-base changes symbol URLs; count changes the batch size.
      this.#render(this.#currentFacts());
    }
  }

  /** The bookmarked fact ids, newest first. */
  get bookmarks() {
    return bookmarks.read();
  }

  /** The bookmarked facts, newest first: { id, title, text, reference, book }. */
  async bookmarkedItems() {
    const src = this.getAttribute('src') || DEFAULT_SRC;
    const facts = await readFacts(new URL(src, document.baseURI).href);
    const byId = new Map(facts.map((fact) => [fact.id, fact]));
    return bookmarks.read().map((id) => byId.get(id)).filter((fact) => fact?.title && fact.text);
  }

  /** The Did You Know page, opened at hash (a fact's or a book's id) if given. */
  #pageHref(hash = '') {
    const page = new URL(this.getAttribute('page-href') || DEFAULT_PAGE, document.baseURI);
    page.hash = hash;
    return page.href;
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

  // The database and the sql.js behind it come to over a megabyte, and the
  // card sits well below the banner and the poster: fetch them only as the
  // card nears the screen, so they never compete with what is read first. A
  // bookmarks list waits for showBookmarks() to ask for it.
  #loadWhenNear() {
    if (this.#loading || this.#nearObserver || this.hasAttribute('bookmarks')) return;
    this.#nearObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      this.#nearObserver.disconnect();
      this.#nearObserver = null;
      if (!this.#loading) this.#load();
    }, { rootMargin: '100% 0px' });
    // Until the rest of the page has arrived, every card is short, so even the
    // last one can sit within a screen of view: wait for the load event first.
    const observer = this.#nearObserver;
    const observe = () => {
      if (observer === this.#nearObserver) observer.observe(this);
    };
    if (document.readyState === 'complete') observe();
    else window.addEventListener('load', observe, { once: true });
  }

  #load() {
    const src = this.getAttribute('src') || DEFAULT_SRC;
    const loading = (this.#loading = readFacts(new URL(src, document.baseURI).href)
      .then((facts) => {
        if (loading !== this.#loading) return; // superseded by a newer src
        this.#facts = facts.filter((fact) => fact.title && fact.text);
        if (!this.#facts.length) throw new Error('No Bible facts are available.');
        this.#refreshButton.disabled = false;
        if (this.hasAttribute('bookmarks')) this.showBookmarks();
        else this.refresh();
        this.dispatchEvent(new CustomEvent('ready', { detail: { total: this.#facts.length } }));
      })
      .catch((error) => {
        if (loading !== this.#loading) return;
        console.warn('Bible facts could not be loaded:', error);
        const message = document.createElement('p');
        message.className = 'message';
        message.textContent = 'Bible facts could not be loaded. Please reload the page to try again.';
        this.#list.replaceChildren(message);
        this.#pullTab.hide();
        this.dispatchEvent(new CustomEvent('error', { detail: { message: error.message } }));
      }));
  }

  /** Draws from facts not in the previous batch, so a refresh never repeats. */
  #pick() {
    const count = this.#count;
    const unseen = this.#unseen();
    return shuffle(unseen.length >= count ? unseen : this.#facts.slice()).slice(0, count);
  }

  #unseen() {
    return this.#facts.filter((fact) => !this.#shownIds.has(fact.id));
  }

  // The tab shows while the list has room for more and there are more to draw.
  #updatePullTab(options) {
    const shown = this.#shownIds.size;
    if (shown < MAX_FACTS && shown < this.#facts.length) this.#pullTab.show();
    else this.#pullTab.hide(options);
  }

  #createFact(fact, { open = false } = {}) {
    const card = document.createElement('article');
    card.className = 'fact bookmarkable';
    card.dataset.id = fact.id;
    card.classList.toggle('bookmarked', bookmarks.has(fact.id));

    const symbol = document.createElement('img');
    symbol.className = 'symbol';
    symbol.width = 64;
    symbol.height = 64;
    symbol.alt = '';
    symbol.loading = 'lazy';
    // Keep the column width so facts stay aligned when a symbol is missing.
    symbol.onerror = () => { symbol.style.visibility = 'hidden'; };
    if (fact.book) {
      symbol.src = bookSymbolUrl(this.#mediaBase, fact.book);
    } else {
      symbol.style.visibility = 'hidden';
    }

    // Only the question shows at first; the fact and its reference open under it.
    const detailsId = `fact-${fact.id}-details`;
    const title = document.createElement('h4');
    title.className = 'title';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'toggle';
    toggle.setAttribute('aria-controls', detailsId);
    const question = document.createElement('span');
    question.className = 'question';
    question.textContent = fact.title;
    toggle.append(question);
    toggle.insertAdjacentHTML('beforeend', CHEVRON_ICON);
    title.append(toggle);

    const details = document.createElement('div');
    details.className = 'details';
    details.id = detailsId;
    const inner = document.createElement('div');
    inner.className = 'details-inner';
    details.append(inner);
    const text = document.createElement('p');
    text.className = 'text';
    text.textContent = fact.text;
    linkScripture(text);
    inner.append(text);

    const body = document.createElement('div');
    body.className = 'body';
    body.append(title, details);

    // A pill that opens the passage (scripture-refs.js), and the link to the
    // fact on the Did You Know page, opened among the rest of its book's.
    const foot = document.createElement('p');
    foot.className = 'reference fact-foot';
    if (fact.reference) foot.append(refPill(fact.reference));
    const more = document.createElement('a');
    more.className = 'fact-more';
    more.href = this.#pageHref(`fact-${fact.id}`);
    more.textContent = fact.book ? `More from ${fact.book} ` : 'More Bible facts ';
    more.insertAdjacentHTML('beforeend', '<span aria-hidden="true">→</span>');
    foot.append(more);
    inner.append(foot);

    card.append(symbol, body);
    this.#setOpen(card, open);
    return card;
  }

  #setOpen(card, open) {
    card.classList.toggle('open', open);
    card.querySelector('.toggle').setAttribute('aria-expanded', String(open));
  }

  #render(facts) {
    this.#showingBookmarks = false;
    this.#bookmarksHeader.hidden = true;
    this.#shownIds = new Set(facts.map((fact) => fact.id));
    this.#list.replaceChildren(...facts.map((fact) => this.#createFact(fact)));
    this.#updatePullTab();
    this.#status.textContent = `${facts.length} Bible facts shown, starting with ${facts[0].title}.`;
  }

  #bookmarksSummary() {
    return `${bookmarks.read().length} of ${bookmarks.limit} saved facts, newest first. `
      + 'Hold a fact to remove its bookmark.';
  }

  /**
   * Show the bookmarked facts, newest first. A fact taken off here keeps its
   * card, without the ribbon, so holding it again puts the bookmark back.
   */
  showBookmarks() {
    if (!this.#facts.length) {
      // Loaded on first use; the bookmarks show once the facts arrive.
      if (!this.#loading) this.#load();
      return;
    }
    this.#showingBookmarks = true;
    this.#pullTab.hide();
    const facts = bookmarks.read()
      .map((id) => this.#facts.find((fact) => fact.id === id))
      .filter(Boolean);
    this.#bookmarksHeader.hidden = !facts.length;
    if (!facts.length) {
      const message = document.createElement('p');
      message.className = 'message';
      message.textContent = 'No bookmarked facts yet. Hold a fact in “Did you know?” for half a second to bookmark it.';
      this.#list.replaceChildren(message);
      this.#status.textContent = message.textContent;
      return;
    }
    this.#bookmarksHeader.querySelector('.bookmarks-summary').textContent = this.#bookmarksSummary();
    // Saved facts are there to be reread, so they open already answered.
    this.#list.replaceChildren(...facts.map((fact) => this.#createFact(fact, { open: true })));
    this.#status.textContent = `Bookmarked facts. ${this.#bookmarksSummary()}`;
  }

  #syncBookmarks = () => {
    const saved = new Set(bookmarks.read());
    for (const card of this.#list.querySelectorAll('.fact')) {
      card.classList.toggle('bookmarked', saved.has(Number(card.dataset.id)));
    }
    if (this.#showingBookmarks) {
      this.#bookmarksHeader.querySelector('.bookmarks-summary').textContent = this.#bookmarksSummary();
    }
  };

  /** Show a new batch of facts, none repeated from the previous batch. */
  refresh() {
    if (!this.#facts.length) return;
    const facts = this.#pick();
    this.#render(facts);
    this.dispatchEvent(new CustomEvent('refresh', { detail: { ids: facts.map((fact) => fact.id) } }));
  }

  /** Add a batch of facts not yet shown below the list, up to 20 in all. */
  more() {
    if (this.#showingBookmarks || !this.#facts.length) return;
    const room = MAX_FACTS - this.#shownIds.size;
    const facts = shuffle(this.#unseen()).slice(0, Math.min(this.#count, room));
    if (!facts.length) return;
    for (const fact of facts) this.#shownIds.add(fact.id);
    const cards = facts.map((fact) => this.#createFact(fact));
    this.#list.append(...cards);
    revealCards(cards);
    this.#updatePullTab({ animate: true, focus: cards[0].querySelector('button') });
    this.#status.textContent = `${facts.length} more Bible facts shown, starting with ${facts[0].title}.`;
    this.dispatchEvent(new CustomEvent('more', { detail: { ids: facts.map((fact) => fact.id) } }));
  }
}

if (!customElements.get('did-you-know')) {
  customElements.define('did-you-know', DidYouKnow);
}
