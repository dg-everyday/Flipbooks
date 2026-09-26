/**
 * Red-Lettered Quotes — drives red-lettered-quotes.html.
 *
 * Reads assets/red-letter-quotes.json (built by
 * tools/red-letter-quotes/build_red_letter_quotes.py from assets/red-letter.json)
 * and shows the words of Jesus two ways:
 *
 *   - Best-known sayings: hand-picked sayings by theme, each with a plain
 *     explanation. A saying opens in place under its row (rowExpander).
 *   - Every red-letter word: every red-letter passage, book by book. A passage
 *     opens to show its red words, the plain explanation of any saying inside
 *     it, and the older commentary on its verses from assets/explanations/,
 *     fetched when the passage is first opened.
 *
 * #i-am-the-bread-of-life opens that saying; #john-6-35-40 opens that passage.
 */

import { h, fetchJson, para, refList, rowExpander, followHash } from './study-utils.js?v=20260926-2';

const DATA = 'assets/red-letter-quotes.json';
const COMMENTARY = (book, chapter) => `assets/explanations/${book}/${chapter}.json`;
const SOURCES = {
  jfb: 'Jamieson, Fausset and Brown (1871)',
  gill: 'John Gill (1746–63)',
};

const THEMES = {
  'I am': 'Seven times in John, Jesus describes himself with the words "I am…". Once he says simply "I am", the name God gave himself at the burning bush.',
  'The Sermon on the Mount': 'His best-known sermon (Matthew 5–7): the Beatitudes, the Lord\'s Prayer, the golden rule and the wise builder.',
  'Parables': 'Stories from farms, fields and families that open the kingdom of God to those willing to hear.',
  'Invitations and promises': 'Come to me, believe in me, don\'t be troubled: the invitations and promises Jesus made to anyone who would listen.',
  'Commands and challenges': 'Follow me, deny yourself, love one another: what Jesus asks of those who follow him.',
  'Questions he asked': 'Jesus asked far more questions than he answered. These still search the heart.',
  'His prayers': 'How Jesus prayed, and what he prayed for, including us.',
  'From the cross': 'The seven sayings of Jesus from the cross, gathered from all four Gospels.',
  'After the resurrection': 'What the risen Jesus said to his friends between Easter morning and his ascension.',
  'From heaven': 'Words of the risen, ascended Jesus: to Saul on the Damascus road, to Paul, and to John in Revelation.',
};

// ------------------------------------------------------------------ best-known sayings

function sayingTile(s, onToggle) {
  return h('button', {
    type: 'button', class: 'rl-tile', id: `tile-${s.id}`, 'data-id': s.id,
    'aria-expanded': 'false', 'aria-controls': 'rl-detail', onclick: () => onToggle(s.id)
  },
    h('span', { class: 'rl-name' }, s.name),
    h('span', { class: 'rl-meta' }, s.reference));
}

function sayingDetail(s, passageOf, showPassage, onClose) {
  const block = (title, ...body) => h('section', { class: 'detail-block' }, h('h4', {}, title), body);
  const passage = passageOf(s.id);
  return h('div', {
    class: 'row-panel rl-panel', id: 'rl-detail', role: 'region',
    'aria-labelledby': 'rl-detail-title', tabindex: '-1'
  },
    h('button', { type: 'button', class: 'panel-close', 'aria-label': `Close ${s.name}`, onclick: onClose }, '×'),
    h('header', { class: 'detail-head' },
      h('p', { class: 'detail-group' }, s.theme),
      h('h3', { id: 'rl-detail-title' }, s.name)),
    h('figure', { class: 'red-quote' },
      h('blockquote', {}, s.text),
      h('figcaption', {}, s.reference)),
    h('div', { class: 'detail-cols' },
      h('div', { class: 'detail-main' },
        block('When and where', para(s.context)),
        block('What it means', para(s.meaning)),
        s.today && block('For today', para(s.today, 'today'))),
      h('div', { class: 'detail-side' },
        s.also_in?.length && block('Also told in', refList(s.also_in)),
        passage && block('In context',
          h('p', {}, 'Read it with the rest of what Jesus said there.'),
          h('button', { type: 'button', class: 'link-button', onclick: () => showPassage(passage.id) },
            `Open ${passage.reference}`)))));
}

