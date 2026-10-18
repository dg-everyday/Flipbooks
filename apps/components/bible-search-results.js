/**
 * <bible-search-results> — the Bible verse search results panel as a web component.
 *
 * The component only displays results. Your page owns the search form, the
 * reference parsing and the database, and drives the component through its
 * methods. It renders the book header (symbol, name, Hebrew name, overview),
 * a "N verses found" summary and a scrolling reader that loads verses in
 * batches as you scroll or press "Load more verses". Each verse card has a
 * dog-eared corner that opens the verse's explanation in a popup; the
 * explanations are fetched one chapter at a time from annotations-base, and
 * the Bible references in them are pills that open the passage on top
 * (scripture-refs.js). The
 * words of Jesus are printed in red, from the ranges in red-letter-src.
 *
 * Below the commentary the explanation popup lays the verse out word by word,
 * an interlinear in the original's order (Hebrew right to left), as the
 * passage reader's Interlinear tab does: each word's Strong's number,
 * transliteration, the Hebrew or Greek, a gloss and its grammar, from the
 * chapter files in interlinear-base, and under them the glosses in that
 * order as one line ("Word for word"). Tapping a word opens its entry in
 * Strong's dictionary, fetched from strongs-base.
 *
 * Each verse opens with a "KJV" pill, and under it a "BSB" pill with an arrow
 * shows the Berean Standard Bible wording after it, from the same chapter file
 * as the explanation (translations.bsb); a second tap hides it. The KJV stays
 * the text; the BSB is there to help read it, and is always labelled. The few
 * verses the BSB leaves out lose their pill once their chapter loads.
 *
 * Holding a verse card for half a second bookmarks it: a gold glow spreads
 * from the finger and the card takes a ribbon. Holding it again removes the
 * bookmark. Up to 100 verse docids are kept in localStorage, newest first, and
 * are shared by every panel on the page. Rows without a docid cannot be held.
 *
 * Usage
 *   <bible-search-results id="results" media-base="https://.../media/"></bible-search-results>
 *   <script type="module" src="./apps/components/bible-search-results.js"></script>
 *
 *   results.loading('Loading Bible verses…');
 *   results.showVerses(rows);   // rows: [{ docid, book_name, book_id, chapter, verse, text }]
 *   results.showKeywordResults(rows, ['grace', 'faith']);  // rows from any books;
 *                               // a psalm's title is verse 0, with no docid
 *   results.showBookmarks(rows);  // rows for results.bookmarks, in that order
 *   results.showMessage('No verses found.');
 *   results.reset();            // clear and hide
 *
 * The host is hidden until one of loading / showMessage / showVerses is called.
 *
 * Attributes
 *   media-base      Base URL for book symbols (images/symbols/<Book>-symbol.svg).
 *                   Default: media_base_url in apps/settings/appsettings.json
 *   metadata-src    URL of the bundled book metadata used when the symbol SVG
 *                   cannot be read cross-origin (resolved against the page).
 *                   Default: ../../assets/book-metadata.json (relative to this file)
 *   batch-size      Verses added per batch. Default: 24
 *   compact         Present: hide the "N verses found" summary and the
 *                   end-of-results note. For popups showing one passage.
 *   annotations-base  Folder of <book_id>/<chapter>.json annotation files, each
 *                   verse's { explanation, translations } (see tools/annotations;
 *                   resolved against the page). Rows without a book_id get
 *                   no explanation corner.
 *                   Default: ../../assets/annotations/ (relative to this file)
 *   red-letter-src  JSON of where the words of Jesus fall in each verse, printed
 *                   in red (see tools/red-letter). Rows without a book_id, or
 *                   a file that fails to load, leave the text in black.
 *                   Default: ../../assets/red-letter.json (relative to this file)
 *   interlinear-base  Folder of <book_id>/<chapter>.json interlinear files,
 *                   each verse's words in the Hebrew or Greek (see
 *                   tools/interlinear). Default: ../../assets/interlinear/
 *                   (relative to this file)
 *   strongs-base    Folder of Strong's dictionary files, hebrew/<n>.json and
 *                   greek/<n>.json, 100 entries each (see tools/strongs).
 *                   Default: ../../assets/strongs/ (relative to this file)
 *   bsb-open        Present: every verse opens with its BSB wording showing
 *                   (the passage popup for the banner's daily verse).
 *   explaining     Set by the component while the explanation popup is open,
 *                   so the page can lock its own scrolling.
 *
 * Methods      reset(), loading(message), showMessage(message), showVerses(rows),
 *              showKeywordResults(rows, words), showBookmarks(rows)
 * Properties   busy (read-only)
 *              bookmarks (read-only): the bookmarked verse docids, newest first
 * Events       bookmarkchange  a hold added or removed a bookmark,
 *                              detail: { docid, result: 'added' | 'removed' }
 *
 * CSS custom properties
 *   --search-navy, --search-ink, --search-hebrew, --search-paper,
 *   --search-red-letter, --reference-width
 *   --reader-max-height  Height at which the verses scroll in their own box.
 *                        Default: min(65vh, 640px); none lets the page scroll them.
 *
 * Fonts: Germania One, Strait and Roboto are registered on the document by
 * assets/scripts/fonts.js.
 */

import { registerFonts } from "../../assets/scripts/fonts.js";
import { bookmarkNote, keepBookmarks } from "./card-bookmarks.js?v=20261018-1";
import { PILL_STYLES, linkScripture } from "./scripture-refs.js?v=20261018-1";
import { STRONGS_ENTRY_STYLES, loadStrongsEntry, strongsEntryNode } from "./strongs-entry.js?v=20261016-1";
import { MEDIA_BASE_URL } from "../settings/settings.js?v=20261009-1";

// Citations use "Psalm"; the symbol library files that book under its plural name.
const SYMBOL_BOOK_NAMES = { Psalm: "Psalms" };
const bookSymbolUrl = (mediaBase, book) =>
    `${mediaBase}images/symbols/${encodeURIComponent(SYMBOL_BOOK_NAMES[book] ?? book)}-symbol.svg`;

const DEFAULT_MEDIA_BASE = MEDIA_BASE_URL;
const DEFAULT_BATCH_SIZE = 24;
const DEFAULT_METADATA_SRC = new URL(
    "../../assets/book-metadata.json",
    import.meta.url,
).href;
const DEFAULT_ANNOTATIONS_BASE = new URL(
    "../../assets/annotations/",
    import.meta.url,
).href;
const DEFAULT_INTERLINEAR_BASE = new URL(
    "../../assets/interlinear/",
    import.meta.url,
).href;
const DEFAULT_RED_LETTER_SRC = new URL(
    "../../assets/red-letter.json",
    import.meta.url,
).href;

const BOOKMARKS_KEY = "dailygrace:bookmarks";
const BOOKMARK_LIMIT = 100;
// How long a verse card is held to bookmark it, and how far the finger may
// drift before the hold counts as a scroll instead.
const HOLD_MS = 500;
const HOLD_SLOP = 10;

const BSB_CHEVRON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
// Ids for the BSB wording, which its pill names in aria-controls.
let bsbCount = 0;

// The "source" of each explanation in an annotation file (see tools/annotations).
const EXPLANATION_SOURCES = {
    jfb: "Jamieson-Fausset-Brown Bible Commentary (1871)",
    gill: "John Gill, Exposition of the Entire Bible (1746–63)",
};

