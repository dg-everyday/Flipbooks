/**
 * <daily-moment> — the Daily Grace Moment: the day's devotional, one screen at
 * a time, in about five minutes.
 *
 * On the page it is a 16:9 card playing the "Moment With the LORD" clip, its
 * status in a green band along the foot ("Pause, read, listen and pray", or
 * "Done") and a gold arrow nudging toward it. Tapping it opens a
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
 *   verses-base    Folder of the month files of verses (<YYYY>/<month>.json,
 *                  see daily-verses.js), resolved against the page.
 *                  Default: assets/verses/
 *   date           Day to walk through as YYYY-MM-DD. Default: today in
 *                  Asia/Manila, moving on to the new day after midnight.
 *   poster         id of the page's <poster-card>. On today's Amen screen its
 *                  share() sends the poster on; without one, there is no
 *                  share button.
 *   flipbook-href  The Flipbook page. Default: apps/pages/flipbook.html
 *   memory-verse   id of the page's <memory-verse>. Today's Amen screen then
 *                  offers this week's verse, opening its practice once the
 *                  Moment has closed.
 *
 * Each day's entry in its month's verse file gives the verse, text and reflection, and
 * optionally a `question` and a `prayer`; a day without them gets a general
 * question and a prayer naming its verse. A reflection's closing "Let us
 * pray." paragraph is left to the Pray screen rather than shown twice. With
 * no entry for the day the card stays hidden.
 *
 * Files are resolved from the date, as on <poster-card>:
 *   <media-base>images/sources/<YYYY>/<month>/<Month D, YYYY>[ - Comic].webp
 *   <media-base>images/sources/<YYYY>/<month>/<Month D, YYYY>.mp4   (optional)
 *   <media-base>audio/<YYYY>/<Month>/webm/<Month D, YYYY>.webm
 * The narration is only requested when its play button is first pressed.
 * When the day has a video, the Listen screen plays it over the poster, muted
 * and looping, as <poster-card> does; until it plays, and for good when there
 * is none or it cannot play, the poster image shows. The comic has no video,
 * and it is not loaded for reduced motion or Save-Data.
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
import { DEFAULT_VERSES_BASE, loadVerses } from './daily-verses.js?v=20261004-1';

// The Daily Grace emblem (a cross on a hill), at the heart of the Pause and Pray screens.
const EMBLEM_URL = new URL('../../assets/images/dg-icon-03-flat.webp', import.meta.url).href;
// The card's face: a short looping clip, "Moment With the LORD", and its first
// frame, shown until the clip plays (or instead of it, when motion is unwelcome).
const MOMENT_VIDEO_URL = new URL('../../assets/images/moment.mp4', import.meta.url).href;
const MOMENT_POSTER_URL = new URL('../../assets/images/moment-poster.webp', import.meta.url).href;

const DEFAULT_MEDIA_BASE = 'https://dailygrace.faith/media/';
// const DEFAULT_MEDIA_BASE = 'http://localhost:9001/media/';
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
const DOUBLE_NEXT_ICON = `<svg ${ICON_ATTRS}><polyline points="5 6 11 12 5 18"/><polyline points="13 6 19 12 13 18"/></svg>`;
const PLAY_ICON = `<svg ${ICON_ATTRS}><polygon points="6 4 19 12 6 20" fill="currentColor"/></svg>`;
const PAUSE_ICON = `<svg ${ICON_ATTRS}><rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/></svg>`;
const CHECK_ICON = `<svg ${ICON_ATTRS}><polyline points="5 12 10 17 19 7"/></svg>`;
const SHARE_ICON = `<svg ${ICON_ATTRS}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>`;

const STYLES = /* css */ `
  :host {
    --moment-navy: var(--navy, #001b34);
    --moment-navy-2: var(--navy-2, #062944);
    /* The card's band (and its colour until the clip's first frame loads),
       set apart from the navy poster and question cards around it. */
    --moment-green: #0b3324;
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
     The "Moment With the LORD" clip fills a 16:9 card (its title is part of
     the clip). Across the foot runs a see-through green band with the status:
     the invitation while the Moment is still to do, "Done" once it is. A gold
     double arrow on the right nudges toward it until then. */
  .launch {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    padding: 0;
    overflow: hidden;
    border: 1px solid rgb(225 182 93 / 40%);
    border-radius: 10px;
    background: var(--moment-green) url("${MOMENT_POSTER_URL}") center / cover no-repeat;
    color: #fff;
    text-align: left;
    box-shadow: 0 12px 30px rgb(6 38 26 / 30%);
    cursor: pointer;
    container-type: inline-size;
    transition: transform .15s ease, box-shadow .15s ease;
  }
  .launch:hover { transform: translateY(-1px); box-shadow: 0 16px 34px rgb(6 38 26 / 36%); }
  .launch:focus-visible { outline: 3px solid var(--moment-gold-light); outline-offset: 3px; }
  .launch-video {
    position: absolute; inset: 0;
    display: block;
    width: 100%; height: 100%;
    object-fit: cover;
    pointer-events: none;
  }
  .launch-chevron {
    position: absolute; right: 3%; top: 50%;
    translate: 0 -50%;
    color: var(--moment-gold-light);
    filter: drop-shadow(0 2px 4px rgb(0 0 0 / 55%));
  }
  .launch-chevron svg { display: block; width: clamp(40px, 8.5cqi, 76px); height: auto; aspect-ratio: 1; stroke-width: 3.4; }
  /* While the Moment is still to do, the arrow keeps nudging toward it. */
  .launch:not(.done) .launch-chevron { animation: nudge 1.8s ease-in-out infinite; }
  .launch:not(.done):hover .launch-chevron { animation-duration: .9s; }
  @keyframes nudge {
    0%, 60%, 100% { transform: translateX(0); }
    30% { transform: translateX(6px); }
  }
  .launch-band {
    position: absolute; inset: auto 0 0;
    display: flex; align-items: center; gap: 10px;
    padding: clamp(8px, 2.6cqi, 18px) clamp(14px, 3.6cqi, 28px);
    /* --moment-green at 60% transparency */
    background: rgb(11 51 36 / 40%);
  }
  .launch-sub {
    min-width: 0;
    color: #fff;
    font: 700 clamp(1.05rem, 3.9cqi, 1.9rem)/1.2 'Strait', 'Roboto', sans-serif;
    text-shadow: 0 1px 3px rgb(0 0 0 / 60%);
  }
  .launch-check {
    display: none; place-items: center; flex: none;
    width: 1.5em; height: 1.5em;
    border-radius: 50%;
    background: var(--moment-gold-light);
    color: var(--moment-navy);
    font-size: clamp(1.05rem, 3.9cqi, 1.9rem);
  }
  .launch-check svg { width: 62%; height: 62%; stroke-width: 3.5; }
  .launch.done .launch-check { display: grid; }

  /* Once a day, the first time the card comes into view while the Moment is
     still to do, a soft gold light passes across it. Then it stays still. */
  .launch-sheen {
    position: absolute; inset: 0;
    background: linear-gradient(105deg, transparent 30%, rgb(255 226 160 / 24%) 50%, transparent 70%);
    transform: translateX(-110%);
    pointer-events: none;
  }
  .launch.hint .launch-sheen { animation: sheen 1.8s ease-in-out .2s both; }
  @keyframes sheen { to { transform: translateX(110%); } }
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
  .date { margin-top: 10px; color: var(--moment-muted); font: 400 1.05rem/1.3 'Strait', 'Roboto', sans-serif; }
  .verse { margin: 0; color: var(--moment-navy); font: 400 1.9rem/1.35 Georgia, 'Times New Roman', serif; text-wrap: pretty; }
  .reference { color: var(--moment-gold-ink); font: 700 1.35rem Georgia, serif; }

  /* Listen. On a phone the poster takes the full width; the screen scrolls for
     the rest of it, and the player sticks to the bottom so the play button
     never leaves view. */
  .body.listen { gap: 12px; padding: 12px; container-type: size; }
  .listen-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
  .listen-head .note { font-size: .9rem; text-align: right; }
  .body.listen .player {
    position: sticky; bottom: 8px; z-index: 1;
    padding: 6px 14px 6px 6px;
    box-shadow: 0 6px 18px rgb(0 27 52 / 22%);
  }
  .poster {
    position: relative;
    align-self: center;
    width: 100%;
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
    width: 100%; height: auto;
    aspect-ratio: 941 / 1672;
    object-fit: contain;
  }
  /* The day's video, over the poster, fading in once it is playing. */
  .poster-video {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    opacity: 0;
    pointer-events: none;
    transition: opacity .3s ease;
  }
  .poster-video.playing { opacity: 1; }
  .poster:focus-visible { outline: 3px solid var(--moment-gold); outline-offset: 3px; }
  /* In the 460px popup on larger screens it is as big as fits above the player
     without scrolling. 116px is the padding, heading row, player and gaps (the
     vh line, for browsers without container units, also takes off the popup's
     top bar and Back/Next row). */
  @media (min-width: 600px) {
    .poster {
      width: min(100%, max(220px, calc((min(860px, 100vh - 48px) - 270px) * 941 / 1672)));
      width: min(100%, max(220px, calc((100cqh - 116px) * 941 / 1672)));
    }
  }
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
  .prayer { margin: 0; color: var(--moment-navy); font: 400 1.5rem/1.5 Georgia, 'Times New Roman', serif; text-wrap: pretty; }

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
    .launch.hint .launch-sheen,
    .launch:not(.done) .launch-chevron { animation: none; }
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
  static observedAttributes = ['media-base', 'verses-base', 'date', 'poster', 'flipbook-href', 'memory-verse'];

  #root;
  #launch;
  #video;
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
  #flipId = 0;
  // A day's poster video that failed to load, so the Listen screen does not
  // ask for it again on every visit.
  #missingVideo = '';
  #loadId = 0;
  #configurePending = false;
  #today = manilaToday();
  #reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  #viewObserver = null;
  #hintTimer = 0;
  #inView = false;
  #visible = false;

  constructor() {
    super();
    this.hidden = true;
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <button class="launch" type="button" aria-haspopup="dialog">
        <video class="launch-video" poster="${MOMENT_POSTER_URL}" muted loop playsinline preload="none"
          disablepictureinpicture aria-hidden="true" tabindex="-1"></video>
        <span class="launch-sheen" aria-hidden="true"></span>
        <span class="launch-chevron" aria-hidden="true">${DOUBLE_NEXT_ICON}</span>
        <span class="launch-band">
          <span class="launch-check" aria-hidden="true">${CHECK_ICON}</span>
          <span class="launch-sub"></span>
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
    this.#video = this.#root.querySelector('.launch-video');
    this.#video.muted = true; // the property too, or some browsers refuse to autoplay
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
    document.addEventListener('visibilitychange', this.#syncVideo);
    document.addEventListener('visibilitychange', this.#syncPosterVideo);
    // The clip plays while a quarter of the card shows; the light waits for most of it.
    this.#viewObserver = new IntersectionObserver(([entry]) => {
      this.#visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
      this.#inView = entry.intersectionRatio >= 0.6;
      this.#syncVideo();
      if (this.#inView) this.#tryHint();
    }, { threshold: [0, 0.25, 0.6] });
    this.#viewObserver.observe(this.#launch);
  }

  disconnectedCallback() {
    document.removeEventListener('visibilitychange', this.#checkDate);
    document.removeEventListener('visibilitychange', this.#syncVideo);
    document.removeEventListener('visibilitychange', this.#syncPosterVideo);
    this.#viewObserver?.disconnect();
    clearTimeout(this.#hintTimer);
    this.#stopAudio();
    this.#video.pause();
  }

  // The card's clip loops only while the card shows and the Moment is closed,
  // and not at all when the reader asks for less motion or to save data: the
  // first frame stands in. It is first fetched when it first plays.
  #syncVideo = () => {
    const play = this.#visible && !document.hidden && !this.#dialog.open
      && !this.#reducedMotion.matches && !navigator.connection?.saveData;
    if (!play) {
      this.#video.pause();
      return;
    }
    if (!this.#video.getAttribute('src')) this.#video.src = MOMENT_VIDEO_URL;
    this.#video.play().catch(() => {});
  };

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
    const base = new URL(this.getAttribute('verses-base') || DEFAULT_VERSES_BASE, document.baseURI).href;
    let entry = null;
    try {
      entry = (await loadVerses(base, [day.name])).get(day.name) ?? null;
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
    const shortName = this.#day.name.replace(/, \d+$/, '');
    const when = this.#isToday ? "today's Moment" : `the Moment for ${shortName}`;
    // The clip shows "Moment With the LORD"; the title is still read out.
    const title = done
      ? when.charAt(0).toUpperCase() + when.slice(1)
      : this.#isToday ? "Start today's Moment with God" : `Start the Moment with God for ${shortName}`;
    this.#launch.classList.toggle('done', done);
    this.#launch.querySelector('.launch-sub').textContent = done
      ? 'Done. Tap to walk through it again.'
      : 'Pause, read, listen and pray – about 5 minutes';
    this.#launch.setAttribute('aria-label', done
      ? `${title}, done. Open it again.`
      : `${title}, about 5 minutes`);
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
    this.#syncVideo();
    // The page underneath stays put while the Moment is open.
    document.documentElement.style.overflow = 'hidden';
    this.#render();
  }

  close() {
    if (this.#dialog.open) this.#dialog.close();
  }

  #closed() {
    this.#stopAudio();
    this.#syncPosterVideo();
    document.documentElement.style.overflow = '';
    this.#renderLaunch();
    this.#syncVideo();
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

    this.#body.querySelector('.poster-video')?.pause(); // its screen is going
    this.#body.className = `body${step.stage === 'pause' || step.stage === 'pray' || step.stage === 'amen' ? ' center' : ''}${step.stage === 'listen' ? ' listen' : ''}`;
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
          <div class="listen-head">
            <div class="label" id="step-title" tabindex="-1">Listen</div>
            <p class="note poster-note">${this.#comic ? 'Tap the comic to see the poster.' : 'Tap the poster to see the comic.'}</p>
          </div>
          <button class="poster${this.#comic ? ' comic' : ''}" type="button"
            aria-label="${this.#comic ? 'Show the regular poster' : 'Show the comic version of this poster'}">
            <img alt="The Daily Grace ${this.#comic ? 'comic' : 'poster'} for ${escapeHtml(day.name)}" src="${escapeHtml(this.#posterUrl(this.#comic))}" />
            <video class="poster-video" width="941" height="1672" muted loop playsinline preload="auto"
              disablepictureinpicture disableremoteplayback aria-hidden="true" tabindex="-1"></video>
          </button>
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
            ${this.#memoryVerse() ? `<button class="action memory" type="button">Practice this week's Memory-Verse challenge</button>` : ''}
            <a class="action" href="${escapeHtml(this.#flipbookUrl())}">Open this week's Flipbook</a>
            <button class="action finish" type="button">Done</button>
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
      // The video shows only once it is playing; until then, and when it
      // fails, the poster image beneath stands in.
      const video = poster.querySelector('.poster-video');
      video.muted = true; // the property too, or some browsers refuse to autoplay
      video.addEventListener('playing', () => video.classList.add('playing'));
      video.addEventListener('error', () => {
        video.classList.remove('playing');
        if (video.getAttribute('src')) this.#missingVideo = video.getAttribute('src');
      });
      this.#syncPosterVideo();
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
      this.#body.querySelector('.memory')?.addEventListener('click', () => {
        // Only once the Moment has closed, or its closing would unlock the page under the practice.
        const memory = this.#memoryVerse();
        this.#dialog.addEventListener('close', () => memory?.open(), { once: true });
        this.close();
      });
      this.#body.querySelector('.finish').addEventListener('click', () => this.close());
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

  // The Listen screen's video loops over the poster while the Moment is open
  // and in view and the poster, not the comic, is up; not at all when the
  // reader asks for less motion or to save data.
  #syncPosterVideo = () => {
    const video = this.#body.querySelector('.poster-video');
    if (!video) return;
    video.hidden = this.#comic;
    const url = `${this.#mediaPath('image')}.mp4`;
    const play = this.#dialog.open && !document.hidden && !this.#comic && url !== this.#missingVideo
      && !this.#reducedMotion.matches && !navigator.connection?.saveData;
    if (!play) {
      video.pause();
      return;
    }
    if (video.getAttribute('src') !== url) video.src = url;
    video.play().catch(() => {});
  };

  /**
   * Turn the poster like a page, as <poster-card> does on the main page: it
   * swings edge-on, the image swaps while it is invisible, then the other side
   * swings back in.
   */
  async #flipPoster() {
    this.#comic = !this.#comic;
    const poster = this.#body.querySelector('.poster');
    if (!poster) return;
    const image = poster.querySelector('img');
    image.alt = `The Daily Grace ${this.#comic ? 'comic' : 'poster'} for ${this.#day.name}`;
    poster.classList.toggle('comic', this.#comic);
    this.#body.querySelector('.poster-note').textContent = this.#comic
      ? 'Tap the comic to see the poster.'
      : 'Tap the poster to see the comic.';
    poster.setAttribute('aria-label', this.#comic ? 'Show the regular poster' : 'Show the comic version of this poster');

    const flipId = ++this.#flipId;
    const nextSrc = this.#posterUrl(this.#comic);
    // Start loading now so the swap does not show a half-loaded image.
    const preload = new Image();
    preload.src = nextSrc;
    const ready = preload.decode().catch(() => {});

    if (this.#reducedMotion.matches || !poster.animate) {
      await ready;
      if (flipId === this.#flipId) {
        image.src = nextSrc;
        this.#syncPosterVideo();
      }
      return;
    }

    poster.getAnimations().forEach((animation) => animation.cancel());
    const turn = (angle) => `perspective(1400px) rotateY(${angle}deg)`;
    const out = poster.animate(
      [
        { transform: turn(0), opacity: 1 },
        { transform: turn(-90), opacity: 0.55 },
      ],
      { duration: 240, easing: 'ease-in', fill: 'forwards' },
    );
    await Promise.all([out.finished.catch(() => {}), ready]);
    // A newer tap owns the image now; it has already cancelled this turn.
    if (flipId !== this.#flipId) return;

    image.src = nextSrc;
    // The comic has no video: it goes with the poster and comes back with it.
    this.#syncPosterVideo();
    poster.animate(
      [
        { transform: turn(90), opacity: 0.55 },
        { transform: turn(0), opacity: 1 },
      ],
      { duration: 300, easing: 'ease-out' },
    );
    out.cancel();
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

  #memoryVerse() {
    if (!this.#isToday) return null;
    const memory = document.getElementById(this.getAttribute('memory-verse') ?? '');
    return memory?.ready ? memory : null;
  }

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
