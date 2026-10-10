/**
 * Bible references as pills: small thin-bordered buttons that open the passage.
 *
 * linkScripture(root) finds the references in the text under root and puts
 * each one in a pill. It knows the shapes the site's data and commentaries
 * use: "John 3:16", "Luke 15:11-32", "Genesis 1:1-2:3", "Psalm 23",
 * "Hebrews 3–4", "Jude 14", lists such as "(Isaiah 53:6; John 10:11)" and
 * "Genesis 12; 20", and the commentaries' abbreviations ("Gen 1:1", "Pro 8:22",
 * "Co1 15:22", "1Ch. 1:1"). Brackets holding nothing but references are
 * dropped, since the pill already sets the reference apart. A pill keeps the
 * words of the source; its title gives the reference in full.
 *
 * Text inside links, buttons, <summary>, headings and <blockquote> (the verses
 * themselves; a <cite> in one is linked) is left alone, as is anything under
 * [data-no-scripture].
 *
 * A tap on a pill fires verse-request on it (bubbles, composed, cancelable;
 * detail: { reference, label }). Unless a listener cancels it, the passage
 * opens in the shared popup, <verse-popup> (verse-popup.js), on any page.
 *
 * Usage
 *   import { PILL_STYLES, linkScripture, refPill, watchScripture }
 *     from './scripture-refs.js?v=…';
 *   shadowRoot.innerHTML = `<style>${PILL_STYLES}</style>…`;   // in a component
 *   linkScripture(paragraph);        // the references in rendered text
 *   container.append(refPill('Genesis 1:1'));   // a field that is one reference
 *   watchScripture(document.body);   // every reference rendered from now on
 *
 * Static pages mark their text with data-scripture; it is linked when this
 * module loads. Light-DOM pills get PILL_STYLES in the document's <head>.
 *
 * CSS custom properties (on the pill or any ancestor)
 *   --scripture-ref-color   text and border colour. Default: the text's own
 *   --scripture-ref-hover   background on hover. Default: a tint of the colour
 *
 * Every importer uses the same ?v= token, so a page loads one copy of this
 * module (and of the popup it opens); bump them all together.
 */

const POPUP_MODULE = './verse-popup.js?v=20261002-1';

