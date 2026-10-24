/**
 * Daily Grace Kids: one Story Stop, in five steps, and the reward after it.
 *
 *   1 Watch & Listen   the six pictures, told aloud (ages 3–5 or 6–8)
 *   2 Look & Find      <kids-look-find>
 *   3 Play             <kids-story-order>, then the story's own games if wanted
 *   4 My Verse         <kids-verse-builder>
 *   5 Talk Together    a card for the grown-up: Ask, Do, Pray
 *
 * The steps go in order the first time: a link to a later step opens the first
 * step not yet done. A finished story can be played again from any step, and
 * earns nothing twice (assets/scripts/kids/rules.js counts from the record).
 * Five paw prints at the top show the way.
 */

import * as store from "../../../assets/scripts/kids/store.js?v=20261024-2";
import * as rules from "../../../assets/scripts/kids/rules.js?v=20261024-2";
import { ICONS, earnedFor, escapeHtml, gameConfig, toast, treeHtml } from "./kids-ui.js?v=20261024-2";
import "../../components/kids/kids-look-find.js?v=20261024-2";
import "../../components/kids/kids-story-order.js?v=20261024-2";
import "../../components/kids/kids-verse-builder.js?v=20261024-2";
import "../../components/kids/kids-who-said.js?v=20261024-2";
import "../../components/kids/kids-gather.js?v=20261024-2";
import "../../components/kids/kids-colour.js?v=20261024-2";
import "../../components/kids/kids-right-or-not.js?v=20261024-2";

const STEP_NAMES = { watch: "Watch & Listen", find: "Look & Find", play: "Play", verse: "My Verse", talk: "Talk Together" };
const GAME_NAMES = {
    "who-said": "Who Said It?", gather: "Gather & Count", colour: "Colour It In", "right-or-not": "Right or Not?",
};
const GAME_LINES = { "who-said": "Hear a saying, then tap who said it", gather: "Catch them in the basket and count", colour: "Colour the story's picture", "right-or-not": "Is it what happened?" };

/*
 * What this visit to a story has earned so far (a fruit, a leaf, a flower,
 * birds, the stickers given), for the reward screen. It is kept in the
 * page and in sessionStorage, so a reload of the reward screen still shows
 * it; it is forgotten once the child leaves the reward screen.
 */
const freshKey = (child, story) => `${child.id}:${story.id}`;

function loadFresh(key) {
    try {
        return JSON.parse(sessionStorage.getItem(`dailygrace:kids:fresh:${key}`));
    } catch {
        return null;
    }
}

function saveFresh(app, key) {
    try {
        sessionStorage.setItem(`dailygrace:kids:fresh:${key}`, JSON.stringify(app.fresh[key]));
    } catch {
        /* the reward still shows from memory, just not after a reload */
    }
}

function forgetFresh(app, key) {
    delete app.fresh[key];
    try {
        sessionStorage.removeItem(`dailygrace:kids:fresh:${key}`);
    } catch {
        /* nothing kept */
    }
}

/** The first step of the story not done yet (the first step again once finished). */
function firstOpenStep(stop) {
    if (rules.isFinished(stop)) {
        return "watch";
    }
    return rules.STEPS.find((s) => !(stop?.steps?.[s] || (s === "talk" && stop?.talkLater))) ?? "watch";
}

function header(app, story, step) {
    const progress = app.progress();
    const stop = progress.stops[story.id];
    const n = rules.STEPS.indexOf(step);
    return `
      <header class="bar stop-bar">
        <button class="round-btn" type="button" data-leave aria-label="Leave the story">${ICONS.close}</button>
        <div class="bar-text center">
          <h1 class="title small-title">${escapeHtml(story.title)}</h1>
          <span class="sub">Step ${n + 1} of 5 · ${STEP_NAMES[step]}</span>
        </div>
        <img class="nari-head nari-react" data-rest="point" src="${escapeHtml(app.nari("point"))}" alt="" />
        <button class="round-btn" type="button" data-listen aria-label="Hear it again">${ICONS.speaker}</button>
      </header>
      <ol class="paws" aria-label="Step ${n + 1} of 5">
        ${rules.STEPS.map((s, i) => {
            const done = stop?.steps?.[s] || (s === "talk" && stop?.talkLater);
            return `<li class="paw${done ? " done" : ""}${i === n ? " here" : ""}" aria-label="${STEP_NAMES[s]}${done ? ", done" : ""}">${ICONS.paw}</li>`;
        }).join("")}
      </ol>
      ${app.settings().readTogether ? `<p class="read-together-bar"><img src="${escapeHtml(app.resolve(app.data.ui.readTogether))}" alt="" />Read Together is on: a grown-up reads, and the child taps the pictures.</p>` : ""}`;
}

