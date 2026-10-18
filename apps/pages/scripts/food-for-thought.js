/**
 * Food for Thought — drives food-for-thought.html.
 *
 * Reads assets/food-for-thought.json (built and verse-checked by
 * tools/food-for-thought/build_food_for_thought.py): 81 topics in seven
 * sections, each a verse to feed the mind, the body or the spirit, with what it
 * guards against, how it feeds you, one serving for today, the signs of hunger
 * and a question to chew on. Each section is a set of cards; clicking one
 * opens it in place, under the row it sits in (rowExpander in study-utils.js).
 * #not-by-bread-alone in the URL opens it, which is how the home page's
 * <daily-food-for-thought> links here.
 */

import {
    h,
    fetchJson,
    para,
    refList,
    rowExpander,
    followHash,
    filterMenu,
    titleWithInfo,
} from "./study-utils.js?v=20261018-1";

const DATA = "assets/food-for-thought.json";
const IMAGES = "../../assets/images/food-for-thought-assets/";

// Per section: a CSS class for its colour, and a line icon (24 × 24).
const SECTIONS = {
    "The daily diet": {
        cls: "s-diet",
        icon: '<path d="M4 11h16a8 8 0 0 1-16 0z"/><path d="M9 7.5c0-1 1-1.5 1-2.5M13 7.5c0-1 1-1.5 1-2.5"/>',
    },
    "Feeding the mind": {
        cls: "s-mind",
        icon: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
    },
    "Keeping the body fit": {
        cls: "s-body",
        icon: '<circle cx="12" cy="5" r="2"/><path d="M12 7v7M7.5 10.5h9M12 14l-3 6M12 14l3 6"/>',
    },
    "Armour for the fight": {
        cls: "s-armour",
        icon: '<path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"/><path d="M12 7v10"/>',
    },
    "Junk food for the soul": {
        cls: "s-junk",
        icon: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
    },
    "Staying in shape": {
        cls: "s-shape",
        icon: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
    },
    "Lessons from the Bible's table": {
        cls: "s-table",
        icon: '<circle cx="12" cy="13" r="6"/><path d="M4 4v6M6 4v6M5 10v10M20 4c-1.5 1-2 3-2 5h2v11"/>',
    },
};

// The three areas a topic feeds, each with its badge (the circle images).
const AREAS = {
    Mind: { cls: "a-mind", image: "fft-brain.webp" },
    Body: { cls: "a-body", image: "fft-body.webp" },
    Spirit: { cls: "a-spirit", image: "fft-spirit.webp" },
};

