# -*- coding: utf-8 -*-
"""
Write assets/annotations/<book_id>/<chapter>.json, one file per chapter of the
KJV in assets/db/dailygrace.db. Each verse can carry:

  explanation        from the commentaries cached by fetch_commentaries.py:
                     Jamieson-Fausset-Brown where it has a note for the verse,
                     John Gill otherwise
  translations.bsb   the Berean Standard Bible text of the verse, on verse 1 of
                     a psalm its title, and the BSB's section headings that
                     stand before the verse, from bsb.json beside this script
                     (headings from bsb_headings.py)
  interlinear        the verse's KJV words with their Strong's numbers, from
                     tools/strongs/interlinear.json (see tools/strongs)

A verse with none of these is left out. The output folder is rebuilt from scratch on
every run. The database is only read, to get the book ids and which verses exist.

    python tools/annotations/build_annotations.py
"""
import collections, json, os, re, shutil, sqlite3, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CACHE = os.path.join(HERE, "cache")
BSB = os.path.join(HERE, "bsb.json")
INTERLINEAR = os.path.join(ROOT, "tools", "strongs", "interlinear.json")
BIBLE_DB = os.path.join(ROOT, "assets", "db", "dailygrace.db")
OUT = os.path.join(ROOT, "assets", "annotations")

SOURCES = {"jfb": "jamieson-fausset-brown", "gill": "john-gill"}

# Gill's footnotes: "(a)" markers in the text, and trailing paragraphs listing the
# Latin/Hebrew sources they point to
FOOTNOTE_PARA = re.compile(r"^\s*\([a-z]{1,2}\d?\) ")
FOOTNOTE_MARK = re.compile(r"\s?\([a-z]{1,2}\d?\)(?=[\s,.;:!?)\]\"']|$)")
# A leading "Genesis 1:1" line on some JFB chapter introductions
REF_LINE = re.compile(r"^\s*(?:[1-3] )?[A-Z][A-Za-z ]+ \d+:\d+\s*\n")
# Characters the source mangled on the way through other encodings (UTF-8 read
# as Latin-1 or Windows-1252, the "¦" then half-escaped): "Cæsarea" arrives as
# "CÃ&brvbrsarea", "IRENÆUS" as "IRENÃ†US", "£342" as "Â£342".
MOJIBAKE = {"Ã&brvbr": "æ", "Ã†": "Æ", "Ã¶": "ö", "Â£": "£"}
# The commentaries' "&c." (et cetera), spelt as readers know it today. A
# second full stop is the sentence's, left behind by a removed footnote mark.
ET_CETERA = re.compile(r"&c\b\.{0,2}")


def tidy(text):
    for broken, char in MOJIBAKE.items():
        text = text.replace(broken, char)
    text = ET_CETERA.sub("etc.", text)
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

    with open(BSB, encoding="utf8") as f:
        bsb = json.load(f)
    with open(INTERLINEAR, encoding="utf8") as f:
        interlinear = json.load(f)

    # Every chapter gets a file, even an empty one, so a fetch never 404s
    chapters = collections.defaultdict(dict)
    stats = collections.Counter()
    db_keys = set()
    # A heading on a verse the BSB leaves out moves on to the next verse it has.
    carried = []
    for book, chapter, verse in verses:
        key = (to_helloao[book], int(chapter), int(verse))
        db_keys.add(key)
        entries = chapters[(book, int(chapter))]
        entry = {}
        for src in SOURCES:
            if key in notes[src]:
                entry["explanation"] = {"source": src, "text": notes[src][key]}
                stats[src] += 1
                break
        else:
            stats["none"] += 1
        # The BSB leaves out 16 verses (Matthew 17:21, ...): no text, no entry.
        text = bsb["verses"].get(book, {}).get(str(chapter), {}).get(str(verse))
        heads = carried + bsb.get("headings", {}).get(book, {}).get(str(chapter), {}).get(str(verse), [])
        carried = []
        if text:
            translation = {"text": text}
            title = bsb["titles"].get(book, {}).get(str(chapter)) if int(verse) == 1 else None
            if title:
                translation = {"title": title, **translation}
                stats["bsb titles"] += 1
            if heads:
                translation = {"headings": heads, **translation}
                stats["bsb headings"] += len(heads)
            entry["translations"] = {"bsb": translation}
            stats["bsb"] += 1
        else:
            carried = heads
        words = interlinear.get(book, {}).get(str(chapter), {}).get(str(verse))
        if words:
            entry["interlinear"] = words
            stats["interlinear"] += 1
        if entry:
            entries[str(verse)] = entry

    shutil.rmtree(OUT, ignore_errors=True)
    total_bytes = 0
    for (book, chapter), entry in chapters.items():
        os.makedirs(os.path.join(OUT, book), exist_ok=True)
        path = os.path.join(OUT, book, f"{chapter}.json")
        with open(path, "w", encoding="utf8", newline="\n") as f:
            json.dump(entry, f, ensure_ascii=False, indent=4)
        total_bytes += os.path.getsize(path)

    orphans = [k for src in SOURCES for k in notes[src] if k not in db_keys]
    db_verses = {(b, str(c), str(v)) for b, c, v in verses}
    bsb_orphans = [(b, c, v) for b, chs in bsb["verses"].items() for c, vs in chs.items()
                   for v in vs if (b, c, v) not in db_verses]
    print("explanations:", {s: stats[s] for s in (*SOURCES, "none")}, "total", len(verses))
    print("bsb:", stats["bsb"], "verses,", stats["bsb titles"], "psalm titles,", stats["bsb headings"], "headings")
    print("interlinear:", stats["interlinear"], "verses")
    print(f"wrote {len(chapters)} chapter files, {total_bytes / 1e6:.1f} MB")
    print("notes with no matching verse in DB:", len(orphans), sorted(orphans)[:15])
    print("bsb verses with no matching verse in DB:", len(bsb_orphans), bsb_orphans[:15])


if __name__ == "__main__":
    main()
