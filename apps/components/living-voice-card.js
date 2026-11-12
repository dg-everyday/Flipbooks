/**
 * <living-voice-card> — the home page's way into The Living Voice
 * (apps/pages/living-voice.html): a chapter of the Bible a day, told and
 * explained, to listen to.
 *
 * The banner (on R2, images/bible-walk/bible-walk-banner.webp, from the
 * module's working name) with a headphones mark and the name over its sky, and beneath it a navy strip naming the next step of
 * this reader's walk, from assets/scripts/bible-walk/progress.js, the same chapter
 * the page's player opens on: "Start here", "Continue" an episode part-heard,
 * "Up next", or the next chapter coming soon. The whole card is the link,
 * straight to that chapter on the player.
 *
 * The strip is filled again when the reader comes back to the home page
 * (pageshow), since they may have listened on meanwhile.
 *
 * Usage
 *   <living-voice-card></living-voice-card>
 *   <script type="module" src="./apps/components/living-voice-card.js"></script>
 *
 * Attributes
 *   href      The Living Voice page, resolved against the page.
 *             Default: apps/pages/living-voice.html
 */

import { resolveMedia } from "../settings/settings.js?v=20261009-1";
import { loadWalk, nextStep, readProgress } from "../../assets/scripts/bible-walk/progress.js?v=20261107-1";

const BANNER_URL = resolveMedia("media:images/bible-walk/bible-walk-banner.webp");
const DEFAULT_HREF = "apps/pages/living-voice.html";
const NAME = "The Living Voice";
const TAGLINE = "A chapter a day, told and explained";

const HEADPHONES = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></svg>`;
const PLAY = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2Z"/></svg>`;
const ARROWS = `<svg viewBox="0 0 32 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5l7 7-7 7"/><path d="M17 5l7 7-7 7"/></svg>`;

const STYLES = /* css */ `
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
  .banner { position: relative; display: block; aspect-ratio: 16 / 9; background: #b9c9c4; overflow: hidden; }
  .banner img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center 65%;
  }
  /* The name sits on the sky, which the picture leaves open. */
  .name {
    position: absolute;
    left: 0; right: 0; top: 0;
    padding: clamp(12px, 3vw, 22px) clamp(14px, 4vw, 26px) 32px;
    background: linear-gradient(180deg, rgb(0 27 52 / 55%), rgb(0 27 52 / 0%));
  }
  .title {
    display: flex; align-items: center; gap: 10px;
    font: 400 clamp(1.9rem, 1.4rem + 2.6vw, 2.9rem)/1 'Germania One', Georgia, serif;
    color: #f2c531;
    text-shadow: 0 2px 8px rgb(0 0 0 / 40%);
  }
  .title svg { flex: none; width: .85em; height: .85em; }
  .tagline {
    display: block;
    margin-top: 4px;
    font: 500 clamp(.85rem, .78rem + .35vw, 1rem)/1.3 'Roboto', Arial, sans-serif;
    color: #fff;
    text-shadow: 0 1px 6px rgb(0 0 0 / 55%);
  }
  .strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px 10px 14px;
  }
  .words {
    display: flex; align-items: center; gap: 10px;
    min-width: 0;
    font: 500 clamp(.875rem, .8rem + .35vw, 1rem)/1.3 'Roboto', Arial, sans-serif;
    color: rgb(255 255 255 / 88%);
  }
  .dot {
    flex: none;
    display: grid; place-items: center;
    width: 32px; height: 32px;
    border-radius: 50%;
    background: #f2c531;
    color: #001b34;
  }
  .dot svg { width: 15px; height: 15px; margin-left: 2px; }
  .step { min-width: 0; }
  .step b { color: #f2c531; font-weight: 700; }
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
  @keyframes drift {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(6px); }
  }
  @keyframes light {
    0%, 100% { opacity: .35; }
    40% { opacity: 1; }
  }
  @media (prefers-reduced-motion: reduce) {
    .card, .go svg, .go path { transition: none; animation: none; }
  }
`;

const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const minutes = (seconds) => `${Math.max(1, Math.round(seconds / 60))} min`;

export class LivingVoiceCard extends HTMLElement {
    static observedAttributes = ["href"];

    #root;
    #hash = "";

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: "open" });
        this.#root.innerHTML = `
          <style>${STYLES}</style>
          <a class="card">
            <span class="banner">
              <img src="${escapeHtml(BANNER_URL)}" alt="" width="1536" height="1024" loading="lazy" decoding="async" />
              <span class="name"><span class="title">${HEADPHONES}<span>${NAME}</span></span><span class="tagline">${TAGLINE}</span></span>
            </span>
            <span class="strip">
              <span class="words"><span class="dot">${PLAY}</span><span class="step">${TAGLINE}</span></span>
              <span class="go">${ARROWS}</span>
            </span>
          </a>`;
    }

    connectedCallback() {
        this.#setHref();
        this.#fill();
        window.addEventListener("pageshow", this.#onShow);
    }

    disconnectedCallback() {
        window.removeEventListener("pageshow", this.#onShow);
    }

    attributeChangedCallback() {
        this.#setHref();
    }

    #onShow = (event) => {
        // Back from The Living Voice, kept in the back/forward cache.
        if (event.persisted) {
            this.#fill();
        }
    };

    #setHref() {
        const base = new URL(this.getAttribute("href") || DEFAULT_HREF, document.baseURI);
        base.hash = this.#hash;
        this.#root.querySelector(".card").href = base.href;
    }

    async #fill() {
        let walk;
        try {
            walk = await loadWalk();
        } catch {
            // The strip keeps its tagline; the card still opens the page.
            this.#show(TAGLINE, "");
            return;
        }
        const progress = readProgress();
        const step = nextStep(walk, progress);
        if (step.status === "waiting") {
            this.#show(`<b>${escapeHtml(step.label)}</b> is coming soon`, "");
            return;
        }
        if (step.status === "finished") {
            this.#show("Every episode heard. More are coming", "");
            return;
        }
        const episode = walk.episodes[step.id];
        // "Mark 1, Prepare Ye the Way" for a chapter; an intro's title alone.
        const name = escapeHtml(episode.chapter ? `${episode.label}, ${episode.title}` : episode.title);
        if (step.status === "resume") {
            const left = minutes(episode.seconds - (progress.pos[step.id] ?? 0));
            this.#show(`<b>Continue:</b> ${name} · ${left} left`, step.id);
            return;
        }
        const first = Object.keys(progress.done).length === 0;
        this.#show(`<b>${first ? "Start here:" : "Up next:"}</b> ${name} · ${minutes(episode.seconds)}`, step.id);
    }

    #show(html, id) {
        this.#root.querySelector(".step").innerHTML = html;
        const text = this.#root.querySelector(".step").textContent;
        this.#root.querySelector(".card").setAttribute("aria-label", `${NAME}: ${text}`);
        this.#hash = id ? encodeURIComponent(id) : "";
        this.#setHref();
    }
}

if (!customElements.get("living-voice-card")) {
    customElements.define("living-voice-card", LivingVoiceCard);
}
