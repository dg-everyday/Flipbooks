"""Build assets/guidance-for-life.json for apps/pages/guidance-for-life.html.

The hand-written topics live in tools/guidance/content/topics.py. This script:

  * gives each topic an id (from its name) and checks ids are unique,
  * checks `section`, each teaching's `voice`, and `hero` ids against
    heroes-and-villains,
  * checks every teaching's reference and fills its text with the exact KJV
    wording,
  * checks that every teaching given to Jesus is his own words: each verse must
    carry red letters in assets/red-letter.json (mark his deeds `example`),
  * checks every 'single-quoted' phrase is verbatim KJV (tools/kjv_quotes.py),
  * notes each teaching's testament,
  * writes assets/guidance-for-life.json.

Run from the repo root:  python tools/guidance/build_guidance.py
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
from content.topics import TOPICS  # noqa: E402

OUT = ROOT / "assets" / "guidance-for-life.json"
HEROES = ROOT / "assets" / "heroes-and-villains.json"
RED_LETTER = ROOT / "assets" / "red-letter.json"

SECTIONS = [
    "Heart and mind",
    "Relationships",
    "Work and money",
    "Walking with God",
    "Hard times",
    "The future",
]
VOICES = ["Jesus", "The prophets", "The apostles", "Wisdom", "Law and history"]
NEW_TESTAMENT_FROM = "Matt"   # book id of the first New Testament book


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def verse_ids(bible, ref):
    """(book id, chapter, verse) for every verse in a reference Bible.verses() accepts."""
    m = REF.match(ref.strip())
    book = bible.books[m["book"]]
    c1 = int(m["c1"])
    if m["v1"] is None:
        c2 = int(m["v2"]) if m["v2"] else c1
        where, args = "chapter between ? and ?", (c1, c2)
    else:
        v1 = int(m["v1"])
        c2 = int(m["c2"]) if m["c2"] else c1
        v2 = int(m["v2"]) if m["v2"] else v1
        where = "(chapter > ? or (chapter = ? and verse >= ?)) and (chapter < ? or (chapter = ? and verse <= ?))"
        args = (c1, c1, v1, c2, c2, v2)
    rows = bible.db.execute(f"select chapter, verse from verses where book=? and {where} "
                            "order by chapter, verse", (book, *args)).fetchall()
    return [(book, c, v) for c, v in rows]


def main():
    bible = Bible(DB)
    quotes = Quotes(bible.db)
    errors = []
    hero_ids = {p["id"] for side in ("heroes", "villains")
                for p in json.loads(HEROES.read_text(encoding="utf-8"))[side]}
    red = json.loads(RED_LETTER.read_text(encoding="utf-8"))
    order = dict(bible.db.execute("select book_id, book_number from books"))
    nt_start = order[NEW_TESTAMENT_FROM]

    topics = [{"id": t.get("id") or slug(t["name"]), **t} for t in TOPICS]
    ids = [t["id"] for t in topics]
    for i in set(ids):
        if ids.count(i) > 1:
            errors.append(f"duplicate id {i!r}")

    for t in topics:
        where = t["name"]
        if t.get("section") not in SECTIONS:
            errors.append(f"{where}: section {t.get('section')!r} is not one of {SECTIONS}")
        for field in ("question", "summary", "guidance", "practice", "prayer"):
            for problem in quotes.problems(t.get(field)):
                errors.append(f"{where} {field}: {problem}")

        for teaching in t["teachings"]:
            ref = teaching["reference"]
            here = f"{where} / {ref}"
            if teaching.get("voice") not in VOICES:
                errors.append(f"{here}: voice {teaching.get('voice')!r} is not one of {VOICES}")
            if teaching.get("hero") and teaching["hero"] not in hero_ids:
                errors.append(f"{here}: unknown hero id {teaching['hero']!r}")
            for problem in quotes.problems(teaching.get("note")):
                errors.append(f"{here} note: {problem}")
            try:
                teaching["text"] = " ".join(bible.verses(ref))
            except ValueError as e:
                errors.append(f"{here}: {e}")
                continue
            vids = verse_ids(bible, ref)
            teaching["testament"] = "New" if order[vids[0][0]] >= nt_start else "Old"
            if teaching["voice"] == "Jesus" and not teaching.get("example"):
                missing = [f"{c}:{v}" for b, c, v in vids if f"{c}:{v}" not in red.get(b, {})]
                if missing:
                    errors.append(f"{here}: not Jesus' words (no red letters) at {', '.join(missing)}")

        t["voices"] = [v for v in VOICES if any(x["voice"] == v for x in t["teachings"])]

    topics.sort(key=lambda t: SECTIONS.index(t["section"]) if t["section"] in SECTIONS else 99)
    teachings = [x for t in topics for x in t["teachings"]]
    doc = {
        "totals": {
            "topics": len(topics),
            "teachings": len(teachings),
            "sections": {s: sum(1 for t in topics if t["section"] == s) for s in SECTIONS},
            "voices": {v: sum(1 for t in topics if v in t["voices"]) for v in VOICES},
        },
        "sections": SECTIONS,
        "voices": VOICES,
        "topics": topics,
    }
    OUT.write_text(json.dumps(doc, indent=4, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"{len(topics)} topics, {len(teachings)} teachings written to {OUT.relative_to(ROOT)}.")
    for s, n in doc["totals"]["sections"].items():
        print(f"  {s:<20} {n}")
    if errors:
        print(f"{len(errors)} problem(s):")
        for err in errors:
            print("  " + err)
        sys.exit(1)


if __name__ == "__main__":
    main()
