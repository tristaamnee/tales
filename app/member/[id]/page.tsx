import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TalesApp from "@/components/TalesApp";
import { getMember, getTeam, getTeamView } from "@/lib/content";

type Props = { params: Promise<{ id: string }> };

// Mỗi thành viên có một trang HTML dựng sẵn (mở link trực tiếp, F5, chia sẻ link, Google đọc được).
// Khi đã ở trong site, chuyển giữa các người chỉ đổi state (components/TalesApp.tsx), không tải trang này.
export function generateStaticParams() {
  return getTeam().members.map((m) => ({ id: m.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = getMember((await params).id);
  return m ? { title: m.name, description: m.tagline || m.role } : {};
}

export default async function MemberPage({ params }: Props) {
  if (!getMember((await params).id)) notFound();
  return <TalesApp team={getTeamView()} />;
}
