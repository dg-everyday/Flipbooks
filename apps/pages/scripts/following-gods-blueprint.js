/**
 * Following God's Blueprint — drives following-gods-blueprint.html.
 *
 * Reads assets/following-gods-blueprint.json (built and verse-checked by
 * tools/blueprint/build_blueprint.py): the plan God has drawn for his people,
 * in six sheets (The foundation, Beyond the Ten, Every day, Solving problems
 * God's way, Understanding the times, Ready for his return). Clicking a part
 * of the plan opens it in place, under the row it sits in (rowExpander in
 * study-utils.js). #born-again in the URL opens Born again.
 *
 * The last sheet is the blueprint test: twelve questions to measure a
 * decision or a resolution by, and the warning signs of a resolution that is
 * not from above. The answers live only on the page; nothing is stored.
 *
 * Holding a tile for half a second bookmarks it, as on the home page
 * (card-bookmarks.js), and an open item has a Bookmark button too. The
 * bookmarks are the ones "Following Today's God Blueprint" keeps on the home
 * page (the same localStorage key), so they show in its bookmarks popup and
 * its PDF.
 */

import { h, fetchJson, para, rowExpander, followHash, filterMenu } from './study-utils.js?v=20261003-1';
import {
  BOOKMARK_STYLES, CardHold, bookmarkNote, bookmarkStore, showBookmarkResult,
} from '../../components/card-bookmarks.js?v=20260927-1';

const DATA = 'assets/following-gods-blueprint.json';
const TEST_ID = 'blueprint-test';

// The same store as <gods-blueprint> on the home page.
const bookmarks = bookmarkStore('dailygrace:bookmarks:blueprint',
  { isId: (id) => typeof id === 'string' && id !== '', limit: 50 });

const RIBBON_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>';

// One colour and drawing per sheet of the plan; the icons are fixed strings.
const PARTS = {
  'The foundation': {
    cls: 'p-foundation',
    icon: '<path d="M3 20h18M4 20v-5h16v5M9 15v5M15 15v5M6 15v-4h12v4M12 11v4M8 11V8h8v3"/>',
  },
  'Beyond the Ten': {
    cls: 'p-beyond',
    icon: '<path d="M4 20V7a4 4 0 0 1 8 0v13zM12 20V7a4 4 0 0 1 8 0v13z"/><path d="M7 10h2M7 13h2M15 10h2M15 13h2"/>',
  },
  'Every day': {
    cls: 'p-daily',
    icon: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>',
  },
  'Solving problems God\'s way': {
    cls: 'p-problems',
    icon: '<path d="M2 18h20M4 18v-5M20 18v-5M2 13c4 0 6-5 10-5s6 5 10 5M8 18v-5.5M12 18V8M16 18v-5.5"/>',
  },
  'Understanding the times': {
    cls: 'p-times',
    icon: '<path d="M6 3h12M6 21h12M7 3c0 4.5 5 6 5 9s-5 4.5-5 9M17 3c0 4.5-5 6-5 9s5 4.5 5 9"/>',
  },
  'Ready for his return': {
    cls: 'p-return',
    icon: '<path d="M6 19a4 4 0 0 1-.6-7.95A6.5 6.5 0 0 1 18 10a4.5 4.5 0 0 1 0 9z"/><path d="M12 2v3M4.2 5.2l2 2M19.8 5.2l-2 2"/>',
  },
};
const TEST_ICON = '<path d="M3 21 21 3v18z"/><path d="M8 21v-2M12 21v-3M16 21v-2M21 16h-2M21 12h-3M21 8h-2"/>';

const ANSWERS = [['yes', 'Yes'], ['unsure', 'Not sure'], ['no', 'No']];

function drawing(paths, cls) {
  const span = h('span', { class: cls, 'aria-hidden': 'true' });
  // A fixed string from PARTS or TEST_ICON above, never data.
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  return span;
}

// ------------------------------------------------------------------ passages

function passage(v) {
  const who = v.hero
    ? h('a', { href: `heroes-and-villains.html#${encodeURIComponent(v.hero)}` }, v.who)
    : v.who;
  return h('figure', { class: `bp-verse${v.red ? ' red' : ''}` },
    h('blockquote', {}, v.text),
    h('figcaption', {}, h('span', { class: 'bp-ref' }, v.reference), who && ' · ', who),
    v.note && h('p', { class: 'bp-note' }, v.note));
}

