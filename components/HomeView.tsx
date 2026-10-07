"use client";

import type { MemberView, TeamView } from "@/lib/content";
import Roster from "./Roster";
import ThemeToggle from "./ThemeToggle";

export default function HomeView({
  team,
  members,
  ready,
  intro,
}: {
  team: TeamView;
  members: MemberView[];
  ready: boolean;
  intro: boolean;
}) {
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

        <Roster members={members} ready={ready} intro={intro} />
      </main>

      <footer className="foot">
        <p>
          <span translate="no">{team.name}</span> · {team.members.length} thành viên
        </p>
      </footer>
    </div>
  );
}
