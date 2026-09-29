"""Build the narration scripts for Questions We All Ask, ready for text-to-speech.

Reads assets/guidance-for-life.json (run build_guidance.py first) and writes, in
tools/guidance/narration/:

  * questions-we-all-ask-narration.pdf  every script, one per page, with a
    contents table giving each script's audio file name, length and time,
  * text/<id>.txt                        each script as plain text, to paste
    into the TTS tool.

Each script is what the play button on "Today's Question" will read: the
question, the short answer, the guidance in plain words, two or three passages
in the King James words with their references spoken out, the thing to try and
the prayer. Passages are chosen from different voices, starting with the one
that leads the topic, to keep each script near two minutes. The audio for a
topic is saved as <id>.webm, the topic's id in the JSON.

Run from the repo root:  python tools/guidance/build_narration.py
Exits non-zero if a script names a time of day (the audio plays at any hour).
"""
import html
import json
import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
DATA = ROOT / "assets" / "guidance-for-life.json"
OUT_DIR = HERE / "narration"
PDF = OUT_DIR / "questions-we-all-ask-narration.pdf"
TEXT_DIR = OUT_DIR / "text"

WORDS_PER_MINUTE = 140      # a calm reading pace; Scripture and prayer read slower
TARGET_WORDS = 320          # about two and a quarter minutes
MAX_PASSAGES = 3
TIME_WORDS = re.compile(r"(?i)\b(tonight|good (morning|afternoon|evening)|this (morning|afternoon|evening))\b")

NAVY = colors.HexColor("#001b34")
GOLD = colors.HexColor("#c6922e")
CREAM = colors.HexColor("#f6eedf")
INK = colors.HexColor("#10253b")
MUTED = colors.HexColor("#56626b")

# After the lead passage, the voices to draw on first. Law and history comes
# last because its verses often start mid-story ("And he believed…").
VOICE_ORDER = ["The apostles", "Wisdom", "The prophets", "Jesus", "Law and history"]

ORDINALS = {"1": "First", "2": "Second", "3": "Third"}
REF = re.compile(r"^(?P<book>.+?) (?P<c1>\d+):(?P<v1>\d+)(?:-(?:(?P<c2>\d+):)?(?P<v2>\d+))?$")
# A reference inside the prose ("Read Romans 10:9"), which a voice would read as a time.
REF_IN_TEXT = re.compile(r"\b(?:[123] )?[A-Z][a-z]+(?: of [A-Z][a-z]+)? \d+:\d+(?:-(?:\d+:)?\d+)?")


def spoken_reference(ref):
    """'1 Peter 5:7' -> 'First Peter chapter 5, verse 7'; 'Psalms 55:22' -> 'Psalm 55, verse 22'."""
    m = REF.match(ref)
    book = m["book"]
    number, _, rest = book.partition(" ")
    if number in ORDINALS and rest:
        book = f"{ORDINALS[number]} {rest}"
    c1, v1, c2, v2 = m["c1"], m["v1"], m["c2"], m["v2"]
    if book in ("Psalms", "Psalm"):
        head = f"Psalm {c1}"
    else:
        head = f"{book} chapter {c1}"
    if c2 and c2 != c1:
        return f"{head}, verse {v1}, to chapter {c2}, verse {v2}"
    if not v2:
        return f"{head}, verse {v1}"
    if int(v2) == int(v1) + 1:
        return f"{head}, verses {v1} and {v2}"
    return f"{head}, verses {v1} to {v2}"


def for_speech(text):
    """Scripture as a voice should read it: small-capital LORD as Lord, tidy spaces."""
    text = re.sub(r"\bLORD(?=’|'|\b)", "Lord", text)
    text = re.sub(r"\bGOD\b", "God", text)
    text = text.replace("’S", "’s")
    return " ".join(text.split())


def prose_for_speech(text):
    """Hand-written text with its references spoken out."""
    return REF_IN_TEXT.sub(lambda m: spoken_reference(m.group(0)), text)


