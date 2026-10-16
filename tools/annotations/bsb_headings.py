"""Add the Berean Standard Bible's section headings to tools/annotations/bsb.json.

    python tools/annotations/bsb_headings.py <BSB USFM folder>

The folder is the unzipped https://ebible.org/Scriptures/engbsb_usfm.zip
(public domain), kept outside the repo. Its headings are written into
bsb.json as

    "headings": { "Gen": { "1": { "1": [ {"level": 1, "title": "The Creation",
                                          "refs": "John 1:1–5; Hebrews 11:1–3"},
                                         ... ] } } }

keyed by the verse each heading stands before. Levels: 1 a section (\\s1),
2 a subsection (\\s2), 0 a division of the Psalms ("Book I", \\ms1, with its
range from \\mr), 3 a letter of an acrostic (Psalm 119, \\qa). The psalm
titles (\\d) are not headings; bsb.json keeps them in "titles".

build_annotations.py then puts each verse's headings in its chapter file, as
translations.bsb.headings.
"""
import glob
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
BSB = os.path.join(HERE, "bsb.json")

# USFM book codes in canonical order, and the book ids of dailygrace.db.
USFM_BOOKS = """GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO
    ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN
    ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV""".split()
BOOK_IDS = """Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Esth Job Ps
    Prov Eccl Song Isa Jer Lam Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal
    Matt Mark Luke John Acts Rom 1Cor 2Cor Gal Eph Phil Col 1Thess 2Thess 1Tim 2Tim Titus Phlm
    Heb Jas 1Pet 2Pet 1John 2John 3John Jude Rev""".split()

LEVELS = {"s1": 1, "s2": 2, "ms1": 0, "qa": 3}


def clean(text):
    """Plain text: no \\w word|strong="…"\\w* tags, footnotes or other markers."""
    text = re.sub(r"\\f .*?\\f\*", "", text)
    text = re.sub(r"\\\+?w ([^|\\]*)\|[^\\]*\\\+?w\*", r"\1", text)
    text = re.sub(r"\\\+?[a-z0-9]+\*?", "", text)
    return re.sub(r"\s+", " ", text).strip()


def headings_of(path):
    """{(chapter, verse): [heading, …]} for one book."""
    found = {}
    chapter = 0
    pending = []
    with open(path, encoding="utf-8-sig") as f:
        for line in f:
            line = line.strip()
            m = re.match(r"\\c (\d+)", line)
            if m:
                chapter = int(m.group(1))
                continue
            m = re.match(r"\\(s1|s2|ms1|qa)\s+(.*)", line)
            if m:
                pending.append({"level": LEVELS[m.group(1)], "title": clean(m.group(2))})
                continue
            m = re.match(r"\\(r|mr)\s+(.*)", line)
            if m and pending:
                pending[-1]["refs"] = clean(m.group(2)).strip("()")
                continue
            m = re.search(r"\\v (\d+)", line)
            if m and pending:
                found.setdefault((chapter, int(m.group(1))), []).extend(pending)
                pending = []
    return found


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    folder = sys.argv[1]
    data = json.load(open(BSB, encoding="utf-8"))
    headings = {}
    count = 0
    for code, book in zip(USFM_BOOKS, BOOK_IDS):
        files = glob.glob(os.path.join(folder, f"*-{code}*.usfm"))
        if len(files) != 1:
            sys.exit(f"no single USFM file for {code}")
        for (chapter, verse), items in sorted(headings_of(files[0]).items()):
            headings.setdefault(book, {}).setdefault(str(chapter), {})[str(verse)] = items
            count += len(items)
    data["headings"] = headings
    with open(BSB, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")
    by_level = {}
    for book in headings.values():
        for chapter in book.values():
            for items in chapter.values():
                for h in items:
                    by_level[h["level"]] = by_level.get(h["level"], 0) + 1
    print(f"{count} headings written to {os.path.relpath(BSB)}: " +
          ", ".join(f"level {k}: {v}" for k, v in sorted(by_level.items())))


if __name__ == "__main__":
    main()
