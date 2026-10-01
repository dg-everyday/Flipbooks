/**
 * Supernaturals and Prophecies of the Bible — drives supernaturals.html.
 *
 * Reads assets/supernaturals.json (built and verse-checked by
 * tools/supernaturals/build_supernaturals.py): miracles, healings, the dead
 * raised, demons cast out, magic and sorcery, signs, wonders and angels, and
 * prophecies; then two special topics, Angels and Demons, which gather what the
 * whole Bible teaches and link to the events above that show it.
 * Each group is a section of cards; clicking one opens it in place, under the
 * row it sits in (rowExpander in study-utils.js). #lazarus-raised in the URL
 * opens Lazarus, and #what-are-angels the first special topic.
 */

import { h, fetchJson, para, refList, rowExpander, followHash, filterMenu } from './study-utils.js?v=20261002-3';

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
  'Prophecies': {
    cls: 'g-prophecy',
    intro: 'A king named before he was born, a Saviour\'s birthplace, his death, his rising and his return: words from God about what was still to come, and how they came true.',
    by: 'Spoken by',
    for: 'Spoken to',
    story: 'Foretold and fulfilled',
  },
  // The special topics: what the Bible teaches, gathered from many passages.
  'Angels': {
    cls: 'g-angels',
    intro: 'Who angels are, the angel of the LORD, cherubim and seraphim, Michael and Gabriel, the angels who guard God\'s people and serve Jesus, and why we worship God and not them.',
    story: 'What the Bible says',
    lesson: 'For your daily life',
  },
  'Demons': {
    cls: 'g-spirits',
    intro: 'Satan the adversary, where demons came from and what they do, Jesus\' authority over them, the armour of God, testing the spirits, and why a Christian need not fear.',
    story: 'What the Bible says',
    lesson: 'For your daily life',
  },
};

// The special topics' heading, over the Angels and Demons sections.
const SPECIAL_INTRO = 'Two topics people often ask about. Each gathers what the whole Bible says, and where it '
  + 'is silent, and links to the events on this page that show it.';

// Line icons, one per group (24 × 24, drawn with the current colour).
const ICONS = {
  'Power over nature': '<path d="M2 7c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M2 12c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0M2 17c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0"/>',
  'Food and plenty': '<path d="M4 12a8 5.5 0 0 1 16 0v5.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M8.5 9.5 7.8 12M12.3 8.8 11.8 11.8M16 9.5l-.7 2.5"/>',
  'Healings': '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  'Raised from the dead': '<path d="M3 19h18M6.5 19a5.5 5.5 0 0 1 11 0M12 4v4M5.2 8.2l2 2M18.8 8.2l-2 2M2.5 14.5h2.5M19 14.5h2.5"/>',
  'Casting out demons': '<path d="M9.5 7H7a4.5 4.5 0 0 0 0 9h2.5M14.5 7H17a4.5 4.5 0 0 1 0 9h-2.5M11 3.5l.8 2.5M13 18l.8 2.5"/>',
  'Magic and sorcery': '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/><path d="m9.5 6.5 5 5M14.5 6.5l-5 5"/>',
  'Signs, wonders and angels': '<path d="M12 22c3.9 0 6.5-2.8 6.5-6.5 0-3.4-2.3-5.4-3.5-8-1 1.8-1.8 2.6-2.8 2.8.2-2.4-.6-4.6-2.7-6.8-.8 3.1-4 5.9-4 10.2C5.5 19.2 8.1 22 12 22z"/>',
  'Prophecies': '<path d="M7 3h11a2 2 0 0 1 2 2v12M7 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2H9v2a2 2 0 0 1-2 2"/><path d="M9 8h7M9 11.5h7"/>',
  'Angels': '<path d="M12 11c-1.5-4-5-6.5-9-6.5 0 5 3 8.5 7 9.5M12 11c1.5-4 5-6.5 9-6.5 0 5-3 8.5-7 9.5"/><circle cx="12" cy="6" r="1.8"/><path d="M10 20l2-7 2 7z"/>',
  'Demons': '<path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6z"/><path d="M12 8v8M8.5 11.5h7"/>',
};

function icon(group, cls) {
  const span = h('span', { class: cls, 'aria-hidden': 'true' });
  // A fixed string from ICONS above, never data.
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[group] || ''}</svg>`;
  return span;
}

const testamentLabel = t => (t === 'Both' ? 'Both Testaments' : `${t} Testament`);

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
      h('span', { class: 'sn-meta' }, item.special
        ? `Special topic · ${item.accounts.length} passages`
        : `${testamentLabel(item.testament)} · ${item.told_in}`)));
}

// ------------------------------------------------------------------ detail

// A topic's links to the events on this page that show it; the hash opens them.
function relatedLinks(item, byId) {
  const found = (item.related || []).map(id => byId.get(id)).filter(Boolean);
  return found.length && h('ul', { class: 'related-links' },
    found.map(e => h('li', {}, h('a', { href: `#${encodeURIComponent(e.id)}` }, e.name))));
}

