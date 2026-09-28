/**
 * <daily-guidance> — today's Guidance for Life on a navy card, as a web component.
 *
 * Shows the Daily Grace emblem, the "Today's Guidance for Life" heading and one
 * topic from guidance-for-life.json: its question, a short answer, one verse,
 * one thing to try, and a link that opens the topic on the Guidance for Life
 * page. A different topic is picked at random each time the page is opened,
 * and again when the browser brings the page back from its back/forward cache.
 * The last topic shown is remembered in localStorage (when it is available) so
 * the same one never comes up twice in a row.
 *
 * Holding the card for half a second bookmarks its topic: a gold glow spreads
 * from the finger and the card takes a ribbon. Holding it again removes the
 * bookmark. Up to 50 topic ids are kept in localStorage, newest first (see
 * card-bookmarks.js), shared with the tiles on the Guidance for Life page.
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
 *   page-href      the Guidance for Life page; the topic's id is added as the
 *                  hash. Default: apps/pages/guidance-for-life.html
 *   bookmarks      Present: no card; show the bookmarked topics, newest first.
 *                  Call showBookmarks() to bring the list up to date.
 *
 * Properties   topic (read-only)  the topic shown, or null until it loads
 *              bookmarks (read-only)  the bookmarked topic ids, newest first
 * Methods      next()  show another topic at random
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

const DEFAULT_SRC = 'assets/guidance-for-life.json';
const DEFAULT_PAGE = 'apps/pages/guidance-for-life.html';
// The id of the topic shown last, so the next visit shows a different one.
const LAST_KEY = 'dailygrace:guidance:last';

const asset = (path) => new URL(path, import.meta.url).href;

const EMBLEM_URL = asset('../../assets/images/dg-icon-02-flat-256.webp');

// Shared with the Guidance for Life page (guidance-for-life.js), which uses the same key.
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
  article.card.bookmarked::after { right: 28px; background: var(--guidance-gold); }

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

/** A topic at random, never the one shown last when there is a choice. */
function pickTopic(topics, avoid) {
  const choices = topics.length > 1 ? topics.filter((t) => t.id !== avoid) : topics;
  return choices[Math.floor(Math.random() * choices.length)];
}

const tidy = (text) => (text ?? '').replace(/\s+/g, ' ').trim();

export class DailyGuidance extends HTMLElement {
  static observedAttributes = ['guidance-src', 'page-href'];

  #root;
  #els;
  #status;
  #topic = null;
  #topics = [];
  #loading = null;
  #hold;
  #listHold;
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
        <div class="emblem">
          <img src="${EMBLEM_URL}" alt="Daily Grace" width="78" height="78" />
        </div>
        <h3 class="title" id="title">Today's Guidance for Life</h3>
        <p class="section" hidden></p>
        <p class="question" aria-live="polite">Loading today's guidance…</p>
        <p class="summary" hidden></p>
        <figure hidden><blockquote></blockquote><figcaption></figcaption></figure>
        <p class="practice" hidden><b>Try this:</b> <span></span></p>
        <a class="more" hidden>Read the full guidance <span aria-hidden="true">→</span></a>
      </article>
      <section class="saved" aria-label="Bookmarked guidance">
        <header class="bookmarks-header" hidden>
          <h3 class="bookmarks-title">Bookmarked guidance</h3>
          <p class="bookmarks-summary"></p>
        </header>
        <div class="list"><p class="message">Loading your guidance…</p></div>
      </section>
      <p class="visually-hidden" role="status" aria-atomic="true"></p>`;
    const $ = (selector) => this.#root.querySelector(selector);
    this.#els = {
      section: $('.section'), question: $('.question'), summary: $('.summary'),
      figure: $('figure'), verse: $('blockquote'), reference: $('figcaption'),
      practice: $('.practice'), practiceText: $('.practice span'), more: $('.more'),
      card: $('.card'), header: $('.bookmarks-header'), summaryLine: $('.bookmarks-summary'),
      list: $('.list'),
    };
    this.#status = $('[role="status"]');

    // Holding the card bookmarks today's topic; holding a topic in the list
    // takes its bookmark off (and puts it back). The links are not held.
    this.#hold = new CardHold(this.#els.card, {
      selector: '.card',
      exclude: 'a',
      onHold: (card) => { if (this.#topic) this.#toggle(this.#topic, card); },
    });
    this.#listHold = new CardHold(this.#els.list, {
      selector: '.topic',
      exclude: 'a',
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
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.isConnected) return;
    this.#load();
  }

  get topic() {
    return this.#topic;
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
      message.textContent = 'No bookmarked guidance yet. Hold “Today’s Guidance for Life”, '
        + 'or a question on the Guidance for Life page, for half a second to bookmark it.';
      els.list.replaceChildren(message);
      this.#status.textContent = message.textContent;
      return;
    }
    els.summaryLine.textContent = this.#bookmarksSummary();
    els.list.replaceChildren(...topics.map((topic) => this.#createTopic(topic)));
    this.#status.textContent = `Bookmarked guidance. ${this.#bookmarksSummary()}`;
  }

  get #src() {
    return new URL(this.getAttribute('guidance-src') || DEFAULT_SRC, document.baseURI).href;
  }

  #pageHref(id) {
    const page = new URL(this.getAttribute('page-href') || DEFAULT_PAGE, document.baseURI);
    page.hash = id;
    return page.href;
  }

  #bookmarksSummary() {
    return `${bookmarks.read().length} of ${bookmarks.limit} saved topics, newest first. `
      + 'Hold a topic to remove its bookmark.';
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
    const link = line('a', 'topic-link', 'Read the full guidance →');
    link.href = this.#pageHref(topic.id);
    link.setAttribute('aria-label', `Read the full guidance: ${topic.name}`);
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
        console.warn("Today's guidance could not be loaded:", error);
        this.#loading = null;          // a bookmarks list can ask again
        this.#topic = null;
        this.#topics = [];
        this.#els.question.textContent = "Today's guidance is unavailable. Please try again later.";
        const message = document.createElement('p');
        message.className = 'message';
        message.textContent = 'Your bookmarked guidance could not be loaded. Please try again.';
        this.#els.list.replaceChildren(message);
        this.dispatchEvent(new CustomEvent('error', { detail: { message: error.message } }));
      }));
  }

  #show(topic) {
    const els = this.#els;
    this.#topic = topic;
    remember(topic.id);
    els.section.textContent = topic.section || '';
    els.section.hidden = !topic.section;
    els.question.textContent = topic.question || topic.name;
    els.summary.textContent = tidy(topic.summary);
    els.summary.hidden = !topic.summary;
    // The first teaching leads each topic (Jesus' words, where he spoke to it).
    const teaching = topic.teachings?.[0];
    els.verse.textContent = tidy(teaching?.text);
    els.reference.textContent = teaching?.reference || '';
    els.figure.hidden = !teaching?.text;
    els.practiceText.textContent = tidy(topic.practice);
    els.practice.hidden = !topic.practice;
    els.more.href = this.#pageHref(topic.id);
    els.more.setAttribute('aria-label', `Read the full guidance: ${topic.name}`);
    els.more.hidden = false;
    this.#syncBookmarks();
  }
}

if (!customElements.get('daily-guidance')) {
  customElements.define('daily-guidance', DailyGuidance);
}
