/**
 * "Your Year's Journey in Grace" in the Daily Grace Archives: a few cards, one
 * at a time, looking back on the reader's year from what this device has kept
 * (assets/scripts/journey.js). The cover is a collage of the posters of the
 * days they prayed; then how they showed up, the memory verses they learned,
 * the books of the Bible they met and the stickers they were given; it ends
 * with Psalm 65:11 and a picture of the journey to save or share, drawn here
 * on the device. A card with nothing to show is left out; a year with no
 * Moment yet gets a gentle start instead.
 *
 * createJourney(…) returns { open(year), close(), dismiss(), isOpen }: close()
 * is the reader's (× or Escape) and tells onClose, dismiss() the page's own,
 * when Back has already moved on. library.js routes
 * #journey and #journey/<year> to it.
 */

import { readJourney, hasJourney } from "../../../assets/scripts/journey.js?v=20261101-1";
import { MEDIA_BASE_URL } from "../../settings/settings.js?v=20261009-1";

const COLLAGE = 8;
const SHOWN_SYMBOLS = 12;
const SHOWN_STICKERS = 6;
const SHOWN_VERSES = 8;
const SWIPE_PX = 60;
// The closing verse, as in the KJV of assets/db/dailygrace.db.
const CLOSING = {
    ref: "Psalm 65:11",
    text: "Thou crownest the year with thy goodness; and thy paths drop fatness.",
};
const STICKERS = "assets/stickers.json";

/** `count` items spread evenly through `list`, first and last included. */
function spread(list, count) {
    if (list.length <= count) {
        return list;
    }
    return Array.from({ length: count }, (_, i) =>
        list[Math.round((i * (list.length - 1)) / (count - 1))],
    );
}

const plural = (n, one, many) => `${n.toLocaleString()} ${n === 1 ? one : many}`;

