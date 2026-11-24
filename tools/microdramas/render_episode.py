"""Render one microdrama episode (a 9:16 motion comic) from its edit list.

    python tools/microdramas/render_episode.py microdramas/01-framed/render/ep1.json [--shots 1,16]

The edit list (JSON) names, shot by shot, the still(s), the camera move, the narration clip,
the caption, the effects and the sound effects, plus the music cues. Paths in it are relative to
the drama folder (the parent of render/). It writes, beside the edit list:

    ep1.mp4   1080x1920, 30 fps, H.264 + AAC, loudness -14 LUFS / -1 dBTP
    ep1.srt   the burned-in captions as a subtitle file

and the narration-only stem to <drama>/audio/ep1-vo-stem.wav. With --shots it renders only
those shots, silent, to render/<name>-preview.mp4 (quick to check a move or an effect).

Shot length is the narration length plus a lead-in (vo_at) and a tail, unless the shot gives
"dur". Times inside a shot are seconds from the shot's start, or "vo+1.2" for seconds from the
start of its narration. Times in music cues are "s8" (start of shot 8), "e8" (end of shot 8),
optionally with +/- seconds ("s8+1.5", "e14-0.6").

Pictures
  move      {"z": [z0, z1], "c": [[x0, y0], [x1, y1]], "ease", "span", "shake"}: camera zoom and
            centre (fractions of the still) from the start of the layer to its end.
  parallax  2.5D depth from render/depth/<still>.png (made by make_depth.py): near things slide
            and grow more than far things as the camera moves. Automatic; "par": {"x", "y",
            "dolly"} overrides it, "par": false turns it off.
  fx        effects on the frame (positions are fractions of the 9:16 frame):
            particles  dust, sand, glints: region, n, size, vel, color, alpha, twinkle
            flicker    firelight: at, radius, amount, color
            haze       heat shimmer: band [y0, y1], amp, speed
            drift      the far background (sky) slides slowly: max_depth, speed
  clips     an AI-animated clip at <drama>/clips/<still name>.mp4 replaces the still
            automatically (camera move still applies; parallax and fx do not). A short clip is
            slowed to fill its shot. "clip_at": "vo+0" instead starts the clip with the shot's
            voice at real speed (for lip-sync clips made from that voice's recording).
            "still_only": true keeps the still even when a clip exists.
"""
import json, math, os, re, subprocess, sys, tempfile, zlib
from multiprocessing import Pool

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS, SR = 1080, 1920, 30, 48000
FONTS = "C:/Windows/Fonts/"
CAPTION_BOTTOM = 1450          # captions sit above the platform UI at the bottom
CAPTION_WIDTH = 860            # and clear of the button column on the right
UPSCALE = 2                    # stills are upscaled once so slow zooms stay sharp


# ---------------------------------------------------------------- timing

def probe_duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", path], capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def layout(edit, root):
    t = 0.0
    for shot in edit["shots"]:
        vo_len = 0.0
        if shot.get("vo"):
            shot["_vo_path"] = os.path.join(root, shot["vo"])
            vo_len = probe_duration(shot["_vo_path"])
        shot["_vo_len"] = vo_len
        lead = shot.get("vo_at", 0.25)
        if "dur" in shot:
            dur = shot["dur"]
        else:
            dur = max(shot.get("min", 0.0), lead + vo_len + shot.get("tail", 0.35))
        shot["_t0"], shot["_dur"] = t, dur
        t += dur
    return t


def local_time(shot, value):
    """A time inside a shot: seconds, or 'vo+x' for seconds after its narration starts."""
    if isinstance(value, str) and value.startswith("vo"):
        return shot.get("vo_at", 0.25) + float(value[2:] or 0)
    return float(value)


def global_time(edit, ref):
    m = re.fullmatch(r"([se])(\w+?)([+-][\d.]+)?", ref)
    if not m:
        raise SystemExit(f"bad time reference: {ref}")
    shot = next(s for s in edit["shots"] if str(s["id"]) == m.group(2))
    base = shot["_t0"] if m.group(1) == "s" else shot["_t0"] + shot["_dur"]
    return base + (float(m.group(3)) if m.group(3) else 0.0)


def frame_range(shot):
    return int(round(shot["_t0"] * FPS)), int(round((shot["_t0"] + shot["_dur"]) * FPS))


