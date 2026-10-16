"""Build assets/interlinear/<book_id>/<chapter>.json: each verse word by word in
the Hebrew or Greek, for the Interlinear tab of the passage reader.

    python tools/interlinear/build_interlinear.py <STEPBible folder>

The folder holds the STEPBible "Translators Amalgamated" files, downloaded
outside the repo from https://github.com/STEPBible/STEPBible-Data (folder
"Translators Amalgamated OT+NT"; CC BY 4.0, STEPBible.org / Tyndale House):

    TAHOT Gen-Deu …, TAHOT Jos-Est …, TAHOT Job-Sng …, TAHOT Isa-Mal …  (Hebrew OT)
    TAGNT Mat-Jhn …, TAGNT Act-Rev …                                     (Greek NT)

Each chapter file is

    {"lang": "he", "verses": {"1": [[word, translit, gloss, strongs, grammar], …], …}}

with the words in the original order (Hebrew reads right to left). Verses are
numbered as in the KJV (STEPBible gives the English numbering first, the
Hebrew in brackets); a psalm's title is verse "0". What is kept:

  * Hebrew: the Leningrad text with its scribal readings and restorations;
    not the words STEPBible adds from the Greek Septuagint (type X), which the
    KJV does not have. Cantillation marks are taken off; the vowels stay.
  * Greek: the words "used by the KJV translators" (type K: Scrivener's 1894
    text), so the interlinear follows the Greek behind the KJV.

The build checks every verse of dailygrace.db against the result and lists
the ones without words.
"""
import collections
import glob
import json
import os
import re
import shutil
import sqlite3
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
DB = os.path.join(ROOT, "assets", "db", "dailygrace.db")
OUT = os.path.join(ROOT, "assets", "interlinear")
REPORT = os.path.join(HERE, "report.txt")

FILES = ["TAHOT Gen-Deu", "TAHOT Jos-Est", "TAHOT Job-Sng", "TAHOT Isa-Mal", "TAGNT Mat-Jhn", "TAGNT Act-Rev"]
# A word row: "Gen.1.1#01=L", or with a second numbering where the editions
# differ. In () the Hebrew's and in {} the KJV's Greek's, after the English
# one: "Psa.3.1(3.2)#01=L", "Rom.16.25{14.24}#01=NKO". In [] the English one,
# after the modern Greek's: "Php.1.16[1.17]#01=NKO" is the KJV's Philippians 1:17.
ROW = re.compile(r"^(\w+)\.(\d+)\.(\d+)(?:([([{])(\d+)\.(\d+)[)\]}])?#(\d+)=(\S*)\t")
# Hebrew cantillation marks (accents), taken off; the vowel points and the
# maqaf stay. Also the paseq and sof pasuq, which are punctuation.
# STEPBible starts a gloss with the verse number where the numbering changes
# ("[13] Greet", "{14.24} To Him"), and brackets disputed Greek ("[[Καὶ").
RENUMBERED = re.compile(r"^[\[{][\d.]+[\]}]\s*")
DISPUTED = re.compile(r"\[\[|\]\]")
CANTILLATION = re.compile("[֑-ֽ֯׀׃]")


def strong_number(text, prefix):
    """The main Strong's number in a dStrongs field: the one in braces, else the
    first ordinary one (STEPBible numbers its particles from 9000)."""
    braced = re.search(r"\{(%s\d+)" % prefix, text)
    numbers = [braced.group(1)] if braced else re.findall(r"%s\d+" % prefix, text)
    for n in numbers:
        value = int(n[1:])
        if value < 9000:
            return f"{prefix}{value}"
    return ""


POSSESSIVE = re.compile(r"(?i)my|your|his|her|its|our|their")
# Words STEPBible supplies before a noun that a possessive goes after: a verb
# ("[is] my God") or a marker ("<of> his daughters").
SUPPLIED = re.compile(r"^((?:\[(?!male\]|female\]|masc\]|the\])[^\]]*\]\s*|<[^>]*>\s*)*)(?:\[the\]\s*)?")


def possessive_first(noun, pronoun):
    """ "heart" + "my" -> "my heart"; "[the] place of head" + "his" -> "[the]
    place of his head". None where English would not move it ("blood of")."""
    if noun.endswith(" of"):
        return None
    if " of " in noun:
        head, _, tail = noun.rpartition(" of ")
        return f"{head} of {pronoun} {tail}"
    lead = SUPPLIED.match(noun)
    return f"{lead.group(1)}{pronoun} {noun[lead.end():]}"


def hebrew_gloss(gloss, grammar):
    """The gloss in English order. STEPBible glosses each part of the word in
    the Hebrew's order, separated by "/", so a noun's pronoun suffix comes
    after it ("and/ heart/ my"); it is moved before the noun ("and my
    heart"). A pronoun after a verb or a preposition already reads as English
    ("he put him", "to them") and stays."""
    parts = [p.strip() for p in RENUMBERED.sub("", gloss).split("/")]
    segments = grammar.split("/")
    if (len(parts) == len(segments) >= 2 and segments[-1].startswith("Sp")
            and segments[-2].startswith("N") and POSSESSIVE.fullmatch(parts[-1])):
        moved = possessive_first(parts[-2], parts[-1])
        if moved:
            parts[-2:] = [moved]
    # Aramaic's article is a suffix too ("gods/ the", "king/ O"): "the gods", "O king".
    if (len(parts) == len(segments) >= 2 and segments[-1] == "Ta"
            and parts[-1] in ("the", "O")):
        lead = SUPPLIED.match(parts[-2])
        parts[-2:] = [f"{lead.group(1)}{parts[-1]} {parts[-2][lead.end():]}"]
    return " ".join(p for p in parts if p).replace("<obj.>", "[obj.]")


