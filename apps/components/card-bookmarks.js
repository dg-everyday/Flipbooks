/**
 * Hold-to-bookmark for the card lists of <did-you-know> and <bible-sayings>.
 *
 * Holding a card for half a second bookmarks it, the way a verse card in
 * <bible-search-results> is bookmarked: a gold glow spreads from the finger,
 * the card takes a ribbon and a note says what happened. Holding it again
 * removes the bookmark. Each kind of card keeps its ids in localStorage,
 * newest first, under its own key and up to its own limit, shared by every
 * instance on the page and kept in step across tabs. The page lists them all,
 * with the bookmarked verses, in the popup that holding the DG emblem opens.
 *
 * Usage (inside a component)
 *   const bookmarks = bookmarkStore('dailygrace:bookmarks:facts',
 *     { isId: Number.isSafeInteger, limit: 50 });
 *   // BOOKMARK_STYLES goes in the shadow root; each card gets the class
 *   // "bookmarkable", and "bookmarked" while it is saved.
 *   new CardHold(list, {
 *     selector: '.fact',
 *     exclude: 'button',          // parts of a card that are not held
 *     onHold: (card) => showBookmarkResult(card, bookmarks.toggle(id), bookmarks.limit),
 *   });
 *   bookmarks.addEventListener('change', syncRibbons);
 *
 * The components import this file with a ?v= token, since the deploy only
 * stamps the tokens in the HTML. When it changes, bump the token in all three
 * imports (did-you-know, bible-sayings, bible-search-results) to the same
 * value: a different URL would load a second copy of the module.
 */

// How long a card is held to bookmark it, and how far the finger may drift
// before the hold counts as a scroll instead. The same as the verse cards.
export const HOLD_MS = 500;
const HOLD_SLOP = 10;

/** What a hold did, in words: result is what toggle() returned. */
export function bookmarkNote(result, limit) {
  return {
    added: 'Bookmarked',
    removed: 'Bookmark removed',
    // Say how to make room, since the list to tidy is somewhere else.
    full: `Bookmarks full (${limit}). Hold the DG emblem to remove some.`,
    failed: 'Bookmark not saved',
  }[result];
}

// Browsers may clear a site's storage to free up space, and Safari clears it
// after some days without a visit. Asking for persistent storage, the first
// time something is bookmarked, keeps the bookmarks wherever the browser
// grants it. Chrome decides by itself; Firefox asks the reader once.
let persistRequested = false;

/** Asks the browser, once per page, not to clear the bookmarks. Shared with the verse bookmarks. */
export function keepBookmarks() {
  if (persistRequested) return;
  persistRequested = true;
  navigator.storage?.persisted?.()
    .then((persisted) => persisted || navigator.storage.persist())
    .catch(() => {});
}

