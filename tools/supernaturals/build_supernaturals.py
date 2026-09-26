"""Build assets/supernaturals.json for apps/pages/supernaturals.html.

The hand-written entries live in tools/supernaturals/content/miracles.py,
spirits.py and prophecies.py. This script:

  * gives each entry an id (from its name) and checks ids are unique,
  * checks `group` and `testament`, and that `by` / `with` hero ids point at
    heroes-and-villains entries,
  * checks every scripture reference (told_in, also_in, key_verses),
  * fills key_verses[].text with the exact KJV wording,
  * checks every 'single-quoted' phrase is verbatim KJV (tools/kjv_quotes.py),
  * lists the books each event is told in, for links to bible-books.html,
  * writes assets/supernaturals.json.

Run from the repo root:  python tools/supernaturals/build_supernaturals.py
Exits non-zero if anything does not resolve.
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.dont_write_bytecode = True   # don't leave __pycache__ in tools/people
sys.path.insert(0, str(HERE.parent / "people"))
sys.path.insert(0, str(HERE.parent))
sys.path.insert(0, str(HERE))

from build_people import Bible, DB, REF  # noqa: E402  (reuse the verse resolver)
from kjv_quotes import Quotes  # noqa: E402
from content.miracles import MIRACLES  # noqa: E402
from content.spirits import SPIRITS  # noqa: E402
from content.prophecies import PROPHECIES  # noqa: E402

OUT = ROOT / "assets" / "supernaturals.json"
HEROES = ROOT / "assets" / "heroes-and-villains.json"

GROUPS = [
    "Power over nature",
    "Food and plenty",
    "Healings",
    "Raised from the dead",
    "Casting out demons",
    "Magic and sorcery",
    "Signs, wonders and angels",
    "Prophecies",
]
TESTAMENTS = {"Old", "New"}


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def main():
    bible = Bible(DB)
    quotes = Quotes(bible.db)
    errors = []
    hero_ids = {p["id"] for side in ("heroes", "villains")
                for p in json.loads(HEROES.read_text(encoding="utf-8"))[side]}

    def check(ref, where):
        try:
            return bible.verses(ref)
        except ValueError as e:
            errors.append(f"{where}: {e}")
            return None

    entries = [{"id": item.get("id") or slug(item["name"]), **item} for item in MIRACLES + SPIRITS + PROPHECIES]

    ids = [e["id"] for e in entries]
    for i in set(ids):
        if ids.count(i) > 1:
            errors.append(f"duplicate id {i!r}")

    for e in entries:
        where = e["name"]
        if e.get("group") not in GROUPS:
            errors.append(f"{where}: group {e.get('group')!r} is not one of {GROUPS}")
        if e.get("testament") not in TESTAMENTS:
            errors.append(f"{where}: testament must be Old or New")
        for person in e.get("by", []) + e.get("with", []):
            if person.get("hero") and person["hero"] not in hero_ids:
                errors.append(f"{where}: unknown hero id {person['hero']!r}")
        for field in ("summary", "story", "meaning", "lesson"):
            for problem in quotes.problems(e.get(field)):
                errors.append(f"{where} {field}: {problem}")

        accounts, books = [], []
        for ref in [e["told_in"], *e.get("also_in", [])]:
            if check(ref, f"{where} told_in/also_in") is not None:
                book = REF.match(ref).group("book")
                accounts.append(ref)
                if book not in books:
                    books.append(book)
        e["accounts"] = accounts
        e["books"] = [{"name": b, "id": slug(b)} for b in books]

        kvs = []
        for ref in e.get("key_verses", []):
            lines = check(ref, f"{where} key verse")
            if lines:
                kvs.append({"reference": ref, "text": " ".join(lines)})
        e["key_verses"] = kvs

    entries.sort(key=lambda e: GROUPS.index(e["group"]) if e["group"] in GROUPS else 99)
    doc = {
        "totals": {
            "entries": len(entries),
            "old": sum(1 for e in entries if e["testament"] == "Old"),
            "new": sum(1 for e in entries if e["testament"] == "New"),
            "groups": {g: sum(1 for e in entries if e["group"] == g) for g in GROUPS},
        },
        "groups": GROUPS,
        "entries": entries,
    }
    OUT.write_text(json.dumps(doc, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"{len(entries)} entries written to {OUT.relative_to(ROOT)}.")
    for g, n in doc["totals"]["groups"].items():
        print(f"  {g:<28} {n}")
    if errors:
        print(f"{len(errors)} problem(s):")
        for err in errors:
            print("  " + err)
        sys.exit(1)


if __name__ == "__main__":
    main()
