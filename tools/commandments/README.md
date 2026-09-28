# Commandments of God data

Builds `assets/commandments-of-god.json`, which `apps/pages/commandments-of-god.html` reads.

1. Edit `content/ten.py` (the Ten Commandments, one entry each, in order), `content/jesus.py`
   (the greatest commandments, commandments of Jesus), `content/daily.py` (wisdom for daily life
   from the law, the prophets and Proverbs) or `content/apostles.py` (commandments of the
   apostles).
2. Run from the repo root:

   ```
   python tools/commandments/build_commandments.py
   ```

   It gives each entry an id from its name (or use an explicit `id`), checks the group and
   testament, checks every reference in `told_in`, `also_in`, `words` and `key_verses`, fills
   `words` with the commandment's own words (one line per verse) and the key verses with the exact
   KJV text, refuses verses the database has damaged, checks that `hero` ids exist on the Heroes
   and Villains page, and checks that every 'single-quoted' phrase in `summary`, `story`, `meaning`
   and `daily` is word for word in the KJV (`tools/kjv_quotes.py`). It exits non-zero on any
   problem.

Quote Scripture in 'single quotes', exactly as `assets/db/dailygrace.db` has it. Put glosses and
phrases that are not Scripture in “double quotes”.

Some verses in the database are damaged: a broken apostrophe in a word like "father's", or the
last verse of a psalm with the next psalm's title run on to it. The build refuses these in
`words` and `key_verses`; quote the words in the text instead, or pick a neighbouring verse.

## Choosing the commandments

The Ten Commandments come first, numbered 1 to 10 as most Protestant and Orthodox churches number
them (Exodus 20:1-17; also Deuteronomy 5:6-21). Catholic and Lutheran churches join the first two
and divide the last into two; the page says so under the group heading. Each of the ten shows how
Jesus and the apostles carried it on (Matthew 5 for the sixth and seventh, Ephesians 4:28 for the
eighth, and so on). The sabbath is written so that Christians who keep it on Saturday or Sunday,
or see it fulfilled in Christ, can all read it (Mark 2:27, Hebrews 4:9-10).

The other groups are commands that serve as companions for daily life:

- **The greatest commandments**: the two Jesus named (Deuteronomy 6:5, Leviticus 19:18), his new
  commandment (John 13:34) and the golden rule (Matthew 7:12).
- **Commandments of Jesus**: what he told his followers to do, from "repent ye, and believe the
  gospel" to "abide in me".
- **Wisdom for daily life**: commands from the law, the prophets and Proverbs about work, money,
  the poor, courage, home and the heart.
- **Commandments of the apostles**: from the letters, for words, anger, work, authority, purity,
  worry, family and church.

Passages that are easily misused (government in Romans 13, family in Ephesians 5 and 6, work in
2 Thessalonians 3) carry their limits in the text: Acts 5:29, mutual submission and no call to
stay in an abusive home, and those who will not work rather than cannot.

## Daily life

Each commandment carries two parts for the reader's own day:

- `daily`: how the commandment fits into daily life, in plain words.
- `try_it`: one practical step in our own modern words, shown on the page as "A step in our own
  words" under "Do this today", so it is never mistaken for Scripture. It must not contain
  'single quotes'; the build checks that.

## Entry fields

| Field | Meaning |
|---|---|
| `name`, `epithet` | Name of the commandment, and its words (or a line of them). |
| `number` | 1 to 10, for the Ten Commandments only. The card shows it in place of the icon. |
| `group` | The Ten Commandments, The greatest commandments, Commandments of Jesus, Wisdom for daily life, Commandments of the apostles. |
| `testament` | `Old` or `New`. |
| `by`, `with` | `[{name, hero?}]`: who gave or spoke it, and who else was there. `hero` is an id on heroes-and-villains.html. |
| `by_label` | Replaces "Given by" for one entry ("Spoken by", "Written by"). |
| `to`, `where` | Who it was given to; where. |
| `told_in`, `also_in` | The passage; parallels and where it is taken up again. |
| `words` | References for the commandment's own words; the build adds the text. |
| `summary`, `story` | One sentence; where it comes from. |
| `meaning` | What it means, and how Jesus and the apostles carry it on. |
| `daily`, `try_it` | See "Daily life" above. |
| `key_verses` | Other verses to read with it; the build adds the text. |
