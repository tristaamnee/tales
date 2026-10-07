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
| `photo`    | Đường dẫn ảnh chân dung                                         |
| `bio`      | Đoạn giới thiệu                                                 |
| `stats`    | Các con số nổi bật `{ value, label }`                            |
| `skills`   | Danh sách kỹ năng                                               |
| `projects` | Những thứ đã làm `{ title, year, description, tags, link?, image? }` |
| `socials`  | Link mạng xã hội `{ label, url }`                                |

## Thay ảnh

1. Bỏ ảnh vào `images/members/` (vd. `minh.jpg`).
2. Sửa `photo` trong `js/data.js` thành `"images/members/minh.jpg"`.

Mẹo để trông ngầu hơn:
- Dùng ảnh **dọc, tỉ lệ khoảng 3:4**, mặt nằm ở 1/3 phía trên khung.
- Ảnh **nền tối hoặc đã tách nền** (PNG trong suốt trên nền đen) sẽ cho hiệu ứng "bật sáng" đẹp nhất.
- Cùng góc chụp / ánh sáng cho cả 5 người để trang chủ đồng bộ.

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
images/members/     Ảnh thành viên (đang là ảnh placeholder)
```
