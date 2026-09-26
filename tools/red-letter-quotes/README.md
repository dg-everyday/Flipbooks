# Red-Lettered Quotes data

Builds `assets/red-letter-quotes.json`, which `apps/pages/red-lettered-quotes.html` reads.

1. Edit `content/sayings.py` to add or change an explained saying.
2. Run from the repo root:

   ```
   python tools/red-letter-quotes/build_red_letter_quotes.py
   ```

It reads `assets/red-letter.json` (the character ranges of Jesus' words in each verse, built by
`tools/red-letter/build_red_letter.py`) and `assets/db/dailygrace.db`, and writes two things:

- **passages**: every run of consecutive red-letter verses in a chapter, keeping only the red
  words, grouped Matthew, Mark, Luke, John, Acts and the letters, Revelation;
- **sayings**: the hand-written sayings, each with its red words filled in.

It checks that every verse of a saying's reference carries red letters, that `also_in`
references exist, and that every 'single-quoted' phrase is word for word in the KJV
(`tools/kjv_quotes.py`). It exits non-zero on any problem. Put anything that is not Scripture in
“double quotes”.

The page shows the older commentary on each passage straight from `assets/explanations/`
(see `tools/explanations/README.md`); this build does not copy it.

## Saying fields

| Field | Meaning |
|---|---|
| `name` | Its best-known words, used as the title. |
| `theme` | I am, The Sermon on the Mount, Parables, Invitations and promises, Commands and challenges, Questions he asked, His prayers, From the cross, After the resurrection, From heaven. |
| `reference` | Every verse must be red; the page shows only the red words. |
| `also_in` | Parallel accounts (optional). |
| `context`, `meaning`, `today` | Where, when and to whom; what it means; what it asks of us. |
