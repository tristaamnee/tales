// Đọc danh sách sản phẩm từ Google Sheet (dùng cho cả lúc build lẫn trên trình duyệt, không đụng tới fs).
// Sheet phải chia sẻ "Bất kỳ ai có đường liên kết đều xem được"; mỗi dòng là một sản phẩm, dòng đầu là tên cột.
import type { Product, ProductArt, StoreCategory, StoreSheet } from "./content";
import { asset } from "./format";

export type ProductView = Product & { imageSrc?: string };
export type SheetProducts = { products: ProductView[]; categories: StoreCategory[]; skipped: string[] };

export function sheetCsvUrl(sheet: StoreSheet): string {
  const tab = sheet.tab ? `&sheet=${encodeURIComponent(sheet.tab)}` : "";
  return `https://docs.google.com/spreadsheets/d/${sheet.id}/gviz/tq?tqx=out:csv&headers=1${tab}`;
}

// "Sổ tay Hoa Cúc" -> "so-tay-hoa-cuc"
export function slug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') (cell += '"'), i++;
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") row.push(cell), (cell = "");
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell), rows.push(row), (row = []), (cell = "");
    } else cell += ch;
  }
  if (cell || row.length) row.push(cell), rows.push(row);
  return rows;
}

// Tên cột trong Sheet (viết hoa/thường, có dấu hay không đều được) -> trường của sản phẩm.
const COLUMNS: Record<string, keyof Product | "hidden"> = {
  ma: "id",
  ten: "name",
  tensanpham: "name",
  danhmuc: "category",
  loai: "category",
  gia: "price",
  giaban: "price",
  giagoc: "compareAt",
  mota: "description",
  nhan: "badge",
  noibat: "featured",
  hethang: "soldOut",
  anh: "image",
  hinhanh: "image",
  linkanh: "image",
  minhhoa: "art",
  maunen: "tint",
  link: "url",
  linkshopee: "url",
  shopee: "url",
  linkmua: "url",
  an: "hidden",
};

// Chữ trong cột "Minh họa" (hoặc trong tên sản phẩm) -> hình minh họa khi chưa có ảnh.
const ART_WORDS: [RegExp, ProductArt][] = [
  [/\bnen\b/, "candle"],
  [/\b(coc|ly|tach)\b/, "mug"],
  [/\b(binh|lo hoa)\b/, "vase"],
  [/\b(tui|tote)\b/, "tote"],
  [/\bop\b/, "case"],
  [/\b(bong tai|khuyen tai|trang suc|vong|nhan bac)\b/, "earrings"],
  [/\b(so tay|vo|but)\b/, "notebook"],
  [/\b(thiep|qua)\b/, "card"],
];
const TINTS: Record<string, Product["tint"]> = { cam: "peach", hong: "pink", vang: "sun" };
const TINT_CYCLE: NonNullable<Product["tint"]>[] = ["peach", "pink", "sun"];

const plain = (s: string) => slug(s).replace(/-/g, " ");
const yes = (s: string) => /^(x|co|yes|true|1|v)$/.test(plain(s)) || s.trim() === "✓";

// "120.000₫", "120,000", "120k" -> 120000
function money(s: string): number | undefined {
  const digits = s.replace(/[^\d]/g, "");
  if (!digits) return undefined;
  return Number(digits) * (/k\s*$/i.test(s.trim()) ? 1000 : 1);
}

// Link chia sẻ Google Drive -> link ảnh hiển thị được trên web. Chỉ nhận https:// hoặc đường dẫn trong public/
// (không nhận javascript:, data:, http:, //host, ../), link khác coi như không có ảnh.
function imageUrl(s: string): string | undefined {
  const drive = s.match(/^https:\/\/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
  if (drive) return `https://lh3.googleusercontent.com/d/${drive[1]}`;
  if (/^https:\/\/[^\s"'<>]+$/i.test(s)) return s;
  if (/^[a-z0-9][\w-]*(\/[\w-]+)*\.(webp|jpe?g|png|avif|gif)$/i.test(s)) return asset(s);
  return undefined;
}

export function productsFromCsv(text: string): SheetProducts {
  const [head = [], ...rows] = parseCsv(text.replace(/^﻿/, ""));
  const fields = head.map((h) => COLUMNS[slug(h).replace(/-/g, "")]);
  const products: ProductView[] = [];
  const categories: StoreCategory[] = [];
  const skipped: string[] = [];

  rows.forEach((cells, i) => {
    const row: Partial<Record<keyof Product | "hidden", string>> = {};
    fields.forEach((f, c) => f && cells[c]?.trim() && (row[f] = cells[c].trim()));
    if (!Object.keys(row).length || (row.hidden && yes(row.hidden))) return;

    const line = `dòng ${i + 2}`;
    const price = row.price ? money(row.price) : undefined;
    if (!row.name) return void skipped.push(`${line}: thiếu tên`);
    if (price === undefined) return void skipped.push(`${line} (${row.name}): thiếu giá hoặc giá không phải số`);

    const label = row.category || "Khác";
    const category = slug(label) || "khac";
    if (!categories.some((c) => c.id === category)) categories.push({ id: category, label });

    let id = slug(row.id || row.name) || `sp-${i + 2}`;
    if (products.some((p) => p.id === id)) id += `-${i + 2}`;

    const compareAt = row.compareAt ? money(row.compareAt) : undefined;
    const artText = plain(row.art || row.name);
    const p: ProductView = {
      id,
      name: row.name,
      category,
      price,
      art: ART_WORDS.find(([re]) => re.test(artText))?.[1] || "hanger",
      tint: TINTS[plain(row.tint || "")] || TINT_CYCLE[products.length % TINT_CYCLE.length],
    };
    if (compareAt && compareAt > price) p.compareAt = compareAt;
    if (row.description) p.description = row.description;
    if (row.badge) p.badge = row.badge;
    if (row.featured && yes(row.featured)) p.featured = true;
    if (row.soldOut && yes(row.soldOut)) p.soldOut = true;
    if (row.url && /^https:\/\/[^\s"'<>]+$/i.test(row.url)) p.url = row.url;
    else if (row.url) skipped.push(`${line} (${row.name}): link mua phải bắt đầu bằng https://`);
    const image = row.image && imageUrl(row.image);
    if (image) p.imageSrc = image;
    else if (row.image) skipped.push(`${line} (${row.name}): link ảnh không hợp lệ, dùng hình minh họa`);
    products.push(p);
  });

  return { products, categories, skipped };
}
