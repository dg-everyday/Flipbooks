/**
 * Daily Grace Kids: the Explorers' screens around the stories (ages 9 to 12).
 *
 *   Field Journal   their home: rank, the next story on the trail, the Field
 *                   Guide's latest cards, this week, and the way to the map,
 *                   the guide, the games and the stickers (the Growing Tree
 *                   they grew when younger is behind a tap)
 *   Journey Map     the same painted map, drawn as a chart, with the side
 *                   trails (diamonds) and the Explorers' own progress
 *   Field Guide     #/guide: the people, places, creatures and things met on
 *                   the trail; a card opens with its facts and verse
 *   Games           Map Quest and the Bible Book Train, beside Two by Two and
 *                   colouring
 */

import * as store from "../../../assets/scripts/kids/store.js?v=20261025-1";
import * as rules from "../../../assets/scripts/kids/rules.js?v=20261025-1";
import { ICONS, escapeHtml, gameConfig, toast, treeHtml } from "./kids-ui.js?v=20261025-1";
import "../../components/kids/kids-map-quest.js?v=20261025-1";
import "../../components/kids/kids-book-train.js?v=20261025-1";

const SOON_BADGE_VERSION = "20261024";

/** Cards earned somewhere else (another tab, an older visit) go into the guide. */
function catchUpCards(app, child) {
    const due = rules.dueCards(store.explorer(child.id), app.xdata);
    return due.length ? store.unlockCards(child.id, due) : [];
}

function cardById(app, id) {
    return app.xdata.fieldGuide.cards.find((c) => c.id === id) ?? null;
}