function detail(item, onClose, byId) {
  const g = GROUPS[item.group];
  const block = (title, ...body) => h('section', { class: 'detail-block' }, h('h4', {}, title), body);

  const facts = h('dl', { class: 'facts' },
    item.special && [h('dt', {}, 'Key passage'), h('dd', {}, item.told_in)],
    item.by?.length && [h('dt', {}, g.by || 'Done by'), h('dd', {}, people(item.by))],
    item.with?.length && [h('dt', {}, item.special ? 'Read about' : 'Also there'), h('dd', {}, people(item.with))],
    item.for && [h('dt', {}, g.for || 'For'), h('dd', {}, item.for)],
    item.where && [h('dt', {}, 'Where'), h('dd', {}, item.where)],
    [h('dt', {}, 'Testament'), h('dd', {}, testamentLabel(item.testament))]);

  const accounts = item.accounts?.length > 1 &&
    h('p', { class: 'accounts-note' }, item.special
      ? `Drawn from ${item.accounts.length} passages`
      : `Told or recalled in ${item.accounts.length} places`);
  const related = relatedLinks(item, byId);

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
      h('p', { class: 'detail-group' }, item.special
        ? `Special topic · ${item.group}`
        : `${item.group} · ${testamentLabel(item.testament)}`),
      h('h3', { id: 'sn-detail-title' }, item.name),
      para(item.epithet, 'detail-meaning'),
      para(item.summary, 'detail-summary')),
    h('div', { class: 'detail-cols' },
      h('div', { class: 'detail-main' },
        block(g.story || 'What happened', para(item.story)),
        item.meaning && block(g.meaning || 'Why it matters', para(item.meaning)),
        item.lesson && block(g.lesson || 'The lesson', para(item.lesson, 'lesson')),
        related && block('See it on this page', related)),
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
    console.error('Unable to load the supernaturals and prophecies:', error);
    view.replaceChildren(h('p', { class: 'status' },
      'The miracles, wonders and prophecies could not be loaded. Please try again later.'));
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
    expander.open(openTile, detail(item, () => expander.close({ focus: true }), byId), options);
  }

  function toggle(id) {
    if (expander.openId === id) expander.close();
    else open(id);
  }

  // --- filters ---------------------------------------------------------------

  const haystack = new Map(entries.map(e => [e.id,
    [e.name, e.epithet, e.summary, e.group, e.for, e.where, e.told_in, e.special && 'special topic',
      ...(e.by || []).map(p => p.name), ...(e.with || []).map(p => p.name)]
      .filter(Boolean).join(' ').toLowerCase()]));

  function apply() {
    const q = state.query.trim().toLowerCase();
    let shown = 0;
    for (const section of view.querySelectorAll('.group-section')) {
      const groupMatch = state.group === 'all' || section.dataset.group === state.group;
      let sectionShown = 0;
      for (const t of section.querySelectorAll('.sn-tile')) {
        const e = byId.get(t.dataset.id);
        const visible = groupMatch
          && (state.testament === 'all' || e.testament === state.testament || e.testament === 'Both')
          && (!q || haystack.get(e.id).includes(q));
        t.hidden = !visible;
        if (visible) sectionShown += 1;
      }
      section.hidden = sectionShown === 0;
      shown += sectionShown;
    }
    specialHead.hidden = [...view.querySelectorAll('.group-section.is-special')].every(x => x.hidden);
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
    placeholder: 'Search a miracle, prophecy, person or place…', 'aria-label': 'Search the miracles, wonders and prophecies'
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

  const special = new Set(data.special || []);
  const section = group => {
    const members = entries.filter(e => e.group === group);
    const id = `h-${group.toLowerCase().replace(/[^a-z]+/g, '-')}`;
    // Under the Special topics heading, a section's title is one level down.
    const title = special.has(group) ? 'h3' : 'h2';
    return h('section', {
      class: `panel group-section ${GROUPS[group].cls}${special.has(group) ? ' is-special' : ''}`,
      'data-group': group, 'aria-labelledby': id
    },
      h('header', { class: 'group-head' },
        h(title, { id }, icon(group, 'group-icon'), special.has(group) ? `Special topic: ${group}` : group),
        h('p', { class: 'group-count' }, `${members.length}`),
        para(GROUPS[group].intro, 'group-intro')),
      h('div', { class: 'sn-grid' }, members.map(e => tile(e, toggle))));
  };

  const specialHead = h('header', { class: 'special-head', id: 'special-topics' },
    h('p', { class: 'eyebrow' }, 'Special topics'),
    h('h2', {}, 'Angels and Demons'),
    para(SPECIAL_INTRO, 'special-intro'));

  // The hero's shortcuts: show one special topic and go to it.
  const showTopic = group => {
    resetFilters();
    state.group = group;
    apply();
    view.querySelector(`.group-section[data-group="${group}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const shortcuts = h('div', { class: 'special-links' },
    h('span', {}, 'Special topics:'),
    [...special].map(group => h('button', {
      type: 'button', class: `special-link ${GROUPS[group].cls}`, onclick: () => showTopic(group)
    }, icon(group, 'special-link-icon'), group, h('span', { class: 'chip-count' }, t.groups[group]))));

  const events = data.groups.filter(g => !special.has(g));
  const filters = filterMenu(
    h('ul', { class: 'stats' },
      h('li', {}, h('b', {}, t.events), 'accounts'),
      h('li', {}, h('b', {}, t.topics), 'special topics'),
      h('li', {}, h('b', {}, t.old), 'Old Testament'),
      h('li', {}, h('b', {}, t.new), 'New Testament')),
    chips);

  view.replaceChildren(
    h('section', { class: 'hero' },
      filters.button,
      h('h1', {}, 'Supernaturals and Prophecies'),
      h('p', { class: 'lede' },
        'Miracles, healings, the dead raised, demons cast out, the magic and sorcery the Bible ' +
        'warns against, and the prophecies God spoke and kept: what happened, why it matters, ' +
        'and what it teaches. Then two special topics: what the whole Bible says about angels, ' +
        'and about demons. Tap any one to read it.'),
      shortcuts,
      h('div', { class: 'finder' }, search),
      filters.menu),
    count,
    ...events.map(section),
    specialHead,
    ...[...special].map(section),
    empty);

  apply();
  followHash(id => open(id, { smooth: false }));
}