def ease(p, kind):
    p = min(max(p, 0.0), 1.0)
    if kind == "linear":
        return p
    if kind == "out":
        return 1 - (1 - p) ** 3
    if kind == "in":
        return p ** 3
    return 0.5 - 0.5 * math.cos(math.pi * p)


# ---------------------------------------------------------------- stills, depth, clips

def apply_grade(arr, grade):
    """Colour grade on a float32 RGB array (stills and clips alike)."""
    if grade == "flashforward":              # cold, drained: the prison is the future
        grey = arr.mean(axis=2, keepdims=True)
        return (grey + (arr - grey) * 0.35) * np.array([0.82, 0.90, 1.0], np.float32) * 0.92
    if grade == "title":
        return cv2.GaussianBlur(arr, (0, 0), 14 * UPSCALE / 2) * 0.45
    return arr


class Assets:
    def __init__(self, root):
        self.root = root
        self.stills = {}

    def still(self, name, grade=None):
        key = (name, grade)
        if key not in self.stills:
            img = Image.open(os.path.join(self.root, name)).convert("RGB")
            img = img.resize((img.width * UPSCALE, img.height * UPSCALE), Image.LANCZOS)
            arr = apply_grade(np.asarray(img).astype(np.float32), grade)
            depth = None
            dpath = os.path.join(self.root, "render", "depth",
                                 os.path.splitext(os.path.basename(name))[0] + ".png")
            if grade != "title" and os.path.exists(dpath):
                d = np.asarray(Image.open(dpath)).astype(np.float32) / 65535.0
                d = cv2.resize(d, (img.width, img.height), interpolation=cv2.INTER_CUBIC)
                depth = cv2.GaussianBlur(d, (0, 0), 6 * UPSCALE)   # soft edges stretch, not tear
            self.stills[key] = (np.clip(arr, 0, 255).astype(np.uint8), depth,
                                float(np.median(depth)) if depth is not None else 0.5)
        return self.stills[key]

    def clip_for(self, name):
        path = os.path.join(self.root, "clips", os.path.splitext(os.path.basename(name))[0] + ".mp4")
        return path if os.path.exists(path) else None


class ClipReader:
    """Reads an animated clip in order at its own frame rate and blends between neighbouring
    frames, so a 24 fps clip plays smoothly at 30 fps (or slowed down). Holds the last frame."""

    def __init__(self, path):
        out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                              "stream=width,height,r_frame_rate:format=duration", "-of", "json", path],
                             capture_output=True, text=True, check=True)
        info = json.loads(out.stdout)
        stream = info["streams"][0]
        self.w, self.h = stream["width"], stream["height"]
        num, den = stream["r_frame_rate"].split("/")
        self.fps = float(num) / float(den)
        self.duration = float(info["format"]["duration"])
        self.proc = subprocess.Popen(["ffmpeg", "-v", "error", "-i", path, "-f", "rawvideo",
                                      "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
        self.index, self.prev, self.cur, self.ended = -1, None, None, False

    def _advance(self):
        raw = self.proc.stdout.read(self.w * self.h * 3)
        if len(raw) < self.w * self.h * 3:
            self.ended = True
            return
        self.prev = self.cur
        self.cur = np.frombuffer(raw, np.uint8).reshape(self.h, self.w, 3).astype(np.float32)
        self.index += 1

    def get(self, fi):
        """The frame at fractional index fi (only ever increasing)."""
        while not self.ended and self.index < math.floor(fi) + 1:
            self._advance()
        if self.ended or self.prev is None:
            return self.cur
        frac = min(max(fi - (self.index - 1), 0.0), 1.0)
        return self.prev + (self.cur - self.prev) * frac


# ---------------------------------------------------------------- camera and effects

GRID_U, GRID_V = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))


def camera(move, p, t):
    if not move:
        return 1.0, 0.5, 0.5, 0.0, 0.0, 0.0
    a, b = move.get("span", [0.0, 1.0])
    q = ease((p - a) / (b - a) if b > a else 1.0, move.get("ease", "inout"))
    z0, z1 = move.get("z", [1.0, 1.0])
    (x0, y0), (x1, y1) = move.get("c", [[0.5, 0.5], [0.5, 0.5]])
    dx = dy = 0.0
    shake = move.get("shake")
    if shake:
        k = t - shake.get("at", 0.0)
        if k >= 0:
            amp = shake.get("amp", 20) * math.exp(-k / shake.get("decay", 0.4))
            dx = amp * math.sin(2 * math.pi * 17 * k)
            dy = amp * 0.7 * math.sin(2 * math.pi * 23 * k + 1.3)
    return z0 + (z1 - z0) * q, x0 + (x1 - x0) * q, y0 + (y1 - y0) * q, dx, dy, q


