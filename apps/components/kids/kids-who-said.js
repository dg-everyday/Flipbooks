/**
 * <kids-who-said> — Who Said It?: hear a saying from the story, tap who said it.
 *
 * Each saying is played in the voice of the person who said it and shown in
 * the King James words. The people from the same story are offered as
 * portraits (the three friends in the fire answer together, so their card
 * shows all three). A wrong tap gets a gentle sound; after two, the right card
 * glows.
 *
 * config (see kids-common.js for the shared keys):
 *   sayings   [{ id, name, quote, reference, audio, portraits: [url, …] }]
 *             A person with two sayings has one card (the same id).
 *   refs      optional (Explorers): after the right person, the reference is
 *             hidden and the child also picks where it is written, from three
 * Fires kids-done { game, tries } after the last saying.
 */

import { BASE_STYLES, KidsGame, SPEAKER_ICON, escapeHtml, shuffle } from "./kids-common.js?v=20261024-2";

// The longest wait between a right answer and the next saying.
const NEXT_AFTER_MS = 2500;
// How long an Explorer's right answer and its reference stay before the next saying.
const READ_ANSWER_MS = 1800;

const STYLES = /* css */ `
  ${BASE_STYLES}
  .quote { position: relative; margin: 0 auto 16px; max-width: 34em; background: var(--k-paper); border-radius: 22px; padding: 18px 20px; box-shadow: 0 4px 0 var(--k-shadow); text-align: center; }
  .quote p { margin: 0; font: 400 1.35rem/1.45 Georgia, "Times New Roman", serif; }
  .quote cite { display: block; margin-top: 8px; font-style: normal; font-size: .85rem; font-weight: 800; color: var(--k-muted); }
  .people { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; }
  .person {
    display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px; border: 3px solid var(--k-paper);
    border-radius: 20px; background: var(--k-paper); box-shadow: 0 4px 0 var(--k-shadow); cursor: pointer; touch-action: manipulation;
  }
  .faces { display: flex; justify-content: center; }
  .faces img { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; background: #f1e6d2; }
  .faces.many img { width: 64px; height: 64px; margin: 0 -8px; border: 3px solid var(--k-paper); }
  .person span { font-weight: 800; }
  .person.glow { animation: kids-pulse 1.1s ease infinite; border-color: var(--k-gold); }
  .person.right { border-color: var(--k-green); }
  .step { text-align: center; color: var(--k-muted); font-weight: 800; margin: 0 0 8px; }
  .refs { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
  .ref {
    min-height: 56px; padding: 8px 12px; border: 3px solid var(--k-paper); border-radius: 16px; background: var(--k-paper);
    box-shadow: 0 4px 0 var(--k-shadow); font-weight: 800; cursor: pointer; touch-action: manipulation;
  }
  .ref.right { border-color: var(--k-green); }
  .ref.glow { animation: kids-pulse 1.1s ease infinite; border-color: var(--k-gold); }
`;

/** The people to offer: one card each, in the order they first speak. */
function peopleOf(sayings) {
    const seen = new Map();
    for (const s of sayings) {
        if (!seen.has(s.id)) {
            seen.set(s.id, s);
        }
    }
    return [...seen.values()];
}

/** Two wrong references for a saying: the story's others, then a nearby verse. */
function otherRefs(saying, sayings) {
    const others = [...new Set(sayings.map((s) => s.reference).filter((r) => r !== saying.reference))];
    const m = /^(.*\s)(\d+):(\d+)$/.exec(saying.reference);
    if (m) {
        const [, book, chapter, verse] = m;
        for (const n of [Number(verse) + 3, Number(verse) - 2, Number(verse) + 7]) {
            if (n > 0) {
                others.push(`${book}${chapter}:${n}`);
            }
        }
    }
    return [...new Set(others)].filter((r) => r !== saying.reference).slice(0, 2);
}

export class KidsWhoSaid extends KidsGame {
    #round = 0;
    #order = [];
    #wrong = 0;
    #tries = 0;
    #busy = false;

