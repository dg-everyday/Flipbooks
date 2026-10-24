/**
 * Daily Grace Kids, for kids.html: the app shell, the routes, and the screens
 * around the stories (welcome, Who's exploring?, home, map, stickers, games,
 * rest). The Story Stop is kids-stop.js; the Grown-ups' Corner, the child form
 * and the printables are kids-corner.js.
 *
 * Routes (in the address's #, so Back and bookmarks work):
 *   #/                     welcome (no children yet) or Who's exploring?
 *   #/home  #/map  #/stickers  #/games  #/games/pairs  #/games/colour/<story>
 *   #/stop/<story>[/<step>][/<game>]   the five steps; Play's extra games
 *   #/reward/<story>       after a story
 *   #/rest                 the time limit was reached
 *   #/corner  #/corner/add  #/corner/child/<id>   behind the grown-up gate
 *   #/print/verse/<story>  #/print/certificate/<child>/<section>
 *
 * Everything a child does is kept on this device (assets/scripts/kids/store.js);
 * the rules that turn it into leaves, birds, Nari's stage and stickers are in
 * assets/scripts/kids/rules.js; the story data is assets/kids/kids-data.json.
 */

import { resolveMedia } from "../../settings/settings.js?v=20261009-1";
import * as store from "../../../assets/scripts/kids/store.js?v=20261024-2";
import * as rules from "../../../assets/scripts/kids/rules.js?v=20261024-2";
import { createAudio } from "../../../assets/scripts/kids/audio.js?v=20261024-2";
import {
    BAND_NAMES, ICONS, brandLink, earnedFor, escapeHtml, gameConfig, gate, groupName, nariSrc, toast, treeHtml,
} from "./kids-ui.js?v=20261024-2";
import { renderStop, renderReward } from "./kids-stop.js?v=20261024-3";
import { renderCorner, renderChildForm, renderPrint } from "./kids-corner.js?v=20261024-2";
import "../../components/kids/kids-pairs.js?v=20261024-2";
import "../../components/kids/kids-colour.js?v=20261024-2";

const DATA_URL = new URL("../../../assets/kids/kids-data.json?v=20261024-2", import.meta.url).href;
const AVATARS_URL = new URL("../../../assets/avatars-kids.json?v=20261024-2", import.meta.url).href;
// How often the time limit counts the minutes the page has been in use.
const USAGE_TICK_MS = 15_000;
// Stickers come a few at a time: after a story, and one on coming home.
const STICKERS_PER_STORY = 2;
const STICKERS_ON_HOME = 1;
// The grown-up gate stays open this long once passed.
const GATE_OPEN_MS = 10 * 60_000;
// Screens a child can't reach once the time limit is up.
const CHILD_ROUTES = new Set(["home", "map", "stop", "reward", "stickers", "games"]);
// The coming-soon badge (kids/map/coming-soon.webp) was replaced on the media
// host on 2026-10-24; the token makes browsers fetch the new picture, not a
// copy they kept of the old one.
const SOON_BADGE_VERSION = "20261024";

