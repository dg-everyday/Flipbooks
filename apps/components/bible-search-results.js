/**
 * <bible-search-results> — the Bible verse search results panel as a web component.
 *
 * The component only displays results. Your page owns the search form, the
 * reference parsing and the database, and drives the component through its
 * methods. It renders the book header (symbol, name, Hebrew name, overview),
 * a "N verses found" summary and a scrolling reader that loads verses in
 * batches as you scroll or press "Load more verses". Each verse card has a
 * dog-eared corner that opens the verse's explanation in a popup; the
 * explanations are fetched one chapter at a time from explanations-base.
 *
 * Usage
 *   <bible-search-results id="results" media-base="https://.../media/"></bible-search-results>
 *   <script type="module" src="./apps/components/bible-search-results.js"></script>
 *
 *   results.loading('Loading Bible verses…');
 *   results.showVerses(rows);   // rows: [{ book_name, book_id, chapter, verse, text }]
 *   results.showKeywordResults(rows, ['grace', 'faith']);  // rows from any books
 *   results.showMessage('No verses found.');
 *   results.reset();            // clear and hide
 *
 * The host is hidden until one of loading / showMessage / showVerses is called.
 *
 * Attributes
 *   media-base      Base URL for book symbols (images/symbols/<Book>-symbol.svg).
 *                   Default: http://localhost:9001/media/
 *   metadata-src    URL of the bundled book metadata used when the symbol SVG
 *                   cannot be read cross-origin (resolved against the page).
 *                   Default: ../../assets/book-metadata.json (relative to this file)
 *   batch-size      Verses added per batch. Default: 24
 *   compact         Present: hide the "N verses found" summary and the
 *                   end-of-results note. For popups showing one passage.
 *   explanations-base  Folder of <book_id>/<chapter>.json explanation files
 *                   (resolved against the page). Rows without a book_id get
 *                   no explanation corner.
 *                   Default: ../../assets/explanations/ (relative to this file)
 *   explaining      Set by the component while the explanation popup is open,
 *                   so the page can lock its own scrolling.
 *
 * Methods      reset(), loading(message), showMessage(message), showVerses(rows),
 *              showKeywordResults(rows, words)
 * Properties   busy (read-only)
 *
 * CSS custom properties
 *   --search-navy, --search-ink, --search-hebrew, --search-paper,
 *   --reference-width
 *
 * Fonts: Germania One, Strait and Roboto are registered on the document by
 * assets/scripts/fonts.js.
 */

import { registerFonts } from '../../assets/scripts/fonts.js';

// Citations use "Psalm"; the symbol library files that book under its plural name.
const SYMBOL_BOOK_NAMES = { Psalm: 'Psalms' };
const bookSymbolUrl = (mediaBase, book) =>
  `${mediaBase}images/symbols/${encodeURIComponent(SYMBOL_BOOK_NAMES[book] ?? book)}-symbol.svg`;

// const DEFAULT_MEDIA_BASE = 'https://dailygrace.faith/media/';
const DEFAULT_MEDIA_BASE = 'http://localhost:9001/media/';
const DEFAULT_BATCH_SIZE = 24;
const DEFAULT_METADATA_SRC = new URL('../../assets/book-metadata.json', import.meta.url).href;
const DEFAULT_EXPLANATIONS_BASE = new URL('../../assets/explanations/', import.meta.url).href;

// The "source" of each entry in an explanation file (see tools/explanations).
const EXPLANATION_SOURCES = {
  jfb: 'Jamieson-Fausset-Brown Bible Commentary (1871)',
  gill: 'John Gill, Exposition of the Entire Bible (1746–63)',
};