export function createJourney({ h, byDate, fetchJson, thumbUrl, symbolUrl, format, say, onClose }) {
    const dialog = h("dialog", { class: "journey", "aria-labelledby": "journey-title" });
    document.body.append(dialog);
    let slides = [];
    let index = 0;
    let journey = null;

    const monthName = (month) => format(`${month}-01`, { month: "long" });
    const dayLong = (iso) => format(iso, { month: "long", day: "numeric", year: "numeric" });

    // ------------------------------------------------------------- the cards

    function cover() {
        const { prayed, year } = journey;
        const days = spread(prayed, COLLAGE).map((iso) => byDate.get(iso)).filter(Boolean);
        return h(
            "div",
            { class: "journey-card journey-cover" },
            h("p", { class: "journey-year" }, String(year)),
            h("h2", { id: "journey-title", tabindex: "-1" }, "Your Year's Journey in Grace"),
            days.length > 0 &&
                h(
                    "div",
                    { class: "journey-collage", "aria-hidden": "true" },
                    days.map((day) =>
                        h("img", { src: thumbUrl(day.date), alt: "", width: 240, height: 427, loading: "eager" }),
                    ),
                ),
            prayed.length
                ? h(
                      "p",
                      { class: "journey-lead" },
                      `You prayed ${plural(prayed.length, "Moment", "Moments")} with God, from ${dayLong(prayed[0])} to ${dayLong(prayed.at(-1))}.`,
                  )
                : h(
                      "p",
                      { class: "journey-lead" },
                      "Your journey is just beginning. Every Moment you pray from today will be here at the end of the year.",
                  ),
        );
    }

    function showingUp() {
        const { prayed, faithfulWeeks, bestMonth, answers } = journey;
        const stat = (value, label) => h("li", {}, h("b", {}, value), h("span", {}, label));
        return h(
            "div",
            { class: "journey-card" },
            h("p", { class: "journey-eyebrow" }, "Showing up"),
            h("h2", { id: "journey-title", tabindex: "-1" }, "Day after day"),
            h(
                "ul",
                { class: "journey-stats" },
                stat(String(prayed.length), prayed.length === 1 ? "Moment with God" : "Moments with God"),
                faithfulWeeks > 0 && stat(String(faithfulWeeks), faithfulWeeks === 1 ? "faithful week, 5 days or more" : "faithful weeks, 5 days or more"),
                bestMonth && stat(monthName(bestMonth), "the month you came most often"),
                answers > 0 && stat(String(answers), answers === 1 ? "answer written, kept only on this phone" : "answers written, kept only on this phone"),
            ),
        );
    }

    function verses() {
        const shown = journey.verses.slice(0, SHOWN_VERSES);
        const more = journey.verses.length - shown.length;
        return h(
            "div",
            { class: "journey-card" },
            h("p", { class: "journey-eyebrow" }, plural(journey.verses.length, "memory verse", "memory verses")),
            h("h2", { id: "journey-title", tabindex: "-1" }, "Hidden in your heart"),
            h("ul", { class: "journey-verses" }, shown.map((ref) => h("li", {}, ref))),
            more > 0 && h("p", { class: "journey-note" }, `and ${plural(more, "more", "more")}`),
            h("p", { class: "journey-note" }, "“Thy word have I hid in mine heart.” Psalm 119:11"),
        );
    }

    function books() {
        const shown = journey.books.slice(0, SHOWN_SYMBOLS);
        const more = journey.books.length - shown.length;
        return h(
            "div",
            { class: "journey-card" },
            h("p", { class: "journey-eyebrow" }, plural(journey.books.length, "book of the Bible", "books of the Bible")),
            h("h2", { id: "journey-title", tabindex: "-1" }, "Books you met"),
            h(
                "ul",
                { class: "journey-books" },
                shown.map((book) =>
                    h(
                        "li",
                        {},
                        h("img", { src: symbolUrl(book), alt: "", width: 48, height: 48, loading: "eager" }),
                        h("span", {}, book),
                    ),
                ),
            ),
            more > 0 && h("p", { class: "journey-note" }, `and ${plural(more, "more", "more")}`),
        );
    }

    function stickers(all) {
        const byId = new Map(all.map((sticker) => [sticker.id, sticker]));
        const shown = journey.stickers
            .map((id) => byId.get(id))
            .filter(Boolean)
            .slice(0, SHOWN_STICKERS);
        return h(
            "div",
            { class: "journey-card" },
            h("p", { class: "journey-eyebrow" }, plural(journey.stickers.length, "sticker", "stickers")),
            h("h2", { id: "journey-title", tabindex: "-1" }, "Gifts along the way"),
            shown.length > 0 &&
                h(
                    "ul",
                    { class: "journey-stickers" },
                    shown.map((sticker) => {
                        const image = h("img", {
                            src: `${MEDIA_BASE_URL}${sticker.filename.replace(/\.png$/, ".webp")}`,
                            alt: sticker.title,
                            width: 120,
                            height: 120,
                            loading: "eager",
                        });
                        const item = h("li", {}, image);
                        // A picture that cannot load leaves no gap.
                        image.addEventListener("error", () => item.remove(), { once: true });
                        return item;
                    }),
                ),
            h("a", { class: "lib-button", href: "stickers.html" }, "Open My Sticker Album"),
        );
    }

    function closing() {
        const share = h("button", { type: "button", class: "lib-button journey-share" }, "Save or share my journey");
        share.addEventListener("click", () => shareJourney(share));
        const done = h("button", { type: "button", class: "journey-done" }, journey.prayed.length ? "Back to the Archives" : "Close");
        done.addEventListener("click", () => close());
        return h(
            "div",
            { class: "journey-card journey-closing" },
            h("p", { class: "journey-eyebrow" }, `${journey.year} · with thanks`),
            h(
                "figure",
                { class: "journey-verse" },
                h("blockquote", { id: "journey-title", tabindex: "-1" }, `“${CLOSING.text}”`),
                h("figcaption", {}, `${CLOSING.ref} (KJV)`),
            ),
            journey.prayed.length > 0
                ? share
                : h("a", { class: "lib-button", href: "../../index.html#daily-devotional" }, "Start today's Moment"),
            done,
        );
    }

    // ------------------------------------------------------------- the dialog

    const frame = h("div", { class: "journey-frame" });
    const closeButton = h("button", { type: "button", class: "journey-close", "aria-label": "Close your journey" }, "×");
    closeButton.addEventListener("click", () => close());
    const dots = h("div", { class: "journey-dots", "aria-hidden": "true" });
    const counter = h("span", { class: "journey-count" });
    const body = h("div", { class: "journey-body", "aria-live": "polite" });
    const back = h("button", { type: "button", class: "journey-back" }, "Back");
    const next = h("button", { type: "button", class: "journey-next" }, "Next");
    back.addEventListener("click", () => go(-1));
    next.addEventListener("click", () => go(1));
    frame.append(
        h("header", { class: "journey-bar" }, closeButton, dots, counter),
        body,
        h("nav", { class: "journey-nav", "aria-label": "Journey cards" }, back, next),
    );
    dialog.append(frame);

    function render() {
        body.replaceChildren(slides[index]());
        dots.replaceChildren(...slides.map((_, i) => h("span", { class: i <= index ? "is-on" : "" })));
        counter.textContent = `${index + 1}/${slides.length}`;
        back.hidden = index === 0;
        next.hidden = index === slides.length - 1;
        body.querySelector("#journey-title")?.focus({ preventScroll: true });
        body.scrollTop = 0;
    }

    function go(step) {
        const to = Math.min(Math.max(index + step, 0), slides.length - 1);
        if (to !== index) {
            index = to;
            render();
        }
    }

    dialog.addEventListener("keydown", (event) => {
        if (event.key === "ArrowRight") {
            go(1);
        } else if (event.key === "ArrowLeft") {
            go(-1);
        }
    });
    let swipe = null;
    body.addEventListener("pointerdown", (event) => {
        swipe = event.pointerType === "mouse" || event.target.closest("a, button") ? null : { x: event.clientX, y: event.clientY };
    });
    body.addEventListener("pointerup", (event) => {
        if (!swipe) {
            return;
        }
        const dx = event.clientX - swipe.x;
        const dy = event.clientY - swipe.y;
        swipe = null;
        if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) >= 2 * Math.abs(dy)) {
            go(dx < 0 ? 1 : -1);
        }
    });
    dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        close();
    });
    dialog.addEventListener("close", () => {
        document.documentElement.classList.remove("day-sheet-open");
    });

    async function open(year) {
        journey = readJourney(year);
        let allStickers = [];
        if (journey.stickers.length) {
            allStickers = await fetchJson(STICKERS).catch(() => []);
        }
        slides = journey.prayed.length
            ? [
                  cover,
                  showingUp,
                  journey.verses.length > 0 && verses,
                  journey.books.length > 0 && books,
                  journey.stickers.length > 0 && (() => stickers(allStickers)),
                  closing,
              ].filter(Boolean)
            : [cover, closing];
        index = 0;
        render();
        if (!dialog.open) {
            dialog.showModal();
            document.documentElement.classList.add("day-sheet-open");
        }
        return hasJourney(journey);
    }

    function close() {
        if (dialog.open) {
            dialog.close();
            onClose?.();
        }
    }

    function dismiss() {
        if (dialog.open) {
            dialog.close();
        }
    }

    // ------------------------------------------------------------- the picture

    function loadImage(src) {
        return new Promise((resolve) => {
            const image = new Image();
            // The media host lets the site draw its pictures (CORS); one it
            // refuses is left out rather than spoil the picture.
            image.crossOrigin = "anonymous";
            image.onload = () => resolve(image);
            image.onerror = () => resolve(null);
            image.src = src;
        });
    }

    /** The journey as one 1080 × 1920 picture, drawn on this device. */
    async function drawJourney() {
        const W = 1080;
        const H = 1920;
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        await Promise.all([
            document.fonts?.load('80px "Germania One"'),
            document.fonts?.load('40px "Strait"'),
        ]).catch(() => {});

        const ground = ctx.createLinearGradient(0, 0, 0, H);
        ground.addColorStop(0, "#001b34");
        ground.addColorStop(1, "#062944");
        ctx.fillStyle = ground;
        ctx.fillRect(0, 0, W, H);

        ctx.textAlign = "center";
        ctx.fillStyle = "#e1b65d";
        ctx.font = '44px "Strait", Arial, sans-serif';
        ctx.fillText("DAILY GRACE", W / 2, 120);
        ctx.font = '84px "Germania One", Georgia, serif';
        ctx.fillText("Your Year's Journey", W / 2, 240);
        ctx.fillText("in Grace", W / 2, 340);
        ctx.font = '150px "Germania One", Georgia, serif';
        ctx.fillText(String(journey.year), W / 2, 500);

        // The posters of the days prayed, two rows of four.
        const days = spread(journey.prayed, COLLAGE).map((iso) => byDate.get(iso)).filter(Boolean);
        const images = await Promise.all(days.map((day) => loadImage(thumbUrl(day.date))));
        const tileW = 222;
        const tileH = Math.round((tileW * 427) / 240);
        const gap = 16;
        const left = (W - (4 * tileW + 3 * gap)) / 2;
        images.forEach((image, i) => {
            const x = left + (i % 4) * (tileW + gap);
            const y = 560 + Math.floor(i / 4) * (tileH + gap);
            ctx.fillStyle = "#0d2740";
            ctx.fillRect(x, y, tileW, tileH);
            if (image) {
                ctx.drawImage(image, x, y, tileW, tileH);
            }
        });

        // The numbers.
        const top = 560 + 2 * tileH + gap + 110;
        // The first three numbers that are not nought, spread across the width.
        const stats = [
            [journey.prayed.length, "Moment", "Moments"],
            [journey.faithfulWeeks, "faithful week", "faithful weeks"],
            [journey.verses.length, "verse learned", "verses learned"],
            [journey.books.length, "book met", "books met"],
            [journey.stickers.length, "sticker", "stickers"],
        ]
            .filter(([value]) => value > 0)
            .slice(0, 3)
            .map(([value, one, many]) => [value, value === 1 ? one : many]);
        stats.forEach(([value, label], i) => {
            const x = (W / stats.length) * i + W / (2 * stats.length);
            ctx.fillStyle = "#e1b65d";
            ctx.font = '96px "Germania One", Georgia, serif';
            ctx.fillText(String(value), x, top);
            ctx.fillStyle = "#efe6d2";
            ctx.font = '36px "Strait", Arial, sans-serif';
            ctx.fillText(label, x, top + 54);
        });

        ctx.fillStyle = "#efe6d2";
        ctx.font = '40px "Strait", Arial, sans-serif';
        ctx.fillText("“Thou crownest the year with thy goodness”", W / 2, H - 230);
        ctx.fillStyle = "#e1b65d";
        ctx.font = '34px "Strait", Arial, sans-serif';
        ctx.fillText(`${CLOSING.ref} (KJV)`, W / 2, H - 178);
        ctx.font = '40px "Strait", Arial, sans-serif';
        ctx.fillText("dailygrace.faith", W / 2, H - 80);

        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => (blob ? resolve(blob) : reject(new Error("The picture could not be made"))),
                "image/jpeg",
                0.9,
            );
        });
    }

    async function shareJourney(button) {
        button.disabled = true;
        const label = button.textContent;
        button.textContent = "Making your picture…";
        try {
            const blob = await drawJourney();
            const name = `daily-grace-journey-${journey.year}.jpg`;
            const file = new File([blob], name, { type: "image/jpeg" });
            if (navigator.canShare?.({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: `My ${journey.year} journey in Grace`,
                        text: "Daily Grace, dailygrace.faith",
                    });
                } catch (error) {
                    if (error.name !== "AbortError") {
                        throw error;
                    }
                }
            } else {
                const url = URL.createObjectURL(blob);
                const link = h("a", { href: url, download: name });
                document.body.append(link);
                link.click();
                link.remove();
                setTimeout(() => URL.revokeObjectURL(url), 10_000);
                say("Saved your journey picture");
            }
        } catch (error) {
            console.warn("The journey picture could not be made:", error);
            say("Couldn't make the picture. Please try again.");
        } finally {
            button.disabled = false;
            button.textContent = label;
        }
    }

    return {
        open,
        close,
        dismiss,
        get isOpen() {
            return dialog.open;
        },
        get dialog() {
            return dialog;
        },
    };
}
