/**
 * <kids-book-train> — the Bible Book Train (Explorers, ages 9 to 12): the 66
 * books of the Bible in their order, as a train.
 *
 *   1 Couple the carriages: the ten parts of the Bible (the Law, History,
 *     Poetry and Wisdom … Prophecy), each a carriage of its own colour, joined
 *     behind the engine in order, from Genesis to Revelation.
 *   2 Load a carriage: one part's books, tapped in order (a different part
 *     each time the train is built).
 * A wrong carriage or book shakes; after two wrong tries the next one glows.
 *
 * config (see kids-common.js for the shared keys):
 *   engine   the engine picture
 *   groups   [{ id, name, car, books: [name, …] }]  in Bible order
 * Fires kids-done { game, tries } once the carriage is loaded.
 */

import { BASE_STYLES, KidsGame, escapeHtml, shuffle } from "./kids-common.js?v=20261024-2";

const STYLES = /* css */ `
  ${BASE_STYLES}
  .track { display: flex; align-items: flex-end; gap: 2px; min-height: 96px; padding: 8px 8px 14px; overflow-x: auto;
    border-radius: 18px; background: linear-gradient(transparent 82%, #a07850 82% 86%, transparent 86%), rgb(255 255 255 / 55%); scroll-behavior: smooth; }
  .track img { flex: none; height: 76px; width: auto; animation: kids-pop .35s ease both; }
  .track .engine { animation: none; height: 88px; }
  .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin-top: 14px; }
  .car { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px; border: 3px solid var(--k-paper); border-radius: 16px;
    background: var(--k-paper); box-shadow: 0 4px 0 var(--k-shadow); cursor: pointer; touch-action: manipulation; text-align: center; }
  .car img { height: 58px; width: auto; pointer-events: none; }
  .car b { font-size: .95rem; }
  .car span { font-size: .8rem; color: var(--k-muted); }
  .car.used, .book.used { visibility: hidden; }
  .car.glow, .book.glow { animation: kids-pulse 1.1s ease infinite; border-color: var(--k-gold); }
  .loaded { display: flex; flex-wrap: wrap; gap: 6px; min-height: 44px; margin-top: 12px; padding: 8px; border-radius: 14px; background: rgb(255 255 255 / 60%); }
  .loaded span { padding: 6px 10px; border-radius: 10px; background: #e8f4ec; font-weight: 800; animation: kids-pop .3s ease both; }
  .books { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .book { min-height: 48px; padding: 6px 14px; border: 3px solid var(--k-paper); border-radius: 12px; background: #fff6df;
    box-shadow: 0 3px 0 var(--k-shadow); font-weight: 800; cursor: pointer; }
`;

const range = (g) => (g.books.length === 1 ? g.books[0] : `${g.books[0]} – ${g.books[g.books.length - 1]}`);

export class KidsBookTrain extends KidsGame {
    #placed = 0;
    #wrong = 0;
    #tries = 0;
    #group = null;

    render() {
        this.#placed = 0;
        this.#wrong = 0;
        this.#tries = 0;
        const groups = this.config.groups;
        this.shadowRoot.innerHTML = `
          <style>${STYLES}</style>
          <p class="prompt">Join the carriages in order, from Genesis to Revelation.</p>
          <div class="track" aria-label="The train"><img class="engine" src="${escapeHtml(this.url(this.config.engine))}" alt="The engine" /></div>
          <div class="tiles">
            ${shuffle(groups.map((_, i) => i)).map((i) => `<button class="car" type="button" data-group="${i}">
              <img src="${escapeHtml(this.url(groups[i].car))}" alt="" />
              <b>${escapeHtml(groups[i].name)}</b><span>${escapeHtml(range(groups[i]))}</span></button>`).join("")}
          </div>
          <p class="feedback" aria-live="polite"></p>`;
        this.shadowRoot.querySelector(".tiles").addEventListener("click", (event) => {
            const car = event.target.closest(".car");
            if (car && !car.classList.contains("used")) {
                this.#couple(car);
            }
        });
        this.say("book-train-intro");
        this.sfx("train-toot");
    }

