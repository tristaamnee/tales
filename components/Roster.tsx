"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { MemberView } from "@/lib/content";
import { useNav } from "./nav";

// 5 thẻ ở trang chủ.
// Màn hình rộng: hover chuột để sáng, click để vào trang.
// Màn hình rộng nhưng cảm ứng (tablet): chạm lần 1 để sáng, chạm lần 2 để vào trang.
// Màn hình hẹp (điện thoại): thẻ xếp dọc, cuộn tới thẻ nào thì thẻ đó sáng.
export default function Roster({ members, ready, intro }: { members: MemberView[]; ready: boolean; intro: boolean }) {
  const [active, setActive] = useState<string | null>(null);
  const rosterRef = useRef<HTMLDivElement>(null);
  const firstTouch = useRef(false);
  const { go, href } = useNav();

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
  }, [stacked, ready, members]);

  const isStacked = () => Boolean(stacked?.matches);

  return (
    <div
      ref={rosterRef}
      className={`roster${active ? " has-active" : ""}${intro ? "" : " no-intro"}`}
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
      {members.map((m, i) => {
        const path = `/thanh-vien/${m.id}/`;
        return (
          <a
            key={m.id}
            href={href(path)}
            className={`card${active === m.id ? " is-active" : ""}`}
            data-id={m.id}
            data-style={m.style}
            style={{ "--accent": m.color, "--i": i } as CSSProperties}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse" && !isStacked()) setActive(m.id);
            }}
            onPointerDown={(e) => {
              firstTouch.current = e.pointerType !== "mouse" && !isStacked() && active !== m.id;
            }}
            onFocus={() => setActive(m.id)}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              if (firstTouch.current) {
                firstTouch.current = false;
                setActive(m.id);
                return;
              }
              go(path);
            }}
          >
            <span className={`card-tile${m.bgSrc ? " has-bg" : ""}`}>
              {/* Hai lớp cùng khung: ảnh gốc làm nền (mờ đi khi sáng lên) và người đã tách nền ở trên (luôn rõ) */}
              {m.bgSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="card-bg" src={m.bgSrc} alt="" width={900} height={1200} />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="card-person" src={m.photoSrc} alt="" width={900} height={1200} fetchPriority="high" />
              {/* Câu nói hiện khi sáng lên; ai chưa có câu nói thì dùng slogan */}
              {(m.quote || m.tagline) && (
                <span className="card-quote">{m.quote ? `“${m.quote}”` : m.tagline}</span>
              )}
            </span>
            <span className="card-name" title={m.name}>
              {m.name}
            </span>
            <span className="card-role" title={m.role}>
              {m.role}
            </span>
          </a>
        );
      })}
    </div>
  );
}
