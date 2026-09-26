/**
 * Peoples of the Bible — drives peoples.html.
 *
 *   peoples.html                  ->  every people, from assets/peoples/index.json
 *   peoples.html?people=moabites  ->  one people, from assets/peoples/moabites.json
 *
 * The data is built and verse-checked by tools/people/build_people.py. Moving
 * between the two views uses history.pushState, so the back button works and
 * every people has a link that can be shared.
 *
 * Maps use Leaflet from cdnjs with OpenStreetMap tiles (no key needed). Leaflet is only
 * fetched once a map is on screen, and if it cannot load the page still works:
 * the map box says so and the list of places stays readable.
 */

import { h, fetchJson, refList, para } from './study-utils.js?v=20260926-2';

const PEOPLE_DIR = 'assets/peoples/';

// The id becomes part of a fetched path, so it is checked against an allowlist
// rather than escaped (same rule as stories.js).
const SLUG = /^[a-z0-9][a-z0-9_-]*$/i;

const LEAFLET = {
  css: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css',
  cssIntegrity: 'sha512-Zcn6bjR/8RZbLEpLIeOwNtzREBAJnUKESxces60Mpoj+2okopSAcSUIUOseddDm0cxnGQzxIR7vJgsLZbdLE3w==',
  js: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js',
  jsIntegrity: 'sha512-BwHfrr4c9kmRkLw6iXFdzcdWV/PGkVgiIyIWLLlTSXzWQzxuSg4DiQUCpauz/EWjgk5TYQqX/kvn9pG1NpYfqg==',
  tiles: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

// Filter groups, in the order they read best. Colours live in the stylesheet
// (.g-israel …); the map markers read the same values from GROUP_COLOURS.
const GROUPS = [
  { name: 'Israel', key: 'israel' },
  { name: 'Peoples of Canaan', key: 'canaan' },
  { name: 'Neighbours & kin', key: 'kin' },
  { name: 'Empires & kingdoms', key: 'empire' },
  { name: 'Before Israel', key: 'before' }
];
const GROUP_COLOURS = {
  israel: '#c6922e', canaan: '#b5532f', kin: '#5f7a2e', empire: '#2f5d8a', before: '#7a4f7a'
};
const groupKey = name => GROUPS.find(g => g.name === name)?.key || 'empire';

// Detail sections, in reading order. Each is skipped when the people has no
// data for it, and the jump bar only lists the sections that were drawn.
const SECTIONS = [
  ['origin', 'How they came to be'],
  ['lineage', 'Lineage'],
  ['tribes', 'The twelve tribes'],
  ['homeland', 'Where they lived'],
  ['timeline', 'Timeline'],
  ['religion', 'Religion'],
  ['importance', 'Why they matter'],
  ['impact', 'Lives they touched'],
  ['notable_people', 'Notable people'],
  ['key_verses', 'Key verses'],
  ['fate', 'What became of them'],
  ['today', 'Who they are today'],
  ['archaeology', 'Evidence from archaeology'],
  ['sources', 'Sources']
];

// ------------------------------------------------------------------ helpers

const peopleHref = id => (id ? `peoples.html?people=${encodeURIComponent(id)}` : 'peoples.html');
const regionShort = region => (region || '').split(' — ')[0];

// ------------------------------------------------------------------ data

let indexPromise = null;
const peopleCache = new Map();

function loadIndex() {
  indexPromise ??= fetchJson(`${PEOPLE_DIR}index.json`);
  return indexPromise;
}

function loadPeople(id) {
  if (!peopleCache.has(id)) {
    const p = fetchJson(`${PEOPLE_DIR}${id}.json`);
    // A failed fetch must not stay cached, or retrying would never work.
    p.catch(() => peopleCache.delete(id));
    peopleCache.set(id, p);
  }
  return peopleCache.get(id);
}

// ------------------------------------------------------------------ maps

let leafletPromise = null;

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  leafletPromise ??= new Promise((resolve, reject) => {
    const css = h('link', {
      rel: 'stylesheet', href: LEAFLET.css, integrity: LEAFLET.cssIntegrity, crossorigin: 'anonymous'
    });
    const js = h('script', {
      src: LEAFLET.js, integrity: LEAFLET.jsIntegrity, crossorigin: 'anonymous'
    });
    js.addEventListener('load', () => resolve(window.L));
    js.addEventListener('error', () => {
      leafletPromise = null;
      reject(new Error('Leaflet failed to load'));
    });
    document.head.append(css, js);
  });
  return leafletPromise;
}

