/**
 * Supernaturals of the Bible — drives supernaturals.html.
 *
 * Reads assets/supernaturals.json (built and verse-checked by
 * tools/supernaturals/build_supernaturals.py): miracles, healings, the dead
 * raised, demons cast out, magic and sorcery, and signs, wonders and angels.
 * Each group is a section of cards; clicking one opens it in place, under the
 * row it sits in (rowExpander in study-utils.js). #lazarus-raised in the URL
 * opens Lazarus.
 */

import { h, fetchJson, para, refList, rowExpander, followHash } from './study-utils.js?v=20260926-2';

const DATA = 'assets/supernaturals.json';

// Per group: a CSS class for its colour, an intro, and how the detail labels read.
const GROUPS = {
  'Power over nature': {
    cls: 'g-nature',
    intro: 'The sea divided, fire from heaven, the storm stilled: God showing that the world he made obeys him.',
  },
  'Food and plenty': {
    cls: 'g-plenty',
    intro: 'Bread from heaven, oil that did not run out, a crowd fed from a boy\'s lunch: God providing for his people.',
  },
  'Healings': {
    cls: 'g-healing',
    intro: 'Lepers cleansed, the blind given sight, the lame walking: bodies made whole, and often hearts as well.',
  },
  'Raised from the dead': {
    cls: 'g-raised',
    intro: 'From a widow\'s son at Zarephath to the empty tomb: the times the Bible says death gave back its dead.',
  },
  'Casting out demons': {
    cls: 'g-demons',
    intro: 'Unclean spirits cast out with a word. Scripture treats the spirit world as real, and shows Jesus as its master.',
  },
  'Magic and sorcery': {
    cls: 'g-magic',
    intro: 'Magicians, mediums and sorcerers, and what the Bible says about them. It never treats the occult as harmless, and always shows it failing before God.',
    by: 'Who was involved',
    meaning: 'What the Bible says about it',
  },
  'Signs, wonders and angels': {
    cls: 'g-signs',
    intro: 'A bush that would not burn, a hand writing on a wall, angels in prisons and lions\' dens: moments when heaven broke in.',
  },
};

// Line icons, one per group (24 × 24, drawn with the current colour).
const ICONS = {
  'Power over nature': '<path d="M2 7c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M2 12c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M2 17c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0"/>',
  'Food and plenty': '<path d="M4 12a8 5.5 0 0 1 16 0v5.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M8.5 9.5 7.8 12M12.3 8.8 11.8 11.8M16 9.5l-.7 2.5"/>',
  'Healings': '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  'Raised from the dead': '<path d="M3 19h18M6.5 19a5.5 5.5 0 0 1 11 0M12 4v4M5.2 8.2l2 2M18.8 8.2l-2 2M2.5 14.5h2.5M19 14.5h2.5"/>',
  'Casting out demons': '<path d="M9.5 7H7a4.5 4.5 0 0 0 0 9h2.5M14.5 7H17a4.5 4.5 0 0 1 0 9h-2.5M11 3.5l.8 2.5M13 18l.8 2.5"/>',
  'Magic and sorcery': '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/><path d="m9.5 6.5 5 5M14.5 6.5l-5 5"/>',
  'Signs, wonders and angels': '<path d="M12 22c3.9 0 6.5-2.8 6.5-6.5 0-3.4-2.3-5.4-3.5-8-1 1.8-1.8 2.6-2.8 2.8.2-2.4-.6-4.6-2.7-6.8-.8 3.1-4 5.9-4 10.2C5.5 19.2 8.1 22 12 22z"/>',
};

function icon(group, cls) {
  const span = h('span', { class: cls, 'aria-hidden': 'true' });
  // A fixed string from ICONS above, never data.
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[group] || ''}</svg>`;
  return span;
}

const testamentLabel = t => `${t} Testament`;

function people(list) {
  return list?.length && h('ul', { class: 'sn-people' },
    list.map(p => h('li', {},
      p.hero
        ? h('a', { href: `heroes-and-villains.html#${encodeURIComponent(p.hero)}` }, p.name)
        : h('span', {}, p.name))));
}

// ------------------------------------------------------------------ cards

function tile(item, onToggle) {
  return h('button', {
    type: 'button', class: 'sn-tile', id: `tile-${item.id}`, 'data-id': item.id,
    'aria-expanded': 'false', 'aria-controls': 'sn-detail', onclick: () => onToggle(item.id)
  },
    icon(item.group, 'sn-mark'),
    h('span', { class: 'sn-text' },
      h('span', { class: 'sn-name' }, item.name),
      h('span', { class: 'sn-epithet' }, item.epithet),
      h('span', { class: 'sn-meta' }, `${testamentLabel(item.testament)} · ${item.told_in}`)));
}

// ------------------------------------------------------------------ detail