export async function start(root) {
    const app = {
        root,
        data: null,
        avatars: [],
        resolve: resolveMedia,
        audio: createAudio(resolveMedia),
        store,
        rules,
        gateUntil: 0,
        fresh: {},           // what this visit to a story has just earned (for the reward screen)
        cleanup: null,
        route: null,
    };
    try {
        const [data, avatars] = await Promise.all([fetchJson(DATA_URL), fetchJson(AVATARS_URL)]);
        app.data = data;
        app.avatars = Array.isArray(avatars) ? avatars : [];
    } catch (error) {
        console.error("Daily Grace Kids could not start:", error);
        root.innerHTML = `
          <section class="screen center">
            <h1 class="title">Daily Grace Kids</h1>
            <p class="lede">The stories couldn't be loaded. Please check the connection and try again.</p>
            <button class="btn" type="button" data-retry>Try again</button>
          </section>`;
        root.querySelector("[data-retry]").addEventListener("click", () => location.reload());
        return;
    }

    Object.assign(app, helpers(app));
    applySettings(app);
    store.events.addEventListener("settingschange", () => applySettings(app));
    store.events.addEventListener("storagechange", () => showStorageWarning());
    if (!store.isPersistent()) {
        showStorageWarning();
    }
    // A picture that can't load shows a soft placeholder instead of a broken image.
    root.addEventListener("error", (event) => {
        if (event.target instanceof HTMLImageElement) {
            event.target.classList.add("broken");
        }
    }, true);
    // Nari reacts to the games: cheer, think, point.
    root.addEventListener("kids-mood", (event) => app.react(event.detail.pose));
    window.addEventListener("hashchange", () => route(app));
    // Another tab may have changed the profiles, settings or progress.
    window.addEventListener("storage", (event) => {
        if (event.key !== null && !event.key.startsWith("dailygrace:kids:")) {
            return;
        }
        store.refresh();
        // Every open tab counts the minutes, so this one only checks the limit.
        if (event.key === "dailygrace:kids:usage") {
            if (CHILD_ROUTES.has(app.route?.name) && store.minutesLeft() <= 0) {
                app.go("#/rest");
            }
            return;
        }
        // Mid-story, mid-game or mid-form, the screen stays as it is unless
        // the explorer it belongs to has gone.
        const busy = ["stop", "reward", "games", "corner", "print"].includes(app.route?.name);
        if (busy && (store.currentChild() || !CHILD_ROUTES.has(app.route.name))) {
            return;
        }
        route(app);
    });
    startUsageClock(app);
    showOrientationHint();
    route(app);
    // Sound effects are fetched once the first tap has unlocked sound.
    document.addEventListener("pointerdown", () => app.audio.preload(Object.values(app.data.sfx)), { once: true });
}

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`${url}: ${response.status}`);
    }
    return response.json();
}

function helpers(app) {
    let reactTimer = 0;
    return {
        go(hash) {
            if (location.hash === hash) {
                route(app);
            } else {
                location.hash = hash;
            }
        },
        child() {
            return store.currentChild();
        },
        settings() {
            return store.settings();
        },
        progress() {
            const child = store.currentChild();
            return child ? store.progress(child.id) : null;
        },
        counts() {
            const p = app.progress();
            return p ? rules.tally(p, app.data) : rules.tally(null, app.data);
        },
        nariStage() {
            return rules.nariStage(app.counts().finished, app.data);
        },
        nari(pose = "idle") {
            return nariSrc(app, app.nariStage(), pose);
        },
        story(id) {
            return app.data.stories.find((s) => s.id === id) ?? null;
        },
        sfx(key) {
            app.audio.sfx(app.data.sfx[key]);
        },
        line(key) {
            return app.audio.say(app.data.nari.lines[key]);
        },
        say(url, options) {
            return app.audio.say(url, options);
        },
        /** Nari reacts for a moment, then goes back to how he was. */
        react(pose) {
            const img = app.root.querySelector(".nari-react");
            if (!img) {
                return;
            }
            const rest = img.dataset.rest || "idle";
            img.src = app.nari(pose);
            clearTimeout(reactTimer);
            reactTimer = setTimeout(() => {
                if (img.isConnected) {
                    img.src = app.nari(rest);
                }
            }, 1800);
        },
        avatarSrc(id) {
            const a = app.avatars.find((x) => x.id === id) ?? app.avatars[0];
            return a ? app.resolve(app.data.avatars.base + a.file) : "";
        },
        avatarThumb(id) {
            const a = app.avatars.find((x) => x.id === id) ?? app.avatars[0];
            return a ? app.resolve(app.data.avatars.base + (a.thumbnail || a.file)) : "";
        },
        /** Runs `next` after the grown-up gate (skipped while it is still open). */
        async grownUp(next, reason) {
            if (Date.now() < app.gateUntil) {
                next();
                return true;
            }
            app.audio.stop();
            const ok = await gate(reason);
            if (ok) {
                app.gateUntil = Date.now() + GATE_OPEN_MS;
                next();
            }
            return ok;
        },
        /** Gives up to `limit` of the stickers now due (the rest wait); returns their ids. */
        giveStickers(limit = STICKERS_PER_STORY) {
            const child = store.currentChild();
            if (!child) {
                return [];
            }
            const due = rules.dueStickers(store.progress(child.id), store.stickers(child.id).earned, app.data);
            return store.giveStickers(child.id, due.slice(0, limit));
        },
        sticker(id) {
            return app.data.stickers.list.find((s) => s.id === id) ?? null;
        },
    };
}

