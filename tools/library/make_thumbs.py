# -*- coding: utf-8 -*-
"""
Make the Daily Grace Archives' thumbnails: each day's poster at 240 x 427 (WebP,
quality 70, about 20 KB against the poster's 200-450 KB).

Reads the posters from the media host and writes, laid out as on the host,

    <out>/images/thumbs/<YYYY>/<month>/<Month D, YYYY>.webp

for every day from LIBRARY_START that the last audit (tools/library/media.json)
found a poster for. A thumbnail already made is left alone, so a run only adds
what is new, and nothing is ever deleted. Upload the folder with rclone:

    python tools/library/make_thumbs.py
    rclone copy "D:/DailyGrace/ChatGPT/library/r2/media" r2:<bucket>/media --checksum
    python tools/library/audit_library_media.py      # thumb: n / n

A thumbnail replaced later under the same name needs a ?v= on its URL, since
the host lets browsers keep media for a day.
"""
import argparse, io, json, os, sys
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from urllib.parse import quote
from urllib.request import Request, urlopen

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from build_library_index import LIBRARY_START  # noqa: E402
from audit_library_media import MEDIA_BASE, paths  # noqa: E402

SIZE = (240, 427)
QUALITY = 70
# A staging folder of its own, outside the folders the posters are made in.
DEFAULT_OUT = r"D:\DailyGrace\ChatGPT\library\r2\media"


def make(day, out):
    piece = paths(day)
    target = os.path.join(out, *piece["thumb"].split("/"))
    if os.path.exists(target):
        return "kept"
    request = Request(MEDIA_BASE + quote(piece["poster"]),
                      headers={"User-Agent": "Mozilla/5.0 (DailyGrace library thumbnails)"})
    with urlopen(request, timeout=60) as response:
        poster = Image.open(io.BytesIO(response.read())).convert("RGB")
    os.makedirs(os.path.dirname(target), exist_ok=True)
    poster.resize(SIZE, Image.LANCZOS).save(target, "WEBP", quality=QUALITY, method=6)
    return "made"


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--out", default=DEFAULT_OUT, help="the media folder to write into (default: %(default)s)")
    parser.add_argument("--until", help="last day, YYYY-MM-DD (default: every day with a poster)")
    args = parser.parse_args()

    media = json.load(open(os.path.join(HERE, "media.json"), encoding="utf-8"))
    days = [date.fromisoformat(iso) for iso, found in sorted(media["days"].items())
            if found.get("poster") and iso >= LIBRARY_START]
    if args.until:
        days = [d for d in days if d <= date.fromisoformat(args.until)]
    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(lambda d: make(d, args.out), days))
    print("%d made, %d already there, in %s" % (results.count("made"), results.count("kept"), args.out))


if __name__ == "__main__":
    main()
