/**
 * Guidance for Life — drives guidance-for-life.html.
 *
 * Reads assets/guidance-for-life.json (built and verse-checked by
 * tools/guidance/build_guidance.py): the questions of life, each answered by
 * the voices of Scripture — Jesus, the prophets, the apostles, the wisdom
 * books, and the Law and the histories. Topics sit in sections (Heart and
 * mind, Relationships, … The future); clicking one opens it in place, under
 * the row it sits in (rowExpander in study-utils.js). #forgiveness in the URL
 * opens Forgiveness.
 */

import { h, fetchJson, para, rowExpander, followHash } from './study-utils.js?v=20260926-2';

const DATA = 'assets/guidance-for-life.json';

const SECTIONS = {
  'Heart and mind': {
    cls: 's-heart',
    intro: 'Worry, fear, anger, pride and temptation: what goes on inside, and how God meets us there.',
    icon: '<path d="M12 20s-7-4.4-9.2-8.6C1.2 8.2 3 4.5 6.5 4.5c2.1 0 3.6 1.2 4.5 2.7.9-1.5 2.4-2.7 4.5-2.7 3.5 0 5.3 3.7 3.7 6.9C18.9 15.6 12 20 12 20z"/>',
  },
  'Relationships': {
    cls: 's-people',
    intro: 'Love, forgiveness, marriage, family, friends and enemies, and the words we say to each other.',
    icon: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c.6-.3 1.3-.5 2-.5 2.8 0 5 2.2 5 5"/>',
  },
  'Work and money': {
    cls: 's-work',
    intro: 'Our work, our money and what we do with it: honesty, generosity and justice for the poor.',
    icon: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  },
  'Walking with God': {
    cls: 's-walk',
    intro: 'Purpose, prayer, faith, finding God\'s will, rest, and a life spent serving others.',
    icon: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  },
  'Hard times': {
    cls: 's-hard',
    intro: 'Suffering, grief, discouragement and loneliness. Scripture does not look away from pain.',
    icon: '<path d="M7 16a4 4 0 0 1-.6-7.95A6 6 0 0 1 18 9a3.5 3.5 0 0 1 0 7z"/><path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2"/>',
  },
  'The future': {
    cls: 's-future',
    intro: 'Hope, death and eternal life, Christ\'s return, judgement, and the new heaven and earth: guidance for what is still to come.',
    icon: '<path d="M3 19h18M6.5 19a5.5 5.5 0 0 1 11 0M12 4v4M5.2 8.2l2 2M18.8 8.2l-2 2M2.5 14.5h2.5M19 14.5h2.5"/>',
  },
};

const VOICES = {
  'Jesus': { cls: 'v-jesus', short: 'Jesus' },
  'The prophets': { cls: 'v-prophets', short: 'Prophets' },
  'The apostles': { cls: 'v-apostles', short: 'Apostles' },
  'Wisdom': { cls: 'v-wisdom', short: 'Wisdom' },
  'Law and history': { cls: 'v-law', short: 'Law and history' },
};

function icon(section, cls) {
  const span = h('span', { class: cls, 'aria-hidden': 'true' });
  // A fixed string from SECTIONS above, never data.
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${SECTIONS[section]?.icon || ''}</svg>`;
  return span;
}

// ------------------------------------------------------------------ cards

function tile(topic, onToggle) {
  return h('button', {
    type: 'button', class: 'gl-tile', id: `tile-${topic.id}`, 'data-id': topic.id,
    'aria-expanded': 'false', 'aria-controls': 'gl-detail', onclick: () => onToggle(topic.id)
  },
    icon(topic.section, 'gl-mark'),
    h('span', { class: 'gl-text' },
      h('span', { class: 'gl-name' }, topic.name),
      h('span', { class: 'gl-question' }, topic.question),
      h('span', { class: 'gl-meta' },
        h('span', { class: 'voice-dots', 'aria-label': `Voices: ${topic.voices.join(', ')}` },
          topic.voices.map(v => h('span', { class: `voice-dot ${VOICES[v].cls}`, title: v }))),
        `${topic.teachings.length} passages`)));
}

// ------------------------------------------------------------------ detail

function teaching(t) {
  const who = t.hero
    ? h('a', { href: `heroes-and-villains.html#${encodeURIComponent(t.hero)}` }, t.who)
    : t.who;
  return h('figure', { class: 'teaching' },
    h('blockquote', {}, t.text),
    h('figcaption', {}, h('span', { class: 'teaching-ref' }, t.reference), ' · ', who,
      t.example && h('span', { class: 'teaching-example' }, ' · his example')),
    t.note && h('p', { class: 'teaching-note' }, t.note));
}

