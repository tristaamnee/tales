"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

const LEAVE_MS = 350;

// Chuyển trang có hiệu ứng mờ dần (fade-out rồi mới điều hướng).
export function useLeaveTransition() {
  const router = useRouter();
  return (href: string) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      router.push(href);
      return;
    }
    document.body.classList.add("is-leaving");
    setTimeout(() => router.push(href), LEAVE_MS);
  };
}

export default function TransitionLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const leave = useLeaveTransition();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    leave(href);
  }

  return <Link href={href} onClick={handleClick} {...props} />;
}
