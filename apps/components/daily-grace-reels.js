/**
 * <daily-grace-reels> — Daily Grace Reels: short vertical dramas of Bible
 * stories (four parts and a full cut each), hosted on YouTube and played here.
 *
 * The card shows the newest drama that has a part out: its cover, title,
 * passage and description, the reader's next part ("Start here", "New",
 * "Up next", "Continue"), and a chip for every part. Parts that are out play;
 * a part still to come shows when it arrives ("Wed 7 PM"). Other dramas with
 * parts out are listed under "More reels". The card stays hidden until a part
 * is out, so it never shows empty.
 *
 * Tapping the cover or a chip opens the player: a full-screen sheet with the
 * part playing from YouTube (privacy-enhanced youtube-nocookie.com), previous
 * and next parts, and "Watch on YouTube". Nothing loads from YouTube until a
 * part is opened; the card uses our own covers. When a part ends, the next one
 * starts after a short countdown, which the reader can cancel.
 *
 * Data: assets/dg-reels.json (see microdramas/RELEASE-PLAN.md §3).
 *   { "series", "playlist_id", "dramas": [ { "id", "title", "passage",
 *     "description", "cover", "playlist_id", "episodes": [ { "id", "part",
 *     "kind" ("full" for the full cut), "title", "name", "passage",
 *     "description", "youtube_id", "release", "duration", "cover" } ] } ] }
 * A part is out once it has a youtube_id and its release time (ISO 8601 with
 * its time zone) has passed, so a scheduled upload can be listed ahead of
 * time and appears at the moment YouTube makes it public. Covers are
 * "media:" URLs (settings.js). The file is fetched with cache revalidation,
 * so a new youtube_id shows without a new ?v= token here.
 *
 * Watched parts are kept on this device under dailygrace:reels-watched
 * ({ dramaId: [episodeId, …] }); a part counts as watched once opened.
 *
 * Preview: add ?reels-preview to the page's address to see the card before
 * launch: every part with a youtube_id plays whatever its release time, and
 * the card shows even when nothing is out yet.
 *
 * Usage
 *   <daily-grace-reels id="daily-grace-reels" data-card-name="Daily Grace Reels" hidden></daily-grace-reels>
 *   <script type="module" src="./apps/components/daily-grace-reels.js"></script>
 *
 * Attributes
 *   src   the JSON file, resolved against the page. Default: assets/dg-reels.json
 */

import { resolveMedia } from "../settings/settings.js?v=20261009-1";

const DEFAULT_SRC = "assets/dg-reels.json";
const NAME = "Daily Grace Reels";
const WATCHED_KEY = "dailygrace:reels-watched";
const EMBED = "https://www.youtube-nocookie.com/embed/";
const EMBED_ORIGIN = "https://www.youtube-nocookie.com";
const COUNTDOWN = 5;
const WEEK = 7 * 24 * 60 * 60 * 1000;
const MAX_TIMER = 2 ** 31 - 1;

const REEL = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M10 9.2v5.6l4.6-2.8z" fill="currentColor"/></svg>`;
const PLAY = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2Z"/></svg>`;
const TICK = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;
const CLOSE = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
const PREV = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`;
const NEXT = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>`;

