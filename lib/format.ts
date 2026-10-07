// Tiện ích dùng chung cho cả server và client.

// Đường dẫn tới file trong public/, có tính basePath (khi site nằm trong thư mục con).
export function asset(src: string): string {
  if (/^(https?:|data:)/.test(src)) return src;
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/${src.replace(/^\//, "")}`;
}

// Bóng người đổ màu theo thành viên, dùng khi chưa có ảnh.
export function placeholderPhoto(color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200">` +
    `<g fill="none" stroke="${color}" stroke-opacity=".8" stroke-width="3">` +
    `<path d="M90 1200C105 960 240 840 450 832C660 840 795 960 810 1200Z"/>` +
    `<path d="M383 705H517L528 848C480 878 420 878 372 848Z"/>` +
    `<ellipse cx="450" cy="540" rx="168" ry="202"/></g></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

// "2026-03" -> "03/2026", "2026" -> "2026"
export function formatDate(date?: string): string {
  if (!date) return "";
  const [y, mo] = date.split("-");
  return mo ? `${mo}/${y}` : y;
}

export function period(start?: string, end?: string, ongoingLabel = "Hiện tại"): string {
  const a = start ? formatDate(start) : "";
  const b = end ? formatDate(end) : ongoingLabel;
  return a ? `${a} – ${b}` : b;
}

// Thời gian giữa hai mốc "YYYY-MM" (mốc cuối bỏ trống = hôm nay) -> "3 năm 7 tháng"
export function duration(start?: string, end?: string, now = new Date()): string {
  if (!start) return "";
  const [sy, sm = 1] = start.split("-").map(Number);
  const [ey, em] = end ? end.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const months = (ey - sy) * 12 + ((em || 12) - sm) + 1;
  if (months <= 0) return "";
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y} năm`, m && `${m} tháng`].filter(Boolean).join(" ");
}

export const WORK_TYPES: Record<string, string> = {
  project: "Dự án",
  award: "Giải thưởng",
  talk: "Diễn thuyết",
  cert: "Chứng chỉ",
  article: "Bài viết",
  other: "Khác",
};

export const SOCIAL_LABELS: Record<string, string> = {
  github: "GitHub",
  gitlab: "GitLab",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X",
  behance: "Behance",
  dribbble: "Dribbble",
  website: "Website",
  email: "Email",
};
