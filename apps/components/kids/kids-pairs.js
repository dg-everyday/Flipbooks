/**
 * <kids-pairs> — Two by Two: turn over two cards to find the animals' pairs.
 *
 * The youngest (lambs) play with four pairs, the older children (lions) with
 * six, chosen at random from the twelve animal cards. Two cards that match
 * stay face up; two that don't turn back after a moment. There is no limit on
 * turns.
 *
 * config (see kids-common.js for the shared keys):
 *   back    the back of a card ("media:…")
 *   cards   [{ id, name, image }]
 * Fires kids-done { game, turns } when every pair is found.
 */

import { BASE_STYLES, KidsGame, escapeHtml, shuffle } from "./kids-common.js?v=20261024-2";

const STYLES = /* css */ `
  ${BASE_STYLES}
  .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; max-width: 560px; margin: 0 auto; }
  .card {
    position: relative; aspect-ratio: 1; padding: 0; border: 0; border-radius: 16px; overflow: hidden; cursor: pointer;
    background: var(--k-paper); box-shadow: 0 4px 0 var(--k-shadow); touch-action: manipulation; perspective: 600px;
  }
  .card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; backface-visibility: hidden; transition: transform .3s ease; }
  .card .face { transform: rotateY(180deg); }
  .card.up .face { transform: rotateY(0); }
  .card.up .back { transform: rotateY(-180deg); }
  .card.matched { box-shadow: 0 0 0 4px var(--k-green), 0 4px 0 var(--k-shadow); cursor: default; }
  .card:focus-visible { outline: 4px solid var(--k-green); outline-offset: 3px; }
  .turns { text-align: center; color: var(--k-muted); font-weight: 800; margin: 12px 0 0; }
`;

const TURN_BACK_MS = 900;

export class KidsPairs extends KidsGame {
    #up = [];
    #turns = 0;
    #matched = 0;
    #pairs = 0;
    #busy = false;

    render() {
        const pairs = this.band === "lions" ? 6 : 4;
        const animals = shuffle(this.config.cards).slice(0, pairs);
        const deck = shuffle([...animals, ...animals].map((card, i) => ({ ...card, key: i })));
        this.#up = [];
        this.#turns = 0;
        this.#matched = 0;
        this.#pairs = animals.length;
        this.#busy = false;
        this.shadowRoot.innerHTML = `
          <style>${STYLES}</style>
          <p class="prompt">Find the pairs! Turn over two cards.</p>
          <div class="grid">
            ${deck.map((card, i) => `
              <button class="card" type="button" data-id="${escapeHtml(card.id)}" data-i="${i}" aria-label="Card ${i + 1}, face down">
                <img class="back" src="${escapeHtml(this.url(this.config.back))}" alt="" draggable="false" />
                <img class="face" src="${escapeHtml(this.url(card.image))}" alt="" draggable="false" />
              </button>`).join("")}
          </div>
          <p class="turns" aria-live="polite">Turns: <span class="n">0</span></p>
          <p class="feedback" aria-live="polite"></p>
          <div class="actions"><button class="btn quiet" type="button" data-again>Shuffle and play again</button></div>`;
        this.shadowRoot.querySelector(".grid").addEventListener("click", (event) => {
            const card = event.target.closest(".card");
            if (card) {
                this.#flip(card, deck[Number(card.dataset.i)]);
            }
        });
        this.shadowRoot.querySelector("[data-again]").addEventListener("click", () => this.render());
        this.say("pairs-intro");
    }

    #flip(card, info) {
        if (this.#busy || card.classList.contains("up") || card.classList.contains("matched")) {
            return;
        }
        card.classList.add("up");
        card.setAttribute("aria-label", info.name);
        this.sfx("card-flip");
        this.#up.push({ card, info });
        if (this.#up.length < 2) {
            return;
        }
        this.#turns += 1;
        this.shadowRoot.querySelector(".n").textContent = String(this.#turns);
        const [a, b] = this.#up;
        this.#up = [];
        const feedback = this.shadowRoot.querySelector(".feedback");
        if (a.info.id === b.info.id) {
            for (const c of [a.card, b.card]) {
                c.classList.add("matched");
                c.setAttribute("aria-label", `${c.getAttribute("aria-label")}, matched`);
            }
            this.#matched += 1;
            this.sfx("card-match");
            feedback.className = "feedback good";
            // No plurals ("two sheep", "two oxen"): the name and "a pair" read right for every animal.
            feedback.textContent = `${a.info.name}: a pair!`;
            if (this.#matched === this.#pairs) {
                feedback.textContent = "You found every pair!";
                this.sfx("celebrate");
                this.mood("cheer");
                this.say("pairs-match");
                this.done({ turns: this.#turns });
            } else if (this.#matched === 1) {
                this.say("pairs-match");
            }
            return;
        }
        this.#busy = true;
        feedback.className = "feedback";
        feedback.textContent = "";
        setTimeout(() => {
            for (const c of [a.card, b.card]) {
                c.classList.remove("up");
                c.setAttribute("aria-label", `Card ${Number(c.dataset.i) + 1}, face down`);
            }
            this.#busy = false;
        }, TURN_BACK_MS);
    }
}

if (!customElements.get("kids-pairs")) {
    customElements.define("kids-pairs", KidsPairs);
}
