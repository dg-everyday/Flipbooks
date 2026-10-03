# -*- coding: utf-8 -*-
"""
Build docs/Daily_Grace_Reflections_2027.pdf: one page per day of 2027.

Each page carries the date, weekday and theme from calendar_2027.txt, the verse
text pulled from the KJV in assets/db/dailygrace.db, and the hand-written
reflection, short description and social-media post from content/2027-MM.txt.

    python tools/reflections/build_reflections.py --dry-run   # validate only
    python tools/reflections/build_reflections.py

Content files hold one block per day:

    == Jan 01
    R: reflection (about a minute read aloud: 130-175 words)
    S: short description (exactly three sentences)
    P: social-media post (names the day's reference)
    H: #DailyGrace #More #Tags

'Single quotes' mark Scripture and are checked word for word against the KJV
(tools/kjv_quotes.py); they print as curly double quotes. If any day fails a
check, nothing is written.
"""
import argparse, datetime, html, io, os, re, sqlite3, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.dirname(HERE))
from kjv_quotes import QUOTE, Quotes  # noqa: E402

YEAR = 2027
CALENDAR = os.path.join(HERE, "calendar_%d.txt" % YEAR)
CONTENT = os.path.join(HERE, "content")
BIBLE_DB = os.path.join(ROOT, "assets", "db", "dailygrace.db")
OUTPUT = os.path.join(ROOT, "docs", "Daily_Grace_Reflections_%d.pdf" % YEAR)
FONTS = r"C:\Windows\Fonts"

REFLECTION_WORDS = (130, 175)
POST_WORDS = (25, 95)
HASHTAGS = (5, 10)


# ---------------------------------------------------------------- data

