# -*- coding: utf-8 -*-
"""
Build menu-icon-prompts.pdf: one image-generator prompt per Bible Study Guide
in the Daily Grace menu, each asking for an SVG icon in the style the menu
already uses (24x24 outline icons, 2px round stroke, one colour).

    python tools/menu-icons/build_prompts.py

Every prompt repeats the shared style in full, because an image generator sees
one prompt at a time. Edit GUIDES below and run the script again to rebuild.
"""
import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "menu-icon-prompts.pdf")

NAVY = colors.HexColor("#001b34")
GOLD = colors.HexColor("#c6922e")
CREAM = colors.HexColor("#f6eedf")
INK = colors.HexColor("#10253b")
MUTED = colors.HexColor("#56626b")

# (menu title, menu subtitle, what the icon shows, what to keep out of it)
GUIDES = [
    ("Books of the Bible",
     "All 66 books: who wrote them, when, and why",
     "three upright books standing side by side on a short shelf line, of "
     "slightly different heights, the middle book with a small plain cross on "
     "its spine, suggesting a library of many books",
     "open pages, text on the spines, more than three books"),
    ("Bible Characters",
     "The people of the Bible, from Adam to the first church, and why they matter",
     "two people shown head and shoulders, one slightly behind the other, both "
     "in simple robes with head coverings, the front figure holding a "
     "shepherd's crook",
     "faces with features, halos, more than two people"),
    ("Peoples of the Bible",
     "The nations of Scripture and where they lived",
     "a map location pin standing on a simple folded paper map made of three "
     "panels, with one wavy line across the map for a river",
     "a globe, country outlines, labels, compass letters"),
    ("Prayers in the Bible",
     "The prayers Jesus taught and prayed, and how to pray them today",
     "two hands pressed together in prayer, fingers pointing straight up, seen "
     "from the side, with a short sleeve cuff at the bottom of each wrist",
     "rosary beads, light rays, a face, any hand pose other than praying hands"),
    ("Poems, Songs and Wisdom",
     "The Bible's poems, songs and proverbs, and what they mean for daily life",
     "an ancient lyre, the harp of King David: a U-shaped wooden frame with "
     "two curved arms, a crossbar at the top and three vertical strings",
     "modern music notes, a guitar, a large concert harp"),
    ("Red-Lettered Quotes",
     "The words of Jesus, explained in plain words",
     "a rounded speech bubble with a small tail at the lower left, holding a "
     "pair of opening quotation marks drawn as two simple curved commas",
     "letters or words inside the bubble, more than one bubble"),
    ("Heroes and Villains",
     "The people who stood for God, and against him",
     "a round shield seen from the front with a short straight sword passing "
     "diagonally behind it, the hilt at the upper right and the tip at the "
     "lower left",
     "blood, skulls, armour or helmets, a coat of arms"),
    ("Flora and Fauna",
     "The plants and animals of the Bible, and why they matter",
     "a dove in flight seen from the side, wings raised, carrying a small "
     "olive sprig with two leaves in its beak",
     "a crowd of animals, a tree, a rainbow"),
    ("Supernaturals and Prophecies",
     "Miracles, healings, demons cast out, prophecies fulfilled, and special "
     "topics on angels and demons",
     "a pair of outspread angel wings, one on each side, curving upward, with "
     "a small four-pointed star shining in the space between them",
     "a human figure, horns or devils, a crystal ball, an eye"),
    ("Commandments of God",
     "The Ten Commandments, and the commands of Jesus and the apostles for daily life",
     "two stone tablets with rounded tops standing side by side and touching, "
     "each with three short horizontal lines standing for engraved text",
     "Roman numerals, letters, a mountain, lightning"),
    ("Questions We All Ask",
     "From worry to what comes after, answered by Jesus, the prophets, the apostles, "
     "the wisdom books and the Law",
     "a small ancient clay oil lamp seen from the side, with a handle at one "
     "end and a single teardrop flame rising from the spout at the other, as "
     "in \"thy word is a lamp unto my feet\"",
     "a candle, a light bulb, a lantern with glass, rays or sparkles"),
    ("Following God's Blueprint",
     "God's plan to build on: salvation, every day, solving problems his way, "
     "and getting ready for Christ's return",
     "a closed Bible with a small cross on its cover and a ribbon bookmark, "
     "standing in front of an unrolled blueprint scroll with a simple floor "
     "plan drawn on it, the scroll curling at its right edge",
     "a house, tools, a ruler, a compass, rays or sparkles"),
]

STYLE = (
    "Style: a minimal outline icon in the manner of a modern UI icon set such "
    "as Lucide or Feather. Drawn on a 24 by 24 grid with one uniform 2px "
    "stroke, round line caps and round joins, no fills, no gradients, no "
    "shading and no text or letters. One colour only, deep navy #001B34, on a "
    "transparent background. Centred with about 2px of empty space on every "
    "side, and simple enough to read clearly at 18 pixels wide. It belongs to "
    "a matching set of twelve icons for a Bible study app called Daily Grace, "
    "so keep the line weight and level of detail identical across the set."
)
OUTPUT = (
    "Output: a clean SVG with viewBox=\"0 0 24 24\", fill=\"none\", "
    "stroke=\"currentColor\", stroke-width=\"2\", stroke-linecap=\"round\" and "
    "stroke-linejoin=\"round\", built from a few simple paths, with no "
    "embedded images, no background shape and no surrounding circle."
)


