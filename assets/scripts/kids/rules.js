/**
 * Daily Grace Kids: the rules, worked out from a child's progress. No storage,
 * no screen: everything here is a plain function of its arguments, so it can be
 * tested on its own (tests/kids-rules.spec.mjs).
 *
 * A child's progress (see store.js) records, for each story, which of its five
 * steps are done; everything a child "has" is counted from that, so nothing
 * ever goes down and doing a story again never counts twice:
 *   leaves   stories finished          (one each, the first time)
 *   fruit    verses learned            (My Verse built)
 *   flowers  Talk Togethers done       (a grown-up tapped "We talked about it")
 *   birds    parts of the map finished (every story in that part finished)
 * The tree grows with the leaves, and Nari with the stories finished.
 *
 * Exports
 *   STEPS                         the five steps, in order
 *   tally(progress, data)         { leaves, fruit, flowers, birds, finished, finds, ... }
 *   treeStage(leaves, data)       the tree stage to show
 *   nariStage(finished, data)     Nari's stage
 *   nextNariStage(finished, data) the next stage and how many more stories
 *   road(data)                    the stories in the order of the road
 *   nextStory(progress, data)     the first story not yet finished, or null
 *   isOpen(id, progress, data, inOrder)  whether a story may be opened
 *   sectionsDone(progress, data)  the parts of the map whose stories are all finished
 *   isFinished(stop)              whether a story's record counts as finished
 *   dueStickers(progress, earned, data, extra)  sticker ids now due, in order
 *   piecesFor(counts, stage)      which tree piece sits on which spot
 *
 * Explorers (ages 9 to 12) keep their own record (store.explorer) and story
 * data (assets/kids/explorers-data.json, "xdata" here):
 *   explorerRoad(xdata, settings)          the trail's stories, the harder two only when allowed
 *   explorerTally(record, xdata)           { finished, verses, practised, talks, cards, read }
 *   rankFor(finished, xdata)               the rank earned; nextRank(finished, xdata)
 *   nextExplorerStory(record, xdata, settings)
 *   isExplorerOpen(id, record, xdata, settings)
 *   dueCards(record, xdata)                Field Guide cards earned but not yet in the guide
 *   explorerSectionsDone(record, xdata, settings)  map parts whose trail stories are all finished
 *   thisWeek(record, today)                stories read and verses learned in the last seven days
 */

export const STEPS = ["watch", "find", "play", "verse", "talk"];

/** A story is finished once its first four steps are done and Talk Together was reached. */
export function isFinished(stop) {
    if (!stop || !stop.steps) {
        return false;
    }
    const s = stop.steps;
    return Boolean(s.watch && s.find && s.play && s.verse && (s.talk || stop.talkLater));
}

/** The stories in the order they stand on the road. */
export function road(data) {
    const byId = new Map(data.stories.map((s) => [s.id, s]));
    return data.map.road.filter((place) => place.story && byId.has(place.story)).map((place) => byId.get(place.story));
}

export function sectionsDone(progress, data) {
    const stops = progress?.stops ?? {};
    const bySection = new Map();
    for (const story of data.stories) {
        if (!bySection.has(story.section)) {
            bySection.set(story.section, []);
        }
        bySection.get(story.section).push(story.id);
    }
    const done = [];
    for (const [section, ids] of bySection) {
        if (ids.every((id) => isFinished(stops[id]))) {
            done.push(section);
        }
    }
    return done;
}

export function tally(progress, data) {
    const stops = progress?.stops ?? {};
    let finished = 0;
    let fruit = 0;
    let flowers = 0;
    let finds = 0;
    let watched = 0;
    let played = 0;
    for (const story of data.stories) {
        const stop = stops[story.id];
        if (!stop || !stop.steps) {
            continue;
        }
        if (isFinished(stop)) {
            finished += 1;
        }
        if (stop.steps.verse) {
            fruit += 1;
        }
        if (stop.steps.talk) {
            flowers += 1;
        }
        if (stop.steps.find) {
            finds += 1;
        }
        if (stop.steps.watch) {
            watched += 1;
        }
        if (stop.steps.play) {
            played += 1;
        }
    }
    const birds = sectionsDone(progress, data).length;
    const pairs = Math.max(0, Math.floor(Number(progress?.pairsWins) || 0));
    return { leaves: finished, fruit, flowers, birds, finished, finds, watched, played, pairs };
}

function stageFor(count, stages) {
    let current = stages[0];
    for (const stage of stages) {
        if (count >= stage.min) {
            current = stage;
        }
    }
    return current;
}

