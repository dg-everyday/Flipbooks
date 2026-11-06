/**
 * <dg-menu> — the menu under the DG emblem at the top of the home page: the
 * reader's own things. (Once the reader has chosen an avatar, it shows in
 * place of the emblem; see <avatar-picker>.)
 *
 *   Change my avatar      opens <avatar-picker>
 *   My Faith Journal      goes to the journal: the reader's daily log,
 *                         prayers, bookmarks and Sticker Album in one place
 *                         (My Bookmarks and My Sticker Album open from there)
 *   ────────────
 *   How My Faith Journal works   opens that guide in the page's <dg-guide>
 *
 * The menu drops down from the emblem; a tap outside it, Escape or choosing
 * an item closes it. (The study guides, Help and About live in the hamburger
 * menu, <study-guide-menu>. Bookmarking 101 and How to earn stickers are
 * <dg-guide> sheets too, opened from My Faith Journal and from Help.)
 *
 * Usage
 *   <button id="dg-open" aria-haspopup="menu" aria-expanded="false">…</button>
 *   <dg-menu opener="dg-open" avatar-picker="avatar-picker" guide="guide"></dg-menu>
 *   <script type="module" src="./apps/components/dg-menu.js"></script>
 *
 * Attributes
 *   opener      id of the button that opens the menu; its aria-expanded
 *               follows the menu, and focus returns to it on close
 *   avatar-picker  id of the page's <avatar-picker>
 *   guide       id of the page's <dg-guide>
 *   journal-href  My Faith Journal, resolved against the page.
 *               Default: apps/pages/journal.html
 *   open        set by the component while the menu is open (read-only); the
 *               page uses it to stop the page behind scrolling
 *
 * Methods      open(), close()
 *
 * Fonts: Germania One and Strait are registered on the document by
 * assets/scripts/fonts.js, because browsers do not reliably load @font-face
 * rules declared inside a shadow root.
 */

import { registerFonts } from "../../assets/scripts/fonts.js";

const DEFAULT_JOURNAL = "apps/pages/journal.html";

const ICON_ATTRS =
    'viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const JOURNAL_ICON = `<svg ${ICON_ATTRS}><path d="M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2z"/><path d="M5 19a2 2 0 0 1 2-2h12"/><path d="M9 7h6M9 11h4"/></svg>`;
const HELP_ICON = `<svg ${ICON_ATTRS}><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7"/><path d="M12 17h.01"/></svg>`;
const AVATAR_ICON = `<svg ${ICON_ATTRS}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="10" r="3"/><path d="M6.7 18.4a6 6 0 0 1 10.6 0"/></svg>`;

const STYLES = /* css */ `
  :host {
    --dg-navy: var(--navy, #001b34);
    --dg-gold: var(--gold, #c6922e);
    --dg-gold-light: var(--gold-light, #e1b65d);
    --dg-gold-ink: #7d5a12;
    --dg-paper: #fffaf1;
    --dg-cream: #f6eedf;
    --dg-menu-cream: var(--cream, #f3e7d2);
    --dg-ink: #10253b;
    --dg-muted: #56606e;
    --dg-line: #e2d5bb;
    display: contents;
  }
  * { box-sizing: border-box; }
  button { font: inherit; }
  [hidden] { display: none !important; }

  /* ----- The menu: a small card dropping down from the emblem ----- */
  .menu {
    position: fixed;
    inset: auto;
    width: min(280px, calc(100vw - 16px));
    margin: 0; padding: 8px;
    border: 1px solid rgb(198 146 46 / 35%);
    border-radius: 16px;
    /* The study guides' drawer (<study-guide-menu>): cream, lighter at the top left. */
    background:
      radial-gradient(120% 60% at 0% 0%, #fffaf0 0%, transparent 60%),
      var(--dg-menu-cream);
    color: var(--dg-navy);
    box-shadow: 0 18px 44px rgb(0 27 52 / 30%);
    transform-origin: top left;
  }
  .menu[open] { animation: drop .18s cubic-bezier(.2, 1.2, .4, 1) both; }
  .menu::backdrop { background: rgb(0 27 52 / 18%); }
  @keyframes drop { from { opacity: 0; transform: scale(.9) translateY(-6px); } }
  .menu ul { display: grid; margin: 0; padding: 0; list-style: none; }
  .item {
    display: flex; align-items: center; gap: 12px;
    width: 100%; min-height: 50px;
    padding: 6px 10px;
    border: 0; border-radius: 10px;
    background: none; color: inherit;
    font: 700 1rem/1.2 'Strait', 'Roboto', sans-serif;
    text-align: left; text-decoration: none;
    cursor: pointer;
  }
  .item:hover { background: rgb(198 146 46 / 12%); }
  .item:focus-visible { outline: 2px solid var(--dg-navy); outline-offset: -2px; }
  .item-icon { display: grid; place-items: center; flex: none; width: 36px; height: 36px; color: var(--dg-gold-ink); }
  .item-icon svg { width: 24px; height: 24px; }
  .item-icon img { width: 34px; height: 34px; }
  .item-text { display: grid; gap: 1px; }
  /* Tight leading, as in the study guides' menu, so a description that wraps
     reads as one block. */
  .item-text small { color: var(--dg-muted); font-weight: 400; font-size: .85rem; line-height: 1.2; }
  /* With a line under it, the icon sits beside the title, not halfway down
     the description, as in the study guides' menu. */
  .item:has(small) { align-items: flex-start; }
  /* The rule sets the guide apart from the reader's own things. */
  .rule { height: 1px; margin: 8px 10px; background: var(--dg-line); }

  @media (prefers-reduced-motion: reduce) {
    .menu[open] { animation: none; }
  }
`;

