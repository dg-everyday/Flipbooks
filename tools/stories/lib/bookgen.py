# -*- coding: utf-8 -*-
"""Generic builder for DailyGrace scripture story books and artist's scripts.

Called by tools/stories/build.py; build(C, "book" or "script", out.pdf).
"""
import importlib
import os
import re
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (BaseDocTemplate, Frame, KeepTogether, NextPageTemplate,
                                PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle)


INK = colors.HexColor("#1A1A1A")
EMBER = colors.HexColor("#B23A0E")
GOLD = colors.HexColor("#8A6A1F")
MUTED = colors.HexColor("#5C5A57")
RULE = colors.HexColor("#C9C3B8")
PANEL_BG = colors.HexColor("#FAF7F1")
HEAD_BG = colors.HexColor("#F1EDE4")

PW, PH = letter
MARGIN = 0.55 * inch
CW = PW - 2 * MARGIN


def br(s):
    return s.replace("\n", "<br/>")


def plain(s):
    s = s.replace("&#8212;", "-").replace("&#8211;", "-")
    s = s.replace("&#8220;", '"').replace("&#8221;", '"').replace("&#8216;", "'")
    s = s.replace("&#8217;", "'").replace("&#215;", "x").replace("&#183;", "-")
    s = s.replace("&amp;", "&")
    for a, b in (("—", "-"), ("–", "-"), ("“", '"'), ("”", '"'),
                 ("‘", "'"), ("’", "'"), ("…", "...")):
        s = s.replace(a, b)
    return re.sub(r"<[^>]+>", "", s).strip()


def split_title(title):
    """'Page One — Title' -> ('Page One', 'Title'), for either dash spelling."""
    for dash in (" &#8212; ", " — "):
        if dash in title:
            num, _, rest = title.partition(dash)
            return num, rest
    return title, ""


