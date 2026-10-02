/**
 * Commandments of God — drives commandments-of-god.html.
 *
 * Reads assets/commandments-of-god.json (built and verse-checked by
 * tools/commandments/build_commandments.py): the Ten Commandments, the greatest
 * commandments, the commandments of Jesus, wisdom for daily life from the law,
 * prophets and Proverbs, and the commandments of the apostles, each with what
 * it means for daily life and one step to take today. Each group is a section
 * of cards; clicking one opens it in place, under the row it sits in
 * (rowExpander in study-utils.js). #no-other-gods in the URL opens it.
 */

import { h, fetchJson, para, refList, rowExpander, followHash, filterMenu } from './study-utils.js?v=20261003-1';

const DATA = 'assets/commandments-of-god.json';

// Per group: a CSS class for its colour, and an intro.
const GROUPS = {
  'The Ten Commandments': {
    cls: 'g-ten',
    intro: 'The ten words God spoke from Mount Sinai: four about loving God, six about loving the people around us. Jesus and the apostles kept every one, and showed that they reach the heart.',
    note: 'Numbered here as most Protestant and Orthodox churches number them. Catholic and Lutheran churches count the same words differently, joining the first two and dividing the last into two.',
  },
  'The greatest commandments': {
    cls: 'g-great',
    intro: 'Asked which commandment was the greatest, Jesus named two, love for God and love for neighbour, and said all the law hangs on them. Then he gave a new one.',
  },
  'Commandments of Jesus': {
    cls: 'g-jesus',
    intro: 'What Jesus told his followers to do: repent and believe, follow him, seek the kingdom first, love enemies, forgive, remember him, make disciples and abide in him.',
  },
  'Wisdom for daily life': {
    cls: 'g-wisdom',
    intro: 'Commands from the law, the prophets and Proverbs for ordinary days: fairness at work, care for the poor, trust, courage, home, and a guarded heart.',
  },
  'Commandments of the apostles': {
    cls: 'g-apostles',
    intro: 'The apostles wrote to young churches about how to live: in their words and their anger, at work and at home, with money, worry, the world and one another.',
  },
};

// Line icons, one per group (24 × 24, drawn with the current colour).
const ICONS = {
  'The Ten Commandments': '<path d="M5 20V8a3.5 3.5 0 0 1 7 0v12zM12 20V8a3.5 3.5 0 0 1 7 0v12z"/><path d="M7.5 10.5h2M7.5 13.5h2M14.5 10.5h2M14.5 13.5h2"/>',
  'The greatest commandments': '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  'Commandments of Jesus': '<path d="M12 3v18M7 8h10"/>',
  'Wisdom for daily life': '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  'Commandments of the apostles': '<path d="M4 20l3-1L19 7l-2-2L5 17z"/><path d="M14.5 7.5l2 2"/>',
};

function icon(group, cls) {
  const span = h('span', { class: cls, 'aria-hidden': 'true' });
  // A fixed string from ICONS above, never data.
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[group] || ''}</svg>`;
  return span;
}

const testamentLabel = t => `${t} Testament`;

const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
const ordinal = n => ORDINALS[n - 1] || `No. ${n}`;

function people(list) {
  return list?.length && h('ul', { class: 'cm-people' },
    list.map(p => h('li', {},
      p.hero
        ? h('a', { href: `heroes-and-villains.html#${encodeURIComponent(p.hero)}` }, p.name)
        : h('span', {}, p.name))));
}

// The commandment's own words: one line per verse, each passage with its reference.
function commandWords(words) {
  return words?.length && h('div', { class: 'cm-words' },
    words.map(s => h('figure', { class: 'cm-passage' },
      h('blockquote', {}, s.lines.map(line => h('p', {}, line))),
      h('figcaption', {}, s.reference))));
}

// ------------------------------------------------------------------ cards

// The Ten Commandments carry their number in place of the group icon.
function mark(item) {
  return item.number
    ? h('span', { class: 'cm-mark is-number', 'aria-hidden': 'true' }, String(item.number))
    : icon(item.group, 'cm-mark');
}

function tile(item, onToggle) {
  return h('button', {
    type: 'button', class: 'cm-tile', id: `tile-${item.id}`, 'data-id': item.id,
    'aria-expanded': 'false', 'aria-controls': 'cm-detail', onclick: () => onToggle(item.id)
  },
    mark(item),
    h('span', { class: 'cm-text' },
      h('span', { class: 'cm-name' }, item.name),
      h('span', { class: 'cm-epithet' }, item.epithet),
      h('span', { class: 'cm-meta' }, `${testamentLabel(item.testament)} · ${item.told_in}`)));
}

// ------------------------------------------------------------------ detail

