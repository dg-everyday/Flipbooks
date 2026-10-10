/**
 * <sponsor-splash> — the sponsorship splash, as a web component.
 *
 * The thank-you poster, with its sponsorships and donations code, and the
 * sponsors under it. It opens only when the reader taps the footer QR code
 * (see <site-footer splash="…">). A tap on a sponsor opens its site in a new
 * tab and leaves the splash open; any other tap, on the poster, the bar or the
 * backdrop, closes it, as Escape does. It grows in with a little overshoot, as
 * the bookmarks and the verse popup do.
 *
 * A second tap within DOUBLE_TAP_MS of opening (a double tap or double click
 * on the QR code) closes it and fires doubletap, which the home page uses for
 * a secret: forget the trivia's daily tally and play a round on the spot. It
 * listens on pointerup, because iOS can swallow the click of a double tap, and
 * pointerup runs first, so the click's closing finds the work already done.
 *
 * Usage
 *   <sponsor-splash id="splash"></sponsor-splash>
 *   <script type="module" src="./apps/components/sponsor-splash.js"></script>
 *
 * Attributes
 *   open     Set by the component while the splash is open (read-only); the
 *            page uses it to stop the page behind scrolling.
 *
 * Methods      open()    pop the splash in
 *              close()   pop it out; resolves once it has closed
 * Events       doubletap  a second tap came straight after opening; the splash
 *                         has already closed
 *
 * Adding a sponsor: add an entry to SPONSORS below, with the logo in
 * assets/images/sponsors.
 *
 * Fonts: Germania One (the "Thanks To" bar) is registered on the document by
 * assets/scripts/fonts.js, because browsers do not reliably load @font-face
 * rules declared inside a shadow root.
 *
 * Colours: the page's --navy and --cream (assets/styles/styles.css), which
 * inherit into the shadow root.
 */

import { registerFonts } from '../../assets/scripts/fonts.js';

const asset = (path) => new URL(path, import.meta.url).href;

const POSTER_URL = asset('../../assets/images/splash.webp');

// Each sponsor's logo links to its site, in a new tab.
const SPONSORS = [
  {
    href: 'https://icountera.com.ph',
    name: 'iCountera',
    label: 'iCountera, Emmanuel C. Bulatao, CEO',
    logo: asset('../../assets/images/sponsors/icountera.webp'),
    alt: 'Emmanuel C. Bulatao, CEO of iCountera',
    width: 2171,
    height: 724,
  },
];

const DOUBLE_TAP_MS = 450;

const STYLES = /* css */ `
  :host { display: contents; }
  * { box-sizing: border-box; }

  /* The dialog shrink-wraps the card (poster, "Thanks To" bar, sponsors). */
  .splash-dialog {
    padding: 0;
    border: 0;
    max-width: none;
    background: transparent;
    overflow: visible;
    /* The poster is one tap target: any tap closes it. */
    cursor: pointer;
  }
  .splash-dialog::backdrop {
    background: rgb(0 27 52 / 62%);
    backdrop-filter: blur(3px);
  }
  /* The card's width is set so the whole card (a poster 1.78 times as tall as it
     is wide, plus the bar and sponsors, about 2.3 widths in all) fits in 85% of
     the screen's height, 88% of its width, and never grows past 420px. */
  .splash-card {
    --splash-w: min(420px, 88vw, calc((85vh - 40px) / 2.3));
    --splash-w: min(420px, 88dvw, calc((85dvh - 40px) / 2.3));
    width: var(--splash-w);
    padding: 6px;
    border: 2px solid var(--navy);
    border-radius: 14px;
    background: var(--cream);
    box-shadow: 0 24px 60px rgb(0 27 52 / 45%);
  }
  .splash-poster {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 8px 8px 0 0;
  }
  .splash-sponsors {
    overflow: hidden;
    border-radius: 0 0 8px 8px;
    background: #fff;
  }
  .splash-sponsors h2 {
    margin: 0;
    padding: 8px 12px;
    background: var(--navy);
    color: #fff;
    text-align: center;
    font: 400 clamp(1.05rem, .95rem + .5vw, 1.3rem)/1.2 'Germania One', Georgia, serif;
    letter-spacing: .03em;
  }
  .splash-sponsors ul {
    display: grid;
    justify-items: center;
    gap: 14px;
    margin: 0;
    padding: 18px 16px 20px;
    list-style: none;
  }
  .splash-sponsors a {
    display: block;
    width: min(100%, 250px);
    border-radius: 8px;
    cursor: pointer;
    transition: transform .15s ease, box-shadow .15s ease;
  }
  .splash-sponsors a:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgb(0 27 52 / 14%); }
  .splash-sponsors a:focus-visible { outline: 2px solid var(--navy); outline-offset: 3px; }
  .splash-sponsors a img { display: block; width: 100%; height: auto; border-radius: 8px; }
  @media (prefers-reduced-motion: reduce) {
    .splash-sponsors a { transition: none; }
    .splash-sponsors a:hover { transform: none; }
  }
`;