// ------------------------------------------------------------------ cards

function tile(item, onToggle) {
  return h('button', {
    type: 'button', id: `tile-${item.id}`, 'data-id': item.id,
    class: `bp-tile bookmarkable${bookmarks.has(item.id) ? ' bookmarked' : ''}`,
    'aria-expanded': 'false', 'aria-controls': 'bp-detail', onclick: () => onToggle(item.id)
  },
    h('span', { class: 'bp-num', 'aria-hidden': 'true' }, item.number),
    h('span', { class: 'bp-text' },
      h('span', { class: 'bp-name' }, item.name),
      h('span', { class: 'bp-summary' }, item.summary),
      h('span', { class: 'bp-meta' },
        `${item.verses.length} passages`,
        item.example && h('span', { class: 'bp-has-example' }, 'Bible example'))));
}

// The open item's Bookmark button: pressed while the item is bookmarked.
function bookmarkButton(item, onToggle) {
  const button = h('button', {
    type: 'button', class: 'bp-bookmark', 'data-id': item.id, onclick: () => onToggle(item)
  });
  button.innerHTML = RIBBON_ICON;          // a fixed string, never data
  button.append(h('span', {}));
  syncBookmarkButton(button);
  return button;
}

function syncBookmarkButton(button) {
  const saved = bookmarks.has(button.dataset.id);
  button.setAttribute('aria-pressed', String(saved));
  button.querySelector('span').textContent = saved ? 'Bookmarked' : 'Bookmark';
  button.title = saved ? 'Remove the bookmark' : 'Bookmark this part of the plan';
}

function detail(item, part, onClose, onBookmark) {
  const block = (title, ...body) => h('section', { class: 'detail-block' }, h('h4', {}, title), body);
  const ex = item.example;
  return h('div', {
    class: `row-panel ${PARTS[part.name].cls}`, id: 'bp-detail', role: 'region',
    'aria-labelledby': 'bp-detail-title', tabindex: '-1'
  },
    h('button', { type: 'button', class: 'panel-close', 'aria-label': `Close ${item.name}`, onclick: onClose }, '×'),
    h('header', { class: 'detail-head' },
      h('p', { class: 'detail-group' }, `Sheet ${part.sheet} · ${part.name} · ${item.number}`),
      h('h3', { id: 'bp-detail-title' }, item.name),
      para(item.summary, 'detail-summary'),
      bookmarkButton(item, onBookmark)),
    h('div', { class: 'detail-cols' },
      h('div', { class: 'detail-main' },
        block('In plain words', para(item.plain)),
        block('From the plans', h('div', { class: 'bp-verses' }, item.verses.map(passage))),
        ex && block('The plan at work',
          h('div', { class: 'bp-example' },
            h('p', { class: 'bp-example-title' }, ex.title, h('span', { class: 'bp-ref' }, ex.reference)),
            para(ex.text)))),
      h('div', { class: 'detail-side' },
        item.build?.length && block('Build it',
          h('ol', { class: 'bp-build' }, item.build.map(step => h('li', {}, step)))),
        item.ask && block('Ask yourself', para(item.ask, 'bp-ask')),
        item.see && block('See also',
          h('p', {}, h('a', { class: 'bp-see', href: item.see.href }, item.see.label, ' →'))))));
}

// ------------------------------------------------------------------ the pattern

function pattern(verses) {
  return h('section', { class: 'panel bp-pattern', 'aria-labelledby': 'h-pattern' },
    h('h2', { id: 'h-pattern' }, 'The pattern'),
    para('A blueprint is the plan an architect draws before anything is built. Scripture uses the same ' +
      'picture: God showed Moses a pattern on the mountain, and Jesus said the wise build on rock. ' +
      'This guide sets out that plan, part by part.', 'bp-pattern-intro'),
    h('div', { class: 'bp-pattern-grid' }, verses.map(passage)));
}

// ------------------------------------------------------------------ the test

