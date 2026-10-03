/**
 * <daily-moment> — the Daily Grace Moment: the day's devotional, one screen at
 * a time, in about five minutes.
 *
 * On the page it is a navy card, "Start today's Moment". Tapping it opens a
 * full-screen walk through the day: Pause, Read (the verse), Listen (the
 * poster and its narration), Reflect (the reflection, a paragraph or so per
 * screen), Respond (the day's question, with room to answer), Pray (the day's
 * prayer) and Amen. Reaching Amen marks the day done on this device, and the
 * card then says so. The reader can close it at any point, with the close
 * button or Escape; Back and Next (or the arrow keys) move between screens.
 *
 * Usage
 *   <daily-moment media-base="https://dailygrace.faith/media/" poster="poster-card"></daily-moment>
 *   <script type="module" src="./apps/components/daily-moment.js"></script>
 *
 * Attributes
 *   media-base     Base URL for the poster and narration.
 *                  Default: https://dailygrace.faith/media/
 *   verses-src     verses.json, resolved against the page. Default: assets/verses.json
 *   date           Day to walk through as YYYY-MM-DD. Default: today in
 *                  Asia/Manila, moving on to the new day after midnight.
 *   poster         id of the page's <poster-card>. On today's Amen screen its
 *                  share() sends the poster on; without one, there is no
 *                  share button.
 *   flipbook-href  The Flipbook page. Default: apps/pages/flipbook.html
 *
 * Each day's entry in verses.json gives the verse, text and reflection, and
 * optionally a `question` and a `prayer`; a day without them gets a general
 * question and a prayer naming its verse. A reflection's closing "Let us
 * pray." paragraph is left to the Pray screen rather than shown twice. With
 * no entry for the day the card stays hidden.
 *
 * Files are resolved from the date, as on <poster-card>:
 *   <media-base>images/sources/<YYYY>/<month>/<Month D, YYYY>[ - Comic].webp
 *   <media-base>audio/<YYYY>/<Month>/webm/<Month D, YYYY>.webm
 * The narration is only requested when its play button is first pressed.
 *
 * Kept in localStorage (when it is available), on this device only:
 *   dailygrace:moment:done      the days whose Moment reached Amen
 *   dailygrace:moment:answers   the reader's answers to the questions, by day
 *
 * Methods      open(), close()
 * Properties   date (read-only, YYYY-MM-DD), done (read-only)
 * Events       momentcomplete  the reader reached Amen, detail: { date }
 */

import { registerFonts } from '../../assets/scripts/fonts.js';

// The Daily Grace emblem (a cross on a hill), at the heart of the Pause and Pray screens.
const EMBLEM_URL = new URL('../../assets/images/dg-icon-03-flat.webp', import.meta.url).href;
// The card's icon: a calendar with the sun rising and a clock.
const MOMENT_ICON_URL = new URL('../../assets/images/moment.png', import.meta.url).href;

const DEFAULT_MEDIA_BASE = 'https://dailygrace.faith/media/';
// const DEFAULT_MEDIA_BASE = 'http://localhost:9001/media/';
const DEFAULT_VERSES_SRC = 'assets/verses.json';
const DEFAULT_FLIPBOOK_HREF = 'apps/pages/flipbook.html';
const TIME_ZONE = 'Asia/Manila';
const DAY_MS = 86400000;

const DONE_KEY = 'dailygrace:moment:done';
const ANSWERS_KEY = 'dailygrace:moment:answers';
// The day the card's light last played, so it plays at most once a day.
const HINT_KEY = 'dailygrace:moment:hint';
// Try again this soon when something (the trivia quiz) covers the card.
const HINT_RETRY = 1500;
const HINT_MS = 3600;
// About a year of finished days, and two months of answers.
const MAX_DONE = 400;
const MAX_ANSWERS = 60;
// A longer paragraph is split at sentence ends into screens of about this many words.
const SCREEN_WORDS = 70;

const GENERAL_QUESTION = 'What is God saying to you through this verse today?';
const generalPrayer = (verse) =>
  `Lord, thank You for Your word in ${verse}. Help me carry it with me today and live it faithfully. Amen.`;

// The seven stages along the progress bar; the reflection may take several screens.
const STAGES = ['pause', 'read', 'listen', 'reflect', 'respond', 'pray', 'amen'];

// Line-art icons, matching the stroked look of the other round buttons.
const ICON_ATTRS = 'viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const CLOSE_ICON = `<svg ${ICON_ATTRS}><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>`;
const NEXT_ICON = `<svg ${ICON_ATTRS}><polyline points="9 6 15 12 9 18"/></svg>`;
const PLAY_ICON = `<svg ${ICON_ATTRS}><polygon points="6 4 19 12 6 20" fill="currentColor"/></svg>`;
const PAUSE_ICON = `<svg ${ICON_ATTRS}><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/></svg>`;
const CHECK_ICON = `<svg ${ICON_ATTRS}><polyline points="5 12 10 17 19 7"/></svg>`;
const SHARE_ICON = `<svg ${ICON_ATTRS}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>`;
const BOOK_ICON = `<svg ${ICON_ATTRS}><path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2z"/><path d="M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/></svg>`;

