#!/usr/bin/env python3
"""
Tách nền ảnh thành viên và căn khung tự động.

    photos/<id>.jpg  ──►  public/images/members/<id>.webp      (nền trong suốt, khung 3:4)
                     └─►  public/images/members/<id>-bg.webp   (ảnh gốc cùng khung, làm lớp nền ở trang chủ)

<id> là id của thành viên trong dữ liệu team, ví dụ photos/minh.jpg -> public/images/members/minh.webp.
Ảnh đã xử lý rồi (cùng nội dung, cùng cài đặt) sẽ được bỏ qua, nên chạy lại bao nhiêu lần cũng được.

Cách dùng:
    pip install -r tools/requirements.txt
    python tools/process_photos.py            # xử lý ảnh mới hoặc ảnh đã thay đổi
    python tools/process_photos.py --force    # xử lý lại toàn bộ

Biến môi trường:
    REMBG_MODEL   model tách nền (mặc định: birefnet-portrait — tốt nhất cho chân dung, giữ tóc đẹp)
"""

import argparse
import hashlib
import json
import os
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "photos"
OUT_DIR = ROOT / "public" / "images" / "members"
MANIFEST = OUT_DIR / ".processed.json"

EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MODEL = os.environ.get("REMBG_MODEL", "birefnet-portrait")

# Khung ảnh đầu ra
WIDTH, HEIGHT = 900, 1200
HEADROOM = 0.08     # khoảng trống phía trên đầu (tỉ lệ chiều cao khung)
MAX_OVERFLOW = 1.3  # người rộng quá thì cho phép tràn 2 bên tối đa 130% chiều ngang khung
SETTINGS = f"{MODEL}|{WIDTH}x{HEIGHT}|{HEADROOM}|{MAX_OVERFLOW}|v2"


def file_hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def bg_path(out: Path) -> Path:
    """Ảnh gốc (còn nền) cắt cùng khung: <id>.webp -> <id>-bg.webp"""
    return out.with_name(f"{out.stem}-bg.webp")


def load_manifest() -> dict:
    try:
        return json.loads(MANIFEST.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def frame(image: Image.Image, cutout: Image.Image) -> tuple[Image.Image, Image.Image]:
    """Cắt ảnh gốc và ảnh đã tách nền theo cùng một khung 3:4 (để chồng lên nhau khớp từng điểm ảnh).

    Đầu cách mép trên một chút, người ở giữa; khung luôn nằm trọn trong ảnh gốc để ảnh nền phủ kín.
    """
    alpha = cutout.getchannel("A").point(lambda a: 255 if a > 16 else 0)
    bbox = alpha.getbbox()
    if not bbox:
        raise ValueError("không tìm thấy người trong ảnh")

    left, top, right, bottom = bbox
    sw, sh = right - left, bottom - top
    iw, ih = image.size
    scale = HEIGHT * (1 - HEADROOM) / sh
    if sw * scale > WIDTH * MAX_OVERFLOW:
        scale = WIDTH * MAX_OVERFLOW / sw
    scale = max(scale, WIDTH / iw, HEIGHT / ih)  # phóng to vừa đủ để ảnh nền phủ kín khung

    # Khung trên ảnh gốc: căn giữa người, chừa khoảng trống trên đầu, rồi đẩy vào trong mép ảnh.
    fw, fh = WIDTH / scale, HEIGHT / scale
    x = min(max((left + right) / 2 - fw / 2, 0), iw - fw)
    y = min(max(top - HEADROOM * fh, 0), ih - fh)
    box = (x, y, x + fw, y + fh)

    def crop(im: Image.Image) -> Image.Image:
        return im.resize((WIDTH, HEIGHT), Image.LANCZOS, box=box)

    return crop(image), crop(cutout)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--force", action="store_true", help="xử lý lại toàn bộ ảnh")
    args = parser.parse_args()

    sources = sorted(p for p in SRC_DIR.glob("*") if p.suffix.lower() in EXTENSIONS)
    if not sources:
        print(f"Không có ảnh nào trong {SRC_DIR.relative_to(ROOT)}/")
        return 0

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = load_manifest()
    todo = []
    for src in sources:
        out = OUT_DIR / f"{src.stem}.webp"
        key = f"{file_hash(src)}|{SETTINGS}"
        if not args.force and out.exists() and bg_path(out).exists() and manifest.get(src.name) == key:
            print(f"  bỏ qua  {src.name} (đã xử lý)")
            continue
        todo.append((src, out, key))

    if not todo:
        print("Tất cả ảnh đã được xử lý.")
        return 0

    from rembg import new_session, remove  # import muộn: tải model khá lâu

    print(f"Đang tải model {MODEL}…")
    session = new_session(MODEL)
    failed = 0

    for src, out, key in todo:
        try:
            image = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
            cutout = remove(image, session=session).convert("RGBA")
            background, person = frame(image, cutout)
            person.save(out, "WEBP", quality=90, method=6)
            background.save(bg_path(out), "WEBP", quality=82, method=6)  # không chép EXIF (GPS…) sang
            manifest[src.name] = key
            print(f"  xong    {src.name}  ->  {out.relative_to(ROOT)} + {bg_path(out).name}")
        except Exception as exc:  # một ảnh lỗi không làm hỏng cả lượt
            failed += 1
            print(f"  LỖI     {src.name}: {exc}", file=sys.stderr)

    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
