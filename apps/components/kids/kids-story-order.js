/**
 * <kids-story-order> — Story in Order: tap the story's pictures in order.
 *
 * The pictures are shuffled (never already in order); the slots above fill
 * from the left as the child taps the right picture next. A wrong picture
 * shakes, with "Not yet! What happened just before that?"; after two wrong
 * tries for the same slot, the right picture glows. Tapping, not dragging, so
 * the youngest can do it and it works with the keyboard.
 *
 * config (see kids-common.js for the shared keys):
 *   panels   [{ image, text }]   the story's panels, in order
 *   odd      { image, text }     optional (Explorers): a page from another
 *                                story, mixed in; tapping it leaves it out
 *   aspect   "9/16"              optional: the pictures' shape (default square)
 * The youngest (lambs) get three: the first, a middle one and the last; the
 * older children (lions) get all six.
 * Fires kids-done { game, tries } when the story is in order (and the odd
 * page, if any, left out). For Explorers, the right picture glows only after
 * the third wrong try.
 */

import { BASE_STYLES, KidsGame, escapeHtml, shuffle } from "./kids-common.js?v=20261024-2";

const STYLES = /* css */ `
  ${BASE_STYLES}
  .slots { display: grid; gap: 8px; margin-bottom: 16px; }
  .slot {
    position: relative; aspect-ratio: 1; border-radius: 14px; border: 3px dashed var(--k-gold);
    background: rgb(255 255 255 / 60%); display: grid; place-items: center; overflow: hidden;
    font: 800 1.6rem var(--kids-display, "Baloo 2", system-ui, sans-serif); color: var(--k-gold-dark);
  }
  .slot.filled { border: 3px solid var(--k-green); animation: kids-pop .35s ease both; }
  .slot img { width: 100%; height: 100%; object-fit: cover; }
  .tiles { display: grid; gap: 10px; }
  .tile {
    position: relative; padding: 0; border: 4px solid var(--k-paper); border-radius: 16px; overflow: hidden;
    aspect-ratio: 1; background: #eee; cursor: pointer; box-shadow: 0 4px 0 var(--k-shadow); touch-action: manipulation;
  }
  .tile img { display: block; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
  .tile.used { visibility: hidden; }
  .tile.glow { animation: kids-pulse 1.1s ease infinite; border-color: var(--k-gold); }
  .n { position: absolute; left: 6px; top: 6px; min-width: 26px; height: 26px; border-radius: 13px; background: var(--k-green); color: #fff; font-weight: 900; display: grid; place-items: center; font-size: .9rem; }
  .slot, .tile { aspect-ratio: var(--shape, 1); }
  .tile.odd-out { visibility: hidden; }
`;

export class KidsStoryOrder extends KidsGame {
    #order = [];     // the panel indexes to place, in story order
    #placed = 0;
    #wrong = 0;      // wrong tries for the current slot
    #tries = 0;
    #oddOut = true;  // the page from another story has been left out (or there is none)

    panelsToUse() {
        const panels = this.config?.panels ?? [];
        if (this.band === "lions" || panels.length <= 3) {
            return panels.map((_, i) => i);
        }
        return [0, Math.floor((panels.length - 1) / 2), panels.length - 1];
    }

