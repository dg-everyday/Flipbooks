/**
 * <support-dialog> — "Help keep Daily Grace free": how to give, if a reader
 * wishes to, and other ways to help.
 *
 * Daily Grace asks no one for anything to use it; this only says how a gift
 * can be given, with no amount set: PayPal (a link to the PayPal.Me page) and
 * GCash (its QR code, assets/images/ecv-gcash-qr.png), then sharing and prayer as ways to
 * help without money, and 2 Corinthians 9:7. Opened from the menu's "Support
 * Daily Grace" and the footer's link (their `support` attribute names it).
 *
 * Usage
 *   <support-dialog id="support"></support-dialog>
 *   <script type="module" src="./apps/components/support-dialog.js"></script>
 *
 * Methods      open(), close()
 *
 * Fonts: Germania One and Strait are registered on the document by
 * assets/scripts/fonts.js.
 */

import { registerFonts } from "../../assets/scripts/fonts.js";

const asset = (path) => new URL(path, import.meta.url).href;
// The Daily Grace banner logo (navy, with the lighthouse), on the cream header.
const LOGO_URL = asset("../../assets/images/daily-grace-banner-02.webp");
// The GCash QR code to scan (an InstaPay QR, so other Philippine banks and
// e-wallets can scan it too).
const GCASH_QR_URL = asset("../../assets/images/ecv-gcash-qr.png");

// Where a gift goes.
const PAYPAL_URL = "https://www.paypal.com/paypalme/edwinvillapando";
const PAYPAL_NAME = "@edwinvillapando";

const STYLES = /* css */ `
  :host { display: contents; }
  * { box-sizing: border-box; }
  dialog {
    position: relative;
    width: min(560px, calc(100% - 24px));
    max-height: calc(100% - 32px);
    padding: 0;
    border: 0;
    border-radius: 18px;
    overflow: auto;
    overscroll-behavior: contain;
    color: #10253b;
    background: #fffaf1;
    box-shadow: 0 24px 60px rgb(0 0 0 / 35%);
    font: 400 1.0625rem/1.5 'Strait', 'Roboto', Arial, sans-serif;
  }
  dialog::backdrop { background: rgb(0 27 52 / 70%); }
  /* The slim gold scrollbar of Help and About (study-guide-menu.js): a thin
     pill on a clear track, held off the rounded corners. */
  dialog::-webkit-scrollbar { width: 10px; }
  dialog::-webkit-scrollbar-track { margin-block: 20px; background: transparent; }
  dialog::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    border-radius: 999px;
    background: rgb(198 146 46 / 40%) padding-box;
  }
  dialog::-webkit-scrollbar-thumb:hover { background-color: rgb(198 146 46 / 75%); }
  /* Firefox has no ::-webkit-scrollbar; Chrome would drop the rules above if it
     saw these, so only browsers without them get the standard properties. */
  @supports not selector(::-webkit-scrollbar) {
    dialog {
      scrollbar-width: thin;
      scrollbar-color: rgb(198 146 46 / 50%) transparent;
    }
  }
  dialog[open] { animation: support-in .28s cubic-bezier(.2, .9, .25, 1); }
  @keyframes support-in { from { opacity: 0; transform: translateY(18px) scale(.98); } }

  /* Over the header's corner, which then runs the full width. */
  .close {
    position: absolute; top: 10px; right: 10px; z-index: 1;
    width: 44px; height: 44px;
    border: 0; border-radius: 50%;
    background: rgb(255 255 255 / 35%);
    color: #001b34;
    cursor: pointer;
  }
  .close:hover { background: rgb(255 255 255 / 55%); }
  .close svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: round; }

  header {
    display: grid; justify-items: center; gap: 6px;
    padding: 26px 24px 18px;
    text-align: center;
    /* Burnished gold, as on the home page's gold bands: deep at the edges,
       pale where the light catches it. The navy logo reads on it. */
    background: linear-gradient(90deg, #e1aa37 0%, #dda742 20%, #fed86e 35%,
      #fdecae 50%, #f9d06e 65%, #f3c364 80%, #c5861d 100%);
    border-bottom: 2px solid #b07a1c;
    color: #001b34;
  }
  header img { width: min(230px, 70%); height: auto; }
  .eyebrow {
    margin: 0;
    color: #4a3006;
    font-size: .8rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
  }
  h2 {
    margin: 0;
    color: #001b34;
    font: 400 clamp(1.8rem, 1.5rem + 1.6vw, 2.3rem)/1.1 'Germania One', Georgia, serif;
    text-wrap: balance;
  }
  .body { display: grid; gap: 14px; padding: 20px 24px 26px; }
  p { margin: 0; }
  .lead { font-size: 1.15rem; }
  h3 {
    margin: 8px 0 0;
    color: #001b34;
    font: 400 1.35rem/1.15 'Germania One', Georgia, serif;
  }
  .ways { display: grid; gap: 12px; }
  .way {
    display: grid; gap: 8px;
    padding: 14px 16px;
    border: 1px solid rgb(198 146 46 / 40%);
    border-radius: 12px;
    background: #fff;
  }
  .way-name { font-weight: 700; color: #001b34; }
  .way-detail { font-size: 1.15rem; font-weight: 700; letter-spacing: .02em; }
  .way-note { color: #5b6878; font-size: .95rem; }
  /* The QR code keeps its white quiet zone, so any scanner reads it. */
  .qr {
    justify-self: center;
    width: min(380px, 100%);
    height: auto;
    border: 1px solid rgb(198 146 46 / 30%);
    border-radius: 10px;
    background: #fff;
  }
  .button {
    justify-self: start;
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 18px;
    border: 0; border-radius: 999px;
    background: #e1b65d;
    color: #001b34;
    font: 700 1rem/1 'Strait', 'Roboto', Arial, sans-serif;
    text-decoration: none;
    cursor: pointer;
  }
  .button:hover { background: #f0c66c; }
  .button:focus-visible { outline: 2px solid #001b34; outline-offset: 2px; }
  .close:focus-visible { outline: 2px solid #001b34; outline-offset: 2px; }
  .other { display: grid; gap: 8px; margin: 0; padding-left: 1.2em; }
  blockquote {
    margin: 6px 0 0;
    padding: 14px 16px;
    border-left: 4px solid #c6922e;
    border-radius: 8px;
    background: #f3ead7;
  }
  cite { display: block; margin-top: 6px; font-style: normal; font-weight: 700; color: #7a5a1c; }
  .thanks { font-weight: 700; color: #001b34; }
  @media (prefers-reduced-motion: reduce) {
    dialog[open] { animation: none; }
  }
`;