def hebrew_word(fields):
    """[word, translit, gloss, strongs, grammar], with "arc" added for a word
    in Aramaic. STEPBible starts the grammar with the language: H Hebrew, A
    Aramaic (Daniel 2:4-7:28, Ezra 4:8-6:18 and 7:12-26, Jeremiah 10:11)."""
    word, translit, gloss, strongs, grammar = fields[1:6]
    word = CANTILLATION.sub("", word.replace("/", "").replace("\\", ""))
    translit = translit.replace("/", "").replace(".", "·").lower()
    # A scribal reading's row can have no grammar: Hebrew, like its text.
    language, grammar = (grammar[:1], grammar[1:]) if grammar else ("H", "")
    if language not in ("H", "A"):
        sys.exit(f"unknown language in the grammar {fields[5]!r} of {fields[0]}")
    result = [word, translit, hebrew_gloss(gloss, grammar), strong_number(strongs, "H"), grammar]
    if language == "A":
        result.append("arc")
    return result


def greek_word(fields):
    m = re.match(r"(.*?)\s*\((.*)\)\s*$", fields[1])
    word, translit = (m.group(1), m.group(2)) if m else (fields[1].strip(), "")
    word = DISPUTED.sub("", word).strip()
    tag = re.search(r"(G\d+)[A-Z]?=([^\t|«]+)$", fields[3])
    strongs = f"G{int(tag.group(1)[1:])}" if tag else ""
    grammar = tag.group(2) if tag else ""
    return [word, translit, RENUMBERED.sub("", fields[2]).strip(), strongs, grammar]


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    folder = sys.argv[1]
    con = sqlite3.connect(DB)
    books = [r[0] for r in con.execute("SELECT book_id FROM books ORDER BY book_number")]
    db_verses = collections.defaultdict(set)
    for book, chapter, verse in con.execute("SELECT book, chapter, verse FROM verses"):
        db_verses[(book, int(chapter))].add(int(verse))
    con.close()

    codes = []                      # STEPBible book codes, in order of appearance
    chapters = collections.defaultdict(lambda: collections.defaultdict(list))
    kept = collections.Counter()
    dropped = collections.Counter()
    for name in FILES:
        files = glob.glob(os.path.join(folder, name.replace(" ", "?") + "*"))
        if len(files) != 1:
            sys.exit(f"no single file for {name!r} in {folder}")
        greek = name.startswith("TAGNT")
        with open(files[0], encoding="utf-8-sig") as f:
            for line in f:
                m = ROW.match(line)
                if not m:
                    continue
                code, chapter, verse, bracket, alt_chapter, alt_verse, _, kind = m.groups()
                if bracket == "[":
                    chapter, verse = alt_chapter, alt_verse
                if code not in codes:
                    codes.append(code)
                keep = "K" in kind if greek else not kind.startswith("X")
                if not keep:
                    dropped["greek" if greek else "hebrew"] += 1
                    continue
                fields = line.rstrip("\n").split("\t")
                word = greek_word(fields) if greek else hebrew_word(fields)
                chapters[(code, int(chapter))][int(verse)].append(word)
                kept["greek" if greek else "hebrew"] += 1
                if not greek and word[5:] == ["arc"]:
                    kept["aramaic"] += 1
    if len(codes) != len(books):
        sys.exit(f"{len(codes)} STEPBible books for {len(books)} in dailygrace.db")
    book_of = dict(zip(codes, books))

    shutil.rmtree(OUT, ignore_errors=True)
    missing, extra = [], []
    total_bytes = files_written = 0
    for (code, chapter), verses in sorted(chapters.items(), key=lambda kv: (codes.index(kv[0][0]), kv[0][1])):
        book = book_of[code]
        known = db_verses.get((book, chapter), set())
        for v in sorted(set(verses) - known - {0}):
            extra.append(f"{book} {chapter}:{v}")
        lang = "grc" if codes.index(code) >= codes.index("Mat") else "he"
        doc = {"lang": lang, "verses": {str(v): words for v, words in sorted(verses.items()) if v in known or v == 0}}
        os.makedirs(os.path.join(OUT, book), exist_ok=True)
        path = os.path.join(OUT, book, f"{chapter}.json")
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
        total_bytes += os.path.getsize(path)
        files_written += 1
    for (book, chapter), verses in sorted(db_verses.items()):
        code = codes[books.index(book)]
        have = chapters.get((code, chapter), {})
        for v in sorted(verses):
            if not have.get(v):
                missing.append(f"{book} {chapter}:{v}")

    lines = [
        f"chapter files: {files_written} (dailygrace.db has {len(db_verses)} chapters), {total_bytes / 1e6:.1f} MB",
        f"words kept: Hebrew {kept['hebrew']} (of them Aramaic {kept['aramaic']}), Greek {kept['greek']}",
        f"words left out: Hebrew {dropped['hebrew']} (from the Septuagint), Greek {dropped['greek']} (not in the KJV's Greek)",
        f"psalm titles: {sum(1 for (c, _), vs in chapters.items() if c == 'Psa' and vs.get(0))}",
        f"KJV verses with no words: {len(missing)}",
        *[f"  {r}" for r in missing],
        f"verses in STEPBible but not in dailygrace.db: {len(extra)}",
        *[f"  {r}" for r in extra],
    ]
    with open(REPORT, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(lines) + "\n")
    print("\n".join(lines[:6]))
    print(f"(full lists in {os.path.relpath(REPORT, ROOT)})")


if __name__ == "__main__":
    main()
