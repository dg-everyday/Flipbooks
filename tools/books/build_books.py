"""Build assets/bible-books.json for apps/pages/bible-books.html.

The hand-written content lives in tools/books/content/*.py: groups.py defines the
groups (Law, History, ...) and each other module a BOOKS list. This script:

  * checks every one of the 66 books in assets/db/dailygrace.db is written exactly
    once, and in a group that exists,
  * counts chapters and verses for each book, group and testament from the KJV,
  * fills key_verses[].text with the exact KJV wording,
  * checks every outline range, reference and key chapter resolves,
  * checks `peoples` ids point at files in assets/peoples,
  * writes assets/bible-books.json.

Run from the repo root:  python tools/books/build_books.py
Exits non-zero if anything does not resolve.
"""
import importlib
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE.parent / "people"))
sys.path.insert(0, str(HERE))

from build_people import Bible, DB  # noqa: E402  (reuse the verse resolver)

OUT = ROOT / "assets" / "bible-books.json"
PEOPLES = ROOT / "assets" / "peoples"
CONTENT = ["law", "history", "poetry", "prophets", "gospels_acts", "epistles"]


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def main():
    bible = Bible(DB)
    errors = []

    groups = importlib.import_module("content.groups").GROUPS
    group_ids = [g["id"] for g in groups]

    books = []
    for module in CONTENT:
        books.extend(importlib.import_module(f"content.{module}").BOOKS)

    # --- the database's view of the canon: order, chapters, verses
    canon = bible.db.execute(
        "select b.book_number, b.book_name, count(distinct v.chapter), count(*) "
        "from books b join verses v on v.book = b.book_id "
        "group by b.book_number order by b.book_number").fetchall()
    canon_names = [row[1] for row in canon]
    counts = {name: (order, ch, vs) for order, (_, name, ch, vs) in
              zip(range(1, 67), canon)}

    written = [b["name"] for b in books]
    for name in canon_names:
        n = written.count(name)
        if n != 1:
            errors.append(f"{name}: written {n} times (expected once)")
    for name in written:
        if name not in counts:
            errors.append(f"{name}: not a book in the database")

    peoples = {p.stem for p in PEOPLES.glob("*.json") if p.stem != "index"}

    def check(ref, where):
        try:
            return bible.verses(ref)
        except ValueError as e:
            errors.append(f"{where}: {e}")
            return None

    # --- finish each book
    for book in books:
        name = book["name"]
        if name not in counts:
            continue
        order, chapters, verses = counts[name]
        book["id"] = slug(name)
        book["order"] = order
        book["chapters"] = chapters
        book["verses"] = verses
        if book.get("group") not in group_ids:
            errors.append(f"{name}: unknown group {book.get('group')!r}")

        for part in book.get("outline", []):
            check(f"{name} {part['chapters']}", f"{name} outline")

        kvs = []
        for ref in book.get("key_verses", []):
            lines = check(ref, f"{name} key verse")
            if lines:
                kvs.append({"reference": ref, "text": " ".join(lines)})
        book["key_verses"] = kvs

        for pid in book.get("peoples", []):
            if pid not in peoples:
                errors.append(f"{name}: unknown peoples id {pid!r}")

    # --- groups and testaments, in canonical order
    books.sort(key=lambda b: b.get("order", 999))
    out_groups = []
    for g in groups:
        members = [b for b in books if b.get("group") == g["id"]]
        for kc in g.get("key_chapters", []):
            check(kc["reference"], f"group {g['id']} key chapter")
        out_groups.append({
            **g,
            "book_count": len(members),
            "chapters": sum(b["chapters"] for b in members),
            "verses": sum(b["verses"] for b in members),
            "books": members,
        })

    testaments = []
    for t in ("Old", "New"):
        tb = [b for g in out_groups if g["testament"] == t for b in g["books"]]
        testaments.append({
            "name": f"{t} Testament",
            "testament": t,
            "books": len(tb),
            "chapters": sum(b["chapters"] for b in tb),
            "verses": sum(b["verses"] for b in tb),
        })

    doc = {
        "totals": {
            "books": len(books),
            "chapters": sum(b["chapters"] for b in books if "chapters" in b),
            "verses": sum(b["verses"] for b in books if "verses" in b),
        },
        "testaments": testaments,
        "groups": out_groups,
    }
    OUT.write_text(json.dumps(doc, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")

    t = doc["totals"]
    print(f"{t['books']} books, {t['chapters']} chapters, {t['verses']} verses; "
          f"{len(out_groups)} groups written to {OUT.relative_to(ROOT)}.")
    if errors:
        print(f"{len(errors)} problem(s):")
        for e in errors:
            print("  " + e)
        sys.exit(1)


if __name__ == "__main__":
    main()
