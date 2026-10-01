/**
 * <verse-popup> — the Bible passage popup that the scripture pills open.
 *
 * A pill (scripture-refs.js) fires verse-request; the page-wide listener there
 * calls showPassage(reference), which adds one <verse-popup> to the page the
 * first time and shows the passage in it: the verses in a
 * <bible-search-results compact> panel, with their explanations, red letters
 * and hold-to-bookmark, on a cream card over a dimmed page. It works on every
 * page: the home page's search already has the Bible database open, and a
 * study page fetches it (assets/scripts/sql_script.js) on the first tap.
 *
 * Any tap on the popup closes it, except on its buttons (a pill, a verse's
 * explanation corner), as do the close button, the backdrop and Escape. A
 * pill inside the popup, in an explanation say, opens its passage in a new
 * popup on top, and closing that one goes back to the first.
 *
 * Usage
 *   import { showPassage } from './verse-popup.js?v=…';
 *   showPassage('John 3:16');          // any reference findReferences() knows
 *
 * Methods      show(reference)  open the passage on top of any already open
 *              close()          close the top popup
 * Properties   open (read-only)  whether a passage is showing
 *
 * The page cannot scroll while a passage is open.
 */

import { parseReference } from './scripture-refs.js?v=20261002-1';

// Loaded only where the page does not load them itself: the home page has the
// results panel and the database script already, with its own ?v= tokens.
const RESULTS_MODULE = './bible-search-results.js?v=20261002-1';
const SQL_SCRIPT = new URL('../../assets/scripts/sql_script.js?v=20261002-1', import.meta.url).href;

// Popups opened from popups, at most; past this the top one is reused.
const MAX_LAYERS = 6;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// The same pop as the page's other popups (assets/scripts/script.js).
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

// ------------------------------------------------------------------ the verses

let databaseReady = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error(`Unable to load ${src}`));
    };
    document.head.append(script);
  });
}

/** The Bible database, opened by sql_script.js (added to the page if need be). */
function database() {
  if (!databaseReady) {
    databaseReady = (async () => {
      if (typeof window.initDatabase !== 'function') await loadScript(SQL_SCRIPT);
      await window.initDatabase();
    })().catch((error) => {
      databaseReady = null;            // the next tap tries again
      throw error;
    });
  }
  return databaseReady;
}

/** The verses of a reference, in order: [{ docid, book_name, book_id, chapter, verse, text }]. */
async function versesOf(reference) {
  const parsed = parseReference(reference);
  if (!parsed) return null;
  await database();
  const chapters = new Map();
  const rows = new Map();
  for (const [c1, v1, c2, v2] of parsed.ranges) {
    for (let chapter = c1; chapter <= c2; chapter++) {
      if (!chapters.has(chapter)) chapters.set(chapter, window.getVerses(parsed.book, chapter));
      for (const row of chapters.get(chapter)) {
        const from = chapter === c1 ? v1 : 1;
        const to = chapter === c2 ? v2 : Infinity;
        if (row.verse >= from && row.verse <= to) rows.set(row.docid, row);
      }
    }
  }
  return [...rows.values()].sort((a, b) => a.chapter - b.chapter || a.verse - b.verse);
}

// ------------------------------------------------------------------ the popup

const STYLES = /* css */ `
  :host { display: contents; }
  dialog {
    width: min(600px, 92vw);
    max-height: 88vh;
    max-height: 88dvh;
    padding: 14px;
    border: 0;
    border-radius: 16px;
    background: #f3e7d2;
    color: #10253b;
    box-shadow: 0 24px 60px rgb(0 27 52 / 40%);
    overflow: auto;
    overscroll-behavior: contain;
    /* A tap closes it, but it is read first: the plain arrow, with the hand
       kept for the panel's own buttons. */
    cursor: default;
  }
  dialog:focus { outline: none; }
  dialog::backdrop {
    background: rgb(0 27 52 / 60%);
    backdrop-filter: blur(3px);
  }
  /* Kept in view at the top right while the verses scroll under it. */
  .close {
    position: sticky; top: 0; z-index: 2;
    float: right;
    display: grid; place-items: center;
    width: 34px; height: 34px;
    margin: -4px -4px -34px 0; padding: 0;
    border: 1px solid rgb(0 27 52 / 18%); border-radius: 50%;
    background: rgb(243 231 210 / 92%);
    color: #001b34;
    font: 400 1.5rem/1 'Roboto', Arial, sans-serif;
    cursor: pointer;
  }
  .close:hover { background: #fff; }
  .close:focus-visible { outline: 2px solid #001b34; outline-offset: 2px; }
  bible-search-results { --reader-max-height: none; }

  dialog::-webkit-scrollbar { width: 10px; }
  dialog::-webkit-scrollbar-track { margin-block: 20px; background: transparent; }
  dialog::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    border-radius: 999px;
    background: rgb(198 146 46 / 40%) padding-box;
  }
  dialog::-webkit-scrollbar-thumb:hover { background-color: rgb(198 146 46 / 75%); }
  @supports not selector(::-webkit-scrollbar) {
    dialog { scrollbar-width: thin; scrollbar-color: rgb(198 146 46 / 50%) transparent; }
  }
`;

