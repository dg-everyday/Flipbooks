/**
 * <kids-right-or-not> — Right or Not?: is this what happened in the story?
 *
 * One statement at a time, read aloud by the narrator; the child taps Right
 * or Not right, then sees why. There is no score to lose: a wrong answer just
 * shows the right one with its reason.
 *
 * config (see kids-common.js for the shared keys):
 *   statements   [{ text, right, why, audio, ref, verse }]
 *                Explorers' statements have no audio (they read them), and a
 *                ref and its KJV verse: the verse that settles it shows with
 *                the answer, with "Read it", which fires kids-read { ref }
 *                for the page to open the passage.
 * The youngest (lambs) get the first three; the older children all of them.
 * Fires kids-done { game, right, total } after the last statement.
 */

import { BASE_STYLES, KidsGame, SPEAKER_ICON, escapeHtml } from "./kids-common.js?v=20261024-2";

const STYLES = /* css */ `
  ${BASE_STYLES}
  .step { text-align: center; color: var(--k-muted); font-weight: 800; margin: 0 0 8px; }
  .card { margin: 0 auto; max-width: 34em; background: var(--k-paper); border-radius: 22px; padding: 22px 20px; box-shadow: 0 4px 0 var(--k-shadow); text-align: center; }
  .card p { margin: 0; font-size: var(--kids-prompt-size, 1.35rem); font-weight: 800; line-height: 1.4; }
  .answers { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 18px; }
  .answer {
    display: flex; flex-direction: column; align-items: center; gap: 6px; min-height: 110px; padding: 12px;
    border: 3px solid transparent; border-radius: 22px; font-weight: 900; font-size: 1.2rem; cursor: pointer; touch-action: manipulation;
  }
  .answer svg { width: 44px; height: 44px; }
  .answer[data-answer="yes"] { background: #dff2e6; color: var(--k-green); box-shadow: 0 5px 0 #9fd0b1; }
  .answer[data-answer="no"] { background: #fde3d9; color: #9e3a1c; box-shadow: 0 5px 0 #f0b49f; }
  .answer:disabled { opacity: .55; cursor: default; }
  .answer.chosen { border-color: var(--k-ink); opacity: 1; }
  .why { margin: 14px auto 0; max-width: 34em; text-align: center; font-size: 1.05rem; }
  .verse { margin: 12px auto 0; max-width: 34em; padding: 12px 16px; border-left: 4px solid var(--k-gold); background: rgb(255 255 255 / 70%); border-radius: 0 14px 14px 0; }
  .verse p { margin: 0; font: 400 1.05rem/1.5 Georgia, "Times New Roman", serif; }
  .verse cite { display: block; margin-top: 4px; font-style: normal; font-weight: 800; font-size: .85rem; color: var(--k-muted); }
`;

const THUMB = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
const YES = THUMB("M7 11v9H4v-9zM7 11l4-8a2 2 0 0 1 3 2l-1 5h6a2 2 0 0 1 2 2l-2 7a2 2 0 0 1-2 1H7");
const NO = THUMB("M7 13V4H4v9zM7 13l4 8a2 2 0 0 0 3-2l-1-5h6a2 2 0 0 0 2-2l-2-7a2 2 0 0 0-2-1H7");

export class KidsRightOrNot extends KidsGame {
    #i = 0;
    #right = 0;

    get statements() {
        const all = this.config?.statements ?? [];
        return this.band === "lions" ? all : all.slice(0, 3);
    }

    render() {
        this.#i = 0;
        this.#right = 0;
        this.#show(false);
        // After the instruction, the first statement (unless the child has moved on).
        this.say("right-or-not-intro").then((how) => {
            if (this.isConnected && this.#i === 0 && how !== "stopped") {
                this.say(this.statements[0].audio);
            }
        });
    }

    #show(play = true) {
        const list = this.statements;
        const s = list[this.#i];
        this.shadowRoot.innerHTML = `
          <style>${STYLES}</style>
          <p class="step">${this.#i + 1} of ${list.length}</p>
          <div class="card"><p>${escapeHtml(s.text)}</p></div>
          <div class="answers">
            <button class="answer" type="button" data-answer="yes">${YES}Right</button>
            <button class="answer" type="button" data-answer="no">${NO}Not right</button>
          </div>
          <p class="feedback" aria-live="polite"></p>
          <p class="why" hidden></p>
          ${s.ref ? `<blockquote class="verse" hidden><p>${escapeHtml(s.verse)}</p><cite>${escapeHtml(s.ref)}</cite></blockquote>` : ""}
          <div class="actions">
            ${s.audio ? `<button class="btn quiet" type="button" data-listen>${SPEAKER_ICON} Hear it again</button>` : ""}
            ${s.ref ? `<button class="btn quiet" type="button" data-read hidden>Read it in the Bible</button>` : ""}
            <button class="btn" type="button" data-next hidden>${this.#i + 1 < list.length ? "Next" : "All done"}</button>
          </div>`;
        const root = this.shadowRoot;
        root.querySelector("[data-listen]")?.addEventListener("click", () => this.say(s.audio, { force: true }));
        root.querySelector("[data-read]")?.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("kids-read", { bubbles: true, composed: true, detail: { ref: s.ref } }));
        });
        root.querySelector(".answers").addEventListener("click", (event) => {
            const answer = event.target.closest(".answer");
            if (answer && !answer.disabled) {
                this.#answer(answer, s);
            }
        });
        root.querySelector("[data-next]").addEventListener("click", () => this.#next());
        if (play) {
            this.say(s.audio);
        }
    }

    #answer(button, s) {
        const saidRight = button.dataset.answer === "yes";
        const correct = saidRight === s.right;
        for (const b of this.shadowRoot.querySelectorAll(".answer")) {
            b.disabled = true;
        }
        button.classList.add("chosen");
        const feedback = this.shadowRoot.querySelector(".feedback");
        if (correct) {
            this.#right += 1;
            feedback.className = "feedback good";
            feedback.textContent = s.right ? "Yes, that's right!" : "Yes, that's not right!";
            this.sfx("right");
            this.mood("cheer");
        } else {
            feedback.className = "feedback hint";
            feedback.textContent = s.right ? "It was right!" : "That one was not right.";
            this.sfx("hint");
            this.mood("think");
        }
        const why = this.shadowRoot.querySelector(".why");
        why.textContent = s.why;
        why.hidden = false;
        for (const el of this.shadowRoot.querySelectorAll(".verse, [data-read]")) {
            el.hidden = false;
        }
        const next = this.shadowRoot.querySelector("[data-next]");
        next.hidden = false;
        next.focus();
    }

    #next() {
        this.#i += 1;
        if (this.#i >= this.statements.length) {
            this.sayOneOf("right-");
            this.sfx("celebrate");
            this.done({ right: this.#right, total: this.statements.length });
            this.shadowRoot.querySelector(".actions").hidden = true;
            return;
        }
        this.#show();
    }
}

if (!customElements.get("kids-right-or-not")) {
    customElements.define("kids-right-or-not", KidsRightOrNot);
}
