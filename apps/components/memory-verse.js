/**
 * <memory-verse> — one verse a week, learned by heart a minute a day.
 *
 * The week runs Sunday to Saturday in Asia/Manila, as on the Flipbook and the
 * Moment. Its verse is the one marked "memory": true in that week's entries of
 * the month verse files, or else Sunday's.
 *
 * On the page it is a dark green card: the verse's book picture (as on Bible
 * Sayings), "This Week’s Memory Verse Challenge", the reference, the whole
 * verse, seven dots for the days practised, and a gold double arrow that
 * nudges toward it until the verse is learned. Tapping it opens one
 * short practice, a little harder each day the reader comes back:
 *   1 Read it        read the whole verse aloud, three times
 *   2 Phrase by phrase   tap to bring it in a phrase at a time
 *   3 Fill a few     every fourth word is a blank; tap one to peek
 *   4 Fill half      every other word is a blank
 *   5 First letters  only the first letter of each word
 *   6 Put it in order    tap the phrases in the right order
 *   7 Say it         only the reference; say it, then check
 * The practice follows the days practised, not the calendar, so a missed day
 * picks up where the reader left off. One practice a day moves it on; opening
 * it again the same day repeats that day's practice. Saying it with "I had it"
 * on the last one marks the verse learned, and the card turns gold.
 *
 * Usage
 *   <memory-verse></memory-verse>
 *   <script type="module" src="./apps/components/memory-verse.js"></script>
 *
 * Attributes
 *   media-base   Base URL for the book thumbnails, the same pictures as on
 *                <bible-sayings> (images/thumbnails/<Book>_square.webp).
 *                Default: https://dailygrace.faith/media/
 *   verses-base  Folder of the month verse files (<YYYY>/<month>.json, see
 *                daily-verses.js), resolved against the page.
 *                Default: assets/verses/
 *   date         A day of the week to show, as YYYY-MM-DD. Default: today in
 *                Asia/Manila, moving on to the new week after Saturday.
 *
 * Kept in localStorage (when it is available), on this device only:
 *   dailygrace:memory:progress  the days practised, by the week's Sunday
 *   dailygrace:memory:learned   the verses learned: { verse, week }
 *
 * Methods      open(), close()
 * Properties   ready (read-only)  whether the week has a verse
 *              verse (read-only)  the week's entry, or null
 * Events       memorypractice  a practice was finished, detail: { week, day, learned }
 */

import { registerFonts } from '../../assets/scripts/fonts.js';
import { DEFAULT_VERSES_BASE, loadVerses } from './daily-verses.js?v=20261004-1';
import { parseReference } from './scripture-refs.js?v=20261002-1';
import { BOOK_THUMB_BOUNDS, DEFAULT_THUMB_BOUNDS } from './book-thumb-bounds.js';

const DEFAULT_MEDIA_BASE = 'https://dailygrace.faith/media/';
// const DEFAULT_MEDIA_BASE = 'http://localhost:9001/media/';
// The book thumbnails, as on <bible-sayings>: .webp on the media host, each
// blown up until its gold frame alone fills the square (book-thumb-bounds.js).
const bookThumbnailUrl = (mediaBase, book) =>
  `${mediaBase}images/thumbnails/${encodeURIComponent(book)}_square.webp`;
const THUMBNAIL_TRIM = 0.985;

const TIME_ZONE = 'Asia/Manila';
const DAY_MS = 86400000;

const PROGRESS_KEY = 'dailygrace:memory:progress';
const LEARNED_KEY = 'dailygrace:memory:learned';
// About two months of weeks, and a few years of learned verses.
const MAX_WEEKS = 8;
const MAX_LEARNED = 200;
// Phrases longer than this are cut into pieces of about this many words.
const PHRASE_WORDS = 5;
const READS = 3;

const PRACTICES = [
  { kind: 'read', name: 'Read it', hint: 'Read it aloud, slowly. Then read it again.' },
  { kind: 'phrases', name: 'Phrase by phrase', hint: 'Tap to bring in the next phrase. Say each one as it comes.' },
  { kind: 'blanks', every: 4, name: 'Fill a few', hint: 'Say the verse, filling in the blanks. Tap a blank to peek.' },
  { kind: 'blanks', every: 2, name: 'Fill half', hint: 'Half the words are gone. Tap a blank to peek.' },
  { kind: 'letters', name: 'First letters', hint: 'Only the first letters are left. Tap a word to peek.' },
  { kind: 'order', name: 'Put it in order', hint: 'Tap the phrases in the order they come.' },
  { kind: 'say', name: 'Say it', hint: 'Say the verse out loud, or in your heart. Then check.' },
];

const ICON_ATTRS = 'viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const CLOSE_ICON = `<svg ${ICON_ATTRS}><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>`;
const NEXT_ICON = `<svg ${ICON_ATTRS}><polyline points="9 6 15 12 9 18"/></svg>`;
const DOUBLE_NEXT_ICON = `<svg ${ICON_ATTRS}><polyline points="5 6 11 12 5 18"/><polyline points="13 6 19 12 13 18"/></svg>`;
const CHECK_ICON = `<svg ${ICON_ATTRS}><polyline points="5 12 10 17 19 7"/></svg>`;
const BOOK_ICON = `<svg ${ICON_ATTRS}><path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2z"/><path d="M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/></svg>`;

