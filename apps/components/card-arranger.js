/**
 * <card-arranger> — "Arrange my home page": the reader puts the home page's
 * cards in the order they like, and Daily Grace keeps it on this device.
 *
 * It opens as a sheet listing the cards by name. Each card moves by a drag on
 * its handle (a touch, a pen or the mouse), by the arrow buttons beside it, or
 * by the up and down arrow keys on its handle. The cards marked data-fixed
 * (today's banner and poster) are listed first, locked: they always stay at
 * the top. "Back to the usual order" puts every card back where the page
 * first had it.
 *
 * A move shows on the page at once, through the cards' CSS order, and is saved
 * straight away under ORDER_KEY. When the page next loads, the inline script
 * after the cards in index.html puts them in that order before any of them
 * start; moving a running card would start it again.
 *
 * Usage
 *   <section id="devotional-stack">
 *       <banner-slider id="banner-slider" data-fixed data-card-name="Today's banner"></banner-slider>
 *       <memory-verse id="memory-verse" data-card-name="Memory Verse Challenge"></memory-verse>
 *       …
 *   </section>
 *   <card-arranger id="card-arranger" for="devotional-stack"></card-arranger>
 *   <dg-menu … arranger="card-arranger"></dg-menu>
 *   <script type="module" src="./apps/components/card-arranger.js"></script>
 *
 * Attributes
 *   for      id of the element holding the cards. Each card needs an id; its
 *            data-card-name is its name in the list. The stack's
 *            data-default-order (set by the inline script) is the usual
 *            order, by id.
 *   opener   id of a button that opens the sheet (optional; on the home page
 *            only <dg-menu>'s "Arrange my home page" opens it)
 *   open     set by the component while the sheet is open (read-only); the
 *            page uses it to stop the page behind scrolling
 *
 * Methods      open(), close()
 *
 * Fonts: Germania One and Roboto are registered on the document by
 * assets/scripts/fonts.js, because browsers do not reliably load @font-face
 * rules declared inside a shadow root.
 */

import { registerFonts } from "../../assets/scripts/fonts.js";

// The cards' order, by id. Keep in step with the inline script after the
// cards in index.html, which reads it as the page loads.
export const ORDER_KEY = "dailygrace:card-order";

// Rows sliding into their new places.
const MOVE = { duration: 200, easing: "cubic-bezier(.2, .9, .25, 1)" };
// How near the top or bottom of the list a dragged card makes it scroll.
const SCROLL_EDGE = 56; // px
const SCROLL_MAX = 14; // px a frame

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

const ICON_ATTRS =
    'viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const GRIP_ICON = `<svg ${ICON_ATTRS}><circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/></svg>`;
const LOCK_ICON = `<svg ${ICON_ATTRS}><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`;
const UP_ICON = `<svg ${ICON_ATTRS}><path d="m6 15 6-6 6 6"/></svg>`;
const DOWN_ICON = `<svg ${ICON_ATTRS}><path d="m6 9 6 6 6-6"/></svg>`;
const CLOSE_ICON = `<svg ${ICON_ATTRS}><path d="M6 6l12 12M18 6 6 18"/></svg>`;