const STYLES = /* css */ `
  :host { display: block; padding-inline: 10px; }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }
  button { font: inherit; color: inherit; }
  .card {
    overflow: hidden;
    border-radius: 10px;
    border-left: 5px solid #f2c531;
    background: #001b34;
    color: #fff;
    box-shadow: 0 10px 26px rgb(0 27 52 / 20%);
    font: 400 1rem/1.4 'Roboto', Arial, sans-serif;
  }
  .brand {
    display: flex; align-items: center; gap: 8px;
    padding: 12px 14px 0;
    font: 700 .78rem/1 'Roboto', Arial, sans-serif;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: #f2c531;
  }
  .brand svg { width: 18px; height: 18px; flex: none; }
  .body { display: flex; gap: 14px; padding: 12px 14px; }
  .cover {
    position: relative;
    flex: none;
    width: clamp(96px, 26vw, 140px);
    aspect-ratio: 9 / 16;
    padding: 0;
    border: 0;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    background: linear-gradient(160deg, #3b2a14, #0b2340 70%);
  }
  /* The title sits under the cover picture, so it shows until (or unless) the picture loads. */
  .cover .fallback {
    position: absolute; inset: auto 0 0 0;
    padding: 10px;
    font: 400 1.3rem/1.05 'Germania One', Georgia, serif;
    color: #f2c531;
    text-align: left;
  }
  .cover img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .cover.nocover img { display: none; }
  .cover .play {
    position: absolute; left: 50%; top: 50%;
    translate: -50% -50%;
    display: grid; place-items: center;
    width: 44px; height: 44px;
    border-radius: 50%;
    background: rgb(242 197 49 / 92%);
    color: #001b34;
    box-shadow: 0 4px 14px rgb(0 0 0 / 40%);
  }
  .cover .play svg { width: 20px; height: 20px; margin-left: 3px; }
  .cover:focus-visible, .part:focus-visible, .other:focus-visible { outline: 3px solid #f2c531; outline-offset: 2px; }
  .info { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
  .title {
    margin: 0;
    font: 400 clamp(1.6rem, 1.3rem + 1.6vw, 2.3rem)/1 'Germania One', Georgia, serif;
    color: #f2c531;
  }
  .passage { margin: 0; font-size: .9rem; color: rgb(255 255 255 / 75%); }
  .desc {
    margin: 2px 0 0;
    font-size: .92rem;
    color: rgb(255 255 255 / 88%);
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .status { margin: auto 0 0; padding-top: 6px; font-size: .95rem; }
  .status b { color: #f2c531; }
  .parts {
    display: flex; gap: 8px;
    overflow-x: auto;
    padding: 0 14px 14px;
    scrollbar-width: thin;
  }
  .part {
    flex: none;
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    column-gap: 8px;
    align-items: center;
    min-width: 112px;
    min-height: 52px;
    padding: 8px 12px 8px 10px;
    border: 1px solid rgb(242 197 49 / 45%);
    border-radius: 10px;
    background: rgb(255 255 255 / 6%);
    text-align: left;
    cursor: pointer;
  }
  .part .num {
    grid-row: span 2;
    display: grid; place-items: center;
    width: 28px; height: 28px;
    border-radius: 50%;
    background: #f2c531;
    color: #001b34;
    font-weight: 700;
    font-size: .9rem;
  }
  .part .num svg { width: 15px; height: 15px; }
  .part .label { font-weight: 600; font-size: .9rem; white-space: nowrap; }
  .part .meta { font-size: .78rem; color: rgb(255 255 255 / 70%); white-space: nowrap; }
  .part.next { background: rgb(242 197 49 / 18%); border-color: #f2c531; }
  .part.watched .num { background: rgb(255 255 255 / 85%); }
  .part[disabled] { cursor: default; border-style: dashed; background: transparent; opacity: .7; }
  .part[disabled] .num { background: rgb(255 255 255 / 25%); color: #fff; }
  .more { padding: 0 14px 14px; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: .85rem; color: rgb(255 255 255 / 75%); }
  .more[hidden] { display: none; }
  .other {
    min-height: 36px;
    padding: 6px 12px;
    border: 1px solid rgb(255 255 255 / 30%);
    border-radius: 999px;
    background: transparent;
    cursor: pointer;
  }
  .playlist { color: #f2c531; font-size: .85rem; margin-left: auto; }

  /* The player: a full-screen sheet over the page. */
  dialog {
    width: 100vw; height: 100dvh;
    max-width: none; max-height: none;
    margin: 0; padding: 0; border: 0;
    background: #000;
    color: #fff;
    font: 400 1rem/1.4 'Roboto', Arial, sans-serif;
  }
  dialog::backdrop { background: rgb(0 0 0 / 85%); }
  .sheet { display: flex; flex-direction: column; height: 100%; }
  .bar {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 8px 8px 8px 16px;
    padding-top: max(8px, env(safe-area-inset-top));
  }
  .now { min-width: 0; }
  .now-drama { display: block; font: 400 1.25rem/1.1 'Germania One', Georgia, serif; color: #f2c531; }
  .now-part { display: block; font-size: .9rem; color: rgb(255 255 255 / 85%); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .icon {
    flex: none;
    display: grid; place-items: center;
    width: 44px; height: 44px;
    border: 0; border-radius: 50%;
    background: rgb(255 255 255 / 12%);
    cursor: pointer;
  }
  .icon svg { width: 22px; height: 22px; }
  .screen { position: relative; flex: 1; min-height: 0; display: grid; place-items: center; }
  .frame { position: relative; height: 100%; max-width: 100%; aspect-ratio: 9 / 16; background: #111; }
  .frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
  .notice, .ended {
    position: absolute; inset: 0;
    display: grid; place-content: center; justify-items: center; gap: 12px;
    padding: 24px;
    text-align: center;
    background: rgb(0 0 0 / 78%);
  }
  .notice[hidden], .ended[hidden] { display: none; }
  .ended p { margin: 0; color: rgb(255 255 255 / 80%); }
  .go-next {
    min-height: 48px;
    padding: 10px 20px;
    border: 0; border-radius: 999px;
    background: #f2c531; color: #001b34;
    font-weight: 700;
    cursor: pointer;
  }
  .stay { min-height: 44px; padding: 8px 16px; border: 1px solid rgb(255 255 255 / 40%); border-radius: 999px; background: transparent; cursor: pointer; }
  .controls {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    padding: 8px 12px;
    padding-bottom: max(8px, env(safe-area-inset-bottom));
  }
  .step {
    display: inline-flex; align-items: center; gap: 4px;
    min-width: 96px; min-height: 44px;
    padding: 8px 12px;
    border: 0; border-radius: 999px;
    background: rgb(255 255 255 / 12%);
    cursor: pointer;
  }
  .step[hidden] { visibility: hidden; display: inline-flex; }
  .step svg { width: 18px; height: 18px; flex: none; }
  .step.forward { justify-content: flex-end; }
  .yt { color: rgb(255 255 255 / 80%); font-size: .85rem; text-decoration: underline; text-underline-offset: 3px; }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
`;

