/**
 * Daily Grace Kids: the Grown-ups' Corner (behind the gate), the form for a
 * child, and the printables (verse cards and certificates; colouring pages
 * open as the full-size picture to print).
 *
 * The Corner: the children on this device (up to four), what each has done
 * lately, the settings for the whole device, and what can be printed. Every
 * change is kept at once.
 */

import * as store from "../../../assets/scripts/kids/store.js?v=20261025-1";
import * as rules from "../../../assets/scripts/kids/rules.js?v=20261025-1";
import { BAND_NAMES, DAILY_GRACE_URL, ICONS, ask, escapeHtml, isExplorer, toast } from "./kids-ui.js?v=20261025-1";

const TIME_LABELS = { 0: "Off", 15: "15 minutes", 30: "30 minutes", 45: "45 minutes" };
const TOGGLES = [
    ["narration", "Narration", "The stories and Nari are read aloud"],
    ["sound", "Sounds", "Taps, finds and cheers"],
    ["readTogether", "Read Together", "Large words for a grown-up to read aloud"],
    ["bigText", "Bigger text", "Larger words everywhere"],
    ["readingFont", "Reading-friendly font", "Letters shaped for beginning readers"],
    ["lessMotion", "Less motion", "Fewer moving and bouncing things"],
    ["mapInOrder", "Stories in order", "The map opens each story once the one before it is finished"],
    ["harderStories", "Show the harder stories (Explorers)", "Two side trails: Pulled Out of Sodom, and The King Who Kept the Wrong Promise. Each starts with a note for you."],
];

/** An Explorer's panel: rank, stories, verses, the Field Guide, the last question, and the answers they shared. */
function explorerChild(app, c) {
    const record = store.explorer(c.id);
    const counts = rules.explorerTally(record, app.xdata);
    const rank = rules.rankFor(counts.finished, app.xdata);
    const answers = store.journal(c.id).answers;
    const shared = Object.entries(answers).filter(([, a]) => a.shared);
    const privateCount = Object.keys(answers).length - shared.length;
    const think = record.lastThink ? app.xstory(record.lastThink.story) : null;
    const learned = app.xdata.stories.filter((st) => record.stops[st.id]?.verse?.learned);
    const sections = rules.explorerSectionsDone(record, app.xdata, store.settings());
    return `
      <div class="tally">
        <div><b>${escapeHtml(rank.name)}</b><span>rank</span></div>
        <div><b>${counts.finished}</b><span>${counts.finished === 1 ? "story" : "stories"}</span></div>
        <div><b>${counts.verses}</b><span>${counts.verses === 1 ? "verse" : "verses"} learned</span></div>
        <div><b>${counts.cards}</b><span>of ${app.xdata.fieldGuide.cards.length} cards</span></div>
      </div>
      ${think ? `<p class="dinner"><b>Pick up the conversation at dinner.</b> From ${escapeHtml(think.title)}: “${escapeHtml(record.lastThink.question)}”</p>` : ""}
      <details class="prints journal-shared">
        <summary>${ICONS.book} ${escapeHtml(c.name)}'s journal</summary>
        ${shared.length ? shared.map(([sid, a]) => `
          <article class="shared-answer"><h4>${escapeHtml(app.xstory(sid)?.title ?? sid)}</h4>
            <p class="small">${escapeHtml(app.xstory(sid)?.think.journal ?? "")}</p>
            <p class="answer-text">${escapeHtml(a.text)}</p></article>`).join("") : `<p class="small">No answers shared yet.</p>`}
        ${privateCount ? `<p class="small">${privateCount} more ${privateCount === 1 ? "answer is" : "answers are"} private: answered, and kept for ${escapeHtml(c.name)}.</p>` : ""}
      </details>
      ${learned.length || sections.length ? `
        <details class="prints">
          <summary>${ICONS.print} Print for ${escapeHtml(c.name)}</summary>
          <ul>
            ${learned.map((st) => `<li><a href="#/print/explorer-verse/${escapeHtml(st.id)}">Verse card: ${escapeHtml(st.verse.ref)}</a></li>`).join("")}
            ${sections.map((sec) => `<li><a href="#/print/explorer-certificate/${escapeHtml(c.id)}/${escapeHtml(sec)}">Explorer certificate: ${escapeHtml(app.data.map.sections.find((x) => x.id === sec)?.name ?? sec)}</a></li>`).join("")}
          </ul>
        </details>` : ""}`;
}

