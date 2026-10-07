// Tiện ích dùng chung cho cả 2 trang.

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Ảnh thành viên: mặc định lấy images/members/<id>.webp (ảnh đã tách nền bằng tools/process_photos.py).
// Có thể ghi đè bằng trường photo trong dữ liệu.
function memberPhoto(m) {
  return m.photo || `images/members/${m.id}.webp`;
}

// Bóng người đổ màu theo thành viên, dùng khi chưa có ảnh.
function placeholderPhoto(color) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200">` +
    `<g fill="none" stroke="${color}" stroke-opacity=".8" stroke-width="3">` +
    `<path d="M90 1200C105 960 240 840 450 832C660 840 795 960 810 1200Z"/>` +
    `<path d="M383 705H517L528 848C480 878 420 878 372 848Z"/>` +
    `<ellipse cx="450" cy="540" rx="168" ry="202"/></g></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

// Gắn ảnh dự phòng cho các <img data-photo-color="..."> khi ảnh thật chưa có hoặc lỗi.
function attachPhotoFallbacks(root) {
  root.querySelectorAll("img[data-photo-color]").forEach((img) => {
    img.addEventListener("error", () => (img.src = placeholderPhoto(img.dataset.photoColor)), { once: true });
  });
}

// Hiệu ứng chuyển trang: fade-out rồi mới điều hướng.
function navigateWithTransition(url) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    window.location.href = url;
    return;
  }
  document.body.classList.add("is-leaving");
  setTimeout(() => (window.location.href = url), 450);
}

document.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-transition]");
  if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  navigateWithTransition(link.getAttribute("href"));
});

// Khi bấm Back của trình duyệt, trang có thể được lấy từ bfcache với class is-leaving.
window.addEventListener("pageshow", () => document.body.classList.remove("is-leaving"));

// ---- Chế độ sáng / tối ----
// "auto" theo máy; "light"/"dark" là lựa chọn của người xem, lưu trong localStorage.
const THEME_KEY = "tales-theme";
const THEME_ORDER = ["auto", "light", "dark"];
const THEME_LABELS = { auto: "Tự động", light: "Sáng", dark: "Tối" };
const THEME_ICON =
  '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
  '<path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor"/></svg>';

function getTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return THEME_ORDER.includes(t) ? t : "auto";
  } catch {
    return "auto";
  }
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "auto") delete root.dataset.theme;
  else root.dataset.theme = theme;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(root).getPropertyValue("--canvas").trim();

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
    btn.innerHTML = `${THEME_ICON}<span>${THEME_LABELS[theme]}</span>`;
    btn.setAttribute("aria-label", `Giao diện: ${THEME_LABELS[theme]}. Bấm để chuyển sang ${THEME_LABELS[next]}.`);
  });
}

document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const current = getTheme();
    const next = THEME_ORDER[(THEME_ORDER.indexOf(current) + 1) % THEME_ORDER.length];
    try {
      if (next === "auto") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, next);
    } catch {}
    applyTheme(next);
  });
});

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => applyTheme(getTheme()));
applyTheme(getTheme());
