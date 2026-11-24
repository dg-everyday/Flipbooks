"""Split one TTS take that spans several shots into one file per shot.

    python tools/microdramas/split_take.py microdramas/01-framed/audio/wav/ep2-s05-09-joseph.wav
    python tools/microdramas/split_take.py <take.wav> --at 4.12,8.30,14.95,17.60

The take's name says which shots it covers and who speaks (ep2-s05-09-joseph = shots 5 to 9,
Joseph). Its text comes from the episode's script/epN-vo.txt, on the line that starts with the
same shot range ("s05-09 [joseph] ..."), with " | " where one shot ends and the next begins.

Where the cuts go, best method first:
  1. Words: a small speech recogniser (Whisper tiny, downloaded once) gives word timings; each cut
     goes in the gap between the last word of one part and the first word of the next, even when
     the voice runs straight through without pausing.
  2. Punctuation: the voice's pauses are matched in order to the commas, semicolons and colons,
     and the cuts go at the marks that end a part.
  3. Text length: the pause nearest to where the boundary should fall by the share of the text.
Check the printed wpm column (a part far faster or slower than the rest is suspect) and listen. It writes
ep2-s05-joseph.wav ... ep2-s09-joseph.wav beside the take, each with up to 0.3 s of silence at its
head and tail, and prints the cuts with each part's speaking rate: a part far faster or slower
than the others means a cut landed in the wrong pause. Then listen, and if needed pass the cut
times yourself with --at (seconds into the take). The take itself is left as it is.
"""
import os, re, subprocess, sys, wave

import numpy as np

PAD = 0.3            # silence kept at the head and tail of each part
MIN_PAUSE = 0.10     # shortest gap that counts as a pause


def load(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries",
                          "stream=sample_rate", "-of", "csv=p=0", path],
                         capture_output=True, text=True, check=True)
    sr = int(out.stdout.strip())
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16), sr


def pauses(samples, sr):
    """Silent runs inside the speech, as (start, end) seconds, plus where the speech starts and ends."""
    hop = sr // 100
    frames = len(samples) // hop
    rms = np.array([np.sqrt(np.mean(samples[i * hop:(i + 1) * hop].astype(np.float64) ** 2))
                    for i in range(frames)])
    quiet = rms < rms.max() * 10 ** (-40 / 20)
    voiced = np.nonzero(~quiet)[0]
    first, last = voiced[0], voiced[-1]
    runs, start = [], None
    for i in range(first, last + 1):
        if quiet[i] and start is None:
            start = i
        elif not quiet[i] and start is not None:
            if (i - start) / 100 >= MIN_PAUSE:
                runs.append((start / 100, i / 100))
            start = None
    return runs, first / 100, (last + 1) / 100


def text_parts(take_path):
    name = os.path.splitext(os.path.basename(take_path))[0]
    m = re.fullmatch(r"ep(\d+)-s(\d+)-(\d+)-(\w+)", name)
    if not m:
        raise SystemExit(f"{name}: expected a name like ep2-s05-09-joseph")
    ep, a, b, role = m.groups()
    vo = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(take_path)))),
                      "script", f"ep{ep}-vo.txt")
    key = f"s{a}-{b}"
    with open(vo, encoding="utf-8") as f:
        for line in f:
            if line.startswith(key + " "):
                parts = [p.strip() for p in line.split("] ", 1)[1].split(" | ")]
                break
        else:
            raise SystemExit(f"no line starting with {key} in {vo}")
    shots = [f"{int(n):02}" for n in range(int(a), int(b) + 1)]
    if len(parts) != len(shots):
        raise SystemExit(f"{len(parts)} parts in the text for {len(shots)} shots ({key})")
    return ep, role, shots, parts


def punctuation(parts):
    """For each comma, semicolon, colon or full stop inside the speech (not the last one), whether
    it ends a shot's part."""
    marks = []
    for pi, part in enumerate(parts):
        text = part.rstrip()
        for m in re.finditer(r"[,;:.?!](?=\s|$)", text):
            ends_part = m.end() == len(text)
            if pi == len(parts) - 1 and ends_part:
                continue
            marks.append(ends_part)
    return marks


def norm_words(text):
    return re.sub(r"[^a-z ]", "", text.lower().replace("-", " ")).split()


def asr_words(path):
    """Word timings from a small speech recogniser (Whisper tiny, on the CPU)."""
    try:
        from transformers import pipeline
    except ImportError:
        return None
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1",
                          "-ar", "16000", "-"], capture_output=True, check=True).stdout
    asr = pipeline("automatic-speech-recognition", model="openai/whisper-tiny.en", device="cpu")
    out = asr({"raw": np.frombuffer(raw, np.float32), "sampling_rate": 16000}, return_timestamps="word")
    words = []
    for chunk in out["chunks"]:
        start, end = chunk["timestamp"]
        for w in norm_words(chunk["text"]):
            words.append((w, start, end if end is not None else start + 0.3))
    return words