export const BOOKMARK_STYLES = /* css */ `
  /* Holding a card grows a glow out from the finger; it is gold for a new
     bookmark and navy when the hold will remove one. The glow sits under the
     card's content but over its background. */
  .bookmarkable {
    --glow: 214 170 40;
    position: relative;
    overflow: hidden;
    isolation: isolate;
    -webkit-touch-callout: none;
  }
  .bookmarkable.bookmarked { --glow: 0 27 52; }
  /* On touch screens a long press would select the text instead. */
  @media (pointer: coarse) {
    .bookmarkable { -webkit-user-select: none; user-select: none; }
  }
  .bookmarkable::before {
    content: '';
    position: absolute; z-index: -1;
    left: var(--hold-x, 50%); top: var(--hold-y, 50%);
    width: 640px; height: 640px;
    margin: -320px 0 0 -320px;
    border-radius: 50%;
    background: radial-gradient(closest-side,
      rgb(var(--glow) / 40%), rgb(var(--glow) / 16%) 55%, transparent);
    opacity: 0;
    transform: scale(0);
    pointer-events: none;
    transition: transform .3s ease, opacity .3s ease;
  }
  .bookmarkable.holding::before {
    opacity: 1;
    transform: scale(1);
    transition: transform ${HOLD_MS}ms cubic-bezier(.25, .7, .35, 1), opacity .15s ease;
  }
  /* The hold is done: the card flashes and the glow fades out. */
  .bookmarkable[data-flash] {
    --flash: 168 129 12;
    --glow: var(--flash);
    animation: bookmark-pulse .9s ease-out;
  }
  .bookmarkable[data-flash="removed"] { --flash: 0 27 52; }
  .bookmarkable[data-flash="full"],
  .bookmarkable[data-flash="failed"] { --flash: 179 38 30; }
  .bookmarkable[data-flash]::before { animation: bookmark-glow .9s ease-out forwards; }
  @keyframes bookmark-pulse {
    from { box-shadow: inset 0 0 0 2px rgb(var(--flash)), inset 0 0 28px rgb(var(--flash) / 45%); }
    to { box-shadow: inset 0 0 0 2px transparent, inset 0 0 28px transparent; }
  }
  @keyframes bookmark-glow {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(1.2); }
  }
  /* A bookmarked card carries a gold ribbon at its top edge. */
  .bookmarkable.bookmarked::after {
    content: '';
    position: absolute; top: 0; right: 10px;
    width: 12px; height: 17px;
    background: #a8810c;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%);
    pointer-events: none;
  }
  .bookmarkable[data-flash="added"]::after { animation: ribbon-drop .35s ease-out; }
  @keyframes ribbon-drop { from { transform: translateY(-100%); } }
  /* The note wraps onto a second line on a narrow card rather than spill out
     of it, and the longer "full" note stays up long enough to read. */
  .bookmark-note {
    position: absolute; top: 6px; left: 50%;
    width: max-content; max-width: calc(100% - 24px);
    padding: 3px 12px;
    border-radius: 14px;
    background: #001b34;
    color: #fff;
    text-align: center;
    font: 500 .8125rem/1.4 'Roboto', Arial, sans-serif;
    pointer-events: none;
    animation: bookmark-note 1.6s ease forwards;
  }
  .bookmark-note.added { background: #a8810c; }
  .bookmark-note.full, .bookmark-note.failed { background: #b3261e; }
  .bookmark-note.full { animation-duration: 3.2s; }
  @keyframes bookmark-note {
    0% { opacity: 0; transform: translate(-50%, 4px); }
    12%, 75% { opacity: 1; transform: translate(-50%, 0); }
    100% { opacity: 0; transform: translate(-50%, 0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .bookmarkable::before,
    .bookmarkable.holding::before { transform: none; }
    .bookmarkable.holding::before { transition: opacity ${HOLD_MS}ms linear; }
    .bookmarkable[data-flash]::before { animation-name: bookmark-fade; }
    .bookmarkable[data-flash="added"]::after { animation: none; }
    @keyframes bookmark-fade { from { opacity: 1; } to { opacity: 0; } }
  }
`;

class BookmarkStore extends EventTarget {
  #key;
  #isId;
  #limit;
  // The saved ids, parsed from storage once and kept until they change here or
  // in another tab, so drawing a list of cards does not re-read storage per card.
  #ids = null;

  constructor(key, { isId, limit }) {
    super();
    this.#key = key;
    this.#isId = isId;
    this.#limit = limit;
    window.addEventListener('storage', (event) => {
      if (event.key !== key && event.key !== null) return;
      this.#ids = null;
      this.dispatchEvent(new Event('change'));
    });
  }

  /** How many ids the store keeps. */
  get limit() {
    return this.#limit;
  }