const STYLES = /* css */ `
  :host {
    --moment-navy: var(--navy, #001b34);
    --moment-navy-2: var(--navy-2, #062944);
    --moment-gold: var(--gold, #c6922e);
    --moment-gold-light: var(--gold-light, #e1b65d);
    --moment-gold-ink: #7d5a12;
    --moment-cream: #f6eedf;
    --moment-ink: var(--ink, #10253b);
    --moment-muted: #56606e;
    --moment-line: #e2d5bb;

    display: block;
    padding-inline: 10px;
  }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }
  button { font: inherit; }

  /* ----- The card on the page -----
     Not yet done: a navy card inviting the reader in, the Moment icon on gold.
     Done: a warm gold card, navy lettering, the icon on cream with a check. */
  .launch {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
    padding: 16px 18px;
    overflow: hidden;
    border: 1px solid rgb(225 182 93 / 40%);
    border-radius: 10px;
    background:
      radial-gradient(120% 120% at 0% 0%, rgb(225 182 93 / 16%) 0%, transparent 55%),
      linear-gradient(180deg, var(--moment-navy-2) 0%, var(--moment-navy) 100%);
    color: #fff;
    text-align: left;
    box-shadow: 0 12px 30px rgb(0 27 52 / 28%), inset 0 1px 0 rgb(255 255 255 / 8%);
    cursor: pointer;
    transition: transform .15s ease, box-shadow .15s ease;
  }
  .launch:hover { transform: translateY(-1px); box-shadow: 0 16px 34px rgb(0 27 52 / 32%), inset 0 1px 0 rgb(255 255 255 / 8%); }
  .launch:focus-visible { outline: 3px solid var(--moment-gold-light); outline-offset: 3px; }
  .launch-icon {
    position: relative;
    display: grid; place-items: center; flex: none;
    width: 52px; height: 52px;
    border-radius: 50%;
    background: var(--moment-gold-light);
    box-shadow: 0 0 0 6px rgb(225 182 93 / 16%);
  }
  .launch-icon img { display: block; width: 86%; height: 86%; object-fit: contain; }
  .launch-check {
    position: absolute; right: -5px; bottom: -5px;
    display: none; place-items: center;
    width: 22px; height: 22px;
    border: 2px solid #fffaf0; border-radius: 50%;
    background: var(--moment-navy);
    color: #fff;
  }
  .launch-check svg { width: 12px; height: 12px; stroke-width: 3.5; }
  .launch-text { display: flex; flex: 1; flex-direction: column; gap: 2px; min-width: 0; }
  .launch-title { font: 400 1.4rem/1.15 'Germania One', Georgia, serif; letter-spacing: .02em; }
  .launch-sub { color: #cfd8e6; font: 400 1rem/1.35 'Strait', 'Roboto', sans-serif; }
  .launch-chevron { flex: none; color: var(--moment-gold-light); }
  .launch-chevron svg { display: block; width: 22px; height: 22px; }
  .launch-row { display: flex; align-items: center; gap: 14px; }

  /* Once a day, the first time the card comes into view while the Moment is
     still to do, a soft gold light passes across it and a ring breathes out
     from the icon twice. Then it stays still. */
  .launch-sheen {
    position: absolute; inset: 0;
    background: linear-gradient(105deg, transparent 30%, rgb(255 226 160 / 24%) 50%, transparent 70%);
    transform: translateX(-110%);
    pointer-events: none;
  }
  .launch.hint .launch-sheen { animation: sheen 1.8s ease-in-out .2s both; }
  @keyframes sheen { to { transform: translateX(110%); } }
  .launch-icon::after {
    content: "";
    position: absolute; inset: 0;
    border: 2px solid var(--moment-gold-light);
    border-radius: 50%;
    opacity: 0;
    pointer-events: none;
  }
  .launch.hint .launch-icon::after { animation: ring 1.5s ease-out .3s 2; }
  @keyframes ring {
    from { transform: scale(1); opacity: .9; }
    to { transform: scale(1.75); opacity: 0; }
  }

  .launch.done {
    border-color: rgb(90 60 10 / 40%);
    background:
      radial-gradient(120% 120% at 0% 0%, rgb(255 255 255 / 22%) 0%, transparent 55%),
      linear-gradient(180deg, #d6a74a 0%, #b98522 100%);
    color: var(--moment-navy);
    box-shadow: 0 10px 24px rgb(90 60 10 / 28%), inset 0 1px 0 rgb(255 255 255 / 30%);
  }
  .launch.done:hover { box-shadow: 0 14px 30px rgb(90 60 10 / 34%), inset 0 1px 0 rgb(255 255 255 / 30%); }
  .launch.done:focus-visible { outline-color: var(--moment-navy); }
  .launch.done .launch-icon { background: #fffaf0; box-shadow: 0 0 0 6px rgb(255 255 255 / 30%); }
  .launch.done .launch-check { display: grid; }
  .launch.done .launch-sub { color: #2b1d03; }
  .launch.done .launch-chevron { color: var(--moment-navy); }
  /* Once done, the card goes quiet. */
  .launch.done .launch-sheen { display: none; }

  /* ----- The Moment itself ----- */
  dialog {
    width: 100%; max-width: 100%;
    height: 100%; max-height: 100%;
    margin: 0; padding: 0; border: 0;
    background: var(--moment-cream);
    color: var(--moment-ink);
    overflow: hidden;
  }
  dialog.navy { background: var(--moment-navy); color: #fff; }
  dialog.pray { background: #efe3c9; }
  dialog::backdrop { background: rgb(0 27 52 / 72%); }
  @media (min-width: 600px) {
    dialog {
      width: 460px;
      height: min(860px, calc(100% - 48px));
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
  .progress span { height: 5px; border-radius: 3px; background: var(--moment-line); transition: background-color .3s ease; }
  .progress span.past { background: var(--moment-navy); }
  .progress span.now { background: var(--moment-gold); }
  dialog.navy .progress span { background: rgb(255 255 255 / 22%); }
  dialog.navy .progress span.past,
  dialog.navy .progress span.now { background: var(--moment-gold-light); }
  .count { width: 30px; text-align: right; color: var(--moment-muted); font: 600 .85rem 'Strait', 'Roboto', sans-serif; }
  dialog.navy .count { color: #cfd8e6; }

  .body {
    display: flex; flex: 1; flex-direction: column; gap: 22px;
    min-height: 0; overflow-y: auto;
    padding: 20px 30px;
  }
  /* Centred when the screen has room; scrolls from the very top when it does
     not (justify-content: center would push the top out of reach). Nothing
     shrinks to fit, so a tall comic scrolls instead of being cut off. */
  .body > * { flex-shrink: 0; }
  .body > :first-child { margin-top: auto; }
  .body > :last-child { margin-bottom: auto; }
  .body.enter { animation: step-in .35s ease both; }
  @keyframes step-in { from { opacity: 0; transform: translateY(8px); } }
  .body.center { align-items: center; text-align: center; }

  .label {
    color: var(--moment-gold-ink);
    font: 700 .8rem/1.2 'Strait', 'Roboto', sans-serif;
    letter-spacing: .16em;
    text-transform: uppercase;
  }
  dialog.navy .label { color: var(--moment-gold-light); }
  .heading { margin: 0; font: 400 2.2rem/1.1 'Germania One', Georgia, serif; letter-spacing: .02em; }
  .heading:focus { outline: none; }
  .lead { margin: 0; font: 400 1.2rem/1.5 'Strait', 'Roboto', sans-serif; }
  .note { margin: 0; color: var(--moment-muted); font: 400 1rem/1.4 'Strait', 'Roboto', sans-serif; }
  dialog.navy .lead, dialog.navy .note { color: #cfd8e6; }
  .rule { width: 48px; height: 3px; border-radius: 2px; background: var(--moment-gold); }

  /* Pause: soft rings around the Daily Grace emblem, breathing slowly. */
  .rings {
    display: grid; place-items: center;
    width: 210px; height: 210px; border-radius: 50%;
    background: rgb(225 182 93 / 8%);
    animation: breathe 8s ease-in-out infinite;
  }
  .rings > span {
    display: grid; place-items: center;
    width: 74%; height: 74%; border-radius: 50%;
    background: rgb(225 182 93 / 12%);
  }
  .emblem {
    display: block;
    width: 72%; height: 72%;
    border-radius: 50%;
    box-shadow: 0 8px 20px rgb(0 0 0 / 35%);
  }
  @keyframes breathe { 50% { transform: scale(1.08); } }
  .breathe { color: var(--moment-gold-light); font: 400 1.05rem 'Strait', 'Roboto', sans-serif; }

  /* Read */
  .date { color: var(--moment-muted); font: 400 1.05rem 'Strait', 'Roboto', sans-serif; }
  .verse { margin: 0; color: var(--moment-navy); font: 400 1.9rem/1.35 Georgia, 'Times New Roman', serif; text-wrap: pretty; }
  .reference { color: var(--moment-gold-ink); font: 700 1.35rem Georgia, serif; }

  /* Listen */
  .poster {
    align-self: center;
    padding: 0; border: 0; border-radius: 10px;
    background: #fff;
    box-shadow: 0 14px 30px rgb(0 27 52 / 25%);
    overflow: hidden;
    cursor: pointer;
  }
  /* The poster and the comic share one frame, the poster's shape. The comic is
     a little narrower for its height, so it is fitted whole, with a thin margin
     at the sides, rather than cropped (which cut off its top and bottom strips). */
  .poster img {
    display: block;
    width: auto; max-width: 100%;
    height: min(58vh, 540px);
    aspect-ratio: 941 / 1672;
    object-fit: contain;
  }
  .poster:focus-visible { outline: 3px solid var(--moment-gold); outline-offset: 3px; }
  .player {
    display: flex; align-items: center; gap: 14px;
    padding: 10px 16px 10px 10px;
    border-radius: 999px;
    background: #fff;
    box-shadow: 0 4px 12px rgb(0 27 52 / 10%);
  }
  .play {
    display: grid; place-items: center; flex: none;
    width: 44px; height: 44px; padding: 0;
    border: 0; border-radius: 50%;
    background: var(--action, #c62828); color: var(--action-ink, #fff);
    cursor: pointer;
  }
  .play:hover { background: var(--action-hover, #a91f1f); }
  .play svg { width: 18px; height: 18px; }
  .play:focus-visible { outline: 3px solid var(--moment-gold); outline-offset: 2px; }
  .track { flex: 1; height: 6px; border-radius: 3px; background: var(--moment-line); overflow: hidden; }
  .track span { display: block; width: 0; height: 100%; background: var(--action, #c62828); }
  .time { color: var(--moment-muted); font: 600 .85rem 'Strait', 'Roboto', sans-serif; font-variant-numeric: tabular-nums; }

  /* Reflect */
  .reflection { margin: 0; color: var(--moment-navy); font: 400 1.45rem/1.5 Georgia, 'Times New Roman', serif; text-wrap: pretty; }
  .parts { display: flex; align-items: center; gap: 10px; }
  .dots { display: flex; gap: 6px; }
  .dots span { width: 8px; height: 8px; border-radius: 4px; background: var(--moment-line); }
  .dots span.past { background: #c9b78f; }
  .dots span.now { width: 22px; background: var(--moment-navy); }

  /* Respond */
  .question { margin: 0; color: var(--moment-navy); font: 700 1.65rem/1.3 Georgia, 'Times New Roman', serif; text-wrap: pretty; }
  .answer { display: flex; flex-direction: column; gap: 8px; }
  .answer label { color: #3a4556; font: 600 .95rem 'Strait', 'Roboto', sans-serif; }
  .answer textarea {
    width: 100%; min-height: 130px; padding: 14px 16px;
    border: 1.5px solid #d6c8a8; border-radius: 14px;
    background: #fffdf8; color: var(--moment-ink);
    font: 400 1.05rem/1.5 'Strait', 'Roboto', sans-serif;
    resize: vertical;
  }
  .answer textarea:focus { outline: none; border-color: var(--moment-gold); box-shadow: 0 0 0 3px rgb(198 146 46 / 25%); }

  /* Pray */
  .emblem.small { width: 72px; height: 72px; box-shadow: 0 6px 16px rgb(0 27 52 / 25%); }
  .prayer { margin: 0; color: var(--moment-navy); font: italic 400 1.5rem/1.5 Georgia, 'Times New Roman', serif; text-wrap: pretty; }

  /* Amen */
  .amen { margin: 0; color: var(--moment-gold-light); font: 400 4rem/1 'Germania One', Georgia, serif; }
  .amen:focus { outline: none; }
  .week {
    align-self: stretch;
    display: flex; flex-direction: column; gap: 12px;
    padding: 16px; border-radius: 18px;
    background: rgb(255 255 255 / 7%);
  }
  .week-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
  .week-day { display: flex; flex-direction: column; align-items: center; gap: 6px; color: #cfd8e6; font: 400 .8rem 'Strait', 'Roboto', sans-serif; }
  .week-day i {
    display: grid; place-items: center;
    width: 28px; height: 28px; border-radius: 50%;
    border: 1.5px solid rgb(255 255 255 / 25%);
    color: var(--moment-navy);
  }
  .week-day.done i { border: 0; background: var(--moment-gold); }
  .week-day.this { color: #fff; font-weight: 700; }
  .week-day.this i { border: 0; background: var(--moment-gold-light); }
  .week-day.later i { opacity: .4; }
  .week-day svg { width: 16px; height: 16px; stroke-width: 3; }
  .actions { align-self: stretch; display: flex; flex-direction: column; gap: 12px; }
  .action {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    min-height: 52px; padding: 0 20px;
    border: 1.5px solid rgb(255 255 255 / 45%); border-radius: 999px;
    background: none; color: #fff;
    font: 600 1.05rem 'Strait', 'Roboto', sans-serif;
    text-decoration: none;
    cursor: pointer;
  }
  .action svg { width: 20px; height: 20px; }
  .action.share { border-color: transparent; background: var(--action, #c62828); }
  .action.share:hover { background: var(--action-hover, #a91f1f); }
  .action:focus-visible { outline: 3px solid var(--moment-gold-light); outline-offset: 2px; }

  /* Back and Next */
  .nav {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 20px max(24px, env(safe-area-inset-bottom));
  }
  .nav[hidden] { display: none; }
  .back {
    min-height: 52px; padding: 0 18px;
    border: 0; background: none; color: inherit;
    font: 600 1.05rem 'Strait', 'Roboto', sans-serif;
    cursor: pointer;
  }
  .back[hidden] { display: none; }
  .next {
    display: flex; flex: 1; align-items: center; justify-content: center; gap: 8px;
    min-height: 54px;
    border: 0; border-radius: 999px;
    background: var(--moment-navy); color: #fff;
    font: 700 1.1rem 'Strait', 'Roboto', sans-serif;
    cursor: pointer;
  }
  .next svg { width: 18px; height: 18px; stroke-width: 2.4; }
  .next.gold { background: var(--moment-gold-light); color: var(--moment-navy); }
  .next.amen-button { font: 400 1.35rem 'Germania One', Georgia, serif; letter-spacing: .03em; }
  .back:focus-visible, .next:focus-visible { outline: 3px solid var(--moment-gold); outline-offset: 2px; }

  @media (max-height: 700px) {
    .rings { width: 150px; height: 150px; }
    .verse { font-size: 1.6rem; }
    .reflection, .prayer { font-size: 1.3rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .launch, .progress span { transition: none; }
    .body.enter, .rings,
    .launch.hint .launch-sheen, .launch.hint .launch-icon::after { animation: none; }
  }
`;