    #wrongTry(button, nextSelector) {
        this.#wrong += 1;
        button.classList.remove("shake");
        void button.offsetWidth;
        button.classList.add("shake");
        const feedback = this.shadowRoot.querySelector(".feedback");
        feedback.className = "feedback hint";
        feedback.textContent = "Not that one yet. What comes next?";
        this.sfx("try-again");
        this.mood("think");
        if (this.#wrong >= 2) {
            this.shadowRoot.querySelector(nextSelector)?.classList.add("glow");
        }
    }

    #couple(button) {
        const groups = this.config.groups;
        const index = Number(button.dataset.group);
        this.#tries += 1;
        if (index !== this.#placed) {
            this.#wrongTry(button, `.car[data-group="${this.#placed}"]`);
            return;
        }
        this.#wrong = 0;
        button.classList.remove("glow");
        button.classList.add("used");
        const track = this.shadowRoot.querySelector(".track");
        const img = document.createElement("img");
        img.src = this.url(groups[index].car);
        img.alt = groups[index].name;
        track.append(img);
        track.scrollLeft = track.scrollWidth;
        this.#placed += 1;
        this.sfx("train-link");
        const feedback = this.shadowRoot.querySelector(".feedback");
        feedback.className = "feedback good";
        feedback.textContent = `${groups[index].name}: ${range(groups[index])}.`;
        if (this.#placed === groups.length) {
            this.sfx("train-toot");
            this.mood("cheer");
            setTimeout(() => this.#load(), 900);
        }
    }

    /** Round 2: one carriage's books, in order. */
    #load() {
        if (!this.isConnected) {
            return;
        }
        const big = this.config.groups.filter((g) => g.books.length >= 4);
        this.#group = big[Math.floor(Math.random() * big.length)];
        this.#placed = 0;
        this.#wrong = 0;
        const g = this.#group;
        this.shadowRoot.querySelector(".prompt").textContent = `Now load the ${g.name} carriage: tap its books in order.`;
        const tiles = this.shadowRoot.querySelector(".tiles");
        tiles.outerHTML = `
          <div class="loaded" aria-live="polite" aria-label="Loaded so far"></div>
          <div class="books">${shuffle(g.books.map((_, i) => i)).map((i) => `<button class="book" type="button" data-book="${i}">${escapeHtml(g.books[i])}</button>`).join("")}</div>`;
        const feedback = this.shadowRoot.querySelector(".feedback");
        feedback.className = "feedback";
        feedback.textContent = `${g.books.length} books, from ${g.books[0]} to ${g.books[g.books.length - 1]}.`;
        this.shadowRoot.querySelector(".books").addEventListener("click", (event) => {
            const book = event.target.closest(".book");
            if (book && !book.classList.contains("used")) {
                this.#loadBook(book);
            }
        });
    }

    #loadBook(button) {
        const g = this.#group;
        const index = Number(button.dataset.book);
        this.#tries += 1;
        if (index !== this.#placed) {
            this.#wrongTry(button, `.book[data-book="${this.#placed}"]`);
            return;
        }
        this.#wrong = 0;
        button.classList.remove("glow");
        button.classList.add("used");
        const chip = document.createElement("span");
        chip.textContent = g.books[index];
        this.shadowRoot.querySelector(".loaded").append(chip);
        this.#placed += 1;
        this.sfx("drop");
        if (this.#placed === g.books.length) {
            const feedback = this.shadowRoot.querySelector(".feedback");
            feedback.className = "feedback good";
            feedback.textContent = "All aboard! The Bible Book Train is ready.";
            this.shadowRoot.querySelector(".books").hidden = true;
            this.sfx("celebrate");
            this.mood("cheer");
            this.done({ tries: this.#tries });
        }
    }
}

if (!customElements.get("kids-book-train")) {
    customElements.define("kids-book-train", KidsBookTrain);
}
