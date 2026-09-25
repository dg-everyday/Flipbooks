/**
 * <bible-sayings> — everyday sayings that come from the Bible, as a web component.
 *
 * Shows a banner with a refresh button and a list of random sayings. Each card
 * has the book thumbnail, the saying, what it means today and its Bible
 * reference. Tapping a card pops up the whole entry: other wordings, where it
 * comes from, the KJV text and every reference; any tap outside a reference
 * closes it. The refresh button draws a new batch that never repeats the
 * previous one.
 *
 * Holding a saying for half a second bookmarks it: a gold glow spreads from
 * the finger and the card takes a ribbon. Holding it again removes the
 * bookmark. Up to 50 saying ids are kept in localStorage, newest first (see
 * card-bookmarks.js). With the bookmarks attribute the component shows only
 * the bookmarked sayings, under a header and with no banner, which is how the
 * page's bookmarks popup uses it.
 *
 * Usage
 *   <bible-sayings></bible-sayings>
 *   <script type="module" src="./apps/components/bible-sayings.js"></script>
 *
 * Attributes
 *   media-base   Base URL for book thumbnails (images/thumbnails/<Book>_square.webp).
 *                Default: https://dailygrace.faith/media/
 *   src          URL of the sayings JSON, resolved against the page.
 *                Default: ../../assets/bible-sayings.json (relative to this file)
 *   count        Sayings per batch. Default: 5
 *   bookmarks    Present: no banner; show the bookmarked sayings, newest first.
 *                Call showBookmarks() to bring the list up to date.
 *
 * Methods      refresh()        show a new batch
 *              showBookmarks()  show the bookmarked sayings, newest first
 *              open(id)         pop up one saying
 *              close()          close the popup
 * Properties   bookmarks (read-only): the bookmarked saying ids, newest first
 * Events       ready         fired once sayings are loaded, detail: { total }
 *              refresh       fired after each batch, detail: { ids }
 *              open          a saying was popped up, detail: { id }
 *              bookmarkchange  a hold added or removed a bookmark,
 *                            detail: { id, result: 'added' | 'removed' }
 *              error         detail: { message }
 *              verse-request a reference in the popup was clicked,
 *                            detail: { reference, book }
 *                            (bubbles and crosses the shadow boundary)
 *
 * Data: assets/bible-sayings.json, built by tools/sayings/build_sayings.py,
 * fetched once and shared by every instance on the page.
 * Each entry has id, saying, variants, meaning, explanation, reference,
 * references, kjv_text, book, testament, wording and theme.
 *
 * The gold frame inside the thumbnails is not the same size from one book to
 * the next, so each one is scaled by the bounds in book-thumb-bounds.js, as
 * <bible-trivia> does.
 *
 * Fonts: Germania One (titles) and Strait (text) are registered on the
 * document by assets/scripts/fonts.js, because browsers do not reliably load @font-face
 * rules declared inside a shadow root.
 *
 * CSS custom properties
 *   --bs-navy, --bs-ink, --bs-reference, --bs-paper, --bs-symbol-size,
 *   --bs-action, --bs-action-hover, --bs-action-ink, --bs-action-shadow
 * The round buttons fall back to --action / --action-hover / --action-ink /
 * --action-shadow from the page, the shared look for the round banner buttons.
 */

import { registerFonts } from '../../assets/scripts/fonts.js';
import { BOOK_THUMB_BOUNDS, DEFAULT_THUMB_BOUNDS } from './book-thumb-bounds.js';
import {
  BOOKMARK_STYLES, CardHold, bookmarkNote, bookmarkStore, showBookmarkResult,
} from './card-bookmarks.js?v=20260925-1';

// The thumbnails are .webp on the media host; .svg is not published.
const bookThumbnailUrl = (mediaBase, book) =>
  `${mediaBase}images/thumbnails/${encodeURIComponent(book)}_square.webp`;
// Shave the outermost hair off each tile, as <bible-trivia> does: a couple of
// the files carry a fringe right against the frame.
const THUMBNAIL_TRIM = 0.985;

