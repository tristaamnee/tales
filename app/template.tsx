"use client";

import { useEffect } from "react";

// template.tsx được tạo lại mỗi lần chuyển trang: trang mới hiện dần lên,
// và bỏ trạng thái "đang rời trang" của trang trước.
export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.remove("is-leaving");
  }, []);
  return <div className="page-fade">{children}</div>;
}