function applySettings(app) {
    const s = store.settings();
    const html = document.documentElement;
    html.classList.toggle("kids-big-text", s.bigText);
    html.classList.toggle("kids-reading-font", s.readingFont);
    html.classList.toggle("kids-less-motion", s.lessMotion);
    html.classList.toggle("kids-read-together", s.readTogether);
    app.audio.configure({ sound: s.sound, narration: s.narration });
}

function showStorageWarning() {
    if (document.getElementById("kids-storage-warning")) {
        return;
    }
    const bar = document.createElement("p");
    bar.id = "kids-storage-warning";
    bar.className = "storage-warning";
    bar.setAttribute("role", "status");
    bar.textContent = "Progress can't be saved on this device right now, so it will start again next time.";
    document.body.prepend(bar);
}

function showOrientationHint() {
    let dismissed = false;
    try {
        dismissed = sessionStorage.getItem("dailygrace:kids:landscape-hint") === "1";
    } catch {
        dismissed = false;
    }
    if (dismissed) {
        return;
    }
    const hint = document.createElement("div");
    hint.className = "orientation-hint";
    hint.innerHTML = `<span>Daily Grace Kids is best with the tablet held upright.</span>
      <button type="button" aria-label="Close this tip">${ICONS.close}</button>`;
    hint.querySelector("button").addEventListener("click", () => {
        hint.remove();
        try {
            sessionStorage.setItem("dailygrace:kids:landscape-hint", "1");
        } catch {
            /* the tip comes back next visit */
        }
    });
    document.body.append(hint);
}

/** Counts the minutes the page is in use (shown and on a child's screen). */
function startUsageClock(app) {
    setInterval(() => {
        if (document.hidden || !app.route || !CHILD_ROUTES.has(app.route.name)) {
            return;
        }
        store.addUsage(USAGE_TICK_MS / 60_000);
        if (store.minutesLeft() <= 0) {
            app.go("#/rest");
        }
    }, USAGE_TICK_MS);
}

// --------------------------------------------------------------------- routes
export function parse(hash) {
    const parts = String(hash || "").replace(/^#\/?/, "").split("/").filter(Boolean).map((p) => {
        try {
            return decodeURIComponent(p);
        } catch {
            return p;
        }
    });
    return { name: parts[0] ?? "", args: parts.slice(1) };
}

function route(app) {
    app.cleanup?.();
    app.cleanup = null;
    app.audio.stop();
    const r = parse(location.hash);
    const child = store.currentChild();
    const p = store.profiles();

    if (CHILD_ROUTES.has(r.name) && store.minutesLeft() <= 0) {
        location.replace("#/rest");
        return;
    }
    if (CHILD_ROUTES.has(r.name) && !child) {
        location.replace("#/");
        return;
    }
    app.route = r;
    window.scrollTo(0, 0);
    const views = {
        "": () => (p.children.length ? whoView(app) : welcomeView(app)),
        who: () => (p.children.length ? whoView(app) : welcomeView(app)),
        home: () => homeView(app),
        map: () => mapView(app),
        stop: () => renderStop(app, r.args),
        reward: () => renderReward(app, r.args[0]),
        stickers: () => stickersView(app),
        games: () => gamesView(app, r.args),
        rest: () => restView(app),
        corner: () => cornerRoute(app, r.args),
        print: () => renderPrint(app, r.args),
    };
    const view = views[r.name];
    if (!view) {
        location.replace("#/");
        return;
    }
    const cleanup = view();
    app.cleanup = typeof cleanup === "function" ? cleanup : null;
    // Focus starts at the heading, unless the screen put it somewhere itself
    // (the name field of "Add a child").
    if (!app.root.contains(document.activeElement)) {
        const heading = app.root.querySelector("h1");
        heading?.setAttribute("tabindex", "-1");
        heading?.focus({ preventScroll: true });
    }
}

