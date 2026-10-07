# TALES — landing page của team

Next.js 16 (App Router, TypeScript), `output: "export"` → web tĩnh trong `out/`. Trang chủ có 5 thẻ thành viên:
tối mặc định, sáng lên khi hover (điện thoại: khi cuộn tới), bấm vào mở trang cá nhân `/thanh-vien/<id>/`. Người dùng nói tiếng Việt — trả lời và viết
nội dung giao diện bằng tiếng Việt.

## Cấu trúc

- `content/team.json` — tên team, tagline, `shuffle` (xáo thứ tự trang chủ), danh sách id thành viên
- `content/members/<id>.json` — hồ sơ từng người; schema ở `content/schema/`; mẫu ở `_template.json`
- `lib/content.ts` đọc JSON lúc build (kiểu TypeScript của dữ liệu nằm ở đây) · `lib/format.ts` định dạng ngày, `asset()`
- `app/page.tsx` trang chủ · `app/thanh-vien/[id]/page.tsx` trang cá nhân (generateStaticParams) · `app/template.tsx` hiệu ứng vào trang
- `components/Roster.tsx` (hover/cuộn/chạm/xáo, client) · `ThemeToggle.tsx` · `TransitionLink.tsx` (mờ dần khi rời trang) · `Tenure.tsx`
- `app/globals.css` — toàn bộ giao diện (token ở `:root`); font qua `next/font` (biến `--font-sans/serif/mono`)
- `photos/<id>.jpg` — ảnh gốc → `tools/process_photos.py` tách nền ra `public/images/members/<id>.webp`
- `public/member.html` — chuyển link cũ `member.html#<id>` sang `/thanh-vien/<id>/`

## Lệnh

```bash
npm install && npm run dev                 # xem thử: http://localhost:3000
npm run build                              # xuất web tĩnh ra out/ (luôn chạy trước khi commit thay đổi code)
npm run typecheck
python tools/validate_content.py           # kiểm tra content/ (cần: pip install jsonschema)
python tools/process_photos.py             # tách nền ảnh mới trong photos/ (cần: pip install -r tools/requirements.txt)
```

Mỗi lần sửa `content/` hoặc thêm ảnh: chạy validate trước khi commit. GitHub Actions chạy validate
(`content.yml`), tự tách nền khi push ảnh (`photos.yml`) và build + deploy GitHub Pages khi push lên `main` (`deploy.yml`).
Site có thể nằm ở thư mục con: đường dẫn file trong `public/` phải đi qua `asset()`; link nội bộ dùng `next/link`
hoặc `TransitionLink` (tự thêm basePath).

## Quy ước

- Thêm/sửa thành viên = sửa JSON, không sửa code. Trường mới → cập nhật cả schema, renderer và `_template.json`.
- Không dùng `dangerouslySetInnerHTML` cho dữ liệu từ JSON (React tự escape).
- Hướng thiết kế (người dùng đã chọn): **tối giản sang trọng kiểu Apple/Tesla**. Ảnh là nhân vật chính, giao diện lùi
  về sau: nền trắng `#fff` / xám nhạt `#f5f5f7`, chữ `#1d1d1f`, đúng một màu xanh `#0066cc` cho link; một họ font
  Be Vietnam Pro (300/400/600), tiêu đề đậm 600 và khít chữ (letter-spacing âm), nội dung 17px; bo góc 18–22px cho ô ảnh;
  không viền trang trí, không bóng đổ, không gradient trang trí, không chữ HOA giãn rộng, không số thứ tự trang trí.
  Ô ảnh nền tối; ảnh mặc định xám tối, người được hover/cuộn tới thì ảnh sáng lên đủ màu kèm ánh sáng dịu màu riêng.
  Màu riêng của thành viên chỉ dùng cho ánh sáng sau ảnh, không dùng cho chữ hay viền.
- Có chế độ ban đêm: mặc định theo máy, nút "Tự động / Sáng / Tối" lưu lựa chọn vào localStorage (`tales-theme`).
  Mọi màu phải lấy từ token trong `:root` (bản sáng) và được định nghĩa lại cho tối trong cả
  `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` lẫn `:root[data-theme="dark"]`.
- Trang cá nhân có thể đổi phong cách theo ngành bằng `"style"` trong JSON (gắn `data-style` lên `.page-member`):
  `finance` = kiểu báo cáo thường niên/CV tài chính (chữ có chân Source Serif 4 cho tiêu đề và số, xanh navy
  `--fin-ink`, đường kẻ mảnh, ảnh hồ sơ nhỏ); `developer` = kiểu lập trình viên (JetBrains Mono, xanh Golang
  `--dev-ink`, vai trò như dòng lệnh `$`, slogan như comment `//`, kinh nghiệm như nhánh git, kỹ năng như mảng code).
  Phong cách mới: thêm vào enum `style` trong schema và một khối
  `[data-style="…"]` trong CSS; chỉ ghi đè trình bày, không đổi cấu trúc dữ liệu.
- Các mục CV (`experience`, `education`, `certifications`, `skillGroups`, `languages`, `cv`) dùng chung cho mọi người.
  `"draft": true` = dữ liệu mẫu, trang hiện dòng "Nội dung mẫu…"; bỏ cờ này khi đã có thông tin thật.
- Dấu chồng tiếng Việt (Ồ, Ấ, Ữ…) không được bị cắt: kiểm tra `line-height` khi đổi cỡ chữ tên nhiều dòng.
- Màu mỗi thành viên: dịu, khác nhau rõ ràng. Không dùng mã màu Tailwind mặc định.
- Ảnh gốc người dùng gửi trong chat nằm ở thư mục ảnh của phiên; copy vào `photos/<id>.jpg` rồi chạy `process_photos.py`
  (ra `public/images/members/`).
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