const STYLES = /* css */ `
  :host {
    --memory-navy: var(--navy, #001b34);
    --memory-gold: var(--gold, #c6922e);
    --memory-gold-light: var(--gold-light, #e1b65d);
    --memory-gold-ink: #7d5a12;
    --memory-cream: #f6eedf;
    --memory-paper: #fbf5e9;
    --memory-green: #0b3324;
    --memory-green-2: #145238;
    --memory-ink: var(--ink, #10253b);
    --memory-muted: #56606e;
    --memory-line: #e2d5bb;

    display: block;
    padding-inline: 10px;
  }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }
  button { font: inherit; }
  [hidden] { display: none !important; }

  /* ----- The card on the page -----
     Dark green with a gold edge, set apart from the blueprint card above it,
     showing the whole verse. Learned: warm gold, with a check on the icon. */
  /* The picture beside the title and reference; the verse below them runs
     from under the picture, the arrow on its right; the dots and the status
     sit centred along the foot. */
  .card {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas:
      "icon head  arrow"
      "text text  arrow"
      "meta meta  meta";
    align-items: center;
    column-gap: 14px;
    width: 100%;
    padding: 16px 18px;
    border: 1px solid rgb(225 182 93 / 40%);
    border-left: 5px solid var(--memory-gold);
    border-radius: 10px;
    background:
      radial-gradient(120% 120% at 0% 0%, rgb(225 182 93 / 14%) 0%, transparent 55%),
      linear-gradient(180deg, var(--memory-green-2) 0%, var(--memory-green) 100%);
    color: #fff;
    text-align: left;
    box-shadow: 0 10px 26px rgb(6 38 26 / 28%);
    cursor: pointer;
    transition: transform .15s ease, box-shadow .15s ease;
  }
  .card:hover { transform: translateY(-1px); box-shadow: 0 14px 32px rgb(6 38 26 / 34%); }
  .card:focus-visible { outline: 3px solid var(--memory-gold-light); outline-offset: 3px; }
  /* The book's picture, clipped to its gold frame; a gold disc with a book
     drawn on it until the picture loads, or if it never does. */
  .card-icon {
    position: relative;
    display: grid; place-items: center; flex: none;
    width: 76px; height: 76px; border-radius: 50%;
    grid-area: icon;
    background: var(--memory-gold-light); color: var(--memory-green);
  }
  .card-icon > svg { width: 34px; height: 34px; }
  .symbol { position: absolute; inset: 0; overflow: hidden; }
  .symbol img { position: absolute; display: block; }
  .card-icon.pictured { background: none; border-radius: 0; box-shadow: 0 6px 14px rgb(0 0 0 / 30%); }
  .card-icon.pictured > svg { display: none; }
  .card-check {
    z-index: 1;
    position: absolute; right: -4px; bottom: -4px;
    display: none; place-items: center;
    width: 24px; height: 24px;
    border: 2px solid var(--memory-green); border-radius: 50%;
    background: var(--memory-gold); color: #fff;
  }
  .card-check svg { width: 13px; height: 13px; stroke-width: 3.5; }
  .card-head { grid-area: head; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .eyebrow {
    color: var(--memory-gold-light);
    font: 700 .95rem/1.2 'Strait', 'Roboto', sans-serif;
    letter-spacing: .03em;
  }
  .card-ref { color: #fff; font: 400 1.4rem/1.15 'Germania One', Georgia, serif; letter-spacing: .02em; }
  /* Room above and below the verse, so it reads apart from the reference and the dots. */
  .card-snippet {
    position: relative;
    grid-area: text;
    margin: 22px 0 20px;
    /* Room on the left for the big opening quotation mark. */
    padding-left: 40px;
    color: #e4efe8;
    font: 400 1.15rem/1.4 'Strait', 'Roboto', sans-serif;
    /* The verse stays at Strait's one regular weight, never a made-up bold. */
    font-synthesis: none;
    text-wrap: pretty;
  }
  .card-meta { grid-area: meta; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; }
  .card-status { color: #c4dccf; font: 400 .95rem 'Strait', 'Roboto', sans-serif; }
  .card-chevron { grid-area: arrow; color: var(--memory-gold-light); }
  .card-chevron svg { display: block; width: 34px; height: 34px; stroke-width: 3.4; }
  /* Until the verse is learned, the arrow keeps nudging toward it. */
  .card.due .card-chevron { animation: nudge 1.8s ease-in-out infinite; }
  .card.due:hover .card-chevron { animation-duration: .9s; }
  @keyframes nudge {
    0%, 60%, 100% { transform: translateX(0); }
    30% { transform: translateX(6px); }
  }

  .card.learned {
    border-color: rgb(90 60 10 / 35%);
    background: linear-gradient(180deg, #e3bc66 0%, #c99a3a 100%);
  }
  .card.learned .card-icon:not(.pictured) { background: var(--memory-navy); color: var(--memory-gold-light); }
  .card.learned .card-check { display: grid; background: var(--memory-navy); border-color: #e3bc66; }
  .card.learned .card-ref { color: var(--memory-navy); }
  .card.learned .eyebrow, .card.learned .card-status { color: #2b1d03; }
  /* Big gold quotation marks around the verse: the opening one beside its
     first line, the closing one after its last word. */
  .card-snippet::before,
  .card-snippet::after {
    color: var(--memory-gold-light);
    font: 400 4rem/1 Georgia, 'Times New Roman', serif;
    pointer-events: none;
  }
  .card-snippet::before { content: "“"; position: absolute; left: 9px; top: -.12em; }
  .card-snippet::after { content: "”"; margin-left: 4px; line-height: 0; vertical-align: -.58em; }
  .card.learned .card-snippet { color: #2b1d03; }
  .card.learned .card-snippet::before,
  .card.learned .card-snippet::after { color: var(--memory-navy); }
  .card.learned .card-chevron { color: var(--memory-navy); }

  /* Seven dots, one per day practised this week. */
  .dots { display: flex; gap: 5px; }
  .dots span { width: 9px; height: 9px; border-radius: 50%; border: 1.5px solid rgb(255 255 255 / 35%); }
  .dots span.on { border: 0; background: var(--memory-gold-light); }
  .card.learned .dots span { border-color: rgb(43 29 3 / 40%); }
  .card.learned .dots span.on { background: var(--memory-navy); }

  /* ----- The practice ----- */
  dialog {
    width: 100%; max-width: 100%;
    height: 100%; max-height: 100%;
    margin: 0; padding: 0; border: 0;
    background: var(--memory-cream);
    color: var(--memory-ink);
    overflow: hidden;
  }
  dialog.navy { background: var(--memory-navy); color: #fff; }
  dialog::backdrop { background: rgb(0 27 52 / 72%); }
  @media (min-width: 600px) {
    dialog {
      width: 460px;
      height: min(780px, calc(100% - 48px));
      margin: auto;
      border-radius: 24px;
      box-shadow: 0 30px 80px rgb(0 0 0 / 45%);
    }
  }
  .frame { display: flex; flex-direction: column; height: 100%; }
  .bar {
    display: flex; align-items: center; gap: 10px;
    padding: max(14px, env(safe-area-inset-top)) 18px 0 8px;
  }
  .close {
    display: grid; place-items: center; flex: none;
    width: 44px; height: 44px; padding: 0;
    border: 0; border-radius: 50%;
    background: none; color: inherit;
    cursor: pointer;
  }
  .close svg { width: 22px; height: 22px; }
  .close:focus-visible { outline: 2px solid currentColor; outline-offset: -4px; }
  .progress { display: grid; flex: 1; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; }
  .progress span { height: 5px; border-radius: 3px; background: var(--memory-line); }
  .progress span.past { background: var(--memory-navy); }
  .progress span.now { background: var(--memory-gold); }
  dialog.navy .progress span { background: rgb(255 255 255 / 22%); }
  dialog.navy .progress span.past,
  dialog.navy .progress span.now { background: var(--memory-gold-light); }
  .count { min-width: 44px; text-align: right; color: var(--memory-muted); font: 600 .85rem 'Strait', 'Roboto', sans-serif; }
  dialog.navy .count { color: #cfd8e6; }

  .body {
    display: flex; flex: 1; flex-direction: column; gap: 20px;
    min-height: 0; overflow-y: auto;
    padding: 20px 30px;
  }
  .body > * { flex-shrink: 0; }
  .body > :first-child { margin-top: auto; }
  .body > :last-child { margin-bottom: auto; }
  .body.enter { animation: step-in .35s ease both; }
  @keyframes step-in { from { opacity: 0; transform: translateY(8px); } }
  .body.center { align-items: center; text-align: center; }

  .label {
    color: var(--memory-gold-ink);
    font: 700 .8rem/1.2 'Strait', 'Roboto', sans-serif;
    letter-spacing: .16em; text-transform: uppercase;
  }
  dialog.navy .label { color: var(--memory-gold-light); }
  .heading { margin: 0; font: 400 2.1rem/1.1 'Germania One', Georgia, serif; letter-spacing: .02em; }
  .heading:focus, .verse:focus { outline: none; }
  .note { margin: 0; color: var(--memory-muted); font: 400 1rem/1.4 'Strait', 'Roboto', sans-serif; }
  dialog.navy .note, dialog.navy .lead { color: #cfd8e6; }
  .lead { margin: 0; font: 400 1.2rem/1.5 'Strait', 'Roboto', sans-serif; }
  .rule { width: 48px; height: 3px; border-radius: 2px; background: var(--memory-gold); }
  .reference { color: var(--memory-gold-ink); font: 700 1.35rem Georgia, serif; }
  .reference.big { color: var(--memory-navy); font: 400 2.6rem/1.1 'Germania One', Georgia, serif; letter-spacing: .02em; }

  .verse { margin: 0; color: var(--memory-navy); font: 400 1.65rem/1.55 Georgia, 'Times New Roman', serif; text-wrap: pretty; }
  @media (max-height: 700px) { .verse { font-size: 1.4rem; } }

  /* A word left out: a gap its own length, tapped to peek. */
  .gap {
    display: inline-block;
    min-width: 1.6em; padding: 0 .1em;
    border: 0; border-bottom: 2px solid var(--memory-gold);
    background: none; color: transparent;
    font: inherit; line-height: 1.1;
    cursor: pointer;
  }
  .gap.letter { color: var(--memory-navy); text-align: left; }
  .gap.shown { border-bottom-color: transparent; background: rgb(225 182 93 / 28%); border-radius: 4px; color: var(--memory-gold-ink); }
  .gap:focus-visible { outline: 2px solid var(--memory-gold); outline-offset: 2px; }

  /* Phrase by phrase: the phrases still to come are faint. */
  .verse .later { color: transparent; text-shadow: 0 0 12px rgb(0 27 52 / 22%); }
  .verse .fresh { animation: fade-in .4s ease both; }
  @keyframes fade-in { from { opacity: 0; } }

  /* Put it in order */
  .built { min-height: 3.2em; padding-bottom: 10px; border-bottom: 2px dashed var(--memory-line); }
  .built:empty::before { content: "Tap the first phrase…"; color: var(--memory-muted); font: 400 1.1rem Georgia, serif; }
  .tiles { display: flex; flex-wrap: wrap; gap: 10px; }
  .tile {
    padding: 10px 14px;
    border: 1.5px solid #d6c8a8; border-radius: 12px;
    background: #fffdf8; color: var(--memory-navy);
    font: 400 1.1rem/1.3 Georgia, 'Times New Roman', serif;
    text-align: left;
    box-shadow: 0 2px 0 #d6c8a8;
    cursor: pointer;
  }
  .tile:focus-visible { outline: 3px solid var(--memory-gold); outline-offset: 2px; }
  .tile.wrong { animation: shake .35s ease; border-color: #c62828; }
  @keyframes shake { 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }

  /* Read it: three marks, one for each reading. */
  .reads { display: flex; gap: 10px; }
  .reads span {
    display: grid; place-items: center;
    width: 30px; height: 30px; border-radius: 50%;
    border: 1.5px solid #c9b78f; color: #fff;
  }
  .reads span.on { border: 0; background: var(--memory-gold); }
  .reads svg { width: 16px; height: 16px; stroke-width: 3; }

  /* Finished */
  .seal {
    display: grid; place-items: center;
    width: 96px; height: 96px; border-radius: 50%;
    background: var(--memory-gold-light); color: var(--memory-navy);
    box-shadow: 0 0 0 10px rgb(225 182 93 / 16%);
  }
  .seal svg { width: 48px; height: 48px; stroke-width: 3; }
  .done-title { margin: 0; color: var(--memory-gold-light); font: 400 3rem/1 'Germania One', Georgia, serif; }
  .done-title:focus { outline: none; }
  .week {
    align-self: stretch;
    display: flex; flex-direction: column; gap: 12px;
    padding: 16px; border-radius: 18px;
    background: rgb(255 255 255 / 7%);
  }
  .week .dots { justify-content: center; gap: 10px; }
  .week .dots span { width: 22px; height: 22px; border-color: rgb(255 255 255 / 30%); }
  .week .dots span.on { background: var(--memory-gold-light); }

  /* The buttons along the foot */
  .nav {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 20px max(24px, env(safe-area-inset-bottom));
  }
  .main, .second {
    display: flex; flex: 1; align-items: center; justify-content: center; gap: 8px;
    min-height: 54px; padding: 0 18px;
    border: 0; border-radius: 999px;
    font: 700 1.1rem 'Strait', 'Roboto', sans-serif;
    cursor: pointer;
  }
  .main { background: var(--memory-navy); color: #fff; }
  .main svg { width: 18px; height: 18px; stroke-width: 2.4; }
  .second { flex: none; border: 1.5px solid #c9b78f; background: none; color: var(--memory-navy); }
  dialog.navy .main { background: var(--memory-gold-light); color: var(--memory-navy); }
  .main:focus-visible, .second:focus-visible { outline: 3px solid var(--memory-gold); outline-offset: 2px; }

  @media (prefers-reduced-motion: reduce) {
    .card { transition: none; }
    .card.due .card-chevron { animation: none; }
    .body.enter, .verse .fresh, .tile.wrong { animation: none; }
  }
`;

