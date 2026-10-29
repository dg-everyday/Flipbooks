/**
 * Daily Grace Kids: the Story Stop for Explorers (ages 9 to 12), and the
 * reward after it. The same five steps and paw prints as for the younger
 * children (kids-stop.js), grown up:
 *
 *   1 Read          the story's kids flipbook in <flip-book flip="up">, bound
 *                   at the top like a steno pad and turned upward, with its KJV
 *                   pills (story-kjv.js), "Listen to the whole story" (the
 *                   recorded narration) and "Read the chapter" (passage-reader)
 *   2 Investigate   <kids-investigate>: questions answered on the Look & Find
 *                   picture, or by finding the right flipbook page
 *   3 Play          <kids-story-order> with the flipbook pages and one page
 *                   from another story; then Who Said It? (with references),
 *                   Right or Not? (each with its verse) and the story's game
 *   4 My Verse      <kids-verse-practice>: the whole verse, seven practices
 *   5 Think & Talk  a question to answer in the private Field Journal, two to
 *                   talk about with a grown-up, something to do, a prayer
 *
 * Progress is the Explorer record (store.explorer); a story is finished as for
 * the younger children. The reward adds the Field Guide cards the story
 * unlocked and any new rank.
 */

import * as store from "../../../assets/scripts/kids/store.js?v=20261025-1";
import * as rules from "../../../assets/scripts/kids/rules.js?v=20261025-1";
import { DAILY_GRACE_URL, ICONS, escapeHtml, gameConfig, toast } from "./kids-ui.js?v=20261025-1";
import {
    firstOpenStep, forgetFresh, freshKey, header, loadFresh, nextButton, saveFresh, wireHeader, wireNext,
} from "./kids-stop.js?v=20261025-1";
import { loadStory, toFlipPages } from "./stories.js?v=20261024-1";
import { kjvNotes, withKjvPills } from "./story-kjv.js?v=20261025-2";
import "../../components/flip-book.js?v=20261026-3";
import "../../components/kids/kids-investigate.js?v=20261025-1";
import "../../components/kids/kids-story-order.js?v=20261025-1";
import "../../components/kids/kids-who-said.js?v=20261025-1";
import "../../components/kids/kids-right-or-not.js?v=20261025-1";
import "../../components/kids/kids-gather.js?v=20261024-2";
import "../../components/kids/kids-verse-practice.js?v=20261025-1";

export const STEP_NAMES = { watch: "Read", find: "Investigate", play: "Play", verse: "My Verse", talk: "Think & Talk" };
const GAME_NAMES = { "who-said": "Who Said It?", "right-or-not": "Right or Not?", gather: "Gather & Count" };
const GAME_LINES = {
    "who-said": "Who said it, and where is it written?",
    "right-or-not": "Check each sentence with the Bible",
    gather: "Catch them all and count, quickly",
};

/** Opens a passage of the KJV on top of the page (the Bible reader of grown-up Daily Grace). */
export async function openPassage(ref) {
    const m = /^(.*?)\s+(\d+(?::\d+)?(?:\s*[-–]\s*\d+(?::\d+)?)?)$/.exec(String(ref).trim());
    if (!m) {
        return;
    }
    const { showPassageReader } = await import("../../components/passage-reader.js?v=20261024-1");
    showPassageReader({ book: m[1], range: m[2], title: ref });
}

/** Every "Read it in the Bible" inside the games (kids-read) opens the passage; wired once. */
function wireRead(app) {
    if (!app.readWired) {
        app.readWired = true;
        app.root.addEventListener("kids-read", (event) => openPassage(event.detail.ref));
    }
}

function stopOf(app, story) {
    return app.xrecord().stops[story.id];
}

function explorerHeader(app, story, step) {
    return header(app, story, step, { names: STEP_NAMES, stop: stopOf(app, story) });
}

