/**
 * <daily-strides> — the day's reflection on a navy card, as a web component.
 *
 * Shows the Daily Grace emblem, the "Reflection for the Day" heading, the
 * day's reflection from verses.json and a closing line, on a navy panel with
 * gold accents.
 *
 * Usage
 *   <daily-strides></daily-strides>
 *   <script type="module" src="./apps/components/daily-strides.js"></script>
 *
 * Attributes
 *   verses-src   verses.json with each day's reflection, resolved against the
 *                page. Default: assets/verses.json
 *   date         Day to show as YYYY-MM-DD. Default: today in Asia/Manila.
 *
 * Properties   reflection (read-only)  the text shown, or '' until it loads
 * Events       ready   the reflection is shown, detail: { date, reflection }
 *              error   detail: { message }
 *
 * Fonts: Germania One (title) and Strait (text) are registered on the
 * document by assets/scripts/fonts.js, because browsers do not reliably load
 * @font-face rules declared inside a shadow root.
 *
 * CSS custom properties
 *   --strides-navy, --strides-navy-2, --strides-gold, --strides-cream
 * These fall back to --navy, --navy-2, --gold-light and --cream from the page.
 */

import { registerFonts } from '../../assets/scripts/fonts.js';

const DEFAULT_VERSES_SRC = 'assets/verses.json';
const TIME_ZONE = 'Asia/Manila';

const asset = (path) => new URL(path, import.meta.url).href;

const EMBLEM_URL = asset('../../assets/images/dg-icon-02-flat.webp');

const STYLES = /* css */ `
  :host {
    --strides-navy: var(--navy, #001b34);
    --strides-navy-2: var(--navy-2, #062944);
    --strides-gold: var(--gold-light, #e1b65d);
    --strides-cream: var(--cream, #f3e7d2);

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
      linear-gradient(180deg, var(--strides-navy-2) 0%, var(--strides-navy) 100%);
    color: var(--strides-cream);
    box-shadow: 0 12px 30px rgb(0 27 52 / 28%), inset 0 1px 0 rgb(255 255 255 / 8%);
    text-align: center;
  }
  /* A gold star in the top-left and bottom-right corners. */
  article::before,
  article::after {
    content: "✦";
    position: absolute;
    color: var(--strides-gold);
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
    background: var(--strides-navy);
    box-shadow: 0 0 0 2px var(--strides-gold), 0 0 0 8px rgb(225 182 93 / 16%), 0 8px 20px rgb(0 0 0 / 35%);
  }
  .emblem img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .title {
    margin: 0 0 26px;
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
    background: linear-gradient(90deg, transparent, var(--strides-gold), transparent);
  }
  p {
    margin: 0;
    max-width: 34em;
    font: 400 clamp(1.125rem, 1.05rem + .35vw, 1.3rem)/1.6 'Strait', 'Roboto', sans-serif;
    text-wrap: pretty;
  }
  .closing {
    width: min(280px, 80%);
    margin-top: 26px;
    padding-top: 20px;
    border-top: 1px solid rgb(225 182 93 / 35%);
    color: var(--strides-gold);
    font: 400 clamp(1.0625rem, 1rem + .3vw, 1.1875rem)/1.4 Georgia, 'Times New Roman', serif;
  }

  @media (max-width: 650px) {
    article { padding: 27px 23px; }
  }
`;

/** The day as the "Month D, YYYY" id verses.json uses: `date` or today in Manila. */
function verseId(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date ?? '');
  const day = match
    ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
    : new Date();
  return day.toLocaleDateString('en-US', {
    timeZone: match ? 'UTC' : TIME_ZONE,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export class DailyStrides extends HTMLElement {
  static observedAttributes = ['verses-src', 'date'];

  #root;
  #text;
  #reflection = '';
  #loading = null;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <article aria-labelledby="title">
        <div class="emblem">
          <img src="${EMBLEM_URL}" alt="Daily Grace" width="78" height="78" />
        </div>
        <h3 class="title" id="title">Reflection for the Day</h3>
        <p class="reflection" aria-live="polite">Loading today's reflection…</p>
        <p class="closing">Pause. Trust. Take the next step.</p>
      </article>`;
    this.#text = this.#root.querySelector('.reflection');
  }

  connectedCallback() {
    registerFonts();
    if (!this.#loading) this.#load();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.isConnected) return;
    this.#load();
  }

  get reflection() {
    return this.#reflection;
  }

  #load() {
    const src = new URL(this.getAttribute('verses-src') || DEFAULT_VERSES_SRC, document.baseURI).href;
    const id = verseId(this.getAttribute('date'));
    const loading = (this.#loading = fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${src} (${response.status})`);
        return response.json();
      })
      .then((verses) => {
        if (loading !== this.#loading) return; // superseded by a newer src or date
        const verse = Array.isArray(verses) ? verses.find((item) => item.id === id) : null;
        if (!verse?.reflection) throw new Error(`No reflection found for ${id}`);
        this.#reflection = verse.reflection;
        this.#text.textContent = verse.reflection;
        this.dispatchEvent(new CustomEvent('ready', { detail: { date: id, reflection: verse.reflection } }));
      })
      .catch((error) => {
        if (loading !== this.#loading) return;
        console.warn("Today's reflection could not be loaded:", error);
        this.#reflection = '';
        this.#text.textContent = "Today's reflection is unavailable. Please try again later.";
        this.dispatchEvent(new CustomEvent('error', { detail: { message: error.message } }));
      }));
  }
}

if (!customElements.get('daily-strides')) {
  customElements.define('daily-strides', DailyStrides);
}
