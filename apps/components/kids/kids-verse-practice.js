/**
 * <kids-verse-practice> — My Verse for Explorers (ages 9 to 12): the whole
 * King James verse, learned with the same seven practices grown-up Daily Grace
 * uses (apps/components/memory-verse.js), a little harder each time:
 *   1 Read it            read it aloud, three times
 *   2 Phrase by phrase   tap to bring it in a phrase at a time
 *   3 Fill a few         every fourth word is a blank; tap one to peek
 *   4 Fill half          every other word is a blank
 *   5 First letters      only the first letter of each word
 *   6 Put it in order    tap the phrases in the right order
 *   7 Say it             only the reference; say it, then check
 * One or more a visit: after a practice, "Next practice" opens the next.
 *
 * config (see kids-common.js for the shared keys):
 *   verse     { ref, text, audio }
 *   level     the practice to open, 0 to 6 (from the child's record)
 *   learned   whether the verse is already learned
 * Fires kids-done { game, level, had } each time a practice is finished
 * (`had`: "I had it" on Say it); the page records it.
 */

import { BASE_STYLES, KidsGame, SPEAKER_ICON, escapeHtml, shuffle } from "./kids-common.js?v=20261024-2";

export const PRACTICES = [
    { kind: "read", name: "Read it", hint: "Read it aloud, slowly. Then read it again." },
    { kind: "phrases", name: "Phrase by phrase", hint: "Tap to bring in the next phrase. Say each one as it comes." },
    { kind: "blanks", every: 4, name: "Fill a few", hint: "Say the verse, filling in the blanks. Tap a blank to peek." },
    { kind: "blanks", every: 2, name: "Fill half", hint: "Half the words are gone. Tap a blank to peek." },
    { kind: "letters", name: "First letters", hint: "Only the first letters are left. Tap a word to peek." },
    { kind: "order", name: "Put it in order", hint: "Tap the phrases in the order they come." },
    { kind: "say", name: "Say it", hint: "Say the verse out loud, or in your heart. Then check." },
];
const READS = 3;
const PHRASE_WORDS = 5;

/** The verse in words, each with the punctuation before and after it. */
export function wordsOf(text) {
    return String(text).trim().split(/\s+/).map((token) => {
        const [, lead, core, trail] = /^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u.exec(token);
        return { lead, core, trail };
    });
}

/** The verse in phrases: cut at its punctuation, and long phrases cut again into pieces. */
export function phrasesOf(text) {
    const phrases = [];
    for (const part of String(text).trim().split(/(?<=[,;:.!?])\s+/)) {
        const words = part.split(/\s+/);
        const pieces = Math.ceil(words.length / PHRASE_WORDS);
        const size = Math.ceil(words.length / pieces);
        for (let i = 0; i < words.length; i += size) {
            phrases.push(words.slice(i, i + size).join(" "));
        }
    }
    return phrases;
}

const STYLES = /* css */ `
  ${BASE_STYLES}
  .card { max-width: 38em; margin: 0 auto; padding: 18px 20px; border-radius: 22px; background: var(--k-paper); box-shadow: 0 4px 0 var(--k-shadow); }
  .label { font-weight: 900; color: var(--k-gold-dark); letter-spacing: .06em; text-transform: uppercase; font-size: .8rem; }
  .levels { display: flex; gap: 6px; margin: 6px 0 10px; }
  .levels span { flex: 1; height: 6px; border-radius: 3px; background: #eadfca; }
  .levels span.on { background: var(--k-green); }
  .note { margin: 0 0 10px; color: var(--k-muted); font-weight: 700; }
  .verse { margin: 0; font: 400 var(--kids-verse-size, 1.45rem)/1.6 Georgia, "Times New Roman", serif; }
  .verse .later { visibility: hidden; }
  .verse .fresh { background: #fff2cc; border-radius: 4px; }
  .ref { margin-top: 8px; font-weight: 900; color: var(--k-muted); }
  .ref.big { font: 800 2rem/1.2 var(--kids-display, "Baloo 2", system-ui, sans-serif); color: var(--k-ink); text-align: center; margin: 24px 0; }
  .gap { display: inline-block; min-width: 1.4em; height: 1.35em; margin: 0 1px; padding: 0 2px; border: 0; border-bottom: 3px solid var(--k-gold);
    background: #fbf3e2; border-radius: 4px 4px 0 0; font: inherit; vertical-align: baseline; cursor: pointer; color: var(--k-gold-dark); }
  .gap.shown { width: auto !important; background: #e8f4ec; border-bottom-color: var(--k-green); color: var(--k-ink); cursor: default; }
  .reads { display: flex; gap: 10px; justify-content: center; margin-top: 14px; }
  .reads span { width: 34px; height: 34px; border-radius: 50%; border: 3px solid var(--k-gold); display: grid; place-items: center; color: #fff; font-weight: 900; }
  .reads span.on { background: var(--k-green); border-color: var(--k-green); }
  .tiles { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
  .tile { padding: 10px 14px; border: 3px solid var(--k-paper); border-radius: 14px; background: #fbf3e2; font: 700 1.05rem/1.3 Georgia, serif; cursor: pointer; box-shadow: 0 3px 0 var(--k-shadow); }
  .tile.glow { animation: kids-pulse 1.1s ease infinite; border-color: var(--k-gold); }
  .built { min-height: 2.4em; }
  .done { text-align: center; }
  .done h3 { margin: 4px 0; font: 800 1.6rem var(--kids-display, "Baloo 2", system-ui, sans-serif); color: var(--k-green); }
`;