def parallax_for(layer):
    """How much depth parallax a layer gets: lateral px (x, y) and dolly scale, signed by its move."""
    par = layer.get("par", {})
    if par is False:
        return None
    move = layer.get("move") or {}
    z0, z1 = move.get("z", [1.0, 1.0])
    (x0, y0), (x1, y1) = move.get("c", [[0.5, 0.5], [0.5, 0.5]])
    auto = {"x": 0.0, "y": 0.0, "dolly": 0.0}
    if abs(x1 - x0) > 0.02:
        auto["x"] = 46.0 * math.copysign(1, x1 - x0)
    if abs(y1 - y0) > 0.02:
        auto["y"] = 46.0 * math.copysign(1, y1 - y0)
    if abs(z1 - z0) > 0.02:
        auto["dolly"] = 0.07 * math.copysign(1, z1 - z0)
    if not any(auto.values()):
        auto["x"] = 28.0                     # a still shot still breathes a little
    auto.update(par)
    return auto


def noise(t, seed):
    """Smooth flicker in about -1..1 from a few unrelated sines."""
    return (0.5 * math.sin(t * 9.1 + seed) + 0.3 * math.sin(t * 17.3 + seed * 2.1)
            + 0.2 * math.sin(t * 31.7 + seed * 3.7))


class Particles:
    def __init__(self, spec, seed):
        rng = np.random.default_rng(seed)
        n = spec.get("n", 60)
        x0, y0, x1, y1 = spec.get("region", [0, 0, 1, 1])
        self.box = (x0 * W, y0 * H, x1 * W, y1 * H)
        self.pos = np.column_stack([rng.uniform(self.box[0], self.box[2], n),
                                    rng.uniform(self.box[1], self.box[3], n)])
        (vx0, vx1), (vy0, vy1) = spec.get("vel", [[-5, 5], [-5, 5]])
        self.vel = np.column_stack([rng.uniform(vx0, vx1, n), rng.uniform(vy0, vy1, n)])
        self.size = rng.uniform(*spec.get("size", [1.0, 2.5]), n)
        self.alpha = rng.uniform(*spec.get("alpha", [0.2, 0.6]), n)
        self.phase = rng.uniform(0, 2 * math.pi, n)
        self.twinkle = spec.get("twinkle", 0.5)
        self.rate = spec.get("rate", 0.8)        # twinkles per second
        self.color = np.array(spec.get("color", [255, 245, 225]), np.float32)
        self.sprites = {}

    def sprite(self, sigma):
        key = round(sigma * 4) / 4
        if key not in self.sprites:
            r = int(math.ceil(key * 3)) + 1
            yy, xx = np.mgrid[-r:r + 1, -r:r + 1].astype(np.float32)
            self.sprites[key] = np.exp(-(xx ** 2 + yy ** 2) / (2 * key ** 2))[..., None]
        return self.sprites[key]

    def draw(self, frame, t):
        bx0, by0, bx1, by1 = self.box
        bw, bh = max(bx1 - bx0, 1), max(by1 - by0, 1)
        wob = np.column_stack([np.sin(t * 0.9 + self.phase), np.cos(t * 0.7 + self.phase)]) * 6
        p = self.pos + self.vel * t + wob
        p[:, 0] = bx0 + (p[:, 0] - bx0) % bw
        p[:, 1] = by0 + (p[:, 1] - by0) % bh
        edge = np.minimum.reduce([(p[:, 0] - bx0) / bw, (bx1 - p[:, 0]) / bw,
                                  (p[:, 1] - by0) / bh, (by1 - p[:, 1]) / bh])
        fade = np.clip(edge / 0.12, 0, 1)
        tw = 1 - self.twinkle * (0.5 + 0.5 * np.sin(t * 2 * math.pi * self.rate + self.phase * 3))
        for (x, y), a, s in zip(p, self.alpha * fade * tw, self.size):
            if a < 0.01:
                continue
            spr = self.sprite(s)
            r = spr.shape[0] // 2
            xi, yi = int(x), int(y)
            ya, yb, xa, xb = yi - r, yi + r + 1, xi - r, xi + r + 1
            if ya < 0 or xa < 0 or yb > H or xb > W:
                continue
            frame[ya:yb, xa:xb] += spr * (self.color * a)