const DEFAULT_MEDIA_BASE = 'https://dailygrace.faith/media/';
const DEFAULT_COUNT = 5;

const asset = (path) => new URL(path, import.meta.url).href;

const BANNER_URL = asset('../../assets/images/sayings.webp');
const REFRESH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 3.5 21 8.5 16 8.5"/><path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1L21 8.5"/></svg>';
const DEFAULT_SRC = asset('../../assets/bible-sayings.json');

const bookmarks = bookmarkStore('dailygrace:bookmarks:sayings',
  { isId: (id) => typeof id === 'string' && id !== '', limit: 50 });

// The sayings are shared by every instance, so the page's list and its
// bookmarks popup fetch the file once between them.
const sayingsCache = new Map();

function readSayings(url) {
  if (!sayingsCache.has(url)) {
    const request = fetch(url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        const sayings = await response.json();
        if (!Array.isArray(sayings)) throw new Error('The sayings file is not a list.');
        return sayings;
      })
      .catch((error) => {
        sayingsCache.delete(url);
        throw error;
      });
    sayingsCache.set(url, request);
  }
  return sayingsCache.get(url);
}

const WORDING_LABELS = {
  exact: 'Word for word in the KJV',
  adapted: 'Adapted from the KJV',
  allusion: 'Drawn from a Bible story',
};

