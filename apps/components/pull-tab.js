/**
 * Pull-for-more tab for the card lists of <did-you-know> and <bible-sayings>.
 *
 * A pair of chevrons under the list bobs gently to say there is more. Pulling
 * it down, or tapping it, asks for more cards: the chevrons stretch after the
 * finger, grow once the pull is far enough to count, and spring back when let
 * go. The component decides how many cards to add, and hides the tab once the
 * list is full; the tab folds away as it goes.
 *
 * Usage (inside a component)
 *   // PULL_TAB_STYLES goes in the shadow root, and PULL_TAB_ICON in the tab:
 *   //   <button class="pull-tab" type="button" hidden aria-label="…">${PULL_TAB_ICON}</button>
 *   const tab = new PullTab(root.querySelector('.pull-tab'), { onPull: () => this.more() });
 *   list.append(...cards);
 *   revealCards(cards);
 *   tab.show();  tab.hide({ animate: true, focus: cards[0].querySelector('button') });
 *
 * The components import this file with a ?v= token, as they do
 * card-bookmarks.js, since the deploy only stamps the tokens in the HTML.
 * When it changes, bump the token in both imports to the same value.
 */

// How far the finger may drift before a tap becomes a pull, how far the tab
// stretches at most, and how far it has to stretch for the pull to count.
const PULL_SLOP = 6;
const PULL_MAX = 84;
const PULL_ARM = 44;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const PULL_TAB_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="chevron chevron-top" d="M5 4.5l7 7 7-7"/><path class="chevron chevron-bottom" d="M5 11.5l7 7 7-7"/></svg>';

export const PULL_TAB_STYLES = /* css */ `
  .pull-tab {
    --pull: 0px;
    /* Pulled, the chevrons pass over the next panel down, not under it. */
    position: relative; z-index: 1;
    display: grid; place-items: center;
    justify-self: center;
    width: 72px; height: 44px; padding: 0;
    border: 0; border-radius: 10px;
    background: none;
    color: var(--pull-tab-ink, #e0442c);
    cursor: grab;
    /* The page still scrolls on a swipe up from the tab; a swipe down is the
       pull. Safari knows no pan-down and keeps none. */
    touch-action: none;
    touch-action: pan-down;
    -webkit-tap-highlight-color: transparent;
    -webkit-user-select: none; user-select: none;
  }
  .pull-tab[hidden] { display: none; }
  .pull-tab.pulling { cursor: grabbing; }
  .pull-tab:focus-visible { outline: 2px solid currentColor; outline-offset: -4px; }
  .pull-tab svg {
    display: block; width: 34px; height: 34px; overflow: visible;
    transform: translateY(var(--pull));
    transition: transform .45s cubic-bezier(.3, 1.6, .5, 1), scale .2s ease;
  }
  .pull-tab:hover svg { scale: 1.08; }
  .pull-tab.pulling svg { transition: scale .2s ease; }
  .pull-tab.armed svg { scale: 1.2; }
  .chevron {
    fill: none; stroke: currentColor;
    stroke-width: 3; stroke-linecap: round; stroke-linejoin: round;
    animation: pull-bob 1.8s ease-in-out infinite;
  }
  .chevron-top { stroke: var(--pull-tab-lead, #f28c28); }
  .chevron-bottom { animation-delay: .12s; }
  /* While pulled, the chevrons part a little, the lower one after the finger. */
  .pull-tab.pulling .chevron { animation: none; }
  .pull-tab.pulling .chevron-bottom { transform: translateY(calc(var(--pull) * .12)); }
  /* A pull that counts: the chevrons drop out of sight and come back. */
  .pull-tab.fired .chevron { animation: pull-fire .5s ease-in-out; }
  .pull-tab.fired .chevron-bottom { animation-delay: .06s; }
  @keyframes pull-bob {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(3px); }
  }
  @keyframes pull-fire {
    0% { transform: translateY(0); opacity: 1; }
    45% { transform: translateY(9px); opacity: 0; }
    46% { transform: translateY(-7px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    .pull-tab svg { transition: none; }
    .chevron, .pull-tab.fired .chevron { animation: none; }
  }
`;