def words(text):
    return len(text.split())


def choose_passages(topic, base_words):
    """The lead passage, then others from voices not yet heard, while they fit."""
    teachings = topic["teachings"]
    chosen = [teachings[0]]
    total = base_words + words(teachings[0]["text"])
    rest = sorted(teachings[1:], key=lambda t: VOICE_ORDER.index(t["voice"]))
    for rest_pass in (True, False):          # first new voices, then any voice
        for t in rest:
            if len(chosen) >= MAX_PASSAGES or t in chosen:
                continue
            if rest_pass and t["voice"] in {c["voice"] for c in chosen}:
                continue
            if total + words(t["text"]) <= TARGET_WORDS:
                chosen.append(t)
                total += words(t["text"])
    if len(chosen) < 2:                      # always at least two passages
        spare = min((t for t in teachings if t not in chosen), key=lambda t: words(t["text"]))
        chosen.append(spare)
    order = {id(t): i for i, t in enumerate(teachings)}
    return sorted(chosen, key=lambda t: order[id(t)])


def script(topic):
    """The narration as a list of paragraphs."""
    say = prose_for_speech
    opening = [f"Today’s Question. {say(topic['question'])}", say(topic["summary"]), say(topic["guidance"])]
    closing = [
        f"Here is one thing to try. {say(topic['practice'])}",
        f"Let us pray. {say(topic['prayer']).rstrip()} Amen.",
        "You can read every passage on this question in Questions We All Ask, in Daily Grace.",
    ]
    base = sum(words(p) for p in opening + closing)
    passages = []
    for i, t in enumerate(choose_passages(topic, base)):
        lead = "The Bible says, in" if i == 0 else "And in"
        passages.append(f"{lead} {spoken_reference(t['reference'])}: {for_speech(t['text'])}")
    return opening + passages + closing


# ------------------------------------------------------------------ PDF

def styles():
    base = dict(fontName="Helvetica", textColor=INK, alignment=TA_LEFT)
    return {
        "eyebrow": ParagraphStyle("eyebrow", **{**base, "fontName": "Helvetica-Bold", "fontSize": 9,
                                                "leading": 12, "textColor": GOLD}),
        "title": ParagraphStyle("title", **{**base, "fontName": "Helvetica-Bold", "fontSize": 22,
                                            "leading": 27, "textColor": NAVY}),
        "h2": ParagraphStyle("h2", **{**base, "fontName": "Helvetica-Bold", "fontSize": 16,
                                      "leading": 20, "textColor": NAVY}),
        "body": ParagraphStyle("body", **{**base, "fontSize": 10, "leading": 14.5}),
        "meta": ParagraphStyle("meta", **{**base, "fontSize": 9, "leading": 12, "textColor": MUTED}),
        "cell": ParagraphStyle("cell", **{**base, "fontSize": 8.5, "leading": 10.5}),
        "cellhead": ParagraphStyle("cellhead", **{**base, "fontName": "Helvetica-Bold", "fontSize": 8.5,
                                                  "leading": 10.5, "textColor": NAVY}),
        "script": ParagraphStyle("script", **{**base, "fontSize": 12, "leading": 18, "spaceAfter": 9}),
    }


def esc(text):
    return html.escape(text, quote=False)


def minutes(n_words):
    seconds = round(n_words / WORDS_PER_MINUTE * 60)
    return f"{seconds // 60}:{seconds % 60:02d}"


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 12 * mm, "Daily Grace · Questions We All Ask · narration for text-to-speech")
    canvas.drawRightString(190 * mm, 12 * mm, f"Page {doc.page}")
    canvas.restoreState()