function cornerRoute(app, args) {
    if (Date.now() >= app.gateUntil) {
        app.root.innerHTML = `<section class="screen center"><p class="lede">For grown-ups…</p></section>`;
        app.grownUp(() => route(app), "For grown-ups").then((ok) => {
            if (!ok) {
                app.go(store.currentChild() ? "#/home" : "#/");
            }
        });
        return null;
    }
    if (args[0] === "add") {
        return renderChildForm(app, null);
    }
    if (args[0] === "child" && args[1]) {
        return renderChildForm(app, args[1]);
    }
    return renderCorner(app);
}

// --------------------------------------------------------------------- welcome
function welcomeView(app) {
    const stage = app.data.nari.stages[0];
    app.root.innerHTML = `
      <section class="screen welcome" style="--bg:url('${escapeHtml(app.resolve(app.data.ui.welcome))}')">
        ${brandLink()}
        <img class="welcome-nari nari-react" data-rest="idle" src="${escapeHtml(nariSrc(app, stage, "idle"))}" alt="Nari the lion cub, waving" width="768" height="768" />
        <h1 class="title">Hello! I'm Nari.</h1>
        <p class="lede">Shall we go on an adventure through the Bible together? A grown-up sets up the first explorer.</p>
        <button class="btn big" type="button" data-start>${ICONS.lock} A grown-up starts here</button>
        <p class="small footnote">Best enjoyed together · Everything stays on this device</p>
      </section>`;
    app.root.querySelector("[data-start]").addEventListener("click", () => {
        app.grownUp(() => app.go("#/corner/add"), "Set up an explorer");
    });
    app.line("hello-first");
}

// --------------------------------------------------------------------- who
function whoView(app) {
    const p = store.profiles();
    app.root.innerHTML = `
      <section class="screen who">
        ${brandLink()}
        <h1 class="title">Who's exploring today?</h1>
        <p class="lede">Tap your picture to start.</p>
        <div class="children">
          ${p.children.map((c) => {
              const counts = rules.tally(store.progress(c.id), app.data);
              return `
                <button class="child-card" type="button" data-child="${escapeHtml(c.id)}">
                  <img src="${escapeHtml(app.avatarSrc(c.avatar))}" alt="" width="512" height="512" />
                  <span class="child-name">${escapeHtml(c.name)}</span>
                  <span class="band band-${c.band}">${escapeHtml(BAND_NAMES[c.band])}</span>
                  <span class="leaves">${ICONS.leaf} ${counts.leaves} ${counts.leaves === 1 ? "leaf" : "leaves"}</span>
                </button>`;
          }).join("")}
          ${p.children.length < store.MAX_CHILDREN ? `<button class="child-card add" type="button" data-add>${ICONS.plus}<span>Add a child</span></button>` : ""}
        </div>
        <button class="pill-btn" type="button" data-corner>${ICONS.lock} Grown-ups' Corner</button>
        <p class="small footnote">Best enjoyed together · Everything stays on this device</p>
      </section>`;
    app.root.querySelector(".children").addEventListener("click", (event) => {
        const card = event.target.closest("[data-child]");
        if (card) {
            store.setCurrent(card.dataset.child);
            app.sfx("tap");
            app.go("#/home");
        } else if (event.target.closest("[data-add]")) {
            app.grownUp(() => app.go("#/corner/add"), "Add a child");
        }
    });
    app.root.querySelector("[data-corner]").addEventListener("click", () => app.grownUp(() => app.go("#/corner"), "Grown-ups' Corner"));
    app.line("who-is-exploring");
}

