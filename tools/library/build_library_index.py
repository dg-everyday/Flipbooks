# -*- coding: utf-8 -*-
"""
Write the Daily Grace Archives' index: assets/library/index.json and one
assets/library/<YYYY>.json per year.

The Library (apps/pages/library.html) lists every complete Daily Grace day
from LIBRARY_START on. For each day it needs, besides what assets/verses/
already holds, a title (the poster's headline, which is the calendar's
theme), its month's emphasis and a short summary for search. They come from

    assets/verses/<YYYY>/<month>.json       the day's reference
    calendar_<YYYY>.txt                     title and month emphasis, read
                                            from tools/library/ (2026) or
                                            tools/reflections/ (2027 on)
    tools/reflections/content/YYYY-MM.txt   the S: line, for the summary
                                            (2026 has none: the reflection's
                                            first sentences stand in)
    tools/library/media.json                which days are complete and which
                                            have a poster video, from
                                            audit_library_media.py

    python tools/library/build_library_index.py --dry-run   # check only
    python tools/library/build_library_index.py

A day the audit found incomplete (up to the day it ran) is written with
"missing" and the page leaves it out until a later audit finds it whole. Days
after the audit are taken as they come; their files go up before their day.
If any check fails, nothing is written. The page shows only days up to today
in Manila, so a year's file can hold days still to come.
"""
import argparse, glob, json, os, re, sys
from datetime import date, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
REFLECTIONS = os.path.join(ROOT, "tools", "reflections")
OUTPUT = os.path.join(ROOT, "assets", "library")

# The first day with every piece (poster, comic, narration, banner, title).
# The series began on September 1, 2026, but its banners only on September 11.
LIBRARY_START = "2026-09-11"

# Citations say "Psalm"; the book is Psalms (as in scripture-refs.js).
BOOK_NAMES = {"Psalm": "Psalms"}
SUMMARY_MAX = 240
MONTH_ABBR = {"Sep": 9, "Sept": 9}


def read_verse_days():
    """{date: entry} for every day in assets/verses/."""
    days = {}
    for path in sorted(glob.glob(os.path.join(ROOT, "assets", "verses", "*", "*.json"))):
        for entry in json.load(open(path, encoding="utf-8")):
            day = datetime.strptime(entry["id"], "%B %d, %Y").date()
            if day in days:
                raise SystemExit("%s appears twice in assets/verses/" % entry["id"])
            days[day] = entry
    return days


def read_calendar(year):
    """({date: (reference, title)}, {month number: emphasis}) for a year."""
    for folder in (HERE, REFLECTIONS):
        path = os.path.join(folder, "calendar_%d.txt" % year)
        if os.path.exists(path):
            break
    else:
        raise SystemExit("No calendar_%d.txt in tools/library/ or tools/reflections/" % year)
    days, months = {}, {}
    for n, line in enumerate(open(path, encoding="utf-8"), 1):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = [p.strip() for p in line.lstrip("@ ").split("|")]
        if line.startswith("@"):
            months[datetime.strptime(parts[0], "%B").month] = parts[1]
            continue
        if len(parts) != 4:
            raise SystemExit("%s:%d: expected date | day | reference | theme" % (os.path.basename(path), n))
        month, number = parts[0].split()
        day = date(year, MONTH_ABBR.get(month) or datetime.strptime(month, "%b").month, int(number))
        days[day] = (parts[2], parts[3])
    return days, months


def read_summaries(year):
    """{date: S line} from tools/reflections/content/<year>-MM.txt."""
    summaries = {}
    for path in sorted(glob.glob(os.path.join(REFLECTIONS, "content", "%d-*.txt" % year))):
        current = None
        for line in open(path, encoding="utf-8"):
            line = line.strip()
            if line.startswith("== "):
                month, number = line[3:].split()
                current = date(year, datetime.strptime(month, "%b").month, int(number))
            elif line.startswith("S: ") and current:
                summaries[current] = line[3:].strip()
    return summaries


