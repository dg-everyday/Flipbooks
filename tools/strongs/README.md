# Strong's number tooling

`build_strongs.py` tags every KJV word in `assets/db/dailygrace.db` with its
Strong's number, and writes the Strong's Hebrew and Greek dictionaries as JSON.
It rebuilds all outputs from scratch on every run.

```sh
python tools/strongs/build_strongs.py <eng-kjv usfm dir> <strongs-hebrew-dictionary.js> <strongs-greek-dictionary.js>
```

The sources are downloaded outside the repo and passed in as paths:

| source | from | licence |
| --- | --- | --- |
| KJV with Strong's numbers (USFM) | `https://ebible.org/Scriptures/eng-kjv_usfm.zip`, unzipped | public domain (CrossWire / eBible.org) |
| `strongs-hebrew-dictionary.js` | `https://github.com/openscriptures/strongs` (`hebrew/`) | CC BY-SA (Open Scriptures) |
| `strongs-greek-dictionary.js` | `https://github.com/openscriptures/strongs` (`greek/`) | CC BY-SA (Open Scriptures) |

| output | size | used by |
| --- | --- | --- |
| `tools/strongs/kjv_strongs.db` | ~23 MB | offline queries; not committed, not deployed |
| `tools/strongs/interlinear.json` | ~6.4 MB | `tools/annotations/build_annotations.py`, which copies each verse into its chapter file |
| `assets/strongs/hebrew/<n>.json` | 87 files, ~20 KB each | the interlinear in the explanation popup (`<bible-search-results>`) |
| `assets/strongs/greek/<n>.json` | 57 files, ~20 KB each | the same |
| `tools/strongs/report.txt` | small | the validation report from the last run |

The database is kept out of `assets/` because the site deploys everything in
`assets/`, and sql.js downloads a whole `.db` file before it can query it. The
page gets the same data in two lighter forms: each verse's words and numbers
travel in its chapter's annotation file (fetched for the explanation anyway),
and the dictionary comes 100 entries to a file, so a verse fetches only the few
files its numbers fall in.

After a rebuild here, run `tools/annotations/build_annotations.py` so the
chapter files pick up the change.

## How the words are matched

The words are those of `dailygrace.db`, split exactly as
`tools/concordance/build_concordance.py` splits them (the script imports its
`clean_verses` and `tokenize`). So `(verse_id, position)` here is the same word
as in `concordance.db`, and psalm titles use the same verse ids (above the
last real verse).

The USFM only supplies the numbers. Its words are lined up with ours verse by
verse:

- same words: matched one for one;
- same number of words, spelled differently (Bethel / Beth-el): matched one for one;
- the same letters split differently (whosoever / who soever, cannot / can not):
  matched letter by letter, so a joined word takes every number it covers
  (`whosoever` -> `G3739 G1437`);
- anything else (a word in one text and not the other): our words get no number.

`report.txt` lists every verse in the last two groups. About 45% of words have
a number: the tagging covers words translated from the Hebrew or Greek, not
"the", "of" or words the translators supplied.

## tools/strongs/kjv_strongs.db

| table | meaning |
| --- | --- |
| `books` | copied from `dailygrace.db` |
| `titles` | `verse_id`, `book_number`, `chapter`, `text`: the psalm titles, as in `concordance.db` |
| `words` | `verse_id`, `position`, `word`, `strongs`, `added`: one row per word |

- `verse_id` is the `docid` in `dailygrace.db` (or a title id from `titles`).
- `position` is the 1-based word index in the verse, as in `concordance.db`.
- `strongs` is one or more numbers separated by spaces (`H430`, `G3739 G1437`),
  or NULL. Numbers have no leading zeros, to match the dictionary keys.
- `added` is 1 for words the translators supplied (printed in italics in the KJV).

```sql
-- every verse where the Greek word behind "lovest" is phileo (G5368)
SELECT v.book, v.chapter, v.verse, w.word
FROM words w JOIN dg.verses v ON v.docid = w.verse_id
WHERE w.strongs = 'G5368';   -- after: ATTACH 'assets/db/dailygrace.db' AS dg
```

## tools/strongs/interlinear.json

`{ "Gen": { "1": { "1": "In the beginning/H7225 God/H430 created/H1254 ..." } } }`:
each verse's words in order, separated by spaces. A word with Strong's
numbers carries them after a slash, joined by `+` when there are several
(`whosoever/G3739+G1437`); a word the translators supplied (italic in the KJV)
starts with `*` (`*was`). Words are letters, apostrophes and hyphens only, so
these marks cannot be part of one. The same string is each verse's
`interlinear` in `assets/annotations/`.

## assets/strongs/hebrew/ and greek/

`<n>.json` holds the entries numbered `n*100` to `n*100+99`: `H1`-`H99` in
`hebrew/0.json`, `H7225` in `hebrew/72.json`, `G5368` in `greek/53.json`.

```json
{ "H2617": { "lemma": "חֵסֵד", "xlit": "chêçêd", "pron": "kheh'-sed",
             "derivation": "from H2616 (חָסַד);", "def": "kindness; by implication (towards God) piety; ...",
             "kjv": "favour, good deed(-liness, -ness), kindly, (loving-) kindness, merciful (kindness), mercy, pity, reproach, wicked thing." } }
```

Keys are `H1`..`H8674` and `G1`..`G5624` (a few Greek numbers were never used
by Strong). `pron` is Hebrew only. The dictionaries are CC BY-SA: anything
built from them must credit Open Scriptures and James Strong, and share the
data under the same licence (see `assets/strongs/README.md`).
