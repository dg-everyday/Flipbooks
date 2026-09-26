# -*- coding: utf-8 -*-
"""Build the PDFs for a scripture story book.

    python tools/stories/build.py <slug>                    every PDF for one story
    python tools/stories/build.py <slug> --only storybook   just the named ones (comma-separated)
    python tools/stories/build.py --all                     every PDF for every story

<slug> is the name of a file in tools/stories/content/ without ".py" (e.g. a-great-way-off). Output
goes to stories/<slug>/ (git-ignored):

    book        <slug>.pdf                story, characters, comic script, fidelity check
    script      <slug>-script.pdf         the artist's script with per-panel image prompts
    prompts     <slug>-image-prompts.pdf  one document for a multi-page comic generator
    cover       <slug>-cover-prompt.pdf   one cover image, title as its only text
    storybook   <slug>-storybook.pdf      the story text set as an A4 reader's book

Run tools/stories/check.py on a story before building it.
"""
import argparse
import importlib.util
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
CONTENT = os.path.join(HERE, "content")
sys.path.insert(0, os.path.join(HERE, "lib"))

TARGETS = ("book", "script", "prompts", "cover", "storybook")


def load(slug):
    path = os.path.join(CONTENT, slug + ".py")
    if not os.path.exists(path):
        raise SystemExit("no content file: %s" % os.path.relpath(path, ROOT))
    spec = importlib.util.spec_from_file_location(slug.replace("-", "_"), path)
    C = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(C)
    if not hasattr(C, "strip_book"):
        C.strip_book = lambda v: re.sub(r"^[A-Za-z0-9\s]+ (?=\d)", "", v)
    return C


def slugs():
    return sorted(f[:-3] for f in os.listdir(CONTENT) if f.endswith(".py") and not f.startswith("_"))


def build(slug, only):
    import bookgen
    import make_cover_pdf
    import make_prompt_pdf
    import make_reader_pdf
    from cast import CAST
    from covers import COVERS

    C = load(slug)
    out = os.path.join(ROOT, "stories", slug)
    os.makedirs(out, exist_ok=True)
    name = lambda suffix: os.path.join(out, slug + suffix)
    for t in only:
        if t == "book":
            bookgen.build(C, "book", name(".pdf"))
        elif t == "script":
            bookgen.build(C, "script", name("-script.pdf"))
        elif t in ("prompts", "cover") and slug not in CAST:
            print("skipped %s: no character sheet for %r in lib/cast.py" % (t, slug))
        elif t == "prompts":
            make_prompt_pdf.build(C, slug, name("-image-prompts.pdf"))
        elif t == "cover" and slug not in COVERS:
            print("skipped cover: no cover concept for %r in lib/covers.py" % slug)
        elif t == "cover":
            make_cover_pdf.build(C, slug, name("-cover-prompt.pdf"))
        elif t == "storybook":
            make_reader_pdf.build(C, name("-storybook.pdf"))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug", nargs="?", help="story to build (a file name in tools/stories/content)")
    ap.add_argument("--all", action="store_true", help="build every story")
    ap.add_argument("--only", help="comma-separated subset of: " + ", ".join(TARGETS))
    args = ap.parse_args()
    only = TARGETS if not args.only else tuple(x.strip() for x in args.only.split(","))
    bad = [t for t in only if t not in TARGETS]
    if bad:
        raise SystemExit("unknown target(s): %s" % ", ".join(bad))
    if args.all:
        for s in slugs():
            build(s, only)
    elif args.slug:
        build(args.slug, only)
    else:
        ap.error("give a story slug or --all. Stories: " + ", ".join(slugs()))


if __name__ == "__main__":
    main()
