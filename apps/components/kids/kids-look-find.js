/**
 * <kids-look-find> — Look & Find: find the things in a big scene.
 *
 * Each thing has one or more tap spots (an item that appears more than once,
 * such as "a deer", can be found at any of them). The spots are real buttons
 * laid over the picture, at least 44 px across, so fingers, a mouse, the
 * keyboard and screen readers can all find them. A tap on the picture away from
 * any spot shows a small ring and nothing else. The checklist below names each
 * thing; tapping a name hears "Can you find …?". After a while without a find,
 * Nari gives a hint and the nearest thing still hidden glows for a moment.
 *
 * config (see kids-common.js for the shared keys):
 *   image   the scene ("media:…"), square
 *   items   [{ label, spots: [[x, y, r], …], audio }]   fractions of the picture
 *   count   how many to find (the first `count` items); default all
 * Fires kids-done { game, found } when they are all found.
 */

import { BASE_STYLES, KidsGame, escapeHtml } from "./kids-common.js?v=20261024-2";

const HINT_AFTER_MS = 25_000;
const MIN_SPOT_PX = 44;

const STYLES = /* css */ `
  ${BASE_STYLES}
  /* With "fit", the page gives the game a height, and the scene takes what the
     prompt, count and checklist leave, square, following every resize. */
  :host([fit]) { display: flex; flex-direction: column; }
  :host([fit]) .stage { flex: 1 1 0; min-height: 200px; display: grid; place-items: end center; container-type: size; }
  :host([fit]) .scene { width: min(100cqw, 100cqh); }
  :host([fit]) .list { flex: none; }
  .scene { position: relative; width: min(100%, 68dvh); margin: 0 auto; aspect-ratio: 1; border-radius: 22px; overflow: hidden; background: #e9dcc4; touch-action: manipulation; user-select: none; -webkit-user-select: none; }
  .scene img { position: relative; display: block; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
  .loading { position: absolute; inset: 0; margin: 0; display: grid; place-items: center; padding: 20px; text-align: center; font-weight: 800; color: var(--k-muted); }
  .scene:not(.ready) .spot { pointer-events: none; }
  .scene.ready .loading { display: none; }
  .spot {
    position: absolute; transform: translate(-50%, -50%);
    border: 0; padding: 0; border-radius: 50%; background: transparent; cursor: default;
    -webkit-tap-highlight-color: transparent;
  }
  .spot:focus-visible { outline: 4px dashed rgb(255 255 255 / 90%); outline-offset: 2px; }
  .spot.found { pointer-events: none; }
  /* The ring and the miss mark are centred with translate, not transform:
     their pop animation sets transform, and would otherwise undo the
     centring and leave them down and to the right of the tap. */
  .ring {
    position: absolute; translate: -50% -50%; border-radius: 50%; pointer-events: none;
    border: 5px solid var(--k-gold); box-shadow: 0 0 0 3px rgb(255 255 255 / 85%), 0 4px 10px rgb(0 0 0 / 30%);
    animation: kids-pop .45s ease both;
  }
  .ring::after {
    content: "✓"; position: absolute; right: -6px; top: -6px; width: 26px; height: 26px; border-radius: 50%;
    display: grid; place-items: center; background: var(--k-green); color: #fff; font-weight: 900; font-size: 15px;
  }
  .miss { position: absolute; width: 36px; height: 36px; translate: -50% -50%; border-radius: 50%; border: 3px solid rgb(255 255 255 / 80%); pointer-events: none; animation: kids-pop .4s ease both; }
  .glow { position: absolute; transform: translate(-50%, -50%); border-radius: 50%; pointer-events: none; animation: kids-pulse 1.2s ease 3; }
  .list { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; margin: 14px 0 0; padding: 0; list-style: none; }
  .list button {
    display: flex; align-items: center; gap: 8px; width: 100%; min-height: 48px; padding: 6px 12px;
    border: 2px solid var(--k-shadow); border-radius: 16px; background: var(--k-paper); text-align: left;
    font-weight: 700; font-size: 1rem; cursor: pointer;
  }
  .list button[aria-pressed="true"] { border-color: var(--k-green); background: #e2f3e8; }
  .tick { flex: none; width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--k-shadow); display: grid; place-items: center; color: #fff; font-size: 14px; font-weight: 900; }
  [aria-pressed="true"] .tick { background: var(--k-green); border-color: var(--k-green); }
  .count { text-align: center; font-weight: 800; margin: 10px 0 0; color: var(--k-muted); }
`;

export class KidsLookFind extends KidsGame {
    #found = new Set();
    #hintTimer = 0;
    #finished = false;

