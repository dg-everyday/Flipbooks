/**
 * Flora and Fauna of the Bible — drives flora-and-fauna.html.
 *
 * Reads assets/flora-and-fauna.json (built and verse-checked by
 * tools/flora-fauna/build_flora_fauna.py). Plants and animals each get a
 * section, split into groups (Trees, Birds, …) of cards; clicking one opens it
 * in place, under the row it sits in, and opening another closes the first
 * (rowExpander in study-utils.js). #olive in the URL opens the olive.
 */

import { h, fetchJson, para, rowExpander, followHash } from './study-utils.js?v=20260926-2';

const DATA = 'assets/flora-and-fauna.json';

const KINDS = {
  plant: {
    title: 'Plants',
    one: 'Plant',
    intro: 'Trees, crops, herbs and wild plants of the Bible lands: what people grew and gathered, and the pictures God drew from them.',
    who: 'Who used it',
  },
  animal: {
    title: 'Animals',
    one: 'Animal',
    intro: 'The flocks and herds people lived by, and the wild animals, birds and creeping things they met, feared and learned from.',
    who: 'Who met it',
  },
};

// Line icons, one per group (24 × 24, drawn with the current colour).
const ICONS = {
  'Trees': '<path d="M12 22v-7"/><path d="M12 15a5 5 0 0 0 5-5 4 4 0 0 0-2-3.5A3 3 0 0 0 12 3a3 3 0 0 0-3 3.5A4 4 0 0 0 7 10a5 5 0 0 0 5 5z"/>',
  'Vines and crops': '<path d="M12 22V6"/><path d="M12 9c-2-.5-3.5-2.2-3.5-4.5C10.5 5 12 6.7 12 9zM12 9c2-.5 3.5-2.2 3.5-4.5C13.5 5 12 6.7 12 9zM12 14c-2-.5-3.5-2.2-3.5-4.5 2 .5 3.5 2.2 3.5 4.5zM12 14c2-.5 3.5-2.2 3.5-4.5-2 .5-3.5 2.2-3.5 4.5zM12 19c-2-.5-3.5-2.2-3.5-4.5 2 .5 3.5 2.2 3.5 4.5zM12 19c2-.5 3.5-2.2 3.5-4.5-2 .5-3.5 2.2-3.5 4.5z"/>',
  'Herbs, flowers and spices': '<circle cx="12" cy="8" r="2"/><path d="M12 6a2.5 2.5 0 1 1 2.4-3.2M14 8a2.5 2.5 0 1 1 3.2 2.4M12 10a2.5 2.5 0 1 1-2.4 3.2M10 8a2.5 2.5 0 1 1-3.2-2.4"/><path d="M12 13v9M12 19c-1.6-1.8-3.6-2.4-5-2 .6 1.6 2.6 2.6 5 2z"/>',
  'Wild plants': '<path d="M5 21h14M12 21v-9"/><path d="M12 12c0-4 2.7-7 7-7 0 4-2.7 7-7 7zM12 15c0-3.3-2.4-5.5-6-5.5 0 3.3 2.4 5.5 6 5.5z"/>',
  'Flocks and herds': '<circle cx="6" cy="9" r="1.8"/><circle cx="10" cy="5.5" r="1.8"/><circle cx="14" cy="5.5" r="1.8"/><circle cx="18" cy="9" r="1.8"/><path d="M12 11c-3 0-5.5 3.6-5.5 6.2 0 1.6 1.2 2.8 2.8 2.8 1.1 0 1.8-.6 2.7-.6s1.6.6 2.7.6c1.6 0 2.8-1.2 2.8-2.8 0-2.6-2.5-6.2-5.5-6.2z"/>',
  'Wild animals': '<circle cx="6" cy="9" r="1.8"/><circle cx="10" cy="5.5" r="1.8"/><circle cx="14" cy="5.5" r="1.8"/><circle cx="18" cy="9" r="1.8"/><path d="M12 11c-3 0-5.5 3.6-5.5 6.2 0 1.6 1.2 2.8 2.8 2.8 1.1 0 1.8-.6 2.7-.6s1.6.6 2.7.6c1.6 0 2.8-1.2 2.8-2.8 0-2.6-2.5-6.2-5.5-6.2z"/>',
  'Birds': '<path d="M3 15c3 4.5 10 5 14 1l4-5.5-3.5-.5C16.5 7.5 14 6.5 12 7.5c-2 1-2.5 3-2.5 5C7 13.5 5 14 3 15z"/><path d="M15.5 9.5h.01M10 19.5V22M13.5 19.3V22"/>',
  'Creatures of the water': '<path d="M2 12c3.5-5 10-6.5 14.5-2.5L21 6.5v11l-4.5-3C12 18.5 5.5 17 2 12z"/><path d="M7.5 11h.01"/>',
  'Creeping things': '<circle cx="12" cy="5.5" r="2"/><path d="M12 8a3.5 3.5 0 0 1 3.5 3.5v4a3.5 3.5 0 0 1-7 0v-4A3.5 3.5 0 0 1 12 8zM8.5 11H4.5M8.5 15H4.5M15.5 11h4M15.5 15h4M9.5 18.5 7.5 21M14.5 18.5l2 2.5"/>',
};

