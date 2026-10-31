# -*- coding: utf-8 -*-
"""
Check, day by day, which of the Grace Library's files are on the media host.

For every day from LIBRARY_START to the last day in assets/verses/, asks the
host (HEAD requests, no keys needed) for the day's

    poster   images/sources/<YYYY>/<month>/<Month D, YYYY>.webp
    comic    images/sources/<YYYY>/<month>/<Month D, YYYY> - Comic.webp
    audio    audio/<YYYY>/<Month>/webm/<Month D, YYYY>.webm
    banner   banner/<YYYY>/<month>/daily-grace-<YYYY-MM-DD>.webp
    video    images/sources/<YYYY>/<month>/<Month D, YYYY>.mp4      (optional)
    thumb    images/thumbs/<YYYY>/<month>/<Month D, YYYY>.webp      (optional)

and writes tools/library/media.json, which build_library_index.py reads. A
day up to today that lacks one of REQUIRED is reported, and the index keeps it
out of the Library until it is complete; later days are only listed, since
their files usually go up nearer the day.

    python tools/library/audit_library_media.py
    python tools/library/audit_library_media.py --until 2026-12-31

Run it after each month's upload, then build_library_index.py.
"""
import argparse, json, os, sys
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta, timezone
from urllib.parse import quote
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from build_library_index import LIBRARY_START, ROOT, read_verse_days  # noqa: E402

MEDIA_BASE = json.load(
    open(os.path.join(ROOT, "apps", "settings", "appsettings.json"), encoding="utf-8")
)["media_base_url"]
OUTPUT = os.path.join(HERE, "media.json")

# A day missing any of these is not complete and stays out of the Library.
REQUIRED = ("poster", "comic", "audio", "banner")
PIECES = REQUIRED + ("video", "thumb")


def manila_today():
    return datetime.now(timezone(timedelta(hours=8))).date()


def paths(day):
    name = "%s %d, %d" % (day.strftime("%B"), day.day, day.year)
    month = day.strftime("%B")
    sources = "images/sources/%d/%s/%s" % (day.year, month.lower(), name)
    return {
        "poster": sources + ".webp",
        "comic": sources + " - Comic.webp",
        "audio": "audio/%d/%s/webm/%s.webm" % (day.year, month, name),
        "banner": "banner/%d/%s/daily-grace-%s.webp" % (day.year, month.lower(), day.isoformat()),
        "video": sources + ".mp4",
        "thumb": "images/thumbs/%d/%s/%s.webp" % (day.year, month.lower(), name),
    }


def present(path):
    # Cloudflare turns away Python's own user agent (403).
    request = Request(MEDIA_BASE + quote(path), method="HEAD",
                      headers={"User-Agent": "Mozilla/5.0 (DailyGrace library audit)"})
    for _ in range(3):
        try:
            with urlopen(request, timeout=20) as response:
                return response.status == 200
        except HTTPError as error:
            if error.code == 404:
                return False
        except URLError:
            pass
    raise SystemExit("The media host did not answer for %s; nothing was written." % path)


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--until", help="last day to check, YYYY-MM-DD (default: the last day in assets/verses/)")
    args = parser.parse_args()

    start = date.fromisoformat(LIBRARY_START)
    days = sorted(d for d in read_verse_days() if d >= start)
    if args.until:
        days = [d for d in days if d <= date.fromisoformat(args.until)]
    jobs = [(day, piece, path) for day in days for piece, path in paths(day).items()]
    with ThreadPoolExecutor(max_workers=16) as pool:
        found = list(pool.map(lambda job: present(job[2]), jobs))

    result = {day.isoformat(): {} for day in days}
    for (day, piece, _), ok in zip(jobs, found):
        result[day.isoformat()][piece] = int(ok)

    today = manila_today()
    released = [d for d in days if d <= today]
    print("Checked %d days (%s to %s); %d are released." % (
        len(days), days[0], days[-1], len(released)))
    for piece in PIECES:
        have = sum(result[d.isoformat()][piece] for d in released)
        print("  %-7s %d / %d released days" % (piece, have, len(released)))
    incomplete = [(d, [p for p in REQUIRED if not result[d.isoformat()][p]]) for d in released]
    incomplete = [(d, missing) for d, missing in incomplete if missing]
    for d, missing in incomplete:
        print("  INCOMPLETE %s: no %s" % (d, ", ".join(missing)))
    later = [d for d in days if d > today and not all(result[d.isoformat()][p] for p in REQUIRED)]
    if later:
        print("  %d later days are not all uploaded yet (first: %s)." % (len(later), later[0]))

    with open(OUTPUT, "w", encoding="utf-8", newline="\n") as f:
        json.dump({"audited": today.isoformat(), "required": list(REQUIRED), "days": result},
                  f, indent=1, sort_keys=True)
        f.write("\n")
    print("Wrote %s" % os.path.relpath(OUTPUT, ROOT))


if __name__ == "__main__":
    main()
