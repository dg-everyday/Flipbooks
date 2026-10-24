/**
 * <kids-colour> — Colour It In: tap a space in the line drawing to fill it.
 *
 * The drawing's dark lines are the walls. When it loads, every closed space
 * between them is found once (labelled), so a tap fills its whole space at
 * once, however big. A tap on a line fills the nearest space. Undo takes back
 * the last fill; Start over clears them all. If the drawing can't be loaded or
 * read (offline, or the media host refuses), the child is told and can still
 * go on.
 *
 * config (see kids-common.js for the shared keys):
 *   image   the line drawing ("media:…"), from the media host with CORS
 * Fires kids-done { game, fills } when the child taps "I'm done".
 */

import { BASE_STYLES, KidsGame, escapeHtml } from "./kids-common.js?v=20261024-2";

const WIDTH = 768;
const LINE_LUMA = 120;          // darker than this is a line
const COLOURS = ["#e5484d", "#f5a524", "#ffd60a", "#46a758", "#2bb3a3", "#3e7bfa", "#8e4ec6", "#f17db6", "#a0522d", "#ffffff"];
const COLOUR_NAMES = ["red", "orange", "yellow", "green", "teal", "blue", "purple", "pink", "brown", "white"];

const STYLES = /* css */ `
  ${BASE_STYLES}
  .board { position: relative; width: 100%; max-width: 560px; margin: 0 auto; border-radius: 18px; overflow: hidden; background: #fff; box-shadow: 0 4px 0 var(--k-shadow); }
  canvas { display: block; width: 100%; height: auto; touch-action: manipulation; cursor: crosshair; }
  .palette { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin: 14px 0 0; }
  .swatch { width: 48px; height: 48px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 0 0 2px var(--k-shadow); cursor: pointer; }
  .swatch[aria-pressed="true"] { box-shadow: 0 0 0 4px var(--k-ink); transform: scale(1.08); }
  .swatch:focus-visible { outline: 3px solid var(--k-green); outline-offset: 3px; }
  .status { padding: 40px 20px; text-align: center; font-weight: 800; }
`;

export class KidsColour extends KidsGame {
    #canvas = null;
    #ctx = null;
    #labels = null;      // Int32Array: label of each pixel, -1 for line pixels
    #base = null;        // the original pixels
    #fills = new Map();  // label -> colour
    #history = [];
    #colour = COLOURS[0];