// [name, chapters, ...abbreviations]. The names, "Psalm" and "Song of Songs"
// may be cited by chapter alone ("Psalm 23"); an abbreviation only counts with
// a verse ("Pro 8:22"), so words such as "Job" or "Mark" before a number in
// the commentaries are not mistaken for a book's abbreviation. The
// abbreviations are the ones in the commentaries (assets/explanations): the
// short forms of dailygrace.db's book ids, the three-letter ones ("Co1"), the
// JFB headings' ("1Ch.") and Gill's ("De").
const BOOKS = [
  ['Genesis', 50, 'Gen', 'Ge'],
  ['Exodus', 40, 'Exod', 'Exo', 'Ex'],
  ['Leviticus', 27, 'Lev', 'Le'],
  ['Numbers', 36, 'Num', 'Nu'],
  ['Deuteronomy', 34, 'Deut', 'Deu', 'De'],
  ['Joshua', 24, 'Josh', 'Jos'],
  ['Judges', 21, 'Judg', 'Jdg'],
  ['Ruth', 4, 'Rut', 'Rth'],
  ['1 Samuel', 31, '1Sam', '1Sa', 'Sa1'],
  ['2 Samuel', 24, '2Sam', '2Sa', 'Sa2'],
  ['1 Kings', 22, '1Kgs', '1Ki', 'Kg1'],
  ['2 Kings', 25, '2Kgs', '2Ki', 'Kg2'],
  ['1 Chronicles', 29, '1Chr', '1Ch', 'Ch1'],
  ['2 Chronicles', 36, '2Chr', '2Ch', 'Ch2'],
  ['Ezra', 10, 'Ezr'],
  ['Nehemiah', 13, 'Neh'],
  ['Esther', 10, 'Esth', 'Est'],
  ['Job', 42],
  ['Psalms', 150, 'Ps', 'Psa'],
  ['Proverbs', 31, 'Prov', 'Pro'],
  ['Ecclesiastes', 12, 'Eccl', 'Ecc'],
  ['Song of Solomon', 8, 'Song', 'Sol', 'Son'],
  ['Isaiah', 66, 'Isa'],
  ['Jeremiah', 52, 'Jer'],
  ['Lamentations', 5, 'Lam'],
  ['Ezekiel', 48, 'Ezek', 'Eze'],
  ['Daniel', 12, 'Dan'],
  ['Hosea', 14, 'Hos'],
  ['Joel', 3, 'Joe'],
  ['Amos', 9, 'Amo'],
  ['Obadiah', 1, 'Obad', 'Oba'],
  ['Jonah', 4, 'Jon'],
  ['Micah', 7, 'Mic'],
  ['Nahum', 3, 'Nah'],
  ['Habakkuk', 3, 'Hab'],
  ['Zephaniah', 3, 'Zeph', 'Zep'],
  ['Haggai', 2, 'Hag'],
  ['Zechariah', 14, 'Zech', 'Zec', 'Zac'],
  ['Malachi', 4, 'Mal'],
  ['Matthew', 28, 'Matt', 'Mat'],
  ['Mark', 16, 'Mar'],
  ['Luke', 24, 'Luk'],
  ['John', 21, 'Joh'],
  ['Acts', 28, 'Act'],
  ['Romans', 16, 'Rom'],
  ['1 Corinthians', 16, '1Cor', '1Co', 'Co1'],
  ['2 Corinthians', 13, '2Cor', '2Co', 'Co2'],
  ['Galatians', 6, 'Gal'],
  ['Ephesians', 6, 'Eph'],
  ['Philippians', 4, 'Phil', 'Phi'],
  ['Colossians', 4, 'Col'],
  ['1 Thessalonians', 5, '1Thess', '1Th', 'Th1'],
  ['2 Thessalonians', 3, '2Thess', '2Th', 'Th2'],
  ['1 Timothy', 6, '1Tim', '1Ti', 'Ti1'],
  ['2 Timothy', 4, '2Tim', '2Ti', 'Ti2'],
  ['Titus', 3, 'Tit'],
  ['Philemon', 1, 'Phlm', 'Phm', 'Plm'],
  ['Hebrews', 13, 'Heb'],
  ['James', 5, 'Jas', 'Jam'],
  ['1 Peter', 5, '1Pet', '1Pe', 'Pe1'],
  ['2 Peter', 3, '2Pet', '2Pe', 'Pe2'],
  ['1 John', 5, '1John', '1Jo', 'Jo1'],
  ['2 John', 1, '2John', '2Jo', 'Jo2'],
  ['3 John', 1, '3John', '3Jo', 'Jo3'],
  ['Jude', 1, 'Jde'],
  ['Revelation', 22, 'Rev'],
];
// Other names a book is cited by in full, so also by chapter alone.
const FULL_NAMES = { Psalm: 'Psalms', 'Song of Songs': 'Song of Solomon' };

// alias -> { name, chapters, full }
const ALIASES = new Map();
for (const [name, chapters, ...short] of BOOKS) {
  ALIASES.set(name, { name, chapters, full: true });
  for (const alias of short) ALIASES.set(alias, { name, chapters, full: false });
}
for (const [alias, name] of Object.entries(FULL_NAMES)) {
  ALIASES.set(alias, { ...ALIASES.get(name), full: true });
}

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Longest first, so "1 John" wins over "John" and "Psalms" over "Psalm".
const BOOK = [...ALIASES.keys()].sort((a, b) => b.length - a.length)
  .map((alias) => escape(alias).replace(/ /g, '[ \\u00a0]')).join('|');