function wireHeader(app, story, listen) {
    app.root.querySelector("[data-leave]").addEventListener("click", () => app.go("#/map"));
    app.root.querySelector("[data-listen]").addEventListener("click", () => listen());
}

function nextButton(label, hash) {
    return `<div class="next-row"><button class="btn next-btn" type="button" data-next="${escapeHtml(hash)}">${escapeHtml(label)} ${ICONS.next}</button></div>`;
}

function wireNext(app) {
    for (const b of app.root.querySelectorAll("[data-next]")) {
        b.addEventListener("click", () => {
            app.sfx("paw");
            app.go(b.dataset.next);
        });
    }
}

export function renderStop(app, args) {
    const [id, stepArg, gameArg] = args;
    const story = app.story(id);
    if (!story) {
        app.go("#/map");
        return null;
    }
    const child = app.child();
    const progress = app.progress();
    if (!rules.isOpen(id, progress, app.data, app.settings().mapInOrder)) {
        toast("Finish the stories before this one first.");
        location.replace("#/map");
        return null;
    }
    const stop = progress.stops[id];
    const open = firstOpenStep(stop);
    let step = rules.STEPS.includes(stepArg) ? stepArg : open;
    // The first time through, a later step waits for the earlier ones.
    if (!rules.isFinished(stop) && rules.STEPS.indexOf(step) > rules.STEPS.indexOf(open)) {
        step = open;
    }
    if (step !== stepArg) {
        location.replace(`#/stop/${id}/${step}`);
        return null;
    }
    const key = freshKey(child, story);
    app.fresh[key] = app.fresh[key] ?? loadFresh(key) ?? {};
    const views = { watch: watchStep, find: findStep, play: playStep, verse: verseStep, talk: talkStep };
    return views[step](app, story, child, gameArg);
}

