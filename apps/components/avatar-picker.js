/**
 * <avatar-picker> — every reader chooses an avatar: a Bible hero who is their
 * picture in Daily Grace (assets/avatars.json, pictures on the media host).
 *
 * When the page opens and the reader has no avatar yet, the picker opens by
 * itself and stays until they choose one: it has no Close button, and Escape
 * and a tap outside it do nothing. Tapping a hero selects it and shows who
 * they are; "Choose …" keeps the choice (assets/scripts/avatar-store.js).
 * Opened later with open(), to change the avatar, it can be closed as usual.
 * If the list of avatars cannot be loaded (offline, say), the reader can
 * close it and is asked again next time.
 *
 * The chosen avatar replaces the picture of the `icon` <img>: on the home
 * page, the DG emblem to the right of the hamburger, which keeps opening the
 * DG menu.
 *
 * Usage
 *   <img id="dg-open-icon" src="assets/images/dg-icon-gold-256.webp" alt="" />
 *   <avatar-picker icon="dg-open-icon"></avatar-picker>
 *   <script type="module" src="./apps/components/avatar-picker.js"></script>
 *
 * Attributes
 *   icon   id of the <img> that shows the reader's avatar
 *
 * Properties   required (read-only)  whether the reader still has to choose
 * Methods      open()  open the picker to change the avatar
 * Events       avatarchosen  detail: { id }
 *
 * Fonts: Germania One and Strait are registered on the document by
 * assets/scripts/fonts.js, because browsers do not reliably load @font-face
 * rules declared inside a shadow root.
 */

import { registerFonts } from "../../assets/scripts/fonts.js";
import {
    AVATAR_CHANGE,
    avatarImage,
    chooseAvatar,
    chosenAvatarId,
    hasAvatar,
    loadAvatars,
} from "../../assets/scripts/avatar-store.js?v=20261023-1";

const ICON_ATTRS =
    'viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const CLOSE_ICON = `<svg ${ICON_ATTRS}><path d="m6 6 12 12M18 6 6 18"/></svg>`;
const CHECK_ICON = `<svg ${ICON_ATTRS} stroke-width="3"><polyline points="5 12 10 17 19 7"/></svg>`;

