// A page for each story on the home page's Stories row, written into the copy
// of the site being published, so a shared story shows its own cover. Crawlers
// such as Messenger's do not run scripts, so stories.html?story=… always
// previews with the reader's own picture. A page of its own, /s/<id>.html,
// carries the story's cover, title and description in its meta tags, and sends
// a reader on to the story's flipbook by script at once. It forwards by script
// only: crawlers follow a <meta http-equiv="refresh"> and would then preview the
// reader instead. It asks search engines not to index it.
// The share pill on each cover (story-carousel.js) sends this address.
//
//   SHARP=<path to sharp> node assets/scripts/build-story-pages.mjs _site --cache <dir>   on deploy
//   node assets/scripts/build-story-pages.mjs <dir> --offline                              for tests
//
// The stories are those in assets/stories.json.
//
// The preview picture. The covers are tall (1440 x 2560), and Messenger shows
// no picture for tall ones. So each story gets a card made for link previews,
// /s/<id>.jpg: 1200 x 630 JPEG, the cover whole in the middle on a dimmed,
// blurred spread of itself, as the Flipbook's week pages have
// (build-week-pages.mjs). The cards are made with sharp (the SHARP variable,
// else an installed "sharp") and kept in the --cache folder, named for the story
// and the cover's ETag, so a deploy makes only the new ones, and a cover
// replaced on the host gets a new card. Without sharp, or when a card cannot be
// made, that story's page names the cover itself. --offline skips the media
// host altogether, and so the cards.
//
// The pages and cards are never committed; only the published copy has them.
// Nothing here may stop the day's devotional from going out: a failure is a
// warning.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const SITE = "https://dailygrace.faith";
const MEDIA = `${SITE}/media/`;
const LOOKUP_TIMEOUT = 8000; // ms for each cover's first bytes
const DOWNLOAD_TIMEOUT = 60_000; // ms for a whole cover
const CARD = { width: 1200, height: 630, inset: 24, quality: 82 };
const CARDS_AT_ONCE = 3;
// A story id becomes a file name and a URL; anything else is skipped.
const SAFE_ID = /^[a-z0-9][a-z0-9-]*$/;

const args = process.argv.slice(2);
const valueOf = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : null);
const out = args.find((arg, i) => !arg.startsWith("--") && args[i - 1] !== "--cache");
const cacheDir = valueOf("--cache");
const offline = args.includes("--offline");