def prompt_for(title, subject, avoid):
    return (f"A single SVG icon representing \"{title}\": {subject}. "
            f"{STYLE} {OUTPUT} Avoid: {avoid}, and any background, border, "
            f"circle frame, shadow, 3D effect, colour other than navy, or text.")


def set_prompt():
    items = "; ".join(f"{i}. {title}: {subject}"
                      for i, (title, _, subject, _) in enumerate(GUIDES, 1))
    return (f"A set of twelve matching SVG icons for a Bible study app, laid out "
            f"in a grid of four columns and three rows with generous spacing, "
            f"in this order: {items}. Each icon follows the same rules. {STYLE} "
            f"{OUTPUT.replace('a clean SVG', 'one clean SVG per icon')} Avoid "
            f"labels, backgrounds, circle frames, shadows, colour other than "
            f"navy, and any text.")


def styles():
    base = dict(fontName="Helvetica", textColor=INK, alignment=TA_LEFT)
    return {
        "title": ParagraphStyle("title", **{**base, "fontName": "Helvetica-Bold",
                                            "fontSize": 22, "leading": 27,
                                            "textColor": NAVY}),
        "eyebrow": ParagraphStyle("eyebrow", **{**base, "fontName": "Helvetica-Bold",
                                                "fontSize": 9, "leading": 12,
                                                "textColor": GOLD}),
        "h2": ParagraphStyle("h2", **{**base, "fontName": "Helvetica-Bold",
                                      "fontSize": 14, "leading": 18,
                                      "textColor": NAVY, "spaceBefore": 4}),
        "body": ParagraphStyle("body", **{**base, "fontSize": 10, "leading": 14.5}),
        "muted": ParagraphStyle("muted", **{**base, "fontSize": 9.5, "leading": 13,
                                            "textColor": MUTED}),
        "label": ParagraphStyle("label", **{**base, "fontName": "Helvetica-Bold",
                                            "fontSize": 8, "leading": 10,
                                            "textColor": GOLD}),
        "prompt": ParagraphStyle("prompt", **{**base, "fontName": "Courier",
                                              "fontSize": 9, "leading": 12.5}),
    }


def prompt_box(text, st):
    box = Table([[Paragraph("PROMPT (copy everything in this box)", st["label"])],
                 [Paragraph(text, st["prompt"])]],
                colWidths=[170 * mm])
    box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CREAM),
        ("BOX", (0, 0), (-1, -1), 0.8, GOLD),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 9),
    ]))
    return box


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 12 * mm, "Daily Grace · Bible Study Guides menu icons")
    canvas.drawRightString(190 * mm, 12 * mm, f"Page {doc.page}")
    canvas.restoreState()


def build():
    st = styles()
    doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                            topMargin=18 * mm, bottomMargin=20 * mm,
                            title="Daily Grace menu icon prompts",
                            author="Daily Grace")
    story = [
        Paragraph("DAILY GRACE · BIBLE STUDY GUIDES", st["eyebrow"]),
        Paragraph("Menu icon prompts", st["title"]),
        Spacer(1, 6),
        Paragraph(
            "One prompt for each of the twelve guides in the Daily Grace menu. "
            "Each prompt is complete on its own: paste one box into the image "
            "generator to get one icon. To keep the whole set consistent, you "
            "can first try the set prompt below, which asks for all twelve "
            "icons in one image.", st["body"]),
        Spacer(1, 8),
        Paragraph("What every icon must be", st["h2"]),
        Paragraph(
            "The menu shows each icon at 18 by 18 pixels inside a white circle "
            "of its own, so the icon itself has no circle, border or "
            "background. It is an outline drawing on a 24 by 24 grid with one "
            "2px stroke, round ends and corners, no fills and no text, in a "
            "single colour (navy #001B34). The page recolours it through "
            "currentColor, so the SVG should use stroke=\"currentColor\".",
            st["body"]),
        Spacer(1, 10),
        Paragraph("Set prompt: all twelve icons at once", st["h2"]),
        Spacer(1, 4),
        prompt_box(set_prompt(), st),
    ]
    for number, (title, subtitle, subject, avoid) in enumerate(GUIDES, 1):
        story.append(Spacer(1, 16))
        story.append(KeepTogether([
            Paragraph(f"{number}. {title}", st["h2"]),
            Paragraph(f"Menu line: {subtitle}", st["muted"]),
            Spacer(1, 3),
            Paragraph(f"<b>Idea:</b> {subject[0].upper()}{subject[1:]}.", st["body"]),
            Spacer(1, 5),
            prompt_box(prompt_for(title, subject, avoid), st),
        ]))
    story += [
        Spacer(1, 18),
        KeepTogether([
            Paragraph("Checking what comes back", st["h2"]),
            Paragraph(
                "Before an icon goes into the menu, open the SVG and check "
                "that: the viewBox is 0 0 24 24; it uses stroke=\"currentColor\" "
                "and fill=\"none\" rather than a fixed colour; it has no "
                "background rectangle, circle frame or embedded image; the "
                "lines are one even weight; and it is still recognisable at "
                "18 pixels wide beside the other ten. Generators often return "
                "filled shapes or extra detail; if so, ask again with "
                "\"outline only, fewer lines\" added to the prompt.",
                st["body"]),
        ]),
    ]
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUT)


if __name__ == "__main__":
    build()