function detail(item, onClose) {
  const g = GROUPS[item.group];
  const block = (title, ...body) => h('section', { class: 'detail-block' }, h('h4', {}, title), body);

  const facts = h('dl', { class: 'facts' },
    item.number && [h('dt', {}, 'Commandment'), h('dd', {}, `${ordinal(item.number)} of ten`)],
    item.by?.length && [h('dt', {}, item.by_label || 'Given by'), h('dd', {}, people(item.by))],
    item.to && [h('dt', {}, 'Given to'), h('dd', {}, item.to)],
    item.with?.length && [h('dt', {}, 'With'), h('dd', {}, people(item.with))],
    item.where && [h('dt', {}, 'Where'), h('dd', {}, item.where)],
    [h('dt', {}, 'Testament'), h('dd', {}, testamentLabel(item.testament))]);

  const accounts = item.accounts?.length > 1 &&
    h('p', { class: 'accounts-note' }, `Given or taken up in ${item.accounts.length} places`);

  const books = item.books?.length && h('ul', { class: 'book-links' },
    item.books.map(b => h('li', {}, h('a', { href: `bible-books.html#${encodeURIComponent(b.id)}` }, b.name))));

  const verses = item.key_verses?.length && h('div', { class: 'verses' },
    item.key_verses.map(v => h('figure', { class: 'verse' },
      h('blockquote', {}, v.text),
      h('figcaption', {}, v.reference))));

  // One practical step in our own words, set apart from Scripture.
  const tryIt = item.try_it && h('figure', { class: 'try-it' },
    h('p', {}, item.try_it),
    h('figcaption', {}, 'A step in our own words'));

  const words = commandWords(item.words);
  const title = item.number ? `The ${ordinal(item.number).toLowerCase()} commandment` : item.group;

  return h('div', {
    class: `row-panel ${g.cls}`, id: 'cm-detail', role: 'region',
    'aria-labelledby': 'cm-detail-title', tabindex: '-1'
  },
    h('button', { type: 'button', class: 'panel-close', 'aria-label': `Close ${item.name}`, onclick: onClose }, '×'),
    h('header', { class: 'detail-head' },
      h('p', { class: 'detail-group' }, `${title} · ${testamentLabel(item.testament)}`),
      h('h3', { id: 'cm-detail-title' }, item.name),
      para(item.epithet, 'detail-meaning'),
      para(item.summary, 'detail-summary')),
    h('div', { class: 'detail-cols' },
      h('div', { class: 'detail-main' },
        words && block('The words', words),
        block('Where it comes from', para(item.story)),
        item.meaning && block('What it means', para(item.meaning)),
        item.daily && block('In your daily life', para(item.daily, 'daily')),
        tryIt && block('Do this today', tryIt)),
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
    console.error('Unable to load the commandments:', error);
    view.replaceChildren(h('p', { class: 'status' },
      'The commandments could not be loaded. Please try again later.'));
    return;
  }

  const entries = data.entries;
  const byId = new Map(entries.map(e => [e.id, e]));
  const state = { group: 'all', testament: 'all', query: '' };
  const expander = rowExpander({ tileSelector: '.cm-tile' });

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
    [e.name, e.epithet, e.summary, e.group, e.to, e.where, e.told_in, e.daily, e.try_it,
      e.number && `${ordinal(e.number)} commandment`,
      ...(e.by || []).map(p => p.name), ...(e.with || []).map(p => p.name),
      ...(e.words || []).flatMap(s => s.lines)]
      .filter(Boolean).join(' ').toLowerCase()]));

  function apply() {
    const q = state.query.trim().toLowerCase();
    let shown = 0;
    for (const section of view.querySelectorAll('.group-section')) {
      const groupMatch = state.group === 'all' || section.dataset.group === state.group;
      let sectionShown = 0;
      for (const t of section.querySelectorAll('.cm-tile')) {
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
    placeholder: 'Search a commandment or a need…', 'aria-label': 'Search the commandments of God'
  });
  search.addEventListener('input', () => { state.query = search.value; apply(); });

  const chip = (filter, value, label, n, cls) => h('button', {
    type: 'button', class: `chip${cls ? ` ${cls}` : ''}`, 'data-filter': filter, 'data-value': value,
    'aria-pressed': String(state[filter] === value)
  }, label, n != null && h('span', { class: 'chip-count' }, n));

  const t = data.totals;
  const chips = h('div', { class: 'chip-rows' },
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Show one kind' },
      chip('group', 'all', 'Every commandment', t.entries),
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
  const empty = h('p', { class: 'status', hidden: true }, 'No commandment matches that search.');

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
      GROUPS[group].note && h('p', { class: 'group-note' }, h('strong', {}, 'Numbering. '), GROUPS[group].note),
      h('div', { class: 'cm-grid' }, members.map(e => tile(e, toggle))));
  };

  const filters = filterMenu(
    h('ul', { class: 'stats' },
      h('li', {}, h('b', {}, t.entries), 'commandments'),
      h('li', {}, h('b', {}, t.old), 'Old Testament'),
      h('li', {}, h('b', {}, t.new), 'New Testament')),
    chips);

  view.replaceChildren(
    h('section', { class: 'hero' },
      filters.button,
      h('h1', {}, 'Commandments of God'),
      h('p', { class: 'lede' },
        'The Ten Commandments first, then the two Jesus called the greatest, the commands he gave his '
        + 'followers, wisdom for ordinary days from the law and the prophets, and what the apostles taught '
        + 'the first churches. Each one shows where it comes from, what it means, and one step to take '
        + 'today. Tap any one to read it.'),
      h('div', { class: 'finder' }, search),
      filters.menu),
    count,
    ...data.groups.map(section),
    empty);

  apply();
  followHash(id => open(id, { smooth: false }));
}