// ------------------------------------------------------------------ 1 watch
function watchStep(app, story, child) {
    const band = child.band;
    let i = 0;
    let swipeX = null;
    const panels = story.panels;
    const draw = () => {
        const p = panels[i];
        const last = i === panels.length - 1;
        app.root.querySelector(".panel-art img").src = app.resolve(p.image);
        app.root.querySelector(".panel-art img").alt = "";
        app.root.querySelector(".story-text").textContent = p[band];
        app.root.querySelector(".story-ref").textContent = `Told by the narrator · from ${p.ref}`;
        app.root.querySelector("[data-prev]").disabled = i === 0;
        app.root.querySelector("[data-fwd]").hidden = last;
        app.root.querySelector(".finish-watch").hidden = !last;
        for (const [n, dot] of app.root.querySelectorAll(".dot").entries()) {
            dot.className = `dot${n < i ? " seen" : ""}${n === i ? " here" : ""}`;
        }
        app.root.querySelector(".dots").setAttribute("aria-label", `Picture ${i + 1} of ${panels.length}`);
        // Load the next picture while this one is told.
        if (!last) {
            new Image().src = app.resolve(panels[i + 1].image);
        }
    };
    // Asked for (the play button, "Hear it again"): heard even with narration off.
    const tell = () => app.say(panels[i].audio[band], { force: true });
    // Told by itself (on opening, on turning a picture): only with narration on.
    const tellOnItsOwn = () => app.say(panels[i].audio[band]);
    const go = (to) => {
        if (to < 0 || to >= panels.length || to === i) {
            return;
        }
        i = to;
        app.sfx("page");
        draw();
        tellOnItsOwn();
    };
    app.root.innerHTML = `
      <section class="screen stop watch fit" data-band="${band}">
        ${header(app, story, "watch")}
        <div class="panel-art"><img src="" alt="" width="1536" height="1536" draggable="false" /></div>
        <div class="story-card">
          <p class="story-text" aria-live="polite"></p>
          <span class="story-ref"></span>
        </div>
        <div class="player">
          <button class="round-btn big-round" type="button" data-prev aria-label="Previous picture">${ICONS.back}</button>
          <button class="play-btn" type="button" data-play aria-label="Hear this picture">${ICONS.play}</button>
          <button class="round-btn big-round" type="button" data-fwd aria-label="Next picture">${ICONS.next}</button>
          <button class="btn finish-watch" type="button" data-done hidden>Next: Look &amp; Find ${ICONS.next}</button>
        </div>
        <div class="dots" role="img">${panels.map(() => `<span class="dot"></span>`).join("")}</div>
      </section>`;
    wireHeader(app, story, tell);
    const root = app.root;
    root.querySelector("[data-prev]").addEventListener("click", () => go(i - 1));
    root.querySelector("[data-fwd]").addEventListener("click", () => go(i + 1));
    root.querySelector("[data-play]").addEventListener("click", () => {
        if (app.audio.playing) {
            app.audio.stop();
        } else {
            tell();
        }
    });
    root.querySelector("[data-done]").addEventListener("click", () => {
        store.completeStep(child.id, story.id, "watch");
        app.sfx("paw");
        app.go(`#/stop/${story.id}/find`);
    });
    const art = root.querySelector(".panel-art");
    art.addEventListener("pointerdown", (event) => {
        swipeX = event.clientX;
    });
    art.addEventListener("pointerup", (event) => {
        if (swipeX === null) {
            return;
        }
        const dx = event.clientX - swipeX;
        swipeX = null;
        if (Math.abs(dx) > 50) {
            go(i + (dx < 0 ? 1 : -1));
        }
    });
    const onKey = (event) => {
        if (event.key === "ArrowRight") {
            go(i + 1);
        } else if (event.key === "ArrowLeft") {
            go(i - 1);
        }
    };
    document.addEventListener("keydown", onKey);
    const playButton = root.querySelector("[data-play]");
    const off = app.audio.onchange((state) => {
        if (playButton.isConnected) {
            playButton.innerHTML = state.playing ? ICONS.pause : ICONS.play;
            playButton.setAttribute("aria-label", state.playing ? "Pause" : "Hear this picture");
        }
    });
    draw();
    // Look & Find and Story in Order come next: start their pictures now.
    for (const src of [story.find.image, ...panels.map((p) => p.image)]) {
        new Image().src = app.resolve(src);
    }
    // The story's name, then the first picture.
    app.say(story.titleAudio).then((how) => {
        if (how !== "stopped" && i === 0 && root.querySelector(".watch")) {
            tellOnItsOwn();
        }
    });
    return () => {
        document.removeEventListener("keydown", onKey);
        off();
    };
}

// ------------------------------------------------------------------ 2 find
function findStep(app, story, child) {
    app.root.innerHTML = `
      <section class="screen stop fit">
        ${header(app, story, "find")}
        <kids-look-find fit></kids-look-find>
        <div class="done-row" hidden>${nextButton("Next: Play", `#/stop/${story.id}/play`)}</div>
      </section>`;
    const game = app.root.querySelector("kids-look-find");
    const count = child.band === "lions" ? story.find.items.length : story.find.lambsCount;
    game.config = gameConfig(app, { image: story.find.image, items: story.find.items, count });
    game.toggleAttribute("less-motion", app.settings().lessMotion);
    wireHeader(app, story, () => app.line("step-find"));
    game.addEventListener("kids-done", () => {
        store.completeStep(child.id, story.id, "find");
        app.root.querySelector(".done-row").hidden = false;
    });
    // Already found before: the way on is open.
    if (app.progress().stops[story.id]?.steps?.find) {
        app.root.querySelector(".done-row").hidden = false;
    }
    wireNext(app);
    return null;
}

// ------------------------------------------------------------------ 3 play
function playStep(app, story, child, gameArg) {
    const games = [...story.games.map((g) => g.type), "right-or-not"];
    if (gameArg) {
        if (!games.includes(gameArg)) {
            location.replace(`#/stop/${story.id}/play`);
            return null;
        }
        return extraGame(app, story, child, gameArg);
    }
    const played = Boolean(app.progress().stops[story.id]?.steps?.play);
    app.root.innerHTML = `
      <section class="screen stop">
        ${header(app, story, "play")}
        <kids-story-order></kids-story-order>
        <div class="more-games" ${played ? "" : "hidden"}>
          <h2>More games</h2>
          <div class="game-choices">
            ${games.map((g) => `<button class="panel game-card small" type="button" data-game="${g}">
              <span><b>${GAME_NAMES[g]}</b><span>${GAME_LINES[g]}</span></span>${ICONS.next}</button>`).join("")}
          </div>
          ${nextButton("Next: My Verse", `#/stop/${story.id}/verse`)}
        </div>
      </section>`;
    const game = app.root.querySelector("kids-story-order");
    game.config = gameConfig(app, { panels: story.panels.map((p) => ({ image: p.image, text: p[child.band] })) });
    game.toggleAttribute("less-motion", app.settings().lessMotion);
    wireHeader(app, story, () => app.line("order-intro"));
    game.addEventListener("kids-done", () => {
        store.completeStep(child.id, story.id, "play");
        app.root.querySelector(".more-games").hidden = false;
        app.root.querySelector(".more-games").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    app.root.querySelector(".game-choices").addEventListener("click", (event) => {
        const b = event.target.closest("[data-game]");
        if (b) {
            app.sfx("tap");
            app.go(`#/stop/${story.id}/play/${b.dataset.game}`);
        }
    });
    wireNext(app);
    return null;
}