def mkstyles():
    S = {}
    S["cover_kicker"] = ParagraphStyle("ck", fontName="Helvetica-Bold", fontSize=10, leading=14,
                                       textColor=EMBER, alignment=TA_CENTER, spaceAfter=4)
    S["cover_title"] = ParagraphStyle("ct", fontName="Times-Bold", fontSize=36, leading=40,
                                      textColor=INK, alignment=TA_CENTER, spaceAfter=9)
    S["cover_sub"] = ParagraphStyle("cs", fontName="Times-Italic", fontSize=14, leading=19,
                                    textColor=MUTED, alignment=TA_CENTER, spaceAfter=16)
    S["cover_ref"] = ParagraphStyle("cr", fontName="Helvetica-Bold", fontSize=11, leading=15,
                                    textColor=GOLD, alignment=TA_CENTER, spaceAfter=6)
    S["logline"] = ParagraphStyle("lg", fontName="Times-Roman", fontSize=11.7, leading=17.4,
                                  textColor=INK, alignment=TA_CENTER)
    S["cover_meta"] = ParagraphStyle("cm", fontName="Helvetica", fontSize=9, leading=14,
                                     textColor=MUTED, alignment=TA_CENTER)
    S["h1"] = ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=15, leading=19,
                             textColor=EMBER, spaceBefore=4, spaceAfter=3)
    S["h1sub"] = ParagraphStyle("h1s", fontName="Helvetica", fontSize=8.5, leading=12,
                                textColor=MUTED, spaceAfter=10)
    S["h2"] = ParagraphStyle("h2", fontName="Times-Bold", fontSize=12.5, leading=16,
                             textColor=INK, spaceBefore=12, spaceAfter=5)
    S["h2s"] = ParagraphStyle("h2s", fontName="Helvetica-Bold", fontSize=10.5, leading=14,
                              textColor=INK, spaceBefore=11, spaceAfter=4)
    S["body"] = ParagraphStyle("bd", fontName="Times-Roman", fontSize=10.6, leading=15.4,
                               textColor=INK, alignment=TA_JUSTIFY, spaceAfter=7)
    S["body_s"] = ParagraphStyle("bds", fontName="Times-Roman", fontSize=10, leading=13.8,
                                 textColor=INK, alignment=TA_JUSTIFY, spaceAfter=6)
    S["pull"] = ParagraphStyle("pl", fontName="Times-Italic", fontSize=11.4, leading=16.4,
                               textColor=INK, alignment=TA_JUSTIFY, spaceAfter=7,
                               leftIndent=14, rightIndent=14)
    S["ch_name"] = ParagraphStyle("cn", fontName="Helvetica-Bold", fontSize=10, leading=13,
                                  textColor=INK, spaceAfter=1)
    S["ch_role"] = ParagraphStyle("crl", fontName="Helvetica-Oblique", fontSize=8.2, leading=11,
                                  textColor=EMBER, spaceAfter=3)
    S["ch_verse"] = ParagraphStyle("cv", fontName="Helvetica", fontSize=7.6, leading=10,
                                   textColor=GOLD)
    S["ch_desc"] = ParagraphStyle("cd", fontName="Times-Roman", fontSize=9.4, leading=13,
                                  textColor=INK, alignment=TA_JUSTIFY)
    S["pg_title"] = ParagraphStyle("pt", fontName="Helvetica-Bold", fontSize=13.5, leading=17,
                                   textColor=INK, spaceAfter=1)
    S["pg_verse"] = ParagraphStyle("pv", fontName="Helvetica-Bold", fontSize=8.5, leading=12,
                                   textColor=EMBER, spaceAfter=8)
    S["pn_head"] = ParagraphStyle("ph", fontName="Helvetica-Bold", fontSize=8.4, leading=11,
                                  textColor=EMBER, spaceAfter=3)
    S["pn_act"] = ParagraphStyle("pa", fontName="Helvetica", fontSize=8.2, leading=10.6,
                                 textColor=INK, spaceAfter=5)
    S["pn_dlg"] = ParagraphStyle("pd", fontName="Helvetica-Bold", fontSize=8.0, leading=10.6,
                                 textColor=colors.HexColor("#2E2A45"))
    S["tbl"] = ParagraphStyle("tb", fontName="Helvetica", fontSize=8.6, leading=11.4,
                              textColor=INK)
    S["tbl_b"] = ParagraphStyle("tbb", fontName="Helvetica-Bold", fontSize=8.6, leading=11.4,
                                textColor=INK)
    S["cast_n"] = ParagraphStyle("csn", fontName="Helvetica-Bold", fontSize=8.6, leading=11.4,
                                 textColor=INK)
    S["cast_d"] = ParagraphStyle("csd", fontName="Helvetica", fontSize=8.4, leading=11.2,
                                 textColor=INK)
    S["mono_h"] = ParagraphStyle("mh", fontName="Courier-Bold", fontSize=8, leading=10.6,
                                 textColor=EMBER, spaceAfter=2)
    S["mono"] = ParagraphStyle("mo", fontName="Courier", fontSize=7.4, leading=9.6, textColor=INK)
    S["note_h"] = ParagraphStyle("nh", fontName="Helvetica-Bold", fontSize=9.4, leading=12.6,
                                 textColor=EMBER, spaceBefore=8, spaceAfter=2)
    S["note_b"] = ParagraphStyle("nb", fontName="Times-Roman", fontSize=9.8, leading=13.4,
                                 textColor=INK, alignment=TA_JUSTIFY, spaceAfter=3)
    S["foot"] = ParagraphStyle("ft", fontName="Helvetica-Oblique", fontSize=8, leading=11,
                               textColor=MUTED, alignment=TA_CENTER)
    return S


def rule(width, color=RULE, thick=0.7, before=0, after=0):
    t = Table([[""]], colWidths=[width], rowHeights=[0.1])
    t.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), thick, color)]))
    out = []
    if before:
        out.append(Spacer(1, before))
    out.append(t)
    if after:
        out.append(Spacer(1, after))
    return out


def head_table(rows, colw, repeat=1):
    t = Table(rows, colWidths=colw, repeatRows=repeat)
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("BACKGROUND", (0, 0), (-1, 0), HEAD_BG),
        ("LINEBELOW", (0, 0), (-1, 0), 0.8, GOLD),
        ("LINEBELOW", (0, 1), (-1, -2), 0.4, RULE),
        ("BOX", (0, 0), (-1, -1), 0.6, RULE),
    ]))
    return t


