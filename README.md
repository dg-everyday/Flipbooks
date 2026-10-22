# Daily Grace

A daily devotional site: one Bible verse, a short reflection, a poster with
narration, Bible facts, and a weekly flipbook. It is a static site with no build
step — plain HTML, CSS, and ES modules, deployed to GitHub Pages at
[dailygrace.faith](https://dailygrace.faith).

Artwork and audio are served separately from Cloudflare R2 at
`https://dailygrace.faith/media/`. The repository holds only code, data, and the
few images that must work even when the media host does not.

## Pages

**`index.html`** — the homepage:

- **Search** (`hero-toolbar`) accepts a book, chapter, or verse range:
  `Genesis`, `Psalms 119`, `Ephesians 2:8-10,15`. Focusing the field loads the
  SQLite Bible and offers a filtered book list you can pick with the mouse or
  arrow keys. The padlock beside it switches to keyword search: verses that
  contain every word typed, psalm titles included. Holding the field for half
  a second opens the bookmarks popup: bookmarked verses, facts and sayings,
  one kind at a time under a segmented switch.
- **Daily banner** for today's date, with a link to the flipbook.
- **Reflection strip** — today's reflection, clamped to three lines until tapped.
- **`<daily-moment>`** — "Start today's Moment with God": the day's devotional one
  screen at a time (pause, verse, poster and narration, reflection, question,
  prayer, Amen), about five minutes. Follows the day shown on the banner.
- **`<memory-verse>`** — "This Week’s Memory Verse Challenge", just below the
  Moment: one verse a week to learn by heart, a minute a day, each day's
  practice a little harder (read it, phrase by phrase, fill a few, fill half,
  first letters, put it in order, say it). The Moment's Amen screen links to it
  too.
- **`<poster-card>`** — today's poster, playing the day's video in its place
  when there is one; tap it to flip to the comic version, press the red play
  button for narration, or the share button beside it to send the poster or
  comic as a picture (never the video) through the phone's share sheet.
- **`<did-you-know>`** — five random Bible facts, reshuffled by the refresh
  button. Tapping a reference opens that passage in a popup; holding a fact
  bookmarks it.
- **`<bible-sayings>`** — five everyday sayings that come from the Bible. Tap
  one for the whole entry; hold one to bookmark it.
- **`<bible-trivia>`** — a modal quiz that pops up once the page has loaded,
  asking which book a fact came from. Up to three a day, an hour apart.
- **Reflection card**, footer with a QR code that enlarges on click, and a
  thank-you splash that appears once you scroll to the very bottom.

**`apps/pages/flipbook.html`** — the weekly reader. It hosts `<flip-book>` and a
home button; everything else belongs to the component.

## Components

Each is a self-contained custom element with its own shadow DOM and styles,
documented in a header comment at the top of its file.

| Element | File | Notes |
| --- | --- | --- |
| `<bible-search-results>` | `apps/components/bible-search-results.js` | Book header plus a scrolling reader that adds 24 verses per batch, on scroll or via **Load more verses**. `compact` hides the counts for popups. Holding a verse bookmarks it (up to 100 verse docids in `localStorage`); `showBookmarks(rows)` lists them. |
| `<did-you-know>` | `apps/components/did-you-know.js` | Reads the facts from `assets/db/didyouknow.db` through sql.js; a refresh never repeats the previous batch. Emits `verse-request` when a reference is tapped. Holding a fact bookmarks it (up to 50); with the `bookmarks` attribute it lists only those, with no banner. |
| `<bible-sayings>` | `apps/components/bible-sayings.js` | Sayings from `assets/bible-sayings.json`; tapping one pops up the whole entry. Holding a saying bookmarks it (up to 50); `bookmarks` works as on `<did-you-know>`. |
| `<bible-trivia>` | `apps/components/bible-trivia.js` | Modal trivia popup built from one random `did_you_know` row: its `Book` is the answer, two of its `Similar_books` are the decoys. Cannot be dismissed until answered; then it glows green or red, plays a sound and closes on the next tap or after three seconds. |
| `<poster-card>` | `apps/components/poster-card.js` | Poster ↔ comic page-turn animation and per-day narration, resolved from the date. When `images/sources/<YYYY>/<month>/<Month D, YYYY>.mp4` exists it loops muted over the poster while the card is on screen, once the page has loaded (not on the comic side, nor for reduced motion or Save-Data); without it the poster image shows. The share button sends the image on show as a JPEG through the Web Share API, prepared when it loads so the tap can share at once; it falls back to sharing, then copying, the link. The poster is loaded with CORS (`crossorigin="anonymous"`) so the share file is drawn from it rather than downloaded again. |
| `<daily-moment>` | `apps/components/daily-moment.js` | The guided Moment: a 16:9 card playing the day of the week's clip, `assets/images/moment/moment_<day>.mp4` (e.g. `moment_monday.mp4`; first frame `moment_<day>.webp`; it loops only while in view, and not for reduced motion or Save-Data), with its status in a see-through green band, that opens a full-screen walk through the day from its month's file under `assets/verses/`. The Listen screen plays the day's poster video over the poster when there is one, as `<poster-card>` does. A long reflection paragraph is split into screens at sentence ends, and a closing "Let us pray." paragraph moves to the Pray screen. Reaching Amen marks the day done; finished days and the reader's answers stay in `localStorage` on the device. `poster` names the `<poster-card>` whose `share()` the Amen screen uses. |
| `<memory-verse>` | `apps/components/memory-verse.js` | The week's verse (Sunday to Saturday, Asia/Manila): the entry marked `"memory": true` among that week's days in `assets/verses/`, else Sunday's. Seven practices, one step on per day practised (not per calendar day); "I had it" on the last marks it learned and turns the card gold. Days practised and verses learned stay in `localStorage`. `<daily-moment memory-verse="<id>">` adds a button for it on today's Amen screen. |
| `<daily-food-for-thought>` | `apps/components/daily-food-for-thought.js` | Today's serving from the Food for Thought guide, on a parchment card under its banner (`assets/images/food-for-thought-assets/fft-banner.webp`): the topic's section and areas (with their badges), its name, what it guards against, its verse, the serving for today and a question to chew on, and a link to the topic on `apps/pages/food-for-thought.html`. One topic per Asia/Manila day, the same for everyone, in the guide's order, starting again after the last; `show("YYYY-MM-DD")` shows another day's. |
| `<passage-reader>` | `apps/components/passage-reader.js` | A passage in three tabs: the King James Bible (with the words of Jesus in red, from `assets/red-letter.json` as in the search results), the BSB (with its section headings, whose parallel references open as pills) and the Interlinear (each word's Strong's number, transliteration, original, gloss and grammar, right to left for Hebrew). `showPassageReader({ book, range, title })` opens it; `range` is an outline range such as `"1-11"` or `"10:1-22:16"`. Tapping a word in the Interlinear tab turns it faint yellow and opens its Strong's dictionary entry under the verse, as in the explanation popup; both use `apps/components/strongs-entry.js` (the dictionary loader and the entry card). Chapters load as the reader scrolls. Opened by the outline rows on `apps/pages/bible-books.html`. |
| `<flip-book>` | `apps/components/flip-book.js` | The reader: swipe, tap edges, arrow keys, pinch and wheel zoom. One page in portrait, a two-page spread in landscape. |

The hold-to-bookmark gesture, glow and ribbon for facts and sayings live in
`apps/components/card-bookmarks.js`, which also asks the browser to keep the
bookmarks (persistent storage) the first time one is saved. The components
import it with a `?v=` token; bump it in all three imports when it changes.
The homepage's bookmarks popup (`#bookmarks-dialog`) holds a compact
`<bible-search-results>` and a `bookmarks` copy of the other two.

The media host is set once, as `media_base_url` in
`apps/settings/appsettings.json`. `apps/settings/settings.js` loads it and
exports `MEDIA_BASE_URL`; every component and page script that builds a media
URL defaults to it, and still takes a `media-base` attribute to override it. To
test against a local media server, change `media_base_url` (for example to
`http://localhost:9001/media/`). The data files do not repeat the host: a media
file in `assets/stories.json` and `assets/stories/*.json` is written
`media:<path>`, and `resolveMedia()` in `settings.js` expands it at runtime.
`assets/scripts/check-assets.mjs` still reads the host from the
`MEDIA_BASE_URL` line in `assets/scripts/script.js`, so keep that line in step,
and the `og:image` tags stay full URLs because crawlers do not run scripts.

Germania One, Strait, and Roboto are registered on the *document* by
`assets/scripts/fonts.js`, because browsers do not reliably load `@font-face`
declared inside a shadow root.

Roboto comes in two files: `Roboto-Variable-Latin.woff2` (52 KB, the Latin
alphabet and punctuation, preloaded by `index.html`) and the full
`Roboto-Variable.woff2` (139 KB), which a browser fetches only for a letter
outside the subset that Roboto has, such as Greek or Cyrillic. Both
`@font-face` pairs (`assets/styles/styles.css` and `fonts.js`) carry the same
`unicode-range`s. Rebuild the subset, in `assets/fonts/`, with:

```sh
pyftsubset Roboto-Variable.woff2 --layout-features='*' --flavor=woff2 \
  --output-file=Roboto-Variable-Latin.woff2 \
  --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
```

On the homepage the extras wait for the page to finish loading, so the banner
and the poster have the connection to themselves: the banner and poster
videos, the banners a swipe away, the swipe hint and the sticker check. The
Guiding Question, Jesus' Spoken Words and God's Blueprint cards, like Did You
Know? and Bible Sayings, fetch their files only as they near the screen.
`banner-slider` and `poster-card` hold their space in `styles.css` until their
scripts run (`:not(:defined)`), so keep those sizes in step with the
components.

## Scripts

- **`assets/scripts/script.js`** — homepage wiring: banner URL, search form and
  book suggestions, reflection toggle, QR / verse / splash dialogs and their
  open-close animations.
- **`assets/scripts/sql_script.js`** — loads sql.js (1.14.2, from cdnjs) and the
  Bible database, and exposes `initDatabase()`, `parseBibleReference()`,
  `getVerses()`, `getVersesByIds()`, `searchVersesByKeywords()` and
  `getBooks()`. Verse text comes back cleaned: the psalm titles and Psalm 119
  letters the database appends to verses are taken off, and names split at a
  line break are rejoined. The database is fetched lazily, the first
  time the search field is focused, not on page load.
- **`assets/scripts/sqlite-db.js`** — shared sql.js access for the components:
  `getSqlJs()`, `openDatabase()` and `query()`. It reuses `sql_script.js`'s
  instance so the wasm runtime starts once for both databases.
- **`assets/scripts/update-social-image.mjs`** — build-time only; see
  [Deployment](#deployment).

## Data

| File | Contents |
| --- | --- |
| `assets/db/dailygrace.db` | The complete KJV: 66 books, 1,189 chapters, 31,102 verses (4.7 MB). Tables: `books(book_number, book_id, book_name)` and `verses(docid, book, chapter, verse, text)`, joined on `verses.book = books.book_id`. |
| `assets/annotations/<book_id>/<chapter>.json` | Per verse, keyed by verse number: an `explanation` (a commentary note from Jamieson-Fausset-Brown, or John Gill where JFB is silent), `translations.bsb` (the Berean Standard Bible text, with its section headings and the psalm heading on verse 1) and `interlinear` (the KJV words with their Strong's numbers, not shown at the moment). The Strong's dictionary is in `assets/strongs/`, 100 entries to a file, for the word a reader taps in the explanation popup's interlinear. Kept out of `dailygrace.db` so the search download stays small; `<bible-search-results>` fetches one chapter when a verse's folded corner is tapped. Rebuild with `tools/annotations/`. |
| `assets/interlinear/<book_id>/<chapter>.json` | Every verse word by word in the Hebrew (Old Testament, read right to left; its Aramaic passages, in Daniel, Ezra and Jeremiah 10:11, marked `"arc"`) or the Greek the KJV translators used (Scrivener 1894): `{"lang": "he" \| "grc", "verses": {"1": [[original, transliteration, gloss, strongs, grammar], …]}}`, numbered as in the KJV, with a psalm's title as verse `"0"`. From STEPBible.org (CC BY 4.0, credited in the reader). 1,189 files, 26 MB; read by `<passage-reader>` and by the explanation popup of `<bible-search-results>` (its `interlinear-base`). Rebuild with `tools/interlinear/`. |
| `assets/verses/<YYYY>/<month>.json` | Daily verse, text, reflection, `question` and `prayer`, one file per month (`assets/verses/2027/january.json`), each entry keyed by date string (`"January 1, 2027"`). The question and prayer are for the Moment's Respond and Pray screens; a day without them gets a general one. Also supplies the verse shown on not-yet-released flipbook pages. `apps/components/daily-verses.js` loads them, fetching each month once per page; import it with the same `?v=` token everywhere (`banner-slider.js`, `daily-moment.js`, `memory-verse.js`, `apps/pages/scripts/daily-grace-week.js`). |
| `assets/db/didyouknow.db` | 1,021 Bible facts in one table, `did_you_know(id, Title, Fact, Reference_verse, Book, Similar_books)`. `Reference_verse` must parse and exist in `dailygrace.db`, since tapping it opens the passage. `Similar_books` holds four books that are never the row's own `Book`; `<bible-trivia>` draws two of them as wrong answers. Add rows with `tools/didyouknow/add_rows.py`. |
| `assets/did-you-know.json` | The original 501 facts, superseded by `didyouknow.db` and no longer read by anything. |
| `assets/book-metadata.json` | Fallback `title` / `description` for all 66 books — see below. |
| `assets/food-for-thought.json` | The Food for Thought guide: 81 topics in seven sections, each tagged Mind, Body and/or Spirit, with its verse (exact KJV text), what it guards against, how it feeds you, a serving for today, signs of hunger, a question and links to related entries in other guides. Built and verse-checked by `tools/food-for-thought/build_food_for_thought.py`; read by `apps/pages/food-for-thought.html` and `<daily-food-for-thought>`. |
| `assets/guide-info.json` | The "About this guide" popup of each study guide (the ⓘ beside the funnel), keyed by page file (`bible-books.html`): `title`, `summary`, `inside`, `use` and `why` (lists of paragraphs or steps) and a KJV `verse` (`ref`, `text`, word for word as in `dailygrace.db`). Fetched on the first tap by `guideInfoButton()` in `apps/pages/scripts/study-utils.js`. Update it when a guide gains or loses a feature. |

Book symbols load from `<media-base>images/symbols/<Book name>-symbol.svg`. The
book overview in search results is read from that SVG's `title#title` and
`desc#description`; the third em-dash-separated segment of the title is the
Hebrew name. When that fetch fails, or the media host allows `<img>` but blocks
cross-origin `fetch`, `assets/book-metadata.json` supplies the same text.
Regenerate that snapshot whenever the source SVG titles or descriptions change.

## Media layout

Everything below lives on R2 under `https://dailygrace.faith/media/`, with
filename case and spaces preserved:

```
banner/<YYYY>/<month>/daily-grace-<YYYY>-<MM>-<DD>.webp      daily social/hero banner
images/sources/<YYYY>/<month>/<Month D, YYYY>.webp           daily poster
images/sources/<YYYY>/<month>/<Month D, YYYY> - Comic.webp
images/symbols/<Book name>-symbol.svg                        66 book symbols
images/thumbnails/<Book name>_square.webp                    66 book tiles, for the trivia
images/coverpages/<YYYY>/<YYYY>-WEEK<n>.webp                 flipbook cover, per week
images/coverpages/<YYYY>/<YYYY>-404.webp                     cover fallback
audio/<YYYY>/<Month>/webm/<Month D, YYYY>.webm               narration
```

The gold frame inside each thumbnail is not the same size or quite in the same
place from one file to the next, and a few carry a shadow, a halo or a stray
checkerboard around it. `apps/components/book-thumb-bounds.js` holds the
measured bounds of each frame so the trivia can draw all three tiles alike;
regenerate it with `python tools/thumbnails/measure_bounds.py` whenever the
thumbnails change.

The flipbook builds the current week Sunday through Saturday, requesting the
poster and comic for each day; files that are missing are simply skipped. A page
whose date has not arrived yet is covered with a "will be available in"
placeholder carrying that day's verse.

Decorative assets stay local, so the reader still looks right if R2 is
unreachable: `end-paper.svg`, `specialty-paper.svg`, `wire-binding.svg`,
`dg-icon-02-flat-256.webp` (the placeholder logo) and `audio/page_flip.webm` (the
page-turn sound), all under `assets/`.

## Local development

Serve the folder over HTTP — `file://` will not work, because the database and
JSON are loaded with `fetch`:

```sh
python -m http.server 8000     # then open http://localhost:8000
```

Media comes from the production host, so there is nothing else to run. The
`og:image` tag stays at whatever date it was last built with; run
`node assets/scripts/update-social-image.mjs` to refresh it locally.

Stylesheets and scripts are cache-busted with a `?v=YYYYMMDD-N` query string in
the two HTML files. Bump the version of any file you change, resetting `N` to 1
on a new date, or returning visitors will keep the cached copy.

## Testing

Browser tests use [Playwright](https://playwright.dev). It is a development
tool only: `package.json`, `node_modules/` and `tests/` are not part of the
published site (the deploy copies only `index.html`, `CNAME`, `favicon.ico`,
`assets/` and `apps/`).

```sh
npm install                              # once, after cloning
npx playwright install chromium webkit   # once: the test browsers
npm test                                 # run every test
npm run test:ui                          # watch them run in a window
npx playwright show-report               # the last run's report
```

The tests start their own copy of the site with `tests/serve.mjs` (also
`npm run serve`, at http://localhost:4173) and run each one on five screens,
in Manila time: an iPad (gen 7) and an Android tablet (Galaxy Tab S4), both
held upright, which is the recommended way to play Daily Grace Kids; desktop
Chrome; an Android phone (Pixel 7); and an iPhone (iPhone 15, WebKit). `tests/smoke.spec.mjs` checks that the main pages open without
script errors; new tests go in `tests/` as `*.spec.mjs`.

## Deployment

`.github/workflows/pages.yml` publishes to GitHub Pages on every push to `main`,
manually, and daily at 00:07 Philippine time (GitHub can delay scheduled runs,
so midnight is not guaranteed). It runs `update-social-image.mjs`, which rewrites
the `og:image` meta tag in both HTML files to today's banner URL in
`Asia/Manila`, then copies `index.html`, `CNAME`, `favicon.ico`, `assets/`, and
`apps/` into the artifact. The rewritten HTML is deployed, never committed back.
The JSON is pretty-printed in the repository for reading and diffs; the deploy
compacts every `.json` file in the published copy, so visitors download the
smaller form. A file that does not parse ships as it is, with a warning in the
run's log. In the same way the JS and CSS stay readable in the repository and
are minified in the published copy with esbuild, file by file and without
bundling, so every file and import keeps its place. A file esbuild cannot read
ships as it is, with a warning; if esbuild cannot be installed, that step fails
on its own and the site ships unminified.

One-time setup: **Settings → Pages → Build and deployment → GitHub Actions**, and
keep the custom domain set to `dailygrace.faith`. Social platforms cache previews
they have already fetched, so a new banner may not appear in a shared link
immediately.

Changing media URLs in this repository does not upload anything to R2 or change
Cloudflare routing; those are managed separately.
