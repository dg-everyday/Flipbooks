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
 * Usage
 *   <daily-guidance></daily-guidance>
 *   <script type="module" src="./apps/components/daily-guidance.js"></script>
 *
 * Attributes
 *   guidance-src   guidance-for-life.json, resolved against the page.
 *                  Default: assets/guidance-for-life.json
 *   page-href      the Guidance for Life page; the topic's id is added as the
 *                  hash. Default: apps/pages/guidance-for-life.html
 *
 * Properties   topic (read-only)  the topic shown, or null until it loads
 * Methods      next()  show another topic at random
 * Events       ready   a topic is shown, detail: { id }
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

const DEFAULT_SRC = 'assets/guidance-for-life.json';
const DEFAULT_PAGE = 'apps/pages/guidance-for-life.html';
// The id of the topic shown last, so the next visit shows a different one.
const LAST_KEY = 'dailygrace:guidance:last';

const asset = (path) => new URL(path, import.meta.url).href;

const EMBLEM_URL = asset('../../assets/images/dg-icon-02-flat-256.webp');

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

  article {
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
  /* A gold star in the top-left and bottom-right corners. */
  article::before,
  article::after {
    content: "✦";
    position: absolute;
    color: var(--guidance-gold);
    font-size: 1rem;
    opacity: .8;
  }
  article::before { top: 11px; left: 16px; }
  article::after { right: 16px; bottom: 11px; }

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

  @media (max-width: 650px) {
    article { padding: 27px 23px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .more { transition: none; }
    .more:hover { transform: none; }
  }
`;

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
  #topic = null;
  #topics = [];
  #loading = null;
  // Coming back with the Back button can restore the page from the
  // back/forward cache without reloading it; show a new topic then too.
  #onPageShow = (event) => { if (event.persisted) this.next(); };

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <article aria-labelledby="title">
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
      </article>`;
    const $ = (selector) => this.#root.querySelector(selector);
    this.#els = {
      section: $('.section'), question: $('.question'), summary: $('.summary'),
      figure: $('figure'), verse: $('blockquote'), reference: $('figcaption'),
      practice: $('.practice'), practiceText: $('.practice span'), more: $('.more'),
    };
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

  get topic() {
    return this.#topic;
  }

  /** Show another topic at random. */
  next() {
    if (!this.#topics.length) return;
    this.#show(pickTopic(this.#topics, this.#topic?.id ?? lastShown()));
    this.dispatchEvent(new CustomEvent('ready', { detail: { id: this.#topic.id } }));
  }

  #load() {
    const src = new URL(this.getAttribute('guidance-src') || DEFAULT_SRC, document.baseURI).href;
    const loading = (this.#loading = fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${src} (${response.status})`);
        return response.json();
      })
      .then((data) => {
        if (loading !== this.#loading) return; // superseded by a newer src
        const topics = Array.isArray(data?.topics) ? data.topics : [];
        if (!topics.length) throw new Error(`No guidance topics in ${src}`);
        this.#topics = topics;
        this.#topic = null;
        this.next();
      })
      .catch((error) => {
        if (loading !== this.#loading) return;
        console.warn("Today's guidance could not be loaded:", error);
        this.#topic = null;
        this.#topics = [];
        this.#els.question.textContent = "Today's guidance is unavailable. Please try again later.";
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
    const page = new URL(this.getAttribute('page-href') || DEFAULT_PAGE, document.baseURI);
    page.hash = topic.id;
    els.more.href = page.href;
    els.more.setAttribute('aria-label', `Read the full guidance: ${topic.name}`);
    els.more.hidden = false;
  }
}

if (!customElements.get('daily-guidance')) {
  customElements.define('daily-guidance', DailyGuidance);
}