function icon(group, cls) {
  const span = h('span', { class: cls, 'aria-hidden': 'true' });
  // A fixed string from ICONS above, never data.
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[group] || ''}</svg>`;
  return span;
}

const verseCount = n => `${n} ${n === 1 ? 'verse' : 'verses'}`;

// ------------------------------------------------------------------ cards

function tile(item, onToggle) {
  return h('button', {
    type: 'button', class: 'ff-tile', id: `tile-${item.id}`, 'data-id': item.id,
    'aria-expanded': 'false', 'aria-controls': 'ff-detail', onclick: () => onToggle(item.id)
  },
    icon(item.group, 'ff-mark'),
    h('span', { class: 'ff-text' },
      h('span', { class: 'ff-name' }, item.name),
      h('span', { class: 'ff-epithet' }, item.epithet),
      item.mentions && h('span', { class: 'ff-meta' }, `In ${verseCount(item.mentions.verses)} of the KJV`)));
}

// ------------------------------------------------------------------ detail

function mentionBar(m) {
  const pct = m.verses ? Math.round((m.old / m.verses) * 100) : 0;
  return h('div', { class: 'mention-split' },
    h('div', { class: 'mention-bar', role: 'img', 'aria-label': `${m.old} in the Old Testament, ${m.new} in the New` },
      h('span', { class: 'mention-old', style: `width:${pct}%` }),
      h('span', { class: 'mention-new', style: `width:${100 - pct}%` })),
    h('p', { class: 'mention-key' },
      h('span', { class: 'key-old' }, `Old Testament ${m.old}`),
      h('span', { class: 'key-new' }, `New Testament ${m.new}`)));
}

function detail(item, onClose) {
  const kind = KINDS[item.kind];
  const m = item.mentions;
  const block = (title, ...body) => h('section', { class: 'detail-block' }, h('h4', {}, title), body);

  const uses = item.uses?.length && h('ul', { class: 'uses' }, item.uses.map(u => h('li', {}, u)));

  const who = item.who?.length && h('ul', { class: 'who' },
    item.who.map(w => h('li', {},
      h('p', {},
        w.hero
          ? h('a', { class: 'who-name', href: `heroes-and-villains.html#${encodeURIComponent(w.hero)}` }, w.who)
          : h('strong', { class: 'who-name' }, w.who),
        ' ', w.what),
      h('span', { class: 'who-ref' }, w.reference))));

  const books = m?.books?.length && h('ul', { class: 'book-counts' },
    m.books.map(b => h('li', {},
      h('a', { href: `bible-books.html#${encodeURIComponent(b.id)}` }, b.name,
        h('span', { class: 'book-count' }, b.verses)))));

  const verses = item.key_verses?.length && h('div', { class: 'verses' },
    item.key_verses.map(v => h('figure', { class: 'verse' },
      h('blockquote', {}, v.text),
      h('figcaption', {}, v.reference))));

  return h('div', {
    class: `row-panel kind-${item.kind}`, id: 'ff-detail', role: 'region',
    'aria-labelledby': 'ff-detail-title', tabindex: '-1'
  },
    h('button', { type: 'button', class: 'panel-close', 'aria-label': `Close ${item.name}`, onclick: onClose }, '×'),
    h('header', { class: 'detail-head' },
      h('p', { class: 'detail-group' }, `${kind.one} · ${item.group}`),
      h('h3', { id: 'ff-detail-title' }, item.name),
      para(item.epithet, 'detail-meaning'),
      para(item.summary, 'detail-summary')),
    h('div', { class: 'detail-cols' },
      h('div', { class: 'detail-main' },
        block('Why it is in the Bible', para(item.why)),
        uses && block('In daily life', uses),
        who && block(kind.who, who),
        item.importance && block('Why it matters', para(item.importance)),
        item.lesson && block('The lesson', para(item.lesson, 'lesson'))),
      h('div', { class: 'detail-side' },
        m && block('In the King James Bible',
          h('p', { class: 'mention-total' }, h('b', {}, m.verses), m.verses === 1 ? ' verse' : ' verses'),
          mentionBar(m)),
        m && block('First mentioned',
          h('figure', { class: 'verse first-verse' },
            h('blockquote', {}, m.first.text),
            h('figcaption', {}, m.first.reference))),
        item.law && block('Under the Law', para(item.law, 'law')),
        books && block('Mentioned most in', books),
        verses && block('Key verses', verses))));
}