const STYLES = /* css */ `
  :host {
    --bs-navy: #001b34;
    --bs-ink: #10253b;
    --bs-reference: #c62828;
    --bs-paper: var(--cream, #f3e7d2);
    --bs-edge: rgb(128 91 24 / 35%);
    --bs-action: var(--action, #c62828);
    --bs-action-hover: var(--action-hover, #a91f1f);
    --bs-action-ink: var(--action-ink, #fff);
    --bs-action-shadow: var(--action-shadow, 0 5px 14px rgb(0 0 0 / 35%));
    --bs-symbol-size: 84px;
    --symbol-column: 7.5rem;

    display: block;
    color: var(--bs-ink);
  }
  section { display: grid; }
  :host([hidden]) { display: none; }
  /* A list of bookmarks: a header in place of the banner, and the cards in a
     panel of their own below it. */
  :host([bookmarks]) section { gap: 10px; }
  :host([bookmarks]) .banner { display: none; }
  :host([bookmarks]) .list { border-top: 1px solid rgb(0 27 52 / 16%); border-radius: 6px; overflow: hidden; }
  :host([bookmarks]) .list:has(> .message) { border: 0; }
  :host([bookmarks]) .message { padding: 16px; }
  .bookmarks-header {
    padding: 18px;
    border: 1px solid rgb(0 27 52 / 20%);
    border-radius: 8px;
    background: rgb(255 255 255 / 24%);
  }
  .bookmarks-title {
    margin: 0; color: var(--bs-navy);
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
    display: block; width: 100%; height: auto; border-radius: 6px 6px 0 0;
  }
  .round {
    position: absolute; top: 8px; right: 8px;
    display: grid; place-items: center;
    width: 42px; height: 42px; padding: 0;
    border: 0; border-radius: 50%;
    background: var(--bs-action); color: var(--bs-action-ink);
    box-shadow: var(--bs-action-shadow);
    cursor: pointer;
  }
  .round svg {
    display: block; width: 18px; height: 18px;
    transition: transform .2s ease;
  }
  .round:hover,
  .round:focus-visible { background: var(--bs-action-hover); }
  .round:hover svg,
  .round:focus-visible svg { transform: scale(1.08); }
  .round:focus-visible { outline: 2px solid #fff; outline-offset: -4px; }
  .round:disabled { cursor: default; opacity: .55; }
  .refresh.is-spinning svg { animation: spin .6s ease; }
  @keyframes spin { from { rotate: 0deg; } to { rotate: 360deg; } }

  /* The cards sit flush under the banner, one panel with square bottom corners. */
  .list {
    display: grid;
    border: 1px solid rgb(0 27 52 / 16%);
    border-top: 0;
  }
  .message {
    margin: 0; padding: 16px 4px; color: #4f5c65;
    font: 1rem/1.5 'Roboto', Arial, sans-serif;
  }

  /* The whole card is the button's hit area (its ::after covers the card),
     so the heading stays a heading. */
  .saying {
    position: relative;
    display: grid;
    grid-template-columns: var(--symbol-column) minmax(0, 1fr);
    align-items: start;
    padding: 18px 0;
    background: rgb(255 255 255 / 34%);
    transition: background-color .2s ease;
  }
  .saying:nth-child(even) { background: rgb(198 146 46 / 12%); }
  .saying:hover { background: rgb(255 255 255 / 62%); }
  .saying:nth-child(even):hover { background: rgb(198 146 46 / 22%); }
  .saying:has(.open:focus-visible) {
    outline: 2px solid var(--bs-reference); outline-offset: -2px;
  }
  /* The book thumbnail, blown up until its gold frame alone fills the square
     and clipped to the frame's own corner (set per book). */
  .symbol {
    position: relative; display: block; overflow: hidden;
    width: var(--bs-symbol-size); height: var(--bs-symbol-size);
    justify-self: center;
  }
  .symbol img { position: absolute; display: block; }
  .body {
    min-width: 0; padding: 0 18px;
    border-left: 1px solid var(--bs-edge);
  }
  .title {
    margin: 0 0 8px; color: var(--bs-navy); overflow-wrap: anywhere;
    font: 400 clamp(1.25rem, 1.1rem + .6vw, 1.5rem)/1.2 'Germania One', Georgia, serif;
  }
  .open {
    padding: 0; border: 0; background: none;
    color: inherit; font: inherit; text-align: inherit;
    cursor: pointer;
  }
  .open:focus { outline: none; }
  .open::after { content: ""; position: absolute; inset: 0; }
  .text {
    margin: 0;
    font: 400 clamp(1rem, .95rem + .3vw, 1.125rem)/1.5 'Strait', 'Roboto', sans-serif;
  }
  .card-reference {
    display: block; margin: 12px 0 0;
    color: var(--bs-reference);
    font: 400 clamp(.9375rem, .9rem + .2vw, 1rem)/1.4 'Strait', 'Roboto', sans-serif;
  }

  /* Popup */
  dialog:focus { outline: none; }
  dialog {
    width: min(92vw, 620px);
    max-height: 92dvh;
    padding: 0;
    overflow: auto;
    overscroll-behavior: contain;
    border: 0;
    border-radius: 14px;
    background: var(--bs-paper);
    color: var(--bs-ink);
    box-shadow: 0 24px 60px rgb(0 27 52 / 45%);
    /* A tap closes it, but it is read first: the plain arrow, with the hand
       kept for the reference buttons. */
    cursor: default;
  }
  dialog::backdrop {
    background: rgb(0 27 52 / 62%);
    backdrop-filter: blur(3px);
  }
  dialog .banner-image { border-radius: 14px 14px 0 0; }
  .detail { display: grid; gap: 18px; padding: 20px 22px 24px; }
  .detail-head {
    display: grid; grid-template-columns: auto minmax(0, 1fr);
    align-items: center; gap: 16px;
  }
  .detail-head .symbol { --bs-symbol-size: 56px; }
  .detail-title {
    margin: 0; color: var(--bs-navy); overflow-wrap: anywhere;
    font: 400 clamp(1.5rem, 1.3rem + .9vw, 1.9rem)/1.15 'Germania One', Georgia, serif;
  }
  .variants {
    margin: 6px 0 0; color: #4f5c65;
    font: 400 .9375rem/1.4 'Strait', 'Roboto', sans-serif;
  }
  .part { display: grid; gap: 6px; }
  .label {
    margin: 0; color: #805b18;
    font: 700 .75rem/1.2 'Roboto', Arial, sans-serif;
    letter-spacing: .12em; text-transform: uppercase;
  }
  .part .text { overflow-wrap: anywhere; }
  .scripture {
    margin: 0; padding: 14px 16px;
    border-left: 3px solid var(--bs-reference);
    border-radius: 0 6px 6px 0;
    background: rgb(255 255 255 / 45%);
  }
  .scripture p {
    margin: 0;
    font: 400 clamp(1rem, .95rem + .3vw, 1.125rem)/1.55 Georgia, 'Times New Roman', serif;
  }
  .references { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 8px; }
  .reference {
    padding: 4px 0;
    border: 0; background: none;
    color: var(--bs-reference); cursor: pointer;
    font: 400 clamp(.9375rem, .9rem + .2vw, 1rem)/1.4 'Strait', 'Roboto', sans-serif;
    text-decoration: underline;
    text-decoration-color: rgb(198 40 40 / 35%);
    text-underline-offset: 3px;
  }
  .reference:hover { text-decoration-color: currentColor; }
  .reference:focus-visible {
    outline: 2px solid var(--bs-reference); outline-offset: 3px; border-radius: 3px;
  }
  .tags { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; list-style: none; }
  .tags li {
    padding: 4px 10px;
    border: 1px solid var(--bs-edge); border-radius: 999px;
    color: var(--bs-navy);
    font: 500 .8125rem/1.3 'Roboto', Arial, sans-serif;
  }

  @media (max-width: 650px) {
    :host { --symbol-column: 6.25rem; --bs-symbol-size: 68px; }
    .round { top: 4px; right: 4px; width: 36px; height: 36px; }
    .round svg { width: 16px; height: 16px; }
    .body { padding-inline: 12px; }
    .detail { padding: 16px 16px 20px; }
    .detail-head .symbol { --bs-symbol-size: 44px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .round svg, .refresh.is-spinning svg { transition: none; animation: none; }
    .saying { transition: none; }
  }
${BOOKMARK_STYLES}`;

