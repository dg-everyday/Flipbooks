# Poems, Songs and Wisdom data

Builds `assets/poems-songs-and-wisdom.json`, which `apps/pages/poems-songs-and-wisdom.html`
reads. The page was called Songs in the Bible (`songs-in-the-bible.html`); that address now
forwards here, keeping the `#id`, so old links to a song still open it. Keep the songs' ids.

The page is in three parts, one per kind, in the order of its title:

- **Poems** (`content/poems.py`): poems of the prophets, poems of the New Testament.
- **Songs** (`content/history.py`: songs of victory, worship and thanksgiving, laments;
  `content/psalms.py`: psalms and songs of Solomon, songs of the prophets; `content/gospel.py`:
  songs of the coming King, songs of the church and of heaven).
- **Wisdom** (`content/wisdom.py`): Proverbs for every day, wisdom for hard questions (Job and
  Ecclesiastes), wisdom of Jesus and the apostles.

The kinds and their groups are listed once, in `KINDS` in `build_poetry.py`; the build sets each
entry's `kind` from its group.

1. Edit the content files.
2. Run from the repo root:

   ```
   python tools/poetry/build_poetry.py
   ```

   It gives each entry an id from its name (or use an explicit `id`), checks the group and
   testament, checks every reference in `told_in`, `also_in`, `words` and `key_verses`, fills
   `words` with the passage's own words (one line per verse) and the key verses with the exact
   KJV text, checks that `hero` ids exist on the Heroes and Villains page, and checks that every
   'single-quoted' phrase is word for word in the KJV (`tools/kjv_quotes.py`). It exits
   non-zero on any problem.

Quote Scripture in 'single quotes', exactly as `assets/db/dailygrace.db` has it. Put glosses,
hymn titles and phrases that are not Scripture in “double quotes”.

Some verses in the database are damaged: a few have a broken apostrophe (such as Exodus 15:2),
and the last verse of some psalms has the next psalm's title run on to it (such as Psalm 23:6).
The build refuses these in `words` and `key_verses`, so pick a neighbouring verse instead.
Quotes in the text are not affected, as long as the quoted words themselves are whole.

## Choosing the poems and the wisdom

The songs were chosen as the best known. The poems and the wisdom were chosen for how they
shape a Christian's daily life:

- **Poems** are the great poetic passages outside the songbook that believers turn to: comfort
  for the weary (Isaiah 40), the suffering servant (Isaiah 53), God's free invitation (Isaiah
  55), beauty for ashes (Isaiah 61, which Jesus read in Nazareth), swords into plowshares
  (Micah 4), the Word made flesh (John 1), love (1 Corinthians 13), nothing separating us from
  God (Romans 8), Christ above all (Colossians 1) and the victory over death (1 Corinthians 15).
- **Proverbs for every day** cover where wisdom begins, work, words, pride, friendship, plans,
  joy, money and debt, self-control, and Proverbs 31.
- **Wisdom for hard questions** takes Job (loss, hope, where wisdom is found, God's answer) and
  Ecclesiastes (vanity, seasons, companionship, the conclusion).
- **Wisdom of Jesus and the apostles** takes the Beatitudes, salt and light, treasure in heaven,
  the two builders, James on wisdom and the tongue, and Paul on the mind and the cross.

Each entry's `lesson` is shown as "For your daily life": one practical step, in plain words.
Avoid repeating entries on the Commandments of God page (for example "Trust in the LORD with
all thine heart" is there, so it is only a key verse here).

The books say little about their writers, so the entries say only that: Proverbs names Solomon
and others (Agur, King Lemuel's mother); Ecclesiastes names "the Preacher", long identified
with Solomon; the writer of Job is not named.

## How many songs are in the Bible?

The page's introduction says only: "Here are 10 poems, 53 songs and 26 pieces of wisdom, among
the best known and most loved." (The numbers come from the data, so they stay right as entries
are added.) It is a selection, not a complete list, and the page deliberately gives no total for
the whole Bible.

A total is often quoted: "at least 185 songs, 150 of them in the Psalms". An earlier version of
the page said this, with a Caveats pill explaining the count, and both were taken out: the
figure is an estimate that needs too many caveats to state in one line. The notes below,
checked on 27 September 2026, are kept so the question does not have to be researched again.
If a total ever goes back on the page, say "by one count" and name the source.

**Source.** The figure comes from OverviewBible's infographic
[All the songs in the Bible](https://overviewbible.com/bible-songs/), which other sites
repeat, such as
[How Many Songs are in the Bible?](https://www.pastorjasonelder.com/bible-facts-all/how-many-songs-are-in-the-bible).
It counts:

- the 150 psalms,
- 6 songs from the other two songbooks: the Song of Solomon (1) and Lamentations (5 poems),
- about 35 songs, chants, laments and hymns elsewhere in the Old and New Testaments.

That adds up to roughly 185 to 190. It is one website's count, not a scholarly or
church-wide figure, which is why the page says "by one count". The page names the site, not
its author.

**The 150 psalms are solid, with small caveats.**

- Protestant and Catholic Bibles have 150 psalms. Orthodox Bibles add a Psalm 151.
- Not every psalm calls itself a song. Some are headed "A Prayer" (Psalms 17, 86, 90, 102,
  142). But Psalms was Israel's hymnbook, and its Hebrew name, *Tehillim*, means "praises",
  so counting all 150 as songs is fair.
- A few psalms repeat each other: Psalm 18 is 2 Samuel 22; Psalm 53 nearly repeats Psalm 14;
  Psalm 70 repeats Psalm 40:13-17; Psalm 108 joins parts of Psalms 57 and 60; and
  1 Chronicles 16:8-36 is made of parts of Psalms 105, 96 and 106.

**The total depends on what counts as a song.** Is Lamentations one song or five? Is Lamech's
boast (Genesis 4:23-24) a song? Are Philippians 2:6-11 and 1 Timothy 3:16 hymns? Is each chorus
in Revelation a separate song? Different answers give totals from about 175 to over 200. So
quote the number as an estimate, never as an exact fact.

**"Recorded" matters, and "at least" is fair.** The count includes only songs whose words
survive. The Bible mentions many more whose words are lost: Solomon's 1,005 songs
(1 Kings 4:32), the book of Jasher (2 Samuel 1:18), Jeremiah's laments for Josiah
(2 Chronicles 35:25), and the hymn sung after the Last Supper (Matthew 26:30). Several of these
have entries on the page, with a note that the words are not given.

## Entry fields

| Field | Meaning |
|---|---|
| `name`, `epithet` | Name of the entry, and a line from it. |
| `group` | One of the groups in `KINDS` in `build_poetry.py`; the build adds `kind` (Poems, Songs or Wisdom). |
| `testament` | `Old` or `New`. |
| `by`, `with` | `[{name, hero?}]`: who sang, wrote or spoke it, and who else was there. `hero` is an id on heroes-and-villains.html. |
| `by_label` | Replaces the kind's label ("Sung by" for songs, "Written by" for poems and wisdom) for one entry, e.g. "Spoken by". |
| `occasion`, `where` | What it was sung, written or spoken for; where. |
| `told_in`, `also_in` | The passage that tells it; parallels and later echoes. |
| `words` | References for the passage's own words; the build adds the text. Leave it out when the Bible does not give the words. |
| `summary`, `story` | One sentence; the story behind the song. |
| `meaning` | Why it matters. |
| `lesson` | For your daily life: one practical step, in plain words. |
| `key_verses` | Other verses to read with it; the build adds the text. |
