# -*- coding: utf-8 -*-
"""
Build assets/bible-sayings.json from tools/sayings/sayings.json.

Every reference is checked against the KJV text in assets/db/dailygrace.db, and
each row's `check` phrase must appear in the text of its first (primary)
reference. id, reference, kjv_text, book and testament are derived; the output
is sorted into canonical order by primary reference. If any row fails, nothing
is written.

    python tools/sayings/build_sayings.py --dry-run
    python tools/sayings/build_sayings.py
"""
import argparse, json, os, re, sqlite3, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SOURCE = os.path.join(HERE, "sayings.json")
BIBLE_DB = os.path.join(ROOT, "assets", "db", "dailygrace.db")
OUTPUT = os.path.join(ROOT, "assets", "bible-sayings.json")

REQUIRED = ("saying", "references", "check", "wording", "theme", "meaning", "explanation")
WORDINGS = ("exact", "adapted", "allusion")
FIRST_NT_BOOK = 470  # book_number of Matthew


def clean(text):
    """Straighten the database's curly apostrophes and collapse whitespace."""
    text = text.replace("’", "'").replace("‘", "'")
    return re.sub(r"\s+", " ", text).strip()


def slug(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower().replace("'", "")).strip("-")


class Bible:
    def __init__(self, path):
        self.con = sqlite3.connect(path)
        self.books = {name: (num, bid) for num, bid, name in
                      self.con.execute("SELECT book_number, book_id, book_name FROM books")}

    def lookup(self, ref):
        """Return (book, sort key, text) for 'Book ch:v' or 'Book ch:v-v'."""
        m = re.match(r"^(.+) (\d+):(\d+)(?:-(\d+))?$", ref)
        if not m:
            raise ValueError("reference %r is not 'Book chapter:verse[-verse]'" % ref)
        book, ch, first = m.group(1), int(m.group(2)), int(m.group(3))
        last = int(m.group(4) or first)
        if book not in self.books:
            raise ValueError("unknown book name %r in %r" % (book, ref))
        if last < first:
            raise ValueError("verse range %r runs backwards" % ref)
        rows = self.con.execute(
            "SELECT text FROM verses WHERE book=? AND chapter=? AND verse BETWEEN ? AND ?"
            " ORDER BY verse", (self.books[book][1], ch, first, last)).fetchall()
        if len(rows) != last - first + 1:
            raise ValueError("%s is not in the KJV text" % ref)
        return book, (self.books[book][0], ch, first), " ".join(clean(r[0]) for r in rows)


def build(rows, bible):
    """Return (output rows, list of problems)."""
    out, problems, ids = [], [], set()
    for i, row in enumerate(rows):
        label = "#%d %r" % (i, row.get("saying", "?"))
        missing = [k for k in REQUIRED if not row.get(k)]
        if missing:
            problems.append("%s: missing field(s): %s" % (label, ", ".join(missing)))
            continue
        if row["wording"] not in WORDINGS:
            problems.append("%s: wording must be one of %s" % (label, ", ".join(WORDINGS)))
        try:
            for ref in row["references"][1:]:
                bible.lookup(ref)
            book, key, text = bible.lookup(row["references"][0])
        except ValueError as e:
            problems.append("%s: %s" % (label, e))
            continue
        if clean(row["check"]).lower() not in text.lower():
            problems.append("%s: %r is not in %s: %s"
                            % (label, row["check"], row["references"][0], text))
        rid = slug(row["saying"])
        if rid in ids:
            problems.append("%s: id %r is repeated" % (label, rid))
        ids.add(rid)
        out.append((key, i, {
            "id": rid,
            "saying": row["saying"],
            "variants": row.get("variants", []),
            "meaning": row["meaning"],
            "explanation": row["explanation"],
            "reference": row["references"][0],
            "references": row["references"],
            "kjv_text": text,
            "book": book,
            "testament": "New" if key[0] >= FIRST_NT_BOOK else "Old",
            "wording": row["wording"],
            "theme": row["theme"],
        }))
    out.sort(key=lambda t: t[:2])
    return [r for _, _, r in out], problems


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true",
                    help="check every row without writing the output")
    args = ap.parse_args()

    with open(SOURCE, encoding="utf-8") as f:
        rows = json.load(f)
    out, problems = build(rows, Bible(BIBLE_DB))
    if problems:
        print("\n".join(problems))
        print("%d problem(s); nothing written." % len(problems))
        sys.exit(1)

    themes = sorted({r["theme"] for r in out})
    print("%d sayings, %d themes: %s" % (len(out), len(themes), ", ".join(themes)))
    if args.dry_run:
        return
    with open(OUTPUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump(out, f, ensure_ascii=False, indent=4)
        f.write("\n")
    print("wrote %s" % os.path.relpath(OUTPUT, ROOT))


if __name__ == "__main__":
    main()