const escapeHtml = (text) =>
    String(text ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const STYLES = /* css */ `
  :host {
    --ap-navy: var(--navy, #001b34);
    --ap-gold: var(--gold, #c6922e);
    --ap-gold-light: var(--gold-light, #e1b65d);
    --ap-gold-ink: #7d5a12;
    --ap-paper: #fffaf1;
    --ap-cream: #f6eedf;
    --ap-ink: #10253b;
    --ap-muted: #56606e;
    --ap-line: #e2d5bb;
    display: contents;
  }
  * { box-sizing: border-box; }
  button { font: inherit; }
  [hidden] { display: none !important; }

  /* Full screen on a phone, a centred card on a wider screen. */
  dialog {
    width: 100%; max-width: 100%; height: 100%; max-height: 100%;
    margin: 0; padding: 0; border: 0;
    background: var(--ap-paper); color: var(--ap-ink);
  }
  dialog::backdrop { background: rgb(0 27 52 / 72%); }
  @media (min-width: 700px) {
    dialog {
      width: min(720px, calc(100vw - 48px)); height: min(860px, calc(100dvh - 48px));
      margin: auto; border-radius: 22px;
      box-shadow: 0 24px 60px rgb(0 0 0 / 35%);
    }
  }
  .frame { display: flex; flex-direction: column; height: 100%; }

  .head {
    position: relative;
    padding: max(22px, env(safe-area-inset-top)) 24px 14px;
    text-align: center;
    border-bottom: 1px solid var(--ap-line);
  }
  .eyebrow {
    margin: 0 0 4px; color: var(--ap-gold-ink);
    font: 700 .82rem/1.2 'Strait', 'Roboto', sans-serif;
    letter-spacing: .16em; text-transform: uppercase;
  }
  h2 { margin: 0; color: var(--ap-navy); font: 400 2rem/1.1 'Germania One', Georgia, serif; letter-spacing: .02em; }
  h2:focus { outline: none; }
  .lead { margin: 8px auto 0; max-width: 34em; color: var(--ap-muted); font: 400 1.02rem/1.45 'Strait', 'Roboto', sans-serif; text-wrap: pretty; }
  .close {
    position: absolute; top: max(14px, env(safe-area-inset-top)); right: 14px;
    display: grid; place-items: center; width: 44px; height: 44px;
    border: 1.5px solid var(--ap-line); border-radius: 50%;
    background: #fff; color: var(--ap-navy); cursor: pointer;
  }
  .close svg { width: 20px; height: 20px; }
  .close:focus-visible { outline: 2px solid var(--ap-navy); outline-offset: 2px; }

  .list { flex: 1; min-height: 0; overflow-y: auto; padding: 16px 16px 20px; overscroll-behavior: contain; }
  .grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 12px 8px;
    margin: 0; padding: 0; list-style: none;
  }
  .hero {
    position: relative;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    width: 100%; padding: 8px 4px 10px;
    border: 2px solid transparent; border-radius: 16px;
    background: none; color: var(--ap-ink); cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .hero img { display: block; width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }
  .hero span { font: 700 .95rem/1.15 'Strait', 'Roboto', sans-serif; text-align: center; }
  .hero:hover { background: var(--ap-cream); }
  .hero:focus-visible { outline: 2px solid var(--ap-navy); outline-offset: 2px; }
  .hero[aria-pressed="true"] { border-color: var(--ap-gold); background: var(--ap-cream); }
  .hero .tick {
    position: absolute; top: 4px; right: calc(50% - 46px);
    display: none; place-items: center; width: 26px; height: 26px;
    border-radius: 50%; background: var(--ap-gold); color: #fff;
    box-shadow: 0 2px 6px rgb(0 0 0 / 25%);
  }
  .hero .tick svg { width: 15px; height: 15px; }
  .hero[aria-pressed="true"] .tick { display: grid; }
  .message { margin: 24px 0; color: var(--ap-muted); font: 400 1.05rem/1.45 'Strait', 'Roboto', sans-serif; text-align: center; }

  .foot {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 18px max(18px, env(safe-area-inset-bottom));
    border-top: 1px solid var(--ap-line); background: var(--ap-cream);
  }
  .chosen { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
  .chosen img { flex: none; width: 48px; height: 48px; border-radius: 50%; }
  .chosen-text { min-width: 0; font: 400 .95rem/1.3 'Strait', 'Roboto', sans-serif; color: var(--ap-muted); }
  .chosen-text strong { display: block; color: var(--ap-navy); font-size: 1.05rem; }
  .choose, .retry, .later {
    display: flex; align-items: center; justify-content: center; flex: none;
    min-height: 50px; padding: 0 22px;
    border: 0; border-radius: 999px;
    background: var(--ap-navy); color: #fff;
    font: 700 1.05rem 'Strait', 'Roboto', sans-serif;
    cursor: pointer;
  }
  .later { border: 1.5px solid #c9b78f; background: none; color: var(--ap-navy); }
  .choose:disabled { opacity: .45; cursor: default; }
  .choose:focus-visible, .retry:focus-visible, .later:focus-visible { outline: 3px solid var(--ap-gold); outline-offset: 2px; }

  @media (prefers-reduced-motion: no-preference) {
    .hero { transition: background-color .15s ease, border-color .15s ease; }
  }
`;

export class AvatarPicker extends HTMLElement {
    static observedAttributes = ["icon"];

    #root;
    #dialog;
    #avatars = [];
    #selected = null;
    // True while the reader has no avatar: the picker cannot be closed.
    #required = false;
    #onChange = (event) => this.#showIcon(event.detail.id);

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: "open" });
        this.#root.innerHTML = `
      <style>${STYLES}</style>
      <dialog aria-labelledby="picker-title" aria-describedby="picker-lead">
        <div class="frame">
          <header class="head">
            <p class="eyebrow">Welcome to Daily Grace</p>
            <h2 id="picker-title" tabindex="-1">Choose your avatar</h2>
            <p class="lead" id="picker-lead">Pick a Bible hero to be your picture in Daily Grace. You can change it any time from the menu under your avatar.</p>
            <button class="close" type="button" aria-label="Close" title="Close" hidden>${CLOSE_ICON}</button>
          </header>
          <div class="list"><p class="message">Loading the avatars…</p></div>
          <div class="foot">
            <div class="chosen" aria-live="polite">
              <span class="chosen-text">Tap a hero to choose your avatar.</span>
            </div>
            <button class="choose" type="button" disabled>Choose</button>
          </div>
        </div>
      </dialog>`;
        this.#dialog = this.#root.querySelector("dialog");

        // Until an avatar is chosen, Escape does not close the picker.
        this.#dialog.addEventListener("cancel", (event) => {
            if (this.#required) {
                event.preventDefault();
            }
        });
        this.#dialog.addEventListener("click", (event) => {
            if (event.target === this.#dialog) {
                if (!this.#required) {
                    this.#dialog.close();
                }
                return;
            }
            const hero = event.target.closest(".hero");
            if (hero) {
                this.#select(hero.dataset.id);
                return;
            }
            if (event.target.closest(".choose")) {
                this.#choose();
            } else if (event.target.closest(".retry")) {
                this.#load();
            } else if (event.target.closest(".close, .later")) {
                this.#dialog.close();
            }
        });
    }

    connectedCallback() {
        registerFonts();
        window.addEventListener(AVATAR_CHANGE, this.#onChange);
        const id = chosenAvatarId();
        if (id) {
            this.#showIcon(id);
        } else {
            this.#required = true;
            this.#open();
        }
    }

    disconnectedCallback() {
        window.removeEventListener(AVATAR_CHANGE, this.#onChange);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.isConnected) {
            this.#showIcon(chosenAvatarId());
        }
    }

    get required() {
        return this.#required;
    }

    /** Opens the picker to change the avatar. */
    open() {
        this.#required = !hasAvatar();
        this.#open();
    }

    #open() {
        const els = this.#els();
        els.eyebrow.textContent = this.#required ? "Welcome to Daily Grace" : "My avatar";
        els.close.hidden = this.#required;
        this.#selected = chosenAvatarId();
        if (!this.#dialog.open) {
            this.#dialog.showModal();
        }
        els.title.focus();
        this.#load();
    }

    #els() {
        const $ = (selector) => this.#root.querySelector(selector);
        return {
            eyebrow: $(".eyebrow"),
            title: $("h2"),
            close: $(".close"),
            list: $(".list"),
            foot: $(".foot"),
            chosen: $(".chosen"),
            choose: $(".choose"),
        };
    }

    async #load() {
        const els = this.#els();
        try {
            this.#avatars = await loadAvatars();
        } catch (error) {
            console.warn("The avatars could not be loaded:", error);
            els.list.innerHTML = `
          <p class="message">The avatars could not be loaded. Please check your connection and try again.</p>`;
            els.foot.innerHTML = `
          <span class="chosen"></span>
          <button class="later" type="button">Later</button>
          <button class="retry" type="button">Try again</button>`;
            // Nothing to choose from: the reader may go on and is asked next time.
            this.#required = false;
            return;
        }
        this.#required = !hasAvatar();
        els.close.hidden = this.#required;
        els.foot.innerHTML = `
          <div class="chosen" aria-live="polite"></div>
          <button class="choose" type="button" disabled>Choose</button>`;
        els.list.innerHTML = `<ul class="grid">${this.#avatars
            .map(
                (avatar) => `
          <li><button class="hero" type="button" data-id="${escapeHtml(avatar.id)}" aria-pressed="false">
            <span class="tick">${CHECK_ICON}</span>
            <img src="${escapeHtml(avatarImage(avatar, { thumbnail: true }))}" alt="" width="128" height="128" loading="lazy" decoding="async" />
            <span>${escapeHtml(avatar.hero)}</span>
          </button></li>`,
            )
            .join("")}</ul>`;
        this.#renderFoot();
        this.#root
            .querySelector(`.hero[data-id="${CSS.escape(this.#selected ?? "")}"]`)
            ?.scrollIntoView({ block: "center" });
    }

    #select(id) {
        this.#selected = id;
        this.#renderFoot();
    }

    #renderFoot() {
        const els = this.#els();
        for (const hero of this.#root.querySelectorAll(".hero")) {
            hero.setAttribute("aria-pressed", String(hero.dataset.id === this.#selected));
        }
        const avatar = this.#avatars.find((item) => item.id === this.#selected);
        if (!avatar) {
            els.chosen.innerHTML = `<span class="chosen-text">Tap a hero to choose your avatar.</span>`;
            els.choose.disabled = true;
            els.choose.textContent = "Choose";
            return;
        }
        const reference = avatar.reference && avatar.reference !== "—" ? ` · ${avatar.reference}` : "";
        els.chosen.innerHTML = `
          <img src="${escapeHtml(avatarImage(avatar, { thumbnail: true }))}" alt="" width="128" height="128" />
          <span class="chosen-text"><strong>${escapeHtml(avatar.hero)}</strong>${escapeHtml(avatar["known-for"])}${escapeHtml(reference)}</span>`;
        els.choose.disabled = false;
        els.choose.textContent = `Choose ${avatar.hero}`;
    }

    #choose() {
        if (!this.#selected) {
            return;
        }
        chooseAvatar(this.#selected);
        this.#required = false;
        this.#dialog.close();
        this.dispatchEvent(
            new CustomEvent("avatarchosen", { detail: { id: this.#selected } }),
        );
    }

    /** Shows the avatar with `id` in the `icon` <img>. */
    async #showIcon(id) {
        const icon = document.getElementById(this.getAttribute("icon") ?? "");
        if (!icon || !id) {
            return;
        }
        let avatar;
        try {
            avatar = (await loadAvatars()).find((item) => item.id === id);
        } catch {
            return; // the DG emblem stays
        }
        if (avatar) {
            icon.src = avatarImage(avatar, { thumbnail: true });
            icon.classList.add("is-avatar");
        }
    }
}

if (!customElements.get("avatar-picker")) {
    customElements.define("avatar-picker", AvatarPicker);
}
