# -*- coding: utf-8 -*-
"""Build a reader's storybook PDF — the story text only, set like a printed book.

    python make_reader_pdf.py <content_module> <out.pdf>

A4 pages. Paper: the site's end-paper texture tiled over every page. Title and chapter headings in
Germania One; body text in Strait at 16 pt. The Daily Grace banner on the title page, and the gold
icon with the tagline under every page. Chapters run on one after another; a heading is never left at
the foot of a page without at least three lines of its chapter under it.
"""
import html
import importlib
import os
import re
import sys

from PIL import Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, CondPageBreak, Frame, Image as RLImage, NextPageTemplate, PageBreak,
                                PageTemplate, Paragraph, Spacer)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", "..", ".."))       # the repository
# assets/images/end-paper.svg rendered by Chrome at 4x. ReportLab cannot draw SVG filters, so the
# rendered tile is kept here; re-render it with Chrome if end-paper.svg ever changes.
TILE = os.path.join(HERE, "..", "assets", "end-paper-tile.png")
BANNER = ROOT + "/assets/images/daily-grace-banner-02.webp"
ICON = ROOT + "/assets/images/dg-icon-gold.webp"
TAGLINE = "Grace for Today • Our Faith Tomorrow"

pdfmetrics.registerFont(TTFont("Strait", ROOT + "/assets/fonts/Strait-Regular.ttf"))
pdfmetrics.registerFont(TTFont("GermaniaOne", ROOT + "/assets/fonts/GermaniaOne-Regular.ttf"))

PW, PH = A4                            # 210 x 297 mm
SIDE, TOP, BOTTOM = 0.9 * inch, 0.85 * inch, 1.15 * inch
TILE_PT = 180                          # the SVG's 240 CSS px

INK = colors.HexColor("#2A1D12")       # body text on the tan paper
HEAD = colors.HexColor("#4A230C")      # headings
EMPH = "#7A3312"                       # stands in for italics (Strait has no italic)
SOFT = colors.HexColor("#5E4630")

S = {
    "title": ParagraphStyle("title", fontName="GermaniaOne", fontSize=44, leading=52, textColor=HEAD,
                            alignment=TA_CENTER, spaceAfter=18),
    "sub": ParagraphStyle("sub", fontName="Strait", fontSize=17, leading=24, textColor=SOFT,
                          alignment=TA_CENTER, spaceAfter=18),
    "ref": ParagraphStyle("ref", fontName="Strait", fontSize=13, leading=18, textColor=HEAD,
                          alignment=TA_CENTER),
    # "VI – The Robe, the Ring, and the Shoes", numeral in superscript; always kept with its text
    "chapter": ParagraphStyle("ch", fontName="GermaniaOne", fontSize=24, leading=30, textColor=HEAD,
                              alignment=TA_LEFT, spaceBefore=26, spaceAfter=12),
    "body": ParagraphStyle("body", fontName="Strait", fontSize=16, leading=23, textColor=INK,
                           alignment=TA_LEFT, firstLineIndent=22, spaceAfter=0),
    "first": ParagraphStyle("first", fontName="Strait", fontSize=16, leading=23, textColor=INK,
                            alignment=TA_LEFT, spaceAfter=0),
    "colophon": ParagraphStyle("col", fontName="Strait", fontSize=10.5, leading=14, textColor=SOFT,
                               alignment=TA_CENTER, spaceBefore=30),
}

_tile = ImageReader(Image.open(TILE).convert("RGB"))
_icon = ImageReader(Image.open(ICON).convert("RGBA"))


def text(s):
    """Content markup -> Strait-safe markup: emphasis becomes colour, since Strait has no italic."""
    s = re.sub(r"<i>(.*?)</i>", r'<font color="%s">\1</font>' % EMPH, s, flags=re.S)
    s = re.sub(r"<b>(.*?)</b>", r'<font color="#4A230C">\1</font>', s, flags=re.S)
    return s


def germania(s):
    """Germania One has no ellipsis glyph."""
    return html.unescape(re.sub(r"<[^>]+>", "", s)).replace("\u2026", "...")


