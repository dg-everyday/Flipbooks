/**
 * Small helpers shared by the study pages (peoples.html, bible-books.html).
 */

import { watchScripture } from '../../components/scripture-refs.js?v=20261002-1';

// Every study page imports this file, so every Bible reference the pages
// render, now or later (an opened panel, a filter, the blueprint test), is a
// pill that opens the passage in a popup.
watchScripture(document.body);

// The pages sit at apps/pages/, so the site root is two levels up. Data paths
// are written relative to the site root ("assets/..."), like stories.js.
export function siteRoot() {
  return new URL('../../', document.baseURI);
}

export async function fetchJson(path) {
  const response = await fetch(new URL(path, siteRoot()));
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${path}`);
  return response.json();
}

/**
 * Tiny DOM builder. Strings become text nodes, so nothing from the data is
 * ever parsed as HTML. Falsy children are dropped, which keeps optional parts
 * inline: h('p', {}, maybe && h('b', {}, maybe)). That includes 0, because the
 * usual guard is list.length && …, which gives 0 for an empty list; pass a
 * string, String(n), to show a count that may be zero.
 */
export function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false || child === '' || child === 0) continue;
    node.append(child instanceof Node ? child : String(child));
  }
  return node;
}

/** A row of scripture references (pills, once linked), or null when there are none. */
export function refList(refs) {
  if (!Array.isArray(refs) || refs.length === 0) return null;
  return h('ul', { class: 'refs', 'aria-label': 'Scripture references' },
    refs.map(r => h('li', {}, r)));
}

export function para(text, cls) {
  return text ? h('p', { class: cls }, text) : null;
}

// A funnel, in the line style of the page's other icons. A fixed string.
const FUNNEL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
  + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 4.5h17l-6.5 8v6l-4 2v-8z"/></svg>';
const POPOVER = Object.prototype.hasOwnProperty.call(HTMLElement.prototype, 'popover');

/**
 * The hero's filter menu, so a page opens on its title, its words and its
 * search, and the rest waits a tap away. Returns { button, menu }: the funnel
 * button goes first in the hero (it sits in the top-right corner) and the menu
 * last. The menu holds whatever is passed in, usually the page's counts and
 * filter chips, and pops up under the button over the page; a tap outside it,
 * its close button or Escape puts it away. It stays inside the hero in the
 * document, so the page's own filter code finds its chips as before and the
 * menu takes the hero's background.
 *
 * The button carries a dot while a filter narrows the list: while, in any
 * group of chips, the one pressed is not the first ("All", "Everything").
 * Browsers without popovers show the menu in the hero itself, under the button.
 */
export function filterMenu(...content) {
  const id = 'filter-menu';
  const button = h('button', {
    type: 'button', class: 'filter-toggle', 'aria-label': 'Filters', title: 'Filters',
    'aria-controls': id, 'aria-expanded': 'false'
  });
  button.innerHTML = FUNNEL_ICON;
  const close = h('button', { type: 'button', class: 'filter-menu-close', 'aria-label': 'Close filters' }, '×');
  const menu = h('div', { class: 'filter-menu', id, role: 'dialog', 'aria-label': 'Filters' },
    h('div', { class: 'filter-menu-head' }, h('p', { class: 'filter-menu-title' }, 'Filters'), close),
    content);

  const isOpen = () => (POPOVER ? menu.matches(':popover-open') : !menu.hidden);
  const hide = () => {
    if (!isOpen()) return;
    if (POPOVER) menu.hidePopover();
    else { menu.hidden = true; button.setAttribute('aria-expanded', 'false'); }
  };

  // Under the button, right-aligned with the hero and no wider than it. The
  // popover is in the top layer, where absolute positions are on the page.
  function place() {
    const hero = button.closest('.hero') || button.parentElement;
    const area = hero.getBoundingClientRect();
    const below = button.getBoundingClientRect().bottom + 10;
    const width = Math.min(area.width, 640);
    menu.style.width = `${width}px`;
    menu.style.left = `${area.right - width + window.scrollX}px`;
    menu.style.top = `${below + window.scrollY}px`;
  }

  if (POPOVER) {
    menu.setAttribute('popover', 'auto');
    button.setAttribute('popovertarget', id);
    menu.addEventListener('beforetoggle', e => { if (e.newState === 'open') place(); });
    menu.addEventListener('toggle', e => button.setAttribute('aria-expanded', String(e.newState === 'open')));
    window.addEventListener('resize', () => { if (isOpen()) place(); });
  } else {
    menu.hidden = true;
    menu.classList.add('is-inline');
    button.addEventListener('click', () => {
      menu.hidden = !menu.hidden;
      button.setAttribute('aria-expanded', String(!menu.hidden));
    });
  }
  close.addEventListener('click', () => { hide(); button.focus(); });
  // A link in the menu (#blueprint-test) leads somewhere else on the page.
  menu.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) hide(); });

  const syncDot = () => {
    const filtering = [...menu.querySelectorAll('[role="group"]')].some(group => {
      // A group put away for now (another view's), not the closed menu itself.
      const away = group.closest('[hidden]');
      if (away && away !== menu) return false;
      const chips = [...group.querySelectorAll('[aria-pressed]')];
      return chips.findIndex(c => c.getAttribute('aria-pressed') === 'true') > 0;
    });
    button.classList.toggle('is-filtering', filtering);
    button.setAttribute('aria-label', filtering ? 'Filters (some are on)' : 'Filters');
  };
  new MutationObserver(syncDot).observe(menu,
    { subtree: true, attributes: true, attributeFilter: ['aria-pressed', 'hidden'] });
  syncDot();

  return { button, menu };
}

/**
 * Opens a detail panel inside a grid, directly under the row of the tile that
 * was clicked — never as a popup — and keeps only one open at a time. Used by
 * bible-books.html and heroes-and-villains.html.
 *
 * Tiles are buttons carrying data-id; the panel is any element with the
 * .row-panel styles from study-page.css. The open tile's id is kept in the URL
 * hash (#ruth) so it can be linked to. Escape closes the panel.
 */
export function rowExpander({ tileSelector }) {
  let tile = null;
  let panel = null;

  // Put the panel straight after the last visible tile on the open tile's
  // row, so it spans the grid right under that row. Re-run on resize, since
  // the number of tiles per row changes with the width.
  function place() {
    if (!tile) return;
    // Measure rows without the panel: while it sits in the grid it forces the
    // tiles after it onto a new line, which would hide where the row ends.
    panel.remove();
    const tiles = [...tile.parentElement.querySelectorAll(tileSelector)].filter(t => !t.hidden);
    const top = tile.offsetTop;
    let last = tile;
    for (const t of tiles.slice(tiles.indexOf(tile) + 1)) {
      if (t.offsetTop !== top) break;
      last = t;
    }
    last.after(panel);
    // Point the notch at the middle of the open tile (the grid is the tiles'
    // offsetParent, so this is measured from the panel's own left edge).
    panel.style.setProperty('--notch-x', `${tile.offsetLeft + tile.offsetWidth / 2}px`);
  }

  function close({ keepHash = false, focus = false } = {}) {
    if (!tile) return;
    const wasOpen = tile;
    wasOpen.setAttribute('aria-expanded', 'false');
    wasOpen.classList.remove('is-open');
    panel.remove();
    tile = panel = null;
    if (!keepHash && location.hash) history.replaceState(null, '', location.pathname + location.search);
    if (focus) wasOpen.focus();
  }

  function open(newTile, newPanel, { smooth = true } = {}) {
    close({ keepHash: true });
    tile = newTile;
    panel = newPanel;
    tile.setAttribute('aria-expanded', 'true');
    tile.classList.add('is-open');
    place();
    history.replaceState(null, '', `#${tile.dataset.id}`);
    // Keep the tile in view with its details right below it. A click glides
    // there; arriving from a link (#ruth) jumps straight to it. 'instant', not
    // 'auto', because the page sets scroll-behavior: smooth.
    const topbar = document.querySelector('.topbar')?.offsetHeight || 0;
    const y = tile.getBoundingClientRect().top + window.scrollY - topbar - 12;
    const glide = smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: y, behavior: glide ? 'smooth' : 'instant' });
  }

  let pending = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(place);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && tile) close({ focus: true });
  });

  return {
    open,
    close,
    place,
    get openId() { return tile ? tile.dataset.id : null; },
    get openTile() { return tile; },
  };
}

/** Calls open(id) for the id in the URL hash now, and whenever it changes. */
export function followHash(open) {
  const fromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id) open(id);
  };
  window.addEventListener('hashchange', fromHash);
  fromHash();
}