  /**
   * Storage can be refused (private browsing, a full quota), so a read falls
   * back to none.
   */
  #saved() {
    if (!this.#ids) {
      try {
        const ids = JSON.parse(localStorage.getItem(this.#key));
        this.#ids = Array.isArray(ids) ? ids.filter(this.#isId).slice(0, this.#limit) : [];
      } catch {
        this.#ids = [];
      }
    }
    return this.#ids;
  }

  /** The saved ids, newest first. */
  read() {
    return [...this.#saved()];
  }

  has(id) {
    return this.#saved().includes(id);
  }

  /** Adds or removes a bookmark. Returns 'added', 'removed', 'full' or 'failed'. */
  toggle(id) {
    const ids = this.#saved();
    const removing = ids.includes(id);
    if (!removing && ids.length >= this.#limit) return 'full';
    const next = removing ? ids.filter((saved) => saved !== id) : [id, ...ids];
    try {
      localStorage.setItem(this.#key, JSON.stringify(next));
    } catch {
      return 'failed';
    }
    this.#ids = next;
    if (!removing) keepBookmarks();
    this.dispatchEvent(new Event('change'));
    return removing ? 'removed' : 'added';
  }
}

// One store per key, so every instance of a component hears every change.
const stores = new Map();

/**
 * The bookmarks kept under key: isId(value) says which stored values are ids,
 * and limit how many are kept.
 */
export function bookmarkStore(key, options) {
  if (!stores.has(key)) stores.set(key, new BookmarkStore(key, options));
  return stores.get(key);
}

/** Flashes a held card and shows a note with the outcome of toggle(). */
export function showBookmarkResult(card, result, limit) {
  if (result === 'added' || result === 'removed') navigator.vibrate?.(15);
  card.querySelector('.bookmark-note')?.remove();
  const note = document.createElement('span');
  note.className = `bookmark-note ${result}`;
  note.setAttribute('aria-hidden', 'true');
  note.textContent = bookmarkNote(result, limit);
  note.addEventListener('animationend', () => note.remove(), { once: true });
  card.append(note);
  // Restart the flash when the same card is held twice in quick succession.
  card.removeAttribute('data-flash');
  void card.offsetWidth;
  card.dataset.flash = result;
}

/** Watches a list for cards held for HOLD_MS and hands each one to onHold. */
export class CardHold {
  #selector;
  #exclude;
  #onHold;
  #hold = null;
  // A hold ends with the finger lifting, and the click that follows must not
  // reach the card: a saying would open its popup.
  #swallowClick = false;

  constructor(container, { selector, exclude = null, onHold }) {
    this.#selector = selector;
    this.#exclude = exclude;
    this.#onHold = onHold;
    container.addEventListener('pointerdown', (event) => this.#start(event));
    container.addEventListener('pointermove', (event) => {
      const hold = this.#hold;
      if (hold && event.pointerId === hold.pointerId
          && Math.hypot(event.clientX - hold.x, event.clientY - hold.y) > HOLD_SLOP) {
        this.cancel();
      }
    });
    for (const type of ['pointerup', 'pointercancel', 'pointerleave']) {
      container.addEventListener(type, () => this.cancel());
    }
    // Enter and Space still work after a hold that never clicked.
    container.addEventListener('keydown', () => { this.#swallowClick = false; });
    // A long press would otherwise open the phone's context menu.
    container.addEventListener('contextmenu', (event) => {
      if (this.#hold || this.#swallowClick) event.preventDefault();
    });
    container.addEventListener('click', (event) => {
      if (!this.#swallowClick) return;
      this.#swallowClick = false;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  }

  cancel() {
    if (!this.#hold) return;
    clearTimeout(this.#hold.timer);
    this.#hold.card.classList.remove('holding');
    this.#hold = null;
  }

  #start(event) {
    this.#swallowClick = false;
    if (!event.isPrimary || event.button !== 0) return;
    const card = event.target.closest(this.#selector);
    if (!card || (this.#exclude && event.target.closest(this.#exclude))) return;
    this.cancel();
    const box = card.getBoundingClientRect();
    card.style.setProperty('--hold-x', `${event.clientX - box.left}px`);
    card.style.setProperty('--hold-y', `${event.clientY - box.top}px`);
    card.removeAttribute('data-flash');
    card.classList.add('holding');
    this.#hold = {
      card,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      timer: setTimeout(() => this.#complete(card), HOLD_MS),
    };
  }

  #complete(card) {
    this.#hold = null;
    card.classList.remove('holding');
    this.#swallowClick = true;
    this.#onHold(card);
  }
}
