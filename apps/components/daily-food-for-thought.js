/**
 * <daily-food-for-thought> — today's serving from the Food for Thought guide, as a web component.
 *
 * Shows one topic from food-for-thought.json on a parchment card: the Food
 * for Thought banner across the top, then, laid out like the memory verse
 * card (<memory-verse>), "Today's Food for Thought" over the topic's name,
 * then its section, the areas it feeds (mind, body, spirit), its name, what it
 * guards against, its verse (the food), the serving for today and a question
 * to chew on, with a link that opens the
 * topic on the Food for Thought page. Its Bible references are pills that open
 * the passage (scripture-refs.js).
 *
 * One topic a day, the same for everyone: the topics are served in the
 * guide's order, one per Asia/Manila calendar day (when each day's devotional
 * goes live), and start again after the last. A page left open past midnight,
 * or brought back from the background, moves on to the new day's topic.
 *
 * Usage
 *   <daily-food-for-thought></daily-food-for-thought>
 *   <script type="module" src="./apps/components/daily-food-for-thought.js"></script>
 *
 * Attributes
 *   src         food-for-thought.json, resolved against the page.
 *               Default: assets/food-for-thought.json
 *   page-href   the Food for Thought page; the topic's id is added as the
 *               hash. Default: apps/pages/food-for-thought.html
 *
 * Properties   topic (read-only)  the topic shown, or null until it loads
 * Methods      show(date)  show the topic for another day ("YYYY-MM-DD"),
 *                         or today's when date is left out
 * Events       ready   a topic is shown, detail: { id, date }
 *              read    the reader opened the topic, with "Read the full
 *                      serving" or its verse pill, detail: { id, date }
 *              error   detail: { message }
 *
 * Fonts: Germania One (title) and Strait (text) are registered on the
 * document by assets/scripts/fonts.js, because browsers do not reliably load
 * @font-face rules declared inside a shadow root.
 *
 * CSS custom properties
 *   --fft-paper, --fft-paper-2 (the parchment, top and foot), --fft-ink,
 *   --fft-brown, --fft-edge, and --fft-navy (falls back to the page's --navy).
 */

import { registerFonts } from "../../assets/scripts/fonts.js";
// The same ?v= token as the other components' imports, so the page loads one
// copy of the module.
import { PILL_STYLES, refPill } from "./scripture-refs.js?v=20261018-1";

const DEFAULT_SRC = "assets/food-for-thought.json";
const DEFAULT_PAGE = "apps/pages/food-for-thought.html";
const TIME_ZONE = "Asia/Manila";
// How often an open page checks whether midnight has passed.
const DATE_CHECK_INTERVAL = 60_000;
const DAY_MS = 86400000;

const asset = (path) => new URL(path, import.meta.url).href;
const IMAGES = asset("../../assets/images/food-for-thought-assets/");
const BANNER_URL = `${IMAGES}fft-banner.webp`;
// The badge of each area a topic feeds.
const AREA_IMAGES = {
    Mind: "fft-brain.webp",
    Body: "fft-body.webp",
    Spirit: "fft-spirit.webp",
};

// The topics are shared by every instance: one fetch per file.
const topicsCache = new Map();

