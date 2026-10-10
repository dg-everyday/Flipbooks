/**
 * <bookmark-manager> — every bookmark on this device, in one popup, as a web
 * component.
 *
 * Holding a verse, a fact, a saying, today's question or a blueprint saves
 * it (each component keeps its own list in localStorage). This popup shows
 * them all, one kind at a time under a segmented switch, with a count on each
 * segment. It opens on the kind looked at last. Unlike the verse popup it is
 * browsed, so a tap inside it does not close it: only the close button, the
 * backdrop or Escape do. It grows in with a little overshoot, as the splash
 * and the verse popup do.
 *
 * The PDF pill opens every bookmark, all five kinds, as one PDF in a new tab
 * (assets/scripts/bookmarks-pdf.js, loaded on the first tap). The tab is
 * opened inside the tap, since browsers block one opened later; with the tab
 * blocked, the PDF is downloaded instead. A note under the title says how it
 * went.
 *
 * Usage
 *   <bookmark-manager id="bookmarks"></bookmark-manager>
 *   <script type="module" src="./apps/components/bookmark-manager.js"></script>
 *   bookmarks.loadVerses = async (ids) => { …; return rows; };
 *   bookmarks.open();
 *
 * The page loads the five list components it shows: <bible-search-results>,
 * <did-you-know>, <bible-sayings>, <daily-guidance> and <gods-blueprint>.
 *
 * Attributes
 *   open     Set by the component while the popup is open (read-only); the
 *            page uses it to stop the page behind scrolling.
 *
 * Properties   loadVerses   (ids) => rows, or a promise of them: the
 *                           bookmarked verses' rows ({ docid, book_name,
 *                           book_id, chapter, verse, text }) in the order of
 *                           the ids. The Bible database belongs to the page,
 *                           so the page supplies this.
 * Methods      open()       open the popup, with every list brought up to date
 *              close()      close it; resolves once it has closed
 *
 * Fonts: Germania One (title) and Roboto (text) are registered on the
 * document by assets/scripts/fonts.js, because browsers do not reliably load
 * @font-face rules declared inside a shadow root.
 *
 * Colours: the page's --navy, --ink, --cream, --gold, --action, --action-hover
 * and --action-ink (assets/styles/styles.css), which inherit into the shadow
 * root.
 */

import { registerFonts } from '../../assets/scripts/fonts.js';

const asset = (path) => new URL(path, import.meta.url).href;

const EMBLEM_URL = asset('../../assets/images/dg-icon-gold-256.webp');
const PDF_MODULE = asset('../../assets/scripts/bookmarks-pdf.js?v=20261003-1');

// The segments, in order: the list component behind each and its tab label.
const KINDS = [
  { key: 'verses', label: 'Bible Verses', list: '<bible-search-results id="bookmark-verses" compact></bible-search-results>' },
  { key: 'facts', label: 'Did You Know', list: '<did-you-know id="bookmark-facts" bookmarks></did-you-know>' },
  { key: 'sayings', label: 'Bible Sayings', list: '<bible-sayings id="bookmark-sayings" bookmarks></bible-sayings>' },
  { key: 'guidance', label: 'Questions', list: '<daily-guidance id="bookmark-guidance" bookmarks></daily-guidance>' },
  { key: 'blueprint', label: 'Blueprint', list: '<gods-blueprint id="bookmark-blueprint" bookmarks></gods-blueprint>' },
];

