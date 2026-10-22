/**
 * The Sticker Album, for stickers.html: how many of the stickers the reader
 * has, the next gift on each path, then a shelf for each series with the
 * stickers earned and an empty place for each still to come. Tapping a
 * sticker opens it with its verse, its reflection and what it was given for,
 * a button that saves the full-size picture as a file, never opening it
 * in a tab: a Save As dialog where the browser has one
 * (showSaveFilePicker), else a download, and one that shares it through the
 * phone's share sheet (assets/scripts/sticker-share.js).
 *
 * The stickers come from assets/stickers.json and the rules from
 * assets/scripts/sticker-awards.js; the progress is the reader's own, on this
 * device (assets/scripts/sticker-progress.js). Stickers not yet shown as a
 * gift are marked "New" here, and count as shown once the album has opened.
 *
 * #HB-01 in the address opens that sticker, when it has been earned.
 */

import {
    FIRSTS,
    SERIES,
    checkAwards,
    earnedFor,
    formatDay,
    goals,
    loadStickers,
    markSeen,
    markWelcomed,
    pendingGifts,
    readCollection,
    stickerImage,
} from "../../../assets/scripts/sticker-awards.js?v=20261018-1";
import { readProgress } from "../../../assets/scripts/sticker-progress.js?v=20261018-1";
import {
    SHARE_NOTES,
    prepareShare,
    shareSticker,
} from "../../../assets/scripts/sticker-share.js?v=20261023-1";

const escapeHtml = (text) =>
    String(text ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const CHECK = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 12 10 17 19 7"/></svg>`;
// The share icon of the poster's share button (poster-card.js).
const SHARE_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>`;

/** Renders the album into `view`; `dialog` shows one sticker. */
export async function start(view, dialog) {
    let stickers;
    try {
        await checkAwards();
        stickers = await loadStickers();
    } catch (error) {
        console.error("The sticker album could not be opened:", error);
        view.innerHTML = `<p class="status">Your sticker album could not be opened. Please try again later.</p>`;
        return;
    }
    const fresh = new Set(pendingGifts());
    const collection = readCollection();
    const progress = readProgress();

    view.innerHTML =
        heroHtml(collection, stickers) +
        goalsHtml(goals(progress, collection, stickers)) +
        SERIES.map((series) =>
            shelfHtml(series, stickers, collection, progress, fresh),
        ).join("");

    // Opening the album shows the reader what is new.
    if (fresh.size) {
        markSeen([...fresh]);
        markWelcomed();
    }

    const byId = new Map(stickers.map((sticker) => [sticker.id, sticker]));
    view.addEventListener("click", (event) => {
        const slot = event.target.closest("button[data-id]");
        if (slot) {
            open(dialog, byId.get(slot.dataset.id), collection.earned[slot.dataset.id]);
            history.replaceState(null, "", `#${slot.dataset.id}`);
        }
    });
    // The picture starts downloading as soon as a finger or the mouse
    // touches the save button, so it is often ready by the time the tap ends.
    dialog.addEventListener("pointerdown", (event) => {
        const save = event.target.closest(".sticker-save");
        if (save) {
            pictureOf(save.href).catch(() => {});
        }
    });
    dialog.addEventListener("click", (event) => {
        const save = event.target.closest(".sticker-save");
        if (save) {
            event.preventDefault();
            saveSticker(save, dialog.querySelector(".sticker-note"));
            return;
        }
        const share = event.target.closest(".sticker-share");
        if (share) {
            shareFromAlbum(
                share,
                byId.get(dialog.dataset.stickerId),
                dialog.querySelector(".sticker-note"),
            );
            return;
        }
        if (event.target === dialog || event.target.closest("[data-close]")) {
            dialog.close();
        }
    });
    dialog.addEventListener("close", () => {
        history.replaceState(null, "", location.pathname + location.search);
    });

    const openFromHash = () => {
        const id = decodeURIComponent(location.hash.slice(1));
        const entry = collection.earned[id];
        if (!entry || !byId.has(id)) {
            return;
        }
        document.getElementById(id)?.scrollIntoView({ block: "center" });
        open(dialog, byId.get(id), entry);
    };
    window.addEventListener("hashchange", openFromHash);
    openFromHash();
}