function extraGame(app, story, child, type) {
    const tags = { "who-said": "kids-who-said", gather: "kids-gather", colour: "kids-colour", "right-or-not": "kids-right-or-not" };
    const tag = tags[type];
    app.root.innerHTML = `
      <section class="screen stop">
        ${header(app, story, "play")}
        <h2 class="game-title">${GAME_NAMES[type]}</h2>
        <${tag}></${tag}>
        <div class="next-row two">
          <button class="btn quiet" type="button" data-back>${ICONS.back} More games</button>
          <button class="btn" type="button" data-next="#/stop/${escapeHtml(story.id)}/verse">Next: My Verse ${ICONS.next}</button>
        </div>
      </section>`;
    const game = app.root.querySelector(tag);
    const extra = {
        "who-said": { sayings: story.whoSaid },
        gather: { game: story.games.find((g) => g.type === "gather"), count: app.data.count },
        colour: { image: story.colouring.image },
        "right-or-not": { statements: story.rightOrNot },
    }[type];
    game.config = gameConfig(app, extra);
    game.toggleAttribute("less-motion", app.settings().lessMotion);
    wireHeader(app, story, () => app.line({ "who-said": "who-intro", gather: "gather-intro", colour: "colour-intro", "right-or-not": "right-or-not-intro" }[type]));
    game.addEventListener("kids-done", () => {
        // Any game counts as playing, for the first-time sticker.
        store.setFirst(child.id, "play");
    });
    app.root.querySelector("[data-back]").addEventListener("click", () => app.go(`#/stop/${story.id}/play`));
    // My Verse needs Story in Order done first; until then, Next goes back to it.
    if (!app.progress().stops[story.id]?.steps?.play) {
        app.root.querySelector("[data-next]").dataset.next = `#/stop/${story.id}/play`;
        app.root.querySelector("[data-next]").innerHTML = `Story in Order ${ICONS.next}`;
    }
    wireNext(app);
    return null;
}

