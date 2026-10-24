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
 * Fires kids-done { game, tries } after the last saying.
 */

import { BASE_STYLES, KidsGame, SPEAKER_ICON, escapeHtml, shuffle } from "./kids-common.js?v=20261024-2";

// The longest wait between a right answer and the next saying.
const NEXT_AFTER_MS = 2500;

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
`;

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
        const people = shuffle(sayings.map((_, i) => i));
        this.shadowRoot.innerHTML = `
          <style>${STYLES}</style>
          <p class="step">${this.#round + 1} of ${sayings.length}</p>
          <div class="quote">
            <p>“${escapeHtml(s.quote)}”</p>
            <cite>${escapeHtml(s.reference)}</cite>
          </div>
          <p class="prompt">Who said it?</p>
          <div class="people">
            ${people.map((i) => {
                const p = sayings[i];
                return `<button class="person" type="button" data-person="${i}">
                  <span class="faces${p.portraits.length > 1 ? " many" : ""}">${p.portraits.map((src) => `<img src="${escapeHtml(this.url(src))}" alt="" />`).join("")}</span>
                  <span>${escapeHtml(p.name)}</span>
                </button>`;
            }).join("")}
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
        const sayings = this.config.sayings;
        const chosen = sayings[Number(button.dataset.person)];
        const feedback = this.shadowRoot.querySelector(".feedback");
        this.#tries += 1;
        if (chosen.id !== saying.id) {
            this.#wrong += 1;
            button.classList.remove("shake");
            void button.offsetWidth;
            button.classList.add("shake");
            feedback.className = "feedback hint";
            feedback.textContent = "Not quite. Listen again!";
            this.sfx("try-again");
            this.mood("think");
            if (this.#wrong >= 2) {
                const index = sayings.indexOf(saying);
                this.shadowRoot.querySelector(`[data-person="${index}"]`)?.classList.add("glow");
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
        this.#round += 1;
        if (this.#round >= sayings.length) {
            this.sayOneOf("right-");
            this.done({ tries: this.#tries });
            return;
        }
        // The next saying comes after Nari's "Well done", or after a moment
        // when that line is slow to load.
        const next = new Promise((resolve) => setTimeout(resolve, NEXT_AFTER_MS));
        Promise.race([this.sayOneOf("right-"), next]).then(() => {
            if (this.isConnected) {
                this.#show();
            }
        });
    }
}

if (!customElements.get("kids-who-said")) {
    customElements.define("kids-who-said", KidsWhoSaid);
}