function detail(topic, onClose) {
  const s = SECTIONS[topic.section];
  const block = (title, ...body) => h('section', { class: 'detail-block' }, h('h4', {}, title), body);

  const byVoice = Object.keys(VOICES)
    .map(v => [v, topic.teachings.filter(t => t.voice === v)])
    .filter(([, list]) => list.length);

  const scripture = h('div', { class: 'voices' },
    byVoice.map(([v, list]) => h('section', { class: `voice-group ${VOICES[v].cls}` },
      h('h5', { class: 'voice-title' }, h('span', { class: 'voice-dot', 'aria-hidden': 'true' }), v),
      list.map(teaching))));

  const old = topic.teachings.filter(t => t.testament === 'Old').length;
  const neu = topic.teachings.length - old;

  return h('div', {
    class: `row-panel ${s.cls}`, id: 'gl-detail', role: 'region',
    'aria-labelledby': 'gl-detail-title', tabindex: '-1'
  },
    h('button', { type: 'button', class: 'panel-close', 'aria-label': `Close ${topic.name}`, onclick: onClose }, '×'),
    h('header', { class: 'detail-head' },
      h('p', { class: 'detail-group' }, topic.section),
      h('h3', { id: 'gl-detail-title' }, topic.name),
      para(topic.question, 'detail-meaning'),
      para(topic.summary, 'detail-summary')),
    h('div', { class: 'detail-cols' },
      h('div', { class: 'detail-main' },
        block('In plain words', para(topic.guidance)),
        block('What Scripture says', scripture)),
      h('div', { class: 'detail-side' },
        topic.practice && block('Try this', para(topic.practice, 'practice')),
        topic.prayer && block('A prayer', para(topic.prayer, 'prayer')),
        block('Voices', h('ul', { class: 'voice-list' },
          byVoice.map(([v, list]) => h('li', { class: VOICES[v].cls },
            h('span', { class: 'voice-dot', 'aria-hidden': 'true' }), v, h('b', {}, list.length)))),
          h('p', { class: 'testament-note' },
            `${old} from the Old Testament, ${neu} from the New`)))));
}

// ------------------------------------------------------------------ page

