/**
 * Bible Sayings — drives bible-sayings.html.
 *
 * Reads assets/bible-sayings.json (built by tools/sayings/build_sayings.py),
 * the same file as the "Bible Sayings" card on the home page: everyday
 * phrases that come from the Bible. They sit in sections by theme (Faith &
 * Spirit, Wisdom & Folly, …); clicking one opens it in place, under the row
 * it sits in (rowExpander in study-utils.js). #let-there-be-light in the URL
 * opens that saying.
 *
 * Each theme shows its first 5 sayings. The chevrons under it (pull-tab.js,
 * as under the home page's cards) add 10 more at a pull or a tap, and fold
 * away once the theme is all on show. A search shows every match; changing a
 * filter or the search folds each theme back to its first 5.
 *
 * Holding a saying's tile for half a second bookmarks it, as on the home page
 * (card-bookmarks.js), and an open saying has a Bookmark button too. The
 * bookmarks are the ones the home page's card keeps (the same localStorage
 * key), so they show in its bookmarks popup and its PDF.
 */

import { h, fetchJson, para, refList, rowExpander, followHash, filterMenu } from './study-utils.js?v=20261003-1';
import {
  BOOKMARK_STYLES, CardHold, bookmarkNote, bookmarkStore, showBookmarkResult,
} from '../../components/card-bookmarks.js?v=20260927-1';
import { PULL_TAB_ICON, PULL_TAB_STYLES, PullTab, revealCards } from '../../components/pull-tab.js?v=20260925-1';

const DATA = 'assets/bible-sayings.json';

// Each theme opens on its first few sayings; the chevrons under it, as under
// the home page's cards, add more at a time. A search shows every match.
const FIRST_SHOWN = 5;
const MORE_SHOWN = 10;

// The same store as <bible-sayings> on the home page.
const bookmarks = bookmarkStore('dailygrace:bookmarks:sayings',
  { isId: (id) => typeof id === 'string' && id !== '', limit: 50 });

const RIBBON_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg>';

// The themes in the order they are shown, each with its colour class.
const THEMES = {
  'Faith & Spirit': {
    cls: 't-faith',
    intro: 'Sayings about God, belief, prayer and the life of the spirit.',
  },
  'Wisdom & Folly': {
    cls: 't-wisdom',
    intro: 'The wise and the foolish: sayings on good sense, pride and learning, from Proverbs and beyond.',
  },
  'Character & Conduct': {
    cls: 't-character',
    intro: 'How we live and who we are: honesty, kindness, temptation, and the good or bad name we make.',
  },
  'Speech & Relationships': {
    cls: 't-speech',
    intro: 'Words, friends, family and neighbours: the sayings we use about how people treat each other.',
  },
  'Work & Provision': {
    cls: 't-work',
    intro: 'Daily bread, hard work, money and harvest: sayings from the fields, the market and the table.',
  },
  'Hardship & Endurance': {
    cls: 't-hardship',
    intro: 'Trouble, suffering and holding on: sayings for the hard days.',
  },
  'Peace & Conflict': {
    cls: 't-peace',
    intro: 'War and peace, enemies and reconciliation.',
  },
  'Judgment & Consequences': {
    cls: 't-judgment',
    intro: 'Reaping what is sown: sayings about justice, punishment and what our choices bring.',
  },
  'Signs & Warnings': {
    cls: 't-signs',
    intro: 'Omens, warnings and the writing on the wall.',
  },
  'Time & Mortality': {
    cls: 't-time',
    intro: 'Seasons, old age and death: sayings about how short life is, and what lasts.',
  },
  'People & Stories': {
    cls: 't-people',
    intro: 'Names and stories from the Bible that became everyday words.',
  },
};

const WORDING = {
  exact: 'Word for word in the KJV',
  adapted: 'Adapted from the KJV',
  allusion: 'Drawn from a Bible story',
};

const themeOf = s => THEMES[s.theme] || { cls: 't-faith', intro: '' };

// ------------------------------------------------------------------ cards