// --------------------------------------------------------------------- home
function homeView(app) {
    const child = app.child();
    const counts = app.counts();
    const stage = app.nariStage();
    const next = rules.nextStory(app.progress(), app.data);
    const grow = rules.nextNariStage(counts.finished, app.data);
    const fresh = app.giveStickers(STICKERS_ON_HOME);
    const unseen = Object.values(store.stickers(child.id).earned).filter((e) => !e.seen).length;
    const firstVisit = !Object.keys(app.progress().stops).length;
    const stageIndex = app.data.nari.stages.findIndex((s) => s.stage === stage.stage);
    app.root.innerHTML = `
      <section class="screen home">
        <header class="bar">
          <button class="avatar-btn" type="button" data-who aria-label="Switch explorer"><img src="${escapeHtml(app.avatarThumb(child.avatar))}" alt="" /></button>
          <div class="bar-text">
            <h1 class="title small-title">Hi, ${escapeHtml(child.name)}!</h1>
            <span class="sub">Nari is happy to see you.</span>
          </div>
          <button class="round-btn" type="button" data-corner aria-label="Grown-ups' Corner">${ICONS.lock}</button>
        </header>
        <div class="panel tree-panel">
          <div class="panel-head"><h2>My Growing Tree</h2></div>
          <button class="tree-btn" type="button" data-tree aria-label="My Growing Tree">${treeHtml(app, counts)}</button>
          <div class="tally">
            <div><b class="c-leaf">${counts.leaves}</b><span>${counts.leaves === 1 ? "leaf" : "leaves"}</span></div>
            <div><b class="c-fruit">${counts.fruit}</b><span>fruit</span></div>
            <div><b class="c-flower">${counts.flowers}</b><span>${counts.flowers === 1 ? "flower" : "flowers"}</span></div>
            <div><b class="c-bird">${counts.birds}</b><span>${counts.birds === 1 ? "bird" : "birds"}</span></div>
          </div>
        </div>
        <div class="panel nari-panel">
          <img class="nari-mini nari-react" data-rest="idle" src="${escapeHtml(app.nari("idle"))}" alt="" />
          <div class="nari-text">
            <p class="nari-line"><b>Nari is a <span>${escapeHtml(stage.name)}</span></b>
              <span>${grow ? `${grow.more} more ${grow.more === 1 ? "story" : "stories"} to grow!` : "All grown up!"}</span></p>
            <div class="grow-steps" aria-hidden="true">
              ${app.data.nari.stages.map((s, i) => `<span class="${i <= stageIndex ? "done" : ""}">${escapeHtml(s.name)}</span>`).join("")}
            </div>
          </div>
        </div>
        ${next ? `
          <button class="keep-going" type="button" data-story="${escapeHtml(next.id)}">
            <img src="${escapeHtml(app.resolve(next.badge))}" alt="" />
            <span class="kg-text"><span>${counts.finished ? "Keep going!" : "Your first story"}</span><b>${escapeHtml(next.title)}</b></span>
            <span class="kg-play">${ICONS.play}</span>
          </button>` : `
          <div class="panel all-done"><b>You finished every story!</b><span>New stories are coming soon. You can play any story again from the map.</span></div>`}
        <nav class="home-nav" aria-label="More">
          <button type="button" data-go="#/map" class="nav-map">${ICONS.map}<span>Journey Map</span></button>
          <button type="button" data-go="#/stickers" class="nav-stickers">${ICONS.star}<span>My Stickers</span>${unseen ? `<b class="new-badge" aria-label="${unseen} new">${unseen}</b>` : ""}</button>
          <button type="button" data-go="#/games" class="nav-games">${ICONS.games}<span>Games</span></button>
        </nav>
      </section>`;
    const root = app.root;
    root.querySelector("[data-who]").addEventListener("click", () => app.go("#/"));
    root.querySelector("[data-corner]").addEventListener("click", () => app.grownUp(() => app.go("#/corner"), "Grown-ups' Corner"));
    root.querySelector("[data-tree]").addEventListener("click", () => {
        app.react("cheer");
        app.line("home-tree");
    });
    root.querySelector("[data-story]")?.addEventListener("click", (event) => {
        app.sfx("tap");
        app.go(`#/stop/${event.currentTarget.dataset.story}`);
    });
    for (const b of root.querySelectorAll("[data-go]")) {
        b.addEventListener("click", () => {
            app.sfx("tap");
            app.go(b.dataset.go);
        });
    }
    if (fresh.length) {
        toast(fresh.length === 1 ? "You have a new sticker!" : `You have ${fresh.length} new stickers!`);
        app.sfx("sticker");
    }
    app.line(firstVisit ? "hello-first" : "welcome-back");
}

