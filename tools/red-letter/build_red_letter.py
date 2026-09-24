# -*- coding: utf-8 -*-
"""
Write assets/red-letter.json: where the words of Jesus fall in each KJV verse of
dailygrace.db, so the verse cards can print them in red.

The words come from the King James Version on the HelloAO Bible API (public
domain, CC0), whose text marks them with "wordsOfJesus". The New Testament
chapters are downloaded into tools/red-letter/cache/ (gitignored) first; files
already cached are skipped, so a rerun only fetches what is missing.

    python tools/red-letter/build_red_letter.py

The output keys verses by the book ids of the books table, and gives each one
the [start, end) character ranges of its red words in that verse's text:

    { "John": { "14:6": [[22, 102]] } }

Ranges are found by matching the marked text against dailygrace.db, so the
database is only read. Verses whose words cannot be matched are reported and
left out, which leaves them in black rather than red in the wrong place.
"""
import difflib, json, os, re, sqlite3, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CACHE = os.path.join(HERE, "cache")
DB = os.path.join(ROOT, "assets", "db", "dailygrace.db")
OUT = os.path.join(ROOT, "assets", "red-letter.json")

API = "https://bible.helloao.org/api/eng_kjv"
FIRST_NEW_TESTAMENT_BOOK = 40  # Matthew; the Old Testament has no words of Jesus


def get(url, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                return r.read()
        except Exception:
            if i == tries - 1:
                raise
            time.sleep(2 ** i)


def fetch(job):
    book, chapter = job
    path = os.path.join(CACHE, f"{book}_{chapter}.json")
    if not os.path.exists(path):
        data = get(f"{API}/{book}/{chapter}.json")
        with open(path, "wb") as f:
            f.write(data)
    with open(path, encoding="utf8") as f:
        return book, chapter, json.load(f)


def segments(content):
    """Yield (text, is_red) for the text of one verse, skipping notes and breaks."""
    for item in content:
        if isinstance(item, str):
            yield item, False
        elif isinstance(item, dict) and isinstance(item.get("text"), str):
            yield item["text"], bool(item.get("wordsOfJesus"))


# HelloAO keeps the ligatures of the 1769 text (Cæsar, Judæa); dailygrace.db spells them out
LIGATURES = {"æ": "ae", "œ": "oe"}


def letters(text):
    """Lowercase letters and digits of text, with the index in text of each."""
    kept = [(i, l) for i, c in enumerate(text) if c.isalnum() for l in LIGATURES.get(c.lower(), c.lower())]
    return "".join(c for _, c in kept), [i for i, _ in kept]


def near(have, wanted, first):
    """Where wanted sits in have[first:] allowing a few differing letters (the
    two texts differ in a handful of spellings: "cut if off", "Nicolaitanes"),
    as a [start, end) of have, or None."""
    blocks = [b for b in difflib.SequenceMatcher(None, wanted, have[first:], autojunk=False)
              .get_matching_blocks() if b.size]
    if not blocks or sum(b.size for b in blocks) < 0.95 * len(wanted):
        return None
    start = first + blocks[0].b - blocks[0].a
    end = first + blocks[-1].b + blocks[-1].size + len(wanted) - blocks[-1].a - blocks[-1].size
    if start < first or end > len(have) or abs((end - start) - len(wanted)) > 3:
        return None
    return start, end


def locate(text, part, start):
    """[start, end) of part in text at or after start, or None.

    Tries the exact words first, then the same letters ignoring spacing and
    punctuation, then letters with a few spelling differences; a match on
    letters is extended over punctuation the part itself ends with.
    """
    at = text.find(part, start)
    if at >= 0:
        return at, at + len(part)
    wanted, _ = letters(part)
    if not wanted:
        return None
    have, index = letters(text)
    first = next((n for n, i in enumerate(index) if i >= start), len(index))
    at = have.find(wanted, first)
    found = (at, at + len(wanted)) if at >= 0 else near(have, wanted, first)
    if found is None:
        return None
    begin, end = index[found[0]], index[found[1] - 1] + 1
    tail = re.search(r"[^\w\s]*$", part.rstrip()).group()
    while tail and end < len(text) and text[end] == tail[0]:
        end, tail = end + 1, tail[1:]
    return begin, end


def ranges_for(text, parts):
    """Red [start, end) ranges of one verse, or None if any part is not found."""
    ranges, cursor = [], 0
    for part, red in parts:
        part = part.strip()
        # Nothing to match or colour in a paragraph mark (¶) the database leaves out
        if not letters(part)[0]:
            continue
        found = locate(text, part, cursor)
        if found is None:
            return None
        cursor = found[1]
        if not red:
            continue
        # Red words split only by spaces (a note, a line break) read as one run
        if ranges and not text[ranges[-1][1]:found[0]].strip():
            ranges[-1][1] = found[1]
        else:
            ranges.append(list(found))
    return ranges


def main():
    os.makedirs(CACHE, exist_ok=True)
    books_path = os.path.join(CACHE, "books.json")
    if not os.path.exists(books_path):
        with open(books_path, "wb") as f:
            f.write(get(f"{API}/books.json"))
    with open(books_path, encoding="utf8") as f:
        helloao_books = json.load(f)["books"]

    con = sqlite3.connect(DB)
    book_ids = [r[0] for r in con.execute("SELECT book_id FROM books ORDER BY book_number")]
    # Both lists are the 66 books in canonical order
    assert len(book_ids) == len(helloao_books) == 66
    to_book_id = {b["id"]: book_id for b, book_id in zip(helloao_books, book_ids)}
    texts = {
        (book, int(chapter), int(verse)): text
        for book, chapter, verse, text in con.execute("SELECT book, chapter, verse, text FROM verses")
    }

    jobs = [
        (b["id"], chapter)
        for b in helloao_books[FIRST_NEW_TESTAMENT_BOOK - 1:]
        for chapter in range(1, b["numberOfChapters"] + 1)
    ]
    with ThreadPoolExecutor(8) as pool:
        chapters = list(pool.map(fetch, jobs))

    out, red_verses, unmatched = {}, 0, []
    for helloao_book, chapter, data in chapters:
        book = to_book_id[helloao_book]
        for item in data["chapter"]["content"]:
            if item.get("type") != "verse":
                continue
            parts = list(segments(item["content"]))
            if not any(red for _, red in parts):
                continue
            verse = int(item["number"])
            reference = f"{book} {chapter}:{verse}"
            text = texts.get((book, chapter, verse))
            ranges = ranges_for(text, parts) if text else None
            if not ranges:
                unmatched.append(reference)
                continue
            out.setdefault(book, {})[f"{chapter}:{verse}"] = ranges
            red_verses += 1

    with open(OUT, "w", encoding="utf8", newline="\n") as f:
        json.dump(out, f, separators=(",", ":"))
        f.write("\n")
    print(f"{red_verses} verses with words of Jesus in {len(out)} books -> {os.path.relpath(OUT, ROOT)}"
          f" ({os.path.getsize(OUT) // 1024} KB)")
    if unmatched:
        print(f"{len(unmatched)} verses could not be matched to dailygrace.db:", ", ".join(unmatched))
        sys.exit(1)


if __name__ == "__main__":
    main()
