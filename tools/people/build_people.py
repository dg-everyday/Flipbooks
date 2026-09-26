"""Verify and finish the Bible peoples data in assets/peoples.

Each assets/peoples/<id>.json is hand-authored. This script:

  * checks every scripture reference in the file ("reference" strings and
    "references" lists, at any depth) against the KJV in assets/db/dailygrace.db,
  * fills key_verses[].text with the exact KJV wording of its reference,
  * checks related_peoples ids point at real files,
  * writes assets/peoples/index.json (one summary row per people, like stories.json).

Run from the repo root:  python tools/people/build_people.py
Exits non-zero if any reference cannot be resolved.
"""
import json
import re
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PEOPLE = ROOT / "assets" / "peoples"
DB = ROOT / "assets" / "db" / "dailygrace.db"
INDEX = PEOPLE / "index.json"

# "Genesis 19", "Genesis 19:37", "Genesis 19:36-38", "Genesis 37-50", "Exodus 1:8-2:10"
REF = re.compile(r"^(?P<book>(?:[123] )?[A-Za-z ]+?) (?P<c1>\d+)(?::(?P<v1>\d+))?"
                 r"(?:-(?:(?P<c2>\d+):)?(?P<v2>\d+))?$")


class Bible:
    def __init__(self, path):
        self.db = sqlite3.connect(path)
        self.books = dict(self.db.execute("select book_name, book_id from books"))

    def verses(self, ref):
        """Return the list of verse texts for a reference, or raise ValueError."""
        m = REF.match(ref.strip())
        if not m or m["book"] not in self.books:
            raise ValueError(f"unparseable reference {ref!r}")
        book = self.books[m["book"]]
        c1 = int(m["c1"])
        if m["v1"] is None:                      # whole chapter(s): "Book 3" or "Book 3-5"
            c2 = int(m["v2"]) if m["v2"] else c1
            rows = self.db.execute(
                "select text from verses where book=? and chapter between ? and ? "
                "order by chapter, verse", (book, c1, c2)).fetchall()
            if not rows or self._last_chapter(book) < c2:
                raise ValueError(f"no such chapter(s) {ref!r}")
            return [r[0] for r in rows]
        v1 = int(m["v1"])
        c2 = int(m["c2"]) if m["c2"] else c1
        v2 = int(m["v2"]) if m["v2"] else v1
        if (c2, v2) < (c1, v1):
            raise ValueError(f"backwards range {ref!r}")
        for c, v in ((c1, v1), (c2, v2)):
            if not self.db.execute("select 1 from verses where book=? and chapter=? and verse=?",
                                   (book, c, v)).fetchone():
                raise ValueError(f"no such verse {m['book']} {c}:{v} in {ref!r}")
        rows = self.db.execute(
            "select text from verses where book=? and (chapter > ? or (chapter = ? and verse >= ?)) "
            "and (chapter < ? or (chapter = ? and verse <= ?)) order by chapter, verse",
            (book, c1, c1, v1, c2, c2, v2)).fetchall()
        return [r[0] for r in rows]

    def _last_chapter(self, book):
        return self.db.execute("select max(chapter) from verses where book=?", (book,)).fetchone()[0]


def walk_refs(node, path=""):
    """Yield (json_path, reference) for every reference in the document."""
    if isinstance(node, dict):
        for k, v in node.items():
            p = f"{path}.{k}"
            if k == "reference" and isinstance(v, str):
                yield p, v
            elif k == "references" and isinstance(v, list):
                for i, r in enumerate(v):
                    yield f"{p}[{i}]", r
            else:
                yield from walk_refs(v, p)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from walk_refs(v, f"{path}[{i}]")


def main():
    bible = Bible(DB)
    files = sorted(p for p in PEOPLE.glob("*.json") if p != INDEX)
    ids = {p.stem for p in files}
    errors, index, total_refs = [], [], 0

    for path in files:
        doc = json.loads(path.read_text(encoding="utf-8"))
        if doc.get("id") != path.stem:
            errors.append(f"{path.name}: id {doc.get('id')!r} does not match file name")

        for where, ref in walk_refs(doc):
            total_refs += 1
            try:
                bible.verses(ref)
            except ValueError as e:
                errors.append(f"{path.name}{where}: {e}")

        for kv in doc.get("key_verses", []):
            try:
                kv["text"] = " ".join(bible.verses(kv["reference"]))
            except ValueError:
                pass                                   # already reported above

        for rid in doc.get("related_peoples", []):
            if rid not in ids:
                errors.append(f"{path.name}: related_peoples has unknown id {rid!r}")

        path.write_text(json.dumps(doc, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")

        home = doc.get("homeland", {})
        index.append({
            "id": doc["id"],
            "name": doc["name"],
            "kjv_names": doc.get("kjv_names", []),
            "category": doc.get("category"),
            "group": doc.get("group"),
            "summary": doc.get("summary"),
            "ancestor": doc.get("lineage", {}).get("ancestor"),
            "region": home.get("region"),
            "modern_countries": home.get("modern_countries", []),
            "center": home.get("center"),
            "testaments": doc.get("testaments", []),
            "file": f"assets/peoples/{path.name}",
        })

    index.sort(key=lambda r: r["name"])
    INDEX.write_text(json.dumps(index, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"{len(files)} peoples, {total_refs} scripture references checked, index written.")
    if errors:
        print(f"{len(errors)} problem(s):")
        for e in errors:
            print("  " + e)
        sys.exit(1)


if __name__ == "__main__":
    main()
