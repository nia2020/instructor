#!/usr/bin/env python3
"""Trim whitespace / transparency and scale municipality logos to a uniform height."""
from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent / ".pypi-local"))
    from PIL import Image

TARGET_HEIGHT = 72
PAD = 6
WHITE_TOL = 18


def bbox_non_white(im: Image.Image) -> tuple[int, int, int, int] | None:
    im = im.convert("RGB")
    w, h = im.size
    px = im.load()
    min_x, min_y = w, h
    max_x, max_y = 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if not (
                r >= 255 - WHITE_TOL
                and g >= 255 - WHITE_TOL
                and b >= 255 - WHITE_TOL
            ):
                found = True
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
    if not found:
        return None
    return (min_x, min_y, max_x + 1, max_y + 1)


def trim_rgba(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    alpha = im.split()[3]
    if alpha.getextrema()[0] < 255:
        bbox = alpha.getbbox()
        if bbox:
            im = im.crop(bbox)
    bbox2 = bbox_non_white(im.convert("RGB"))
    if bbox2:
        im = im.crop(bbox2)
    return im


def normalize_file(path: Path) -> tuple[int, int]:
    im = Image.open(path)
    im = trim_rgba(im)
    w, h = im.size
    if h == 0:
        raise ValueError(f"empty image after trim: {path}")
    new_h = TARGET_HEIGHT
    new_w = max(1, round(w * new_h / h))
    im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
    if im.mode != "RGBA":
        im = im.convert("RGBA")
    if PAD:
        canvas = Image.new("RGBA", (new_w + 2 * PAD, new_h + 2 * PAD), (0, 0, 0, 0))
        canvas.paste(im, (PAD, PAD), im)
        im = canvas
    im.save(path, "PNG", optimize=True)
    return im.size


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    logos = sorted((root / "assets/logos/municipalities").glob("[0-9]*.png"))
    if not logos:
        print("No PNG files found in assets/logos/municipalities/", file=sys.stderr)
        sys.exit(1)
    for path in logos:
        w, h = normalize_file(path)
        print(f"{path.name}: {w}x{h}")


if __name__ == "__main__":
    main()
