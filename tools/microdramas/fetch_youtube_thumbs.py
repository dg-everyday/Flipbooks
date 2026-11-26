"""Save each Daily Grace Reels episode's YouTube thumbnail into the repo, for the card's tiles.

    python tools/microdramas/fetch_youtube_thumbs.py            # only episodes with no thumbnail yet
    python tools/microdramas/fetch_youtube_thumbs.py --force    # fetch them all again

Reads assets/dg-reels.json. For every episode with a youtube_id it downloads the thumbnail once
from i.ytimg.com and saves it as assets/images/reels/<drama>/<episode>.webp (9:16, 405 x 720), then
points the episode's "cover" at that file. The site then serves its own copy: the home page never
asks YouTube for a thumbnail, and this script skips any episode whose file is already there.

A Short's thumbnail in its own shape (oardefault, 1080 x 1920) is used when YouTube has made one;
otherwise the 16:9 one (maxresdefault, else hqdefault), which shows the vertical frame in the middle
with a blurred copy either side, is cut down to that middle 9:16 strip. The drama's own cover
(the card's big picture) is not touched.
"""
import io, json, os, sys, urllib.error, urllib.request

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, "assets", "dg-reels.json")
OUT = os.path.join(ROOT, "assets", "images", "reels")
SIZE = (405, 720)


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "dailygrace-thumbs/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return Image.open(io.BytesIO(response.read())).convert("RGB")
    except urllib.error.HTTPError:
        return None


def thumbnail(youtube_id):
    """The episode's thumbnail as a 9:16 picture, and which YouTube image it came from."""
    base = f"https://i.ytimg.com/vi/{youtube_id}/"
    tall = fetch(base + "oardefault.jpg")
    # A missing oardefault comes back as a 120 x 90 placeholder or a 404.
    if tall is not None and tall.height > tall.width:
        return tall.resize(SIZE, Image.LANCZOS), "oardefault"
    for name in ("maxresdefault", "hqdefault"):
        wide = fetch(base + name + ".jpg")
        if wide is not None and wide.width >= 320:
            width = round(wide.height * 9 / 16)
            left = (wide.width - width) // 2
            strip = wide.crop((left, 0, left + width, wide.height))
            return strip.resize(SIZE, Image.LANCZOS), name
    return None, ""


def main():
    force = "--force" in sys.argv
    with open(DATA, encoding="utf-8") as f:
        data = json.load(f)
    changed = False
    for drama in data.get("dramas", []):
        folder = os.path.join(OUT, drama["id"])
        os.makedirs(folder, exist_ok=True)
        for episode in drama.get("episodes", []):
            youtube_id = str(episode.get("youtube_id", "")).strip()
            if not youtube_id:
                continue
            name = f"{episode['id']}.webp"
            path = os.path.join(folder, name)
            cover = f"assets/images/reels/{drama['id']}/{name}"
            if os.path.exists(path) and not force:
                print(f"  {drama['id']}/{name}: already saved")
            else:
                picture, source = thumbnail(youtube_id)
                if picture is None:
                    print(f"  {drama['id']}/{name}: no thumbnail on YouTube for {youtube_id}")
                    continue
                picture.save(path, "WEBP", quality=80, method=6)
                print(f"  {drama['id']}/{name}: saved from {source}")
            if episode.get("cover") != cover:
                episode["cover"] = cover
                changed = True
    if changed:
        with open(DATA, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
            f.write("\n")
        print("updated the covers in assets/dg-reels.json")


if __name__ == "__main__":
    main()
