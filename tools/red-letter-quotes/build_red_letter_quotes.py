"""Build assets/red-letter-quotes.json for apps/pages/red-lettered-quotes.html.

Two parts:

  * sayings: the best-known words of Jesus, hand-written in
    tools/red-letter-quotes/content/sayings.py with a plain explanation each;
  * passages: every red-letter passage in the Bible, from assets/red-letter.json
    (built by tools/red-letter/build_red_letter.py). A passage is a run of
    verses in one chapter that each carry red letters; only the red words are
    kept.

The script:

  * checks every saying's reference, and that each of its verses is red,
  * fills each saying's text with its red words only, in the exact KJV wording,
  * checks also_in references, and that 'single-quoted' phrases are verbatim
    KJV (tools/kjv_quotes.py),
  * links each passage to the sayings inside it,
  * writes assets/red-letter-quotes.json.

Run from the repo root:  python tools/red-letter-quotes/build_red_letter_quotes.py
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
from content.sayings import SAYINGS  # noqa: E402

OUT = ROOT / "assets" / "red-letter-quotes.json"
RED_LETTER = ROOT / "assets" / "red-letter.json"

THEMES = [
    "I am",
    "The Sermon on the Mount",
    "Parables",
    "Invitations and promises",
    "Commands and challenges",
    "Questions he asked",
    "His prayers",
    "From the cross",
    "After the resurrection",
    "From heaven",
]
# The books that carry red letters, grouped the way the page shows them.
SHELVES = [
    ("Matthew", ["Matt"]),
    ("Mark", ["Mark"]),
    ("Luke", ["Luke"]),
    ("John", ["John"]),
    ("Acts and the letters", ["Acts", "1Cor", "2Cor"]),
    ("Revelation", ["Rev"]),
]


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def main():
    bible = Bible(DB)
    quotes = Quotes(bible.db)
    errors = []
    red = json.loads(RED_LETTER.read_text(encoding="utf-8"))
    names = {bid: name for name, bid in bible.books.items()}
    text_of = {(b, c, v): t for b, c, v, t in bible.db.execute("select book, chapter, verse, text from verses")}

    def red_words(book, c, v):
        spans = red.get(book, {}).get(f"{c}:{v}")
        if not spans:
            return None
        t = text_of[(book, c, v)]
        return " … ".join(t[s:e].strip() for s, e in spans)

    def verses_of(ref):
        """(book id, chapter, verse) for each verse of a reference, or None."""
        try:
            bible.verses(ref)
        except ValueError as e:
            errors.append(str(e))
            return None
        m = REF.match(ref)
        book = bible.books[m["book"]]
        c1, v1 = int(m["c1"]), int(m["v1"])
        c2 = int(m["c2"]) if m["c2"] else c1
        v2 = int(m["v2"]) if m["v2"] else v1
        return [(book, c, v) for (b, c, v) in sorted(text_of)
                if b == book and (c1, v1) <= (c, v) <= (c2, v2)]

    # ---------------------------------------------------------------- sayings
    sayings = [{"id": s.get("id") or slug(s["name"]), **s} for s in SAYINGS]
    ids = [s["id"] for s in sayings]
    for i in set(ids):
        if ids.count(i) > 1:
            errors.append(f"duplicate saying id {i!r}")

    for s in sayings:
        where = s["name"]
        if s.get("theme") not in THEMES:
            errors.append(f"{where}: theme {s.get('theme')!r} is not one of {THEMES}")
        for field in ("context", "meaning", "today"):
            for problem in quotes.problems(s.get(field)):
                errors.append(f"{where} {field}: {problem}")
        for ref in s.get("also_in", []):
            if verses_of(ref) is None:
                errors.append(f"{where}: bad also_in {ref!r}")
        vids = verses_of(s["reference"])
        if not vids:
            errors.append(f"{where}: bad reference {s['reference']!r}")
            continue
        words = [red_words(*vid) for vid in vids]
        missing = [f"{c}:{v}" for (b, c, v), w in zip(vids, words) if w is None]
        if missing:
            errors.append(f"{where}: not red at {', '.join(missing)}")
            continue
        s["text"] = " ".join(words)
        s["book"] = vids[0][0]
        s["verses"] = [f"{b} {c}:{v}" for b, c, v in vids]

    # ---------------------------------------------------------------- passages
    by_verse = {}
    for s in sayings:
        for key in s.get("verses", []):
            by_verse.setdefault(key, []).append(s["id"])

    order = {b: n for b, n in bible.db.execute("select book_id, book_number from books")}
    shelves = []
    for shelf, books in SHELVES:
        passages = []
        for book in books:
            keys = sorted((int(k.split(":")[0]), int(k.split(":")[1])) for k in red.get(book, {}))
            run = []
            for c, v in keys + [(None, None)]:
                if run and (c != run[-1][0] or v != run[-1][1] + 1):
                    (c1, v1), (_, v2) = run[0], run[-1]
                    ref = f"{names[book]} {c1}:{v1}" + (f"-{v2}" if v2 != v1 else "")
                    linked = []
                    for cc, vv in run:
                        for sid in by_verse.get(f"{book} {cc}:{vv}", []):
                            if sid not in linked:
                                linked.append(sid)
                    passages.append({
                        "id": slug(ref),
                        "reference": ref,
                        "book": book,
                        "chapter": c1,
                        "verses": [{"v": vv, "text": red_words(book, cc, vv)} for cc, vv in run],
                        "sayings": linked,
                    })
                    run = []
                if c is not None:
                    run.append((c, v))
        passages.sort(key=lambda p: (order[p["book"]], p["chapter"], p["verses"][0]["v"]))
        shelves.append({"name": shelf, "id": slug(shelf), "passages": passages})

    for s in sayings:
        s.pop("verses", None)
    sayings.sort(key=lambda s: THEMES.index(s["theme"]) if s["theme"] in THEMES else 99)

    all_passages = [p for sh in shelves for p in sh["passages"]]
    doc = {
        "totals": {
            "sayings": len(sayings),
            "passages": len(all_passages),
            "verses": sum(len(p["verses"]) for p in all_passages),
            "themes": {t: sum(1 for s in sayings if s["theme"] == t) for t in THEMES},
            "shelves": {sh["name"]: len(sh["passages"]) for sh in shelves},
        },
        "themes": THEMES,
        "sayings": sayings,
        "shelves": shelves,
    }
    OUT.write_text(json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")

    t = doc["totals"]
    print(f"{t['sayings']} sayings, {t['passages']} passages ({t['verses']} verses) "
          f"written to {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB).")
    for theme, n in t["themes"].items():
        print(f"  {theme:<28} {n}")
    unlinked = [s["id"] for s in sayings if not any(s["id"] in p["sayings"] for p in all_passages)]
    if unlinked:
        errors.append(f"sayings not found in any passage: {unlinked}")
    if errors:
        print(f"{len(errors)} problem(s):")
        for err in errors:
            print("  " + err)
        sys.exit(1)


if __name__ == "__main__":
    main()