def first_sentences(text, limit=SUMMARY_MAX):
    """The reflection's opening sentences, as many as fit in limit."""
    sentences = re.split(r"(?<=[.!?])\s+", " ".join(text.split()))
    summary = sentences[0]
    for sentence in sentences[1:]:
        if len(summary) + 1 + len(sentence) > limit:
            break
        summary += " " + sentence
    if len(summary) > limit:
        summary = summary[:limit].rsplit(" ", 1)[0].rstrip(",;:") + "…"
    return summary


def book_of(reference):
    book = re.sub(r"\s+\d+(?::.*)?$", "", reference).strip()
    return BOOK_NAMES.get(book, book)


def build(verse_days, media):
    start = date.fromisoformat(LIBRARY_START)
    known_books = set(json.load(open(os.path.join(ROOT, "assets", "book-metadata.json"), encoding="utf-8")))
    audited = date.fromisoformat(media["audited"]) if media else None
    required = media.get("required", []) if media else []
    days = sorted(d for d in verse_days if d >= start)
    problems, years = [], {}
    calendars, summaries = {}, {}

    expected = start
    for day in days:
        if day != expected:
            problems.append("%s: no day in assets/verses/ between %s and %s" % (expected, expected, day))
        expected = date.fromordinal(day.toordinal() + 1)

        if day.year not in calendars:
            calendars[day.year] = read_calendar(day.year)
            summaries[day.year] = read_summaries(day.year)
        calendar, months = calendars[day.year]
        entry = verse_days[day]
        reference = entry["verse"]
        planned = calendar.get(day)
        if not planned:
            problems.append("%s: not in calendar_%d.txt" % (day, day.year))
            continue
        if planned[0] != reference:
            problems.append("%s: the calendar says %s, assets/verses/ says %s" % (day, planned[0], reference))
        book = book_of(reference)
        if book not in known_books:
            problems.append("%s: %r is not a book in assets/book-metadata.json" % (day, book))
        if day.month not in months:
            problems.append("%s: calendar_%d.txt has no @ line for %s" % (day, day.year, day.strftime("%B")))

        item = {
            "date": day.isoformat(),
            "ref": reference,
            "book": book,
            "title": planned[1],
            "summary": summaries[day.year].get(day) or first_sentences(entry["reflection"]),
        }
        found = (media or {}).get("days", {}).get(day.isoformat())
        if found and found.get("video"):
            item["video"] = True
        if found and audited and day <= audited:
            missing = [piece for piece in required if not found.get(piece)]
            if missing:
                item["missing"] = missing

        year = years.setdefault(day.year, {"year": day.year, "months": {}, "days": []})
        year["months"].setdefault("%d-%02d" % (day.year, day.month), months.get(day.month))
        year["days"].append(item)
    return years, problems


def write_json(path, data):
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
        f.write("\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--dry-run", action="store_true", help="check everything, write nothing")
    args = parser.parse_args()

    media_path = os.path.join(HERE, "media.json")
    media = json.load(open(media_path, encoding="utf-8")) if os.path.exists(media_path) else None
    if not media:
        print("No tools/library/media.json yet: run audit_library_media.py first for completeness.")
    years, problems = build(read_verse_days(), media)
    if problems:
        for problem in problems:
            print("PROBLEM " + problem)
        raise SystemExit("%d problem(s); nothing written." % len(problems))

    for year, data in sorted(years.items()):
        held = [d["date"] for d in data["days"] if d.get("missing")]
        print("%d: %d days, %d months%s" % (
            year, len(data["days"]), len(data["months"]),
            ", held back: " + ", ".join(held) if held else ""))
    if args.dry_run:
        print("Dry run: nothing written.")
        return
    os.makedirs(OUTPUT, exist_ok=True)
    for year, data in years.items():
        write_json(os.path.join(OUTPUT, "%d.json" % year), data)
    write_json(os.path.join(OUTPUT, "index.json"), {"start": LIBRARY_START, "years": sorted(years)})
    print("Wrote assets/library/index.json and %s" % ", ".join("%d.json" % y for y in sorted(years)))


if __name__ == "__main__":
    main()