export class VersePopup extends HTMLElement {
  #root;
  // The open popups, bottom first.
  #layers = [];
  #closing = new WeakSet();
  #savedOverflow = null;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = `<style>${STYLES}</style>`;
  }

  get open() {
    return this.#layers.length > 0;
  }

  /** Show a reference's passage on top of any passage already open. */
  async show(reference) {
    if (!customElements.get('bible-search-results')) await import(RESULTS_MODULE);
    const layer = this.#layers.length >= MAX_LAYERS ? this.#layers.at(-1) : this.#openLayer();
    const { dialog, results } = layer;
    const request = (layer.request = (layer.request ?? 0) + 1);
    dialog.setAttribute('aria-label', `Bible passage: ${reference}`);
    dialog.scrollTop = 0;
    results.loading('Loading Bible verses…');
    try {
      const rows = await versesOf(reference);
      if (request !== layer.request || !dialog.open) return;
      if (rows === null) results.showMessage(`${reference} could not be found in this Bible.`);
      else if (!rows.length) results.showMessage(`No verses found for ${reference}.`);
      else results.showVerses(rows);
    } catch (error) {
      if (request !== layer.request || !dialog.open) return;
      console.warn(`Verse lookup failed for ${reference}:`, error);
      results.showMessage('Bible verses could not be loaded. Please try again.');
    }
  }

  /** Close the popup on top. */
  close() {
    const layer = this.#layers.at(-1);
    if (layer) this.#closeLayer(layer);
  }

  #openLayer() {
    const dialog = document.createElement('dialog');
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'close';
    close.setAttribute('aria-label', 'Close');
    close.title = 'Close';
    close.textContent = '×';
    const results = document.createElement('bible-search-results');
    results.setAttribute('compact', '');
    dialog.append(close, results);
    const layer = { dialog, results };

    // Escape would close instantly; route it through the closing animation instead.
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      this.#closeLayer(layer);
    });
    // A click or tap anywhere closes it, except on the panel's own buttons.
    dialog.addEventListener('click', (event) => {
      const button = event.composedPath().find((node) => node.nodeName === 'BUTTON');
      if (button && button !== close) return;
      this.#closeLayer(layer);
    });

    if (!this.#layers.length) this.#lockScroll();
    this.#layers.push(layer);
    this.#root.append(dialog);
    dialog.showModal();
    if (!reducedMotion.matches) popDialog(dialog, 'open');
    return layer;
  }

  async #closeLayer(layer) {
    const { dialog, results } = layer;
    if (!dialog.open || this.#closing.has(dialog)) return;
    this.#closing.add(dialog);
    layer.request = (layer.request ?? 0) + 1;
    // Anything opened from this popup goes first.
    const index = this.#layers.indexOf(layer);
    for (const above of this.#layers.slice(index + 1).reverse()) this.#closeLayer(above);
    if (!reducedMotion.matches) await popDialog(dialog, 'close');
    dialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    dialog.close();
    results.reset();
    dialog.remove();
    this.#layers = this.#layers.filter((open) => open !== layer);
    if (!this.#layers.length) this.#unlockScroll();
  }

  #lockScroll() {
    const html = document.documentElement;
    this.#savedOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
  }

  #unlockScroll() {
    document.documentElement.style.overflow = this.#savedOverflow ?? '';
    this.#savedOverflow = null;
  }
}

if (!customElements.get('verse-popup')) {
  customElements.define('verse-popup', VersePopup);
}

/** Open a reference's passage in the page's popup, adding the popup if need be. */
export function showPassage(reference) {
  let popup = document.querySelector('verse-popup');
  if (!popup) {
    popup = document.createElement('verse-popup');
    document.body.append(popup);
  }
  return popup.show(reference);
}