/* ---------- Days ---------- */

/** Today's date in Asia/Manila as YYYY-MM-DD. */
function manilaToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date());
}

/** Names for a YYYY-MM-DD day, read in UTC so the viewer's clock never moves it. */
function dayFor(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const format = (options) => date.toLocaleDateString('en-US', { timeZone: 'UTC', ...options });
  const monthName = format({ month: 'long' });
  return {
    iso,
    date,
    year,
    monthName,
    name: format({ month: 'long', day: 'numeric', year: 'numeric' }),
    weekday: format({ weekday: 'long' }),
  };
}

const isoOf = (date) => date.toISOString().slice(0, 10);

/* ---------- Storage, on this device only ---------- */

function readStore(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or a full store: the Moment still works, it just forgets.
  }
}

/* ---------- Content ---------- */

const versesBySrc = new Map();

/** verses.json by day name, fetched once per source. */
function loadVerses(src) {
  if (!versesBySrc.has(src)) {
    versesBySrc.set(src, fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error(`Unable to load ${src} (${response.status})`);
        return response.json();
      })
      .then((list) => new Map(list.map((item) => [item.id, item])))
      .catch((error) => {
        versesBySrc.delete(src);
        throw error;
      }));
  }
  return versesBySrc.get(src);
}

/**
 * The reflection as screens: a paragraph each, a long one split at sentence
 * ends, and a closing "Let us pray." left out for the Pray screen.
 */
