# Food for Thought data

Builds `assets/food-for-thought.json`, which `apps/pages/food-for-thought.html` and the home
page's `<daily-food-for-thought>` read.

1. Edit the section files in `content/`: `diet.py` (The daily diet), `mind.py` (Feeding the
   mind), `body.py` (Keeping the body fit), `armour.py` (Armour for the fight), `junk.py` (Junk
   food for the soul), `shape.py` (Staying in shape) or `table.py` (Lessons from the Bible's
   table).
2. Run from the repo root:

   ```
   python tools/food-for-thought/build_food_for_thought.py
   ```

   It gives each topic an id from its name, checks its areas, checks every reference in `food`
   and `read`, fills `food` with the exact KJV text, refuses verses the database has damaged,
   checks that every 'single-quoted' phrase in `feeds` is word for word in the KJV
   (`tools/kjv_quotes.py`), refuses single quotes in `serving`, `guards` and `hunger`, and
   resolves every `see_also` link against the other guides' data, taking its label from there.
   It exits non-zero on any problem.

The home page serves one topic a day in the order of the file, so adding or moving topics
changes which one falls on which day.

## The guide

Food keeps the body strong; this guide is about food for the soul: the truths from Scripture
that, taken in daily, keep a person strong against wrongdoing in thought, in the body and in
their walk with God. It works before temptation comes, as a daily diet, rather than as a remedy
afterwards. Where another guide already covers a subject (Temptation, Guard your heart, Think on
these things), a topic links to it under "See also" instead of retelling it.

The plan, with the research behind it, is `docs/food-for-thought-study-guide.pdf`.

## Cautions

- **Body section.** Stay with what Scripture says about self-control, soberness, rest and
  diligence. No health, diet or medical advice.
- **Non-sectarian.** Keep to what the KJV text says. Leave out disputed practices such as clean
  and unclean foods, and take no side where churches differ, such as on alcohol: the KJV
  warns against drunkenness and excess, and the entries say no more than that.
- **KJV wording.** Quote the KJV exactly, in 'single quotes'. The KJV says a talebearer's
  words are "as wounds" (Proverbs 18:8); "dainty morsels" comes from other translations.
- **Damaged verses.** Some verses in the database carry the next psalm's heading or a Psalm 119
  letter at the end (Psalm 19:14, 139:24, 119:104). The build refuses them in `food`; pick a
  neighbouring verse, and keep the whole passage in `read`.

## Topic fields

| Field | Meaning |
|---|---|
| `name` | The topic, in KJV words where it can be ("Not by bread alone"). |
| `person` | Section 7 only: whose story it is (Eve, Esau…). |
| `areas` | `Mind`, `Body` and/or `Spirit`, shown with the badges in `assets/images/food-for-thought-assets/`. |
| `food` | The key verse(s); the build adds the exact KJV text. Shown as "The food". |
| `read` | The passage(s) to read, shown as pills that open them. |
| `guards` | What it guards against, in plain words. |
| `feeds` | How it feeds you: a short explanation, quoting the KJV in 'single quotes'. |
| `serving` | One small practice for today, in our own words: "A serving in our own words". |
| `hunger` | Two or three signs that the soul is underfed in this area, in our own words. |
| `chew` | A question to reflect on. |
| `see_also` | `[(page, id)]`: related entries in Questions We All Ask, Commandments of God, Following God's Blueprint, Poems, Songs and Wisdom, Bible Characters or Heroes and Villains. |
