# Verse explanation tooling

Scripts behind `assets/explanations/`: a short commentary on each KJV verse, one
JSON file per chapter, fetched by the page only when an explanation is shown.
They are kept out of `assets/db/dailygrace.db` on purpose — that file is
downloaded whole before verse search works, and the explanations would grow it
from 4.8 MB to about 27 MB.

## Files

`assets/explanations/<book_id>/<chapter>.json`, where `book_id` is the id from the
`books` table (`Gen`, `Ps`, `John`, `1Sam`, …). Keys are verse numbers:

```json
{
  "16": { "source": "jfb", "text": "For God so loved, &c.--What proclamation…" }
}
```

Every chapter has a file; verses without an explanation are simply absent, and a
chapter with none is `{}`. Paragraphs in `text` are separated by a blank line.
The average file is about 18 KB (Psalm 119, the largest, is 189 KB).

## Sources

Both are public domain, served as JSON by the
[HelloAO Bible API](https://bible.helloao.org) (CC0):

| `source` | commentary | used for |
| --- | --- | --- |
| `jfb` | Jamieson-Fausset-Brown (1871) | every verse it has a note for — about 18,200 |
| `gill` | John Gill, *Exposition of the Entire Bible* (1746–63) | verses JFB skips — about 11,700 |

About 1,150 verses have no entry, mostly genealogies and name lists in
Chronicles, Ezra, Nehemiah and Numbers, where both commentaries note a block of
verses at once. Gill's notes are longer and more Calvinist than JFB's, which is
why each entry records its source.

## fetch_commentaries.py

Downloads both commentaries into `cache/` (gitignored), one file per chapter.
Files already cached are skipped.

```sh
python tools/explanations/fetch_commentaries.py
```

## build_explanations.py

Rebuilds `assets/explanations/` from the cache. It reads `dailygrace.db` only for
the book ids and the list of verses; the database is not modified.

```sh
python tools/explanations/build_explanations.py
```

What it cleans up:

- HelloAO stores JFB's verse-1 note as the chapter introduction, so the
  introduction is used as verse 1.
- Gill's footnote markers like `(a)` are removed, along with the trailing paragraphs
  that list his Latin and Hebrew sources.
- Whitespace is normalised.
