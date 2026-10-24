/**
 * <kids-card> — the home page's way into Daily Grace Kids.
 *
 * The Daily Grace Kids banner fills the card: the short video
 * (assets/images/daily-grace-kids-banner.mp4) playing muted on a loop, with
 * its still picture (daily-grace-kids-banner.webp) shown first and kept when
 * the video can't or shouldn't play. "Let's go" sits on the banner's open sky
 * to the right of Nari, bobbing gently with a soft glow. The whole card is the
 * link to apps/pages/kids.html.
 *
 * The video is only fetched once the card comes near the screen, so it never
 * slows the top of the home page; it pauses while scrolled away, and it isn't
 * loaded at all when the reader prefers reduced motion or has Save-Data on.
 * The banner carries its own title on the left, so it is anchored there when
 * the frame trims it.
 *
 * Usage
 *   <kids-card></kids-card>
 *   <script type="module" src="./apps/components/kids-card.js"></script>
 *
 * Attributes
 *   href      the kids page, resolved against the page. Default: apps/pages/kids.html
 *   heading   a title above the card, beside a compass, set like the heading
 *             of the story rows (daily-grace-kids.html: "Explorer"). Default:
 *             none, as on the home page.
 */

const asset = (path) => new URL(path, import.meta.url).href;

const VIDEO_URL = asset("../../assets/images/daily-grace-kids-banner.mp4");
const POSTER_URL = asset("../../assets/images/daily-grace-kids-banner.webp");
const DEFAULT_HREF = "apps/pages/kids.html";

// A compass rose in a ring, filled like the heading text.
const COMPASS = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
  <path fill-rule="evenodd" d="M12 1a11 11 0 1 1 0 22 11 11 0 0 1 0-22Zm0 1.6a9.4 9.4 0 1 0 0 18.8 9.4 9.4 0 0 0 0-18.8Z"/>
  <path d="m12 4.2 1.9 5.9 5.9 1.9-5.9 1.9-1.9 5.9-1.9-5.9L4.2 12l5.9-1.9L12 4.2Zm-4.3 3.5 3 1.6-1.4 1.4-1.6-3Zm8.6 0-1.6 3-1.4-1.4 3-1.6Zm0 8.6-3-1.6 1.4-1.4 1.6 3Zm-8.6 0 1.6-3 1.4 1.4-3 1.6Z"/>
  <circle cx="12" cy="12" r="1.3" fill="#fff"/>
</svg>`;

const ARROW = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>`;

const STYLES = /* css */ `
  /* Inset like the Sticker Album card above it. */
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
  .card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 10px;
    border: 1px solid rgb(30 107 70 / 25%);
    border-left: 5px solid #e3bc66;
    background: #e4f2fb;
    color: #1d2b4f;
    text-decoration: none;
    box-shadow: 0 10px 26px rgb(0 27 52 / 20%);
    transition: transform .15s ease, box-shadow .15s ease;
  }
  .card:hover { transform: translateY(-1px); box-shadow: 0 14px 32px rgb(0 27 52 / 28%); }
  .card:focus-visible { outline: 3px solid #1e6b46; outline-offset: 3px; }
  .banner {
    position: relative; display: block; aspect-ratio: 16 / 9; background: #cfe8f7;
    /* The button is sized against the banner's width. */
    container-type: inline-size;
  }
  .banner img, .banner video {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; object-position: left center;
  }
  .banner video { opacity: 0; transition: opacity .4s ease; }
  .banner video.playing { opacity: 1; }
  /* "Let's go", on the open sky and hills to the right of Nari. The outer span
     places it and bobs; the button itself carries the glow and the arrow. */
  .go-spot {
    position: absolute;
    z-index: 1;
    /* Kept off the right edge on the narrowest phones. */
    right: 6%;
    top: 58%;
    transform: translateY(-50%);
    animation: bob 2.6s ease-in-out infinite;
  }
  .go {
    position: relative;
    display: inline-flex; align-items: center; gap: .3em;
    min-height: 44px;
    padding: .55em 1.15em .55em 1.3em;
    border-radius: 999px;
    background: #1e6b46; color: #fff;
    font: 800 clamp(1rem, 3.4cqw, 1.6rem)/1 'Roboto', Arial, sans-serif;
    white-space: nowrap;
    box-shadow: 0 .22em 0 #124a2f, 0 .5em 1.2em rgb(0 27 52 / 30%);
    transition: background-color .15s ease;
  }
  /* A soft ring that swells out and fades, again and again. */
  .go::before {
    content: "";
    position: absolute;
    inset: -3px;
    border-radius: inherit;
    border: 3px solid rgb(255 255 255 / 85%);
    animation: ring 2.6s ease-out infinite;
    pointer-events: none;
  }
  .go svg { width: 1.05em; height: 1.05em; animation: nudge 1.3s ease-in-out infinite; }
  /* The narrowest phones: a slimmer button, clear of Nari's ear. */
  @container (max-width: 340px) {
    .go { padding-inline: .85em .7em; }
  }
  .card:hover .go, .card:focus-visible .go { background: #24804f; }
  .card:hover .go svg { animation-duration: .7s; }
  @keyframes bob {
    0%, 100% { transform: translateY(-50%); }
    50% { transform: translateY(calc(-50% - 6px)); }
  }
  @keyframes ring {
    0% { opacity: .9; transform: scale(1); }
    70%, 100% { opacity: 0; transform: scale(1.18, 1.45); }
  }
  @keyframes nudge {
    0%, 60%, 100% { transform: translateX(0); }
    30% { transform: translateX(.25em); }
  }
  @media (prefers-reduced-motion: reduce) {
    .card, .banner video, .go-spot, .go, .go svg { transition: none; animation: none; }
    .go::before { display: none; }
  }
`;

export class KidsCard extends HTMLElement {
    static observedAttributes = ["href", "heading"];

    #root;
    #video = null;
    #observer = null;

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: "open" });
        this.#root.innerHTML = `
          <style>${STYLES}</style>
          <h2 class="heading" hidden>${COMPASS}<span></span></h2>
          <a class="card" aria-label="Daily Grace Kids: Bible stories, games and verses for children">
            <span class="banner">
              <img src="${POSTER_URL}" alt="" width="1920" height="1024" loading="lazy" decoding="async" />
              <span class="go-spot"><span class="go">Let's go ${ARROW}</span></span>
            </span>
          </a>`;
    }

    connectedCallback() {
        this.#setHref();
        this.#setHeading();
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

    attributeChangedCallback(name) {
        if (name === "heading") {
            this.#setHeading();
        } else {
            this.#setHref();
        }
    }

    #setHeading() {
        const text = this.getAttribute("heading") || "";
        const heading = this.#root.querySelector(".heading");
        heading.querySelector("span").textContent = text;
        heading.hidden = !text;
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

if (!customElements.get("kids-card")) {
    customElements.define("kids-card", KidsCard);
}