const escapeHtml = (text) =>
    String(text ?? "").replace(
        /[&<>"']/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );

/** "media:stories/x/00.webp" as a full address on the media host (settings.js resolveMedia). */
function resolveMedia(value) {
    if (typeof value === "string" && value.startsWith("media:")) {
        return `${MEDIA}${value.slice("media:".length)}`;
    }
    return value;
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

/** The cover at `src`, with its size and ETag when the host tells them. */
async function coverFor(src) {
    if (offline) {
        return { src, size: null, etag: null };
    }
    try {
        const response = await fetch(src, {
            headers: { Range: "bytes=0-63" },
            signal: AbortSignal.timeout(LOOKUP_TIMEOUT),
        });
        if (!response.ok) {
            if (response.status === 404) {
                console.log(`::warning::story cover missing on the media host: ${src}`);
            }
            return { src, size: null, etag: null };
        }
        return {
            src,
            size: webpSize(Buffer.from(await response.arrayBuffer())),
            etag: response.headers.get("etag"),
        };
    } catch {
        return { src, size: null, etag: null };
    }
}

/** sharp, or null when it is not to be had: the pages then name the covers. */
async function loadSharp() {
    if (offline) {
        return null;
    }
    try {
        const where = process.env.SHARP ? pathToFileURL(resolve(process.env.SHARP, "lib/index.js")).href : "sharp";
        const module = await import(where);
        return module.default ?? module;
    } catch (error) {
        console.log(`::warning::sharp not found (${error.message.split("\n")[0]}); story pages preview with the covers`);
        return null;
    }
}

/** The preview card for `cover`, as JPEG bytes. */
async function makeCard(sharp, cover) {
    const response = await fetch(cover.src, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT) });
    if (!response.ok) {
        throw new Error(`${cover.src}: ${response.status}`);
    }
    const original = Buffer.from(await response.arrayBuffer());
    const height = CARD.height - 2 * CARD.inset;
    const front = await sharp(original).resize({ height }).toBuffer();
    const { width } = await sharp(front).metadata();
    const back = await sharp(original)
        .resize(CARD.width, CARD.height, { fit: "cover" })
        .blur(24)
        .modulate({ brightness: 0.55 })
        .toBuffer();
    return sharp(back)
        .composite([{ input: front, left: Math.round((CARD.width - width) / 2), top: CARD.inset }])
        .jpeg({ quality: CARD.quality, mozjpeg: true })
        .toBuffer();
}

/** A name for the story's card in the cache: its id and the cover's ETag. */
function cacheName(id, cover) {
    const tag = (cover.etag ?? "").replace(/[^A-Za-z0-9]/g, "").slice(-24);
    return `story-${id}-${tag || "untagged"}.jpg`;
}

/** Writes the story's card into `folder`: "made", "kept" (from the cache) or null. */
async function writeCard(sharp, id, cover, folder) {
    const target = resolve(folder, `${id}.jpg`);
    const cached = cacheDir && cover.etag ? resolve(cacheDir, cacheName(id, cover)) : null;
    try {
        if (cached && existsSync(cached)) {
            copyFileSync(cached, target);
            return "kept";
        }
        const card = await makeCard(sharp, cover);
        writeFileSync(target, card);
        if (cached) {
            writeFileSync(cached, card);
        }
        return "made";
    } catch (error) {
        console.log(`::warning::no preview card for the story ${id}: ${error.message}`);
        return null;
    }
}

function page(story, cover, hasCard) {
    const url = `${SITE}/s/${story.id}.html`;
    const reader = `/apps/pages/stories.html?story=${story.id}`;
    const title = `${story.title} - a Bible story from Daily Grace`;
    const description =
        story.description || "A story from Scripture, retold to read, listen to and share, from Daily Grace.";
    const alt = `The cover of ${story.title}`;
    // The card where there is one, else the cover with its size when known.
    const image = hasCard
        ? { src: `${SITE}/s/${story.id}.jpg`, type: "image/jpeg", size: { width: CARD.width, height: CARD.height } }
        : { src: cover.src, type: "image/webp", size: cover.size };
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
      .cover { display: block; }
      .open { display: block; margin: 20px 0 0; padding: 14px 18px; border-radius: 10px;
              background: #c62828; color: #fff; font-weight: bold; text-decoration: none; }
    </style>
  </head>
  <body>
    <main>
      <a class="cover" href="${reader}">
        <img src="${escapeHtml(cover.src)}" alt="${escapeHtml(alt)}" />
      </a>
      <a class="open" href="${reader}">Read ${escapeHtml(story.title)}</a>
    </main>
  </body>
</html>
`;
}

async function build() {
    if (!out) {
        throw new Error("Give the folder to write into, e.g. _site.");
    }
    const list = JSON.parse(readFileSync(resolve(ROOT, "assets/stories.json"), "utf8"));
    const stories = [];
    for (const story of Array.isArray(list) ? list : []) {
        if (!story?.id || !story?.cover_page) {
            continue;
        }
        if (!SAFE_ID.test(story.id)) {
            console.log(`::warning::story id "${story.id}" is not a plain slug; it gets no share page`);
            continue;
        }
        stories.push(story);
    }
    const covers = await Promise.all(stories.map((story) => coverFor(resolveMedia(story.cover_page))));

    const folder = resolve(out, "s");
    mkdirSync(folder, { recursive: true });
    if (cacheDir) {
        mkdirSync(cacheDir, { recursive: true });
    }

    // The cards, a few at a time.
    const cards = new Array(stories.length).fill(null);
    const sharp = await loadSharp();
    if (sharp) {
        let next = 0;
        const worker = async () => {
            while (next < stories.length) {
                const i = next++;
                cards[i] = await writeCard(sharp, stories[i].id, covers[i], folder);
            }
        };
        await Promise.all(Array.from({ length: CARDS_AT_ONCE }, worker));
    }

    stories.forEach((story, i) => {
        writeFileSync(resolve(folder, `${story.id}.html`), page(story, covers[i], Boolean(cards[i])));
    });
    const made = cards.filter((card) => card === "made").length;
    const kept = cards.filter((card) => card === "kept").length;
    console.log(
        `Wrote ${stories.length} story pages into ${out}/s/; ` +
            `preview cards: ${made} made, ${kept} from the cache, ${stories.length - made - kept} without`,
    );
}

try {
    await build();
} catch (error) {
    // The day's devotional goes out regardless; shared stories preview with the reader's picture.
    console.log(`::warning::story pages not written: ${error.message}`);
}
