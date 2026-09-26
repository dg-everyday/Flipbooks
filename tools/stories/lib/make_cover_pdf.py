# -*- coding: utf-8 -*-
"""Build one cover-image prompt PDF per story book.

    python make_cover_pdf.py <content_module> <out.pdf>

A single-image prompt: a 9:16 portrait cover whose only text is the book's title.
"""
import html
import importlib
import re
import sys

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Table, TableStyle

from cast import CAST
from covers import COVERS
from make_prompt_pdf import GOLD, KEY_BG, MUTED, S, plain_text


def title_plain(C):
    return plain_text(C.TITLE).replace("’", "'")


def ready_prompt(C, key):
    """One paragraph a text-to-image tool can take as-is."""
    cv = COVERS[key]
    style = dict(C.STYLE_BIBLE).get("Style", "")
    return (
        "Book cover illustration, portrait 9:16. %s %s Light and colour: %s Composition: leave clean, "
        "uncluttered space in the %s for the title. Title lettering: the words \"%s\" — spelled exactly "
        "like that, in large, elegant, classic serif capitals, warm ivory with a subtle gold edge, "
        "perfectly legible, centred. This title is the ONLY text on the cover: no subtitle, no author "
        "name, no logo, no watermark, no other lettering anywhere. Do not include: %s"
        % (plain_text(style), plain_text(cv["scene"]), plain_text(cv["light"]),
           plain_text(cv["title_zone"][0].lower() + cv["title_zone"][1:]).rstrip("."),
           title_plain(C), plain_text(cv["avoid"]))
    )


def build(C, key, out):
    cv = COVERS[key]
    title = title_plain(C)
    f = []

    def item(text):
        f.append(Paragraph(text, S["item"], bulletText="•"))

    f.append(Paragraph("%s — Cover Image Prompt" % html.escape(title), S["title"]))
    f.append(Paragraph(C.SUBTITLE, S["sub"]))
    f.append(Paragraph("%s &#183; one image &#183; portrait 9:16" % C.REFERENCE, S["meta"]))
    f.append(Paragraph("Submit this document to the image generator to make the story's cover page. It is a "
                       "separate image from the comic pages; generate it on its own.", S["body"]))

    f.append(Paragraph("1. The cover", S["h1"]))
    for k, t in enumerate([
        "<b>Produce exactly one image:</b> a book cover, portrait, <b>9:16</b> — the same shape as the "
        "story's pages in the DailyGrace story viewer. Full-bleed artwork, no border, no panels.",
        "<b>Title.</b> The cover must show the title, spelled exactly: <b>%s</b>. Large, elegant, classic "
        "serif capitals in warm ivory with a subtle gold edge, perfectly legible, centred in the %s"
        % (html.escape(title), cv["title_zone"][0].lower() + cv["title_zone"][1:]),
        "<b>The title is the only text.</b> No subtitle, verse reference, author name, logo, watermark, "
        "signature or any other lettering.",
        "<b>Keep every character exactly as described in section 3</b>, so the cover matches the comic "
        "pages.",
    ], 1):
        f.append(Paragraph(t, S["item"], bulletText="%d." % k))

    f.append(Paragraph("2. The picture", S["h1"]))
    box = Table([[[Paragraph("<b>Scene.</b> %s" % cv["scene"], S["pic"]),
                   Paragraph("<b>Why this image.</b> %s" % cv["why"], S["pic"]),
                   Paragraph("<b>Light and colour.</b> %s" % cv["light"], S["pic"]),
                   Paragraph("<b>Must not appear.</b> %s" % cv["avoid"], S["pic"])]]],
                colWidths=[letter[0] - 1.3 * inch])
    box.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), KEY_BG), ("BOX", (0, 0), (-1, -1), 0.8, GOLD),
                             ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                             ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
    f.append(box)
    f.append(Paragraph("Art direction from the book (applies to the cover too):", S["body"]))
    for k, v in C.STYLE_BIBLE:
        if k.lower() in ("lettering", "composition", "palette"):
            continue  # page layout, balloon and page-by-page colour rules do not apply to one cover
        item("<b>%s.</b> %s" % (k, v))

    f.append(Paragraph("3. Characters — the same as on the comic pages", S["h1"]))
    for name, look in CAST[key]:
        item("<b>%s</b> — %s" % (name, look))

    f.append(Paragraph("4. Ready-to-paste prompt", S["h1"]))
    f.append(Paragraph("For tools that take a single text prompt, paste this paragraph as it stands.", S["ref"]))
    rp = Table([[Paragraph(html.escape(ready_prompt(C, key)), S["pic"])]], colWidths=[letter[0] - 1.3 * inch])
    rp.setStyle(TableStyle([("BOX", (0, 0), (-1, -1), 0.8, GOLD), ("LEFTPADDING", (0, 0), (-1, -1), 8),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 6),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
    f.append(rp)

    def decorate(canv, doc):
        canv.saveState()
        canv.setFont("Helvetica", 7.4)
        canv.setFillColor(MUTED)
        canv.drawString(0.65 * inch, letter[1] - 0.45 * inch, "%s — COVER IMAGE PROMPT" % title.upper())
        canv.drawRightString(letter[0] - 0.65 * inch, 0.4 * inch, str(doc.page))
        canv.restoreState()

    doc = SimpleDocTemplate(out, pagesize=letter, leftMargin=0.65 * inch, rightMargin=0.65 * inch,
                            topMargin=0.7 * inch, bottomMargin=0.65 * inch, author="DailyGrace Flipbooks",
                            title="%s - Cover Image Prompt" % title,
                            subject="%s - cover, portrait 9:16" % plain_text(C.REFERENCE))
    doc.build(f, onFirstPage=decorate, onLaterPages=decorate)
    print("wrote %s" % out)

