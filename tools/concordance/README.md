# Concordance tooling

`build_concordance.py` derives a word concordance from the KJV verses in
`assets/db/dailygrace.db`. It rebuilds both outputs from scratch on every run.

```sh
python tools/concordance/build_concordance.py
```

| output | size | used by |
| --- | --- | --- |
| `assets/concordance.json` | ~1.7 MB (~640 KB gzipped) | the site |
| `tools/concordance/concordance.db` | ~15 MB | offline queries; not committed, not deployed |

The site loads the JSON rather than the database: sql.js downloads a whole
`.db` file before it can query it, and most of the database's size is word
positions a concordance page does not need.

## assets/concordance.json

```json
{
  "words":  { "grace": [146, 331, ...], ... },
  "titles": { "31103": ["Ps", 3, "A Psalm of David, when he fled from Absalom his son."], ... }
}
```

- **`words`** maps each word to the verses it appears in. The list is verse ids
  in ascending order, delta-encoded: the first number is a verse id, each one
  after it is the gap from the previous. Decode with a running sum:

  ```js
  let id = 0;
  const verseIds = concordance.words[word].map((gap) => (id += gap));
  ```

  A verse id is the `docid` of that verse in `dailygrace.db`, so the verse text
  comes from the database the page already has open. The list's length is the
  number of verses the word appears in.
- **`titles`** holds the psalm titles, which have no row in `dailygrace.db`
  (see below). Keys are the verse ids they use in `words`, all above the last
  real verse; values are `[book_id, chapter, text]`. Show them as
  "Psalm 3 (title)" and sort them before verse 1 of their psalm — sorting by
  verse id alone would put them after Revelation.

## tools/concordance/concordance.db

| table | meaning |
| --- | --- |
| `books` | copied from `dailygrace.db` (`book_number`, `book_id`, `book_name`) |
| `verses` | `verse_id`, `book_number`, `chapter`, `verse`, `text` — the cleaned verse text the concordance was built from |
| `words` | one row per distinct word: `word_id`, `word` (lowercase), `occurrences` (total uses), `verse_count` (verses it appears in) |
| `occurrences` | `word_id`, `verse_id`, `position` — every use of every word; `position` is the 1-based word index within the verse |

```sql
SELECT b.book_name || ' ' || v.chapter || ':' || v.verse AS ref, v.text
FROM words w
JOIN occurrences o USING (word_id)
JOIN verses v USING (verse_id)
JOIN books b USING (book_number)
WHERE w.word = 'grace'
GROUP BY v.verse_id
ORDER BY v.book_number, v.chapter, v.verse;
```

## How the text is cleaned

These fixes are applied before indexing. Only `concordance.db` stores the
cleaned text; `dailygrace.db` is left as it is, so a page showing verses from it
has to deal with the last two points itself.

- **Psalm titles.** The source stores each psalm's superscription ("A Psalm of
  David…") on the end of the previous psalm's last verse. The script moves it
  to verse `0` of its own psalm, the way printed concordances cite "Ps 3:title".
- **Psalm 119 letters.** The acrostic headings (ALEPH, BETH, …) are dropped.
- **Split names.** Hyphenated names broken across a line ("Beth- shemesh") are
  rejoined.

## What counts as a word

- Words are lowercased, so `LORD` and `Lord` are one entry.
- Hyphenated names stay whole (`beth-shemesh`, `abed-nego`).
- Possessives are separate entries (`god's`, `sons'`). Curly apostrophes are
  stored as `'`, so match `’` and `'` alike when highlighting in verse text.
- Every word is indexed, including common ones like `the` and `and`.
