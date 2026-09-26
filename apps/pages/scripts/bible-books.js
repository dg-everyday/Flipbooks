/**
 * Books of the Bible — drives bible-books.html.
 *
 * Reads assets/bible-books.json (built and verse-checked by
 * tools/books/build_books.py) and shows the 66 books in their groups. Clicking
 * a book opens its details in place, directly below the row it sits in — not
 * a popup — and opening another book closes the first. The open book is kept
 * in the URL hash (#genesis), so it can be linked to and survives a reload.
 */

import { h, fetchJson, para, rowExpander, followHash } from './study-utils.js?v=20260926-2';

const DATA = 'assets/bible-books.json';
const fmt = n => n.toLocaleString('en-US');

// ------------------------------------------------------------------ tiles

function tile(book, maxVerses, onToggle) {
  // The bar compares each book's length with the longest (Psalms).
  const share = Math.max(2, Math.round((book.verses / maxVerses) * 100));
  return h('button', {
    type: 'button', class: 'book-tile', id: `tile-${book.id}`,
    'data-id': book.id, 'aria-expanded': 'false', 'aria-controls': 'book-detail',
    onclick: () => onToggle(book.id)
  },
    h('span', { class: 'book-no' }, String(book.order).padStart(2, '0')),
    h('span', { class: 'book-name' }, book.name),
    h('span', { class: 'book-counts' },
      h('span', {}, h('b', {}, fmt(book.chapters)), book.chapters === 1 ? ' chapter' : ' chapters'),
      h('span', {}, h('b', {}, fmt(book.verses)), ' verses')),
    h('span', { class: 'book-bar', 'aria-hidden': 'true' },
      h('span', { style: `width:${share}%` })));
}

// ------------------------------------------------------------------ detail

function detail(book, group, onClose) {
  const facts = h('dl', { class: 'facts' },
    h('dt', {}, 'Author'),
    h('dd', {}, book.author, book.author_note && h('small', { class: 'note' }, book.author_note)),
    book.date && [h('dt', {}, 'Written'), h('dd', {}, book.date)],
    book.audience && [h('dt', {}, 'Written to'), h('dd', {}, book.audience)],
    book.setting && [h('dt', {}, 'Setting'), h('dd', {}, book.setting)],
    h('dt', {}, 'Length'),
    h('dd', {}, `${fmt(book.chapters)} ${book.chapters === 1 ? 'chapter' : 'chapters'}, ${fmt(book.verses)} verses`));

  const outline = book.outline?.length && h('ol', { class: 'outline' },
    book.outline.map(o => h('li', {},
      h('span', { class: 'outline-range' }, o.chapters.includes(':') ? o.chapters : `ch. ${o.chapters}`),
      h('span', {}, o.title))));

  const verses = book.key_verses?.length && h('div', { class: 'verses' },
    book.key_verses.map(v => h('figure', { class: 'verse' },
      h('blockquote', {}, v.text),
      h('figcaption', {}, v.reference))));

  const peoples = book.peoples?.length && h('ul', { class: 'people-links' },
    book.peoples.map(id => h('li', {},
      h('a', { href: `peoples.html?people=${encodeURIComponent(id)}` }, labelFor(id)))));

  const block = (title, ...body) => h('section', { class: 'detail-block' }, h('h4', {}, title), body);

  return h('div', {
    class: `row-panel g-${group.id}`, id: 'book-detail', role: 'region',
    'aria-labelledby': 'book-detail-title', tabindex: '-1'
  },
    h('button', { type: 'button', class: 'panel-close', 'aria-label': `Close ${book.name}`, onclick: onClose }, '×'),
    h('header', { class: 'detail-head' },
      h('p', { class: 'detail-group' }, `${group.name} · Book ${book.order} of 66`),
      h('h3', { id: 'book-detail-title' }, book.name),
      para(book.name_meaning, 'detail-meaning'),
      para(book.summary, 'detail-summary')),
    h('div', { class: 'detail-cols' },
      h('div', { class: 'detail-main' },
        block('Where it came from', para(book.origin)),
        block('What it contains', para(book.description)),
        outline && block('Outline', outline),
        book.themes?.length && block('Themes',
          h('ul', { class: 'tags' }, book.themes.map(t => h('li', {}, t)))),
        book.christ && block('Christ in this book', para(book.christ, 'christ'))),
      h('div', { class: 'detail-side' },
        block('At a glance', facts),
        book.key_people?.length && block('Key people',
          h('ul', { class: 'key-people' }, book.key_people.map(p => h('li', {}, p)))),
        peoples && block('Peoples in this book', peoples),
        verses && block('Key verses', verses))));
}

