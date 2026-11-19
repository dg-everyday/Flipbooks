// A page for each week of the Flipbook, written into the copy of the site being
// published, so a shared Flipbook link shows that week's cover. Crawlers such
// as Messenger's do not run scripts, and the Flipbook chooses its cover by
// script, so flipbook.html?date=… always previews with the page's own picture.
// A page of its own, /w/2026-11-15.html (named for the week's Sunday), carries
// the week's cover, title and dates in its meta tags, and sends a reader on to
// the Flipbook at that week by script at once. It forwards by script only:
// crawlers follow a <meta http-equiv="refresh"> and would then preview the
// Flipbook instead. It asks search engines not to index it; the Flipbook and the
// Archives' day pages are the pages to find.
//
//   node assets/scripts/build-week-pages.mjs _site                                on deploy
//   node assets/scripts/build-week-pages.mjs <dir> --today 2026-11-20 --offline   for tests
//
// The weeks run from the one holding January 1 of the Archives' first year
// (assets/library/index.json) to the one holding tomorrow in Manila: the
// scheduled deploy runs hours after midnight, so Saturday's deploy writes the
// next week's page ahead of it. Each cover is looked up on the media host, for
// its size, which lets the preview show on the first share; a week without its
// cover gets the year's stand-in, as in the Flipbook (daily-grace-week.js).
// --offline skips the lookups. The pages are never committed; only the
// published copy has them. Nothing here may stop the day's devotional from
// going out: a failure is a warning.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const SITE = "https://dailygrace.faith";
const MEDIA = `${SITE}/media/`;
const DAY_MS = 86_400_000;
const LOOKUP_TIMEOUT = 8000; // ms for each cover

const args = process.argv.slice(2);
const out = args.find((arg, i) => !arg.startsWith("--") && args[i - 1] !== "--today");
const todayArg = args.includes("--today") ? args[args.indexOf("--today") + 1] : null;
const offline = args.includes("--offline");

function manilaToday() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

const escapeHtml = (text) =>
    String(text ?? "").replace(
        /[&<>"']/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );

const dateOf = (iso) => new Date(`${iso}T00:00:00Z`);
const isoOf = (date) => date.toISOString().slice(0, 10);
const addDays = (iso, n) => isoOf(new Date(dateOf(iso).getTime() + n * DAY_MS));
/** The Sunday that starts the week `iso` falls in. */
const sundayOf = (iso) => addDays(iso, -dateOf(iso).getUTCDay());

/** "November 15 – 21, 2026", as the share button names the week (flipbook-share.js). */
function weekName(sunday) {
    return new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).formatRange(dateOf(sunday), dateOf(addDays(sunday, 6)));
}

/** The cover and the year's stand-in, named as in daily-grace-week.js (coverPaths). */
function coverUrls(sunday) {
    const saturday = dateOf(addDays(sunday, 6));
    const year = saturday.getUTCFullYear();
    const start = new Date(Date.UTC(year, 0, 1));
    const week = Math.floor(((saturday - start) / DAY_MS + start.getUTCDay()) / 7) + 1;
    return [
        `${MEDIA}images/coverpages/${year}/${year}-WEEK${week}.webp`,
        `${MEDIA}images/coverpages/${year}/${year}-404.webp`,
    ];
}

/** Width and height from the start of a WebP file, or null. */
function webpSize(bytes) {
    if (bytes.length < 30 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") {
        return null;
    }
    const chunk = bytes.toString("ascii", 12, 16);
    if (chunk === "VP8X") {
        return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
    }
    if (chunk === "VP8 ") {
        return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === "VP8L") {
        const bits = bytes.readUInt32LE(21);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    return null;
}

/**
 * The picture at `url`: "missing" when the host says it is not there, else its
 * size, or null when it cannot be told (offline, or a blip on the way).
 */
async function lookUp(url) {
    if (offline) {
        return null;
    }
    try {
        const response = await fetch(url, {
            headers: { Range: "bytes=0-63" },
            signal: AbortSignal.timeout(LOOKUP_TIMEOUT),
        });
        if (response.status === 404) {
            return "missing";
        }
        if (!response.ok) {
            return null;
        }
        return webpSize(Buffer.from(await response.arrayBuffer()));
    } catch {
        return null;
    }
}

/** The week's cover to preview, with its size when known. */
async function coverFor(sunday) {
    const [cover, standIn] = coverUrls(sunday);
    const found = await lookUp(cover);
    if (found !== "missing") {
        return { src: cover, size: found };
    }
    const fallback = await lookUp(standIn);
    console.log(`::warning::no cover for the week of ${sunday}; the preview uses ${standIn}`);
    return { src: standIn, size: fallback === "missing" ? null : fallback };
}

function page(sunday, cover) {
    const url = `${SITE}/w/${sunday}.html`;
    const flipbook = `/apps/pages/flipbook.html?date=${sunday}`;
    const week = weekName(sunday);
    const title = `Daily Grace Flipbook for the week of ${week}`;
    const description =
        "A week of Daily Grace, one page a day: the verses, reflections and comics, turned like the pages of a book.";
    const alt = `The Daily Grace Flipbook cover for the week of ${week}`;
    const size = cover.size
        ? `
    <meta property="og:image:width" content="${cover.size.width}" />
    <meta property="og:image:height" content="${cover.size.height}" />`
        : "";
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="noindex" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Daily Grace" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${cover.src}" />
    <meta property="og:image:type" content="image/webp" />${size}
    <meta property="og:image:alt" content="${escapeHtml(alt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#001b34" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <script>
      location.replace(${JSON.stringify(flipbook)});
    </script>
    <style>
      body { margin: 0; padding: 24px 16px 40px; background: #001b34; color: #fff;
             font: 17px/1.5 Georgia, serif; text-align: center; }
      main { max-width: 420px; margin: 0 auto; }
      img { display: block; width: 100%; height: auto; border-radius: 10px; }
      .cover { display: block; }
      .open { display: block; margin: 20px 0 0; padding: 14px 18px; border-radius: 10px;
              background: #c62828; color: #fff; font-weight: bold; text-decoration: none; }
    </style>
  </head>
  <body>
    <main>
      <a class="cover" href="${flipbook}">
        <img src="${cover.src}" alt="${escapeHtml(alt)}" />
      </a>
      <a class="open" href="${flipbook}">Open the Flipbook for the week of ${escapeHtml(week)}</a>
    </main>
  </body>
</html>
`;
}

async function build() {
    if (!out) {
        throw new Error("Give the folder to write into, e.g. _site.");
    }
    const today = todayArg ?? manilaToday();
    const last = sundayOf(addDays(today, 1));
    const { years } = JSON.parse(readFileSync(resolve(ROOT, "assets/library/index.json"), "utf8"));
    const first = sundayOf(`${Math.min(...years)}-01-01`);

    const sundays = [];
    for (let sunday = first; sunday <= last; sunday = addDays(sunday, 7)) {
        sundays.push(sunday);
    }
    const covers = await Promise.all(sundays.map(coverFor));

    const folder = resolve(out, "w");
    mkdirSync(folder, { recursive: true });
    sundays.forEach((sunday, i) => {
        writeFileSync(resolve(folder, `${sunday}.html`), page(sunday, covers[i]));
    });
    const sized = covers.filter((cover) => cover.size).length;
    console.log(
        `Wrote ${sundays.length} week pages (${first} to ${last}) into ${out}/w/; ${sized} with the cover's size`,
    );
}

try {
    await build();
} catch (error) {
    // The day's devotional goes out regardless; shared weeks preview with the Flipbook's picture.
    console.log(`::warning::week pages not written: ${error.message}`);
}