const STYLES = /* css */ `
  :host {
    --search-navy: #001b34;
    --search-ink: #10253b;
    --search-hebrew: #963d32;
    --search-gold: #a8810c;
    --search-paper: #f3e7d2;
    --search-red-letter: #b3261e;
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
  /* A short passage rarely scrolls, so reserving a scrollbar gutter would only
     leave the verse cards narrower than the book header. */
  :host([compact]) .reader { scrollbar-gutter: auto; }
  .message { margin: 0; padding: 16px; font-size: 1rem; }

  .reader {
    max-height: var(--reader-max-height, min(65vh, 640px));
    overflow-y: auto;
    /* The explanation corner sits 1px past each card's edge to cover its
       border; never let that sliver add a horizontal scrollbar. */
    overflow-x: hidden;
    /* Keep the batches loaded by the infinite scroll inside this box: without
       paint containment their height leaks into the document's scroll height
       and leaves blank background below the footer. */
    contain: paint;
    scrollbar-gutter: stable;
    scrollbar-width: thin;
    scrollbar-color: #a2957a transparent;
    scroll-behavior: auto;
  }
  /* The bottom padding holds the last card's corner, which would otherwise
     overflow by 1px and give a one-verse popup a scrollbar. */
  .verse-list { display: grid; gap: 8px; padding-bottom: 1px; }
  .verse-card {
    position: relative;
    display: grid;
    grid-template-columns: var(--reference-width) minmax(0, 1fr);
    align-items: start;
    padding: 16px 0;
    border: 1px solid rgb(0 27 52 / 16%);
    border-radius: 6px;
    background: rgb(255 255 255 / 16%);
    /* Keeps the bookmark glow inside the card. */
    overflow: hidden;
  }
  /* The dog-eared corner opens the verse's explanation. The card's corner is
     cut away so the panel shows through, and the flap is the back of the
     paper folded up over the card, creased along the cut. It stays small
     enough to clear the text above the card's bottom padding. */
  .verse-card.explainable {
    --fold: 24px;
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--fold)),
      calc(100% - var(--fold)) 100%, 0 100%);
    transition: clip-path .15s ease;
  }
  .verse-card.explainable:has(.explain:hover, .explain:focus-visible) { --fold: 30px; }
  /* A full 44px tap target on the card's outer corner, over its border. */
  .explain {
    position: absolute; right: -1px; bottom: -1px;
    width: 44px; height: 44px; padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    filter: drop-shadow(-1px -1px 1.5px rgb(0 27 52 / 28%));
  }
  .explain::before {
    content: '';
    position: absolute; right: 0; bottom: 0;
    width: var(--fold); height: var(--fold);
    border-top-left-radius: 3px;
    background: linear-gradient(135deg, #fffaf1 0%, #f1e5cd 34%, #dcc9a6 50%);
    clip-path: polygon(0 0, 100% 0, 0 100%);
    transition: width .15s ease, height .15s ease;
  }
  .explain:focus-visible { outline: none; }
  .explain:focus-visible::before {
    background: linear-gradient(135deg, #fffaf1 0%, #e9dcc0 30%, var(--search-navy) 50%);
  }

  /* Version pills. The KJV pill names the verse's text; the BSB pill under it
     shows or hides the Berean Standard Bible wording, set after it the same
     way, in the verse's column and along its rule. */
  .version-pill {
    display: inline-flex; align-items: center; gap: 1px;
    margin-right: 6px; padding: 1px 7px;
    border: 1px solid rgb(0 27 52 / 45%);
    border-radius: 999px;
    background: transparent;
    color: var(--search-navy);
    text-decoration: none;
    vertical-align: .14em;
    letter-spacing: .06em;
    font: 600 .6875rem/1.35 'Roboto', Arial, sans-serif;
  }
  /* The verse marker spans both lines, so a tall one (a chapter's verse 1)
     does not push the BSB line down, and the verse's rule runs on unbroken. */
  .verse-card.has-bsb .verse-reference { grid-row: span 2; }
  .verse-card.has-bsb .verse-text { align-self: stretch; }
  .bsb {
    grid-column: 2;
    margin: 0; padding: 8px 18px 0;
    border-left: 1px solid rgb(128 91 24 / 35%);
    color: #2c4157;
    overflow-wrap: anywhere;
    font: 400 clamp(1rem, .96rem + .3vw, 1.125rem)/1.35 'Strait', 'Roboto', sans-serif;
  }
  .chapter-start .bsb { border-left-color: rgb(168 129 12 / 55%); }
  .bsb-toggle { position: relative; padding-right: 3px; cursor: pointer; }
  /* A bigger tap target than the pill shows. */
  .bsb-toggle::after { content: ''; position: absolute; inset: -9px -8px; }
  .bsb-toggle:hover { background: rgb(255 255 255 / 60%); }
  /* Folded, the pill is black on light grey, so it reads as a switch to press. */
  .verse-card:not(.bsb-open) .bsb-toggle { background: #e2e2e2; color: #000; }
  .verse-card:not(.bsb-open) .bsb-toggle:hover { background: #d2d2d2; }
  .bsb-toggle:focus-visible { outline: 2px solid var(--search-navy); outline-offset: 2px; }
  .bsb-toggle svg {
    width: 13px; height: 13px;
    fill: none; stroke: currentColor;
    stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round;
    transition: rotate .25s ease;
  }
  .bsb-open .bsb-toggle svg { rotate: 180deg; }
  .bsb-words:not([hidden]) { animation: bsb-in .25s ease; }
  @keyframes bsb-in { from { opacity: 0; } }
  .bsb-title { font: italic 400 .9375rem/1.4 Georgia, 'Times New Roman', serif; }
  .bsb-message { color: #4f5c65; font: .875rem/1.5 'Roboto', Arial, sans-serif; }
  @media (prefers-reduced-motion: reduce) {
    .bsb-toggle svg { transition: none; }
    .bsb-words:not([hidden]) { animation: none; }
  }

  /* Bookmarks. Holding a card grows a glow out from the finger; it is gold
     for a new bookmark and navy when the hold will remove one. */
  .verse-card[data-docid] {
    --glow: 214 170 40;
    -webkit-touch-callout: none;
  }
  .verse-card.bookmarked { --glow: 0 27 52; }
  /* On touch screens a long press would select the text instead. */
  @media (pointer: coarse) {
    .verse-card[data-docid] { -webkit-user-select: none; user-select: none; }
  }
  /* Positioned so the text paints over the glow. */
  .verse-reference, .verse-text { position: relative; }
  .verse-card[data-docid]::before {
    content: '';
    position: absolute;
    left: var(--hold-x, 50%); top: var(--hold-y, 50%);
    width: 640px; height: 640px;
    margin: -320px 0 0 -320px;
    border-radius: 50%;
    background: radial-gradient(closest-side,
      rgb(var(--glow) / 40%), rgb(var(--glow) / 16%) 55%, transparent);
    opacity: 0;
    transform: scale(0);
    pointer-events: none;
    transition: transform .3s ease, opacity .3s ease;
  }
  .verse-card.holding::before {
    opacity: 1;
    transform: scale(1);
    transition: transform ${HOLD_MS}ms cubic-bezier(.25, .7, .35, 1), opacity .15s ease;
  }
  /* The hold is done: the card flashes and the glow fades out. */
  .verse-card[data-flash] {
    --flash: 168 129 12;
    --glow: var(--flash);
    animation: bookmark-pulse .9s ease-out;
  }
  .verse-card[data-flash="removed"] { --flash: 0 27 52; }
  .verse-card[data-flash="full"],
  .verse-card[data-flash="failed"] { --flash: 179 38 30; }
  .verse-card[data-flash]::before { animation: bookmark-glow .9s ease-out forwards; }
  @keyframes bookmark-pulse {
    from { box-shadow: inset 0 0 0 2px rgb(var(--flash)), inset 0 0 28px rgb(var(--flash) / 45%); }
    to { box-shadow: inset 0 0 0 2px transparent, inset 0 0 28px transparent; }
  }
  @keyframes bookmark-glow {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(1.2); }
  }
  /* A bookmarked card carries a gold ribbon at its top edge. */
  .verse-card.bookmarked::after {
    content: '';
    position: absolute; top: 0; right: 10px;
    width: 12px; height: 17px;
    background: var(--search-gold);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%);
    pointer-events: none;
  }
  .verse-card[data-flash="added"]::after { animation: ribbon-drop .35s ease-out; }
  @keyframes ribbon-drop { from { transform: translateY(-100%); } }
  /* The note wraps onto a second line on a narrow card rather than spill out
     of it, and the longer "full" note stays up long enough to read. */
  .bookmark-note {
    position: absolute; top: 6px; left: 50%;
    width: max-content; max-width: calc(100% - 24px);
    padding: 3px 12px;
    border-radius: 14px;
    background: var(--search-navy);
    color: #fff;
    text-align: center;
    font: 500 .8125rem/1.4 'Roboto', Arial, sans-serif;
    pointer-events: none;
    animation: bookmark-note 1.6s ease forwards;
  }
  .bookmark-note.added { background: var(--search-gold); }
  .bookmark-note.full, .bookmark-note.failed { background: var(--search-red-letter); }
  .bookmark-note.full { animation-duration: 3.2s; }
  @keyframes bookmark-note {
    0% { opacity: 0; transform: translate(-50%, 4px); }
    12%, 75% { opacity: 1; transform: translate(-50%, 0); }
    100% { opacity: 0; transform: translate(-50%, 0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .verse-card[data-docid]::before,
    .verse-card.holding::before { transform: none; }
    .verse-card.holding::before { transition: opacity ${HOLD_MS}ms linear; }
    .verse-card[data-flash]::before { animation-name: bookmark-fade; }
    .verse-card[data-flash="added"]::after { animation: none; }
    @keyframes bookmark-fade { from { opacity: 1; } to { opacity: 0; } }
  }
  /* Keyword results: a header for the search itself, the book named on each
     card, and the matched words marked in the text. */
  .keyword-header { grid-template-columns: minmax(0, 1fr); }
  .keyword-header .book-details { grid-column: 1; border-left: 0; }
  .keyword-header h2 { font: 400 1.375rem/1.3 'Strait', 'Roboto', sans-serif; }
  .verse-book-symbol {
    display: block;
    width: 32px; height: 32px;
    margin: 0 auto 2px;
    object-fit: contain;
  }
  /* Sized so the longest single words (Thessalonians, Ecclesiastes) still fit
     the narrow phone column; longer names wrap only between words. */
  .verse-book {
    display: block;
    padding: 0 2px 4px;
    text-align: center;
    color: var(--search-hebrew);
    overflow-wrap: break-word;
    font: 400 .875rem/1.2 'Strait', 'Roboto', sans-serif;
  }
  .verse-text mark {
    padding: 0 .08em;
    border-radius: 3px;
    background: rgb(168 129 12 / 24%);
    color: inherit;
  }
  /* Red-letter text: the words of Jesus, as many printed Bibles set them. */
  .red-letter { color: var(--search-red-letter); }
  .verse-reference { margin: 0; font-weight: 400; }
  .verse-numbers {
    display: flex; align-items: flex-start; justify-content: center;
    gap: 1px; padding: 2px 5px;
    color: var(--search-navy);
    font-variant-numeric: lining-nums tabular-nums;
  }
  .chapter-number { font: 500 .9375rem/1.5 'Roboto', Arial, sans-serif; }
  .verse-number { font: 400 2.25rem/1 Georgia, 'Times New Roman', serif; }
  /* A psalm's title in keyword results: "3:title", set in italics as printed
     Bibles set the superscription. */
  .verse-number.psalm-title { font: italic 400 1.125rem/1.35 Georgia, 'Times New Roman', serif; }
  .title-card .verse-text { font-style: italic; }
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

  /* Explanation popup: the book header's layout, with the reference as the
     title and the commentary where the overview would be. */
  .explanation {
    width: min(640px, 92vw);
    max-height: 88vh;
    max-height: 88dvh;
    padding: 14px;
    border: 0;
    border-radius: 16px;
    background: var(--search-paper);
    color: var(--search-ink);
    box-shadow: 0 24px 60px rgb(0 27 52 / 40%);
    overflow: auto;
    overscroll-behavior: contain;
    /* The text cursor over the commentary, not the plain arrow of a verse
       popup this panel may sit in. */
    cursor: auto;
  }
  .explanation::backdrop {
    background: rgb(0 27 52 / 60%);
    backdrop-filter: blur(3px);
  }
  /* The page's popups share one scrollbar: a slim gold pill on a clear track,
     held off the rounded corners, in place of the grey system bar that
     squares off the right edge. Firefox has no ::-webkit-scrollbar, and
     Chrome would drop these rules if it saw the standard properties. */
  .explanation::-webkit-scrollbar { width: 10px; }
  .explanation::-webkit-scrollbar-track { margin-block: 16px; background: transparent; }
  .explanation::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    border-radius: 999px;
    background: rgb(198 146 46 / 40%) padding-box;
  }
  .explanation::-webkit-scrollbar-thumb:hover { background-color: rgb(198 146 46 / 75%); }
  @supports not selector(::-webkit-scrollbar) {
    .explanation { scrollbar-width: thin; scrollbar-color: rgb(198 146 46 / 50%) transparent; }
  }
  .explanation-card { position: relative; align-items: start; }
  .explanation-card .book-symbol { margin-top: 4px; }
  .explanation-card h2 { padding-right: 32px; }
  .explanation-card .verse-numbers { padding: 0; }
  .explanation-body {
    margin-top: 10px;
    font: 400 1.0625rem/1.5 'Strait', 'Roboto', sans-serif;
  }
  .explanation-body p { margin: 0 0 .75em; }
  .explanation-body p:last-child { margin-bottom: 0; }
  .explanation-body strong { color: var(--search-navy); font-weight: 700; }
  .explanation-body { --scripture-ref-color: #805b18; }
  .explanation-body .message { padding: 0; }
  .explanation-source {
    margin: 14px 0 0; padding-top: 10px;
    border-top: 1px solid rgb(128 91 24 / 25%);
    font: .8125rem/1.5 'Roboto', Arial, sans-serif;
    color: #4f5c65;
  }
  .explanation-close {
    position: absolute; top: 6px; right: 6px;
    width: 36px; height: 36px; padding: 0;
    border: 0; border-radius: 50%;
    background: transparent; color: var(--search-navy);
    font: 400 1.5rem/1 'Roboto', Arial, sans-serif;
    cursor: pointer;
  }
  .explanation-close:hover { background: rgb(0 27 52 / 8%); }
  .explanation-close:focus-visible { outline: 2px solid var(--search-navy); outline-offset: 2px; }

  /* The interlinear: the verse's Hebrew or Greek words in their own order
     (right to left for Hebrew), laid out as in <passage-reader>; a tap opens
     the word's dictionary entry. */
  .interlinear {
    margin-top: 16px; padding-top: 12px;
    border-top: 1px solid rgb(128 91 24 / 25%);
  }
  .interlinear-title {
    margin: 0;
    color: var(--search-navy);
    font: 400 1.375rem/1.2 'Germania One', Georgia, serif;
  }
  .interlinear-hint, .interlinear-credit {
    margin: 2px 0 10px;
    color: #4f5c65;
    font: .8125rem/1.5 'Roboto', Arial, sans-serif;
  }
  .interlinear-credit { margin: 12px 0 0; font-size: .75rem; }
  .il-words {
    display: flex; flex-wrap: wrap; gap: 10px 14px;
    margin: 0; padding: 0;
    list-style: none;
  }
  .il-words[dir="rtl"] { direction: rtl; }
  .il-word {
    display: flex; flex-direction: column; align-items: center;
    min-width: 3.2em;
    margin: -4px -6px; padding: 4px 6px;
    border: 0; border-radius: 8px;
    background: transparent;
    color: inherit;
    text-align: center;
    direction: ltr;
    font: inherit;
  }
  /* A word with a Strong's number opens its dictionary entry: no box, only a
     faint yellow behind it while its entry is open. */
  button.il-word { cursor: pointer; -webkit-tap-highlight-color: transparent; }
  button.il-word:hover { background: rgb(255 226 140 / 22%); }
  button.il-word:focus-visible { outline: 2px solid #c6922e; outline-offset: 1px; }
  button.il-word[aria-expanded="true"] { background: rgb(255 226 140 / 55%); }
  .il-orig {
    color: var(--search-ink);
    font: 400 1.45rem/1.35 'SBL Hebrew', 'Ezra SIL', 'Gentium Plus', 'Times New Roman', serif;
  }
  .il-orig:lang(grc) { font-size: 1.2rem; }
  .il-gloss {
    max-width: 9em;
    color: #b05a00;
    font: 400 .82rem/1.25 'Strait', 'Roboto', sans-serif;
  }
  .il-grammar { color: #2f5d8a; font: 400 .62rem/1.3 'Roboto', Arial, sans-serif; }
  /* The glosses in the original's order as one line, so the order is plain
     however the words wrap. */
  .il-reading {
    margin: 10px 0 0;
    color: #5a4a32;
    font: 400 .9rem/1.45 'Strait', 'Roboto', sans-serif;
  }
  .il-reading b { color: #b05a00; font-weight: 600; }
  .il-xlit { color: #2f5d8a; font: italic 400 .8rem/1.3 Georgia, 'Times New Roman', serif; }
  .il-num { color: #2f5d8a; font: 400 .66rem/1.3 'Roboto', Arial, sans-serif; }
  .il-entry { margin-top: 10px; }
  @media (max-width: 600px) {
    .il-words { gap: 8px 10px; }
    .il-orig { font-size: 1.3rem; }
  }
${STRONGS_ENTRY_STYLES}

  @media (max-width: 420px) {
    /* Too narrow for the symbol column: give the commentary the full width. */
    .explanation { padding: 10px; }
    .explanation-card { grid-template-columns: minmax(0, 1fr); padding: 14px 0; }
    .explanation-card .book-symbol { display: none; }
    .explanation-card .book-details { grid-column: 1; border-left: 0; }
  }

  @media (max-width: 420px) {
    :host { --reference-width: 5.25rem; }
    .book-symbol { width: 52px; height: 52px; }
    .book-details, .verse-text, .bsb { padding-inline: 12px; }
    .book-hebrew { font-size: 1.125rem; }
    .chapter-number { font-size: .8125rem; }
    .verse-number { font-size: 1.875rem; }
    .chapter-start .verse-numbers { margin-inline: 8px; padding: 7px 4px 9px; }
    .verse-book { font-size: .8125rem; }
  }
${PILL_STYLES}`;

