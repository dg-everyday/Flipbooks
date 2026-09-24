# Concordance tooling

`build_concordance.py` derives `assets/db/concordance.db` from the KJV verses in
`assets/db/dailygrace.db`. It rebuilds the file from scratch on every run.

```sh
python tools/concordance/build_concordance.py
```

## Tables

| table | meaning |
| --- | --- |
| `books` | copied from `dailygrace.db` (`book_number`, `book_id`, `book_name`) |
| `verses` | `verse_id`, `book_number`, `chapter`, `verse`, `text` — the cleaned verse text the concordance was built from |
| `words` | one row per distinct word: `word_id`, `word` (lowercase), `occurrences` (total uses), `verse_count` (verses it appears in) |
| `occurrences` | `word_id`, `verse_id`, `position` — every use of every word; `position` is the 1-based word index within the verse |

`verse_id` matches the `docid` of the same verse in `dailygrace.db`.

## How the text is cleaned

- **Psalm titles.** The source stores each psalm's superscription ("A Psalm of
  David…") on the end of the previous psalm's last verse. The script moves it
  to verse `0` of its own psalm, the way printed concordances cite "Ps 3:title".
  These rows get `verse_id`s after the last real verse, so they have no
  counterpart in `dailygrace.db`.
- **Psalm 119 letters.** The acrostic headings (ALEPH, BETH, …) are dropped.
- **Split names.** Hyphenated names broken across a line ("Beth- shemesh") are
  rejoined.

## What counts as a word

- Words are lowercased, so `LORD` and `Lord` are one entry. Read the verse text
  at `position` if you need the original capitalization.
- Hyphenated names stay whole (`beth-shemesh`, `abed-nego`).
- Possessives are separate entries (`god's`, `sons'`). Curly apostrophes are
  stored as `'`.
- Every word is indexed, including common ones like `the` and `and`.

## Example

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