export class BibleSayings extends HTMLElement {
  static observedAttributes = ['media-base', 'src', 'count'];

  #root;
  #list;
  #refreshButton;
  #status;
  #dialog;
  #detail;
  #bookmarksHeader;
  #sayings = [];
  #shownIds = new Set();
  #loading = null;
  #hold;
  #showingBookmarks = false;
  #opener = null;
  #previousOverflow = '';

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <section role="region" aria-label="Bible sayings in everyday English">
        <div class="banner">
          <img class="banner-image" src="${BANNER_URL}" alt="" width="2560" height="640" loading="lazy" />
          <button class="round refresh" type="button" aria-label="Show more Bible sayings"
                  title="Show more Bible sayings" disabled>
            ${REFRESH_ICON}
          </button>
        </div>
        <header class="bookmarks-header" hidden>
          <h3 class="bookmarks-title">Bookmarked sayings</h3>
          <p class="bookmarks-summary"></p>
        </header>
        <div class="list"><p class="message">Loading Bible sayings…</p></div>
        <p class="visually-hidden" role="status" aria-atomic="true"></p>
      </section>
      <dialog tabindex="-1" aria-labelledby="detail-title">
        <img class="banner-image" src="${BANNER_URL}" alt="" width="2560" height="640" />
        <div class="detail"></div>
      </dialog>`;
    this.#list = this.#root.querySelector('.list');
    this.#refreshButton = this.#root.querySelector('.refresh');
    this.#status = this.#root.querySelector('[role="status"]');
    this.#dialog = this.#root.querySelector('dialog');
    this.#detail = this.#root.querySelector('.detail');
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

    // The whole card opens the popup, and a hold must not: CardHold swallows
    // the click that ends it.
    this.#hold = new CardHold(this.#list, {
      selector: '.saying',
      onHold: (card) => {
        const { id } = card.dataset;
        const result = bookmarks.toggle(id);
        showBookmarkResult(card, result, bookmarks.limit);
        this.#status.textContent = `${card.querySelector('.open').textContent}: ${bookmarkNote(result, bookmarks.limit)}`;
        if (result === 'added' || result === 'removed') {
          this.dispatchEvent(new CustomEvent('bookmarkchange', { detail: { id, result } }));
        }
      },
    });

    // Escape would close instantly; route it through the closing animation instead.
    this.#dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      this.close();
    });
    // A tap anywhere closes the popup, except on the reference buttons.
    this.#dialog.addEventListener('click', (event) => {
      if (event.composedPath().some((node) => node.nodeName === 'BUTTON')) return;
      this.close();
    });
  }

  connectedCallback() {
    registerFonts();
    bookmarks.addEventListener('change', this.#syncBookmarks);
    this.#syncBookmarks();
    if (!this.#sayings.length) this.#load();
  }

  disconnectedCallback() {
    bookmarks.removeEventListener('change', this.#syncBookmarks);
    this.#hold.cancel();
    if (this.#dialog.open) this.#finishClose();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.isConnected) return;
    if (name === 'src') {
      this.#sayings = [];
      this.#shownIds = new Set();
      this.#load();
    } else if (this.#showingBookmarks) {
      this.showBookmarks();
    } else if (this.#sayings.length) {
      // media-base changes symbol URLs; count changes the batch size.
      this.#render(this.#currentSayings());
    }
  }

  /** The bookmarked saying ids, newest first. */
  get bookmarks() {
    return bookmarks.read();
  }

  get #mediaBase() {
    const base = this.getAttribute('media-base') || DEFAULT_MEDIA_BASE;
    return base.endsWith('/') ? base : `${base}/`;
  }

  get #count() {
    const count = Number.parseInt(this.getAttribute('count'), 10);
    return count > 0 ? count : DEFAULT_COUNT;
  }

  #currentSayings() {
    const shown = this.#sayings.filter((saying) => this.#shownIds.has(saying.id));
    return shown.length ? shown : this.#pick();
  }

  #load() {
    const src = this.getAttribute('src') || DEFAULT_SRC;
    const loading = (this.#loading = readSayings(new URL(src, document.baseURI).href)
      .then((sayings) => {
        if (loading !== this.#loading) return; // superseded by a newer src
        this.#sayings = sayings.filter((saying) => saying.id && saying.saying && saying.meaning);
        if (!this.#sayings.length) throw new Error('No Bible sayings are available.');
        this.#refreshButton.disabled = false;
        if (this.hasAttribute('bookmarks')) this.showBookmarks();
        else this.refresh();
        this.dispatchEvent(new CustomEvent('ready', { detail: { total: this.#sayings.length } }));
      })
      .catch((error) => {
        if (loading !== this.#loading) return;
        console.warn('Bible sayings could not be loaded:', error);
        const message = document.createElement('p');
        message.className = 'message';
        message.textContent = 'Bible sayings could not be loaded. Please reload the page to try again.';
        this.#list.replaceChildren(message);
        this.dispatchEvent(new CustomEvent('error', { detail: { message: error.message } }));
      }));
  }

  /** Draws from sayings not in the previous batch, so a refresh never repeats. */
  #pick() {
    const count = this.#count;
    const unseen = this.#sayings.filter((saying) => !this.#shownIds.has(saying.id));
    const pool = unseen.length >= count ? unseen : this.#sayings.slice();
    for (let index = pool.length - 1; index > 0; index--) {
      const swap = Math.floor(Math.random() * (index + 1));
      [pool[index], pool[swap]] = [pool[swap], pool[index]];
    }
    return pool.slice(0, Math.min(count, pool.length));
  }

  #createSymbol(book) {
    const symbol = document.createElement('span');
    symbol.className = 'symbol';
    // Keep the column width so cards stay aligned when a thumbnail is missing.
    if (!book) {
      symbol.style.visibility = 'hidden';
      return symbol;
    }
    const image = document.createElement('img');
    image.alt = '';
    image.loading = 'lazy';
    image.onerror = () => { symbol.style.visibility = 'hidden'; };
    image.src = bookThumbnailUrl(this.#mediaBase, book);
    const [x, y, size, radius] = BOOK_THUMB_BOUNDS[book] ?? DEFAULT_THUMB_BOUNDS;
    const side = size * THUMBNAIL_TRIM;
    const inset = (size - side) / 2;
    image.style.width = `${100 / side}%`;
    image.style.height = `${100 / side}%`;
    image.style.left = `${(-(x + inset) / side) * 100}%`;
    image.style.top = `${(-(y + inset) / side) * 100}%`;
    symbol.style.borderRadius = `${radius * 100}%`;
    symbol.append(image);
    return symbol;
  }

  #createSaying(saying) {
    const card = document.createElement('article');
    card.className = 'saying bookmarkable';
    card.dataset.id = saying.id;
    card.classList.toggle('bookmarked', bookmarks.has(saying.id));

    const body = document.createElement('div');
    body.className = 'body';
    const title = document.createElement('h4');
    title.className = 'title';
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'open';
    open.textContent = saying.saying;
    open.setAttribute('aria-haspopup', 'dialog');
    open.addEventListener('click', () => this.open(saying.id));
    title.append(open);

    const meaning = document.createElement('p');
    meaning.className = 'text';
    meaning.textContent = saying.meaning;
    body.append(title, meaning);

    if (saying.reference) {
      const reference = document.createElement('span');
      reference.className = 'card-reference';
      reference.textContent = `(${saying.reference})`;
      body.append(reference);
    }

    card.append(this.#createSymbol(saying.book), body);
    return card;
  }

  #render(sayings) {
    this.#showingBookmarks = false;
    this.#bookmarksHeader.hidden = true;
    this.#shownIds = new Set(sayings.map((saying) => saying.id));
    this.#list.replaceChildren(...sayings.map((saying) => this.#createSaying(saying)));
    this.#status.textContent = `${sayings.length} Bible sayings shown, starting with ${sayings[0].saying}.`;
  }

  #part(label, ...content) {
    const part = document.createElement('div');
    part.className = 'part';
    const heading = document.createElement('h4');
    heading.className = 'label';
    heading.textContent = label;
    part.append(heading, ...content);
    return part;
  }

  #paragraph(text) {
    const paragraph = document.createElement('p');
    paragraph.className = 'text';
    paragraph.textContent = text;
    return paragraph;
  }

  #referenceButton(reference, book) {
    // The reference opens the passage itself; the page decides how to show it.
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'reference';
    button.textContent = reference;
    button.setAttribute('aria-label', `Read ${reference}`);
    button.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('verse-request', {
        bubbles: true,
        composed: true,
        detail: { reference, book: book ?? null },
      }));
    });
    return button;
  }

  #renderDetail(saying) {
    const head = document.createElement('div');
    head.className = 'detail-head';
    const heading = document.createElement('div');
    const title = document.createElement('h3');
    title.className = 'detail-title';
    title.id = 'detail-title';
    title.textContent = saying.saying;
    heading.append(title);
    if (saying.variants?.length) {
      const variants = document.createElement('p');
      variants.className = 'variants';
      variants.textContent = `Also said: ${saying.variants.join(' · ')}`;
      heading.append(variants);
    }
    head.append(this.#createSymbol(saying.book), heading);

    const parts = [head, this.#part('What it means', this.#paragraph(saying.meaning))];
    if (saying.explanation) {
      parts.push(this.#part('Where it comes from', this.#paragraph(saying.explanation)));
    }

    if (saying.reference) {
      const scripture = [];
      if (saying.kjv_text) {
        const quote = document.createElement('blockquote');
        quote.className = 'scripture';
        const text = document.createElement('p');
        text.textContent = saying.kjv_text;
        quote.append(text);
        scripture.push(quote);
      }
      const references = document.createElement('div');
      references.className = 'references';
      const all = saying.references?.length ? saying.references : [saying.reference];
      // Only the primary reference is in the saying's own book.
      references.append(...all.map((reference, index) =>
        this.#referenceButton(reference, index === 0 ? saying.book : null)));
      scripture.push(references);
      parts.push(this.#part('Scripture (KJV)', ...scripture));
    }

    const tags = document.createElement('ul');
    tags.className = 'tags';
    tags.setAttribute('aria-label', 'About this saying');
    for (const tag of [
      saying.theme,
      saying.testament && `${saying.testament} Testament`,
      WORDING_LABELS[saying.wording],
    ]) {
      if (!tag) continue;
      const item = document.createElement('li');
      item.textContent = tag;
      tags.append(item);
    }
    if (tags.childElementCount) parts.push(tags);

    this.#detail.replaceChildren(...parts);
  }

  #pop(direction) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve();
    const opening = direction === 'open';
    const options = {
      duration: opening ? 460 : 220,
      // A little overshoot on the way in gives the card its pop.
      easing: opening ? 'cubic-bezier(.2, .9, .25, 1.2)' : 'cubic-bezier(.4, 0, 1, 1)',
      fill: 'forwards',
    };
    const card = this.#dialog.animate(
      opening
        ? [{ transform: 'scale(.82) translateY(28px)', opacity: 0 }, { transform: 'none', opacity: 1 }]
        : [{ transform: 'none', opacity: 1 }, { transform: 'scale(.94)', opacity: 0 }],
      options,
    );
    this.#dialog.animate(
      opening ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }],
      { ...options, easing: 'ease', pseudoElement: '::backdrop' },
    );
    return card.finished.catch(() => {});
  }

  /** Pop up the full entry for one saying. */
  open(id) {
    const saying = this.#sayings.find((item) => item.id === id);
    if (!saying || this.#dialog.dataset.closing !== undefined) return;
    this.#renderDetail(saying);
    this.#dialog.scrollTop = 0;
    if (!this.#dialog.open) {
      this.#opener = this.#root.activeElement;
      this.#previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      this.#dialog.showModal();
      // showModal would otherwise focus the first reference and ring it. The
      // dialog itself takes the focus instead.
      this.#dialog.focus();
      this.#pop('open');
    }
    this.dispatchEvent(new CustomEvent('open', { detail: { id } }));
  }

  async close() {
    if (!this.#dialog.open || this.#dialog.dataset.closing !== undefined) return;
    this.#dialog.dataset.closing = '';
    await this.#pop('close');
    this.#finishClose();
  }

  #finishClose() {
    this.#dialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    this.#dialog.close();
    delete this.#dialog.dataset.closing;
    document.documentElement.style.overflow = this.#previousOverflow;
    if (this.#opener?.isConnected) this.#opener.focus({ preventScroll: true });
    this.#opener = null;
  }

  #bookmarksSummary() {
    return `${bookmarks.read().length} of ${bookmarks.limit} saved sayings, newest first. `
      + 'Hold a saying to remove its bookmark.';
  }

  /**
   * Show the bookmarked sayings, newest first. A saying taken off here keeps
   * its card, without the ribbon, so holding it again puts the bookmark back.
   */
  showBookmarks() {
    if (!this.#sayings.length) return;
    this.#showingBookmarks = true;
    const sayings = bookmarks.read()
      .map((id) => this.#sayings.find((saying) => saying.id === id))
      .filter(Boolean);
    this.#bookmarksHeader.hidden = !sayings.length;
    if (!sayings.length) {
      const message = document.createElement('p');
      message.className = 'message';
      message.textContent = 'No bookmarked sayings yet. Hold a saying in the Bible sayings for half a second to bookmark it.';
      this.#list.replaceChildren(message);
      this.#status.textContent = message.textContent;
      return;
    }
    this.#bookmarksHeader.querySelector('.bookmarks-summary').textContent = this.#bookmarksSummary();
    this.#list.replaceChildren(...sayings.map((saying) => this.#createSaying(saying)));
    this.#status.textContent = `Bookmarked sayings. ${this.#bookmarksSummary()}`;
  }

  #syncBookmarks = () => {
    const saved = new Set(bookmarks.read());
    for (const card of this.#list.querySelectorAll('.saying')) {
      card.classList.toggle('bookmarked', saved.has(card.dataset.id));
    }
    if (this.#showingBookmarks) {
      this.#bookmarksHeader.querySelector('.bookmarks-summary').textContent = this.#bookmarksSummary();
    }
  };

  /** Show a new batch of sayings, none repeated from the previous batch. */
  refresh() {
    if (!this.#sayings.length) return;
    const sayings = this.#pick();
    this.#render(sayings);
    this.dispatchEvent(new CustomEvent('refresh', { detail: { ids: sayings.map((saying) => saying.id) } }));
  }
}

if (!customElements.get('bible-sayings')) {
  customElements.define('bible-sayings', BibleSayings);
}
