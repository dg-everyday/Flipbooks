# -*- coding: utf-8 -*-
"""Modern-English lettering for the comic prompts.

The content files letter every panel in the King James Version, with the verse after each quotation
("(v.12)", "(11:2)"). That stays the text of the study book (<slug>.pdf), and check.py holds it to the
KJV. The two documents that go to the comic artist, the artist's script (<slug>-script.pdf) and the
image prompts (<slug>-image-prompts.pdf), letter the panels in plain modern English instead, with no
verse references.

The modern wording for a story lives in tools/stories/modern/<slug>.py:

    MODERN = {
        "“Father, give me the portion of goods that falleth to me.”":
            "“Father, give me my share of the property.”",
        ...
    }

Each key is the text of one lettering line after its speaker label ("YOUNGER SON:", "CAPTION (lower):")
and without its verse reference, with HTML entities written as the characters they stand for. The
label is kept as it is: only the words change. An empty value drops the line (for a caption that only
glossed an old word the modern line no longer uses); a panel left with no lines gets NO LETTERING.
Any line may have an entry, including narration that quotes the KJV without quotation marks. A line
with no entry is used as it stands, less its verse reference, unless it still reads as King James
English (a quotation, or a word such as "thou" or "unto"): then the build stops and lists it, so no
old wording reaches the artist unnoticed.

A story may also set HOWTO, a list replacing the "How to read this script" items of the artist's
script; by default only the item about verse numbers in brackets is replaced (see HOWTO_REFS).
"""
import html
import importlib.util
import os
import re
import types

HERE = os.path.dirname(os.path.abspath(__file__))
MODERN_DIR = os.path.normpath(os.path.join(HERE, "..", "modern"))

# A verse reference after a quotation: (v.12)  (vv.3–4)  (11:2)  (2:1–3)  (21:5, 6)  (Genesis 3:15)
REF = re.compile(r"\s*\((?:vv?\.\s*\d[^()]*|(?:[1-3] )?[A-Z][a-z]+(?: of [A-Z][a-z]+)? \d+:\d[^()]*|\d+:\d[^()]*)\)")
# "NAME:", "CAPTION (lower):", "THE LORD (off):", "JESUS (caption):"
LABEL = re.compile(r"^((?:[A-Z][A-Z0-9'’.,\- ]*?)(?:\s*\([^()]*\))?):\s*")
# Words that give a line away as King James English.
ARCHAIC = re.compile(
    r"\b(thou|thee|thy|thine|ye|hath|hast|doth|dost|art|wast|wert|shalt|wilt|unto|saith|spake|"
    r"hither|thither|whither|wherefore|verily|lo|nay|yea|hitherto|peradventure|thereof|therein|"
    r"betwixt|ere|wot|wist|sware|brake|aught|naught|twain|holpen|lest|shew|shewed|shewing|"
    r"[a-z]+eth|[a-z]+est)\b", re.I)
# -eth and -est words that are ordinary modern English.
MODERN_WORDS = {
    "best", "rest", "west", "east", "least", "test", "nest", "chest", "guest", "quest", "vest", "jest",
    "zest", "pest", "crest", "forest", "honest", "modest", "harvest", "interest", "request", "protest",
    "contest", "arrest", "invest", "suggest", "digest", "manifest", "earnest", "priest", "breast",
    "beast", "feast", "yeast", "biggest", "largest", "latest", "greatest", "oldest", "youngest", "eldest",
    "highest", "nearest", "dearest", "darkest", "longest", "strongest", "smallest", "hardest", "fullest",
    "finest", "worst", "first", "last", "most", "almost", "unrest", "behest", "conquest", "tempest",
    "teeth", "beth", "seth", "japheth", "nazareth", "elizabeth", "elisabeth", "gath", "heth", "zereth",
    "shibboleth", "bethel", "bath", "saddest", "wisest", "newest", "lowest", "closest", "deepest",
    "kindest", "richest", "poorest", "hottest", "coldest", "fastest", "slowest", "quietest", "safest",
    "bravest", "truest", "purest", "holiest", "loveliest", "weakest", "lightest", "brightest",
    "loudest", "softest", "sweetest", "cleanest", "simplest", "plainest", "sharpest", "hottest",
}
HOWTO_REFS = re.compile(r"in brackets", re.I)


def plain(s):
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def is_archaic(text):
    if "“" in text or "”" in text or '"' in text:
        return True
    return any(m.group(0).lower() not in MODERN_WORDS for m in ARCHAIC.finditer(re.sub(r"<[^>]+>", "", text)))


def load(slug):
    path = os.path.join(MODERN_DIR, slug + ".py")
    if not os.path.exists(path):
        return None
    spec = importlib.util.spec_from_file_location("modern_" + slug.replace("-", "_"), path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def split(line):
    """(label, body) of one lettering line; label is "" for NO LETTERING and the like."""
    m = LABEL.match(line)
    return (m.group(1), line[m.end():]) if m else ("", line)


def apply(C, slug, quiet=False):
    """A copy of content module C whose PAGES and HOWTO are the modern-English prompt version."""
    mod = load(slug)
    table = {plain(k): v for k, v in (mod.MODERN if mod else {}).items()}
    used, missing = set(), []

    def line_for(line, where):
        label, body = split(line.strip())
        body = plain(REF.sub("", body))
        if not label and body == "NO LETTERING.":
            return body
        if body in table:
            used.add(body)
            body = table[body]
            if not body:
                return None
        elif is_archaic(body):
            missing.append("%s: %s" % (where, body))
        return "%s: %s" % (label, body) if label else body

    pages = []
    for title, verses, panels in C.PAGES:
        new = []
        for n, (shot, action, lettering) in enumerate(panels, 1):
            where = "%s panel %d" % (plain(title).split(" — ")[0].split(" - ")[0], n)
            lines = [line_for(x, where) for x in lettering.split("\n") if x.strip()]
            lines = [x for x in lines if x is not None] or ["NO LETTERING."]
            new.append((shot, action, "\n".join(lines)))
        pages.append((title, verses, new))

    if missing:
        raise SystemExit("%s: %d lettering line(s) still read as King James English; give each a modern "
                         "version in %s:\n  %s" % (slug, len(missing),
                                                   os.path.relpath(os.path.join(MODERN_DIR, slug + ".py")),
                                                   "\n  ".join(missing)))
    unused = sorted(set(table) - used)
    if unused and not quiet:
        print("%s: %d modern line(s) match no lettering (the content file changed?):\n  %s"
              % (slug, len(unused), "\n  ".join(unused)))

    M = types.ModuleType(C.__name__ + "_modern")
    M.__dict__.update(C.__dict__)
    M.PAGES = pages
    if mod is not None and hasattr(mod, "HOWTO"):
        M.HOWTO = list(mod.HOWTO)
    elif hasattr(C, "HOWTO"):
        M.HOWTO = [HOWTO_LETTERING if HOWTO_REFS.search(t) else t for t in C.HOWTO]
    return M


HOWTO_LETTERING = (
    "<b>The lettering is in plain modern English.</b> Words from the Bible are rendered closely from "
    "the King James Version, whose exact text is in the study book; letter them as written here. "
    "Captions are narration written for this adaptation. There are no verse references to letter.")