const NUM = '\\d{1,3}(?!\\d)';
const VERSE = `${NUM}[ab]?`;
const DASH = '\\s*[-–—]\\s*';
// 16 | 16-18 | 16-4:2 (on into the next chapter)
const VERSES = `${VERSE}(?:${DASH}(?:${NUM}\\s*:\\s*)?${VERSE})?`;
// 3 | 3-4 | 3:16 | 3:16-18 | 3:16, 18-20. After a comma, "4:2" starts a new
// reference, and so does "2 Kings": a number before a capital is a book's.
const PLACE = `${NUM}(?:\\s*:\\s*${VERSES}(?:\\s*,\\s*${VERSES}(?!\\s*:|\\s*\\p{Lu}))*|${DASH}${NUM}(?!\\s*:))?`;
// What may not follow a reference: more of a word or number ("Romans 2,000",
// "John 3:16.5"; but "1:1,2:3" is two places), or, after a bare chapter, a
// count ("Ruth 4 chapters").
const AFTER = '(?![\\p{L}\\p{N}]|[.:]\\d|,\\d+(?!\\d|\\s*:))';
const COUNT_WORDS = /^\s*(?:chapters?|verses?|books?|times|years?|days?|months?|weeks?|men|women|people|sons|psalms)\b/i;

const REFERENCE = new RegExp(`(?<![\\p{L}\\p{N}])(${BOOK})(\\.?)[ \\u00a0]+(${PLACE})${AFTER}`, 'gu');
// "; 20" or ", 4:2" after a reference: the same book again.
const MORE = new RegExp(`(\\s*[;,]\\s*)(${PLACE})${AFTER}`, 'yu');

/**
 * The passages a place in a book stands for, as [chapter, verse, chapter, verse]
 * ranges (verse Infinity: to the end of the chapter), or null when it does not
 * fit the book. "14" in a one-chapter book is a verse ("Jude 14").
 */
function placeRanges(place, book) {
  const text = place.replace(/[–—]/g, '-').replace(/\s+/g, '');
  const ranges = [];
  if (!text.includes(':')) {
    const [first, last = first] = text.split('-').map(Number);
    if (book.chapters === 1) ranges.push([1, first, 1, last]);
    else ranges.push([first, 1, last, Infinity]);
  } else {
    const [chapterText, list] = text.split(/:(.*)/s);
    const chapter = Number(chapterText);
    for (const item of list.split(',')) {
      const [from, to = from] = item.split('-');
      const start = parseInt(from, 10);
      if (to.includes(':')) {
        const [endChapter, endVerse] = to.split(':').map((n) => parseInt(n, 10));
        ranges.push([chapter, start, endChapter, endVerse]);
      } else {
        ranges.push([chapter, start, chapter, parseInt(to, 10)]);
      }
    }
  }
  const fits = ranges.every(([c1, v1, c2, v2]) =>
    c1 >= 1 && c2 <= book.chapters && v1 >= 1
    && (c2 > c1 || (c2 === c1 && v2 >= v1)));
  return fits ? ranges : null;
}

/** A reference written in full: "1 Corinthians 15:22", "Psalm 23", "Psalms 3-4". */
function fullReference(book, place) {
  const tidy = place.replace(/[–—]/g, '-').replace(/\s+/g, ' ')
    .replace(/\s*([:,-])\s*/g, (m, p) => (p === ',' ? ', ' : p));
  const name = book.name === 'Psalms' && /^\d+(?::|$)/.test(tidy) ? 'Psalm' : book.name;
  return `${name} ${tidy}`;
}

/**
 * The references in a string, in order:
 * [{ start, end, label, reference, book, ranges }], where label is the text as
 * written and reference the same place in full ("Genesis 20" for the "20" of
 * "Genesis 12; 20").
 */
