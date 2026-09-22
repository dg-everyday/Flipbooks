# -*- coding: utf-8 -*-
"""
Measure where the artwork actually sits inside each book thumbnail.

The 66 tiles on the media host are all 1024x1024, but the gold frame inside them
is not the same size or quite in the same place from one book to the next, which
is very visible when three sit side by side in the trivia popup. This reads each
file, finds the bounds of the non-transparent pixels, squares them off, and
writes apps/components/book-thumb-bounds.js, which <bible-trivia> uses to draw
every tile at one size.

Run it again whenever the thumbnails on the media host change:

    python tools/thumbnails/measure_bounds.py
    python tools/thumbnails/measure_bounds.py --media-base http://localhost:9001/media/

Needs Pillow (pip install pillow) and reads the book names from didyouknow.db.
"""
import argparse, io, json, os, sqlite3, time, urllib.parse, urllib.request

from PIL import Image, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
DYK_DB = os.path.join(ROOT, "assets", "db", "didyouknow.db")
OUT_JS = os.path.join(ROOT, "apps", "components", "book-thumb-bounds.js")

DEFAULT_MEDIA_BASE = "https://dailygrace.faith/media/"
SUFFIX = "_square.webp"
# Some tiles carry a faint coloured halo outside the frame, barely visible but
# enough to throw the bounds out; take the half-opaque point as the real edge.
ALPHA_FLOOR = 128
# How much colour a pixel needs before it counts as artwork rather than as
# white paper or a grey shadow. The gold frame clears this easily.
SATURATION_FLOOR = 60
# Used when a frame's corner cannot be measured.
DEFAULT_CORNER_RADIUS = 0.17
USER_AGENT = "Mozilla/5.0 (compatible; DailyGrace-thumbnail-measure/1.0)"


def book_names():
    con = sqlite3.connect(DYK_DB)
    try:
        return [row[0] for row in con.execute("SELECT DISTINCT Book FROM did_you_know ORDER BY Book")]
    finally:
        con.close()


def thumbnail_url(media_base, book):
    return "%simages/thumbnails/%s%s" % (media_base, urllib.parse.quote(book), SUFFIX)


def measure(data):
    """Return (x, y, size) as fractions of the image: a square around the art."""
    image = Image.open(io.BytesIO(data)).convert("RGBA")
    width, height = image.size

    # Look for the gold frame rather than for the edge of the file. Most tiles
    # sit on transparency, but some were exported on white and some carry a grey
    # drop shadow, and neither is part of the artwork. The frame is the one
    # strongly coloured thing at the outside, so take the bounds of the
    # saturated pixels: white, grey and transparency all drop out at once.
    red, green, blue, alpha = image.split()
    lightest = ImageChops.lighter(ImageChops.lighter(red, green), blue)
    darkest = ImageChops.darker(ImageChops.darker(red, green), blue)
    saturated = ImageChops.subtract(lightest, darkest).point(
        lambda value: 255 if value > SATURATION_FLOOR else 0)
    visible = alpha.point(lambda value: 255 if value > ALPHA_FLOOR else 0)
    mask = ImageChops.multiply(saturated, visible)
    box = mask.getbbox()
    if box is None:
        return 0.0, 0.0, 1.0, DEFAULT_CORNER_RADIUS

    left, top, right, bottom = box
    # The frames are square; squaring the bounds keeps the art undistorted and
    # absorbs a stray pixel on one edge.
    side = max(right - left, bottom - top)
    centre_x = (left + right) / 2
    centre_y = (top + bottom) / 2
    x = centre_x - side / 2
    y = centre_y - side / 2

    # Keep the square inside the image, shrinking it only if it cannot fit.
    side = min(side, width, height)
    x = min(max(x, 0), width - side)
    y = min(max(y, 0), height - side)
    radius = corner_radius(mask, left, top, side)
    return (round(x / width, 4), round(y / height, 4),
            round(side / width, 4), round(radius, 4))


def corner_radius(mask, left, top, side):
    """
    How rounded the frame's corner is, as a fraction of its side.

    The tile is clipped to this, which hides whatever a given file happens to
    carry outside its frame: a drop shadow, a halo, or in one case a
    transparency checkerboard flattened into the artwork by mistake.
    """
    pixels = mask.load()
    limit = side // 2
    # For each row down the frame's left edge, how far in the artwork starts.
    insets = []
    for offset in range(limit):
        row = [dx for dx in range(limit) if pixels[left + dx, top + offset] > 0]
        insets.append(row[0] if row else limit)
    straight = min(insets)
    for offset, inset in enumerate(insets):
        if inset <= straight + 1:
            return min(offset / side, 0.5)
    return DEFAULT_CORNER_RADIUS


def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--media-base", default=DEFAULT_MEDIA_BASE,
                        help="where the thumbnails live (default: %(default)s)")
    args = parser.parse_args()
    media_base = args.media_base if args.media_base.endswith("/") else args.media_base + "/"

    bounds, missing = {}, []
    for book in book_names():
        url = thumbnail_url(media_base, book)
        # The media host is behind Cloudflare, which refuses the default agent
        # and occasionally drops a connection, so give each file a few tries.
        request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        data = None
        for attempt in range(4):
            try:
                with urllib.request.urlopen(request, timeout=30) as response:
                    data = response.read()
                break
            except Exception as error:  # noqa: BLE001 - retry, then report
                last_error = error
                time.sleep(0.5 * (attempt + 1))
        if data is None:
            missing.append("%s (%s)" % (book, last_error))
            continue
        bounds[book] = measure(data)
        print("  %-20s x=%.4f y=%.4f size=%.4f radius=%.4f" % (book, *bounds[book]))

    if missing:
        print("\ncould not read %d thumbnail(s):" % len(missing))
        for item in missing:
            print("  " + item)
    if not bounds:
        raise SystemExit("no thumbnails could be read; nothing written")

    sizes = sorted(value[2] for value in bounds.values())
    median = sizes[len(sizes) // 2]
    radii = sorted(value[3] for value in bounds.values())
    median_radius = radii[len(radii) // 2]
    print("\nart fills %.1f%%-%.1f%% of the tile, median %.1f%%"
          % (sizes[0] * 100, sizes[-1] * 100, median * 100))
    print("corner radius %.1f%%-%.1f%% of the frame, median %.1f%%"
          % (radii[0] * 100, radii[-1] * 100, median_radius * 100))

    entries = ",\n".join('  %s: [%s, %s, %s, %s]' % (json.dumps(book), *("%.4f" % v for v in value))
                         for book, value in sorted(bounds.items()))
    js = '''/**
 * Where the artwork sits inside each book thumbnail, as fractions of the file:
 * [x, y, size] of a square around the gold frame, plus how rounded its corner
 * is as a fraction of that square.
 *
 * The tiles on the media host are all 1024x1024, but the frame inside them
 * varies in size and position from book to book, which shows up badly when
 * three sit side by side. <bible-trivia> uses these to draw every tile at the
 * same size.
 *
 * Generated by tools/thumbnails/measure_bounds.py — do not edit by hand. Run it
 * again when the thumbnails change.
 */

export const DEFAULT_THUMB_BOUNDS = [%s, %s, %s, %s];

export const BOOK_THUMB_BOUNDS = {
%s
};
''' % ("%.4f" % round((1 - median) / 2, 4), "%.4f" % round((1 - median) / 2, 4),
       "%.4f" % median, "%.4f" % median_radius, entries)

    with io.open(OUT_JS, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(js)
    print("written: %s (%d books)" % (OUT_JS, len(bounds)))


if __name__ == "__main__":
    main()
