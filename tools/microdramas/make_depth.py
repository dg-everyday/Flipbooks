"""Make a depth map for each still, for the renderer's parallax.

    python tools/microdramas/make_depth.py microdramas/01-framed

Reads <drama>/images/*.jpg|png and writes <drama>/render/depth/<same name>.png: 16-bit greyscale,
white = near, black = far (Depth Anything V2 Small, run on the CPU). Stills that already have an
up-to-date depth map are skipped, so it is safe to run again after adding or replacing images.
"""
import os, sys

import numpy as np
from PIL import Image

MODEL = "depth-anything/Depth-Anything-V2-Small-hf"


def main():
    drama = sys.argv[1]
    src_dir = os.path.join(drama, "images")
    out_dir = os.path.join(drama, "render", "depth")
    os.makedirs(out_dir, exist_ok=True)
    todo = []
    for name in sorted(os.listdir(src_dir)):
        if not name.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        src = os.path.join(src_dir, name)
        out = os.path.join(out_dir, os.path.splitext(name)[0] + ".png")
        if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src):
            continue
        todo.append((src, out))
    if not todo:
        print("depth maps are up to date")
        return

    from transformers import pipeline
    estimator = pipeline("depth-estimation", model=MODEL, device="cpu")
    for src, out in todo:
        img = Image.open(src).convert("RGB")
        depth = estimator(img)["predicted_depth"].squeeze().numpy().astype(np.float32)
        depth = np.asarray(Image.fromarray(depth).resize(img.size, Image.BICUBIC))
        lo, hi = np.percentile(depth, 1), np.percentile(depth, 99)
        norm = np.clip((depth - lo) / max(hi - lo, 1e-6), 0, 1)
        Image.fromarray((norm * 65535).astype(np.uint16)).save(out)
        print(f"  {os.path.basename(out)}")


if __name__ == "__main__":
    main()