    render() {
        this.#fills.clear();
        this.#history = [];
        this.shadowRoot.innerHTML = `
          <style>${STYLES}</style>
          <p class="prompt">Pick a colour, then tap the picture.</p>
          <div class="board"><p class="status">Getting the picture ready…</p></div>
          <div class="palette" role="group" aria-label="Colours">
            ${COLOURS.map((c, i) => `<button class="swatch" type="button" data-colour="${c}" aria-label="${COLOUR_NAMES[i]}" aria-pressed="${i === 0}" style="background:${c}"></button>`).join("")}
          </div>
          <div class="actions">
            <button class="btn quiet" type="button" data-undo disabled>Undo</button>
            <button class="btn quiet" type="button" data-clear disabled>Start over</button>
            <button class="btn" type="button" data-done>I'm done</button>
          </div>`;
        const root = this.shadowRoot;
        root.querySelector(".palette").addEventListener("click", (event) => {
            const swatch = event.target.closest(".swatch");
            if (swatch) {
                this.#colour = swatch.dataset.colour;
                for (const s of root.querySelectorAll(".swatch")) {
                    s.setAttribute("aria-pressed", String(s === swatch));
                }
                this.sfx("tap");
            }
        });
        root.querySelector("[data-undo]").addEventListener("click", () => this.#undo());
        root.querySelector("[data-clear]").addEventListener("click", () => this.#clear());
        root.querySelector("[data-done]").addEventListener("click", () => {
            this.say("colour-done");
            this.sfx("celebrate");
            this.done({ fills: this.#history.length });
        });
        this.say("colour-intro");
        this.#load();
    }

    #load() {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        img.onload = () => {
            try {
                this.#prepare(img);
            } catch (error) {
                console.warn("The colouring page could not be read:", error);
                this.#failed();
            }
        };
        img.onerror = () => this.#failed();
        img.src = this.url(this.config.image);
    }

    #failed() {
        const board = this.shadowRoot.querySelector(".board");
        if (board) {
            board.innerHTML = `<p class="status">This picture can't be coloured right now. Please try again later.</p>`;
        }
    }

    #prepare(img) {
        const height = Math.round((img.naturalHeight / img.naturalWidth) * WIDTH) || WIDTH;
        const canvas = document.createElement("canvas");
        canvas.width = WIDTH;
        canvas.height = height;
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", "The colouring picture");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, WIDTH, height);
        ctx.drawImage(img, 0, 0, WIDTH, height);
        const data = ctx.getImageData(0, 0, WIDTH, height);   // throws if the picture isn't readable
        this.#base = new Uint8ClampedArray(data.data);
        this.#labels = label(data.data, WIDTH, height);
        this.#canvas = canvas;
        this.#ctx = ctx;
        const board = this.shadowRoot.querySelector(".board");
        board.innerHTML = "";
        board.append(canvas);
        canvas.addEventListener("click", (event) => this.#tap(event));
    }

    #tap(event) {
        const box = this.#canvas.getBoundingClientRect();
        const x = Math.floor(((event.clientX - box.left) / box.width) * this.#canvas.width);
        const y = Math.floor(((event.clientY - box.top) / box.height) * this.#canvas.height);
        const l = nearestLabel(this.#labels, this.#canvas.width, this.#canvas.height, x, y);
        if (l < 0) {
            return;
        }
        this.#history.push([l, this.#fills.get(l) ?? null]);
        this.#fills.set(l, this.#colour);
        this.#paint();
        this.sfx("paint");
    }

    #undo() {
        const last = this.#history.pop();
        if (!last) {
            return;
        }
        const [l, before] = last;
        if (before === null) {
            this.#fills.delete(l);
        } else {
            this.#fills.set(l, before);
        }
        this.#paint();
    }

    #clear() {
        this.#fills.clear();
        this.#history = [];
        this.#paint();
    }

    #paint() {
        const w = this.#canvas.width;
        const h = this.#canvas.height;
        const image = this.#ctx.createImageData(w, h);
        const out = image.data;
        out.set(this.#base);
        const rgb = new Map([...this.#fills].map(([l, c]) => [l, hex(c)]));
        const labels = this.#labels;
        for (let i = 0, p = 0; i < labels.length; i += 1, p += 4) {
            const c = rgb.get(labels[i]);
            if (c) {
                // Keep a little of the drawing's shading at the edges of a space.
                const shade = this.#base[p] / 255;
                out[p] = c[0] * shade;
                out[p + 1] = c[1] * shade;
                out[p + 2] = c[2] * shade;
            }
        }
        this.#ctx.putImageData(image, 0, 0);
        const root = this.shadowRoot;
        root.querySelector("[data-undo]").disabled = this.#history.length === 0;
        root.querySelector("[data-clear]").disabled = this.#fills.size === 0;
    }
}

function hex(c) {
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Labels each closed light space; line pixels get -1. */
export function label(pixels, w, h) {
    const labels = new Int32Array(w * h).fill(-2);
    for (let i = 0, p = 0; i < w * h; i += 1, p += 4) {
        const luma = 0.299 * pixels[p] + 0.587 * pixels[p + 1] + 0.114 * pixels[p + 2];
        if (luma < LINE_LUMA) {
            labels[i] = -1;
        }
    }
    const queue = new Int32Array(w * h);
    let next = 0;
    for (let start = 0; start < labels.length; start += 1) {
        if (labels[start] !== -2) {
            continue;
        }
        let head = 0;
        let tail = 0;
        queue[tail++] = start;
        labels[start] = next;
        const total = labels.length;
        while (head < tail) {
            const i = queue[head++];
            const x = i % w;
            // The four neighbours, written out: this runs for every pixel.
            if (x > 0 && labels[i - 1] === -2) {
                labels[i - 1] = next;
                queue[tail++] = i - 1;
            }
            if (x < w - 1 && labels[i + 1] === -2) {
                labels[i + 1] = next;
                queue[tail++] = i + 1;
            }
            if (i >= w && labels[i - w] === -2) {
                labels[i - w] = next;
                queue[tail++] = i - w;
            }
            if (i + w < total && labels[i + w] === -2) {
                labels[i + w] = next;
                queue[tail++] = i + w;
            }
        }
        next += 1;
    }
    return labels;
}

/** The label at (x, y), or the nearest space's within a few pixels when on a line. */
export function nearestLabel(labels, w, h, x, y, reach = 8) {
    const at = (px, py) => (px >= 0 && py >= 0 && px < w && py < h ? labels[py * w + px] : -1);
    if (at(x, y) >= 0) {
        return at(x, y);
    }
    for (let r = 1; r <= reach; r += 1) {
        for (let dy = -r; dy <= r; dy += 1) {
            for (let dx = -r; dx <= r; dx += 1) {
                if (Math.abs(dx) === r || Math.abs(dy) === r) {
                    const l = at(x + dx, y + dy);
                    if (l >= 0) {
                        return l;
                    }
                }
            }
        }
    }
    return -1;
}

if (!customElements.get("kids-colour")) {
    customElements.define("kids-colour", KidsColour);
}
