# Flora and Fauna data

Builds `assets/flora-and-fauna.json`, which `apps/pages/flora-and-fauna.html` reads.

1. Edit `content/plants.py` or `content/animals.py`.
2. Run from the repo root:

   ```
   python tools/flora-fauna/build_flora_fauna.py
   ```

   It gives each entry an id from its name (or use an explicit `id`), checks the group,
   checks every reference in `who` and `key_verses` and that each of those passages really
   names the plant or animal, fills the key verses with the exact KJV text, and checks that
   `hero` ids exist on the Heroes and Villains page. From `terms` it counts the KJV verses
   that mention the entry (Old and New Testament), finds the first mention and the books
   that mention it most. It also checks that every 'single-quoted' phrase is word for word in
   the KJV (`tools/kjv_quotes.py`). It exits non-zero on any problem.

Quote Scripture in 'single quotes', exactly as `assets/db/dailygrace.db` has it. Put glosses
and phrases that are not Scripture (such as a Hebrew word's meaning) in “double quotes”.

## Entry fields

| Field | Meaning |
|---|---|
| `name`, `epithet` | Name and a short title ("The tree of oil and peace"). |
| `group` | Plants: Trees, Vines and crops, Herbs, flowers and spices, Wild plants. Animals: Flocks and herds, Wild animals, Birds, Creatures of the water, Creeping things. |
| `terms` | A regex (case-insensitive) for every KJV word that names it: `\bolives?\b\|\boliveyards?\b`. Check new terms for false hits, such as a verb ("she bear") or a name ("Hen"); `(?-i:…)` makes part of it case-sensitive. |
| `summary` | One sentence. |
| `uses` | Its place in daily life, one short line each. |
| `why` | Why it is in the Bible: what it pictures or teaches. |
| `who` | `{who, what, reference, hero?}`: people who used or met it; `hero` is an id on heroes-and-villains.html. |
| `importance`, `lesson` | Why it matters; what we learn. |
| `law` | Animals, optional: clean or unclean under the Law of Moses, and where. |
| `key_verses` | References; the build adds the text. |
