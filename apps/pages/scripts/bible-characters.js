/**
 * Bible Characters — drives bible-characters.html.
 *
 * Reads assets/bible-characters.json (built and verse-checked by
 * tools/characters/build_characters.py): the people of the Bible from Adam to
 * the first church, grouped by era. Each group is a section of cards; clicking
 * one opens it in place, under the row it sits in (rowExpander in
 * study-utils.js). Family members link to each other by URL hash (#jacob), so
 * a tap on one opens that person; #moses in the URL opens Moses.
 */

import { h, fetchJson, para, refList, rowExpander, followHash } from './study-utils.js?v=20261002-2';

const DATA = 'assets/bible-characters.json';

// Per group: a CSS class for its colour, and an intro.
const GROUPS = {
  'The beginning': {
    cls: 'g-beginning',
    intro: 'From the first man and woman to the flood and the first kingdoms: the people of Genesis 1 to 11.',
  },
  'The patriarchs': {
    cls: 'g-patriarchs',
    intro: 'Abraham, Isaac and Jacob, the women beside them, and the family that God promised to make a nation.',
  },
  'Exodus and the promised land': {
    cls: 'g-exodus',
    intro: 'Slavery in Egypt, the law at Sinai, forty years in the wilderness, and the crossing into Canaan.',
  },
  'The judges': {
    cls: 'g-judges',
    intro: 'Deliverers raised up in Israel\'s dark and troubled years, and the faithful families of Bethlehem and Shiloh.',
  },
  'The kingdom': {
    cls: 'g-kingdom',
    intro: 'Saul, David and Solomon, and the people around the throne of Israel when it was one kingdom.',
  },
  'The divided kingdom': {
    cls: 'g-divided',
    intro: 'Two kingdoms, north and south: kings who led their people astray or back to God, and the prophets who spoke to them.',
  },
  'Exile and return': {
    cls: 'g-exile',
    intro: 'Carried away to Babylon, faithful in a foreign land, and brought home to rebuild the temple and the walls.',
  },
  'The life of Jesus': {
    cls: 'g-jesus',
    intro: 'Jesus, and the people whose lives crossed his: his family, his disciples, his friends, and those who condemned him.',
  },
  'The early church': {
    cls: 'g-church',
    intro: 'The first believers who carried the good news from Jerusalem to Rome.',
  },
};

// Line icons, one per group (24 × 24, drawn with the current colour).
const ICONS = {
  'The beginning': '<path d="M12 22v-7"/><path d="M12 15c-4 0-7-2.5-7-6a7 7 0 0 1 14 0c0 3.5-3 6-7 6z"/>',
  'The patriarchs': '<path d="M3 20 12 4l9 16z"/><path d="M9 20l3-6 3 6"/>',
  'Exodus and the promised land': '<path d="M2 8c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M2 13c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M2 18c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0"/>',
  'The judges': '<path d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6z"/>',
  'The kingdom': '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
  'The divided kingdom': '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/><path d="M12 9v10"/>',
  'Exile and return': '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6"/>',
  'The life of Jesus': '<path d="M12 3v18M7 8h10"/>',
  'The early church': '<path d="M12 22c3.9 0 6.5-2.8 6.5-6.5 0-3.4-2.3-5.4-3.5-8-1 1.8-1.8 2.6-2.8 2.8.2-2.4-.6-4.6-2.7-6.8-.8 3.1-4 5.9-4 10.2C5.5 19.2 8.1 22 12 22z"/>',
};