    disconnectedCallback() {
        super.disconnectedCallback();
        clearTimeout(this.#hintTimer);
    }

    get items() {
        const all = this.config?.items ?? [];
        const count = Math.max(1, Math.min(all.length, this.config?.count ?? all.length));
        return all.slice(0, count);
    }

    render() {
        this.#found = new Set();
        this.#finished = false;
        const items = this.items;
        const spots = items.flatMap((item, i) => item.spots.map((spot) => ({ i, spot })));
        this.shadowRoot.innerHTML = `
          <style>${STYLES}</style>
          <p class="prompt" id="prompt">Can you find them all?</p>
          <div class="stage">
            <div class="scene" part="scene">
              <p class="loading">Getting the picture ready…</p>
              <img src="${escapeHtml(this.url(this.config.image))}" alt="" draggable="false" />
              ${spots.map(({ i, spot }) => `
                <button class="spot" type="button" data-i="${i}" aria-label="${escapeHtml(items[i].label)}"
                  style="left:${spot[0] * 100}%;top:${spot[1] * 100}%;width:max(${MIN_SPOT_PX}px, ${spot[2] * 200}%);aspect-ratio:1"></button>`).join("")}
            </div>
          </div>
          <p class="count" aria-live="polite"><span class="n">0</span> of ${items.length} found</p>
          <ul class="list">
            ${items.map((item, i) => `
              <li><button type="button" data-say="${i}" aria-pressed="false">
                <span class="tick" aria-hidden="true">✓</span><span>${escapeHtml(item.label)}</span>
              </button></li>`).join("")}
          </ul>`;
        const scene = this.shadowRoot.querySelector(".scene");
        // Taps count once the picture is there (a slow connection shows "Getting the picture ready…").
        const img = scene.querySelector("img");
        const ready = () => scene.classList.add("ready");
        if (img.complete && img.naturalWidth) {
            ready();
        } else {
            img.addEventListener("load", ready, { once: true });
            img.addEventListener("error", () => {
                scene.querySelector(".loading").textContent = "The picture can't be shown right now. Tap the names below to hear them.";
            }, { once: true });
        }
        scene.addEventListener("click", (event) => {
            const spot = event.target.closest(".spot");
            if (spot) {
                this.#find(Number(spot.dataset.i), spot, event);
            } else {
                this.#miss(event, scene);
            }
        });
        this.shadowRoot.querySelector(".list").addEventListener("click", (event) => {
            const button = event.target.closest("[data-say]");
            if (button) {
                this.say(items[Number(button.dataset.say)].audio, { force: true });
            }
        });
        this.say("step-find");
        this.#armHint();
    }

    #find(i, spotButton, event) {
        if (this.#found.has(i) || this.#finished) {
            return;
        }
        this.#found.add(i);
        const scene = this.shadowRoot.querySelector(".scene");
        for (const b of scene.querySelectorAll(`.spot[data-i="${i}"]`)) {
            b.classList.add("found");
            b.setAttribute("aria-disabled", "true");
        }
        // The ring circles the place the child tapped, which is on the thing
        // itself (a tap spot is larger than the thing and not always centred
        // on it). From the keyboard or a screen reader there is no tap: the
        // ring goes round the spot.
        const tap = this.#tapPoint(event, scene);
        const ring = document.createElement("span");
        ring.className = "ring";
        ring.style.left = tap ? `${tap.x}%` : spotButton.style.left;
        ring.style.top = tap ? `${tap.y}%` : spotButton.style.top;
        ring.style.width = spotButton.style.width;
        ring.style.aspectRatio = "1";
        scene.append(ring);
        const chip = this.shadowRoot.querySelector(`[data-say="${i}"]`);
        chip.setAttribute("aria-pressed", "true");
        this.shadowRoot.querySelector(".n").textContent = String(this.#found.size);
        this.sfx("sparkle");
        this.mood("cheer");
        this.#armHint();
        if (this.#found.size === this.items.length) {
            this.#finished = true;
            clearTimeout(this.#hintTimer);
            this.say("find-all");
            this.sfx("celebrate");
            this.done({ found: this.#found.size });
        } else {
            this.sayOneOf("find-found-");
        }
    }

    /** Where a tap or click landed, in percent of the scene; null when it wasn't one. */
    #tapPoint(event, scene) {
        // A click from the keyboard (or one a script fires) has no position.
        if (!event || event.detail === 0) {
            return null;
        }
        const box = scene.getBoundingClientRect();
        const x = ((event.clientX - box.left) / box.width) * 100;
        const y = ((event.clientY - box.top) / box.height) * 100;
        if (!(x >= 0 && x <= 100 && y >= 0 && y <= 100)) {
            return null;
        }
        return { x, y };
    }

    #miss(event, scene) {
        const box = scene.getBoundingClientRect();
        const ring = document.createElement("span");
        ring.className = "miss";
        ring.style.left = `${((event.clientX - box.left) / box.width) * 100}%`;
        ring.style.top = `${((event.clientY - box.top) / box.height) * 100}%`;
        scene.append(ring);
        setTimeout(() => ring.remove(), 450);
    }

    #armHint() {
        clearTimeout(this.#hintTimer);
        this.#hintTimer = setTimeout(() => this.#hint(), HINT_AFTER_MS);
    }

    #hint() {
        if (this.#finished || !this.isConnected) {
            return;
        }
        const items = this.items;
        const next = items.findIndex((_, i) => !this.#found.has(i));
        if (next < 0) {
            return;
        }
        const [x, y, r] = items[next].spots[0];
        const glow = document.createElement("span");
        glow.className = "glow";
        glow.style.left = `${x * 100}%`;
        glow.style.top = `${y * 100}%`;
        glow.style.width = `max(${MIN_SPOT_PX}px, ${r * 200}%)`;
        glow.style.aspectRatio = "1";
        this.shadowRoot.querySelector(".scene").append(glow);
        setTimeout(() => glow.remove(), 3800);
        this.mood("think");
        this.say("find-hint");
        this.#armHint();
    }

    /** For the page: how many have been found. */
    get foundCount() {
        return this.#found.size;
    }
}

if (!customElements.get("kids-look-find")) {
    customElements.define("kids-look-find", KidsLookFind);
}