const STYLES = /* css */ `
  :host { display: contents; }
  * { box-sizing: border-box; }

  /* One kind of bookmark at a time, picked with the segmented switch. The
     title and the switch stay put while the list scrolls under them. The dialog
     has no padding, so a click on it is a click on the backdrop. */
  .bookmarks-dialog {
    width: min(600px, 94vw);
    /* One height for every segment, so switching does not make the popup jump. */
    height: min(680px, 90vh);
    height: min(680px, 90dvh);
    padding: 0;
    border: 0;
    border-radius: 20px;
    background: var(--cream);
    color: var(--ink);
    box-shadow: 0 28px 70px rgb(0 27 52 / 45%);
    overflow: auto;
    overscroll-behavior: contain;
  }
  .bookmarks-dialog::backdrop {
    background: rgb(0 27 52 / 62%);
    backdrop-filter: blur(4px);
  }
  .bookmarks-bar {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    padding: 16px 14px 12px 18px;
    background:
      radial-gradient(90% 140% at 30% 0%, #fffaf0 0%, transparent 70%),
      linear-gradient(180deg, #f8efdd, var(--cream));
    border-bottom: 1px solid rgb(198 146 46 / 45%);
    box-shadow: 0 6px 12px -8px rgb(0 27 52 / 18%);
    font-family: 'Roboto', Arial, sans-serif;
  }
  .bookmarks-bar h2 {
    margin: 0;
    color: var(--navy);
    font: 400 clamp(1.5rem, 1.3rem + 1vw, 1.875rem)/1.05 'Germania One', Georgia, serif;
    letter-spacing: .02em;
  }
  /* The title with the PDF pill beside it. */
  .bookmarks-title { display: flex; align-items: center; gap: 10px; }
  .bookmarks-pdf {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 4px;
    min-height: 28px;
    padding: 4px 11px 4px 8px;
    border: 0;
    border-radius: 999px;
    background: var(--action);
    color: var(--action-ink);
    box-shadow: 0 3px 8px rgb(0 0 0 / 22%);
    font: 700 .75rem/1 'Roboto', Arial, sans-serif;
    letter-spacing: .06em;
    cursor: pointer;
    transition: background-color .15s ease, transform .15s ease;
  }
  .bookmarks-pdf:hover { background: var(--action-hover); transform: translateY(-1px); }
  .bookmarks-pdf:focus-visible { outline: 2px solid var(--navy); outline-offset: 2px; }
  .bookmarks-pdf svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  /* While the PDF is built the arrow keeps dropping into the tray. */
  .bookmarks-pdf[aria-busy="true"] { cursor: progress; }
  .bookmarks-pdf[aria-busy="true"] svg { animation: pdf-drop .9s ease-in-out infinite; }
  @keyframes pdf-drop {
    0%, 100% { transform: translateY(-2px); }
    50% { transform: translateY(2px); }
  }
  .bookmarks-pdf:disabled { opacity: .45; cursor: default; box-shadow: none; transform: none; }
  .bookmarks-pdf-note {
    flex: 1 0 100%;
    margin: -4px 0 0;
    color: #805b18;
    font-size: .8rem;
    line-height: 1.35;
  }
  .bookmarks-pdf-note.is-error { color: var(--action); }

  /* A segmented switch: four equal segments on a sunken track (two rows of two
     on a phone), the chosen one raised in white with its count in gold. */
  .bookmark-tabs {
    display: grid;
    flex: 1 0 100%;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 4px;
    padding: 4px;
    border-radius: 14px;
    background: rgb(0 27 52 / 8%);
    box-shadow: inset 0 1px 2px rgb(0 27 52 / 12%);
  }
  .bookmark-tabs [role="tab"] {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 2px 6px;
    min-height: 40px;
    padding: 6px 8px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: #4f5c65;
    font: 600 .8125rem/1.2 'Roboto', Arial, sans-serif;
    text-align: center;
    cursor: pointer;
    transition: background-color .2s ease, color .2s ease, box-shadow .2s ease;
  }
  .bookmark-tabs [role="tab"]:hover { background: rgb(255 255 255 / 45%); color: var(--navy); }
  .bookmark-tabs [aria-selected="true"],
  .bookmark-tabs [aria-selected="true"]:hover {
    background: #fff;
    color: var(--navy);
    box-shadow: 0 1px 4px rgb(0 27 52 / 18%);
  }
  .bookmark-tabs [role="tab"]:focus-visible { outline: 2px solid var(--navy); outline-offset: 1px; }
  .bookmark-count {
    min-width: 20px;
    padding: 1px 6px;
    border-radius: 999px;
    background: rgb(0 27 52 / 10%);
    font-size: .6875rem;
    font-variant-numeric: tabular-nums;
  }
  .bookmark-count:empty { display: none; }
  .bookmark-tabs [aria-selected="true"] .bookmark-count { background: var(--gold); color: #fff; }
  .bookmarks-panel { padding: 14px; }
  /* The popups scroll the verses themselves, rather than in a box of their own
     with a second scrollbar beside the popup's. */
  #bookmark-verses { --reader-max-height: none; }
  @media (max-width: 560px) {
    /* Five tabs in two rows: three above, two below. */
    .bookmark-tabs { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    .bookmark-tabs [role="tab"] { grid-column: span 2; }
    .bookmark-tabs [role="tab"]:nth-child(n + 4) { grid-column: span 3; }
    .bookmark-tabs [role="tab"] { min-height: 36px; }
  }
  @media (max-width: 420px) {
    .bookmarks-panel { padding: 10px; }
    .bookmark-tabs [role="tab"] { padding: 6px 4px; font-size: .75rem; }
  }

  /* The header pieces, as in the menu, Help and About: the emblem, the eyebrow
     and the round close button. */
  .help-emblem {
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgb(198 146 46 / 35%));
  }
  .help-heading { flex: 1; min-width: 0; }
  .help-eyebrow {
    margin: 0 0 3px;
    color: #805b18;
    font: 700 .625rem/1 'Roboto', Arial, sans-serif;
    letter-spacing: .24em;
    text-transform: uppercase;
  }
  .help-close {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: rgb(243 231 210 / 82%);
    color: var(--navy);
    box-shadow: 0 2px 10px rgb(0 27 52 / 18%);
    cursor: pointer;
    transition: background-color .15s ease, transform .2s ease;
  }
  .help-close:hover { background: #fff; transform: rotate(90deg); }
  .help-close:focus-visible { outline: 2px solid var(--navy); outline-offset: 2px; }
  .help-close svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }

  /* The popup is read and scrolled, and shares its edges with Help, About and
     the verse popup.
     A slim gold scrollbar on a clear track, held off the rounded corners, in
     place of the grey system bar that squared off the dialog's right edge. The
     thumb's transparent border leaves a thin pill floating inside the gutter. */
  .bookmarks-dialog::-webkit-scrollbar { width: 10px; }
  .bookmarks-dialog::-webkit-scrollbar-track { margin-block: 20px; background: transparent; }
  .bookmarks-dialog::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    border-radius: 999px;
    background: rgb(198 146 46 / 40%) padding-box;
  }
  .bookmarks-dialog::-webkit-scrollbar-thumb:hover { background-color: rgb(198 146 46 / 75%); }
  /* Firefox has no ::-webkit-scrollbar. Chrome would drop the rules above if it
     saw these, so only browsers without them get the standard properties. */
  @supports not selector(::-webkit-scrollbar) {
    .bookmarks-dialog {
      scrollbar-width: thin;
      scrollbar-color: rgb(198 146 46 / 50%) transparent;
    }
  }
  /* Text scrolling out of view fades into the paper a little short of the
     rounded edge rather than running into it. The band sticks to the bottom and
     its negative margin lays it over the closing padding, so it takes no room. */
  .bookmarks-dialog::after {
    content: "";
    position: sticky;
    bottom: 0;
    z-index: 1;
    display: block;
    height: 30px;
    margin-top: -30px;
    background: linear-gradient(rgb(243 231 210 / 0%), var(--cream) 70%);
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .help-close { transition: none; }
    .bookmarks-pdf { transition: none; }
    .bookmarks-pdf[aria-busy="true"] svg { animation: none; }
    .bookmark-tabs [role="tab"] { transition: none; }
  }
`;