export class DgMenu extends HTMLElement {
    static observedAttributes = ["opener", "journal-href"];

    #root;
    #menu;
    #opener = null;
    #onOpenerClick = () => {
        if (this.#menu.open) {
            this.close();
        } else {
            this.open();
        }
    };

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: "open" });
        this.#root.innerHTML = `
      <style>${STYLES}</style>
      <dialog class="menu" aria-label="My Daily Grace">
        <ul role="menu">
          <li role="none">
            <button class="item" type="button" role="menuitem" data-action="avatar" aria-haspopup="dialog">
              <span class="item-icon">${AVATAR_ICON}</span>
              <span class="item-text">Change my avatar<small>The Bible hero who is your picture</small></span>
            </button>
          </li>
          <li role="none">
            <a class="item" role="menuitem" data-action="journal">
              <span class="item-icon">${JOURNAL_ICON}</span>
              <span class="item-text">My Faith Journal<small>Your daily log, prayers, bookmarks and stickers, kept on this phone</small></span>
            </a>
          </li>
          <li role="separator" class="rule"></li>
          <li role="none">
            <button class="item" type="button" role="menuitem" data-action="journal-help" aria-haspopup="dialog">
              <span class="item-icon">${HELP_ICON}</span>
              <span class="item-text">How My Faith Journal works</span>
            </button>
          </li>
        </ul>
      </dialog>`;
        this.#menu = this.#root.querySelector(".menu");

        this.#menu.addEventListener("click", (event) => {
            if (event.target === this.#menu) {
                this.close();
                return;
            }
            const action = event.target.closest("[data-action]")?.dataset.action;
            if (action === "avatar") {
                this.close();
                document.getElementById(this.getAttribute("avatar-picker") ?? "")?.open();
            } else if (action === "journal-help") {
                this.close();
                document.getElementById(this.getAttribute("guide") ?? "")?.show?.("journal");
            }
        });
        this.#menu.addEventListener("close", () => this.#closed());
    }

    connectedCallback() {
        registerFonts();
        this.#wireOpener();
        this.#renderLinks();
    }

    disconnectedCallback() {
        this.#opener?.removeEventListener("click", this.#onOpenerClick);
        this.#opener = null;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue || !this.isConnected) {
            return;
        }
        if (name === "opener") {
            this.#wireOpener();
        } else {
            this.#renderLinks();
        }
    }

    #wireOpener() {
        this.#opener?.removeEventListener("click", this.#onOpenerClick);
        this.#opener = document.getElementById(this.getAttribute("opener") ?? "");
        this.#opener?.addEventListener("click", this.#onOpenerClick);
    }

    #renderLinks() {
        const journal = new URL(
            this.getAttribute("journal-href") || DEFAULT_JOURNAL,
            document.baseURI,
        ).href;
        this.#root.querySelector('[data-action="journal"]').href = journal;
    }

    /** Opens the menu below the emblem. */
    async open() {
        if (this.#menu.open) {
            return;
        }
        const box = this.#opener?.getBoundingClientRect();
        this.#menu.style.top = `${Math.round((box?.bottom ?? 56) + 8)}px`;
        this.#menu.style.left = `${Math.round(Math.max(8, box?.left ?? 8))}px`;
        this.#menu.showModal();
        this.toggleAttribute("open", true);
        this.#opener?.setAttribute("aria-expanded", "true");
        this.#root.querySelector(".item").focus();
    }

    close() {
        this.#menu.close();
    }

    #closed() {
        const open = this.#menu.open;
        this.toggleAttribute("open", open);
        if (!this.#menu.open) {
            this.#opener?.setAttribute("aria-expanded", "false");
        }
        if (!open) {
            this.#opener?.focus({ preventScroll: true });
        }
    }
}

if (!customElements.get("dg-menu")) {
    customElements.define("dg-menu", DgMenu);
}