/* ---------- Days ---------- */

function manilaToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date());
}

const isoOf = (date) => date.toISOString().slice(0, 10);

/** The Sunday-to-Saturday week around a YYYY-MM-DD day, as UTC-midnight Dates. */
function weekOf(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const sunday = date.getTime() - date.getUTCDay() * DAY_MS;
  return Array.from({ length: 7 }, (_, i) => new Date(sunday + i * DAY_MS));
}

const dayName = (date) =>
  date.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' });

/* ---------- Storage, on this device only ---------- */

function readStore(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or a full store: the practice still works, it just forgets.
  }
}

/* ---------- The verse, taken apart ---------- */

const escapeHtml = (text) => String(text ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

/** Each word split into its leading marks, the word itself and its trailing marks. */
function wordsOf(text) {
  return String(text).trim().split(/\s+/).map((token) => {
    const [, lead, core, trail] = /^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u.exec(token);
    return { lead, core, trail };
  });
}

/** The verse in phrases: cut at its punctuation, and long phrases cut again into pieces. */
function phrasesOf(text) {
  const phrases = [];
  for (const part of String(text).trim().split(/(?<=[,;:.!?])\s+/)) {
    const words = part.split(/\s+/);
    const pieces = Math.ceil(words.length / PHRASE_WORDS);
    const size = Math.ceil(words.length / pieces);
    for (let i = 0; i < words.length; i += size) phrases.push(words.slice(i, i + size).join(' '));
  }
  return phrases;
}

/** A shuffle that is the same all week (seeded by its Sunday) and never the verse's own order. */
function shuffled(items, seed) {
  let state = [...seed].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 7);
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
  const order = items.map((_, i) => i);
  for (let attempt = 0; attempt < 5; attempt++) {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    if (order.some((value, i) => value !== i)) break;
  }
  if (order.length > 1 && order.every((value, i) => value === i)) order.reverse();
  return order;
}