// Only one map lives at a time; it is torn down before each render.
let activeMap = null;

function destroyMap() {
  if (activeMap) {
    activeMap.remove();
    activeMap = null;
  }
}

async function makeMap(box) {
  let L;
  try {
    L = await loadLeaflet();
  } catch {
    box.classList.add('map-offline');
    box.textContent = 'The map could not be loaded. The places are listed below.';
    return null;
  }
  // The view may have changed while Leaflet was downloading.
  if (!box.isConnected) return null;
  destroyMap();
  const map = L.map(box, { scrollWheelZoom: false, worldCopyJump: true });
  L.tileLayer(LEAFLET.tiles, {
    attribution: LEAFLET.attribution, maxZoom: 18
  }).addTo(map);
  activeMap = map;
  return { L, map };
}

async function drawOverviewMap(box, people, navigate) {
  const made = await makeMap(box);
  if (!made) return;
  const { L, map } = made;
  const points = [];
  for (const p of people) {
    if (!p.center) continue;
    const latlng = [p.center.lat, p.center.lon];
    points.push(latlng);
    L.circleMarker(latlng, {
      radius: 8, weight: 2, color: '#fff', fillOpacity: 0.9,
      fillColor: GROUP_COLOURS[groupKey(p.group)]
    })
      .bindTooltip(p.name, { direction: 'top', offset: [0, -6] })
      .on('click', () => navigate(p.id))
      .addTo(map);
  }
  if (points.length) map.fitBounds(points, { padding: [24, 24] });
}

