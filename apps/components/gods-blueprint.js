/**
 * <gods-blueprint> — one part of Following God's Blueprint on a blueprint card, as a web component.
 *
 * Shows the guide's icon, the "Following Today's God Blueprint" heading and one item from
 * following-gods-blueprint.json: its sheet, name and short answer, one verse,
 * one step to build it, the question to ask yourself and a link that opens
 * the item on the Following God's Blueprint page. A different item is picked
 * at random each time the page is opened, and again when the browser brings
 * the page back from its back/forward cache.
 * The last item shown is remembered in localStorage (when it is available) so
 * the same one never comes up twice in a row.
 *
 * Holding the card for half a second bookmarks its item: a gold glow spreads
 * from the finger and the card takes a ribbon. Holding it again removes the
 * bookmark. Up to 50 item ids are kept in localStorage, newest first (see
 * card-bookmarks.js), shared with the tiles on the Following God's Blueprint
 * page. With the bookmarks attribute the component shows the bookmarked items
 * as a list instead of the card, which is how the page's bookmarks popup uses it.
 *
 * Usage
 *   <gods-blueprint></gods-blueprint>
 *   <script type="module" src="./apps/components/gods-blueprint.js"></script>
 *
 * Attributes
 *   blueprint-src  following-gods-blueprint.json, resolved against the page.
 *                  Default: assets/following-gods-blueprint.json
 *   page-href      the Following God's Blueprint page; the item's id is added
 *                  as the hash. Default: apps/pages/following-gods-blueprint.html
 *   bookmarks      Present: no card; show the bookmarked items, newest first.
 *                  Call showBookmarks() to bring the list up to date.
 *
 * Properties   item (read-only)  the item shown, or null until it loads
 *              bookmarks (read-only)  the bookmarked item ids, newest first
 * Methods      next()  show another item at random
 *              showBookmarks()  show the bookmarked items, newest first
 *              bookmarkedItems()  resolves to the bookmarked items themselves,
 *                                 newest first, fetching the file if need be
 * Events       ready   an item is shown, detail: { id }
 *              bookmarkchange  a hold added or removed a bookmark,
 *                              detail: { id, result: 'added' | 'removed' }
 *              error   detail: { message }
 *
 * Fonts: Germania One (title) and Strait (text) are registered on the
 * document by assets/scripts/fonts.js, because browsers do not reliably load
 * @font-face rules declared inside a shadow root.
 *
 * CSS custom properties
 *   --blueprint-blue, --blueprint-deep, --blueprint-gold, --blueprint-cream
 * The last two fall back to --gold-light and --cream from the page.
 */

import { registerFonts } from '../../assets/scripts/fonts.js';
// The same ?v= token as the other components' imports, so the page loads one
// copy of the module and every list hears every bookmark change.
import {
  BOOKMARK_STYLES, CardHold, bookmarkNote, bookmarkStore, showBookmarkResult,
} from './card-bookmarks.js?v=20260927-1';

const DEFAULT_SRC = 'assets/following-gods-blueprint.json';
const DEFAULT_PAGE = 'apps/pages/following-gods-blueprint.html';
// The id of the item shown last, so the next visit shows a different one.
const LAST_KEY = 'dailygrace:blueprint:last';

const asset = (path) => new URL(path, import.meta.url).href;

const ICON_URL = asset('../../assets/images/study-guide-icons/following-gods-blueprint.webp');

// Shared with the Following God's Blueprint page (following-gods-blueprint.js),
// which uses the same key.
const bookmarks = bookmarkStore('dailygrace:bookmarks:blueprint',
  { isId: (id) => typeof id === 'string' && id !== '', limit: 50 });

// The blueprint file is shared by every instance, so it is fetched once.
const blueprintCache = new Map();