// ------------------------------------------------------------------ 4 verse
function verseStep(app, story, child) {
    app.root.innerHTML = `
      <section class="screen stop">
        ${header(app, story, "verse")}
        <kids-verse-builder></kids-verse-builder>
        <div class="done-row" hidden>
          <p class="fruit-note">${ICONS.leaf} A fruit is growing on your tree!</p>
          ${nextButton("Next: Talk Together", `#/stop/${story.id}/talk`)}
        </div>
      </section>`;
    const game = app.root.querySelector("kids-verse-builder");
    game.config = gameConfig(app, { verse: story.verse });
    game.toggleAttribute("less-motion", app.settings().lessMotion);
    wireHeader(app, story, () => app.say(story.verse.audio, { force: true }));
    const before = Boolean(app.progress().stops[story.id]?.steps?.verse);
    game.addEventListener("kids-done", () => {
        const { wasNew } = store.completeStep(child.id, story.id, "verse");
        if (wasNew) {
            app.fresh[freshKey(child, story)].fruit = true;
            saveFresh(app, freshKey(child, story));
            app.sfx("fruit");
            setTimeout(() => app.line("verse-fruit"), 1400);
        }
        const row = app.root.querySelector(".done-row");
        row.hidden = false;
        row.querySelector(".fruit-note").hidden = !wasNew;
    });
    if (before) {
        const row = app.root.querySelector(".done-row");
        row.hidden = false;
        row.querySelector(".fruit-note").hidden = true;
    }
    wireNext(app);
    return null;
}

// ------------------------------------------------------------------ 5 talk
function talkStep(app, story, child) {
    const t = story.talk;
    app.root.innerHTML = `
      <section class="screen stop talk">
        ${header(app, story, "talk")}
        <div class="panel talk-card">
          <img class="talk-art" src="${escapeHtml(app.resolve(app.data.ui.talk))}" alt="" />
          <p class="talk-turn">Grown-up's turn!</p>
          <p class="small">Sit close and talk about the story.</p>
          <h2>Ask</h2>
          <ul>${t.ask.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul>
          <h2>Do</h2>
          <p>${escapeHtml(t.do)}</p>
          <h2>Pray</h2>
          <p class="prayer">“${escapeHtml(t.pray)}”</p>
          <button class="btn quiet" type="button" data-pray>${ICONS.speaker} Pray with Nari</button>
          <p class="tip"><b>Tip:</b> Let your child answer first. There are no wrong answers: just listen.</p>
        </div>
        <div class="talk-actions">
          <button class="btn big" type="button" data-talked>We talked about it</button>
          <p class="small">Only a grown-up should tap this. It grows a flower on the tree.</p>
          <button class="link-btn" type="button" data-later>Maybe later</button>
        </div>
      </section>`;
    wireHeader(app, story, () => app.line("talk-intro"));
    app.root.querySelector("[data-pray]").addEventListener("click", () => app.say(t.prayAudio, { force: true }));
    // A second tap before the reward shows would count the story twice and
    // hide what the first tap earned.
    let finishing = false;
    const finish = (later) => {
        if (finishing) {
            return;
        }
        finishing = true;
        const before = store.progress(child.id);
        const beforeCounts = rules.tally(before, app.data);
        const beforeSections = rules.sectionsDone(before, app.data);
        const { wasNew } = store.completeStep(child.id, story.id, "talk", later ? { later: true } : { question: t.ask[0] });
        const { first } = store.finishStory(child.id, story.id);
        const after = store.progress(child.id);
        const afterCounts = rules.tally(after, app.data);
        const newSections = rules.sectionsDone(after, app.data).filter((s) => !beforeSections.includes(s));
        if (newSections.length) {
            store.setFirst(child.id, "map");
        }
        const key = freshKey(child, story);
        // A new finish starts a new reward: no stickers given for it yet.
        delete app.fresh[key].gifts;
        Object.assign(app.fresh[key], {
            done: true,
            leaf: first,
            flower: !later && wasNew,
            birds: newSections,
            treeGrew: rules.treeStage(afterCounts.leaves, app.data).key !== rules.treeStage(beforeCounts.leaves, app.data).key,
            nariGrew: rules.nariStage(afterCounts.finished, app.data).stage !== rules.nariStage(beforeCounts.finished, app.data).stage,
        });
        saveFresh(app, key);
        app.go(`#/reward/${story.id}`);
    };
    app.root.querySelector("[data-talked]").addEventListener("click", () => {
        app.sfx("flower");
        finish(false);
    });
    app.root.querySelector("[data-later]").addEventListener("click", () => finish(true));
    app.line("talk-intro");
    return null;
}

