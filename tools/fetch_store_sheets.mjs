// Tải sẵn Google Sheet sản phẩm của các cửa hàng có "sheet" (content/stores/<id>.json) vào .sheet-cache/<id>.csv,
// để HTML dựng sẵn đã có hàng. Chạy tự động trước `npm run build`. Lỗi mạng thì chỉ cảnh báo, không chặn build:
// trang khi đó dùng products trong JSON (nếu có) và trình duyệt vẫn tự đọc Sheet.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const STORES = path.join(ROOT, "content", "stores");
const CACHE = path.join(ROOT, ".sheet-cache");

fs.rmSync(CACHE, { recursive: true, force: true });
const files = fs.existsSync(STORES) ? fs.readdirSync(STORES).filter((f) => f.endsWith(".json")) : [];

for (const file of files) {
  const { member, sheet } = JSON.parse(fs.readFileSync(path.join(STORES, file), "utf8"));
  if (!sheet?.id) continue;
  // Giống sheetCsvUrl() trong lib/sheet.ts
  const tab = sheet.tab ? `&sheet=${encodeURIComponent(sheet.tab)}` : "";
  const url = `https://docs.google.com/spreadsheets/d/${sheet.id}/gviz/tq?tqx=out:csv&headers=1${tab}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const text = await res.text();
    if (!res.ok || /^\s*</.test(text)) throw new Error(`HTTP ${res.status} — Sheet đã chia sẻ "Bất kỳ ai có đường liên kết" chưa?`);
    fs.mkdirSync(CACHE, { recursive: true });
    fs.writeFileSync(path.join(CACHE, `${member}.csv`), text);
    console.log(`Sheet sản phẩm của ${member}: ${text.trim().split("\n").length - 1} dòng`);
  } catch (e) {
    console.warn(`⚠ Không tải được Sheet sản phẩm của ${member}: ${e.message}`);
  }
}