function storyDates(app, progress) {
    return app.data.stories
        .filter((s) => progress.stops[s.id]?.finishedOn)
        .map((s) => ({ story: s, on: progress.stops[s.id].finishedOn }))
        .sort((a, b) => b.on.localeCompare(a.on));
}

function niceDate(iso) {
    const [y, m, d] = String(iso).split("-").map(Number);
    if (!y || !m || !d) {
        return "";
    }
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "long" });
}

export function renderCorner(app) {
    const p = store.profiles();
    const s = store.settings();
    const back = store.currentChild() ? "#/home" : "#/";
    const children = p.children.map((c) => {
        const progress = store.progress(c.id);
        const counts = rules.tally(progress, app.data);
        const recent = storyDates(app, progress).slice(0, 3);
        const talk = progress.lastTalk ? app.story(progress.lastTalk.story) : null;
        const done = rules.sectionsDone(progress, app.data);
        const finished = app.data.stories.filter((st) => progress.stops[st.id]?.steps?.verse);
        return `
          <article class="panel corner-child">
            <header>
              <img src="${escapeHtml(app.avatarThumb(c.avatar))}" alt="" />
              <div><h3>${escapeHtml(c.name)}</h3><span class="band band-${c.band}">${escapeHtml(BAND_NAMES[c.band])}</span></div>
              <button class="btn quiet small-btn" type="button" data-edit="${escapeHtml(c.id)}">Edit</button>
            </header>
            ${isExplorer(c) && app.xdata ? explorerChild(app, c) : `
            <div class="tally">
              <div><b>${counts.finished}</b><span>${counts.finished === 1 ? "story" : "stories"}</span></div>
              <div><b>${counts.fruit}</b><span>${counts.fruit === 1 ? "verse" : "verses"}</span></div>
              <div><b>${counts.flowers}</b><span>${counts.flowers === 1 ? "talk" : "talks"}</span></div>
              <div><b>${Object.keys(store.stickers(c.id).earned).length}</b><span>stickers</span></div>
            </div>
            ${recent.length ? `<p class="small">Lately: ${recent.map((r) => `${escapeHtml(r.story.title)} (${escapeHtml(niceDate(r.on))})`).join(", ")}</p>` : `<p class="small">No stories finished yet.</p>`}
            ${talk ? `<p class="dinner"><b>Pick up the conversation at dinner.</b> From ${escapeHtml(talk.title)}: “${escapeHtml(progress.lastTalk.question)}”</p>` : ""}
            ${finished.length || done.length ? `
              <details class="prints">
                <summary>${ICONS.print} Print for ${escapeHtml(c.name)}</summary>
                <ul>
                  ${finished.map((st) => `<li><a href="#/print/verse/${escapeHtml(st.id)}">Verse card: ${escapeHtml(st.verse.ref)}</a></li>`).join("")}
                  ${done.map((sec) => `<li><a href="#/print/certificate/${escapeHtml(c.id)}/${escapeHtml(sec)}">Certificate: ${escapeHtml(app.data.map.sections.find((x) => x.id === sec)?.name ?? sec)}</a></li>`).join("")}
                </ul>
              </details>` : ""}`}
          </article>`;
    }).join("");
    app.root.innerHTML = `
      <section class="screen corner">
        <header class="bar">
          <button class="round-btn back-btn" type="button" data-go="${back}" aria-label="Back">${ICONS.backCircle}</button>
          <div class="bar-text"><h1 class="title small-title">Grown-ups' Corner</h1><span class="sub">Settings and progress for this device</span></div>
        </header>
        <section>
          <h2>Children on this device</h2>
          ${children || `<p class="small">No children yet.</p>`}
          ${p.children.length < store.MAX_CHILDREN ? `<button class="child-card add wide" type="button" data-go="#/corner/add">${ICONS.plus}<span>Add a child</span></button>` : `<p class="small">Up to ${store.MAX_CHILDREN} children can be added on one device.</p>`}
        </section>
        <section class="panel">
          <h2>Time limit each day</h2>
          <div class="choices" role="radiogroup" aria-label="Time limit each day">
            ${store.TIME_LIMITS.map((m) => `<button type="button" role="radio" aria-checked="${s.timeLimit === m}" data-limit="${m}">${TIME_LABELS[m]}</button>`).join("")}
          </div>
          <p class="small">When the time is up, Nari falls asleep until tomorrow. A grown-up can add 15 minutes.</p>
        </section>
        <section class="panel">
          <h2>Sound, reading and the map</h2>
          ${TOGGLES.map(([key, name, note]) => `
            <label class="toggle">
              <span><b>${name}</b><span>${note}</span></span>
              <input type="checkbox" data-setting="${key}" ${s[key] ? "checked" : ""} />
              <span class="switch" aria-hidden="true"></span>
            </label>`).join("")}
        </section>
        <section class="panel">
          <h2>Colouring pages</h2>
          <p class="small">Opens the full-size page to print or save.</p>
          <ul class="colour-links">
            ${app.data.stories.map((st) => `<li><a href="${escapeHtml(app.resolve(st.colouring.print))}" target="_blank" rel="noopener">${escapeHtml(st.title)}</a></li>`).join("")}
          </ul>
        </section>
        <section class="panel privacy">
          <h2>Privacy</h2>
          <p>Everything stays on this device: names, progress, stickers and an Explorer's journal. Daily Grace Kids has no accounts, no ads, no chat and no outside links, and sends nothing anywhere. An Explorer's journal answers are private unless the child chooses to share one with you.</p>
        </section>
        <a class="back-to-dg" href="${DAILY_GRACE_URL}">${ICONS.home} Back to Daily Grace</a>
      </section>`;
    const root = app.root;
    root.querySelector(".corner").addEventListener("click", (event) => {
        const go = event.target.closest("[data-go]");
        if (go) {
            app.go(go.dataset.go);
            return;
        }
        const edit = event.target.closest("[data-edit]");
        if (edit) {
            app.go(`#/corner/child/${edit.dataset.edit}`);
            return;
        }
        const limit = event.target.closest("[data-limit]");
        if (limit) {
            store.updateSettings({ timeLimit: Number(limit.dataset.limit) });
            for (const b of root.querySelectorAll("[data-limit]")) {
                b.setAttribute("aria-checked", String(b === limit));
            }
            toast(Number(limit.dataset.limit) ? `Time limit: ${TIME_LABELS[limit.dataset.limit]} a day.` : "No time limit.");
        }
    });
    root.querySelector(".corner").addEventListener("change", (event) => {
        const key = event.target.dataset.setting;
        if (key) {
            store.updateSettings({ [key]: event.target.checked });
        }
    });
    return null;
}