const TEMPLATE = /* html */ `
<dialog class="bookmarks-dialog" aria-labelledby="bookmarks-title">
    <header class="bookmarks-bar">
        <img class="help-emblem" src="${EMBLEM_URL}" alt="" width="40" height="40" />
        <div class="help-heading">
            <p class="help-eyebrow">Saved on this device</p>
            <div class="bookmarks-title">
                <h2 id="bookmarks-title">Bookmarks</h2>
                <button
                    id="bookmarks-pdf"
                    class="bookmarks-pdf"
                    type="button"
                    aria-label="Open your bookmarks as a PDF in a new tab"
                    title="Open your bookmarks as a PDF"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />
                    </svg>
                    <span>PDF</span>
                </button>
            </div>
        </div>
        <button
            id="bookmarks-close"
            class="help-close"
            autofocus
            type="button"
            aria-label="Close bookmarks"
            title="Close"
        >
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
            </svg>
        </button>
        <div class="bookmark-tabs" role="tablist" aria-label="Kind of bookmark">${KINDS.map(({ key, label }, i) => `
            <button id="bookmarks-tab-${key}" type="button" role="tab" aria-controls="bookmarks-panel-${key}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''}>
                ${label} <span class="bookmark-count"></span>
            </button>`).join('')}
        </div>
        <p id="bookmarks-pdf-note" class="bookmarks-pdf-note" role="status" hidden></p>
    </header>${KINDS.map(({ key, list }, i) => `
    <section id="bookmarks-panel-${key}" class="bookmarks-panel" role="tabpanel" aria-labelledby="bookmarks-tab-${key}"${i ? ' hidden' : ''}>
        ${list}
    </section>`).join('')}
</dialog>`;

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Grows in with a little overshoot, as the splash and the verse popup do.
function popDialog(dialog, direction) {
  const opening = direction === 'open';
  const options = {
    duration: opening ? 460 : 220,
    easing: opening ? 'cubic-bezier(.2, .9, .25, 1.2)' : 'cubic-bezier(.4, 0, 1, 1)',
    fill: 'forwards',
  };
  const entering = { transform: 'scale(.82) translateY(28px)', opacity: 0 };
  const full = { transform: 'none', opacity: 1 };
  const leaving = { transform: 'scale(.94)', opacity: 0 };
  dialog.animate(opening ? [entering, full] : [full, leaving], options);
  const backdrop = dialog.animate(
    opening ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }],
    { ...options, easing: 'ease', pseudoElement: '::backdrop' },
  );
  return backdrop.finished.catch(() => {});
}

