# Books of the Bible data

Builds `assets/bible-books.json`, which `apps/pages/bible-books.html` reads.

## Workflow

1. Edit the hand-written content in `content/`:
   - `groups.py` — the ten groups (Law, History, Poetry and Wisdom, Major Prophets,
     Minor Prophets, Gospels, Church History, Paul's Letters, General Letters, Prophecy),
     with their descriptions and key chapters.
   - `law.py`, `history.py`, `poetry.py`, `prophets.py`, `gospels_acts.py`, `epistles.py` —
     one entry per book.
2. Run from the repo root:

   ```
   python tools/books/build_books.py
   ```

   The script checks all 66 books in `assets/db/dailygrace.db` are written exactly once,
   counts chapters and verses from the KJV, fills `key_verses` with the exact KJV text,
   checks every outline range and reference, checks `peoples` ids against
   `assets/peoples/`, and writes the JSON. It exits non-zero on any problem, so never
   type chapter counts or verse text by hand.

## Book fields

| Field | Meaning |
|---|---|
| `name`, `group` | Book name exactly as in the database's `books` table; group id from `groups.py`. |
| `name_meaning` | Original (Hebrew/Greek) name and what it means. |
| `summary` | One sentence. |
| `author`, `author_note` | Who wrote it; tradition and scholarly views where they differ. |
| `date`, `audience`, `setting` | When it was written, to whom, and the time and place it covers. |
| `origin`, `description` | How the book came to be; what it contains. |
| `themes`, `outline` | Theme labels; outline sections as `{chapters: "1-11" or "10:1-22:16", title}`. |
| `key_verses` | References only — the build adds the KJV text. |
| `key_people`, `christ`, `peoples` | Main people; how the book points to Christ; ids of related pages on peoples.html. |

`id`, `order`, `chapters` and `verses` are added by the build.
