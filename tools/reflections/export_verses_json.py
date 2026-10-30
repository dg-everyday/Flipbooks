# -*- coding: utf-8 -*-
"""
Write assets/verses/YYYY/<month>.json from the sources of Reflections YYYY.

Reads the same calendar_YYYY.txt, content/YYYY-MM.txt and KJV database as
build_reflections.py, so the app's daily verses match the PDF word for word,
and adds each day's Daily Moment question and prayer from moments/YYYY-MM.txt:

    == Jan 01
    Q: question for the Respond step (ends with a question mark)
    P: prayer for the Pray step (ends with "Amen.")

    python tools/reflections/export_verses_json.py --year 2028 --dry-run   # validate only
    python tools/reflections/export_verses_json.py --year 2028

A year with no moments files gets no question or prayer, and the Daily Moment
falls back to its general wording; a year with any must have them for every
day. 'Single-quoted' Scripture is checked against the KJV and prints as
"double quotes", as in the earlier years' JSON. If any day fails a check,
nothing is written.
"""
import argparse, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_reflections as br  # noqa: E402
from kjv_quotes import QUOTE, Quotes  # noqa: E402

MOMENTS = os.path.join(HERE, "moments")
OUTPUT = os.path.join(br.ROOT, "assets", "verses", "%d")

QUESTION_WORDS = (6, 25)
PRAYER_WORDS = (15, 45)


def read_moments(year):
    entries, current = {}, None
    if not os.path.isdir(MOMENTS):
        return entries
    for name in sorted(os.listdir(MOMENTS)):
        if not name.startswith("%d-" % year) or not name.endswith(".txt"):
            continue
        for n, line in enumerate(open(os.path.join(MOMENTS, name), encoding="utf-8"), 1):
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("=="):
                current = line[2:].strip()
                if current in entries:
                    raise SystemExit("moments/%s:%d: %s appears twice" % (name, n, current))
                entries[current] = {"_where": "moments/%s:%d" % (name, n)}
            elif current and re.match(r"^[QP]: ", line):
                entries[current][line[0]] = line[3:].strip()
            else:
                raise SystemExit("moments/%s:%d: unexpected line %r" % (name, n, line[:60]))
    return entries


def validate(days, entries, moments, quotes):
    problems = []
    keys = {d["key"] for d in days}
    problems += ["%s: not a day of the calendar" % k for k in moments if k not in keys]
    for d in days:
        if "R" not in entries.get(d["key"], {}):
            problems.append("%s: no reflection in content/" % d["key"])
        if not moments:
            continue
        m = moments.get(d["key"])
        if not m:
            problems.append("%s: no question or prayer in moments/" % d["key"])
            continue
        where = m["_where"]
        for k, label, ending, (lo, hi) in (("Q", "question", "?", QUESTION_WORDS),
                                           ("P", "prayer", "Amen.", PRAYER_WORDS)):
            text = m.get(k)
            if not text:
                problems.append("%s: no %s" % (where, label))
                continue
            if not text.endswith(ending):
                problems.append("%s: %s should end with %r" % (where, label, ending))
            if not lo <= br.words(text) <= hi:
                problems.append("%s: %s has %d words (%d-%d)" % (where, label, br.words(text), lo, hi))
            if '"' in text or "“" in text:
                problems.append("%s: %s should mark Scripture with 'single quotes'" % (where, label))
            hit = br.SECTARIAN.search(text)
            if hit:
                problems.append("%s: %s mentions %r" % (where, label, hit.group(0)))
            problems += ["%s %s: %s" % (where, label, p) for p in quotes.problems(text)]
    return problems


def scripture(text):
    return QUOTE.sub(lambda m: '"%s"' % m.group(1), text)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--year", type=int, required=True)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    br.YEAR = args.year

    _, days = br.read_calendar()
    entries = br.read_content()
    moments = read_moments(args.year)
    bible = br.Bible(br.BIBLE_DB)

    problems = validate(days, entries, moments, Quotes(bible.con))
    if problems:
        print("\n".join(problems))
        raise SystemExit("%d problem(s); nothing written" % len(problems))

    months = {}
    for d in days:
        entry = {
            "id": "%s %d, %d" % (d["date"].strftime("%B"), d["date"].day, args.year),
            "verse": d["ref"],
            # A verse that stops mid-sentence ends in an ellipsis, as in the PDF;
            # apostrophes stay straight, as in the earlier years' JSON.
            "text": re.sub(r"[,;:]$", "…", bible.text(d["ref"])).replace("’", "'"),
            "reflection": scripture(entries[d["key"]]["R"]),
        }
        if moments:
            entry["question"] = scripture(moments[d["key"]]["Q"])
            entry["prayer"] = scripture(moments[d["key"]]["P"])
        months.setdefault(d["date"].strftime("%B").lower(), []).append(entry)

    if args.dry_run:
        print("%d days check out" % len(days))
        return
    folder = OUTPUT % args.year
    os.makedirs(folder, exist_ok=True)
    for month, rows in months.items():
        with open(os.path.join(folder, month + ".json"), "w", encoding="utf-8", newline="\n") as f:
            json.dump(rows, f, ensure_ascii=False, indent=4)
            f.write("\n")
    print("%d days in %d files -> %s" % (len(days), len(months), folder))


if __name__ == "__main__":
    main()
