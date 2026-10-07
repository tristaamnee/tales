"use client";

import { useEffect, useState } from "react";
import { duration } from "@/lib/format";

// Thời gian làm việc ("3 năm 8 tháng"). Lúc build tính theo ngày build;
// trên trình duyệt tính lại theo hôm nay, để vị trí "Hiện tại" không bị cũ.
export default function Tenure({ start, end, initial }: { start: string; end?: string; initial: string }) {
  const [text, setText] = useState(initial);
  useEffect(() => setText(duration(start, end)), [start, end]);
  return <span className="entry-sub">{text}</span>;
}
