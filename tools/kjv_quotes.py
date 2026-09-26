"""Checks that text in single quotes is verbatim KJV, for the study-page builds
(tools/flora-fauna, tools/supernaturals).

In the hand-written content, 'single quotes' mean Scripture: every fragment
between them (split at …) must appear word for word in assets/db/dailygrace.db.
Only the first letter may differ in case, so a quote can start a sentence.
Glosses, translations and phrases that are not KJV go in “double quotes”.
Fragments shorter than MIN_LENGTH are not checked.
"""
import re

MIN_LENGTH = 8
QUOTE = re.compile(r"(?:(?<=\s)|^|(?<=\())'(.+?)'(?=[\s,.;:)?!]|$)")


def _norm(s):
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"\s+", " ", s)


class Quotes:
    def __init__(self, db):
        self.text = _norm(" ".join(r[0] for r in db.execute("select text from verses order by docid")))
        self.lower = self.text.lower()

    def problems(self, text):
        """Yield a description of each quoted fragment that is not in the KJV."""
        for quote in QUOTE.findall(text or ""):
            for frag in quote.split("…"):
                frag = _norm(frag.strip(" ,.;:?!'"))
                if len(frag) < MIN_LENGTH or frag in self.text:
                    continue
                i = self.lower.find(frag.lower())
                if i < 0:
                    yield f"'{frag}' is not in the KJV"
                elif self.text[i + 1:i + len(frag)] != frag[1:]:
                    yield f"'{frag}' should read '{self.text[i:i + len(frag)]}'"