class Effects:
    """The fx list of one layer: warps (haze, drift) feed the remap; light and particles go on top."""

    def __init__(self, specs, seed):
        self.particles, self.flickers, self.haze, self.drift = [], [], [], []
        for i, spec in enumerate(specs or []):
            kind = spec["type"]
            if kind == "particles":
                self.particles.append(Particles(spec, seed * 31 + i))
            elif kind == "flicker":
                cx, cy = spec["at"]
                r = spec.get("radius", 0.4) * H
                mask = np.exp(-(((GRID_U - cx * W) ** 2 + (GRID_V - cy * H) ** 2) / (r * r)))
                tint = np.array(spec.get("color", [255, 190, 110]), np.float32) / 255.0
                self.flickers.append((mask[..., None] * tint, spec.get("amount", 0.12), seed + i * 7.3))
            elif kind == "haze":
                y0, y1 = spec.get("band", [0.6, 1.0])
                band = np.clip(np.minimum((GRID_V / H - y0) / 0.08, (y1 - GRID_V / H) / 0.08), 0, 1)
                self.haze.append((band, spec.get("amp", 1.5), spec.get("speed", 2.0)))
            elif kind == "drift":
                self.drift.append((spec.get("max_depth", 0.15), spec.get("speed", 6.0)))

    def warp(self, mx, my, depth_view, s, t):
        for band, amp, speed in self.haze:
            mx += (amp / s) * band * np.sin(GRID_V * 0.045 + t * speed * 2 * math.pi)
            my += (amp * 0.5 / s) * band * np.sin(GRID_U * 0.03 + t * speed * 1.3 * 2 * math.pi)
        for max_depth, speed in self.drift:
            if depth_view is not None:
                far = np.clip((max_depth - depth_view) / max(max_depth, 1e-3) * 3, 0, 1)
                mx -= (speed * t / s) * far

    def light(self, frame, t):
        for mask, amount, seed in self.flickers:
            frame *= 1 + amount * noise(t, seed) * mask
        for parts in self.particles:
            parts.draw(frame, t)