function readTopics(url) {
    if (!topicsCache.has(url)) {
        const request = fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Unable to load ${url} (${response.status})`,
                    );
                }
                return response.json();
            })
            .then((data) => {
                const entries = Array.isArray(data?.entries)
                    ? data.entries
                    : [];
                if (!entries.length) {
                    throw new Error(`No Food for Thought topics in ${url}`);
                }
                return entries;
            })
            .catch((error) => {
                topicsCache.delete(url);
                throw error;
            });
        topicsCache.set(url, request);
    }
    return topicsCache.get(url);
}

/** Today's calendar date in Asia/Manila, as "YYYY-MM-DD". */
function manilaToday() {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-US", {
            timeZone: TIME_ZONE,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
            .formatToParts(new Date())
            .filter(({ type }) => type !== "literal")
            .map(({ type, value }) => [type, value]),
    );
    return `${parts.year}-${parts.month}-${parts.day}`;
}

/** The topic served on a date: one a day, in order, starting again after the last. */
function topicFor(entries, date) {
    const [year, month, day] = date.split("-").map(Number);
    const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
    const index =
        ((dayNumber % entries.length) + entries.length) % entries.length;
    return entries[index];
}

const STYLES = /* css */ `
  :host {
    --fft-navy: var(--navy, #001b34);
    /* Parchment: a warm, aged tan rather than a light cream, darker at the
       foot and the edges, with ink in navy and brown on it. */
    --fft-paper: #e6d2a6;
    --fft-paper-2: #d6bd88;
    --fft-ink: #2e2414;
    --fft-brown: #7a5418;
    --fft-edge: #b8862e;

    display: block;
    padding-inline: 10px;
  }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }

  /* Laid out like the memory verse card: a gold line and the title, on a
     card with a gold edge, everything aligned left. Parchment, where the
     memory verse card is green. */
  article.card {
    overflow: hidden;
    padding: 16px 18px 20px;
    border: 1px solid rgb(122 84 24 / 30%);
    border-left: 5px solid var(--fft-edge);
    border-radius: 10px;
    background:
      radial-gradient(130% 90% at 50% 0%, rgb(255 248 228 / 45%) 0%, transparent 65%),
      linear-gradient(180deg, var(--fft-paper) 0%, var(--fft-paper-2) 100%);
    color: var(--fft-ink);
    box-shadow:
      0 10px 26px rgb(60 40 10 / 22%),
      inset 0 0 40px rgb(122 84 24 / 18%);
    text-align: left;
  }
  p { margin: 0; text-wrap: pretty; }

  /* The banner, edge to edge across the top, inside the gold edge. */
  .banner {
    display: block;
    width: calc(100% + 36px);
    max-width: none;
    height: auto;
    aspect-ratio: 1376 / 411;
    margin: -16px -18px 16px;
    object-fit: cover;
    background: var(--fft-navy);
  }

  .card-head { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .eyebrow {
    color: var(--fft-brown);
    font: 700 .95rem/1.2 'Strait', 'Roboto', sans-serif;
    letter-spacing: .03em;
  }
  .name {
    margin: 0;
    color: var(--fft-navy);
    font: 400 1.4rem/1.15 'Germania One', Georgia, serif;
    letter-spacing: .02em;
  }

  /* The topic's section, and the areas it feeds: their badges, overlapping. */
  .areas {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 10px;
    margin-top: 14px;
  }
  .badges { display: flex; }
  .badges img {
    display: block;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    box-shadow: 0 0 0 2px var(--fft-paper), 0 3px 8px rgb(60 40 10 / 30%);
  }
  .badges img + img { margin-left: -9px; }
  .area-names {
    color: var(--fft-ink);
    font: 400 1.05rem/1.25 'Strait', 'Roboto', sans-serif;
    letter-spacing: .02em;
  }
  .guards {
    margin-top: 12px;
    font: 400 clamp(1.02rem, .98rem + .25vw, 1.15rem)/1.45 'Strait', 'Roboto', sans-serif;
  }
  .guards b { font-weight: 400; color: var(--fft-brown); }

  /* The food: the topic's verse, set as a quotation. */
  figure {
    margin: 16px 0 0;
    padding: 12px 18px;
    border-left: 3px solid var(--fft-edge);
    border-radius: 0 10px 10px 0;
    background: rgb(255 250 236 / 45%);
    text-align: left;
  }
  blockquote {
    margin: 0;
    color: var(--fft-navy);
    font: 400 clamp(1.02rem, .98rem + .25vw, 1.14rem)/1.45 'Strait', 'Roboto', sans-serif;
  }
  figcaption {
    margin-top: 8px;
    color: var(--fft-brown);
    font: 700 .76rem/1.3 'Strait', 'Roboto', sans-serif;
    letter-spacing: .08em;
    text-transform: uppercase;
    --scripture-ref-color: var(--fft-brown);
  }

  .serving, .chew {
    margin-top: 18px;
    padding-top: 16px;
    border-top: 1px solid rgb(122 84 24 / 30%);
    font: 400 clamp(1.04rem, 1rem + .3vw, 1.16rem)/1.42 'Strait', 'Roboto', sans-serif;
  }
  .serving .label, .chew .label {
    display: block;
    margin-bottom: 6px;
    color: var(--fft-brown);
    font: 700 .76rem/1.3 'Strait', 'Roboto', sans-serif;
    letter-spacing: .12em;
    text-transform: uppercase;
  }
  .chew .text {
    color: var(--fft-navy);
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(1.02rem, .98rem + .3vw, 1.14rem);
  }

  /* Centred under the card, as on the other cards on the page; navy, so it
     stands out on the parchment. */
  .more {
    display: flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    min-height: 44px;
    margin: 20px auto 0;
    padding: 8px 20px;
    border-radius: 999px;
    background: var(--fft-navy);
    color: var(--gold-light, #e1b65d);
    font: 700 1rem/1.2 'Strait', 'Roboto', sans-serif;
    text-decoration: none;
    transition: background-color .15s ease, transform .15s ease;
  }
  .more:hover { background: #0b3358; transform: translateY(-1px); }
  .more:focus-visible { outline: 2px solid var(--fft-navy); outline-offset: 3px; }
  .message {
    margin-top: 14px;
    font: 400 1.05rem/1.45 'Strait', 'Roboto', sans-serif;
  }

  @media (max-width: 650px) {
    .name { font-size: 1.3rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .more { transition: none; }
    .more:hover { transform: none; }
  }
${PILL_STYLES}`;

export class DailyFoodForThought extends HTMLElement {
    static observedAttributes = ["src", "page-href"];

    #root;
    #els;
    #topic = null;
    #date = null;
    // The date asked for with show(date), or null to follow today.
    #pinned = null;
    #request = 0;
    #timer = 0;
    #onVisible = () => {
        if (document.visibilityState === "visible") {
            this.#checkDate();
        }
    };

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: "open" });
        this.#root.innerHTML = `
      <style>${STYLES}</style>
      <article class="card" aria-labelledby="name">
        <img class="banner" src="${BANNER_URL}" alt="Food for Thought" width="1376" height="411" loading="lazy" decoding="async" />
        <div class="card-head">
          <span class="eyebrow">Today's Food for Thought</span>
          <h3 class="name" id="name">Loading today's serving…</h3>
        </div>
        <div class="body">
          <div class="areas" hidden>
            <span class="badges"></span>
            <span class="area-names"></span>
          </div>
          <p class="message" aria-live="polite" hidden></p>
          <p class="guards" hidden><b>Guards against:</b> <span></span></p>
          <figure hidden><blockquote></blockquote><figcaption></figcaption></figure>
          <p class="serving" hidden><span class="label">Today's serving</span><span class="text"></span></p>
          <p class="chew" hidden><span class="label">Chew on this</span><span class="text"></span></p>
          <a class="more" hidden>Read the full serving <span aria-hidden="true">→</span></a>
        </div>
      </article>`;
        const $ = (selector) => this.#root.querySelector(selector);
        this.#els = {
            areas: $(".areas"),
            badges: $(".badges"),
            areaNames: $(".area-names"),
            name: $(".name"),
            message: $(".message"),
            guards: $(".guards"),
            guardsText: $(".guards span"),
            figure: $("figure"),
            verse: $("blockquote"),
            reference: $("figcaption"),
            serving: $(".serving"),
            servingText: $(".serving .text"),
            chew: $(".chew"),
            chewText: $(".chew .text"),
            more: $(".more"),
        };
        // Opening the topic counts as reading it; the card alone does not.
        this.#els.more.addEventListener("click", () => this.#read());
        this.#els.reference.addEventListener("click", (event) => {
            if (event.target.closest("button")) {
                this.#read();
            }
        });
    }

    connectedCallback() {
        registerFonts();
        document.addEventListener("visibilitychange", this.#onVisible);
        clearInterval(this.#timer);
        this.#timer = setInterval(() => this.#checkDate(), DATE_CHECK_INTERVAL);
        this.show(this.#pinned ?? undefined);
    }

    disconnectedCallback() {
        document.removeEventListener("visibilitychange", this.#onVisible);
        clearInterval(this.#timer);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.isConnected) {
            this.show(this.#pinned ?? undefined);
        }
    }

    get topic() {
        return this.#topic;
    }

    get #src() {
        return new URL(
            this.getAttribute("src") || DEFAULT_SRC,
            document.baseURI,
        ).href;
    }

    get #pageHref() {
        return new URL(
            this.getAttribute("page-href") || DEFAULT_PAGE,
            document.baseURI,
        ).href;
    }

    /** Show the topic for a date ("YYYY-MM-DD"), or today's. */
    async show(date) {
        this.#pinned = date ?? null;
        const day = date ?? manilaToday();
        const request = ++this.#request;
        try {
            const entries = await readTopics(this.#src);
            if (request !== this.#request) {
                return;
            }
            this.#render(topicFor(entries, day), day);
        } catch (error) {
            if (request !== this.#request) {
                return;
            }
            console.warn("Food for Thought could not be loaded:", error);
            this.#showMessage(
                "Today's serving is unavailable. Please try again later.",
            );
            this.dispatchEvent(
                new CustomEvent("error", {
                    detail: { message: error.message },
                }),
            );
        }
    }

    // A new day in Manila brings a new topic, unless a date was pinned.
    #checkDate() {
        if (this.#pinned === null && this.#date && manilaToday() !== this.#date) {
            this.show();
        }
    }

    #read() {
        if (!this.#topic) {
            return;
        }
        this.dispatchEvent(
            new CustomEvent("read", {
                detail: { id: this.#topic.id, date: this.#date },
            }),
        );
    }

    #showMessage(message) {
        const els = this.#els;
        els.name.textContent = "Food for Thought";
        els.message.textContent = message;
        els.message.hidden = false;
        for (const el of [els.areas, els.guards, els.figure, els.serving, els.chew, els.more]) {
            el.hidden = true;
        }
    }

    #render(topic, date) {
        const els = this.#els;
        this.#topic = topic;
        this.#date = date;
        els.badges.replaceChildren(
            ...topic.areas.map((area) => {
                const img = document.createElement("img");
                img.src = `${IMAGES}${AREA_IMAGES[area]}`;
                img.alt = "";
                img.width = 40;
                img.height = 40;
                img.loading = "lazy";
                return img;
            }),
        );
        els.areaNames.textContent = `${topic.section} · Feeds the ${topic.areas.join(", ").toLowerCase().replace(/, ([^,]*)$/, " and $1")}`;
        els.areas.hidden = false;
        els.name.textContent = topic.person
            ? `${topic.name} (${topic.person})`
            : topic.name;
        els.message.hidden = true;
        els.guardsText.textContent = topic.guards;
        els.guards.hidden = false;
        const food = topic.food[0];
        els.verse.textContent = food.text;
        els.reference.replaceChildren(refPill(food.reference));
        els.figure.hidden = false;
        els.servingText.textContent = topic.serving;
        els.serving.hidden = false;
        els.chewText.textContent = topic.chew;
        els.chew.hidden = false;
        const url = new URL(this.#pageHref);
        url.hash = topic.id;
        els.more.href = url.href;
        els.more.hidden = false;
        this.dispatchEvent(
            new CustomEvent("ready", { detail: { id: topic.id, date } }),
        );
    }
}

if (!customElements.get("daily-food-for-thought")) {
    customElements.define("daily-food-for-thought", DailyFoodForThought);
}
