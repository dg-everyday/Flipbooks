/**
 * <bible-trivia> — "Did you know? Bible Trivia Quiz" as a modal popup.
 *
 * Draws one random row from the did_you_know table, shows its title and fact,
 * and asks which book it came from. The row's Book is the right answer; two of
 * the four books in its Similar_books column are the wrong ones. The three are
 * shuffled, so the answer is never in a fixed position.
 *
 * The popup is modal and cannot be dismissed until an answer is chosen. Picking
 * one disables the rest, glows the chosen tile green or red, plays a sound and
 * shows the verdict. It then closes on the next tap, or by itself after three
 * seconds.
 *
 * Usage
 *   <bible-trivia auto></bible-trivia>
 *   <script type="module" src="./apps/components/bible-trivia.js"></script>
 *
 * Attributes
 *   auto             Open once the page has finished loading, subject to the
 *                    daily quota and the rule below about internal navigation.
 *   src              URL of the SQLite database holding the did_you_know table.
 *                    Default: ../../assets/db/didyouknow.db (relative to this file)
 *   media-base       Base URL for the book thumbnails.
 *                    Default: http://localhost:9001/media/
 *   max-per-day      Quiz appearances allowed per day. Default: 3
 *   min-gap-minutes  Minimum spacing between them. Default: 60
 *   delay            Pause after load before opening, in ms. Default: 800
 *
 * How often it appears: at most max-per-day times per Manila day, never less
 * than min-gap-minutes apart, and not at all when the reader arrived from
 * another page of this site, such as the flipbook. The tally lives in
 * localStorage under 'dailygrace.trivia'; clearing it hands the reader another
 * three goes, which is a trade we are happy with.
 *
 * Methods      open({ force })  show the quiz; force skips the quota checks.
 *                               Resolves true when it opened.
 *              close()          close it, whether or not it was answered.
 *              reset()          forget today's tally.
 * Events       ready     the quiz is on screen, detail: { id, book }
 *              answered  detail: { id, book, chosen, correct }
 *              closed    detail: { answered }
 *              skipped   nothing was shown, detail: { reason }
 *              error     detail: { message }
 *
 * Book thumbnails come from <media-base>images/thumbnails/<Book>_square.webp.
 * The gold frame inside those files is not the same size from one book to the
 * next, so each tile is scaled by the bounds in book-thumb-bounds.js; regenerate
 * that with tools/thumbnails/measure_bounds.py when the artwork changes.
 *
 * Fonts: Germania One (title) and Strait (text) are registered on the document
 * by assets/scripts/fonts.js, because browsers do not reliably load @font-face
 * rules declared inside a shadow root.
 */

import { registerFonts } from '../../assets/scripts/fonts.js';
import { openDatabase, query } from '../../assets/scripts/sqlite-db.js';
import { BOOK_THUMB_BOUNDS, DEFAULT_THUMB_BOUNDS } from './book-thumb-bounds.js';

// const DEFAULT_MEDIA_BASE = 'https://dailygrace.faith/media/';
const DEFAULT_MEDIA_BASE = 'http://localhost:9001/media/';
const DEFAULT_MAX_PER_DAY = 3;
const DEFAULT_MIN_GAP_MINUTES = 60;
const DEFAULT_DELAY = 800;

// How long the verdict stays up before the popup closes itself.
const VERDICT_MS = 3000;
const STORAGE_KEY = 'dailygrace.trivia';
// The thumbnails are .webp on the media host; .svg is not published.
const THUMBNAIL_SUFFIX = '_square.webp';
// Shave the outermost hair off each tile: a couple of the files carry a fringe
// right against the frame, and losing a fraction of the gold costs nothing.
const THUMBNAIL_TRIM = 0.985;

const asset = (path) => new URL(path, import.meta.url).href;

const BANNER_URL = asset('../../assets/images/trivia.webp');
const DEFAULT_SRC = asset('../../assets/db/didyouknow.db');
const CORRECT_SOUND = asset('../../assets/audio/correct.webm');
const WRONG_SOUND = asset('../../assets/audio/wrong.webm');