def render_layer(assets, layer, lt, l_len, state):
    """One frame of a picture layer as float32 RGB (H, W, 3)."""
    move = layer.get("move")
    z, cx, cy, sdx, sdy, q = camera(move, lt / l_len, lt)
    clip_path = None
    if not layer.get("still_only"):
        clip_path = assets.clip_for(layer["img"])
    if clip_path:
        if ("clip", clip_path) not in state:
            state[("clip", clip_path)] = ClipReader(clip_path)
        reader = state[("clip", clip_path)]
        if "_clip_offset" in layer:          # a lip-sync clip: starts with its voice, real speed
            src = reader.get(max(lt - layer["_clip_offset"], 0.0) * reader.fps)
        else:
            speed = 1.0                      # slow a short clip to fill its shot (up to ~1.5x)
            if l_len > reader.duration and reader.duration / l_len >= 0.65:
                speed = reader.duration / l_len
            src = reader.get(lt * reader.fps * speed)
        sharp = cv2.GaussianBlur(src, (0, 0), 1.2)
        src = np.clip(apply_grade(cv2.addWeighted(src, 1.6, sharp, -0.6, 0), layer.get("grade")),
                      0, 255).astype(np.uint8)
        depth, focus, par = None, 0.5, None
    else:
        src, depth, focus = assets.still(layer["img"], layer.get("grade"))
        par = parallax_for(layer) if depth is not None else None
    h, w = src.shape[:2]
    if par:
        z *= 1.07                            # room for near things to slide without showing an edge
    s = max(W / w, H / h) * z
    vw, vh = W / s, H / s
    x0 = min(max(cx * w - vw / 2 + sdx / s, 0), w - vw)
    y0 = min(max(cy * h - vh / 2 + sdy / s, 0), h - vh)
    mx = GRID_U / s + x0
    my = GRID_V / s + y0
    key = ("fx", layer["img"], str(layer.get("from", 0)))
    if key not in state:
        state[key] = Effects(layer.get("fx"), zlib.crc32(layer["img"].encode()) % 1000)
    fx = state[key]
    depth_view = None
    if depth is not None:
        depth_view = cv2.remap(depth, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    if par:
        rel = (depth_view - focus) * 2 * (q - 0.5)
        mx += (par["x"] / s) * rel - (GRID_U - W / 2) / s * par["dolly"] * rel
        my += (par["y"] / s) * rel - (GRID_V - H / 2) / s * par["dolly"] * rel
    if not clip_path:
        fx.warp(mx, my, depth_view, s, lt)
    frame = cv2.remap(src, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT).astype(np.float32)
    if not clip_path:
        fx.light(frame, lt)
    return frame


# ---------------------------------------------------------------- text

def font(name, size):
    return ImageFont.truetype(FONTS + name, size)


def wrap(draw, text, fnt, width):
    lines, line = [], ""
    for word in text.split(" "):
        trial = (line + " " + word).strip()
        if draw.textlength(trial, font=fnt) <= width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def curly(text):
    out, opened = [], False
    for ch in text:
        if ch == '"':
            out.append("\u201d" if opened else "\u201c")
            opened = not opened
        elif ch == "'":
            out.append("\u2019")
        else:
            out.append(ch)
    return "".join(out)


def text_block(rows, width=W, pad=40):
    """rows: (text, font, fill, stroke, line_gap). Returns an RGBA image with a soft shadow."""
    scratch = ImageDraw.Draw(Image.new("L", (1, 1)))
    laid, height = [], pad
    for text, fnt, fill, stroke, gap in rows:
        for line in wrap(scratch, text, fnt, CAPTION_WIDTH):
            box = scratch.textbbox((0, 0), line, font=fnt, stroke_width=stroke)
            laid.append((line, fnt, fill, stroke, height - box[1]))
            height += box[3] - box[1] + gap
    height += pad
    shadow = Image.new("L", (width, height), 0)
    sd = ImageDraw.Draw(shadow)
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for line, fnt, fill, stroke, y in laid:
        x = (width - scratch.textlength(line, font=fnt)) / 2
        sd.text((x, y + 6), line, font=fnt, fill=200, stroke_width=stroke + 4)
        d.text((x, y), line, font=fnt, fill=fill, stroke_width=stroke, stroke_fill=(10, 8, 6))
    shadow = shadow.filter(ImageFilter.GaussianBlur(10))
    base = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    base.putalpha(shadow)
    return Image.alpha_composite(base, img)


def caption_image(cap):
    main, sub = cap, None
    if " · " in cap:
        main, sub = cap.split(" · ", 1)
    main = curly(main)
    quoted = main.startswith("\u201c")
    rows = [(main, font("georgiaz.ttf" if quoted else "segoeuib.ttf", 64 if quoted else 68),
             (255, 244, 220) if quoted else (255, 255, 255), 5, 10)]
    if sub:
        rows.append((curly(sub), font("georgiaz.ttf", 46), (240, 205, 120), 5, 0))
    return text_block(rows)


def title_image(title, sub):
    size = 190
    big = font("TrajanPro-Bold.otf", size)
    scratch = ImageDraw.Draw(Image.new("L", (1, 1)))
    while scratch.textlength(title, font=big) > W - 140:
        size -= 6
        big = font("TrajanPro-Bold.otf", size)
    return text_block([(title, big, (255, 250, 240), 6, 26),
                       (curly(sub), font("AGaramondPro-Italic.otf", 80), (236, 199, 110), 4, 0)])


def card_image(lines):
    rows = []
    for item in lines:
        rows.append((curly(item["text"]), font(item.get("font", "segoeuib.ttf"), item.get("size", 60)),
                     tuple(item.get("color", [255, 255, 255])), 0, item.get("gap", 24)))
    return text_block(rows)


def rgba(img):
    return np.asarray(img).astype(np.float32)


def overlay(frame, over, x, y, alpha=1.0):
    """Alpha-blend an RGBA float array onto the frame at (x, y), clipped to the frame."""
    h, w = over.shape[:2]
    xa, ya = max(x, 0), max(y, 0)
    xb, yb = min(x + w, W), min(y + h, H)
    if xb <= xa or yb <= ya:
        return
    o = over[ya - y:yb - y, xa - x:xb - x]
    a = o[..., 3:4] / 255.0 * alpha
    frame[ya:yb, xa:xb] = frame[ya:yb, xa:xb] * (1 - a) + o[..., :3] * a


# ---------------------------------------------------------------- shots (one worker each)

def vignette():
    r = np.sqrt(((GRID_U - W / 2) / (W * 0.62)) ** 2 + ((GRID_V - H / 2) / (H * 0.62)) ** 2)
    dark = np.clip((r - 0.55) / 0.6, 0, 1) ** 1.6 * (150 / 255)
    return (1 - dark)[..., None].astype(np.float32)


def render_shot(job):
    edit, root, index, out_path, grain = job
    cv2.setNumThreads(1)                     # the shots already run in parallel
    shot = edit["shots"][index]
    assets = Assets(root)
    vig = vignette()
    rng = np.random.default_rng(index)
    grains = [rng.normal(0, grain, (H // 2, W // 2, 1)).astype(np.float32) for _ in range(6)] if grain else []
    grains = [cv2.resize(g, (W, H), interpolation=cv2.INTER_LINEAR)[..., None] for g in grains]
    enc = subprocess.Popen(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                            "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                            "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
                            "-x264-params", "threads=2", "-pix_fmt", "yuv420p", out_path],
                           stdin=subprocess.PIPE)
    kind = shot.get("type", "shot")
    cap = rgba(caption_image(shot["cap"])) if shot.get("cap") else None
    title = rgba(title_image(shot["title"], shot["sub"])) if kind == "title" else None
    card = rgba(card_image(shot["lines"])) if kind == "card" else None
    state = {}
    f0, f1 = frame_range(shot)
    for f in range(f0, f1):
        lt = f / FPS - shot["_t0"]
        if kind == "card":
            frame = np.zeros((H, W, 3), np.float32)
            k = (lt - shot.get("black", 0.5)) / shot.get("fade", 0.6)
            if k > 0:
                overlay(frame, card, 0, (H - card.shape[0]) // 2 - 60, min(k, 1.0))
        elif kind == "title":
            layer = {"img": shot["bg"], "grade": "title", "still_only": True,
                     "move": {"z": [1.04, 1.10], "ease": "linear"}, "par": False}
            frame = render_layer(assets, layer, lt, shot["_dur"], state) * vig
            snap = min(lt / 0.18, 1.0)
            ti = title
            if snap < 1.0:
                sc = 1.35 - 0.35 * ease(snap, "out")
                ti = cv2.resize(title, (int(title.shape[1] * sc), int(title.shape[0] * sc)),
                                interpolation=cv2.INTER_CUBIC)
            overlay(frame, ti, (W - ti.shape[1]) // 2, (H - ti.shape[0]) // 2 - 80, snap)
            if lt < 0.12:
                frame += (255 - frame) * 0.55 * (1 - lt / 0.12)
        else:
            layers = shot["images"]
            starts = [local_time(shot, layer.get("from", 0)) for layer in layers]
            li = 0
            for i, s0 in enumerate(starts):
                if lt >= s0:
                    li = i
            l0 = starts[li]
            l1 = starts[li + 1] if li + 1 < len(layers) else shot["_dur"]
            if "clip_at" in layers[li]:
                layers[li]["_clip_offset"] = local_time(shot, layers[li]["clip_at"]) - l0
            frame = render_layer(assets, layers[li], lt - l0, l1 - l0, state) * vig
            flash = layers[li].get("flash", 0)
            if flash and lt - l0 < 0.1:
                frame += (255 - frame) * flash * (1 - (lt - l0) / 0.1)
            if cap is not None:
                c0 = local_time(shot, shot.get("cap_at", "vo+0"))
                if lt >= c0:
                    a = min((lt - c0) / 0.15, 1.0)
                    overlay(frame, cap, 0, CAPTION_BOTTOM - cap.shape[0] + int(10 * (1 - a)), a)
        if grains and kind != "card":
            frame += grains[f % len(grains)]
        enc.stdin.write(np.clip(frame, 0, 255).astype(np.uint8).tobytes())
    enc.stdin.close()
    if enc.wait() != 0:
        raise RuntimeError(f"encode failed for shot {shot['id']}")
    return shot["id"]


def render_video(edit, root, indices, out_path, tmp):
    jobs = [(edit, root, i, os.path.join(tmp, f"shot{i:02}.mp4"), edit.get("grain", 0)) for i in indices]
    workers = max(1, min(len(jobs), (os.cpu_count() or 4) - 2))
    with Pool(workers) as pool:
        for sid in pool.imap_unordered(render_shot, jobs):
            print(f"  shot {sid} rendered", flush=True)
    listing = os.path.join(tmp, "shots.txt")
    with open(listing, "w", encoding="utf-8") as f:
        for _, _, _, path, _ in jobs:
            f.write(f"file '{path.replace(os.sep, '/')}'\n")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", listing,
                    "-c", "copy", out_path], check=True)


# ---------------------------------------------------------------- sound

def load_audio(path):
    out = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2",
                          "-ar", str(SR), "-"], capture_output=True, check=True)
    return np.frombuffer(out.stdout, dtype=np.float32).reshape(-1, 2).copy()


def save_wav(arr, path, codec="pcm_s16le"):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ac", "2", "-ar", str(SR),
                    "-i", "-", "-c:a", codec, path], input=arr.astype(np.float32).tobytes(), check=True)


