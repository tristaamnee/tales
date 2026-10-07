// Tiện ích dùng chung cho cả 2 trang.

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function pad2(n) {
  return String(n).padStart(2, "0");
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
