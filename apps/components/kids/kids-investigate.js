/**
 * <kids-investigate> — Investigate (Explorers, ages 9 to 12): read a question
 * about the story, then find the clue that answers it.
 *
 * Two kinds of story, two ways to answer:
 *   scene   the story's Look & Find picture: tap the thing that answers it
 *           (a tap inside any of the answer's spots counts)
 *   pages   the story's flipbook: tap the page that answers it, from three
 * A right answer shows the answer in words with the King James verse behind
 * it, and "Read it in the Bible" (kids-read { ref }, for the page to open the
 * passage). A wrong tap gets a gentle "look again"; after three on the same
 * question (two for pages), the answer glows. Nothing is lost.
 *
 * config (see kids-common.js for the shared keys):
 *   mode       "scene" or "pages"
 *   image      the scene (mode "scene")
 *   pages      the flipbook's page pictures (mode "pages")
 *   questions  [{ q, a, ref, text, spots: [[x, y, r], …] }]  or, for pages,
 *              [{ q, a, ref, text, page, choices: [page, …] }]
 *              x, y are fractions of the scene's width and height, r of its width.
 * Fires kids-done { game, tries } after the last question.
 */

import { BASE_STYLES, KidsGame, escapeHtml, shuffle } from "./kids-common.js?v=20261024-2";

// A tap this close to a spot (in px) counts, so small things are fair to find.
const MIN_SPOT_PX = 26;

const STYLES = /* css */ `
  ${BASE_STYLES}
  :host([fit]) { display: flex; flex-direction: column; }
  :host([fit]) .stage { flex: 1 1 0; min-height: 200px; display: grid; place-items: center; container-type: size; }
  :host([fit]) .scene { width: min(100cqw, 100cqh); }
  .step { text-align: center; color: var(--k-muted); font-weight: 800; margin: 0 0 6px; }
  .question { margin: 0 auto 12px; max-width: 36em; padding: 14px 18px; border-radius: 18px; background: var(--k-paper);
    box-shadow: 0 4px 0 var(--k-shadow); font-weight: 800; font-size: var(--kids-prompt-size, 1.2rem); line-height: 1.35; text-align: center; }
  .scene { position: relative; width: min(100%, 62dvh); margin: 0 auto; aspect-ratio: 1; border-radius: 22px; overflow: hidden;
    background: #e9dcc4; touch-action: manipulation; user-select: none; -webkit-user-select: none; cursor: crosshair; }
  .scene img { display: block; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
  .ring, .miss, .glow { position: absolute; translate: -50% -50%; border-radius: 50%; pointer-events: none; }
  .ring { border: 5px solid var(--k-gold); box-shadow: 0 0 0 3px rgb(255 255 255 / 85%); animation: kids-pop .45s ease both; }
  .miss { width: 36px; height: 36px; border: 3px solid rgb(255 255 255 / 85%); animation: kids-pop .4s ease both; }
  .glow { animation: kids-pulse 1.2s ease infinite; border: 3px dashed rgb(255 255 255 / 90%); }
  .pages { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; max-width: 640px; margin: 0 auto; }
  .page { position: relative; padding: 0; border: 4px solid var(--k-paper); border-radius: 14px; overflow: hidden; aspect-ratio: 9 / 16;
    background: #eee; box-shadow: 0 4px 0 var(--k-shadow); cursor: pointer; touch-action: manipulation; }
  .page img { display: block; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
  .page.right { border-color: var(--k-green); }
  .page.glow-page { animation: kids-pulse 1.1s ease infinite; border-color: var(--k-gold); }
  .page:disabled { opacity: .5; cursor: default; }
  .page.right:disabled { opacity: 1; }
  .answer { margin: 12px auto 0; max-width: 36em; padding: 14px 18px; border-radius: 18px; background: #e8f4ec; border: 2px solid #a8d5b8; }
  .answer b { display: block; margin-bottom: 6px; color: var(--k-green); }
  .answer blockquote { margin: 8px 0 0; font: 400 1.05rem/1.5 Georgia, "Times New Roman", serif; }
  .answer cite { display: block; margin-top: 4px; font-style: normal; font-weight: 800; font-size: .85rem; color: var(--k-muted); }
`;

export class KidsInvestigate extends KidsGame {
    #i = 0;
    #wrong = 0;
    #tries = 0;
    #solved = false;

    get questions() {
        return this.config?.questions ?? [];
    }

    render() {
        this.#i = 0;
        this.#tries = 0;
        this.#show();
        this.say("investigate-intro");
    }

    #show() {
        const q = this.questions[this.#i];
        this.#wrong = 0;
        this.#solved = false;
        const scene = this.config.mode === "scene";
        this.shadowRoot.innerHTML = `
          <style>${STYLES}</style>
          <p class="step">Clue ${this.#i + 1} of ${this.questions.length}</p>
          <p class="question" id="question" tabindex="-1">${escapeHtml(q.q)}</p>
          ${scene ? `
            <div class="stage"><div class="scene" role="img" aria-label="The story's picture: tap the answer">
              <img src="${escapeHtml(this.url(this.config.image))}" alt="" draggable="false" />
            </div></div>` : `
            <div class="pages">
              ${shuffle(q.choices).map((p) => `<button class="page" type="button" data-page="${p}" aria-label="Page ${p}">
                <img src="${escapeHtml(this.url(this.config.pages[p]))}" alt="" draggable="false" /></button>`).join("")}
            </div>`}
          <p class="feedback" aria-live="polite"></p>
          <div class="answer" hidden>
            <b>${escapeHtml(q.a)}</b>
            <blockquote>${escapeHtml(q.text)}</blockquote>
            <cite>${escapeHtml(q.ref)}</cite>
          </div>
          <div class="actions">
            <button class="btn quiet" type="button" data-show hidden>Show me</button>
            <button class="btn quiet" type="button" data-read hidden>Read it in the Bible</button>
            <button class="btn" type="button" data-next hidden>${this.#i + 1 < this.questions.length ? "Next clue" : "Case closed"}</button>
          </div>`;
        const root = this.shadowRoot;
        if (scene) {
            root.querySelector(".scene").addEventListener("click", (event) => this.#tapScene(event, q));
        } else {
            root.querySelector(".pages").addEventListener("click", (event) => {
                const page = event.target.closest(".page");
                if (page && !page.disabled && !this.#solved) {
                    this.#tapPage(page, q);
                }
            });
        }
        root.querySelector("[data-show]").addEventListener("click", () => this.#solve(q, null));
        root.querySelector("[data-read]").addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("kids-read", { bubbles: true, composed: true, detail: { ref: q.ref } }));
        });
        root.querySelector("[data-next]").addEventListener("click", () => this.#next());
        if (this.#i > 0) {
            root.getElementById("question").focus({ preventScroll: true });
        }
    }

