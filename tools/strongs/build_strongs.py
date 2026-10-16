# -*- coding: utf-8 -*-
"""
Tag every KJV word in assets/db/dailygrace.db with its Strong's number.

    python tools/strongs/build_strongs.py <eng-kjv usfm dir> <hebrew dictionary .js> <greek dictionary .js>

Sources (download them outside the repo; see README.md):
    eng-kjv_usfm.zip                 https://ebible.org/Scriptures/eng-kjv_usfm.zip  (public domain)
    strongs-hebrew-dictionary.js     https://github.com/openscriptures/strongs        (CC BY-SA)
    strongs-greek-dictionary.js      https://github.com/openscriptures/strongs        (CC BY-SA)

Writes, rebuilt from scratch on every run:

    tools/strongs/kjv_strongs.db     one row per word of dailygrace.db, with its Strong's number
    assets/strongs/hebrew.json       Strong's Hebrew dictionary, keyed "H1".."H8674"
    assets/strongs/greek.json        Strong's Greek dictionary, keyed "G1".."G5624"
    tools/strongs/report.txt         validation report

The words are those of dailygrace.db, split exactly as the concordance splits
them, so (verse_id, position) here is the same word as in concordance.db.
The USFM only supplies the numbers: its words are matched to ours in order.
"""
import difflib
import glob
import json
import os
import re
import sqlite3
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, "tools", "concordance"))
sys.dont_write_bytecode = True  # no __pycache__ in tools/concordance
from build_concordance import WORD, clean_verses, tokenize  # noqa: E402

BIBLE_DB = os.path.join(ROOT, "assets", "db", "dailygrace.db")
STRONGS_DB = os.path.join(HERE, "kjv_strongs.db")
DICT_DIR = os.path.join(ROOT, "assets", "strongs")
REPORT = os.path.join(HERE, "report.txt")

# USFM book codes in canonical order; the apocrypha files are skipped.
USFM_BOOKS = """GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO
    ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN
    ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV""".split()

# Lines whose text is not part of any verse: book titles, introductions,
# section headings (Psalm 119's ALEPH, BETH...) and running heads.
SKIPPED_LINES = re.compile(r"\\(id|ide|h|toc\d|mt\d|imt\d|ip|is\d|ms\d|s\d|r)\b")
PARAGRAPH = re.compile(r"^\\(p|q\d?|b|m|pi\d?|nb)\b\s*")
FOOTNOTE = re.compile(r"\\f .*?\\f\*")
# \w word|strong="H0430"\w*, or \+w ...\+w* when nested inside \nd (LORD) or \wj (words of Jesus).
PIECE = re.compile(r"\\\+?w (.*?)\|([^\\]*?)\\\+?w\*|\\(\+?[a-z0-9]+\*?)|([^\\]+)")
STRONG = re.compile(r'strong="([^"]*)"')
MARKER = re.compile(r"\\\+?[a-z0-9]+\*?")
# The USFM spells Cæsar and Judæa; dailygrace.db spells Caesar and Judaea.
LIGATURES = {"æ": "ae", "Æ": "Ae", "œ": "oe", "Œ": "Oe"}

SCHEMA = """
CREATE TABLE books (
    book_number INTEGER PRIMARY KEY,
    book_id     TEXT NOT NULL,
    book_name   TEXT NOT NULL
);
CREATE TABLE titles (
    verse_id    INTEGER PRIMARY KEY,
    book_number INTEGER NOT NULL,
    chapter     INTEGER NOT NULL,
    text        TEXT NOT NULL
);
CREATE TABLE words (
    verse_id    INTEGER NOT NULL,
    position    INTEGER NOT NULL,
    word        TEXT NOT NULL,
    strongs     TEXT,
    added       INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (verse_id, position)
) WITHOUT ROWID;
CREATE INDEX words_strongs ON words (strongs);
"""


def normalize_number(n):
    """'H0430' -> 'H430'; the dictionaries have no leading zeros."""
    return n[0] + str(int(n[1:]))


def parse_usfm_book(path):
    """Return {(chapter, verse): [(word, strongs, added)]}, verse 0 = psalm title."""
    verses = {}
    chapter, key = 0, None
    with open(path, encoding="utf-8-sig") as f:
        lines = [line.strip() for line in f]
    for line in lines:
        if not line or SKIPPED_LINES.match(line):
            continue
        m = re.match(r"\\c (\d+)", line)
        if m:
            chapter, key = int(m.group(1)), None
            continue
        if line.startswith("\\d"):
            key = (chapter, 0)
            verses[key] = []
            line = line[2:]
        else:
            line = PARAGRAPH.sub("", line)
        while line:
            m = re.match(r"\\v (\d+)\s*", line)
            if m:
                key = (chapter, int(m.group(1)))
                verses[key] = []
                line = line[m.end():]
            nxt = re.search(r"\\v \d+", line)
            segment, line = (line[:nxt.start()], line[nxt.start():]) if nxt else (line, "")
            if key is None:
                raise ValueError(f"{path}: text outside a verse: {segment[:60]!r}")
            verses[key].extend(parse_segment(segment))
    return verses


