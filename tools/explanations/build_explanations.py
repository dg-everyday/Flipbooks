# -*- coding: utf-8 -*-
"""
Write assets/explanations/<book_id>/<chapter>.json from the commentaries cached
by fetch_commentaries.py, one file per chapter of the KJV in
assets/db/dailygrace.db. Jamieson-Fausset-Brown is used where it has a note for
the verse, John Gill otherwise; verses neither covers are left out.

The output folder is rebuilt from scratch on every run. The database is only
read, to get the book ids and which verses exist.

    python tools/explanations/build_explanations.py
"""
import collections, json, os, re, shutil, sqlite3, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CACHE = os.path.join(HERE, "cache")
BIBLE_DB = os.path.join(ROOT, "assets", "db", "dailygrace.db")
OUT = os.path.join(ROOT, "assets", "explanations")

SOURCES = {"jfb": "jamieson-fausset-brown", "gill": "john-gill"}

# Gill's footnotes: "(a)" markers in the text, and trailing paragraphs listing the
# Latin/Hebrew sources they point to
FOOTNOTE_PARA = re.compile(r"^\s*\([a-z]{1,2}\d?\) ")
FOOTNOTE_MARK = re.compile(r"\s?\([a-z]{1,2}\d?\)(?=[\s,.;:!?)\]\"']|$)")
# A leading "Genesis 1:1" line on some JFB chapter introductions
REF_LINE = re.compile(r"^\s*(?:[1-3] )?[A-Z][A-Za-z ]+ \d+:\d+\s*\n")


def tidy(text):
    text = "\n".join(line.strip() for line in text.replace("\r", "").split("\n"))
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def strip_gill_footnotes(text):
    paras = re.split(r"\n\s*\n", text)
    for i, p in enumerate(paras):
        if FOOTNOTE_PARA.match(p):
            paras = paras[:i]
            break
    return FOOTNOTE_MARK.sub("", "\n\n".join(paras))


def load(cid):
    """Return {(helloao_book, chapter, verse): text} for one commentary."""
    notes = {}
    folder = os.path.join(CACHE, cid)
    for name in os.listdir(folder):
        book, chapter = name[:-5].rsplit("_", 1)
        with open(os.path.join(folder, name), encoding="utf8") as f:
            ch = json.load(f)["chapter"]
        for item in ch["content"]:
            if item.get("type") != "verse":
                continue
            text = "".join(s for s in item["content"] if isinstance(s, str))
            if cid == "john-gill":
                text = strip_gill_footnotes(text)
            text = tidy(text)
            if text:
                notes[(book, int(chapter), int(item["number"]))] = text
        # HelloAO files JFB's verse-1 note under the chapter introduction
        intro = tidy(REF_LINE.sub("", ch.get("introduction") or "", count=1))
        if cid == "jamieson-fausset-brown" and intro and (book, int(chapter), 1) not in notes:
            notes[(book, int(chapter), 1)] = intro
    return notes


def main():
    if not os.path.isdir(CACHE):
        sys.exit("No cache found. Run fetch_commentaries.py first.")

    with open(os.path.join(CACHE, "books.json"), encoding="utf8") as f:
        helloao_books = [b["id"] for b in json.load(f)["books"]]
    notes = {src: load(cid) for src, cid in SOURCES.items()}

    con = sqlite3.connect(f"file:{BIBLE_DB}?mode=ro", uri=True)
    # Both lists are the 66 books in canonical order
    book_ids = [r[0] for r in con.execute("SELECT book_id FROM books ORDER BY book_number")]
    assert len(book_ids) == len(helloao_books) == 66
    to_helloao = dict(zip(book_ids, helloao_books))
    verses = con.execute("SELECT book, chapter, verse FROM verses ORDER BY docid").fetchall()
    con.close()

    # Every chapter gets a file, even an empty one, so a fetch never 404s
    chapters = collections.defaultdict(dict)
    stats = collections.Counter()
    db_keys = set()
    for book, chapter, verse in verses:
        key = (to_helloao[book], int(chapter), int(verse))
        db_keys.add(key)
        entry = chapters[(book, int(chapter))]
        for src in SOURCES:
            if key in notes[src]:
                entry[str(verse)] = {"source": src, "text": notes[src][key]}
                stats[src] += 1
                break
        else:
            stats["none"] += 1

    shutil.rmtree(OUT, ignore_errors=True)
    total_bytes = 0
    for (book, chapter), entry in chapters.items():
        os.makedirs(os.path.join(OUT, book), exist_ok=True)
        path = os.path.join(OUT, book, f"{chapter}.json")
        with open(path, "w", encoding="utf8", newline="\n") as f:
            json.dump(entry, f, ensure_ascii=False, separators=(",", ":"))
        total_bytes += os.path.getsize(path)

    orphans = [k for src in SOURCES for k in notes[src] if k not in db_keys]
    print(dict(stats), "total", sum(stats.values()))
    print(f"wrote {len(chapters)} chapter files, {total_bytes / 1e6:.1f} MB")
    print("notes with no matching verse in DB:", len(orphans), sorted(orphans)[:15])


if __name__ == "__main__":
    main()