const STYLES = /* css */ `
  :host { display: contents; }
  * { box-sizing: border-box; }

  /* The sheet wears the menu's colours: lit cream paper, a gold rule under
     the title, the name in Germania One. */
  dialog {
    width: min(460px, 94vw);
    max-height: 90vh;
    max-height: 90dvh;
    padding: 0;
    border: 0;
    border-radius: 20px;
    background:
      radial-gradient(90% 50% at 0% 0%, #fffaf0 0%, transparent 60%),
      var(--cream, #f3e7d2);
    color: var(--ink, #10253b);
    box-shadow: 0 28px 70px rgb(0 27 52 / 45%);
    font-family: 'Roboto', Arial, sans-serif;
    overflow: hidden;
  }
  dialog[open] { display: flex; flex-direction: column; }
  dialog::backdrop {
    background: rgb(0 27 52 / 62%);
    backdrop-filter: blur(4px);
  }
  header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 12px 14px 20px;
    border-bottom: 1px solid rgb(198 146 46 / 45%);
  }
  .heading { flex: 1; min-width: 0; }
  .eyebrow {
    margin: 0 0 4px;
    color: #805b18;
    font: 700 .625rem/1 'Roboto', Arial, sans-serif;
    letter-spacing: .24em;
    text-transform: uppercase;
  }
  h2 {
    margin: 0;
    color: var(--navy, #001b34);
    font: 400 clamp(1.5rem, 1.3rem + 1vw, 1.875rem)/1.05 'Germania One', Georgia, serif;
    letter-spacing: .02em;
  }
  .close {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: rgb(243 231 210 / 82%);
    color: var(--navy, #001b34);
    box-shadow: 0 2px 10px rgb(0 27 52 / 18%);
    cursor: pointer;
  }
  .close:hover { background: #fff; }
  .body {
    flex: 1;
    min-height: 0;
    padding: 14px 16px 18px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .intro { margin: 0 0 14px; font-size: .9375rem; line-height: 1.45; }
  ol { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
  .fixed { margin-bottom: 8px; }

  /* A drag that strays off a handle must not select the names. */
  .fixed, .cards, footer { -webkit-user-select: none; user-select: none; }
  .row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 52px;
    padding: 3px 4px;
    border: 1px solid rgb(198 146 46 / 38%);
    border-radius: 12px;
    background: #fffdf8;
    box-shadow: 0 1px 2px rgb(0 27 52 / 8%);
  }
  /* Today's banner and poster: shown so the reader sees why they can't move. */
  .row.locked { border-style: dashed; background: transparent; box-shadow: none; }
  .lock { display: grid; flex: none; place-items: center; width: 44px; color: #805b18; }
  .name {
    display: grid;
    flex: 1;
    gap: 1px;
    min-width: 0;
    color: var(--navy, #001b34);
    font-size: .9375rem;
    font-weight: 500;
    line-height: 1.25;
  }
  .name small { color: #4d5866; font-size: .75rem; font-weight: 400; }
  /* The handle takes the whole drag, so the list still scrolls everywhere else. */
  .grip, .step {
    display: grid;
    flex: none;
    place-items: center;
    height: 44px;
    padding: 0;
    border: 0;
    border-radius: 10px;
    background: transparent;
    cursor: pointer;
  }
  .grip { width: 44px; color: #805b18; cursor: grab; touch-action: none; }
  .step { width: 38px; color: var(--navy, #001b34); }
  .step:disabled { opacity: .25; cursor: default; }
  .grip:hover, .step:not(:disabled):hover { background: rgb(198 146 46 / 14%); }
  button:focus-visible { outline: 2px solid var(--navy, #001b34); outline-offset: 2px; }
  svg { width: 20px; height: 20px; }
  /* The card being dragged rides above the others, under the finger. */
  .row.dragging {
    z-index: 2;
    border-color: var(--gold, #c6922e);
    box-shadow: 0 14px 30px -10px rgb(0 27 52 / 45%);
  }
  .row.dragging .grip { cursor: grabbing; }

  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px calc(14px + env(safe-area-inset-bottom));
    border-top: 1px solid rgb(0 27 52 / 14%);
  }
  .reset {
    padding: 10px 4px;
    border: 0;
    background: transparent;
    color: #805b18;
    font: 700 .8125rem/1.2 'Roboto', Arial, sans-serif;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }
  .reset:disabled { opacity: .45; text-decoration: none; cursor: default; }
  .done {
    min-height: 44px;
    padding: 0 26px;
    border: 0;
    border-radius: 999px;
    background: var(--navy, #001b34);
    color: #fffaf0;
    font: 700 .9375rem/1 'Roboto', Arial, sans-serif;
    cursor: pointer;
  }
  .done:hover { background: var(--navy-2, #062944); }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
`;

const HTML = /* html */ `
<dialog aria-labelledby="arrange-title" aria-describedby="arrange-intro">
    <header>
        <div class="heading">
            <p class="eyebrow">My home page</p>
            <h2 id="arrange-title">Arrange the cards</h2>
        </div>
        <button class="close" type="button" aria-label="Close">${CLOSE_ICON}</button>
    </header>
    <div class="body">
        <p class="intro" id="arrange-intro">Drag a card by its handle, or use the arrows, to put the cards in the order you like. Daily Grace keeps your order on this device.</p>
        <ol class="fixed" aria-label="Always at the top"></ol>
        <ol class="cards" aria-label="Your cards"></ol>
        <p class="sr-only" id="grip-help">Drag, or press the up and down arrow keys, to move it.</p>
    </div>
    <footer>
        <button class="reset" type="button">Back to the usual order</button>
        <button class="done" type="button">Done</button>
    </footer>
    <p class="sr-only" role="status"></p>
</dialog>`;

