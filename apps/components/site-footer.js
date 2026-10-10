/**
 * <site-footer> — the home page's footer, as a web component.
 *
 * The closing words with a link to this week's Flipbook, and the QR code on a
 * white tile that keeps it scannable over the photo; a tap on the code opens
 * the sponsorship splash. Under them, the brand and tagline, and a link to
 * Our mission. It sits on the hero photo, faded into the paper on the left so
 * the words stay legible.
 *
 * Usage
 *   <site-footer splash="splash"></site-footer>
 *   <sponsor-splash id="splash"></sponsor-splash>
 *   <script type="module" src="./apps/components/site-footer.js"></script>
 *
 * Attributes
 *   splash   id of the <sponsor-splash> the QR code opens.
 *
 * Fonts: Roboto (text) is registered on the document by
 * assets/scripts/fonts.js, because browsers do not reliably load @font-face
 * rules declared inside a shadow root.
 *
 * Colours: the page's --navy and --ink (assets/styles/styles.css), which
 * inherit into the shadow root.
 */

import { registerFonts } from '../../assets/scripts/fonts.js';

const asset = (path) => new URL(path, import.meta.url).href;

const HOME_URL = asset('../../');
const PHOTO_URL = asset('../../assets/images/hero-1440.webp');
const QR_URL = asset('../../assets/images/qr.png');
const FLIPBOOK_URL = asset('../pages/flipbook.html');
const MISSION_URL = asset('../pages/mission-statement.html');

const STYLES = /* css */ `
  :host { display: block; }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }

  .site-footer {
    color: var(--navy);
    background: linear-gradient(90deg, rgba(243,231,210,.98) 0%, rgba(243,231,210,.94) 38%, rgba(243,231,210,.45) 65%, rgba(243,231,210,.08) 100%), url('${PHOTO_URL}') center / cover no-repeat;
    border-top: 1px solid rgba(0,27,52,.1);
    font-family: 'Roboto', Arial, sans-serif;
  }
  .footer-main {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    padding: 28px 28px 24px;
  }
  .footer-message { flex: 1 1 auto; min-width: 0; max-width: 330px; }
  /* White tile keeps the code scannable over the footer photo. */
  .footer-qr {
    display: grid;
    flex: 0 0 auto;
    justify-items: center;
    gap: 6px;
    margin: 0;
    padding: 8px 8px 6px;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 4px 14px rgba(0,27,52,.18);
  }
  .footer-qr-button {
    display: block;
    padding: 0;
    border: 0;
    border-radius: 4px;
    background: none;
    cursor: zoom-in;
    transition: transform .2s ease;
  }
  .footer-qr-button:hover { transform: scale(1.05); }
  .footer-qr-button:focus-visible { outline: 2px solid var(--navy); outline-offset: 3px; }
  .footer-qr img { display: block; width: 88px; height: 88px; }
  .footer-qr figcaption {
    color: var(--navy);
    font-size: .6875rem;
    font-weight: 600;
    letter-spacing: .04em;
    line-height: 1;
  }
  .footer-message h2 {
    margin: 0;
    font: 700 clamp(1.4rem, 1.15rem + 1vw, 1.75rem)/1.25 Georgia, 'Times New Roman', serif;
    /* Each line stays whole; the <br> is the only break. */
    white-space: nowrap;
  }
  /* "Our Faith Tomorrow." is about 11em wide in Georgia and in Android's Noto
     Serif, so on a phone, beside the QR tile, the heading shrinks to fit its
     column instead of wrapping. */
  @supports (container-type: inline-size) {
    .footer-message { container-type: inline-size; }
    .footer-message h2 { font-size: min(clamp(1.4rem, 1.15rem + 1vw, 1.75rem), 100cqi / 11.5); }
  }
  .footer-message p {
    margin: 12px 0 16px;
    font-size: .9375rem;
    line-height: 1.6;
  }
  .footer-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    color: var(--navy);
    font-size: .875rem;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 4px;
    text-decoration-color: rgba(0,27,52,.35);
  }
  .footer-link:hover { text-decoration-color: currentColor; }
  .site-footer a:focus-visible {
    outline: 2px solid var(--navy);
    outline-offset: 4px;
    border-radius: 2px;
  }
  .footer-bottom {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 4px 16px;
    padding: 10px 28px 28px;
    border-top: 1px solid rgba(0,27,52,.1);
    background: rgba(243,231,210,.94);
    font-size: .75rem;
    line-height: 1.5;
  }
  .footer-brand {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 44px;
    color: var(--navy);
    font-size: .875rem;
    font-weight: 600;
    text-decoration: none;
  }
  .footer-brand span { color: #805b18; }
  /* Brand name with the tagline tucked under it. */
  .footer-sign { display: flex; flex-direction: column; align-items: flex-start; }
  .footer-sign .footer-brand { min-height: 0; }
  .footer-tagline { color: var(--ink); }
  /* Our mission: a link to the Mission Statement page, where the social links were. */
  .footer-mission {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    min-height: 44px;
    color: var(--navy);
    text-align: right;
    text-decoration: none;
  }
  .footer-mission-label {
    font-size: .68rem;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: #805b18;
  }
  .footer-mission-text {
    font-size: .8rem;
    font-weight: 600;
    text-decoration: underline;
    text-decoration-color: rgb(0 27 52 / 25%);
    text-underline-offset: 3px;
  }
  .footer-mission:hover .footer-mission-text { text-decoration-color: currentColor; }
  @media (max-width: 650px) {
    .site-footer { background-image: linear-gradient(90deg, rgba(243,231,210,.97), rgba(243,231,210,.78)), url('${PHOTO_URL}'); }
    .footer-main { padding: 24px 20px 18px; gap: 12px; }
    .footer-qr img { width: 76px; height: 76px; }
    .footer-bottom { flex-direction: column; justify-content: center; padding: 8px 20px 24px; text-align: center; }
    .footer-sign { align-items: center; }
    .footer-mission { align-items: center; text-align: center; }
  }
  @media (prefers-reduced-motion: reduce) {
    .footer-qr-button { transition: none; }
  }
`;