const TEMPLATE = /* html */ `
<dialog aria-labelledby="support-title">
  <button class="close" type="button" aria-label="Close" title="Close">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
  </button>
  <header>
    <img src="${LOGO_URL}" alt="Daily Grace" width="1200" height="400" loading="lazy" />
    <p class="eyebrow">Support Daily Grace</p>
    <h2 id="support-title">Help keep Daily Grace free</h2>
  </header>
  <div class="body">
    <p class="lead">Daily Grace is free for everyone, with no ads and nothing to sign up for, and it will stay that way.</p>
    <p>Each day brings a new verse, reflection, poster, comic, narration and prayer, alongside the study guides, the stories and Daily Grace Kids. All of it is made by one person, with care, so that anyone with a phone can spend a few quiet minutes with God's Word.</p>
    <p>If Daily Grace has been a blessing to you, you are warmly welcome to help it continue and reach more people. There is no set amount. Any gift, large or small, once or now and then, helps make and share each new day.</p>

    <h3>Ways to give</h3>
    <div class="ways">
      <div class="way">
        <span class="way-name">PayPal</span>
        <span class="way-detail">${PAYPAL_NAME}</span>
        <a class="button" href="${PAYPAL_URL}" target="_blank" rel="noopener">Give with PayPal</a>
      </div>
      <div class="way">
        <span class="way-name">GCash</span>
        <img class="qr" src="${GCASH_QR_URL}" alt="GCash QR code for giving to Daily Grace" width="1524" height="1524" loading="lazy" decoding="async" />
        <span class="way-note">Scan it with the GCash app to donate.</span>
      </div>
    </div>

    <h3>Other ways to help</h3>
    <ul class="other">
      <li>Share a day you loved with a friend: in the Daily Grace Archives, Share link sends it with its picture.</li>
      <li>Tell someone about Daily Grace, or let them scan the QR code at the bottom of the page.</li>
      <li>Keep Daily Grace in your prayers.</li>
    </ul>

    <blockquote>
      “Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.”
      <cite>2 Corinthians 9:7 (KJV)</cite>
    </blockquote>
    <p class="thanks">Thank you. Whether you give, share or simply read, you are part of Daily Grace.</p>
  </div>
</dialog>`;

export class SupportDialog extends HTMLElement {
    #dialog;

    constructor() {
        super();
        const root = this.attachShadow({ mode: "open" });
        root.innerHTML = `<style>${STYLES}</style>${TEMPLATE}`;
        this.#dialog = root.querySelector("dialog");
        root.querySelector(".close").addEventListener("click", () => this.close());
        // A tap on the dimmed page around the card closes it too.
        this.#dialog.addEventListener("click", (event) => {
            if (event.target === this.#dialog) {
                this.close();
            }
        });
        this.#dialog.addEventListener("close", () => {
            document.documentElement.style.overflow = "";
        });
    }

    connectedCallback() {
        registerFonts();
    }

    open() {
        if (this.#dialog.open) {
            return;
        }
        this.#dialog.showModal();
        this.#dialog.scrollTop = 0;
        // The page underneath stays put while the card is open.
        document.documentElement.style.overflow = "hidden";
    }

    close() {
        if (this.#dialog.open) {
            this.#dialog.close();
        }
    }
}

if (!customElements.get("support-dialog")) {
    customElements.define("support-dialog", SupportDialog);
}
