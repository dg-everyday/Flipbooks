/**
 * Daily Grace Kids: small pieces the kids page's screens share — icons,
 * escaping, Nari's picture, the Growing Tree, the gentle "toast", and the
 * grown-up gate. Used by kids.js, kids-stop.js and kids-corner.js.
 */

import { piecesFor, treeStage } from "../../../assets/scripts/kids/rules.js?v=20261025-1";

export const escapeHtml = (text) =>
    String(text ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const I = (body, extra = "") =>
    `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"${extra}>${body}</svg>`;

export const ICONS = {
    back: I('<path d="M15 5l-7 7 7 7"/>'),
    next: I('<path d="M9 5l7 7-7 7"/>'),
    close: I('<path d="M6 6l12 12M18 6L6 18"/>'),
    // Every "go back" button: an arrow in a circle, drawn with a finer line.
    backCircle: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10.2"/><path d="M17 12H7.5"/><path d="M11.5 7.6 7.1 12l4.4 4.4"/></svg>',
    // To the Journey Map: a folded map with a red pin, in colour.
    mapPin: `<svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M3 37 15 32l9 5 9-5 12 5-4-15-8 4-9-4-9 4-8-4z" fill="#8fd18a"/>
      <path d="M15 32l9 5V20.5L16 16.5z" fill="#cfe9f7"/><path d="M33 32l-9 5V20.5l8 4z" fill="#6cc0e8"/>
      <path d="M3 37l4-15 8 4-0 6z" fill="#5fb85a"/><path d="M45 37l-4-15-8 4v6z" fill="#5fb85a"/>
      <path d="M3 37 15 32l9 5 9-5 12 5" fill="none" stroke="#3a6b45" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M8 30l7-2 9 4 9-4 7 2" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".85"/>
      <path d="M24 31c-6-7.5-9-12.4-9-16.5a9 9 0 0 1 18 0c0 4.1-3 9-9 16.5z" fill="#e5322d"/>
      <path d="M24 31c-6-7.5-9-12.4-9-16.5a9 9 0 0 1 4.5-7.8C18.2 9 18 11 18 14.5c0 4 2.3 9 6 16.5z" fill="#b8211d"/>
      <circle cx="24" cy="14.5" r="4" fill="#fff"/></svg>`,
    play: I('<path d="M8 5l11 7-11 7z" fill="currentColor"/>'),
    pause: I('<rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/>'),
    speaker: I('<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/>'),
    lock: I('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    // The Grown-ups' Corner: the settings.
    gear: I('<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'),
    map: I('<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>'),
    star: I('<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>'),
    games: I('<rect x="3" y="7" width="18" height="11" rx="4"/><path d="M7 12h4M9 10v4"/><circle cx="16" cy="11" r="1" fill="currentColor"/><circle cx="18" cy="13.5" r="1" fill="currentColor"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'),
    check: I('<path d="M5 12.5l4.5 4.5L19 7"/>', ' stroke-width="3.4"'),
    home: I('<path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9M9 21v-8h6v8"/>'),
    paw: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="currentColor"><ellipse cx="12" cy="16" rx="5.5" ry="4.5"/><circle cx="5.5" cy="10" r="2.3"/><circle cx="9.5" cy="6" r="2.3"/><circle cx="14.5" cy="6" r="2.3"/><circle cx="18.5" cy="10" r="2.3"/></g></svg>',
    print: I('<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>'),
    leaf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 C5 9 11 4 20 4 C20 13 15 19 5 19 Z" fill="#3e9b5f"/><path d="M5 19 L13 11" stroke="#1e6b46" stroke-width="1.6" stroke-linecap="round"/></svg>',
    // Explorers: the Field Guide, the journal, the chapter to read, a compass.
    guide: I('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 3v18"/><circle cx="14" cy="10" r="2.5"/><path d="M11 16h6"/>'),
    book: I('<path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2z"/><path d="M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/>'),
    pen: I('<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>'),
    compass: I('<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>'),
    tree: I('<path d="M12 21v-6"/><path d="M12 3a6 6 0 0 0-6 6 4 4 0 0 0 1 7h10a4 4 0 0 0 1-7 6 6 0 0 0-6-6z"/>'),
    train: I('<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M4 11h16"/><circle cx="8" cy="19" r="1.6"/><circle cx="16" cy="19" r="1.6"/>'),
};

export const BAND_NAMES = { lambs: "Little Lambs · 3–5", lions: "Young Lions · 6–8", explorers: "Explorers · 9–12" };

/** Whether a child is an Explorer (ages 9 to 12). */
export const isExplorer = (child) => child?.band === "explorers";

/** The main Daily Grace site: the home page at the site's root. */
export const DAILY_GRACE_URL = new URL("../../../", import.meta.url).href;

/** The Daily Grace Kids page: the kids app's card and the Kids Stories. */
export const KIDS_MAIN_URL = new URL("../daily-grace-kids.html", import.meta.url).href;

// The Daily Grace Kids logo: assets/images/daily-grace-kids-cartoon-banner.webp,
// trimmed of its clear margin and made smaller.
const LOGO_URL = new URL("../../../assets/images/kids/daily-grace-kids-logo.webp", import.meta.url).href;

/**
 * The top of the welcome and Who's exploring? screens: the Daily Grace Kids
 * logo on the left and a home button on the right, both leading back to the
 * Daily Grace Kids page (whose own home button goes on to Daily Grace).
 */
export function brandLink() {
    return `<div class="top-row">
      <a class="kids-logo" href="${KIDS_MAIN_URL}" aria-label="Daily Grace Kids: back to the Daily Grace Kids page">
        <img src="${LOGO_URL}" alt="" width="720" height="145" /></a>
      <a class="home-btn" href="${KIDS_MAIN_URL}" aria-label="Back to Daily Grace Kids" title="Back to Daily Grace Kids">${ICONS.home}</a>
    </div>`;
}

/**
 * The config every game component takes (kids-common.js), plus its own keys.
 * Explorers play the games as the oldest band does, with `explorer` set for
 * the harder versions, Nari's Explorer lines and the Explorer sounds.
 */
export function gameConfig(app, extra) {
    const child = app.child();
    const explorer = isExplorer(child);
    return {
        band: explorer ? "lions" : child?.band ?? "lambs",
        explorer,
        audio: app.audio,
        resolve: app.resolve,
        sfx: explorer && app.xdata ? { ...app.data.sfx, ...app.xdata.sfx } : app.data.sfx,
        lines: explorer && app.xdata ? { ...app.data.nari.lines, ...app.xdata.nari.lines } : app.data.nari.lines,
        ...extra,
    };
}

export function groupName(group) {
    return {
        AG: "The Whole Armour of God", HB: "Heroes of the Bible", BS: "Bible Sayings",
        FS: "Fruit of the Spirit", AN: "Animals of the Bible",
    }[group] ?? group;
}

/** What a sticker was given for: "your first Look & Find", "finishing stories"… */
export function earnedFor(app, sticker, entry) {
    const path = entry?.path;
    if (path === "firsts") {
        const keys = app.data.stickers.paths.find((p) => p.path === "firsts").firsts;
        const series = app.data.stickers.list.filter((s) => s.group === "AG").map((s) => s.id);
        const key = keys[series.indexOf(sticker.id)];
        return app.data.stickers.firsts[key] ?? "trying something new";
    }
    return {
        stops: "finishing stories", verses: "learning verses", talks: "talking together",
        animals: "finding and matching animals",
    }[path] ?? "what you did in Daily Grace Kids";
}

/** Nari's picture for a stage and pose ("idle", "cheer", "think", "point", "sleep", "avatar"). */
export function nariSrc(app, stage, pose = "idle") {
    const s = app.data.nari.stages.find((n) => n.stage === stage.stage) ?? app.data.nari.stages[0];
    return app.resolve(s.images[pose] ?? s.images.idle);
}

/** The Growing Tree as HTML: the stage picture with its pieces on it. */
export function treeHtml(app, counts, { label = true } = {}) {
    const stage = treeStage(counts.leaves, app.data);
    const pieces = piecesFor(counts, stage);
    const art = app.data.tree.pieces;
    const description = `A ${stage.name.toLowerCase()} with ${counts.leaves} ${counts.leaves === 1 ? "leaf" : "leaves"}, ${counts.fruit} fruit, ${counts.flowers} ${counts.flowers === 1 ? "flower" : "flowers"} and ${counts.birds} ${counts.birds === 1 ? "bird" : "birds"}`;
    return `
      <figure class="tree" role="img" aria-label="${escapeHtml(description)}">
        <img class="tree-art" src="${escapeHtml(app.resolve(stage.image))}" alt="" width="1536" height="1024" />
        ${pieces.map((p) => {
            const list = art[p.kind] ?? [];
            const src = list[(p.n - 1) % Math.max(1, list.length)];
            return src ? `<img class="tree-piece is-${p.kind}" src="${escapeHtml(app.resolve(src))}" alt="" style="left:${p.x * 100}%;top:${p.y * 100}%" />` : "";
        }).join("")}
        ${label ? `<figcaption class="tree-stage">${escapeHtml(stage.name)}</figcaption>` : ""}
      </figure>`;
}

/** A short message at the foot of the screen, read out by screen readers. */
export function toast(message) {
    let box = document.getElementById("kids-toast");
    if (!box) {
        box = document.createElement("div");
        box.id = "kids-toast";
        box.className = "toast";
        box.setAttribute("role", "status");
        document.body.append(box);
    }
    box.textContent = message;
    box.classList.add("show");
    clearTimeout(box.timer);
    box.timer = setTimeout(() => box.classList.remove("show"), 3200);
}

// --------------------------------------------------------------- grown-up gate
const NUMBERS = [
    ["twenty-three", "23"], ["forty-one", "41"], ["thirty-six", "36"],
    ["fifty-two", "52"], ["seventeen", "17"], ["sixty-four", "64"],
];
const HOLD_MS = 3000;

/**
 * The grown-up gate: press and hold for three seconds, then type the number
 * shown in words. Resolves true when passed, false when closed. A small child
 * can't read "forty-one" or hold still for three seconds; a grown-up can.
 */
export function gate(reason = "For grown-ups") {
    return new Promise((resolve) => {
        const [words, digits] = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
        const dialog = document.createElement("dialog");
        dialog.className = "gate";
        dialog.setAttribute("aria-labelledby", "gate-title");
        dialog.innerHTML = `
          <div class="gate-card">
            <button class="round-btn gate-close" type="button" aria-label="Close" data-close>${ICONS.close}</button>
            <span class="gate-lock">${ICONS.lock}</span>
            <h2 id="gate-title">${escapeHtml(reason)}</h2>
            <div class="gate-hold-step">
              <p>Press and hold the button for three seconds.</p>
              <button class="hold" type="button"><span class="hold-fill"></span><span class="hold-text">Press and hold</span></button>
            </div>
            <div class="gate-type-step" hidden>
              <p>Now type this number:</p>
              <p class="gate-words">${escapeHtml(words)}</p>
              <p class="gate-entry" aria-live="polite"><span></span><span></span></p>
              <div class="keypad">
                ${["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"].map((k) => {
                    const label = k === "clear" ? "Clear" : k === "back" ? "Delete" : k;
                    return `<button type="button" class="key" data-key="${k}" aria-label="${label}">${k === "back" ? "⌫" : k === "clear" ? "C" : k}</button>`;
                }).join("")}
              </div>
              <p class="gate-message" aria-live="assertive"></p>
            </div>
            <p class="gate-note">Children: ask a grown-up to help you here.</p>
          </div>`;
        document.body.append(dialog);
        let entry = "";
        let timer = 0;
        let start = 0;
        let frame = 0;
        const fill = dialog.querySelector(".hold-fill");
        const hold = dialog.querySelector(".hold");
        const finish = (ok) => {
            cancelAnimationFrame(frame);
            clearTimeout(timer);
            dialog.close();
            dialog.remove();
            resolve(ok);
        };
        const stopHold = () => {
            cancelAnimationFrame(frame);
            clearTimeout(timer);
            fill.style.width = "0%";
            hold.classList.remove("holding");
        };
        const step = () => {
            fill.style.width = `${Math.min(100, ((performance.now() - start) / HOLD_MS) * 100)}%`;
            frame = requestAnimationFrame(step);
        };
        const beginHold = (event) => {
            event.preventDefault();
            start = performance.now();
            hold.classList.add("holding");
            frame = requestAnimationFrame(step);
            timer = setTimeout(() => {
                stopHold();
                dialog.querySelector(".gate-hold-step").hidden = true;
                dialog.querySelector(".gate-type-step").hidden = false;
                dialog.querySelector('.key[data-key="1"]').focus();
            }, HOLD_MS);
        };
        hold.addEventListener("pointerdown", beginHold);
        for (const type of ["pointerup", "pointerleave", "pointercancel"]) {
            hold.addEventListener(type, stopHold);
        }
        // Keyboard: hold Space or Enter.
        hold.addEventListener("keydown", (event) => {
            if ((event.key === " " || event.key === "Enter") && !event.repeat) {
                beginHold(event);
            }
        });
        hold.addEventListener("keyup", stopHold);
        hold.addEventListener("contextmenu", (event) => event.preventDefault());
        const show = () => {
            const cells = dialog.querySelectorAll(".gate-entry span");
            cells[0].textContent = entry[0] ?? "";
            cells[1].textContent = entry[1] ?? "";
        };
        dialog.querySelector(".keypad").addEventListener("click", (event) => {
            const key = event.target.closest(".key")?.dataset.key;
            if (!key) {
                return;
            }
            const message = dialog.querySelector(".gate-message");
            message.textContent = "";
            if (key === "clear") {
                entry = "";
            } else if (key === "back") {
                entry = entry.slice(0, -1);
            } else if (entry.length < 2) {
                entry += key;
            }
            show();
            if (entry.length === 2) {
                if (entry === digits) {
                    finish(true);
                } else {
                    message.textContent = "That's not quite it. Ask a grown-up to try again.";
                    entry = "";
                    setTimeout(show, 400);
                }
            }
        });
        dialog.querySelector("[data-close]").addEventListener("click", () => finish(false));
        dialog.addEventListener("cancel", (event) => {
            event.preventDefault();
            finish(false);
        });
        dialog.showModal();
        hold.focus();
    });
}

/** A two-button question in a dialog (the page can't use confirm()). Resolves true for yes. */
export function ask(question, { yes = "Yes", no = "Cancel", danger = false } = {}) {
    return new Promise((resolve) => {
        const dialog = document.createElement("dialog");
        dialog.className = "ask";
        dialog.innerHTML = `
          <div class="ask-card">
            <p>${escapeHtml(question)}</p>
            <div class="row">
              <button type="button" class="btn quiet" data-no>${escapeHtml(no)}</button>
              <button type="button" class="btn${danger ? " danger" : ""}" data-yes>${escapeHtml(yes)}</button>
            </div>
          </div>`;
        document.body.append(dialog);
        const end = (value) => {
            dialog.close();
            dialog.remove();
            resolve(value);
        };
        dialog.querySelector("[data-yes]").addEventListener("click", () => end(true));
        dialog.querySelector("[data-no]").addEventListener("click", () => end(false));
        dialog.addEventListener("cancel", (event) => {
            event.preventDefault();
            end(false);
        });
        dialog.showModal();
        dialog.querySelector("[data-no]").focus();
    });
}