export class KidsVersePractice extends KidsGame {
    #level = 0;
    #learned = false;
    #state = {};

    render() {
        this.#level = Math.max(0, Math.min(PRACTICES.length - 1, Math.floor(Number(this.config.level) || 0)));
        this.#learned = this.config.learned === true;
        this.#state = {};
        this.#draw();
        this.say("verse-intro");
    }

    get level() {
        return this.#level;
    }

    #draw() {
        const practice = PRACTICES[this.#level];
        const verse = this.config.verse;
        const head = `
          <div class="label">Practice ${this.#level + 1} of ${PRACTICES.length} · ${escapeHtml(practice.name)}</div>
          <div class="levels" aria-hidden="true">${PRACTICES.map((_, i) => `<span class="${i <= this.#level ? "on" : ""}"></span>`).join("")}</div>
          <p class="note">${escapeHtml(practice.hint)}</p>`;
        this.shadowRoot.innerHTML = `
          <style>${STYLES}</style>
          <div class="card">${head}<div class="body">${this.#bodyHtml(practice, verse)}</div></div>
          <p class="feedback" aria-live="polite"></p>
          <div class="actions">${this.#buttons(practice)}</div>`;
        const root = this.shadowRoot;
        root.querySelector(".card").addEventListener("click", (event) => {
            const gap = event.target.closest(".gap:not(.shown)");
            if (gap) {
                this.#state.peeked = this.#state.peeked ?? new Set();
                this.#state.peeked.add(Number(gap.dataset.word));
                this.#redrawBody();
                return;
            }
            const tile = event.target.closest(".tile");
            if (tile) {
                this.#place(Number(tile.dataset.phrase), tile);
            }
        });
        root.querySelector(".actions").addEventListener("click", (event) => {
            const action = event.target.closest("[data-action]")?.dataset.action;
            if (action) {
                this.#act(action);
            }
        });
    }

    #redrawBody() {
        const practice = PRACTICES[this.#level];
        this.shadowRoot.querySelector(".body").innerHTML = this.#bodyHtml(practice, this.config.verse);
        this.shadowRoot.querySelector(".actions").innerHTML = this.#buttons(practice);
    }

