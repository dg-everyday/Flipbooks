/**
 * <kids-gather> — Gather & Count: catch the falling things in the basket,
 * counting as they go.
 *
 * Things fall slowly from the top. The child catches them by moving the basket
 * under them (drag, or the arrow keys) or simply by tapping a falling thing,
 * which is easier for the youngest. Each catch is counted aloud. The older
 * children (lions) also see other things fall: catching one of those just says
 * "That's not a …" and counts nothing. Nothing is lost by missing; more keep
 * coming until the count is reached. Play pauses while the page is hidden.
 *
 * config (see kids-common.js for the shared keys):
 *   game    { item, name, plural, image, basket, otherImages, lambs, lions }
 *   count   the counting clips, one to twelve
 * Fires kids-done { game, caught } when the count is reached.
 */

import { BASE_STYLES, KidsGame, escapeHtml } from "./kids-common.js?v=20261024-2";

const STYLES = /* css */ `
  ${BASE_STYLES}
  .field {
    position: relative; width: 100%; aspect-ratio: 3 / 4; max-height: 62vh; margin: 0 auto; overflow: hidden;
    border-radius: 24px; background: linear-gradient(#cfeaf8, #f4eacb 70%, #d9c79a); touch-action: none; user-select: none;
  }
  .thing {
    position: absolute; top: 0; width: 18%; aspect-ratio: 1; padding: 0; border: 0; background: none; cursor: pointer;
    transform: translate(-50%, -50%); touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  }
  .thing img { width: 100%; height: 100%; object-fit: contain; pointer-events: none; filter: drop-shadow(0 4px 4px rgb(0 0 0 / 25%)); }
  .thing.caught { transition: transform .25s ease, opacity .25s ease; opacity: 0; transform: translate(-50%, -50%) scale(.4); }
  .basket { position: absolute; bottom: 2%; width: 30%; transform: translateX(-50%); pointer-events: none; }
  .basket img { width: 100%; display: block; }
  .tally { display: flex; justify-content: center; align-items: center; gap: 12px; margin: 12px 0 0; font-weight: 900; font-size: 1.3rem; }
  .tally img { width: 40px; height: 40px; object-fit: contain; }
  .start { position: absolute; inset: 0; display: grid; place-items: center; background: rgb(255 255 255 / 55%); }
`;

const LIONS_OTHER_CHANCE = 0.3;