// The tab is opened at once, inside the tap: browsers block a tab opened later,
// once the PDF is ready. It says what is coming until the PDF replaces it.
function openPdfTab() {
  const tab = window.open('', '_blank');
  if (!tab) return null;
  try {
    tab.document.title = 'My Bookmarks — Daily Grace';
    tab.document.body.style.cssText =
      'margin:0;display:grid;place-items:center;min-height:100vh;'
      + 'background:#f3e7d2;color:#001b34;font:600 1.1rem/1.4 system-ui,sans-serif';
    tab.document.body.textContent = 'Preparing your bookmarks…';
  } catch {
    // Some browsers keep the new tab to themselves; it still loads the PDF.
  }
  return tab;
}

// When no tab could be opened (a pop-up blocker), the PDF is saved instead.
function savePdf(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
}

export class BookmarkManager extends HTMLElement {
  #loadVerses = null;
  #dialog;
  #tabs;
  #lists;
  #verses;
  #pdf;
  #note;
  #noteTimer = 0;
  // The popup opens on the kind of bookmark looked at last.
  #tab;
  // Bumped on each open and close, so a slow verse load from an earlier
  // opening does not land in a later one.
  #generation = 0;
  #closing = false;

  constructor() {
    super();
    // The page may set loadVerses before this module has loaded; take the
    // value over from the plain property it left on the element.
    if (Object.hasOwn(this, 'loadVerses')) {
      const loadVerses = this.loadVerses;
      delete this.loadVerses;
      this.loadVerses = loadVerses;
    }
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`;

    const dialog = root.querySelector('dialog');
    this.#dialog = dialog;
    this.#tabs = [...root.querySelectorAll('[role="tab"]')];
    // The component behind each tab, whose bookmarks the tab counts.
    this.#lists = new Map(this.#tabs.map((tab, i) => [tab, root.getElementById(`bookmark-${KINDS[i].key}`)]));
    this.#verses = root.getElementById('bookmark-verses');
    this.#pdf = root.getElementById('bookmarks-pdf');
    this.#note = root.getElementById('bookmarks-pdf-note');
    this.#tab = this.#tabs[0];

    // Escape would close instantly; route it through the closing animation instead.
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      this.close();
    });
    // The dialog has no padding, so a click on it is a click on the backdrop.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) this.close();
    });
    root.getElementById('bookmarks-close').addEventListener('click', () => this.close());
    this.#pdf.addEventListener('click', () => this.#openPdf());

    for (const tab of this.#tabs) {
      tab.addEventListener('click', () => this.#select(tab));
    }
    // The arrow keys move along the switch, as in any tab list.
    root.querySelector('[role="tablist"]').addEventListener('keydown', (event) => {
      const index = this.#tabs.indexOf(this.#tab);
      const last = this.#tabs.length - 1;
      const next = {
        ArrowLeft: index === 0 ? last : index - 1,
        ArrowRight: index === last ? 0 : index + 1,
        Home: 0,
        End: last,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      this.#select(this.#tabs[next], { focus: true });
    });
    for (const list of this.#lists.values()) {
      list.addEventListener('bookmarkchange', () => this.#updateCounts());
    }
  }

  connectedCallback() {
    registerFonts();
  }

  /** (ids) => rows, or a promise of them; see the header. */
  get loadVerses() {
    return this.#loadVerses;
  }

  set loadVerses(loadVerses) {
    this.#loadVerses = loadVerses;
  }

  async open() {
    const generation = ++this.#generation;
    const dialog = this.#dialog;
    if (!dialog.open) {
      dialog.showModal();
      this.toggleAttribute('open', true);
      if (!reducedMotion.matches) popDialog(dialog, 'open');
    }
    this.#select(this.#tab);
    this.#updateCounts();
    // Bookmarks may have been added on the page since the lists were last drawn.
    for (const list of this.#lists.values()) {
      if (list !== this.#verses) list.showBookmarks();
    }
    const verses = this.#verses;
    const ids = verses.bookmarks ?? [];
    if (!ids.length) {
      verses.showBookmarks([]);
      return;
    }
    verses.loading('Loading your bookmarks…');
    try {
      const rows = await this.#versesFor(ids);
      if (generation !== this.#generation || !dialog.open) return;
      verses.showBookmarks(rows);
    } catch (error) {
      if (generation !== this.#generation) return;
      console.warn('Bookmarks could not be loaded:', error);
      verses.showMessage('Your bookmarks could not be loaded. Please try again.');
    }
  }

  async close() {
    const dialog = this.#dialog;
    if (!dialog.open || this.#closing) return;
    this.#closing = true;
    this.#generation++;
    if (!reducedMotion.matches) await popDialog(dialog, 'close');
    dialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    dialog.close();
    this.toggleAttribute('open', false);
    this.#verses.reset();
    this.#showNote('');
    this.#closing = false;
  }

  async #versesFor(ids) {
    if (typeof this.#loadVerses !== 'function') throw new Error('No loadVerses was given.');
    return this.#loadVerses(ids);
  }

  #select(tab, { focus = false } = {}) {
    this.#tab = tab;
    for (const other of this.#tabs) {
      const selected = other === tab;
      other.setAttribute('aria-selected', String(selected));
      other.tabIndex = selected ? 0 : -1;
      this.shadowRoot.getElementById(other.getAttribute('aria-controls')).hidden = !selected;
    }
    this.#dialog.scrollTop = 0;
    if (focus) tab.focus();
  }

  #updateCounts() {
    let total = 0;
    for (const [tab, list] of this.#lists) {
      const count = list.bookmarks?.length ?? 0;
      tab.querySelector('.bookmark-count').textContent = count || '';
      total += count;
    }
    // Nothing to put in a PDF until something is bookmarked.
    this.#pdf.disabled = total === 0;
    this.#pdf.title = total ? 'Open your bookmarks as a PDF' : 'Nothing bookmarked yet';
  }

  #showNote(message, { error = false, linger = 0 } = {}) {
    clearTimeout(this.#noteTimer);
    this.#note.textContent = message;
    this.#note.classList.toggle('is-error', error);
    this.#note.hidden = !message;
    if (message && linger) {
      this.#noteTimer = setTimeout(() => this.#showNote(''), linger);
    }
  }

  // The PDF pill: every bookmark, all five kinds, as one PDF opened in a new
  // tab. The builder and the jsPDF library behind it load on the first tap, not
  // with the page, and the whole thing runs on the reader's device.
  async #openPdf() {
    const pdf = this.#pdf;
    if (pdf.getAttribute('aria-busy') === 'true') return;
    const tab = openPdfTab();
    pdf.setAttribute('aria-busy', 'true');
    this.#showNote('Preparing your PDF…');
    try {
      const lists = Object.fromEntries(KINDS.map(({ key }, i) => [key, this.#lists.get(this.#tabs[i])]));
      const verseIds = lists.verses.bookmarks;
      const [verses, facts, sayings, guidance, blueprint, { makeBookmarksPdf }] = await Promise.all([
        verseIds.length ? this.#versesFor(verseIds) : [],
        lists.facts.bookmarkedItems(),
        lists.sayings.bookmarkedItems(),
        lists.guidance.bookmarkedItems(),
        lists.blueprint.bookmarkedItems(),
        import(PDF_MODULE),
      ]);
      if (!verses.length && !facts.length && !sayings.length && !guidance.length && !blueprint.length) {
        tab?.close();
        this.#showNote('Nothing is bookmarked yet.', { linger: 4000 });
        return;
      }
      const { blob, filename } = await makeBookmarksPdf({ verses, facts, sayings, guidance, blueprint });
      const url = URL.createObjectURL(blob);
      // Kept long enough for the tab to load it, and to reload it for a while.
      setTimeout(() => URL.revokeObjectURL(url), 10 * 60 * 1000);
      if (tab && !tab.closed) {
        tab.location.href = url;
        this.#showNote('Your PDF has opened in a new tab.', { linger: 4000 });
      } else {
        savePdf(url, filename);
        this.#showNote('Your browser blocked the new tab, so the PDF was downloaded instead.',
          { linger: 6000 });
      }
    } catch (error) {
      tab?.close();
      console.warn('The bookmarks PDF could not be made:', error);
      this.#showNote(
        'The PDF could not be made. Check your connection and try again.',
        { error: true, linger: 8000 },
      );
    } finally {
      pdf.removeAttribute('aria-busy');
    }
  }
}

if (!customElements.get('bookmark-manager')) {
  customElements.define('bookmark-manager', BookmarkManager);
}
