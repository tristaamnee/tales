import LegacyRedirect from "@/components/LegacyRedirect";
import { getTeam } from "@/lib/content";

type Props = { params: Promise<{ id: string }> };

// Link cũ /thanh-vien/<id>/ → /<id>/
export function generateStaticParams() {
  return getTeam().members.map((m) => ({ id: m.id }));
}

export const dynamicParams = false;

export default async function OldMemberPage({ params }: Props) {
  const id = (await params).id;
  return <LegacyRedirect to={`../../${id}/`} label={`/${id}/`} />;
}