export function renderChildForm(app, id) {
    const p = store.profiles();
    const child = id ? p.children.find((c) => c.id === id) : null;
    if (id && !child) {
        location.replace("#/corner");
        return null;
    }
    if (!child && p.children.length >= store.MAX_CHILDREN) {
        toast(`Up to ${store.MAX_CHILDREN} children can be added on one device.`);
        location.replace("#/corner");
        return null;
    }
    const chosen = child?.avatar ?? app.avatars.find((a) => a.id !== "KA-00")?.id ?? "KA-00";
    app.root.innerHTML = `
      <section class="screen corner form-screen">
        <header class="bar">
          <button class="round-btn back-btn" type="button" data-cancel aria-label="Back">${ICONS.backCircle}</button>
          <div class="bar-text"><h1 class="title small-title">${child ? `Edit ${escapeHtml(child.name)}` : "Add a child"}</h1>
            <span class="sub">The name stays on this device. Nothing is sent anywhere.</span></div>
        </header>
        <form class="panel child-form" novalidate>
          <label class="field">
            <b>First name</b>
            <input id="child-name" name="name" type="text" maxlength="${store.MAX_NAME}" autocomplete="off" autocapitalize="words" spellcheck="false"
              placeholder="Anna" value="${escapeHtml(child?.name ?? "")}" required />
            <span class="error" id="name-error" aria-live="polite"></span>
          </label>
          <fieldset class="field">
            <legend><b>Age</b></legend>
            <label class="radio"><input type="radio" name="band" value="lambs" ${!child || child.band === "lambs" ? "checked" : ""} /><span>3 to 5 · Little Lambs</span></label>
            <label class="radio"><input type="radio" name="band" value="lions" ${child?.band === "lions" ? "checked" : ""} /><span>6 to 8 · Young Lions</span></label>
            <label class="radio"><input type="radio" name="band" value="explorers" ${child?.band === "explorers" ? "checked" : ""} /><span>9 to 12 · Explorers</span></label>
            <p class="small band-note">A child who moves up keeps everything they have earned.</p>
          </fieldset>
          <label class="toggle read-aloud"${child?.band === "explorers" ? "" : " hidden"}>
            <span><b>Read aloud</b><span>Explorers read for themselves. Turn this on to have Nari and the verses read aloud on their own.</span></span>
            <input type="checkbox" name="readAloud" ${child?.readAloud ? "checked" : ""} />
            <span class="switch" aria-hidden="true"></span>
          </label>
          <fieldset class="field">
            <legend><b>Choose a picture</b></legend>
            <div class="avatar-grid">
              ${app.avatars.map((a) => `
                <label class="avatar-choice" title="${escapeHtml(a.avatar)}">
                  <input type="radio" name="avatar" value="${escapeHtml(a.id)}" ${a.id === chosen ? "checked" : ""} />
                  <img src="${escapeHtml(app.resolve(app.data.avatars.base + (a.thumbnail || a.file)))}" alt="${escapeHtml(a.avatar)}" loading="lazy" />
                </label>`).join("")}
            </div>
          </fieldset>
          <div class="row">
            <button class="btn quiet" type="button" data-cancel>Cancel</button>
            <button class="btn" type="submit">Save</button>
          </div>
          ${child ? `<button class="link-btn danger" type="button" data-remove>Remove ${escapeHtml(child.name)}</button>` : ""}
        </form>
      </section>`;
    const root = app.root;
    const form = root.querySelector("form");
    const error = root.querySelector("#name-error");
    const cancel = () => app.go("#/corner");
    for (const b of root.querySelectorAll("[data-cancel]")) {
        b.addEventListener("click", cancel);
    }
    // "Read aloud" is an Explorer's choice: shown only when 9 to 12 is chosen.
    form.addEventListener("change", (event) => {
        if (event.target.name === "band") {
            root.querySelector(".read-aloud").hidden = event.target.value !== "explorers";
        }
    });
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const name = store.cleanName(data.get("name"));
        if (!name) {
            error.textContent = "Please type the child's first name.";
            root.querySelector("#child-name").focus();
            return;
        }
        const band = store.BANDS.includes(data.get("band")) ? data.get("band") : "lambs";
        const values = { name, band, avatar: String(data.get("avatar") || "KA-00"), readAloud: band === "explorers" && data.get("readAloud") === "on" };
        try {
            if (child) {
                store.updateChild(child.id, values);
                toast(`${name} is saved.`);
                app.go("#/corner");
            } else {
                const added = store.addChild(values);
                store.setCurrent(added.id);
                toast(`Welcome, ${name}!`);
                app.go("#/home");
            }
        } catch (e) {
            error.textContent = e.message === "full"
                ? `Up to ${store.MAX_CHILDREN} children can be added on one device.`
                : "Please type the child's first name.";
        }
    });
    root.querySelector("[data-remove]")?.addEventListener("click", async () => {
        const yes = await ask(`Remove ${child.name}? Their stories, tree, stickers and journal on this device will be deleted. This can't be undone.`,
            { yes: `Remove ${child.name}`, no: "Keep", danger: true });
        if (yes) {
            store.removeChild(child.id);
            toast(`${child.name} was removed.`);
            app.go("#/corner");
        }
    });
    if (!child) {
        root.querySelector("#child-name").focus();
    }
    return null;
}