// ------------------------------------------------------------------ reward
export function renderReward(app, id) {
    const story = app.story(id);
    const child = app.child();
    if (!story || !rules.isFinished(app.progress().stops[id])) {
        location.replace("#/home");
        return null;
    }
    // Only straight after finishing (or a reload of that): a link to the
    // reward of a story finished some other day goes home.
    const key = freshKey(child, story);
    const fresh = app.fresh[key] ?? loadFresh(key);
    if (!fresh?.done) {
        location.replace("#/home");
        return null;
    }
    // The stickers are given once; a reload shows the same ones again.
    if (!Array.isArray(fresh.gifts)) {
        fresh.gifts = app.giveStickers();
    }
    app.fresh[key] = fresh;
    saveFresh(app, key);
    const counts = app.counts();
    const gifts = fresh.gifts.map((sid) => app.sticker(sid)).filter(Boolean);
    const earned = store.stickers(child.id).earned;
    const items = [];
    if (fresh.leaf) {
        items.push(["leaf", "+1 leaf", "for the story"]);
    }
    if (fresh.fruit) {
        items.push(["fruit", "+1 fruit", "for the verse"]);
    }
    if (fresh.flower) {
        items.push(["flower", "+1 flower", "for talking"]);
    }
    for (const section of fresh.birds ?? []) {
        const name = app.data.map.sections.find((s) => s.id === section)?.name ?? "";
        items.push(["bird", "A bird came!", `for finishing ${name}`]);
    }
    const stage = rules.nariStage(counts.finished, app.data);
    app.root.innerHTML = `
      <section class="screen reward">
        <div class="confetti" aria-hidden="true">${Array.from({ length: 24 }, (_, n) => `<i style="--n:${n}"></i>`).join("")}</div>
        <img class="reward-nari nari-react" data-rest="cheer" src="${escapeHtml(app.nari("cheer"))}" alt="Nari cheering" />
        <h1 class="title">Well done, ${escapeHtml(child.name)}!</h1>
        <p class="lede">You finished <b>${escapeHtml(story.title)}</b>.</p>
        ${items.length ? `<ul class="reward-items">${items.map(([kind, big, why]) => `<li class="r-${kind}"><b>${big}</b><span>${why}</span></li>`).join("")}</ul>`
            : `<p class="lede">You finished it again! Great remembering.</p>`}
        ${fresh.treeGrew ? `<p class="grew">Your tree grew into a <b>${escapeHtml(rules.treeStage(counts.leaves, app.data).name.toLowerCase())}</b>!</p>` : ""}
        ${fresh.nariGrew ? `<p class="grew">Nari grew into a <b>${escapeHtml(stage.name.toLowerCase())}</b>!</p>` : ""}
        <div class="reward-tree">${treeHtml(app, counts, { label: false })}</div>
        ${gifts.length ? `
          <div class="panel gift">
            <p class="gift-label">A gift for you!</p>
            <img src="${escapeHtml(app.resolve(gifts[0].image))}" alt="${escapeHtml(gifts[0].title)} sticker" />
            <h2>${escapeHtml(gifts[0].title)}</h2>
            <p class="small">${escapeHtml(gifts[0].reference)} · for ${escapeHtml(earnedFor(app, gifts[0], earned[gifts[0].id]))}</p>
            ${gifts.length > 1 ? `<p class="small">and ${gifts.length - 1} more ${gifts.length === 2 ? "sticker" : "stickers"} in your album!</p>` : ""}
          </div>` : ""}
        <div class="next-row two">
          <button class="btn quiet" type="button" data-go="#/map">${ICONS.map} Journey Map</button>
          <button class="btn" type="button" data-go="${gifts.length ? "#/stickers" : "#/home"}">${gifts.length ? "Put it in my album" : "See my tree"} ${ICONS.next}</button>
        </div>
      </section>`;
    for (const b of app.root.querySelectorAll("[data-go]")) {
        b.addEventListener("click", () => app.go(b.dataset.go));
    }
    app.sfx("celebrate");
    setTimeout(() => app.sfx("confetti"), 300);
    if (fresh.leaf) {
        setTimeout(() => app.sfx("leaf"), 900);
    }
    // Nari's lines, one after another.
    const lines = ["stop-done"];
    if (fresh.leaf) {
        lines.push("leaf");
    }
    if (fresh.treeGrew) {
        lines.push("tree-grows");
    }
    if (fresh.nariGrew) {
        lines.push("nari-grows");
    }
    if (gifts.length) {
        lines.push("sticker");
    }
    let cancelled = false;
    (async () => {
        for (const line of lines) {
            const how = await app.line(line);
            if (cancelled || how === "stopped") {
                return;
            }
        }
    })();
    // Leaving the reward screen: this visit's reward is over.
    return () => {
        cancelled = true;
        forgetFresh(app, key);
    };
}