function icon(section, cls) {
    const span = h("span", { class: cls, "aria-hidden": "true" });
    // A fixed string from SECTIONS above, never data.
    span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${SECTIONS[section]?.icon || ""}</svg>`;
    return span;
}

/** An area's round badge; decorative where its name is shown beside it. */
function badge(area, size, alt = "") {
    return h("img", {
        class: "ft-badge",
        src: `${IMAGES}${AREAS[area].image}`,
        width: size,
        height: size,
        alt,
        loading: "lazy",
    });
}

const areaList = (areas) => areas.join(" · ");

// ------------------------------------------------------------------ cards

function tile(item, onToggle) {
    return h(
        "button",
        {
            type: "button",
            class: "ft-tile",
            id: `tile-${item.id}`,
            "data-id": item.id,
            "aria-expanded": "false",
            "aria-controls": "ft-detail",
            onclick: () => onToggle(item.id),
        },
        h(
            "span",
            { class: "ft-badges" },
            item.areas.map((a) => badge(a, 30)),
        ),
        h(
            "span",
            { class: "ft-text" },
            h("span", { class: "ft-name" }, item.name),
            item.person && h("span", { class: "ft-person" }, item.person),
            h("span", { class: "ft-guards" }, `Guards against: ${item.guards}`),
            h(
                "span",
                { class: "ft-meta" },
                `${areaList(item.areas)} · ${item.food.map((f) => f.reference).join("; ")}`,
            ),
        ),
    );
}

// ------------------------------------------------------------------ detail

function detail(item, onClose) {
    const s = SECTIONS[item.section];
    const block = (title, ...body) =>
        h("section", { class: "detail-block" }, h("h4", {}, title), body);

    // The food: the key verse, set as a quotation.
    const food = h(
        "div",
        { class: "ft-food" },
        item.food.map((f) =>
            h(
                "figure",
                { class: "ft-verse" },
                h("blockquote", {}, f.text),
                h("figcaption", {}, f.reference),
            ),
        ),
    );

    // One small practice, in our own words, set apart from Scripture.
    const serving = h(
        "figure",
        { class: "ft-serving" },
        h("p", {}, item.serving),
        h("figcaption", {}, "A serving in our own words"),
    );

    const facts = h(
        "dl",
        { class: "facts" },
        h("dt", {}, "Section"),
        h("dd", {}, item.section),
        h("dt", {}, "Feeds the"),
        h(
            "dd",
            {},
            h(
                "ul",
                { class: "ft-areas" },
                item.areas.map((a) =>
                    h("li", { class: AREAS[a].cls }, badge(a, 22), a),
                ),
            ),
        ),
        item.person && [h("dt", {}, "Who"), h("dd", {}, item.person)],
    );

    const hunger = h(
        "ul",
        { class: "ft-hunger" },
        item.hunger.map((sign) => h("li", {}, sign)),
    );

    const seeAlso =
        item.see_also?.length &&
        h(
            "ul",
            { class: "ft-links" },
            item.see_also.map((link) =>
                h(
                    "li",
                    {},
                    h(
                        "a",
                        {
                            href: `${link.page}#${encodeURIComponent(link.id)}`,
                        },
                        h("span", { class: "ft-link-name" }, link.name),
                        h("span", { class: "ft-link-guide" }, link.guide),
                    ),
                ),
            ),
        );

    return h(
        "div",
        {
            class: `row-panel ${s.cls}`,
            id: "ft-detail",
            role: "region",
            "aria-labelledby": "ft-detail-title",
            tabindex: "-1",
        },
        h(
            "button",
            {
                type: "button",
                class: "panel-close",
                "aria-label": `Close ${item.name}`,
                onclick: onClose,
            },
            "×",
        ),
        h(
            "header",
            { class: "detail-head" },
            h(
                "p",
                { class: "detail-group" },
                `${item.section} · ${areaList(item.areas)}`,
            ),
            h("h3", { id: "ft-detail-title" }, item.name),
            item.person && para(item.person, "detail-meaning"),
        ),
        h(
            "div",
            { class: "detail-cols" },
            h(
                "div",
                { class: "detail-main" },
                block("The food", food),
                block("What it guards against", para(item.guards, "ft-guard")),
                block("How it feeds you", para(item.feeds)),
                block("Daily serving", serving),
            ),
            h(
                "div",
                { class: "detail-side" },
                block("At a glance", facts),
                block("Signs of hunger", hunger),
                block(
                    "Chew on this",
                    h("p", { class: "ft-chew" }, item.chew),
                ),
                block("Read it", refList(item.read)),
                seeAlso && block("See also", seeAlso),
            ),
        ),
    );
}

// ------------------------------------------------------------------ page

