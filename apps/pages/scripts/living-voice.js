/**
 * The Living Voice (apps/pages/living-voice.html): a chapter of the Bible a
 * day, told as a story and explained, in about eight minutes
 * (docs/bible-walk/plan.md; "Bible Walk" was its working name, which its data
 * and files keep).
 *
 * The page is a pocket player. Its screen has three views:
 *   Albums       the plans (First Steps, The Big Picture…), each with its
 *                cover; a plan with nothing recorded yet is coming soon.
 *   Tracks       a plan's chapters, ticked once heard; chapters not recorded
 *                yet are listed as coming soon.
 *   Now playing  the chapter in the player: its cover, track number, progress
 *                (a slider), speed, sleep timer, auto-play, and up next.
 * Below the screen are the buttons: previous, play/pause, next, List (back
 * from Now playing to Tracks to Albums), back 15 and forward 30 seconds.
 * Previous goes back to the start of the chapter first, as music players do.
 * When a chapter ends, the next one plays by itself unless auto-play is off
 * or the sleep timer says "end of chapter". The sleep timer can also pause
 * after 15 or 30 minutes of listening.
 *
 * Beside the player (below it on a phone) is the chapter shown on Now
 * playing: Read Mark 1 (the King James text, passage-reader.js), Write my
 * answer (its question in My Faith Journal, journal.html#log/walk/<id>), the
 * question, and Read the words (assets/bible-walk/transcripts/<id>.txt).
 *
 * The address names the chapter (#mark-01); with none, the player opens on
 * the next step of this reader's walk. While a chapter plays and the player
 * is scrolled away, a bar at the foot of the page (#mini-player) shows it.
 * The phone's lock screen and earbuds control it too (Media Session).
 * Progress, speed and auto-play are kept on this device
 * (assets/scripts/bible-walk/progress.js); a chapter counts as heard at 95%.
 *
 * Usage   import { start } from "./scripts/living-voice.js";
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
} from "../../../assets/scripts/bible-walk/progress.js?v=20261108-1";

const NAME = "The Living Voice";
const TRANSCRIPTS = new URL("../../../assets/bible-walk/transcripts/", import.meta.url);
const JOURNAL = "journal.html";
const SPEEDS = [1, 1.25, 1.5, 0.75];
const SLEEPS = [null, 15 * 60, 30 * 60, "end"]; // off, minutes of listening, end of chapter
const BACK_SECONDS = 15;
const FORWARD_SECONDS = 30;
const RESTART_AFTER = 3; // seconds in, after which Previous restarts the chapter
const HEARD_SHARE = 0.95;
const SAVE_EVERY = 5; // seconds of listening between saves of the position

const ICON = {
    play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2Z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect fill="currentColor" x="6" y="4.5" width="4.2" height="15" rx="1.2"/><rect fill="currentColor" x="13.8" y="4.5" width="4.2" height="15" rx="1.2"/></svg>`,
    prev: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><rect x="4" y="5" width="2.6" height="14" rx="1"/><path d="M20 5.5v13a1 1 0 0 1-1.5.86L8.7 12.86a1 1 0 0 1 0-1.72L18.5 4.64A1 1 0 0 1 20 5.5Z"/></svg>`,
    next: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><rect x="17.4" y="5" width="2.6" height="14" rx="1"/><path d="M4 5.5v13a1 1 0 0 0 1.5.86l9.8-6.5a1 1 0 0 0 0-1.72L5.5 4.64A1 1 0 0 0 4 5.5Z"/></svg>`,
    list: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>`,
    moon: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>`,
    loop: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>`,
    speed: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 14l4-4"/><path d="M3.3 17a9 9 0 1 1 17.4 0"/></svg>`,
    book: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4z"/><path d="M20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z"/></svg>`,
    pen: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
    check: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`,
    headphones: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></svg>`,
};

const state = {
    walk: null,
    progress: null,
    view: null,
    mini: null,
    els: null, // the parts of the player, found once
    screen: "now", // albums, tracks or now
    album: 0, // the plan shown on Tracks
    current: null, // the episode on Now playing
    sleep: 0, // index into SLEEPS
    sleepLeft: null, // seconds of listening left on the sleep timer
    deviceVisible: true,
};

// The one recording: created on the first play.
const player = {
    audio: null,
    id: null, // the episode it holds
    seekTo: 0, // where to start once the recording's length is known
    savedAt: 0, // the position last saved
    lastTime: 0, // the position at the last timeupdate, for the sleep timer
    error: "",
};

const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** 7:37 */
function clock(seconds) {
    const s = Math.max(0, Math.floor(seconds || 0));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** "Mark 1: Prepare Ye the Way" for a chapter; an intro's title alone. */
const fullName = (episode) => (episode.chapter ? `${episode.label}: ${episode.title}` : episode.title);

const isSymbol = (art) => /-symbol\.svg$/.test(art ?? "");

function artHtml(art, className) {
    return `<span class="${className}${isSymbol(art) ? " is-symbol" : ""}"><img src="${escapeHtml(resolveMedia(art))}" alt="" decoding="async" /></span>`;
}

const episodeOf = (id) => state.walk.episodes[id] ?? null;

/** The next (step 1) or previous (step -1) recorded chapter in the episode's plan, or null. */
function neighbour(id, step) {
    const plan = planOf(state.walk, id);
    const list = plan.episodes;
    for (let i = list.findIndex((e) => e.id === id) + step; i >= 0 && i < list.length; i += step) {
        if (episodeOf(list[i].id)) {
            return list[i].id;
        }
        if (step > 0) {
            // The walk goes in order: a chapter not recorded yet ends it for now.
            return null;
        }
    }
    return null;
}

/** What comes after the episode: { id } recorded, { label } coming soon, or null at the end. */
function upNext(id) {
    const list = planOf(state.walk, id).episodes;
    const after = list[list.findIndex((e) => e.id === id) + 1];
    if (!after) {
        return null;
    }
    return episodeOf(after.id) ? { id: after.id } : { label: after.label };
}

const isPlaying = () => Boolean(player.audio && !player.audio.paused);

/* ---------- Starting ---------- */

export async function start(view, mini) {
    state.view = view;
    state.mini = mini;
    try {
        state.walk = await loadWalk();
    } catch (error) {
        console.error(error);
        view.innerHTML = `<p class="status">${NAME} could not be loaded. Check your connection, then reload the page.</p>`;
        return;
    }
    state.progress = readProgress();
    renderShell();
    const first = startingEpisode();
    if (first) {
        setCurrent(first);
    } else {
        state.screen = "albums";
        renderScreen();
    }
    window.addEventListener("hashchange", () => {
        const id = decodeURIComponent(location.hash.slice(1));
        if (episodeOf(id) && id !== state.current) {
            setCurrent(id);
        }
    });
    window.addEventListener("pagehide", () => savePosition(true));
    if (typeof IntersectionObserver === "function") {
        new IntersectionObserver((entries) => {
            state.deviceVisible = entries.some((e) => e.isIntersecting);
            renderMini();
        }).observe(state.els.device);
    }
}

/** The chapter in the address, else the next step of the walk, else the last one played. */
function startingEpisode() {
    const { walk, progress } = state;
    const asked = decodeURIComponent(location.hash.slice(1));
    if (episodeOf(asked)) {
        return asked;
    }
    const step = nextStep(walk, progress);
    if (step.id) {
        return step.id;
    }
    if (progress.last && episodeOf(progress.last)) {
        return progress.last;
    }
    return Object.keys(walk.episodes)[0] ?? null;
}

function renderShell() {
    state.view.innerHTML = `
      <header class="lv-intro">
        <p class="eyebrow">Daily Grace · Audio guide</p>
        <h1><span class="lv-mark">${ICON.headphones}</span>${NAME}</h1>
        <p class="lede">A chapter of the Bible a day, told as a story and explained, in about eight minutes. Press play and listen your way through the Bible, in the King James words.</p>
      </header>
      <section class="lv-stage">
        <div class="device" id="player" aria-label="${NAME} player">
          <div class="dev-top">
            <span class="dev-brand">${ICON.headphones}<span>${NAME}</span></span>
            <span class="grille" aria-hidden="true">${"<i></i>".repeat(21)}</span>
          </div>
          <div class="lcd">
            <div class="lcd-bar"><b class="lcd-title"></b><span class="lcd-status" aria-live="polite"></span></div>
            <div class="lcd-body"></div>
          </div>
          <div class="pad">
            <div class="pad-main">
              <button class="btn round" type="button" data-btn="prev" aria-label="Previous chapter">${ICON.prev}</button>
              <button class="btn play" type="button" data-btn="play" aria-label="Play">${ICON.play}</button>
              <button class="btn round" type="button" data-btn="next" aria-label="Next chapter">${ICON.next}</button>
            </div>
            <div class="pad-small">
              <button class="btn small" type="button" data-btn="list" aria-label="Back to the list">${ICON.list}<span>List</span></button>
              <button class="btn small" type="button" data-btn="back" aria-label="Back ${BACK_SECONDS} seconds">−${BACK_SECONDS}</button>
              <button class="btn small" type="button" data-btn="forward" aria-label="Forward ${FORWARD_SECONDS} seconds">+${FORWARD_SECONDS}</button>
            </div>
          </div>
        </div>
        <section class="panel chapter" aria-live="polite"></section>
      </section>`;
    const device = state.view.querySelector(".device");
    state.els = {
        device,
        title: device.querySelector(".lcd-title"),
        status: device.querySelector(".lcd-status"),
        body: device.querySelector(".lcd-body"),
        play: device.querySelector('[data-btn="play"]'),
        chapter: state.view.querySelector(".chapter"),
    };
    device.addEventListener("click", onDeviceClick);
    device.addEventListener("input", onSeekInput);
    state.els.chapter.addEventListener("click", onChapterClick);
    state.els.chapter.addEventListener("toggle", onToggle, true);
    state.mini.addEventListener("click", onMiniClick);
}

/** Puts the episode on Now playing (and in the address); plays it if asked. */
function setCurrent(id, { play: andPlay = false } = {}) {
    state.current = id;
    state.album = state.walk.plans.indexOf(planOf(state.walk, id));
    state.screen = "now";
    history.replaceState(null, "", `#${encodeURIComponent(id)}`);
    document.title = `${NAME} — ${fullName(episodeOf(id))}`;
    renderScreen();
    renderChapter();
    if (andPlay) {
        play(id);
    }
}

/* ---------- The screen ---------- */

function renderScreen() {
    const { els } = state;
    const playing = isPlaying();
    els.play.innerHTML = playing ? ICON.pause : ICON.play;
    els.play.setAttribute("aria-label", playing ? "Pause" : "Play");
    els.device.classList.toggle("is-playing", playing);
    els.status.textContent = `${playing ? "Playing" : "Paused"} · ${state.progress.speed}×`;
    if (state.screen === "albums") {
        renderAlbums();
    } else if (state.screen === "tracks") {
        renderTracks();
    } else {
        renderNow();
    }
    renderMini();
}

function renderAlbums() {
    const { walk, progress, els } = state;
    els.title.textContent = NAME;
    els.body.innerHTML = walk.plans
        .map((plan, index) => {
            const counts = planCounts(plan, walk, progress);
            // A plan is walked in order, so it opens once its first episode is
            // recorded; a chapter it shares with another plan does not open it.
            const ready = Boolean(episodeOf(plan.episodes[0].id));
            const sub = ready ? `${counts.total} tracks · ${counts.heard} heard` : `Coming soon · ${counts.total} episodes`;
            return `
              <button class="row album" type="button" data-album="${index}" ${ready ? "" : "disabled"}>
                ${artHtml(plan.cover, "cover")}
                <span class="t"><b>${escapeHtml(plan.title)}</b><small>${escapeHtml(sub)}</small></span>
                <span class="d" aria-hidden="true">${ready ? "›" : ""}</span>
              </button>`;
        })
        .join("");
}

function renderTracks() {
    const { walk, progress, els } = state;
    const plan = walk.plans[state.album];
    els.title.textContent = plan.title;
    els.body.innerHTML = plan.episodes
        .map(({ id, label }, index) => {
            const episode = episodeOf(id);
            if (!episode) {
                return `
                  <button class="row track" type="button" disabled>
                    <span class="num">${index + 1}</span>
                    <span class="t"><b>${escapeHtml(label)}</b><small>Coming soon</small></span>
                    <span class="d"></span>
                  </button>`;
            }
            const on = id === state.current;
            const heard = Boolean(progress.done[id]);
            let mark = `<span class="num">${index + 1}</span>`;
            if (on && isPlaying()) {
                mark = `<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>`;
            } else if (heard) {
                mark = `<span class="num heard" aria-label="Heard">${ICON.check}</span>`;
            }
            return `
              <button class="row track${on ? " on" : ""}" type="button" data-track="${escapeHtml(id)}">
                ${mark}
                <span class="t"><b>${escapeHtml(episode.title)}</b><small>${escapeHtml(episode.label)}</small></span>
                <span class="d">${clock(episode.seconds)}</span>
              </button>`;
        })
        .join("");
    const on = els.body.querySelector(".row.on");
    if (on) {
        on.scrollIntoView({ block: "nearest" });
    }
}

function renderNow() {
    const { els, walk } = state;
    const id = state.current;
    const episode = episodeOf(id);
    const plan = planOf(walk, id);
    const index = plan.episodes.findIndex((e) => e.id === id);
    const next = upNext(id);
    let upNextText = "End of the album";
    if (next?.id) {
        const after = episodeOf(next.id);
        upNextText = `${escapeHtml(after.label)} · ${escapeHtml(after.title)}`;
    } else if (next) {
        upNextText = `${escapeHtml(next.label)} · coming soon`;
    }
    const sleep = SLEEPS[state.sleep];
    els.title.textContent = "Now playing";
    els.body.innerHTML = `
      <div class="now">
        <div class="now-head">
          ${artHtml(episode.art, "cover big")}
          <div class="now-meta">
            <small>Track ${index + 1} of ${plan.episodes.length}</small>
            <span class="now-label">${escapeHtml(episode.label)}</span>
            <b class="now-title">${escapeHtml(episode.title)}</b>
            <small>${escapeHtml(plan.title)}</small>
          </div>
        </div>
        <input class="lcd-seek" type="range" min="0" max="${Math.round(episode.seconds)}" step="1" value="0" aria-label="Position in the chapter" />
        <div class="times"><span class="t-now">0:00</span><span class="t-left"></span></div>
        <div class="lcd-icons">
          <button class="lcd-icon" type="button" data-act="speed" aria-label="Playback speed">${ICON.speed}<span>${state.progress.speed}×</span></button>
          <button class="lcd-icon${sleep === null ? " off" : ""}" type="button" data-act="sleep" aria-label="Sleep timer">${ICON.moon}<span class="sleep-text">${sleepText()}</span></button>
          <button class="lcd-icon${state.progress.auto ? "" : " off"}" type="button" data-act="auto" aria-pressed="${state.progress.auto}">${ICON.loop}<span>Auto-play ${state.progress.auto ? "on" : "off"}</span></button>
        </div>
        <p class="lcd-note" role="status">${escapeHtml(player.id === id ? player.error : "")}</p>
        <div class="upnext"><small>UP NEXT</small><span>${upNextText}</span></div>
      </div>`;
    syncTime();
}

function sleepText() {
    const sleep = SLEEPS[state.sleep];
    if (sleep === null) {
        return "Sleep off";
    }
    if (sleep === "end") {
        return "Sleep: end of chapter";
    }
    return `Sleep ${clock(state.sleepLeft ?? sleep)}`;
}

/** Moves the slider, the times and the sleep countdown, without drawing the screen again. */
function syncTime() {
    const id = state.current;
    const body = state.els.body;
    if (state.screen === "now" && id) {
        const episode = episodeOf(id);
        const at = positionOf(id);
        const seek = body.querySelector(".lcd-seek");
        if (seek) {
            if (document.activeElement !== seek) {
                seek.value = String(Math.round(at));
            }
            seek.style.setProperty("--fill", `${Math.min(100, (at / episode.seconds) * 100)}%`);
            seek.setAttribute("aria-valuetext", `${clock(at)} of ${clock(episode.seconds)}`);
        }
        const now = body.querySelector(".t-now");
        const left = body.querySelector(".t-left");
        if (now) {
            now.textContent = clock(at);
        }
        if (left) {
            left.textContent = `-${clock(episode.seconds - at)}`;
        }
        const sleep = body.querySelector(".sleep-text");
        if (sleep) {
            sleep.textContent = sleepText();
        }
    }
    const bar = state.mini.querySelector(".mini-bar i");
    if (bar && player.id) {
        bar.style.width = `${Math.min(100, (positionOf(player.id) / episodeOf(player.id).seconds) * 100)}%`;
    }
}

/* ---------- The chapter beside the player ---------- */

function renderChapter() {
    const id = state.current;
    const episode = episodeOf(id);
    const plan = planOf(state.walk, id);
    const read = episode.chapter
        ? `<button class="act" type="button" data-read>${ICON.book}<span>Read ${escapeHtml(episode.label)}</span></button>`
        : "";
    state.els.chapter.innerHTML = `
      <p class="eyebrow">This chapter · ${escapeHtml(plan.title)}</p>
      <h2>${escapeHtml(fullName(episode))}</h2>
      <div class="actions">
        ${read}
        <a class="act" href="${JOURNAL}#log/walk/${encodeURIComponent(id)}">${ICON.pen}<span>Write my answer</span></a>
      </div>
      <section class="question">
        <h3>The question</h3>
        <p>${escapeHtml(episode.question)}</p>
      </section>
      <details class="transcript">
        <summary>Read the words</summary>
        <div class="transcript-body"><p class="status">Loading…</p></div>
      </details>`;
}

function onChapterClick(event) {
    if (event.target.closest("[data-read]")) {
        openChapter(state.current);
    }
}

async function openChapter(id) {
    const episode = episodeOf(id);
    const { showPassageReader } = await import("../../components/passage-reader.js?v=20261106-1");
    showPassageReader({ book: episode.book, range: String(episode.chapter), title: episode.title });
}

/** Fetches the chapter's words the first time "Read the words" is opened. */
async function onToggle(event) {
    const details = event.target;
    if (!details.classList?.contains("transcript") || !details.open || details.dataset.loaded) {
        return;
    }
    details.dataset.loaded = "true";
    const id = state.current;
    const body = details.querySelector(".transcript-body");
    try {
        const response = await fetch(new URL(`${encodeURIComponent(id)}.txt`, TRANSCRIPTS));
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const text = await response.text();
        if (state.current !== id) {
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
        player.lastTime = audio.currentTime;
        syncTime();
    });
    audio.addEventListener("timeupdate", onTime);
    for (const type of ["play", "pause", "ratechange"]) {
        audio.addEventListener(type, () => {
            if (type === "pause") {
                savePosition(true);
            }
            renderScreen();
        });
    }
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", () => {
        if (!audio.getAttribute("src")) {
            return;
        }
        player.error = "This chapter could not be played. Check your connection and try again.";
        renderScreen();
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
    const episode = episodeOf(id);
    const at = state.progress.pos[id] ?? 0;
    player.id = id;
    player.error = "";
    player.seekTo = at < episode.seconds - 10 ? at : 0;
    player.savedAt = player.seekTo;
    player.lastTime = player.seekTo;
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
            player.error = "This chapter could not be played. Check your connection and try again.";
            renderScreen();
        }
    });
}