export class MemoryVerse extends HTMLElement {
  static observedAttributes = ['media-base', 'verses-base', 'date'];

  #root;
  #card;
  #dialog;
  #progress;
  #count;
  #body;
  #nav;

  #today = manilaToday();
  #week = null;      // { sunday, days: [iso…] }
  #entry = null;
  #level = 0;        // the practice open now, 0 to 6
  #screen = 'practice';
  #state = {};       // the open practice's taps and peeks
  #loadId = 0;
  #configurePending = false;
  #reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  constructor() {
    super();
    this.hidden = true;
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <button class="card" type="button" aria-haspopup="dialog">
        <span class="card-icon">${BOOK_ICON}<span class="symbol"></span><span class="card-check">${CHECK_ICON}</span></span>
        <span class="card-head">
          <span class="eyebrow">This Week’s Memory Verse Challenge</span>
          <span class="card-ref"></span>
        </span>
        <span class="card-snippet"></span>
        <span class="card-meta">
          <span class="dots" aria-hidden="true">${'<span></span>'.repeat(7)}</span>
          <span class="card-status"></span>
        </span>
        <span class="card-chevron" aria-hidden="true">${DOUBLE_NEXT_ICON}</span>
      </button>
      <dialog aria-labelledby="step-title">
        <div class="frame">
          <div class="bar">
            <button class="close" type="button" aria-label="Close the practice">${CLOSE_ICON}</button>
            <div class="progress" aria-hidden="true">${'<span></span>'.repeat(PRACTICES.length)}</div>
            <span class="count"></span>
          </div>
          <div class="body"></div>
          <div class="nav"></div>
        </div>
      </dialog>`;
    this.#card = this.#root.querySelector('.card');
    this.#dialog = this.#root.querySelector('dialog');
    this.#progress = [...this.#root.querySelectorAll('.progress span')];
    this.#count = this.#root.querySelector('.count');
    this.#body = this.#root.querySelector('.body');
    this.#nav = this.#root.querySelector('.nav');

    this.#card.addEventListener('click', () => this.open());
    this.#root.querySelector('.close').addEventListener('click', () => this.close());
    this.#dialog.addEventListener('close', () => this.#closed());
    this.#dialog.addEventListener('click', (event) => {
      if (event.target === this.#dialog) this.close();
    });
    // The practice's own buttons, wired once for every screen.
    this.#body.addEventListener('click', (event) => this.#bodyClick(event));
    this.#nav.addEventListener('click', (event) => {
      const action = event.target.closest('button')?.dataset.action;
      if (action) this.#act(action);
    });
  }

  connectedCallback() {
    registerFonts();
    this.#scheduleConfigure();
    document.addEventListener('visibilitychange', this.#checkDate);
  }

  disconnectedCallback() {
    document.removeEventListener('visibilitychange', this.#checkDate);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) this.#scheduleConfigure();
  }

  // Coming back after midnight may begin a new day, or a new week.
  #checkDate = () => {
    if (document.hidden || this.#dialog.open || this.hasAttribute('date')) return;
    if (manilaToday() !== this.#today) this.#scheduleConfigure();
  };

  get ready() {
    return Boolean(this.#entry);
  }

  get verse() {
    return this.#entry;
  }

  #scheduleConfigure() {
    if (this.#configurePending) return;
    this.#configurePending = true;
    queueMicrotask(() => {
      this.#configurePending = false;
      this.#configure();
    });
  }

  async #configure() {
    this.#today = manilaToday();
    const date = this.getAttribute('date');
    // With a date set, that day stands in for today.
    if (/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) this.#today = date;
    const days = weekOf(this.#today);
    const names = days.map(dayName);
    const loadId = ++this.#loadId;
    const base = new URL(this.getAttribute('verses-base') || DEFAULT_VERSES_BASE, document.baseURI).href;
    let entry = null;
    try {
      const verses = await loadVerses(base, names);
      const entries = names.map((name) => verses.get(name)).filter(Boolean);
      entry = entries.find((item) => item.memory === true) ?? verses.get(names[0]) ?? null;
    } catch (error) {
      console.warn("This week's memory verse could not be loaded:", error);
    }
    if (loadId !== this.#loadId) return; // a newer date or source took over
    this.#week = { sunday: isoOf(days[0]), days: days.map(isoOf) };
    this.#entry = entry;
    this.hidden = !entry;
    this.#renderCard();
  }

  /* ----- Progress ----- */

  /** The days practised this week, in order. */
  get #practised() {
    return readStore(PROGRESS_KEY, {})[this.#week.sunday] ?? [];
  }

  get #practisedToday() {
    return this.#practised.includes(this.#today);
  }

  /** Today's practice: one step on for each earlier day practised this week. */
  get #todaysLevel() {
    const before = this.#practised.filter((iso) => iso !== this.#today).length;
    return Math.min(before, PRACTICES.length - 1);
  }

  get #learned() {
    return readStore(LEARNED_KEY, []).some((item) => item.week === this.#week.sunday && item.verse === this.#entry?.verse);
  }

  #recordPractice(learned) {
    const progress = readStore(PROGRESS_KEY, {});
    const days = new Set(progress[this.#week.sunday] ?? []);
    days.add(this.#today);
    progress[this.#week.sunday] = [...days].sort();
    const kept = Object.keys(progress).sort().slice(-MAX_WEEKS);
    writeStore(PROGRESS_KEY, Object.fromEntries(kept.map((week) => [week, progress[week]])));
    if (learned && !this.#learned) {
      const list = readStore(LEARNED_KEY, []);
      list.push({ verse: this.#entry.verse, week: this.#week.sunday });
      writeStore(LEARNED_KEY, list.slice(-MAX_LEARNED));
    }
    this.dispatchEvent(new CustomEvent('memorypractice', {
      detail: { week: this.#week.sunday, day: this.#today, learned: this.#learned },
    }));
  }

  #renderCard() {
    if (!this.#entry) return;
    const count = this.#practised.length;
    const learned = this.#learned;
    const level = this.#todaysLevel;
    this.#card.classList.toggle('learned', learned);
    this.#card.classList.toggle('due', !learned);
    this.#renderSymbol();
    this.#card.querySelector('.card-ref').textContent = learned ? `${this.#entry.verse} — learned!` : this.#entry.verse;
    this.#card.querySelector('.card-snippet').textContent = this.#entry.text;
    this.#card.querySelectorAll('.dots span').forEach((dot, i) => dot.classList.toggle('on', i < count));
    const status = learned
      ? 'Tap to say it again'
      : this.#practisedToday
        ? `Practised today · ${count} of 7 days`
        : `Day ${level + 1} of 7 · ${PRACTICES[level].name} · 1 minute`;
    this.#card.querySelector('.card-status').textContent = status;
    this.#card.setAttribute('aria-label', `This Week’s Memory Verse Challenge, ${this.#entry.verse}. ${status}.`);
  }

