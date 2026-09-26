# -*- coding: utf-8 -*-
"""Build one submit-ready image-generation PDF per story book.

    python make_prompt_pdf.py <content_module> <out.pdf>

The document carries everything an all-at-once comic generator needs: instructions, the art
direction, a fixed look for every character, and every page's six panels with their lettering.
"""
import html
import importlib
import re
import sys

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table,
                                TableStyle)

from cast import CAST, GRID_FIXES

INK = colors.HexColor("#1A1A1A")
ACCENT = colors.HexColor("#B23A0E")
GOLD = colors.HexColor("#8A6A1F")
MUTED = colors.HexColor("#5C5A57")
RULE = colors.HexColor("#C9C3B8")
PANEL_BG = colors.HexColor("#FAF7F1")
KEY_BG = colors.HexColor("#F7EEDC")

S = {
    "title": ParagraphStyle("t", fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=INK,
                            spaceAfter=4),
    "sub": ParagraphStyle("s", fontName="Helvetica-Oblique", fontSize=10.5, leading=14, textColor=MUTED,
                          spaceAfter=4),
    "meta": ParagraphStyle("m", fontName="Helvetica-Bold", fontSize=9.5, leading=13, textColor=GOLD,
                           spaceAfter=10),
    "h1": ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=13, leading=17, textColor=ACCENT,
                         spaceBefore=10, spaceAfter=6),
    "page": ParagraphStyle("pg", fontName="Helvetica-Bold", fontSize=15, leading=19, textColor=INK,
                           spaceAfter=2),
    "ref": ParagraphStyle("rf", fontName="Helvetica-Oblique", fontSize=8.6, leading=11.5, textColor=MUTED,
                          spaceAfter=8),
    "body": ParagraphStyle("b", fontName="Helvetica", fontSize=9.4, leading=12.8, textColor=INK,
                           spaceAfter=5),
    "item": ParagraphStyle("it", fontName="Helvetica", fontSize=9.2, leading=12.4, textColor=INK,
                           leftIndent=12, bulletIndent=0, spaceAfter=4),
    "pn": ParagraphStyle("pn", fontName="Helvetica-Bold", fontSize=9.2, leading=12, textColor=ACCENT,
                         spaceAfter=3),
    "pic": ParagraphStyle("pc", fontName="Helvetica", fontSize=8.8, leading=11.6, textColor=INK,
                          spaceAfter=3),
    "let": ParagraphStyle("lt", fontName="Helvetica-Bold", fontSize=8.6, leading=11.4,
                          textColor=colors.HexColor("#2E2A45"), leftIndent=10, spaceAfter=1),
    "foot": ParagraphStyle("f", fontName="Helvetica-Oblique", fontSize=8, leading=11, textColor=MUTED),
}


def split_title(title):
    for dash in (" &#8212; ", " — "):
        if dash in title:
            num, _, rest = title.partition(dash)
            return num, rest
    return title, ""


def plain_text(s):
    return re.sub(r"<[^>]+>", "", html.unescape(s))


def is_key(shot, action):
    head = plain_text(shot).split(". ", 1)[-1]
    a = plain_text(action).lower()
    return head.startswith("FULL-WIDTH") or "strongest panel" in a or "splash" in a


def fix_grid(action):
    for old, new in GRID_FIXES:
        action = action.replace(old, new)
    return action