def lufs(arr):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-f", "f32le", "-ac", "2", "-ar", str(SR),
                          "-i", "-", "-af", "ebur128", "-f", "null", "-"],
                         input=arr.astype(np.float32).tobytes(), capture_output=True)
    found = re.findall(r"I:\s+(-?[\d.]+) LUFS", out.stderr.decode("utf-8", "replace"))
    return float(found[-1])


def db(x):
    return 10 ** (x / 20)


def place(track, clip, t0, gain=1.0, fade_in=0.0, fade_out=0.0):
    clip = clip * gain
    n = len(clip)
    if fade_in > 0:
        k = min(int(fade_in * SR), n)
        clip[:k] *= np.linspace(0, 1, k, dtype=np.float32)[:, None]
    if fade_out > 0:
        k = min(int(fade_out * SR), n)
        clip[n - k:] *= np.linspace(1, 0, k, dtype=np.float32)[:, None]
    a = int(round(t0 * SR))
    if a < 0:
        clip, a = clip[-a:], 0
    b = min(a + len(clip), len(track))
    if b > a:
        track[a:b] += clip[:b - a]


def fit(clip, seconds, start=0.0):
    """Take `seconds` of a clip from `start`, looping it if it is too short."""
    n = int(round(seconds * SR))
    clip = clip[int(start * SR):]
    if len(clip) < n:
        clip = np.tile(clip, (n // max(len(clip), 1) + 1, 1))
    return clip[:n].copy()


def trim_head(clip, floor_db=-40):
    loud = np.nonzero(np.abs(clip).max(axis=1) > db(floor_db))[0]
    return clip[max(loud[0] - int(0.005 * SR), 0):] if len(loud) else clip


_audio = {}


def audio(root, name):
    if name not in _audio:
        _audio[name] = load_audio(os.path.join(root, name))
    return _audio[name]


def duck_curve(vo, amount_db):
    """Gain that drops the music by amount_db while the narrator speaks (fast attack, slow release)."""
    hop = SR // 100
    frames = len(vo) // hop + 1
    env = np.zeros(frames, dtype=np.float32)
    mono = np.abs(vo).max(axis=1)
    for i in range(frames):
        seg = mono[i * hop:(i + 1) * hop]
        env[i] = seg.max() if len(seg) else 0
    talking = (env > db(-42)).astype(np.float32)
    g = np.zeros(frames, dtype=np.float32)
    level = 0.0
    for i in range(frames):                    # look ahead 80 ms so the dip lands before the word
        target = talking[i:i + 8].max()
        rate = 0.25 if target > level else 0.025
        level += (target - level) * rate
        g[i] = level
    gain = db(-amount_db * g)
    return np.repeat(gain, hop)[:len(vo)][:, None]


def render_audio(edit, root, total, mix_path, stem_path):
    n = int(math.ceil(total * SR)) + SR
    vo = np.zeros((n, 2), np.float32)
    music = np.zeros((n, 2), np.float32)
    sfx = np.zeros((n, 2), np.float32)
    mix = edit["mix"]

    for shot in edit["shots"]:
        if "_vo_path" in shot:
            place(vo, load_audio(shot["_vo_path"]), shot["_t0"] + shot.get("vo_at", 0.25))
    vo *= db(mix["vo_lufs"] - lufs(vo[:int(total * SR)]))

    for cue in edit["music"]:
        clip = audio(root, cue["file"])
        t0, t1 = global_time(edit, cue["start"]), global_time(edit, cue["end"])
        offset = t0 if cue.get("offset") == "sync" else float(cue.get("offset", 0))
        part = fit(clip, t1 - t0, offset)
        gain = db(cue["lufs"] - lufs(clip[:min(len(clip), 60 * SR)]))
        place(music, part, t0, gain, cue.get("fade_in", 0), cue.get("fade_out", 0))
    music *= duck_curve(vo, mix["duck_db"])

    for shot in edit["shots"]:
        end = shot["_t0"] + shot["_dur"]
        for fx in shot.get("sfx", []):
            clip = audio(root, fx["file"])
            t0 = shot["_t0"] + local_time(shot, fx.get("at", 0))
            if "rms" in fx:                    # a bed: fill to the end of the shot or to "until"
                t1 = global_time(edit, fx["until"]) if "until" in fx else end
                part = fit(clip, t1 - t0, fx.get("from", 0))
                rms = math.sqrt(float(np.mean(part ** 2))) or 1e-9
                gain = db(fx["rms"]) / rms
                fades = (fx.get("fade_in", 0.3), fx.get("fade_out", 0.3))
            else:                              # a hit: normalised to its peak
                part = trim_head(clip[int(fx.get("from", 0) * SR):]).copy()
                if "dur" in fx:
                    part = part[:int(fx["dur"] * SR)]
                gain = db(fx.get("peak", -6)) / (float(np.abs(part).max()) or 1e-9)
                fades = (0.0, fx.get("fade_out", 0.02))
            place(sfx, part, t0, gain, *fades)

    out = vo + music + sfx
    cut = int(global_time(edit, mix["silence_from"]) * SR) if mix.get("silence_from") else None
    if cut is not None:                          # the cliffhanger: everything stops dead
        out[cut:] = 0
    out = out[:int(round(total * SR))]
    save_wav(vo[:len(out)], stem_path)

    raw = mix_path + ".raw.wav"
    save_wav(out, raw, "pcm_f32le")
    target = f"I={mix['lufs']}:TP={mix['true_peak']}:LRA=11"
    p1 = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", raw, "-af",
                         f"loudnorm={target}:print_format=json", "-f", "null", "-"],
                        capture_output=True, text=True, encoding="utf-8", errors="replace")
    m = json.loads(p1.stderr[p1.stderr.rindex("{"):p1.stderr.rindex("}") + 1])
    second = (f"loudnorm={target}:measured_I={m['input_i']}:measured_TP={m['input_tp']}"
              f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}"
              f":offset={m['target_offset']}:linear=true")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", second, "-ar", str(SR),
                    "-c:a", "pcm_s16le", mix_path], check=True)
    os.remove(raw)