function reflectionScreens(reflection) {
  const screens = [];
  for (const paragraph of String(reflection ?? '').split(/\n\s*\n/)) {
    const text = paragraph.trim();
    if (!text || /^let us pray\b/i.test(text)) continue;
    let screen = '';
    for (const sentence of text.split(/(?<=[.!?])\s+/)) {
      const words = (screen + sentence).split(/\s+/).length;
      if (screen && words > SCREEN_WORDS) {
        screens.push(screen.trim());
        screen = '';
      }
      screen += `${sentence} `;
    }
    if (screen.trim()) screens.push(screen.trim());
  }
  return screens;
}

const escapeHtml = (text) => String(text ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

const formatTime = (seconds) => {
  const whole = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

export class DailyMoment extends HTMLElement {
  static observedAttributes = ['media-base', 'verses-src', 'date', 'poster', 'flipbook-href'];

  #root;
  #launch;
  #dialog;
  #progress;
  #count;
  #body;
  #nav;
  #back;
  #next;

  #day = null;
  #entry = null;
  #steps = [];
  #index = 0;
  #audio = null;
  #comic = false;
  #loadId = 0;
  #configurePending = false;
  #today = manilaToday();
  #reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  #hintObserver = null;
  #hintTimer = 0;
  #inView = false;

  constructor() {
    super();
    this.hidden = true;
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <button class="launch" type="button" aria-haspopup="dialog">
        <span class="launch-sheen" aria-hidden="true"></span>
        <span class="launch-row">
          <span class="launch-icon">
            <img src="${MOMENT_ICON_URL}" alt="" width="52" height="52" />
            <span class="launch-check">${CHECK_ICON}</span>
          </span>
          <span class="launch-text">
            <span class="launch-title"></span>
            <span class="launch-sub"></span>
          </span>
          <span class="launch-chevron">${NEXT_ICON}</span>
        </span>
      </button>
      <dialog aria-labelledby="step-title">
        <div class="frame">
          <div class="bar">
            <button class="close" type="button" aria-label="Close the Moment">${CLOSE_ICON}</button>
            <div class="progress" aria-hidden="true">${'<span></span>'.repeat(STAGES.length)}</div>
            <span class="count"></span>
          </div>
          <div class="body"></div>
          <div class="nav">
            <button class="back" type="button">Back</button>
            <button class="next" type="button"></button>
          </div>
        </div>
      </dialog>`;
    this.#launch = this.#root.querySelector('.launch');
    this.#dialog = this.#root.querySelector('dialog');
    this.#progress = [...this.#root.querySelectorAll('.progress span')];
    this.#count = this.#root.querySelector('.count');
    this.#body = this.#root.querySelector('.body');
    this.#nav = this.#root.querySelector('.nav');
    this.#back = this.#root.querySelector('.back');
    this.#next = this.#root.querySelector('.next');

    this.#launch.addEventListener('click', () => this.open());
    this.#root.querySelector('.close').addEventListener('click', () => this.close());
    this.#back.addEventListener('click', () => this.#go(-1));
    this.#next.addEventListener('click', () => this.#go(1));
    this.#dialog.addEventListener('close', () => this.#closed());
    this.#dialog.addEventListener('keydown', (event) => {
      if (event.target.closest?.('textarea')) return;
      if (event.key === 'ArrowRight' && this.#index < this.#steps.length - 1) this.#go(1);
      else if (event.key === 'ArrowLeft' && this.#index > 0) this.#go(-1);
    });
    // A tap on the backdrop (outside the frame) closes it, as on the page's other popups.
    this.#dialog.addEventListener('click', (event) => {
      if (event.target === this.#dialog) this.close();
    });
  }

  connectedCallback() {
    registerFonts();
    this.#scheduleConfigure();
    document.addEventListener('visibilitychange', this.#checkDate);
    this.#hintObserver = new IntersectionObserver(([entry]) => {
      this.#inView = entry.isIntersecting;
      if (this.#inView) this.#tryHint();
    }, { threshold: 0.6 });
    this.#hintObserver.observe(this.#launch);
  }

  disconnectedCallback() {
    document.removeEventListener('visibilitychange', this.#checkDate);
    this.#hintObserver?.disconnect();
    clearTimeout(this.#hintTimer);
    this.#stopAudio();
  }

  // The once-a-day light across the card: only while the day's Moment is still
  // to do, the card is in view and uncovered, and motion is welcome.
  #tryHint() {
    clearTimeout(this.#hintTimer);
    if (!this.#inView || !this.#entry || this.done || this.#reducedMotion.matches) return;
    if (readStore(HINT_KEY, '') === this.#today) return;
    const box = this.#launch.getBoundingClientRect();
    const covered = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2) !== this;
    if (document.hidden || this.#dialog.open || covered) {
      this.#hintTimer = setTimeout(() => this.#tryHint(), HINT_RETRY);
      return;
    }
    writeStore(HINT_KEY, this.#today);
    this.#launch.classList.add('hint');
    this.#hintTimer = setTimeout(() => this.#launch.classList.remove('hint'), HINT_MS);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue && this.isConnected) this.#scheduleConfigure();
  }

  // Coming back to the page after midnight moves today's card on to the new day.
  #checkDate = () => {
    if (document.hidden || this.#dialog.open || this.hasAttribute('date')) return;
    if (manilaToday() !== this.#today) this.#scheduleConfigure();
  };

  get date() {
    return this.#day?.iso ?? this.getAttribute('date') ?? manilaToday();
  }

  /** Whether this day's Moment has reached Amen on this device. */
  get done() {
    return readStore(DONE_KEY, []).includes(this.date);
  }

  get #mediaBase() {
    const base = this.getAttribute('media-base') || DEFAULT_MEDIA_BASE;
    return base.endsWith('/') ? base : `${base}/`;
  }

  get #isToday() {
    return this.#day?.iso === this.#today;
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
    const requested = /^\d{4}-\d{2}-\d{2}$/.test(this.getAttribute('date') ?? '') ? this.getAttribute('date') : this.#today;
    const day = dayFor(requested);
    const loadId = ++this.#loadId;
    const src = new URL(this.getAttribute('verses-src') || DEFAULT_VERSES_SRC, document.baseURI).href;
    let entry = null;
    try {
      entry = (await loadVerses(src)).get(day.name) ?? null;
    } catch (error) {
      console.warn("The day's Moment could not be loaded:", error);
    }
    if (loadId !== this.#loadId) return; // a newer date or source took over
    this.#day = day;
    this.#entry = entry;
    this.hidden = !entry;
    this.#renderLaunch();
  }

  #renderLaunch() {
    if (!this.#day) return;
    const done = this.done;
    const when = this.#isToday ? "today's Moment" : `the Moment for ${this.#day.name.replace(/, \d+$/, '')}`;
    this.#launch.classList.toggle('done', done);
    this.#launch.querySelector('.launch-title').textContent = done
      ? when.charAt(0).toUpperCase() + when.slice(1)
      : `Start ${when}`;
    this.#launch.querySelector('.launch-sub').textContent = done
      ? 'Done. Tap to walk through it again.'
      : 'Pause, read, listen and pray · about 5 minutes';
    this.#launch.setAttribute('aria-label', done
      ? `${this.#launch.querySelector('.launch-title').textContent}, done. Open it again.`
      : `${this.#launch.querySelector('.launch-title').textContent}, about 5 minutes`);
    // The card may have just appeared (or a new day begun) while in view.
    if (!done) queueMicrotask(() => this.#tryHint());
  }

  /** Open the Moment at its first screen. */
  open() {
    if (!this.#entry || this.#dialog.open) return;
    const reflection = reflectionScreens(this.#entry.reflection);
    this.#steps = [
      { stage: 'pause' },
      { stage: 'read' },
      { stage: 'listen' },
      ...reflection.map((text, part) => ({ stage: 'reflect', text, part, parts: reflection.length })),
      { stage: 'respond' },
      { stage: 'pray' },
      { stage: 'amen' },
    ];
    this.#index = 0;
    this.#comic = false;
    // The day may have changed since the last opening; its narration is new.
    this.#stopAudio();
    this.#audio = null;
    this.#dialog.showModal();
    // The page underneath stays put while the Moment is open.
    document.documentElement.style.overflow = 'hidden';
    this.#render();
  }

  close() {
    if (this.#dialog.open) this.#dialog.close();
  }

  #closed() {
    this.#stopAudio();
    document.documentElement.style.overflow = '';
    this.#renderLaunch();
    this.#launch.focus({ preventScroll: true });
  }

  #go(step) {
    const index = Math.min(Math.max(this.#index + step, 0), this.#steps.length - 1);
    if (index === this.#index) return;
    this.#index = index;
    this.#render();
  }

  /* ----- Screens ----- */

  #render() {
    const step = this.#steps[this.#index];
    const stage = STAGES.indexOf(step.stage);
    if (step.stage !== 'listen') this.#stopAudio();

    this.#dialog.className = step.stage === 'pause' || step.stage === 'amen'
      ? 'navy'
      : step.stage === 'pray' ? 'pray' : '';
    this.#progress.forEach((bar, i) => {
      bar.className = i < stage ? 'past' : i === stage ? 'now' : '';
    });
    this.#count.textContent = `${stage + 1}/${STAGES.length}`;

    this.#body.className = `body${step.stage === 'pause' || step.stage === 'pray' || step.stage === 'amen' ? ' center' : ''}`;
    this.#body.innerHTML = this.#screen(step);
    this.#body.scrollTop = 0;
    if (!this.#reducedMotion.matches) {
      void this.#body.offsetWidth; // restart the entrance animation
      this.#body.classList.add('enter');
    }
    this.#wire(step);

    this.#nav.hidden = step.stage === 'amen';
    this.#back.hidden = this.#index === 0;
    this.#next.className = `next${step.stage === 'pause' ? ' gold' : ''}${step.stage === 'pray' ? ' amen-button' : ''}`;
    this.#next.innerHTML = step.stage === 'pause'
      ? "I'm ready"
      : step.stage === 'pray' ? 'Amen' : `Next ${NEXT_ICON}`;
    if (step.stage === 'respond') this.#syncRespondButton();

    if (step.stage === 'amen') this.#complete();
    this.#body.querySelector('#step-title')?.focus({ preventScroll: true });
  }

  #screen(step) {
    const entry = this.#entry;
    const day = this.#day;
    switch (step.stage) {
      case 'pause':
        return `
          <div class="rings" aria-hidden="true"><span><img class="emblem" src="${EMBLEM_URL}" alt="" /></span></div>
          <div class="label">Pause</div>
          <h2 class="heading" id="step-title" tabindex="-1">Take a breath.</h2>
          <p class="lead">God is here. Let the noise of the day settle for a moment.</p>
          <div class="breathe">Breathe in… and out</div>`;
      case 'read':
        return `
          <div>
            <div class="label" id="step-title" tabindex="-1">Read</div>
            <div class="date">${escapeHtml(day.weekday)}, ${escapeHtml(day.name)}</div>
          </div>
          <div class="rule" aria-hidden="true"></div>
          <blockquote class="verse">${escapeHtml(entry.text)}</blockquote>
          <div class="reference">${escapeHtml(entry.verse)}</div>`;
      case 'listen':
        return `
          <div class="label" id="step-title" tabindex="-1">Listen</div>
          <button class="poster${this.#comic ? ' comic' : ''}" type="button"
            aria-label="${this.#comic ? 'Show the regular poster' : 'Show the comic version of this poster'}">
            <img alt="The Daily Grace ${this.#comic ? 'comic' : 'poster'} for ${escapeHtml(day.name)}" src="${escapeHtml(this.#posterUrl(this.#comic))}" />
          </button>
          <p class="note poster-note">${this.#comic ? 'Tap the comic to see the poster.' : 'Tap the poster to see the comic.'}</p>
          <div class="player">
            <button class="play" type="button" aria-label="Play the narration">${PLAY_ICON}</button>
            <div class="track" aria-hidden="true"><span></span></div>
            <span class="time">0:00</span>
          </div>`;
      case 'reflect':
        return `
          <div class="label" id="step-title" tabindex="-1">Reflect</div>
          <p class="reflection">${escapeHtml(step.text)}</p>
          ${step.parts > 1 ? `
            <div class="parts">
              <div class="dots" aria-hidden="true">${Array.from({ length: step.parts }, (_, i) =>
                `<span class="${i < step.part ? 'past' : i === step.part ? 'now' : ''}"></span>`).join('')}</div>
              <span class="note">Part ${step.part + 1} of ${step.parts}</span>
            </div>` : ''}`;
      case 'respond':
        return `
          <div class="label">Respond</div>
          <h2 class="question" id="step-title" tabindex="-1">${escapeHtml(entry.question || GENERAL_QUESTION)}</h2>
          <div class="answer">
            <label for="answer">Your answer, kept only on this phone</label>
            <textarea id="answer" rows="5" placeholder="Write a few words, or just think about it…"></textarea>
          </div>`;
      case 'pray':
        return `
          <div class="label">Pray</div>
          <img class="emblem small" src="${EMBLEM_URL}" alt="" />
          <p class="prayer" id="step-title" tabindex="-1">${escapeHtml(entry.prayer || generalPrayer(entry.verse))}</p>
          <p class="note">Pray it slowly, in your own words if you like.</p>`;
      case 'amen':
        return `
          <div>
            <h2 class="amen" id="step-title" tabindex="-1">Amen.</h2>
            <p class="lead">You've spent time with God today.</p>
          </div>
          ${this.#weekHtml()}
          <div class="actions">
            ${this.#posterCard() ? `<button class="action share" type="button">${SHARE_ICON} Share today's poster</button>` : ''}
            <a class="action" href="${escapeHtml(this.#flipbookUrl())}">${BOOK_ICON} Open this week's Flipbook</a>
            <button class="action done" type="button">Done</button>
          </div>`;
      default:
        return '';
    }
  }

  #wire(step) {
    if (step.stage === 'listen') {
      const poster = this.#body.querySelector('.poster');
      const image = poster.querySelector('img');
      poster.addEventListener('click', () => this.#flipPoster());
      image.addEventListener('error', () => {
        poster.hidden = true;
        this.#body.querySelector('.poster-note').textContent = "This day's poster isn't available yet.";
      }, { once: true });
      this.#body.querySelector('.play').addEventListener('click', () => this.#toggleAudio());
      this.#syncPlayer();
    } else if (step.stage === 'respond') {
      const field = this.#body.querySelector('textarea');
      field.value = readStore(ANSWERS_KEY, {})[this.#day.iso] ?? '';
      field.addEventListener('input', () => {
        this.#saveAnswer(field.value);
        this.#syncRespondButton();
      });
    } else if (step.stage === 'amen') {
      this.#body.querySelector('.share')?.addEventListener('click', () => this.#posterCard()?.share());
      this.#body.querySelector('.done').addEventListener('click', () => this.close());
    }
  }

  // An empty answer is fine: Next reads "Skip" until something is written.
  #syncRespondButton() {
    const written = this.#body.querySelector('textarea')?.value.trim();
    this.#next.innerHTML = written ? `Next ${NEXT_ICON}` : 'Skip';
  }

  #saveAnswer(text) {
    const answers = readStore(ANSWERS_KEY, {});
    if (text.trim()) answers[this.#day.iso] = text;
    else delete answers[this.#day.iso];
    const kept = Object.keys(answers).sort().slice(-MAX_ANSWERS);
    writeStore(ANSWERS_KEY, Object.fromEntries(kept.map((iso) => [iso, answers[iso]])));
  }

  #complete() {
    const done = readStore(DONE_KEY, []);
    if (!done.includes(this.#day.iso)) {
      done.push(this.#day.iso);
      writeStore(DONE_KEY, done.sort().slice(-MAX_DONE));
    }
    this.dispatchEvent(new CustomEvent('momentcomplete', { detail: { date: this.#day.iso } }));
  }

  /** The Sunday-to-Saturday week around the day, with a dot for each finished Moment. */
  #weekHtml() {
    const done = new Set(readStore(DONE_KEY, []));
    done.add(this.#day.iso);
    const sunday = this.#day.date.getTime() - this.#day.date.getUTCDay() * DAY_MS;
    let count = 0;
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(sunday + i * DAY_MS);
      const iso = isoOf(date);
      const letter = date.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'narrow' });
      const name = date.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long' });
      const isThis = iso === this.#day.iso;
      const isDone = done.has(iso);
      if (isDone) count++;
      const state = isThis ? 'this' : isDone ? 'done' : iso > this.#today ? 'later' : '';
      const label = `${name}: ${isDone ? 'Moment done' : iso > this.#today ? 'still to come' : 'no Moment'}`;
      return `<span class="week-day ${state}" role="listitem" aria-label="${label}">${letter}<i>${isThis ? CHECK_ICON : ''}</i></span>`;
    }).join('');
    return `
      <div class="week">
        <div class="note">This week</div>
        <div class="week-days" role="list">${days}</div>
        <div class="note">${count} ${count === 1 ? 'Moment' : 'Moments'} this week</div>
      </div>`;
  }

  /* ----- Poster and narration ----- */

  #mediaPath(kind) {
    const { year, monthName, name } = this.#day;
    return kind === 'audio'
      ? `${this.#mediaBase}audio/${year}/${monthName}/webm/${name}.webm`
      : `${this.#mediaBase}images/sources/${year}/${monthName.toLowerCase()}/${name}`;
  }

  #posterUrl(comic) {
    return `${this.#mediaPath('image')}${comic ? ' - Comic' : ''}.webp`;
  }

  #flipPoster() {
    this.#comic = !this.#comic;
    const poster = this.#body.querySelector('.poster');
    if (!poster) return;
    const image = poster.querySelector('img');
    image.src = this.#posterUrl(this.#comic);
    image.alt = `The Daily Grace ${this.#comic ? 'comic' : 'poster'} for ${this.#day.name}`;
    poster.classList.toggle('comic', this.#comic);
    this.#body.querySelector('.poster-note').textContent = this.#comic
      ? 'Tap the comic to see the poster.'
      : 'Tap the poster to see the comic.';
    poster.setAttribute('aria-label', this.#comic ? 'Show the regular poster' : 'Show the comic version of this poster');
  }

  #toggleAudio() {
    if (!this.#audio) {
      const audio = new Audio(this.#mediaPath('audio'));
      const sync = () => this.#syncPlayer();
      for (const type of ['play', 'pause', 'timeupdate', 'loadedmetadata']) audio.addEventListener(type, sync);
      audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        sync();
      });
      audio.addEventListener('error', () => {
        const time = this.#body.querySelector('.time');
        if (time) time.textContent = 'Not available';
        this.#body.querySelector('.play')?.setAttribute('disabled', '');
      });
      this.#audio = audio;
    }
    if (this.#audio.paused) this.#audio.play().catch(() => {});
    else this.#audio.pause();
  }

  #syncPlayer() {
    const play = this.#body.querySelector('.play');
    if (!play) return;
    const audio = this.#audio;
    const playing = Boolean(audio) && !audio.paused;
    play.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
    play.setAttribute('aria-label', playing ? 'Pause the narration' : 'Play the narration');
    const duration = audio?.duration;
    const current = audio?.currentTime ?? 0;
    this.#body.querySelector('.track span').style.width = duration ? `${(current / duration) * 100}%` : '0';
    this.#body.querySelector('.time').textContent = duration
      ? `${formatTime(current)} / ${formatTime(duration)}`
      : formatTime(current);
  }

  #stopAudio() {
    this.#audio?.pause();
  }

  /* ----- Links out ----- */

  #posterCard() {
    if (!this.#isToday) return null;
    const card = document.getElementById(this.getAttribute('poster') ?? '');
    return typeof card?.share === 'function' ? card : null;
  }

  #flipbookUrl() {
    const url = new URL(this.getAttribute('flipbook-href') || DEFAULT_FLIPBOOK_HREF, document.baseURI);
    if (!this.#isToday) url.searchParams.set('date', this.#day.iso);
    return url.href;
  }
}

if (!customElements.get('daily-moment')) {
  customElements.define('daily-moment', DailyMoment);
}