const escapeHtml = (text) =>
    String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const cardName = (card) => card.dataset.cardName || card.id;

// One row for all the fixed cards, so a phone has room for the ones that move.
const lockedRow = (cards) => `
    <li class="row locked">
        <span class="lock">${LOCK_ICON}</span>
        <span class="name">${cards.map((card) => escapeHtml(cardName(card))).join(" and ")}<small>Always at the top</small></span>
    </li>`;

const cardRow = (card) => {
    const name = escapeHtml(cardName(card));
    return `
    <li class="row" data-id="${escapeHtml(card.id)}" data-name="${name}">
        <button class="grip" type="button" aria-label="Move ${name}" aria-describedby="grip-help">${GRIP_ICON}</button>
        <span class="name">${name}${card.hidden ? "<small>Not showing today</small>" : ""}</span>
        <button class="step up" type="button" aria-label="Move ${name} up">${UP_ICON}</button>
        <button class="step down" type="button" aria-label="Move ${name} down">${DOWN_ICON}</button>
    </li>`;
};

export class CardArranger extends HTMLElement {
    #dialog;
    #scroller;
    #fixed;
    #list;
    #reset;
    #status;
    #opener = null;
    // The row being dragged: its pointer, where the drag started and the
    // pointer now (clientY, kept in step with the row's place in the list),
    // and its place when the drag began.
    #drag = null;

