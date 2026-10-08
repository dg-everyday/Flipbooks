/**
 * Did You Know — drives did-you-know.html.
 *
 * Every fact of the "Did you know?" card on the home page, book by book: the
 * did_you_know table of assets/db/didyouknow.db, read through sql.js
 * (sqlite-db.js) like the card itself. The books sit in their groups (the Law,
 * History, … Prophecy, as on Books of the Bible), and each book opens to the
 * questions its facts answer; a question opens to its fact, its reference,
 * the books it links to and a Bookmark button. A book's facts are drawn the
 * first time it opens.
 *
 * #fact-12 in the URL opens that fact, and #genesis opens Genesis; opening a
 * fact puts its #fact-… in the URL, so it can be shared.
 *
 * Holding a question for half a second bookmarks the fact, as on the home
 * page (card-bookmarks.js). The bookmarks are the ones the home page's card
 * keeps (the same localStorage key), so they show in its bookmarks popup and
 * its PDF.
 */

import { h, followHash, filterMenu, scrollUnderTopbar } from './study-utils.js?v=20261003-1';
import { openDatabase, query } from '../../../assets/scripts/sqlite-db.js';
import {
  BOOKMARK_STYLES, CardHold, bookmarkNote, bookmarkStore, showBookmarkResult,
} from '../../components/card-bookmarks.js?v=20260927-1';
import { BOOK_THUMB_BOUNDS, DEFAULT_THUMB_BOUNDS } from '../../components/book-thumb-bounds.js';
import { MEDIA_BASE_URL } from '../../settings/settings.js?v=20261009-1';

// The same URL, token and all, as <did-you-know> and <bible-trivia>, so the
// browser keeps one copy. It is fetched with force-cache: keep the token in
// step with theirs whenever the rows change.
const DATABASE = new URL('../../../assets/db/didyouknow.db?v=20260929-2', import.meta.url).href;
const FACTS_QUERY = 'SELECT id, Title, Fact, Reference_verse, Book, Similar_books FROM did_you_know ORDER BY id';

// The same store as <did-you-know> on the home page.
const bookmarks = bookmarkStore('dailygrace:bookmarks:facts', { isId: Number.isSafeInteger, limit: 50 });

// The book thumbnails of the home page's cards, framed the same way.
const MEDIA_BASE = MEDIA_BASE_URL;
const THUMBNAIL_TRIM = 0.985;

const RIBBON_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>';

