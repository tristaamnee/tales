import Roster from "@/components/Roster";
import ThemeToggle from "@/components/ThemeToggle";
import { getTeam, memberPhoto } from "@/lib/content";
import { asset, placeholderPhoto } from "@/lib/format";

export default function HomePage() {
  const team = getTeam();
  const members = team.members.map((m) => {
    const photo = memberPhoto(m);
    return {
      id: m.id,
      name: m.name,
      role: m.role,
      color: m.color,
      photo: photo ? asset(photo) : placeholderPhoto(m.color),
    };
  });

  return (
    <div className="page-home">
      <a className="skip-link" href="#roster">
        Bỏ qua tới danh sách thành viên
      </a>

      <div className="home-tools">
        <ThemeToggle />
      </div>

      <main>
        <header className="hero">
          <h1 className="hero-title" translate="no">
            {team.name}
          </h1>
          {team.tagline && <p className="hero-tagline">{team.tagline}</p>}
        </header>

        <Roster members={members} shuffle={team.shuffle} />
      </main>

      <footer className="foot">
        <p>
          <span translate="no">{team.name}</span> · {team.members.length} thành viên
        </p>
      </footer>
    </div>
  );
}
