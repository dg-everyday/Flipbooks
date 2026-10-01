/**
 * Poems, Songs and Wisdom — drives poems-songs-and-wisdom.html.
 *
 * Reads assets/poems-songs-and-wisdom.json (built and verse-checked by
 * tools/poetry/build_poetry.py): the poems of the prophets and the New
 * Testament; the songs of victory, worship and grief, the psalms, the songs of
 * the prophets, of Jesus' birth, of the church and of heaven; and the wisdom of
 * Proverbs, Job, Ecclesiastes, Jesus and the apostles, each with what it means
 * for daily life. The page is in three parts, one per kind, and each group is a
 * section of cards; clicking one opens it in place, under the row it sits in
 * (rowExpander in study-utils.js). #the-lord-is-my-shepherd in the URL opens
 * Psalm 23. songs-in-the-bible.html, the page's old name, forwards here with
 * its hash, so the songs keep their links.
 */

import { h, fetchJson, para, refList, rowExpander, followHash } from './study-utils.js?v=20261002-2';

const DATA = 'assets/poems-songs-and-wisdom.json';

// Per kind: one word for a card, the label for who gave it, the heading over
// its words, and an intro.
const KINDS = {
  'Poems': {
    one: 'Poem', by: 'Written by', words: 'From the poem',
    intro: 'The Bible\'s great poems outside its songbook: the prophets\' visions of comfort and peace, and the poems of the New Testament on the Word made flesh, love, and the victory over death.',
  },
  'Songs': {
    one: 'Song', by: 'Sung by', words: 'From the song',
    intro: 'From Moses at the Red Sea to the new song of heaven: the songs God\'s people sang in victory, worship and grief, the psalms they loved, and the hymns of the first Christians.',
  },
  'Wisdom': {
    one: 'Wisdom', by: 'Written by', words: 'The words',
    intro: 'Wisdom for ordinary days and hard questions: Proverbs on words, work, money and friends, Job and Ecclesiastes on suffering and meaning, and the wisdom of Jesus and the apostles.',
  },
};

// Per group: a CSS class for its colour, and an intro.
const GROUPS = {
  'Poems of the prophets': {
    cls: 'g-oracles',
    intro: 'Isaiah and Micah wrote poems of comfort for the weary, a servant who suffers for others, a free invitation to the thirsty, and a world where swords become plowshares.',
  },
  'Poems of the New Testament': {
    cls: 'g-letters',
    intro: 'John\'s poem of the Word made flesh, and Paul\'s on love, on nothing separating us from God, on Christ above all things, and on death swallowed up in victory.',
  },
  'Songs of victory': {
    cls: 'g-victory',
    intro: 'Sung on the far side of a rescue: at the Red Sea, after Deborah\'s battle, as an army came home. And the first song of all, a boast of revenge.',
  },
  'Worship and thanksgiving': {
    cls: 'g-worship',
    intro: 'A well in the desert, the ark coming home, a temple filled with glory, and a prison at midnight: God\'s people giving thanks out loud.',
  },
  'Laments': {
    cls: 'g-lament',
    intro: 'Songs of grief for the fallen, for a ruined city and for sin. The Bible gives words for tears as well as for joy.',
  },
  'Psalms and songs of Solomon': {
    cls: 'g-psalms',
    intro: 'Israel\'s songbook of 150 psalms, a few of the best loved, with the Song of Songs and the songs of Solomon.',
  },
  'Songs of the prophets': {
    cls: 'g-prophets',
    intro: 'Moses\' last song, Isaiah\'s vineyard, a prayer from inside a fish: the prophets often sang their message.',
  },
  'Songs of the coming King': {
    cls: 'g-advent',
    intro: 'Mary, Zacharias, the angels and Simeon greet the coming of Jesus in song, and the crowds sing “Hosanna” as he rides into Jerusalem.',
  },
  'Songs of the church and of heaven': {
    cls: 'g-heaven',
    intro: 'The hymns of the first Christians, and the songs John heard around the throne of God, where the Bible\'s story ends in praise.',
  },
  'Proverbs for every day': {
    cls: 'g-proverbs',
    intro: 'Short sayings for daily life: where wisdom begins, work, words, pride, friends, plans, joy, money, self-control, and a portrait of a woman of strength.',
  },
  'Wisdom for hard questions': {
    cls: 'g-hard',
    intro: 'Job and Ecclesiastes face what Proverbs leaves out: suffering without a reason, and a life that feels like chasing the wind. Their answers are honest, and they end in God.',
  },
  'Wisdom of Jesus and the apostles': {
    cls: 'g-sayings',
    intro: 'The Beatitudes, salt and light, treasure in heaven and the two builders, with James on wisdom and the tongue and Paul on the mind and the cross.',
  },
};

