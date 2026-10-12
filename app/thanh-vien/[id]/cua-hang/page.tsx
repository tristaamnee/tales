import LegacyRedirect from "@/components/LegacyRedirect";
import { getStore, getTeam } from "@/lib/content";

type Props = { params: Promise<{ id: string }> };

// Link cũ /thanh-vien/<id>/cua-hang/ → /<id>/store/
export function generateStaticParams() {
  return getTeam()
    .members.filter((m) => getStore(m.id))
    .map((m) => ({ id: m.id }));
}

export const dynamicParams = false;

export default async function OldStorePage({ params }: Props) {
  const id = (await params).id;
  return <LegacyRedirect to={`../../../${id}/store/`} label={`/${id}/store/`} />;
}