/** Slides newly added cards into place, one after another. */
export function revealCards(cards) {
  if (reducedMotion()) return;
  cards.forEach((card, index) => {
    card.animate(
      [{ opacity: 0, transform: 'translateY(-14px)' }, { opacity: 1, transform: 'none' }],
      { duration: 380, delay: index * 70, easing: 'cubic-bezier(.2, .8, .3, 1)', fill: 'backwards' },
    );
  });
}

export class PullTab {
  #tab;
  #onPull;
  #pointer = null;
  // A drag has done its work on pointerup, so the click that follows is not a tap.
  #dragged = false;
  #hiding = null;

  constructor(tab, { onPull }) {
    this.#tab = tab;
    this.#onPull = onPull;
    tab.addEventListener('pointerdown', this.#down);
    tab.addEventListener('pointermove', this.#move);
    tab.addEventListener('pointerup', this.#up);
    tab.addEventListener('pointercancel', this.#release);
    tab.addEventListener('click', (event) => {
      // A keyboard click has no detail, and always counts.
      if (this.#dragged && event.detail !== 0) {
        this.#dragged = false;
        return;
      }
      this.#fire();
    });
    tab.addEventListener('animationend', (event) => {
      if (event.animationName === 'pull-fire' && event.target.classList.contains('chevron-bottom')) {
        tab.classList.remove('fired');
      }
    });
  }

  show() {
    this.#hiding?.cancel();
    this.#hiding = null;
    this.#tab.hidden = false;
  }

  /**
   * Hides the tab, folding it away with animate. If it had the focus, the
   * focus moves to focus rather than drop to the page.
   */
  hide({ animate = false, focus = null } = {}) {
    if (this.#tab.hidden || this.#hiding) return;
    this.#release();
    if (this.#tab.getRootNode().activeElement === this.#tab) focus?.focus({ preventScroll: true });
    if (!animate || reducedMotion()) {
      this.#tab.hidden = true;
      return;
    }
    const hiding = (this.#hiding = this.#tab.animate(
      [
        { opacity: 1, height: `${this.#tab.offsetHeight}px`, transform: 'none' },
        { opacity: 0, height: '0px', transform: 'scale(.6)' },
      ],
      // A short wait first, so the last pull's drop plays before it folds.
      { duration: 360, delay: 200, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'both' },
    ));
    hiding.finished
      .then(() => {
        if (hiding !== this.#hiding) return;
        this.#hiding = null;
        this.#tab.hidden = true;
        hiding.cancel();
      })
      .catch(() => {}); // cancelled by show()
  }

  #fire() {
    if (this.#tab.hidden || this.#hiding) return;
    this.#tab.classList.remove('fired');
    void this.#tab.offsetWidth; // restart the drop on repeat pulls
    this.#tab.classList.add('fired');
    this.#onPull();
  }

  #down = (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    this.#dragged = false;
    this.#pointer = { id: event.pointerId, startY: event.clientY };
    this.#tab.setPointerCapture(event.pointerId);
  };

  #move = (event) => {
    if (event.pointerId !== this.#pointer?.id) return;
    const distance = event.clientY - this.#pointer.startY;
    if (!this.#dragged && distance < PULL_SLOP) return;
    this.#dragged = true;
    // The further it goes, the harder it pulls, like a rubber band.
    const pull = PULL_MAX * (1 - Math.exp(-Math.max(0, distance) / PULL_MAX));
    this.#tab.classList.add('pulling');
    this.#tab.classList.toggle('armed', pull >= PULL_ARM);
    this.#tab.style.setProperty('--pull', `${pull}px`);
  };

  #up = (event) => {
    if (event.pointerId !== this.#pointer?.id) return;
    const armed = this.#tab.classList.contains('armed');
    this.#release();
    if (armed) this.#fire();
  };

  #release = () => {
    this.#pointer = null;
    this.#tab.classList.remove('pulling', 'armed');
    this.#tab.style.removeProperty('--pull');
  };
}
