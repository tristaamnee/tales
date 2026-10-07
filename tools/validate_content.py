#!/usr/bin/env python3
"""
Kiểm tra nội dung trong content/ trước khi lên web.

    pip install jsonschema
    python tools/validate_content.py

Báo LỖI (trang sẽ hỏng) và CẢNH BÁO (trang vẫn chạy, nhưng nên sửa).
"""

import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
PUBLIC = ROOT / "public"
SCHEMAS = CONTENT / "schema"

errors: list[str] = []
warnings: list[str] = []


def load(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        errors.append(f"{path.relative_to(ROOT)}: JSON sai cú pháp ở dòng {exc.lineno}, cột {exc.colno} ({exc.msg})")
    except FileNotFoundError:
        errors.append(f"{path.relative_to(ROOT)}: không tìm thấy file")
    return None


def check_schema(data, schema_name: str, path: Path) -> None:
    validator = Draft202012Validator(json.loads((SCHEMAS / schema_name).read_text(encoding="utf-8")))
    for err in sorted(validator.iter_errors(data), key=lambda e: list(e.absolute_path)):
        where = "/".join(str(p) for p in err.absolute_path) or "(gốc)"
        errors.append(f"{path.relative_to(ROOT)} → {where}: {err.message}")


def main() -> int:
    team_path = CONTENT / "team.json"
    team = load(team_path)
    if team is None:
        return report()
    check_schema(team, "team.schema.json", team_path)

    listed = team.get("members", [])
    colors: dict[str, str] = {}
    for member_id in listed:
        path = CONTENT / "members" / f"{member_id}.json"
        member = load(path)
        if member is None:
            continue
        check_schema(member, "member.schema.json", path)
        if member.get("id") != member_id:
            errors.append(f"{path.relative_to(ROOT)}: id là \"{member.get('id')}\" nhưng tên file là \"{member_id}\" — hai cái phải giống nhau")

        if not member.get("photo"):
            has_source = any((ROOT / "photos").glob(f"{member_id}.*"))
            has_output = (PUBLIC / "images" / "members" / f"{member_id}.webp").exists()
            if not has_source and not has_output:
                warnings.append(f"{member_id}: chưa có ảnh — thêm photos/{member_id}.jpg (đang hiện bóng người)")
        elif not (PUBLIC / member["photo"]).exists():
            errors.append(f"{path.relative_to(ROOT)} → photo: không tìm thấy {member['photo']}")

        for i, work in enumerate(member.get("works", [])):
            if work.get("image") and not (PUBLIC / work["image"]).exists():
                warnings.append(f"{path.relative_to(ROOT)} → works/{i}/image: không tìm thấy {work['image']}")

        color = str(member.get("color", "")).lower()
        if color in colors:
            warnings.append(f"{member_id}: trùng màu {color} với {colors[color]}")
        colors[color] = member_id

    for path in sorted((CONTENT / "members").glob("*.json")):
        if not path.name.startswith("_") and path.stem not in listed:
            warnings.append(f"{path.relative_to(ROOT)}: chưa có trong danh sách members của content/team.json nên sẽ không hiện")

    return report()


def report() -> int:
    for w in warnings:
        print(f"CẢNH BÁO  {w}")
    for e in errors:
        print(f"LỖI       {e}")
    if errors:
        print(f"\n{len(errors)} lỗi cần sửa.")
        return 1
    print("Nội dung hợp lệ." + (f" ({len(warnings)} cảnh báo)" if warnings else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