function readBlueprint(url) {
  if (!blueprintCache.has(url)) {
    const request = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${url} (${response.status})`);
        return response.json();
      })
      .then((data) => {
        const items = Array.isArray(data?.items) ? data.items : [];
        if (!items.length) throw new Error(`No blueprint items in ${url}`);
        const parts = new Map((data.parts || []).map((part) => [part.name, part]));
        // Number each item within its sheet, as the page does ("4.6").
        const seen = new Map();
        for (const item of items) {
          const n = (seen.get(item.part) || 0) + 1;
          seen.set(item.part, n);
          const sheet = parts.get(item.part)?.sheet;
          item.number = sheet ? `${sheet}.${n}` : '';
          item.sheet = sheet;
        }
        return items;
      })
      .catch((error) => {
        blueprintCache.delete(url);
        throw error;
      });
    blueprintCache.set(url, request);
  }
  return blueprintCache.get(url);
}

const STYLES = /* css */ `
  :host {
    --blueprint-blue: #0d3b66;
    --blueprint-deep: #062944;
    --blueprint-gold: var(--gold-light, #e1b65d);
    --blueprint-cream: var(--cream, #f3e7d2);

    display: block;
    padding-inline: 10px;
  }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }

  /* A drafting sheet: blueprint blue under a faint grid. */
  article.card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 38px 30px 32px;
    border: 1px solid rgb(225 182 93 / 40%);
    border-radius: 18px;
    background:
      linear-gradient(rgb(255 255 255 / 7%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(255 255 255 / 7%) 1px, transparent 1px),
      radial-gradient(120% 80% at 50% 0%, rgb(225 182 93 / 14%) 0%, transparent 60%),
      linear-gradient(180deg, var(--blueprint-blue) 0%, var(--blueprint-deep) 100%);
    background-size: 22px 22px, 22px 22px, auto, auto;
    color: var(--blueprint-cream);
    box-shadow: 0 12px 30px rgb(0 27 52 / 28%), inset 0 1px 0 rgb(255 255 255 / 8%);
    text-align: center;
  }
  /* Corner marks, as on a drawing sheet. */
  .corner {
    position: absolute;
    width: 18px;
    height: 18px;
    border-color: var(--blueprint-gold);
    border-style: solid;
    opacity: .7;
    pointer-events: none;
  }
  .corner.tl { top: 12px; left: 12px; border-width: 2px 0 0 2px; border-radius: 4px 0 0 0; }
  .corner.br { right: 12px; bottom: 12px; border-width: 0 2px 2px 0; border-radius: 0 0 4px 0; }

  .emblem {
    display: grid;
    place-items: center;
    width: 78px;
    height: 78px;
    margin: 0 auto 22px;
    padding: 12px;
    border-radius: 50%;
    background: var(--blueprint-cream);
    box-shadow: 0 0 0 2px var(--blueprint-gold), 0 0 0 8px rgb(225 182 93 / 16%), 0 8px 20px rgb(0 0 0 / 35%);
  }
  .emblem img { display: block; width: 100%; height: 100%; object-fit: contain; }
  .title {
    margin: 0 0 22px;
    color: #fff;
    font: 400 clamp(1.5rem, 1.3rem + .9vw, 1.875rem)/1.2 'Germania One', Georgia, serif;
    letter-spacing: .02em;
  }
  .title::after {
    content: "";
    display: block;
    width: 56px;
    height: 2px;
    margin: 14px auto 0;
    border-radius: 2px;
    background: linear-gradient(90deg, transparent, var(--blueprint-gold), transparent);
  }
  p { margin: 0; max-width: 34em; text-wrap: pretty; }

  .sheet {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    color: var(--blueprint-gold);
    font: 700 .78rem/1.3 'Strait', 'Roboto', sans-serif;
    letter-spacing: .12em;
    text-transform: uppercase;
  }
  .number {
    padding: 2px 8px;
    border: 1.5px dashed var(--blueprint-gold);
    border-radius: 6px;
    letter-spacing: .04em;
  }
  .name {
    margin: 0;
    color: #fff;
    font: 400 clamp(1.45rem, 1.25rem + .8vw, 1.85rem)/1.15 'Germania One', Georgia, serif;
  }
  .summary {
    margin-top: 12px;
    font: 400 clamp(1.05rem, 1rem + .3vw, 1.2rem)/1.45 'Strait', 'Roboto', sans-serif;
  }

  figure {
    max-width: 34em;
    margin: 20px 0 0;
    padding: 12px 18px;
    border-left: 3px solid var(--blueprint-gold);
    border-radius: 0 10px 10px 0;
    background: rgb(255 255 255 / 7%);
    text-align: left;
  }
  /* Jesus' own words, marked as a red-letter Bible marks them. */
  figure.red { border-left-color: #ff8a80; }
  figure.red blockquote { color: #ffd9d4; }
  blockquote {
    margin: 0;
    font: 400 clamp(1rem, .96rem + .25vw, 1.12rem)/1.45 'Strait', 'Roboto', sans-serif;
  }
  figcaption {
    margin-top: 6px;
    color: var(--blueprint-gold);
    font: 700 .76rem/1.3 'Strait', 'Roboto', sans-serif;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  figure.red figcaption { color: #ff8a80; }

  .steps {
    display: grid;
    gap: 14px;
    width: min(460px, 94%);
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid rgb(225 182 93 / 35%);
  }
  .build, .ask {
    color: var(--blueprint-gold);
    font: 400 clamp(1.0625rem, 1rem + .3vw, 1.1875rem)/1.4 Georgia, 'Times New Roman', serif;
  }
  .build b, .ask b { display: block; margin-bottom: 2px; font: 700 .76rem/1.3 'Strait', 'Roboto', sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #fff; }
  .ask { color: #fff; }
  .ask b { color: var(--blueprint-gold); }

  .links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 10px 18px;
    margin-top: 22px;
  }
  .more {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 8px 20px;
    border-radius: 999px;
    background: var(--blueprint-gold);
    color: var(--blueprint-deep);
    font: 700 1rem/1.2 'Strait', 'Roboto', sans-serif;
    text-decoration: none;
    transition: background-color .15s ease, transform .15s ease;
  }
  .more:hover { background: #f0c66c; transform: translateY(-1px); }
  .more:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

  /* A blue glow would not show on the blue card; removing glows cream. The
     ribbon is gold, set in from the rounded corner and clear of the corner mark. */
  article.card.bookmarked { --glow: 243 231 210; }
  article.card.bookmarked::after { right: 36px; background: var(--blueprint-gold); }

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
    color: var(--blueprint-deep);
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
  .entry {
    padding: 18px 20px;
    border: 1px solid rgb(0 27 52 / 16%);
    border-left: 4px solid var(--blueprint-blue);
    border-radius: 6px;
    background: rgb(255 255 255 / 16%);
    color: #10253b;
  }
  .entry p { max-width: none; }
  .entry-sheet {
    margin-bottom: 4px;
    color: var(--blueprint-blue);
    font: 700 .75rem/1.3 'Strait', 'Roboto', sans-serif;
    letter-spacing: .12em;
    text-transform: uppercase;
  }
  .entry-name {
    margin: 0 0 6px;
    color: var(--blueprint-deep);
    font: 400 clamp(1.25rem, 1.1rem + .6vw, 1.5rem)/1.2 'Germania One', Georgia, serif;
  }
  .entry-summary,
  .entry-build,
  .entry-ask {
    font: 400 clamp(1rem, .95rem + .3vw, 1.125rem)/1.5 'Strait', 'Roboto', sans-serif;
  }
  .entry-build, .entry-ask { margin-top: 8px; }
  .entry-build { color: #805b18; }
  .entry-build b, .entry-ask b { color: var(--blueprint-deep); }
  .entry-link {
    display: inline-block;
    margin-top: 10px;
    color: #c62828;
    font: 400 1rem/1.4 'Strait', 'Roboto', sans-serif;
    text-decoration: underline;
    text-decoration-color: rgb(198 40 40 / 35%);
    text-underline-offset: 3px;
  }
  .entry-link:hover { text-decoration-color: currentColor; }
  .entry-link:focus-visible { outline: 2px solid #c62828; outline-offset: 3px; border-radius: 3px; }
  .visually-hidden {
    position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  @media (max-width: 650px) {
    article.card { padding: 27px 23px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .more { transition: none; }
    .more:hover { transform: none; }
  }
${BOOKMARK_STYLES}`;

/** localStorage, which can be missing or throw (private windows, blocked storage). */
function remember(id) {
  try { localStorage.setItem(LAST_KEY, id); } catch { /* the pick still works, it may just repeat */ }
}
function lastShown() {
  try { return localStorage.getItem(LAST_KEY); } catch { return null; }
}

/** An item at random, never the one shown last when there is a choice. */
function pickItem(items, avoid) {
  const choices = items.length > 1 ? items.filter((item) => item.id !== avoid) : items;
  return choices[Math.floor(Math.random() * choices.length)];
}

const tidy = (text) => (text ?? '').replace(/\s+/g, ' ').trim();

export class GodsBlueprint extends HTMLElement {
  static observedAttributes = ['blueprint-src', 'page-href'];

  #els;
  #status;
  #item = null;
  #items = [];
  #loading = null;
  #hold;
  #listHold;
  // Coming back with the Back button can restore the page from the
  // back/forward cache without reloading it; show a new item then too.
  #onPageShow = (event) => {
    if (event.persisted && !this.hasAttribute('bookmarks')) this.next();
  };

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>${STYLES}</style>
      <article class="card bookmarkable" aria-labelledby="title">
        <span class="corner tl" aria-hidden="true"></span>
        <span class="corner br" aria-hidden="true"></span>
        <div class="emblem">
          <img src="${ICON_URL}" alt="" width="54" height="54" />
        </div>
        <h3 class="title" id="title">Following Today's God Blueprint</h3>
        <p class="sheet" hidden><span class="number"></span><span class="part"></span></p>
        <h4 class="name" aria-live="polite">Loading today's blueprint…</h4>
        <p class="summary" hidden></p>
        <figure hidden><blockquote></blockquote><figcaption></figcaption></figure>
        <div class="steps" hidden>
          <p class="build"><b>Build it</b><span></span></p>
          <p class="ask"><b>Ask yourself</b><span></span></p>
        </div>
        <p class="links">
          <a class="more" hidden>Open the full plan <span aria-hidden="true">→</span></a>
        </p>
      </article>
      <section class="saved" aria-label="Bookmarked blueprints">
        <header class="bookmarks-header" hidden>
          <h3 class="bookmarks-title">Bookmarked blueprints</h3>
          <p class="bookmarks-summary"></p>
        </header>
        <div class="list"><p class="message">Loading your blueprints…</p></div>
      </section>
      <p class="visually-hidden" role="status" aria-atomic="true"></p>`;
    const $ = (selector) => root.querySelector(selector);
    this.#els = {
      sheet: $('.sheet'), number: $('.number'), part: $('.part'), name: $('.name'),
      summary: $('.summary'), figure: $('figure'), verse: $('blockquote'), reference: $('figcaption'),
      steps: $('.steps'), build: $('.build span'), buildLine: $('.build'),
      ask: $('.ask span'), askLine: $('.ask'), more: $('.more'),
      card: $('.card'), header: $('.bookmarks-header'), summaryLine: $('.bookmarks-summary'),
      list: $('.list'),
    };
    this.#status = $('[role="status"]');

    // Holding the card bookmarks today's item; holding an item in the list
    // takes its bookmark off (and puts it back). The links are not held.
    this.#hold = new CardHold(this.#els.card, {
      selector: '.card',
      exclude: 'a',
      onHold: (card) => { if (this.#item) this.#toggle(this.#item, card); },
    });
    this.#listHold = new CardHold(this.#els.list, {
      selector: '.entry',
      exclude: 'a',
      onHold: (card) => {
        const item = this.#items.find((i) => i.id === card.dataset.id);
        if (item) this.#toggle(item, card);
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
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.isConnected) return;
    this.#load();
  }

  get item() {
    return this.#item;
  }

  /** The bookmarked item ids, newest first. */
  get bookmarks() {
    return bookmarks.read();
  }

  /** The bookmarked items, newest first, as they are in the blueprint file. */
  async bookmarkedItems() {
    const items = await readBlueprint(this.#src);
    const byId = new Map(items.map((item) => [item.id, item]));
    return bookmarks.read().map((id) => byId.get(id)).filter(Boolean);
  }

  /** Show another item at random. */
  next() {
    if (!this.#items.length) return;
    this.#show(pickItem(this.#items, this.#item?.id ?? lastShown()));
    this.dispatchEvent(new CustomEvent('ready', { detail: { id: this.#item.id } }));
  }

  /**
   * Show the bookmarked items, newest first. An item taken off here keeps its
   * card, without the ribbon, so holding it again puts the bookmark back.
   */
  showBookmarks() {
    if (!this.#items.length) {
      // Loaded on first use; the bookmarks show once the items arrive.
      if (!this.#loading) this.#load();
      return;
    }
    const els = this.#els;
    const items = bookmarks.read()
      .map((id) => this.#items.find((item) => item.id === id))
      .filter(Boolean);
    els.header.hidden = !items.length;
    if (!items.length) {
      const message = document.createElement('p');
      message.className = 'message';
      message.textContent = 'No bookmarked blueprints yet. Hold “Following Today’s God Blueprint”, '
        + 'or a part of the plan on the Following God’s Blueprint page, for half a second to bookmark it.';
      els.list.replaceChildren(message);
      this.#status.textContent = message.textContent;
      return;
    }
    els.summaryLine.textContent = this.#bookmarksSummary();
    els.list.replaceChildren(...items.map((item) => this.#createEntry(item)));
    this.#status.textContent = `Bookmarked blueprints. ${this.#bookmarksSummary()}`;
  }

  get #src() {
    return new URL(this.getAttribute('blueprint-src') || DEFAULT_SRC, document.baseURI).href;
  }

  #pageHref(id) {
    const page = new URL(this.getAttribute('page-href') || DEFAULT_PAGE, document.baseURI);
    page.hash = id;
    return page.href;
  }

  #bookmarksSummary() {
    return `${bookmarks.read().length} of ${bookmarks.limit} saved blueprints, newest first. `
      + 'Hold one to remove its bookmark.';
  }

  #toggle(item, card) {
    const result = bookmarks.toggle(item.id);
    showBookmarkResult(card, result, bookmarks.limit);
    this.#status.textContent = `${item.name}: ${bookmarkNote(result, bookmarks.limit)}`;
    if (result === 'added' || result === 'removed') {
      this.dispatchEvent(new CustomEvent('bookmarkchange', { detail: { id: item.id, result } }));
    }
  }

  #syncBookmarks = () => {
    const els = this.#els;
    els.card.classList.toggle('bookmarked', Boolean(this.#item && bookmarks.has(this.#item.id)));
    for (const card of els.list.querySelectorAll('.entry')) {
      card.classList.toggle('bookmarked', bookmarks.has(card.dataset.id));
    }
    if (!els.header.hidden) els.summaryLine.textContent = this.#bookmarksSummary();
  };

  #createEntry(item) {
    const line = (tag, className, text) => {
      const element = document.createElement(tag);
      if (className) element.className = className;
      element.textContent = text;
      return element;
    };
    const labelled = (className, label, text) => {
      const p = line('p', className, ` ${tidy(text)}`);
      p.prepend(line('b', '', label));
      return p;
    };
    const card = document.createElement('article');
    card.className = 'entry bookmarkable';
    card.dataset.id = item.id;
    card.classList.toggle('bookmarked', bookmarks.has(item.id));
    const sheet = [item.number, item.sheet ? `Sheet ${item.sheet} · ${item.part}` : item.part]
      .filter(Boolean).join(' · ');
    if (sheet) card.append(line('p', 'entry-sheet', sheet));
    card.append(line('h4', 'entry-name', item.name));
    if (item.summary) card.append(line('p', 'entry-summary', tidy(item.summary)));
    if (item.build?.[0]) card.append(labelled('entry-build', 'Build it:', item.build[0]));
    if (item.ask) card.append(labelled('entry-ask', 'Ask yourself:', item.ask));
    const link = line('a', 'entry-link', 'Open the full plan →');
    link.href = this.#pageHref(item.id);
    link.setAttribute('aria-label', `Open the full plan: ${item.name}`);
    card.append(link);
    return card;
  }

  #load() {
    const loading = (this.#loading = readBlueprint(this.#src)
      .then((items) => {
        if (loading !== this.#loading) return; // superseded by a newer src
        this.#items = items;
        this.#item = null;
        if (this.hasAttribute('bookmarks')) this.showBookmarks();
        else this.next();
      })
      .catch((error) => {
        if (loading !== this.#loading) return;
        console.warn("Today's blueprint could not be loaded:", error);
        this.#loading = null;          // a bookmarks list can ask again
        this.#item = null;
        this.#items = [];
        this.#els.name.textContent = "Today's blueprint is unavailable. Please try again later.";
        const message = document.createElement('p');
        message.className = 'message';
        message.textContent = 'Your bookmarked blueprints could not be loaded. Please try again.';
        this.#els.list.replaceChildren(message);
        this.dispatchEvent(new CustomEvent('error', { detail: { message: error.message } }));
      }));
  }

  #show(item) {
    const els = this.#els;
    this.#item = item;
    remember(item.id);
    els.number.textContent = item.number || '';
    els.number.hidden = !item.number;
    els.part.textContent = item.sheet ? `Sheet ${item.sheet} · ${item.part}` : item.part || '';
    els.sheet.hidden = !item.part;
    els.name.textContent = item.name;
    els.summary.textContent = tidy(item.summary);
    els.summary.hidden = !item.summary;
    // The first verse leads each item.
    const verse = item.verses?.[0];
    els.verse.textContent = tidy(verse?.text);
    els.reference.textContent = [verse?.reference, verse?.who].filter(Boolean).join(' · ');
    els.figure.classList.toggle('red', Boolean(verse?.red));
    els.figure.hidden = !verse?.text;
    const step = item.build?.[0];
    els.build.textContent = tidy(step);
    els.buildLine.hidden = !step;
    els.ask.textContent = tidy(item.ask);
    els.askLine.hidden = !item.ask;
    els.steps.hidden = !step && !item.ask;
    els.more.href = this.#pageHref(item.id);
    els.more.setAttribute('aria-label', `Open the full plan: ${item.name}`);
    els.more.hidden = false;
    this.#syncBookmarks();
  }
}

if (!customElements.get('gods-blueprint')) {
  customElements.define('gods-blueprint', GodsBlueprint);
}