def build_pdf(entries, total_words):
    st = styles()
    doc = SimpleDocTemplate(str(PDF), pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                            topMargin=18 * mm, bottomMargin=20 * mm,
                            title="Questions We All Ask: narration scripts", author="Daily Grace")
    story = [
        Paragraph("DAILY GRACE · QUESTIONS WE ALL ASK", st["eyebrow"]),
        Paragraph("Narration scripts", st["title"]),
        Spacer(1, 6),
        Paragraph(
            f"One script for each of the {len(entries)} questions, for the play button on "
            f"“Today’s Question”. Each runs about two minutes at a calm pace "
            f"({WORDS_PER_MINUTE} words a minute); all of them together come to about "
            f"{round(total_words / WORDS_PER_MINUTE)} minutes.", st["body"]),
        Spacer(1, 4),
        Paragraph(
            "Paste one script at a time into the text-to-speech tool: everything below the grey "
            "“Audio file” line, from “Today’s Question” to the end of the page. The same text is in "
            "<b>tools/guidance/narration/text/</b> as one plain-text file per question, which "
            "pastes more cleanly than a PDF. Save each recording under the file name shown, so the "
            "page can find it by the question's id. Scripture is the King James Version, word for "
            "word, with LORD written as Lord so the voice does not spell it out.", st["body"]),
        Spacer(1, 10),
    ]
    rows = [[Paragraph(h, st["cellhead"]) for h in ("#", "Question", "Audio file", "Words", "Time")]]
    for n, (topic, paras) in enumerate(entries, 1):
        count = sum(words(p) for p in paras)
        rows.append([Paragraph(str(n), st["cell"]),
                     Paragraph(esc(topic["question"]), st["cell"]),
                     Paragraph(esc(f"{topic['id']}.webm"), st["cell"]),
                     Paragraph(str(count), st["cell"]),
                     Paragraph(minutes(count), st["cell"])])
    table = Table(rows, colWidths=[9 * mm, 74 * mm, 55 * mm, 17 * mm, 15 * mm], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), CREAM),
        ("LINEBELOW", (0, 0), (-1, 0), 0.8, GOLD),
        ("LINEBELOW", (0, 1), (-1, -1), 0.25, colors.HexColor("#d9d2c3")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(table)

    for n, (topic, paras) in enumerate(entries, 1):
        count = sum(words(p) for p in paras)
        story += [
            PageBreak(),
            Paragraph(esc(f"{n} OF {len(entries)} · {topic['section'].upper()}"), st["eyebrow"]),
            Paragraph(esc(topic["name"]), st["h2"]),
            Spacer(1, 3),
            Paragraph(esc(f"Audio file: {topic['id']}.webm  ·  {count} words  ·  about {minutes(count)}"),
                      st["meta"]),
            Spacer(1, 10),
        ]
        story += [Paragraph(esc(p), st["script"]) for p in paras]
    doc.build(story, onFirstPage=footer, onLaterPages=footer)


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    entries = [(t, script(t)) for t in data["topics"]]

    problems = []
    for topic, paras in entries:
        for m in TIME_WORDS.finditer(" ".join(paras)):
            problems.append(f"{topic['id']}: time of day '{m.group(0)}'; the audio plays at any hour")

    TEXT_DIR.mkdir(parents=True, exist_ok=True)
    for old in TEXT_DIR.glob("*.txt"):
        old.unlink()
    for topic, paras in entries:
        (TEXT_DIR / f"{topic['id']}.txt").write_text("\n\n".join(paras) + "\n", encoding="utf-8")

    total = sum(words(p) for _, paras in entries for p in paras)
    build_pdf(entries, total)

    counts = [sum(words(p) for p in paras) for _, paras in entries]
    print(f"{len(entries)} scripts, {min(counts)}-{max(counts)} words each "
          f"({minutes(min(counts))}-{minutes(max(counts))}), about {round(total / WORDS_PER_MINUTE)} minutes in all.")
    print(f"  {PDF.relative_to(ROOT)}")
    print(f"  {TEXT_DIR.relative_to(ROOT)}{Path('/')}<id>.txt")
    if problems:
        print(f"{len(problems)} problem(s):")
        for p in problems:
            print("  " + p)
        sys.exit(1)


if __name__ == "__main__":
    main()