const STYLES = /* css */ `
  :host {
    --search-navy: #001b34;
    --search-ink: #10253b;
    --search-hebrew: #963d32;
    --search-gold: #a8810c;
    --search-paper: #f3e7d2;
    --reference-width: 6.25rem;

    display: block;
    color: var(--search-ink);
  }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }

  .visually-hidden {
    position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  .book-header {
    display: grid;
    grid-template-columns: var(--reference-width) minmax(0, 1fr);
    align-items: center;
    padding: 18px 0;
    border: 1px solid rgb(0 27 52 / 20%);
    border-radius: 8px;
    background: rgb(255 255 255 / 24%);
  }
  .book-symbol {
    grid-column: 1;
    width: 64px; height: 64px;
    justify-self: center; object-fit: contain;
  }
  .book-details {
    grid-column: 2; min-width: 0; padding: 0 18px;
    border-left: 1px solid rgb(128 91 24 / 35%);
  }
  .book-header h2 {
    display: flex; flex-wrap: wrap; align-items: baseline;
    gap: 4px 12px; margin: 0;
    color: var(--search-navy); overflow-wrap: anywhere;
    font: 400 clamp(1.75rem, 1.4rem + 1.5vw, 2.25rem)/1.15 'Germania One', Georgia, serif;
  }
  .book-hebrew {
    color: var(--search-hebrew);
    font: 400 1.3rem/1.4 Arial, sans-serif;
  }
  .book-description {
    margin: 8px 0 0;
    font: 400 1.125rem/1.45 'Strait', 'Roboto', sans-serif;
  }

  .summary, .message, .end {
    font: .8125rem/1.5 'Roboto', Arial, sans-serif;
    color: #4f5c65;
  }
  .summary { margin: 10px 2px; }
  /* In a popup the passage speaks for itself: no counts, no end-of-list note. */
  :host([compact]) .summary,
  :host([compact]) .end { display: none; }
  .message { margin: 0; padding: 16px; font-size: 1rem; }

  .reader {
    max-height: min(65vh, 640px);
    overflow-y: auto;
    /* Keep the batches loaded by the infinite scroll inside this box: without
       paint containment their height leaks into the document's scroll height
       and leaves blank background below the footer. */
    contain: paint;
    scrollbar-gutter: stable;
    scrollbar-width: thin;
    scrollbar-color: #a2957a transparent;
    scroll-behavior: auto;
  }
  .verse-list { display: grid; gap: 8px; }
  .verse-card {
    position: relative;
    display: grid;
    grid-template-columns: var(--reference-width) minmax(0, 1fr);
    align-items: start;
    padding: 16px 0;
    border: 1px solid rgb(0 27 52 / 16%);
    border-radius: 6px;
    background: rgb(255 255 255 / 16%);
  }
  /* The dog-eared corner opens the verse's explanation. The card's corner is
     cut away so the panel shows through, and the flap is the back of the
     paper folded up over the card, creased along the cut. It stays small
     enough to clear the text above the card's bottom padding. */
  .verse-card.explainable {
    --fold: 24px;
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--fold)),
      calc(100% - var(--fold)) 100%, 0 100%);
    transition: clip-path .15s ease;
  }
  .verse-card.explainable:has(.explain:hover, .explain:focus-visible) { --fold: 30px; }
  /* A full 44px tap target on the card's outer corner, over its border. */
  .explain {
    position: absolute; right: -1px; bottom: -1px;
    width: 44px; height: 44px; padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    filter: drop-shadow(-1px -1px 1.5px rgb(0 27 52 / 28%));
  }
  .explain::before {
    content: '';
    position: absolute; right: 0; bottom: 0;
    width: var(--fold); height: var(--fold);
    border-top-left-radius: 3px;
    background: linear-gradient(135deg, #fffaf1 0%, #f1e5cd 34%, #dcc9a6 50%);
    clip-path: polygon(0 0, 100% 0, 0 100%);
    transition: width .15s ease, height .15s ease;
  }
  .explain:focus-visible { outline: none; }
  .explain:focus-visible::before {
    background: linear-gradient(135deg, #fffaf1 0%, #e9dcc0 30%, var(--search-navy) 50%);
  }
  /* Keyword results: a header for the search itself, the book named on each
     card, and the matched words marked in the text. */
  .keyword-header { grid-template-columns: minmax(0, 1fr); }
  .keyword-header .book-details { grid-column: 1; border-left: 0; }
  .keyword-header h2 { font: 400 1.375rem/1.3 'Strait', 'Roboto', sans-serif; }
  .verse-book-symbol {
    display: block;
    width: 32px; height: 32px;
    margin: 0 auto 2px;
    object-fit: contain;
  }
  /* Sized so the longest single words (Thessalonians, Ecclesiastes) still fit
     the narrow phone column; longer names wrap only between words. */
  .verse-book {
    display: block;
    padding: 0 2px 4px;
    text-align: center;
    color: var(--search-hebrew);
    overflow-wrap: break-word;
    font: 400 .875rem/1.2 'Strait', 'Roboto', sans-serif;
  }
  .verse-text mark {
    padding: 0 .08em;
    border-radius: 3px;
    background: rgb(168 129 12 / 24%);
    color: inherit;
  }
  .verse-reference { margin: 0; font-weight: 400; }
  .verse-numbers {
    display: flex; align-items: flex-start; justify-content: center;
    gap: 1px; padding: 2px 5px;
    color: var(--search-navy);
    font-variant-numeric: lining-nums tabular-nums;
  }
  .chapter-number { font: 500 .9375rem/1.5 'Roboto', Arial, sans-serif; }
  .verse-number { font: 400 2.25rem/1 Georgia, 'Times New Roman', serif; }
  /* Verse 1 opens a chapter, so its numbers become a gold marker you can find
     at a glance while scrolling a long book. */
  .chapter-start .verse-numbers {
    margin-inline: 12px;
    padding: 8px 6px 10px;
    border-radius: 6px;
    background: var(--search-gold);
    color: #fff;
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 20%), 0 1px 3px rgb(0 27 52 / 22%);
  }
  .chapter-start .chapter-number { color: rgb(255 255 255 / 85%); }
  .chapter-start .verse-text { border-left-color: rgb(168 129 12 / 55%); }
  .verse-text {
    min-height: 2.5rem; margin: 0; padding: 0 18px;
    border-left: 1px solid rgb(128 91 24 / 35%);
    overflow-wrap: anywhere;
    font: 400 clamp(1.125rem, 1.05rem + .35vw, 1.25rem)/1.3 'Strait', 'Roboto', sans-serif;
  }
  .load-more {
    display: block; min-height: 44px; margin: 12px auto 4px; padding: 10px 20px;
    border: 1px solid rgb(0 27 52 / 25%); border-radius: 999px;
    background: transparent; color: var(--search-navy);
    font: 500 .875rem/1.4 'Roboto', Arial, sans-serif;
    cursor: pointer;
  }
  .load-more:hover { background: rgb(255 255 255 / 35%); }
  .load-more[aria-disabled="true"] { cursor: default; }
  .reader:focus-visible,
  .load-more:focus-visible { outline: 2px solid var(--search-navy); outline-offset: -2px; }
  .end { margin: 16px 0 6px; text-align: center; }

  /* Explanation popup: the book header's layout, with the reference as the
     title and the commentary where the overview would be. */
  .explanation {
    width: min(640px, 92vw);
    max-height: 88vh;
    max-height: 88dvh;
    padding: 14px;
    border: 0;
    border-radius: 16px;
    background: var(--search-paper);
    color: var(--search-ink);
    box-shadow: 0 24px 60px rgb(0 27 52 / 40%);
    overflow: auto;
    overscroll-behavior: contain;
    /* Not the zoom-out cursor of a verse popup this panel may sit in. */
    cursor: auto;
  }
  .explanation::backdrop {
    background: rgb(0 27 52 / 60%);
    backdrop-filter: blur(3px);
  }
  .explanation-card { position: relative; align-items: start; }
  .explanation-card .book-symbol { margin-top: 4px; }
  .explanation-card h2 { padding-right: 32px; }
  .explanation-card .verse-numbers { padding: 0; }
  .explanation-body {
    margin-top: 10px;
    font: 400 1.0625rem/1.5 'Strait', 'Roboto', sans-serif;
  }
  .explanation-body p { margin: 0 0 .75em; }
  .explanation-body p:last-child { margin-bottom: 0; }
  .explanation-body strong { color: var(--search-navy); font-weight: 700; }
  .explanation-body .message { padding: 0; }
  .explanation-source {
    margin: 14px 0 0; padding-top: 10px;
    border-top: 1px solid rgb(128 91 24 / 25%);
    font: .8125rem/1.5 'Roboto', Arial, sans-serif;
    color: #4f5c65;
  }
  .explanation-close {
    position: absolute; top: 6px; right: 6px;
    width: 36px; height: 36px; padding: 0;
    border: 0; border-radius: 50%;
    background: transparent; color: var(--search-navy);
    font: 400 1.5rem/1 'Roboto', Arial, sans-serif;
    cursor: pointer;
  }
  .explanation-close:hover { background: rgb(0 27 52 / 8%); }
  .explanation-close:focus-visible { outline: 2px solid var(--search-navy); outline-offset: 2px; }

  @media (max-width: 420px) {
    /* Too narrow for the symbol column: give the commentary the full width. */
    .explanation { padding: 10px; }
    .explanation-card { grid-template-columns: minmax(0, 1fr); padding: 14px 0; }
    .explanation-card .book-symbol { display: none; }
    .explanation-card .book-details { grid-column: 1; border-left: 0; }
  }

  @media (max-width: 420px) {
    :host { --reference-width: 5.25rem; }
    .book-symbol { width: 52px; height: 52px; }
    .book-details, .verse-text { padding-inline: 12px; }
    .book-hebrew { font-size: 1.125rem; }
    .chapter-number { font-size: .8125rem; }
    .verse-number { font-size: 1.875rem; }
    .chapter-start .verse-numbers { margin-inline: 8px; padding: 7px 4px 9px; }
    .verse-book { font-size: .8125rem; }
  }
`;

