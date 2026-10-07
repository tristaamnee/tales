# TALES — Team Landing Page

Landing page giới thiệu team 5 người. Site tĩnh, chỉ có HTML/CSS/JS thuần, không cần cài gì hay build gì.

- **Trang chủ** (`index.html`): 5 thẻ nhân vật, mặc định tối đen. Di chuột vào ai thì người đó sáng lên với màu riêng, thẻ nở rộng ra; bấm vào để mở trang cá nhân.
  - Trên điện thoại: các thẻ xếp dọc, cuộn tới ai (thẻ nằm giữa màn hình) thì người đó sáng lên; chạm để vào trang.
- **Trang cá nhân** (`member.html#<id>`): ảnh, chức danh, giới thiệu, số liệu, kỹ năng, mạng xã hội, danh sách "Những thứ đã làm được", và nút chuyển sang người trước/sau.

## Chạy thử

Mở thẳng file `index.html` bằng trình duyệt là được. Hoặc chạy server local:

```bash
python3 -m http.server 8000
# mở http://localhost:8000
```

## Sửa thông tin team

Mọi nội dung nằm trong **`js/data.js`** — chỉ cần sửa file này:

| Trường     | Ý nghĩa                                                         |
|------------|-----------------------------------------------------------------|
| `id`       | Dùng trên URL (`member.html#minh`), viết liền không dấu (vd. `minh`)                 |
| `name`     | Tên hiển thị                                                    |
| `role`     | Vai trò trong team                                              |
| `tagline`  | Câu slogan ngắn                                                 |
| `color`    | Màu chủ đạo (mã hex) — dùng cho glow và điểm nhấn               |
| `photo`    | Không bắt buộc — mặc định dùng `images/members/<id>.webp`         |
| `bio`      | Đoạn giới thiệu                                                 |
| `stats`    | Các con số nổi bật `{ value, label }`                            |
| `skills`   | Danh sách kỹ năng                                               |
| `projects` | Những thứ đã làm `{ title, year, description, tags, link?, image? }` |
| `socials`  | Link mạng xã hội `{ label, url }`                                |

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
index.html          Trang chủ
member.html         Trang cá nhân (dùng chung cho cả 5 người)
css/style.css       Toàn bộ giao diện
js/data.js          ← DỮ LIỆU CỦA TEAM
js/common.js        Tiện ích + hiệu ứng chuyển trang
js/home.js          Logic trang chủ (hover / sáng / click)
js/member.js        Render trang cá nhân
photos/             Ảnh gốc (bỏ ảnh vào đây)
images/members/     Ảnh đã tách nền (tự sinh)
tools/              Script tách nền
.github/workflows/  Tự tách nền khi push ảnh
```
