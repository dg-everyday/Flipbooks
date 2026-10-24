/**
 * Shared pieces of the Daily Grace Kids games (apps/components/kids/*.js).
 *
 * Each game is a custom element with a shadow root. The page sets its `config`
 * property (the game's data, the child's age band, the audio player, the media
 * resolver and the sound-effect and Nari-line URLs); the game renders itself,
 * and when the child has finished it fires `kids-done` (bubbling, composed)
 * with `{ detail: { game, ...result } }`. No game has a timer that ends it, and
 * no game can be lost: a wrong try gets a gentle sound and, after a couple of
 * tries, a hint, then the answer.
 *
 * config, common to every game:
 *   band       "lambs" (3–5) or "lions" (6–8)
 *   audio      the player from assets/scripts/kids/audio.js
 *   resolve    turns "media:…" into a URL
 *   sfx        { right, "try-again", sparkle, … } URLs
 *   lines      Nari's line URLs by key (nari-lines in the resources)
 */

const ICON = 'viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"';
export const SPEAKER_ICON = `<svg ${ICON}><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>`;
export const CHECK_ICON = `<svg ${ICON} stroke-width="3.2"><path d="M5 12.5l4.5 4.5L19 7"/></svg>`;

export const escapeHtml = (text) =>
    String(text ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** A shuffled copy that is never in the original order (when that is possible). */
export function shuffle(items, random = Math.random) {
    const copy = items.slice();
    if (copy.length < 2) {
        return copy;
    }
    for (let attempt = 0; attempt < 10; attempt += 1) {
        for (let i = copy.length - 1; i > 0; i -= 1) {
            const j = Math.floor(random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        if (copy.some((item, i) => item !== items[i])) {
            return copy;
        }
    }
    // Still in order after ten tries (two items, say): swap the first two.
    [copy[0], copy[1]] = [copy[1], copy[0]];
    return copy;
}

/** Shared look: the page's fonts and colours inherit into the shadow root. */
export const BASE_STYLES = /* css */ `
  :host {
    display: block;
    --k-ink: var(--kids-ink, #1d2b4f);
    --k-muted: var(--kids-muted, #48557a);
    --k-green: var(--kids-green, #1e6b46);
    --k-green-dark: var(--kids-green-dark, #124a2f);
    --k-gold: var(--kids-gold, #e3bc66);
    --k-gold-dark: var(--kids-gold-dark, #b48a32);
    --k-paper: var(--kids-paper, #ffffff);
    --k-shadow: var(--kids-shadow, #ebd7b5);
    --k-coral: var(--kids-coral, #c94a27);
    font-family: var(--kids-text, "Nunito", system-ui, sans-serif);
    color: var(--k-ink);
  }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }
  button { font: inherit; color: inherit; }
  .prompt {
    margin: 0 0 12px; font-size: var(--kids-prompt-size, 1.2rem); font-weight: 800; line-height: 1.3; text-align: center;
  }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    min-height: 56px; padding: 0 22px; border: 0; border-radius: 999px;
    background: var(--k-gold); color: var(--k-ink); font-weight: 800; font-size: 1.05rem;
    box-shadow: 0 4px 0 var(--k-gold-dark); cursor: pointer; touch-action: manipulation;
  }
  .btn:active { transform: translateY(2px); box-shadow: 0 2px 0 var(--k-gold-dark); }
  .btn.quiet { background: var(--k-paper); box-shadow: 0 4px 0 var(--k-shadow); }
  .btn:focus-visible, .tile:focus-visible, .choice:focus-visible { outline: 4px solid var(--k-green); outline-offset: 3px; }
  .feedback { min-height: 1.6em; margin: 12px 0 0; text-align: center; font-weight: 800; font-size: 1.05rem; }
  .feedback.good { color: var(--k-green); }
  .feedback.hint { color: var(--k-coral); }
  .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 16px; }
  @keyframes kids-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
  @keyframes kids-pop { 0% { transform: scale(.6); opacity: 0; } 70% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); } }
  @keyframes kids-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgb(227 188 102 / 80%); } 50% { box-shadow: 0 0 0 12px rgb(227 188 102 / 0%); } }
  .shake { animation: kids-shake .35s ease; }
  :host([less-motion]) *, :host([less-motion]) *::before, :host([less-motion]) *::after { animation: none !important; transition: none !important; }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
`;

/** Base class: holds the config and the helpers every game uses. */
export class KidsGame extends HTMLElement {
    #config = null;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    get config() {
        return this.#config;
    }

    set config(value) {
        this.#config = value;
        if (this.isConnected) {
            this.render();
        }
    }

    connectedCallback() {
        if (this.#config) {
            this.render();
        }
    }

    disconnectedCallback() {
        this.#config?.audio?.stop?.();
    }

    get band() {
        return this.#config?.band === "lions" ? "lions" : "lambs";
    }

    url(value) {
        return this.#config?.resolve ? this.#config.resolve(value) : value;
    }

    sfx(key) {
        this.#config?.audio?.sfx?.(this.#config?.sfx?.[key]);
    }

    say(urlOrKey, options) {
        const url = this.#config?.lines?.[urlOrKey] ?? urlOrKey;
        return this.#config?.audio?.say?.(url, options) ?? Promise.resolve("skipped");
    }

    /**
     * Says one of the numbered keys at random (Nari's "right-1", "right-2"…),
     * for variety. Only the numbered ones: "right-" must not pick
     * "right-or-not-intro".
     */
    sayOneOf(prefix) {
        const keys = Object.keys(this.#config?.lines ?? {}).filter((k) => k.startsWith(prefix) && /^\d+$/.test(k.slice(prefix.length)));
        if (keys.length) {
            return this.say(keys[Math.floor(Math.random() * keys.length)]);
        }
        return Promise.resolve("skipped");
    }

    done(result = {}) {
        this.dispatchEvent(new CustomEvent("kids-done", {
            bubbles: true,
            composed: true,
            detail: { game: this.localName, ...result },
        }));
    }

    /** Tells the page what Nari should look like now: "cheer", "think", "point"… */
    mood(pose) {
        this.dispatchEvent(new CustomEvent("kids-mood", { bubbles: true, composed: true, detail: { pose } }));
    }
}
