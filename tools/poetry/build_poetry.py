"""Build assets/songs-in-the-bible.json for apps/pages/songs-in-the-bible.html.

The hand-written entries live in tools/songs/content/history.py, psalms.py
and gospel.py. This script:

  * gives each entry an id (from its name) and checks ids are unique,
  * checks `group` and `testament`, and that `by` / `with` hero ids point at
    heroes-and-villains entries,
  * checks every scripture reference (told_in, also_in, sung, key_verses),
  * fills `sung` with the song's own words, one line per verse, and
    key_verses[].text with the exact KJV wording,
  * refuses verse text the database has damaged (a broken apostrophe, or the
    next psalm's heading run on to the end of a verse), so none is shown,
  * checks every 'single-quoted' phrase is verbatim KJV (tools/kjv_quotes.py),
  * lists the books each song is told in, for links to bible-books.html,
  * writes assets/songs-in-the-bible.json.

Run from the repo root:  python tools/songs/build_songs.py
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
from content.history import HISTORY  # noqa: E402
from content.psalms import PSALMS  # noqa: E402
from content.gospel import GOSPEL  # noqa: E402

OUT = ROOT / "assets" / "songs-in-the-bible.json"
HEROES = ROOT / "assets" / "heroes-and-villains.json"

GROUPS = [
    "Songs of victory",
    "Worship and thanksgiving",
    "Laments",
    "Psalms and songs of wisdom",
    "Songs of the prophets",
    "Songs of the coming King",
    "Songs of the church and of heaven",
]
TESTAMENTS = {"Old", "New"}
# The database has some verses with a mangled apostrophe, and some last verses
# of a psalm with the next psalm's title run on ("…for ever.    Psalm 24  A Psalm
# of David."). Neither may reach the page.
DAMAGED = re.compile(r"�|\s{2,}Psalm \d+")


def slug(name):
    # "Hannah's song" -> hannahs-song, not hannah-s-song.
    return re.sub(r"[^a-z0-9]+", "-", name.lower().replace("'", "")).strip("-")


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

    def lines(ref, where):
        found = check(ref, where)
        if not found:
            return None
        found = [line.strip() for line in found]
        for line in found:
            if DAMAGED.search(line):
                errors.append(f"{where} {ref}: the database text is damaged ({line[:60]}…); pick another verse")
        return found

    entries = [{"id": item.get("id") or slug(item["name"]), **item} for item in HISTORY + PSALMS + GOSPEL]

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

        sung = []
        for ref in e.get("sung", []):
            found = lines(ref, f"{where} sung")
            if found:
                sung.append({"reference": ref, "lines": found})
        e["sung"] = sung

        kvs = []
        for ref in e.get("key_verses", []):
            found = lines(ref, f"{where} key verse")
            if found:
                kvs.append({"reference": ref, "text": " ".join(found)})
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
        print(f"  {g:<36} {n}")
    if errors:
        print(f"{len(errors)} problem(s):")
        for err in errors:
            print("  " + err)
        sys.exit(1)


if __name__ == "__main__":
    main()