// --------------------------------------------------------------------- the Field Journal
export function journalView(app, stickersOnHome) {
    const child = app.child();
    const caught = catchUpCards(app, child);
    const record = app.xrecord();
    const counts = app.xcounts();
    const rank = rules.rankFor(counts.finished, app.xdata);
    const next = rules.nextRank(counts.finished, app.xdata);
    const story = rules.nextExplorerStory(record, app.xdata, app.settings());
    const week = rules.thisWeek(record, store.todayKey());
    const fresh = app.giveStickers(stickersOnHome);
    const unseen = Object.values(store.stickers(child.id).earned).filter((e) => !e.seen).length;
    const newCards = Object.values(record.cards).filter((c) => !c.seen).length;
    const latest = Object.entries(record.cards)
        .sort((a, b) => b[1].day.localeCompare(a[1].day))
        .map(([id]) => cardById(app, id))
        .filter(Boolean)
        .slice(0, 3);
    const total = app.xdata.fieldGuide.cards.length;
    const firstVisit = !Object.keys(record.stops).length;
    const trailblazer = rank.id === "trailblazer";
    app.root.innerHTML = `
      <section class="screen home explorer-home" style="--journal:url('${escapeHtml(app.resolve(app.xdata.ui.journal))}')">
        <header class="bar">
          <button class="round-btn back-btn" type="button" data-who aria-label="Back to Who's exploring?">${ICONS.backCircle}</button>
          <button class="avatar-btn" type="button" data-who aria-label="Switch explorer"><img src="${escapeHtml(app.avatarThumb(child.avatar))}" alt="" /></button>
          <div class="bar-text">
            <h1 class="title small-title">Hi, ${escapeHtml(child.name)}!</h1>
            <span class="sub">Explorer · ${escapeHtml(rank.name)}</span>
          </div>
          <button class="round-btn" type="button" data-corner aria-label="Grown-ups' Corner: settings">${ICONS.gear}</button>
        </header>
        <div class="panel rank-panel">
          <img class="rank-badge" src="${escapeHtml(app.resolve(rank.badge))}" alt="" />
          <div class="rank-text">
            <p class="label">My rank</p>
            <h2>${escapeHtml(rank.name)}</h2>
            <p class="small">${next ? `${next.more} more ${next.more === 1 ? "story" : "stories"} to ${escapeHtml(next.rank.name)}` : "The whole first trail, explored!"}</p>
            <div class="rank-steps" aria-hidden="true">${app.xdata.ranks.map((r) => `<span class="${counts.finished >= r.min ? "done" : ""}">${escapeHtml(r.name)}</span>`).join("")}</div>
          </div>
          <img class="nari-compass nari-react" data-rest="idle" src="${escapeHtml(app.resolve(app.xdata.nari.poses.compass))}" alt="" />
        </div>
        ${story ? `
          <button class="keep-going" type="button" data-story="${escapeHtml(story.id)}">
            <img src="${escapeHtml(app.resolve(story.badge))}" alt="" />
            <span class="kg-text"><span>${story.side ? "Next on the trail · a side trail" : "Next on the trail"}</span><b>${escapeHtml(story.title)}</b></span>
            <span class="kg-play">${ICONS.play}</span>
          </button>` : `
          <div class="panel all-done"><b>You explored the whole trail!</b><span>New stories are coming. You can explore any story again from the map.</span></div>`}
        <button class="panel guide-panel" type="button" data-go="#/guide">
          <span class="guide-head"><b>${ICONS.guide} My Field Guide</b><span>${counts.cards} of ${total} found${newCards ? ` · <b class="new-badge">${newCards} new</b>` : ""}</span></span>
          <span class="card-row">${latest.length ? latest.map((c) => `<span class="mini-card"><img src="${escapeHtml(app.resolve(c.image))}" alt="" /><span>${escapeHtml(c.name)}</span></span>`).join("")
              : `<span class="empty">Finish a story to find your first cards.</span>`}</span>
        </button>
        <p class="week">This week: ${week.read} ${week.read === 1 ? "story" : "stories"} read · ${week.verses} ${week.verses === 1 ? "verse" : "verses"} practised · ${counts.verses} learned in all</p>
        ${trailblazer ? `
          <div class="panel bridge">
            <h2>Ready for grown-up Daily Grace?</h2>
            <p>Try a Daily Moment together with your grown-up.</p>
          </div>` : ""}
        <nav class="home-nav four" aria-label="More">
          <button type="button" data-go="#/map" class="nav-map">${ICONS.map}<span>Journey Map</span></button>
          <button type="button" data-go="#/guide" class="nav-guide">${ICONS.guide}<span>Field Guide</span></button>
          <button type="button" data-go="#/games" class="nav-games">${ICONS.games}<span>Games</span></button>
          <button type="button" data-go="#/stickers" class="nav-stickers">${ICONS.star}<span>Stickers</span>${unseen ? `<b class="new-badge" aria-label="${unseen} new">${unseen}</b>` : ""}</button>
        </nav>
        <button class="link-btn tree-link" type="button" data-tree>${ICONS.tree} My Growing Tree</button>
        <dialog class="sticker-dialog tree-dialog" aria-label="My Growing Tree"><div class="sticker-card">
          <button class="round-btn dialog-close" type="button" aria-label="Close" data-close>${ICONS.close}</button>
          <h2>My Growing Tree</h2>
          ${treeHtml(app, app.counts())}
          <p class="small">The tree you grew with Nari keeps every leaf.</p>
        </div></dialog>
      </section>`;
    const root = app.root;
    for (const b of root.querySelectorAll("[data-who]")) {
        b.addEventListener("click", () => app.go("#/"));
    }
    root.querySelector("[data-corner]").addEventListener("click", () => app.grownUp(() => app.go("#/corner"), "Grown-ups' Corner"));
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
    const dialog = root.querySelector(".tree-dialog");
    root.querySelector("[data-tree]").addEventListener("click", () => dialog.showModal());
    dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
            dialog.close();
        }
    });
    if (caught.length) {
        toast(caught.length === 1 ? "A new card for your Field Guide!" : `${caught.length} new cards for your Field Guide!`);
        app.sfx("page-stamp");
    } else if (fresh.length) {
        toast(fresh.length === 1 ? "You have a new sticker!" : `You have ${fresh.length} new stickers!`);
        app.sfx("sticker");
    }
    app.sfx("compass");
    app.line(firstVisit ? "explorer-welcome" : "explorer-welcome-back");
    return null;
}