def dip_near(samples, sr, a, b, target):
    """Where a cut can go inside running speech: the quiet dip between a and b seconds nearest to
    target. (A plosive such as the t in "but" makes a dip inside a word too, so the dip nearest the
    gap between the two words' starts wins, not simply the quietest.)"""
    hop = sr // 100
    i0, i1 = max(int(a * sr) // hop, 1), min(int(b * sr) // hop, len(samples) // hop - 2)
    if i1 <= i0:
        return target
    peak = max(float(np.abs(samples).max()), 1.0)
    level = np.array([20 * np.log10(max(np.sqrt(np.mean(samples[i * hop:(i + 1) * hop].astype(np.float64) ** 2)), 1) / peak)
                      for i in range(i0 - 1, i1 + 2)])
    level = np.convolve(level, np.ones(3) / 3, mode="same")
    dips = [i for i in range(1, len(level) - 1)
            if level[i] <= level[i - 1] and level[i] <= level[i + 1] and level[i] < level.max() - 12]
    if not dips:
        return target
    best = min(dips, key=lambda i: abs((i0 - 1 + i + 0.5) * hop / sr - target))
    return (i0 - 1 + best + 0.5) * hop / sr


def cuts_by_words(samples, sr, parts, words, runs):
    """Line the recognised words up with the script and cut in the quietest moment between the
    last word of one part and the first word of the next (in the pause there, if there is one)."""
    import difflib
    script, starts = [], []
    for part in parts:
        starts.append(len(script))
        script.extend(norm_words(part))
    heard = [w for w, _, _ in words]
    match = {}
    for a, b, n in difflib.SequenceMatcher(None, script, heard, autojunk=False).get_matching_blocks():
        for k in range(n):
            match[a + k] = b + k
    cuts = []
    for first in starts[1:]:
        nxt = next((match[i] for i in range(first, first + 3) if i in match), None)
        prv = next((match[i] for i in range(first - 1, first - 4, -1) if i in match), None)
        if nxt is None or prv is None or prv >= nxt:
            return None
        # Whisper's word times run late by a similar amount for neighbouring words, so the middle
        # of the two words' starts sits close to the real gap between them.
        target = (words[prv][1] + words[nxt][1]) / 2
        lo, hi = words[prv][1], words[nxt][2]
        inside = [(s, e) for s, e in runs if s < words[nxt][1] + 0.1 and e > words[prv][2] - 0.1]
        if inside:
            s, e = min(inside, key=lambda r: abs((r[0] + r[1]) / 2 - target))
            cuts.append((s + e) / 2)
        else:
            cuts.append(dip_near(samples, sr, lo, hi, target))
    return cuts if cuts == sorted(cuts) else None


def merge_blips(runs, gap=0.12):
    """Join pauses split by a tiny sound (a click or a breath) into one."""
    merged = []
    for s, e in runs:
        if merged and s - merged[-1][1] < gap:
            merged[-1] = (merged[-1][0], e)
        else:
            merged.append((s, e))
    return merged


def mark_times(parts, start, end):
    """Where each punctuation mark should fall, by the share of the letters spoken before it."""
    text = " ".join(p.strip() for p in parts)
    total = len(re.sub(r"[^A-Za-z]", "", text))
    times = []
    for pi, part in enumerate(parts):
        before = " ".join(p.strip() for p in parts[:pi])
        for m in re.finditer(r"[,;:.?!](?=\s|$)", part.rstrip()):
            if pi == len(parts) - 1 and m.end() == len(part.rstrip()):
                continue
            n = len(re.sub(r"[^A-Za-z]", "", before + " " + part[:m.start()]))
            times.append(start + (end - start) * n / total)
    return times


def cuts_by_punctuation(runs, parts, start, end):
    """A TTS voice pauses at most punctuation. Match the marks to the pauses in order (a voice may
    run through a comma, and may breathe where there is none), and cut at the marks that end a
    part. Every part boundary must get a pause; returns None when one cannot."""
    if any(not re.search(r"[,;:.?!]$", p.rstrip()) for p in parts[:-1]):
        return None
    marks = punctuation(parts)
    expected = mark_times(parts, start, end)
    mids = [(s + e) / 2 for s, e in runs]
    skip_mark, skip_pause = 1.0, 0.3
    inf = float("inf")
    k_n, r_n = len(marks), len(mids)
    cost = [[inf] * (r_n + 1) for _ in range(k_n + 1)]
    step = [[None] * (r_n + 1) for _ in range(k_n + 1)]
    cost[0][0] = 0.0
    for k in range(k_n + 1):
        for r in range(r_n + 1):
            here = cost[k][r]
            if here == inf:
                continue
            if r < r_n and here + skip_pause < cost[k][r + 1]:
                cost[k][r + 1], step[k][r + 1] = here + skip_pause, "pause"
            if k < k_n and not marks[k] and here + skip_mark < cost[k + 1][r]:
                cost[k + 1][r], step[k + 1][r] = here + skip_mark, "mark"
            if k < k_n and r < r_n:
                c = here + abs(expected[k] - mids[r])
                if c < cost[k + 1][r + 1]:
                    cost[k + 1][r + 1], step[k + 1][r + 1] = c, "match"
    if cost[k_n][r_n] == inf:
        return None
    cuts, k, r = [], k_n, r_n
    while k or r:
        move = step[k][r]
        if move == "match":
            if marks[k - 1]:
                cuts.append(mids[r - 1])
            k, r = k - 1, r - 1
        elif move == "mark":
            k -= 1
        else:
            r -= 1
    return sorted(cuts)


def choose_cuts(runs, start, end, parts):
    letters = [len(re.sub(r"[^A-Za-z]", "", p)) for p in parts]
    total = sum(letters)
    cuts, used, before = [], set(), 0
    for n in letters[:-1]:
        before += n
        expected = start + (end - start) * before / total
        candidates = [(abs((s + e) / 2 - expected) - 0.6 * (e - s), i)
                      for i, (s, e) in enumerate(runs)
                      if i not in used and (not cuts or (s + e) / 2 > cuts[-1])]
        if not candidates:
            raise SystemExit("not enough pauses in the take to place every cut; use --at")
        _, i = min(candidates)
        used.add(i)
        cuts.append((runs[i][0] + runs[i][1]) / 2)
    return cuts


def trim(samples, sr, a, b):
    """The part between a and b (seconds), keeping at most PAD of silence at each end."""
    seg = samples[int(a * sr):int(b * sr)]
    level = np.abs(seg.astype(np.int32))
    loud = np.nonzero(level > max(level.max(), 1) * 10 ** (-40 / 20))[0]
    if len(loud) == 0:
        return seg
    lo = max(loud[0] - int(PAD * sr), 0)
    hi = min(loud[-1] + int(PAD * sr), len(seg))
    seg = seg[lo:hi].astype(np.float32)
    fade = min(int(0.01 * sr), len(seg) // 2)    # no click where a cut falls inside a phrase
    if fade > 0:
        ramp = np.linspace(0, 1, fade, dtype=np.float32)
        seg[:fade] *= ramp
        seg[-fade:] *= ramp[::-1]
    return seg.astype(np.int16)


def main():
    take = sys.argv[1]
    samples, sr = load(take)
    ep, role, shots, parts = text_parts(take)
    runs, start, end = pauses(samples, sr)
    runs = merge_blips(runs)
    if "--at" in sys.argv:
        cuts = [float(x) for x in sys.argv[sys.argv.index("--at") + 1].split(",")]
        if len(cuts) != len(shots) - 1:
            raise SystemExit(f"--at needs {len(shots) - 1} times for {len(shots)} shots")
    else:
        cuts = None
        words = asr_words(take)
        if words:
            cuts = cuts_by_words(samples, sr, parts, words, runs)
            if cuts is not None:
                print("  cuts placed between the recognised words")
        if cuts is None:
            cuts = cuts_by_punctuation(runs, parts, start, end)
            if cuts is not None:
                print("  pauses matched to the punctuation (check the wpm column, and listen)")
        if cuts is None:
            print("  could not give every part boundary its own pause; placing cuts by text "
                  "length instead (check the wpm column, and listen)")
            cuts = choose_cuts(runs, start, end, parts)
    bounds = [0.0] + cuts + [len(samples) / sr]
    folder = os.path.dirname(os.path.abspath(take))
    print(f"take: {len(samples) / sr:.2f} s, speech {start:.2f}-{end:.2f}, {len(runs)} pauses")
    for shot, text, a, b in zip(shots, parts, bounds, bounds[1:]):
        seg = trim(samples, sr, a, b)
        out = os.path.join(folder, f"ep{ep}-s{shot}-{role}.wav")
        with wave.open(out, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sr)
            w.writeframes(seg.tobytes())
        words = len(text.split())
        speech = max(len(seg) / sr - 2 * PAD, 0.1)
        print(f"  s{shot}  {a:6.2f}-{b:6.2f}  {len(seg) / sr:5.2f} s  {words * 60 / speech:4.0f} wpm"
              f"  {os.path.basename(out)}  \"{text[:48]}{'...' if len(text) > 48 else ''}\"")


if __name__ == "__main__":
    main()