    render() {
        this.#order = shuffle(this.config.sayings.map((_, i) => i));
        this.#round = 0;
        this.#tries = 0;
        this.#show(false);
        // After the instruction, the first saying (unless the child has moved on).
        const first = this.#round;
        this.say("who-intro").then((how) => {
            if (this.isConnected && this.#round === first && how !== "stopped") {
                this.say(this.config.sayings[this.#order[first]].audio);
            }
        });
    }

    #show(play = true) {
        const sayings = this.config.sayings;
        const s = sayings[this.#order[this.#round]];
        this.#wrong = 0;
        this.#busy = false;
        const people = shuffle(peopleOf(sayings));
        const refs = this.config.refs === true;
        this.shadowRoot.innerHTML = `
          <style>${STYLES}</style>
          <p class="step">${this.#round + 1} of ${sayings.length}</p>
          <div class="quote">
            <p>“${escapeHtml(s.quote)}”</p>
            <cite>${refs ? "Where is it written? Find out next." : escapeHtml(s.reference)}</cite>
          </div>
          <p class="prompt">Who said it?</p>
          <div class="people">
            ${people.map((p) => `<button class="person" type="button" data-person="${escapeHtml(p.id)}">
                  <span class="faces${p.portraits.length > 1 ? " many" : ""}">${p.portraits.map((src) => `<img src="${escapeHtml(this.url(src))}" alt="" />`).join("")}</span>
                  <span>${escapeHtml(p.name)}</span>
                </button>`).join("")}
          </div>
          <p class="feedback" aria-live="polite"></p>
          <div class="actions"><button class="btn quiet" type="button" data-listen>${SPEAKER_ICON} Hear it again</button></div>`;
        this.shadowRoot.querySelector("[data-listen]").addEventListener("click", () => this.say(s.audio, { force: true }));
        this.shadowRoot.querySelector(".people").addEventListener("click", (event) => {
            const person = event.target.closest(".person");
            if (person && !this.#busy) {
                this.#pick(person, s);
            }
        });
        if (play) {
            this.say(s.audio);
        }
    }

    #pick(button, saying) {
        const feedback = this.shadowRoot.querySelector(".feedback");
        this.#tries += 1;
        if (button.dataset.person !== saying.id) {
            this.#wrong += 1;
            button.classList.remove("shake");
            void button.offsetWidth;
            button.classList.add("shake");
            feedback.className = "feedback hint";
            feedback.textContent = "Not quite. Listen again!";
            this.sfx("try-again");
            this.mood("think");
            if (this.#wrong >= 2) {
                [...this.shadowRoot.querySelectorAll(".person")].find((b) => b.dataset.person === saying.id)?.classList.add("glow");
                this.say("show-answer");
            } else {
                this.sayOneOf("try-");
            }
            return;
        }
        this.#busy = true;
        button.classList.add("right");
        feedback.className = "feedback good";
        feedback.textContent = `Yes! ${saying.name} said it.`;
        this.sfx("right");
        this.mood("cheer");
        if (this.config.refs === true) {
            this.#askRef(saying);
            return;
        }
        this.#next();
    }

    /** Explorers: where is it written? Three references to choose from. */
    #askRef(saying) {
        const sayings = this.config.sayings;
        const choices = shuffle([saying.reference, ...otherRefs(saying, sayings)]);
        const people = this.shadowRoot.querySelector(".people");
        this.shadowRoot.querySelector(".prompt").textContent = "Where is it written?";
        people.className = "refs";
        people.innerHTML = choices.map((r) => `<button class="ref" type="button" data-ref="${escapeHtml(r)}">${escapeHtml(r)}</button>`).join("");
        let wrong = 0;
        people.addEventListener("click", (event) => {
            const b = event.target.closest(".ref");
            if (!b || b.disabled) {
                return;
            }
            const feedback = this.shadowRoot.querySelector(".feedback");
            this.#tries += 1;
            if (b.dataset.ref !== saying.reference) {
                wrong += 1;
                b.disabled = true;
                b.classList.add("shake");
                feedback.className = "feedback hint";
                feedback.textContent = "Not that one. Try another.";
                this.sfx("try-again");
                if (wrong >= 2) {
                    [...people.querySelectorAll(".ref")].find((x) => x.dataset.ref === saying.reference)?.classList.add("glow");
                }
                return;
            }
            for (const x of people.querySelectorAll(".ref")) {
                x.disabled = true;
            }
            b.classList.add("right");
            this.shadowRoot.querySelector("cite").textContent = saying.reference;
            feedback.className = "feedback good";
            feedback.textContent = `Yes! It's in ${saying.reference}.`;
            this.sfx("right");
            this.#next();
        });
        people.querySelector(".ref")?.focus();
    }

    #next() {
        const sayings = this.config.sayings;
        this.#round += 1;
        if (this.#round >= sayings.length) {
            this.sayOneOf("right-");
            this.done({ tries: this.#tries });
            return;
        }
        // The next saying comes after Nari's "Well done", or after a moment
        // when that line is slow to load. Explorers, who read rather than
        // listen, always get a moment to read the answer first.
        const next = new Promise((resolve) => setTimeout(resolve, NEXT_AFTER_MS));
        const read = new Promise((resolve) => setTimeout(resolve, this.config.explorer ? READ_ANSWER_MS : 0));
        Promise.all([Promise.race([this.sayOneOf("right-"), next]), read]).then(() => {
            if (this.isConnected) {
                this.#show();
            }
        });
    }
}

if (!customElements.get("kids-who-said")) {
    customElements.define("kids-who-said", KidsWhoSaid);
}