function icon(group, cls) {
  const span = h('span', { class: cls, 'aria-hidden': 'true' });
  // A fixed string from ICONS above, never data.
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[group] || ''}</svg>`;
  return span;
}

const testamentLabel = t => `${t} Testament`;

// The letter on a card: the name's first letter, past a leading "The".
const initial = name => name.replace(/^The\s+/i, '').charAt(0).toUpperCase();

// ------------------------------------------------------------------ cards

function tile(item, onToggle) {
  return h('button', {
    type: 'button', class: 'bc-tile', id: `tile-${item.id}`, 'data-id': item.id,
    'aria-expanded': 'false', 'aria-controls': 'bc-detail', onclick: () => onToggle(item.id)
  },
    h('span', { class: 'bc-mark', 'aria-hidden': 'true' }, initial(item.name)),
    h('span', { class: 'bc-text' },
      h('span', { class: 'bc-name' }, item.name),
      h('span', { class: 'bc-epithet' }, item.epithet),
      h('span', { class: 'bc-meta' }, `${item.role} · ${testamentLabel(item.testament)}`)));
}

// ------------------------------------------------------------------ detail

function detail(item, onClose) {
  const g = GROUPS[item.group];
  const block = (title, ...body) => h('section', { class: 'detail-block' }, h('h4', {}, title), body);

  const facts = h('dl', { class: 'facts' },
    [h('dt', {}, 'Role'), h('dd', {}, item.role)],
    item.era && [h('dt', {}, 'When'), h('dd', {}, item.era)],
    [h('dt', {}, 'Testament'), h('dd', {}, testamentLabel(item.testament))],
    item.hero && [h('dt', {}, 'More'), h('dd', {},
      h('a', { class: 'bc-hero-link', href: `heroes-and-villains.html#${encodeURIComponent(item.hero)}` },
        'Read their lesson in Heroes and Villains'))]);

  // A family member on this page is a link: the hash change opens them.
  const family = item.family?.length && h('ul', { class: 'bc-family' },
    item.family.map(f => h('li', {},
      h('span', { class: 'bc-relation' }, f.relation),
      f.id
        ? h('a', { href: `#${encodeURIComponent(f.id)}` }, f.name)
        : h('span', { class: 'bc-person' }, f.name))));

  const knownFor = item.known_for?.length && h('ul', { class: 'bc-known' },
    item.known_for.map(k => h('li', {}, k)));

  const accounts = item.accounts?.length > 1 &&
    h('p', { class: 'accounts-note' }, `Told or remembered in ${item.accounts.length} places`);

  const books = item.books?.length && h('ul', { class: 'book-links' },
    item.books.map(b => h('li', {}, h('a', { href: `bible-books.html#${encodeURIComponent(b.id)}` }, b.name))));

  const verses = item.key_verses?.length && h('div', { class: 'verses' },
    item.key_verses.map(v => h('figure', { class: 'verse' },
      h('blockquote', {}, v.text),
      h('figcaption', {}, v.reference))));

  return h('div', {
    class: `row-panel ${g.cls}`, id: 'bc-detail', role: 'region',
    'aria-labelledby': 'bc-detail-title', tabindex: '-1'
  },
    h('button', { type: 'button', class: 'panel-close', 'aria-label': `Close ${item.name}`, onclick: onClose }, '×'),
    h('header', { class: 'detail-head' },
      h('p', { class: 'detail-group' }, `${item.group} · ${testamentLabel(item.testament)}`),
      h('h3', { id: 'bc-detail-title' }, item.name),
      para(item.epithet, 'detail-meaning'),
      para(item.summary, 'detail-summary')),
    h('div', { class: 'detail-cols' },
      h('div', { class: 'detail-main' },
        block('Their story', para(item.story)),
        item.importance && block('Why they matter', para(item.importance, 'importance')),
        knownFor && block('Known for', knownFor)),
      h('div', { class: 'detail-side' },
        block('At a glance', facts),
        family && block('Family and connections', family),
        block('Read it', refList(item.accounts), accounts),
        books && block('Found in', books),
        verses && block('Key verses', verses))));
}

// ------------------------------------------------------------------ page

