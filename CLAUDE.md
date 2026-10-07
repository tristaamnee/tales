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
- Hướng thiết kế: TALES = những câu chuyện. Trang chủ là kệ sách (mỗi người một gáy sách, tên in dọc, rê chuột thì
  sách mở ra và người đó sáng lên); trang cá nhân trình bày như một chương sách. Tránh lại các kiểu "AI": chữ HOA giãn
  rộng, chữ viền rỗng, số thứ tự trang trí, thẻ có viền + đổ bóng + glow, chip viền, màu Tailwind mặc định.
- Font: Newsreader (chữ có chân, tiêu đề/tên) + Be Vietnam Pro (nội dung); cả hai đủ dấu tiếng Việt. Font mới phải hỗ trợ tiếng Việt.
  Viết thường như câu bình thường, không `text-transform: uppercase`. Dấu chồng (Ồ, Ấ, Ữ…) không được bị cắt: kiểm tra
  `line-height` khi đổi cỡ chữ.
- Màu mỗi thành viên: dịu (độ bão hoà vừa phải), khác nhau rõ ràng, đủ sáng trên nền tối. Không dùng mã màu Tailwind.
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
