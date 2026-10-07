---
name: design-md-library
description: Thư viện DESIGN.md (VoltAgent/awesome-design-md) — hệ thống thiết kế phân tích từ ~74 trang web nổi tiếng (Stripe, Apple, Linear, Tesla, Spotify, Nike, PlayStation…). Dùng khi người dùng muốn giao diện "giống/theo phong cách" một thương hiệu hay trang web cụ thể, nhắc tới DESIGN.md, hoặc muốn xem các phong cách có sẵn để chọn.
---

# Thư viện DESIGN.md

Nguồn: https://github.com/VoltAgent/awesome-design-md (MIT). Mỗi mục là một file `DESIGN.md` mô tả màu, typography,
spacing, component, motion… của một trang web, ở dạng AI đọc được.

## Có những gì

`airbnb`, `airtable`, `apple`, `binance`, `bmw`, `bmw-m`, `bugatti`, `cal`, `claude`, `clay`, `clickhouse`, `cohere`, `coinbase`, `composio`, `cursor`, `dell-1996`, `elevenlabs`, `expo`, `ferrari`, `figma`, `framer`, `hashicorp`, `hp`, `ibm`, `intercom`, `kraken`, `lamborghini`, `linear.app`, `lovable`, `mastercard`, `meta`, `minimax`, `mintlify`, `miro`, `mistral.ai`, `mongodb`, `nike`, `nintendo-2001`, `notion`, `nvidia`, `ollama`, `opencode.ai`, `pinterest`, `playstation`, `posthog`, `raycast`, `renault`, `replicate`, `resend`, `revolut`, `runwayml`, `sanity`, `sentry`, `shopify`, `slack`, `spacex`, `spotify`, `starbucks`, `stripe`, `supabase`, `superhuman`, `tesla`, `theverge`, `together.ai`, `uber`, `vercel`, `vodafone`, `voltagent`, `warp`, `webflow`, `wired`, `wise`, `x.ai`, `zapier`

Danh sách có thể đã thay đổi: nếu tên cần tìm không có ở trên, xem lại thư mục `design-md/` trên GitHub.

## Cách dùng

1. **Chọn phong cách.** Nếu người dùng chưa chọn, gợi ý 3–4 cái hợp với dự án (kèm một dòng mô tả cảm giác của từng cái) và hỏi.
2. **Tải đúng file cần dùng** (không tải cả thư viện):

   ```bash
   curl -fsSL https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/<tên>/DESIGN.md
   ```

   Muốn so sánh vài phong cách thì tải từng file rồi đọc phần đầu (`description`, `colors`, `typography`).
3. **Áp dụng:**
   - Chỉ tham khảo cho một việc → đọc rồi áp dụng, không cần lưu.
   - Dùng làm định hướng lâu dài cho dự án → lưu thành `DESIGN.md` ở gốc repo (ghi nguồn ở dòng đầu) để các phiên sau cũng theo.
   - Dự án đã có giao diện riêng → chỉ lấy những gì người dùng muốn (bảng màu, kiểu chữ, nhịp spacing…) và chuyển vào token/CSS sẵn có, không đập đi làm lại trừ khi được yêu cầu.

## Lưu ý

- Đây là bản **phân tích phong cách**, không phải bộ nhận diện chính thức. Lấy *cảm giác thiết kế*; không dùng logo, tên thương hiệu
  hay câu chữ của thương hiệu đó, và không làm trang trông như trang chính thức của họ.
- Font độc quyền (Söhne, SF Pro, Circular…) thường không dùng được trên web: thay bằng font Google Fonts gần nhất và nói rõ đã thay.
- Với nội dung tiếng Việt, kiểm tra font thay thế có đủ dấu (Be Vietnam Pro, Inter, Manrope, Oswald, Montserrat… đều có).