function toggle(id) {
    if (player.id === id && isPlaying()) {
        player.audio.pause();
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
    const episode = episodeOf(id);
    const to = Math.min(Math.max(0, seconds), episode.seconds - 1);
    if (player.audio && player.id === id && player.audio.readyState > 0) {
        player.audio.currentTime = to;
        player.lastTime = to;
    } else if (player.id === id) {
        player.seekTo = to;
    } else {
        state.progress.pos[id] = to;
        saveProgress(state.progress);
    }
    syncTime();
}

function onTime() {
    const audio = player.audio;
    const id = player.id;
    if (!id) {
        return;
    }
    // The sleep timer counts minutes of listening, whatever the speed.
    const moved = audio.currentTime - player.lastTime;
    player.lastTime = audio.currentTime;
    if (typeof SLEEPS[state.sleep] === "number" && state.sleepLeft !== null && moved > 0 && moved < 3) {
        state.sleepLeft -= moved / audio.playbackRate;
        if (state.sleepLeft <= 0) {
            state.sleep = 0;
            state.sleepLeft = null;
            audio.pause();
        }
    }
    if (!state.progress.done[id] && audio.currentTime >= episodeOf(id).seconds * HEARD_SHARE) {
        markHeard(id);
    }
    if (Math.abs(audio.currentTime - player.savedAt) >= SAVE_EVERY) {
        savePosition(false);
    }
    syncTime();
}

function onEnded() {
    const id = player.id;
    markHeard(id);
    if (SLEEPS[state.sleep] === "end") {
        state.sleep = 0;
        state.sleepLeft = null;
        renderScreen();
        return;
    }
    const next = state.progress.auto ? neighbour(id, 1) : null;
    if (next) {
        setCurrent(next, { play: true });
        return;
    }
    renderScreen();
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
    if (audio.ended || audio.currentTime >= episodeOf(id).seconds - 10) {
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
    if (state.screen !== "now") {
        renderScreen();
    }
}

/* ---------- The buttons ---------- */

function onDeviceClick(event) {
    const target = event.target.closest("button");
    if (!target || target.disabled) {
        return;
    }
    const id = state.current;
    if (target.dataset.album) {
        state.album = Number(target.dataset.album);
        state.screen = "tracks";
        renderScreen();
        return;
    }
    if (target.dataset.track) {
        setCurrent(target.dataset.track, { play: true });
        return;
    }
    if (target.dataset.act) {
        onScreenControl(target.dataset.act);
        return;
    }
    const button = target.dataset.btn;
    if (button === "list") {
        state.screen = state.screen === "now" ? "tracks" : "albums";
        renderScreen();
        return;
    }
    if (!id) {
        return;
    }
    if (button === "play") {
        toggle(id);
    } else if (button === "prev") {
        previous();
    } else if (button === "next") {
        skipNext();
    } else if (button === "back") {
        seek(id, positionOf(id) - BACK_SECONDS);
    } else if (button === "forward") {
        seek(id, positionOf(id) + FORWARD_SECONDS);
    }
}

/** Back to the start of the chapter, or, near its start, the chapter before. */
function previous() {
    const id = state.current;
    const before = neighbour(id, -1);
    if (positionOf(id) > RESTART_AFTER || !before) {
        seek(id, 0);
        return;
    }
    setCurrent(before, { play: isPlaying() });
}

function skipNext() {
    const next = neighbour(state.current, 1);
    if (next) {
        setCurrent(next, { play: isPlaying() });
    }
}

function onScreenControl(action) {
    if (action === "speed") {
        const at = SPEEDS.indexOf(state.progress.speed);
        state.progress.speed = SPEEDS[(at + 1) % SPEEDS.length];
        if (player.audio) {
            player.audio.defaultPlaybackRate = state.progress.speed;
            player.audio.playbackRate = state.progress.speed;
        }
    } else if (action === "sleep") {
        state.sleep = (state.sleep + 1) % SLEEPS.length;
        const sleep = SLEEPS[state.sleep];
        state.sleepLeft = typeof sleep === "number" ? sleep : null;
    } else if (action === "auto") {
        state.progress.auto = !state.progress.auto;
    }
    saveProgress(state.progress);
    renderScreen();
}

function onSeekInput(event) {
    if (event.target.classList.contains("lcd-seek") && state.current) {
        seek(state.current, Number(event.target.value));
    }
}

/* ---------- The bar at the foot ---------- */

function renderMini() {
    const mini = state.mini;
    const id = player.id;
    const show = Boolean(
        id && player.audio && !player.audio.ended && !state.deviceVisible && (isPlaying() || positionOf(id) > 0),
    );
    mini.hidden = !show;
    document.body.classList.toggle("has-mini-player", show);
    if (!show) {
        mini.innerHTML = "";
        return;
    }
    const episode = episodeOf(id);
    const playing = isPlaying();
    mini.innerHTML = `
      <span class="mini-bar"><i></i></span>
      <button class="mini-open" type="button" data-mini="open" aria-label="Back to the player">
        ${artHtml(episode.art, "mini-art")}
        <span class="mini-text"><span class="mini-label">${escapeHtml(episode.label)}</span><span class="mini-title">${escapeHtml(episode.title)}</span></span>
      </button>
      <button class="mini-play" type="button" data-mini="toggle" aria-label="${playing ? "Pause" : "Play"}">${playing ? ICON.pause : ICON.play}</button>`;
    syncTime();
}

function onMiniClick(event) {
    const target = event.target.closest("[data-mini]");
    if (!target) {
        return;
    }
    if (target.dataset.mini === "toggle") {
        toggle(player.id);
    } else {
        state.els.device.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

/* ---------- The phone's lock screen and earbuds ---------- */

function setMetadata(id) {
    if (!("mediaSession" in navigator) || typeof MediaMetadata !== "function") {
        return;
    }
    const episode = episodeOf(id);
    const art = resolveMedia(episode.art);
    try {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: fullName(episode),
            artist: `${NAME} · Daily Grace`,
            album: planOf(state.walk, id)?.title ?? NAME,
            artwork: [{ src: art, sizes: "512x512", type: isSymbol(art) ? "image/svg+xml" : "image/webp" }],
        });
    } catch {
        // The lock screen shows less; the chapter still plays.
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
        previoustrack: () => previous(),
        nexttrack: () => skipNext(),
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
