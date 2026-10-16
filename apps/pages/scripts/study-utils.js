/**
 * Small helpers shared by the study pages (peoples.html, bible-books.html).
 */

import { watchScripture } from "../../components/scripture-refs.js?v=20261002-1";

// Every study page imports this file, so every Bible reference the pages
// render, now or later (an opened panel, a filter, the blueprint test), is a
// pill that opens the passage in a popup.
watchScripture(document.body);

// The pages sit at apps/pages/, so the site root is two levels up. Data paths
// are written relative to the site root ("assets/..."), like stories.js.
export function siteRoot() {
    return new URL("../../", document.baseURI);
}

export async function fetchJson(path) {
    const response = await fetch(new URL(path, siteRoot()));
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${path}`);
    }
    return response.json();
}

/**
 * Tiny DOM builder. Strings become text nodes, so nothing from the data is
 * ever parsed as HTML. Falsy children are dropped, which keeps optional parts
 * inline: h('p', {}, maybe && h('b', {}, maybe)). That includes 0, because the
 * usual guard is list.length && …, which gives 0 for an empty list; pass a
 * string, String(n), to show a count that may be zero.
 */
export function h(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
        if (value == null || value === false) {
            continue;
        }
        if (key === "class") {
            node.className = value;
        } else if (key.startsWith("on")) {
            node.addEventListener(key.slice(2), value);
        } else {
            node.setAttribute(key, value === true ? "" : value);
        }
    }
    for (const child of children.flat(Infinity)) {
        if (child == null || child === false || child === "" || child === 0) {
            continue;
        }
        node.append(child instanceof Node ? child : String(child));
    }
    return node;
}

/** A row of scripture references (pills, once linked), or null when there are none. */
export function refList(refs) {
    if (!Array.isArray(refs) || refs.length === 0) {
        return null;
    }
    return h(
        "ul",
        { class: "refs", "aria-label": "Scripture references" },
        refs.map((r) => h("li", {}, r)),
    );
}

export function para(text, cls) {
    return text ? h("p", { class: cls }, text) : null;
}

// A funnel, in the line style of the page's other icons. A fixed string.
const FUNNEL_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 4.5h17l-6.5 8v6l-4 2v-8z"/></svg>';
const POPOVER = Object.prototype.hasOwnProperty.call(
    HTMLElement.prototype,
    "popover",
);
// What each guide holds, how to use it and why it matters, keyed by page file.
const GUIDE_INFO = "assets/guide-info.json";

let guideInfoData = null;
let guideInfoDialog = null;

/**
 * The hero's "About this guide" button: a red "i" after the guide's title
 * (filterMenu() returns it as info; titleWithInfo() puts it in the title). A
 * tap opens a popup telling what the guide holds, how to use it, why it
 * matters, and a verse for it, from assets/guide-info.json under the page's
 * file name, fetched on the first tap.
 */
export function guideInfoButton() {
    const button = h(
        "button",
        {
            type: "button",
            class: "guide-info-toggle",
            "aria-label": "About this guide",
            title: "About this guide",
            "aria-haspopup": "dialog",
        },
        h("span", { "aria-hidden": "true" }, "i"),
    );
    button.addEventListener("click", openGuideInfo);
    return button;
}

/**
 * A hero title with the guide's info button after its last word, for h1:
 * h("h1", {}, titleWithInfo("Books of the Bible", filters.info)). The last
 * word and the button are kept together, so the "i" never wraps on its own.
 */
export function titleWithInfo(title, info) {
    const at = title.lastIndexOf(" ") + 1;
    return [
        title.slice(0, at),
        h("span", { class: "title-end" }, title.slice(at), info),
    ];
}

function loadGuideInfo() {
    if (!guideInfoData) {
        guideInfoData = fetchJson(GUIDE_INFO).catch((error) => {
            guideInfoData = null; // the next tap tries again
            throw error;
        });
    }
    return guideInfoData;
}

function createGuideInfoDialog() {
    const close = h(
        "button",
        { type: "button", class: "guide-info-close", "aria-label": "Close" },
        "×",
    );
    const title = h(
        "h2",
        { id: "guide-info-title" },
        document.querySelector(".hero h1")?.textContent || "This guide",
    );
    const body = h("div", { class: "guide-info-body" });
    const dialog = h(
        "dialog",
        { class: "guide-info", "aria-labelledby": "guide-info-title" },
        h(
            "article",
            { class: "guide-info-card" },
            close,
            h(
                "header",
                { class: "guide-info-head" },
                h("p", { class: "guide-info-eyebrow" }, "About this guide"),
                title,
            ),
            body,
        ),
    );
    close.addEventListener("click", () => dialog.close());
    // A tap on the dimmed page around the card closes it too.
    dialog.addEventListener("click", (e) => {
        if (e.target === dialog) {
            dialog.close();
        }
    });
    // The page behind stays put while the popup is open.
    dialog.addEventListener("close", () => {
        document.documentElement.classList.remove("guide-info-open");
    });
    document.body.append(dialog);
    return { dialog, title, body };
}

function guideInfoContent(info) {
    return [
        para(info.summary, "guide-info-summary"),
        h(
            "section",
            {},
            h("h3", {}, "What's inside"),
            info.inside.map((text) => h("p", {}, text)),
        ),
        h(
            "section",
            {},
            h("h3", {}, "How to use it"),
            h(
                "ul",
                {},
                info.use.map((text) => h("li", {}, text)),
            ),
        ),
        h(
            "section",
            {},
            h("h3", {}, "Why it matters"),
            info.why.map((text) => h("p", {}, text)),
        ),
        info.verse &&
            h(
                "blockquote",
                { class: "guide-info-verse" },
                h("p", {}, `“${info.verse.text}”`),
                // In a quotation only a <cite> is linked (scripture-refs.js),
                // so the reference becomes a pill that opens the passage.
                h("cite", {}, info.verse.ref),
            ),
    ];
}

async function openGuideInfo() {
    if (!guideInfoDialog) {
        guideInfoDialog = createGuideInfoDialog();
    }
    const { dialog, title, body } = guideInfoDialog;
    if (!dialog.open) {
        dialog.showModal();
        dialog.scrollTop = 0;
        document.documentElement.classList.add("guide-info-open");
    }
    if (body.dataset.loaded) {
        return;
    }
    body.replaceChildren(h("p", { class: "guide-info-message" }, "Loading…"));
    const page = location.pathname.split("/").pop();
    try {
        const info = (await loadGuideInfo())[page];
        if (!info) {
            throw new Error(`No guide information for ${page}`);
        }
        title.textContent = info.title;
        body.replaceChildren(...guideInfoContent(info).filter(Boolean));
        body.dataset.loaded = "true";
    } catch (error) {
        console.warn("The guide information could not be loaded:", error);
        body.replaceChildren(
            h(
                "p",
                { class: "guide-info-message" },
                "This guide's description could not be loaded. Please try again.",
            ),
        );
    }
}

/**
 * The hero's filter menu, so a page opens on its title, its words and its
 * search, and the rest waits a tap away. Returns { button, menu, info }: the
 * funnel goes first in the hero (it sits in the top-right corner), the menu
 * last, and the info button (guideInfoButton) at the end of the title, by
 * titleWithInfo(). The menu holds whatever is passed in, usually the page's counts and
 * filter chips, and pops up under the button over the page; a tap outside it,
 * its close button or Escape puts it away. It stays inside the hero in the
 * document, so the page's own filter code finds its chips as before and the
 * menu takes the hero's background.
 *
 * The button carries a dot while a filter narrows the list: while, in any
 * group of chips, the one pressed is not the first ("All", "Everything").
 * Browsers without popovers show the menu in the hero itself, under the button.
 */
export function filterMenu(...content) {
    const id = "filter-menu";
    const button = h("button", {
        type: "button",
        class: "filter-toggle",
        "aria-label": "Filters",
        title: "Filters",
        "aria-controls": id,
        "aria-expanded": "false",
    });
    button.innerHTML = FUNNEL_ICON;
    const close = h(
        "button",
        {
            type: "button",
            class: "filter-menu-close",
            "aria-label": "Close filters",
        },
        "×",
    );
    const menu = h(
        "div",
        { class: "filter-menu", id, role: "dialog", "aria-label": "Filters" },
        h(
            "div",
            { class: "filter-menu-head" },
            h("p", { class: "filter-menu-title" }, "Filters"),
            close,
        ),
        content,
    );

    const isOpen = () =>
        POPOVER ? menu.matches(":popover-open") : !menu.hidden;
    const hide = () => {
        if (!isOpen()) {
            return;
        }
        if (POPOVER) {
            menu.hidePopover();
        } else {
            menu.hidden = true;
            button.setAttribute("aria-expanded", "false");
        }
    };

    // Under the button, right-aligned with the hero and no wider than it. The
    // popover is in the top layer, where absolute positions are on the page.
    function place() {
        const hero = button.closest(".hero") || button.parentElement;
        const area = hero.getBoundingClientRect();
        const below = button.getBoundingClientRect().bottom + 10;
        const width = Math.min(area.width, 640);
        menu.style.width = `${width}px`;
        menu.style.left = `${area.right - width + window.scrollX}px`;
        menu.style.top = `${below + window.scrollY}px`;
    }

    if (POPOVER) {
        menu.setAttribute("popover", "auto");
        button.setAttribute("popovertarget", id);
        menu.addEventListener("beforetoggle", (e) => {
            if (e.newState === "open") {
                place();
            }
        });
        menu.addEventListener("toggle", (e) =>
            button.setAttribute("aria-expanded", String(e.newState === "open")),
        );
        window.addEventListener("resize", () => {
            if (isOpen()) {
                place();
            }
        });
    } else {
        menu.hidden = true;
        menu.classList.add("is-inline");
        button.addEventListener("click", () => {
            menu.hidden = !menu.hidden;
            button.setAttribute("aria-expanded", String(!menu.hidden));
        });
    }
    close.addEventListener("click", () => {
        hide();
        button.focus();
    });
    // A link in the menu (#blueprint-test) leads somewhere else on the page.
    menu.addEventListener("click", (e) => {
        if (e.target.closest('a[href^="#"]')) {
            hide();
        }
    });

    const syncDot = () => {
        const filtering = [...menu.querySelectorAll('[role="group"]')].some(
            (group) => {
                // A group put away for now (another view's), not the closed menu itself.
                const away = group.closest("[hidden]");
                if (away && away !== menu) {
                    return false;
                }
                const chips = [...group.querySelectorAll("[aria-pressed]")];
                return (
                    chips.findIndex(
                        (c) => c.getAttribute("aria-pressed") === "true",
                    ) > 0
                );
            },
        );
        button.classList.toggle("is-filtering", filtering);
        button.setAttribute(
            "aria-label",
            filtering ? "Filters (some are on)" : "Filters",
        );
    };
    new MutationObserver(syncDot).observe(menu, {
        subtree: true,
        attributes: true,
        attributeFilter: ["aria-pressed", "hidden"],
    });
    syncDot();

    return { button, menu, info: guideInfoButton() };
}

// A hold on the scroll ends at the reader's first touch, wheel or key, once
// the page has been still this long after it settled, or after HOLD_MAX at most.
const HOLD_INPUTS = ["pointerdown", "touchstart", "wheel", "keydown"];
const HOLD_QUIET = 600;
const HOLD_MAX = 6000;
let releaseHold = null;

/**
 * Scrolls el to just under the topbar. A click glides there (smooth); arriving
 * from a link (#ruth) jumps straight there, 'instant' rather than 'auto'
 * because the page sets scroll-behavior: smooth.
 *
 * A jump on arrival is then held in place while the page settles. Fonts swap
 * in, and the Bible references above el turn into pills (watchScripture), and
 * each changes the height of everything before it. Chrome keeps the reader's
 * place through that; Safari does not, so the page jerked and the reader
 * landed somewhere else.
 */
export function scrollUnderTopbar(el, { smooth = true } = {}) {
    releaseHold?.();
    const offset = () =>
        (document.querySelector(".topbar")?.offsetHeight || 0) + 12;
    const glide =
        smooth && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - offset(),
        behavior: glide ? "smooth" : "instant",
    });
    if (!smooth) {
        holdInView(el, offset);
    }
}

function holdInView(el, offset) {
    const root = document.documentElement;
    const started = performance.now();
    let still = started;
    let settled = false;
    let frame = 0;
    // Should the browser make its own jump to the #fragment (when el carries
    // that id), it lands in the same place instead of fighting the hold.
    const padding = root.style.scrollPaddingTop;
    root.style.scrollPaddingTop = `${offset()}px`;

    const release = () => {
        cancelAnimationFrame(frame);
        for (const type of HOLD_INPUTS) {
            removeEventListener(type, release, true);
        }
        root.style.scrollPaddingTop = padding;
        if (releaseHold === release) {
            releaseHold = null;
        }
    };
    releaseHold = release;
    for (const type of HOLD_INPUTS) {
        addEventListener(type, release, { capture: true, passive: true });
    }

    const loaded =
        document.readyState === "complete"
            ? null
            : new Promise((resolve) =>
                  addEventListener("load", resolve, { once: true }),
              );
    Promise.all([document.fonts?.ready, loaded]).then(() => {
        settled = true;
        still = performance.now();
    });

    const tick = (now) => {
        if (!el.isConnected) {
            return release();
        }
        const drift = el.getBoundingClientRect().top - offset();
        if (Math.abs(drift) > 1) {
            const before = window.scrollY;
            window.scrollTo({ top: before + drift, behavior: "instant" });
            // Near the foot of the page el may not reach the top; that is still.
            if (window.scrollY !== before) {
                still = now;
            }
        }
        if ((settled && now - still > HOLD_QUIET) || now - started > HOLD_MAX) {
            return release();
        }
        frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
}

/**
 * Opens a detail panel inside a grid, directly under the row of the tile that
 * was clicked — never as a popup — and keeps only one open at a time. Used by
 * bible-books.html and heroes-and-villains.html.
 *
 * Tiles are buttons carrying data-id; the panel is any element with the
 * .row-panel styles from study-page.css. The open tile's id is kept in the URL
 * hash (#ruth) so it can be linked to. Escape closes the panel.
 */
export function rowExpander({ tileSelector }) {
    let tile = null;
    let panel = null;
    // The grid's width when the panel was last placed: the tiles per row, and
    // so where the panel belongs, depend on nothing else.
    let placedWidth = 0;
    // Where the open panel sat on screen when the reader last scrolled. A new
    // width rewraps everything above the panel before any resize handler runs,
    // so its place has to be known from before.
    let readingTop = null;
    const notePlace = () => {
        readingTop = panel?.isConnected ? panel.getBoundingClientRect().top : null;
    };
    window.addEventListener("scroll", notePlace, { passive: true });

    // Put the panel straight after the last visible tile on the open tile's
    // row, so it spans the grid right under that row. Re-run when the width
    // changes, since the number of tiles per row changes with it.
    //
    // keepPlace: the reader is in the middle of the page, so after the panel
    // moves, scroll it back to where it was on screen when they last scrolled.
    // Taking the panel out to measure shortens the page for a moment, and the
    // browser would otherwise pull the scroll position up with it and leave
    // the reader screens away.
    function place({ keepPlace = false } = {}) {
        if (!tile) {
            return;
        }
        const before = keepPlace ? readingTop : null;
        // Measure rows without the panel: while it sits in the grid it forces the
        // tiles after it onto a new line, which would hide where the row ends.
        panel.remove();
        const tiles = [
            ...tile.parentElement.querySelectorAll(tileSelector),
        ].filter((t) => !t.hidden);
        const top = tile.offsetTop;
        let last = tile;
        for (const t of tiles.slice(tiles.indexOf(tile) + 1)) {
            if (t.offsetTop !== top) {
                break;
            }
            last = t;
        }
        last.after(panel);
        // Point the notch at the middle of the open tile (the grid is the tiles'
        // offsetParent, so this is measured from the panel's own left edge).
        panel.style.setProperty(
            "--notch-x",
            `${tile.offsetLeft + tile.offsetWidth / 2}px`,
        );
        placedWidth = tile.parentElement.clientWidth;
        if (before !== null) {
            const moved = panel.getBoundingClientRect().top - before;
            if (Math.abs(moved) > 1) {
                window.scrollBy({ top: moved, behavior: "instant" });
            }
        }
        notePlace();
    }

    function close({ keepHash = false, focus = false } = {}) {
        if (!tile) {
            return;
        }
        const wasOpen = tile;
        wasOpen.setAttribute("aria-expanded", "false");
        wasOpen.classList.remove("is-open");
        panel.remove();
        tile = panel = null;
        if (!keepHash && location.hash) {
            history.replaceState(null, "", location.pathname + location.search);
        }
        if (focus) {
            wasOpen.focus();
        }
    }

    function open(newTile, newPanel, { smooth = true } = {}) {
        close({ keepHash: true });
        tile = newTile;
        panel = newPanel;
        tile.setAttribute("aria-expanded", "true");
        tile.classList.add("is-open");
        place();
        history.replaceState(null, "", `#${tile.dataset.id}`);
        // Keep the tile in view with its details right below it.
        scrollUnderTopbar(tile, { smooth });
    }

    // A phone resizes the window every time its address bar slides in or out,
    // which is all the time while the reader scrolls. Only the height changes
    // then, and the rows stay as they are, so the panel is left alone: moving
    // it threw the reader thousands of pixels from what they were reading.
    let pending = 0;
    window.addEventListener("resize", () => {
        cancelAnimationFrame(pending);
        pending = requestAnimationFrame(() => {
            if (tile && tile.parentElement.clientWidth !== placedWidth) {
                place({ keepPlace: true });
            }
        });
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && tile) {
            close({ focus: true });
        }
    });

    return {
        open,
        close,
        place,
        get openId() {
            return tile ? tile.dataset.id : null;
        },
        get openTile() {
            return tile;
        },
    };
}

/** Calls open(id) for the id in the URL hash now, and whenever it changes. */
export function followHash(open) {
    const fromHash = () => {
        const id = decodeURIComponent(location.hash.slice(1));
        if (id) {
            open(id);
        }
    };
    window.addEventListener("hashchange", fromHash);
    fromHash();
}
