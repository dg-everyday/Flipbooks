/**
 * Songs in the Bible — drives songs-in-the-bible.html.
 *
 * Reads assets/songs-in-the-bible.json (built and verse-checked by
 * tools/songs/build_songs.py): songs of victory, worship and thanksgiving,
 * laments, psalms, songs of the prophets, the songs around Jesus' birth, and
 * the songs of the church and of heaven. Each group is a section of cards;
 * clicking one opens it in place, under the row it sits in (rowExpander in
 * study-utils.js). #the-lord-is-my-shepherd in the URL opens Psalm 23.
 */

import { h, fetchJson, para, refList, rowExpander, followHash } from './study-utils.js?v=20260926-2';

const DATA = 'assets/songs-in-the-bible.json';

// Per group: a CSS class for its colour, and an intro.
const GROUPS = {
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
  'Psalms and songs of wisdom': {
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
};

// Line icons, one per group (24 × 24, drawn with the current colour).
const ICONS = {
  'Songs of victory': '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="4.5" r="1.4"/><circle cx="12" cy="19.5" r="1.4"/><circle cx="4.5" cy="12" r="1.4"/><circle cx="19.5" cy="12" r="1.4"/>',
  'Worship and thanksgiving': '<path d="M7 4c-2 3-2 8 1 11h8c3-3 3-8 1-11"/><path d="M8 15v5h8v-5M10 7v8M12 6v9M14 7v8"/>',
  'Laments': '<path d="M12 3c3 4.5 6 8 6 11a6 6 0 0 1-12 0c0-3 3-6.5 6-11z"/>',
  'Psalms and songs of wisdom': '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  'Songs of the prophets': '<path d="M7 3h11a2 2 0 0 1 2 2v12M7 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2H9v2a2 2 0 0 1-2 2"/><path d="M9 8h7M9 11.5h7"/>',
  'Songs of the coming King': '<path d="m12 3 2.6 5.8 6.4.7-4.8 4.3 1.4 6.2L12 16.9 6.4 20l1.4-6.2L3 9.5l6.4-.7z"/>',
  'Songs of the church and of heaven': '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
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

// The song's own words: one line per verse, each passage with its reference.
function songWords(sung) {
  return sung?.length && h('div', { class: 'song-words' },
    sung.map(s => h('figure', { class: 'song-passage' },
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
      h('span', { class: 'sg-meta' }, `${testamentLabel(item.testament)} · ${item.told_in}`)));
}

// ------------------------------------------------------------------ detail

function detail(item, onClose) {
  const g = GROUPS[item.group];
  const block = (title, ...body) => h('section', { class: 'detail-block' }, h('h4', {}, title), body);

  const facts = h('dl', { class: 'facts' },
    item.by?.length && [h('dt', {}, item.by_label || 'Sung by'), h('dd', {}, people(item.by))],
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

  const words = songWords(item.sung);

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
        words && block('From the song', words),
        block('The story behind it', para(item.story)),
        item.meaning && block('Why it matters', para(item.meaning)),
        item.lesson && block('The lesson', para(item.lesson, 'lesson'))),
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
    console.error('Unable to load the songs:', error);
    view.replaceChildren(h('p', { class: 'status' },
      'The songs could not be loaded. Please try again later.'));
    return;
  }

  const entries = data.entries;
  const byId = new Map(entries.map(e => [e.id, e]));
  const state = { group: 'all', testament: 'all', query: '' };
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
    [e.name, e.epithet, e.summary, e.group, e.occasion, e.where, e.told_in,
      ...(e.by || []).map(p => p.name), ...(e.with || []).map(p => p.name),
      ...(e.sung || []).flatMap(s => s.lines)]
      .join(' ').toLowerCase()]));

  function apply() {
    const q = state.query.trim().toLowerCase();
    let shown = 0;
    for (const section of view.querySelectorAll('.group-section')) {
      const groupMatch = state.group === 'all' || section.dataset.group === state.group;
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
    placeholder: 'Search a song, a line, a singer or a place…', 'aria-label': 'Search the songs of the Bible'
  });
  search.addEventListener('input', () => { state.query = search.value; apply(); });

  const chip = (filter, value, label, n, cls) => h('button', {
    type: 'button', class: `chip${cls ? ` ${cls}` : ''}`, 'data-filter': filter, 'data-value': value,
    'aria-pressed': String(state[filter] === value)
  }, label, n != null && h('span', { class: 'chip-count' }, n));

  const t = data.totals;
  const chips = h('div', { class: 'chip-rows' },
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Show one kind' },
      chip('group', 'all', 'Every song', t.entries),
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

  // The "Caveats" pill after the song count opens a note on how the 185 is
  // counted, in place under the introduction. The same notes, with sources,
  // are in tools/songs/README.md; keep the two in step.
  const note = (title, ...text) => h('li', {}, h('strong', {}, title), ' ', text);
  const caveats = h('div', { class: 'count-caveats', id: 'count-caveats', hidden: true },
    h('h2', {}, 'About the count'),
    h('ul', {},
      note('It is one count.',
        'The figure comes from OverviewBible\'s ',
        h('a', { href: 'https://overviewbible.com/bible-songs/', target: '_blank', rel: 'noopener' },
          'All the songs in the Bible'),
        ': the 150 psalms, 6 songs in the Song of Solomon and Lamentations, and about 35 more ' +
        'songs, chants, laments and hymns elsewhere in the Bible. It is one website\'s count, not ' +
        'an official figure.'),
      note('The 150 psalms are solid.',
        'Protestant and Catholic Bibles have 150 psalms; Orthodox Bibles add a Psalm 151. A few ' +
        'are headed “A Prayer”, and a few repeat others (Psalm 18 is 2 Samuel 22, and Psalm 53 ' +
        'nearly repeats Psalm 14). But the Psalms were Israel\'s hymnbook, so counting all 150 as ' +
        'songs is fair.'),
      note('It depends on what counts as a song.',
        'Is Lamentations one song or five? Is Lamech\'s boast in Genesis 4 a song? Is each ' +
        'chorus in Revelation a song of its own? Different answers give anywhere from about 175 ' +
        'to over 200.'),
      note('Only songs whose words survive.',
        'The Bible mentions many more songs than it records. Solomon alone wrote 1,005 ' +
        '(1 Kings 4:32), and the book of Jasher and Jeremiah\'s laments for Josiah are lost.')));
  const caveatsPill = h('button', {
    type: 'button', class: 'caveats-pill', 'aria-expanded': 'false', 'aria-controls': 'count-caveats',
    onclick: () => {
      caveats.hidden = !caveats.hidden;
      caveatsPill.setAttribute('aria-expanded', String(!caveats.hidden));
    }
  }, 'Caveats');

  const count = h('p', { class: 'result-count', 'aria-live': 'polite' });
  const empty = h('p', { class: 'status', hidden: true }, 'No song matches that search.');

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
      h('div', { class: 'sg-grid' }, members.map(e => tile(e, toggle))));
  };

  view.replaceChildren(
    h('section', { class: 'hero' },
      h('h1', {}, 'Songs in the Bible'),
      h('p', { class: 'lede' },
        'From Moses at the Red Sea to the new song of heaven: the songs God\'s people sang in ' +
        'victory, worship and grief, the psalms they loved, and the hymns of the first ' +
        'Christians. Read the words, the story behind each song, and why it still matters. ' +
        'Tap any one to read it.'),
      // How the 185 is counted, and why it is "by one count": tools/songs/README.md.
      h('p', { class: 'lede' },
        `By one count the Bible records at least 185 songs, 150 of them in the Psalms. ` +
        `Here are ${t.entries} of the best known. `,
        caveatsPill),
      caveats,
      h('ul', { class: 'stats' },
        h('li', {}, h('b', {}, t.entries), 'songs'),
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
