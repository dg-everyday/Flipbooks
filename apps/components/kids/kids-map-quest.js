/**
 * <kids-map-quest> — Map Quest (Explorers, ages 9 to 12): put the places of
 * the stories on a picture map of the Bible lands.
 *
 * Choose a place from the list, then tap where it belongs on the map. Near
 * enough, and a pin goes in with its name; not near enough, and the child is
 * told to try again; after two misses for the same place its area glows. The
 * map has no names on it: the app adds them as pins.
 *
 * config (see kids-common.js for the shared keys):
 *   image    the map (kids/explorers/games/bible-lands-map.webp)
 *   ratio    the map's height over its width (16 / 9)
 *   places   [{ card, name, x, y, r }]  x, y fractions of the map, r of its width
 *   pinned   [card, …]  places already pinned on an earlier visit
 * Fires kids-pin { card } for each place pinned, and kids-done { game } when
 * every place is on the map.
 */

import { BASE_STYLES, KidsGame, escapeHtml } from "./kids-common.js?v=20261024-2";

const STYLES = /* css */ `
  ${BASE_STYLES}
  .wrap { display: grid; gap: 14px; }
  @media (min-width: 900px) { .wrap { grid-template-columns: 1fr 260px; align-items: start; } }
  .map { position: relative; width: min(100%, calc(70dvh / var(--ratio, 1.5))); margin: 0 auto; aspect-ratio: 1 / var(--ratio, 1.5); border-radius: 18px; overflow: hidden;
    background: #d9e7cf; touch-action: manipulation; user-select: none; -webkit-user-select: none; box-shadow: 0 4px 0 var(--k-shadow); }
  .map img { display: block; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
  .map.choosing { cursor: crosshair; }
  .pin { position: absolute; translate: -50% -100%; display: flex; flex-direction: column; align-items: center; pointer-events: none; animation: kids-pop .4s ease both; }
  .pin i { width: 18px; height: 18px; border-radius: 50% 50% 50% 0; rotate: -45deg; background: #e5322d; border: 3px solid #fff; box-shadow: 0 2px 4px rgb(0 0 0 / 35%); }
  .pin b { order: -1; margin-bottom: 4px; padding: 2px 8px; border-radius: 999px; background: rgb(255 255 255 / 92%); font-size: .8rem; white-space: nowrap; box-shadow: 0 1px 3px rgb(0 0 0 / 25%); }
  .miss { position: absolute; width: 30px; height: 30px; translate: -50% -50%; border-radius: 50%; border: 3px solid rgb(255 255 255 / 90%); pointer-events: none; animation: kids-pop .4s ease both; }
  .area { position: absolute; translate: -50% -50%; aspect-ratio: 1; border-radius: 50%; border: 3px dashed #fff; pointer-events: none; animation: kids-pulse 1.2s ease infinite; }
  .list { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin: 0; padding: 0; list-style: none; }
  .list button { min-height: 48px; padding: 6px 14px; border: 3px solid var(--k-paper); border-radius: 999px; background: var(--k-paper);
    box-shadow: 0 3px 0 var(--k-shadow); font-weight: 800; cursor: pointer; }
  .list button[aria-pressed="true"] { border-color: var(--k-gold); background: #fff6df; }
  .list button.done { opacity: .55; text-decoration: line-through; cursor: default; }
`;

export class KidsMapQuest extends KidsGame {
    #chosen = null;
    #pinned = new Set();
    #misses = 0;

    /** The map's height over its width. */
    get ratio() {
        const ratio = Number(this.config?.ratio);
        return ratio > 0 ? ratio : 1.5;
    }