function tile(s, onToggle) {
  return h('button', {
    type: 'button', id: `tile-${s.id}`, 'data-id': s.id,
    class: `sy-tile bookmarkable${bookmarks.has(s.id) ? ' bookmarked' : ''}`,
    'aria-expanded': 'false', 'aria-controls': 'sy-detail', onclick: () => onToggle(s.id)
  },
    h('span', { class: 'sy-saying' }, s.saying),
    h('span', { class: 'sy-meaning' }, s.meaning),
    h('span', { class: 'sy-meta' }, s.reference));
}

// ------------------------------------------------------------------ detail

// The open saying's Bookmark button: pressed while the saying is bookmarked.
function bookmarkButton(s, onToggle) {
  const button = h('button', {
    type: 'button', class: 'sy-bookmark', 'data-id': s.id, onclick: () => onToggle(s)
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
  button.title = saved ? 'Remove the bookmark' : 'Bookmark this saying';
}

function detail(s, onClose, onBookmark) {
  const block = (title, ...body) => h('section', { class: 'detail-block' }, h('h4', {}, title), body);
  const others = (s.references || []).filter(r => r !== s.reference);

  return h('div', {
    class: `row-panel ${themeOf(s).cls}`, id: 'sy-detail', role: 'region',
    'aria-labelledby': 'sy-detail-title', tabindex: '-1'
  },
    h('button', { type: 'button', class: 'panel-close', 'aria-label': `Close ${s.saying}`, onclick: onClose }, '×'),
    h('header', { class: 'detail-head' },
      h('p', { class: 'detail-group' }, s.theme),
      h('h3', { id: 'sy-detail-title' }, s.saying),
      s.variants?.length && para(`Also said: ${s.variants.join(' · ')}`, 'detail-meaning'),
      para(s.meaning, 'detail-summary'),
      bookmarkButton(s, onBookmark)),
    h('div', { class: 'detail-cols' },
      h('div', { class: 'detail-main' },
        s.explanation && block('Where it comes from', para(s.explanation))),
      h('div', { class: 'detail-side' },
        s.kjv_text && block('Scripture (KJV)',
          h('figure', { class: 'verse' },
            h('blockquote', {}, s.kjv_text),
            h('figcaption', {}, s.reference))),
        others.length && block('Also in', refList(others)),
        h('ul', { class: 'tags', 'aria-label': 'About this saying' },
          [`${s.testament} Testament`, WORDING[s.wording], s.book]
            .filter(Boolean).map(tag => h('li', {}, tag))))));
}

// ------------------------------------------------------------------ page

export async function start(view) {
  let sayings;
  try {
    sayings = await fetchJson(DATA);
  } catch (error) {
    console.error('Unable to load the Bible sayings:', error);
    view.replaceChildren(h('p', { class: 'status' },
      'The Bible sayings could not be loaded. Please try again later.'));
    return;
  }

  // Themes in the order above; any new theme in the data goes last.
  const themes = [...new Set([...Object.keys(THEMES), ...sayings.map(s => s.theme)])]
    .filter(theme => sayings.some(s => s.theme === theme));
  const byId = new Map(sayings.map(s => [s.id, s]));
  const state = { theme: 'all', testament: 'all', query: '' };
  const expander = rowExpander({ tileSelector: '.sy-tile' });

  // --- opening and closing -------------------------------------------------

  function open(id, options) {
    const s = byId.get(id);
    const openTile = document.getElementById(`tile-${id}`);
    if (!s || !openTile) return;
    // A link may point at something the filters are hiding, or further down
    // its theme than is on show yet.
    if (openTile.hidden) {
      if (!matches(s)) resetFilters();
      if (openTile.hidden) {
        const index = themeTiles(s.theme).filter(t => matches(byId.get(t.dataset.id))).indexOf(openTile);
        shown.set(s.theme, FIRST_SHOWN + Math.ceil(Math.max(0, index + 1 - FIRST_SHOWN) / MORE_SHOWN) * MORE_SHOWN);
        apply();
      }
    }
    expander.open(openTile, detail(s, () => expander.close({ focus: true }), toggleBookmark), options);
  }

  function toggle(id) {
    if (expander.openId === id) expander.close();
    else open(id);
  }

  // --- bookmarks -------------------------------------------------------------

  // The glow, ribbon and note of a held card, from card-bookmarks.js.
  document.head.append(h('style', {}, BOOKMARK_STYLES));
  const status = h('p', { class: 'visually-hidden', role: 'status', 'aria-atomic': 'true' });

  function toggleBookmark(s, card = document.getElementById(`tile-${s.id}`)) {
    const result = bookmarks.toggle(s.id);
    if (card) showBookmarkResult(card, result, bookmarks.limit);
    status.textContent = `${s.saying}: ${bookmarkNote(result, bookmarks.limit)}`;
  }

  // Every tile and the open saying's button follow the store, which also
  // changes when another tab bookmarks something.
  bookmarks.addEventListener('change', () => {
    for (const tl of view.querySelectorAll('.sy-tile')) {
      tl.classList.toggle('bookmarked', bookmarks.has(tl.dataset.id));
    }
    for (const button of view.querySelectorAll('.sy-bookmark')) syncBookmarkButton(button);
  });

  new CardHold(view, {
    selector: '.sy-tile',
    onHold: (card) => {
      const s = byId.get(card.dataset.id);
      if (s) toggleBookmark(s, card);
    },
  });

  // --- filters ---------------------------------------------------------------

  const haystack = new Map(sayings.map(s => [s.id,
    [s.saying, ...(s.variants || []), s.meaning, s.explanation, s.kjv_text, s.book,
      ...(s.references || [])]
      .join(' ').toLowerCase()]));

  /** Whether a saying passes the theme, Testament and search filters. */
  function matches(s) {
    const q = state.query.trim().toLowerCase();
    return (state.theme === 'all' || s.theme === state.theme)
      && (state.testament === 'all' || s.testament === state.testament)
      && (!q || haystack.get(s.id).includes(q));
  }

  // How many of each theme's matching sayings are on show; a theme not in
  // the map shows FIRST_SHOWN. Cleared whenever the filters change.
  const shown = new Map();
  const pullTabs = new Map();
  const themeTiles = theme =>
    [...view.querySelectorAll(`.theme-section[data-theme="${CSS.escape(theme)}"] .sy-tile`)];

  /**
   * Shows the matching sayings, each theme up to its share. revealed is the
   * theme whose chevrons were just pulled: its tab folds away, animated, if
   * that pull brought out the last of it.
   */
  function apply({ revealed = null, focus = null } = {}) {
    const searching = Boolean(state.query.trim());
    let matched = 0;
    for (const section of view.querySelectorAll('.theme-section')) {
      const theme = section.dataset.theme;
      const limit = searching ? Infinity : (shown.get(theme) ?? FIRST_SHOWN);
      let n = 0;
      for (const tl of section.querySelectorAll('.sy-tile')) {
        const match = matches(byId.get(tl.dataset.id));
        tl.hidden = !match || n >= limit;
        if (match) n += 1;
      }
      section.hidden = n === 0;
      matched += n;
      const tab = pullTabs.get(theme);
      if (n > limit) tab.show();
      else tab.hide({ animate: theme === revealed, focus });
    }
    if (expander.openTile?.hidden) expander.close();
    else expander.place();
    count.textContent = matched === sayings.length ? '' : `Showing ${matched} of ${sayings.length}`;
    empty.hidden = matched !== 0;
    for (const c of view.querySelectorAll('.chip')) {
      c.setAttribute('aria-pressed', String(state[c.dataset.filter] === c.dataset.value));
    }
  }

  /** The chevrons under a theme: bring out its next sayings. */
  function more(theme) {
    const before = new Set(themeTiles(theme).filter(t => !t.hidden));
    shown.set(theme, (shown.get(theme) ?? FIRST_SHOWN) + MORE_SHOWN);
    const added = themeTiles(theme).filter(t => !before.has(t) && matches(byId.get(t.dataset.id)))
      .slice(0, MORE_SHOWN);
    apply({ revealed: theme, focus: added[0] });
    revealCards(added);
    if (added.length) status.textContent = `${added.length} more ${theme} sayings shown, starting with ${added[0].querySelector('.sy-saying').textContent}.`;
  }

  /** Filters changed: every theme folds back to its first few. */
  function refilter() {
    shown.clear();
    apply();
  }

  function resetFilters() {
    state.theme = 'all';
    state.testament = 'all';
    state.query = '';
    search.value = '';
    refilter();
  }

  // --- build the page --------------------------------------------------------

  const search = h('input', {
    type: 'search', class: 'search', autocomplete: 'off',
    placeholder: 'Search a saying, word or verse…', 'aria-label': 'Search the Bible sayings'
  });
  search.addEventListener('input', () => { state.query = search.value; refilter(); });

  const chip = (filter, value, label, n, cls) => h('button', {
    type: 'button', class: `chip${cls ? ` ${cls}` : ''}`, 'data-filter': filter, 'data-value': value,
    'aria-pressed': String(state[filter] === value)
  }, label, n != null && h('span', { class: 'chip-count' }, String(n)));

  const inTestament = t => sayings.filter(s => s.testament === t).length;
  const chips = h('div', { class: 'chip-rows' },
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Show one theme' },
      chip('theme', 'all', 'All themes', sayings.length),
      themes.map(theme => chip('theme', theme, theme,
        sayings.filter(s => s.theme === theme).length, THEMES[theme]?.cls))),
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Show one Testament' },
      chip('testament', 'all', 'Both Testaments'),
      chip('testament', 'Old', 'Old Testament', inTestament('Old')),
      chip('testament', 'New', 'New Testament', inTestament('New'))));
  chips.addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c) return;
    state[c.dataset.filter] = c.dataset.value;
    refilter();
  });

  const count = h('p', { class: 'result-count', 'aria-live': 'polite' });
  const empty = h('p', { class: 'status', hidden: true }, 'Nothing matches that search.');

  // The chevrons' look, from pull-tab.js, as under the home page's cards.
  document.head.append(h('style', {}, PULL_TAB_STYLES));

  const section = theme => {
    const members = sayings.filter(s => s.theme === theme);
    const id = `h-${theme.toLowerCase().replace(/[^a-z]+/g, '-')}`;
    const tabButton = h('button', {
      type: 'button', class: 'pull-tab', hidden: true,
      'aria-label': `Show more ${theme} sayings`, title: 'Pull down or tap for more sayings'
    });
    tabButton.innerHTML = PULL_TAB_ICON;   // a fixed string, never data
    pullTabs.set(theme, new PullTab(tabButton, { onPull: () => more(theme) }));
    return h('section', {
      class: `panel theme-section ${THEMES[theme]?.cls || ''}`, 'data-theme': theme, 'aria-labelledby': id
    },
      h('header', { class: 'theme-head' },
        h('h2', { id }, theme),
        h('p', { class: 'theme-count' }, `${members.length}`),
        para(THEMES[theme]?.intro, 'theme-intro')),
      h('div', { class: 'sy-grid' }, members.map(s => tile(s, toggle))),
      h('div', { class: 'sy-more' }, tabButton));
  };

  const filters = filterMenu(
    h('ul', { class: 'stats' },
      h('li', {}, h('b', {}, String(sayings.length)), 'sayings'),
      h('li', {}, h('b', {}, String(themes.length)), 'themes'),
      h('li', {}, h('b', {}, String(new Set(sayings.map(s => s.book)).size)), 'books')),
    chips);

  view.replaceChildren(
    h('section', { class: 'hero' },
      filters.button,
      h('h1', {}, 'Bible Sayings'),
      h('p', { class: 'lede' },
        'Everyday phrases that come from the Bible, like "the writing on the wall" or "a drop in ' +
        'the bucket": what each one means, where it comes from and the King James words behind it. ' +
        'Tap a saying to read it; hold it for half a second to bookmark it.'),
      h('div', { class: 'finder' }, search),
      filters.menu),
    count,
    ...themes.map(section),
    empty,
    status);

  apply();
  followHash(id => open(id, { smooth: false }));
}