// --------------------------------------------------------------------- map
function mapView(app) {
    const progress = app.progress();
    const settings = app.settings();
    const stops = progress.stops;
    const stories = rules.road(app.data);
    const next = rules.nextStory(progress, app.data);
    const finished = stories.filter((s) => rules.isFinished(stops[s.id])).length;
    const byId = new Map(app.data.stories.map((s) => [s.id, s]));
    const sections = app.data.map.sections.map((section) => {
        const places = app.data.map.road.filter((p) => p.section === section.id);
        return `
          <section class="map-section" aria-label="${escapeHtml(section.name)}">
            <img class="map-art" src="${escapeHtml(app.resolve(section.image))}" alt="" width="1536" height="2304" loading="lazy" />
            <p class="map-ribbon"><b>${escapeHtml(section.name)}</b><span>${escapeHtml(section.line)}</span></p>
            ${places.map((place) => {
                const [x, y] = section.clearings[place.clearing];
                const pos = `left:${x * 100}%;top:${y * 100}%`;
                if (place.soon) {
                    const badge = `${app.resolve(app.data.map.comingSoon)}?v=${SOON_BADGE_VERSION}`;
                    return `<button class="map-stop soon" type="button" style="${pos}" data-soon="${escapeHtml(place.soon)}">
                      <img class="soon-badge" src="${escapeHtml(badge)}" alt="" width="512" height="512" loading="lazy" />
                      <span class="stop-label">${escapeHtml(place.soon)} · soon</span></button>`;
                }
                const story = byId.get(place.story);
                const done = rules.isFinished(stops[story.id]);
                const open = rules.isOpen(story.id, progress, app.data, settings.mapInOrder);
                const isNext = next?.id === story.id;
                return `<button class="map-stop${done ? " done" : ""}${isNext ? " next" : ""}${open ? "" : " locked"}" type="button" style="${pos}" data-story="${escapeHtml(story.id)}"
                    aria-label="${escapeHtml(story.title)}${done ? ", finished" : ""}${open ? "" : ", not open yet"}">
                  <span class="stop-badge"><img src="${escapeHtml(app.resolve(story.badge))}" alt="" />
                    ${done ? `<span class="stop-check">${ICONS.check}</span>` : ""}${open ? "" : `<span class="stop-lock">${ICONS.lock}</span>`}</span>
                  <span class="stop-label">${escapeHtml(story.title)}</span>
                  ${isNext ? `<img class="map-nari" src="${escapeHtml(app.nari("avatar"))}" alt="" />` : ""}
                </button>`;
            }).join("")}
          </section>`;
    }).join("");
    app.root.innerHTML = `
      <section class="screen map">
        <header class="bar sticky">
          <button class="round-btn" type="button" data-go="#/home" aria-label="Back home">${ICONS.back}</button>
          <div class="bar-text"><h1 class="title small-title">The Journey</h1><span class="sub">From the Garden to the River of Life</span></div>
          <span class="count-pill">${finished} of ${stories.length}</span>
        </header>
        <div class="map-road">${sections}</div>
      </section>`;
    const root = app.root;
    root.querySelector("[data-go]").addEventListener("click", () => app.go("#/home"));
    root.querySelector(".map-road").addEventListener("click", (event) => {
        const stop = event.target.closest(".map-stop");
        if (!stop) {
            return;
        }
        if (stop.dataset.soon) {
            app.sfx("soon");
            app.line("map-coming-soon");
            toast(`“${stop.dataset.soon}” is coming soon!`);
            return;
        }
        if (stop.classList.contains("locked")) {
            app.sfx("try-again");
            toast("Finish the stories before this one first.");
            return;
        }
        app.sfx("bounce");
        app.go(`#/stop/${stop.dataset.story}`);
    });
    // Bring the next story into view.
    const target = root.querySelector(".map-stop.next") ?? [...root.querySelectorAll(".map-stop.done")].pop();
    requestAnimationFrame(() => target?.scrollIntoView({ block: "center", behavior: "instant" }));
    if (!finished) {
        app.line("map-intro");
    }
}

