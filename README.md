# TALES — Team Landing Page

Landing page giới thiệu team 5 người. Site tĩnh, chỉ có HTML/CSS/JS thuần, không cần cài gì hay build gì.

- **Trang chủ** (`index.html`): 5 thẻ nhân vật, mặc định tối đen. Di chuột vào ai thì người đó sáng lên với màu riêng, thẻ nở rộng ra; bấm vào để mở trang cá nhân.
  - Trên điện thoại: các thẻ xếp dọc, cuộn tới ai (thẻ nằm giữa màn hình) thì người đó sáng lên; chạm để vào trang.
- **Trang cá nhân** (`member.html#<id>`): ảnh, chức danh, giới thiệu, số liệu, kỹ năng, mạng xã hội, danh sách "Những thứ đã làm được", và nút chuyển sang người trước/sau.

## Chạy thử trên máy

Trang đọc dữ liệu từ file JSON nên cần chạy qua server (mở thẳng file `index.html` sẽ báo lỗi):

```bash
python3 -m http.server 8000
# mở http://localhost:8000
```

## Nội dung (profile)

Toàn bộ nội dung nằm trong `content/`, không có trong code:

```
content/
  team.json              Tên team, tagline, và THỨ TỰ thành viên (danh sách id)
  members/<id>.json      Hồ sơ từng người
  members/_template.json File mẫu để copy khi thêm người mới
  schema/                Mô tả cấu trúc: VS Code tự gợi ý trường và gạch đỏ chỗ sai
photos/<id>.jpg          Ảnh gốc (tự tách nền)
```

**Thêm người mới:** copy `content/members/_template.json` thành `content/members/<id>.json`, điền thông tin,
thêm `<id>` vào `members` trong `content/team.json`, bỏ ảnh vào `photos/<id>.jpg`.

**Sửa profile:** sửa `content/members/<id>.json` (sửa ngay trên GitHub bằng nút ✏️ cũng được) → Commit.
**Đổi ảnh:** upload đè `photos/<id>.jpg`. **Đổi thứ tự / ẩn một người:** sửa danh sách `members` trong `content/team.json`.

Mỗi lần push, GitHub Actions chạy `tools/validate_content.py` để kiểm tra (tab **Actions**; ❌ đỏ là có lỗi, bấm vào xem lỗi ở file nào, dòng nào). Chạy trên máy:

```bash
pip install jsonschema
python tools/validate_content.py
```

Các trường chính của một thành viên (chi tiết xem `content/schema/member.schema.json`):

| Trường    | Bắt buộc | Ghi chú |
|-----------|:--:|---|
| `id`      | ✓ | Viết thường, không dấu, nối bằng `-`. Trùng tên file và tên ảnh. |
| `name`    | ✓ | Tên hiển thị |
| `role`    | ✓ | Vai trò |
| `color`   | ✓ | `#rrggbb`, nên là màu sáng |
| `tagline` |   | Câu slogan |
| `bio`     |   | Mảng các đoạn văn |
| `stats`   |   | Tối đa 4 `{ "value", "label" }` |
| `skills`  |   | Mảng chữ |
| `works`   |   | `{ type, title, date, role, summary, tags, image, links, featured }` — `type`: `project`, `award`, `talk`, `cert`, `article`, `other`; `date`: `"2026"` hoặc `"2026-03"` |
| `socials` |   | `{ platform, url }` — `platform`: `github`, `linkedin`, `facebook`, `instagram`, `tiktok`, `youtube`, `x`, `behance`, `dribbble`, `website`, `email`… |

## Ảnh thành viên (tự tách nền)

Chỉ cần bỏ ảnh chụp bình thường vào thư mục `photos/`, **đặt tên file trùng `id`** của thành viên:

```
photos/minh.jpg  ->  images/members/minh.webp   (nền trong suốt, tự căn khung 3:4)
```

Trang web tự lấy `images/members/<id>.webp`, không cần sửa code hay dữ liệu. Ai chưa có ảnh thì hiện bóng người theo màu của người đó.

**Cách 1 — tự động trên GitHub (không cần cài gì):** push ảnh vào `photos/`, GitHub Actions
(`.github/workflows/photos.yml`) sẽ tách nền rồi tự commit ảnh kết quả vào cùng branch sau khoảng 2–3 phút.
Xem tiến trình ở tab **Actions** của repo.

**Cách 2 — chạy trên máy:**

```bash
pip install -r tools/requirements.txt
python tools/process_photos.py          # chỉ xử lý ảnh mới / ảnh đã thay
python tools/process_photos.py --force  # xử lý lại tất cả
```

Lần đầu sẽ tải model tách nền (~1GB, BiRefNet-portrait). Thay ảnh thì cứ ghi đè file cùng tên trong `photos/`.

Mẹo: ảnh rõ mặt, thấy từ ngực trở lên, độ phân giải ≥ 1000px là đẹp nhất. Nền gì cũng được.

Lưu ý: ảnh gốc trong `photos/` được commit vào repo — nếu repo public thì ai cũng xem được ảnh gốc.

Ảnh dự án (`image` trong `projects`) nên dùng tỉ lệ 16:9.

## Deploy lên GitHub Pages

Settings → Pages → Source: *Deploy from a branch* → chọn branch và thư mục `/ (root)` → Save.

## Cấu trúc

```
content/            ← NỘI DUNG (JSON)
CLAUDE.md           Hướng dẫn cho Claude Code (đọc tự động mỗi phiên)
.claude/skills/     Skill cho Claude Code (thiết kế, rà UI, trình duyệt)
index.html          Trang chủ
member.html         Trang cá nhân (dùng chung cho cả 5 người)
css/style.css       Toàn bộ giao diện
js/content.js       Tải dữ liệu từ content/
js/common.js        Tiện ích + hiệu ứng chuyển trang
js/home.js          Logic trang chủ (hover / sáng / click)
js/member.js        Render trang cá nhân
photos/             Ảnh gốc (bỏ ảnh vào đây)
images/members/     Ảnh đã tách nền (tự sinh)
tools/              Script tách nền + kiểm tra nội dung
.github/workflows/  Tự tách nền + tự kiểm tra khi push
```