def parse_segment(text):
    """Split one run of verse text into (word, strongs, added) tuples."""
    out = []
    added = False
    text = FOOTNOTE.sub(" ", text)
    for lig, letters in LIGATURES.items():
        text = text.replace(lig, letters)
    for m in PIECE.finditer(text):
        tagged, attrs, marker, plain = m.groups()
        if marker:
            if marker in ("add", "+add"):
                added = True
            elif marker in ("add*", "+add*"):
                added = False
            continue
        if tagged is not None:
            numbers = " ".join(normalize_number(n) for n in STRONG.search(attrs).group(1).split())
            for w in WORD.findall(MARKER.sub("", tagged)):
                out.append((w, numbers, added))
        else:
            for w in WORD.findall(plain):
                out.append((w, None, added))
    return out


def load_dictionary(path, keep):
    """Parse an Open Scriptures .js dictionary into {"H1": {...}}."""
    text = open(path, encoding="utf-8").read()
    body = text[text.index("{", text.index("Dictionary = ")):text.rindex("};") + 1]
    data = json.loads(body)
    out = {}
    for key in sorted(data, key=lambda k: int(k[1:])):
        entry = {}
        for src, dst in keep:
            value = data[key].get(src)
            if value:
                entry[dst] = " ".join(value.split())
        out[key] = entry
    return out


def align(ours, theirs):
    """Give each of our words the Strong's number of its match in the USFM.

    A run of words that differs only in spelling (Bethel / Beth-el, same word
    count) is matched word for word, and a run that only joins or splits
    words (whosoever / who soever) is matched letter by letter. Other
    differences leave our words without a number. Returns (numbers, added,
    spelling, unmatched): the spelling, joined and split runs as (ours,
    theirs), and the unmatched runs as (ours, theirs, how many of their
    words carried a number)."""
    a = [w.replace("\u2019", "'").lower() for w in ours]
    b = [w.replace("\u2019", "'").lower() for w, _, _ in theirs]
    numbers, added, spelling, unmatched = [None] * len(a), [0] * len(a), [], []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal" or (op == "replace" and i2 - i1 == j2 - j1):
            for i, j in zip(range(i1, i2), range(j1, j2)):
                numbers[i], added[i] = theirs[j][1], int(theirs[j][2])
            if op == "replace":
                spelling.append((" ".join(ours[i1:i2]), " ".join(w for w, _, _ in theirs[j1:j2])))
            continue
        pair = (" ".join(ours[i1:i2]), " ".join(w for w, _, _ in theirs[j1:j2]))
        if op == "replace" and match_letters(a, b, theirs, numbers, added, i1, i2, j1, j2):
            spelling.append(pair)
        else:
            unmatched.append(pair + (sum(1 for t in theirs[j1:j2] if t[1]),))
    return numbers, added, spelling, unmatched


def match_letters(a, b, theirs, numbers, added, i1, i2, j1, j2):
    """Match runs that hold the same letters split differently into words.

    Each of our words takes the numbers of every USFM word it overlaps."""
    def spans(words):
        out, start = [], 0
        for w in words:
            letters = w.replace("-", "")
            out.append((start, start + len(letters)))
            start += len(letters)
        return out

    if "".join(a[i1:i2]).replace("-", "") != "".join(b[j1:j2]).replace("-", ""):
        return False
    theirs_spans = spans(b[j1:j2])
    for i, (s, e) in zip(range(i1, i2), spans(a[i1:i2])):
        hits = [theirs[j1 + k] for k, (ts, te) in enumerate(theirs_spans) if ts < e and s < te]
        found = []
        for _, n, _ in hits:
            for x in (n or "").split():
                if x not in found:
                    found.append(x)
        numbers[i] = " ".join(found) or None
        added[i] = int(all(h[2] for h in hits))
    return True


