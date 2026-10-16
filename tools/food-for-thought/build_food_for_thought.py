"""Build assets/food-for-thought.json for apps/pages/food-for-thought.html.

The hand-written entries live in tools/food-for-thought/content/, one file per
section (diet, mind, body, armour, junk, shape, table). This script:

  * gives each entry an id (from its name) and checks ids are unique,
  * checks every entry's areas (Mind, Body, Spirit),
  * checks every scripture reference (food, read),
  * fills food[] with the key verse's exact KJV text, refusing verses the
    database has damaged (a broken apostrophe, the next psalm's heading or a
    Psalm 119 letter run on to the end),
  * checks every 'single-quoted' phrase in `feeds` is verbatim KJV
    (tools/kjv_quotes.py),
  * refuses single quotes in `serving` and `hunger`: they are our words, not
    Scripture,
  * resolves `see_also` against the other guides' data, so a link never points
    at an entry that does not exist, and takes its label from there,
  * writes assets/food-for-thought.json.

Run from the repo root:  python tools/food-for-thought/build_food_for_thought.py
Exits non-zero if anything does not resolve.
"""
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.dont_write_bytecode = True   # no __pycache__ in the tools folders
sys.path.insert(0, str(HERE.parent / "people"))
sys.path.insert(0, str(HERE.parent))
sys.path.insert(0, str(HERE))

from build_people import Bible, DB  # noqa: E402  (reuse the verse resolver)
from kjv_quotes import QUOTE, Quotes  # noqa: E402
from content import diet, mind, body, armour, junk, shape, table  # noqa: E402

OUT = ROOT / "assets" / "food-for-thought.json"
ASSETS = ROOT / "assets"

# Each section: its module's entries, and the line under its heading.
SECTIONS = [
    (diet.SECTION, diet.DIET, "Feeding the spirit: the staple food a soul cannot do without."),
    (mind.SECTION, mind.MIND, "What we let into our thoughts shapes what we do."),
    (body.SECTION, body.BODY, "What Scripture says about self-control, soberness, rest and diligence."),
    (armour.SECTION, armour.ARMOUR, "Defences to have in place before temptation comes."),
    (junk.SECTION, junk.JUNK, "What tastes sweet at first but poisons the soul."),
    (shape.SECTION, shape.SHAPE, "Regular check-ups, training and getting back up."),
    (table.SECTION, table.TABLE, "People who ate well, and people who fed the wrong appetite."),
]
AREAS = ["Mind", "Body", "Spirit"]

# The other guides a see_also link may point at: page -> (title, entries).
GUIDES = {
    "guidance-for-life": ("Questions We All Ask", lambda d: d["topics"]),
    "commandments-of-god": ("Commandments of God", lambda d: d["entries"]),
    "following-gods-blueprint": ("Following God's Blueprint", lambda d: d["items"]),
    "poems-songs-and-wisdom": ("Poems, Songs and Wisdom", lambda d: d["entries"]),
    "bible-characters": ("Bible Characters", lambda d: d["entries"]),
    "heroes-and-villains": ("Heroes and Villains", lambda d: d["heroes"] + d["villains"]),
}

# Verse text the database has damaged: a mangled apostrophe, the next psalm's
# heading run on ("…for ever.    Psalm 24  A Psalm of David."), or a Psalm 119
# letter ("…false way.  NUN.").
DAMAGED = re.compile(r"�|\s{2,}Psalm \d+|\s{2,}[A-Z]{2,}\.?\s*$")


def slug(name):
    # "Esau's stew" -> esaus-stew, not esau-s-stew.
    return re.sub(r"[^a-z0-9]+", "-", name.lower().replace("'", "").replace("’", "")).strip("-")


def main():
    bible = Bible(DB)
    quotes = Quotes(bible.db)
    errors = []

    targets = {}
    for page, (title, entries_of) in GUIDES.items():
        data = json.loads((ASSETS / f"{page}.json").read_text(encoding="utf-8"))
        targets[page] = (title, {e["id"]: e["name"] for e in entries_of(data)})

    def verses(ref, where):
        try:
            return [line.strip() for line in bible.verses(ref)]
        except ValueError as e:
            errors.append(f"{where}: {e}")
            return None

    entries = []
    for section, items, _ in SECTIONS:
        for item in items:
            entries.append({"id": item.get("id") or slug(item["name"]), "section": section, **item})

    ids = [e["id"] for e in entries]
    for i in sorted(set(ids)):
        if ids.count(i) > 1:
            errors.append(f"duplicate id {i!r}")

    for e in entries:
        where = e["name"]
        for field in ("name", "areas", "food", "read", "guards", "feeds", "serving", "hunger", "chew"):
            if not e.get(field):
                errors.append(f"{where}: missing {field}")
        if not set(e.get("areas", [])) <= set(AREAS):
            errors.append(f"{where}: areas must be among {AREAS}")
        e["areas"] = [a for a in AREAS if a in e.get("areas", [])]

        food = []
        for ref in e.get("food", []):
            lines = verses(ref, f"{where} food")
            if lines is None:
                continue
            for line in lines:
                if DAMAGED.search(line):
                    errors.append(f"{where} food {ref}: the database text is damaged ({line[-40:]!r}); pick another verse")
            food.append({"reference": ref, "text": " ".join(lines)})
        e["food"] = food
        for ref in e.get("read", []):
            verses(ref, f"{where} read")

        for problem in quotes.problems(e.get("feeds")):
            errors.append(f"{where} feeds: {problem}")
        for field in ("serving", "guards"):
            if QUOTE.search(e.get(field, "")):
                errors.append(f"{where} {field}: use no single quotes; it is our wording, not Scripture")
        for sign in e.get("hunger", []):
            if QUOTE.search(sign):
                errors.append(f"{where} hunger: use no single quotes; it is our wording, not Scripture")

        links = []
        for page, target in e.get("see_also", []):
            if page not in targets:
                errors.append(f"{where} see_also: unknown guide {page!r}")
                continue
            title, names = targets[page]
            if target not in names:
                errors.append(f"{where} see_also: no {target!r} in {page}")
                continue
            links.append({"page": f"{page}.html", "guide": title, "id": target, "name": names[target]})
        e["see_also"] = links

    doc = {
        "totals": {
            "entries": len(entries),
            "areas": {a: sum(1 for e in entries if a in e["areas"]) for a in AREAS},
            "sections": {s: sum(1 for e in entries if e["section"] == s) for s, _, _ in SECTIONS},
        },
        "areas": AREAS,
        "sections": [{"name": s, "intro": intro} for s, _, intro in SECTIONS],
        "entries": entries,
    }
    OUT.write_text(json.dumps(doc, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"{len(entries)} entries written to {OUT.relative_to(ROOT)}.")
    for s, n in doc["totals"]["sections"].items():
        print(f"  {s:<34} {n}")
    print("  areas: " + ", ".join(f"{a} {n}" for a, n in doc["totals"]["areas"].items()))
    if errors:
        print(f"{len(errors)} problem(s):")
        for err in errors:
            print("  " + err)
        sys.exit(1)


if __name__ == "__main__":
    main()