async function drawPlacesMap(box, doc, placeButtons) {
  const made = await makeMap(box);
  if (!made) return;
  const { L, map } = made;
  const colour = GROUP_COLOURS[groupKey(doc.group)];
  const places = (doc.homeland?.places || []).filter(pl => Number.isFinite(pl.lat));
  const markers = places.map(pl => {
    const popup = h('div', { class: 'map-popup' },
      h('strong', {}, pl.name),
      pl.modern_name && h('span', {}, pl.modern_name),
      pl.note && h('p', {}, pl.note));
    return L.circleMarker([pl.lat, pl.lon], {
      radius: 8, weight: 2, color: '#fff', fillColor: colour, fillOpacity: 0.95
    }).bindPopup(popup).addTo(map);
  });
  const points = places.map(pl => [pl.lat, pl.lon]);
  if (points.length > 1) map.fitBounds(points, { padding: [28, 28], maxZoom: 9 });
  else if (points.length === 1) map.setView(points[0], 8);
  else if (doc.homeland?.center) map.setView([doc.homeland.center.lat, doc.homeland.center.lon], 6);

  // The place list beside the map flies to each marker.
  placeButtons.forEach((button, i) => {
    button.addEventListener('click', () => {
      map.flyTo(points[i], Math.max(map.getZoom(), 9), { duration: 0.6 });
      markers[i].openPopup();
      box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  });
}

// ------------------------------------------------------------------ list view

function renderList(view, people, navigate) {
  const state = { group: 'all', query: '' };
  const counts = new Map(GROUPS.map(g => [g.name, people.filter(p => p.group === g.name).length]));

  const search = h('input', {
    type: 'search', class: 'search', placeholder: 'Search by name, region or country…',
    'aria-label': 'Search the peoples of the Bible', autocomplete: 'off'
  });

  const chip = (label, value, count, key) => h('button', {
    type: 'button', class: `chip${key ? ` g-${key}` : ''}`, 'data-group': value,
    'aria-pressed': String(value === state.group)
  }, label, h('span', { class: 'chip-count' }, count));

  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': 'Filter by group' },
    chip('All', 'all', people.length),
    GROUPS.map(g => chip(g.name, g.name, counts.get(g.name), g.key)));

  const count = h('p', { class: 'result-count' });
  const grid = h('div', { class: 'grid' });
  const empty = h('p', { class: 'status', hidden: true }, 'No peoples match that search.');

  const cards = people.map(p => {
    const text = [p.name, ...(p.kjv_names || []), p.summary, p.region, p.ancestor,
      ...(p.modern_countries || [])].join(' ').toLowerCase();
    const card = h('a', {
      class: `people-card g-${groupKey(p.group)}`, href: peopleHref(p.id),
      onclick: e => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(p.id);
      }
    },
      h('span', { class: 'card-group' }, p.group),
      h('h2', {}, p.name),
      p.kjv_names?.length && h('p', { class: 'card-kjv' }, p.kjv_names.slice(0, 4).join(' · ')),
      h('p', { class: 'card-summary' }, p.summary),
      h('div', { class: 'card-meta' },
        h('span', { class: 'card-region' }, regionShort(p.region)),
        p.modern_countries?.length &&
          h('span', { class: 'card-today' }, `Today: ${p.modern_countries.slice(0, 3).join(', ')}`)));
    return { p, card, text };
  });
  grid.append(...cards.map(c => c.card));

  function apply() {
    const q = state.query.trim().toLowerCase();
    let shown = 0;
    for (const { p, card, text } of cards) {
      const visible = (state.group === 'all' || p.group === state.group) && (!q || text.includes(q));
      card.hidden = !visible;
      if (visible) shown += 1;
    }
    count.textContent = shown === people.length
      ? `${people.length} peoples and nations`
      : `Showing ${shown} of ${people.length}`;
    empty.hidden = shown !== 0;
    for (const button of chips.querySelectorAll('.chip')) {
      button.setAttribute('aria-pressed', String(button.dataset.group === state.group));
    }
  }

  chips.addEventListener('click', e => {
    const button = e.target.closest('.chip');
    if (!button) return;
    state.group = button.dataset.group;
    apply();
  });
  search.addEventListener('input', () => {
    state.query = search.value;
    apply();
  });

  const mapBox = h('div', { class: 'map', role: 'region', 'aria-label': 'Map of where each people lived' });
  const legend = h('ul', { class: 'legend' },
    GROUPS.map(g => h('li', { class: `g-${g.key}` }, g.name)));

  view.replaceChildren(
    h('section', { class: 'hero' },
      h('h1', {}, 'Peoples of the Bible'),
      h('p', { class: 'lede' },
        'The nations and tribes of Scripture — where they came from, where they lived, ' +
        'how they shaped Israel’s story, and who they are today.'),
      h('div', { class: 'finder' }, search),
      chips),
    h('section', { class: 'panel overview' },
      h('div', { class: 'panel-head' },
        h('h2', {}, 'Where they lived'),
        h('p', {}, 'Each dot marks a people’s heartland. Tap one to read about them.')),
      mapBox,
      legend),
    count,
    grid,
    empty);

  apply();
  drawOverviewMap(mapBox, people, navigate);
}

// ------------------------------------------------------------------ detail view

function section(id, title, ...body) {
  return h('section', { class: 'panel section', id: `s-${id}`, 'aria-labelledby': `h-${id}` },
    h('h2', { id: `h-${id}` }, title),
    body);
}