// --------------------------------------------------------------------- the Journey Map
export function explorerMapView(app) {
    const record = app.xrecord();
    const settings = app.settings();
    const trail = rules.explorerRoad(app.xdata, settings);
    const onTrail = new Set(trail.map((s) => s.id));
    const next = rules.nextExplorerStory(record, app.xdata, settings);
    const finished = trail.filter((s) => rules.isFinished(record.stops[s.id])).length;
    const stopButton = (story, pos, side) => {
        const done = rules.isFinished(record.stops[story.id]);
        const open = rules.isExplorerOpen(story.id, record, app.xdata, settings);
        const isNext = next?.id === story.id;
        return `<button class="map-stop${side ? " side" : ""}${done ? " done" : ""}${isNext ? " next" : ""}${open ? "" : " locked"}" type="button" style="${pos}" data-story="${escapeHtml(story.id)}"
            aria-label="${escapeHtml(story.title)}${side ? ", a side trail" : ""}${done ? ", finished" : ""}${open ? "" : ", not open yet"}">
          <span class="stop-badge"><img src="${escapeHtml(app.resolve(story.badge))}" alt="" />
            ${done ? `<span class="stop-check">${ICONS.check}</span>` : ""}${open ? "" : `<span class="stop-lock">${ICONS.lock}</span>`}</span>
          <span class="stop-label">${escapeHtml(story.title)}</span>
          ${isNext ? `<img class="map-nari" src="${escapeHtml(app.nari("avatar"))}" alt="" />` : ""}
        </button>`;
    };
    const sections = app.data.map.sections.map((section) => {
        const places = app.data.map.road.filter((p) => p.section === section.id);
        const sides = app.xdata.trail.filter((t) => t.section === section.id && onTrail.has(t.story));
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
                const story = app.xstory(place.story);
                return story ? stopButton(story, pos, false) : "";
            }).join("")}
            ${sides.map((t) => stopButton(app.xstory(t.story), `left:${t.x * 100}%;top:${t.y * 100}%`, true)).join("")}
          </section>`;
    }).join("");
    app.root.innerHTML = `
      <section class="screen map explorer-map">
        <header class="bar sticky">
          <button class="round-btn back-btn" type="button" data-go="#/home" aria-label="Back to my Field Journal">${ICONS.backCircle}</button>
          <div class="bar-text"><h1 class="title small-title">The Journey</h1><span class="sub">Round stops: the main road · Diamonds: side trails</span></div>
          <span class="count-pill">${finished} of ${trail.length}</span>
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
    const target = root.querySelector(".map-stop.next") ?? [...root.querySelectorAll(".map-stop.done")].pop();
    requestAnimationFrame(() => target?.scrollIntoView({ block: "center", behavior: "instant" }));
    app.sfx("map-unfold");
    return null;
}

// --------------------------------------------------------------------- the Field Guide
export function guideView(app, args) {
    const child = app.child();
    catchUpCards(app, child);
    const record = app.xrecord();
    const have = record.cards;
    const guide = app.xdata.fieldGuide;
    const storyTitle = (id) => app.xstory(id)?.title ?? "";
    const shelves = guide.shelves.map((shelf) => {
        const cards = guide.cards.filter((c) => c.shelf === shelf.id);
        const found = cards.filter((c) => have[c.id]).length;
        return `
          <section class="panel shelf guide-shelf">
            <h2>${escapeHtml(shelf.name)} <span>${found} of ${cards.length}</span></h2>
            <div class="guide-grid">
              ${cards.map((c) => (have[c.id] ? `
                <button class="guide-card" type="button" data-card="${escapeHtml(c.id)}">
                  <img src="${escapeHtml(app.resolve(c.image))}" alt="" loading="lazy" />
                  <span>${escapeHtml(c.name)}</span>${have[c.id].seen ? "" : `<b class="new-badge">New</b>`}
                </button>` : `
                <span class="guide-card locked" title="Still to find">
                  <span class="silhouette" aria-hidden="true">?</span>
                  <span class="hint">${c.stories.length ? `In ${escapeHtml(storyTitle(c.stories[0]))}` : c.train ? "Build the Book Train" : "Still to find"}</span>
                </span>`)).join("")}
            </div>
          </section>`;
    }).join("");
    const found = Object.keys(have).filter((id) => cardById(app, id)).length;
    app.root.innerHTML = `
      <section class="screen stickers guide">
        <header class="bar">
          <button class="round-btn back-btn" type="button" data-go="#/home" aria-label="Back to my Field Journal">${ICONS.backCircle}</button>
          <div class="bar-text"><h1 class="title small-title">My Field Guide</h1><span class="sub">${found} of ${guide.cards.length} cards found</span></div>
        </header>
        ${shelves}
      </section>
      <dialog class="sticker-dialog card-dialog" aria-labelledby="card-title"><div class="sticker-card field-card"></div></dialog>`;
    const root = app.root;
    root.querySelector("[data-go]").addEventListener("click", () => app.go("#/home"));
    const dialog = root.querySelector(".card-dialog");
    const open = (id) => {
        const c = cardById(app, id);
        if (!c || !have[id]) {
            return;
        }
        dialog.querySelector(".field-card").innerHTML = `
          <button class="round-btn dialog-close" type="button" aria-label="Close" data-close>${ICONS.close}</button>
          <img src="${escapeHtml(app.resolve(c.image))}" alt="" />
          <p class="label">${escapeHtml(guide.shelves.find((s) => s.id === c.shelf)?.name ?? "")}</p>
          <h2 id="card-title">${escapeHtml(c.name)}</h2>
          <ul class="facts">${c.facts.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>
          <blockquote>${escapeHtml(c.text)}<cite>${escapeHtml(c.ref)}</cite></blockquote>
          ${c.stories.length ? `<p class="small">In ${c.stories.map((s) => escapeHtml(storyTitle(s))).join(" and ")}</p>` : ""}
          <a class="btn quiet" href="${escapeHtml(c.guide)}" target="_blank" rel="noopener">${ICONS.book} Read more in Daily Grace</a>`;
        dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
        dialog.showModal();
    };
    root.querySelector(".guide").addEventListener("click", (event) => {
        const b = event.target.closest("[data-card]");
        if (b) {
            app.sfx("card-flip");
            open(b.dataset.card);
        }
    });
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
            dialog.close();
        }
    });
    if (args[0]) {
        open(args[0]);
    }
    store.markCardsSeen(child.id);
    return null;
}

