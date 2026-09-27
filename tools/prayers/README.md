# Prayers of the Bible data

Builds `assets/bible-prayers.json`, which `apps/pages/bible-prayers.html` reads.

1. Edit `content/jesus.py` (Jesus teaches us to pray, Jesus at prayer),
   `content/old_testament.py` (the patriarchs and Moses, kings and prophets, prayers in exile,
   psalms for every day) or `content/church.py` (the early church at prayer).
2. Run from the repo root:

   ```
   python tools/prayers/build_prayers.py
   ```

   It gives each entry an id from its name (or use an explicit `id`), checks the group and
   testament, checks every reference in `told_in`, `also_in`, `prayed` and `key_verses`, fills
   `prayed` with the prayer's words (one line per verse) and the key verses with the exact KJV
   text, refuses verses the database has damaged, checks that `hero` ids exist on the Heroes and
   Villains page, and checks that every 'single-quoted' phrase in `summary`, `story`, `meaning`
   and `daily` is word for word in the KJV (`tools/kjv_quotes.py`). It exits non-zero on any
   problem.

Quote Scripture in 'single quotes', exactly as `assets/db/dailygrace.db` has it. Put glosses and
phrases that are not Scripture in “double quotes”. Note manuscript differences behind modern
translations (the end of the Lord's Prayer, "Father, forgive them") and keep the KJV reading.

Some verses in the database are damaged: a broken apostrophe in a word like "father's", or the
last verse of a psalm with the next psalm's title run on to it. The build refuses these in
`prayed` and `key_verses`; quote the words in the text instead, or pick a neighbouring verse.

## Daily life

Each prayer carries two parts for the reader's own day:

- `daily`: how the prayer fits into daily life, in plain words.
- `pray_it`: one short prayer in our own modern words, shown on the page as “A prayer in our own
  words” so it is never mistaken for Scripture. It must not contain 'single quotes'; the build
  checks that.

## Entry fields

| Field | Meaning |
|---|---|
| `name`, `epithet` | Name of the prayer, and a line from it. |
| `group` | Jesus teaches us to pray, Jesus at prayer, The patriarchs and Moses, Kings and prophets, Prayers in exile, Psalms for every day, The early church at prayer. |
| `testament` | `Old` or `New`. |
| `by`, `with` | `[{name, hero?}]`: who prayed or taught it, and who else was there. `hero` is an id on heroes-and-villains.html. |
| `by_label` | Replaces "Prayed by" for one entry ("Taught by", "Written by"). |
| `occasion`, `where` | What it was prayed for; where. |
| `told_in`, `also_in` | The passage; parallels and echoes. |
| `prayed` | References for the prayer's own words; the build adds the text. Leave it out when the Bible does not give the words. |
| `summary`, `story` | One sentence; the story behind it. |
| `meaning` | What it teaches about prayer. |
| `daily`, `pray_it` | See "Daily life" above. |
| `key_verses` | Other verses to read with it; the build adds the text. |
