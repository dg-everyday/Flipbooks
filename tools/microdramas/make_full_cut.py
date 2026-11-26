"""Join a drama's rendered episodes into its full cut.

    python tools/microdramas/make_full_cut.py microdramas/01-framed

Reads <drama>/render/ep1.json … epN.json and their rendered ep1.mp4 … epN.mp4 and .srt, and writes
<drama>/render/full.mp4 and full.srt. Nothing is re-rendered, so the full cut is exactly the
episodes that were checked. Each episode keeps its hook and title card (they work as chapter
breaks). The "Part N →" end cards are cut out, except:

- an end card that carries sound (a door slam) keeps its black lead-in, so the sound still lands;
- the last episode keeps its whole end card.

The joined audio goes through a peak limiter (the episodes are already at -14 LUFS).
It prints the YouTube chapter list (the start of each part) for the description.
"""
import glob, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render_episode import FPS, layout   # noqa: E402


def srt_time(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


def parse_srt_time(s):
    h, m, rest = s.split(":")
    sec, ms = rest.split(",")
    return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000


def read_srt(path):
    cues = []
    with open(path, encoding="utf-8") as f:
        blocks = f.read().strip().split("\n\n")
    for block in blocks:
        lines = block.strip().split("\n")
        if len(lines) < 3:
            continue
        a, b = [parse_srt_time(x.strip()) for x in lines[1].split("-->")]
        cues.append((a, b, "\n".join(lines[2:])))
    return cues


def chapter_time(t):
    t = int(t)
    return f"{t // 60}:{t % 60:02}"


def main():
    drama = sys.argv[1]
    render_dir = os.path.join(drama, "render")
    eps = sorted(glob.glob(os.path.join(render_dir, "ep[0-9]*.json")),
                 key=lambda p: int(re.search(r"ep(\d+)\.json$", p).group(1)))
    if not eps:
        raise SystemExit("no epN.json found")

    parts = []                                   # (mp4, keep seconds, srt, title)
    for i, path in enumerate(eps):
        with open(path, encoding="utf-8") as f:
            edit = json.load(f)
        total = layout(edit, drama)
        last = edit["shots"][-1]
        keep = total
        if i < len(eps) - 1 and last.get("type") == "card":
            card_start = round(last["_t0"] * FPS) / FPS
            if last.get("sfx"):
                keep = card_start + round(last.get("black", 0.6) * FPS) / FPS
            else:
                keep = card_start
        title = next((s.get("sub", "") for s in edit["shots"] if s.get("type") == "title"), "")
        mp4 = path[:-5] + ".mp4"
        if not os.path.exists(mp4):
            raise SystemExit(f"missing {mp4}: render it first")
        parts.append((mp4, keep, path[:-5] + ".srt", title))

    inputs, chains, t, cues, chapters = [], [], 0.0, [], []
    for k, (mp4, keep, srt, title) in enumerate(parts):
        inputs += ["-i", mp4]
        frames = int(round(keep * FPS))          # cut on a frame count: a time cut can let one
        keep = frames / FPS                      # black frame of the end card through
        chains.append(f"[{k}:v]trim=end_frame={frames},setpts=PTS-STARTPTS[v{k}];"
                      f"[{k}:a]atrim=end_sample={round(keep * 48000)},asetpts=PTS-STARTPTS[a{k}]")
        chapters.append((t, title))
        for a, b, text in read_srt(srt):
            if a < keep:
                cues.append((t + a, t + min(b, keep), text))
        t += keep
    joined = "".join(f"[v{k}][a{k}]" for k in range(len(parts)))
    graph = (";".join(chains) + f";{joined}concat=n={len(parts)}:v=1:a=1[v][ac]"
             # joining re-encodes the audio, which pushes the episodes' peaks (about -0.7 dB) to 0 dB:
             # a peak limiter at about -2 dB keeps the full cut under the -1 dBTP target
             ";[ac]alimiter=limit=0.8:attack=2:release=60:level=disabled[a]")
    out = os.path.join(render_dir, "full.mp4")
    subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", graph,
                    "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                    "-pix_fmt", "yuv420p", "-r", str(FPS), "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
                    "-movflags", "+faststart", out], check=True)

    with open(os.path.join(render_dir, "full.srt"), "w", encoding="utf-8") as f:
        for n, (a, b, text) in enumerate(cues, 1):
            f.write(f"{n}\n{srt_time(a)} --> {srt_time(b)}\n{text}\n\n")

    print(f"wrote {out} ({t:.2f} s)")
    print("chapters:")
    for start, title in chapters:
        print(f"  {chapter_time(start)} {title}")


if __name__ == "__main__":
    main()
