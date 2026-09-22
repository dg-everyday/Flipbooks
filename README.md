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
  arrow keys.
- **Daily banner** for today's date, with a link to the flipbook.
- **Reflection strip** — today's reflection, clamped to three lines until tapped.
- **`<poster-card>`** — today's poster; tap it to flip to the comic version, or
  press the red button for narration.
- **`<did-you-know>`** — five random Bible facts, reshuffled by the refresh
  button. Tapping a reference opens that passage in a popup.
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
| `<bible-search-results>` | `apps/components/bible-search-results.js` | Book header plus a scrolling reader that adds 24 verses per batch, on scroll or via **Load more verses**. `compact` hides the counts for popups. |
| `<did-you-know>` | `apps/components/did-you-know.js` | Reads the facts from `assets/db/didyouknow.db` through sql.js; a refresh never repeats the previous batch. Emits `verse-request` when a reference is tapped. |
| `<bible-trivia>` | `apps/components/bible-trivia.js` | Modal trivia popup built from one random `did_you_know` row: its `Book` is the answer, two of its `Similar_books` are the decoys. Cannot be dismissed until answered; then it glows green or red, plays a sound and closes on the next tap or after three seconds. |
| `<poster-card>` | `apps/components/poster-card.js` | Poster ↔ comic page-turn animation and per-day narration, resolved from the date. |
| `<flip-book>` | `apps/components/flip-book.js` | The reader: swipe, tap edges, arrow keys, pinch and wheel zoom. One page in portrait, a two-page spread in landscape. |

Components take a `media-base` attribute; `assets/scripts/script.js` passes the
production host to each one on the homepage. Their built-in default is
`http://localhost:9001/media/` (`<flip-book>` defaults to production instead).

Germania One, Strait, and Roboto are registered on the *document* by
`assets/scripts/fonts.js`, because browsers do not reliably load `@font-face`
declared inside a shadow root.

## Scripts

- **`assets/scripts/script.js`** — homepage wiring: banner URL, search form and
  book suggestions, reflection toggle, QR / verse / splash dialogs and their
  open-close animations.
- **`assets/scripts/sql_script.js`** — loads sql.js (1.14.2, from cdnjs) and the
  Bible database, and exposes `initDatabase()`, `parseBibleReference()`,
  `getVerses()`, and `getBooks()`. The database is fetched lazily, the first
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
| `assets/verses.json` | Daily verse, text, and reflection, keyed by date string (`"September 1, 2026"`). Also supplies the verse shown on not-yet-released flipbook pages. |
| `assets/db/didyouknow.db` | 1,021 Bible facts in one table, `did_you_know(id, Title, Fact, Reference_verse, Book, Similar_books)`. `Reference_verse` must parse and exist in `dailygrace.db`, since tapping it opens the passage. `Similar_books` holds four books that are never the row's own `Book`; `<bible-trivia>` draws two of them as wrong answers. Add rows with `tools/didyouknow/add_rows.py`. |
| `assets/did-you-know.json` | The original 501 facts, superseded by `didyouknow.db` and no longer read by anything. |
| `assets/book-metadata.json` | Fallback `title` / `description` for all 66 books — see below. |

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
banner/<month>/daily-grace-<YYYY>-<MM>-<DD>.webp   daily social/hero banner
images/sources/<month>/<Month D, YYYY>.webp        daily poster
images/sources/<month>/<Month D, YYYY> - Comic.webp
images/symbols/<Book name>-symbol.svg              66 book symbols
images/thumbnails/<Book name>_square.webp          66 book tiles, for the trivia
images/coverpages/<YYYY>/<YYYY>-WEEK<n>.webp       flipbook cover, per week
images/coverpages/<YYYY>/<YYYY>-404.webp           cover fallback
audio/<YYYY>/<Month>/webm/<Month D, YYYY>.webm     narration
```

The flipbook builds the current week Sunday through Saturday, requesting the
poster and comic for each day; files that are missing are simply skipped. A page
whose date has not arrived yet is covered with a "will be available in"
placeholder carrying that day's verse.

Decorative assets stay local, so the reader still looks right if R2 is
unreachable: `end-paper.svg`, `specialty-paper.svg`, `wire-binding.svg`,
`dg-icon-02-flat.webp` (the placeholder logo) and `audio/page_flip.webm` (the
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

## Deployment

`.github/workflows/pages.yml` publishes to GitHub Pages on every push to `main`,
manually, and daily at 00:07 Philippine time (GitHub can delay scheduled runs,
so midnight is not guaranteed). It runs `update-social-image.mjs`, which rewrites
the `og:image` meta tag in both HTML files to today's banner URL in
`Asia/Manila`, then copies `index.html`, `CNAME`, `favicon.ico`, `assets/`, and
`apps/` into the artifact. The rewritten HTML is deployed, never committed back.

One-time setup: **Settings → Pages → Build and deployment → GitHub Actions**, and
keep the custom domain set to `dailygrace.faith`. Social platforms cache previews
they have already fetched, so a new banner may not appear in a shared link
immediately.

Changing media URLs in this repository does not upload anything to R2 or change
Cloudflare routing; those are managed separately.
