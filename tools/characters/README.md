# Bible Characters data

Builds `assets/bible-characters.json`, which `apps/pages/bible-characters.html` reads.

1. Edit `content/beginnings.py` (the beginning, the patriarchs, exodus and the promised land),
   `content/kingdoms.py` (the judges, the kingdom, the divided kingdom, exile and return) or
   `content/gospel.py` (the life of Jesus, the early church).
2. Run from the repo root:

   ```
   python tools/characters/build_characters.py
   ```

   It gives each entry an id from its name (or use an explicit `id`), checks the group and
   testament, checks that every `family` link points at another character on the page and every
   `hero` id at an entry on Heroes and Villains, checks every reference in `told_in`, `also_in`
   and `key_verses`, fills the key verses with the exact KJV text (refusing verses the database
   has damaged), and checks that every 'single-quoted' phrase is word for word in the KJV
   (`tools/kjv_quotes.py`). It exits non-zero on any problem.

Quote Scripture in 'single quotes', exactly as `assets/db/dailygrace.db` has it. Put glosses and
phrases that are not Scripture in “double quotes”. Where the Bible does not say something (an
author, a date, which pharaoh), say so, or call it tradition.

## How this page differs from Heroes and Villains

Heroes and Villains (`tools/heroes`) is a moral study of about 45 people: strengths, failings
and a lesson. This page is the wider who's who: over a hundred people, grouped by era, with
their role, family and why they matter. A character who also has a Heroes and Villains entry
carries its id in `hero`, and the page links to it.

## Entry fields

| Field | Meaning |
|---|---|
| `name`, `epithet` | Name and a short title ("The friend of God"). |
| `group` | The beginning, The patriarchs, Exodus and the promised land, The judges, The kingdom, The divided kingdom, Exile and return, The life of Jesus, The early church. |
| `testament` | `Old` or `New`. |
| `role`, `era` | What they were; roughly when, in words. |
| `family` | `[{relation, id?, name?}]`. With `id` the name links to that character on the page; without it, give `name`. Links are one-way. |
| `hero` | An id on heroes-and-villains.html. |
| `summary`, `story` | One sentence; their story. |
| `importance` | Why they matter. |
| `known_for` | Two to four short phrases. |
| `told_in`, `also_in` | Where their story is told; other places that speak of them. |
| `key_verses` | References; the build adds the text. |