const BUILDERS = {
  origin: d => d.origin?.account && [para(d.origin.account), refList(d.origin.references)],

  lineage: d => {
    const l = d.lineage;
    if (!l) return null;
    return [
      l.line?.length ? h('ol', { class: 'lineage', 'aria-label': 'Line of descent' },
        l.line.map((name, i) => h('li', { class: i === l.line.length - 1 ? 'is-last' : null }, name))) : null,
      l.ancestor && h('p', {}, h('strong', {}, 'Ancestor: '), l.ancestor),
      para(l.notes),
      refList(l.references)
    ];
  },

  tribes: d => d.tribes?.length && h('div', { class: 'tribes' },
    d.tribes.map(t => h('article', { class: 'tribe' },
      h('h3', {}, t.name),
      h('p', { class: 'tribe-mother' }, `Mother: ${t.mother}`),
      para(t.territory, 'tribe-land'),
      para(t.note),
      refList(t.references)))),

  homeland: d => {
    const home = d.homeland;
    if (!home) return null;
    return [
      home.region && h('p', { class: 'sub' }, home.region),
      para(home.description),
      home.modern_location && h('p', {}, h('strong', {}, 'Today: '), home.modern_location)
    ];
  },

  timeline: d => d.timeline?.length && h('ol', { class: 'timeline' },
    d.timeline.map(t => h('li', {},
      h('span', { class: 'when' }, t.date),
      h('p', {}, t.event),
      refList(t.references)))),

  religion: d => {
    const r = d.religion;
    if (!r) return null;
    return [
      r.gods?.length && h('ul', { class: 'tags', 'aria-label': 'Gods' }, r.gods.map(g => h('li', {}, g))),
      para(r.practices),
      refList(r.references)
    ];
  },

  importance: d => para(d.importance, 'emphasis'),

  impact: d => d.impact?.length && h('ul', { class: 'impact' },
    d.impact.map(i => h('li', {},
      h('h3', {}, i.who),
      para(i.how),
      refList(i.references)))),

  notable_people: d => d.notable_people?.length && h('ul', { class: 'notables' },
    d.notable_people.map(n => h('li', {},
      h('strong', {}, n.name),
      h('span', {}, n.role),
      refList(n.references)))),

  key_verses: d => d.key_verses?.length && h('div', { class: 'verses' },
    d.key_verses.filter(v => v.text).map(v => h('figure', { class: 'verse' },
      h('blockquote', {}, v.text),
      h('figcaption', {}, `${v.reference} (KJV)`)))),

  fate: d => d.fate?.summary && [para(d.fate.summary), refList(d.fate.references)],

  today: d => {
    const t = d.today;
    if (!t) return null;
    return [
      para(t.summary, 'emphasis'),
      h('dl', { class: 'facts' },
        t.descendants && [h('dt', {}, 'Descendants'), h('dd', {}, t.descendants)],
        t.modern_legacy && [h('dt', {}, 'Legacy'), h('dd', {}, t.modern_legacy)])
    ];
  },

  archaeology: d => d.archaeology?.length && h('div', { class: 'finds' },
    d.archaeology.map(a => h('article', { class: 'find' },
      h('h3', {}, a.name),
      h('p', { class: 'find-meta' }, [a.date, a.discovered].filter(Boolean).join(' · ')),
      para(a.significance),
      a.location && h('p', { class: 'find-where' }, `Held at: ${a.location}`)))),

  sources: d => d.sources?.length && h('ol', { class: 'sources' },
    d.sources.map(s => h('li', {},
      s.url ? h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.title) : h('cite', {}, s.title),
      s.author && h('span', {}, ` — ${s.author}`),
      s.note && h('span', { class: 'source-note' }, ` ${s.note}`))))
};

