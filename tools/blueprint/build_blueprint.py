"""Build assets/following-gods-blueprint.json for apps/pages/following-gods-blueprint.html.

The hand-written plan lives in tools/blueprint/content/blueprint.py. This script:

  * gives each item an id (from its name) and checks ids are unique,
  * checks each item's `part`, and `hero` ids against heroes-and-villains,
  * checks every reference (verses, examples, the test and its warning signs)
    and fills in the exact KJV text, refusing verses the database has damaged,
  * marks a verse `red` when every verse in it is Jesus' own words
    (assets/red-letter.json), so the page can show it in red,
  * checks every 'single-quoted' phrase is verbatim KJV (tools/kjv_quotes.py),
  * checks that each `see` link points at a study page that exists,
  * writes assets/following-gods-blueprint.json.

Run from the repo root:  python tools/blueprint/build_blueprint.py
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
from content.blueprint import ITEMS, PARTS, PATTERN, TEST, WARNINGS  # noqa: E402

OUT = ROOT / "assets" / "following-gods-blueprint.json"
HEROES = ROOT / "assets" / "heroes-and-villains.json"
RED_LETTER = ROOT / "assets" / "red-letter.json"
PAGES = ROOT / "apps" / "pages"

# The database carries the next psalm's heading on the end of a psalm's last
# verse ("…my God.    Psalm 43   "); it is not part of the verse.
PSALM_HEADING = re.compile(r"\s{2,}Psalm \d+\b.*$")
DAMAGED = re.compile("�")      # a broken character, as in "father�s"


def slug(name):
    # "God's plan" -> gods-plan, not god-s-plan.
    return re.sub(r"[^a-z0-9]+", "-", name.lower().replace("'", "")).strip("-")


def verse_ids(bible, ref):
    """(book id, chapter, verse) for every verse in a reference, as tools/guidance does it."""
    m = REF.match(ref.strip())
    book = bible.books[m["book"]]
    c1 = int(m["c1"])
    v1 = int(m["v1"])
    c2 = int(m["c2"]) if m["c2"] else c1
    v2 = int(m["v2"]) if m["v2"] else v1
    rows = bible.db.execute(
        "select chapter, verse from verses where book=? and (chapter > ? or (chapter = ? and verse >= ?)) "
        "and (chapter < ? or (chapter = ? and verse <= ?)) order by chapter, verse",
        (book, c1, c1, v1, c2, c2, v2)).fetchall()
    return [(book, c, v) for c, v in rows]


def main():
    bible = Bible(DB)
    quotes = Quotes(bible.db)
    errors = []
    hero_ids = {p["id"] for side in ("heroes", "villains")
                for p in json.loads(HEROES.read_text(encoding="utf-8"))[side]}
    red = json.loads(RED_LETTER.read_text(encoding="utf-8"))

    def text_of(ref, where):
        """The KJV text of a reference, or None (with an error) if it does not resolve."""
        try:
            lines = [PSALM_HEADING.sub("", v).strip() for v in bible.verses(ref)]
        except ValueError as e:
            errors.append(f"{where}: {e}")
            return None
        if any(DAMAGED.search(line) for line in lines):
            errors.append(f"{where} {ref}: the database text is damaged; pick another verse")
        return " ".join(lines)

    def is_red(ref):
        return all(f"{c}:{v}" in red.get(b, {}) for b, c, v in verse_ids(bible, ref))

    def check_quotes(text, where):
        for problem in quotes.problems(text):
            errors.append(f"{where}: {problem}")

    def verse(v, where):
        here = f"{where} / {v['reference']}"
        if v.get("hero") and v["hero"] not in hero_ids:
            errors.append(f"{here}: unknown hero id {v['hero']!r}")
        check_quotes(v.get("note"), f"{here} note")
        text = text_of(v["reference"], here)
        return {**v, "text": text, "red": bool(text) and is_red(v["reference"])}

    part_names = [p["name"] for p in PARTS]
    pattern = [verse(v, "pattern") for v in PATTERN]

    items = [{"id": item.get("id") or slug(item["name"]), **item} for item in ITEMS]
    ids = [i["id"] for i in items]
    for i in sorted(set(ids)):
        if ids.count(i) > 1:
            errors.append(f"duplicate id {i!r}")

    for item in items:
        where = item["name"]
        if item.get("part") not in part_names:
            errors.append(f"{where}: part {item.get('part')!r} is not one of {part_names}")
        for field in ("summary", "plain", "ask"):
            if not item.get(field):
                errors.append(f"{where}: no {field}")
            check_quotes(item.get(field), f"{where} {field}")
        for step in item.get("build", []):
            check_quotes(step, f"{where} build")
        item["verses"] = [verse(v, where) for v in item["verses"]]
        if example := item.get("example"):
            text_of(example["reference"], f"{where} example")
            check_quotes(example["text"], f"{where} example")
        if see := item.get("see"):
            if not (PAGES / see["href"].split("#")[0]).exists():
                errors.append(f"{where}: see link {see['href']!r} is not a page in apps/pages")

    items.sort(key=lambda i: part_names.index(i["part"]) if i["part"] in part_names else 99)

    test = []
    for q in TEST:
        check_quotes(q["ask"], f"test {q['question']}")
        test.append({**q, "text": text_of(q["reference"], f"test {q['question']}")})
    warnings = [{**w, "text": text_of(w["reference"], f"warning {w['sign']}")} for w in WARNINGS]

    doc = {
        "totals": {
            "items": len(items),
            "verses": sum(len(i["verses"]) for i in items),
            "parts": {p: sum(1 for i in items if i["part"] == p) for p in part_names},
            "examples": sum(1 for i in items if i.get("example")),
            "questions": len(test),
        },
        "pattern": pattern,
        "parts": PARTS,
        "items": items,
        "test": {"questions": test, "warnings": warnings},
    }
    OUT.write_text(json.dumps(doc, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")

    t = doc["totals"]
    print(f"{t['items']} items, {t['verses']} passages, {t['examples']} examples, "
          f"{t['questions']} test questions written to {OUT.relative_to(ROOT)}.")
    for p, n in t["parts"].items():
        print(f"  {p:<28} {n}")
    if errors:
        print(f"{len(errors)} problem(s):")
        for err in errors:
            print("  " + err)
        sys.exit(1)


if __name__ == "__main__":
    main()