// Metadata is shared by every instance: one fetch per symbol URL, one for the bundled snapshot.
const bookMetadataCache = new Map();
let bundledBookMetadata = null;

function getSvgMetadata(svgString) {
    const doc = new DOMParser().parseFromString(svgString, "image/svg+xml");
    if (doc.querySelector("parsererror")) {
        throw new Error("Invalid SVG: could not be parsed");
    }
    const getText = (selector) =>
        doc.querySelector(selector)?.textContent.trim() ?? null;
    return {
        title: getText('title[id="title"]'),
        description: getText('desc[id="description"]'),
    };
}

async function getSvgMetadataFromUrl(url, signal) {
    const response = await fetch(url, { signal });
    if (!response.ok) {
        throw new Error(`Failed to fetch SVG: ${response.status}`);
    }
    return getSvgMetadata(await response.text());
}

// Annotation and interlinear chapter files are shared by every instance: one
// fetch per file.
const chapterFileCache = new Map();

function loadChapterFile(url) {
    if (!chapterFileCache.has(url)) {
        const request = fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch ${url}: ${response.status}`,
                    );
                }
                return response.json();
            })
            .catch((error) => {
                chapterFileCache.delete(url);
                throw error;
            });
        chapterFileCache.set(url, request);
    }
    return chapterFileCache.get(url);
}

function bsbMessage(message) {
    const note = document.createElement("span");
    note.className = "bsb-message";
    note.textContent = message;
    return note;
}

/**
 * The line above a verse's interlinear: its language and how to read it. A
 * few Old Testament passages are in Aramaic (words marked "arc"); Daniel 2:4
 * turns to it partway through.
 */
function interlinearHint(lang, words) {
    const tap = "Tap a word for its dictionary entry.";
    if (lang === "grc") {
        return `The verse word by word in the Greek: each word's Strong's number, how it sounds, the Greek, its meaning and its grammar. ${tap}`;
    }
    const aramaic = words.filter((word) => word[5] === "arc").length;
    if (!aramaic) {
        return `The verse word by word in the Hebrew, read right to left: each word's Strong's number, how it sounds, the Hebrew, its meaning and its grammar. ${tap}`;
    }
    const about = "Aramaic is a language close to Hebrew, written with the same letters.";
    if (aramaic === words.length) {
        return `The verse word by word in the Aramaic, read right to left: each word's Strong's number, how it sounds, the Aramaic, its meaning and its grammar. ${about} ${tap}`;
    }
    return `The verse word by word, read right to left: it begins in Hebrew and turns to Aramaic partway through. Each word's Strong's number, how it sounds, the original, its meaning and its grammar. ${about} ${tap}`;
}

// "etc." ("&c." in the commentaries themselves) only marks where the quoted
// words of the verse stop, so it is left out of the comparison.
const comparable = (text) =>
    text
        .toLowerCase()
        .replace(/&c\.?|\betc\./g, " ")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

// Both commentaries open a paragraph with the words of the verse it explains:
// JFB as "words--note", Gill as "words,.... note". Those words are set in bold,
// but only when they really are in the verse, so a dash in ordinary prose is
// left alone.
const LEAD_WORDS = /^([^\n]{1,200}?)(?:--|,?\.{4})\s*/;

function explanationParagraph(block, verseText) {
    const paragraph = document.createElement("p");
    const match = block.match(LEAD_WORDS);
    const lead = match && comparable(match[1]);
    if (lead && comparable(verseText).includes(lead)) {
        const words = document.createElement("strong");
        words.textContent = match[1].trim();
        const rest = block.slice(match[0].length).replace(/--/g, "—");
        paragraph.append(words, rest ? ` — ${rest}` : "");
    } else {
        paragraph.textContent = block.replace(/--/g, "—");
    }
    return paragraph;
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Split text into strings and <mark>s around each match of a global pattern. */
function highlightedText(text, pattern) {
    const parts = [];
    let last = 0;
    for (const match of text.matchAll(pattern)) {
        if (match.index > last) {
            parts.push(text.slice(last, match.index));
        }
        const mark = document.createElement("mark");
        mark.textContent = match[0];
        parts.push(mark);
        last = match.index + match[0].length;
    }
    parts.push(text.slice(last));
    return parts;
}

// Red-letter ranges are shared by every instance: one fetch per file. A file
// that fails to load resolves to no ranges, so verses still show, in black.
const redLetterCache = new Map();

function loadRedLetters(url) {
    if (!redLetterCache.has(url)) {
        redLetterCache.set(
            url,
            fetch(url)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(
                            `Failed to fetch red letters: ${response.status}`,
                        );
                    }
                    return response.json();
                })
                .catch((error) => {
                    console.warn("Red-letter text unavailable:", error);
                    redLetterCache.delete(url);
                    return {};
                }),
        );
    }
    return redLetterCache.get(url);
}

/**
 * The verse text as nodes: the words of Jesus (ranges: [[start, end], …]) in
 * red spans, and keywords marked inside either when highlight is given.
 */
function verseTextNodes(text, ranges, highlight) {
    const words = (part) =>
        highlight ? highlightedText(part, highlight) : [part];
    if (!ranges?.length) {
        return words(text);
    }
    const nodes = [];
    let last = 0;
    for (const [start, end] of ranges) {
        if (start > last) {
            nodes.push(...words(text.slice(last, start)));
        }
        const red = document.createElement("span");
        red.className = "red-letter";
        red.append(...words(text.slice(start, end)));
        nodes.push(red);
        last = end;
    }
    nodes.push(...words(text.slice(last)));
    return nodes;
}

// Bookmarks are verse docids, newest first. Storage can be refused (private
// browsing, a full quota), so reads fall back to none and writes report failure.
function readBookmarks() {
    try {
        const ids = JSON.parse(localStorage.getItem(BOOKMARKS_KEY));
        return Array.isArray(ids)
            ? ids.filter(Number.isSafeInteger).slice(0, BOOKMARK_LIMIT)
            : [];
    } catch {
        return [];
    }
}

// Every panel on the page listens here to keep its ribbons in step.
const bookmarkChanges = new EventTarget();
window.addEventListener("storage", (event) => {
    if (event.key === BOOKMARKS_KEY || event.key === null) {
        bookmarkChanges.dispatchEvent(new Event("change"));
    }
});

/** Adds or removes a bookmark. Returns 'added', 'removed', 'full' or 'failed'. */
function toggleBookmark(docid) {
    const ids = readBookmarks();
    const removing = ids.includes(docid);
    if (!removing && ids.length >= BOOKMARK_LIMIT) {
        return "full";
    }
    const next = removing ? ids.filter((id) => id !== docid) : [docid, ...ids];
    try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
    } catch {
        return "failed";
    }
    if (!removing) {
        keepBookmarks();
    }
    bookmarkChanges.dispatchEvent(new Event("change"));
    return removing ? "removed" : "added";
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// The same pop the page's own popups use (assets/scripts/script.js).
function popDialog(dialog, direction) {
    const opening = direction === "open";
    const options = {
        duration: opening ? 460 : 220,
        easing: opening
            ? "cubic-bezier(.2, .9, .25, 1.2)"
            : "cubic-bezier(.4, 0, 1, 1)",
        fill: "forwards",
    };
    const entering = { transform: "scale(.82) translateY(28px)", opacity: 0 };
    const full = { transform: "none", opacity: 1 };
    const leaving = { transform: "scale(.94)", opacity: 0 };
    dialog.animate(opening ? [entering, full] : [full, leaving], options);
    const backdrop = dialog.animate(
        opening
            ? [{ opacity: 0 }, { opacity: 1 }]
            : [{ opacity: 1 }, { opacity: 0 }],
        { ...options, easing: "ease", pseudoElement: "::backdrop" },
    );
    return backdrop.finished.catch(() => {});
}

export class BibleSearchResults extends HTMLElement {
    #root;
    #content;
    #status;
    #generation = 0;
    #observer = null;
    #explanation;
    #explanationRequest = 0;
    #explanationClosing = false;
    #hold = null;
    // A hold ends with the finger lifting, and the click that follows must not
    // reach the page: the verse popup closes on any click.
    #swallowClick = false;

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: "open" });
        this.#root.innerHTML = `
      <style>${STYLES}</style>
      <section aria-label="Bible verse search results"></section>
      <p class="visually-hidden" role="status" aria-atomic="true"></p>
      <dialog class="explanation" aria-labelledby="explanation-title">
        <article class="book-header explanation-card">
          <img class="book-symbol" width="64" height="64" alt="">
          <div class="book-details">
            <h2 id="explanation-title">
              <span class="visually-hidden"></span>
              <span class="explanation-book" aria-hidden="true"></span>
              <span class="verse-numbers" aria-hidden="true">
                <span class="chapter-number"></span><span class="verse-number"></span>
              </span>
            </h2>
            <div class="explanation-body"></div>
            <p class="explanation-source" hidden></p>
            <section class="interlinear" aria-labelledby="interlinear-title" hidden>
              <h3 class="interlinear-title" id="interlinear-title">Interlinear</h3>
              <p class="interlinear-hint"></p>
              <ol class="il-words"></ol>
              <p class="il-reading"><b>Word for word: </b><span></span></p>
              <div class="il-entry" id="interlinear-entry" aria-live="polite" hidden></div>
              <p class="interlinear-credit">Hebrew, Aramaic and Greek words, glosses and grammar from STEPBible.org (Tyndale House, Cambridge), CC BY 4.0; the Greek is the text used by the KJV translators (Scrivener 1894). Dictionary: James Strong, from Open Scriptures (CC BY-SA).</p>
            </section>
          </div>
          <button type="button" class="explanation-close" aria-label="Close explanation">×</button>
        </article>
      </dialog>`;
        this.#content = this.#root.querySelector("section");
        this.#status = this.#root.querySelector('[role="status"]');

        const dialog = this.#root.querySelector(".explanation");
        this.#explanation = dialog;
        dialog.querySelector(".book-symbol").onerror = (event) => {
            event.target.hidden = true;
        };
        // Only the close button closes the popup: not Escape, not a tap outside.
        // Stopping Escape at keydown also keeps Chrome from forcing the dialog shut
        // on a repeated press, which it does when only cancel is prevented.
        dialog.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
            }
        });
        dialog.addEventListener("cancel", (event) => event.preventDefault());
        dialog.addEventListener("click", (event) => {
            // This panel may itself sit in a popup that closes on any tap.
            event.stopPropagation();
            if (event.target.closest(".explanation-close")) {
                this.#closeExplanation();
            }
        });
        dialog.addEventListener("close", () =>
            this.removeAttribute("explaining"),
        );

        const content = this.#content;
        content.addEventListener("pointerdown", (event) =>
            this.#startHold(event),
        );
        content.addEventListener("pointermove", (event) => {
            const hold = this.#hold;
            if (
                hold &&
                event.pointerId === hold.pointerId &&
                Math.hypot(event.clientX - hold.x, event.clientY - hold.y) >
                    HOLD_SLOP
            ) {
                this.#cancelHold();
            }
        });
        content.addEventListener("pointerup", () => this.#cancelHold());
        content.addEventListener("pointercancel", () => this.#cancelHold());
        // Scroll events do not bubble; capture catches the reader's own.
        content.addEventListener("scroll", () => this.#cancelHold(), true);
        // A long press would otherwise open the phone's context menu.
        content.addEventListener("contextmenu", (event) => {
            if (this.#hold || this.#swallowClick) {
                event.preventDefault();
            }
        });
        content.addEventListener(
            "click",
            (event) => {
                if (!this.#swallowClick) {
                    return;
                }
                this.#swallowClick = false;
                event.preventDefault();
                event.stopPropagation();
            },
            true,
        );
    }

    connectedCallback() {
        registerFonts();
        // Small (about 35 KB): fetched now so the first results need not wait for it.
        loadRedLetters(this.#redLetterSrc);
        bookmarkChanges.addEventListener("change", this.#syncBookmarks);
        this.#syncBookmarks();
        // Attributes cannot be set in the constructor, so hide an empty panel here.
        if (!this.#content.hasChildNodes()) {
            this.hidden = true;
        }
    }

    disconnectedCallback() {
        bookmarkChanges.removeEventListener("change", this.#syncBookmarks);
        this.#cancelHold();
    }

    get busy() {
        return this.#content.getAttribute("aria-busy") === "true";
    }

    /** The bookmarked verse docids, newest first. */
    get bookmarks() {
        return readBookmarks();
    }

    get #mediaBase() {
        const base = this.getAttribute("media-base") || DEFAULT_MEDIA_BASE;
        return base.endsWith("/") ? base : `${base}/`;
    }

    get #batchSize() {
        const size = Number.parseInt(this.getAttribute("batch-size"), 10);
        return size > 0 ? size : DEFAULT_BATCH_SIZE;
    }

    get #annotationsBase() {
        const base = this.getAttribute("annotations-base");
        if (!base) {
            return DEFAULT_ANNOTATIONS_BASE;
        }
        return new URL(base.endsWith("/") ? base : `${base}/`, document.baseURI)
            .href;
    }

    get #interlinearBase() {
        const base = this.getAttribute("interlinear-base");
        if (!base) {
            return DEFAULT_INTERLINEAR_BASE;
        }
        return new URL(base.endsWith("/") ? base : `${base}/`, document.baseURI)
            .href;
    }

    get #strongsBase() {
        const base = this.getAttribute("strongs-base");
        if (!base) {
            return undefined;
        }
        return new URL(base.endsWith("/") ? base : `${base}/`, document.baseURI)
            .href;
    }

    get #redLetterSrc() {
        const src = this.getAttribute("red-letter-src");
        return src
            ? new URL(src, document.baseURI).href
            : DEFAULT_RED_LETTER_SRC;
    }

    /** Clear the panel and hide it. Also cancels any pending overview lookups. */
    reset() {
        this.#generation++;
        this.#explanationRequest++;
        this.#cancelHold();
        if (this.#explanation.open) {
            this.#explanation.close();
        }
        this.#observer?.disconnect();
        this.#observer = null;
        this.#content.replaceChildren();
        this.#content.removeAttribute("aria-busy");
        this.#status.textContent = "";
        this.hidden = true;
    }

    /** Show a message and mark the panel busy until the next message or results. */
    loading(message) {
        this.#showMessage(message);
        this.#content.setAttribute("aria-busy", "true");
    }

    showMessage(message) {
        this.#showMessage(message);
        this.#content.removeAttribute("aria-busy");
    }

    #showMessage(message) {
        this.#generation++;
        this.#observer?.disconnect();
        this.#observer = null;
        const paragraph = document.createElement("p");
        paragraph.className = "message";
        paragraph.textContent = message;
        this.#content.replaceChildren(paragraph);
        this.#status.textContent = message;
        this.hidden = false;
    }

    /** rows: [{ book_name, chapter, verse, text }] — all from the same book. */
    showVerses(rows) {
        if (!rows?.length) {
            this.showMessage("No verses found.");
            return;
        }
        this.#showRows(rows);
    }

    /**
     * Results of a keyword search. rows: [{ book_name, book_id, chapter, verse, text }]
     * from any number of books; words: the keywords, highlighted in each verse.
     */
    showKeywordResults(rows, words) {
        if (!rows?.length) {
            this.showMessage("No verses found.");
            return;
        }
        this.#showRows(rows, { words });
    }

    /**
     * The bookmarked verses. rows: [{ docid, book_name, book_id, chapter, verse, text }]
     * from any number of books, in the order of the bookmarks property.
     */
    showBookmarks(rows) {
        if (!rows?.length) {
            this.showMessage(
                "No bookmarks yet. Hold a verse in the search results to bookmark it.",
            );
            return;
        }
        this.#showRows(rows, { bookmarks: true });
    }

    /** view: { words } for keyword results, { bookmarks: true } for bookmarks. */
    async #showRows(rows, view = {}) {
        const generation = ++this.#generation;
        this.#observer?.disconnect();
        this.#observer = null;
        // Normally already here: the file is requested when the panel connects.
        const redLetters = await loadRedLetters(this.#redLetterSrc);
        if (generation !== this.#generation) {
            return;
        }
        this.#content.removeAttribute("aria-busy");
        this.hidden = false;
        this.#renderVerses(rows, generation, view, redLetters);
    }

    #startHold(event) {
        this.#swallowClick = false;
        if (!event.isPrimary || event.button !== 0) {
            return;
        }
        const card = event.target.closest(".verse-card[data-docid]");
        // The explanation corner is a button of its own.
        if (!card || event.target.closest("button")) {
            return;
        }
        this.#cancelHold();
        const box = card.getBoundingClientRect();
        card.style.setProperty("--hold-x", `${event.clientX - box.left}px`);
        card.style.setProperty("--hold-y", `${event.clientY - box.top}px`);
        card.removeAttribute("data-flash");
        card.classList.add("holding");
        this.#hold = {
            card,
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            timer: setTimeout(() => this.#completeHold(card), HOLD_MS),
        };
    }

    #cancelHold() {
        if (!this.#hold) {
            return;
        }
        clearTimeout(this.#hold.timer);
        this.#hold.card.classList.remove("holding");
        this.#hold = null;
    }

    #completeHold(card) {
        this.#hold = null;
        card.classList.remove("holding");
        this.#swallowClick = true;
        const docid = Number(card.dataset.docid);
        const result = toggleBookmark(docid);
        if (result === "added" || result === "removed") {
            navigator.vibrate?.(15);
            this.dispatchEvent(
                new CustomEvent("bookmarkchange", {
                    detail: { docid, result },
                }),
            );
        }

        card.querySelector(".bookmark-note")?.remove();
        const note = document.createElement("span");
        note.className = `bookmark-note ${result}`;
        note.setAttribute("aria-hidden", "true");
        note.textContent = bookmarkNote(result, BOOKMARK_LIMIT);
        note.addEventListener("animationend", () => note.remove(), {
            once: true,
        });
        card.append(note);
        // Restart the flash when the same card is held twice in quick succession.
        card.removeAttribute("data-flash");
        void card.offsetWidth;
        card.dataset.flash = result;
        this.#status.textContent = `${card.dataset.reference}: ${bookmarkNote(result, BOOKMARK_LIMIT)}`;
    }

    #syncBookmarks = () => {
        const saved = new Set(readBookmarks());
        for (const card of this.#content.querySelectorAll(
            ".verse-card[data-docid]",
        )) {
            card.classList.toggle(
                "bookmarked",
                saved.has(Number(card.dataset.docid)),
            );
        }
    };

    #loadBundledBookMetadata() {
        if (!bundledBookMetadata) {
            const src =
                this.getAttribute("metadata-src") || DEFAULT_METADATA_SRC;
            bundledBookMetadata = fetch(new URL(src, document.baseURI))
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Book metadata could not be loaded.");
                    }
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
                    if (!metadata.title || !metadata.description) {
                        throw new Error("Incomplete SVG metadata.");
                    }
                    return metadata;
                })
                // This snapshot comes from the same SVGs and also works when the media
                // host permits <img> display but blocks cross-origin fetch requests.
                .catch(async () => {
                    const metadata = (await this.#loadBundledBookMetadata())[
                        bookName
                    ];
                    if (!metadata) {
                        throw new Error(
                            `No book overview found for ${bookName}.`,
                        );
                    }
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
        const header = document.createElement("header");
        header.className = "book-header";
        const symbol = document.createElement("img");
        symbol.className = "book-symbol";
        symbol.width = 64;
        symbol.height = 64;
        symbol.alt = "";
        const symbolUrl = bookSymbolUrl(this.#mediaBase, bookName);
        symbol.onerror = () => {
            symbol.hidden = true;
        };
        symbol.src = symbolUrl;

        const details = document.createElement("div");
        details.className = "book-details";
        const title = document.createElement("h2");
        title.id = "book-title";
        const englishName = document.createElement("span");
        englishName.textContent = bookName;
        title.append(englishName);
        details.append(title);
        header.append(symbol, details);

        // The verse text remains available even if the optional SVG metadata fails.
        this.#loadBookMetadata(bookName, symbolUrl)
            .then((metadata) => {
                if (generation !== this.#generation) {
                    return;
                }
                const hebrewName = metadata.title?.split("—")[2]?.trim();
                if (hebrewName) {
                    const hebrew = document.createElement("bdi");
                    hebrew.className = "book-hebrew";
                    hebrew.lang = "he";
                    hebrew.dir = "rtl";
                    hebrew.textContent = hebrewName;
                    title.append(hebrew);
                }
                if (metadata.description) {
                    const description = document.createElement("p");
                    description.className = "book-description";
                    description.textContent = metadata.description;
                    details.append(description);
                }
            })
            .catch((error) => {
                console.warn(
                    `Book overview unavailable for ${bookName}:`,
                    error,
                );
            });
        return header;
    }

    #createKeywordHeader(rows, words) {
        const header = document.createElement("header");
        header.className = "book-header keyword-header";
        const details = document.createElement("div");
        details.className = "book-details";
        const title = document.createElement("h2");
        title.id = "book-title";
        title.textContent = words.map((word) => `“${word}”`).join(" ");
        const books = new Set(rows.map((row) => row.book_name)).size;
        const description = document.createElement("p");
        description.className = "book-description";
        description.textContent = `Verses containing ${words.length === 1 ? "this word" : "all of these words"}, ${
            books === 1 ? "in one book" : `across ${books} books`
        }.`;
        details.append(title, description);
        header.append(details);
        return header;
    }

    #createBookmarksHeader(rows) {
        const header = document.createElement("header");
        header.className = "book-header keyword-header";
        const details = document.createElement("div");
        details.className = "book-details";
        const title = document.createElement("h2");
        title.id = "book-title";
        title.textContent = "Bookmarked verses";
        const description = document.createElement("p");
        description.className = "book-description";
        description.textContent =
            `${rows.length} of ${BOOKMARK_LIMIT} saved verses, newest first. ` +
            "Hold a verse to remove its bookmark.";
        details.append(title, description);
        header.append(details);
        return header;
    }

    /**
     * highlight: a global pattern of keywords to mark in the text, for keyword results.
     * mixed: the rows may span books, so each card names its own.
     * redLetters: { book_id: { "chapter:verse": [[start, end], …] } }, the words of Jesus.
     * saved: the bookmarked docids, which get a ribbon.
     */
    #createVerseCard(
        bookName,
        row,
        {
            highlight = null,
            mixed = false,
            redLetters = {},
            saved = new Set(),
        } = {},
    ) {
        const item = document.createElement("div");
        item.setAttribute("role", "listitem");
        const card = document.createElement("article");
        // Chapter openings only mark the way while reading one book in order.
        const chapterStart = !mixed && Number(row.verse) === 1;
        // Keyword results give a psalm's title as verse 0.
        const psalmTitle = row.verse === 0;
        card.className = chapterStart
            ? "verse-card chapter-start"
            : psalmTitle
              ? "verse-card title-card"
              : "verse-card";
        const reference = document.createElement("h3");
        reference.className = "verse-reference";
        const accessibleReference = document.createElement("span");
        accessibleReference.className = "visually-hidden";
        accessibleReference.textContent = chapterStart
            ? `${bookName}, start of chapter ${row.chapter}, verse ${row.verse}`
            : psalmTitle
              ? `${bookName}, chapter ${row.chapter}, title`
              : `${bookName}, chapter ${row.chapter}, verse ${row.verse}`;
        const numbers = document.createElement("span");
        numbers.className = "verse-numbers";
        numbers.setAttribute("aria-hidden", "true");
        const chapter = document.createElement("span");
        chapter.className = "chapter-number";
        chapter.textContent = `${row.chapter}:`;
        const verse = document.createElement("span");
        verse.className = psalmTitle
            ? "verse-number psalm-title"
            : "verse-number";
        verse.textContent = psalmTitle ? "title" : row.verse;
        numbers.append(chapter, verse);
        reference.append(accessibleReference);
        // Keyword results and bookmarks span books, so each card shows its own
        // book: symbol and name. Screen readers already get the name from the
        // hidden reference.
        if (mixed) {
            const symbol = document.createElement("img");
            symbol.className = "verse-book-symbol";
            symbol.width = 32;
            symbol.height = 32;
            symbol.alt = "";
            symbol.loading = "lazy";
            symbol.onerror = () => symbol.remove();
            symbol.src = bookSymbolUrl(this.#mediaBase, bookName);
            const book = document.createElement("span");
            book.className = "verse-book";
            book.setAttribute("aria-hidden", "true");
            book.textContent = bookName;
            reference.append(symbol, book);
        }
        reference.append(numbers);
        const text = document.createElement("p");
        text.className = "verse-text";
        const ranges =
            row.book_id &&
            redLetters[row.book_id]?.[`${row.chapter}:${row.verse}`];
        const kjv = document.createElement("abbr");
        kjv.className = "version-pill";
        kjv.title = "King James Version";
        kjv.textContent = "KJV";
        text.append(kjv, ...verseTextNodes(row.text, ranges, highlight));
        card.append(reference, text);
        const { docid } = row;
        if (Number.isSafeInteger(docid)) {
            card.dataset.docid = docid;
            card.dataset.reference = `${bookName} ${row.chapter}:${row.verse}`;
            card.classList.toggle("bookmarked", saved.has(docid));
        }
        // The explanations and the BSB cover numbered verses only.
        if (row.book_id && !psalmTitle) {
            card.classList.add("explainable");
            card.append(this.#createExplainButton(bookName, row));
            this.#addBsb(card, bookName, row);
            if (this.hasAttribute("bsb-open")) {
                this.#toggleBsb(card, row, true);
            }
        }
        item.append(card);
        return item;
    }

    /** The BSB pill under the verse text, with the (hidden) wording after it. */
    #addBsb(card, bookName, row) {
        const line = document.createElement("p");
        line.className = "bsb";
        const words = document.createElement("span");
        words.className = "bsb-words";
        words.id = `bsb-${++bsbCount}`;
        words.hidden = true;
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "version-pill bsb-toggle";
        toggle.title = "Berean Standard Bible";
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-controls", words.id);
        toggle.setAttribute(
            "aria-label",
            `BSB: Berean Standard Bible wording of ${bookName} ${row.chapter}:${row.verse}`,
        );
        toggle.innerHTML = `<span aria-hidden="true">BSB</span>${BSB_CHEVRON}`;
        toggle.addEventListener("click", () => this.#toggleBsb(card, row));
        line.append(toggle, words);
        card.classList.add("has-bsb");
        card.append(line);
    }

    /** Show or hide a card's BSB wording, fetching its chapter the first time. */
    async #toggleBsb(card, row, open = !card.classList.contains("bsb-open")) {
        const line = card.querySelector(".bsb");
        if (!line) {
            return;
        }
        const toggle = line.querySelector(".bsb-toggle");
        const words = line.querySelector(".bsb-words");
        card.classList.toggle("bsb-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        words.hidden = !open;
        // Loading or loaded already.
        if (!open || words.dataset.state) {
            return;
        }
        words.dataset.state = "loading";
        words.replaceChildren(bsbMessage("Loading…"));
        try {
            const url = new URL(
                `${encodeURIComponent(row.book_id)}/${Number(row.chapter)}.json`,
                this.#annotationsBase,
            ).href;
            const bsb = (await loadChapterFile(url))[String(row.verse)]
                ?.translations?.bsb;
            if (!bsb?.text) {
                // The BSB leaves out a few verses (Matthew 17:21, …): the pill
                // goes, and there is nothing to show.
                if (this.#root.activeElement === toggle) {
                    card.closest(".reader")?.focus();
                }
                card.classList.remove("has-bsb", "bsb-open");
                line.remove();
                return;
            }
            words.dataset.state = "loaded";
            const nodes = [];
            if (bsb.title) {
                const title = document.createElement("span");
                title.className = "bsb-title";
                title.textContent = bsb.title;
                nodes.push(title, " ");
            }
            nodes.push(bsb.text);
            words.replaceChildren(...nodes);
        } catch (error) {
            delete words.dataset.state;
            console.warn("BSB wording unavailable:", error);
            words.replaceChildren(
                bsbMessage("The BSB wording could not be loaded. Please try again."),
            );
        }
    }

    #createExplainButton(bookName, row) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "explain";
        button.title = "Explanation";
        button.setAttribute("aria-haspopup", "dialog");
        button.setAttribute(
            "aria-label",
            `Explanation of ${bookName} ${row.chapter}:${row.verse}`,
        );
        button.addEventListener("click", () =>
            this.#openExplanation(bookName, row),
        );
        return button;
    }

    #showExplanationMessage(message) {
        const paragraph = document.createElement("p");
        paragraph.className = "message";
        paragraph.textContent = message;
        this.#explanation
            .querySelector(".explanation-body")
            .replaceChildren(paragraph);
        this.#explanation.querySelector(".explanation-source").hidden = true;
    }

    async #openExplanation(bookName, row) {
        const request = ++this.#explanationRequest;
        const dialog = this.#explanation;
        const symbol = dialog.querySelector(".book-symbol");
        symbol.hidden = false;
        symbol.src = bookSymbolUrl(this.#mediaBase, bookName);
        dialog.querySelector(
            "#explanation-title .visually-hidden",
        ).textContent =
            `Explanation of ${bookName} ${row.chapter}:${row.verse}`;
        dialog.querySelector(".explanation-book").textContent = bookName;
        dialog.querySelector(".chapter-number").textContent = `${row.chapter}:`;
        dialog.querySelector(".verse-number").textContent = row.verse;
        this.#showExplanationMessage("Loading explanation…");
        dialog.querySelector(".interlinear").hidden = true;

        if (!dialog.open) {
            dialog.showModal();
            this.setAttribute("explaining", "");
            if (!reducedMotion.matches) {
                popDialog(dialog, "open");
            }
        }
        dialog.scrollTop = 0;

        try {
            const url = new URL(
                `${encodeURIComponent(row.book_id)}/${Number(row.chapter)}.json`,
                this.#annotationsBase,
            ).href;
            const annotations = (await loadChapterFile(url))[
                String(row.verse)
            ];
            if (request !== this.#explanationRequest) {
                return;
            }
            const entry = annotations?.explanation;
            if (entry?.text) {
                const paragraphs = entry.text
                    .split(/\n{2,}/)
                    .map((block) => explanationParagraph(block, row.text));
                paragraphs.forEach(linkScripture);
                dialog
                    .querySelector(".explanation-body")
                    .replaceChildren(...paragraphs);
                const source = dialog.querySelector(".explanation-source");
                source.textContent = `From ${EXPLANATION_SOURCES[entry.source] ?? entry.source}`;
                source.hidden = false;
            } else {
                this.#showExplanationMessage(
                    "There is no explanation for this verse yet.",
                );
            }
            await this.#showInterlinear(row, request);
        } catch (error) {
            if (request !== this.#explanationRequest) {
                return;
            }
            console.warn(
                `Explanation unavailable for ${bookName} ${row.chapter}:${row.verse}:`,
                error,
            );
            this.#showExplanationMessage(
                "The explanation could not be loaded. Please try again.",
            );
        }
    }

    /**
     * Lay out the verse word by word in the Hebrew or Greek. A chapter file
     * that fails to load leaves the interlinear hidden, not the explanation.
     */
    async #showInterlinear(row, request) {
        const section = this.#explanation.querySelector(".interlinear");
        const list = section.querySelector(".il-words");
        const panel = section.querySelector(".il-entry");
        panel.hidden = true;
        panel.replaceChildren();
        const url = new URL(
            `${encodeURIComponent(row.book_id)}/${Number(row.chapter)}.json`,
            this.#interlinearBase,
        ).href;
        let chapter;
        try {
            chapter = await loadChapterFile(url);
        } catch (error) {
            console.warn("Interlinear unavailable:", error);
            return;
        }
        const words = chapter.verses?.[String(row.verse)];
        if (request !== this.#explanationRequest || !words?.length) {
            return;
        }
        const lang = chapter.lang === "he" ? "he" : "grc";
        section.querySelector(".interlinear-hint").textContent = interlinearHint(
            lang,
            words,
        );
        list.dir = lang === "he" ? "rtl" : "ltr";
        section.querySelector(".il-reading span").textContent = words
            .map((word) => word[2])
            .filter(Boolean)
            .join(" · ");
        list.replaceChildren(
            ...words.map((word) => {
                const item = document.createElement("li");
                item.append(this.#interlinearWord(word, word[5] ?? lang));
                return item;
            }),
        );
        section.hidden = false;
    }

    /** One word: a button opening its Strong's entry, or plain without a number. */
    #interlinearWord([orig, xlit, gloss, strongs, grammar], lang) {
        // lang: "he", "arc" (Aramaic) or "grc".
        const word = document.createElement(strongs ? "button" : "span");
        word.className = "il-word";
        const part = (className, text) => {
            const node = document.createElement("span");
            node.className = className;
            node.textContent = text;
            return node;
        };
        const original = part("il-orig", orig);
        original.lang = lang;
        original.dir = lang === "grc" ? "ltr" : "rtl";
        word.append(
            part("il-num", strongs),
            part("il-xlit", xlit),
            original,
            part("il-gloss", gloss),
            part("il-grammar", grammar),
        );
        if (!strongs) {
            return word;
        }
        word.type = "button";
        word.setAttribute("aria-expanded", "false");
        word.setAttribute("aria-controls", "interlinear-entry");
        word.addEventListener("click", () =>
            this.#toggleStrongsEntry(word, strongs),
        );
        return word;
    }

    /** Open (or close) the dictionary entry for one word's Strong's number. */
    async #toggleStrongsEntry(word, number) {
        const section = this.#explanation.querySelector(".interlinear");
        const panel = section.querySelector(".il-entry");
        const opening = word.getAttribute("aria-expanded") !== "true";
        for (const other of section.querySelectorAll(
            '.il-word[aria-expanded="true"]',
        )) {
            other.setAttribute("aria-expanded", "false");
        }
        if (!opening) {
            panel.hidden = true;
            return;
        }
        word.setAttribute("aria-expanded", "true");
        // A dictionary file that fails to load shows a note in the panel.
        const entry = await loadStrongsEntry(number, this.#strongsBase).catch(
            () => null,
        );
        if (word.getAttribute("aria-expanded") !== "true") {
            return;
        }
        panel.replaceChildren(strongsEntryNode(number, entry));
        panel.hidden = false;
        panel.scrollIntoView({
            block: "nearest",
            behavior: reducedMotion.matches ? "auto" : "smooth",
        });
    }

    async #closeExplanation() {
        const dialog = this.#explanation;
        if (!dialog.open || this.#explanationClosing) {
            return;
        }
        this.#explanationClosing = true;
        this.#explanationRequest++;
        if (!reducedMotion.matches) {
            await popDialog(dialog, "close");
        }
        dialog
            .getAnimations({ subtree: true })
            .forEach((animation) => animation.cancel());
        dialog.close();
        this.#explanationClosing = false;
    }

    /** view: { words } for keyword results and { bookmarks: true } for bookmarks, which may span many books. */
    #renderVerses(rows, generation, view = {}, redLetters = {}) {
        const keywords = view.words?.length ? view.words : null;
        const mixed = Boolean(keywords || view.bookmarks);
        const bookName = rows[0].book_name;
        const batchSize = this.#batchSize;
        const header = view.bookmarks
            ? this.#createBookmarksHeader(rows)
            : keywords
              ? this.#createKeywordHeader(rows, keywords)
              : this.#createBookHeader(bookName, generation);
        // Keywords carry a straight apostrophe; the KJV text a curly one (brother’s).
        const highlight =
            keywords &&
            new RegExp(
                `\\b(${keywords.map((word) => escapeRegExp(word).replace(/'/g, "['’]")).join("|")})\\b`,
                "gi",
            );
        const heading = view.bookmarks
            ? "Bookmarked verses"
            : keywords
              ? `Verses with ${keywords.join(", ")}`
              : bookName;
        const summary = document.createElement("p");
        summary.className = "summary";

        const reader = document.createElement("div");
        reader.className = "reader";
        reader.tabIndex = 0;
        reader.setAttribute("role", "region");
        reader.setAttribute(
            "aria-label",
            `${mixed ? heading : `${bookName} verses`}, scroll to read more`,
        );
        const list = document.createElement("div");
        list.className = "verse-list";
        list.setAttribute("role", "list");
        list.setAttribute("aria-labelledby", "book-title");
        const more = document.createElement("button");
        more.type = "button";
        more.className = "load-more";
        more.textContent = "Load more verses";
        const end = document.createElement("p");
        end.className = "end";
        end.textContent = "End of results";
        end.hidden = true;
        reader.append(list, more, end);
        this.#content.replaceChildren(header, summary, reader);

        let shown = 0;
        const appendBatch = () => {
            if (generation !== this.#generation || shown >= rows.length) {
                return;
            }
            const fragment = document.createDocumentFragment();
            const next = Math.min(shown + batchSize, rows.length);
            const saved = new Set(readBookmarks());
            for (let index = shown; index < next; index++) {
                fragment.append(
                    this.#createVerseCard(rows[index].book_name, rows[index], {
                        highlight,
                        mixed,
                        redLetters,
                        saved,
                    }),
                );
            }
            list.append(fragment);
            shown = next;
            summary.textContent = `${rows.length.toLocaleString()} verse${rows.length === 1 ? "" : "s"} found · ${shown.toLocaleString()} shown`;
            this.#status.textContent = `${heading}. ${summary.textContent}`;
            if (shown === rows.length) {
                this.#observer?.disconnect();
                end.hidden = false;
                // Preserve focus when the final batch is requested from the keyboard.
                if (this.#root.activeElement === more) {
                    more.textContent = "All verses loaded";
                    more.setAttribute("aria-disabled", "true");
                    more.addEventListener(
                        "blur",
                        () => {
                            more.hidden = true;
                        },
                        { once: true },
                    );
                } else {
                    more.hidden = true;
                }
            } else if (this.#observer) {
                // Re-observe after layout so a very tall viewport can fill another batch.
                this.#observer.unobserve(more);
                this.#observer.observe(more);
            }
        };

        more.addEventListener("click", appendBatch);
        appendBatch();
        if (shown < rows.length && "IntersectionObserver" in window) {
            this.#observer = new IntersectionObserver(
                (entries) => {
                    if (entries.some((entry) => entry.isIntersecting)) {
                        appendBatch();
                    }
                },
                { root: reader, rootMargin: "0px 0px 240px 0px" },
            );
            this.#observer.observe(more);
        }
    }
}

if (!customElements.get("bible-search-results")) {
    customElements.define("bible-search-results", BibleSearchResults);
}