export async function start(view) {
  let data;
  try {
    data = await fetchJson(DATA);
  } catch (error) {
    console.error('Unable to load the Bible characters:', error);
    view.replaceChildren(h('p', { class: 'status' },
      'The Bible characters could not be loaded. Please try again later.'));
    return;
  }

  const entries = data.entries;
  const byId = new Map(entries.map(e => [e.id, e]));
  const state = { group: 'all', testament: 'all', query: '' };
  const expander = rowExpander({ tileSelector: '.bc-tile' });

  // --- opening and closing -------------------------------------------------

  function open(id, options) {
    const item = byId.get(id);
    let openTile = document.getElementById(`tile-${id}`);
    if (!item || !openTile) return;
    // A link may point at someone the filters are hiding.
    if (openTile.hidden) {
      resetFilters();
      openTile = document.getElementById(`tile-${id}`);
    }
    expander.open(openTile, detail(item, () => expander.close({ focus: true })), options);
  }

  function toggle(id) {
    if (expander.openId === id) expander.close();
    else open(id);
  }

  // --- filters ---------------------------------------------------------------

  const haystack = new Map(entries.map(e => [e.id,
    [e.name, e.epithet, e.role, e.summary, e.group, e.era,
      ...(e.known_for || []), ...(e.family || []).map(f => f.name)]
      .join(' ').toLowerCase()]));

  function apply() {
    const q = state.query.trim().toLowerCase();
    let shown = 0;
    for (const section of view.querySelectorAll('.group-section')) {
      const groupMatch = state.group === 'all' || section.dataset.group === state.group;
      let sectionShown = 0;
      for (const t of section.querySelectorAll('.bc-tile')) {
        const e = byId.get(t.dataset.id);
        const visible = groupMatch
          && (state.testament === 'all' || e.testament === state.testament)
          && (!q || haystack.get(e.id).includes(q));
        t.hidden = !visible;
        if (visible) sectionShown += 1;
      }
      section.hidden = sectionShown === 0;
      shown += sectionShown;
    }
    if (expander.openTile?.hidden) expander.close();
    else expander.place();
    count.textContent = shown === entries.length ? '' : `Showing ${shown} of ${entries.length}`;
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
    placeholder: 'Search a name, a role or a story…', 'aria-label': 'Search the Bible characters'
  });
  search.addEventListener('input', () => { state.query = search.value; apply(); });

  const chip = (filter, value, label, n, cls) => h('button', {
    type: 'button', class: `chip${cls ? ` ${cls}` : ''}`, 'data-filter': filter, 'data-value': value,
    'aria-pressed': String(state[filter] === value)
  }, label, n != null && h('span', { class: 'chip-count' }, n));

  const t = data.totals;
  const chips = h('div', { class: 'chip-rows' },
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Show one era' },
      chip('group', 'all', 'Everyone', t.entries),
      data.groups.map(g => chip('group', g, g, t.groups[g], GROUPS[g].cls))),
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Filter by testament' },
      chip('testament', 'all', 'Both Testaments'),
      chip('testament', 'Old', 'Old Testament', t.old),
      chip('testament', 'New', 'New Testament', t.new)));
  chips.addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c) return;
    state[c.dataset.filter] = c.dataset.value;
    apply();
  });

  const count = h('p', { class: 'result-count', 'aria-live': 'polite' });
  const empty = h('p', { class: 'status', hidden: true }, 'No one matches that search.');

  const section = group => {
    const members = entries.filter(e => e.group === group);
    const id = `h-${group.toLowerCase().replace(/[^a-z]+/g, '-')}`;
    return h('section', {
      class: `panel group-section ${GROUPS[group].cls}`, 'data-group': group, 'aria-labelledby': id
    },
      h('header', { class: 'group-head' },
        h('h2', { id }, icon(group, 'group-icon'), group),
        h('p', { class: 'group-count' }, `${members.length}`),
        para(GROUPS[group].intro, 'group-intro')),
      h('div', { class: 'bc-grid' }, members.map(e => tile(e, toggle))));
  };

  view.replaceChildren(
    h('section', { class: 'hero' },
      h('h1', {}, 'Bible Characters'),
      h('p', { class: 'lede' },
        'The people who make up the Bible\'s story, from Adam to the first church: who they were, ' +
        'what they did, how they are connected, and why they matter. Tap anyone to read their story, ' +
        'and tap a family member to go to them.'),
      h('ul', { class: 'stats' },
        h('li', {}, h('b', {}, t.entries), 'people'),
        h('li', {}, h('b', {}, t.old), 'Old Testament'),
        h('li', {}, h('b', {}, t.new), 'New Testament')),
      h('div', { class: 'finder' }, search),
      chips),
    count,
    ...data.groups.map(section),
    empty);

  apply();
  followHash(id => open(id, { smooth: false }));
}