// Metadata is shared by every instance: one fetch per symbol URL, one for the bundled snapshot.
const bookMetadataCache = new Map();
let bundledBookMetadata = null;

function getSvgMetadata(svgString) {
  const doc = new DOMParser().parseFromString(svgString, 'image/svg+xml');
  if (doc.querySelector('parsererror')) throw new Error('Invalid SVG: could not be parsed');
  const getText = (selector) => doc.querySelector(selector)?.textContent.trim() ?? null;
  return {
    title: getText('title[id="title"]'),
    description: getText('desc[id="description"]'),
  };
}

async function getSvgMetadataFromUrl(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Failed to fetch SVG: ${response.status}`);
  return getSvgMetadata(await response.text());
}

// Explanations are shared by every instance: one fetch per chapter file.
const explanationCache = new Map();

function loadChapterExplanations(url) {
  if (!explanationCache.has(url)) {
    const request = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to fetch explanations: ${response.status}`);
        return response.json();
      })
      .catch((error) => {
        explanationCache.delete(url);
        throw error;
      });
    explanationCache.set(url, request);
  }
  return explanationCache.get(url);
}

const comparable = (text) =>
  text.toLowerCase().replace(/&c\.?/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();

// Both commentaries open a paragraph with the words of the verse it explains:
// JFB as "words--note", Gill as "words,.... note". Those words are set in bold,
// but only when they really are in the verse, so a dash in ordinary prose is
// left alone.
const LEAD_WORDS = /^([^\n]{1,200}?)(?:--|,?\.{4})\s*/;

function explanationParagraph(block, verseText) {
  const paragraph = document.createElement('p');
  const match = block.match(LEAD_WORDS);
  const lead = match && comparable(match[1]);
  if (lead && comparable(verseText).includes(lead)) {
    const words = document.createElement('strong');
    words.textContent = match[1].trim();
    const rest = block.slice(match[0].length).replace(/--/g, '—');
    paragraph.append(words, rest ? ` — ${rest}` : '');
  } else {
    paragraph.textContent = block.replace(/--/g, '—');
  }
  return paragraph;
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Split text into strings and <mark>s around each match of a global pattern. */
function highlightedText(text, pattern) {
  const parts = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const mark = document.createElement('mark');
    mark.textContent = match[0];
    parts.push(mark);
    last = match.index + match[0].length;
  }
  parts.push(text.slice(last));
  return parts;
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// The same pop the page's own popups use (assets/scripts/script.js).
function popDialog(dialog, direction) {
  const opening = direction === 'open';
  const options = {
    duration: opening ? 460 : 220,
    easing: opening ? 'cubic-bezier(.2, .9, .25, 1.2)' : 'cubic-bezier(.4, 0, 1, 1)',
    fill: 'forwards',
  };
  const entering = { transform: 'scale(.82) translateY(28px)', opacity: 0 };
  const full = { transform: 'none', opacity: 1 };
  const leaving = { transform: 'scale(.94)', opacity: 0 };
  dialog.animate(opening ? [entering, full] : [full, leaving], options);
  const backdrop = dialog.animate(
    opening ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }],
    { ...options, easing: 'ease', pseudoElement: '::backdrop' },
  );
  return backdrop.finished.catch(() => {});
}