export function renderExplorerStop(app, args) {
    const [id, stepArg, gameArg] = args;
    const story = app.xstory(id);
    if (!story) {
        app.go("#/map");
        return null;
    }
    const child = app.child();
    const record = app.xrecord();
    if (!rules.isExplorerOpen(id, record, app.xdata, app.settings())) {
        toast(story.harder && !app.settings().harderStories ? "A grown-up can turn this story on in the Grown-ups' Corner." : "Finish the stories before this one first.");
        location.replace("#/map");
        return null;
    }
    const stop = record.stops[id];
    const open = firstOpenStep(stop);
    let step = rules.STEPS.includes(stepArg) ? stepArg : open;
    if (!rules.isFinished(stop) && rules.STEPS.indexOf(step) > rules.STEPS.indexOf(open)) {
        step = open;
    }
    if (step !== stepArg) {
        location.replace(`#/stop/${id}/${step}`);
        return null;
    }
    const key = freshKey(child, story);
    app.fresh[key] = app.fresh[key] ?? loadFresh(key) ?? {};
    wireRead(app);
    const views = { watch: readStep, find: investigateStep, play: playStep, verse: verseStep, talk: thinkStep };
    return views[step](app, story, child, gameArg);
}

// ------------------------------------------------------------------ 1 read
function readStep(app, story, child) {
    const done = Boolean(stopOf(app, story)?.steps?.watch);
    const firstTime = !stopOf(app, story);
    app.root.innerHTML = `
      <section class="screen stop explorer read">
        ${explorerHeader(app, story, "watch")}
        ${story.side ? `<p class="trail-note">${ICONS.compass} A side trail: a story just for Explorers${story.harder ? ". One of the harder stories: read it with a grown-up nearby." : "."}</p>` : ""}
        ${story.harder && story.note ? `<details class="grown-up-note"><summary>For the grown-up</summary><p>${escapeHtml(story.note)}</p></details>` : ""}
        <flip-book class="reader" flip="up" aspect="9/16" label="${escapeHtml(story.title)}"></flip-book>
        <div class="read-tools">
          <button class="btn quiet" type="button" data-listen>${ICONS.speaker} Listen to the whole story</button>
          <button class="btn quiet" type="button" data-chapter>${ICONS.book} Read ${escapeHtml(story.chapter.book)} ${escapeHtml(story.chapter.range)}</button>
        </div>
        <audio class="narration" controls preload="none" hidden></audio>
        <div class="done-row"${done ? "" : " hidden"}>${nextButton("Next: Investigate", `#/stop/${story.id}/find`)}</div>
        <p class="small read-hint"${done ? " hidden" : ""}>Read to the last page to go on.</p>
      </section>`;
    wireHeader(app);
    const root = app.root;
    const reader = root.querySelector("flip-book");
    const narration = root.querySelector(".narration");
    loadStory(story.id, "kids").then((flip) => {
        if (!reader.isConnected) {
            return;
        }
        kjvNotes(reader, flip);
        reader.pages = withKjvPills(toFlipPages(flip), flip);
    }).catch((error) => {
        console.error(`Daily Grace Kids: the flipbook "${story.id}" could not be loaded`, error);
        reader.setAttribute("empty-text", "The story couldn't be loaded. Please check the connection and try again.");
        reader.pages = [];
    });
    reader.addEventListener("finish", () => {
        const { wasNew } = store.completeExplorerStep(child.id, story.id, "watch");
        root.querySelector(".done-row").hidden = false;
        root.querySelector(".read-hint").hidden = true;
        if (wasNew) {
            app.sfx("page-stamp");
            app.line("read-chapter");
        }
    });
    root.querySelector("[data-listen]").addEventListener("click", () => {
        app.audio.stop();
        if (!narration.src) {
            narration.src = app.resolve(story.narration);
        }
        narration.hidden = false;
        narration.play().catch(() => {
            /* the controls are there to try again */
        });
    });
    root.querySelector("[data-chapter]").addEventListener("click", () => {
        narration.pause();
        openPassage(`${story.chapter.book} ${story.chapter.range}`);
    });
    wireNext(app);
    if (firstTime) {
        app.line(story.side ? (story.harder ? "harder-story" : "side-trail") : "read-intro");
    }
    // A playing <audio> keeps on after it leaves the page: stop it.
    return () => {
        narration.pause();
        narration.removeAttribute("src");
    };
}

// ------------------------------------------------------------------ 2 investigate
function investigateStep(app, story, child) {
    const inv = story.investigate;
    app.root.innerHTML = `
      <section class="screen stop explorer${inv.mode === "scene" ? " fit" : ""}">
        ${explorerHeader(app, story, "find")}
        <kids-investigate${inv.mode === "scene" ? " fit" : ""}></kids-investigate>
        <div class="done-row" hidden>${nextButton("Next: Play", `#/stop/${story.id}/play`)}</div>
      </section>`;
    const game = app.root.querySelector("kids-investigate");
    game.config = gameConfig(app, { mode: inv.mode, image: inv.image, pages: story.pages, questions: inv.questions });
    game.toggleAttribute("less-motion", app.settings().lessMotion);
    wireHeader(app);
    game.addEventListener("kids-done", () => {
        store.completeExplorerStep(child.id, story.id, "find");
        app.root.querySelector(".done-row").hidden = false;
    });
    if (stopOf(app, story)?.steps?.find) {
        app.root.querySelector(".done-row").hidden = false;
    }
    wireNext(app);
    return null;
}

// ------------------------------------------------------------------ 3 play
function gamesOf(story) {
    const games = [];
    if (story.whoSaid.length) {
        games.push("who-said");
    }
    games.push("right-or-not");
    if (story.game) {
        games.push("gather");
    }
    return games;
}

function playStep(app, story, child, gameArg) {
    const games = gamesOf(story);
    if (gameArg) {
        if (!games.includes(gameArg)) {
            location.replace(`#/stop/${story.id}/play`);
            return null;
        }
        return extraGame(app, story, child, gameArg);
    }
    const played = Boolean(stopOf(app, story)?.steps?.play);
    app.root.innerHTML = `
      <section class="screen stop explorer">
        ${explorerHeader(app, story, "play")}
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
    const page = (n) => ({ image: story.pages[n], text: `Page ${n}` });
    game.config = gameConfig(app, {
        panels: story.order.pages.map(page),
        odd: { image: story.order.odd.image, text: "A page from another story" },
        aspect: "9/16",
    });
    game.toggleAttribute("less-motion", app.settings().lessMotion);
    wireHeader(app);
    game.addEventListener("kids-done", () => {
        store.completeExplorerStep(child.id, story.id, "play");
        const more = app.root.querySelector(".more-games");
        more.hidden = false;
        more.scrollIntoView({ behavior: "smooth", block: "start" });
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
    const tags = { "who-said": "kids-who-said", "right-or-not": "kids-right-or-not", gather: "kids-gather" };
    const tag = tags[type];
    app.root.innerHTML = `
      <section class="screen stop explorer">
        ${explorerHeader(app, story, "play")}
        <h2 class="game-title">${GAME_NAMES[type]}</h2>
        <${tag}></${tag}>
        <div class="next-row two">
          <button class="btn quiet" type="button" data-back>${ICONS.back} More games</button>
          <button class="btn" type="button" data-next="#/stop/${escapeHtml(story.id)}/verse">Next: My Verse ${ICONS.next}</button>
        </div>
      </section>`;
    const game = app.root.querySelector(tag);
    const extra = {
        "who-said": { sayings: story.whoSaid, refs: true },
        "right-or-not": { statements: story.rightOrNot },
        gather: { game: story.game, count: app.data.count },
    }[type];
    game.config = gameConfig(app, extra);
    game.toggleAttribute("less-motion", app.settings().lessMotion);
    wireHeader(app);
    app.root.querySelector("[data-back]").addEventListener("click", () => app.go(`#/stop/${story.id}/play`));
    if (!stopOf(app, story)?.steps?.play) {
        app.root.querySelector("[data-next]").dataset.next = `#/stop/${story.id}/play`;
        app.root.querySelector("[data-next]").innerHTML = `Story in Order ${ICONS.next}`;
    }
    wireNext(app);
    return null;
}