// ------------------------------------------------------------------ every red-letter word

function passageBody(p) {
  return h('div', { class: 'rl-verses' },
    p.verses.map(v => h('p', { class: 'rl-verse' }, h('sup', {}, v.v), ' ', v.text)));
}

async function loadCommentary(p, holder) {
  holder.replaceChildren(h('p', { class: 'muted' }, 'Loading the older commentary…'));
  try {
    const notes = await fetchJson(COMMENTARY(p.book, p.chapter));
    const entries = p.verses.map(v => [v.v, notes[String(v.v)]]).filter(([, n]) => n);
    if (!entries.length) {
      holder.replaceChildren(h('p', { class: 'muted' }, 'There is no older commentary on these verses.'));
      return;
    }
    holder.replaceChildren(...entries.map(([v, n]) => h('div', { class: 'commentary' },
      h('p', { class: 'commentary-head' }, `Verse ${v}`, h('span', {}, SOURCES[n.source] || n.source)),
      n.text.split(/\n\s*\n/).map(t => h('p', {}, t)))));
  } catch (error) {
    console.error('Unable to load commentary:', error);
    holder.replaceChildren(h('p', { class: 'muted' }, 'The older commentary could not be loaded.'));
  }
}

function passageItem(p, sayingsById, openSaying) {
  const first = p.verses[0].text;
  const explained = p.sayings.map(id => sayingsById.get(id)).filter(Boolean);
  const commentary = h('div', { class: 'commentary-list' });
  let loaded = false;

  const item = h('details', { class: 'rl-passage', id: p.id, 'data-id': p.id },
    h('summary', {},
      h('span', { class: 'rl-ref' }, p.reference),
      explained.length > 0 && h('span', { class: 'explained-badge' }, 'Explained'),
      h('span', { class: 'rl-first' }, first.length > 110 ? `${first.slice(0, 110).trimEnd()}…` : first)),
    h('div', { class: 'rl-passage-body' },
      passageBody(p),
      explained.map(s => h('section', { class: 'plain-explanation' },
        h('h4', {}, s.name),
        para(s.meaning),
        s.today && para(s.today, 'today'),
        h('button', { type: 'button', class: 'link-button', onclick: () => openSaying(s.id) },
          'Read more about this saying'))),
      h('details', { class: 'older' },
        h('summary', {}, 'Older commentary on these verses'),
        commentary)));

  // Fetch the commentary only when someone opens it.
  item.querySelector('.older').addEventListener('toggle', e => {
    if (e.target.open && !loaded) {
      loaded = true;
      loadCommentary(p, commentary);
    }
  });
  return item;
}

// ------------------------------------------------------------------ page