def read_calendar():
    months, days = [], []
    for line in open(CALENDAR, encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("@"):
            name, emphasis = [p.strip() for p in line[1:].split("|")]
            months.append((name, emphasis))
            continue
        date, day, ref, theme = [p.strip() for p in line.split("|")]
        when = datetime.datetime.strptime("%s %d" % (date, YEAR), "%b %d %Y").date()
        days.append(dict(key=date, date=when, day=day, ref=ref, theme=theme, month=months[-1]))
    return months, days


def read_content():
    entries, current = {}, None
    for name in sorted(os.listdir(CONTENT)):
        if not name.endswith(".txt"):
            continue
        for n, line in enumerate(open(os.path.join(CONTENT, name), encoding="utf-8"), 1):
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("=="):
                current = line[2:].strip()
                if current in entries:
                    raise SystemExit("%s:%d: %s appears twice" % (name, n, current))
                entries[current] = {"_where": "%s:%d" % (name, n)}
            elif current and re.match(r"^[RSPH]: ", line):
                entries[current][line[0]] = line[3:].strip()
            else:
                raise SystemExit("%s:%d: unexpected line %r" % (name, n, line[:60]))
    return entries


class Bible:
    def __init__(self, path):
        self.con = sqlite3.connect(path)
        self.books = {name: bid for bid, name in self.con.execute("SELECT book_id, book_name FROM books")}
        self.books["Psalm"] = self.books["Psalms"]

    def text(self, ref):
        m = re.match(r"^(.+) (\d+):(\d+)$", ref)
        row = self.con.execute("SELECT text FROM verses WHERE book=? AND chapter=? AND verse=?",
                               (self.books[m.group(1)], int(m.group(2)), int(m.group(3)))).fetchone()
        if not row:
            raise SystemExit("%s is not in the KJV database" % ref)
        # The last verse of a psalm carries the next psalm's heading ("…for ever.    Psalm 112").
        text = re.split(r"\s{2,}(?:Book [IV]+\s+)?Psalm \d+", row[0])[0]
        return re.sub(r"\s+", " ", text).strip()


def words(text):
    return len(re.findall(r"[A-Za-z0-9’']+", text))


def sentences(text):
    return len(re.findall(r"[.!?](?:['’”)]*)(?=\s|$)", text))


def validate(days, entries, quotes):
    problems = []
    for d in days:
        e = entries.get(d["key"])
        if not e:
            problems.append("%s: no content" % d["key"])
            continue
        where = "%s (%s)" % (d["key"], e["_where"])
        for k in "RSPH":
            if not e.get(k):
                problems.append("%s: missing %s:" % (where, k))
        if any(not e.get(k) for k in "RSPH"):
            continue
        n = words(e["R"])
        if not REFLECTION_WORDS[0] <= n <= REFLECTION_WORDS[1]:
            problems.append("%s: reflection is %d words" % (where, n))
        if sentences(e["S"]) != 3:
            problems.append("%s: short description has %d sentences" % (where, sentences(e["S"])))
        n = words(e["P"])
        if not POST_WORDS[0] <= n <= POST_WORDS[1]:
            problems.append("%s: post is %d words" % (where, n))
        if d["ref"] not in e["P"]:
            problems.append("%s: post does not name %s" % (where, d["ref"]))
        tags = e["H"].split()
        if not HASHTAGS[0] <= len(tags) <= HASHTAGS[1] or "#DailyGrace" not in tags:
            problems.append("%s: hashtags should be %d-%d and include #DailyGrace" % ((where,) + HASHTAGS))
        problems += ["%s: %s" % (where, p) for p in tags if not re.match(r"^#[A-Za-z0-9]+$", p)]
        for k in "RSP":
            problems += ["%s %s: %s" % (where, k, p) for p in quotes.problems(e[k])]
    extra = set(entries) - {d["key"] for d in days}
    problems += ["%s: not a calendar date" % k for k in sorted(extra)]
    return problems


# ---------------------------------------------------------------- pdf

def build_pdf(months, days, entries, bible, path):
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.pdfgen import canvas
    from reportlab.platypus import Paragraph

    for name, file in (("Georgia", "georgia.ttf"), ("Georgia-Bold", "georgiab.ttf"),
                       ("Georgia-Italic", "georgiai.ttf"), ("Georgia-BoldItalic", "georgiaz.ttf"),
                       ("Arial", "arial.ttf"), ("Arial-Bold", "arialbd.ttf"), ("Arial-Italic", "ariali.ttf")):
        pdfmetrics.registerFont(TTFont(name, os.path.join(FONTS, file)))
    pdfmetrics.registerFontFamily("Georgia", normal="Georgia", bold="Georgia-Bold",
                                  italic="Georgia-Italic", boldItalic="Georgia-BoldItalic")

    NAVY = colors.HexColor("#0B2038")
    GOLD = colors.HexColor("#C99A3B")
    CREAM = colors.HexColor("#FAF4E8")
    BOX = colors.HexColor("#FFFBF3")
    MIST = colors.HexColor("#EDF1F5")
    INK = colors.HexColor("#2A2A2A")
    MUTED = colors.HexColor("#5A6470")
    TAG = colors.HexColor("#2C5D8F")
    W, H = letter
    M = 54  # side margin

    def style(name, font, size, lead, color=INK, align=TA_LEFT):
        return ParagraphStyle(name, fontName=font, fontSize=size, leading=lead, textColor=color, alignment=align)

    def fmt(text):
        """Escape, print 'Scripture' as curly double quotes, and curl apostrophes."""
        text = QUOTE.sub(lambda m: "\u201c%s\u201d" % m.group(1), text)
        text = html.escape(text, quote=False)
        return text.replace("'", "\u2019")

    def verse_display(text):
        # A verse that stops mid-sentence ends in an ellipsis rather than a stray comma or colon.
        return re.sub(r"[,;:]$", "\u2026", text)

    c = canvas.Canvas(path, pagesize=letter)
    c.setTitle("Daily Grace Reflections %d" % YEAR)
    c.setAuthor("Daily Grace")
    c.setSubject("365 daily KJV verses with reflections, short descriptions and social media posts")

    # ---- cover
    c.setFillColor(NAVY); c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setStrokeColor(GOLD); c.setLineWidth(2); c.rect(30, 30, W - 60, H - 60, stroke=1, fill=0)
    c.setFillColor(GOLD); c.setFont("Georgia-Bold", 34); c.drawCentredString(W / 2, H - 150, "DAILY GRACE")
    c.setFillColor(colors.white); c.setFont("Georgia", 40)
    c.drawCentredString(W / 2, H - 205, "Reflections %d" % YEAR)
    c.setFillColor(GOLD); c.setFont("Arial-Bold", 12.5)
    c.drawCentredString(W / 2, H - 238, "365 DAILY KJV DEVOTIONAL REFLECTIONS")
    c.setLineWidth(2); c.line(W / 2 - 200, H - 258, W / 2 + 200, H - 258)
    intro = style("intro", "Arial", 11, 17, colors.white, TA_CENTER)
    for i, line in enumerate((
            "A companion to the Daily Grace Verse Calendar %d." % YEAR,
            "Each day includes the date, the King James Version verse, its theme,",
            "a one-minute reflection to read aloud, a short description,",
            "and a social media post ready to share.")):
        p = Paragraph(line, intro); p.wrapOn(c, W - 120, 30); p.drawOn(c, 60, H - 305 - i * 19)
    card_top, card_h = H - 395, 290
    c.setFillColor(colors.HexColor("#FAF6EC"))
    c.roundRect(72, card_top - card_h, W - 144, card_h, 14, stroke=0, fill=1)
    c.setFillColor(NAVY); c.setFont("Arial-Bold", 14)
    c.drawString(96, card_top - 36, "MONTHLY DEVOTIONAL EMPHASES")
    for i, (name, emphasis) in enumerate(months):
        x = 96 + (i // 6) * ((W - 192) / 2)
        y = card_top - 68 - (i % 6) * 36
        c.setFillColor(GOLD); c.setFont("Arial-Bold", 10.5); c.drawString(x, y, name.upper())
        c.setFillColor(NAVY); c.setFont("Arial", 10.5); c.drawString(x, y - 14, emphasis)
    c.setFillColor(GOLD); c.setFont("Georgia-Italic", 15)
    c.drawCentredString(W / 2, 62, "Grace for Today. Hope for Tomorrow.")
    c.bookmarkPage("cover"); c.addOutlineEntry("Cover", "cover", 0)
    c.showPage()

    # ---- day pages
    S = {
        "tag": style("tag", "Arial-Bold", 10, 12, GOLD, TA_CENTER),
        "label": style("label", "Arial-Bold", 10, 13, GOLD),
        "ref": style("ref", "Georgia-Bold", 18, 23, NAVY, TA_CENTER),
        "theme": style("theme", "Georgia-Italic", 12.5, 16, colors.HexColor("#8A6A22"), TA_CENTER),
    }

    def page(c, d, e, number, scale):
        c.setFillColor(CREAM); c.rect(0, 0, W, H, stroke=0, fill=1)
        c.setFillColor(NAVY); c.rect(0, H - 52, W, 52, stroke=0, fill=1)
        c.setFillColor(GOLD); c.rect(0, H - 55, W, 3, stroke=0, fill=1)
        c.setFillColor(colors.white); c.setFont("Georgia-Bold", 20); c.drawCentredString(W / 2, H - 34, "DAILY GRACE")

        y = H - 78
        c.setFillColor(GOLD); c.setFont("Arial-Bold", 10)
        c.drawCentredString(W / 2, y, "GRACE FOR TODAY. HOPE FOR TOMORROW.")
        y -= 29
        c.setFillColor(NAVY); c.setFont("Georgia-Bold", 26)
        c.drawCentredString(W / 2, y, "DATE: %s %d, %d" % (d["date"].strftime("%B").upper(), d["date"].day, YEAR))
        y -= 18
        c.setFillColor(MUTED); c.setFont("Arial-Bold", 11.5); c.drawCentredString(W / 2, y, d["day"].upper())
        y -= 8

        def block(text, st, width):
            p = Paragraph(text, st); _, h = p.wrap(width, H); return p, h

        # verse box
        inner = W - 2 * M - 64
        vs = style("verse", "Georgia", 13 * scale, 18.5 * scale, INK, TA_CENTER)
        parts = [block("BIBLE VERSE", S["label"], inner), block(html.escape(d["ref"]), S["ref"], inner),
                 block("\u201c%s\u201d" % fmt(verse_display(bible.text(d["ref"]))), vs, inner),
                 block("Theme: " + fmt(d["theme"]), S["theme"], inner)]
        gaps = [4, 5, 8]
        box_h = 18 + sum(h for _, h in parts) + sum(gaps) + 16
        top = y - 6
        c.setFillColor(BOX); c.setStrokeColor(GOLD); c.setLineWidth(1.8)
        c.rect(M, top - box_h, W - 2 * M, box_h, stroke=1, fill=1)
        cy = top - 18
        for i, (p, h) in enumerate(parts):
            cy -= h; p.drawOn(c, M + 32, cy)
            if i < len(gaps):
                cy -= gaps[i]
        y = top - box_h - 18

        # reflection
        rs = style("refl", "Georgia", 12 * scale, 17.4 * scale, INK)
        p, h = block("REFLECTION TEXT", S["label"], W - 2 * M - 12); y -= h; p.drawOn(c, M + 6, y)
        p, h = block(fmt(e["R"]), rs, W - 2 * M - 12); y -= h + 4; p.drawOn(c, M + 6, y)
        y -= 14

        # short description and social post panels
        def panel(label, body_parts, fill, rule):
            nonlocal y
            pad, width = 15, W - 2 * M - 36
            items = [block(label, S["label"], width)] + [block(t, st, width) for t, st in body_parts]
            ph = pad + sum(h for _, h in items) + 5 * (len(items) - 1) + pad - 4
            c.setFillColor(fill); c.rect(M, y - ph, W - 2 * M, ph, stroke=0, fill=1)
            c.setFillColor(rule); c.rect(M, y - 2.5, W - 2 * M, 2.5, stroke=0, fill=1)
            c.setStrokeColor(colors.HexColor("#E3D3AE")); c.setLineWidth(0.6); c.line(M, y - ph, W - M, y - ph)
            cy = y - pad
            for p, h in items:
                cy -= h; p.drawOn(c, M + 18, cy); cy -= 5
            y -= ph + 12

        body = style("body", "Arial", 10.5 * scale, 14.6 * scale, NAVY)
        tags = style("tags", "Arial-Bold", 10 * scale, 14 * scale, TAG)
        panel("SHORT DESCRIPTION", [(fmt(e["S"]), body)], MIST, NAVY)
        panel("SOCIAL MEDIA POST", [(fmt(e["P"]), body), (html.escape(e["H"]), tags)],
              colors.HexColor("#FFFDF8"), GOLD)

        # footer
        c.setStrokeColor(GOLD); c.setLineWidth(0.8); c.line(M, 46, W - M, 46)
        name, emphasis = d["month"]
        c.setFillColor(MUTED); c.setFont("Arial", 8.5)
        c.drawString(M, 32, "%s \u2022 %s \u2022 KJV" % (name.upper(), emphasis.upper()))
        c.setFillColor(GOLD); c.setFont("Georgia-Italic", 10)
        c.drawRightString(W - M, 32, "Page %d  |  Grace for Today. Hope for Tomorrow." % number)
        return y

    scratch = canvas.Canvas(io.BytesIO(), pagesize=letter)
    month_seen = set()
    for number, d in enumerate(days, 2):
        e = entries[d["key"]]
        # Measure on a throwaway canvas, shrinking the type a step at a time on the rare page
        # that would run into the footer.
        scale = 1.0
        while page(scratch, d, e, number, scale) < 52 and scale > 0.8:
            scale -= 0.02
        if scale < 1:
            print("  %s set at %d%% to fit" % (d["key"], round(scale * 100)))
        page(c, d, e, number, scale)
        key = "d%s" % d["date"].isoformat()
        c.bookmarkPage(key)
        name = d["month"][0]
        if name not in month_seen:
            # Outline entries are keyed by destination, so the month needs its own bookmark.
            month_seen.add(name)
            c.bookmarkPage("m" + key)
            c.addOutlineEntry(name, "m" + key, 0, closed=True)
        c.addOutlineEntry("%s \u2014 %s" % (d["key"], d["ref"]), key, 1)
        c.showPage()
    c.save()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="validate only; write nothing")
    ap.add_argument("--allow-missing", action="store_true", help="build a draft from the days written so far")
    ap.add_argument("--out", default=OUTPUT)
    args = ap.parse_args()

    months, days = read_calendar()
    entries = read_content()
    bible = Bible(BIBLE_DB)
    problems = validate(days, entries, Quotes(bible.con))
    if args.allow_missing:
        problems = [p for p in problems if not p.endswith(": no content")]
        days = [d for d in days if d["key"] in entries]
    if problems:
        print("\n".join(problems))
        print("%d problem(s); nothing written." % len(problems))
        return 1
    print("%d days validated." % len(days))
    if args.dry_run:
        return 0
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    build_pdf(months, days, entries, bible, args.out)
    print("wrote", args.out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
