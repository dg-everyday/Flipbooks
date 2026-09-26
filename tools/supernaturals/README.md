# Supernaturals data

Builds `assets/supernaturals.json`, which `apps/pages/supernaturals.html` reads.

1. Edit `content/miracles.py` (power over nature, food and plenty, healings, raised from the
   dead) or `content/spirits.py` (casting out demons, magic and sorcery, signs, wonders and
   angels).
2. Run from the repo root:

   ```
   python tools/supernaturals/build_supernaturals.py
   ```

   It gives each entry an id from its name (or use an explicit `id`), checks the group and
   testament, checks every reference in `told_in`, `also_in` and `key_verses`, fills the key
   verses with the exact KJV text, checks that `hero` ids exist on the Heroes and Villains
   page, and checks that every 'single-quoted' phrase is word for word in the KJV
   (`tools/kjv_quotes.py`). It exits non-zero on any problem.

Quote Scripture in 'single quotes', exactly as `assets/db/dailygrace.db` has it (that text
differs from some printed KJVs in small ways, such as "wash in the Jordan"). Put glosses and
phrases that are not Scripture in “double quotes”.

Magic and sorcery entries report what the Bible tells and how it judges it. They never
describe how anything was done.

## Entry fields

| Field | Meaning |
|---|---|
| `name`, `epithet` | Name and a short title, usually a phrase from the passage. |
| `group` | Power over nature, Food and plenty, Healings, Raised from the dead, Casting out demons, Magic and sorcery, Signs, wonders and angels. |
| `testament` | `Old` or `New`. |
| `by`, `with` | `[{name, hero?}]`: who did it (for magic, who was involved) and who else was there. `hero` is an id on heroes-and-villains.html. |
| `for`, `where` | Who it was for; where it happened (optional). |
| `told_in`, `also_in` | The main passage; parallel accounts and other places that tell or recall it. |
| `summary`, `story` | One sentence; what happened. |
| `meaning` | Why it matters (for magic: what the Bible says about it). |
| `lesson` | What we learn. |
| `key_verses` | References; the build adds the text. |