# ---------------------------------------------------------------- captions file

def srt_time(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


def write_srt(edit, path):
    rows = []
    for shot in edit["shots"]:
        if not shot.get("cap"):
            continue
        a = shot["_t0"] + local_time(shot, shot.get("cap_at", "vo+0"))
        b = shot["_t0"] + shot["_dur"]
        text = curly(shot["cap"]).replace(" · ", "\n")
        rows.append(f"{len(rows) + 1}\n{srt_time(a)} --> {srt_time(b)}\n{text}\n")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(rows))


# ---------------------------------------------------------------- main

def main():
    edit_path = os.path.abspath(sys.argv[1])
    only = None
    if "--shots" in sys.argv:
        only = sys.argv[sys.argv.index("--shots") + 1].split(",")
    with open(edit_path, encoding="utf-8") as f:
        edit = json.load(f)
    render_dir = os.path.dirname(edit_path)
    root = os.path.dirname(render_dir)
    name = os.path.splitext(os.path.basename(edit_path))[0]
    total = layout(edit, root)
    print(f"{name}: {len(edit['shots'])} shots, {total:.2f} s")
    indices = [i for i, s in enumerate(edit["shots"]) if only is None or str(s["id"]) in only]

    with tempfile.TemporaryDirectory() as tmp:
        video = os.path.join(tmp, "video.mp4")
        if only is not None:
            render_video(edit, root, indices, os.path.join(render_dir, f"{name}-preview.mp4"), tmp)
            print(f"wrote {name}-preview.mp4 (shots {', '.join(only)}, no sound)")
            return
        mix = os.path.join(tmp, "mix.wav")
        render_audio(edit, root, total, mix, os.path.join(root, "audio", f"{name}-vo-stem.wav"))
        print("  audio mixed")
        render_video(edit, root, indices, video, tmp)
        out = os.path.join(render_dir, f"{name}.mp4")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", video, "-i", mix, "-map", "0:v", "-map", "1:a",
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest",
                        "-movflags", "+faststart", out], check=True)
    write_srt(edit, os.path.join(render_dir, f"{name}.srt"))
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
