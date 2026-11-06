/**
 * <my-faith-journal> — the home page's way into My Faith Journal.
 *
 * The My Faith Journal banner fills the card: the short video
 * (assets/images/my-faith-journal.mp4) playing muted on a loop, with its
 * still picture (my-faith-journal.webp) shown first and kept when the video
 * can't or shouldn't play. The banner is full from edge to edge (the phone,
 * the title, the five kinds of entry, the notebook), so nothing is laid over
 * it: "Write today's log" and an animated double arrow sit in a navy strip
 * beneath it. The whole card is
 * the link to apps/pages/journal.html.
 *
 * The video is only fetched once the card comes near the screen, after the
 * page has loaded, so it never slows the top of the home page; it pauses
 * while scrolled away, and it isn't loaded at all when the reader prefers
 * reduced motion or has Save-Data on.
 *
 * Usage
 *   <my-faith-journal></my-faith-journal>
 *   <script type="module" src="./apps/components/my-faith-journal.js"></script>
 *
 * Attributes
 *   href      the journal, resolved against the page.
 *             Default: apps/pages/journal.html
 */

const asset = (path) => new URL(path, import.meta.url).href;

const VIDEO_URL = asset("../../assets/images/my-faith-journal.mp4");
const POSTER_URL = asset("../../assets/images/my-faith-journal.webp");
const DEFAULT_HREF = "apps/pages/journal.html";

// Two chevrons, lit one after the other, pointing into the journal.
const ARROWS = `<svg viewBox="0 0 32 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5l7 7-7 7"/><path d="M17 5l7 7-7 7"/></svg>`;

// A pen, for the strip's words.
const PEN = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;

const STYLES = /* css */ `
  /* Inset like the other cards in the stack. */
  :host { display: block; padding-inline: 10px; }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }
  .card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 10px;
    border-left: 5px solid #f2c531;
    background: #001b34;
    color: #fff;
    text-decoration: none;
    box-shadow: 0 10px 26px rgb(0 27 52 / 20%);
    transition: transform .15s ease, box-shadow .15s ease;
  }
  .card:hover { transform: translateY(-1px); box-shadow: 0 14px 32px rgb(0 27 52 / 28%); }
  .card:focus-visible { outline: 3px solid #1f3f8f; outline-offset: 3px; }
  /* The picture and the video are 16:9. */
  .banner { position: relative; display: block; aspect-ratio: 16 / 9; background: #f6ecc9; }
  .banner img, .banner video {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
  }
  .banner video { opacity: 0; transition: opacity .4s ease; }
  .banner video.playing { opacity: 1; }
  .strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px 10px 14px;
  }
  .words {
    display: flex; align-items: center; gap: 8px;
    min-width: 0;
    font: 500 clamp(.875rem, .8rem + .35vw, 1rem)/1.3 'Roboto', Arial, sans-serif;
    color: rgb(255 255 255 / 88%);
  }
  .words svg { flex: none; width: 1.2em; height: 1.2em; color: #f2c531; }
  /* The double arrow: the pair drifts forward while each chevron lights in
     turn, the back one first. */
  .go {
    flex: none;
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 44px; min-height: 44px;
    color: #f2c531;
  }
  .go svg {
    width: clamp(36px, 30px + 1.5vw, 46px); height: auto;
    filter: drop-shadow(0 0 6px rgb(242 197 49 / 45%));
    animation: drift 1.4s ease-in-out infinite;
  }
  .go path { animation: light 1.4s ease-in-out infinite; }
  .go path + path { animation-delay: .2s; }
  .card:hover .go svg, .card:hover .go path { animation-duration: .8s; }
  .card:hover .go path + path { animation-delay: .12s; }
  @keyframes drift {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(6px); }
  }
  @keyframes light {
    0%, 100% { opacity: .35; }
    40% { opacity: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    .card, .banner video, .go svg, .go path { transition: none; animation: none; }
  }
`;

export class MyFaithJournal extends HTMLElement {
    static observedAttributes = ["href"];

    #root;
    #video = null;
    #observer = null;

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: "open" });
        this.#root.innerHTML = `
          <style>${STYLES}</style>
          <a class="card" aria-label="My Faith Journal: your logbook of the walk with God, kept on this device">
            <span class="banner">
              <img src="${POSTER_URL}" alt="" width="1920" height="1080" loading="lazy" decoding="async" />
            </span>
            <span class="strip">
              <span class="words">${PEN}<span>Write today's log</span></span>
              <span class="go">${ARROWS}</span>
            </span>
          </a>`;
    }

    connectedCallback() {
        this.#setHref();
        if (!this.#mayPlay()) {
            return;
        }
        // Like the home page's other extras, the video waits for the page to
        // load: until then the cards above are still empty, and this one
        // would seem near the screen.
        if (document.readyState === "complete") {
            this.#watch();
        } else {
            window.addEventListener("load", () => {
                if (this.isConnected && !this.#observer) {
                    this.#watch();
                }
            }, { once: true });
        }
    }

    disconnectedCallback() {
        this.#observer?.disconnect();
        this.#observer = null;
        this.#video?.pause();
    }

    attributeChangedCallback() {
        this.#setHref();
    }

    #setHref() {
        this.#root.querySelector(".card").href = new URL(this.getAttribute("href") || DEFAULT_HREF, document.baseURI).href;
    }

    #mayPlay() {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return false;
        }
        if (navigator.connection?.saveData) {
            return false;
        }
        return typeof IntersectionObserver === "function";
    }

    /** Loads the video when the card comes near the screen; plays it only while it is on screen. */
    #watch() {
        this.#observer = new IntersectionObserver((entries) => {
            const visible = entries.some((e) => e.isIntersecting);
            if (visible && !this.#video) {
                this.#load();
            }
            if (this.#video?.isConnected) {
                if (visible) {
                    this.#play();
                } else {
                    this.#video.pause();
                }
            }
        }, { rootMargin: "200px 0px" });
        this.#observer.observe(this);
    }

    #load() {
        const video = document.createElement("video");
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("aria-hidden", "true");
        video.preload = "auto";
        video.poster = POSTER_URL;
        video.addEventListener("playing", () => video.classList.add("playing"), { once: true });
        // A file that can't play leaves the still picture showing.
        video.addEventListener("error", () => video.remove(), { once: true });
        video.src = VIDEO_URL;
        this.#root.querySelector(".banner").append(video);
        this.#video = video;
        this.#play();
    }

    #play() {
        const video = this.#video;
        video.play()?.catch?.((error) => {
            // The file can't be played here: the still picture stays.
            if (error?.name === "NotSupportedError") {
                video.remove();
            }
        });
    }
}

if (!customElements.get("my-faith-journal")) {
    customElements.define("my-faith-journal", MyFaithJournal);
}