// --------------------------------------------------------------------- stickers
function stickersView(app) {
    const child = app.child();
    const earned = store.stickers(child.id).earned;
    const paths = app.data.stickers.paths;
    const shelves = paths.map((path) => {
        const series = app.data.stickers.list.filter((s) => s.group === path.group);
        const have = series.filter((s) => earned[s.id]);
        return `
          <section class="panel shelf">
            <h2>${escapeHtml(groupName(path.group))} <span>${have.length} of ${series.length}</span></h2>
            <p class="small">${escapeHtml(path.how)}</p>
            ${have.length ? `<div class="sticker-grid">
              ${have.map((s) => `<button class="sticker" type="button" data-sticker="${escapeHtml(s.id)}">
                <img src="${escapeHtml(app.resolve(s.image))}" alt="" loading="lazy" />
                <span>${escapeHtml(s.title)}</span>${earned[s.id].seen ? "" : `<b class="new-badge">New</b>`}
              </button>`).join("")}</div>` : `<p class="empty">None yet. Keep going!</p>`}
          </section>`;
    }).join("");
    const total = Object.keys(earned).length;
    app.root.innerHTML = `
      <section class="screen stickers">
        <header class="bar">
          <button class="round-btn" type="button" data-go="#/home" aria-label="Back home">${ICONS.back}</button>
          <div class="bar-text"><h1 class="title small-title">My Stickers</h1><span class="sub">${total} ${total === 1 ? "sticker" : "stickers"} so far</span></div>
        </header>
        ${shelves}
      </section>
      <dialog class="sticker-dialog" aria-labelledby="sticker-title"><div class="sticker-card"></div></dialog>`;
    const root = app.root;
    root.querySelector("[data-go]").addEventListener("click", () => app.go("#/home"));
    const dialog = root.querySelector(".sticker-dialog");
    root.querySelector(".screen").addEventListener("click", (event) => {
        const b = event.target.closest("[data-sticker]");
        if (!b) {
            return;
        }
        const s = app.sticker(b.dataset.sticker);
        const e = earned[s.id];
        dialog.querySelector(".sticker-card").innerHTML = `
          <button class="round-btn dialog-close" type="button" aria-label="Close" data-close>${ICONS.close}</button>
          <img src="${escapeHtml(app.resolve(s.image))}" alt="${escapeHtml(s.title)} sticker" />
          <h2 id="sticker-title">${escapeHtml(s.title)}</h2>
          ${s.verse ? `<blockquote>${escapeHtml(s.verse)}<cite>${escapeHtml(s.reference)}</cite></blockquote>` : ""}
          <p class="small">Earned for ${escapeHtml(earnedFor(app, s, e))}</p>`;
        dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
        dialog.showModal();
    });
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
            dialog.close();
        }
    });
    store.markStickersSeen(child.id);
}