PANEL_H = (PH - 1.58 * inch - 48) / 3.0


def check_fit(C, S):
    """Raise if any panel's lettering would spill out of its ruled box."""
    colw = (CW - 10) / 2.0 - 16
    worst = []
    for title, _v, panels in C.PAGES:
        for n, (shot, action, dialogue) in enumerate(panels, 1):
            h = 14  # top + bottom padding
            for text, st in ((shot, "pn_head"), (br(action), "pn_act"), (br(dialogue), "pn_dlg")):
                p = Paragraph(text, S[st])
                h += p.wrap(colw, 10000)[1] + S[st].spaceAfter
            worst.append((h / PANEL_H, plain(title), n))
            if h > PANEL_H:
                raise SystemExit("panel overflows: %s panel %d (%.0f of %.0f pt)"
                                 % (plain(title), n, h, PANEL_H))
    worst.sort(reverse=True)
    print("fullest panels:", ", ".join("%s #%d %.0f%%" % (t.split(" - ")[0], n, r * 100)
                                        for r, t, n in worst[:3]))


def panel_grid(panels, S):
    cells = [[Paragraph(shot, S["pn_head"]), Paragraph(br(action), S["pn_act"]),
              Paragraph(br(dialogue), S["pn_dlg"])] for shot, action, dialogue in panels]
    grid = [cells[0:2], cells[2:4], cells[4:6]]
    colw = (CW - 10) / 2.0
    t = Table(grid, colWidths=[colw, colw], rowHeights=[(PH - 1.58 * inch - 48) / 3.0] * 3)
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BACKGROUND", (0, 0), (-1, -1), PANEL_BG),
        ("BOX", (0, 0), (-1, -1), 1.1, INK),
        ("INNERGRID", (0, 0), (-1, -1), 1.1, INK),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return t


