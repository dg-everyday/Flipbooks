# -*- coding: utf-8 -*-
"""
Build docs/reflections/<Book>/<Book>-ch-CC.pdf: one PDF per chapter, one page per verse.

The companion to build_reflections.py, laid out the same way without the date:
each page carries the verse text from the KJV in assets/db/dailygrace.db and the
hand-written theme, reflection, short description and social-media post from
books/<book>/<book>-CC.txt.

    python tools/reflections/build_book_reflections.py genesis --dry-run   # validate only
    python tools/reflections/build_book_reflections.py genesis              # every chapter written so far
    python tools/reflections/build_book_reflections.py genesis --chapter 1

books/<book>/book.txt names the book and divides it into sections:

    Genesis
    1-2 | Creation

Content files hold one block per verse, with the same rules as the 2027 book:

    == 1:1
    T: theme (a short phrase)
    R: reflection (about a minute read aloud: 130-175 words)
    S: short description (exactly three sentences)
    P: social-media post (names the verse's reference)
    H: #DailyGrace #More #Tags

'Single quotes' mark Scripture and are checked word for word against the KJV.
If any verse of the chapters being built fails a check, nothing is written.
"""
import argparse, html, io, os, re, sys

from build_reflections import (BIBLE_DB, FONTS, HASHTAGS, POST_WORDS, REFLECTION_WORDS, ROOT,
                               Bible, sentences, words)
from kjv_quotes import QUOTE, Quotes

HERE = os.path.dirname(os.path.abspath(__file__))
BOOKS = os.path.join(HERE, "books")
OUT_DIR = os.path.join(ROOT, "docs", "reflections")
TAGLINE = "Grace for today. Our Faith Tomorrow"


# ---------------------------------------------------------------- data

def read_book(slug):
    lines = [l.strip() for l in open(os.path.join(BOOKS, slug, "book.txt"), encoding="utf-8")]
    lines = [l for l in lines if l and not l.startswith("#")]
    sections = []
    for line in lines[1:]:
        span, name = [p.strip() for p in line.split("|")]
        first, last = (int(n) for n in span.split("-"))
        sections.append(dict(first=first, last=last, name=name))
    return lines[0], sections


def read_content(slug):
    folder, entries, current = os.path.join(BOOKS, slug), {}, None
    for name in sorted(os.listdir(folder)):
        if not name.endswith(".txt") or name == "book.txt":
            continue
        for n, line in enumerate(open(os.path.join(folder, name), encoding="utf-8"), 1):
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if line.startswith("=="):
                current = line[2:].strip()
                if current in entries:
                    raise SystemExit("%s:%d: %s appears twice" % (name, n, current))
                entries[current] = {"_where": "%s:%d" % (name, n)}
            elif current and re.match(r"^[TRSPH]: ", line):
                entries[current][line[0]] = line[3:].strip()
            else:
                raise SystemExit("%s:%d: unexpected line %r" % (name, n, line[:60]))
    return entries


def read_verses(bible, book, sections):
    bid = bible.books[book]
    verses = []
    for chapter, verse in bible.con.execute(
            "SELECT chapter, verse FROM verses WHERE book=? ORDER BY chapter, verse", (bid,)):
        section = next(s for s in sections if s["first"] <= chapter <= s["last"])
        verses.append(dict(key="%d:%d" % (chapter, verse), chapter=chapter,
                           ref="%s %d:%d" % (book, chapter, verse), section=section))
    return verses


def validate(verses, entries, quotes):
    problems = []
    for v in verses:
        e = entries.get(v["key"])
        if not e:
            problems.append("%s: no content" % v["key"])
            continue
        where = "%s (%s)" % (v["key"], e["_where"])
        for k in "TRSPH":
            if not e.get(k):
                problems.append("%s: missing %s:" % (where, k))
        if any(not e.get(k) for k in "TRSPH"):
            continue
        n = words(e["R"])
        if not REFLECTION_WORDS[0] <= n <= REFLECTION_WORDS[1]:
            problems.append("%s: reflection is %d words" % (where, n))
        if sentences(e["S"]) != 3:
            problems.append("%s: short description has %d sentences" % (where, sentences(e["S"])))
        n = words(e["P"])
        if not POST_WORDS[0] <= n <= POST_WORDS[1]:
            problems.append("%s: post is %d words" % (where, n))
        if v["ref"] not in e["P"]:
            problems.append("%s: post does not name %s" % (where, v["ref"]))
        tags = e["H"].split()
        if not HASHTAGS[0] <= len(tags) <= HASHTAGS[1] or "#DailyGrace" not in tags:
            problems.append("%s: hashtags should be %d-%d and include #DailyGrace" % ((where,) + HASHTAGS))
        problems += ["%s: %s" % (where, p) for p in tags if not re.match(r"^#[A-Za-z0-9]+$", p)]
        for k in "TRSP":
            problems += ["%s %s: %s" % (where, k, p) for p in quotes.problems(e[k])]
    return problems