export async function start(view) {
  let data;
  try {
    data = await fetchJson(DATA);
  } catch (error) {
    console.error('Unable to load the guidance:', error);
    view.replaceChildren(h('p', { class: 'status' },
      'The guidance could not be loaded. Please try again later.'));
    return;
  }

  const topics = data.topics;
  const byId = new Map(topics.map(t => [t.id, t]));
  const state = { section: 'all', voice: 'all', query: '' };
  const expander = rowExpander({ tileSelector: '.gl-tile' });

  // --- opening and closing -------------------------------------------------

  function open(id, options) {
    const topic = byId.get(id);
    let openTile = document.getElementById(`tile-${id}`);
    if (!topic || !openTile) return;
    // A link may point at something the filters are hiding.
    if (openTile.hidden) {
      resetFilters();
      openTile = document.getElementById(`tile-${id}`);
    }
    expander.open(openTile, detail(topic, () => expander.close({ focus: true })), options);
  }

  function toggle(id) {
    if (expander.openId === id) expander.close();
    else open(id);
  }

  // --- filters ---------------------------------------------------------------

  const haystack = new Map(topics.map(t => [t.id,
    [t.name, t.question, t.summary, t.guidance, t.section,
      ...t.teachings.flatMap(x => [x.who, x.note, x.reference])]
      .join(' ').toLowerCase()]));

  function apply() {
    const q = state.query.trim().toLowerCase();
    let shown = 0;
    for (const section of view.querySelectorAll('.life-section')) {
      const sectionMatch = state.section === 'all' || section.dataset.section === state.section;
      let sectionShown = 0;
      for (const tl of section.querySelectorAll('.gl-tile')) {
        const t = byId.get(tl.dataset.id);
        const visible = sectionMatch
          && (state.voice === 'all' || t.voices.includes(state.voice))
          && (!q || haystack.get(t.id).includes(q));
        tl.hidden = !visible;
        if (visible) sectionShown += 1;
      }
      section.hidden = sectionShown === 0;
      shown += sectionShown;
    }
    if (expander.openTile?.hidden) expander.close();
    else expander.place();
    count.textContent = shown === topics.length ? '' : `Showing ${shown} of ${topics.length}`;
    empty.hidden = shown !== 0;
    for (const c of view.querySelectorAll('.chip')) {
      c.setAttribute('aria-pressed', String(state[c.dataset.filter] === c.dataset.value));
    }
  }

  function resetFilters() {
    state.section = 'all';
    state.voice = 'all';
    state.query = '';
    search.value = '';
    apply();
  }

  // --- build the page --------------------------------------------------------

  const search = h('input', {
    type: 'search', class: 'search', autocomplete: 'off',
    placeholder: 'Search a question, word or verse…', 'aria-label': 'Search the guidance'
  });
  search.addEventListener('input', () => { state.query = search.value; apply(); });

  const chip = (filter, value, label, n, cls) => h('button', {
    type: 'button', class: `chip${cls ? ` ${cls}` : ''}`, 'data-filter': filter, 'data-value': value,
    'aria-pressed': String(state[filter] === value)
  }, label, n != null && h('span', { class: 'chip-count' }, n));

  const tot = data.totals;
  const chips = h('div', { class: 'chip-rows' },
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Show one part of life' },
      chip('section', 'all', 'All of life', tot.topics),
      data.sections.map(s => chip('section', s, s, tot.sections[s], SECTIONS[s].cls))),
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Show topics where this voice speaks' },
      chip('voice', 'all', 'Every voice'),
      data.voices.map(v => chip('voice', v, v, tot.voices[v], VOICES[v].cls))));
  chips.addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c) return;
    state[c.dataset.filter] = c.dataset.value;
    apply();
  });

  const count = h('p', { class: 'result-count', 'aria-live': 'polite' });
  const empty = h('p', { class: 'status', hidden: true }, 'Nothing matches that search.');

  const section = name => {
    const members = topics.filter(t => t.section === name);
    const id = `h-${name.toLowerCase().replace(/[^a-z]+/g, '-')}`;
    return h('section', {
      class: `panel life-section ${SECTIONS[name].cls}`, 'data-section': name, 'aria-labelledby': id
    },
      h('header', { class: 'life-head' },
        h('h2', { id }, icon(name, 'life-icon'), name),
        h('p', { class: 'life-count' }, `${members.length}`),
        para(SECTIONS[name].intro, 'life-intro')),
      h('div', { class: 'gl-grid' }, members.map(t => tile(t, toggle))));
  };

  view.replaceChildren(
    h('section', { class: 'hero' },
      h('h1', {}, 'Guidance for Life'),
      h('p', { class: 'lede' },
        'The questions we all bring to life, answered by the whole of Scripture: the teaching of ' +
        'Jesus, the prophets, the apostles, the wisdom books and the Law. Guidance from of old, and ' +
        'for the future. Tap a question to read it.'),
      h('ul', { class: 'stats' },
        h('li', {}, h('b', {}, tot.topics), 'questions'),
        h('li', {}, h('b', {}, tot.teachings), 'passages'),
        h('li', {}, h('b', {}, data.voices.length), 'voices')),
      h('div', { class: 'finder' }, search),
      chips),
    count,
    ...data.sections.map(section),
    empty);

  apply();
  followHash(id => open(id, { smooth: false }));
}
