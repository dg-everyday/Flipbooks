# Verse annotation tooling

Scripts behind `assets/annotations/`: what the app can show alongside each KJV
verse, one JSON file per chapter, fetched by the page only when it is needed.
Today that is a short commentary note (the explanation) and the Berean
Standard Bible wording. They are kept out of `assets/db/dailygrace.db` on
purpose: that file is downloaded whole before verse search works, and the
annotations would grow it from 4.8 MB to over 30 MB.

## Files

`assets/annotations/<book_id>/<chapter>.json`, where `book_id` is the id from
the `books` table (`Gen`, `Ps`, `John`, `1Sam`, …). Keys are verse numbers:

```json
{
  "1": {
    "explanation": { "source": "jfb", "text": "Under a metaphor borrowed from scenes of pastoral life…" },
    "translations": {
      "bsb": { "title": "A Psalm of David.", "text": "The LORD is my shepherd; I shall not want." }
    },
    "interlinear": "The LORD/H3068 *is my shepherd/H7462 I shall not want/H2637"
  }
}
```

- `explanation` is absent for the ~1,150 verses neither commentary covers.
  Paragraphs in its `text` are separated by a blank line.
- `translations.bsb.text` is the BSB wording of the verse. It is absent for the
  16 verses the BSB leaves out (Matthew 17:21, 18:11, 23:14; Mark 7:16, 9:44,
  9:46, 11:26, 15:28; Luke 17:36, 23:17; John 5:4; Acts 8:37, 15:34, 24:7,
  28:29; Romans 16:24); show nothing for them.
- `translations.bsb.title` appears only on verse 1 of the 116 psalms that have
  a heading ("A Psalm of David."). The BSB prints it as part of verse 1; here
  it is kept apart, as the KJV verse 1 does not include it.
- `interlinear` is the verse's KJV words with their Strong's numbers, for the
  interlinear in the explanation popup: see `tools/strongs/README.md` for the
  format. Every verse has one.
- A verse with none of these is absent, and a chapter with none is `{}`. Every
  chapter has a file, so a fetch never 404s.

The average file is about 26 KB as stored (Psalm 119, the largest, about
240 KB); the site ships them compacted.

## Sources

The commentaries are public domain, served as JSON by the
[HelloAO Bible API](https://bible.helloao.org) (CC0):

| `source` | commentary | used for |
| --- | --- | --- |
| `jfb` | Jamieson-Fausset-Brown (1871) | every verse it has a note for — about 18,200 |
| `gill` | John Gill, *Exposition of the Entire Bible* (1746–63) | verses JFB skips — about 11,700 |

About 1,150 verses have no explanation, mostly genealogies and name lists in
Chronicles, Ezra, Nehemiah and Numbers, where both commentaries note a block of
verses at once. Gill's notes are longer and more Calvinist than JFB's, which is
why each entry records its source.

The BSB text is in `bsb.json` beside the scripts (committed; `tools/` is not
deployed). It is the public-domain `bsb.txt` from bereanbible.com, downloaded
on 12 October 2026, with each psalm heading moved from the start of verse 1 to
`titles`. The headings were found with the `\d` markers of the BSB USFM from
ebible.org, and each split was checked: heading + verse rebuilds the original
line for all 150 psalms.

```json
{ "titles": { "Ps": { "3": "A Psalm of David, when he fled from his son Absalom." } },
  "verses": { "Gen": { "1": { "1": "In the beginning God created the heavens and the earth." } } } }
```

Wherever the app shows BSB text it must be labelled "BSB": the KJV stays the
app's text, the BSB only helps readers understand it.

## fetch_commentaries.py

Downloads both commentaries into `cache/` (gitignored), one file per chapter.
Files already cached are skipped.

```sh
python tools/annotations/fetch_commentaries.py
```

## build_annotations.py

Rebuilds `assets/annotations/` from the cache, `bsb.json` and
`tools/strongs/interlinear.json`. It reads
`dailygrace.db` only for the book ids and the list of verses; the database is
not modified.

```sh
python tools/annotations/build_annotations.py
```

What it cleans up in the commentaries:

- HelloAO stores JFB's verse-1 note as the chapter introduction, so the
  introduction is used as verse 1.
- Gill's footnote markers like `(a)` are removed, along with the trailing paragraphs
  that list his Latin and Hebrew sources.
- Characters the source mangled in transit are put back: `Ã&brvbr` is `æ`
  ("Cæsarea"), `Ã†` is `Æ`, `Ã¶` is `ö` and `Â£` is `£`.
- The commentaries' `&c.` is written `etc.`, as readers know it today.
- Whitespace is normalised.
