import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TalesApp from "@/components/TalesApp";
import { getMember, getStore, getTeam, getTeamView } from "@/lib/content";

type Props = { params: Promise<{ id: string }> };

// Trang cửa hàng dựng sẵn cho thành viên nào có content/stores/<id>.json.
// Trong site, vào/ra cửa hàng cũng chỉ đổi state (components/TalesApp.tsx).
export function generateStaticParams() {
  return getTeam()
    .members.filter((m) => getStore(m.id))
    .map((m) => ({ id: m.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  const store = getStore(id);
  const m = getMember(id);
  return store && m ? { title: store.name, description: store.intro || `Cửa hàng của ${m.name}` } : {};
}

export default async function StorePage({ params }: Props) {
  const id = (await params).id;
  if (!getMember(id) || !getStore(id)) notFound();
  return <TalesApp team={getTeamView()} />;
}
