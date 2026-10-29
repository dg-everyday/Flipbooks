/**
 * <young-kids-stories> — the Bible stories for young explorers, as a notebook
 * that flips upward.
 *
 * A <flip-book flip="up"> hung from rings along its top edge, like a steno
 * pad. assets/young-kids-stories.json lists the stories; each story's cover is
 * one page, in sequence order. Swipe up (or tap the lower half of the page) to
 * turn to the next one; swipe down or tap the upper half to go back. A caption
 * under the book, lined up with the page's left edge, names the story on show.
 *
 * Usage
 *   <young-kids-stories></young-kids-stories>
 *   <script type="module" src="../components/young-kids-stories.js"></script>
 *
 * Attributes
 *   src       the list, resolved against the page. Default: assets/young-kids-stories.json
 *   heading   a title above the book, beside the clapperboard of the other story rows.
 *             Default: Kids Stories for Rugrats
 *
 * Properties   stories (read-only: the loaded list, in order)
 * Methods      next(), prev()
 * Events       storiesload  detail: { stories }
 *              storychange  detail: { index, story }
 */

import { resolveMedia } from "../settings/settings.js?v=20261009-1";
import "./flip-book.js?v=20261026-3";

const asset = (path) => new URL(path, import.meta.url).href;

const DEFAULT_SRC = asset("../../assets/young-kids-stories.json");
const DEFAULT_HEADING = "Kids Stories for Rugrats";
// The covers are 9:16; the book's height follows the width until it would
// outgrow the screen (see .reader).
const COVER_RATIO = "9/16";

// A clapperboard with a play mark, filled like the heading text (as in story-carousel.js).
const STORIES_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
  <path fill-rule="evenodd" d="M6 2h12a4 4 0 0 1 4 4v1H2V6a4 4 0 0 1 4-4Zm1.2 1.6L9 6.4h2.4L9.6 3.6H7.2Zm5 0L14 6.4h2.4l-1.8-2.8h-2.4Zm5 0L19 6.4h1.3A2.5 2.5 0 0 0 18 3.6h-.8ZM2 8.6h20V18a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8.6Zm8 3.2v6.8l5.6-3.4L10 11.8Z"/>
</svg>`;

const STYLES = /* css */ `
  :host { display: block; padding-inline: 10px; }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }
  /* Same type as the heading of the story rows (story-carousel.js). */
  .heading {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px;
    color: #111;
    font: 400 clamp(1.0625rem, .95rem + .5vw, 1.25rem)/1.3 'Strait', 'Roboto', Arial, sans-serif;
  }
  .heading[hidden] { display: none; }
  .heading svg { flex: none; width: 1.3em; height: 1.3em; }

  /* The notebook sits in a rounded case as wide as the cards around it, like
     the story reader of the kids app: the page fills the case's width, with a
     margin of the case all round, and the case grows to the page's height. */
  .desk {
    padding: 14px 20px 16px;
    overflow: hidden;
    border-radius: 18px;
    background: #f1e8d8;
    box-shadow: 0 10px 26px rgb(0 27 52 / 20%);
  }
  .sheet { container-type: inline-size; }
  /* flip-book keeps 3px either side of the page and 23px above and below it
     (the rings' room and padding), so a 9:16 page this tall is fitted to the
     width (see flip-book.js). The 16px more is room for the page's shadow, so
     the stage doesn't cut it off. */
  .reader {
    height: calc((100cqw - 6px) * 16 / 9 + 39px);
    display: flex;
    flex-direction: column;
  }

  /* The caption keeps to the page's width: it starts and ends where the page
     does. */
  .caption {
    padding: 12px 3px 0;
    color: #1d2b4f;
    font-family: 'Roboto', Arial, sans-serif;
    text-align: left;
  }
  .title { margin: 0; font-size: 1.05rem; font-weight: 800; line-height: 1.25; }
  .about { margin: 2px 0 0; font-size: .9rem; line-height: 1.35; color: #34456b; }
`;

export class YoungKidsStories extends HTMLElement {
    static observedAttributes = ["heading"];

    #root;
    #book;
    #stories = [];
    #index = 0;
    #loadId = 0;

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: "open" });
        this.#root.innerHTML = `
          <style>${STYLES}</style>
          <h2 class="heading" hidden>${STORIES_ICON}<span></span></h2>
          <div class="desk">
           <div class="sheet">
            <div class="reader">
              <flip-book flip="up" end-page="off" aspect="${COVER_RATIO}"
                         label="Bible stories for young explorers"
                         empty-text="No stories are available yet."></flip-book>
            </div>
            <div class="caption" aria-live="polite">
              <p class="title"></p>
              <p class="about"></p>
            </div>
           </div>
          </div>`;
        this.#book = this.#root.querySelector("flip-book");
        this.#book.addEventListener("pagechange", (event) => {
            this.#index = event.detail.index;
            this.#showCaption();
            this.dispatchEvent(
                new CustomEvent("storychange", {
                    detail: { index: this.#index, story: this.#stories[this.#index] ?? null },
                }),
            );
        });
    }

    connectedCallback() {
        this.#setHeading();
        this.#load();
    }

    disconnectedCallback() {
        this.#loadId++; // discard a load still in flight
    }

    attributeChangedCallback(name) {
        if (name === "heading") {
            this.#setHeading();
        }
    }

    get stories() {
        return this.#stories.slice();
    }
    next() {
        this.#book.next();
    }
    prev() {
        this.#book.prev();
    }

    #setHeading() {
        const text = this.getAttribute("heading") ?? DEFAULT_HEADING;
        const heading = this.#root.querySelector(".heading");
        heading.querySelector("span").textContent = text;
        heading.hidden = !text;
    }

    async #load() {
        const loadId = ++this.#loadId;
        const src = new URL(this.getAttribute("src") || DEFAULT_SRC, document.baseURI);
        let stories = [];
        try {
            const response = await fetch(src);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            stories = (Array.isArray(data) ? data : [])
                .filter((story) => story?.id && story?.cover_page)
                .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
        } catch (error) {
            console.error(`Unable to load stories from ${src}:`, error);
        }
        // A newer load owns the element now.
        if (loadId !== this.#loadId) {
            return;
        }

        this.#stories = stories;
        this.#index = 0;
        this.hidden = stories.length === 0;
        // `pages` is only safe to set once flip-book is upgraded; its module is
        // imported above, so it is by the time a load finishes.
        this.#book.pages = stories.map((story) => ({
            src: resolveMedia(story.cover_page),
            alt: story.title || story.id,
            id: story.id,
        }));
        this.#showCaption();
        this.dispatchEvent(new CustomEvent("storiesload", { detail: { stories: this.stories } }));
    }

    #showCaption() {
        const story = this.#stories[this.#index];
        this.#root.querySelector(".title").textContent = story?.title ?? "";
        this.#root.querySelector(".about").textContent = story?.description ?? "";
    }
}

if (!customElements.get("young-kids-stories")) {
    customElements.define("young-kids-stories", YoungKidsStories);
}