def build(C, key, out):
    n = len(C.PAGES)
    title = plain_text(C.TITLE)
    f = []

    def item(text):
        f.append(Paragraph(text, S["item"], bulletText="•"))

    f.append(Paragraph("%s — Image Generation Document" % title, S["title"]))
    f.append(Paragraph(C.SUBTITLE, S["sub"]))
    f.append(Paragraph("%s &#183; %d pages &#215; 6 panels = %d panels" % (C.REFERENCE, n, n * 6),
                       S["meta"]))
    f.append(Paragraph("Submit this whole document to the image generator. Everything it needs is here: the "
                       "page format, the art direction, a fixed look for every character, and all %d panels "
                       "in reading order with the lettering for each." % (n * 6), S["body"]))

    f.append(Paragraph("1. Instructions to the generator", S["h1"]))
    for k, t in enumerate([
        "<b>Produce exactly %d comic pages</b>, in the order given in section 4 (Page One to Page %s)."
        % (n, C.PAGE_WORDS[-1]),
        "<b>Page format:</b> portrait, <b>9:16</b>. Each page is <b>six panels of equal size in a grid two "
        "panels across and three down</b>, read left to right, top row first: 1 2 / 3 4 / 5 6. Thin white "
        "gutters, thin black panel borders.",
        "<b>Key panels.</b> A panel marked KEY PANEL keeps the same size as the others; give it the "
        "strongest composition and the largest lettering on its page.",
        "<b>Keep every character identical on every page</b>, exactly as described in section 3.",
        "<b>Obey the art direction in section 2 on every page</b>, especially the rules about what is never "
        "drawn. Where a panel's description includes an ART NOTE, it overrides everything else.",
        "<b>Lettering.</b> Render each panel's lettering exactly as written — every word, spelling and "
        "punctuation mark. The Bible text is the King James Version and its old spellings are deliberate: do "
        "not modernise them. CAPTION = a rectangular box at the top or bottom of the panel; CAPTION (lower) "
        "= a second box at the bottom. A name followed by a colon = a rounded speech balloon with its tail "
        "to that speaker. A note in brackets after the name tells you how to letter it: <b>(off)</b> = the tail "
        "runs off the panel edge because the speaker is not in the frame; <b>(from the cloud)</b>, <b>(from "
        "within)</b> and similar = the tail points to that place, not to a person; <b>(caption)</b> = the "
        "words go in a caption box, not a balloon, because the speaker is narrating over the picture. Keep "
        "the verse references in brackets. Where a panel says NO LETTERING, draw no text at all.",
        "<b>Do not draw</b> the page headings, verse ranges, light notes or this document's own labels — "
        "they are instructions, not artwork. No watermark, no signature, no page numbers.",
    ], 1):
        f.append(Paragraph(t, S["item"], bulletText="%d." % k))

    f.append(Paragraph("2. Art direction (applies to every page)", S["h1"]))
    for k, v in C.STYLE_BIBLE:
        item("<b>%s.</b> %s" % (k, v))

    f.append(Paragraph("3. Characters — draw each exactly the same on every page", S["h1"]))
    for name, look in CAST[key]:
        item("<b>%s</b> — %s" % (name, look))

    keys = 0
    for pi, ((ptitle, verses, panels), light) in enumerate(zip(C.PAGES, C.PAGE_LIGHT)):
        num, rest = split_title(ptitle)
        f.append(PageBreak())
        if pi == 0:
            f.append(Paragraph("4. The pages", S["h1"]))
        f.append(Paragraph("%s — %s" % (num.upper(), rest), S["page"]))
        f.append(Paragraph("Reference only, not drawn: %s &#183; six panels &#183; light for the whole page: "
                           "%s." % (verses, light), S["ref"]))
        for ni, (shot, action, dialogue) in enumerate(panels, 1):
            head = shot.split(". ", 1)[-1].replace("FULL-WIDTH", "WIDE")
            key = is_key(shot, action)
            keys += key
            cell = [Paragraph("Panel %d — %s%s" % (ni, head, "  &#183;  KEY PANEL" if key else ""), S["pn"]),
                    Paragraph("<b>Picture:</b> %s" % fix_grid(action), S["pic"])]
            lines = [x.strip() for x in dialogue.split("\n") if x.strip()]
            if plain_text(" ".join(lines)).strip() == "NO LETTERING.":
                cell.append(Paragraph("<b>Lettering:</b> NO LETTERING.", S["pic"]))
            else:
                cell.append(Paragraph("<b>Lettering:</b>", S["pic"]))
                cell += [Paragraph(x, S["let"]) for x in lines]
            t = Table([[cell]], colWidths=[letter[0] - 1.3 * inch])
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), KEY_BG if key else PANEL_BG),
                ("BOX", (0, 0), (-1, -1), 0.8, GOLD if key else RULE),
                ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]))
            f.append(KeepTogether([t, Spacer(1, 6)]))

    f.append(Spacer(1, 10))
    f.append(Paragraph("%s — generated from the companion artist's script, %s. Scripture quotations are from "
                       "the King James Version (public domain)." % (title, C.REFERENCE), S["foot"]))

    def decorate(canv, doc):
        canv.saveState()
        canv.setFont("Helvetica", 7.4)
        canv.setFillColor(MUTED)
        canv.drawString(0.65 * inch, letter[1] - 0.45 * inch,
                        "%s — IMAGE GENERATION DOCUMENT" % title.upper())
        canv.drawRightString(letter[0] - 0.65 * inch, 0.4 * inch, str(doc.page))
        canv.restoreState()

    doc = SimpleDocTemplate(out, pagesize=letter, leftMargin=0.65 * inch, rightMargin=0.65 * inch,
                            topMargin=0.7 * inch, bottomMargin=0.65 * inch, author="DailyGrace Flipbooks",
                            title="%s - Image Generation Document" % title,
                            subject="%s - %d pages x 6 panels" % (plain_text(C.REFERENCE), n))
    doc.build(f, onFirstPage=decorate, onLaterPages=decorate)
    print("wrote %s  (%d comic pages, %d panels, %d key)" % (out, n, n * 6, keys))