# ---------------------------------------------------------------- pdf

def build_pdf(book, chapter, sections, verses, entries, bible, path):
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
    c.setTitle("Daily Grace Reflections: %s %d" % (book, chapter))
    c.setAuthor("Daily Grace")
    c.setSubject("The %d KJV verses of %s %d with reflections, short descriptions and social media posts"
                 % (len(verses), book, chapter))

    # ---- cover
    c.setFillColor(NAVY); c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setStrokeColor(GOLD); c.setLineWidth(2); c.rect(30, 30, W - 60, H - 60, stroke=1, fill=0)
    c.setFillColor(GOLD); c.setFont("Georgia-Bold", 34); c.drawCentredString(W / 2, H - 150, "DAILY GRACE")
    c.setFillColor(colors.white); c.setFont("Georgia", 40)
    c.drawCentredString(W / 2, H - 205, "%s %d" % (book, chapter))
    c.setFillColor(GOLD); c.setFont("Arial-Bold", 12.5)
    c.drawCentredString(W / 2, H - 238, "%d VERSE-BY-VERSE KJV DEVOTIONAL REFLECTIONS" % len(verses))
    c.setLineWidth(2); c.line(W / 2 - 200, H - 258, W / 2 + 200, H - 258)
    intro = style("intro", "Arial", 11, 17, colors.white, TA_CENTER)
    for i, line in enumerate((
            "A reflection on every verse of %s chapter %d." % (book, chapter),
            "Each verse includes the King James Version text, its theme,",
            "a one-minute reflection to read aloud, a short description,",
            "and a social media post ready to share.")):
        p = Paragraph(line, intro); p.wrapOn(c, W - 120, 30); p.drawOn(c, 60, H - 305 - i * 19)
    rows = (len(sections) + 1) // 2
    card_top, card_h = H - 395, 88 + rows * 36
    c.setFillColor(colors.HexColor("#FAF6EC"))
    c.roundRect(72, card_top - card_h, W - 144, card_h, 14, stroke=0, fill=1)
    c.setFillColor(NAVY); c.setFont("Arial-Bold", 14)
    c.drawString(96, card_top - 36, "SECTIONS OF %s" % book.upper())
    for i, s in enumerate(sections):
        x = 96 + (i // rows) * ((W - 192) / 2)
        y = card_top - 68 - (i % rows) * 36
        span = "CHAPTER %d" % s["first"] if s["first"] == s["last"] else "CHAPTERS %d\u2013%d" % (s["first"], s["last"])
        # The section this chapter belongs to is set in bold.
        here = s["first"] <= chapter <= s["last"]
        c.setFillColor(GOLD); c.setFont("Arial-Bold", 10.5); c.drawString(x, y, span)
        c.setFillColor(NAVY); c.setFont("Arial-Bold" if here else "Arial", 10.5); c.drawString(x, y - 14, s["name"])
    c.setFillColor(GOLD); c.setFont("Georgia-Italic", 15)
    c.drawCentredString(W / 2, 62, TAGLINE)
    c.bookmarkPage("cover"); c.addOutlineEntry("Cover", "cover", 0)
    c.showPage()

    # ---- verse pages
    S = {
        "label": style("label", "Arial-Bold", 10, 13, GOLD),
        "ref": style("ref", "Georgia-Bold", 18, 23, NAVY, TA_CENTER),
        "theme": style("theme", "Georgia-Italic", 12.5, 16, colors.HexColor("#8A6A22"), TA_CENTER),
    }

    def page(c, v, e, number, scale):
        c.setFillColor(CREAM); c.rect(0, 0, W, H, stroke=0, fill=1)
        c.setFillColor(NAVY); c.rect(0, H - 52, W, 52, stroke=0, fill=1)
        c.setFillColor(GOLD); c.rect(0, H - 55, W, 3, stroke=0, fill=1)
        c.setFillColor(colors.white); c.setFont("Georgia-Bold", 20); c.drawCentredString(W / 2, H - 34, "DAILY GRACE")

        y = H - 78
        c.setFillColor(GOLD); c.setFont("Arial-Bold", 10)
        c.drawCentredString(W / 2, y, TAGLINE)
        y -= 8

        def block(text, st, width):
            p = Paragraph(text, st); _, h = p.wrap(width, H); return p, h

        # verse box
        inner = W - 2 * M - 64
        vs = style("verse", "Georgia", 13 * scale, 18.5 * scale, INK, TA_CENTER)
        parts = [block("BIBLE VERSE", S["label"], inner), block(html.escape(v["ref"]), S["ref"], inner),
                 block("\u201c%s\u201d" % fmt(verse_display(bible.text(v["ref"]))), vs, inner),
                 block("Theme: " + fmt(e["T"]), S["theme"], inner)]
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
        c.setFillColor(MUTED); c.setFont("Arial", 8.5)
        c.drawString(M, 32, "%s %d \u2022 %s \u2022 KJV" % (book.upper(), v["chapter"], v["section"]["name"].upper()))
        c.setFillColor(GOLD); c.setFont("Georgia-Italic", 10)
        c.drawRightString(W - M, 32, "Page %d  |  %s" % (number, TAGLINE))
        return y

    scratch = canvas.Canvas(io.BytesIO(), pagesize=letter)
    for number, v in enumerate(verses, 2):
        e = entries[v["key"]]
        # Measure on a throwaway canvas, shrinking the type a step at a time on the rare page
        # that would run into the footer.
        scale = 1.0
        while page(scratch, v, e, number, scale) < 52 and scale > 0.8:
            scale -= 0.02
        if scale < 1:
            print("  %s set at %d%% to fit" % (v["key"], round(scale * 100)))
        page(c, v, e, number, scale)
        key = "v%s" % v["key"].replace(":", "_")
        c.bookmarkPage(key)
        c.addOutlineEntry("%s \u2014 %s" % (v["ref"], e["T"]), key, 0)
        c.showPage()
    c.save()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("book", help="folder under tools/reflections/books, e.g. genesis")
    ap.add_argument("--chapter", type=int, action="append",
                    help="chapter to build (repeatable); default: every chapter with content")
    ap.add_argument("--dry-run", action="store_true", help="validate only; write nothing")
    ap.add_argument("--allow-missing", action="store_true", help="build drafts from the verses written so far")
    args = ap.parse_args()

    book, sections = read_book(args.book)
    entries = read_content(args.book)
    bible = Bible(BIBLE_DB)
    verses = read_verses(bible, book, sections)
    started = sorted({v["chapter"] for v in verses if v["key"] in entries})
    chapters = sorted(set(args.chapter)) if args.chapter else started
    unknown = set(entries) - {v["key"] for v in verses}
    verses = [v for v in verses if v["chapter"] in chapters]
    problems = validate(verses, entries, Quotes(bible.con))
    problems += ["%s: not a verse of %s" % (k, book) for k in sorted(unknown)]
    if args.allow_missing:
        problems = [p for p in problems if not p.endswith(": no content")]
        verses = [v for v in verses if v["key"] in entries]
    if problems:
        print("\n".join(problems))
        print("%d problem(s); nothing written." % len(problems))
        return 1
    print("%d verses in %d chapter(s) validated." % (len(verses), len(chapters)))
    if args.dry_run:
        return 0
    out_dir = os.path.join(OUT_DIR, book.replace(" ", "-"))
    os.makedirs(out_dir, exist_ok=True)
    for chapter in chapters:
        out = os.path.join(out_dir, "%s-ch-%02d.pdf" % (book.replace(" ", "-"), chapter))
        build_pdf(book, chapter, sections, [v for v in verses if v["chapter"] == chapter], entries, bible, out)
        print("wrote", out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
