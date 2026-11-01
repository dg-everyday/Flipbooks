/**
 * <journey-card> — the home page's way into "Your Year's Journey in Grace".
 *
 * Shown from December 29 to January 10 in Manila (assets/scripts/journey.js),
 * and only to a reader who prayed at least one Moment in the year it looks
 * back on; otherwise it stays hidden and takes no room. It opens the journey
 * in the Daily Grace Archives (apps/pages/library.html#journey/<year>), where
 * it also stays, under My days, after January 10.
 *
 * Usage
 *   <journey-card hidden></journey-card>
 *   <script type="module" src="./apps/components/journey-card.js"></script>
 *
 * Attributes
 *   href   The Archives page. Default: apps/pages/library.html
 */

import {
    hasJourney,
    inJourneyWindow,
    journeyYear,
    manilaToday,
    readJourney,
} from "../../assets/scripts/journey.js?v=20261101-1";

const DEFAULT_HREF = new URL("../pages/library.html", import.meta.url).href;

const STYLES = /* css */ `
  :host { display: block; }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }
  .card {
    display: grid;
    gap: 6px;
    margin: 0 8px;
    padding: 20px 22px;
    border-radius: 18px;
    color: #f3e7d2;
    background:
      radial-gradient(circle at 90% -10%, rgb(225 182 93 / 32%), transparent 45%),
      linear-gradient(135deg, #001b34, #062944);
    box-shadow: 0 10px 30px rgb(0 27 52 / 25%);
    text-decoration: none;
  }
  .card:focus-visible { outline: 3px solid #e1b65d; outline-offset: 2px; }
  .year {
    color: #e1b65d;
    font: 700 .8rem/1.2 'Strait', 'Roboto', Arial, sans-serif;
    letter-spacing: .14em;
    text-transform: uppercase;
  }
  .title {
    color: #e1b65d;
    font: 400 clamp(1.6rem, 1.3rem + 1.4vw, 2.1rem)/1.05 'Germania One', Georgia, serif;
  }
  .text { font: 400 1.05rem/1.4 'Strait', 'Roboto', Arial, sans-serif; color: rgb(243 231 210 / 90%); }
  .go {
    justify-self: start;
    margin-top: 6px;
    padding: 9px 18px;
    border-radius: 999px;
    background: #e1b65d;
    color: #001b34;
    font: 700 1rem/1 'Strait', 'Roboto', Arial, sans-serif;
  }
  .card:hover .go { background: #f0c66c; }
`;

export class JourneyCard extends HTMLElement {
    static observedAttributes = ["href"];

    #root;

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: "open" });
        this.#root.innerHTML = `
      <style>${STYLES}</style>
      <a class="card">
        <span class="year"></span>
        <span class="title">Your Year's Journey in Grace</span>
        <span class="text"></span>
        <span class="go">See my journey ›</span>
      </a>`;
    }

    connectedCallback() {
        this.#update();
    }

    attributeChangedCallback() {
        if (this.isConnected) {
            this.#update();
        }
    }

    #update() {
        const today = manilaToday();
        const year = journeyYear(today);
        const journey = readJourney(year);
        if (!inJourneyWindow(today) || !hasJourney(journey) || !journey.prayed.length) {
            this.hidden = true;
            return;
        }
        const count = journey.prayed.length;
        const card = this.#root.querySelector(".card");
        const url = new URL(this.getAttribute("href") || DEFAULT_HREF, document.baseURI);
        url.hash = `journey/${year}`;
        card.href = url.href;
        this.#root.querySelector(".year").textContent = `${year} with Daily Grace`;
        this.#root.querySelector(".text").textContent =
            `Look back on the ${count === 1 ? "Moment" : `${count} Moments`} you prayed with God this year, and all you gathered along the way.`;
        card.setAttribute("aria-label", `Your Year's Journey in Grace, ${year}: see my journey`);
        this.hidden = false;
    }
}

if (!customElements.get("journey-card")) {
    customElements.define("journey-card", JourneyCard);
}
