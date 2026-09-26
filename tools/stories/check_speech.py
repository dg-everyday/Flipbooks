"""Check a spoken-story script (stories/<slug>/<slug>-speech.txt) against the King James text.

Every double-quoted line in the speech must appear word for word in the book's passage chapters.
Also flags words that tie the speech to a time of day (the user wants none: no "good evening").

    python tools/stories/check_speech.py <slug>
    python tools/stories/check_speech.py --all
"""
import argparse, html, importlib.util, re, sqlite3, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DB = ROOT / "assets" / "db" / "dailygrace.db"
TIME_WORDS = re.compile(r"(?i)\b(tonight|good (morning|afternoon|evening)|this (morning|afternoon|evening))\b")


def norm(s):
    s = s.lower().replace("’", "'").replace("'", "")
    s = re.sub(r"(\w)- ?(\w)", r"\1\2", s)
    return " ".join(re.sub(r"[^a-z ]", " ", s).split())


def chapters(reference):
    """'Ruth 1:1–2:23 (King James Version)' -> ('Ruth', [1, 2])."""
    ref = html.unescape(reference).split("(")[0].strip()
    m = re.match(r"(.+?) (\d+):\d+(?:[–-](?:(\d+):)?\d+)?$", ref)
    book, first, last = m.group(1), int(m.group(2)), int(m.group(3) or m.group(2))
    return book, list(range(first, last + 1))


def check(slug, con):
    spec = importlib.util.spec_from_file_location(slug, ROOT / "tools" / "stories" / "content" / f"{slug}.py")
    C = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(C)
    path = ROOT / "stories" / slug / f"{slug}-speech.txt"
    if not path.exists():
        print(f"== {slug}: no speech")
        return 0
    book, chs = chapters(C.REFERENCE)
    kjv = " ".join(norm(t) for ch in chs for (t,) in con.execute(
        "select v.text from verses v join books b on v.book = b.book_id "
        "where b.book_name = ? and v.chapter = ? order by v.verse", (book, ch)))
    text = path.read_text(encoding="utf-8")
    errors = 0
    print(f"== {slug}  ({len(text.split())} words)")
    for q in re.findall(r'"([^"]+)"', text):
        if norm(q) not in kjv:
            errors += 1
            print(f"  ERROR   quote not verbatim KJV: {q[:70]}")
    for m in TIME_WORDS.finditer(text):
        print(f"  WARN    time reference: '{m.group(0)}' - the speech must not name a time of day")
    if not errors:
        print("  ok")
    return errors


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug", nargs="?")
    ap.add_argument("--all", action="store_true")
    a = ap.parse_args()
    slugs = sorted(p.stem for p in (ROOT / "tools" / "stories" / "content").glob("*.py")) if a.all else [a.slug]
    con = sqlite3.connect(DB)
    sys.exit(1 if sum(check(s, con) for s in slugs) else 0)


if __name__ == "__main__":
    main()
