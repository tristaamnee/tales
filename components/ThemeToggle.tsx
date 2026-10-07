"use client";

import { useEffect, useState } from "react";

// "auto" theo máy; "light"/"dark" là lựa chọn của người xem, lưu trong localStorage.
type Theme = "auto" | "light" | "dark";
const KEY = "tales-theme";
const ORDER: Theme[] = ["auto", "light", "dark"];
const LABELS: Record<Theme, string> = { auto: "Tự động", light: "Sáng", dark: "Tối" };

// Chạy trong <head> trước khi vẽ trang để không bị nháy sáng/tối.
export const themeInitScript = `try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

function readTheme(): Theme {
  try {
    const t = localStorage.getItem(KEY) as Theme | null;
    return t && ORDER.includes(t) ? t : "auto";
  } catch {
    return "auto";
  }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "auto") delete root.dataset.theme;
  else root.dataset.theme = theme;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(root).getPropertyValue("--canvas").trim();
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("auto");

  useEffect(() => {
    const t = readTheme();
    setTheme(t);
    applyTheme(t);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(readTheme());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];

  function cycle() {
    try {
      if (next === "auto") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {}
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={cycle}
      aria-label={`Giao diện: ${LABELS[theme]}. Bấm để chuyển sang ${LABELS[next]}.`}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor" />
      </svg>
      <span>{LABELS[theme]}</span>
    </button>
  );
}
