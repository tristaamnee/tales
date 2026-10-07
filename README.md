# TALES — Team Landing Page

Landing page giới thiệu team 5 người, viết bằng **Next.js** (App Router, TypeScript), xuất ra web tĩnh.

- **Trang chủ** (`/`): 5 ô ảnh, mặc định tối. Rê chuột vào ai thì ảnh người đó sáng lên; bấm để mở trang cá nhân.
  - Điện thoại: xếp một cột, cuộn tới ai thì người đó sáng; chạm để mở. Máy tính bảng: chạm lần 1 sáng, lần 2 mở.
- **Trang cá nhân** (`/thanh-vien/<id>/`): ảnh, giới thiệu, số liệu, kinh nghiệm, học vấn, chứng chỉ, kỹ năng,
  "Những thứ đã làm được". Mỗi người có thể có phong cách riêng theo ngành (`"style"`: `finance`, `developer`).
- Chế độ sáng / tối (theo máy hoặc tự chọn). Link cũ `member.html#<id>` tự chuyển sang địa chỉ mới.

## Chạy trên máy

Cần Node.js 20 trở lên.

```bash
npm install
npm run dev        # xem thử, tự tải lại khi sửa: http://localhost:3000
npm run build      # xuất web tĩnh ra thư mục out/
npm start          # xem bản đã build
```

Dữ liệu trong `content/` được đọc **lúc build**: sửa JSON xong thì `npm run dev` tự cập nhật,
còn bản trên mạng sẽ cập nhật sau khi push (GitHub Actions build lại).

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
| `id`      | ✓ | Viết thường, không dấu, nối bằng `-`. Trùng tên file và tên ảnh; dùng làm địa chỉ `/thanh-vien/<id>/`. |
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
photos/minh.jpg  ->  public/images/members/minh.webp   (nền trong suốt, tự căn khung 3:4)
```

Trang web tự lấy `public/images/members/<id>.webp`, không cần sửa code hay dữ liệu. Ai chưa có ảnh thì hiện bóng người theo màu của người đó.

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

Workflow `.github/workflows/deploy.yml` tự build và đưa lên GitHub Pages mỗi khi push lên `main`.
Lần đầu: **Settings → Pages → Source: GitHub Actions**. Site nằm ở thư mục con (vd. `/tales`) cũng tự đúng đường dẫn.

Host tĩnh khác (Netlify, Vercel, Cloudflare Pages…): lệnh build `npm run build`, thư mục xuất `out`.

## Cấu trúc

```
content/              ← NỘI DUNG (JSON), đọc lúc build
app/
  layout.tsx          Khung chung: font, chống nháy sáng/tối
  page.tsx            Trang chủ
  thanh-vien/[id]/    Trang cá nhân (tạo sẵn cho từng người)
  globals.css         Toàn bộ giao diện
components/           Roster (hover/cuộn/chạm), ThemeToggle, TransitionLink, Tenure
lib/                  Đọc nội dung (content.ts), định dạng ngày/thời gian (format.ts)
public/images/members/  Ảnh đã tách nền (tự sinh)
public/member.html    Chuyển link cũ member.html#<id> sang địa chỉ mới
photos/               Ảnh gốc (bỏ ảnh vào đây)
tools/                Script tách nền + kiểm tra nội dung
.github/workflows/    Deploy, tự tách nền, tự kiểm tra khi push
CLAUDE.md             Hướng dẫn cho Claude Code (đọc tự động mỗi phiên)
.claude/skills/       Skill cho Claude Code
```
