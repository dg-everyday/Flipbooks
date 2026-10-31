# Daily Grace

A daily devotional site: one Bible verse, a short reflection, a poster with
narration, a guided Moment with God, a weekly memory verse, daily cards from the
study guides, Bible facts and sayings, stories, stickers, a weekly flipbook,
fifteen Bible study guides and Daily Grace Kids. It is a static site with no
build step — plain HTML, CSS, and ES modules, deployed to GitHub Pages at
[dailygrace.faith](https://dailygrace.faith). All Scripture is quoted from the
King James Version.

Artwork and audio are served separately from Cloudflare R2 at
`https://dailygrace.faith/media/`. The repository holds only code, data, and the
few images that must work even when the media host does not.

Nothing a reader does leaves their device: bookmarks, notes, answers, progress,
stickers and the kids' records are all kept in `localStorage` (see
[What is kept on the device](#what-is-kept-on-the-device)).

## Pages

### `index.html` — the homepage

From the top:

- **Top bar.** The three lines open `<study-guide-menu>`: the Bible Study
  Guides, Help and About. The DG emblem (replaced by the reader's avatar once
  chosen) opens `<dg-menu>`: Change my avatar, My Bookmarks, My Sticker Album,
  Bookmarking 101 and How to earn stickers.
- **Search** (`hero-toolbar`) accepts a book, chapter, or verse range:
  `Genesis`, `Psalms 119`, `Ephesians 2:8-10,15`. Focusing the field loads the
  SQLite Bible and offers a filtered book list you can pick with the mouse or
  arrow keys. The padlock beside it switches to keyword search: verses that
  contain every word typed, psalm titles included. Results open in
  `<bible-search-results>`.
- **`<banner-slider>`** — today's banner (or its video), swipeable back
  through the past week, with the day's flipbook button and the reflection
  strip under it (clamped to three lines until tapped). While it shows an
  earlier day, a link under it opens the Grace Library.
- **`<poster-card>`** — today's poster, playing the day's video in its place
  when there is one; tap it to flip to the comic version, press the red play
  button for narration, or the share button beside it to send the poster or
  comic as a picture (never the video) through the phone's share sheet.
- **`<daily-moment>`** — "Start today's Moment with God": the day's devotional
  one screen at a time (pause, verse, poster and narration, reflection,
  question, prayer, Amen), about five minutes. Follows the day shown on the
  banner.
- **`<memory-verse>`** — "This Week’s Memory Verse Challenge": one verse a week
  to learn by heart, a minute a day, each day's practice a little harder. The
  Moment's Amen screen links to it too.
- **`<daily-food-for-thought>`**, **`<daily-guidance>`** ("Today's Guiding
  Question"), **`<red-letter-quotes>`** ("Jesus' Spoken Words") and
  **`<gods-blueprint>`** ("Following Today's God Blueprint") — one entry a day
  from four of the study guides, the same for everyone, each linking to the
  full entry on its page. All but Food for Thought can be held to bookmark
  them, and offer the entry as a PDF.
- **`<did-you-know>`** and **`<bible-sayings>`** — five Bible facts and five
  everyday sayings that come from the Bible, reshuffled by the refresh button,
  with a pull tab for more. Hold one to bookmark it.
- **`<story-carousel>`** — a looping row of story covers; the folded corner of
  a cover opens the story in `apps/pages/stories.html`.
- **`<sticker-gifts>`** — the My Sticker Album card; it also hands out new
  stickers as they are earned.
- **`<kids-card>`** — the way into Daily Grace Kids: its banner video and
  "Let's go".
- **`<site-footer>`** with a QR code that enlarges on click, and
  **`<sponsor-splash>`**, a thank-you that appears once you scroll to the very
  bottom.

And in popups: **`<avatar-picker>`** (a reader without an avatar must choose
one, and gets no trivia until they have), **`<bookmark-manager>`** (My
Bookmarks), **`<verse-popup>`** (the passage a Bible reference opens) and
**`<bible-trivia>`**, a quiz that pops up once the page has loaded, asking which
book a fact came from: up to three a day, an hour apart.

### The study guides

Fifteen guides, each an HTML page in `apps/pages/` with its script in
`apps/pages/scripts/` and its look in `assets/styles/<name>-page.css`. They
share `apps/pages/scripts/study-utils.js` (fetching, the filter menu, the row
that opens under a tile, following the URL's hash) and the "About this guide"
popup (ⓘ beside the funnel), whose text is in `assets/guide-info.json`. Bible
references are pills that open the passage (`apps/components/scripture-refs.js`).

| Page | Data |
| --- | --- |
| `bible-books.html` — Books of the Bible, with outlines read in `<passage-reader>` | `assets/bible-books.json` |
| `bible-characters.html` — Bible Characters | `assets/bible-characters.json` |
| `red-lettered-quotes.html` — Red-Lettered Quotes | `assets/red-letter-quotes.json`, `assets/red-letter.json` |
| `peoples.html` — Peoples of the Bible, on a map (script `people.js`) | `assets/peoples/*.json` |
| `bible-prayers.html` — Prayers in the Bible | `assets/bible-prayers.json` |
| `poems-songs-and-wisdom.html` — Poems, Songs and Wisdom (`songs-in-the-bible.html` redirects here) | `assets/poems-songs-and-wisdom.json` |
| `heroes-and-villains.html` — Heroes and Villains | `assets/heroes-and-villains.json` |
| `flora-and-fauna.html` — Flora and Fauna | `assets/flora-and-fauna.json` |
| `did-you-know.html` — Did You Know, book by book | `assets/db/didyouknow.db` |
| `bible-sayings.html` — Bible Sayings | `assets/bible-sayings.json` |
| `supernaturals.html` — Supernaturals and Prophecies | `assets/supernaturals.json` |
| `commandments-of-god.html` — Commandments of God | `assets/commandments-of-god.json` |
| `guidance-for-life.html` — Questions We All Ask | `assets/guidance-for-life.json` |
| `following-gods-blueprint.html` — Following God's Blueprint | `assets/following-gods-blueprint.json` |
| `food-for-thought.html` — Food for Thought | `assets/food-for-thought.json` |

The guides whose entries can be bookmarked (Did You Know, Bible Sayings,
Red-Lettered Quotes, Questions We All Ask and Following God's Blueprint) share
their bookmarks with the homepage's cards.

### Other pages

- **`apps/pages/flipbook.html`** — the weekly reader. It hosts `<flip-book>`,
  a home button and a link to the Grace Library at the week's month;
  `apps/pages/scripts/daily-grace-week.js` builds the week.
- **`apps/pages/library.html`** — the Grace Library, in the menu just before Daily Grace Kids: every
  complete Daily Grace day from September 11, 2026 (the first day with
  poster, comic, narration, banner and title) up to today, as poster tiles.
  Months (each folded to its three newest days, with the home page's pull
  tab for the rest, and the chevrons turned up to fold it again; a calendar
  on wide screens), Books (the 66, those with days to
  open) and My days (Moments prayed and answers written, from
  `dailygrace:moment:*`); a search by theme, word or reference; and This week,
  the days to catch up on. A day opens in a sheet: its `<poster-card>`, the
  verse, reflection, the reader's answer or the question, the prayer, its
  `<daily-moment>` and that week's Flipbook, with the day before and after a
  tap, swipe or arrow key away. A day opened from another Daily Grace page
  closes back to that page. `#day/2026-10-01` opens a day (Back closes
  it); `#books`, `#book/Psalms`, `#mine` and `#month/2026-10` pick the view.
  Script `apps/pages/scripts/library.js`, look `assets/styles/library-page.css`,
  data from `assets/scripts/library-index.js` (see [Data](#data)). Only
  today's Moment counts toward stickers, so a catch-up is marked done but
  earns none.
- **`apps/pages/stories.html`** — the story reader: a story as a flipbook, with
  its KJV pills (`story-kjv.js`). `?story=<id>` picks the story and `?set=kids`
  the kids' retellings. Reading one to the last page counts toward a sticker.
- **`apps/pages/stickers.html`** — My Sticker Album.
- **`apps/pages/mission-statement.html`** — the mission statement, linked from
  the footer.
- **`apps/pages/daily-grace-kids.html`** — the Daily Grace Kids hub: the
  `<kids-card>` into the kids app, then two shelves of stories,
  `<young-kids-stories>` ("Kids Stories for Rugrats", a notebook that turns
  upward) and `<kids-stories>` ("Kids Stories for Rascals", which open in
  `stories.html?set=kids`).

### `apps/pages/kids.html` — Daily Grace Kids

For children aged 3 to 12 (Little Lambs 3–5, Young Lions 6–8, Explorers 9–12),
made for a tablet held upright. Up to four children per device, each with a
picture, a Growing Tree (a leaf per story, a fruit per verse, a flower per Talk
Together, a bird per finished part of the map), Nari the lion cub who grows
with the stories, and a shelf of stickers. The Journey Map leads to eight story
stops of five steps each: Watch & Listen, Look & Find, Play (Story in Order,
then Who Said It?, Gather & Count, Colour It In and Right or Not?), My Verse
(KJV) and Talk Together. Explorers get their own: a Field Journal for a home, a
Story Stop that reads the story's flipbook (Read, Investigate, Play, My Verse,
Think & Talk), side trails on the map, a Field Guide of the people, places and
creatures met on the trail, and ranks. Games has Two by Two and colouring (and
Map Quest and the Bible Book Train for Explorers). The Grown-ups' Corner, behind
a gate (hold for three seconds, then type a number written in words), holds the
children, a daily time limit, seven settings, printables (verse cards,
certificates, colouring pages) and the privacy note. "‹ Daily Grace Kids" at
the top of the welcome and Who's exploring? screens, and a button in the
Corner, lead back to the Daily Grace home page. Everything is kept in
`localStorage` (`dailygrace:kids:*`) on the device. The page is hash-routed,
so Back and bookmarks work:

| File | Role |
| --- | --- |
| `apps/pages/scripts/kids.js` | The shell and routes (time limit and "no child yet" guards), welcome, Who's exploring?, home, map, stickers, games, rest |
| `apps/pages/scripts/kids-stop.js` | A story stop's five steps and the reward screen |
| `apps/pages/scripts/kids-explore.js` | The Explorers' Story Stop and its reward |
| `apps/pages/scripts/kids-journal.js` | The Explorers' Field Journal, map, Field Guide and games |
| `apps/pages/scripts/kids-corner.js` | The Grown-ups' Corner, the child form, printables |
| `apps/pages/scripts/kids-ui.js` | Shared pieces: icons, the tree, Nari's picture, the gate, the ask dialog, toasts |
| `assets/scripts/kids/store.js` | Everything kept on the device, checked and cleaned on every read; falls back to memory when storage is blocked or full |
| `assets/scripts/kids/rules.js` | Pure functions: what a child has (counted from their record, so nothing counts twice), Nari's and the tree's stage, the map lock, which stickers are due |
| `assets/scripts/kids/audio.js` | One voice line at a time, overlapping sound effects; nothing waits on a sound that can't play |
| `assets/styles/kids-page.css` | The page's look, with self-hosted Baloo 2, Nunito and Andika (`assets/fonts/`, OFL) |

## Components

Each is a self-contained custom element with its own shadow DOM and styles,
documented in a header comment at the top of its file in `apps/components/`.

### On the homepage

| Element | File | Notes |
| --- | --- | --- |
| `<banner-slider>` | `banner-slider.js` | Today's banner, swipeable back through the past week, with the flipbook button and the reflection strip. The day's video plays over the banner while it is on screen and the tab is showing (not for reduced motion or Save-Data); tapping the banner opens the day's verse. Moves on at midnight in Manila. |
| `<poster-card>` | `poster-card.js` | Poster ↔ comic page-turn animation and per-day narration, resolved from the date. The turn waits until the other side has loaded (fetched with CORS, like the poster itself, so the two share a download), with a ring on the poster if that takes a moment, so it never stops edge-on or swings back on the old side. When `images/sources/<YYYY>/<month>/<Month D, YYYY>.mp4` exists it loops muted over the poster while the card is on screen, once the page has loaded (not on the comic side, nor for reduced motion or Save-Data); without it the poster image shows. The share button sends the image on show as a JPEG through the Web Share API, prepared when it loads so the tap can share at once; it falls back to sharing, then copying, the link. The poster is loaded with CORS (`crossorigin="anonymous"`) so the share file is drawn from it rather than downloaded again. |
| `<daily-moment>` | `daily-moment.js` | The guided Moment: a 16:9 card playing the day of the week's clip, `assets/images/moment/moment_<day>.mp4` (e.g. `moment_monday.mp4`; first frame `moment_<day>.webp`; it loops only while in view, and not for reduced motion or Save-Data), with its status in a see-through green band, that opens a full-screen walk through the day from its month's file under `assets/verses/`. The Listen screen plays the day's poster video over the poster when there is one, as `<poster-card>` does. A long reflection paragraph is split into screens at sentence ends, and a closing "Let us pray." paragraph moves to the Pray screen. Reaching Amen marks the day done; finished days and the reader's answers stay in `localStorage` on the device. `poster` names the `<poster-card>` whose `share()` the Amen screen uses. When an earlier day this week (from September 11, 2026) has no Moment, today's Amen screen links to it in the Grace Library (`library-href`). |
| `<memory-verse>` | `memory-verse.js` | The week's verse (Sunday to Saturday, Asia/Manila): the entry marked `"memory": true` among that week's days in `assets/verses/`, else Sunday's. Seven practices, one step on per day practised (not per calendar day); "I had it" on the last marks it learned and turns the card gold. Days practised and verses learned stay in `localStorage`. `<daily-moment memory-verse="<id>">` adds a button for it on today's Amen screen. |
| `<daily-food-for-thought>` | `daily-food-for-thought.js` | Today's serving from the Food for Thought guide, on a parchment card under its banner (`assets/images/food-for-thought-assets/fft-banner.webp`): the topic's section and areas (with their badges), its name, what it guards against, its verse, the serving for today and a question to chew on, and a link to the topic on `apps/pages/food-for-thought.html`. One topic per Asia/Manila day, the same for everyone, in the guide's order, starting again after the last; `show("YYYY-MM-DD")` shows another day's. |
| `<daily-guidance>` | `daily-guidance.js` | "Today's Guiding Question" from Questions We All Ask, on a navy card: one topic a day, the same for everyone, with narration (`audio-base`) and a PDF button. |
| `<red-letter-quotes>` | `red-letter-quotes.js` | "Jesus' Spoken Words": one of Jesus' best-known sayings a day on a red-letter card, with where and when he said it, his words in red, and one thing for today; a PDF button. |
| `<gods-blueprint>` | `gods-blueprint.js` | "Following Today's God Blueprint": one part of the plan a day on a blueprint card, with a PDF button. |
| `<did-you-know>` | `did-you-know.js` | Reads the facts from `assets/db/didyouknow.db` through sql.js, fetched only as the card nears the screen; a refresh never repeats the previous batch, and the pull tab (`pull-tab.js`) adds more, up to 20. |
| `<bible-sayings>` | `bible-sayings.js` | Sayings from `assets/bible-sayings.json`; tapping one pops up the whole entry. Refresh and pull tab as on `<did-you-know>`. |
| `<story-carousel>` | `story-carousel.js` | A looping, swipeable row of story covers from `assets/stories.json`, in `sequence` order (reshuffled daily by the deploy). The folded corner opens the reader; play and download pills play the narration or open the storybook. Remembers its place for the tab. |
| `<sticker-gifts>` | `sticker-gifts.js` | Records progress toward the stickers (`assets/scripts/sticker-progress.js`), gives new ones as gifts (`sticker-awards.js`, `sticker-share.js`) and, with `card`, shows the album card. Also loaded by `stories.html`, where a finished story counts. |
| `<kids-card>` | `kids-card.js` | The card into Daily Grace Kids: `assets/images/daily-grace-kids-banner.mp4` looping muted, over its still `daily-grace-kids-banner.webp`. The video is fetched only as the card nears the screen and pauses off screen; with reduced motion, Save-Data, or a file that can't play, the still picture stays. `href` overrides the link (default `apps/pages/kids.html`). |
| `<bible-trivia>` | `bible-trivia.js` | Modal trivia popup built from one random `did_you_know` row: its `Book` is the answer, two of its `Similar_books` are the decoys. Cannot be dismissed until answered; then it glows green or red, plays a sound and closes on the next tap or after three seconds. |
| `<study-guide-menu>` | `study-guide-menu.js` | The Bible Study Guides drawer, with the Help guide and the About page. Keep Help in step with the page: each control it explains, and each guide in the menu. |
| `<dg-menu>` | `dg-menu.js` | The reader's own menu under the DG emblem, with the Bookmarking 101 and How to earn stickers guides (each with the reader's counts). |
| `<avatar-picker>` | `avatar-picker.js` | Choosing an avatar, a Bible hero from `assets/avatars.json`, shown from `media:images/avatars/adults/`. Required on the homepage: it cannot be closed until one is chosen. |
| `<site-footer>`, `<sponsor-splash>` | `site-footer.js`, `sponsor-splash.js` | The footer with its QR code, and the sponsorship splash at the very bottom. |

### Bible text, bookmarks and readers

| Element | File | Notes |
| --- | --- | --- |
| `<bible-search-results>` | `bible-search-results.js` | A verse that began a Daily Grace day gets a gold strip under it (the day's thumbnail, date and title) linking to the day in the Grace Library; the Library's index is fetched with the first results, and only its days up to today show. Book header plus a scrolling reader that adds 24 verses per batch, on scroll or via **Load more verses**. `compact` hides the counts for popups. Each verse's folded corner opens its explanation, the BSB and the Interlinear (see `assets/annotations/`). Holding a verse bookmarks it (up to 100 verse docids in `localStorage`); `showBookmarks(rows)` lists them. |
| `<verse-popup>` | `verse-popup.js` | The passage a Bible reference pill opens (`scripture-refs.js`), with popups opened from popups up to six deep. Loads `sql_script.js` itself on pages that don't. |
| `<passage-reader>` | `passage-reader.js` | A passage in three tabs: the King James Bible (with the words of Jesus in red, from `assets/red-letter.json` as in the search results), the BSB (with its section headings, whose parallel references open as pills) and the Interlinear (each word's Strong's number, transliteration, original, gloss and grammar, right to left for Hebrew). `showPassageReader({ book, range, title })` opens it; `range` is an outline range such as `"1-11"` or `"10:1-22:16"`. Tapping a word in the Interlinear tab turns it faint yellow and opens its Strong's dictionary entry under the verse, as in the explanation popup; both use `strongs-entry.js` (the dictionary loader and the entry card). Chapters load as the reader scrolls. Opened by the outline rows on `apps/pages/bible-books.html` and by the Explorers' "Read the chapter". |
| `<bookmark-manager>` | `bookmark-manager.js` | My Bookmarks: every bookmark on the device, one kind at a time under a segmented switch (Bible Verses, Did You Know, Bible Sayings, Questions, Blueprint, Jesus' Words), each a `bookmarks` copy of its own component. The red PDF button opens them all, with their notes, as one PDF (`assets/scripts/bookmarks-pdf.js`, which loads jsPDF from cdnjs on the first tap). |
| `<flip-book>` | `flip-book.js` | The reader: swipe, tap the page's edges, arrow keys, pinch and wheel zoom. One page in portrait, a two-page spread in landscape. `flip="up"` binds it along the top, like a steno pad: one page at a time, turned by swiping up or down or tapping the lower or upper half. A swipe is judged by its distance and direction, never its speed, and a drag that is not a swipe is not a tap. |
| `<kids-stories>`, `<young-kids-stories>` | `kids-stories.js`, `young-kids-stories.js` | The two story shelves of `daily-grace-kids.html`: a `<story-carousel>` of the kids' retellings (`assets/kids-stories.json`), and a `flip="up"` notebook of the young explorers' stories (`assets/young-kids-stories.json`) with a caption under each page. |
| Kids games | `kids/*.js` | `<kids-look-find>`, `<kids-story-order>`, `<kids-verse-builder>`, `<kids-who-said>`, `<kids-gather>`, `<kids-colour>`, `<kids-right-or-not>` and `<kids-pairs>`, and for Explorers `<kids-investigate>`, `<kids-verse-practice>`, `<kids-map-quest>` and `<kids-book-train>`. Each takes a `config` (its data, the age band, the audio player, the media resolver) and fires `kids-done` when finished; no game can be lost. Shared pieces are in `kids-common.js`. |

### Bookmarks and notes

The hold-to-bookmark gesture, glow and ribbon live in
`apps/components/card-bookmarks.js` (the verses have their own copy of the
gesture in `<bible-search-results>`), which also asks the browser to keep the
bookmarks (persistent storage) the first time one is saved. Each kind keeps its
ids in its own `localStorage` key, newest first: up to 100 verses and 50 of
everything else. The components and the study pages' scripts import
`card-bookmarks.js` with a `?v=` token; bump it in every import, to the same
value, when it changes.

**Notes on bookmarks** live in `apps/components/bookmark-notes.js`. A new
bookmark, of any kind, opens a small box asking for a note (up to 280
characters); Skip leaves it without one, and taking the bookmark off takes the
note too. In My Bookmarks each card carries a `<bookmark-note-box>`: the note,
**Add note** / **Edit note** (to change or remove it) and **Share**, which hands
the item, the note and a link to the phone's share sheet, or copies them where
there is none. Notes are kept on the device under
`dailygrace:bookmarks:notes`, keyed by each list's own storage key and id, and
are printed under their bookmarks in the bookmarks PDF.

### Stickers

188 stickers in seven series (`assets/stickers.json`), earned for what the
reader does: the firsts (the Whole Armour of God), memory verses learned, Daily
Moments, faithful weeks, right trivia answers, days of Food for Thought, and
each book of the Bible met. `assets/scripts/sticker-progress.js` counts what has
been done, from the components' events; `assets/scripts/sticker-awards.js` holds
the series, their rules and the text of How to earn stickers, and decides what
is due; `<sticker-gifts>` shows each new one. Surprise stickers come at 10, 25,
50 and 100, and with each completed series.

### Settings, fonts and loading

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
Know? and Bible Sayings, fetch their files only as they near the screen. The
videos on the page (banner, poster, Moment, kids card) pause while off screen.
`banner-slider` and `poster-card` hold their space in `styles.css` until their
scripts run (`:not(:defined)`), so keep those sizes in step with the
components.

## Scripts

- **`assets/scripts/script.js`** — homepage wiring: search form and book
  suggestions ("Psalm" and "Song of Songs" are taken for Psalms and Song of
  Solomon), the way back to a search after a verse's Daily Grace strip (the
  search is kept for the tab, `dailygrace:search-return`, and run again on
  Back, at the same verse), the search mode padlock, the reflection toggle, the QR, verse
  and splash dialogs, restoring the scroll position, and the bookmarks popup's
  verse loader.
- **`assets/scripts/sql_script.js`** — loads sql.js (1.14.2, from cdnjs) and the
  Bible database, and exposes `initDatabase()`, `parseBibleReference()`,
  `getVerses()`, `getVersesByIds()`, `searchVersesByKeywords()` and
  `getBooks()`. Verse text comes back cleaned: the psalm titles and Psalm 119
  letters the database appends to verses are taken off, and names split at a
  line break are rejoined. The database is fetched lazily, the first
  time the search field is focused, not on page load. It is fetched with
  `force-cache`, so bump `DATABASE_VERSION` in this file whenever
  `dailygrace.db` changes, and then this script's own `?v=` token.
- **`assets/scripts/sqlite-db.js`** — shared sql.js access for the components:
  `getSqlJs()`, `openDatabase()` and `query()`. It reuses `sql_script.js`'s
  instance so the wasm runtime starts once for both databases.
- **`assets/scripts/bookmarks-pdf.js`** — the bookmarks PDF, and the one-entry
  PDFs of the Questions, Blueprint and Jesus' Words cards, made on the
  reader's device with jsPDF and the site's own fonts.
- **`assets/scripts/avatar-store.js`** — the chosen avatar.
- **`assets/scripts/library-index.js`** — the Grace Library's days:
  `loadLibrary()` (the index files up to this year, only complete days up to
  today in Manila), `daysForReference()` (the days whose verse falls in
  "Psalm 23"), and the thumbnail and book-symbol URLs.
- **`assets/scripts/check-assets.mjs`**, **`update-social-image.mjs`** and
  **`update-stories-sequence.mjs`** — run by the deploy; see
  [Deployment](#deployment).

## Data

| File | Contents |
| --- | --- |
| `assets/db/dailygrace.db` | The complete KJV: 66 books, 1,189 chapters, 31,102 verses (4.7 MB). Tables: `books(book_number, book_id, book_name)` and `verses(docid, book, chapter, verse, text)`, joined on `verses.book = books.book_id`. |
| `assets/annotations/<book_id>/<chapter>.json` | Per verse, keyed by verse number: an `explanation` (a commentary note from Jamieson-Fausset-Brown, or John Gill where JFB is silent), `translations.bsb` (the Berean Standard Bible text, with its section headings and the psalm heading on verse 1) and `interlinear` (the KJV words with their Strong's numbers, not shown at the moment). The Strong's dictionary is in `assets/strongs/`, 100 entries to a file, for the word a reader taps in the explanation popup's interlinear. Kept out of `dailygrace.db` so the search download stays small; `<bible-search-results>` fetches one chapter when a verse's folded corner is tapped. Rebuild with `tools/annotations/`. |
| `assets/interlinear/<book_id>/<chapter>.json` | Every verse word by word in the Hebrew (Old Testament, read right to left; its Aramaic passages, in Daniel, Ezra and Jeremiah 10:11, marked `"arc"`) or the Greek the KJV translators used (Scrivener 1894): `{"lang": "he" \| "grc", "verses": {"1": [[original, transliteration, gloss, strongs, grammar], …]}}`, numbered as in the KJV, with a psalm's title as verse `"0"`. From STEPBible.org (CC BY 4.0, credited in the reader). 1,189 files, 26 MB; read by `<passage-reader>` and by the explanation popup of `<bible-search-results>` (its `interlinear-base`). Rebuild with `tools/interlinear/`. |
| `assets/verses/<YYYY>/<month>.json` | Daily verse, text, reflection, `question` and `prayer`, one file per month (`assets/verses/2027/january.json`), each entry keyed by date string (`"January 1, 2027"`). The question and prayer are for the Moment's Respond and Pray screens; a day without them gets a general one. Also supplies the verse shown on not-yet-released flipbook pages. From 2027 on they are built by `tools/reflections/export_verses_json.py` from the reflections and the month's Moment questions and prayers. `apps/components/daily-verses.js` loads them, fetching each month once per page; import it with the same `?v=` token everywhere (`banner-slider.js`, `daily-moment.js`, `memory-verse.js`, `apps/pages/scripts/daily-grace-week.js`). |
| `assets/db/didyouknow.db` | 1,021 Bible facts in one table, `did_you_know(id, Title, Fact, Reference_verse, Book, Similar_books)`. `Reference_verse` must parse and exist in `dailygrace.db`, since tapping it opens the passage. `Similar_books` holds four books that are never the row's own `Book`; `<bible-trivia>` draws two of them as wrong answers. Add rows with `tools/didyouknow/add_rows.py`. |
| `assets/did-you-know.json` | The original 501 facts, superseded by `didyouknow.db` and no longer read by anything. |
| `assets/bible-sayings.json` | 571 everyday sayings from the Bible, each with its meaning, KJV words and reference. |
| `assets/red-letter-quotes.json` and `assets/red-letter.json` | 74 best-known sayings of Jesus in 10 themes, for the Red-Lettered Quotes page and `<red-letter-quotes>`; and, per verse of the eight books where he speaks, the ranges of his words, for printing them in red. |
| `assets/guidance-for-life.json`, `assets/following-gods-blueprint.json`, `assets/food-for-thought.json` | The guides behind the three other daily cards: 47 questions in six parts of life, answered by five voices of Scripture; 40 parts of God's plan on six sheets, with the blueprint test; and 81 Food for Thought topics in seven sections, each tagged Mind, Body and/or Spirit, built and verse-checked by `tools/food-for-thought/build_food_for_thought.py`. |
| The other guides' JSON | `bible-books.json`, `bible-characters.json`, `bible-prayers.json`, `commandments-of-god.json`, `flora-and-fauna.json`, `heroes-and-villains.json`, `poems-songs-and-wisdom.json`, `supernaturals.json` and `assets/peoples/` (an index and one file per people). |
| `assets/guide-info.json` | The "About this guide" popup of each study guide (the ⓘ beside the funnel), keyed by page file (`bible-books.html`): `title`, `summary`, `inside`, `use` and `why` (lists of paragraphs or steps) and a KJV `verse` (`ref`, `text`, word for word as in `dailygrace.db`). Fetched on the first tap by `guideInfoButton()` in `apps/pages/scripts/study-utils.js`. Update it when a guide gains or loses a feature. |
| `assets/stories.json`, `assets/stories/*.json` | The homepage's stories (cover, title, description, narration and storybook), and each story's flipbook pages. `sequence` is rewritten daily by the deploy. |
| `assets/kids-stories.json`, `assets/kids/stories/*.json`, `assets/young-kids-stories.json` | The kids' retellings and their flipbooks, and the young explorers' stories. |
| `assets/stickers.json` | The 188 stickers: `id`, `group` (the series), `title`, `reference`, `verse`, `reflection` and `filename`. |
| `assets/avatars.json`, `assets/avatars-kids.json` | The readers' avatars (51) and the kids' (`KA-NN`), shown from `media:images/avatars/adults/` and `media:images/avatars/kids/`. |
| `assets/kids/kids-data.json`, `assets/kids/explorers-data.json` | Everything Daily Grace Kids shows: the eight stories (panels told for both ages, verse with its missing word and pieces, Look & Find spots, Talk Together, games), the map's sections and road, the tree and Nari stages, Nari's lines, sound effects, the Two by Two cards and the sticker paths; and the Explorers' stops, trails, Field Guide and ranks. Generated by `docs/kids/prompt-scripts/gen_app_data.py` (local only) from the kids stories and resources; don't edit them by hand. `tests/kids-rules.spec.mjs` checks them. |
| `assets/library/index.json`, `assets/library/<YYYY>.json` | The Grace Library's index: `{ start, years }`, and per year the months' emphases and each day's `date`, `ref`, `book`, `title` (the poster's headline, which is the calendar's theme), `summary` and `video` (has a poster video), with `missing` on a day the media audit found incomplete, which stays out. Generated, never edited by hand: `python tools/library/audit_library_media.py` checks the media host day by day (writes `tools/library/media.json`), then `python tools/library/build_library_index.py` writes the index from `assets/verses/`, the calendars (`tools/library/calendar_2026.txt`, `tools/reflections/calendar_<YYYY>.txt`) and the reflections' `S:` lines. Its `LIBRARY_START` (2026-09-11) is the first day kept. Run both after each month's verses or media go up; `tests/library.spec.mjs` fails if the index falls out of step with `assets/verses/`. |
| `assets/book-metadata.json` | Fallback `title` / `description` for all 66 books — see below. |

Book symbols load from `<media-base>images/symbols/<Book name>-symbol.svg`. The
book overview in search results is read from that SVG's `title#title` and
`desc#description`; the third em-dash-separated segment of the title is the
Hebrew name. When that fetch fails, or the media host allows `<img>` but blocks
cross-origin `fetch`, `assets/book-metadata.json` supplies the same text.
Regenerate that snapshot whenever the source SVG titles or descriptions change.

## What is kept on the device

Everything is in `localStorage`, and every read and write is guarded, so a
private window, blocked storage or a full disk only means things are not
remembered.

| Key | What |
| --- | --- |
| `dailygrace:bookmarks` | Bookmarked verses (docids) |
| `dailygrace:bookmarks:facts`, `:sayings`, `:guidance`, `:blueprint`, `:red-letter` | The other bookmarks (ids) |
| `dailygrace:bookmarks:notes` | Notes on bookmarks |
| `dailygrace:moment:done`, `dailygrace:moment:answers` | Finished Moments and the reader's answers |
| `dailygrace:memory:progress`, `dailygrace:memory:learned` | Memory verse practice and verses learned |
| `dailygrace:stickers`, `dailygrace:stickers:counts` | Stickers earned and the progress toward them |
| `dailygrace:avatar` | The chosen avatar |
| `dailygrace.trivia` | Today's trivia tally |
| `dailygrace:kids:*` | Daily Grace Kids: children, records, settings, time used |

A few more remember small conveniences: the banner's swipe hint, the scroll
position, the story rows' place and the Grace Library's last view
(`dailygrace:library:view`).

## Media layout

Everything below lives on R2 under `https://dailygrace.faith/media/`, with
filename case and spaces preserved:

```
banner/<YYYY>/<month>/daily-grace-<YYYY>-<MM>-<DD>.webp      daily social/hero banner
images/sources/<YYYY>/<month>/<Month D, YYYY>.webp           daily poster
images/sources/<YYYY>/<month>/<Month D, YYYY> - Comic.webp
images/sources/<YYYY>/<month>/<Month D, YYYY>.mp4            the poster's video, when there is one
images/symbols/<Book name>-symbol.svg                        66 book symbols
images/thumbnails/<Book name>_square.webp                    66 book tiles, for the trivia
images/thumbs/<YYYY>/<month>/<Month D, YYYY>.webp           the poster at 240 x 427, for the Grace Library (tools/library/make_thumbs.py)
images/coverpages/<YYYY>/<YYYY>-WEEK<n>.webp                 flipbook cover, per week
images/coverpages/<YYYY>/<YYYY>-404.webp                     cover fallback
images/avatars/adults/                                       readers' avatars
images/avatars/kids/                                         kids avatars
audio/<YYYY>/<Month>/webm/<Month D, YYYY>.webm               narration
kids/…                                                       Daily Grace Kids: cub, tree, map, stops, games, ui, print, stickers, audio
```

R2 serves media with `max-age=86400`, so a file replaced under the same name
needs a `?v=` on its URL, or readers keep the old one for a day.

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
npm run serve                  # or the tests' server, at http://localhost:4173
```

Media comes from the production host, so there is nothing else to run. The
`og:image` tag stays at whatever date it was last built with; run
`node assets/scripts/update-social-image.mjs` to refresh it locally.

Stylesheets and scripts are cache-busted with a `?v=YYYYMMDD-N` query string,
in the HTML files and in the `import`s between modules. Bump the token of any
file you change, resetting `N` to 1 on a new date, or returning visitors will
keep the cached copy. The deploy stamps the tokens in the HTML with the commit
(see [Deployment](#deployment)), but not those in the imports, so:

- a changed module needs its token bumped in every file that imports it;
- every import of one module must use **the same** token: two different URLs
  load two separate copies of the module, each with its own state.

Write every `if`, `else` and loop with braces, even for one line.

## Testing

Browser tests use [Playwright](https://playwright.dev). It is a development
tool only: `package.json`, `node_modules/` and `tests/` are not part of the
published site.

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
Chrome; an Android phone (Pixel 7); and an iPhone (iPhone 15, WebKit). Tests
that need only one screen skip the others, so most of a run shows as skipped.

| Spec | Covers |
| --- | --- |
| `smoke.spec.mjs` | The main pages open without script errors |
| `avatar.spec.mjs` | Choosing an avatar, no trivia until then, changing it |
| `daily-cards.spec.mjs` | The daily cards: the same all day, new the next, moving on at midnight |
| `bookmark-notes.spec.mjs` | Notes: asked for on bookmarking, kept, edited, shared, removed with the bookmark |
| `sticker-share.spec.mjs` | Sharing a sticker |
| `story-kjv.spec.mjs` | The stories' KJV pills |
| `young-kids-stories.spec.mjs`, `daily-grace-kids.spec.mjs` | The Daily Grace Kids hub and its notebook |
| `kids-*.spec.mjs` | Daily Grace Kids (below) |

Daily Grace Kids has its own: `kids-rules.spec.mjs` (the story data and the
rules, without a browser), `kids-store.spec.mjs` (the store: cleaning, limits,
damaged and blocked storage), `kids-setup.spec.mjs` (welcome, the gate,
children), `kids-story.spec.mjs` (every story at both ages, rewards never
twice, links, the map lock, quick taps, the games), `kids-explorers.spec.mjs`
(the Explorers' screens) and `kids-device.spec.mjs` (the time limit, failures,
two tabs, settings, printables, layout on every screen, the home card). They
stand in a local picture for the media host's images and refuse its sounds
(`tests/kids-helpers.mjs`), so they run offline and prove the page carries on
without sound. The flows run on the iPad; the layout checks on all five
screens.

A test that holds a card should use `locator.hover()` before pressing: the page
scrolls smoothly, so coordinates measured first can be stale by the time the
press lands.

## Deployment

`.github/workflows/pages.yml` publishes to GitHub Pages on every push to `main`,
manually, and daily at 00:07 Philippine time (GitHub can delay scheduled runs,
so midnight is not guaranteed). Day to day, work happens on the
`dailyfrace.faith.v2` branch, which is merged into `main` (`git merge --no-ff`)
to publish. The workflow:

1. checks every asset reference with `check-assets.mjs` (a missing local file
   fails the deploy; a media-host miss only warns);
2. runs `update-social-image.mjs`, which rewrites the `og:image` meta tag in
   the HTML to today's banner URL in `Asia/Manila` (do not edit this script
   without care: the daily deploy depends on it);
3. runs `update-stories-sequence.mjs`, which reshuffles the story cards' order,
   seeded by the Manila date, so it changes daily;
4. copies `index.html`, `CNAME`, `favicon.ico`, `robots.txt`, `sitemap.xml`,
   `assets/` and `apps/` into the artifact, and stamps every `?v=` in its HTML
   with the commit, since Pages serves HTML for 10 minutes but scripts for 4
   hours;
5. compacts every `.json` file, and minifies the JS and CSS with esbuild, file
   by file and without bundling, so every file and import keeps its place.

Only the published copy is rewritten; nothing is committed back. A JSON, JS or
CSS file that cannot be processed ships as it is, with a warning in the run's
log, and if esbuild cannot be installed the site ships unminified.

`robots.txt` allows everything and points to `sitemap.xml`, which lists the
homepage and the pages in `apps/pages/` worth finding in a search: all but the
`songs-in-the-bible.html` redirect and the reader's own sticker album. Add new
pages to it.

One-time setup: **Settings → Pages → Build and deployment → GitHub Actions**, and
keep the custom domain set to `dailygrace.faith`. Social platforms cache previews
they have already fetched, so a new banner may not appear in a shared link
immediately.

Changing media URLs in this repository does not upload anything to R2 or change
Cloudflare routing; those are managed separately.