const QUESTION = 'Which Bible book describes this best?';
const CORRECT_MESSAGE = 'Congratulations! You got it!';
const WRONG_MESSAGE = 'Sorry ☹, Try again next time!';

const FACT_QUERY = `
  SELECT id, Title, Fact, Book, Similar_books
  FROM did_you_know
  ORDER BY RANDOM()
  LIMIT 1`;

/** The app keeps its days in Manila time, so the daily quota does too. */
const manilaDay = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date());

/** A reader coming from the flipbook or any other page of ours is mid-visit. */
function arrivedFromOwnSite() {
  if (!document.referrer) return false;
  try {
    const referrer = new URL(document.referrer);
    return referrer.origin === location.origin && referrer.pathname !== location.pathname;
  } catch {
    return false;
  }
}

function readTally() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored && stored.day === manilaDay()) {
      return { day: stored.day, count: Number(stored.count) || 0, last: Number(stored.last) || 0 };
    }
  } catch {
    // Unreadable or blocked storage simply means no history.
  }
  return { day: manilaDay(), count: 0, last: 0 };
}

function writeTally(tally) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tally));
  } catch {
    // Private mode and blocked storage are fine; the quiz just forgets.
  }
}

const shuffle = (items) => {
  const pool = items.slice();
  for (let index = pool.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swap]] = [pool[swap], pool[index]];
  }
  return pool;
};

const STYLES = /* css */ `
  :host {
    /* The page's own paper and ink, so the popup belongs to the site. */
    --trivia-paper: var(--cream, #f3e7d2);
    --trivia-card: #fbf6ea;
    --trivia-edge: rgb(128 91 24 / 35%);
    --trivia-navy: var(--navy, #001b34);
    --trivia-ink: var(--ink, #10253b);
    --trivia-green: #1f7a44;
    --trivia-red: var(--action, #c62828);
    --trivia-idle-glow: rgb(16 37 59 / 32%);

    display: contents;
  }
  * { box-sizing: border-box; }

  dialog:focus { outline: none; }
  dialog {
    width: min(92vw, 620px);
    max-height: 92dvh;
    padding: 0;
    overflow: auto;
    border: 0;
    border-radius: 14px;
    background: var(--trivia-paper);
    color: var(--trivia-ink);
    box-shadow: 0 24px 60px rgb(0 27 52 / 45%);
  }
  dialog::backdrop {
    background: rgb(0 27 52 / 62%);
    backdrop-filter: blur(3px);
  }
  /* Only the answered quiz invites a tap to dismiss. */
  dialog[data-answered] { cursor: zoom-out; }

  .banner {
    display: block; width: 100%; height: auto;
    border-radius: 14px 14px 0 0;
  }

  .content { display: grid; gap: 18px; padding: 18px; }

  .fact {
    padding: 14px 16px;
    border: 1px solid var(--trivia-edge);
    border-radius: 8px;
    background: var(--trivia-card);
  }
  .title {
    margin: 0 0 8px;
    color: var(--trivia-navy); overflow-wrap: anywhere;
    font: 400 clamp(1.15rem, 1.05rem + .5vw, 1.4rem)/1.2 'Germania One', Georgia, serif;
  }
  .text {
    margin: 0;
    font: 400 clamp(.9375rem, .9rem + .25vw, 1.0625rem)/1.5 'Strait', 'Roboto', sans-serif;
  }

  .question {
    margin: 0; text-align: center; color: var(--trivia-green);
    font: 700 clamp(1rem, .95rem + .3vw, 1.15rem)/1.3 'Strait', 'Roboto', sans-serif;
  }

  .choices {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(10px, 3vw, 24px); justify-items: center;
    margin: 0; padding: 0; list-style: none;
  }
  .choice {
    display: grid; gap: 8px; justify-items: center;
    width: 100%; padding: 0; border: 0; background: none;
    color: var(--trivia-ink); cursor: pointer; text-align: center;
    font: 400 clamp(.75rem, .7rem + .25vw, .875rem)/1.2 'Strait', 'Roboto', sans-serif;
  }
  .choice:disabled { cursor: default; }
  /* A white card with a margin of its own, so the tiles read as one set. The
     size is stated outright: the artwork inside is positioned absolutely, so a
     card sized as a percentage would have nothing in flow to measure and would
     collapse to the width of the book's name. */
  .thumb {
    position: relative; display: block;
    width: clamp(78px, 21vw, 118px); aspect-ratio: 1;
    padding: 9%;
    border-radius: 22%;
    background: #fff;
    box-shadow: 0 0 0 1px rgb(0 27 52 / 8%), 0 0 15px 4px var(--trivia-idle-glow);
    transition: box-shadow .25s ease, transform .2s ease;
  }
  /* The gold frame is a different size and a little off centre in every file,
     which is glaring with three side by side. Each image is scaled and shifted
     by its measured bounds so every frame ends up exactly this box, and the box
     is clipped to that frame's own corner radius. */
  .art {
    position: relative; display: block;
    width: 100%; height: 100%; overflow: hidden;
  }
  .art img { position: absolute; display: block; }
  .choice:not(:disabled):hover .thumb,
  .choice:focus-visible .thumb { transform: translateY(-2px); }
  .choice:focus-visible { outline: none; }
  .choice:focus-visible .thumb {
    box-shadow: 0 0 0 3px var(--trivia-navy), 0 0 16px 4px var(--trivia-idle-glow);
  }
  .choice[data-state="correct"] .thumb {
    box-shadow: 0 0 0 2px var(--trivia-green), 0 0 20px 6px rgb(31 122 68 / 75%);
  }
  .choice[data-state="wrong"] .thumb {
    box-shadow: 0 0 0 2px var(--trivia-red), 0 0 20px 6px rgb(198 40 40 / 75%);
  }
  .label { overflow-wrap: anywhere; }

  .verdict {
    margin: 0; min-height: 1.4em; text-align: center;
    font: 700 clamp(1rem, .95rem + .35vw, 1.2rem)/1.4 'Strait', 'Roboto', sans-serif;
  }
  .verdict[data-state="correct"] { color: var(--trivia-green); }
  .verdict[data-state="wrong"] { color: var(--trivia-red); }

  .message {
    margin: 0; padding: 22px 18px; text-align: center; color: #4f5c65;
    font: 1rem/1.5 'Roboto', Arial, sans-serif;
  }

  @media (max-width: 420px) {
    .content { gap: 14px; padding: 14px; }
    .choices { gap: 8px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .thumb { transition: none; }
  }
`;