const sponsorItem = ({ href, name, label, logo, alt, width, height }) => `
                <li>
                    <a href="${href}" target="_blank" rel="noopener" aria-label="${label} (opens in a new tab)" title="${name}">
                        <img src="${logo}" alt="${alt}" width="${width}" height="${height}" loading="lazy" />
                    </a>
                </li>`;

const TEMPLATE = /* html */ `
<dialog class="splash-dialog" aria-label="A word of thanks from Daily Grace" autofocus>
    <div class="splash-card">
        <img
            class="splash-poster"
            src="${POSTER_URL}"
            alt="Daily Grace. We thank thee for thy visit. Mayest thou find herein words of grace and truth, unto the comfort of the heart and the edifying of the soul. A code to scan: accepting sponsorships and donations."
            width="940"
            height="1672"
            loading="lazy"
        />
        <section class="splash-sponsors" aria-labelledby="splash-thanks">
            <h2 id="splash-thanks">Thanks To</h2>
            <ul>${SPONSORS.map(sponsorItem).join('')}
            </ul>
        </section>
    </div>
</dialog>`;

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Grows in with a little overshoot, as the bookmarks and the verse popup do.
function popDialog(dialog, direction) {
  const opening = direction === 'open';
  const options = {
    duration: opening ? 460 : 220,
    // A little overshoot on the way in gives the poster its pop.
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

// A tap on a sponsor opens its site, and leaves the splash open.
const onSponsor = (event) => Boolean(event.target.closest?.('.splash-sponsors a'));

export class SponsorSplash extends HTMLElement {
  #dialog;
  #closing = false;
  // When the splash was opened, so a quick second tap can be told from a
  // later one.
  #shownAt = 0;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`;
    const dialog = root.querySelector('dialog');
    this.#dialog = dialog;

    // Escape would close instantly; route it through the closing animation instead.
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      this.close();
    });
    dialog.addEventListener('click', (event) => {
      if (!onSponsor(event)) this.close();
    });
    dialog.addEventListener('pointerup', async (event) => {
      if (onSponsor(event)) return;
      if (!this.#shownAt || Date.now() - this.#shownAt > DOUBLE_TAP_MS) return;
      this.#shownAt = 0;
      await this.close();
      this.dispatchEvent(new Event('doubletap'));
    });
  }

  connectedCallback() {
    registerFonts();
  }

  open() {
    const dialog = this.#dialog;
    if (dialog.open) return;
    this.#shownAt = Date.now();
    dialog.showModal();
    this.toggleAttribute('open', true);
    if (!reducedMotion.matches) popDialog(dialog, 'open');
  }

  async close() {
    const dialog = this.#dialog;
    if (!dialog.open || this.#closing) return;
    this.#closing = true;
    if (!reducedMotion.matches) await popDialog(dialog, 'close');
    dialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    dialog.close();
    this.toggleAttribute('open', false);
    this.#closing = false;
  }
}

if (!customElements.get('sponsor-splash')) {
  customElements.define('sponsor-splash', SponsorSplash);
}