function blueprintTest(test) {
  const answers = new Map();
  const result = h('div', { class: 'bp-result', 'aria-live': 'polite' });

  const question = (q, i) => {
    const name = `bp-q${i + 1}`;
    return h('li', { class: 'bp-q', 'data-index': i },
      h('div', { class: 'bp-q-head' },
        h('span', { class: 'bp-q-num', 'aria-hidden': 'true' }, i + 1),
        h('div', {},
          h('h3', { id: `${name}-title` }, q.question),
          para(q.ask, 'bp-q-ask'))),
      h('figure', { class: 'bp-q-verse' },
        h('blockquote', {}, q.text),
        h('figcaption', {}, q.reference)),
      h('div', { class: 'bp-answers', role: 'radiogroup', 'aria-labelledby': `${name}-title` },
        ANSWERS.map(([value, label]) => h('label', { class: `bp-answer a-${value}` },
          h('input', { type: 'radio', name, value }),
          h('span', {}, label)))));
  };

  const warning = (w, i) => h('li', {},
    h('label', { class: 'bp-warning' },
      h('input', { type: 'checkbox', value: String(i) }),
      h('span', { class: 'bp-warning-text' },
        h('b', {}, w.sign),
        h('span', { class: 'bp-warning-verse' }, w.text, ' ', h('span', { class: 'bp-ref' }, w.reference)))));

  const list = h('ol', { class: 'bp-questions' }, test.questions.map(question));
  const warnings = h('ul', { class: 'bp-warnings' }, test.warnings.map(warning));

  function update() {
    const done = answers.size;
    const total = test.questions.length;
    const lookAgain = test.questions
      .map((q, i) => [q, answers.get(i)])
      .filter(([, a]) => a && a !== 'yes');
    const signs = [...warnings.querySelectorAll('input:checked')].map(c => test.warnings[Number(c.value)]);

    for (const li of list.querySelectorAll('.bp-q')) {
      li.dataset.answer = answers.get(Number(li.dataset.index)) || '';
    }

    const again = [
      ...lookAgain.map(([q, a]) => h('li', {}, q.question, ' ',
        h('span', { class: 'bp-ref' }, `${a === 'no' ? 'No' : 'Not sure'} · ${q.reference}`))),
      ...signs.map(w => h('li', { class: 'is-sign' }, w.sign, ' ', h('span', { class: 'bp-ref' }, w.reference))),
    ];

    let verdict;
    if (done < total) {
      verdict = [
        h('p', { class: 'bp-progress' }, `${done} of ${total} answered`),
        h('div', { class: 'bp-bar', 'aria-hidden': 'true' },
          h('span', { style: `width: ${Math.round(done / total * 100)}%` })),
        para(again.length
          ? 'So far, these need another look:'
          : 'Answer every question to see how this measures up.'),
      ];
    } else if (!again.length) {
      verdict = [
        h('p', { class: 'bp-verdict ok' }, 'It measures up to the blueprint'),
        para('Every question is answered yes and no warning sign is showing. Go ahead in peace, keep ' +
          'praying, and keep watching the fruit, because "by their fruits ye shall know them" (Matthew 7:20).'),
      ];
    } else {
      verdict = [
        h('p', { class: 'bp-verdict look' }, 'Look again before you settle it'),
        para('Read the verses for these, pray about them, and talk the matter over with a mature ' +
          'believer before you go ahead:'),
      ];
    }
    result.replaceChildren(...verdict, again.length ? h('ul', { class: 'bp-again' }, again) : null);
  }

  list.addEventListener('change', e => {
    const input = e.target.closest('input[type="radio"]');
    if (!input) return;
    answers.set(Number(input.closest('.bp-q').dataset.index), input.value);
    update();
  });
  warnings.addEventListener('change', update);

  const reset = h('button', {
    type: 'button', class: 'bp-reset', onclick: () => {
      answers.clear();
      for (const input of section.querySelectorAll('input')) input.checked = false;
      update();
      section.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  }, 'Start again');

  const section = h('section', { class: 'panel bp-test', id: TEST_ID, 'aria-labelledby': 'h-test' },
    h('header', { class: 'bp-sheet-head p-test' },
      h('p', { class: 'bp-sheet-label' }, 'Sheet 7'),
      h('h2', { id: 'h-test' }, drawing(TEST_ICON, 'bp-sheet-icon'), 'The blueprint test'),
      para('Does this resolution follow the Lord\'s blueprint? Think of one decision, or the way a problem ' +
        'was settled, and measure it against the plan. Answer each question honestly.', 'bp-sheet-intro')),
    h('div', { class: 'bp-test-body' },
      list,
      h('section', { class: 'bp-warnings-box', 'aria-labelledby': 'h-warnings' },
        h('h3', { id: 'h-warnings' }, 'Warning signs'),
        para('Tick any that are true. Wisdom that brings these is not "from above" (James 3:15-17).'),
        warnings),
      h('div', { class: 'bp-result-box' },
        h('h3', {}, 'How it measures up'),
        result,
        para('This is a help for prayer and honest thinking, not a verdict. It cannot see the whole ' +
          'situation; God, his word and wise counsel can. Your answers stay on this page.', 'bp-caveat'),
        reset)));

  update();
  return section;
}

// ------------------------------------------------------------------ page

export async function start(view) {
  let data;
  try {
    data = await fetchJson(DATA);
  } catch (error) {
    console.error('Unable to load the blueprint:', error);
    view.replaceChildren(h('p', { class: 'status' },
      'The blueprint could not be loaded. Please try again later.'));
    return;
  }

  const parts = data.parts;
  const partOf = new Map(parts.map(p => [p.name, p]));
  const items = data.items;
  for (const p of parts) {
    items.filter(i => i.part === p.name).forEach((item, n) => { item.number = `${p.sheet}.${n + 1}`; });
  }
  const byId = new Map(items.map(i => [i.id, i]));
  const state = { part: 'all', query: '' };
  const expander = rowExpander({ tileSelector: '.bp-tile' });

  function open(id, options) {
    const item = byId.get(id);
    let openTile = document.getElementById(`tile-${id}`);
    if (!item || !openTile) return;
    // A link may point at something the filters are hiding.
    if (openTile.hidden) {
      resetFilters();
      openTile = document.getElementById(`tile-${id}`);
    }
    expander.open(openTile,
      detail(item, partOf.get(item.part), () => expander.close({ focus: true }), toggleBookmark), options);
  }

  // --- bookmarks -------------------------------------------------------------

  // The glow, ribbon and note of a held card, from card-bookmarks.js.
  document.head.append(h('style', {}, BOOKMARK_STYLES));
  const status = h('p', { class: 'visually-hidden', role: 'status', 'aria-atomic': 'true' });

  function toggleBookmark(item, card = document.getElementById(`tile-${item.id}`)) {
    const result = bookmarks.toggle(item.id);
    if (card) showBookmarkResult(card, result, bookmarks.limit);
    status.textContent = `${item.name}: ${bookmarkNote(result, bookmarks.limit)}`;
  }

  // Every tile and the open item's button follow the store, which also
  // changes when another tab bookmarks something.
  function syncBookmarks() {
    for (const tl of view.querySelectorAll('.bp-tile')) {
      tl.classList.toggle('bookmarked', bookmarks.has(tl.dataset.id));
    }
    for (const button of view.querySelectorAll('.bp-bookmark')) syncBookmarkButton(button);
  }
  bookmarks.addEventListener('change', syncBookmarks);

  new CardHold(view, {
    selector: '.bp-tile',
    onHold: (card) => {
      const item = byId.get(card.dataset.id);
      if (item) toggleBookmark(item, card);
    },
  });

  function toggle(id) {
    if (expander.openId === id) expander.close();
    else open(id);
  }

  // --- filters ---------------------------------------------------------------

  const haystack = new Map(items.map(i => [i.id,
    [i.name, i.summary, i.plain, i.part, i.ask, ...(i.build || []), i.example?.title, i.example?.text,
      ...i.verses.flatMap(v => [v.who, v.note, v.reference, v.text])]
      .join(' ').toLowerCase()]));

  function apply() {
    const q = state.query.trim().toLowerCase();
    let shown = 0;
    for (const sec of view.querySelectorAll('.bp-part')) {
      const partMatch = state.part === 'all' || sec.dataset.part === state.part;
      let partShown = 0;
      for (const tl of sec.querySelectorAll('.bp-tile')) {
        const visible = partMatch && (!q || haystack.get(tl.dataset.id).includes(q));
        tl.hidden = !visible;
        if (visible) partShown += 1;
      }
      sec.hidden = partShown === 0;
      shown += partShown;
    }
    // While searching or showing one sheet, keep the page to the plan itself.
    const filtering = Boolean(q) || state.part !== 'all';
    patternPanel.hidden = filtering;
    testPanel.hidden = filtering && state.part !== TEST_ID;
    if (state.part === TEST_ID) for (const sec of view.querySelectorAll('.bp-part')) sec.hidden = true;
    if (expander.openTile?.hidden) expander.close();
    else expander.place();
    count.textContent = !filtering || state.part === TEST_ID ? '' : `Showing ${shown} of ${items.length}`;
    empty.hidden = shown !== 0 || state.part === TEST_ID;
    for (const c of view.querySelectorAll('.chip')) {
      c.setAttribute('aria-pressed', String(state[c.dataset.filter] === c.dataset.value));
    }
  }

  function resetFilters() {
    state.part = 'all';
    state.query = '';
    search.value = '';
    apply();
  }

  // --- build the page --------------------------------------------------------

  const search = h('input', {
    type: 'search', class: 'search', autocomplete: 'off',
    placeholder: 'Search a word, a verse or a problem…', 'aria-label': 'Search the blueprint'
  });
  search.addEventListener('input', () => { state.query = search.value; apply(); });

  const tot = data.totals;
  const chip = (value, label, n, cls) => h('button', {
    type: 'button', class: `chip${cls ? ` ${cls}` : ''}`, 'data-filter': 'part', 'data-value': value,
    'aria-pressed': String(state.part === value)
  }, label, n != null && h('span', { class: 'chip-count' }, n));
  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Show one sheet of the plan' },
    chip('all', 'The whole plan', tot.items),
    parts.map(p => chip(p.name, p.name, tot.parts[p.name], PARTS[p.name].cls)),
    chip(TEST_ID, 'The blueprint test', tot.questions, 'p-test'));
  chips.addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c) return;
    state.part = c.dataset.value;
    apply();
  });

  const count = h('p', { class: 'result-count', 'aria-live': 'polite' });
  const empty = h('p', { class: 'status', hidden: true }, 'Nothing matches that search.');

  const partSection = p => {
    const members = items.filter(i => i.part === p.name);
    const id = `h-${p.name.toLowerCase().replace(/[^a-z]+/g, '-')}`;
    return h('section', {
      class: `panel bp-part ${PARTS[p.name].cls}`, 'data-part': p.name, 'aria-labelledby': id
    },
      h('header', { class: 'bp-sheet-head' },
        h('p', { class: 'bp-sheet-label' }, `Sheet ${p.sheet}`, h('span', { class: 'bp-sheet-count' }, members.length)),
        h('h2', { id }, drawing(PARTS[p.name].icon, 'bp-sheet-icon'), p.name),
        para(p.intro, 'bp-sheet-intro')),
      h('div', { class: 'bp-grid' }, members.map(i => tile(i, toggle))));
  };

  const patternPanel = pattern(data.pattern);
  const testPanel = blueprintTest(data.test);

  const filters = filterMenu(
    h('ul', { class: 'stats' },
      h('li', {}, h('b', {}, tot.items), 'parts of the plan'),
      h('li', {}, h('b', {}, tot.verses), 'passages'),
      h('li', {}, h('b', {}, tot.questions), 'test questions')),
    chips,
    h('p', { class: 'bp-hero-test' },
      h('a', { href: `#${TEST_ID}`, class: 'bp-test-link' }, drawing(TEST_ICON, 'bp-link-icon'),
        'Take the blueprint test'),
      ' Does a decision or a resolution follow the Lord\'s plan?'));

  view.replaceChildren(
    h('section', { class: 'hero bp-hero' },
      filters.button,
      h('p', { class: 'eyebrow' }, 'A study guide'),
      h('h1', {}, 'Following God\'s Blueprint'),
      h('p', { class: 'lede' },
        'The plan God has drawn for his people: the foundation of salvation, the heart of his law, what ' +
        'to do every day, how to solve problems his way, how to read the times, and how to be ready when ' +
        'Jesus comes. Tap any part of the plan to open it; hold it for half a second to bookmark it.'),
      h('div', { class: 'finder' }, search),
      filters.menu),
    patternPanel,
    count,
    ...parts.map(partSection),
    empty,
    testPanel,
    status);

  apply();
  followHash(id => {
    if (id === TEST_ID) {
      if (testPanel.hidden) resetFilters();
      testPanel.scrollIntoView({ behavior: 'instant' });
    } else {
      open(id, { smooth: false });
    }
  });
}