// --------------------------------------------------------------------- games
function gamesView(app, args) {
    const child = app.child();
    const progress = app.progress();
    if (args[0] === "pairs") {
        app.root.innerHTML = `
          <section class="screen game-screen">
            <header class="bar">
              <button class="round-btn" type="button" data-go="#/games" aria-label="Back to the games">${ICONS.back}</button>
              <div class="bar-text"><h1 class="title small-title">Two by Two</h1><span class="sub">Find the animal pairs</span></div>
              <img class="nari-corner nari-react" data-rest="point" src="${escapeHtml(app.nari("point"))}" alt="" />
            </header>
            <kids-pairs></kids-pairs>
          </section>`;
        const game = app.root.querySelector("kids-pairs");
        game.config = gameConfig(app, { back: app.data.pairs.back, cards: app.data.pairs.cards });
        game.addEventListener("kids-done", () => {
            store.addPairsWin(child.id);
            const given = app.giveStickers();
            if (given.length) {
                const s = app.sticker(given[0]);
                toast(`A gift for you: the “${s.title}” sticker!`);
                app.sfx("sticker");
            }
        });
        app.root.querySelector("[data-go]").addEventListener("click", () => app.go("#/games"));
        return null;
    }
    if (args[0] === "colour" && args[1]) {
        const story = app.story(args[1]);
        if (!story) {
            app.go("#/games");
            return null;
        }
        app.root.innerHTML = `
          <section class="screen game-screen">
            <header class="bar">
              <button class="round-btn" type="button" data-go="#/games" aria-label="Back to the games">${ICONS.back}</button>
              <div class="bar-text"><h1 class="title small-title">Colour It In</h1><span class="sub">${escapeHtml(story.title)}</span></div>
            </header>
            <kids-colour></kids-colour>
          </section>`;
        const game = app.root.querySelector("kids-colour");
        game.config = gameConfig(app, { image: story.colouring.image });
        game.addEventListener("kids-done", () => app.go("#/games"));
        app.root.querySelector("[data-go]").addEventListener("click", () => app.go("#/games"));
        return null;
    }
    const watched = app.data.stories.filter((s) => progress.stops[s.id]?.steps?.watch);
    app.root.innerHTML = `
      <section class="screen games">
        <header class="bar">
          <button class="round-btn" type="button" data-go="#/home" aria-label="Back home">${ICONS.back}</button>
          <div class="bar-text"><h1 class="title small-title">Games</h1><span class="sub">Play any time</span></div>
        </header>
        <button class="panel game-card" type="button" data-play="#/games/pairs">
          <img src="${escapeHtml(app.resolve(app.data.pairs.cards[0].image))}" alt="" />
          <span><b>Two by Two</b><span>Find the pairs of Bible animals</span></span>
        </button>
        <section class="panel">
          <h2>Colour It In</h2>
          ${watched.length ? `<div class="colour-list">
            ${watched.map((s) => `<button type="button" data-play="#/games/colour/${escapeHtml(s.id)}">
              <img src="${escapeHtml(app.resolve(s.badge))}" alt="" /><span>${escapeHtml(s.title)}</span></button>`).join("")}
          </div>` : `<p class="empty">Watch a story first, then you can colour its picture here.</p>`}
        </section>
      </section>`;
    app.root.querySelector("[data-go]").addEventListener("click", () => app.go("#/home"));
    app.root.querySelector(".games").addEventListener("click", (event) => {
        const b = event.target.closest("[data-play]");
        if (b) {
            app.sfx("tap");
            app.go(b.dataset.play);
        }
    });
    return null;
}


// --------------------------------------------------------------------- rest
function restView(app) {
    const stage = app.child() ? app.nariStage() : app.data.nari.stages[0];
    if (store.minutesLeft() > 0) {
        location.replace(app.child() ? "#/home" : "#/");
        return null;
    }
    app.root.innerHTML = `
      <section class="screen rest" style="--bg:url('${escapeHtml(app.resolve(app.data.ui.rest))}')">
        <h1 class="title">Time to rest</h1>
        <img class="rest-nari" src="${escapeHtml(nariSrc(app, stage, "sleep"))}" alt="Nari, fast asleep" />
        <p class="lede">Nari is sleeping. That's all for today. Come back soon!</p>
        <button class="pill-btn" type="button" data-more>${ICONS.lock} Grown-ups: more time</button>
      </section>`;
    app.root.querySelector("[data-more]").addEventListener("click", () => {
        app.grownUp(() => {
            store.addExtraTime(15);
            toast("15 more minutes.");
            app.go(app.child() ? "#/home" : "#/");
        }, "More time");
    });
    app.line("rest");
    return null;
}
