# Bible sayings tooling

`build_sayings.py` builds `assets/bible-sayings.json`, a list of everyday English
sayings that come from the Bible ("the writing on the wall", "go the extra
mile"), from the hand-written source in `tools/sayings/sayings.json`.

```sh
python tools/sayings/build_sayings.py --dry-run
python tools/sayings/build_sayings.py
```

Every reference is checked against the KJV text in `assets/db/dailygrace.db`,
and each row's `check` phrase must appear in the text of its primary
reference, so a mistyped verse number fails the build instead of shipping. If
any row fails, nothing is written.

## Adding a saying

Append an object to `sayings.json`; order doesn't matter, the output is sorted
into canonical order by primary reference.

```json
{
    "saying": "A drop in the bucket",
    "variants": ["A drop in the ocean"],
    "references": ["Isaiah 40:15"],
    "check": "drop of a bucket",
    "wording": "adapted",
    "theme": "Wisdom & Folly",
    "meaning": "An amount far too small to matter.",
    "explanation": "\"Behold, the nations are as a drop of a bucket\" beside the greatness of God."
}
```

| field | meaning |
| --- | --- |
| `saying` | the saying as people say it today; its slug becomes the `id`, so it must be unique |
| `variants` | other common wordings, may be empty |
| `references` | `Book chapter:verse` or `Book chapter:verse-verse`, book names as in the database's `books` table (`Psalms`, `Song of Solomon`). The first is the primary reference |
| `check` | a phrase that must appear in the primary reference's KJV text (case-insensitive) |
| `wording` | `exact`: the phrase is in the KJV; `adapted`: the saying rewords the verse; `allusion`: it names a person, object or story |
| `theme` | one of the existing themes; the build prints the list |
| `meaning` | what the saying means in everyday use |
| `explanation` | where it comes from in the Bible and what it meant there |

Leave out sayings whose modern sense doesn't come from Scripture ("sour grapes"
is Aesop, "bitter end" is nautical) and ones that aren't in the Bible at all
("God helps those who help themselves").

## assets/bible-sayings.json

The source fields minus `check`, plus:

| field | meaning |
| --- | --- |
| `id` | slug of `saying` |
| `reference` | the primary reference |
| `kjv_text` | KJV text of the primary reference, apostrophes straightened |
| `book` | book of the primary reference |
| `testament` | `Old` or `New` |
