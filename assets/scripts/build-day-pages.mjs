// A page for each day in the Daily Grace Archives, written into the copy of
// the site being published, so a link to a day shows that day's banner when it
// is shared. Crawlers do not run scripts, and the Archives keep the day after
// a "#", which they never read: library.html#day/2026-10-01 previews the same
// as library.html. A page of its own, /d/2026-10-01.html, carries the day's
// banner, title and verse in its meta tags, and the day's words in its body,
// and sends a reader on to the day in the Archives.
//
//   node assets/scripts/build-day-pages.mjs _site                     on deploy
//   node assets/scripts/build-day-pages.mjs <dir> --today 2026-10-31  for tests
//
// Only the days in the Archives get a page: complete ones, from its first day
// (assets/library/index.json) up to today in Manila, so the daily deploy adds
// each new day as it comes. Their addresses are added to <dir>/sitemap.xml.
// The pages are never committed; only the published copy has them. Nothing
// here may stop the day's devotional from going out: a failure is a warning.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const SITE = "https://dailygrace.faith";
const MEDIA = `${SITE}/media/`;
// The banners started with the Archives; every day in it has one.
const BANNER_WIDTH = 1920;
const BANNER_HEIGHT = 1024;
const DESCRIPTION_MAX = 200;

const args = process.argv.slice(2);
const out = args.find((arg) => !arg.startsWith("--"));
const todayArg = args.includes("--today") ? args[args.indexOf("--today") + 1] : null;

function manilaToday() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

const readJson = (path) => JSON.parse(readFileSync(resolve(ROOT, path), "utf8"));

const escapeHtml = (text) =>
    String(text ?? "").replace(
        /[&<>"']/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );

const dateOf = (iso) => new Date(`${iso}T00:00:00Z`);
const format = (iso, options) =>
    dateOf(iso).toLocaleDateString("en-US", { timeZone: "UTC", ...options });

/** Text cut at a word to fit `max` characters, for a description. */
function clip(text, max) {
    const flat = String(text ?? "").replace(/\s+/g, " ").trim();
    if (flat.length <= max) {
        return flat;
    }
    return `${flat.slice(0, max).replace(/\s+\S*$/, "").replace(/[,;:]$/, "")}…`;
}

function bannerUrl(iso) {
    const month = format(iso, { month: "long" }).toLowerCase();
    return `${MEDIA}banner/${iso.slice(0, 4)}/${month}/daily-grace-${iso}.webp`;
}

// The month files of verses, read once each: { "October 1, 2026": entry }.
const verseFiles = new Map();
function entryFor(iso) {
    const month = format(iso, { month: "long" }).toLowerCase();
    const path = `assets/verses/${iso.slice(0, 4)}/${month}.json`;
    if (!verseFiles.has(path)) {
        const entries = existsSync(resolve(ROOT, path)) ? readJson(path) : [];
        verseFiles.set(path, new Map(entries.map((entry) => [entry.id, entry])));
    }
    return verseFiles.get(path).get(format(iso, { month: "long", day: "numeric", year: "numeric" })) ?? null;
}

function page(day, entry) {
    const iso = day.date;
    const url = `${SITE}/d/${iso}.html`;
    const archives = `/apps/pages/library.html#day/${iso}`;
    const dateLong = format(iso, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const dateShort = format(iso, { month: "long", day: "numeric", year: "numeric" });
    const title = `${day.title} — Daily Grace for ${dateShort}`;
    // The reference first, so a long verse cut short still says where it is.
    const description = clip(`${day.ref} (KJV): “${entry.text}”`, DESCRIPTION_MAX);
    const paragraphs = (text) =>
        String(text ?? "")
            .split(/\n\s*\n/)
            .filter((part) => part.trim())
            .map((part) => `      <p>${escapeHtml(part.trim())}</p>`)
            .join("\n");
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Daily Grace" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${bannerUrl(iso)}" />
    <meta property="og:image:type" content="image/webp" />
    <meta property="og:image:width" content="${BANNER_WIDTH}" />
    <meta property="og:image:height" content="${BANNER_HEIGHT}" />
    <meta property="og:image:alt" content="${escapeHtml(`The Daily Grace banner for ${dateShort}: ${day.ref}`)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#001b34" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <!-- Readers go on to the day in the Daily Grace Archives; crawlers, which
         run no scripts, read the tags above and the day below. -->
    <script>location.replace(${JSON.stringify(archives)});</script>
    <style>
      body { margin: 0; padding: 24px 16px 40px; background: #f3ead7; color: #10253b;
             font: 17px/1.5 Georgia, serif; }
      main { max-width: 640px; margin: 0 auto; }
      h1, h2 { color: #001b34; line-height: 1.2; }
      .when { color: #7a5a1c; font-weight: bold; }
      blockquote { margin: 0; padding: 12px 16px; border-left: 4px solid #c6922e; background: #fffaf1; }
      a { color: #001b34; font-weight: bold; }
    </style>
  </head>
  <body>
    <main>
      <p class="when">Daily Grace · ${escapeHtml(dateLong)}</p>
      <h1>${escapeHtml(day.title)}</h1>
      <blockquote>
        <p>${escapeHtml(entry.text)}</p>
        <p>${escapeHtml(day.ref)} (KJV)</p>
      </blockquote>
      <h2>Reflection</h2>
${paragraphs(entry.reflection)}
${entry.question ? `      <h2>To consider</h2>\n      <p>${escapeHtml(entry.question)}</p>\n` : ""}${entry.prayer ? `      <h2>Prayer</h2>\n      <p>${escapeHtml(entry.prayer)}</p>\n` : ""}      <p><a href="${archives}">Open this day in the Daily Grace Archives</a>, with its poster, comic and narration.</p>
    </main>
  </body>
</html>
`;
}

function build() {
    if (!out) {
        throw new Error("Give the folder to write into, e.g. _site.");
    }
    const today = todayArg ?? manilaToday();
    const { start, years } = readJson("assets/library/index.json");
    const days = years
        .filter((year) => year <= Number(today.slice(0, 4)))
        .flatMap((year) => readJson(`assets/library/${year}.json`).days)
        .filter((day) => day.date >= start && day.date <= today && !day.missing?.length);

    const folder = resolve(out, "d");
    mkdirSync(folder, { recursive: true });
    const written = [];
    for (const day of days) {
        const entry = entryFor(day.date);
        if (!entry) {
            console.log(`::warning::no verse entry for ${day.date}; no day page`);
            continue;
        }
        writeFileSync(resolve(folder, `${day.date}.html`), page(day, entry));
        written.push(day.date);
    }

    const sitemap = resolve(out, "sitemap.xml");
    if (existsSync(sitemap)) {
        const xml = readFileSync(sitemap, "utf8");
        const urls = written
            .map((iso) => `    <url><loc>${SITE}/d/${iso}.html</loc></url>`)
            .join("\n");
        writeFileSync(sitemap, xml.replace("</urlset>", `${urls}\n</urlset>`));
    }
    console.log(`Wrote ${written.length} day pages (${written[0] ?? "none"} to ${written.at(-1) ?? "none"}) into ${out}/d/`);
}

try {
    build();
} catch (error) {
    // The day's devotional goes out regardless; shared days show the Archives' picture.
    console.log(`::warning::day pages not written: ${error.message}`);
}