// --------------------------------------------------------------------- the Explorers' games
/** The Explorers' own games; null when `args` is not one of them. */
export function explorerGame(app, args) {
    const child = app.child();
    if (args[0] === "map-quest") {
        app.root.innerHTML = `
          <section class="screen game-screen">
            <header class="bar">
              <button class="round-btn back-btn" type="button" data-go="#/games" aria-label="Back to the games">${ICONS.backCircle}</button>
              <div class="bar-text"><h1 class="title small-title">Map Quest</h1><span class="sub">Put the places on the map</span></div>
            </header>
            <kids-map-quest></kids-map-quest>
          </section>`;
        const game = app.root.querySelector("kids-map-quest");
        const quest = app.xdata.mapQuest;
        game.config = gameConfig(app, { image: quest.image, ratio: quest.ratio, places: quest.places, pinned: Object.keys(app.xrecord().quest) });
        game.addEventListener("kids-pin", (event) => {
            store.pinPlace(child.id, event.detail.card);
            const added = store.unlockCards(child.id, rules.dueCards(store.explorer(child.id), app.xdata));
            if (added.length) {
                toast(`A new card for your Field Guide: ${cardById(app, added[0])?.name ?? ""}!`);
            }
        });
        app.root.querySelector("[data-go]").addEventListener("click", () => app.go("#/games"));
        return true;
    }
    if (args[0] === "book-train") {
        app.root.innerHTML = `
          <section class="screen game-screen">
            <header class="bar">
              <button class="round-btn back-btn" type="button" data-go="#/games" aria-label="Back to the games">${ICONS.backCircle}</button>
              <div class="bar-text"><h1 class="title small-title">The Bible Book Train</h1><span class="sub">From Genesis to Revelation</span></div>
            </header>
            <kids-book-train></kids-book-train>
            <div class="next-row"><button class="btn quiet" type="button" data-again hidden>Build it again</button></div>
          </section>`;
        const game = app.root.querySelector("kids-book-train");
        game.config = gameConfig(app, { engine: app.xdata.bookTrain.engine, groups: app.xdata.bookTrain.groups });
        game.addEventListener("kids-done", () => {
            store.addTrainWin(child.id);
            const added = store.unlockCards(child.id, rules.dueCards(store.explorer(child.id), app.xdata));
            if (added.length) {
                toast(`A new card for your Field Guide: ${cardById(app, added[0])?.name ?? ""}!`);
                app.sfx("page-stamp");
            }
            app.root.querySelector("[data-again]").hidden = false;
        });
        app.root.querySelector("[data-again]").addEventListener("click", () => game.render());
        app.root.querySelector("[data-go]").addEventListener("click", () => app.go("#/games"));
        return true;
    }
    return null;
}

/** The Explorers' cards at the top of the Games screen. */
export function explorerGameCards(app) {
    const record = app.xrecord();
    const pinned = Object.keys(record.quest).length;
    return `
      <button class="panel game-card" type="button" data-play="#/games/map-quest">
        <img class="map-thumb" src="${escapeHtml(app.resolve(app.xdata.mapQuest.image))}" alt="" />
        <span><b>Map Quest</b><span>Put the Bible's places on the map · ${pinned} of ${app.xdata.mapQuest.places.length} pinned</span></span>
      </button>
      <button class="panel game-card" type="button" data-play="#/games/book-train">
        <img src="${escapeHtml(app.resolve(app.xdata.bookTrain.engine))}" alt="" />
        <span><b>The Bible Book Train</b><span>The 66 books in order${record.trainWins ? ` · built ${record.trainWins} ${record.trainWins === 1 ? "time" : "times"}` : ""}</span></span>
      </button>`;
}