def build(C, kind, out):
    S = mkstyles()
    check_fit(C, S)
    hl = C.HEADER_L + ("  -  COMIC SCRIPT" if kind == "script" else "")

    def decorate(canv, doc, cover=False):
        canv.saveState()
        if cover:
            canv.setFillColor(colors.HexColor("#FBF8F2"))
            canv.rect(0, 0, PW, PH, stroke=0, fill=1)
            canv.setStrokeColor(GOLD)
            canv.setLineWidth(1.6)
            canv.rect(0.42 * inch, 0.42 * inch, PW - 0.84 * inch, PH - 0.84 * inch, 1, 0)
            canv.setLineWidth(0.5)
            canv.rect(0.52 * inch, 0.52 * inch, PW - 1.04 * inch, PH - 1.04 * inch, 1, 0)
        else:
            canv.setStrokeColor(RULE)
            canv.setLineWidth(0.6)
            canv.line(MARGIN, PH - 0.62 * inch, PW - MARGIN, PH - 0.62 * inch)
            canv.line(MARGIN, 0.62 * inch, PW - MARGIN, 0.62 * inch)
            canv.setFont("Helvetica", 7.4)
            canv.setFillColor(MUTED)
            canv.drawString(MARGIN, PH - 0.54 * inch, hl)
            canv.drawRightString(PW - MARGIN, PH - 0.54 * inch, C.HEADER_R)
            canv.drawCentredString(PW / 2.0, 0.44 * inch, str(canv.getPageNumber()))
        canv.restoreState()

    frame = Frame(MARGIN, 0.78 * inch, CW, PH - 1.58 * inch, id="body",
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    cframe = Frame(1.0 * inch, 1.0 * inch, PW - 2.0 * inch, PH - 2.0 * inch, id="cover",
                   leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc = BaseDocTemplate(
        out, pagesize=letter, author="DailyGrace Flipbooks",
        title=C.TITLE + (" - Comic Script" if kind == "script" else ""),
        subject="%s - %s" % (plain(C.REFERENCE),
                             "%d-page, %d-panel comic script" % (len(C.PAGES), len(C.PAGES) * 6)
                             if kind == "script"
                             else "story, characters and 6-panel comic script"))
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[cframe],
                     onPage=lambda c, d: decorate(c, d, cover=True)),
        PageTemplate(id="body", frames=[frame], onPage=decorate),
    ])

    f = []
    npages = len(C.PAGES)

    # ---------------------------------------------------------------- cover
    f += [Spacer(1, 1.7 * inch)]
    f += [Paragraph("A DAILYGRACE FLIPBOOK &#183; " +
                    ("ARTIST'S SCRIPT" if kind == "script"
                     else "SCRIPTURE STORY &amp; COMIC SCRIPT"), S["cover_kicker"])]
    f += rule(2.6 * inch, GOLD, 0.9, 6, 20)
    f += [Paragraph(C.TITLE, S["cover_title"])]
    f += [Paragraph("The Comic Script" if kind == "script" else C.SUBTITLE, S["cover_sub"])]
    f += rule(2.6 * inch, GOLD, 0.9, 0, 18)
    f += [Paragraph(C.REFERENCE, S["cover_ref"])]
    if kind == "script":
        f += [Spacer(1, 20)]
        f += [Paragraph("%d pages &#183; 6 panels per page &#183; %d panels"
                        % (npages, npages * 6), S["cover_ref"])]
    f += [Spacer(1, 24)]
    f += [Paragraph(C.LOGLINE, S["logline"])]
    f += [Spacer(1, 38)]
    f += rule(1.6 * inch, RULE, 0.6, 0, 14)
    if kind == "script":
        toc = ("How to read this script<br/>Cast quick reference<br/>Page breakdown<br/>"
               "The script &#8212; Pages One to %s<br/>"
               "Appendix: art direction and per-panel image prompts" % C.PAGE_WORDS[-1])
    else:
        toc = ("I. The Story, in %s Movements<br/>II. The Characters<br/>"
               "III. The Comic Script &#8212; %d pages &#215; 6 panels = %d panels<br/>"
               "IV. Scripture Fidelity Check" % (C.MOVEMENT_WORD, npages, npages * 6))
    f += [Paragraph("Contents<br/><br/>" + toc, S["cover_meta"])]
    f += [NextPageTemplate("body"), PageBreak()]

    if kind == "book":
        # ------------------------------------------------------------ story
        f += [Paragraph("I. The Story", S["h1"])]
        f += [Paragraph("A verbose retelling of %s, following the King James text verse by "
                        "verse." % plain(C.REFERENCE).replace(" (King James Version)", ""),
                        S["h1sub"])]
        for head, paras in C.STORY:
            blk = [Paragraph(head, S["h2"])] + [Paragraph(p, S["body"]) for p in paras]
            f.append(KeepTogether(blk[:2]))
            f += blk[2:]
        f += [Spacer(1, 6)] + rule(CW, RULE, 0.6, 0, 8)
        f += [Paragraph("The Hinge of the Story", S["h2"])]
        f += [Paragraph(C.THEME, S["pull"])]

        # ------------------------------------------------------- characters
        f += [PageBreak(), Paragraph("II. The Characters", S["h1"])]
        f += [Paragraph("Everyone the passage names or numbers, with the verses each one "
                        "appears in.", S["h1sub"])]
        rows = [[[Paragraph(n, S["ch_name"]), Paragraph(r, S["ch_role"]),
                  Paragraph(v, S["ch_verse"])], Paragraph(d, S["ch_desc"])]
                for n, r, d, v in C.CHARACTERS]
        ct = Table(rows, colWidths=[1.85 * inch, CW - 1.85 * inch])
        ct.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 9.5), ("BOTTOMPADDING", (0, 0), (-1, -1), 9.5),
            ("LEFTPADDING", (0, 0), (0, -1), 0), ("RIGHTPADDING", (0, 0), (0, -1), 10),
            ("LEFTPADDING", (1, 0), (1, -1), 10), ("RIGHTPADDING", (1, 0), (1, -1), 0),
            ("LINEBELOW", (0, 0), (-1, -2), 0.5, RULE),
            ("LINEBEFORE", (1, 0), (1, -1), 0.5, RULE),
        ]))
        f.append(ct)

        # ----------------------------------------------------- script intro
        f += [PageBreak(), Paragraph("III. The Comic Script", S["h1"])]
        f += [Paragraph("%s pages, six panels to a page, %s panels in all. Panels read "
                        "left-to-right, two across and three down. Shot type is given first, "
                        "then the action, then the lettering."
                        % (C.PAGE_WORDS[-1], C.PANEL_WORD), S["h1sub"])]
        rows = [[Paragraph(x, S["tbl_b"]) for x in ("Page", "Title", "Verses", "Beat")]]
        for (title, verses, _), beat in zip(C.PAGES, C.BEATS):
            num, rest = split_title(title)
            rows.append([Paragraph(num.replace("Page ", ""), S["tbl"]),
                         Paragraph(rest, S["tbl"]),
                         Paragraph(C.strip_book(verses), S["tbl"]), Paragraph(beat, S["tbl"])])
        f.append(head_table(rows, [0.75 * inch, 2.45 * inch, 0.95 * inch, CW - 4.15 * inch]))
    else:
        # ------------------------------------------------------ how to read
        f += [Paragraph("How to Read This Script", S["h1"])]
        f += [Paragraph("Conventions used throughout, so nothing has to be guessed at.",
                        S["h1sub"])]
        for t in C.HOWTO:
            f.append(Paragraph(t, S["body_s"]))
        f += [Spacer(1, 4), Paragraph("Cast Quick Reference", S["h2s"])]
        rows = [[Paragraph(x, S["tbl_b"]) for x in ("Who", "Role", "In verses")]]
        for n, r, _d, v in C.CHARACTERS:
            rows.append([Paragraph(n, S["cast_n"]), Paragraph(r, S["cast_d"]),
                         Paragraph(v, S["cast_d"])])
        f.append(head_table(rows, [1.55 * inch, CW - 3.35 * inch, 1.8 * inch]))
        f.append(Paragraph("Full profiles and staging notes for each of these are in the "
                           "companion volume, <i>%s</i> (Part II)." % C.TITLE, S["h1sub"]))

        # ------------------------------------------------------- breakdown
        f += [PageBreak(), Paragraph("Page Breakdown", S["h1"])]
        f += [Paragraph("%s pages, six panels to a page, %s panels in all. Every verse of %s "
                        "is covered, in order, none skipped and none used twice."
                        % (C.PAGE_WORDS[-1], C.PANEL_WORD,
                           plain(C.REFERENCE).replace(" (King James Version)", "")), S["h1sub"])]
        rows = [[Paragraph(x, S["tbl_b"])
                 for x in ("Page", "Title", "Verses", "Beat", "Key staging")]]
        for (title, verses, _), beat, key in zip(C.PAGES, C.BEATS, C.KEYS):
            num, rest = split_title(title)
            rows.append([Paragraph(num.replace("Page ", ""), S["tbl"]),
                         Paragraph(rest, S["tbl"]), Paragraph(C.strip_book(verses), S["tbl"]),
                         Paragraph(beat, S["tbl"]), Paragraph(key, S["tbl"])])
        f.append(head_table(rows, [0.62 * inch, 1.65 * inch, 0.8 * inch, 2.0 * inch,
                                   CW - 5.07 * inch]))

    # ---------------------------------------------------------- the pages
    for title, verses, panels in C.PAGES:
        f.append(PageBreak())
        f.append(Paragraph(title, S["pg_title"]))
        f.append(Paragraph(verses.upper() + "  &#183;  SIX PANELS", S["pg_verse"]))
        f.append(panel_grid(panels, S))

    if kind == "book":
        # ------------------------------------------------------ validation
        f += [PageBreak(), Paragraph("IV. Scripture Fidelity Check", S["h1"])]
        f += [Paragraph("What is in the text, and what was added to stage it.", S["h1sub"])]
        f += [Paragraph(C.VALIDATION_INTRO, S["note_b"]), Spacer(1, 8)]
        rows = [[Paragraph(x, S["tbl_b"]) for x in ("Script page", "Verses", "Text covered")]]
        for pg, vs, cov in C.VALIDATION_MAP:
            rows.append([Paragraph(pg, S["tbl"]), Paragraph(vs, S["tbl"]),
                         Paragraph(cov, S["tbl"])])
        f.append(head_table(rows, [0.95 * inch, 1.15 * inch, CW - 2.10 * inch]))
        f.append(Spacer(1, 12))
        for h, b in C.VALIDATION_NOTES:
            f.append(KeepTogether([Paragraph(h, S["note_h"]), Paragraph(b, S["note_b"])]))
        f.append(Spacer(1, 16))
        f += rule(CW, RULE, 0.6, 0, 8)
        f.append(Paragraph(C.FOOTER_NOTE, S["foot"]))
    else:
        # -------------------------------------------------------- appendix
        f += [PageBreak(), Paragraph("Appendix &#8212; Art Direction", S["h1"])]
        f += [Paragraph("Read once before drawing anything. These rules hold for all %s "
                        "panels." % C.PANEL_WORD, S["h1sub"])]
        rows = [[Paragraph(k, S["cast_n"]), Paragraph(v, S["cast_d"])] for k, v in C.STYLE_BIBLE]
        st = Table(rows, colWidths=[1.25 * inch, CW - 1.25 * inch])
        st.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("LEFTPADDING", (0, 0), (0, -1), 0), ("RIGHTPADDING", (0, 0), (0, -1), 10),
            ("LEFTPADDING", (1, 0), (1, -1), 10), ("RIGHTPADDING", (1, 0), (1, -1), 0),
            ("LINEBELOW", (0, 0), (-1, -2), 0.5, RULE),
            ("LINEBEFORE", (1, 0), (1, -1), 0.5, RULE),
        ]))
        f.append(st)

        f += [PageBreak(), Paragraph("Appendix &#8212; Per-Panel Image Prompts", S["h1"])]
        f += [Paragraph("One ready-to-paste prompt for each of the %s panels. Prefix every one "
                        "with the art-direction block on the previous page &#8212; these lines carry "
                        "only what changes panel to panel. No image has been generated from "
                        "them; they are written to be run as-is." % C.PANEL_WORD, S["h1sub"])]
        f += [Paragraph(C.PROMPT_TAIL, S["h1sub"])]
        rows = [[Paragraph("Panel", S["tbl_b"]), Paragraph("Prompt", S["tbl_b"])]]
        for pi, ((title, verses, panels), light) in enumerate(zip(C.PAGES, C.PAGE_LIGHT), 1):
            rows.append([Paragraph("PAGE %d" % pi, S["mono_h"]),
                         Paragraph("%s  /  %s  /  light: %s"
                                   % (plain(split_title(title)[1]), plain(verses), light),
                                   S["mono_h"])])
            for ni, (shot, action, _d) in enumerate(panels, 1):
                head = plain(shot)
                head = head.split(". ", 1)[1] if ". " in head else head
                rows.append([Paragraph("%d.%d" % (pi, ni), S["mono"]),
                             Paragraph("%s. %s Light: %s."
                                       % (head, plain(action), light), S["mono"])])
        pt = Table(rows, colWidths=[0.72 * inch, CW - 0.72 * inch], repeatRows=1)
        style = [
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("BACKGROUND", (0, 0), (-1, 0), HEAD_BG),
            ("LINEBELOW", (0, 0), (-1, 0), 0.8, GOLD),
            ("BOX", (0, 0), (-1, -1), 0.6, RULE),
        ]
        for i, row in enumerate(rows):
            if i and row[0].text.startswith("PAGE"):
                style.append(("BACKGROUND", (0, i), (-1, i), colors.HexColor("#F7F2E8")))
                style.append(("LINEABOVE", (0, i), (-1, i), 0.6, GOLD))
            elif i > 1:
                style.append(("LINEABOVE", (0, i), (-1, i), 0.3, RULE))
        pt.setStyle(TableStyle(style))
        f.append(pt)
        f.append(Spacer(1, 14))
        f += rule(CW, RULE, 0.6, 0, 8)
        f.append(Paragraph(C.SCRIPT_FOOTER, S["foot"]))

    doc.build(f)
    print("wrote", out)

