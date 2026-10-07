# TALES — landing page của team

Site tĩnh HTML/CSS/JS thuần, không build step. Trang chủ có 5 thẻ thành viên: tối mặc định, sáng lên khi hover
(điện thoại: khi cuộn tới), bấm vào mở trang cá nhân `member.html#<id>`. Người dùng nói tiếng Việt — trả lời và viết
nội dung giao diện bằng tiếng Việt.

## Cấu trúc

- `content/team.json` — tên team, tagline, `shuffle` (xáo thứ tự trang chủ), danh sách id thành viên
- `content/members/<id>.json` — hồ sơ từng người; schema ở `content/schema/`; mẫu ở `_template.json`
- `photos/<id>.jpg` — ảnh gốc → `tools/process_photos.py` tách nền ra `images/members/<id>.webp`
- `js/content.js` tải JSON · `js/home.js` trang chủ · `js/member.js` trang cá nhân · `js/common.js` tiện ích
- `css/style.css` — toàn bộ giao diện (token ở `:root`, giao diện tối duy nhất)

## Lệnh

```bash
python3 -m http.server 8000                # xem thử (fetch JSON nên không mở bằng file://)
python tools/validate_content.py           # kiểm tra content/ (cần: pip install jsonschema)
python tools/process_photos.py             # tách nền ảnh mới trong photos/ (cần: pip install -r tools/requirements.txt)
```

Mỗi lần sửa `content/` hoặc thêm ảnh: chạy validate trước khi commit. GitHub Actions cũng chạy validate
(`.github/workflows/content.yml`) và tự tách nền khi push ảnh (`.github/workflows/photos.yml`).

## Quy ước

- Thêm/sửa thành viên = sửa JSON, không sửa code. Trường mới → cập nhật cả schema, renderer và `_template.json`.
- Mọi chuỗi từ JSON đưa vào HTML phải qua `escapeHTML()`.
- Hướng thiết kế (người dùng đã chọn): **tối giản sang trọng kiểu Apple/Tesla**. Ảnh là nhân vật chính, giao diện lùi
  về sau: nền trắng `#fff` / xám nhạt `#f5f5f7`, chữ `#1d1d1f`, đúng một màu xanh `#0066cc` cho link; một họ font
  Be Vietnam Pro (300/400/600), tiêu đề đậm 600 và khít chữ (letter-spacing âm), nội dung 17px; bo góc 18–22px cho ô ảnh;
  không viền trang trí, không bóng đổ, không gradient trang trí, không chữ HOA giãn rộng, không số thứ tự trang trí.
  Ô ảnh nền tối; ảnh mặc định xám tối, người được hover/cuộn tới thì ảnh sáng lên đủ màu kèm ánh sáng dịu màu riêng.
  Màu riêng của thành viên chỉ dùng cho ánh sáng sau ảnh, không dùng cho chữ hay viền.
- Dấu chồng tiếng Việt (Ồ, Ấ, Ữ…) không được bị cắt: kiểm tra `line-height` khi đổi cỡ chữ tên nhiều dòng.
- Màu mỗi thành viên: dịu, khác nhau rõ ràng. Không dùng mã màu Tailwind mặc định.
- Ảnh gốc người dùng gửi trong chat nằm ở thư mục ảnh của phiên; copy vào `photos/<id>.jpg` rồi chạy `process_photos.py`.
  Kiểm tra ảnh không chứa GPS trong EXIF trước khi commit.

## Skill đã cài (`.claude/skills/`, nguồn ghi trong `skills-lock.json`)

| Khi nào | Skill |
|---|---|
| Nâng cấp / rà lại giao diện đang có | `redesign-existing-projects`, `design-taste-frontend` |
| Rà lỗi UI, trợ năng, UX theo checklist | `web-design-guidelines` (tải quy tắc mới nhất từ GitHub của Vercel) |
| Muốn phong cách giống một trang/thương hiệu | `design-md-library` (tải DESIGN.md từ VoltAgent/awesome-design-md) |
| Phong cách cụ thể | `high-end-visual-design`, `minimalist-ui`, `industrial-brutalist-ui`, `gpt-taste`, `stitch-design-taste` |
| Mở trình duyệt, bấm thử, chụp màn hình, đọc console | `playwright-cli` |

Cập nhật skill: `npx skills update -p`. Các skill taste-skill là bản copy của https://github.com/Leonxlnx/taste-skill
(không dùng bản plugin để tránh trùng và để luôn có sẵn khi không có mạng).

## Playwright CLI trên môi trường cloud

CLI là gói npm toàn cục nên phiên cloud mới có thể chưa có, và máy cloud chỉ có Chromium (không có Chrome):

```bash
command -v playwright-cli || npm install -g @playwright/cli@latest
export PLAYWRIGHT_MCP_BROWSER=chromium
export PLAYWRIGHT_MCP_EXECUTABLE_PATH=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome | sort -V | tail -1)
```

Đặt hai biến môi trường trên ở đầu mỗi lệnh `playwright-cli` (shell không giữ biến giữa các lần gọi).
Kết quả (ảnh, snapshot, log) nằm ở `.playwright-cli/`, đã gitignore.
