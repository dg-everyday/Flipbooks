// A page for each Daily Grace Reels drama, written into the copy of the site being published, so
// a shared drama shows its own picture. The share button on the home page's Reels card
// (daily-grace-reels.js) sends /r/<drama>.html. Crawlers such as Messenger's do not run scripts,
// and the home page's own preview is the day's banner, so each drama gets a page of its own
// carrying its picture, title and description in its meta tags. It sends a reader on to the home
// page's Reels card, opened on that drama (/?reel=<drama>#daily-grace-reels), by script at once.
// It forwards by script only: crawlers follow a <meta http-equiv="refresh"> and would then preview
// the home page instead. It asks search engines not to index it.
//
//   node assets/scripts/build-reel-pages.mjs _site      on deploy
//
// The picture is the drama's 1200 x 630 card, assets/images/reels/<drama>/share.jpg (made by
// tools/microdramas/make_share_cards.py and committed); a drama without one names its cover.
// The dramas are those in assets/dg-reels.json. The pages are never committed; only the published
// copy has them. Nothing here may stop the day's devotional from going out: a failure is a warning.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const SITE = "https://dailygrace.faith";
const CARD = { width: 1200, height: 630 };
// A drama id becomes a file name and a URL; anything else is skipped.
const SAFE_ID = /^[a-z0-9][a-z0-9-]*$/;

const escapeHtml = (text) =>
    String(text ?? "").replace(
        /[&<>"']/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );

/** A cover as a full address: "media:…" on the media host, else a path in the site. */
function absolute(value) {
    const text = String(value ?? "");
    if (text.startsWith("media:")) {
        return `${SITE}/media/${text.slice("media:".length)}`;
    }
    if (/^https?:\/\//.test(text)) {
        return text;
    }
    return text ? `${SITE}/${text.replace(/^\/+/, "")}` : "";
}

export function page(drama, hasCard) {
    const url = `${SITE}/r/${drama.id}.html`;
    const reader = `/?reel=${drama.id}#daily-grace-reels`;
    const title = `${drama.title} - a Bible drama from Daily Grace Reels`;
    const description =
        drama.description || "A Bible story told as a short drama, straight from the King James Bible, on Daily Grace.";
    const alt = `${drama.title}, from Daily Grace Reels`;
    const cover = absolute(drama.cover);
    const image = hasCard
        ? { src: `${SITE}/assets/images/reels/${drama.id}/share.jpg`, type: "image/jpeg", size: CARD }
        : { src: cover, type: "image/webp", size: null };
    const size = image.size
        ? `
    <meta property="og:image:width" content="${image.size.width}" />
    <meta property="og:image:height" content="${image.size.height}" />`
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
    <meta property="og:image" content="${escapeHtml(image.src)}" />
    <meta property="og:image:type" content="${image.type}" />${size}
    <meta property="og:image:alt" content="${escapeHtml(alt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#001b34" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <script>
      location.replace(${JSON.stringify(reader)});
    </script>
    <style>
      body { margin: 0; padding: 24px 16px 40px; background: #001b34; color: #fff;
             font: 17px/1.5 Georgia, serif; text-align: center; }
      main { max-width: 420px; margin: 0 auto; }
      img { display: block; width: 100%; height: auto; border-radius: 10px; }
      .open { display: block; margin: 20px 0 0; padding: 14px 18px; border-radius: 10px;
              background: #c62828; color: #fff; font-weight: bold; text-decoration: none; }
    </style>
  </head>
  <body>
    <main>
      <a href="${reader}"><img src="${escapeHtml(cover)}" alt="${escapeHtml(alt)}" /></a>
      <a class="open" href="${reader}">Watch ${escapeHtml(drama.title)}</a>
    </main>
  </body>
</html>
`;
}

function build(out) {
    if (!out) {
        throw new Error("Give the folder to write into, e.g. _site.");
    }
    const data = JSON.parse(readFileSync(resolve(ROOT, "assets/dg-reels.json"), "utf8"));
    const folder = resolve(out, "r");
    mkdirSync(folder, { recursive: true });
    let written = 0;
    for (const drama of Array.isArray(data?.dramas) ? data.dramas : []) {
        if (!drama?.id || !drama?.title) {
            continue;
        }
        if (!SAFE_ID.test(drama.id)) {
            console.log(`::warning::reel id "${drama.id}" is not a plain slug; it gets no share page`);
            continue;
        }
        const hasCard = existsSync(resolve(ROOT, "assets/images/reels", drama.id, "share.jpg"));
        if (!hasCard) {
            console.log(`::warning::no share card for the reel ${drama.id}; its page names the cover`);
        }
        writeFileSync(resolve(folder, `${drama.id}.html`), page(drama, hasCard));
        written += 1;
    }
    console.log(`Wrote ${written} Daily Grace Reels share page(s) into ${folder}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
    try {
        build(process.argv[2]);
    } catch (error) {
        console.log(`::warning::the Daily Grace Reels share pages were not written: ${error.message}`);
    }
}
