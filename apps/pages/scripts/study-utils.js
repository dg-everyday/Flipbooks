/**
 * Small helpers shared by the study pages (peoples.html, bible-books.html).
 */

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
 * inline: h('p', {}, maybe && h('b', {}, maybe)).
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
    if (child == null || child === false || child === '') continue;
    node.append(child instanceof Node ? child : String(child));
  }
  return node;
}

/** A row of small scripture-reference labels, or null when there are none. */
export function refList(refs) {
  if (!Array.isArray(refs) || refs.length === 0) return null;
  return h('ul', { class: 'refs', 'aria-label': 'Scripture references' },
    refs.map(r => h('li', {}, r)));
}

export function para(text, cls) {
  return text ? h('p', { class: cls }, text) : null;
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