export function findReferences(text) {
  const found = [];
  REFERENCE.lastIndex = 0;
  let match;
  while ((match = REFERENCE.exec(text))) {
    const [whole, alias, , place] = match;
    const book = ALIASES.get(alias.replace(/ /g, ' '));
    const bare = !place.includes(':');
    // An abbreviation needs a verse, and a bare chapter is not a count.
    const after = text.slice(match.index + whole.length);
    const ranges = (!bare || (book.full && !COUNT_WORDS.test(after))) && placeRanges(place, book);
    if (!ranges) {
      REFERENCE.lastIndex = match.index + alias.length;
      continue;
    }
    found.push({
      start: match.index, end: match.index + whole.length, label: whole,
      reference: fullReference(book, place), book: book.name, ranges,
    });
    // More places in the same book, after a semicolon or comma. A bare
    // chapter only counts at the end of the list: "(Genesis 12; 20)".
    MORE.lastIndex = match.index + whole.length;
    let more;
    while ((more = MORE.exec(text))) {
      const [all, gap, nextPlace] = more;
      const rest = text.slice(more.index + all.length);
      if (!nextPlace.includes(':') && !/^\s*(?:[);]|$)/.test(rest)) break;
      const nextRanges = placeRanges(nextPlace, book);
      if (!nextRanges) break;
      const start = more.index + gap.length;
      found.push({
        start, end: start + nextPlace.length, label: nextPlace,
        reference: fullReference(book, nextPlace), book: book.name, ranges: nextRanges,
      });
      REFERENCE.lastIndex = MORE.lastIndex;
    }
  }
  return found;
}

/**
 * One reference written in full, as a pill's data-reference holds it:
 * { book, ranges }, or null when it is not a reference.
 */
export function parseReference(text) {
  const [first] = findReferences(String(text ?? '').trim());
  return first && first.start === 0 ? { book: first.book, ranges: first.ranges } : null;
}

// ------------------------------------------------------------------ pills

export const PILL_STYLES = /* css */ `
  .scripture-ref {
    --_color: var(--scripture-ref-color, currentColor);
    position: relative;
    display: inline-block;
    margin: 0 .08em;
    padding: .1em .6em;
    border: 1px solid rgb(127 127 127 / 45%);
    border: 1px solid color-mix(in srgb, var(--_color) 42%, transparent);
    border-radius: 999px;
    background: transparent;
    color: var(--_color);
    font: inherit;
    font-size: .88em;
    line-height: 1.25;
    letter-spacing: inherit;
    text-transform: inherit;
    text-decoration: none;
    vertical-align: baseline;
    white-space: nowrap;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background-color .15s ease, border-color .15s ease;
  }
  /* A hairline on screens that can draw one. */
  @media (min-resolution: 2dppx) {
    .scripture-ref {
      border-width: .5px;
      border-color: color-mix(in srgb, var(--_color) 60%, transparent);
    }
  }
  /* A larger target for a finger than the pill shows. */
  .scripture-ref::after { content: ""; position: absolute; inset: -6px -3px; }
  .scripture-ref:hover {
    border-color: var(--_color);
    background: var(--scripture-ref-hover, color-mix(in srgb, var(--_color) 10%, transparent));
  }
  .scripture-ref:focus-visible { outline: 2px solid var(--_color); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .scripture-ref { transition: none; } }
`;

function requestPassage(event) {
  const pill = event.currentTarget;
  pill.dispatchEvent(new CustomEvent('verse-request', {
    bubbles: true,
    composed: true,
    cancelable: true,
    detail: { reference: pill.dataset.reference, label: pill.textContent },
  }));
}

function pill(label, reference) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'scripture-ref';
  button.dataset.reference = reference;
  button.textContent = label.replace(/\s+/g, ' ');
  button.title = reference;
  button.setAttribute('aria-label', `Read ${reference}`);
  button.setAttribute('aria-haspopup', 'dialog');
  button.addEventListener('click', requestPassage);
  return button;
}

/**
 * A field that holds references and nothing else ("Genesis 1:1",
 * "Matthew 5:3-12; Luke 6:20"), as pills. Text that is not a reference is
 * kept as it is, so a field that holds none comes back as plain text.
 */
export function refPill(text) {
  const fragment = document.createDocumentFragment();
  appendLinked(fragment, String(text ?? ''));
  return fragment;
}

// Brackets around nothing but references: "(Isaiah 53:6; John 10:11)".
const ONLY_REFERENCES_BETWEEN = /^[\s;,]*$/;

