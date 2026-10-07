"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLeaveTransition } from "./TransitionLink";

export type RosterMember = {
  id: string;
  name: string;
  role: string;
  color: string;
  photo: string; // đường dẫn ảnh hoặc data URI bóng người
};

function shuffled<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 5 thẻ ở trang chủ.
// Màn hình rộng: hover chuột để sáng, click để vào trang.
// Màn hình rộng nhưng cảm ứng (tablet): chạm lần 1 để sáng, chạm lần 2 để vào trang.
// Màn hình hẹp (điện thoại): thẻ xếp dọc, cuộn tới thẻ nào thì thẻ đó sáng.
export default function Roster({ members, shuffle }: { members: RosterMember[]; shuffle?: boolean }) {
  const [order, setOrder] = useState(members);
  const [ready, setReady] = useState(!shuffle);
  const [active, setActive] = useState<string | null>(null);
  const rosterRef = useRef<HTMLDivElement>(null);
  const firstTouch = useRef(false);
  const leave = useLeaveTransition();

  // Xáo thứ tự sau khi tải (không xáo lúc build để HTML tĩnh và trình duyệt khớp nhau).
  useEffect(() => {
    if (shuffle) setOrder(shuffled(members));
    setReady(true);
  }, [members, shuffle]);

  const stacked = useMemo(
    () => (typeof window === "undefined" ? null : window.matchMedia("(max-width: 760px)")),
    []
  );

  // Điện thoại: thẻ gần giữa màn hình nhất sẽ sáng.
  useEffect(() => {
    if (!stacked || !ready) return;
    const roster = rosterRef.current!;
    let ticking = false;

    const lightCenter = () => {
      const mid = window.innerHeight / 2;
      let best: string | null = null;
      let bestDist = Infinity;
      roster.querySelectorAll<HTMLElement>(".card").forEach((card) => {
        const r = card.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = card.dataset.id!;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!stacked.matches || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        lightCenter();
      });
    };
    const onChange = () => (stacked.matches ? lightCenter() : setActive(null));

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    stacked.addEventListener("change", onChange);
    if (stacked.matches) lightCenter();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      stacked.removeEventListener("change", onChange);
    };
  }, [stacked, ready, order]);

  const isStacked = () => Boolean(stacked?.matches);

  return (
    <div
      ref={rosterRef}
      className={`roster${active ? " has-active" : ""}`}
      id="roster"
      aria-label="Thành viên"
      tabIndex={-1}
      data-ready={ready}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse" && !isStacked()) setActive(null);
      }}
      onBlur={(e) => {
        if (!isStacked() && !e.currentTarget.contains(e.relatedTarget as Node | null)) setActive(null);
      }}
    >
      {order.map((m, i) => (
        <Link
          key={m.id}
          href={`/thanh-vien/${m.id}/`}
          className={`card${active === m.id ? " is-active" : ""}`}
          data-id={m.id}
          style={{ "--accent": m.color, "--i": i } as CSSProperties}
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse" && !isStacked()) setActive(m.id);
          }}
          onPointerDown={(e) => {
            firstTouch.current = e.pointerType !== "mouse" && !isStacked() && active !== m.id;
          }}
          onFocus={() => setActive(m.id)}
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            if (firstTouch.current) {
              firstTouch.current = false;
              setActive(m.id);
              return;
            }
            leave(`/thanh-vien/${m.id}/`);
          }}
        >
          <span className="card-tile">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.photo} alt="" width={900} height={1200} fetchPriority="high" />
          </span>
          <span className="card-name" title={m.name}>
            {m.name}
          </span>
          <span className="card-role" title={m.role}>
            {m.role}
          </span>
        </Link>
      ))}
    </div>
  );
}