// ------------------------------------------------------------------ 4 verse
function verseStep(app, story, child) {
    const stop = stopOf(app, story);
    app.root.innerHTML = `
      <section class="screen stop explorer">
        ${explorerHeader(app, story, "verse")}
        <kids-verse-practice></kids-verse-practice>
        <div class="done-row"${stop?.steps?.verse ? "" : " hidden"}>
          <p class="fruit-note" hidden>${ICONS.check} Verse learned! It counts toward your rank and stickers.</p>
          ${nextButton("Next: Think & Talk", `#/stop/${story.id}/talk`)}
        </div>
      </section>`;
    const game = app.root.querySelector("kids-verse-practice");
    game.config = gameConfig(app, { verse: story.verse, level: stop?.verse?.level ?? 0, learned: stop?.verse?.learned === true });
    game.toggleAttribute("less-motion", app.settings().lessMotion);
    wireHeader(app);
    game.addEventListener("kids-done", (event) => {
        const { learnedNow } = store.practiseVerse(child.id, story.id, { had: event.detail.had === true });
        store.completeExplorerStep(child.id, story.id, "verse");
        const row = app.root.querySelector(".done-row");
        row.hidden = false;
        if (learnedNow) {
            app.fresh[freshKey(child, story)].verse = true;
            saveFresh(app, freshKey(child, story));
            row.querySelector(".fruit-note").hidden = false;
        }
    });
    wireNext(app);
    return null;
}

// ------------------------------------------------------------------ 5 think & talk
function thinkStep(app, story, child) {
    const t = story.think;
    const saved = store.journal(child.id).answers[story.id];
    app.root.innerHTML = `
      <section class="screen stop explorer think">
        ${explorerHeader(app, story, "talk")}
        <div class="panel journal-card" style="--paper:url('${escapeHtml(app.resolve(app.xdata.ui.paper))}')">
          <p class="label">Think</p>
          <h2>${escapeHtml(t.think)}</h2>
          <label class="journal-field">
            <span>${escapeHtml(t.journal)}</span>
            <textarea rows="5" maxlength="${store.MAX_JOURNAL}" spellcheck="true" placeholder="Write a sentence or two…">${escapeHtml(saved?.text ?? "")}</textarea>
          </label>
          <label class="share"><input type="checkbox" data-share ${saved?.shared ? "checked" : ""} /> Let my grown-up read this answer</label>
          <div class="journal-row">
            <p class="small private">${ICONS.lock} My journal is private: it stays on this device${saved?.shared ? ", and this answer is shared with my grown-up" : ""}.</p>
            <button class="btn" type="button" data-save>${ICONS.pen} Save</button>
          </div>
        </div>
        <div class="panel talk-card">
          <p class="talk-turn">Talk with a grown-up</p>
          <ul>${t.talk.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul>
          <h2>Do</h2>
          <p>${escapeHtml(t.do)}</p>
          <h2>Pray</h2>
          <p class="prayer">“${escapeHtml(t.pray)}”</p>
          <button class="btn quiet" type="button" data-pray>${ICONS.speaker} Pray with Nari</button>
        </div>
        <div class="talk-actions">
          <button class="btn big" type="button" data-talked>We talked about it</button>
          <p class="small">Only a grown-up should tap this.</p>
          <button class="link-btn" type="button" data-later>Maybe later</button>
        </div>
      </section>`;
    wireHeader(app);
    const root = app.root;
    const text = root.querySelector("textarea");
    const share = root.querySelector("[data-share]");
    const save = (quiet = false) => {
        const value = store.cleanJournalText(text.value);
        const was = store.journal(child.id).answers[story.id];
        if (!value && !was) {
            return;
        }
        store.saveJournal(child.id, story.id, value, share.checked);
        root.querySelector(".private").innerHTML = `${ICONS.lock} My journal is private: it stays on this device${value && share.checked ? ", and this answer is shared with my grown-up" : ""}.`;
        if (!quiet) {
            app.sfx("pen");
            toast(value ? "Saved in your journal." : "Your answer was removed.");
        }
    };
    root.querySelector("[data-save]").addEventListener("click", () => save());
    share.addEventListener("change", () => save(true));
    root.querySelector("[data-pray]").addEventListener("click", () => app.say(t.prayAudio, { force: true }));
    let finishing = false;
    const finish = (later) => {
        if (finishing) {
            return;
        }
        finishing = true;
        // An answer typed and not saved is kept too.
        save(true);
        const before = store.explorer(child.id);
        const beforeRank = rules.rankFor(rules.explorerTally(before, app.xdata).finished, app.xdata);
        const beforeSections = rules.explorerSectionsDone(before, app.xdata, app.settings());
        const { wasNew } = store.completeExplorerStep(child.id, story.id, "talk", later ? { later: true } : { question: t.talk[0] });
        const { first } = store.finishExplorerStory(child.id, story.id);
        const after = store.explorer(child.id);
        const cards = store.unlockCards(child.id, rules.dueCards(after, app.xdata));
        const afterRank = rules.rankFor(rules.explorerTally(after, app.xdata).finished, app.xdata);
        const sections = rules.explorerSectionsDone(after, app.xdata, app.settings()).filter((s) => !beforeSections.includes(s));
        if (sections.length) {
            store.setFirst(child.id, "map");
        }
        const key = freshKey(child, story);
        delete app.fresh[key].gifts;
        Object.assign(app.fresh[key], {
            done: true,
            first,
            talked: !later && wasNew,
            cards,
            rank: afterRank.id !== beforeRank.id ? afterRank.id : null,
            sections,
        });
        saveFresh(app, key);
        app.go(`#/reward/${story.id}`);
    };
    root.querySelector("[data-talked]").addEventListener("click", () => {
        app.sfx("flower");
        finish(false);
    });
    root.querySelector("[data-later]").addEventListener("click", () => finish(true));
    app.line("think-intro");
    return () => save(true);
}