export class KidsGather extends KidsGame {
    #caught = 0;
    #things = new Map();   // button -> { x, y, speed, good }
    #basketX = 50;
    #frame = 0;
    #spawnTimer = 0;
    #last = 0;
    #running = false;
    #finished = false;
    #onVisible = () => {
        if (document.hidden) {
            this.#pause();
        } else if (this.#started && !this.#finished) {
            this.#resume();
        }
    };
    #started = false;

    get target() {
        const g = this.config.game;
        return Math.max(1, Math.min(12, this.band === "lions" ? g.lions : g.lambs));
    }

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener("visibilitychange", this.#onVisible);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener("visibilitychange", this.#onVisible);
        this.#pause();
    }

    render() {
        this.#pause();
        this.#caught = 0;
        this.#things.clear();
        this.#finished = false;
        this.#started = false;
        this.#basketX = 50;
        const g = this.config.game;
        this.shadowRoot.innerHTML = `
          <style>${STYLES}</style>
          <p class="prompt">Catch ${this.target} ${escapeHtml(this.target === 1 ? g.name : g.plural)} in the basket!</p>
          <div class="field" tabindex="0" aria-label="Move the basket with the arrow keys, or tap a falling ${escapeHtml(g.name)}">
            <div class="basket"><img src="${escapeHtml(this.url(g.basket))}" alt="" /></div>
            <div class="start"><button class="btn" type="button" data-start>Start</button></div>
          </div>
          <p class="tally" aria-live="polite"><img src="${escapeHtml(this.url(g.image))}" alt="" /><span class="n">0</span> of ${this.target}</p>
          <p class="feedback" aria-live="polite"></p>`;
        const field = this.shadowRoot.querySelector(".field");
        this.#placeBasket();
        this.shadowRoot.querySelector("[data-start]").addEventListener("click", () => this.#start());
        // The basket follows a finger dragging across the field, or the mouse.
        field.addEventListener("pointermove", (event) => {
            const box = field.getBoundingClientRect();
            this.#basketX = Math.max(10, Math.min(90, ((event.clientX - box.left) / box.width) * 100));
            this.#placeBasket();
        });
        field.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault();
                this.#basketX = Math.max(10, Math.min(90, this.#basketX + (event.key === "ArrowLeft" ? -8 : 8)));
                this.#placeBasket();
            }
        });
        field.addEventListener("click", (event) => {
            const thing = event.target.closest(".thing");
            if (thing && this.#things.has(thing)) {
                this.#catch(thing);
            }
        });
        this.say("gather-intro");
    }

    #placeBasket() {
        const basket = this.shadowRoot.querySelector(".basket");
        if (basket) {
            basket.style.left = `${this.#basketX}%`;
        }
    }

    #start() {
        this.#started = true;
        this.shadowRoot.querySelector(".start")?.remove();
        this.#resume();
    }

    #resume() {
        if (this.#running || this.#finished) {
            return;
        }
        this.#running = true;
        this.#last = performance.now();
        this.#spawn();
        this.#frame = requestAnimationFrame((t) => this.#tick(t));
    }

    #pause() {
        this.#running = false;
        cancelAnimationFrame(this.#frame);
        clearTimeout(this.#spawnTimer);
    }

    get #slow() {
        return this.hasAttribute("less-motion") || matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    #spawn() {
        if (!this.#running) {
            return;
        }
        const field = this.shadowRoot.querySelector(".field");
        const g = this.config.game;
        if (field && this.#things.size < 4) {
            const other = this.band === "lions" && g.otherImages?.length && Math.random() < LIONS_OTHER_CHANCE;
            const src = other ? g.otherImages[Math.floor(Math.random() * g.otherImages.length)] : g.image;
            const button = document.createElement("button");
            button.type = "button";
            button.className = "thing";
            button.setAttribute("aria-label", other ? "Something else" : g.name);
            button.innerHTML = `<img src="${escapeHtml(this.url(src))}" alt="" draggable="false" />`;
            const x = 12 + Math.random() * 76;
            button.style.left = `${x}%`;
            button.style.top = "-8%";
            field.append(button);
            // Percent of the field's height per second.
            const seconds = (this.band === "lions" ? 5.5 : 7) * (this.#slow ? 1.5 : 1);
            this.#things.set(button, { x, y: -8, speed: 108 / seconds, good: !other });
        }
        const every = (this.band === "lions" ? 1300 : 1700) * (this.#slow ? 1.4 : 1);
        this.#spawnTimer = setTimeout(() => this.#spawn(), every);
    }

    #tick(now) {
        if (!this.#running) {
            return;
        }
        const dt = Math.min(0.1, (now - this.#last) / 1000);
        this.#last = now;
        for (const [button, t] of this.#things) {
            t.y += t.speed * dt;
            button.style.top = `${t.y}%`;
            // Into the basket: near the bottom and over it.
            if (t.y >= 86 && t.y <= 96 && Math.abs(t.x - this.#basketX) <= 15) {
                this.#catch(button);
            } else if (t.y > 104) {
                this.#things.delete(button);
                button.remove();
            }
        }
        this.#frame = requestAnimationFrame((t) => this.#tick(t));
    }

    #catch(button) {
        const t = this.#things.get(button);
        if (!t || this.#finished) {
            return;
        }
        this.#things.delete(button);
        button.classList.add("caught");
        button.disabled = true;
        setTimeout(() => button.remove(), 260);
        const feedback = this.shadowRoot.querySelector(".feedback");
        if (!t.good) {
            feedback.className = "feedback hint";
            feedback.textContent = `That's not a ${this.config.game.name}!`;
            this.sfx("try-again");
            return;
        }
        this.#caught += 1;
        this.shadowRoot.querySelector(".n").textContent = String(this.#caught);
        feedback.className = "feedback good";
        feedback.textContent = "";
        this.sfx("catch");
        this.say(this.config.count?.[this.#caught - 1]);
        if (this.#caught >= this.target) {
            this.#finished = true;
            this.#pause();
            for (const b of this.#things.keys()) {
                b.remove();
            }
            this.#things.clear();
            feedback.textContent = `You caught ${this.#caught}!`;
            this.sfx("celebrate");
            this.mood("cheer");
            setTimeout(() => this.say("gather-done"), 700);
            this.done({ caught: this.#caught });
        }
    }
}

if (!customElements.get("kids-gather")) {
    customElements.define("kids-gather", KidsGather);
}