export async function start(view) {
  let data;
  try {
    data = await fetchJson(DATA);
  } catch (error) {
    console.error('Unable to load the red-letter quotes:', error);
    view.replaceChildren(h('p', { class: 'status' },
      'The words of Jesus could not be loaded. Please try again later.'));
    return;
  }

  const sayings = data.sayings;
  const sayingsById = new Map(sayings.map(s => [s.id, s]));
  const passages = data.shelves.flatMap(sh => sh.passages.map(p => ({ ...p, shelf: sh.id })));
  const passagesById = new Map(passages.map(p => [p.id, p]));
  const passageOf = id => passages.find(p => p.sayings.includes(id));
  const state = { mode: 'sayings', theme: 'all', shelf: data.shelves[0].id, query: '' };
  const expander = rowExpander({ tileSelector: '.rl-tile' });

  // --- search text -------------------------------------------------------------

  const sayingText = new Map(sayings.map(s => [s.id,
    [s.name, s.text, s.reference, s.theme, s.context, s.meaning].join(' ').toLowerCase()]));
  const passageText = new Map(passages.map(p => [p.id,
    [p.reference, ...p.verses.map(v => v.text)].join(' ').toLowerCase()]));

  // --- opening -------------------------------------------------------------------

  function openSaying(id, options) {
    const s = sayingsById.get(id);
    if (!s) return;
    if (state.mode !== 'sayings' || state.theme !== 'all' || state.query) {
      state.mode = 'sayings';
      state.theme = 'all';
      state.query = '';
      search.value = '';
      apply();
    }
    const tl = document.getElementById(`tile-${id}`);
    expander.open(tl, sayingDetail(s, passageOf, showPassage, () => expander.close({ focus: true })), options);
  }

  function toggleSaying(id) {
    if (expander.openId === id) expander.close();
    else openSaying(id);
  }

  function showPassage(id, { smooth = true } = {}) {
    const p = passagesById.get(id);
    if (!p) return;
    expander.close({ keepHash: true });
    state.mode = 'all';
    state.shelf = p.shelf;
    state.query = '';
    search.value = '';
    apply();
    const el = document.getElementById(id);
    el.open = true;
    history.replaceState(null, '', `#${id}`);
    const topbar = document.querySelector('.topbar')?.offsetHeight || 0;
    const glide = smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - topbar - 12, behavior: glide ? 'smooth' : 'instant' });
  }

  // --- filters ---------------------------------------------------------------------

  function apply() {
    const q = state.query.trim().toLowerCase();
    sayingsView.hidden = state.mode !== 'sayings';
    allView.hidden = state.mode !== 'all';
    themeChips.hidden = state.mode !== 'sayings';
    shelfChips.hidden = state.mode !== 'all';
    search.placeholder = state.mode === 'sayings'
      ? 'Search the best-known sayings…'
      : 'Search every word of Jesus…';

    let shown = 0;
    let total = 0;
    if (state.mode === 'sayings') {
      total = sayings.length;
      for (const section of sayingsView.querySelectorAll('.theme-section')) {
        const themeMatch = state.theme === 'all' || section.dataset.theme === state.theme;
        let n = 0;
        for (const tl of section.querySelectorAll('.rl-tile')) {
          const visible = themeMatch && (!q || sayingText.get(tl.dataset.id).includes(q));
          tl.hidden = !visible;
          if (visible) n += 1;
        }
        section.hidden = n === 0;
        shown += n;
      }
      if (expander.openTile?.hidden) expander.close();
      else expander.place();
    } else {
      // With a search, look through every book; without one, show the chosen book.
      total = q ? passages.length : passages.filter(p => p.shelf === state.shelf).length;
      for (const shelf of allView.querySelectorAll('.shelf')) {
        const shelfMatch = q || shelf.dataset.shelf === state.shelf;
        let n = 0;
        for (const chapter of shelf.querySelectorAll('.rl-chapter')) {
          let c = 0;
          for (const item of chapter.querySelectorAll('.rl-passage')) {
            const visible = shelfMatch && (!q || passageText.get(item.dataset.id).includes(q));
            item.hidden = !visible;
            if (visible) c += 1;
          }
          chapter.hidden = c === 0;
          n += c;
        }
        shelf.hidden = n === 0;
        shown += n;
      }
    }
    count.textContent = shown === total ? '' : `Showing ${shown} of ${total}`;
    empty.hidden = shown !== 0;
    for (const c of view.querySelectorAll('.chip, .mode-button')) {
      c.setAttribute('aria-pressed', String(state[c.dataset.filter] === c.dataset.value));
    }
  }

  // --- build the page ------------------------------------------------------------

  const search = h('input', {
    type: 'search', class: 'search', autocomplete: 'off', 'aria-label': 'Search the words of Jesus'
  });
  search.addEventListener('input', () => { state.query = search.value; apply(); });

  const chip = (filter, value, label, n) => h('button', {
    type: 'button', class: 'chip', 'data-filter': filter, 'data-value': value,
    'aria-pressed': String(state[filter] === value)
  }, label, n != null && h('span', { class: 'chip-count' }, n));

  const t = data.totals;
  const modes = h('div', { class: 'modes', role: 'group', 'aria-label': 'Choose a view' },
    h('button', { type: 'button', class: 'mode-button', 'data-filter': 'mode', 'data-value': 'sayings' },
      h('b', {}, 'Best-known sayings'), h('span', {}, `${t.sayings} explained`)),
    h('button', { type: 'button', class: 'mode-button', 'data-filter': 'mode', 'data-value': 'all' },
      h('b', {}, 'Every red-letter word'), h('span', {}, `${t.passages} passages`)));
  const themeChips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Show one theme' },
    chip('theme', 'all', 'All themes', t.sayings),
    data.themes.map(th => chip('theme', th, th, t.themes[th])));
  const shelfChips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Show one book' },
    data.shelves.map(sh => chip('shelf', sh.id, sh.name, t.shelves[sh.name])));
  const controls = h('div', { class: 'chip-rows' }, modes, themeChips, shelfChips);
  controls.addEventListener('click', e => {
    const c = e.target.closest('.chip, .mode-button');
    if (!c) return;
    if (c.dataset.filter === 'mode' && state.mode !== c.dataset.value) {
      expander.close();
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    }
    state[c.dataset.filter] = c.dataset.value;
    apply();
  });

  const count = h('p', { class: 'result-count', 'aria-live': 'polite' });
  const empty = h('p', { class: 'status', hidden: true }, 'Nothing matches that search.');

  const sayingsView = h('div', { class: 'sayings-view' },
    data.themes.map(theme => {
      const members = sayings.filter(s => s.theme === theme);
      const id = `h-${theme.toLowerCase().replace(/[^a-z]+/g, '-')}`;
      return h('section', { class: 'panel theme-section', 'data-theme': theme, 'aria-labelledby': id },
        h('header', { class: 'theme-head' },
          h('h2', { id }, theme),
          h('p', { class: 'theme-count' }, `${members.length}`),
          para(THEMES[theme], 'theme-intro')),
        h('div', { class: 'rl-grid' }, members.map(s => sayingTile(s, toggleSaying))));
    }));

  const allView = h('div', { class: 'all-view', hidden: true },
    data.shelves.map(sh => {
      const chapters = [];
      for (const p of sh.passages) {
        const key = `${p.book} ${p.chapter}`;
        let ch = chapters.find(c => c.key === key);
        if (!ch) chapters.push(ch = { key, title: p.reference.replace(/:.*/, ''), passages: [] });
        ch.passages.push(p);
      }
      return h('section', { class: 'panel shelf', 'data-shelf': sh.id, 'aria-label': sh.name },
        h('h2', { class: 'shelf-title' }, sh.name),
        chapters.map(ch => h('div', { class: 'rl-chapter' },
          h('h3', {}, ch.title),
          ch.passages.map(p => passageItem(passagesById.get(p.id), sayingsById, openSaying)))));
    }));

  view.replaceChildren(
    h('section', { class: 'hero' },
      h('h1', {}, 'Red-Lettered Quotes'),
      h('p', { class: 'lede' },
        'In many Bibles the words of Jesus are printed in red, a custom that began with Louis ' +
        'Klopsch\'s red-letter New Testament of 1899. Here they are gathered in one place: the ' +
        'best-known sayings explained in plain words, and every red-letter word, book by book.'),
      h('ul', { class: 'stats' },
        h('li', {}, h('b', {}, t.verses.toLocaleString()), 'verses in red'),
        h('li', {}, h('b', {}, t.passages), 'passages'),
        h('li', {}, h('b', {}, t.sayings), 'sayings explained')),
      h('div', { class: 'finder' }, search),
      controls),
    count,
    sayingsView,
    allView,
    empty);

  apply();
  followHash(id => {
    if (sayingsById.has(id)) openSaying(id, { smooth: false });
    else if (passagesById.has(id)) showPassage(id, { smooth: false });
  });
}
