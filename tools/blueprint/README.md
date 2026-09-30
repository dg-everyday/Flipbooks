# Following God's Blueprint data

Builds `assets/following-gods-blueprint.json`, which `apps/pages/following-gods-blueprint.html` reads.

1. Edit `content/blueprint.py`.
2. Run from the repo root:

   ```
   python tools/blueprint/build_blueprint.py
   ```

   It gives each item an id from its name (or use an explicit `id`), checks each item's part,
   checks every reference (verses, examples, the test and its warning signs) and fills in the
   exact KJV text, refuses verses the database has damaged, strips the next psalm's heading that
   the database runs on to a psalm's last verse, marks a verse `red` when every verse in it is
   Jesus' own words (`assets/red-letter.json`), checks that `hero` ids exist on the Heroes and
   Villains page and that `see` links point at a study page, and checks that every
   'single-quoted' phrase is word for word in the KJV (`tools/kjv_quotes.py`). It exits non-zero
   on any problem.

Quote Scripture in 'single quotes', exactly as `assets/db/dailygrace.db` has it. Put anything
that is not Scripture in “double quotes”.

## The plan

The guide is drawn as a set of blueprints (Hebrews 8:5, Matthew 7:24-25), one sheet per part:

| Sheet | Part | What it covers |
|---|---|---|
| 1 | The foundation | God's plan of salvation, from the first promise to being kept by him |
| 2 | Beyond the Ten | How love fulfils the law, the law written on the heart, the fruit of the Spirit. It points to Commandments of God for the Ten themselves |
| 3 | Every day | The daily habits of a Christian |
| 4 | Solving problems God's way | A way to handle conflict and hard choices, with a Bible example for several steps |
| 5 | Understanding the times | Reading our own day by Scripture. What God reveals may be understood more fully in time (Daniel 12:4), but the gospel does not change (Galatians 1:8) |
| 6 | Ready for his return | Watching, faithfulness and holiness, without date-setting |
| 7 | The blueprint test | Twelve questions and six warning signs to measure a decision or a resolution by |

## Fields

| Field | Meaning |
|---|---|
| `PATTERN` | The verses that give the guide its picture, shown at the top of the page. |
| `PARTS` | `name`, `sheet` and `intro` of each sheet, in order. |
| `name`, `part`, `summary`, `plain` | The item, its sheet, the short answer, and the plan in plain words. |
| `verses` | `[{reference, who, hero?, note}]`; `note` says what it means in plain words. The build adds `text` and `red`. |
| `build`, `ask` | A few things to do; one question to ask yourself. |
| `example` | Optional `{title, reference, text}`: the plan at work in someone's life. |
| `see` | Optional `{href, label}`: a related study page in `apps/pages`. |
| `TEST` | `[{question, ask, reference}]`; the build adds `text`. |
| `WARNINGS` | `[{sign, reference}]`; the build adds `text`. |

The test's answers stay on the page; nothing is stored or sent.
