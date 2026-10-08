import type { Metadata, Viewport } from "next";
import { themeInitScript } from "@/components/ThemeToggle";
import { getTeam } from "@/lib/content";
// Font tự host từ gói @fontsource: file font nằm sẵn trong node_modules và được đóng gói cùng site,
// nên lúc build không phải tải từ Google Fonts (từng làm build trên GitHub Actions lỗi) và người xem
// cũng không gọi tới Google. Mỗi file CSS chia theo bảng chữ (latin, tiếng Việt…), trình duyệt chỉ tải phần cần.
import "@fontsource/be-vietnam-pro/300.css";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource-variable/source-serif-4/opsz.css"; // cỡ quang học: chữ to tự mảnh và thanh hơn
import "@fontsource-variable/source-serif-4/opsz-italic.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/600.css";
import "./globals.css";

const team = getTeam();

export const metadata: Metadata = {
  title: { default: `${team.name} — Our Team`, template: `%s — ${team.name}` },
  description: team.description,
  icons: {
    icon:
      "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2212%22 fill=%22%231d1d1f%22/%3E%3Cpath d=%22M16 16h32v8H36v26h-8V24H16z%22 fill=%22none%22 stroke=%22%23ffffff%22 stroke-width=%222.5%22 stroke-linejoin=%22round%22/%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