function detail(item, onClose) {
  const g = GROUPS[item.group];
  const block = (title, ...body) => h('section', { class: 'detail-block' }, h('h4', {}, title), body);

  const facts = h('dl', { class: 'facts' },
    item.by?.length && [h('dt', {}, g.by || 'Done by'), h('dd', {}, people(item.by))],
    item.with?.length && [h('dt', {}, 'Also there'), h('dd', {}, people(item.with))],
    item.for && [h('dt', {}, 'For'), h('dd', {}, item.for)],
    item.where && [h('dt', {}, 'Where'), h('dd', {}, item.where)],
    [h('dt', {}, 'Testament'), h('dd', {}, testamentLabel(item.testament))]);

  const accounts = item.accounts?.length > 1 &&
    h('p', { class: 'accounts-note' }, `Told or recalled in ${item.accounts.length} places`);

  const books = item.books?.length && h('ul', { class: 'book-links' },
    item.books.map(b => h('li', {}, h('a', { href: `bible-books.html#${encodeURIComponent(b.id)}` }, b.name))));

  const verses = item.key_verses?.length && h('div', { class: 'verses' },
    item.key_verses.map(v => h('figure', { class: 'verse' },
      h('blockquote', {}, v.text),
      h('figcaption', {}, v.reference))));

  return h('div', {
    class: `row-panel ${g.cls}`, id: 'sn-detail', role: 'region',
    'aria-labelledby': 'sn-detail-title', tabindex: '-1'
  },
    h('button', { type: 'button', class: 'panel-close', 'aria-label': `Close ${item.name}`, onclick: onClose }, '×'),
    h('header', { class: 'detail-head' },
      h('p', { class: 'detail-group' }, `${item.group} · ${testamentLabel(item.testament)}`),
      h('h3', { id: 'sn-detail-title' }, item.name),
      para(item.epithet, 'detail-meaning'),
      para(item.summary, 'detail-summary')),
    h('div', { class: 'detail-cols' },
      h('div', { class: 'detail-main' },
        block('What happened', para(item.story)),
        item.meaning && block(g.meaning || 'Why it matters', para(item.meaning)),
        item.lesson && block('The lesson', para(item.lesson, 'lesson'))),
      h('div', { class: 'detail-side' },
        block('At a glance', facts),
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
    console.error('Unable to load the supernaturals:', error);
    view.replaceChildren(h('p', { class: 'status' },
      'The miracles and wonders could not be loaded. Please try again later.'));
    return;
  }

  const entries = data.entries;
  const byId = new Map(entries.map(e => [e.id, e]));
  const state = { group: 'all', testament: 'all', query: '' };
  const expander = rowExpander({ tileSelector: '.sn-tile' });

  // --- opening and closing -------------------------------------------------

  function open(id, options) {
    const item = byId.get(id);
    let openTile = document.getElementById(`tile-${id}`);
    if (!item || !openTile) return;
    // A link may point at something the filters are hiding.
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
    [e.name, e.epithet, e.summary, e.group, e.for, e.where, e.told_in,
      ...(e.by || []).map(p => p.name), ...(e.with || []).map(p => p.name)]
      .join(' ').toLowerCase()]));

  function apply() {
    const q = state.query.trim().toLowerCase();
    let shown = 0;
    for (const section of view.querySelectorAll('.group-section')) {
      const groupMatch = state.group === 'all' || section.dataset.group === state.group;
      let sectionShown = 0;
      for (const t of section.querySelectorAll('.sn-tile')) {
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
    placeholder: 'Search a miracle, person or place…', 'aria-label': 'Search the miracles and wonders'
  });
  search.addEventListener('input', () => { state.query = search.value; apply(); });

  const chip = (filter, value, label, n, cls) => h('button', {
    type: 'button', class: `chip${cls ? ` ${cls}` : ''}`, 'data-filter': filter, 'data-value': value,
    'aria-pressed': String(state[filter] === value)
  }, label, n != null && h('span', { class: 'chip-count' }, n));

  const t = data.totals;
  const chips = h('div', { class: 'chip-rows' },
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Show one kind' },
      chip('group', 'all', 'Everything', t.entries),
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
  const empty = h('p', { class: 'status', hidden: true }, 'Nothing matches that search.');

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
      h('div', { class: 'sn-grid' }, members.map(e => tile(e, toggle))));
  };

  view.replaceChildren(
    h('section', { class: 'hero' },
      h('h1', {}, 'Supernaturals'),
      h('p', { class: 'lede' },
        'Miracles, healings, the dead raised, demons cast out, and the magic and sorcery the Bible ' +
        'warns against: what happened, why it matters, and what it teaches. Tap any one to read it.'),
      h('ul', { class: 'stats' },
        h('li', {}, h('b', {}, t.entries), 'accounts'),
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
