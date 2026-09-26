"""Split each spoken-story script into parts of about four minutes read aloud.

Reads stories/<slug>/<slug>-speech.txt and writes stories/<slug>/<slug>-speech-part-<n>.txt beside it.
Parts break only between paragraphs, and are balanced so none is left as a short tail.

    python tools/stories/chunk_speech.py <slug>
    python tools/stories/chunk_speech.py --all
    python tools/stories/chunk_speech.py --all --minutes 4 --wpm 140
"""
import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def split_speech(slug, minutes, wpm):
    folder = ROOT / "stories" / slug
    path = folder / f"{slug}-speech.txt"
    if not path.exists():
        print(f"== {slug}: no speech")
        return
    paras = [p.strip() for p in re.split(r"\n\s*\n", path.read_text(encoding="utf-8")) if p.strip()]
    title, body = paras[0], paras[1:]
    counts = [len(p.split()) for p in body]
    total = sum(counts)
    parts = max(1, round(total / (minutes * wpm)))

    # Cut at the paragraph boundary nearest each even share of the words.
    running, cum = 0, []
    for c in counts:
        running += c
        cum.append(running)
    cuts = [0]
    for k in range(1, parts):
        goal = total * k / parts
        best = min(range(cuts[-1] + 1, len(body) - (parts - k) + 1), key=lambda i: abs(cum[i - 1] - goal))
        cuts.append(best)
    cuts.append(len(body))

    for old in folder.glob(f"{slug}-speech-part-*.txt"):
        old.unlink()
    print(f"== {slug}: {total} words, {parts} part{'s' if parts > 1 else ''}")
    for n, (a, b) in enumerate(zip(cuts, cuts[1:]), 1):
        chunk = body[a:b]
        words = sum(counts[a:b])
        head = f"{title} — Part {n} of {parts}" if parts > 1 else title
        out = folder / f"{slug}-speech-part-{n}.txt"
        out.write_text("\n\n".join([head, *chunk]) + "\n", encoding="utf-8")
        print(f"  part {n}: {words:5d} words  ~{words / wpm:.1f} min  {out.name}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug", nargs="?")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--minutes", type=float, default=4)
    ap.add_argument("--wpm", type=float, default=140, help="speaking pace in words per minute")
    args = ap.parse_args()
    if args.all:
        slugs = sorted(p.parent.name for p in (ROOT / "stories").glob("*/*-speech.txt"))
    elif args.slug:
        slugs = [args.slug]
    else:
        ap.error("give a slug or --all")
    for slug in slugs:
        split_speech(slug, args.minutes, args.wpm)


if __name__ == "__main__":
    sys.exit(main())