// Line icons, one per group (24 × 24, drawn with the current colour).
const ICONS = {
  'Poems of the prophets': '<path d="M5 19c4-1 7-4 9-8l4-7c1 3 0 7-2 10-2 4-6 5-11 5z"/><path d="M5 19l5-5"/>',
  'Poems of the New Testament': '<path d="M4 5.5C6.5 4 9.5 4 12 5.5v14C9.5 18 6.5 18 4 19.5zM20 5.5C17.5 4 14.5 4 12 5.5v14c2.5-1.5 5.5-1.5 8 0z"/>',
  'Songs of victory': '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="4.5" r="1.4"/><circle cx="12" cy="19.5" r="1.4"/><circle cx="4.5" cy="12" r="1.4"/><circle cx="19.5" cy="12" r="1.4"/>',
  'Worship and thanksgiving': '<path d="M7 4c-2 3-2 8 1 11h8c3-3 3-8 1-11"/><path d="M8 15v5h8v-5M10 7v8M12 6v9M14 7v8"/>',
  'Laments': '<path d="M12 3c3 4.5 6 8 6 11a6 6 0 0 1-12 0c0-3 3-6.5 6-11z"/>',
  'Psalms and songs of Solomon': '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  'Songs of the prophets': '<path d="M7 3h11a2 2 0 0 1 2 2v12M7 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2H9v2a2 2 0 0 1-2 2"/><path d="M9 8h7M9 11.5h7"/>',
  'Songs of the coming King': '<path d="m12 3 2.6 5.8 6.4.7-4.8 4.3 1.4 6.2L12 16.9 6.4 20l1.4-6.2L3 9.5l6.4-.7z"/>',
  'Songs of the church and of heaven': '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
  'Proverbs for every day': '<path d="M12 3v3M5.6 5.6l2.1 2.1M18.4 5.6l-2.1 2.1"/><path d="M9 18h6M10 21h4M12 8a5 5 0 0 0-3 9h6a5 5 0 0 0-3-9z"/>',
  'Wisdom for hard questions': '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/>',
  'Wisdom of Jesus and the apostles': '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
};

function icon(group, cls) {
  const span = h('span', { class: cls, 'aria-hidden': 'true' });
  // A fixed string from ICONS above, never data.
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[group] || ''}</svg>`;
  return span;
}

const testamentLabel = t => `${t} Testament`;

function people(list) {
  return list?.length && h('ul', { class: 'sg-people' },
    list.map(p => h('li', {},
      p.hero
        ? h('a', { href: `heroes-and-villains.html#${encodeURIComponent(p.hero)}` }, p.name)
        : h('span', {}, p.name))));
}

// The passage's own words: one line per verse, each passage with its reference.
function passageWords(words) {
  return words?.length && h('div', { class: 'passage-words' },
    words.map(s => h('figure', { class: 'passage' },
      h('blockquote', {}, s.lines.map(line => h('p', {}, line))),
      h('figcaption', {}, s.reference))));
}

// ------------------------------------------------------------------ cards

