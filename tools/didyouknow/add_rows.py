# -*- coding: utf-8 -*-
"""
Append new Did You Know rows to assets/db/didyouknow.db.

Input is a JSON array of objects with Title, Fact, Reference_verse and Book.
Every reference is checked against the KJV text in assets/db/dailygrace.db, rows
are rejected if they repeat a reference or a title already in the database, and
Similar_books is derived from each row's own Title + Fact by similar_books.py.

    python tools/didyouknow/add_rows.py new_rows.json --dry-run
    python tools/didyouknow/add_rows.py new_rows.json
"""
import argparse, json, os, re, sqlite3, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from similar_books import similar_books_str

BIBLE_DB = os.path.join(ROOT, "assets", "db", "dailygrace.db")
DYK_DB = os.path.join(ROOT, "assets", "db", "didyouknow.db")

REQUIRED = ("Title", "Fact", "Reference_verse", "Book")


def load_bible():
    con = sqlite3.connect(BIBLE_DB)
    abbr = {name: bid for _, bid, name in
            con.execute("SELECT book_number, book_id, book_name FROM books")}
    return con, abbr


def check(rows, bible, abbr, known_refs, known_titles):
    """Return a list of (row index, reason) for everything that fails."""
    problems = []
    seen_refs, seen_titles = set(), set()
    for i, row in enumerate(rows):
        missing = [k for k in REQUIRED if not row.get(k)]
        if missing:
            problems.append((i, "missing field(s): %s" % ", ".join(missing)))
            continue

        ref, book, title = row["Reference_verse"], row["Book"], row["Title"]
        m = re.match(r"^(.+) (\d+):(\d+)$", ref)
        if not m:
            problems.append((i, "reference %r is not 'Book chapter:verse'" % ref))
            continue
        if m.group(1) != book:
            problems.append((i, "Book %r does not match reference %r" % (book, ref)))
        if book not in abbr:
            problems.append((i, "unknown book name %r" % book))
            continue
        found = bible.execute(
            "SELECT 1 FROM verses WHERE book=? AND chapter=? AND verse=?",
            (abbr[book], int(m.group(2)), int(m.group(3))),
        ).fetchone()
        if not found:
            problems.append((i, "%s is not a verse in the KJV text" % ref))

        if ref in known_refs:
            problems.append((i, "%s is already in the database" % ref))
        if ref in seen_refs:
            problems.append((i, "%s is repeated in this batch" % ref))
        seen_refs.add(ref)

        key = title.strip().lower()
        if key in known_titles:
            problems.append((i, "title %r is already in the database" % title))
        if key in seen_titles:
            problems.append((i, "title %r is repeated in this batch" % title))
        seen_titles.add(key)
    return problems


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("batch", help="JSON file holding the new rows")
    ap.add_argument("--dry-run", action="store_true",
                    help="check and preview without writing to the database")
    args = ap.parse_args()

    rows = json.load(open(args.batch, encoding="utf-8"))
    if not isinstance(rows, list):
        raise SystemExit("expected a JSON array of row objects")

    bible, abbr = load_bible()
    dyk = sqlite3.connect(DYK_DB)
    known_refs = {r[0] for r in dyk.execute("SELECT Reference_verse FROM did_you_know")}
    known_titles = {r[0].strip().lower() for r in dyk.execute("SELECT Title FROM did_you_know")}

    problems = check(rows, bible, abbr, known_refs, known_titles)
    if problems:
        print("%d problem(s) found, nothing written:" % len(problems))
        for i, why in problems:
            print("  row %d (%s): %s" % (i, rows[i].get("Reference_verse", "?"), why))
        raise SystemExit(1)

    next_id = (dyk.execute("SELECT MAX(id) FROM did_you_know").fetchone()[0] or 0) + 1
    prepared = []
    for row in rows:
        prepared.append({
            "id": next_id,
            "Title": row["Title"],
            "Fact": row["Fact"],
            "Reference_verse": row["Reference_verse"],
            "Book": row["Book"],
            "Similar_books": similar_books_str(
                row["Title"], row["Fact"], row["Book"], next_id),
        })
        next_id += 1

    for r in prepared:
        print("%5d %-22s %-18s -> %s" % (r["id"], r["Reference_verse"], r["Book"], r["Similar_books"]))

    if args.dry_run:
        print("\ndry run: %d row(s) checked, database untouched" % len(prepared))
        return

    dyk.executemany(
        "INSERT INTO did_you_know (id, Title, Fact, Reference_verse, Book, Similar_books)"
        " VALUES (:id, :Title, :Fact, :Reference_verse, :Book, :Similar_books)",
        prepared,
    )
    dyk.commit()
    total = dyk.execute("SELECT COUNT(*) FROM did_you_know").fetchone()[0]
    print("\nadded %d row(s); the table now holds %d" % (len(prepared), total))


if __name__ == "__main__":
    main()