export function treeStage(leaves, data) {
    return stageFor(leaves, data.tree.stages);
}

export function nariStage(finished, data) {
    return stageFor(finished, data.nari.stages);
}

/** The next stage Nari grows to and how many more stories it takes, or null at the last. */
export function nextNariStage(finished, data) {
    const next = data.nari.stages.find((stage) => stage.min > finished);
    return next ? { stage: next, more: next.min - finished } : null;
}

export function nextStory(progress, data) {
    const stops = progress?.stops ?? {};
    return road(data).find((story) => !isFinished(stops[story.id])) ?? null;
}

/**
 * Whether a story may be opened. The map is open by default; with the
 * grown-up's "in order" setting, a story opens once every story before it on
 * the road is finished (a finished story always stays open).
 */
export function isOpen(id, progress, data, inOrder) {
    const stories = road(data);
    const index = stories.findIndex((s) => s.id === id);
    if (index < 0) {
        return false;
    }
    if (!inOrder) {
        return true;
    }
    const stops = progress?.stops ?? {};
    if (isFinished(stops[id])) {
        return true;
    }
    return stories.slice(0, index).every((s) => isFinished(stops[s.id]));
}

/** How many gifts a path with `first` and `every` has earned at `count`. */
function giftsAt(count, first, every) {
    if (count < first) {
        return 0;
    }
    return 1 + Math.floor((count - first) / every);
}

/**
 * The sticker ids now due for a child, in the order to give them. `earned` is
 * the child's { [id]: { path, ... } }. Each path gives the next unearned
 * sticker of its series; a series that runs out simply gives no more. The
 * series take turns in the list, and the page hands out only a few at a time
 * (STICKERS_PER_STORY), so the first story's many "firsts" don't arrive as a
 * pile: what is due waits, and is never lost.
 */
export function dueStickers(progress, earned, data, extra = null) {
    const counts = tally(progress, data);
    // An Explorer's stories, verses and talks count toward the same series.
    if (extra) {
        counts.finished += extra.finished ?? 0;
        counts.fruit += extra.verses ?? 0;
        counts.flowers += extra.talks ?? 0;
    }
    const firsts = progress?.firsts ?? {};
    const have = earned ?? {};
    const byGroup = new Map();
    for (const sticker of data.stickers.list) {
        if (!byGroup.has(sticker.group)) {
            byGroup.set(sticker.group, []);
        }
        byGroup.get(sticker.group).push(sticker);
    }
    const perPath = [];
    for (const path of data.stickers.paths) {
        const due = [];
        perPath.push(due);
        const series = byGroup.get(path.group) ?? [];
        const given = Object.values(have).filter((e) => e.path === path.path).length;
        let owed;
        if (path.path === "firsts") {
            owed = path.firsts.filter((key) => firsts[key]).length;
        } else {
            const count = {
                stops: counts.finished,
                verses: counts.fruit,
                talks: counts.flowers,
                animals: counts.finds + counts.pairs,
            }[path.path] ?? 0;
            owed = giftsAt(count, path.first, path.every);
        }
        const unearned = series.filter((s) => !have[s.id]);
        for (let i = 0; i < owed - given && i < unearned.length; i += 1) {
            // Its turn: the series' gifts so far, plus its place in the queue.
            due.push({ id: unearned[i].id, path: path.path, turn: given + i });
        }
    }
    // The series take turns, counting what each has given already, so one
    // gift at a time still comes from each series in its turn.
    return perPath
        .flat()
        .map((item, order) => ({ ...item, order }))
        .sort((a, b) => a.turn - b.turn || a.order - b.order)
        .map(({ id, path }) => ({ id, path }));
}

// ------------------------------------------------------------------ explorers
/** The Explorers' trail, in order; the harder stories only when a grown-up allows them. */
export function explorerRoad(xdata, settings) {
    const byId = new Map(xdata.stories.map((s) => [s.id, s]));
    return xdata.road
        .map((id) => byId.get(id))
        .filter((story) => story && (!story.harder || settings?.harderStories === true));
}

export function explorerTally(record, xdata) {
    const stops = record?.stops ?? {};
    let finished = 0;
    let verses = 0;
    let practised = 0;
    let talks = 0;
    let read = 0;
    for (const story of xdata.stories) {
        const stop = stops[story.id];
        if (!stop?.steps) {
            continue;
        }
        if (isFinished(stop)) {
            finished += 1;
        }
        if (stop.verse?.learned) {
            verses += 1;
        }
        if (stop.steps.verse) {
            practised += 1;
        }
        if (stop.steps.talk) {
            talks += 1;
        }
        if (stop.steps.watch) {
            read += 1;
        }
    }
    const cards = Object.keys(record?.cards ?? {}).filter((id) => xdata.fieldGuide.cards.some((c) => c.id === id)).length;
    return { finished, verses, practised, talks, cards, read };
}