function appendLinked(parent, text, found = findReferences(text)) {
  // Group the references that follow one another with only ; or , between.
  const groups = [];
  for (const ref of found) {
    const last = groups.at(-1);
    if (last && ONLY_REFERENCES_BETWEEN.test(text.slice(last.at(-1).end, ref.start))) last.push(ref);
    else groups.push([ref]);
  }
  let position = 0;
  for (const group of groups) {
    let before = text.slice(position, group[0].start);
    let afterStart = group.at(-1).end;
    if (/\(\s*$/.test(before) && /^\s*\)/.test(text.slice(afterStart))) {
      before = before.replace(/\s*\(\s*$/, before.trim().length > 1 ? ' ' : '');
      afterStart = text.indexOf(')', afterStart) + 1;
    }
    if (before) parent.append(before);
    group.forEach((ref, i) => {
      if (i > 0) parent.append(text.slice(group[i - 1].end, ref.start));
      parent.append(pill(ref.label, ref.reference));
    });
    position = afterStart;
  }
  if (position < text.length) parent.append(text.slice(position));
}

const SKIP = [
  'a', 'button', 'summary', 'select', 'option', 'textarea', 'input',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'script', 'style', 'code', 'pre', 'svg',
  '[data-no-scripture]', '.scripture-ref',
].join(',');

/** Whether text in this element stays as it is. */
function skipped(element) {
  if (!element || element.closest(SKIP)) return true;
  // A quotation's own words are left alone; its source, in a <cite>, is not.
  return Boolean(element.closest('blockquote')) && !element.closest('cite');
}

function ensureDocumentStyles(root) {
  const owner = root.getRootNode?.() ?? document;
  if (!(owner instanceof Document) || owner.getElementById('scripture-ref-styles')) return;
  const style = owner.createElement('style');
  style.id = 'scripture-ref-styles';
  style.textContent = PILL_STYLES;
  owner.head.prepend(style);
}

/** Put the references in the text under root (an element or fragment) in pills. */
export function linkScripture(root) {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) {
    linkTextNode(root);
    return;
  }
  ensureDocumentStyles(root);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (/\d/.test(node.data) && !skipped(node.parentElement)
      ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(linkTextNode);
}

function linkTextNode(node) {
  if (skipped(node.parentElement)) return;
  const found = findReferences(node.data);
  if (!found.length) return;
  const fragment = document.createDocumentFragment();
  appendLinked(fragment, node.data, found);
  node.replaceWith(fragment);
}

/**
 * Link the references under root now and in everything added to it later,
 * which is how the study pages, rendered from JSON, get their pills.
 */
export function watchScripture(root) {
  linkScripture(root);
  const observer = new MutationObserver((records) => {
    // Pause while linking, so the pills going in are not seen as new content.
    observer.disconnect();
    for (const record of records) {
      if (record.type === 'characterData') linkScripture(record.target);
      for (const node of record.addedNodes) {
        if (node.isConnected && (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE)) {
          linkScripture(node);
        }
      }
    }
    observer.observe(root, OBSERVE);
  });
  const OBSERVE = { childList: true, subtree: true, characterData: true };
  observer.observe(root, OBSERVE);
  return observer;
}

// ------------------------------------------------------------------ the popup

// One listener per page, however many copies of this module load.
const LISTENING = Symbol.for('dailygrace.verse-request');
if (!document[LISTENING]) {
  document[LISTENING] = true;
  document.addEventListener('verse-request', (event) => {
    const reference = event.detail?.reference;
    if (event.defaultPrevented || !reference) return;
    import(POPUP_MODULE)
      .then(({ showPassage }) => showPassage(reference))
      .catch((error) => console.error(`Unable to open ${reference}:`, error));
  });
}

// Static text marked for linking (the mission statement).
function linkMarked() {
  document.querySelectorAll('[data-scripture]').forEach(linkScripture);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', linkMarked, { once: true });
else linkMarked();