// Peoples ids are plural slugs ("moabites"); show them as names.
function labelFor(id) {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

// ------------------------------------------------------------------ page

export async function start(view) {
  let data;
  try {
    data = await fetchJson(DATA);
  } catch (error) {
    console.error('Unable to load the books of the Bible:', error);
    view.replaceChildren(h('p', { class: 'status' },
      'The books of the Bible could not be loaded. Please try again later.'));
    return;
  }

  const books = new Map();
  const groupOf = new Map();
  for (const g of data.groups) {
    for (const b of g.books) {
      books.set(b.id, b);
      groupOf.set(b.id, g);
    }
  }
  const maxVerses = Math.max(...[...books.values()].map(b => b.verses));

  const state = { testament: 'all', query: '' };
  const expander = rowExpander({ tileSelector: '.book-tile' });

  // --- opening and closing -------------------------------------------------

  function open(id, options) {
    const book = books.get(id);
    const openTile = document.getElementById(`tile-${id}`);
    if (!book || !openTile || openTile.hidden) return;
    expander.open(openTile,
      detail(book, groupOf.get(id), () => expander.close({ focus: true })), options);
  }

  function toggle(id) {
    if (expander.openId === id) expander.close();
    else open(id);
  }

  // --- filters ---------------------------------------------------------------

  function searchText(b) {
    return [b.name, b.summary, b.author, b.name_meaning, ...(b.themes || []), ...(b.key_people || [])]
      .join(' ').toLowerCase();
  }
  const haystack = new Map([...books.values()].map(b => [b.id, searchText(b)]));

  function apply() {
    const q = state.query.trim().toLowerCase();
    let shown = 0;
    for (const section of view.querySelectorAll('.testament')) {
      const tMatch = state.testament === 'all' || section.dataset.testament === state.testament;
      let sectionShown = 0;
      for (const groupEl of section.querySelectorAll('.book-group')) {
        let groupShown = 0;
        for (const t of groupEl.querySelectorAll('.book-tile')) {
          const visible = tMatch && (!q || haystack.get(t.dataset.id).includes(q));
          t.hidden = !visible;
          if (visible) groupShown += 1;
        }
        groupEl.hidden = groupShown === 0;
        sectionShown += groupShown;
      }
      section.hidden = sectionShown === 0;
      shown += sectionShown;
    }
    if (expander.openTile?.hidden) expander.close();
    else expander.place();
    count.textContent = shown === books.size ? '' : `Showing ${shown} of ${books.size} books`;
    empty.hidden = shown !== 0;
    for (const chip of chips.querySelectorAll('.chip')) {
      chip.setAttribute('aria-pressed', String(chip.dataset.testament === state.testament));
    }
  }

  // --- build the page --------------------------------------------------------

  const t = data.totals;
  const search = h('input', {
    type: 'search', class: 'search', autocomplete: 'off',
    placeholder: 'Search a book, author or theme…', 'aria-label': 'Search the books of the Bible'
  });
  search.addEventListener('input', () => { state.query = search.value; apply(); });

  const chip = (label, value, n) => h('button', {
    type: 'button', class: 'chip', 'data-testament': value, 'aria-pressed': String(value === state.testament)
  }, label, h('span', { class: 'chip-count' }, n));
  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Filter by testament' },
    chip('All books', 'all', t.books),
    data.testaments.map(tt => chip(tt.name, tt.testament, tt.books)));
  chips.addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c) return;
    state.testament = c.dataset.testament;
    apply();
  });

  const count = h('p', { class: 'result-count', 'aria-live': 'polite' });
  const empty = h('p', { class: 'status', hidden: true }, 'No books match that search.');

  const sections = data.testaments.map(tt => h('section', {
    class: 'testament', 'data-testament': tt.testament, 'aria-labelledby': `t-${tt.testament}`
  },
    h('header', { class: 'testament-head' },
      h('h2', { id: `t-${tt.testament}` }, tt.name),
      h('p', {}, `${tt.books} books · ${fmt(tt.chapters)} chapters · ${fmt(tt.verses)} verses`)),
    data.groups.filter(g => g.testament === tt.testament).map(g => h('section', {
      class: `panel book-group g-${g.id}`, 'aria-labelledby': `g-${g.id}`
    },
      h('div', { class: 'group-head' },
        h('h3', { id: `g-${g.id}` }, g.name),
        h('p', { class: 'group-counts' },
          `${g.book_count} ${g.book_count === 1 ? 'book' : 'books'} · ${fmt(g.chapters)} ${g.chapters === 1 ? 'chapter' : 'chapters'} · ${fmt(g.verses)} verses`)),
      para(g.description, 'group-desc'),
      g.key_chapters?.length && h('ul', { class: 'key-chapters', 'aria-label': 'Key chapters' },
        g.key_chapters.map(k => h('li', {}, h('b', {}, k.reference), ` ${k.note}`))),
      h('div', { class: 'book-grid' }, g.books.map(b => tile(b, maxVerses, toggle)))))));

  view.replaceChildren(
    h('section', { class: 'hero' },
      h('h1', {}, 'Books of the Bible'),
      h('p', { class: 'lede' },
        'Sixty-six books written over some fifteen centuries, grouped the way they are read: ' +
        'the Law, History, Poetry, the Prophets, the Gospels and the Letters. Tap a book to ' +
        'see who wrote it, when, and what it is about.'),
      h('ul', { class: 'stats' },
        h('li', {}, h('b', {}, fmt(t.books)), 'books'),
        h('li', {}, h('b', {}, fmt(t.chapters)), 'chapters'),
        h('li', {}, h('b', {}, fmt(t.verses)), 'verses')),
      h('div', { class: 'finder' }, search),
      chips),
    count,
    ...sections,
    empty);

  apply();

  // A link such as bible-books.html#ruth opens that book.
  followHash(id => open(id, { smooth: false }));
}
