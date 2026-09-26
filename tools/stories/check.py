# -*- coding: utf-8 -*-
"""Check a story's content against the King James text before building it.

    python tools/stories/check.py <slug>      one story
    python tools/stories/check.py --all       every story

Checks, against assets/db/dailygrace.db:

  ERROR    a speech balloon that is not verbatim King James text. A balloon is a lettering line
           "NAME: “…”" (with an optional "(off)", "(caption)", "(from within)"... after the name).
           Indirect speech belongs in a CAPTION, never in a balloon.
  ERROR    comic pages that skip a verse, use one twice, or run out of order.
  REVIEW   quoted fragments anywhere in the book that are not in the King James text. Each must be
           a deliberate quotation of the source retelling, of a modern translation, or a gloss, and
           must be labelled as such where it appears. Anything else is a mistake to fix.
  WARN     a story outside the series' 1,800-2,400 words.

Quotations are compared word for word (the King James text punctuates loosely). A quotation may be
broken across panels with an ellipsis or a dash. The text searched is every chapter the passage
touches plus every chapter cited anywhere as "Book chapter:verse", so flagged cross-references are
checked too. Exit status is 1 if there are errors.
"""
import argparse
import html
import os
import re
import sqlite3
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
DB = os.path.join(ROOT, "assets", "db", "dailygrace.db")
sys.path.insert(0, HERE)
from build import load, slugs  # noqa: E402

BREAK = re.compile("\u2026|\\.\\.\\.|\u2014")
BALLOON = re.compile("^([A-Z][A-Z ,'\u2019]*?)(?: \\(([^)]*)\\))?: \u201c(.+)\u201d")
QUOTE = re.compile("\u201c(.+?)\u201d", re.S)
TRAILING_REF = re.compile(r"\s*\((?:v\.)?[\d:\u2013-]+\)\s*$")


def unq(s):
    """Content markup -> plain text with real punctuation."""
    return html.unescape(re.sub(r"<[^>]+>", "", s))


def norm(s):
    """Words only, lower case, hyphens ignored (the King James text spells "Abed-nego")."""
    s = unq(s).replace("\u2019", "'").replace("\u2018", "'")
    s = re.sub(r"(\w)- ?(\w)", r"\1\2", s)          # "Abed-nego" = "Abednego"; "Abel- meholah" in the db
    s = re.sub(r"[^\w\s']", " ", s)
    return re.sub(r"\s+", " ", s).strip().lower()


class Bible:
    def __init__(self):
        self.con = sqlite3.connect(DB)
        self.books = {name: bid for _, bid, name in
                      self.con.execute("SELECT book_number, book_id, book_name FROM books")}
        names = sorted(self.books, key=len, reverse=True)
        self.ref_re = re.compile(r"\b(%s) (\d+):(\d+)" % "|".join(re.escape(n) for n in names))

    def chapter(self, book, ch):
        return [t for (t,) in self.con.execute(
            "SELECT text FROM verses WHERE book=? AND chapter=? ORDER BY verse", (self.books[book], ch))]

    def last_verse(self, book, ch):
        return self.con.execute("SELECT MAX(verse) FROM verses WHERE book=? AND chapter=?",
                                (self.books[book], ch)).fetchone()[0]

    def passage(self, ref):
        """'Genesis 2:25–3:24 (King James Version)' -> (book, (c1, v1), (c2, v2))."""
        ref = unq(ref).replace("\u2013", "-")
        for book in sorted(self.books, key=len, reverse=True):
            m = re.match(r"%s (\d+):(\d+)(?:-(?:(\d+):)?(\d+))?" % re.escape(book), ref)
            if m:
                c1, v1 = int(m.group(1)), int(m.group(2))
                return book, (c1, v1), (int(m.group(3) or c1), int(m.group(4) or v1))
        raise SystemExit("cannot read the passage reference %r" % ref)

    def next_verse(self, book, cv):
        c, v = cv
        return (c, v + 1) if v < self.last_verse(book, c) else (c + 1, 1)


