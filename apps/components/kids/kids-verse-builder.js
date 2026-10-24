/**
 * <kids-verse-builder> — My Verse: build the story's KJV verse.
 *
 * The youngest (lambs) see the verse with one word missing and choose it from
 * three; the older children (lions) tap the verse's pieces in order to build
 * it. The verse is always the King James words exactly; the plain-words line
 * underneath is marked as an explanation, not Scripture. A wrong choice gets a
 * gentle sound; after two, the right one glows.
 *
 * config (see kids-common.js for the shared keys):
 *   verse   { ref, text, plain, audio, plainAudio, blank, choices, chunks }
 * Fires kids-done { game, tries } when the verse is built.
 */

import { BASE_STYLES, KidsGame, SPEAKER_ICON, escapeHtml, shuffle } from "./kids-common.js?v=20261024-2";

const STYLES = /* css */ `
  ${BASE_STYLES}
  .card { background: var(--k-paper); border-radius: 22px; padding: 18px 18px 14px; box-shadow: 0 4px 0 var(--k-shadow); }
  .ref { margin: 0 0 8px; font-size: .9rem; font-weight: 800; color: var(--k-muted); letter-spacing: .02em; }
  .verse { margin: 0; font: 400 var(--kids-verse-size, 1.45rem)/1.5 Georgia, "Times New Roman", serif; min-height: 2.2em; }
  .gap { display: inline-block; min-width: 4.5em; border-bottom: 3px dashed var(--k-gold-dark); text-align: center; color: var(--k-green); font-weight: 700; }
  .built { color: var(--k-ink); }
  .built span { animation: kids-pop .3s ease both; display: inline; }
  .rest { color: #b3a58a; }
  .plain { margin: 12px 0 0; padding-top: 10px; border-top: 1px dashed var(--k-shadow); font-size: 1rem; }
  .plain b { display: block; font-size: .8rem; color: var(--k-muted); letter-spacing: .03em; text-transform: uppercase; }
  .choices { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 16px; }
  .choice {
    min-height: 56px; padding: 0 20px; border: 3px solid var(--k-shadow); border-radius: 999px;
    background: var(--k-paper); font: 400 1.25rem Georgia, serif; cursor: pointer; touch-action: manipulation;
  }
  .choice.used { visibility: hidden; }
  .choice.glow { animation: kids-pulse 1.1s ease infinite; border-color: var(--k-gold); }
  .listen { margin: 0 0 12px; text-align: center; }
`;

export class KidsVerseBuilder extends KidsGame {
    #wrong = 0;
    #tries = 0;
    #next = 0;

    render() {
        const v = this.config.verse;
        this.#wrong = 0;
        this.#tries = 0;
        this.#next = 0;
        const lambs = this.band === "lambs";
        const options = lambs ? shuffle(v.choices) : shuffle(v.chunks.map((text, i) => ({ text, i })));
        this.shadowRoot.innerHTML = `
          <style>${STYLES}</style>
          <p class="listen"><button class="btn quiet" type="button" data-listen>${SPEAKER_ICON} Hear the verse</button></p>
          <div class="card">
            <p class="ref">${escapeHtml(v.ref)} · King James Bible</p>
            <p class="verse" aria-live="polite">${lambs ? this.#withGap(v) : `<span class="built"></span><span class="rest">…</span>`}</p>
            <p class="plain"><b>In plain words (not the Bible's own words)</b>${escapeHtml(v.plain)}</p>
          </div>
          <p class="prompt" style="margin-top:16px">${lambs ? "Which word is missing?" : "Tap the words in order:"}</p>
          <div class="choices">
            ${lambs
                ? options.map((word) => `<button class="choice" type="button" data-word="${escapeHtml(word)}">${escapeHtml(word)}</button>`).join("")
                : options.map((c) => `<button class="choice" type="button" data-chunk="${c.i}">${escapeHtml(c.text)}</button>`).join("")}
          </div>
          <p class="feedback" aria-live="polite"></p>`;
        this.shadowRoot.querySelector("[data-listen]").addEventListener("click", () => this.say(v.audio, { force: true }));
        this.shadowRoot.querySelector(".choices").addEventListener("click", (event) => {
            const choice = event.target.closest(".choice");
            if (choice && !choice.classList.contains("used")) {
                if (lambs) {
                    this.#pickWord(choice);
                } else {
                    this.#pickChunk(choice);
                }
            }
        });
        this.say(v.audio).then(() => this.say(lambs ? "verse-missing" : "verse-intro"));
    }

    #withGap(v) {
        let done = false;
        // The first whole-word match of the blank becomes the gap; the rest stays as written.
        return escapeHtml(v.text).replace(new RegExp(`\\b${v.blank}\\b`), () => {
            if (done) {
                return v.blank;
            }
            done = true;
            return `<span class="gap" data-gap>&nbsp;</span>`;
        });
    }

    #wrongTry(choice, glowSelector) {
        this.#wrong += 1;
        choice.classList.remove("shake");
        void choice.offsetWidth;
        choice.classList.add("shake");
        const feedback = this.shadowRoot.querySelector(".feedback");
        feedback.className = "feedback hint";
        feedback.textContent = "Almost! Listen again and try another word.";
        this.sfx("try-again");
        this.mood("think");
        if (this.#wrong >= 2) {
            this.shadowRoot.querySelector(glowSelector)?.classList.add("glow");
            this.say("show-answer");
        } else {
            this.sayOneOf("try-");
        }
    }

    #success() {
        const feedback = this.shadowRoot.querySelector(".feedback");
        feedback.className = "feedback good";
        feedback.textContent = "You built it!";
        this.sfx("right");
        this.mood("cheer");
        this.say("verse-done");
        this.done({ tries: this.#tries });
    }

    #pickWord(choice) {
        const v = this.config.verse;
        this.#tries += 1;
        if (choice.dataset.word !== v.blank) {
            this.#wrongTry(choice, `[data-word="${CSS.escape(v.blank)}"]`);
            return;
        }
        const gap = this.shadowRoot.querySelector("[data-gap]");
        gap.textContent = v.blank;
        for (const b of this.shadowRoot.querySelectorAll(".choice")) {
            b.disabled = true;
        }
        this.#success();
    }

    #pickChunk(choice) {
        const v = this.config.verse;
        const i = Number(choice.dataset.chunk);
        this.#tries += 1;
        if (i !== this.#next) {
            this.#wrongTry(choice, `[data-chunk="${this.#next}"]`);
            return;
        }
        this.#wrong = 0;
        choice.classList.remove("glow");
        choice.classList.add("used");
        choice.disabled = true;
        const built = this.shadowRoot.querySelector(".built");
        const span = document.createElement("span");
        span.textContent = (this.#next ? " " : "") + v.chunks[i];
        built.append(span);
        this.#next += 1;
        this.sfx("drop");
        if (this.#next === v.chunks.length) {
            this.shadowRoot.querySelector(".rest").remove();
            this.#success();
        } else {
            const feedback = this.shadowRoot.querySelector(".feedback");
            feedback.className = "feedback good";
            feedback.textContent = "Yes! What comes next?";
        }
    }
}

if (!customElements.get("kids-verse-builder")) {
    customElements.define("kids-verse-builder", KidsVerseBuilder);
}