def chapter_heading(head):
    """'VI. The Robe, the Ring, and the Shoes' -> superscript numeral, en dash, title."""
    num, _, name = germania(head).partition(". ")
    if not name:
        return html.escape(num)
    # the dash is set in Strait, whose en dash is the longer one on the title page ("15:11\u201332")
    return '<super><font color="%s">%s</font></super> <font name="Strait">\u2013</font> %s' % (
        EMPH, html.escape(num), html.escape(name))


def paper(canv, doc):
    canv.saveState()
    y = 0
    while y < PH:
        x = 0
        while x < PW:
            canv.drawImage(_tile, x, y, TILE_PT, TILE_PT)
            x += TILE_PT
        y += TILE_PT
    # footer: gold icon, then the tagline, centred as one unit
    # the tagline: Strait, 11 pt, in the reference line's heading brown
    size = 20
    fs = 11
    w = pdfmetrics.stringWidth(TAGLINE, "Strait", fs)
    x0 = (PW - (size + 7 + w)) / 2
    yb = 0.5 * inch
    canv.drawImage(_icon, x0, yb - 5, size, size, mask="auto")
    canv.setFont("Strait", fs)
    canv.setFillColor(S["ref"].textColor)
    canv.drawString(x0 + size + 7, yb + 1.5, TAGLINE)
    canv.setStrokeColor(colors.Color(0.36, 0.24, 0.13, alpha=0.35))
    canv.setLineWidth(0.5)
    canv.line(SIDE, yb + size + 6, PW - SIDE, yb + size + 6)
    canv.restoreState()


def build(C, out):
    title = germania(C.TITLE)
    f = []

    # ------------------------------------------------------------ title page
    bw = PW * 0.6                                             # logo at 60% of the page width
    f.append(Spacer(1, 0.4 * inch))
    f.append(RLImage(BANNER, width=bw, height=bw / 3))        # banner is 1200 x 400
    f.append(Spacer(1, 1.4 * inch))
    f.append(Paragraph(html.escape(title), S["title"]))
    f.append(Paragraph(text(C.SUBTITLE), S["sub"]))
    f.append(Paragraph(text(C.REFERENCE), S["ref"]))
    f.append(NextPageTemplate("story"))
    f.append(PageBreak())

    # ------------------------------------------------------------ chapters, run on
    first_chapter = ParagraphStyle("ch1", parent=S["chapter"], spaceBefore=0)
    # A heading moves to a new page only if it could not be followed by three lines of its chapter.
    room = S["chapter"].spaceBefore + S["chapter"].leading + S["chapter"].spaceAfter + 3 * S["body"].leading
    # A story with a NARRATIVE (the story told as a novel) is set from that; otherwise from STORY,
    # the study retelling, closed by its THEME as "The Heart of the Story".
    narrative = getattr(C, "NARRATIVE", None)
    for ci, (head, paras) in enumerate(narrative or C.STORY):
        if ci:
            f.append(CondPageBreak(room))
        f.append(Paragraph(chapter_heading(head), first_chapter if ci == 0 else S["chapter"]))
        for i, p in enumerate(paras):
            f.append(Paragraph(text(p), S["first"] if i == 0 else S["body"]))

    # ------------------------------------------------------------ closing
    if not narrative:
        f.append(CondPageBreak(room))
        f.append(Paragraph("The Heart of the Story", S["chapter"]))
        f.append(Paragraph(text(C.THEME), S["first"]))
    f.append(Paragraph("Scripture quotations are from the King James Version (public domain).",
                       S["colophon"]))

    frame = Frame(SIDE, BOTTOM, PW - 2 * SIDE, PH - TOP - BOTTOM, id="f",
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc = BaseDocTemplate(out, pagesize=(PW, PH), title=title, author="DailyGrace Flipbooks",
                          subject=html.unescape(re.sub(r"<[^>]+>", "", C.REFERENCE)))
    doc.addPageTemplates([PageTemplate(id="title", frames=[frame], onPage=paper),
                          PageTemplate(id="story", frames=[frame], onPage=paper)])
    doc.build(f)
    print("wrote", out)

