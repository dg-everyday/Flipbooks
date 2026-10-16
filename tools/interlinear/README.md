# Interlinear tooling

`build_interlinear.py` builds `assets/interlinear/`: every verse word by word
in the Hebrew or the Greek, for the Interlinear tab of `<passage-reader>` (the
popup that opens from an outline row on the Books of the Bible page).

## Files

`assets/interlinear/<book_id>/<chapter>.json`, where `book_id` is the id from
the `books` table of `dailygrace.db` (`Gen`, `Ps`, `John`, …):

```json
{
  "lang": "he",
  "verses": {
    "1": [
      ["בְּרֵאשִׁית", "be·re·shit", "in beginning", "H7225", "R/Ncfsa"],
      ["בָּרָא", "ba·ra'", "he created", "H1254", "Vqp3ms"]
    ]
  }
}
```

- `lang` is `he` (Hebrew, read right to left) or `grc` (Greek, left to right).
- Each word is `[original, transliteration, gloss, strongs, grammar]`, in the
  order of the original, with a sixth item `"arc"` for a word in Aramaic: the
  4,826 words of Daniel 2:4–7:28 (from partway through 2:4), Ezra 4:8–6:18
  and 7:12–26, and Jeremiah 10:11. Aramaic is written with the Hebrew letters
  and reads right to left, so these chapters keep `lang` `he`. The reader
  notes where the text turns to Aramaic and back; the explanation popup says
  "in the Aramaic" above such a verse. `strongs` is empty where STEPBible gives no ordinary
  Strong's number. `grammar` is STEPBible's morphology code.
- Verses are numbered as in the KJV, so a verse of `dailygrace.db` always finds
  its words. A psalm's title is verse `"0"` (116 psalms).

## Sources

The STEPBible "Translators Amalgamated" files (TAHOT for the Hebrew, TAGNT for
the Greek), from https://github.com/STEPBible/STEPBible-Data, folder
"Translators Amalgamated OT+NT". They are CC BY 4.0 (STEPBible.org, Tyndale
House, Cambridge), so the reader credits them at the end of the tab. Download
the six files to a folder outside the repo:

    TAHOT Gen-Deu …, TAHOT Jos-Est …, TAHOT Job-Sng …, TAHOT Isa-Mal …
    TAGNT Mat-Jhn …, TAGNT Act-Rev …

What is kept:

- **Hebrew:** the Leningrad text with its scribal readings and restorations.
  The words STEPBible adds from the Greek Septuagint (type `X`, 152 words) are
  left out, as the KJV does not have them. Cantillation marks are removed; the
  vowel points and the maqaf stay.
- **Greek:** only the words "used by the KJV translators" (type `K`, Scrivener's
  1894 text). That leaves out 5,669 words found only in the modern critical
  editions, so the interlinear follows the Greek behind the KJV.
- **Grammar:** STEPBible starts each Old Testament code with its language,
  `H` or `A`; the build takes it off (`HVqp3ms` is `Vqp3ms`) and marks the
  Aramaic words `"arc"` instead.

The Hebrew glosses are put in English order. STEPBible glosses each part of
a word in the Hebrew's order, so a noun's pronoun suffix comes last: וּלְבָבִי is
"and/ heart/ my". The build moves a possessive (my, your, his, her, its, our,
their) before its noun: "and my heart", "[is] in your gates", "[the] place of
his head", "your [male] servant". It is left where English keeps the order
("blood of your") and after verbs and prepositions ("he put him", "to them").
About 22,700 glosses change. Aramaic's article is a suffix as well
("gods/ the", "king/ O"); it is moved before its word the same way ("the
gods", "O king"), 866 glosses.

The reader and the explanation popup also print the glosses in order as one
line under the words ("Word for word: …"), so the order is plain however the
right-to-left words wrap.

Where the numbering differs, STEPBible gives the English number first and the
Hebrew in `()` or the KJV's Greek in `{}`; in the Greek, a number in `[]` is
the English one and is used instead. The glosses' leading verse markers
(`[13] `, `{14.24} `) and the `[[ ]]` round disputed Greek are removed.

## Build

```sh
python tools/interlinear/build_interlinear.py <STEPBible folder>
```

It replaces `assets/interlinear/` and writes `report.txt`: the word counts and
any KJV verse without words, or STEPBible verse without a KJV verse. Both lists
should be empty. `dailygrace.db` is only read, for the book ids and verses.

## Known

The Greek includes the subscriptions printed after some epistles in the
Textus Receptus ("to Corinthians second it was written from Philippi…"), as
words of the last verse.