const TEMPLATE = /* html */ `
<footer class="site-footer">
    <div class="footer-main">
        <div class="footer-message">
            <h2>Grace for today.<br />Our Faith Tomorrow.</h2>
            <p>
                A quiet moment in God's Word.<br />Fresh strength
                for every day.
            </p>
            <a class="footer-link" href="${FLIPBOOK_URL}"
                >Explore this week's Flipbook
                <span aria-hidden="true">→</span></a
            >
        </div>
        <figure class="footer-qr">
            <button
                class="footer-qr-button"
                type="button"
                aria-haspopup="dialog"
                aria-label="Sponsorships and donations"
                title="Sponsorships and donations"
            >
                <img
                    src="${QR_URL}"
                    alt="QR code to email Daily Grace"
                    width="88"
                    height="88"
                    loading="lazy"
                />
            </button>
            <figcaption>Scan to contact</figcaption>
        </figure>
    </div>
    <div class="footer-bottom">
        <div class="footer-sign">
            <a class="footer-brand" href="${HOME_URL}"
                >Daily Grace <span>Faith</span></a
            >
            <span class="footer-tagline"
                >A year of grace · One day at a time</span
            >
        </div>
        <a class="footer-mission" href="${MISSION_URL}">
            <span class="footer-mission-label">Our mission</span>
            <span class="footer-mission-text"
                >God's Word within reach of everyone, every day
                <span aria-hidden="true">→</span></span
            >
        </a>
    </div>
</footer>`;

export class SiteFooter extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`;
    root.querySelector('.footer-qr-button').addEventListener('click', () => {
      document.getElementById(this.getAttribute('splash') ?? '')?.open?.();
    });
  }

  connectedCallback() {
    registerFonts();
  }
}

if (!customElements.get('site-footer')) {
  customElements.define('site-footer', SiteFooter);
}