    render() {
        const panels = this.config.panels;
        this.#order = this.panelsToUse();
        this.#placed = 0;
        this.#wrong = 0;
        this.#tries = 0;
        const odd = this.config.odd ?? null;
        this.#oddOut = !odd;
        // The odd page, if any, is mixed in as panel -1.
        const shown = shuffle(odd ? [...this.#order, -1] : this.#order);
        const picture = (p) => (p < 0 ? odd : panels[p]);
        // Three across: one row for the youngest, two rows of three for six;
        // four across for the Explorers' seven pages.
        const columns = shown.length > 6 ? 4 : 3;
        this.style.setProperty("--shape", this.config.aspect ?? "1");
        this.shadowRoot.innerHTML = `
          <style>${STYLES}</style>
          <p class="prompt">${odd ? "Tap the pages in order. One page is from a different story: tap it to leave it out." : "What happened first? Tap the pictures in order."}</p>
          <div class="slots" style="grid-template-columns: repeat(${this.#order.length}, minmax(0, 1fr))">
            ${this.#order.map((_, n) => `<div class="slot" data-slot="${n}" aria-label="Place ${n + 1}">${n + 1}</div>`).join("")}
          </div>
          <div class="tiles" style="grid-template-columns: repeat(${columns}, minmax(0, 1fr))">
            ${shown.map((p) => `
              <button class="tile" type="button" data-panel="${p}" aria-label="${escapeHtml(picture(p).text)}">
                <img src="${escapeHtml(this.url(picture(p).image))}" alt="" draggable="false" />
              </button>`).join("")}
          </div>
          <p class="feedback" aria-live="polite"></p>
          <div class="actions"><button class="btn quiet" type="button" data-again>Start again</button></div>`;
        this.shadowRoot.querySelector(".tiles").addEventListener("click", (event) => {
            const tile = event.target.closest(".tile");
            if (tile && !tile.classList.contains("used")) {
                this.#choose(tile);
            }
        });
        this.shadowRoot.querySelector("[data-again]").addEventListener("click", () => this.render());
        this.say("order-intro");
    }

    /** The page from another story, tapped: it is left out. */
    #leaveOut(tile) {
        const feedback = this.shadowRoot.querySelector(".feedback");
        this.#oddOut = true;
        tile.classList.remove("glow");
        tile.classList.add("odd-out");
        tile.disabled = true;
        feedback.className = "feedback good";
        feedback.textContent = "Well spotted! That page is from a different story.";
        this.sfx("sparkle");
        this.say("order-odd");
        this.#finishIfDone();
    }

    #finishIfDone() {
        if (this.#placed < this.#order.length) {
            return;
        }
        const feedback = this.shadowRoot.querySelector(".feedback");
        if (!this.#oddOut) {
            // Every page is in its place: only the odd one is left to tap.
            feedback.className = "feedback hint";
            feedback.textContent = "One page is left. It's from a different story: tap it to leave it out.";
            this.shadowRoot.querySelector('.tile[data-panel="-1"]')?.classList.add("glow");
            return;
        }
        feedback.className = "feedback good";
        feedback.textContent = "You put the whole story in order!";
        this.shadowRoot.querySelector(".tiles").hidden = true;
        this.sfx("right");
        this.mood("cheer");
        this.say("order-right");
        this.done({ tries: this.#tries });
    }

    #choose(tile) {
        if (this.#placed >= this.#order.length && this.#oddOut) {
            return;
        }
        const panel = Number(tile.dataset.panel);
        const feedback = this.shadowRoot.querySelector(".feedback");
        if (panel < 0) {
            this.#leaveOut(tile);
            return;
        }
        this.#tries += 1;
        if (panel !== this.#order[this.#placed]) {
            this.#wrong += 1;
            tile.classList.remove("shake");
            void tile.offsetWidth;
            tile.classList.add("shake");
            feedback.className = "feedback hint";
            feedback.textContent = "Not yet! What happened just before that?";
            this.sfx("try-again");
            this.mood("think");
            // Explorers get no glow until the third wrong try.
            if (this.#wrong >= (this.config.explorer ? 3 : 2)) {
                this.shadowRoot.querySelector(`.tile[data-panel="${this.#order[this.#placed]}"]`)?.classList.add("glow");
                this.say("order-hint");
            } else {
                this.sayOneOf("try-");
            }
            return;
        }
        this.#wrong = 0;
        tile.classList.remove("glow");
        tile.classList.add("used");
        tile.disabled = true;
        const slot = this.shadowRoot.querySelector(`[data-slot="${this.#placed}"]`);
        slot.classList.add("filled");
        slot.innerHTML = `<img src="${escapeHtml(this.url(this.config.panels[panel].image))}" alt="" /><span class="n">${this.#placed + 1}</span>`;
        this.#placed += 1;
        feedback.className = "feedback good";
        this.sfx("drop");
        if (this.#placed === this.#order.length) {
            this.#finishIfDone();
        } else {
            feedback.textContent = "Yes! What happened next?";
        }
    }
}

if (!customElements.get("kids-story-order")) {
    customElements.define("kids-story-order", KidsStoryOrder);
}
