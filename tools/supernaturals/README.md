# Supernaturals data

Builds `assets/supernaturals.json`, which `apps/pages/supernaturals.html` reads.

1. Edit `content/miracles.py` (power over nature, food and plenty, healings, raised from the
   dead), `content/spirits.py` (casting out demons, magic and sorcery, signs, wonders and
   angels), `content/prophecies.py` (prophecies) or `content/topics.py` (the special topics,
   Angels and Demons).
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

Prophecy entries give the prophecy in `told_in` and where it came true in `also_in`; `by` is who
spoke it, `for` who it was spoken to, and `testament` the Testament it was spoken in.

## Special topics: Angels and Demons

The other entries are events. The special topics are studies: each gathers what the whole Bible
teaches on one question (What are angels? Where did demons come from? The whole armour of God),
and the page shows them after the events, under their own "Special topics" heading, with
shortcuts at the top of the page.

- `told_in` is the key passage, and `also_in` the other passages the topic draws on.
- `testament` may be `Both`; such a topic shows under either Testament filter.
- `related` lists ids of events on this page that show the topic in action (Legion, Gabriel
  comes to Mary …); the page links to them, and the build checks they exist.
- `story` is shown as "What the Bible says", and `lesson` as "For your daily life".

Say what Scripture says and where it stops. Where Christians read a passage differently (the
angel of the LORD, guardian angels, Isaiah 14 and Ezekiel 28), say so. Never describe occult
practice, and do not add names or ranks of angels from outside the Bible; if one is mentioned
(Raphael), say where it comes from.

## Entry fields

| Field | Meaning |
|---|---|
| `name`, `epithet` | Name and a short title, usually a phrase from the passage. |
| `group` | Power over nature, Food and plenty, Healings, Raised from the dead, Casting out demons, Magic and sorcery, Signs, wonders and angels, Prophecies; and the special topics Angels, Demons. |
| `testament` | `Old` or `New` (special topics may also be `Both`). |
| `related` | Special topics only: ids of events on the page that show the topic. |
| `by`, `with` | `[{name, hero?}]`: who did it (for magic, who was involved) and who else was there. `hero` is an id on heroes-and-villains.html. |
| `for`, `where` | Who it was for; where it happened (optional). |
| `told_in`, `also_in` | The main passage; parallel accounts and other places that tell or recall it. |
| `summary`, `story` | One sentence; what happened. |
| `meaning` | Why it matters (for magic: what the Bible says about it). |
| `lesson` | What we learn. |
| `key_verses` | References; the build adds the text. |
