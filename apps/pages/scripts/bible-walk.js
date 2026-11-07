/**
 * Bible Walk (apps/pages/bible-walk.html): a chapter of the Bible a day, told as
 * a story and explained, in about eight minutes (docs/bible-walk/plan.md).
 *
 * Two views, chosen by the address:
 *   (no hash)        the plans: where the walk goes next, then each plan with
 *                    its episodes, ticked once heard; a plan with nothing
 *                    recorded yet shows as coming soon.
 *   #<episode id>    one episode (#mark-01): its player, the chapter to read
 *                    along in the King James words (passage-reader.js), the
 *                    question to answer in My Faith Journal, its words, and the
 *                    episodes before and after it.
 *
 * One recording plays at a time, and keeps playing while the reader looks at
 * the plans: a bar at the foot of the page (#mini-player) shows it there. The
 * phone's lock screen and earbuds control it too (Media Session). Where each
 * episode was left, and which were finished, are kept on this device
 * (assets/scripts/bible-walk/progress.js); an episode counts as heard at 95%.
 *
 * The data is assets/bible-walk/walk.json and the words are
 * assets/bible-walk/transcripts/<id>.txt, both built by
 * tools/bible-walk/build_bible_walk.py.
 *
 * Usage   import { start } from "./scripts/bible-walk.js";
 *         start(viewElement, miniPlayerElement);
 */

import { resolveMedia } from "../../settings/settings.js?v=20261009-1";
import {
    loadWalk,
    nextStep,
    planCounts,
    planOf,
    readProgress,
    saveProgress,
    todayIso,
} from "../../../assets/scripts/bible-walk/progress.js?v=20261107-1";

const BANNER = resolveMedia("media:images/bible-walk/bible-walk-banner.webp");
const TRANSCRIPTS = new URL("../../../assets/bible-walk/transcripts/", import.meta.url);
const JOURNAL = "journal.html";
const SPEEDS = [1, 1.25, 1.5, 0.75];
const BACK_SECONDS = 15;
const FORWARD_SECONDS = 30;
const HEARD_SHARE = 0.95;
const SAVE_EVERY = 5; // seconds of listening between saves of the position