export async function start(view) {
    let data;
    try {
        data = await fetchJson(DATA);
    } catch (error) {
        console.error("Unable to load Food for Thought:", error);
        view.replaceChildren(
            h(
                "p",
                { class: "status" },
                "Food for Thought could not be loaded. Please try again later.",
            ),
        );
        return;
    }

    const entries = data.entries;
    const byId = new Map(entries.map((e) => [e.id, e]));
    const state = { section: "all", area: "all", query: "" };
    const expander = rowExpander({ tileSelector: ".ft-tile" });

    // --- opening and closing -------------------------------------------------

    function open(id, options) {
        const item = byId.get(id);
        let openTile = document.getElementById(`tile-${id}`);
        if (!item || !openTile) {
            return;
        }
        // A link may point at something the filters are hiding.
        if (openTile.hidden) {
            resetFilters();
            openTile = document.getElementById(`tile-${id}`);
        }
        expander.open(
            openTile,
            detail(item, () => expander.close({ focus: true })),
            options,
        );
    }

    function toggle(id) {
        if (expander.openId === id) {
            expander.close();
        } else {
            open(id);
        }
    }

    // --- filters ---------------------------------------------------------------

    const haystack = new Map(
        entries.map((e) => [
            e.id,
            [
                e.name,
                e.person,
                e.section,
                e.guards,
                e.feeds,
                e.serving,
                e.chew,
                ...e.hunger,
                ...e.areas,
                ...e.read,
                ...e.food.flatMap((f) => [f.reference, f.text]),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase(),
        ]),
    );

    function apply() {
        const q = state.query.trim().toLowerCase();
        let shown = 0;
        for (const section of view.querySelectorAll(".group-section")) {
            const sectionMatch =
                state.section === "all" ||
                section.dataset.section === state.section;
            let sectionShown = 0;
            for (const t of section.querySelectorAll(".ft-tile")) {
                const e = byId.get(t.dataset.id);
                const visible =
                    sectionMatch &&
                    (state.area === "all" || e.areas.includes(state.area)) &&
                    (!q || haystack.get(e.id).includes(q));
                t.hidden = !visible;
                if (visible) {
                    sectionShown += 1;
                }
            }
            section.hidden = sectionShown === 0;
            shown += sectionShown;
        }
        if (expander.openTile?.hidden) {
            expander.close();
        } else {
            expander.place();
        }
        count.textContent =
            shown === entries.length
                ? ""
                : `Showing ${shown} of ${entries.length}`;
        empty.hidden = shown !== 0;
        for (const c of view.querySelectorAll(".chip")) {
            c.setAttribute(
                "aria-pressed",
                String(state[c.dataset.filter] === c.dataset.value),
            );
        }
    }

    function resetFilters() {
        state.section = "all";
        state.area = "all";
        state.query = "";
        search.value = "";
        apply();
    }

    // --- build the page --------------------------------------------------------

    const search = h("input", {
        type: "search",
        class: "search",
        autocomplete: "off",
        placeholder: "Search a topic, a verse or a need…",
        "aria-label": "Search Food for Thought",
    });
    search.addEventListener("input", () => {
        state.query = search.value;
        apply();
    });

    const chip = (filter, value, label, n, cls, lead) =>
        h(
            "button",
            {
                type: "button",
                class: `chip${cls ? ` ${cls}` : ""}`,
                "data-filter": filter,
                "data-value": value,
                "aria-pressed": String(state[filter] === value),
            },
            lead,
            label,
            n != null && h("span", { class: "chip-count" }, n),
        );

    const t = data.totals;
    const chips = h(
        "div",
        { class: "chip-rows" },
        h(
            "div",
            {
                class: "chips",
                role: "group",
                "aria-label": "Show what feeds one area",
            },
            chip("area", "all", "Mind, body and spirit", t.entries),
            data.areas.map((a) =>
                chip("area", a, a, t.areas[a], AREAS[a].cls, badge(a, 22)),
            ),
        ),
        h(
            "div",
            { class: "chips", role: "group", "aria-label": "Show one section" },
            chip("section", "all", "Every section"),
            data.sections.map((s) =>
                chip(
                    "section",
                    s.name,
                    s.name,
                    t.sections[s.name],
                    SECTIONS[s.name].cls,
                ),
            ),
        ),
    );
    chips.addEventListener("click", (e) => {
        const c = e.target.closest(".chip");
        if (!c) {
            return;
        }
        state[c.dataset.filter] = c.dataset.value;
        apply();
    });

    const count = h("p", { class: "result-count", "aria-live": "polite" });
    const empty = h(
        "p",
        { class: "status", hidden: true },
        "No topic matches that search.",
    );

    const section = (s) => {
        const members = entries.filter((e) => e.section === s.name);
        const id = `h-${s.name.toLowerCase().replace(/[^a-z]+/g, "-")}`;
        return h(
            "section",
            {
                class: `panel group-section ${SECTIONS[s.name].cls}`,
                "data-section": s.name,
                "aria-labelledby": id,
            },
            h(
                "header",
                { class: "group-head" },
                h("h2", { id }, icon(s.name, "group-icon"), s.name),
                h("p", { class: "group-count" }, `${members.length}`),
                para(s.intro, "group-intro"),
            ),
            h(
                "div",
                { class: "ft-grid" },
                members.map((e) => tile(e, toggle)),
            ),
        );
    };

    const filters = filterMenu(
        h(
            "ul",
            { class: "stats" },
            h("li", {}, h("b", {}, t.entries), "topics"),
            data.areas.map((a) => h("li", {}, h("b", {}, t.areas[a]), a)),
        ),
        chips,
    );

    view.replaceChildren(
        h(
            "section",
            { class: "hero" },
            filters.button,
            h("h1", {}, titleWithInfo("Food for Thought", filters.info)),
            h(
                "p",
                { class: "lede" },
                "Bible verses to feed our mind, body and spirit. Food keeps the body strong; these truths from " +
                    "Scripture, taken in daily, keep the soul strong before temptation comes, in our thoughts, in " +
                    "our bodies and in our walk with God. Tap any topic to read it.",
            ),
            h(
                "ul",
                { class: "ft-hero-areas", "aria-label": "The three areas" },
                data.areas.map((a) =>
                    h("li", { class: AREAS[a].cls }, badge(a, 40), a),
                ),
            ),
            h("div", { class: "finder" }, search),
            filters.menu,
        ),
        count,
        ...data.sections.map(section),
        empty,
    );

    apply();
    followHash((id) => open(id, { smooth: false }));
}