    render() {
        const places = this.config.places ?? [];
        this.#pinned = new Set((this.config.pinned ?? []).filter((card) => places.some((p) => p.card === card)));
        this.#chosen = null;
        this.style.setProperty("--ratio", String(this.ratio));
        this.shadowRoot.innerHTML = `
          <style>${STYLES}</style>
          <p class="prompt">Choose a place, then tap where it belongs on the map.</p>
          <div class="wrap">
            <div class="map" role="img" aria-label="A map of the Bible lands">
              <img src="${escapeHtml(this.url(this.config.image))}" alt="" draggable="false" />
            </div>
            <ul class="list">
              ${places.map((p) => `<li><button type="button" data-card="${escapeHtml(p.card)}" aria-pressed="false">${escapeHtml(p.name)}</button></li>`).join("")}
            </ul>
          </div>
          <p class="feedback" aria-live="polite"></p>`;
        const root = this.shadowRoot;
        for (const card of this.#pinned) {
            this.#pin(places.find((p) => p.card === card), false);
        }
        root.querySelector(".list").addEventListener("click", (event) => {
            const b = event.target.closest("[data-card]");
            if (b && !b.classList.contains("done")) {
                this.#choose(b.dataset.card);
            }
        });
        root.querySelector(".map").addEventListener("click", (event) => this.#tap(event));
        this.say("map-quest-intro");
        this.sfx("compass");
    }

    #choose(card) {
        this.#chosen = card;
        this.#misses = 0;
        for (const b of this.shadowRoot.querySelectorAll("[data-card]")) {
            b.setAttribute("aria-pressed", String(b.dataset.card === card));
        }
        this.shadowRoot.querySelector(".map").classList.add("choosing");
        for (const area of this.shadowRoot.querySelectorAll(".area")) {
            area.remove();
        }
        const place = this.config.places.find((p) => p.card === card);
        const feedback = this.shadowRoot.querySelector(".feedback");
        feedback.className = "feedback";
        feedback.textContent = `Where is ${place.name}? Tap the map.`;
        this.sfx("tap");
    }

    #tap(event) {
        const feedback = this.shadowRoot.querySelector(".feedback");
        if (!this.#chosen) {
            feedback.className = "feedback hint";
            feedback.textContent = "First choose a place from the list.";
            return;
        }
        const map = event.currentTarget;
        const box = map.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width;
        const y = (event.clientY - box.top) / box.height;
        const place = this.config.places.find((p) => p.card === this.#chosen);
        // r is a fraction of the width, so a distance down the map counts by the map's shape.
        const near = Math.hypot(x - place.x, (y - place.y) * this.ratio) <= place.r;
        if (!near) {
            this.#misses += 1;
            const miss = document.createElement("span");
            miss.className = "miss";
            miss.style.left = `${x * 100}%`;
            miss.style.top = `${y * 100}%`;
            map.append(miss);
            setTimeout(() => miss.remove(), 450);
            feedback.className = "feedback hint";
            feedback.textContent = "Not quite there. Try again!";
            this.sfx("try-again");
            if (this.#misses === 2) {
                const area = document.createElement("span");
                area.className = "area";
                area.style.left = `${place.x * 100}%`;
                area.style.top = `${place.y * 100}%`;
                area.style.width = `${place.r * 200}%`;
                map.append(area);
            }
            return;
        }
        this.#pin(place, true);
    }

    #pin(place, fresh) {
        const map = this.shadowRoot.querySelector(".map");
        for (const area of map.querySelectorAll(".area")) {
            area.remove();
        }
        const pin = document.createElement("span");
        pin.className = "pin";
        pin.style.left = `${place.x * 100}%`;
        pin.style.top = `${place.y * 100}%`;
        pin.innerHTML = `<b>${escapeHtml(place.name)}</b><i></i>`;
        map.append(pin);
        const button = this.shadowRoot.querySelector(`[data-card="${place.card}"]`);
        button?.classList.add("done");
        button?.setAttribute("aria-pressed", "false");
        if (!fresh) {
            return;
        }
        this.#pinned.add(place.card);
        this.#chosen = null;
        map.classList.remove("choosing");
        const feedback = this.shadowRoot.querySelector(".feedback");
        feedback.className = "feedback good";
        feedback.textContent = `Yes! That's ${place.name}.`;
        this.sfx("page-stamp");
        this.mood("cheer");
        this.dispatchEvent(new CustomEvent("kids-pin", { bubbles: true, composed: true, detail: { card: place.card } }));
        if (this.#pinned.size === this.config.places.length) {
            feedback.textContent = "Every place is on the map!";
            this.sfx("celebrate");
            this.done();
        }
    }
}

if (!customElements.get("kids-map-quest")) {
    customElements.define("kids-map-quest", KidsMapQuest);
}
