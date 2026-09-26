/**
 * Heroes and Villains of the Bible — drives heroes-and-villains.html.
 *
 * Reads assets/heroes-and-villains.json (built and verse-checked by
 * tools/heroes/build_heroes.py). Heroes and villains each get a section of
 * person cards; clicking one opens their story in place, under the row it sits
 * in, and opening another closes the first (rowExpander in study-utils.js).
 * #david in the URL opens David.
 */

import { h, fetchJson, para, refList, rowExpander, followHash } from './study-utils.js?v=20260926-2';

const DATA = 'assets/heroes-and-villains.json';

const SIDES = {
  hero: {
    title: 'Heroes',
    intro: 'Men and women who trusted God — ordinary, often flawed people through whom he did extraordinary things. Scripture shows their failings as honestly as their faith.',
    traits: 'Strengths',
    shadow: 'Their failings',
  },
  villain: {
    title: 'Villains',
    intro: 'Those who opposed God and his people — through pride, greed, fear or hatred. Some met judgement; a few, astonishingly, were humbled and turned back to God.',
    traits: 'What drove them',
    shadow: 'How it ended',
  },
};

const testamentLabel = t => (t === 'Both' ? 'Old and New Testaments' : `${t} Testament`);

function initials(name) {
  const words = name.replace(/,/g, '').split(/\s+/).filter(w => /^[A-Z]/.test(w) && w !== 'The');
  return (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
}

// ------------------------------------------------------------------ cards

function tile(person, onToggle) {
  return h('button', {
    type: 'button', class: 'person-tile', id: `tile-${person.id}`, 'data-id': person.id,
    'aria-expanded': 'false', 'aria-controls': 'person-detail', onclick: () => onToggle(person.id)
  },
    h('span', { class: 'person-mark', 'aria-hidden': 'true' }, initials(person.name)),
    h('span', { class: 'person-text' },
      h('span', { class: 'person-name' }, person.name),
      h('span', { class: 'person-epithet' }, person.epithet),
      h('span', { class: 'person-meta' }, testamentLabel(person.testament),
        person.turned && h('span', { class: 'turned-badge', title: 'Changed sides' }, ' · Changed sides'))));
}

// ------------------------------------------------------------------ detail

function detail(person, byId, openPerson, onClose) {
  const side = SIDES[person.side];
  const block = (title, ...body) => h('section', { class: 'detail-block' }, h('h4', {}, title), body);

  const books = person.books?.length && h('ul', { class: 'book-links' },
    person.books.map(b => h('li', {}, h('a', { href: `bible-books.html#${encodeURIComponent(b.id)}` }, b.name))));

  const faced = (person.faced || []).filter(id => byId.has(id));
  const facedList = faced.length && h('ul', { class: 'faced' },
    faced.map(id => {
      const other = byId.get(id);
      return h('li', { class: `side-${other.side}` },
        h('button', { type: 'button', onclick: () => openPerson(id) },
          h('span', { class: 'faced-mark', 'aria-hidden': 'true' }, initials(other.name)),
          h('span', {}, other.name, h('small', {}, other.side === 'hero' ? 'Hero' : 'Villain'))));
    }));

  const peoples = person.peoples?.length && h('ul', { class: 'people-links' },
    person.peoples.map(id => h('li', {},
      h('a', { href: `peoples.html?people=${encodeURIComponent(id)}` }, id.charAt(0).toUpperCase() + id.slice(1)))));

  const verses = person.key_verses?.length && h('div', { class: 'verses' },
    person.key_verses.map(v => h('figure', { class: 'verse' },
      h('blockquote', {}, v.text),
      h('figcaption', {}, v.reference))));

  const shadowText = person.side === 'hero' ? person.flaws : person.end;

  return h('div', {
    class: `row-panel side-${person.side}`, id: 'person-detail', role: 'region',
    'aria-labelledby': 'person-detail-title', tabindex: '-1'
  },
    h('button', { type: 'button', class: 'panel-close', 'aria-label': `Close ${person.name}`, onclick: onClose }, '×'),
    h('header', { class: 'detail-head' },
      h('p', { class: 'detail-group' },
        `${person.side === 'hero' ? 'Hero' : 'Villain'} · ${testamentLabel(person.testament)} · ${person.era}`),
      h('h3', { id: 'person-detail-title' }, person.name),
      para(person.epithet, 'detail-meaning'),
      para(person.summary, 'detail-summary')),
    h('div', { class: 'detail-cols' },
      h('div', { class: 'detail-main' },
        block('Their story', para(person.story)),
        person.moment && block('Defining moment',
          h('p', { class: 'moment' }, h('strong', {}, person.moment.title),
            h('span', { class: 'moment-ref' }, person.moment.reference))),
        person.traits?.length && block(side.traits,
          h('ul', { class: 'tags' }, person.traits.map(t => h('li', {}, t)))),
        shadowText && block(side.shadow, para(shadowText)),
        person.turned && block('Changed sides', para(person.turned, 'turned')),
        person.lesson && block('The lesson', para(person.lesson, 'lesson'))),
      h('div', { class: 'detail-side' },
        block('At a glance', h('dl', { class: 'facts' },
          h('dt', {}, 'When'), h('dd', {}, person.era),
          h('dt', {}, 'Testament'), h('dd', {}, testamentLabel(person.testament)))),
        person.told_in?.length && block('Read the story', refList(person.told_in)),
        books && block('Found in', books),
        facedList && block(person.side === 'hero' ? 'Stood against' : 'Came up against', facedList),
        peoples && block('Peoples', peoples),
        verses && block('Key verses', verses))));
}

// ------------------------------------------------------------------ page

export async function start(view) {
  let data;
  try {
    data = await fetchJson(DATA);
  } catch (error) {
    console.error('Unable to load the heroes and villains:', error);
    view.replaceChildren(h('p', { class: 'status' },
      'The heroes and villains could not be loaded. Please try again later.'));
    return;
  }

  const everyone = [...data.heroes, ...data.villains];
  const byId = new Map(everyone.map(p => [p.id, p]));
  const state = { side: 'all', testament: 'all', query: '' };
  const expander = rowExpander({ tileSelector: '.person-tile' });

  // --- opening and closing -------------------------------------------------

  function open(id, options) {
    const person = byId.get(id);
    let openTile = document.getElementById(`tile-${id}`);
    if (!person || !openTile) return;
    // A "stood against" link may point at someone the filters are hiding.
    if (openTile.hidden) {
      resetFilters();
      openTile = document.getElementById(`tile-${id}`);
    }
    expander.open(openTile,
      detail(person, byId, other => open(other), () => expander.close({ focus: true })), options);
  }

  function toggle(id) {
    if (expander.openId === id) expander.close();
    else open(id);
  }

  // --- filters ---------------------------------------------------------------

  const haystack = new Map(everyone.map(p => [p.id,
    [p.name, p.epithet, p.summary, p.era, ...(p.traits || []), ...(p.books || []).map(b => b.name)]
      .join(' ').toLowerCase()]));

  const matchesTestament = p =>
    state.testament === 'all' || p.testament === state.testament || p.testament === 'Both';

  function apply() {
    const q = state.query.trim().toLowerCase();
    let shown = 0;
    for (const section of view.querySelectorAll('.side-section')) {
      const sideMatch = state.side === 'all' || section.dataset.side === state.side;
      let sectionShown = 0;
      for (const t of section.querySelectorAll('.person-tile')) {
        const p = byId.get(t.dataset.id);
        const visible = sideMatch && matchesTestament(p) && (!q || haystack.get(p.id).includes(q));
        t.hidden = !visible;
        if (visible) sectionShown += 1;
      }
      section.hidden = sectionShown === 0;
      shown += sectionShown;
    }
    if (expander.openTile?.hidden) expander.close();
    else expander.place();
    count.textContent = shown === everyone.length ? '' : `Showing ${shown} of ${everyone.length}`;
    empty.hidden = shown !== 0;
    for (const c of view.querySelectorAll('.chip')) {
      c.setAttribute('aria-pressed', String(state[c.dataset.filter] === c.dataset.value));
    }
  }

  function resetFilters() {
    state.side = 'all';
    state.testament = 'all';
    state.query = '';
    search.value = '';
    apply();
  }

  // --- build the page --------------------------------------------------------

  const search = h('input', {
    type: 'search', class: 'search', autocomplete: 'off',
    placeholder: 'Search a name, trait or book…', 'aria-label': 'Search the heroes and villains'
  });
  search.addEventListener('input', () => { state.query = search.value; apply(); });

  const chip = (filter, value, label, n, cls) => h('button', {
    type: 'button', class: `chip${cls ? ` ${cls}` : ''}`, 'data-filter': filter, 'data-value': value,
    'aria-pressed': String(state[filter] === value)
  }, label, n != null && h('span', { class: 'chip-count' }, n));

  const t = data.totals;
  const chips = h('div', { class: 'chip-rows' },
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Show heroes or villains' },
      chip('side', 'all', 'Everyone', t.people),
      chip('side', 'hero', 'Heroes', t.heroes, 'side-hero'),
      chip('side', 'villain', 'Villains', t.villains, 'side-villain')),
    h('div', { class: 'chips', role: 'group', 'aria-label': 'Filter by testament' },
      chip('testament', 'all', 'Both Testaments'),
      chip('testament', 'Old', 'Old Testament'),
      chip('testament', 'New', 'New Testament')));
  chips.addEventListener('click', e => {
    const c = e.target.closest('.chip');
    if (!c) return;
    state[c.dataset.filter] = c.dataset.value;
    apply();
  });

  const count = h('p', { class: 'result-count', 'aria-live': 'polite' });
  const empty = h('p', { class: 'status', hidden: true }, 'No one matches that search.');

  const section = (side, people) => h('section', {
    class: `panel side-section side-${side}`, 'data-side': side, 'aria-labelledby': `h-${side}`
  },
    h('header', { class: 'side-head' },
      h('h2', { id: `h-${side}` }, SIDES[side].title),
      h('p', { class: 'side-count' }, `${people.length} people`),
      para(SIDES[side].intro, 'side-intro')),
    h('div', { class: 'person-grid' }, people.map(p => tile(p, toggle))));

  view.replaceChildren(
    h('section', { class: 'hero' },
      h('h1', {}, 'Heroes and Villains'),
      h('p', { class: 'lede' },
        'The people of the Bible who stood for God and those who stood against him — their stories, ' +
        'their defining moments, and what they teach us. Tap anyone to read their story.'),
      h('ul', { class: 'stats' },
        h('li', {}, h('b', {}, t.heroes), 'heroes'),
        h('li', {}, h('b', {}, t.villains), 'villains')),
      h('div', { class: 'finder' }, search),
      chips),
    count,
    section('hero', data.heroes),
    section('villain', data.villains),
    empty);

  apply();
  followHash(id => open(id, { smooth: false }));
}