function heroHtml(collection, stickers) {
    const count = Object.keys(collection.earned).filter((id) =>
        stickers.some((sticker) => sticker.id === id),
    ).length;
    const percent = Math.round((count / stickers.length) * 100);
    return `
      <section class="hero">
        <p class="eyebrow">Daily Grace</p>
        <h1>My Sticker Album</h1>
        <p class="lede">Stickers are gifts for what you do in Daily Grace: your Daily Moments, memory verses, Bible Trivia, Food for Thought and the Bible stories. Each series is earned a different way.</p>
        <div class="tally">
          <strong>${count}</strong> of ${stickers.length} stickers
          <span class="tally-bar" aria-hidden="true"><span style="width: ${percent}%"></span></span>
        </div>
      </section>`;
}

function goalsHtml(list) {
    if (!list.length) {
        return `
      <section class="panel goals">
        <h2>Every sticker collected</h2>
        <p>You have the whole album. Well done!</p>
      </section>`;
    }
    const rows = list
        .map((goal) => {
            const series = SERIES.find((item) => item.group === goal.group);
            const percent = Math.round((goal.done / goal.step) * 100);
            return `
          <li>
            <a href="#shelf-${goal.group}">
              <span class="goal-name">${escapeHtml(series.name)}</span>
              <span class="goal-text">${escapeHtml(goal.text)}.</span>
              <span class="goal-bar" aria-hidden="true"><span style="width: ${percent}%"></span></span>
            </a>
          </li>`;
        })
        .join("");
    return `
      <section class="panel goals">
        <h2>Your next gifts</h2>
        <ul class="goal-list">${rows}</ul>
      </section>`;
}

function shelfHtml(series, stickers, collection, progress, fresh) {
    const shelf = stickers
        .filter((sticker) => sticker.group === series.group)
        .sort((a, b) => a.id.localeCompare(b.id));
    const have = shelf.filter((sticker) => collection.earned[sticker.id]).length;
    const slots = shelf
        .map((sticker, i) => {
            const entry = collection.earned[sticker.id];
            if (!entry) {
                // A book's place shows its name; the others keep their surprise.
                const name =
                    series.group === "BK"
                        ? `<span class="slot-book">${escapeHtml(sticker.title)}</span>`
                        : `<span class="slot-number">${i + 1}</span>`;
                return `<li class="slot empty" aria-label="Not earned yet">${name}</li>`;
            }
            const badge = fresh.has(sticker.id)
                ? `<span class="slot-new">New</span>`
                : "";
            return `
          <li class="slot">
            <button type="button" id="${sticker.id}" data-id="${sticker.id}">
              <img src="${escapeHtml(stickerImage(sticker))}" alt="" width="600" height="600" loading="lazy" decoding="async" />
              <span class="slot-title">${escapeHtml(sticker.title)}</span>
              ${badge}
            </button>
          </li>`;
        })
        .join("");
    const firsts =
        series.group === "AG" && have < shelf.length
            ? `<ul class="firsts">${FIRSTS.map((first) => {
                  const done = Boolean(progress.firsts?.[first.key]);
                  return `<li class="${done ? "done" : ""}"><span class="tick">${done ? CHECK : ""}</span>${escapeHtml(first.todo)}</li>`;
              }).join("")}</ul>`
            : "";
    return `
      <section class="panel shelf" id="shelf-${series.group}">
        <div class="shelf-head">
          <h2>${escapeHtml(series.name)}</h2>
          <span class="shelf-count">${have} of ${shelf.length}</span>
        </div>
        <p class="shelf-how">${escapeHtml(series.how)}</p>
        ${firsts}
        <ul class="slots">${slots}</ul>
      </section>`;
}