/** The printables: a verse card, or a certificate for a part of the map (each also in the Explorer design). */
export function renderPrint(app, args) {
    const [kind, a, b] = args;
    let body = "";
    if (kind === "explorer-verse") {
        const story = app.xstory(a);
        if (!story) {
            location.replace("#/corner");
            return null;
        }
        body = `
          <div class="print-page verse-card explorer-print" style="--frame:url('${escapeHtml(app.resolve(app.xdata.ui.verseCard))}')">
            <div class="print-text">
              <p class="print-verse">${escapeHtml(story.verse.text)}</p>
              <p class="print-ref">${escapeHtml(story.verse.ref)}</p>
              <p class="print-brand">Daily Grace Kids · Explorers</p>
            </div>
          </div>`;
    } else if (kind === "explorer-certificate") {
        const child = store.profiles().children.find((c) => c.id === a);
        const section = app.data.map.sections.find((s) => s.id === b);
        if (!child || !section || !app.xdata || !rules.explorerSectionsDone(store.explorer(child.id), app.xdata, store.settings()).includes(section.id)) {
            location.replace("#/corner");
            return null;
        }
        body = `
          <div class="print-page certificate explorer-print" style="--frame:url('${escapeHtml(app.resolve(app.xdata.ui.certificate))}')">
            <div class="print-text">
              <p class="print-title">Explorer's Certificate</p>
              <p class="print-name">${escapeHtml(child.name)}</p>
              <p class="print-line">explored every story of <b>${escapeHtml(section.name)}</b> on the Daily Grace Kids Explorers trail.</p>
              <p class="print-date">${escapeHtml(new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }))}</p>
              <p class="print-brand">Daily Grace</p>
            </div>
          </div>`;
    } else if (kind === "verse") {
        const story = app.story(a);
        if (!story) {
            location.replace("#/corner");
            return null;
        }
        body = `
          <div class="print-page verse-card" style="--frame:url('${escapeHtml(app.resolve(app.data.ui.verseCard))}')">
            <div class="print-text">
              <p class="print-verse">${escapeHtml(story.verse.text.charAt(0).toUpperCase() + story.verse.text.slice(1))}</p>
              <p class="print-ref">${escapeHtml(story.verse.ref)}</p>
              <p class="print-brand">Daily Grace Kids</p>
            </div>
          </div>`;
    } else if (kind === "certificate") {
        const child = store.profiles().children.find((c) => c.id === a);
        const section = app.data.map.sections.find((s) => s.id === b);
        if (!child || !section || !rules.sectionsDone(store.progress(child.id), app.data).includes(section.id)) {
            location.replace("#/corner");
            return null;
        }
        body = `
          <div class="print-page certificate" style="--frame:url('${escapeHtml(app.resolve(app.data.ui.certificate))}')">
            <div class="print-text">
              <p class="print-title">Certificate of Grace</p>
              <p class="print-name">${escapeHtml(child.name)}</p>
              <p class="print-line">walked with Nari through <b>${escapeHtml(section.name)}</b> on the Daily Grace Kids Journey Map.</p>
              <p class="print-date">${escapeHtml(new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }))}</p>
              <p class="print-brand">Daily Grace</p>
            </div>
          </div>`;
    } else {
        location.replace("#/corner");
        return null;
    }
    app.root.innerHTML = `
      <section class="screen print-screen">
        <header class="bar no-print">
          <button class="round-btn back-btn" type="button" data-go="#/corner" aria-label="Back">${ICONS.backCircle}</button>
          <div class="bar-text"><h1 class="title small-title">Ready to print</h1><span class="sub">Use your device's Print or Share button, or the one below.</span></div>
          <button class="btn" type="button" data-print>${ICONS.print} Print</button>
        </header>
        ${body}
      </section>`;
    app.root.querySelector("[data-go]").addEventListener("click", () => app.go("#/corner"));
    app.root.querySelector("[data-print]").addEventListener("click", () => window.print());
    return null;
}