const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** "1:25" from seconds; "" when unknown. */
const clock = (seconds) => {
    const s = Math.round(Number(seconds) || 0);
    if (s <= 0) {
        return "";
    }
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** "Part 2" for a part, "Full story" for the full cut. */
const partLabel = (episode) => (episode.kind === "full" ? "Full story" : `Part ${episode.part}`);

/** When a part still to come arrives: "Wed 7 PM" within the week, "Dec 14" after, "Soon" when unknown. */
function arrives(episode, now) {
    if (!Number.isFinite(episode.releaseAt)) {
        return "Soon";
    }
    const when = new Date(episode.releaseAt);
    if (episode.releaseAt - now < WEEK) {
        const day = new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(when);
        let time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(when);
        // "7:00 PM" reads as "7 PM"; a 24-hour "19:00" keeps its minutes.
        if (/[AP]\.?M/i.test(time)) {
            time = time.replace(":00", "");
        }
        return `${day} ${time}`;
    }
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(when);
}

/** The dramas from the JSON, cleaned: media URLs resolved, parts in order, the full cut last. */
export function readDramas(data) {
    const list = Array.isArray(data?.dramas) ? data.dramas : [];
    return list
        .filter((drama) => drama?.id && Array.isArray(drama.episodes))
        .map((drama) => ({
            ...drama,
            cover: resolveMedia(drama.cover ?? ""),
            episodes: drama.episodes
                .filter((episode) => episode?.id)
                .map((episode) => ({
                    ...episode,
                    youtube_id: String(episode.youtube_id ?? "").trim(),
                    cover: resolveMedia(episode.cover ?? ""),
                    releaseAt: Date.parse(episode.release ?? ""),
                }))
                .sort((a, b) => (a.kind === "full") - (b.kind === "full") || (a.part ?? 0) - (b.part ?? 0)),
        }));
}

/** Out: it has a YouTube ID and its release time has passed (in preview, the ID is enough). */
export function isOut(episode, now, preview = false) {
    if (!episode.youtube_id) {
        return false;
    }
    if (preview || !Number.isFinite(episode.releaseAt)) {
        return true;
    }
    return episode.releaseAt <= now;
}

function readWatched() {
    try {
        const saved = JSON.parse(localStorage.getItem(WATCHED_KEY));
        return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    } catch {
        return {};
    }
}

function markWatched(dramaId, episodeId) {
    const watched = readWatched();
    const list = new Set(Array.isArray(watched[dramaId]) ? watched[dramaId] : []);
    list.add(episodeId);
    watched[dramaId] = [...list];
    try {
        localStorage.setItem(WATCHED_KEY, JSON.stringify(watched));
    } catch {
        // Storage is off: the parts still play; only the ticks are lost.
    }
}

export class DailyGraceReels extends HTMLElement {
    static observedAttributes = ["src"];

    #root;
    #dramas = [];
    #playlist = "";
    #dramaId = "";
    #preview = false;
    #timer = 0;
    #loadId = 0;
    // The player: the drama and part open, the countdown into the next part.
    #playing = null;
    #countdown = 0;

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: "open" });
        this.#root.innerHTML = `
          <style>${STYLES}</style>
          <section class="card" aria-label="${NAME}">
            <div class="brand">${REEL}<span>${NAME}</span></div>
            <div class="body">
              <button class="cover" type="button">
                <span class="fallback"></span>
                <img alt="" loading="lazy" decoding="async" />
                <span class="play">${PLAY}</span>
              </button>
              <div class="info">
                <h3 class="title"></h3>
                <p class="passage"></p>
                <p class="desc"></p>
                <p class="status"></p>
              </div>
            </div>
            <div class="parts"></div>
            <div class="more" hidden></div>
          </section>
          <dialog aria-label="${NAME} player">
            <div class="sheet">
              <header class="bar">
                <div class="now"><span class="now-drama"></span><span class="now-part"></span></div>
                <button class="icon close" type="button" aria-label="Close">${CLOSE}</button>
              </header>
              <div class="screen">
                <div class="frame"></div>
                <div class="notice" hidden><p>Connect to the internet to watch.</p></div>
                <div class="ended" hidden>
                  <p class="up">Up next</p>
                  <button class="go-next" type="button"></button>
                  <button class="stay" type="button">Stay here</button>
                </div>
              </div>
              <footer class="controls">
                <button class="step back" type="button">${PREV}<span></span></button>
                <a class="yt" target="_blank" rel="noopener">Watch on YouTube</a>
                <button class="step forward" type="button"><span></span>${NEXT}</button>
              </footer>
            </div>
          </dialog>`;

        const cover = this.#root.querySelector(".cover");
        cover.querySelector("img").addEventListener("error", () => cover.classList.add("nocover"));
        cover.addEventListener("click", () => this.#playNext());
        this.#root.querySelector(".parts").addEventListener("click", (event) => {
            const chip = event.target.closest(".part");
            if (chip && !chip.disabled) {
                this.#open(this.#dramaId, chip.dataset.ep);
            }
        });
        this.#root.querySelector(".more").addEventListener("click", (event) => {
            const other = event.target.closest(".other");
            if (other) {
                this.#dramaId = other.dataset.drama;
                this.#render();
            }
        });
        const dialog = this.#root.querySelector("dialog");
        this.#root.querySelector(".close").addEventListener("click", () => dialog.close());
        dialog.addEventListener("close", () => this.#stop());
        this.#root.querySelector(".back").addEventListener("click", () => this.#step(-1));
        this.#root.querySelector(".forward").addEventListener("click", () => this.#step(1));
        this.#root.querySelector(".go-next").addEventListener("click", () => this.#step(1));
        this.#root.querySelector(".stay").addEventListener("click", () => this.#cancelCountdown());
    }

    connectedCallback() {
        this.#preview = new URLSearchParams(location.search).has("reels-preview");
        this.hidden = true;
        this.#load();
        window.addEventListener("pageshow", this.#onShow);
        window.addEventListener("message", this.#onMessage);
    }

    disconnectedCallback() {
        window.removeEventListener("pageshow", this.#onShow);
        window.removeEventListener("message", this.#onMessage);
        clearTimeout(this.#timer);
        this.#cancelCountdown();
    }

    attributeChangedCallback(name, before, after) {
        if (before !== after && this.isConnected) {
            this.#load();
        }
    }

    #onShow = (event) => {
        // Back to the home page from the back/forward cache: parts may be out since.
        if (event.persisted) {
            this.#render();
        }
    };

    async #load() {
        const loadId = ++this.#loadId;
        const src = new URL(this.getAttribute("src") || DEFAULT_SRC, document.baseURI);
        let data = null;
        try {
            // Revalidate every time, so a new youtube_id shows without a new ?v= token.
            const response = await fetch(src, { cache: "no-cache" });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            data = await response.json();
        } catch (error) {
            console.error(`Unable to load ${NAME} from ${src}:`, error);
        }
        if (loadId !== this.#loadId) {
            return;
        }
        this.#dramas = readDramas(data);
        this.#playlist = String(data?.playlist_id ?? "");
        this.#render();
    }

    /** The dramas with a part out, in the file's order (the newest last). */
    #live(now) {
        return this.#dramas.filter((drama) =>
            this.#preview || drama.episodes.some((episode) => isOut(episode, now, this.#preview)),
        );
    }

    #render() {
        clearTimeout(this.#timer);
        const now = Date.now();
        const live = this.#live(now);
        this.hidden = live.length === 0;
        this.#schedule(now);
        if (live.length === 0) {
            return;
        }
        let drama = live.find((item) => item.id === this.#dramaId);
        if (!drama) {
            drama = live[live.length - 1];
            this.#dramaId = drama.id;
        }
        const watched = new Set(readWatched()[drama.id] ?? []);
        const out = drama.episodes.filter((episode) => isOut(episode, now, this.#preview));
        const next = this.#nextFor(drama, watched, now);

        const root = this.#root;
        const cover = root.querySelector(".cover");
        const img = cover.querySelector("img");
        cover.classList.remove("nocover");
        if (drama.cover) {
            img.src = drama.cover;
        } else {
            img.removeAttribute("src");
            cover.classList.add("nocover");
        }
        cover.querySelector(".fallback").textContent = drama.title ?? "";
        cover.disabled = out.length === 0;
        cover.setAttribute("aria-label", next ? `Play ${drama.title}, ${partLabel(next)}: ${next.title}` : `${drama.title}`);
        root.querySelector(".title").textContent = drama.title ?? "";
        root.querySelector(".passage").textContent = drama.passage ? `${drama.passage} · KJV` : "";
        root.querySelector(".desc").textContent = drama.description ?? "";
        root.querySelector(".status").innerHTML = this.#statusLine(drama, out, watched, next, now);

        root.querySelector(".parts").innerHTML = drama.episodes
            .map((episode) => {
                const isPlayable = out.includes(episode);
                const seen = watched.has(episode.id);
                const classes = ["part"];
                if (isPlayable && next && next.id === episode.id) {
                    classes.push("next");
                }
                if (seen) {
                    classes.push("watched");
                }
                const meta = isPlayable ? clock(episode.duration) || "Watch" : arrives(episode, now);
                const num = seen ? TICK : escapeHtml(episode.kind === "full" ? "★" : episode.part);
                const state = isPlayable ? (seen ? ", watched" : "") : `, arrives ${meta}`;
                return `<button class="${classes.join(" ")}" type="button" data-ep="${escapeHtml(episode.id)}"
                    ${isPlayable ? "" : "disabled"}
                    aria-label="${escapeHtml(`${partLabel(episode)}: ${episode.title}${state}`)}">
                    <span class="num">${num}</span>
                    <span class="label">${escapeHtml(partLabel(episode))}</span>
                    <span class="meta">${escapeHtml(isPlayable ? episode.title : meta)}${isPlayable && clock(episode.duration) ? ` · ${clock(episode.duration)}` : ""}</span>
                  </button>`;
            })
            .join("");

        const more = root.querySelector(".more");
        const others = live.filter((item) => item.id !== drama.id);
        const playlist = drama.playlist_id || this.#playlist;
        more.hidden = others.length === 0 && !playlist;
        more.innerHTML =
            (others.length ? `<span>More reels:</span>` : "") +
            others
                .map((item) => `<button class="other" type="button" data-drama="${escapeHtml(item.id)}">${escapeHtml(item.title)}</button>`)
                .join("") +
            (playlist
                ? `<a class="playlist" href="https://www.youtube.com/playlist?list=${encodeURIComponent(playlist)}" target="_blank" rel="noopener">All parts on YouTube</a>`
                : "");
    }

    /** The reader's next part: the first part out not yet watched, then the full cut, else the first. */
    #nextFor(drama, watched, now) {
        const out = drama.episodes.filter((episode) => isOut(episode, now, this.#preview));
        const parts = out.filter((episode) => episode.kind !== "full");
        return (
            parts.find((episode) => !watched.has(episode.id)) ??
            out.find((episode) => episode.kind === "full" && !watched.has(episode.id)) ??
            out[0] ??
            null
        );
    }

    #statusLine(drama, out, watched, next, now) {
        const name = (episode) => `${escapeHtml(partLabel(episode))} · ${escapeHtml(episode.title)}`;
        const coming = drama.episodes.find((episode) => !out.includes(episode));
        if (out.length === 0) {
            return coming ? `<b>${name(coming)}</b> arrives ${escapeHtml(arrives(coming, now))}` : "";
        }
        const seenAny = out.some((episode) => watched.has(episode.id));
        if (!seenAny) {
            return `<b>Start here:</b> ${name(next)}`;
        }
        if (next && !watched.has(next.id)) {
            const newest = out[out.length - 1];
            const fresh = next.id === newest.id && Number.isFinite(next.releaseAt) && now - next.releaseAt < 3 * 24 * 60 * 60 * 1000;
            return `<b>${fresh ? "New:" : "Up next:"}</b> ${name(next)}`;
        }
        if (coming) {
            return `<b>${name(coming)}</b> arrives ${escapeHtml(arrives(coming, now))}`;
        }
        return `<b>All parts watched.</b> Watch again any time`;
    }

    /** Show a part the moment it comes out, if that is within the week. */
    #schedule(now) {
        const upcoming = this.#dramas
            .flatMap((drama) => drama.episodes)
            .filter((episode) => episode.youtube_id && Number.isFinite(episode.releaseAt) && episode.releaseAt > now)
            .map((episode) => episode.releaseAt - now);
        if (upcoming.length) {
            const wait = Math.min(...upcoming);
            if (wait < WEEK) {
                this.#timer = setTimeout(() => this.#render(), Math.min(wait + 1000, MAX_TIMER));
            }
        }
    }

    // ---------------------------------------------------------------- player

    #playNext() {
        const drama = this.#dramas.find((item) => item.id === this.#dramaId);
        if (!drama) {
            return;
        }
        const next = this.#nextFor(drama, new Set(readWatched()[drama.id] ?? []), Date.now());
        if (next) {
            this.#open(drama.id, next.id);
        }
    }

    /** The parts out in the open drama, in order. */
    #playable() {
        const drama = this.#dramas.find((item) => item.id === this.#playing?.drama);
        if (!drama) {
            return [];
        }
        const now = Date.now();
        return drama.episodes.filter((episode) => isOut(episode, now, this.#preview));
    }

    #open(dramaId, episodeId) {
        const drama = this.#dramas.find((item) => item.id === dramaId);
        const episode = drama?.episodes.find((item) => item.id === episodeId);
        if (!drama || !episode || !episode.youtube_id) {
            return;
        }
        this.#cancelCountdown();
        this.#playing = { drama: drama.id, episode: episode.id };
        markWatched(drama.id, episode.id);

        const root = this.#root;
        const dialog = root.querySelector("dialog");
        root.querySelector(".now-drama").textContent = drama.title ?? "";
        root.querySelector(".now-part").textContent = `${partLabel(episode)}: ${episode.title}`;
        const yt = root.querySelector(".yt");
        yt.href =
            episode.kind === "full"
                ? `https://www.youtube.com/watch?v=${encodeURIComponent(episode.youtube_id)}`
                : `https://www.youtube.com/shorts/${encodeURIComponent(episode.youtube_id)}`;

        const parts = this.#playable();
        const index = parts.findIndex((item) => item.id === episode.id);
        const back = root.querySelector(".back");
        const forward = root.querySelector(".forward");
        back.hidden = index <= 0;
        forward.hidden = index < 0 || index >= parts.length - 1;
        back.querySelector("span").textContent = index > 0 ? partLabel(parts[index - 1]) : "";
        forward.querySelector("span").textContent = index >= 0 && index < parts.length - 1 ? partLabel(parts[index + 1]) : "";
        back.setAttribute("aria-label", index > 0 ? `Previous: ${partLabel(parts[index - 1])}` : "Previous");
        forward.setAttribute("aria-label", index >= 0 && index < parts.length - 1 ? `Next: ${partLabel(parts[index + 1])}` : "Next");

        const frame = root.querySelector(".frame");
        const notice = root.querySelector(".notice");
        frame.replaceChildren();
        notice.hidden = navigator.onLine !== false;
        if (notice.hidden) {
            const iframe = document.createElement("iframe");
            const params = new URLSearchParams({
                autoplay: "1",
                playsinline: "1",
                rel: "0",
                modestbranding: "1",
                enablejsapi: "1",
                origin: location.origin,
            });
            iframe.src = `${EMBED}${encodeURIComponent(episode.youtube_id)}?${params}`;
            iframe.title = `${drama.title}, ${partLabel(episode)}: ${episode.title}`;
            iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
            iframe.allowFullscreen = true;
            iframe.referrerPolicy = "strict-origin-when-cross-origin";
            iframe.addEventListener("load", () => {
                // Ask the player to report its state, so the end of a part is known.
                iframe.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), EMBED_ORIGIN);
            });
            frame.append(iframe);
        }
        if (!dialog.open) {
            dialog.showModal();
        }
        this.#render();
    }

    #step(direction) {
        const parts = this.#playable();
        const index = parts.findIndex((item) => item.id === this.#playing?.episode);
        const target = parts[index + direction];
        if (target) {
            this.#open(this.#playing.drama, target.id);
        }
    }

    /** Messages from the YouTube player: when the part ends, count down into the next one. */
    #onMessage = (event) => {
        const iframe = this.#root.querySelector(".frame iframe");
        if (!iframe || event.source !== iframe.contentWindow) {
            return;
        }
        let data;
        try {
            data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        } catch {
            return;
        }
        const state = data?.event === "onStateChange" ? data.info : data?.info?.playerState;
        if (state === 0) {
            this.#ended();
        }
    };

    #ended() {
        const parts = this.#playable();
        const index = parts.findIndex((item) => item.id === this.#playing?.episode);
        const next = parts[index + 1];
        if (!next || this.#countdown) {
            return;
        }
        const ended = this.#root.querySelector(".ended");
        const go = this.#root.querySelector(".go-next");
        let left = COUNTDOWN;
        const label = () => {
            go.textContent = `${partLabel(next)}: ${next.title} (${left})`;
        };
        label();
        ended.hidden = false;
        this.#countdown = setInterval(() => {
            left -= 1;
            if (left <= 0) {
                this.#cancelCountdown();
                this.#step(1);
                return;
            }
            label();
        }, 1000);
    }

    #cancelCountdown() {
        clearInterval(this.#countdown);
        this.#countdown = 0;
        this.#root.querySelector(".ended").hidden = true;
    }

    #stop() {
        this.#cancelCountdown();
        this.#root.querySelector(".frame").replaceChildren();
        this.#playing = null;
        this.#render();
    }
}

if (!customElements.get("daily-grace-reels")) {
    customElements.define("daily-grace-reels", DailyGraceReels);
}
