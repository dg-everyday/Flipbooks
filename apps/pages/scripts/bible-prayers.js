/**
 * Prayers in the Bible — drives bible-prayers.html.
 *
 * Reads assets/bible-prayers.json (built and verse-checked by
 * tools/prayers/build_prayers.py): what Jesus taught about prayer, Jesus at
 * prayer, and the prayers of the patriarchs, kings, prophets, exiles, psalmists
 * and first Christians, each with what it means for daily life. Each group is a
 * section of cards; clicking one opens it in place, under the row it sits in
 * (rowExpander in study-utils.js). #the-lords-prayer in the URL opens it.
 */

import { h, fetchJson, para, refList, rowExpander, followHash, filterMenu } from './study-utils.js?v=20261003-1';

const DATA = 'assets/bible-prayers.json';

// Per group: a CSS class for its colour, and an intro.
const GROUPS = {
  'Jesus teaches us to pray': {
    cls: 'g-teach',
    intro: 'The Lord\'s Prayer, and what Jesus taught about praying in secret, asking, persisting, humility and praying for enemies.',
  },
  'Jesus at prayer': {
    cls: 'g-jesus',
    intro: 'Before dawn, all night, at a friend\'s tomb, in Gethsemane and on the cross: Jesus prayed, and his prayers show us how.',
  },
  'The patriarchs and Moses': {
    cls: 'g-patriarchs',
    intro: 'Abraham pleading for a city, a servant at a well, Jacob afraid, Moses standing in the gap, and a blessing to speak over others.',
  },
  'Kings and prophets': {
    cls: 'g-kings',
    intro: 'A mother\'s tears, a king\'s wonder, a request for wisdom, fire on Carmel, a letter spread before God, and a nation that did not know what to do.',
  },
  'Prayers in exile': {
    cls: 'g-exile',
    intro: 'Far from home and under pressure, God\'s people kept praying: at an open window, in confession, in a moment before a king.',
  },
  'Psalms for every day': {
    cls: 'g-psalms',
    intro: 'Prayers from Israel\'s songbook for the rhythm of a day: morning and evening, confession and guidance, loneliness and speech.',
  },
  'The early church at prayer': {
    cls: 'g-church',
    intro: 'The first Christians prayed for boldness, for one another and without ceasing, and the Bible ends with a prayer.',
  },
};

// Line icons, one per group (24 × 24, drawn with the current colour).
const ICONS = {
  'Jesus teaches us to pray': '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  'Jesus at prayer': '<path d="M12 3v18M7 8h10"/>',
  'The patriarchs and Moses': '<path d="M3 20 12 4l9 16z"/><path d="M9 20l3-6 3 6"/>',
  'Kings and prophets': '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
  'Prayers in exile': '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M4 12h16"/>',
  'Psalms for every day': '<path d="M3 18h18M6 18a6 6 0 0 1 12 0M12 7V4M5.6 11.6 3.8 9.8M18.4 11.6l1.8-1.8"/>',
  'The early church at prayer': '<path d="M12 22c3.9 0 6.5-2.8 6.5-6.5 0-3.4-2.3-5.4-3.5-8-1 1.8-1.8 2.6-2.8 2.8.2-2.4-.6-4.6-2.7-6.8-.8 3.1-4 5.9-4 10.2C5.5 19.2 8.1 22 12 22z"/>',
};

function icon(group, cls) {
  const span = h('span', { class: cls, 'aria-hidden': 'true' });
  // A fixed string from ICONS above, never data.
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[group] || ''}</svg>`;
  return span;
}

const testamentLabel = t => `${t} Testament`;

function people(list) {
  return list?.length && h('ul', { class: 'pr-people' },
    list.map(p => h('li', {},
      p.hero
        ? h('a', { href: `heroes-and-villains.html#${encodeURIComponent(p.hero)}` }, p.name)
        : h('span', {}, p.name))));
}

// The prayer's own words: one line per verse, each passage with its reference.
function prayerWords(prayed) {
  return prayed?.length && h('div', { class: 'prayer-words' },
    prayed.map(s => h('figure', { class: 'prayer-passage' },
      h('blockquote', {}, s.lines.map(line => h('p', {}, line))),
      h('figcaption', {}, s.reference))));
}

// ------------------------------------------------------------------ cards

function tile(item, onToggle) {
  return h('button', {
    type: 'button', class: 'pr-tile', id: `tile-${item.id}`, 'data-id': item.id,
    'aria-expanded': 'false', 'aria-controls': 'pr-detail', onclick: () => onToggle(item.id)
  },
    icon(item.group, 'pr-mark'),
    h('span', { class: 'pr-text' },
      h('span', { class: 'pr-name' }, item.name),
      h('span', { class: 'pr-epithet' }, item.epithet),
      h('span', { class: 'pr-meta' }, `${testamentLabel(item.testament)} · ${item.told_in}`)));
}

// ------------------------------------------------------------------ detail