    /** Whether a tap at (x, y), fractions of a square scene `size` px wide, is on one of the spots. */
    static hits(spots, x, y, size) {
        return spots.find(([sx, sy, r]) => Math.hypot(x - sx, y - sy) <= Math.max(r, MIN_SPOT_PX / size)) ?? null;
    }

    #tapScene(event, q) {
        if (this.#solved) {
            return;
        }
        const scene = event.currentTarget;
        const box = scene.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width;
        const y = (event.clientY - box.top) / box.height;
        this.#tries += 1;
        const spot = KidsInvestigate.hits(q.spots, x, y, box.width);
        if (spot) {
            this.#ring(scene, x, y, spot[2]);
            this.#solve(q, null);
            return;
        }
        const miss = document.createElement("span");
        miss.className = "miss";
        miss.style.left = `${x * 100}%`;
        miss.style.top = `${y * 100}%`;
        scene.append(miss);
        setTimeout(() => miss.remove(), 450);
        this.#missed(3, () => {
            for (const [sx, sy, r] of q.spots) {
                const glow = document.createElement("span");
                glow.className = "glow";
                glow.style.left = `${sx * 100}%`;
                glow.style.top = `${sy * 100}%`;
                glow.style.width = `max(${MIN_SPOT_PX * 2}px, ${r * 200}%)`;
                glow.style.aspectRatio = "1";
                scene.append(glow);
            }
        });
    }

    #ring(scene, x, y, r) {
        for (const glow of scene.querySelectorAll(".glow")) {
            glow.remove();
        }
        const ring = document.createElement("span");
        ring.className = "ring";
        ring.style.left = `${x * 100}%`;
        ring.style.top = `${y * 100}%`;
        ring.style.width = `max(${MIN_SPOT_PX * 2}px, ${r * 200}%)`;
        ring.style.aspectRatio = "1";
        scene.append(ring);
    }

    #tapPage(button, q) {
        this.#tries += 1;
        if (Number(button.dataset.page) === q.page) {
            this.#solve(q, button);
            return;
        }
        button.disabled = true;
        button.classList.add("shake");
        this.#missed(2, () => {
            this.shadowRoot.querySelector(`.page[data-page="${q.page}"]`)?.classList.add("glow-page");
        });
    }

    /** A wrong try: look again; after `limit` of them, the answer glows and "Show me" appears. */
    #missed(limit, glow) {
        this.#wrong += 1;
        const feedback = this.shadowRoot.querySelector(".feedback");
        feedback.className = "feedback hint";
        feedback.textContent = "Not quite. Look again, and read the question once more.";
        this.sfx("try-again");
        this.mood("think");
        if (this.#wrong === 1) {
            this.say("investigate-try");
        }
        if (this.#wrong >= limit) {
            glow();
            this.shadowRoot.querySelector("[data-show]").hidden = false;
        }
    }

    #solve(q, pageButton) {
        if (this.#solved) {
            return;
        }
        this.#solved = true;
        const root = this.shadowRoot;
        if (pageButton) {
            pageButton.classList.add("right");
        }
        if (this.config.mode === "pages") {
            const right = root.querySelector(`.page[data-page="${q.page}"]`);
            right?.classList.add("right");
            right?.classList.remove("glow-page");
            for (const b of root.querySelectorAll(".page")) {
                b.disabled = true;
            }
        } else if (!root.querySelector(".ring")) {
            // "Show me": ring the first spot.
            const [x, y, r] = q.spots[0];
            this.#ring(root.querySelector(".scene"), x, y, r);
        }
        const feedback = root.querySelector(".feedback");
        feedback.className = "feedback good";
        feedback.textContent = "Good detective work!";
        root.querySelector(".answer").hidden = false;
        root.querySelector("[data-show]").hidden = true;
        root.querySelector("[data-read]").hidden = false;
        const next = root.querySelector("[data-next]");
        next.hidden = false;
        this.sfx("right");
        this.mood("cheer");
        this.say("investigate-found");
        next.focus({ preventScroll: true });
        root.querySelector(".answer").scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    #next() {
        this.#i += 1;
        if (this.#i >= this.questions.length) {
            this.shadowRoot.querySelector(".actions").hidden = true;
            const feedback = this.shadowRoot.querySelector(".feedback");
            feedback.textContent = "Case closed! You found every clue.";
            this.sfx("celebrate");
            this.say("investigate-done");
            this.done({ tries: this.#tries });
            return;
        }
        this.#show();
    }
}

if (!customElements.get("kids-investigate")) {
    customElements.define("kids-investigate", KidsInvestigate);
}
