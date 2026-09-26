# Heroes and Villains data

Builds `assets/heroes-and-villains.json`, which `apps/pages/heroes-and-villains.html` reads.

1. Edit `content/heroes.py` or `content/villains.py`.
2. Run from the repo root:

   ```
   python tools/heroes/build_heroes.py
   ```

   It gives each entry an id from its name (or use an explicit `id`), checks book names
   against `assets/db/dailygrace.db`, checks every reference in `told_in`, `moment` and
   `key_verses`, fills the key verses with the exact KJV text, and checks that `faced` ids
   and `peoples` ids exist. It exits non-zero on any problem.

## Entry fields

| Field | Meaning |
|---|---|
| `name`, `epithet` | Name and a short title ("The shepherd king"). |
| `testament`, `era` | `Old`, `New` or `Both`; an approximate date. |
| `books` | Book names; the page links each to `bible-books.html#<book-id>`. |
| `summary`, `story` | One sentence; a paragraph. |
| `moment` | `{title, reference}` — their defining moment. |
| `traits` | Heroes: strengths. Villains: what drove them. |
| `flaws` / `end` | Heroes: their failings, told honestly. Villains: how their story ended. |
| `turned` | Optional: how someone changed sides (Paul, Manasseh, Nebuchadnezzar). |
| `lesson` | What we learn from them. |
| `told_in`, `key_verses` | Where the story is told; key verses (text added by the build). |
| `faced`, `peoples` | Ids of heroes/villains they stood against; ids of pages on peoples.html. |