function renderDetail(view, doc, people, navigate) {
  const key = groupKey(doc.group);
  const byId = new Map(people.map(p => [p.id, p]));
  const link = (id, label) => h('a', {
    href: peopleHref(id),
    onclick: e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      navigate(id);
    }
  }, label);

  // --- hero
  const hero = h('header', { class: `detail-hero g-${key}` },
    h('p', { class: 'crumbs' }, link(null, '← All peoples')),
    h('p', { class: 'eyebrow' }, `${doc.group} · ${doc.category}`),
    h('h1', {}, doc.name),
    doc.kjv_names?.length && h('p', { class: 'kjv' }, 'In the KJV: ', h('em', {}, doc.kjv_names.join(', '))),
    para(doc.summary, 'lede'),
    h('ul', { class: 'pills' },
      (doc.testaments || []).map(t => h('li', {}, `${t} Testament`)),
      (doc.also_known_as || []).map(a => h('li', { class: 'aka' }, a))));

  // --- sections
  const drawn = [];
  for (const [id, title] of SECTIONS) {
    const body = BUILDERS[id](doc);
    if (!body || (Array.isArray(body) && body.every(b => !b))) continue;
    drawn.push([id, title, section(id, title, body)]);
  }
  const jump = h('nav', { class: 'jump', 'aria-label': 'Sections' },
    drawn.map(([id, title]) => h('a', { href: `#s-${id}` }, title)));

  // --- side panel: map, places, facts, related
  const places = (doc.homeland?.places || []).filter(pl => Number.isFinite(pl.lat));
  const placeButtons = places.map(pl => h('button', { type: 'button', class: 'place' },
    h('strong', {}, pl.name),
    pl.modern_name && h('span', {}, pl.modern_name)));
  const mapBox = h('div', { class: 'map map-small', role: 'region', 'aria-label': `Map of places linked to the ${doc.name}` });

  const home = doc.homeland || {};
  const glance = h('dl', { class: 'facts' },
    doc.lineage?.ancestor && [h('dt', {}, 'Ancestor'), h('dd', {}, doc.lineage.ancestor)],
    home.region && [h('dt', {}, 'Homeland'), h('dd', {}, home.region)],
    home.modern_countries?.length && [h('dt', {}, 'Today in'), h('dd', {}, home.modern_countries.join(', '))],
    doc.name_meaning && [h('dt', {}, 'The name'), h('dd', {}, doc.name_meaning)]);

  const related = (doc.related_peoples || []).filter(id => byId.has(id));

  const aside = h('aside', { class: 'detail-side' },
    h('section', { class: 'panel' },
      h('h2', {}, 'On the map'),
      mapBox,
      placeButtons.length ? h('div', { class: 'places' }, placeButtons) : null),
    h('section', { class: 'panel' }, h('h2', {}, 'At a glance'), glance),
    related.length ? h('section', { class: 'panel' },
      h('h2', {}, 'Related peoples'),
      h('ul', { class: 'related' }, related.map(id =>
        h('li', { class: `g-${groupKey(byId.get(id).group)}` }, link(id, byId.get(id).name))))) : null);

  // --- previous / next, in the list's order
  const i = people.findIndex(p => p.id === doc.id);
  const prev = people[(i - 1 + people.length) % people.length];
  const next = people[(i + 1) % people.length];
  const pager = h('nav', { class: 'pager', 'aria-label': 'More peoples' },
    link(prev.id, `← ${prev.name}`),
    link(next.id, `${next.name} →`));

  view.replaceChildren(
    hero,
    jump,
    h('div', { class: `detail-layout g-${key}` },
      aside,
      h('article', { class: 'detail-main' }, drawn.map(([, , node]) => node))),
    pager);

  drawPlacesMap(mapBox, doc, placeButtons);
}

// ------------------------------------------------------------------ routing

function currentId(search = window.location.search) {
  const raw = (new URLSearchParams(search).get('people') || '').trim();
  if (!raw) return { id: null, invalid: false };
  return SLUG.test(raw) ? { id: raw, invalid: false } : { id: null, invalid: true };
}

function showMessage(view, message) {
  destroyMap();
  view.replaceChildren(h('p', { class: 'status' }, message),
    h('p', { class: 'status' }, h('a', { href: 'peoples.html' }, 'See all peoples')));
}

export async function start(view) {
  // Sorted by group, then name, so the list and prev/next agree.
  let people;
  try {
    const index = await loadIndex();
    const order = new Map(GROUPS.map((g, i) => [g.name, i]));
    people = [...index].sort((a, b) =>
      (order.get(a.group) ?? 99) - (order.get(b.group) ?? 99) || a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Unable to load the peoples index:', error);
    showMessage(view, 'The peoples of the Bible could not be loaded. Please try again later.');
    return;
  }

  let renderToken = 0;
  // Jump links only change the hash, and following one fires popstate too;
  // re-rendering then would throw away the page the reader is scrolling.
  let renderedSearch = null;

  async function render() {
    const token = ++renderToken;
    renderedSearch = window.location.search;
    const { id, invalid } = currentId();
    destroyMap();

    if (invalid) {
      document.title = 'Daily Grace — Peoples of the Bible';
      showMessage(view, 'That is not a valid people name.');
      return;
    }
    if (!id) {
      document.title = 'Daily Grace — Peoples of the Bible';
      renderList(view, people, navigate);
      return;
    }
    view.replaceChildren(h('p', { class: 'status' }, 'Loading…'));
    try {
      const doc = await loadPeople(id);
      if (token !== renderToken) return;                // a newer navigation won
      document.title = `Daily Grace — ${doc.name}`;
      renderDetail(view, doc, people, navigate);
    } catch (error) {
      if (token !== renderToken) return;
      console.error(`Unable to load people "${id}":`, error);
      showMessage(view, `There is no people called “${id}” here yet.`);
    }
  }

  function navigate(id) {
    history.pushState(null, '', peopleHref(id));
    window.scrollTo({ top: 0 });
    render();
  }

  window.addEventListener('popstate', () => {
    if (window.location.search !== renderedSearch) render();
  });
  render();
}