export class BibleSearchResults extends HTMLElement {
  #root;
  #content;
  #status;
  #generation = 0;
  #observer = null;
  #explanation;
  #explanationRequest = 0;
  #explanationClosing = false;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <section aria-label="Bible verse search results"></section>
      <p class="visually-hidden" role="status" aria-atomic="true"></p>
      <dialog class="explanation" aria-labelledby="explanation-title">
        <article class="book-header explanation-card">
          <img class="book-symbol" width="64" height="64" alt="">
          <div class="book-details">
            <h2 id="explanation-title">
              <span class="visually-hidden"></span>
              <span class="explanation-book" aria-hidden="true"></span>
              <span class="verse-numbers" aria-hidden="true">
                <span class="chapter-number"></span><span class="verse-number"></span>
              </span>
            </h2>
            <div class="explanation-body"></div>
            <p class="explanation-source" hidden></p>
          </div>
          <button type="button" class="explanation-close" aria-label="Close explanation">×</button>
        </article>
      </dialog>`;
    this.#content = this.#root.querySelector('section');
    this.#status = this.#root.querySelector('[role="status"]');

    const dialog = this.#root.querySelector('.explanation');
    this.#explanation = dialog;
    dialog.querySelector('.book-symbol').onerror = (event) => { event.target.hidden = true; };
    // Only the close button closes the popup: not Escape, not a tap outside.
    // Stopping Escape at keydown also keeps Chrome from forcing the dialog shut
    // on a repeated press, which it does when only cancel is prevented.
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') event.preventDefault();
    });
    dialog.addEventListener('cancel', (event) => event.preventDefault());
    dialog.addEventListener('click', (event) => {
      // This panel may itself sit in a popup that closes on any tap.
      event.stopPropagation();
      if (event.target.closest('.explanation-close')) this.#closeExplanation();
    });
    dialog.addEventListener('close', () => this.removeAttribute('explaining'));
  }

  connectedCallback() {
    registerFonts();
    // Attributes cannot be set in the constructor, so hide an empty panel here.
    if (!this.#content.hasChildNodes()) this.hidden = true;
  }

  get busy() {
    return this.#content.getAttribute('aria-busy') === 'true';
  }

  get #mediaBase() {
    const base = this.getAttribute('media-base') || DEFAULT_MEDIA_BASE;
    return base.endsWith('/') ? base : `${base}/`;
  }

  get #batchSize() {
    const size = Number.parseInt(this.getAttribute('batch-size'), 10);
    return size > 0 ? size : DEFAULT_BATCH_SIZE;
  }

  get #explanationsBase() {
    const base = this.getAttribute('explanations-base');
    if (!base) return DEFAULT_EXPLANATIONS_BASE;
    return new URL(base.endsWith('/') ? base : `${base}/`, document.baseURI).href;
  }

  /** Clear the panel and hide it. Also cancels any pending overview lookups. */
  reset() {
    this.#generation++;
    this.#explanationRequest++;
    if (this.#explanation.open) this.#explanation.close();
    this.#observer?.disconnect();
    this.#observer = null;
    this.#content.replaceChildren();
    this.#content.removeAttribute('aria-busy');
    this.#status.textContent = '';
    this.hidden = true;
  }

  /** Show a message and mark the panel busy until the next message or results. */
  loading(message) {
    this.#showMessage(message);
    this.#content.setAttribute('aria-busy', 'true');
  }

  showMessage(message) {
    this.#showMessage(message);
    this.#content.removeAttribute('aria-busy');
  }

  #showMessage(message) {
    this.#generation++;
    this.#observer?.disconnect();
    this.#observer = null;
    const paragraph = document.createElement('p');
    paragraph.className = 'message';
    paragraph.textContent = message;
    this.#content.replaceChildren(paragraph);
    this.#status.textContent = message;
    this.hidden = false;
  }

  /** rows: [{ book_name, chapter, verse, text }] — all from the same book. */
  showVerses(rows) {
    if (!rows?.length) {
      this.showMessage('No verses found.');
      return;
    }
    this.#generation++;
    this.#observer?.disconnect();
    this.#observer = null;
    this.#content.removeAttribute('aria-busy');
    this.hidden = false;
    this.#renderVerses(rows, this.#generation);
  }

  /**
   * Results of a keyword search. rows: [{ book_name, book_id, chapter, verse, text }]
   * from any number of books; words: the keywords, highlighted in each verse.
   */
  showKeywordResults(rows, words) {
    if (!rows?.length) {
      this.showMessage('No verses found.');
      return;
    }
    this.#generation++;
    this.#observer?.disconnect();
    this.#observer = null;
    this.#content.removeAttribute('aria-busy');
    this.hidden = false;
    this.#renderVerses(rows, this.#generation, words);
  }

  #loadBundledBookMetadata() {
    if (!bundledBookMetadata) {
      const src = this.getAttribute('metadata-src') || DEFAULT_METADATA_SRC;
      bundledBookMetadata = fetch(new URL(src, document.baseURI))
        .then((response) => {
          if (!response.ok) throw new Error('Book metadata could not be loaded.');
          return response.json();
        })
        .catch((error) => {
          bundledBookMetadata = null;
          throw error;
        });
    }
    return bundledBookMetadata;
  }

  #loadBookMetadata(bookName, url) {
    if (!bookMetadataCache.has(url)) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const request = getSvgMetadataFromUrl(url, controller.signal)
        .then((metadata) => {
          if (!metadata.title || !metadata.description) throw new Error('Incomplete SVG metadata.');
          return metadata;
        })
        // This snapshot comes from the same SVGs and also works when the media
        // host permits <img> display but blocks cross-origin fetch requests.
        .catch(async () => {
          const metadata = (await this.#loadBundledBookMetadata())[bookName];
          if (!metadata) throw new Error(`No book overview found for ${bookName}.`);
          return metadata;
        })
        .catch((error) => {
          bookMetadataCache.delete(url);
          throw error;
        })
        .finally(() => clearTimeout(timeout));
      bookMetadataCache.set(url, request);
    }
    return bookMetadataCache.get(url);
  }

  #createBookHeader(bookName, generation) {
    const header = document.createElement('header');
    header.className = 'book-header';
    const symbol = document.createElement('img');
    symbol.className = 'book-symbol';
    symbol.width = 64;
    symbol.height = 64;
    symbol.alt = '';
    const symbolUrl = bookSymbolUrl(this.#mediaBase, bookName);
    symbol.onerror = () => { symbol.hidden = true; };
    symbol.src = symbolUrl;

    const details = document.createElement('div');
    details.className = 'book-details';
    const title = document.createElement('h2');
    title.id = 'book-title';
    const englishName = document.createElement('span');
    englishName.textContent = bookName;
    title.append(englishName);
    details.append(title);
    header.append(symbol, details);

    // The verse text remains available even if the optional SVG metadata fails.
    this.#loadBookMetadata(bookName, symbolUrl).then((metadata) => {
      if (generation !== this.#generation) return;
      const hebrewName = metadata.title?.split('—')[2]?.trim();
      if (hebrewName) {
        const hebrew = document.createElement('bdi');
        hebrew.className = 'book-hebrew';
        hebrew.lang = 'he';
        hebrew.dir = 'rtl';
        hebrew.textContent = hebrewName;
        title.append(hebrew);
      }
      if (metadata.description) {
        const description = document.createElement('p');
        description.className = 'book-description';
        description.textContent = metadata.description;
        details.append(description);
      }
    }).catch((error) => {
      console.warn(`Book overview unavailable for ${bookName}:`, error);
    });
    return header;
  }

  #createKeywordHeader(rows, words) {
    const header = document.createElement('header');
    header.className = 'book-header keyword-header';
    const details = document.createElement('div');
    details.className = 'book-details';
    const title = document.createElement('h2');
    title.id = 'book-title';
    title.textContent = words.map((word) => `“${word}”`).join(' ');
    const books = new Set(rows.map((row) => row.book_name)).size;
    const description = document.createElement('p');
    description.className = 'book-description';
    description.textContent = `Verses containing ${words.length === 1 ? 'this word' : 'all of these words'}, ${
      books === 1 ? 'in one book' : `across ${books} books`}.`;
    details.append(title, description);
    header.append(details);
    return header;
  }

  /** highlight: a global pattern of keywords to mark in the text, for keyword results. */
  #createVerseCard(bookName, row, highlight = null) {
    const item = document.createElement('div');
    item.setAttribute('role', 'listitem');
    const card = document.createElement('article');
    // Chapter openings only mark the way while reading one book in order.
    const chapterStart = !highlight && Number(row.verse) === 1;
    card.className = chapterStart ? 'verse-card chapter-start' : 'verse-card';
    const reference = document.createElement('h3');
    reference.className = 'verse-reference';
    const accessibleReference = document.createElement('span');
    accessibleReference.className = 'visually-hidden';
    accessibleReference.textContent = chapterStart
      ? `${bookName}, start of chapter ${row.chapter}, verse ${row.verse}`
      : `${bookName}, chapter ${row.chapter}, verse ${row.verse}`;
    const numbers = document.createElement('span');
    numbers.className = 'verse-numbers';
    numbers.setAttribute('aria-hidden', 'true');
    const chapter = document.createElement('span');
    chapter.className = 'chapter-number';
    chapter.textContent = `${row.chapter}:`;
    const verse = document.createElement('span');
    verse.className = 'verse-number';
    verse.textContent = row.verse;
    numbers.append(chapter, verse);
    reference.append(accessibleReference);
    // Keyword results span books, so each card shows its own book: symbol and
    // name. Screen readers already get the name from the hidden reference.
    if (highlight) {
      const symbol = document.createElement('img');
      symbol.className = 'verse-book-symbol';
      symbol.width = 32;
      symbol.height = 32;
      symbol.alt = '';
      symbol.loading = 'lazy';
      symbol.onerror = () => symbol.remove();
      symbol.src = bookSymbolUrl(this.#mediaBase, bookName);
      const book = document.createElement('span');
      book.className = 'verse-book';
      book.setAttribute('aria-hidden', 'true');
      book.textContent = bookName;
      reference.append(symbol, book);
    }
    reference.append(numbers);
    const text = document.createElement('p');
    text.className = 'verse-text';
    if (highlight) text.append(...highlightedText(row.text, highlight));
    else text.textContent = row.text;
    card.append(reference, text);
    if (row.book_id) {
      card.classList.add('explainable');
      card.append(this.#createExplainButton(bookName, row));
    }
    item.append(card);
    return item;
  }

  #createExplainButton(bookName, row) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'explain';
    button.title = 'Explanation';
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-label', `Explanation of ${bookName} ${row.chapter}:${row.verse}`);
    button.addEventListener('click', () => this.#openExplanation(bookName, row));
    return button;
  }

  #showExplanationMessage(message) {
    const paragraph = document.createElement('p');
    paragraph.className = 'message';
    paragraph.textContent = message;
    this.#explanation.querySelector('.explanation-body').replaceChildren(paragraph);
    this.#explanation.querySelector('.explanation-source').hidden = true;
  }

  async #openExplanation(bookName, row) {
    const request = ++this.#explanationRequest;
    const dialog = this.#explanation;
    const symbol = dialog.querySelector('.book-symbol');
    symbol.hidden = false;
    symbol.src = bookSymbolUrl(this.#mediaBase, bookName);
    dialog.querySelector('#explanation-title .visually-hidden').textContent =
      `Explanation of ${bookName} ${row.chapter}:${row.verse}`;
    dialog.querySelector('.explanation-book').textContent = bookName;
    dialog.querySelector('.chapter-number').textContent = `${row.chapter}:`;
    dialog.querySelector('.verse-number').textContent = row.verse;
    this.#showExplanationMessage('Loading explanation…');

    if (!dialog.open) {
      dialog.showModal();
      this.setAttribute('explaining', '');
      if (!reducedMotion.matches) popDialog(dialog, 'open');
    }
    dialog.scrollTop = 0;

    try {
      const url = new URL(
        `${encodeURIComponent(row.book_id)}/${Number(row.chapter)}.json`,
        this.#explanationsBase,
      ).href;
      const entry = (await loadChapterExplanations(url))[String(row.verse)];
      if (request !== this.#explanationRequest) return;
      if (!entry?.text) {
        this.#showExplanationMessage('There is no explanation for this verse yet.');
        return;
      }
      const paragraphs = entry.text.split(/\n{2,}/)
        .map((block) => explanationParagraph(block, row.text));
      dialog.querySelector('.explanation-body').replaceChildren(...paragraphs);
      const source = dialog.querySelector('.explanation-source');
      source.textContent = `From ${EXPLANATION_SOURCES[entry.source] ?? entry.source}`;
      source.hidden = false;
    } catch (error) {
      if (request !== this.#explanationRequest) return;
      console.warn(`Explanation unavailable for ${bookName} ${row.chapter}:${row.verse}:`, error);
      this.#showExplanationMessage('The explanation could not be loaded. Please try again.');
    }
  }

  async #closeExplanation() {
    const dialog = this.#explanation;
    if (!dialog.open || this.#explanationClosing) return;
    this.#explanationClosing = true;
    this.#explanationRequest++;
    if (!reducedMotion.matches) await popDialog(dialog, 'close');
    dialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    dialog.close();
    this.#explanationClosing = false;
  }

  /** words: present for keyword results, which may span many books. */
  #renderVerses(rows, generation, words = null) {
    const keywords = words?.length ? words : null;
    const bookName = rows[0].book_name;
    const batchSize = this.#batchSize;
    const header = keywords
      ? this.#createKeywordHeader(rows, keywords)
      : this.#createBookHeader(bookName, generation);
    // Keywords carry a straight apostrophe; the KJV text a curly one (brother’s).
    const highlight = keywords && new RegExp(
      `\\b(${keywords.map((word) => escapeRegExp(word).replace(/'/g, "['’]")).join('|')})\\b`, 'gi');
    const heading = keywords ? `Verses with ${keywords.join(', ')}` : bookName;
    const summary = document.createElement('p');
    summary.className = 'summary';

    const reader = document.createElement('div');
    reader.className = 'reader';
    reader.tabIndex = 0;
    reader.setAttribute('role', 'region');
    reader.setAttribute('aria-label', `${keywords ? heading : `${bookName} verses`}, scroll to read more`);
    const list = document.createElement('div');
    list.className = 'verse-list';
    list.setAttribute('role', 'list');
    list.setAttribute('aria-labelledby', 'book-title');
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'load-more';
    more.textContent = 'Load more verses';
    const end = document.createElement('p');
    end.className = 'end';
    end.textContent = 'End of results';
    end.hidden = true;
    reader.append(list, more, end);
    this.#content.replaceChildren(header, summary, reader);

    let shown = 0;
    const appendBatch = () => {
      if (generation !== this.#generation || shown >= rows.length) return;
      const fragment = document.createDocumentFragment();
      const next = Math.min(shown + batchSize, rows.length);
      for (let index = shown; index < next; index++) {
        fragment.append(this.#createVerseCard(rows[index].book_name, rows[index], highlight));
      }
      list.append(fragment);
      shown = next;
      summary.textContent = `${rows.length.toLocaleString()} verse${rows.length === 1 ? '' : 's'} found · ${shown.toLocaleString()} shown`;
      this.#status.textContent = `${heading}. ${summary.textContent}`;
      if (shown === rows.length) {
        this.#observer?.disconnect();
        end.hidden = false;
        // Preserve focus when the final batch is requested from the keyboard.
        if (this.#root.activeElement === more) {
          more.textContent = 'All verses loaded';
          more.setAttribute('aria-disabled', 'true');
          more.addEventListener('blur', () => { more.hidden = true; }, { once: true });
        } else {
          more.hidden = true;
        }
      } else if (this.#observer) {
        // Re-observe after layout so a very tall viewport can fill another batch.
        this.#observer.unobserve(more);
        this.#observer.observe(more);
      }
    };

    more.addEventListener('click', appendBatch);
    appendBatch();
    if (shown < rows.length && 'IntersectionObserver' in window) {
      this.#observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) appendBatch();
      }, { root: reader, rootMargin: '0px 0px 240px 0px' });
      this.#observer.observe(more);
    }
  }
}

if (!customElements.get('bible-search-results')) {
  customElements.define('bible-search-results', BibleSearchResults);
}