// ------------------------------------------------------------------ reward
export function renderExplorerReward(app, id) {
    const story = app.xstory(id);
    const child = app.child();
    if (!story || !rules.isFinished(app.xrecord().stops[id])) {
        location.replace("#/home");
        return null;
    }
    const key = freshKey(child, story);
    const fresh = app.fresh[key] ?? loadFresh(key);
    if (!fresh?.done) {
        location.replace("#/home");
        return null;
    }
    if (!Array.isArray(fresh.gifts)) {
        fresh.gifts = app.giveStickers();
    }
    app.fresh[key] = fresh;
    saveFresh(app, key);
    const gifts = fresh.gifts.map((sid) => app.sticker(sid)).filter(Boolean);
    const cards = (fresh.cards ?? []).map((cid) => app.xdata.fieldGuide.cards.find((c) => c.id === cid)).filter(Boolean);
    const rank = fresh.rank ? app.xdata.ranks.find((r) => r.id === fresh.rank) : null;
    const items = [];
    if (fresh.first) {
        items.push(["leaf", "+1 story", "on the trail"]);
    }
    if (fresh.verse) {
        items.push(["fruit", "+1 verse", "learned by heart"]);
    }
    if (fresh.talked) {
        items.push(["flower", "+1 talk", "with your grown-up"]);
    }
    for (const section of fresh.sections ?? []) {
        const name = app.data.map.sections.find((s) => s.id === section)?.name ?? "";
        items.push(["bird", "A part of the map!", `you finished ${name}`]);
    }
    const counts = app.xcounts();
    const next = rules.nextRank(counts.finished, app.xdata);
    const trailblazer = rank?.id === "trailblazer";
    app.root.innerHTML = `
      <section class="screen reward explorer">
        <div class="confetti" aria-hidden="true">${Array.from({ length: 24 }, (_, n) => `<i style="--n:${n}"></i>`).join("")}</div>
        <img class="reward-nari nari-react" data-rest="cheer" src="${escapeHtml(app.nari("cheer"))}" alt="Nari cheering" />
        <h1 class="title">Well done, ${escapeHtml(child.name)}!</h1>
        <p class="lede">You finished <b>${escapeHtml(story.title)}</b>.</p>
        ${items.length ? `<ul class="reward-items">${items.map(([kind, big, why]) => `<li class="r-${kind}"><b>${big}</b><span>${why}</span></li>`).join("")}</ul>`
            : `<p class="lede">You explored it again! Great remembering.</p>`}
        ${rank ? `
          <div class="panel rank-up">
            <img class="rank-badge" src="${escapeHtml(app.resolve(rank.badge))}" alt="" />
            <div><p class="gift-label">New rank!</p><h2>${escapeHtml(rank.name)}</h2><p class="small">${escapeHtml(rank.line)}</p>
              ${rank.verse ? `<p class="rank-verse">“${escapeHtml(rank.verse.text)}” <cite>${escapeHtml(rank.verse.ref)}</cite></p>` : ""}</div>
          </div>` : next ? `<p class="grew">${next.more} more ${next.more === 1 ? "story" : "stories"} to <b>${escapeHtml(next.rank.name)}</b>.</p>` : ""}
        ${cards.length ? `
          <div class="panel new-cards">
            <p class="gift-label">${cards.length === 1 ? "A new Field Guide card" : `${cards.length} new Field Guide cards`}</p>
            <div class="card-row">${cards.map((c) => `<figure class="mini-card stamp"><img src="${escapeHtml(app.resolve(c.image))}" alt="" /><figcaption>${escapeHtml(c.name)}</figcaption></figure>`).join("")}</div>
          </div>` : ""}
        ${gifts.length ? `
          <div class="panel gift">
            <p class="gift-label">A gift for you!</p>
            <img src="${escapeHtml(app.resolve(gifts[0].image))}" alt="${escapeHtml(gifts[0].title)} sticker" />
            <h2>${escapeHtml(gifts[0].title)}</h2>
            ${gifts.length > 1 ? `<p class="small">and ${gifts.length - 1} more ${gifts.length === 2 ? "sticker" : "stickers"} in your album!</p>` : ""}
          </div>` : ""}
        ${trailblazer ? `
          <div class="panel bridge">
            <h2>Ready for something new?</h2>
            <p>You finished the whole first trail. Try a Daily Moment in grown-up Daily Grace, together with your grown-up.</p>
            <a class="btn quiet" href="${DAILY_GRACE_URL}" target="_blank" rel="noopener">${ICONS.home} Open Daily Grace</a>
          </div>` : ""}
        <div class="next-row two">
          <button class="btn quiet" type="button" data-go="#/map">${ICONS.map} Journey Map</button>
          <button class="btn" type="button" data-go="${cards.length ? "#/guide" : gifts.length ? "#/stickers" : "#/home"}">${cards.length ? "Open my Field Guide" : gifts.length ? "Put it in my album" : "My Field Journal"} ${ICONS.next}</button>
        </div>
      </section>`;
    for (const b of app.root.querySelectorAll("[data-go]")) {
        b.addEventListener("click", () => app.go(b.dataset.go));
    }
    app.sfx("celebrate");
    if (cards.length || rank) {
        setTimeout(() => app.sfx("page-stamp"), 700);
    }
    const lines = ["stop-done"];
    if (cards.length) {
        lines.push("field-guide-new");
    }
    if (rank && rank.id !== "scout") {
        lines.push(`rank-${rank.id}`);
    }
    if (trailblazer) {
        lines.push("grown-up-bridge");
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
    return () => {
        cancelled = true;
        forgetFresh(app, key);
    };
}