def page_range(verses):
    m = re.search(r"(\d+):(\d+)(?:-(?:(\d+):)?(\d+))?\s*$", unq(verses).replace("\u2013", "-"))
    c1, v1 = int(m.group(1)), int(m.group(2))
    return (c1, v1), (int(m.group(3) or c1), int(m.group(4) or v1))


def blobs(C):
    out = [C.TITLE, C.SUBTITLE, C.LOGLINE, C.THEME]
    out += [p for _, ps in C.STORY for p in ps]
    out += [p for _, ps in getattr(C, "NARRATIVE", []) for p in ps]
    out += [x for c in C.CHARACTERS for x in c]
    out += [x for _, _, panels in C.PAGES for p in panels for x in p]
    out += [x for n in getattr(C, "VALIDATION_NOTES", []) for x in n]
    out += [x for m in getattr(C, "VALIDATION_MAP", []) for x in m]
    out += list(getattr(C, "HOWTO", [])) + [v for _, v in getattr(C, "STYLE_BIBLE", [])]
    return [unq(b) for b in out]


def check(slug, bible):
    C = load(slug)
    errors, review, warn = [], [], []
    book, start, end = bible.passage(C.REFERENCE)

    # the text to search: every chapter of the passage, plus every chapter cited anywhere
    chapters = {(book, c) for c in range(start[0], end[0] + 1)}
    for b in blobs(C):
        for bk, ch, _ in bible.ref_re.findall(b):
            chapters.add((bk, int(ch)))
    K = " " + " ".join(norm(t) for bk, ch in sorted(chapters) for t in bible.chapter(bk, ch)) + " "
    found = lambda p: (" %s " % p) in K

    # REVIEW: quoted fragments not in the King James text
    seen = set()
    for b in blobs(C):
        for q in QUOTE.findall(b):
            for part in BREAK.split(q):
                p = norm(part)
                if len(p) > 3 and not found(p) and p not in seen:
                    seen.add(p)
                    review.append(p)

    # ERROR: balloons must be verbatim
    for title, _, panels in C.PAGES:
        for i, (_, _, dialogue) in enumerate(panels, 1):
            for line in unq(dialogue).split("\n"):
                m = BALLOON.match(line.strip())
                if not m or m.group(1).startswith("CAPTION"):
                    continue
                for part in BREAK.split(TRAILING_REF.sub("", m.group(3))):
                    p = norm(part)
                    if p and not found(p):
                        errors.append("balloon not verbatim KJV - %s, panel %d: %r"
                                      % (unq(title)[:42], i, p[:80]))

    # ERROR: comic pages cover the passage in order, no verse skipped or repeated
    expect = start
    for title, verses, _ in C.PAGES:
        a, z = page_range(verses)
        if a != expect:
            errors.append("%s starts at %d:%d, expected %d:%d" % (unq(title)[:42], a[0], a[1], *expect))
        expect = bible.next_verse(book, z)
    if expect != bible.next_verse(book, end):
        errors.append("the pages end before the passage does (%d:%d)" % end)

    # WARN: story length
    words = sum(len(unq(p).split()) for _, ps in C.STORY for p in ps) + len(unq(C.THEME).split())
    if not 1800 <= words <= 2400:
        warn.append("story is %d words; the series aims for 1,800-2,400" % words)

    print("== %s  (%s, %d pages, %d words)" % (slug, unq(C.REFERENCE), len(C.PAGES), words))
    for e in errors:
        print("  ERROR  ", e)
    for w in warn:
        print("  WARN   ", w)
    if review:
        print("  REVIEW  quoted fragments not in the KJV - confirm each is a labelled quote of the source,"
              " a modern translation, or a gloss:")
        for r in review:
            print("           -", r[:100])
    if not (errors or warn or review):
        print("  ok")
    return not errors


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug", nargs="?")
    ap.add_argument("--all", action="store_true")
    args = ap.parse_args()
    targets = slugs() if args.all else [args.slug] if args.slug else None
    if not targets:
        ap.error("give a story slug or --all")
    bible = Bible()
    ok = all([check(s, bible) for s in targets])
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