function tile(item, onToggle) {
  return h('button', {
    type: 'button', class: 'sg-tile', id: `tile-${item.id}`, 'data-id': item.id,
    'aria-expanded': 'false', 'aria-controls': 'sg-detail', onclick: () => onToggle(item.id)
  },
    icon(item.group, 'sg-mark'),
    h('span', { class: 'sg-text' },
      h('span', { class: 'sg-name' }, item.name),
      h('span', { class: 'sg-epithet' }, item.epithet),
      h('span', { class: 'sg-meta' },
        `${KINDS[item.kind].one} · ${testamentLabel(item.testament)} · ${item.told_in}`)));
}

// ------------------------------------------------------------------ detail

function detail(item, onClose) {
  const g = GROUPS[item.group];
  const k = KINDS[item.kind];
  const block = (title, ...body) => h('section', { class: 'detail-block' }, h('h4', {}, title), body);

  const facts = h('dl', { class: 'facts' },
    item.by?.length && [h('dt', {}, item.by_label || k.by), h('dd', {}, people(item.by))],
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

  const words = passageWords(item.words);

  return h('div', {
    class: `row-panel ${g.cls}`, id: 'sg-detail', role: 'region',
    'aria-labelledby': 'sg-detail-title', tabindex: '-1'
  },
    h('button', { type: 'button', class: 'panel-close', 'aria-label': `Close ${item.name}`, onclick: onClose }, '×'),
    h('header', { class: 'detail-head' },
      h('p', { class: 'detail-group' }, `${item.group} · ${testamentLabel(item.testament)}`),
      h('h3', { id: 'sg-detail-title' }, item.name),
      para(item.epithet, 'detail-meaning'),
      para(item.summary, 'detail-summary')),
    h('div', { class: 'detail-cols' },
      h('div', { class: 'detail-main' },
        words && block(k.words, words),
        block('The story behind it', para(item.story)),
        item.meaning && block('Why it matters', para(item.meaning)),
        item.lesson && block('For your daily life', para(item.lesson, 'lesson'))),
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
    console.error('Unable to load the poems, songs and wisdom:', error);
    view.replaceChildren(h('p', { class: 'status' },
      'The poems, songs and wisdom could not be loaded. Please try again later.'));
    return;
  }

  const entries = data.entries;
  const byId = new Map(entries.map(e => [e.id, e]));
  const kindOf = new Map(data.kinds.flatMap(k => k.groups.map(g => [g, k.name])));
  const state = { kind: 'all', group: 'all', testament: 'all', query: '' };
  const expander = rowExpander({ tileSelector: '.sg-tile' });

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
    [e.name, e.epithet, e.summary, e.group, e.kind, e.occasion, e.where, e.told_in, e.lesson,
      ...(e.by || []).map(p => p.name), ...(e.with || []).map(p => p.name),
      ...(e.words || []).flatMap(s => s.lines)]
      .filter(Boolean).join(' ').toLowerCase()]));

  function apply() {
    const q = state.query.trim().toLowerCase();
    let shown = 0;
    for (const section of view.querySelectorAll('.group-section')) {
      const groupMatch = (state.kind === 'all' || kindOf.get(section.dataset.group) === state.kind)
        && (state.group === 'all' || section.dataset.group === state.group);
      let sectionShown = 0;
      for (const t of section.querySelectorAll('.sg-tile')) {
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
    // A kind's heading shows while any of its sections does.
    for (const head of view.querySelectorAll('.kind-head')) {
      head.hidden = ![...view.querySelectorAll(`.group-section[data-kind="${head.dataset.kind}"]`)]
        .some(section => !section.hidden);
    }
    // The group chips show once a kind is chosen, and offer only its groups,
    // so a phone is not faced with a dozen of them at once.
    groupChips.hidden = state.kind === 'all';
    for (const c of groupChips.querySelectorAll('.chip')) {
      c.hidden = c.dataset.value !== 'all' && kindOf.get(c.dataset.value) !== state.kind;
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
    state.kind = 'all';
    state.group = 'all';
    state.testament = 'all';
    state.query = '';
    search.value = '';
    apply();
  }

  // --- build the page --------------------------------------------------------

  const search = h('input', {
    type: 'search', class: 'search', autocomplete: 'off',
    placeholder: 'Search a song, poem, proverb or line…', 'aria-label': 'Search the poems, songs and wisdom of the Bible'
  });
  search.addEventListener('input', () => { state.query = search.value; apply(); });

  const chip = (filter, value, label, n, cls) => h('button', {
    type: 'button', class: `chip${cls ? ` ${cls}` : ''}`, 'data-filter': filter, 'data-value': value,
    'aria-pressed': String(state[filter] === value)
  }, label, n != null && h('span', { class: 'chip-count' }, n));

  const t = data.totals;
  const groupChips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Show one group' },
    chip('group', 'all', 'Every group'),
    data.groups.map(g => chip('group', g, g, t.groups[g], GROUPS[g].cls)));
  const chips = h('div', { class: 'chip-rows' },
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Show one kind' },
      chip('kind', 'all', 'Poems, songs and wisdom', t.entries),
      data.kinds.map(k => chip('kind', k.name, k.name, t.kinds[k.name]))),
    groupChips,
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Filter by testament' },
      chip('testament', 'all', 'Both Testaments'),
      chip('testament', 'Old', 'Old Testament', t.old),
      chip('testament', 'New', 'New Testament', t.new)));
  chips.addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c) return;
    state[c.dataset.filter] = c.dataset.value;
    // A new kind starts from all of its groups.
    if (c.dataset.filter === 'kind') state.group = 'all';
    apply();
  });

  const count = h('p', { class: 'result-count', 'aria-live': 'polite' });
  const empty = h('p', { class: 'status', hidden: true }, 'Nothing matches that search.');

  const section = group => {
    const members = entries.filter(e => e.group === group);
    const id = `h-${group.toLowerCase().replace(/[^a-z]+/g, '-')}`;
    return h('section', {
      class: `panel group-section ${GROUPS[group].cls}`, 'data-group': group,
      'data-kind': kindOf.get(group), 'aria-labelledby': id
    },
      h('header', { class: 'group-head' },
        h('h3', { id }, icon(group, 'group-icon'), group),
        h('p', { class: 'group-count' }, `${members.length}`),
        para(GROUPS[group].intro, 'group-intro')),
      h('div', { class: 'sg-grid' }, members.map(e => tile(e, toggle))));
  };

  // Each kind: a heading, then its groups.
  const part = kind => [
    h('header', { class: 'kind-head', 'data-kind': kind.name },
      h('h2', {}, kind.name, h('span', { class: 'kind-count' }, `${t.kinds[kind.name]}`)),
      para(KINDS[kind.name].intro, 'kind-intro')),
    ...kind.groups.map(section),
  ];

  view.replaceChildren(
    h('section', { class: 'hero' },
      h('h1', {}, 'Poems, Songs and Wisdom'),
      h('p', { class: 'lede' },
        'The poetry of the Bible, written to be read aloud, sung and remembered: the poems of the ' +
        'prophets and apostles, the songs God\'s people sang from the Red Sea to heaven, and the ' +
        'wisdom of Proverbs, Job, Ecclesiastes and Jesus. Read the words, the story behind them, ' +
        'and what they mean for your daily life. Tap any one to read it.'),
      // A selection, not every song: see "How many songs are in the Bible?" in
      // tools/poetry/README.md before adding a total here.
      h('p', { class: 'lede' },
        `Here are ${t.kinds.Poems} poems, ${t.kinds.Songs} songs and ${t.kinds.Wisdom} pieces of ` +
        'wisdom, among the best known and most loved.'),
      h('ul', { class: 'stats' },
        h('li', {}, h('b', {}, t.kinds.Poems), 'poems'),
        h('li', {}, h('b', {}, t.kinds.Songs), 'songs'),
        h('li', {}, h('b', {}, t.kinds.Wisdom), 'wisdom')),
      h('div', { class: 'finder' }, search),
      chips),
    count,
    ...data.kinds.flatMap(part),
    empty);

  apply();
  followHash(id => open(id, { smooth: false }));
}