export function rankFor(finished, xdata) {
    return stageFor(finished, xdata.ranks);
}

/** The next rank and how many more stories it takes, or null at the last. */
export function nextRank(finished, xdata) {
    const next = xdata.ranks.find((rank) => rank.min > finished);
    return next ? { rank: next, more: next.min - finished } : null;
}

export function nextExplorerStory(record, xdata, settings) {
    const stops = record?.stops ?? {};
    return explorerRoad(xdata, settings).find((story) => !isFinished(stops[story.id])) ?? null;
}

/**
 * Whether an Explorer story may be opened: it is on the trail (a harder story
 * only when allowed), and, with "Stories in order", every story before it is
 * finished. A finished story always stays open.
 */
export function isExplorerOpen(id, record, xdata, settings) {
    const stories = explorerRoad(xdata, settings);
    const index = stories.findIndex((s) => s.id === id);
    if (index < 0) {
        return false;
    }
    if (!settings?.mapInOrder) {
        return true;
    }
    const stops = record?.stops ?? {};
    if (isFinished(stops[id])) {
        return true;
    }
    return stories.slice(0, index).every((s) => isFinished(stops[s.id]));
}

/**
 * The Field Guide cards a child has earned but not yet been given, in the
 * guide's order: a card comes with finishing any of its stories, a place with
 * pinning it in Map Quest, and the scroll with finishing the Book Train.
 */
export function dueCards(record, xdata) {
    const stops = record?.stops ?? {};
    const have = record?.cards ?? {};
    return xdata.fieldGuide.cards
        .filter((card) => !have[card.id])
        .filter((card) => card.stories.some((id) => isFinished(stops[id]))
            || (card.quest && record?.quest?.[card.id] === true)
            || (card.train && (record?.trainWins ?? 0) > 0))
        .map((card) => card.id);
}

export function explorerSectionsDone(record, xdata, settings) {
    const stops = record?.stops ?? {};
    const bySection = new Map();
    for (const story of explorerRoad(xdata, settings)) {
        if (!bySection.has(story.section)) {
            bySection.set(story.section, []);
        }
        bySection.get(story.section).push(story.id);
    }
    return [...bySection].filter(([, ids]) => ids.every((id) => isFinished(stops[id]))).map(([section]) => section);
}

/** What an Explorer did in the seven days up to `today` (YYYY-MM-DD): stories read, verses practised. */
export function thisWeek(record, today) {
    const end = Date.parse(`${today}T00:00:00Z`);
    const inWeek = (day) => {
        const t = Date.parse(`${day}T00:00:00Z`);
        return Number.isFinite(t) && end - t >= 0 && end - t < 7 * 86400000;
    };
    let read = 0;
    let verses = 0;
    for (const stop of Object.values(record?.stops ?? {})) {
        if (stop.days?.watch && inWeek(stop.days.watch)) {
            read += 1;
        }
        if (stop.days?.verse && inWeek(stop.days.verse)) {
            verses += 1;
        }
    }
    return { read, verses };
}

/**
 * Which piece sits on which spot of the tree: leaves, fruit and flowers take
 * turns along the stage's spots (so each kind shows as it grows), birds sit on
 * the perches, and the nest comes with the first bird. Pieces beyond the spots
 * are counted but not drawn.
 */
export function piecesFor(counts, stage) {
    const queue = [];
    const left = { leaf: counts.leaves, fruit: counts.fruit, flower: counts.flowers };
    while (left.leaf + left.fruit + left.flower > 0) {
        for (const kind of ["leaf", "fruit", "flower"]) {
            if (left[kind] > 0) {
                queue.push(kind);
                left[kind] -= 1;
            }
        }
    }
    const pieces = queue.slice(0, stage.spots.length).map((kind, i) => ({
        kind,
        n: queue.slice(0, i + 1).filter((k) => k === kind).length,
        x: stage.spots[i][0],
        y: stage.spots[i][1],
    }));
    const birds = Math.min(counts.birds, stage.perches.length);
    for (let i = 0; i < birds; i += 1) {
        pieces.push({ kind: "bird", n: i + 1, x: stage.perches[i][0], y: stage.perches[i][1] });
    }
    if (counts.birds > 0) {
        pieces.push({ kind: "nest", n: 1, x: stage.nest[0], y: stage.nest[1] });
    }
    return pieces;
}