// The groups of Books of the Bible (assets/bible-books.json), in order.
const GROUPS = [
  { id: 'law', name: 'The Law', testament: 'Old',
    books: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'] },
  { id: 'history', name: 'History', testament: 'Old',
    books: ['Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
      '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther'] },
  { id: 'poetry', name: 'Poetry and Wisdom', testament: 'Old',
    books: ['Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon'] },
  { id: 'major-prophets', name: 'Major Prophets', testament: 'Old',
    books: ['Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel'] },
  { id: 'minor-prophets', name: 'Minor Prophets', testament: 'Old',
    books: ['Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
      'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'] },
  { id: 'gospels', name: 'The Gospels', testament: 'New',
    books: ['Matthew', 'Mark', 'Luke', 'John'] },
  { id: 'church-history', name: 'Church History', testament: 'New', books: ['Acts'] },
  { id: 'pauline-epistles', name: "Paul's Letters", testament: 'New',
    books: ['Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
      'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon'] },
  { id: 'general-epistles', name: 'General Letters', testament: 'New',
    books: ['Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude'] },
  { id: 'prophecy', name: 'Prophecy', testament: 'New', books: ['Revelation'] },
];

// The id Books of the Bible gives a book: "1 Samuel" is #1-samuel.
const bookId = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const BOOK_IDS = new Map(GROUPS.flatMap(g => g.books.map(b => [bookId(b), b])));
const factCount = n => `${n} ${n === 1 ? 'fact' : 'facts'}`;

/** Every fact in the database, oldest first, and the database closed again. */
async function readFacts() {
  const database = await openDatabase(DATABASE);
  try {
    return query(database, FACTS_QUERY).map(row => ({
      id: row.id,
      title: String(row.Title ?? '').trim(),
      fact: String(row.Fact ?? '').trim(),
      reference: String(row.Reference_verse ?? '').trim(),
      book: String(row.Book ?? '').trim(),
      similar: String(row.Similar_books ?? '').split(',').map(b => b.trim()).filter(Boolean),
    }));
  } finally {
    database.close();
  }
}

// ------------------------------------------------------------------ parts

function thumbnail(book) {
  const frame = h('span', { class: 'dyk-thumb', 'aria-hidden': 'true' });
  const image = h('img', {
    alt: '', loading: 'lazy', decoding: 'async',
    src: `${MEDIA_BASE}images/thumbnails/${encodeURIComponent(book)}_square.webp`,
  });
  image.onerror = () => { frame.style.visibility = 'hidden'; };
  const [x, y, size, radius] = BOOK_THUMB_BOUNDS[book] ?? DEFAULT_THUMB_BOUNDS;
  const side = size * THUMBNAIL_TRIM;
  const inset = (size - side) / 2;
  image.style.width = `${100 / side}%`;
  image.style.height = `${100 / side}%`;
  image.style.left = `${(-(x + inset) / side) * 100}%`;
  image.style.top = `${(-(y + inset) / side) * 100}%`;
  frame.style.borderRadius = `${radius * 100}%`;
  frame.append(image);
  return frame;
}

// The open fact's Bookmark button: pressed while the fact is bookmarked.
function bookmarkButton(fact, onToggle) {
  const button = h('button', {
    type: 'button', class: 'dyk-bookmark', 'data-id': fact.id, onclick: () => onToggle(fact)
  });
  button.innerHTML = RIBBON_ICON;          // a fixed string, never data
  button.append(h('span', {}));
  syncBookmarkButton(button);
  return button;
}

function syncBookmarkButton(button) {
  const saved = bookmarks.has(Number(button.dataset.id));
  button.setAttribute('aria-pressed', String(saved));
  button.querySelector('span').textContent = saved ? 'Bookmarked' : 'Bookmark';
  button.title = saved ? 'Remove the bookmark' : 'Bookmark this fact';
}

// The card is a wrapper round the <details>, since the bookmark's glow and
// ribbon are drawn on the card's ::before and ::after.
function factItem(fact) {
  return h('div', {
    class: `dyk-fact bookmarkable${bookmarks.has(fact.id) ? ' bookmarked' : ''}`,
    id: `fact-${fact.id}`, 'data-id': fact.id
  },
    h('details', { class: 'dyk-fact-details' },
      h('summary', {}, h('span', { class: 'dyk-q' }, fact.title)),
      h('div', { class: 'dyk-fact-body' })));
}

/** The open fact: drawn the first time it opens. */
function fillFact(item, fact, onBookmark) {
  const body = item.querySelector('.dyk-fact-body');
  if (body.childElementCount) return;
  const similar = fact.similar.filter(b => BOOK_IDS.has(bookId(b)));
  body.append(
    h('p', { class: 'dyk-text' }, fact.fact),
    fact.reference && h('p', { class: 'dyk-ref' }, fact.reference),
    h('div', { class: 'dyk-foot' },
      similar.length && h('p', { class: 'dyk-similar' }, 'Read more in ',
        similar.map((b, i) => [i ? ', ' : '', h('a', { href: `bible-books.html#${bookId(b)}` }, b)])),
      bookmarkButton(fact, onBookmark)));
}

// ------------------------------------------------------------------ page

export async function start(view) {
  let facts;
  try {
    facts = await readFacts();
  } catch (error) {
    console.error('Unable to load the Bible facts:', error);
    view.replaceChildren(h('p', { class: 'status' },
      'The Bible facts could not be loaded. Please check your connection and try again.'));
    return;
  }

  const byId = new Map(facts.map(f => [f.id, f]));
  const byBook = new Map();
  for (const f of facts) {
    if (!byBook.has(f.book)) byBook.set(f.book, []);
    byBook.get(f.book).push(f);
  }
  const state = { group: 'all', testament: 'all', query: '' };

  // --- bookmarks -------------------------------------------------------------

  // The glow, ribbon and note of a held card, from card-bookmarks.js.
  document.head.append(h('style', {}, BOOKMARK_STYLES));
  const status = h('p', { class: 'visually-hidden', role: 'status', 'aria-atomic': 'true' });

  function toggleBookmark(fact, card = document.getElementById(`fact-${fact.id}`)) {
    const result = bookmarks.toggle(fact.id);
    if (card) showBookmarkResult(card, result, bookmarks.limit);
    status.textContent = `${fact.title} ${bookmarkNote(result, bookmarks.limit)}`;
  }

  // Every fact and the open facts' buttons follow the store, which also
  // changes when another tab bookmarks something.
  bookmarks.addEventListener('change', () => {
    for (const item of view.querySelectorAll('.dyk-fact')) {
      item.classList.toggle('bookmarked', bookmarks.has(Number(item.dataset.id)));
    }
    for (const button of view.querySelectorAll('.dyk-bookmark')) syncBookmarkButton(button);
  });

  // Holding a question bookmarks its fact; the open fact's words can still be
  // pressed to select them.
  new CardHold(view, {
    selector: '.dyk-fact',
    exclude: 'a, button, .dyk-fact-body',
    onHold: (card) => {
      const fact = byId.get(Number(card.dataset.id));
      if (fact) toggleBookmark(fact, card);
    },
  });

  // --- opening ---------------------------------------------------------------

  // A book's facts are drawn the first time it opens, or a search reaches it.
  function fillBook(book) {
    const list = book.querySelector('.dyk-facts');
    if (!list.childElementCount) {
      list.append(...(byBook.get(book.dataset.book) || []).map(factItem));
      applyQuery(book);
    }
  }

  // toggle does not bubble, so it is caught on the way down.
  view.addEventListener('toggle', e => {
    const el = e.target;
    if (el.classList.contains('dyk-book') && el.open) fillBook(el);
    if (!el.classList.contains('dyk-fact-details')) return;
    const card = el.parentElement;
    const hash = `#${card.id}`;
    if (el.open) {
      fillFact(card, byId.get(Number(card.dataset.id)), toggleBookmark);
      if (location.hash !== hash) history.replaceState(null, '', hash);
    } else if (location.hash === hash) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }, true);

  function openFact(id) {
    const fact = byId.get(id);
    if (!fact) return;
    let item = document.getElementById(`fact-${id}`);
    if (!item || item.closest('[hidden]')) {
      resetFilters();
      const book = view.querySelector(`.dyk-book[data-book="${CSS.escape(fact.book)}"]`);
      if (!book) return;
      book.open = true;
      fillBook(book);
      item = document.getElementById(`fact-${id}`);
    }
    item.closest('.dyk-book').open = true;
    item.querySelector('.dyk-fact-details').open = true;
    fillFact(item, fact, toggleBookmark);
    scrollUnderTopbar(item, { smooth: false });
  }

  function openBook(name) {
    const book = view.querySelector(`.dyk-book[data-book="${CSS.escape(name)}"]`);
    if (!book) return;
    if (book.closest('[hidden]')) resetFilters();
    book.open = true;
    fillBook(book);
    scrollUnderTopbar(book, { smooth: false });
  }

  // --- filters ---------------------------------------------------------------

  const haystack = new Map(facts.map(f => [f.id,
    [f.title, f.fact, f.reference].join(' ').toLowerCase()]));
  const matches = new Map(facts.map(f => [f.id, true]));
  // Books a search opened, to close again when the search is cleared.
  const openedBySearch = new Set();

  /** Shows the facts drawn in this book that match the search. */
  function applyQuery(book) {
    for (const item of book.querySelectorAll('.dyk-fact')) {
      item.hidden = !matches.get(Number(item.dataset.id));
    }
  }

  function apply() {
    const q = state.query.trim().toLowerCase();
    for (const f of facts) matches.set(f.id, !q || haystack.get(f.id).includes(q));
    let shown = 0;
    for (const section of view.querySelectorAll('.group-section')) {
      const groupMatch = (state.group === 'all' || section.dataset.group === state.group)
        && (state.testament === 'all' || section.dataset.testament === state.testament);
      let groupShown = 0;
      for (const book of section.querySelectorAll('.dyk-book')) {
        const n = groupMatch
          ? (byBook.get(book.dataset.book) || []).filter(f => matches.get(f.id)).length
          : 0;
        book.hidden = n === 0;
        book.querySelector('.book-count').textContent = q ? `${n} of ${factCount(Number(book.dataset.total))}` : factCount(n);
        if (q && n && !book.open) {
          book.open = true;
          openedBySearch.add(book);
        }
        if (!q && openedBySearch.has(book)) book.open = false;
        if (book.open) fillBook(book);
        applyQuery(book);
        groupShown += n;
      }
      section.hidden = groupShown === 0;
      shown += groupShown;
    }
    if (!q) openedBySearch.clear();
    count.textContent = shown === facts.length ? '' : `Showing ${shown} of ${facts.length} facts`;
    empty.hidden = shown !== 0;
    for (const c of view.querySelectorAll('.chip')) {
      c.setAttribute('aria-pressed', String(state[c.dataset.filter] === c.dataset.value));
    }
  }

  function resetFilters() {
    state.group = 'all';
    state.testament = 'all';
    state.query = '';
    search.value = '';
    apply();
  }

  // --- build the page --------------------------------------------------------

  const search = h('input', {
    type: 'search', class: 'search', autocomplete: 'off',
    placeholder: 'Search a word, name or verse…', 'aria-label': 'Search the Bible facts'
  });
  let searchTimer = 0;
  search.addEventListener('input', () => {
    // A search can open and fill many books; wait for a pause in the typing.
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.query = search.value; apply(); }, 180);
  });

  const chip = (filter, value, label, n, cls) => h('button', {
    type: 'button', class: `chip${cls ? ` ${cls}` : ''}`, 'data-filter': filter, 'data-value': value,
    'aria-pressed': String(state[filter] === value)
  }, label, n != null && h('span', { class: 'chip-count' }, String(n)));

  const inGroup = g => g.books.reduce((n, b) => n + (byBook.get(b)?.length || 0), 0);
  const inTestament = t => GROUPS.filter(g => g.testament === t).reduce((n, g) => n + inGroup(g), 0);
  const chips = h('div', { class: 'chip-rows' },
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Show one Testament' },
      chip('testament', 'all', 'Both Testaments', facts.length),
      chip('testament', 'Old', 'Old Testament', inTestament('Old'), 't-old'),
      chip('testament', 'New', 'New Testament', inTestament('New'), 't-new')),
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Show one group of books' },
      chip('group', 'all', 'Every book'),
      GROUPS.map(g => chip('group', g.id, g.name, inGroup(g), g.testament === 'Old' ? 't-old' : 't-new'))));
  chips.addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c) return;
    state[c.dataset.filter] = c.dataset.value;
    apply();
  });

  const count = h('p', { class: 'result-count', 'aria-live': 'polite' });
  const empty = h('p', { class: 'status', hidden: true }, 'Nothing matches that search.');

  const bookItem = name => {
    const n = byBook.get(name)?.length || 0;
    return h('details', { class: 'dyk-book', id: bookId(name), 'data-book': name, 'data-total': n },
      h('summary', {},
        thumbnail(name),
        h('span', { class: 'book-name' }, name),
        h('span', { class: 'book-count' }, factCount(n))),
      h('div', { class: 'dyk-facts' }));
  };

  const section = g => h('section', {
    class: `panel group-section ${g.testament === 'Old' ? 't-old' : 't-new'}`,
    'data-group': g.id, 'data-testament': g.testament, 'aria-labelledby': `h-${g.id}`
  },
    h('header', { class: 'group-head' },
      h('h2', { id: `h-${g.id}` }, g.name),
      h('p', { class: 'group-count' }, factCount(inGroup(g)))),
    h('div', { class: 'dyk-books' }, g.books.filter(b => byBook.has(b)).map(bookItem)));

  const filters = filterMenu(
    h('ul', { class: 'stats' },
      h('li', {}, h('b', {}, facts.length.toLocaleString()), 'facts'),
      h('li', {}, h('b', {}, String(byBook.size)), 'books')),
    chips);

  view.replaceChildren(
    h('section', { class: 'hero' },
      filters.button,
      h('h1', {}, 'Did You Know?'),
      h('p', { class: 'lede' },
        'Surprising facts from every book of the Bible, each with the verse it comes from. ' +
        'Open a book, then tap a question to read the answer; hold a question for half a ' +
        'second to bookmark it.'),
      h('div', { class: 'finder' }, search),
      filters.menu),
    count,
    ...GROUPS.map(section),
    empty,
    status);

  apply();
  followHash(id => {
    const fact = /^fact-(\d+)$/.exec(id);
    if (fact) openFact(Number(fact[1]));
    else if (BOOK_IDS.has(id)) openBook(BOOK_IDS.get(id));
  });
}
