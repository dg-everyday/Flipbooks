"""Build assets/heroes-and-villains.json for apps/pages/heroes-and-villains.html.

The hand-written entries live in tools/heroes/content/heroes.py and villains.py.
This script:

  * gives each entry an id (from its name) and checks ids are unique,
  * checks `books` are real book names in assets/db/dailygrace.db,
  * checks every scripture reference (told_in, moment.reference, key_verses),
  * fills key_verses[].text with the exact KJV wording,
  * checks `faced` points at other entries and `peoples` at assets/peoples files,
  * writes assets/heroes-and-villains.json.

Run from the repo root:  python tools/heroes/build_heroes.py
Exits non-zero if anything does not resolve.
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE.parent / "people"))
sys.path.insert(0, str(HERE))

from build_people import Bible, DB  # noqa: E402  (reuse the verse resolver)
from content.heroes import HEROES  # noqa: E402
from content.villains import VILLAINS  # noqa: E402

OUT = ROOT / "assets" / "heroes-and-villains.json"
PEOPLES = ROOT / "assets" / "peoples"


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def book_slug(name):
    # Must match the ids bible-books.html uses (tools/books/build_books.py).
    return slug(name)


def main():
    bible = Bible(DB)
    errors = []
    book_names = set(bible.books)
    peoples = {p.stem for p in PEOPLES.glob("*.json") if p.stem != "index"}

    def check(ref, where):
        try:
            return bible.verses(ref)
        except ValueError as e:
            errors.append(f"{where}: {e}")
            return None

    entries = []
    for side, items in (("hero", HEROES), ("villain", VILLAINS)):
        for item in items:
            entry = {"id": item.get("id") or slug(item["name"]), "side": side, **item}
            entries.append(entry)

    ids = [e["id"] for e in entries]
    for i in set(ids):
        if ids.count(i) > 1:
            errors.append(f"duplicate id {i!r}")

    for e in entries:
        where = e["name"]
        for b in e.get("books", []):
            if b not in book_names:
                errors.append(f"{where}: unknown book {b!r}")
        e["books"] = [{"name": b, "id": book_slug(b)} for b in e.get("books", [])]
        for ref in e.get("told_in", []):
            check(ref, f"{where} told_in")
        if e.get("moment", {}).get("reference"):
            check(e["moment"]["reference"], f"{where} moment")
        kvs = []
        for ref in e.get("key_verses", []):
            lines = check(ref, f"{where} key verse")
            if lines:
                kvs.append({"reference": ref, "text": " ".join(lines)})
        e["key_verses"] = kvs
        for f in e.get("faced", []):
            if f not in ids:
                errors.append(f"{where}: faced unknown id {f!r}")
        for p in e.get("peoples", []):
            if p not in peoples:
                errors.append(f"{where}: unknown peoples id {p!r}")

    heroes = [e for e in entries if e["side"] == "hero"]
    villains = [e for e in entries if e["side"] == "villain"]
    doc = {
        "totals": {"heroes": len(heroes), "villains": len(villains), "people": len(entries)},
        "heroes": heroes,
        "villains": villains,
    }
    OUT.write_text(json.dumps(doc, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"{len(heroes)} heroes, {len(villains)} villains written to {OUT.relative_to(ROOT)}.")
    if errors:
        print(f"{len(errors)} problem(s):")
        for err in errors:
            print("  " + err)
        sys.exit(1)


if __name__ == "__main__":
    main()
