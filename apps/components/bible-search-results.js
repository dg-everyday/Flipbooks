/**
 * <bible-search-results> — the Bible verse search results panel as a web component.
 *
 * The component only displays results. Your page owns the search form, the
 * reference parsing and the database, and drives the component through its
 * methods. It renders the book header (symbol, name, Hebrew name, overview),
 * a "N verses found" summary and a scrolling reader that loads verses in
 * batches as you scroll or press "Load more verses".
 *
 * Usage
 *   <bible-search-results id="results" media-base="https://.../media/"></bible-search-results>
 *   <script type="module" src="./apps/components/bible-search-results.js"></script>
 *
 *   results.loading('Loading Bible verses…');
 *   results.showVerses(rows);   // rows: [{ book_name, chapter, verse, text }]
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
 *
 * Methods      reset(), loading(message), showMessage(message), showVerses(rows)
 * Properties   busy (read-only)
 *
 * CSS custom properties
 *   --search-navy, --search-ink, --search-hebrew, --reference-width
 *
 * Fonts: Germania One, Strait and Roboto are registered on the document by
 * assets/scripts/fonts.js.
 */

import { registerFonts } from '../../assets/scripts/fonts.js';

// const DEFAULT_MEDIA_BASE = 'https://dailygrace.faith/media/';
const DEFAULT_MEDIA_BASE = 'http://localhost:9001/media/';
const DEFAULT_BATCH_SIZE = 24;
const DEFAULT_METADATA_SRC = new URL('../../assets/book-metadata.json', import.meta.url).href;

const STYLES = /* css */ `
  :host {
    --search-navy: #001b34;
    --search-ink: #10253b;
    --search-hebrew: #963d32;
    --search-gold: #a8810c;
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
    display: grid;
    grid-template-columns: var(--reference-width) minmax(0, 1fr);
    align-items: start;
    padding: 16px 0;
    border: 1px solid rgb(0 27 52 / 16%);
    border-radius: 6px;
    background: rgb(255 255 255 / 16%);
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

  @media (max-width: 420px) {
    :host { --reference-width: 5.25rem; }
    .book-symbol { width: 52px; height: 52px; }
    .book-details, .verse-text { padding-inline: 12px; }
    .book-hebrew { font-size: 1.125rem; }
    .chapter-number { font-size: .8125rem; }
    .verse-number { font-size: 1.875rem; }
    .chapter-start .verse-numbers { margin-inline: 8px; padding: 7px 4px 9px; }
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

export class BibleSearchResults extends HTMLElement {
  #root;
  #content;
  #status;
  #generation = 0;
  #observer = null;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <section aria-label="Bible verse search results"></section>
      <p class="visually-hidden" role="status" aria-atomic="true"></p>`;
    this.#content = this.#root.querySelector('section');
    this.#status = this.#root.querySelector('[role="status"]');
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

  /** Clear the panel and hide it. Also cancels any pending overview lookups. */
  reset() {
    this.#generation++;
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
    const symbolUrl = `${this.#mediaBase}images/symbols/${encodeURIComponent(bookName)}-symbol.svg`;
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

  #createVerseCard(bookName, row) {
    const item = document.createElement('div');
    item.setAttribute('role', 'listitem');
    const card = document.createElement('article');
    const chapterStart = Number(row.verse) === 1;
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
    reference.append(accessibleReference, numbers);
    const text = document.createElement('p');
    text.className = 'verse-text';
    text.textContent = row.text;
    card.append(reference, text);
    item.append(card);
    return item;
  }

  #renderVerses(rows, generation) {
    const bookName = rows[0].book_name;
    const batchSize = this.#batchSize;
    const header = this.#createBookHeader(bookName, generation);
    const summary = document.createElement('p');
    summary.className = 'summary';

    const reader = document.createElement('div');
    reader.className = 'reader';
    reader.tabIndex = 0;
    reader.setAttribute('role', 'region');
    reader.setAttribute('aria-label', `${bookName} verses, scroll to read more`);
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
        fragment.append(this.#createVerseCard(bookName, rows[index]));
      }
      list.append(fragment);
      shown = next;
      summary.textContent = `${rows.length.toLocaleString()} verse${rows.length === 1 ? '' : 's'} found · ${shown.toLocaleString()} shown`;
      this.#status.textContent = `${bookName}. ${summary.textContent}`;
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