  /** The verse's book picture, drawn as <bible-sayings> draws it. */
  #renderSymbol() {
    const icon = this.#card.querySelector('.card-icon');
    const symbol = icon.querySelector('.symbol');
    const book = parseReference(this.#entry.verse)?.book;
    const base = this.getAttribute('media-base') || DEFAULT_MEDIA_BASE;
    const url = book ? bookThumbnailUrl(base.endsWith('/') ? base : `${base}/`, book) : '';
    if (symbol.dataset.url === url) return;
    symbol.dataset.url = url;
    symbol.replaceChildren();
    icon.classList.remove('pictured');
    icon.style.borderRadius = '';
    if (!url) return;
    const image = document.createElement('img');
    image.alt = '';
    const [x, y, size, radius] = BOOK_THUMB_BOUNDS[book] ?? DEFAULT_THUMB_BOUNDS;
    const side = size * THUMBNAIL_TRIM;
    const inset = (size - side) / 2;
    image.style.width = `${100 / side}%`;
    image.style.height = `${100 / side}%`;
    image.style.left = `${(-(x + inset) / side) * 100}%`;
    image.style.top = `${(-(y + inset) / side) * 100}%`;
    image.onload = () => {
      if (symbol.dataset.url !== url) return;
      icon.classList.add('pictured');
      icon.style.borderRadius = `${radius * 100}%`;
      symbol.style.borderRadius = `${radius * 100}%`;
    };
    image.src = url;
    symbol.append(image);
  }

