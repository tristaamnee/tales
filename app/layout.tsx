import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { themeInitScript } from "@/components/ThemeToggle";
import { getTeam } from "@/lib/content";
import "./globals.css";

// Font được tải về lúc build và phục vụ cùng site (không gọi Google Fonts khi người xem mở trang).
const sans = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});
const serif = Source_Serif_4({
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  axes: ["opsz"], // cỡ quang học: chữ to tự mảnh và thanh hơn, giống bản gốc
  variable: "--font-serif",
  display: "swap",
  preload: false, // chỉ dùng ở trang cá nhân; TalesApp tải sẵn lúc trình duyệt rảnh
});
const mono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600"],
  variable: "--font-mono",
  display: "swap",
  preload: false, // chỉ dùng ở trang cá nhân; TalesApp tải sẵn lúc trình duyệt rảnh
});

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
    <html lang="vi" className={`${sans.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