export class BibleTrivia extends HTMLElement {
  static observedAttributes = ['media-base'];

  #root;
  #dialog;
  #content;
  #fact = null;
  #answered = false;
  #verdictTimer = null;
  #opening = null;
  #previousOverflow = '';

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <dialog aria-label="Did you know? Bible Trivia Quiz" tabindex="-1">
        <img class="banner" src="${BANNER_URL}" alt="Did you know? Bible Trivia Quiz"
             width="2170" height="725" />
        <div class="content"><p class="message">Loading a question…</p></div>
      </dialog>`;
    this.#dialog = this.#root.querySelector('dialog');
    this.#content = this.#root.querySelector('.content');

    // Escape must not close an unanswered quiz.
    this.#dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      if (this.#answered) this.close();
    });
    // Once answered, a tap anywhere — tile, paper or backdrop — closes it.
    this.#dialog.addEventListener('click', () => {
      if (this.#answered) this.close();
    });
  }

  connectedCallback() {
    registerFonts();
    if (this.hasAttribute('auto')) this.#scheduleAutoOpen();
  }

  disconnectedCallback() {
    this.#clearVerdictTimer();
    if (this.#dialog.open) this.close();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Re-rendering reshuffles the choices, so never do it mid-answer.
    if (oldValue === newValue || !this.#fact || this.#answered) return;
    if (name === 'media-base') this.#renderQuiz(this.#fact);
  }

  get #mediaBase() {
    const base = this.getAttribute('media-base') || DEFAULT_MEDIA_BASE;
    return base.endsWith('/') ? base : `${base}/`;
  }

  #number(name, fallback) {
    const value = Number.parseInt(this.getAttribute(name), 10);
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  }

  /** Waits for the page to finish loading, then opens if the quota allows. */
  #scheduleAutoOpen() {
    const start = () => {
      setTimeout(() => {
        if (this.isConnected) this.open();
      }, this.#number('delay', DEFAULT_DELAY));
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
  }

  /** Why the quiz may not run right now, or null when it may. */
  #blockedReason() {
    if (arrivedFromOwnSite()) return 'internal-navigation';

    const tally = readTally();
    if (tally.count >= this.#number('max-per-day', DEFAULT_MAX_PER_DAY)) return 'daily-limit';

    const gap = this.#number('min-gap-minutes', DEFAULT_MIN_GAP_MINUTES) * 60_000;
    if (tally.last && Date.now() - tally.last < gap) return 'too-soon';
    return null;
  }

  async #readFact() {
    const database = await openDatabase(new URL(this.getAttribute('src') || DEFAULT_SRC, document.baseURI));
    try {
      const [row] = query(database, FACT_QUERY);
      if (!row) throw new Error('The did_you_know table is empty.');
      return {
        id: row.id,
        title: row.Title,
        text: row.Fact,
        book: row.Book,
        similar: String(row.Similar_books || '')
          .split(',')
          .map((book) => book.trim())
          .filter((book) => book && book !== row.Book),
      };
    } finally {
      database.close();
    }
  }

  /**
   * Shows the quiz.
   * @param {{ force?: boolean }} [options] force skips the quota checks.
   * @returns {Promise<boolean>} whether it opened.
   */
  async open({ force = false } = {}) {
    if (this.#dialog.open || this.#opening) return false;

    if (!force) {
      const reason = this.#blockedReason();
      if (reason) {
        this.dispatchEvent(new CustomEvent('skipped', { detail: { reason } }));
        return false;
      }
    }

    const opening = (this.#opening = this.#readFact());
    let fact;
    try {
      fact = await opening;
    } catch (error) {
      console.warn('Bible trivia could not be loaded:', error);
      this.dispatchEvent(new CustomEvent('error', { detail: { message: error.message } }));
      return false;
    } finally {
      if (opening === this.#opening) this.#opening = null;
    }
    if (!this.isConnected) return false;

    this.#fact = fact;
    this.#answered = false;
    this.#renderQuiz(fact);

    this.#previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    this.#dialog.showModal();
    // showModal would otherwise focus the first choice, ringing one tile as
    // though it were special. The dialog itself takes the focus instead.
    this.#dialog.focus();
    this.#pop('open');

    // Only a quiz actually put on screen counts against the daily quota.
    if (!force) {
      const tally = readTally();
      writeTally({ day: manilaDay(), count: tally.count + 1, last: Date.now() });
    }

    this.dispatchEvent(new CustomEvent('ready', { detail: { id: fact.id, book: fact.book } }));
    return true;
  }

  /**
   * Forgets today's tally, so the quiz is free to appear again. The footer's
   * secret double tap uses this; nothing else needs it.
   */
  reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Blocked storage had nothing to forget.
    }
  }

  close() {
    this.#clearVerdictTimer();
    if (!this.#dialog.open) return;
    this.#dialog.close();
    this.#dialog.removeAttribute('data-answered');
    document.documentElement.style.overflow = this.#previousOverflow;
    this.dispatchEvent(new CustomEvent('closed', { detail: { answered: this.#answered } }));
  }

  #pop(direction) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const opening = direction === 'open';
    const options = {
      duration: opening ? 460 : 220,
      easing: opening ? 'cubic-bezier(.2, .9, .25, 1.2)' : 'cubic-bezier(.4, 0, 1, 1)',
      fill: 'forwards',
    };
    this.#dialog.animate(
      opening
        ? [{ transform: 'scale(.82) translateY(28px)', opacity: 0 }, { transform: 'none', opacity: 1 }]
        : [{ transform: 'none', opacity: 1 }, { transform: 'scale(.94)', opacity: 0 }],
      options,
    );
  }

  #clearVerdictTimer() {
    if (this.#verdictTimer) {
      clearTimeout(this.#verdictTimer);
      this.#verdictTimer = null;
    }
  }

  #renderQuiz(fact) {
    // Two of the four similar books join the right answer, in random places.
    const wrong = shuffle(fact.similar).slice(0, 2);
    const options = shuffle([fact.book, ...wrong]);

    const title = document.createElement('h3');
    title.className = 'title';
    title.textContent = fact.title;

    const text = document.createElement('p');
    text.className = 'text';
    text.textContent = fact.text;

    const box = document.createElement('div');
    box.className = 'fact';
    box.append(title, text);

    const question = document.createElement('p');
    question.className = 'question';
    question.id = 'trivia-question';
    question.textContent = QUESTION;

    const choices = document.createElement('ul');
    choices.className = 'choices';
    choices.setAttribute('aria-labelledby', 'trivia-question');
    for (const book of options) {
      const item = document.createElement('li');
      item.append(this.#createChoice(book, fact));
      choices.append(item);
    }

    const verdict = document.createElement('p');
    verdict.className = 'verdict';
    verdict.setAttribute('role', 'status');
    verdict.setAttribute('aria-live', 'polite');

    this.#content.replaceChildren(box, question, choices, verdict);
  }

  #createChoice(book, fact) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice';
    button.setAttribute('aria-label', book);

    const thumb = document.createElement('span');
    thumb.className = 'thumb';
    const art = document.createElement('span');
    art.className = 'art';

    const image = document.createElement('img');
    image.alt = '';
    image.src = `${this.#mediaBase}images/thumbnails/${encodeURIComponent(book)}${THUMBNAIL_SUFFIX}`;
    // Blow the file up until its gold frame alone fills the tile.
    const [x, y, size, radius] = BOOK_THUMB_BOUNDS[book] ?? DEFAULT_THUMB_BOUNDS;
    const side = size * THUMBNAIL_TRIM;
    const inset = (size - side) / 2;
    image.style.width = `${100 / side}%`;
    image.style.height = `${100 / side}%`;
    image.style.left = `${(-(x + inset) / side) * 100}%`;
    image.style.top = `${(-(y + inset) / side) * 100}%`;
    // Clip to the frame's own corner, which hides whatever a file carries
    // outside it: a shadow, a halo, or a stray checkerboard.
    art.style.borderRadius = `${radius * 100}%`;
    // A missing thumbnail leaves the white card and its label in place.
    image.onerror = () => { image.style.visibility = 'hidden'; };

    art.append(image);
    thumb.append(art);

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = book;

    button.append(thumb, label);
    button.addEventListener('click', (event) => {
      event.stopPropagation(); // the dialog's own click closes an answered quiz
      this.#answer(button, book, fact);
    });
    return button;
  }

  #answer(button, book, fact) {
    if (this.#answered) return;
    this.#answered = true;
    this.#dialog.setAttribute('data-answered', '');

    const correct = book === fact.book;
    for (const choice of this.#root.querySelectorAll('.choice')) choice.disabled = true;
    button.dataset.state = correct ? 'correct' : 'wrong';

    const verdict = this.#root.querySelector('.verdict');
    verdict.dataset.state = correct ? 'correct' : 'wrong';
    verdict.textContent = correct ? CORRECT_MESSAGE : WRONG_MESSAGE;

    const sound = new Audio(correct ? CORRECT_SOUND : WRONG_SOUND);
    sound.play().catch(() => {}); // a blocked sound must not break the quiz

    this.dispatchEvent(new CustomEvent('answered', {
      detail: { id: fact.id, book: fact.book, chosen: book, correct },
    }));

    // The verdict stays up briefly, unless a tap closes the quiz first.
    this.#verdictTimer = setTimeout(() => this.close(), VERDICT_MS);
  }
}

if (!customElements.get('bible-trivia')) {
  customElements.define('bible-trivia', BibleTrivia);
}
