"""Build assets/flora-and-fauna.json for apps/pages/flora-and-fauna.html.

The hand-written entries live in tools/flora-fauna/content/plants.py and animals.py.
This script:

  * gives each entry an id (from its name) and checks ids are unique,
  * checks `kind` and `group`, and that `heroes` point at heroes-and-villains ids,
  * checks every scripture reference (who[].reference, key_verses),
  * checks each of those passages really mentions the plant or animal (`terms`),
  * fills key_verses[].text with the exact KJV wording,
  * checks every 'single-quoted' phrase is verbatim KJV (tools/kjv_quotes.py),
  * counts the KJV verses that mention it (`terms`), in which testament, where it
    is first mentioned, and the books that mention it most,
  * writes assets/flora-and-fauna.json.

Run from the repo root:  python tools/flora-fauna/build_flora_fauna.py
Exits non-zero if anything does not resolve.
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.dont_write_bytecode = True   # don't leave __pycache__ in tools/people
sys.path.insert(0, str(HERE.parent / "people"))
sys.path.insert(0, str(HERE.parent))
sys.path.insert(0, str(HERE))

from build_people import Bible, DB  # noqa: E402  (reuse the verse resolver)
from kjv_quotes import Quotes  # noqa: E402
from content.plants import PLANTS  # noqa: E402
from content.animals import ANIMALS  # noqa: E402

OUT = ROOT / "assets" / "flora-and-fauna.json"
HEROES = ROOT / "assets" / "heroes-and-villains.json"

GROUPS = {
    "plant": ["Trees", "Vines and crops", "Herbs, flowers and spices", "Wild plants"],
    "animal": ["Flocks and herds", "Wild animals", "Birds", "Creatures of the water", "Creeping things"],
}
TOP_BOOKS = 4
NEW_TESTAMENT_FROM = "Matt"   # book id of the first New Testament book


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def main():
    bible = Bible(DB)
    quotes = Quotes(bible.db)
    errors = []
    hero_ids = {p["id"] for side in ("heroes", "villains")
                for p in json.loads(HEROES.read_text(encoding="utf-8"))[side]}

    # Every verse once, in canonical order, for counting mentions.
    book_names = {bid: name for name, bid in bible.books.items()}
    rows = bible.db.execute(
        "select v.book, v.chapter, v.verse, v.text, b.book_number from verses v "
        "join books b on b.book_id = v.book order by b.book_number, v.chapter, v.verse").fetchall()
    nt_start = bible.db.execute("select book_number from books where book_id=?",
                                (NEW_TESTAMENT_FROM,)).fetchone()[0]

    def check(ref, where):
        try:
            return bible.verses(ref)
        except ValueError as e:
            errors.append(f"{where}: {e}")
            return None

    entries = []
    for kind, items in (("plant", PLANTS), ("animal", ANIMALS)):
        for item in items:
            entries.append({"id": item.get("id") or slug(item["name"]), "kind": kind, **item})

    ids = [e["id"] for e in entries]
    for i in set(ids):
        if ids.count(i) > 1:
            errors.append(f"duplicate id {i!r}")

    for e in entries:
        where = e["name"]
        if e.get("group") not in GROUPS[e["kind"]]:
            errors.append(f"{where}: group {e.get('group')!r} is not one of {GROUPS[e['kind']]}")
        terms = re.compile(e.pop("terms"), re.I)
        texts = [e.get(f) for f in ("summary", "why", "importance", "lesson", "law")]
        texts += e.get("uses", []) + [w["what"] for w in e.get("who", [])]
        for text in texts:
            for problem in quotes.problems(text):
                errors.append(f"{where}: {problem}")

        def mentions(lines, what):
            if lines and not any(terms.search(line) for line in lines):
                errors.append(f"{where}: {what} does not mention it")

        for w in e.get("who", []):
            mentions(check(w["reference"], f"{where} who"), f"who {w['reference']}")
            if w.get("hero") and w["hero"] not in hero_ids:
                errors.append(f"{where}: unknown hero id {w['hero']!r}")

        kvs = []
        for ref in e.get("key_verses", []):
            lines = check(ref, f"{where} key verse")
            mentions(lines, f"key verse {ref}")
            if lines:
                kvs.append({"reference": ref, "text": " ".join(lines)})
        e["key_verses"] = kvs

        hits = [r for r in rows if terms.search(r[3])]
        if not hits:
            errors.append(f"{where}: `terms` match no verse")
            continue
        per_book = Counter(r[0] for r in hits)
        first = hits[0]
        e["mentions"] = {
            "verses": len(hits),
            "old": sum(1 for r in hits if r[4] < nt_start),
            "new": sum(1 for r in hits if r[4] >= nt_start),
            "first": {"reference": f"{book_names[first[0]]} {first[1]}:{first[2]}", "text": first[3]},
            "books": [{"name": book_names[b], "id": slug(book_names[b]), "verses": n}
                      for b, n in per_book.most_common(TOP_BOOKS)],
        }

    plants = [e for e in entries if e["kind"] == "plant"]
    animals = [e for e in entries if e["kind"] == "animal"]
    for group in (plants, animals):
        group.sort(key=lambda e: GROUPS[e["kind"]].index(e["group"]) if e["group"] in GROUPS[e["kind"]] else 99)
    doc = {
        "totals": {"plants": len(plants), "animals": len(animals), "entries": len(entries)},
        "groups": GROUPS,
        "plants": plants,
        "animals": animals,
    }
    OUT.write_text(json.dumps(doc, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"{len(plants)} plants, {len(animals)} animals written to {OUT.relative_to(ROOT)}.")
    for e in entries:
        m = e.get("mentions")
        if m:
            print(f"  {e['name']:<28} {m['verses']:>4} verses  first {m['first']['reference']}")
    if errors:
        print(f"{len(errors)} problem(s):")
        for err in errors:
            print("  " + err)
        sys.exit(1)


if __name__ == "__main__":
    main()