  /* ----- The practice ----- */

  /** Open today's practice. */
  open() {
    if (!this.#entry || this.#dialog.open) return;
    this.#level = this.#learned ? PRACTICES.length - 1 : this.#todaysLevel;
    this.#screen = 'practice';
    this.#state = {};
    this.#dialog.showModal();
    document.documentElement.style.overflow = 'hidden';
    this.#render();
  }

  close() {
    if (this.#dialog.open) this.#dialog.close();
  }

  #closed() {
    document.documentElement.style.overflow = '';
    this.#renderCard();
    this.#card.focus({ preventScroll: true });
  }

  #render() {
    const practice = PRACTICES[this.#level];
    const finished = this.#screen === 'finished';
    this.#dialog.className = finished ? 'navy' : '';
    this.#progress.forEach((bar, i) => {
      bar.className = i < this.#level || (finished && i === this.#level) ? 'past' : i === this.#level ? 'now' : '';
    });
    this.#count.textContent = `Day ${this.#level + 1}/7`;
    this.#body.className = `body${finished || practice.kind === 'say' ? ' center' : ''}`;
    this.#body.innerHTML = finished ? this.#finishedHtml() : this.#practiceHtml(practice);
    this.#body.scrollTop = 0;
    if (!this.#reducedMotion.matches) {
      void this.#body.offsetWidth; // restart the entrance animation
      this.#body.classList.add('enter');
    }
    this.#renderNav();
    this.#body.querySelector('#step-title')?.focus({ preventScroll: true });
  }

  #practiceHtml(practice) {
    const entry = this.#entry;
    const head = `
      <div>
        <div class="label">Day ${this.#level + 1} · ${escapeHtml(practice.name)}</div>
        <p class="note">${escapeHtml(practice.hint)}</p>
      </div>
      <div class="rule" aria-hidden="true"></div>`;
    const reference = `<div class="reference">${escapeHtml(entry.verse)}</div>`;
    switch (practice.kind) {
      case 'read': {
        const reads = this.#state.reads ?? 0;
        return `${head}
          <blockquote class="verse" id="step-title" tabindex="-1">${escapeHtml(entry.text)}</blockquote>
          ${reference}
          <div class="reads" aria-label="${reads} of ${READS} readings">${Array.from({ length: READS }, (_, i) =>
            `<span class="${i < reads ? 'on' : ''}">${i < reads ? CHECK_ICON : ''}</span>`).join('')}</div>`;
      }
      case 'phrases': {
        const phrases = phrasesOf(entry.text);
        const shown = this.#state.shown ?? 1;
        return `${head}
          <blockquote class="verse" id="step-title" tabindex="-1" aria-live="polite">${phrases.map((phrase, i) =>
            `<span class="${i >= shown ? 'later' : i === shown - 1 && shown > 1 ? 'fresh' : ''}"${i >= shown ? ' aria-hidden="true"' : ''}>${escapeHtml(phrase)}</span>`).join(' ')}</blockquote>
          ${reference}`;
      }
      case 'blanks':
      case 'letters': {
        const peeked = this.#state.peeked ?? new Set();
        const words = wordsOf(entry.text).map(({ lead, core, trail }, i) => {
          const hide = core && (practice.kind === 'letters' || i % practice.every === practice.every - 1);
          if (!hide) return escapeHtml(lead + core + trail);
          const shown = peeked.has(i);
          const letters = practice.kind === 'letters' && !shown;
          const label = shown ? core : letters ? `${core[0]}, a hidden word. Tap to peek` : 'A hidden word. Tap to peek';
          const face = shown ? core : letters ? core[0] : core;
          // A blank as long as its word; a first letter with a short line after it.
          const width = letters ? 0.9 + core.length * 0.18 : Math.max(core.length, 2) * 0.62;
          return `${escapeHtml(lead)}<button class="gap${shown ? ' shown' : ''}${letters ? ' letter' : ''}" type="button" data-word="${i}"
            style="${shown ? '' : `width:${width.toFixed(2)}em`}" aria-label="${escapeHtml(label)}">${escapeHtml(face)}</button>${escapeHtml(trail)}`;
        });
        return `${head}
          <blockquote class="verse" id="step-title" tabindex="-1">${words.join(' ')}</blockquote>
          ${reference}`;
      }
      case 'order': {
        const phrases = phrasesOf(entry.text);
        this.#state.order ??= shuffled(phrases, this.#week.sunday);
        const placed = this.#state.placed ?? 0;
        return `${head}
          <blockquote class="verse built" id="step-title" tabindex="-1" aria-live="polite">${phrases.slice(0, placed).map(escapeHtml).join(' ')}</blockquote>
          <div class="tiles">${this.#state.order.filter((i) => i >= placed).map((i) =>
            `<button class="tile" type="button" data-phrase="${i}">${escapeHtml(phrases[i])}</button>`).join('')}</div>
          ${reference}`;
      }
      case 'say':
        return this.#state.revealed
          ? `
            <div class="label">Day ${this.#level + 1} · ${escapeHtml(practice.name)}</div>
            <blockquote class="verse" id="step-title" tabindex="-1">${escapeHtml(entry.text)}</blockquote>
            ${reference}
            <p class="note">Did you have it?</p>`
          : `
            <div class="label">Day ${this.#level + 1} · ${escapeHtml(practice.name)}</div>
            <div class="reference big" id="step-title" tabindex="-1">${escapeHtml(entry.verse)}</div>
            <p class="lead">${escapeHtml(practice.hint)}</p>`;
      default:
        return '';
    }
  }

  #finishedHtml() {
    const learned = this.#learned;
    const count = this.#practised.length;
    const total = readStore(LEARNED_KEY, []).length;
    return `
      <div class="seal" aria-hidden="true">${CHECK_ICON}</div>
      <div>
        <h2 class="done-title" id="step-title" tabindex="-1">${learned ? 'Learned.' : `Day ${this.#level + 1} done.`}</h2>
        <p class="lead">${learned
          ? `${escapeHtml(this.#entry.verse)} is yours to keep.`
          : this.#level === PRACTICES.length - 1
            ? 'Nearly there. Say it again tomorrow, or now.'
            : `Come back tomorrow for ${escapeHtml(PRACTICES[this.#level + 1].name.toLowerCase())}.`}</p>
      </div>
      <div class="week">
        <div class="note">This week</div>
        <div class="dots" aria-hidden="true">${Array.from({ length: 7 }, (_, i) => `<span class="${i < count ? 'on' : ''}"></span>`).join('')}</div>
        <div class="note">${count} of 7 days practised${total ? ` · ${total} ${total === 1 ? 'verse' : 'verses'} learned` : ''}</div>
      </div>`;
  }

  #renderNav() {
    const practice = PRACTICES[this.#level];
    let buttons;
    if (this.#screen === 'finished') {
      const retry = this.#level === PRACTICES.length - 1 && !this.#learned;
      buttons = `${retry ? '<button class="second" type="button" data-action="again">Say it again</button>' : ''}
        <button class="main" type="button" data-action="close">Done</button>`;
    } else if (practice.kind === 'read') {
      const reads = this.#state.reads ?? 0;
      buttons = `<button class="main" type="button" data-action="read">I read it · ${reads + 1} of ${READS}</button>`;
    } else if (practice.kind === 'phrases') {
      const left = phrasesOf(this.#entry.text).length - (this.#state.shown ?? 1);
      buttons = left > 0
        ? `<button class="main" type="button" data-action="phrase">Next phrase ${NEXT_ICON}</button>`
        : '<button class="main" type="button" data-action="finish">Done</button>';
    } else if (practice.kind === 'order') {
      const complete = (this.#state.placed ?? 0) >= phrasesOf(this.#entry.text).length;
      buttons = complete
        ? '<button class="main" type="button" data-action="finish">Done</button>'
        : '<button class="second" type="button" data-action="hint">Show me</button>';
    } else if (practice.kind === 'say') {
      buttons = this.#state.revealed
        ? `<button class="second" type="button" data-action="almost">Almost</button>
           <button class="main" type="button" data-action="had">I had it ${CHECK_ICON}</button>`
        : '<button class="main" type="button" data-action="reveal">Show the verse</button>';
    } else {
      buttons = '<button class="main" type="button" data-action="finish">Done</button>';
    }
    this.#nav.innerHTML = buttons;
  }

  #act(action) {
    const phrases = () => phrasesOf(this.#entry.text);
    switch (action) {
      case 'read':
        this.#state.reads = (this.#state.reads ?? 0) + 1;
        if (this.#state.reads >= READS) this.#finish(false);
        else this.#update();
        break;
      case 'phrase':
        this.#state.shown = Math.min((this.#state.shown ?? 1) + 1, phrases().length);
        this.#update();
        break;
      case 'hint':
        this.#place(this.#state.placed ?? 0);
        break;
      case 'reveal':
        this.#state.revealed = true;
        this.#render();
        break;
      case 'had':
        this.#finish(true);
        break;
      case 'almost':
        this.#finish(false);
        break;
      case 'again':
        this.#screen = 'practice';
        this.#state = {};
        this.#render();
        break;
      case 'finish':
        this.#finish(false);
        break;
      case 'close':
        this.close();
        break;
      default:
    }
  }

  #bodyClick(event) {
    const gap = event.target.closest('.gap');
    if (gap) {
      (this.#state.peeked ??= new Set()).add(Number(gap.dataset.word));
      this.#update(gap.dataset.word && `[data-word="${gap.dataset.word}"]`);
      return;
    }
    const tile = event.target.closest('.tile');
    if (tile) {
      const index = Number(tile.dataset.phrase);
      if (index === (this.#state.placed ?? 0)) {
        this.#place(index);
      } else {
        tile.classList.remove('wrong');
        void tile.offsetWidth;
        tile.classList.add('wrong');
      }
    }
  }

  #place(index) {
    this.#state.placed = index + 1;
    this.#update('.tile');
  }

  /** Redraw the open practice in place, without the entrance animation, keeping focus near where it was. */
  #update(focusSelector) {
    this.#body.classList.remove('enter');
    this.#body.innerHTML = this.#practiceHtml(PRACTICES[this.#level]);
    this.#renderNav();
    const target = (focusSelector && this.#body.querySelector(focusSelector))
      ?? this.#nav.querySelector('.main, .second');
    target?.focus({ preventScroll: true });
  }

  #finish(learned) {
    this.#recordPractice(learned);
    this.#screen = 'finished';
    this.#render();
  }
}

if (!customElements.get('memory-verse')) {
  customElements.define('memory-verse', MemoryVerse);
}
