"""Make each Daily Grace Reels drama's link-preview card: assets/images/reels/<drama>/share.jpg.

    python tools/microdramas/make_share_cards.py

A shared drama links to its own page, /r/<drama>.html (written on deploy by
assets/scripts/build-reel-pages.mjs), and Messenger, Facebook and the like show this card for it:
1200 x 630, the drama's cover whole on the left over a dimmed, blurred spread of itself, and on
the right the film strip and "Daily Grace Reels", the drama's title, its passage and how many
episodes, and where to watch. Reads assets/dg-reels.json; the cover is the drama's "cover" (a
path in the repo). Run it again when a drama is added or its cover changes.
"""
import json, os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(ROOT, "assets", "dg-reels.json")
W, H = 1200, 630
GOLD = (242, 197, 49)
WHITE = (255, 255, 255)
SOFT = (225, 230, 238)
GERMANIA = os.path.join(ROOT, "assets", "fonts", "GermaniaOne-Regular.ttf")
BOLD = "C:/Windows/Fonts/segoeuib.ttf"
REGULAR = "C:/Windows/Fonts/segoeui.ttf"


def film_strip(draw, x, y, size, colour):
    """The card's film-strip mark: a frame with sprocket holes down both sides."""
    s = size / 24
    w = max(2, round(2.2 * s))
    draw.rounded_rectangle((x + 3 * s, y + 2.5 * s, x + 21 * s, y + 21.5 * s), radius=2 * s, outline=colour, width=w)
    for gx in (7, 17):
        draw.line((x + gx * s, y + 2.5 * s, x + gx * s, y + 21.5 * s), fill=colour, width=w)
    for gy in (7, 12, 17):
        draw.line((x + 3 * s, y + gy * s, x + 7 * s, y + gy * s), fill=colour, width=w)
        draw.line((x + 17 * s, y + gy * s, x + 21 * s, y + gy * s), fill=colour, width=w)


def wrap(draw, text, font, width):
    lines, line = [], ""
    for word in text.split():
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=font) <= width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def card(drama, cover_path):
    cover = Image.open(cover_path).convert("RGB")
    # The spread: the cover stretched across, blurred and dimmed.
    spread = cover.resize((W, round(W * cover.height / cover.width)), Image.LANCZOS)
    top = (spread.height - H) // 3
    spread = spread.crop((0, top, W, top + H)).filter(ImageFilter.GaussianBlur(22))
    spread = Image.blend(spread, Image.new("RGB", (W, H), (0, 27, 52)), 0.62)
    canvas = spread.copy()
    # The cover whole, on the left, with a shadow.
    ch = H - 2 * 34
    cw = round(ch * cover.width / cover.height)
    cx, cy = 70, 34
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((cx + 8, cy + 14, cx + cw + 8, cy + ch + 14), radius=18, fill=(0, 0, 0, 160))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), shadow.filter(ImageFilter.GaussianBlur(14)))
    mask = Image.new("L", (cw, ch), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, cw - 1, ch - 1), radius=16, fill=255)
    canvas.paste(cover.resize((cw, ch), Image.LANCZOS), (cx, cy), mask)

    d = ImageDraw.Draw(canvas)
    tx = cx + cw + 60
    tw = W - tx - 60
    brand = ImageFont.truetype(GERMANIA, 52)
    film_strip(d, tx, 92, 50, GOLD)
    d.text((tx + 64, 90), "Daily Grace Reels", font=brand, fill=GOLD)
    title_font = ImageFont.truetype(GERMANIA, 104)
    lines = wrap(d, drama.get("title", ""), title_font, tw)
    if len(lines) > 2:
        title_font = ImageFont.truetype(GERMANIA, 76)
        lines = wrap(d, drama.get("title", ""), title_font, tw)[:2]
    y = 178
    for line in lines:
        d.text((tx + 3, y + 4), line, font=title_font, fill=(0, 0, 0))
        d.text((tx, y), line, font=title_font, fill=WHITE)
        y += round(title_font.size * 1.02)
    parts = [e for e in drama.get("episodes", []) if e.get("kind") != "full"]
    has_full = any(e.get("kind") == "full" for e in drama.get("episodes", []))
    count = f"{len(parts)} episodes" + (" and the full story" if has_full else "")
    info = ImageFont.truetype(BOLD, 34)
    y += 18
    for line in wrap(d, f"{drama.get('passage', '')} · {count}", info, tw):
        d.text((tx, y), line, font=info, fill=SOFT)
        y += 44
    d.text((tx, H - 104), "Watch free on dailygrace.faith", font=ImageFont.truetype(BOLD, 32), fill=GOLD)
    return canvas.convert("RGB")


def main():
    data = json.load(open(DATA, encoding="utf-8"))
    for drama in data.get("dramas", []):
        cover = drama.get("cover", "")
        path = os.path.join(ROOT, cover)
        if cover.startswith("media:") or not os.path.exists(path):
            print(f"  {drama['id']}: no cover in the repo ({cover}); skipped")
            continue
        out = os.path.join(ROOT, "assets", "images", "reels", drama["id"], "share.jpg")
        card(drama, path).save(out, "JPEG", quality=84, optimize=True, progressive=True)
        print(f"  {drama['id']}: {os.path.relpath(out, ROOT)}")


if __name__ == "__main__":
    main()
