"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { useNav } from "./nav";

// Link nội bộ: bấm thường thì chỉ đổi state theo slug (tức thì);
// Ctrl/Cmd/Shift-click hay chuột giữa vẫn mở tab mới như một link bình thường.
export default function AppLink({
  to,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const { go, href } = useNav();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    go(to);
  }

  return <a href={href(to)} onClick={handleClick} {...props} />;
}