    #bodyHtml(practice, verse) {
        const ref = `<div class="ref">${escapeHtml(verse.ref)}</div>`;
        switch (practice.kind) {
            case "read": {
                const reads = this.#state.reads ?? 0;
                return `<blockquote class="verse">${escapeHtml(verse.text)}</blockquote>${ref}
                  <div class="reads" aria-label="${reads} of ${READS} readings">${Array.from({ length: READS }, (_, i) => `<span class="${i < reads ? "on" : ""}">${i < reads ? "✓" : ""}</span>`).join("")}</div>`;
            }
            case "phrases": {
                const phrases = phrasesOf(verse.text);
                const shown = this.#state.shown ?? 1;
                return `<blockquote class="verse" aria-live="polite">${phrases.map((p, i) => `<span class="${i >= shown ? "later" : i === shown - 1 && shown > 1 ? "fresh" : ""}"${i >= shown ? ' aria-hidden="true"' : ""}>${escapeHtml(p)}</span>`).join(" ")}</blockquote>${ref}`;
            }
            case "blanks":
            case "letters": {
                const peeked = this.#state.peeked ?? new Set();
                const words = wordsOf(verse.text).map(({ lead, core, trail }, i) => {
                    const hide = core && (practice.kind === "letters" || i % practice.every === practice.every - 1);
                    if (!hide) {
                        return escapeHtml(lead + core + trail);
                    }
                    const shown = peeked.has(i);
                    const letters = practice.kind === "letters" && !shown;
                    const face = shown ? core : letters ? core[0] : "";
                    const width = letters ? 0.9 + core.length * 0.18 : Math.max(core.length, 2) * 0.62;
                    const label = shown ? core : letters ? `${core[0]}, a hidden word. Tap to peek` : "A hidden word. Tap to peek";
                    return `${escapeHtml(lead)}<button class="gap${shown ? " shown" : ""}" type="button" data-word="${i}" style="width:${width.toFixed(2)}em" aria-label="${escapeHtml(label)}">${escapeHtml(face)}</button>${escapeHtml(trail)}`;
                });
                return `<blockquote class="verse">${words.join(" ")}</blockquote>${ref}`;
            }
            case "order": {
                const phrases = phrasesOf(verse.text);
                if (!this.#state.order) {
                    this.#state.order = shuffle(phrases.map((_, i) => i));
                }
                const placed = this.#state.placed ?? 0;
                return `<blockquote class="verse built" aria-live="polite">${phrases.slice(0, placed).map(escapeHtml).join(" ")}</blockquote>
                  <div class="tiles">${this.#state.order.filter((i) => i >= placed).map((i) => `<button class="tile" type="button" data-phrase="${i}">${escapeHtml(phrases[i])}</button>`).join("")}</div>${ref}`;
            }
            case "say":
                return this.#state.revealed
                    ? `<blockquote class="verse">${escapeHtml(verse.text)}</blockquote>${ref}<p class="note">Did you have it?</p>`
                    : `<div class="ref big">${escapeHtml(verse.ref)}</div>`;
            default:
                return "";
        }
    }

    #buttons(practice) {
        const listen = `<button class="btn quiet" type="button" data-action="listen">${SPEAKER_ICON} Hear it</button>`;
        switch (practice.kind) {
            case "read":
                return `${listen}<button class="btn" type="button" data-action="read">I read it · ${(this.#state.reads ?? 0) + 1} of ${READS}</button>`;
            case "phrases":
                return (this.#state.shown ?? 1) < phrasesOf(this.config.verse.text).length
                    ? `<button class="btn" type="button" data-action="phrase">Next phrase</button>`
                    : `<button class="btn" type="button" data-action="finish">Done</button>`;
            case "order":
                return (this.#state.placed ?? 0) >= phrasesOf(this.config.verse.text).length
                    ? `<button class="btn" type="button" data-action="finish">Done</button>`
                    : `<button class="btn quiet" type="button" data-action="hint">Show me</button>`;
            case "say":
                return this.#state.revealed
                    ? `<button class="btn quiet" type="button" data-action="almost">Almost</button><button class="btn" type="button" data-action="had">I had it</button>`
                    : `<button class="btn" type="button" data-action="reveal">Show the verse</button>`;
            default:
                return `${listen}<button class="btn" type="button" data-action="finish">Done</button>`;
        }
    }

    #place(index, tile) {
        const placed = this.#state.placed ?? 0;
        if (index !== placed) {
            tile.classList.remove("shake");
            void tile.offsetWidth;
            tile.classList.add("shake");
            this.sfx("try-again");
            return;
        }
        this.#state.placed = placed + 1;
        this.sfx("drop");
        this.#redrawBody();
    }

    #act(action) {
        const phrases = phrasesOf(this.config.verse.text);
        switch (action) {
            case "listen":
                this.say(this.config.verse.audio, { force: true });
                break;
            case "read":
                this.#state.reads = (this.#state.reads ?? 0) + 1;
                if (this.#state.reads >= READS) {
                    this.#finish(false);
                } else {
                    this.#redrawBody();
                }
                break;
            case "phrase":
                this.#state.shown = Math.min((this.#state.shown ?? 1) + 1, phrases.length);
                this.#redrawBody();
                break;
            case "hint": {
                const placed = this.#state.placed ?? 0;
                this.shadowRoot.querySelector(`.tile[data-phrase="${placed}"]`)?.classList.add("glow");
                break;
            }
            case "reveal":
                this.#state.revealed = true;
                this.#redrawBody();
                break;
            case "had":
                this.#finish(true);
                break;
            case "almost":
            case "finish":
                this.#finish(false);
                break;
            case "next":
                this.#level = Math.min(this.#level + 1, PRACTICES.length - 1);
                this.#state = {};
                this.#draw();
                break;
            default:
                break;
        }
    }

    #finish(had) {
        const last = this.#level === PRACTICES.length - 1;
        const learnedNow = last && had && !this.#learned;
        this.#learned = this.#learned || (last && had);
        this.done({ level: this.#level, had });
        this.sfx(learnedNow ? "celebrate" : "right");
        this.say(learnedNow ? "verse-learned" : "verse-practice-done");
        this.mood("cheer");
        const more = !last;
        this.shadowRoot.querySelector(".card").innerHTML = `
          <div class="done">
            <h3>${learnedNow ? "Learned!" : last && !had ? "Nearly there" : "Practice done"}</h3>
            <p class="note">${learnedNow ? `${escapeHtml(this.config.verse.ref)} is yours to keep.`
                : last ? (this.#learned ? "You can say it again any time." : "Say it again another day, or now.")
                : `Next: ${escapeHtml(PRACTICES[this.#level + 1].name.toLowerCase())}.`}</p>
          </div>`;
        this.shadowRoot.querySelector(".actions").innerHTML = more
            ? `<button class="btn quiet" type="button" data-action="next">Next practice</button>`
            : `<button class="btn quiet" type="button" data-action="again">Say it again</button>`;
        this.shadowRoot.querySelector('[data-action="again"]')?.addEventListener("click", () => {
            this.#state = {};
            this.#draw();
        }, { once: true });
    }
}

if (!customElements.get("kids-verse-practice")) {
    customElements.define("kids-verse-practice", KidsVersePractice);
}