function open(dialog, sticker, entry) {
    if (!sticker || !entry) {
        return;
    }
    const verse = sticker.verse
        ? `<blockquote class="sticker-verse">${escapeHtml(sticker.verse)}${
              sticker.reference
                  ? `<cite>${escapeHtml(sticker.reference)}</cite>`
                  : ""
          }</blockquote>`
        : "";
    const file = sticker.filename.split("/").pop();
    dialog.querySelector(".sticker-body").innerHTML = `
      <img class="sticker-image" src="${escapeHtml(stickerImage(sticker))}" alt="${escapeHtml(sticker.title)} sticker" width="600" height="600" />
      <h2 id="sticker-title">${escapeHtml(sticker.title)}</h2>
      <p class="sticker-why">${escapeHtml(earnedFor(entry, sticker))}<span>${escapeHtml(formatDay(entry.day))}</span></p>
      ${verse}
      <p class="sticker-reflection">${escapeHtml(sticker.reflection)}</p>
      <div class="sticker-actions">
        <a class="sticker-save" href="${escapeHtml(stickerImage(sticker, { full: true }))}" download="${escapeHtml(file)}">Save the full-size sticker</a>
        <button class="sticker-share" type="button">${SHARE_ICON}Share</button>
        <button class="sticker-done" type="button" data-close>Close</button>
      </div>
      <p class="sticker-note" role="status"></p>`;
    dialog.dataset.stickerId = sticker.id;
    // Made while the reader looks, so a tap on Share can send it at once.
    prepareShare(sticker).catch(() => {});
    if (!dialog.open) {
        dialog.showModal();
    }
    dialog.querySelector(".sticker-body").scrollTop = 0;
}

/** Shares the sticker on show, saying how it went under the buttons. */
async function shareFromAlbum(button, sticker, note) {
    if (!sticker || button.getAttribute("aria-busy") === "true") {
        return;
    }
    note.textContent = "";
    button.setAttribute("aria-busy", "true");
    try {
        note.textContent = SHARE_NOTES[await shareSticker(sticker)];
    } finally {
        button.removeAttribute("aria-busy");
    }
}

// The full-size pictures fetched so far, by URL, so a second save of the same
// sticker does not fetch it again. A failed fetch is forgotten.
const pictures = new Map();
// The pictures whose last fetch failed: no Save As dialog for those, since
// there may be nothing to save.
const failed = new Set();

function pictureOf(url) {
    if (!pictures.has(url)) {
        const request = fetch(url).then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.blob();
        });
        request.then(
            () => failed.delete(url),
            () => {
                pictures.delete(url);
                failed.add(url);
            },
        );
        pictures.set(url, request);
    }
    return pictures.get(url);
}

/**
 * Saves the full-size sticker behind `link` as a file, never in a tab.
 *
 * Where the browser has a Save As dialog of its own (showSaveFilePicker:
 * Chrome and Edge on a computer), it opens at once, while the tap still
 * counts as the reader's, and the picture is written where they choose.
 * Elsewhere the picture is handed over as a download, which the device saves
 * in its usual way (Firefox and Safari ask or save to Downloads, as set; a
 * phone offers its own sheet).
 *
 * The picture is fetched, so it must come from the page's own site, or from
 * one that allows it (CORS). The media host is the site itself on
 * dailygrace.faith; a copy of the page served from anywhere else cannot fetch
 * it, and says so.
 */
async function saveSticker(link, note) {
    const url = link.href;
    const name = link.getAttribute("download") || "sticker.png";
    note.textContent = "";
    // Usually on its way since the button was touched. If that already
    // failed, try once more, without asking where to save first.
    const knownBad = failed.has(url);
    const picture = pictureOf(url);
    picture.catch(() => {});

    let handle = null;
    if (typeof window.showSaveFilePicker === "function" && !knownBad) {
        try {
            handle = await window.showSaveFilePicker({
                suggestedName: name,
                types: [
                    {
                        description: "PNG picture",
                        accept: { "image/png": [".png"] },
                    },
                ],
            });
        } catch (error) {
            if (error.name === "AbortError") {
                return; // the reader closed the dialog
            }
            // Not allowed here (in a frame, say): download instead.
            handle = null;
        }
    }

    link.setAttribute("aria-busy", "true");
    note.textContent = "Saving…";
    try {
        const blob = await picture;
        if (handle) {
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
        } else {
            const objectUrl = URL.createObjectURL(blob);
            const download = document.createElement("a");
            download.href = objectUrl;
            download.download = name;
            document.body.append(download);
            download.click();
            download.remove();
            // Kept long enough for the download to start.
            setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        }
        note.textContent = handle ? "Saved." : "Saved to your downloads.";
    } catch (error) {
        console.warn("The sticker could not be saved:", error);
        const elsewhere = new URL(url).origin !== location.origin;
        note.textContent = elsewhere
            ? "Saving works on dailygrace.faith. This copy of the page is on another address, so the browser will not let it fetch the picture."
            : "The sticker could not be saved. Please check your connection and try again.";
    } finally {
        link.removeAttribute("aria-busy");
    }
}