def build(usfm_dir, hebrew_js, greek_js):
    src = sqlite3.connect(BIBLE_DB)
    books = src.execute("SELECT book_number, book_id, book_name FROM books ORDER BY book_number").fetchall()
    verses = clean_verses(src)
    src.close()
    if len(books) != len(USFM_BOOKS):
        sys.exit("expected 66 books in dailygrace.db")
    code_of = {num: code for (num, _, _), code in zip(books, USFM_BOOKS)}
    book_id = {num: bid for num, bid, _ in books}

    usfm = {}
    for num, code in code_of.items():
        files = glob.glob(os.path.join(usfm_dir, f"*-{code}*.usfm"))
        if len(files) != 1:
            sys.exit(f"no single USFM file for {code}")
        usfm[num] = parse_usfm_book(files[0])

    hebrew = load_dictionary(hebrew_js, [("lemma", "lemma"), ("xlit", "xlit"), ("pron", "pron"),
                                         ("derivation", "derivation"), ("strongs_def", "def"),
                                         ("kjv_def", "kjv")])
    greek = load_dictionary(greek_js, [("lemma", "lemma"), ("translit", "xlit"),
                                       ("derivation", "derivation"), ("strongs_def", "def"),
                                       ("kjv_def", "kjv")])

    rows, titles, report = [], [], []
    missing_verse, spelled, unmatched = [], [], []
    used = set()
    total_words = tagged_words = source_tagged = 0
    for verse_id, num, chapter, verse, text in verses:
        ref = f"{book_id[num]} {chapter}:{verse}" if verse else f"{book_id[num]} {chapter} (title)"
        if verse == 0:
            titles.append((verse_id, num, chapter, text))
        ours = [m.group(0) for m in WORD.finditer(text)]
        if [w.replace("\u2019", "'").lower() for w in ours] != tokenize(text):
            sys.exit(f"tokenizer drift at {ref}")
        theirs = usfm[num].get((chapter, verse))
        if theirs is None:
            missing_verse.append(ref)
            theirs = []
        used.add((num, chapter, verse))
        source_tagged += sum(1 for t in theirs if t[1])
        numbers, added, spelling, lost = align(ours, theirs)
        if spelling:
            spelled.append((ref, spelling))
        if lost:
            unmatched.append((ref, lost))
        for position, (word, n, a) in enumerate(zip(ours, numbers, added), 1):
            rows.append((verse_id, position, word, n, a))
            total_words += 1
            tagged_words += n is not None

    extra_usfm = sorted(f"{book_id[num]} {c}:{v}" for num, vs in usfm.items()
                        for (c, v) in vs if (num, c, v) not in used)
    numbers_used = {n for r in rows if r[3] for n in r[3].split()}
    unknown = sorted(n for n in numbers_used if n not in (hebrew if n[0] == "H" else greek))

    # A Hebrew number in the New Testament (or Greek in the Old) means a misparse.
    nt_start = next(num for num, bid, _ in books if bid == "Matt")
    book_of = {v[0]: v[1] for v in verses}
    wrong_testament = sorted({f"{book_id[book_of[vid]]}:{n}" for vid, _, _, ns, _ in rows if ns
                              for n in ns.split()
                              if (n[0] == "H") != (book_of[vid] < nt_start)})

    if os.path.exists(STRONGS_DB):
        os.remove(STRONGS_DB)
    con = sqlite3.connect(STRONGS_DB)
    con.executescript(SCHEMA)
    with con:
        con.executemany("INSERT INTO books VALUES (?,?,?)", books)
        con.executemany("INSERT INTO titles VALUES (?,?,?,?)", titles)
        con.executemany("INSERT INTO words VALUES (?,?,?,?,?)", rows)
    con.execute("VACUUM")
    con.close()

    os.makedirs(DICT_DIR, exist_ok=True)
    for name, data in (("hebrew", hebrew), ("greek", greek)):
        with open(os.path.join(DICT_DIR, name + ".json"), "w", encoding="utf-8", newline="\n") as f:
            json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

    def p(s=""):
        report.append(s)

    p(f"verses: {len(verses) - len(titles)} (+{len(titles)} psalm titles)")
    p(f"words: {total_words}   with a Strong's number: {tagged_words} ({100 * tagged_words / total_words:.1f}%)")
    p(f"distinct Strong's numbers used: {len(numbers_used)}")
    p(f"dictionary entries: hebrew {len(hebrew)}, greek {len(greek)}")
    p(f"\nnumbers not in the dictionaries: {len(unknown)}  {' '.join(unknown)}")
    p(f"numbers in the wrong testament: {len(wrong_testament)}  {' '.join(wrong_testament[:50])}")
    p(f"\nverses in dailygrace.db missing from the USFM: {len(missing_verse)}")
    for ref in missing_verse:
        p("  " + ref)
    p(f"verses in the USFM missing from dailygrace.db: {len(extra_usfm)}")
    for ref in extra_usfm:
        p("  " + ref)
    lost_tags = sum(n for _, runs in unmatched for _, _, n in runs)
    p(f"\nnumbered words in the USFM: {source_tagged}   carried over: {tagged_words}   "
      f"lost where the wording differs: {lost_tags}")
    p(f"\nverses where the wording differs (our words left without a number): {len(unmatched)}")
    for ref, runs in unmatched:
        p(f"  {ref}: " + "; ".join(f"[{a}] vs [{b}]" for a, b, _ in runs))
    p(f"\nverses with spelling-only differences (matched word for word): {len(spelled)}")
    for ref, runs in spelled:
        p(f"  {ref}: " + "; ".join(f"[{a}] vs [{b}]" for a, b in runs))
    with open(REPORT, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(report) + "\n")
    print("\n".join(report[:14]))
    print(f"verses where the wording differs: {len(unmatched)}; spelling only: {len(spelled)} "
          f"(full lists in {os.path.relpath(REPORT, ROOT)})")
    for path in [STRONGS_DB] + [os.path.join(DICT_DIR, n + ".json") for n in ("hebrew", "greek")]:
        print("wrote %s (%d KB)" % (os.path.relpath(path, ROOT), os.path.getsize(path) // 1024))


if __name__ == "__main__":
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    build(*sys.argv[1:4])
