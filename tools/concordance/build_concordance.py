# -*- coding: utf-8 -*-
"""
Build a word concordance of the KJV text in assets/db/dailygrace.db.

    python tools/concordance/build_concordance.py

Writes two files, both rebuilt from scratch on every run:

    assets/concordance.json              what the site loads: word -> verses
    tools/concordance/concordance.db     the full index, with word positions

See README.md for both formats.
"""
import json, os, re, sqlite3, sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))

BIBLE_DB = os.path.join(ROOT, "assets", "db", "dailygrace.db")
CONCORDANCE_JSON = os.path.join(ROOT, "assets", "concordance.json")
CONCORDANCE_DB = os.path.join(HERE, "concordance.db")

# The source stores each psalm's superscription on the end of the previous
# psalm's last verse, after a run of spaces: "...perish.     Psalm 3  A Psalm of David..."
PSALM_HEADING = re.compile(r"\s{3,}Psalm (\d+)\s*(.*?)\s*$")
# Psalm 119's acrostic letters are stored the same way ("...utterly.  BETH.  ").
HEBREW_LETTERS = ("ALEPH BETH GIMEL DALETH HE VAU ZAIN CHETH TETH JOD CAPH LAMED "
                  "MEM NUN SAMECH AIN PE TZADDI KOPH RESH SCHIN TAU").split()
ACROSTIC = re.compile(r"(?:^|\s+)(?:%s)\.\s*$" % "|".join(HEBREW_LETTERS))
# Some hyphenated names were split at a line break and kept the space ("Beth- shemesh").
BROKEN_HYPHEN = re.compile(r"(?<=[A-Za-z])-\s+(?=[a-z])")

# A word is letters, optionally joined by apostrophes or hyphens (brother's,
# Beth-el), plus the trailing apostrophe of a plural possessive (sons').
WORD = re.compile(r"[A-Za-z]+(?:['’-][A-Za-z]+)*(?:(?<=s)['’](?![A-Za-z]))?")

SCHEMA = """
CREATE TABLE books (
    book_number INTEGER PRIMARY KEY,
    book_id     TEXT NOT NULL,
    book_name   TEXT NOT NULL
);
CREATE TABLE verses (
    verse_id    INTEGER PRIMARY KEY,
    book_number INTEGER NOT NULL REFERENCES books(book_number),
    chapter     INTEGER NOT NULL,
    verse       INTEGER NOT NULL,
    text        TEXT NOT NULL,
    UNIQUE (book_number, chapter, verse)
);
CREATE TABLE words (
    word_id     INTEGER PRIMARY KEY,
    word        TEXT NOT NULL UNIQUE,
    occurrences INTEGER NOT NULL,
    verse_count INTEGER NOT NULL
);
CREATE TABLE occurrences (
    word_id     INTEGER NOT NULL REFERENCES words(word_id),
    verse_id    INTEGER NOT NULL REFERENCES verses(verse_id),
    position    INTEGER NOT NULL,
    PRIMARY KEY (word_id, verse_id, position)
) WITHOUT ROWID;
"""


def clean_verses(src):
    """Yield (verse_id, book_number, chapter, verse, text) with headings split out.

    Real verses keep their dailygrace.db docid as verse_id. Psalm superscriptions
    become verse 0 of their own psalm and get ids after the last real verse.
    """
    book_number = {bid: num for num, bid in src.execute("SELECT book_number, book_id FROM books")}
    rows = src.execute("SELECT docid, book, chapter, verse, text FROM verses ORDER BY docid").fetchall()
    next_id = max(r[0] for r in rows) + 1
    out = []
    for docid, book, chapter, verse, text in rows:
        if book == "Ps":
            m = PSALM_HEADING.search(text)
            if m:
                text = text[:m.start()]
                title = ACROSTIC.sub("", m.group(2)).strip()
                if title:
                    out.append((next_id, book_number[book], int(m.group(1)), 0, title))
                    next_id += 1
            text = ACROSTIC.sub("", text)
        text = " ".join(BROKEN_HYPHEN.sub("-", text).split())
        out.append((docid, book_number[book], chapter, verse, text))
    out.sort(key=lambda r: (r[1], r[2], r[3]))
    return out


def tokenize(text):
    return [m.group(0).replace("’", "'").lower() for m in WORD.finditer(text)]


def build():
    src = sqlite3.connect(BIBLE_DB)
    books = src.execute("SELECT book_number, book_id, book_name FROM books").fetchall()
    verses = clean_verses(src)
    src.close()

    occurrences = []
    for verse_id, _, _, _, text in verses:
        for position, word in enumerate(tokenize(text), 1):
            occurrences.append((word, verse_id, position))

    counts = Counter(w for w, _, _ in occurrences)
    verse_counts = Counter(w for w, _ in {(w, v) for w, v, _ in occurrences})
    word_id = {w: i for i, w in enumerate(sorted(counts), 1)}

    if os.path.exists(CONCORDANCE_DB):
        os.remove(CONCORDANCE_DB)
    con = sqlite3.connect(CONCORDANCE_DB)
    con.executescript(SCHEMA)
    with con:
        con.executemany("INSERT INTO books VALUES (?,?,?)", books)
        con.executemany("INSERT INTO verses VALUES (?,?,?,?,?)", verses)
        con.executemany("INSERT INTO words VALUES (?,?,?,?)",
                        [(i, w, counts[w], verse_counts[w]) for w, i in word_id.items()])
        con.executemany("INSERT INTO occurrences VALUES (?,?,?)",
                        [(word_id[w], v, p) for w, v, p in occurrences])
    con.execute("VACUUM")
    con.close()

    write_json(books, verses, occurrences)

    titles = sum(1 for v in verses if v[3] == 0)
    print("verses: %d (+%d psalm titles)" % (len(verses) - titles, titles))
    print("distinct words: %d" % len(word_id))
    print("occurrences: %d" % len(occurrences))
    for path in (CONCORDANCE_JSON, CONCORDANCE_DB):
        print("wrote %s (%d KB)" % (os.path.relpath(path, ROOT), os.path.getsize(path) // 1024))


def write_json(books, verses, occurrences):
    """Write the site's copy: each word's verse ids, ascending and delta-encoded.

    Psalm titles are not in dailygrace.db, so their text travels in the file.
    """
    verse_ids = {}
    for word, verse_id, _ in occurrences:
        ids = verse_ids.setdefault(word, [])
        if not ids or ids[-1] != verse_id:
            ids.append(verse_id)
    words = {}
    for word in sorted(verse_ids):
        ids = sorted(verse_ids[word])
        words[word] = ids[:1] + [b - a for a, b in zip(ids, ids[1:])]

    book_id = {num: bid for num, bid, _ in books}
    titles = {str(verse_id): [book_id[num], chapter, text]
              for verse_id, num, chapter, verse, text in verses if verse == 0}

    with open(CONCORDANCE_JSON, "w", encoding="utf-8", newline="\n") as f:
        json.dump({"words": words, "titles": titles}, f, ensure_ascii=False, separators=(",", ":"))


if __name__ == "__main__":
    sys.exit(build())