const ICON = {
    play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2Z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect fill="currentColor" x="6" y="4.5" width="4.2" height="15" rx="1.2"/><rect fill="currentColor" x="13.8" y="4.5" width="4.2" height="15" rx="1.2"/></svg>`,
    back: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>`,
    forward: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>`,
    book: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4z"/><path d="M20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z"/></svg>`,
    pen: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
    check: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`,
};

const state = {
    walk: null,
    progress: null,
    view: null,
    mini: null,
    shown: null, // the episode id on screen, or null for the plans
};

// The one recording: created on the first play.
const player = {
    audio: null,
    id: null, // the episode it holds
    seekTo: 0, // where to start once the recording's length is known
    savedAt: 0, // the position last saved
    error: "",
};

const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** 7:37 */
function clock(seconds) {
    const s = Math.max(0, Math.floor(seconds || 0));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** "8 min" */
const minutes = (seconds) => `${Math.max(1, Math.round(seconds / 60))} min`;

/** "Mark 1: Prepare Ye the Way" for a chapter; an intro's title alone. */
const fullName = (episode) => (episode.chapter ? `${episode.label}: ${episode.title}` : episode.title);

const isSymbol = (art) => /-symbol\.svg$/.test(art ?? "");

function artHtml(art, className) {
    const symbol = isSymbol(art);
    return `<span class="${className}${symbol ? " is-symbol" : ""}"><img src="${escapeHtml(resolveMedia(art))}" alt="" loading="lazy" decoding="async" /></span>`;
}

/* ---------- Starting ---------- */

export async function start(view, mini) {
    state.view = view;
    state.mini = mini;
    try {
        state.walk = await loadWalk();
    } catch (error) {
        console.error(error);
        view.innerHTML = `<p class="status">Bible Walk could not be loaded. Check your connection, then reload the page.</p>`;
        return;
    }
    state.progress = readProgress();
    view.addEventListener("click", onClick);
    view.addEventListener("input", onInput);
    view.addEventListener("toggle", onToggle, true);
    mini.addEventListener("click", onClick);
    window.addEventListener("hashchange", route);
    window.addEventListener("pagehide", () => savePosition(true));
    route();
}

function route() {
    const id = decodeURIComponent(location.hash.slice(1));
    const episode = id && state.walk.episodes[id] ? id : null;
    const changed = episode !== state.shown;
    state.shown = episode;
    if (episode) {
        renderEpisode(episode);
    } else {
        renderPlans();
    }
    renderMini();
    if (changed) {
        window.scrollTo(0, 0);
    }
}

/* ---------- The plans ---------- */

function renderPlans() {
    const { walk, progress } = state;
    document.title = "Daily Grace — Bible Walk";
    state.view.innerHTML = `
      <section class="walk-hero">
        <img class="walk-hero-img" src="${escapeHtml(BANNER)}" alt="" width="1536" height="1024" decoding="async" />
        <div class="walk-hero-text">
          <p class="eyebrow">Daily Grace · Audio guide</p>
          <h1>Bible Walk</h1>
          <p class="lede">A chapter a day, told as a story and explained, in about eight minutes. Press play and walk through the Bible one chapter at a time, in the King James words.</p>
        </div>
      </section>
      ${nextHtml(nextStep(walk, progress))}
      ${walk.plans.map(planHtml).join("")}`;
}

function nextHtml(step) {
    const { walk, progress } = state;
    if (step.status === "waiting") {
        return `
          <section class="panel up-next is-waiting">
            <p class="eyebrow">You are up to date</p>
            <p class="up-next-title">${escapeHtml(step.label)} is coming soon.</p>
            <p class="up-next-meta">Each new chapter appears here as soon as it is recorded.</p>
          </section>`;
    }
    if (step.status === "finished") {
        return `
          <section class="panel up-next is-waiting">
            <p class="eyebrow">Well walked</p>
            <p class="up-next-title">You have heard every episode so far.</p>
          </section>`;
    }
    const episode = walk.episodes[step.id];
    const started = Object.keys(progress.done).length > 0 || step.status === "resume";
    const eyebrow = step.status === "resume" ? "Continue" : started ? "Up next" : "Start here";
    const left = step.status === "resume" ? `${minutes(episode.seconds - (progress.pos[step.id] ?? 0))} left` : minutes(episode.seconds);
    return `
      <section class="panel up-next">
        ${artHtml(episode.art, "up-next-art")}
        <div class="up-next-text">
          <p class="eyebrow">${eyebrow} · ${escapeHtml(step.plan.title)}</p>
          <a class="up-next-title" href="#${encodeURIComponent(step.id)}">${escapeHtml(fullName(episode))}</a>
          <p class="up-next-meta">${escapeHtml(left)}</p>
        </div>
        <button class="round-play" type="button" data-play="${escapeHtml(step.id)}" aria-label="Play ${escapeHtml(fullName(episode))}">${ICON.play}</button>
      </section>`;
}

function planHtml(plan) {
    const { walk, progress } = state;
    const counts = planCounts(plan, walk, progress);
    const cover = artHtml(plan.cover, "plan-cover");
    if (counts.ready === 0) {
        return `
          <section class="panel plan is-soon" id="plan-${escapeHtml(plan.id)}">
            <header class="plan-head">
              ${cover}
              <div class="plan-text">
                <h2>${escapeHtml(plan.title)}</h2>
                <p class="plan-subtitle">${escapeHtml(plan.subtitle)}</p>
                <p class="plan-about">${escapeHtml(plan.about)}</p>
                <p class="soon-badge">Coming soon · ${counts.total} episodes</p>
              </div>
            </header>
          </section>`;
    }
    const soonRow = (mark, name) => `
      <li class="ep is-soon">
        <span class="ep-mark">${mark}</span>
        <span class="ep-text"><span class="ep-label">${escapeHtml(name)}</span><span class="ep-title">Coming soon</span></span>
      </li>`;
    const rows = [];
    let index = 0;
    while (index < plan.episodes.length) {
        const { id, label } = plan.episodes[index];
        const episode = walk.episodes[id];
        if (!episode) {
            // The next chapter not recorded yet has a row of its own; the run
            // of them after it shares one ("Mark 3 to Mark 16").
            rows.push(soonRow(index + 1, label));
            let end = index + 1;
            while (end < plan.episodes.length && !walk.episodes[plan.episodes[end].id]) {
                end += 1;
            }
            const rest = plan.episodes.slice(index + 1, end);
            if (rest.length === 1) {
                rows.push(soonRow(index + 2, rest[0].label));
            } else if (rest.length > 1) {
                rows.push(soonRow("…", `${rest[0].label} to ${rest[rest.length - 1].label}`));
            }
            index = end;
            continue;
        }
        const heard = Boolean(progress.done[id]);
        const at = progress.pos[id] ?? 0;
        const meta = heard ? "Heard" : at > 5 ? `${minutes(episode.seconds - at)} left` : minutes(episode.seconds);
        rows.push(`
          <li class="ep${heard ? " is-heard" : ""}">
            <a class="ep-link" href="#${encodeURIComponent(id)}">
              <span class="ep-mark" aria-hidden="true">${heard ? ICON.check : index + 1}</span>
              <span class="ep-text"><span class="ep-label">${escapeHtml(label)}</span><span class="ep-title">${escapeHtml(episode.title)}</span></span>
              <span class="ep-meta">${escapeHtml(meta)}</span>
            </a>
          </li>`);
        index += 1;
    }
    const share = counts.total ? Math.round((counts.heard / counts.total) * 100) : 0;
    return `
      <section class="panel plan" id="plan-${escapeHtml(plan.id)}">
        <header class="plan-head">
          ${cover}
          <div class="plan-text">
            <h2>${escapeHtml(plan.title)}</h2>
            <p class="plan-subtitle">${escapeHtml(plan.subtitle)}</p>
            <p class="plan-about">${escapeHtml(plan.about)}</p>
            <div class="plan-progress" role="img" aria-label="${counts.heard} of ${counts.total} heard">
              <span class="bar"><i style="width:${share}%"></i></span>
              <span>${counts.heard} of ${counts.total} heard</span>
            </div>
          </div>
        </header>
        <ol class="episodes">${rows.join("")}</ol>
      </section>`;
}

/* ---------- One episode ---------- */

function renderEpisode(id) {
    const { walk } = state;
    const episode = walk.episodes[id];
    const plan = planOf(walk, id);
    const index = plan.episodes.findIndex((e) => e.id === id);
    document.title = `Bible Walk — ${fullName(episode)}`;
    const read = episode.chapter
        ? `<button class="act" type="button" data-read>${ICON.book}<span>Read ${escapeHtml(episode.label)}</span></button>`
        : "";
    state.view.innerHTML = `
      <a class="back-link" href="#">‹ Bible Walk</a>
      <article class="panel episode" data-episode="${escapeHtml(id)}">
        <header class="episode-head">
          ${artHtml(episode.art, "episode-art")}
          <div class="episode-text">
            <p class="eyebrow">${escapeHtml(plan.title)} · ${index + 1} of ${plan.episodes.length}</p>
            <h1>${escapeHtml(episode.title)}</h1>
            <p class="episode-label">${escapeHtml(episode.label)} · ${minutes(episode.seconds)}</p>
          </div>
        </header>

        <div class="player">
          <button class="big-play" type="button" data-toggle aria-label="Play">${ICON.play}</button>
          <div class="track">
            <input class="seek" type="range" min="0" max="${Math.round(episode.seconds)}" step="1" value="0" aria-label="Position in the episode" />
            <div class="times"><span class="t-now">0:00</span><span class="t-total">${clock(episode.seconds)}</span></div>
          </div>
          <div class="controls">
            <button class="ctl" type="button" data-skip="${-BACK_SECONDS}" aria-label="Back ${BACK_SECONDS} seconds">${ICON.back}<span>${BACK_SECONDS}</span></button>
            <button class="ctl" type="button" data-skip="${FORWARD_SECONDS}" aria-label="Forward ${FORWARD_SECONDS} seconds">${ICON.forward}<span>${FORWARD_SECONDS}</span></button>
            <button class="ctl speed" type="button" data-speed aria-label="Playback speed">1×</button>
          </div>
          <p class="player-note" role="status"></p>
        </div>

        <div class="actions">
          ${read}
          <a class="act" href="${JOURNAL}#log/walk/${encodeURIComponent(id)}">${ICON.pen}<span>Write my answer</span></a>
        </div>

        <section class="question">
          <h2>The question</h2>
          <p>${escapeHtml(episode.question)}</p>
        </section>

        <details class="transcript">
          <summary>Read the words</summary>
          <div class="transcript-body"><p class="status">Loading…</p></div>
        </details>

        ${navHtml(plan, index)}
      </article>`;
    syncPlayer();
}

function navHtml(plan, index) {
    const { walk } = state;
    const link = (entry, rel) => {
        if (!entry) {
            return `<span></span>`;
        }
        const episode = walk.episodes[entry.id];
        const word = rel === "prev" ? "Before" : "Next";
        if (!episode) {
            return `<span class="nav-link is-soon nav-${rel}"><span class="nav-word">${word}</span><span>${escapeHtml(entry.label)} · coming soon</span></span>`;
        }
        return `<a class="nav-link nav-${rel}" href="#${encodeURIComponent(entry.id)}"><span class="nav-word">${word}</span><span>${escapeHtml(fullName(episode))}</span></a>`;
    };
    return `<nav class="episode-nav" aria-label="Episodes">${link(plan.episodes[index - 1], "prev")}${link(plan.episodes[index + 1], "next")}</nav>`;
}

/* ---------- Playing ---------- */

function ensureAudio() {
    if (player.audio) {
        return player.audio;
    }
    const audio = new Audio();
    audio.preload = "metadata";
    audio.addEventListener("loadedmetadata", () => {
        if (player.seekTo > 0 && player.seekTo < audio.duration - 1) {
            audio.currentTime = player.seekTo;
        }
        player.seekTo = 0;
        syncPlayer();
    });
    audio.addEventListener("timeupdate", onTime);
    for (const type of ["play", "pause", "ratechange", "waiting", "playing"]) {
        audio.addEventListener(type, () => {
            if (type === "pause") {
                savePosition(true);
            }
            syncPlayer();
        });
    }
    audio.addEventListener("ended", () => {
        markHeard(player.id);
        syncPlayer();
    });
    audio.addEventListener("error", () => {
        if (!audio.getAttribute("src")) {
            return;
        }
        player.error = "This episode could not be played. Check your connection and try again.";
        syncPlayer();
    });
    player.audio = audio;
    setMediaHandlers();
    return audio;
}

/** Puts the episode in the player (once), ready where it was left. */
function load(id) {
    const audio = ensureAudio();
    if (player.id === id) {
        return audio;
    }
    savePosition(true);
    const episode = state.walk.episodes[id];
    const at = state.progress.pos[id] ?? 0;
    player.id = id;
    player.error = "";
    player.seekTo = at < episode.seconds - 10 ? at : 0;
    player.savedAt = player.seekTo;
    audio.src = resolveMedia(episode.audio);
    audio.defaultPlaybackRate = state.progress.speed;
    audio.playbackRate = state.progress.speed;
    state.progress.last = id;
    saveProgress(state.progress);
    setMetadata(id);
    return audio;
}

function play(id) {
    const audio = load(id);
    player.error = "";
    audio.play().catch((error) => {
        if (error?.name !== "AbortError") {
            player.error = "This episode could not be played. Check your connection and try again.";
            syncPlayer();
        }
    });
}

function toggle(id) {
    const audio = player.audio;
    if (audio && player.id === id && !audio.paused) {
        audio.pause();
    } else {
        play(id);
    }
}

/** Where the episode stands: from the player if it holds it, else as last left. */
function positionOf(id) {
    if (player.audio && player.id === id && player.audio.readyState > 0) {
        return player.audio.currentTime;
    }
    if (player.id === id && player.seekTo) {
        return player.seekTo;
    }
    return state.progress.pos[id] ?? 0;
}

/** Moves the episode to `seconds`, in the player or in what is remembered. */
function seek(id, seconds) {
    const episode = state.walk.episodes[id];
    const to = Math.min(Math.max(0, seconds), episode.seconds - 1);
    if (player.audio && player.id === id && player.audio.readyState > 0) {
        player.audio.currentTime = to;
    } else if (player.id === id) {
        player.seekTo = to;
    } else {
        state.progress.pos[id] = to;
        saveProgress(state.progress);
    }
    syncPlayer();
}

function onTime() {
    const audio = player.audio;
    const id = player.id;
    if (!id) {
        return;
    }
    const episode = state.walk.episodes[id];
    if (!state.progress.done[id] && audio.currentTime >= episode.seconds * HEARD_SHARE) {
        markHeard(id);
    }
    if (Math.abs(audio.currentTime - player.savedAt) >= SAVE_EVERY) {
        savePosition(false);
    }
    syncTime();
}

function savePosition(force) {
    const audio = player.audio;
    const id = player.id;
    if (!audio || !id || audio.readyState === 0) {
        return;
    }
    if (!force && Math.abs(audio.currentTime - player.savedAt) < SAVE_EVERY) {
        return;
    }
    player.savedAt = audio.currentTime;
    const episode = state.walk.episodes[id];
    if (audio.ended || audio.currentTime >= episode.seconds - 10) {
        delete state.progress.pos[id];
    } else {
        state.progress.pos[id] = Math.round(audio.currentTime);
    }
    saveProgress(state.progress);
}

function markHeard(id) {
    if (!id || state.progress.done[id]) {
        return;
    }
    state.progress.done[id] = todayIso();
    delete state.progress.pos[id];
    saveProgress(state.progress);
    if (!state.shown) {
        renderPlans();
    }
    const next = state.view.querySelector(".nav-next");
    if (next) {
        next.classList.add("is-ready");
    }
}

function cycleSpeed() {
    const at = SPEEDS.indexOf(state.progress.speed);
    const speed = SPEEDS[(at + 1) % SPEEDS.length];
    state.progress.speed = speed;
    saveProgress(state.progress);
    if (player.audio) {
        player.audio.defaultPlaybackRate = speed;
        player.audio.playbackRate = speed;
    }
    syncPlayer();
}

/* ---------- What the screen shows of the player ---------- */

function syncPlayer() {
    const id = state.shown;
    const box = id ? state.view.querySelector(".player") : null;
    if (box) {
        const mine = player.id === id && player.audio;
        const playing = mine && !player.audio.paused;
        const button = box.querySelector(".big-play");
        button.innerHTML = playing ? ICON.pause : ICON.play;
        button.setAttribute("aria-label", playing ? "Pause" : "Play");
        box.classList.toggle("is-playing", Boolean(playing));
        box.classList.toggle("is-loading", Boolean(playing && player.audio.readyState < 3));
        box.querySelector(".speed").textContent = `${state.progress.speed}×`;
        box.querySelector(".player-note").textContent = mine ? player.error : "";
        syncTime();
    }
    renderMini();
}

function syncTime() {
    const id = state.shown;
    const box = id ? state.view.querySelector(".player") : null;
    if (box) {
        const at = positionOf(id);
        const seek = box.querySelector(".seek");
        if (document.activeElement !== seek || player.id !== id) {
            seek.value = String(Math.round(at));
        }
        seek.setAttribute("aria-valuetext", `${clock(at)} of ${clock(state.walk.episodes[id].seconds)}`);
        box.querySelector(".t-now").textContent = clock(at);
    }
    const bar = state.mini.querySelector(".mini-bar i");
    if (bar && player.id) {
        const share = positionOf(player.id) / state.walk.episodes[player.id].seconds;
        bar.style.width = `${Math.min(100, share * 100)}%`;
    }
}

function renderMini() {
    const mini = state.mini;
    const id = player.id;
    // While the episode is under way, not once it has finished.
    const show = Boolean(
        id && player.audio && !player.audio.ended && state.shown !== id && (!player.audio.paused || positionOf(id) > 0),
    );
    mini.hidden = !show;
    document.body.classList.toggle("has-mini-player", show);
    if (!show) {
        mini.innerHTML = "";
        return;
    }
    const episode = state.walk.episodes[id];
    const playing = !player.audio.paused;
    mini.innerHTML = `
      <span class="mini-bar"><i></i></span>
      <a class="mini-open" href="#${encodeURIComponent(id)}">
        ${artHtml(episode.art, "mini-art")}
        <span class="mini-text"><span class="mini-label">${escapeHtml(episode.label)}</span><span class="mini-title">${escapeHtml(episode.title)}</span></span>
      </a>
      <button class="mini-play" type="button" data-play-toggle="${escapeHtml(id)}" aria-label="${playing ? "Pause" : "Play"}">${playing ? ICON.pause : ICON.play}</button>`;
    syncTime();
}

/* ---------- The phone's lock screen and earbuds ---------- */

function setMetadata(id) {
    if (!("mediaSession" in navigator) || typeof MediaMetadata !== "function") {
        return;
    }
    const episode = state.walk.episodes[id];
    const art = resolveMedia(episode.art);
    try {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: fullName(episode),
            artist: "Bible Walk · Daily Grace",
            album: planOf(state.walk, id)?.title ?? "Bible Walk",
            artwork: [{ src: art, sizes: "512x512", type: isSymbol(art) ? "image/svg+xml" : "image/webp" }],
        });
    } catch {
        // The lock screen shows less; the episode still plays.
    }
}

function setMediaHandlers() {
    if (!("mediaSession" in navigator)) {
        return;
    }
    const handlers = {
        play: (id) => play(id),
        pause: () => player.audio.pause(),
        seekbackward: (id) => seek(id, positionOf(id) - BACK_SECONDS),
        seekforward: (id) => seek(id, positionOf(id) + FORWARD_SECONDS),
        seekto: (id, details) => seek(id, details.seekTime ?? 0),
    };
    for (const [action, handler] of Object.entries(handlers)) {
        try {
            navigator.mediaSession.setActionHandler(action, (details) => {
                if (player.id) {
                    handler(player.id, details);
                }
            });
        } catch {
            // This browser does not offer that control.
        }
    }
}

/* ---------- Taps ---------- */

function onClick(event) {
    const target = event.target.closest("button, a");
    if (!target) {
        return;
    }
    const id = state.shown;
    if (target.dataset.play) {
        // "Play" on the next step: open the episode and start it.
        const playId = target.dataset.play;
        location.hash = encodeURIComponent(playId);
        play(playId);
        return;
    }
    if (target.dataset.playToggle) {
        toggle(target.dataset.playToggle);
        return;
    }
    if (!id) {
        return;
    }
    if (target.hasAttribute("data-toggle")) {
        toggle(id);
    } else if (target.dataset.skip) {
        seek(id, positionOf(id) + Number(target.dataset.skip));
    } else if (target.hasAttribute("data-speed")) {
        cycleSpeed();
    } else if (target.hasAttribute("data-read")) {
        openChapter(id);
    }
}

function onInput(event) {
    if (event.target.classList.contains("seek") && state.shown) {
        seek(state.shown, Number(event.target.value));
    }
}

async function openChapter(id) {
    const episode = state.walk.episodes[id];
    const { showPassageReader } = await import("../../components/passage-reader.js?v=20261106-1");
    showPassageReader({ book: episode.book, range: String(episode.chapter), title: episode.title });
}

/** Fetches the episode's words the first time "Read the words" is opened. */
async function onToggle(event) {
    const details = event.target;
    if (!details.classList?.contains("transcript") || !details.open || details.dataset.loaded) {
        return;
    }
    details.dataset.loaded = "true";
    const id = state.shown;
    const body = details.querySelector(".transcript-body");
    try {
        const response = await fetch(new URL(`${encodeURIComponent(id)}.txt`, TRANSCRIPTS));
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const text = await response.text();
        if (state.shown !== id) {
            return;
        }
        body.innerHTML = text
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => `<p>${escapeHtml(line)}</p>`)
            .join("");
    } catch {
        delete details.dataset.loaded;
        body.innerHTML = `<p class="status">The words could not be loaded. Close this and try again.</p>`;
    }
}
