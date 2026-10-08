"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { TeamView } from "@/lib/content";
import HomeView from "./HomeView";
import MemberView from "./MemberView";
import { NavContext } from "./nav";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

// "/thanh-vien/nhung/" -> "nhung"; trang chủ -> null
function slugOf(pathname: string): string | null {
  return pathname.match(/^\/thanh-vien\/([a-z0-9-]+)\/?$/)?.[1] ?? null;
}

function shuffled<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// useLayoutEffect chỉ chạy trên trình duyệt; lúc build (render sẵn HTML) dùng useEffect cho khỏi cảnh báo.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// Cả site là một ứng dụng: màn hình hiện tại = slug trên URL.
// Bấm chuyển người = đổi URL bằng history.pushState (Next.js tự cập nhật usePathname) → đổi state ngay,
// không tải trang, không chờ hiệu ứng. Mở link trực tiếp / F5 vẫn có trang HTML dựng sẵn cho từng slug.
export default function TalesApp({ team }: { team: TeamView }) {
  const slug = slugOf(usePathname());
  const member = slug ? team.members.find((m) => m.id === slug) : undefined;

  // Thứ tự trang chủ: xáo một lần cho cả phiên, quay lại trang chủ vẫn giữ nguyên.
  const [order, setOrder] = useState(() => team.members.map((m) => m.id));
  const [ready, setReady] = useState(!team.shuffle);
  useEffect(() => {
    if (team.shuffle) setOrder(shuffled(team.members.map((m) => m.id)));
    setReady(true);
  }, [team]);

  // Hiệu ứng thẻ lần lượt hiện lên chỉ chạy ở lần mở trang chủ đầu tiên.
  const [introDone, setIntroDone] = useState(false);
  useEffect(() => {
    if (slug) setIntroDone(true);
  }, [slug]);

  // Nhớ vị trí cuộn trang chủ để quay lại đúng chỗ.
  const homeScroll = useRef(0);
  const prevSlug = useRef(slug);
  useIsoLayoutEffect(() => {
    if (prevSlug.current === slug) return;
    window.scrollTo(0, slug ? 0 : homeScroll.current);
    prevSlug.current = slug;
  }, [slug]);

  // Khi trình duyệt rảnh: tải sẵn ảnh mọi người và các font chỉ dùng ở trang cá nhân
  // (chữ có chân cho phong cách tài chính, chữ code cho lập trình viên, kể cả phần dấu tiếng Việt),
  // để vào trang ai cũng hiện đủ ngay, không bị đổi font giữa chừng.
  useEffect(() => {
    const warm = () => {
      team.members.forEach((m) => (new Image().src = m.photoSrc));
      const css = getComputedStyle(document.documentElement);
      const sample = "Trương Thị Hồng Nhung Đặng Trí Tâm Kinh nghiệm 0123456789";
      for (const [v, styles] of [
        ["--font-serif", ["600 40px", "italic 400 20px", "400 20px"]],
        ["--font-mono", ["400 15px", "600 15px"]],
        ["--font-sans", ["300 17px", "400 17px", "600 17px"]],
        ["--font-display", ["400 40px"]],
        ["--font-script", ["600 30px"]],
      ] as const) {
        const family = css.getPropertyValue(v).trim();
        if (family) styles.forEach((st) => document.fonts.load(`${st} ${family}`, sample).catch(() => {}));
      }
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(warm);
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(warm, 300); // Safari cũ chưa có requestIdleCallback
    return () => clearTimeout(id);
  }, [team]);

  useEffect(() => {
    document.title = member ? `${member.name} — ${team.name}` : `${team.name} — Our Team`;
  }, [member, team.name]);

  const go = useCallback(
    (path: string) => {
      if (!slug) homeScroll.current = window.scrollY;
      window.history.pushState(null, "", BASE + path);
    },
    [slug]
  );
  const href = useCallback((path: string) => BASE + path, []);

  const members = order.map((id) => team.members.find((m) => m.id === id)!);

  return (
    <NavContext.Provider value={{ go, href }}>
      {/* key: đổi màn hình thì phần tử mới hiện dần lên rất nhanh (0,2 giây), không chờ màn cũ. */}
      <div className="view" key={slug ?? "home"}>
        {member ? (
          <MemberView member={member} teamName={team.name} />
        ) : (
          <HomeView team={team} members={members} ready={ready} intro={!introDone} />
        )}
      </div>
    </NavContext.Provider>
  );
}
