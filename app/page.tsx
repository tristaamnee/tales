import TalesApp from "@/components/TalesApp";
import { getTeamView } from "@/lib/content";

export default function HomePage() {
  return <TalesApp team={getTeamView()} />;
}
