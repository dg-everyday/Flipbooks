# Did You Know tooling

Scripts behind `assets/db/didyouknow.db`, the table that backs the Did You Know
cards. The table is `did_you_know`:

| column | meaning |
| --- | --- |
| `id` | 1–501 came from `assets/did-you-know.json`, 502 onward were written for the database |
| `Title` | short headline for the card |
| `Fact` | the body text |
| `Reference_verse` | single verse, always `Book chapter:verse` |
| `Book` | the book the verse is in — the correct answer for the trivia question |
| `Similar_books` | four comma-separated books, used as wrong answers |

`Similar_books` never contains the row's own `Book`, and at least two of the four
come from the same testament, so drawing any two at random still gives a fair
set of options next to the correct one.

## similar_books.py

Derives the four books from a row's own `Title` and `Fact`: thematic keyword
matching, the people and places the text names, any book mentioned outright, and
the answer's own corner of the canon. Same input always gives the same output.

```sh
python tools/didyouknow/similar_books.py "<Title>" "<Fact>" "<Book>"
```

Import it instead if you are scripting: `similar_books()` returns a list,
`similar_books_str()` returns the comma-separated string stored in the column.

## add_rows.py

Appends rows to the database. Input is a JSON array of objects with `Title`,
`Fact`, `Reference_verse` and `Book` — leave `Similar_books` out, it is derived.

```sh
python tools/didyouknow/add_rows.py new_rows.json --dry-run
python tools/didyouknow/add_rows.py new_rows.json
```

Before writing anything it checks every reference against the KJV text in
`assets/db/dailygrace.db`, confirms the `Book` column matches the reference, and
rejects any row whose reference or title already exists. If any row fails, the
whole batch is refused and nothing is written. New ids continue from the current
maximum.