// ------------------------------------------------------------------ page

export async function start(view) {
  let data;
  try {
    data = await fetchJson(DATA);
  } catch (error) {
    console.error('Unable to load the flora and fauna:', error);
    view.replaceChildren(h('p', { class: 'status' },
      'The plants and animals could not be loaded. Please try again later.'));
    return;
  }

  const everything = [...data.plants, ...data.animals];
  const byId = new Map(everything.map(item => [item.id, item]));
  const state = { kind: 'all', query: '' };
  const expander = rowExpander({ tileSelector: '.ff-tile' });

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

  const haystack = new Map(everything.map(item => [item.id,
    [item.name, item.epithet, item.summary, item.group, ...(item.uses || []),
      ...(item.who || []).map(w => w.who)]
      .join(' ').toLowerCase()]));

  function apply() {
    const q = state.query.trim().toLowerCase();
    let shown = 0;
    for (const section of view.querySelectorAll('.kind-section')) {
      const kindMatch = state.kind === 'all' || section.dataset.kind === state.kind;
      let sectionShown = 0;
      for (const group of section.querySelectorAll('.ff-group')) {
        let groupShown = 0;
        for (const t of group.querySelectorAll('.ff-tile')) {
          const visible = kindMatch && (!q || haystack.get(t.dataset.id).includes(q));
          t.hidden = !visible;
          if (visible) groupShown += 1;
        }
        group.hidden = groupShown === 0;
        sectionShown += groupShown;
      }
      section.hidden = sectionShown === 0;
      shown += sectionShown;
    }
    if (expander.openTile?.hidden) expander.close();
    else expander.place();
    count.textContent = shown === everything.length ? '' : `Showing ${shown} of ${everything.length}`;
    empty.hidden = shown !== 0;
    for (const c of view.querySelectorAll('.chip')) {
      c.setAttribute('aria-pressed', String(state[c.dataset.filter] === c.dataset.value));
    }
  }

  function resetFilters() {
    state.kind = 'all';
    state.query = '';
    search.value = '';
    apply();
  }

  // --- build the page --------------------------------------------------------

  const search = h('input', {
    type: 'search', class: 'search', autocomplete: 'off',
    placeholder: 'Search a plant, animal, use or person…', 'aria-label': 'Search the plants and animals'
  });
  search.addEventListener('input', () => { state.query = search.value; apply(); });

  const chip = (value, label, n, cls) => h('button', {
    type: 'button', class: `chip${cls ? ` ${cls}` : ''}`, 'data-filter': 'kind', 'data-value': value,
    'aria-pressed': String(state.kind === value)
  }, label, n != null && h('span', { class: 'chip-count' }, n));

  const t = data.totals;
  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Show plants or animals' },
    chip('all', 'Everything', t.entries),
    chip('plant', 'Plants', t.plants, 'kind-plant'),
    chip('animal', 'Animals', t.animals, 'kind-animal'));
  chips.addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c) return;
    state.kind = c.dataset.value;
    apply();
  });

  const count = h('p', { class: 'result-count', 'aria-live': 'polite' });
  const empty = h('p', { class: 'status', hidden: true }, 'Nothing matches that search.');

  const section = (kind, items) => h('section', {
    class: `panel kind-section kind-${kind}`, 'data-kind': kind, 'aria-labelledby': `h-${kind}`
  },
    h('header', { class: 'kind-head' },
      h('h2', { id: `h-${kind}` }, KINDS[kind].title),
      h('p', { class: 'kind-count' }, `${items.length} ${KINDS[kind].title.toLowerCase()}`),
      para(KINDS[kind].intro, 'kind-intro')),
    data.groups[kind].map(group => {
      const members = items.filter(item => item.group === group);
      return members.length && h('div', { class: 'ff-group' },
        h('h3', { class: 'group-title' }, icon(group, 'group-icon'), group),
        h('div', { class: 'ff-grid' }, members.map(item => tile(item, toggle))));
    }));

  view.replaceChildren(
    h('section', { class: 'hero' },
      h('h1', {}, 'Flora and Fauna'),
      h('p', { class: 'lede' },
        'The plants and animals of the Bible: what they were used for, why they are in Scripture, ' +
        'who used them and why they still matter. Tap any one to read about it.'),
      h('ul', { class: 'stats' },
        h('li', {}, h('b', {}, t.plants), 'plants'),
        h('li', {}, h('b', {}, t.animals), 'animals')),
      h('div', { class: 'finder' }, search),
      chips),
    count,
    section('plant', data.plants),
    section('animal', data.animals),
    empty);

  apply();
  followHash(id => open(id, { smooth: false }));
}