function detail(item, onClose) {
  const g = GROUPS[item.group];
  const block = (title, ...body) => h('section', { class: 'detail-block' }, h('h4', {}, title), body);

  const facts = h('dl', { class: 'facts' },
    item.by?.length && [h('dt', {}, item.by_label || 'Prayed by'), h('dd', {}, people(item.by))],
    item.with?.length && [h('dt', {}, 'Also there'), h('dd', {}, people(item.with))],
    item.occasion && [h('dt', {}, 'The occasion'), h('dd', {}, item.occasion)],
    item.where && [h('dt', {}, 'Where'), h('dd', {}, item.where)],
    [h('dt', {}, 'Testament'), h('dd', {}, testamentLabel(item.testament))]);

  const accounts = item.accounts?.length > 1 &&
    h('p', { class: 'accounts-note' }, `Told or echoed in ${item.accounts.length} places`);

  const books = item.books?.length && h('ul', { class: 'book-links' },
    item.books.map(b => h('li', {}, h('a', { href: `bible-books.html#${encodeURIComponent(b.id)}` }, b.name))));

  const verses = item.key_verses?.length && h('div', { class: 'verses' },
    item.key_verses.map(v => h('figure', { class: 'verse' },
      h('blockquote', {}, v.text),
      h('figcaption', {}, v.reference))));

  // A short prayer in our own words, set apart from Scripture.
  const prayIt = item.pray_it && h('figure', { class: 'pray-it' },
    h('blockquote', {}, item.pray_it),
    h('figcaption', {}, 'A prayer in our own words'));

  const words = prayerWords(item.prayed);

  return h('div', {
    class: `row-panel ${g.cls}`, id: 'pr-detail', role: 'region',
    'aria-labelledby': 'pr-detail-title', tabindex: '-1'
  },
    h('button', { type: 'button', class: 'panel-close', 'aria-label': `Close ${item.name}`, onclick: onClose }, '×'),
    h('header', { class: 'detail-head' },
      h('p', { class: 'detail-group' }, `${item.group} · ${testamentLabel(item.testament)}`),
      h('h3', { id: 'pr-detail-title' }, item.name),
      para(item.epithet, 'detail-meaning'),
      para(item.summary, 'detail-summary')),
    h('div', { class: 'detail-cols' },
      h('div', { class: 'detail-main' },
        words && block('The words', words),
        block('The story behind it', para(item.story)),
        item.meaning && block('What it teaches', para(item.meaning)),
        item.daily && block('In your daily life', para(item.daily, 'daily')),
        prayIt && block('Pray it today', prayIt)),
      h('div', { class: 'detail-side' },
        block('At a glance', facts),
        block('Read it', refList(item.accounts), accounts),
        books && block('Found in', books),
        verses && block('Read it with', verses))));
}

// ------------------------------------------------------------------ page

export async function start(view) {
  let data;
  try {
    data = await fetchJson(DATA);
  } catch (error) {
    console.error('Unable to load the prayers:', error);
    view.replaceChildren(h('p', { class: 'status' },
      'The prayers could not be loaded. Please try again later.'));
    return;
  }

  const entries = data.entries;
  const byId = new Map(entries.map(e => [e.id, e]));
  const state = { group: 'all', testament: 'all', query: '' };
  const expander = rowExpander({ tileSelector: '.pr-tile' });

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
    [e.name, e.epithet, e.summary, e.group, e.occasion, e.where, e.told_in, e.daily,
      ...(e.by || []).map(p => p.name), ...(e.with || []).map(p => p.name),
      ...(e.prayed || []).flatMap(s => s.lines)]
      .join(' ').toLowerCase()]));

  function apply() {
    const q = state.query.trim().toLowerCase();
    let shown = 0;
    for (const section of view.querySelectorAll('.group-section')) {
      const groupMatch = state.group === 'all' || section.dataset.group === state.group;
      let sectionShown = 0;
      for (const t of section.querySelectorAll('.pr-tile')) {
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
    placeholder: 'Search a prayer, a need or a name…', 'aria-label': 'Search the prayers in the Bible'
  });
  search.addEventListener('input', () => { state.query = search.value; apply(); });

  const chip = (filter, value, label, n, cls) => h('button', {
    type: 'button', class: `chip${cls ? ` ${cls}` : ''}`, 'data-filter': filter, 'data-value': value,
    'aria-pressed': String(state[filter] === value)
  }, label, n != null && h('span', { class: 'chip-count' }, n));

  const t = data.totals;
  const chips = h('div', { class: 'chip-rows' },
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Show one kind' },
      chip('group', 'all', 'Every prayer', t.entries),
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
  const empty = h('p', { class: 'status', hidden: true }, 'No prayer matches that search.');

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
      h('div', { class: 'pr-grid' }, members.map(e => tile(e, toggle))));
  };

  const filters = filterMenu(
    h('ul', { class: 'stats' },
      h('li', {}, h('b', {}, t.entries), 'prayers'),
      h('li', {}, h('b', {}, t.old), 'Old Testament'),
      h('li', {}, h('b', {}, t.new), 'New Testament')),
    chips);

  view.replaceChildren(
    h('section', { class: 'hero' },
      filters.button,
      h('h1', {}, 'Prayers in the Bible'),
      h('p', { class: 'lede' },
        'The prayers Jesus taught and prayed, and the prayers of the men and women of Scripture: in joy '
        + 'and in fear, in the morning and at night, for themselves and for others. Read each one, see '
        + 'what it teaches, and find a way to pray it in your own day. Tap any one to read it.'),
      h('div', { class: 'finder' }, search),
      filters.menu),
    count,
    ...data.groups.map(section),
    empty);

  apply();
  followHash(id => open(id, { smooth: false }));
}