    constructor() {
        super();
        const root = this.attachShadow({ mode: "open" });
        root.innerHTML = `<style>${STYLES}</style>${HTML}`;
        this.#dialog = root.querySelector("dialog");
        this.#scroller = root.querySelector(".body");
        this.#fixed = root.querySelector(".fixed");
        this.#list = root.querySelector(".cards");
        this.#reset = root.querySelector(".reset");
        this.#status = root.querySelector('[role="status"]');

        const dialog = this.#dialog;
        dialog.addEventListener("close", () => this.#closed());
        // The dialog has no padding, so a click on it rather than its contents
        // came from the backdrop.
        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) {
                this.close();
            }
        });
        root.querySelector(".close").addEventListener("click", () => this.close());
        root.querySelector(".done").addEventListener("click", () => this.close());
        this.#reset.addEventListener("click", () => this.#resetOrder());

        const list = this.#list;
        list.addEventListener("click", (event) => {
            const step = event.target.closest(".step");
            if (step) {
                this.#step(step.closest(".row"), step.classList.contains("up") ? -1 : 1);
            }
        });
        list.addEventListener("keydown", (event) => {
            const grip = event.target.closest(".grip");
            if (!grip || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) {
                return;
            }
            event.preventDefault();
            this.#step(grip.closest(".row"), event.key === "ArrowUp" ? -1 : 1);
        });
        list.addEventListener("pointerdown", (event) => this.#dragStart(event));
        list.addEventListener("pointermove", (event) => this.#dragMove(event));
        list.addEventListener("pointerup", (event) => this.#dragEnd(event));
        list.addEventListener("pointercancel", (event) => this.#dragEnd(event));
        list.addEventListener("lostpointercapture", (event) => this.#dragEnd(event));
    }

    connectedCallback() {
        registerFonts();
        this.#opener?.removeEventListener("click", this.#onOpenerClick);
        this.#opener = document.getElementById(this.getAttribute("opener") ?? "");
        this.#opener?.addEventListener("click", this.#onOpenerClick);
    }

    disconnectedCallback() {
        this.#opener?.removeEventListener("click", this.#onOpenerClick);
        this.#opener = null;
    }

    #onOpenerClick = () => this.open();

    get #stack() {
        return document.getElementById(this.getAttribute("for") ?? "");
    }

    /** The cards that move, in the order they show on the page now. */
    #cards() {
        const cards = [...(this.#stack?.children ?? [])].filter(
            (card) => card.id && !card.hasAttribute("data-fixed"),
        );
        return cards
            .map((card, index) => ({ card, index, order: Number(card.style.order) || 0 }))
            .sort((a, b) => a.order - b.order || a.index - b.index)
            .map(({ card }) => card);
    }

    /** The usual order, by id, as the page first had it. */
    #defaultOrder() {
        const saved = this.#stack?.dataset.defaultOrder?.split(" ").filter(Boolean);
        if (saved?.length) {
            return saved;
        }
        return this.#cards().map((card) => card.id);
    }

    #rows() {
        return [...this.#list.children];
    }

    #ids() {
        return this.#rows().map((row) => row.dataset.id);
    }

    open() {
        const stack = this.#stack;
        if (!stack || this.#dialog.open) {
            return;
        }
        const fixed = [...stack.children].filter((card) => card.hasAttribute("data-fixed"));
        this.#fixed.innerHTML = fixed.length ? lockedRow(fixed) : "";
        this.#list.innerHTML = this.#cards().map(cardRow).join("");
        this.#status.textContent = "";
        this.#refresh();
        this.#dialog.showModal();
        this.#scroller.scrollTop = 0;
        this.toggleAttribute("open", true);
        if (!reducedMotion.matches) {
            this.#dialog.animate(
                [
                    { opacity: 0, transform: "translateY(16px) scale(.97)" },
                    { opacity: 1, transform: "none" },
                ],
                { duration: 260, easing: "cubic-bezier(.2, .9, .25, 1)" },
            );
        }
    }

    close() {
        if (this.#dialog.open) {
            this.#dialog.close();
        }
    }

    #closed() {
        this.#stopDrag();
        this.toggleAttribute("open", false);
    }

    // ------------------------------------------------------------- the order

    /** Shows the list's order on the page, and keeps it. */
    #commit() {
        const ids = this.#ids();
        ids.forEach((id, index) => {
            const card = document.getElementById(id);
            if (card) {
                card.style.order = String(index + 1);
            }
        });
        try {
            localStorage.setItem(ORDER_KEY, JSON.stringify(ids));
        } catch {
            // Storage is off (a private window): the order lasts this visit.
        }
        this.#refresh();
    }

    #resetOrder() {
        const usual = this.#defaultOrder();
        const rows = this.#rows();
        const byId = new Map(rows.map((row) => [row.dataset.id, row]));
        this.#flip(rows, () => {
            for (const id of usual) {
                const row = byId.get(id);
                if (row) {
                    this.#list.append(row);
                }
            }
        });
        // The page may have loaded in the reader's order, so set the usual
        // one through CSS order too.
        usual.forEach((id, index) => {
            const card = document.getElementById(id);
            if (card) {
                card.style.order = String(index + 1);
            }
        });
        // With nothing kept, a card added later takes its usual place.
        try {
            localStorage.removeItem(ORDER_KEY);
        } catch {
            // Nothing was kept.
        }
        this.#refresh();
        this.#status.textContent = "The cards are back in the usual order.";
        // Focus would otherwise fall to the page when the button turns off.
        this.#dialog.querySelector(".done").focus();
    }

    /** Turns off the arrows at the ends, and Reset when nothing has moved. */
    #refresh() {
        const rows = this.#rows();
        rows.forEach((row, index) => {
            row.querySelector(".up").disabled = index === 0;
            row.querySelector(".down").disabled = index === rows.length - 1;
        });
        this.#reset.disabled = this.#ids().join(" ") === this.#defaultOrder().join(" ");
    }

    #announce(row) {
        const rows = this.#rows();
        this.#status.textContent = `${row.dataset.name}, ${rows.indexOf(row) + 1} of ${rows.length}.`;
    }

    /** Runs a change to the list, then slides each row from where it was. */
    #flip(rows, change) {
        const before = new Map(rows.map((row) => [row, row.getBoundingClientRect().top]));
        change();
        if (reducedMotion.matches) {
            return;
        }
        for (const [row, top] of before) {
            const dy = top - row.getBoundingClientRect().top;
            if (dy) {
                row.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], MOVE);
            }
        }
    }

    // ---------------------------------------------------------------- arrows

    /**
     * Moves a row one place up (-1) or down (1). Its neighbour is the one
     * moved in the list, so the button or handle in focus keeps its focus.
     */
    #step(row, direction) {
        const neighbour = direction < 0 ? row.previousElementSibling : row.nextElementSibling;
        if (!neighbour) {
            return;
        }
        this.#flip([row, neighbour], () => {
            if (direction < 0) {
                this.#list.insertBefore(neighbour, row.nextElementSibling);
            } else {
                this.#list.insertBefore(neighbour, row);
            }
        });
        this.#commit();
        this.#announce(row);
        // At the top or bottom the arrow just used turns off; keep focus in the row.
        const active = this.shadowRoot.activeElement;
        if (active?.disabled) {
            row.querySelector(direction < 0 ? ".down" : ".up").focus();
        }
    }

    // ------------------------------------------------------------------ drag

    #dragStart(event) {
        const grip = event.target.closest(".grip");
        if (!grip || this.#drag || !event.isPrimary || event.button !== 0) {
            return;
        }
        // No text selection, and no scrolling: the handle takes the drag.
        event.preventDefault();
        const row = grip.closest(".row");
        grip.setPointerCapture(event.pointerId);
        row.classList.add("dragging");
        this.#drag = {
            id: event.pointerId,
            row,
            start: event.clientY,
            pointer: event.clientY,
            from: this.#rows().indexOf(row),
            frame: requestAnimationFrame(this.#autoScroll),
        };
    }

    #dragMove(event) {
        const drag = this.#drag;
        if (!drag || event.pointerId !== drag.id) {
            return;
        }
        drag.pointer = event.clientY;
        this.#follow();
    }

    /**
     * Keeps the dragged row under the pointer. Once it is past the middle of
     * the row above or below, that row takes its old place: the neighbour moves
     * in the list, not the dragged row, which would lose the pointer.
     */
    #follow() {
        const drag = this.#drag;
        const { row } = drag;
        const gap = parseFloat(getComputedStyle(this.#list).rowGap) || 0;
        let dy = drag.pointer - drag.start;
        for (;;) {
            const next = row.nextElementSibling;
            const previous = row.previousElementSibling;
            if (next && dy > (next.offsetHeight + gap) / 2) {
                const step = next.offsetHeight + gap;
                this.#flip([next], () => this.#list.insertBefore(next, row));
                drag.start += step;
                dy -= step;
            } else if (previous && dy < -(previous.offsetHeight + gap) / 2) {
                const step = previous.offsetHeight + gap;
                this.#flip([previous], () =>
                    this.#list.insertBefore(previous, row.nextElementSibling),
                );
                drag.start -= step;
                dy += step;
            } else {
                break;
            }
        }
        row.style.transform = `translateY(${dy}px)`;
    }

    /** Scrolls the list while a dragged row is held near its top or bottom. */
    #autoScroll = () => {
        const drag = this.#drag;
        if (!drag) {
            return;
        }
        const box = this.#scroller.getBoundingClientRect();
        let speed = 0;
        if (drag.pointer < box.top + SCROLL_EDGE) {
            speed = -Math.min(SCROLL_MAX, (box.top + SCROLL_EDGE - drag.pointer) / 4);
        } else if (drag.pointer > box.bottom - SCROLL_EDGE) {
            speed = Math.min(SCROLL_MAX, (drag.pointer - (box.bottom - SCROLL_EDGE)) / 4);
        }
        if (speed) {
            const before = this.#scroller.scrollTop;
            this.#scroller.scrollTop += speed;
            const scrolled = this.#scroller.scrollTop - before;
            if (scrolled) {
                drag.start -= scrolled;
                this.#follow();
            }
        }
        drag.frame = requestAnimationFrame(this.#autoScroll);
    };

    #dragEnd(event) {
        const drag = this.#drag;
        if (!drag || event.pointerId !== drag.id) {
            return;
        }
        const offset = drag.pointer - drag.start;
        const { row, from } = drag;
        this.#stopDrag();
        // Settle into its place from where the pointer let it go.
        if (offset && !reducedMotion.matches) {
            row.animate([{ transform: `translateY(${offset}px)` }, { transform: "none" }], MOVE);
        }
        if (this.#rows().indexOf(row) !== from) {
            this.#commit();
            this.#announce(row);
        }
    }

    #stopDrag() {
        const drag = this.#drag;
        if (!drag) {
            return;
        }
        this.#drag = null;
        cancelAnimationFrame(drag.frame);
        drag.row.style.transform = "";
        drag.row.classList.remove("dragging");
    }
}

if (!customElements.get("card-arranger")) {
    customElements.define("card-arranger", CardArranger);
}
