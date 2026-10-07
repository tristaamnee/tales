// Đọc nội dung từ content/*.json lúc build (chỉ chạy phía server).
import fs from "node:fs";
import path from "node:path";
import { asset, duration, placeholderPhoto } from "./format";

export type Stat = { value: string; label: string };
export type Social = { platform: string; url: string; label?: string };
export type Work = {
  type?: "project" | "award" | "talk" | "cert" | "article" | "other";
  title: string;
  date?: string;
  role?: string;
  summary?: string;
  tags?: string[];
  image?: string;
  links?: { label: string; url: string }[];
  featured?: boolean;
};
export type Job = {
  company: string;
  title: string;
  start?: string;
  end?: string;
  location?: string;
  highlights?: string[];
};
export type Education = { school: string; degree?: string; start?: string; end?: string; note?: string };
export type Certification = {
  name: string;
  issuer?: string;
  date?: string;
  status?: "done" | "in-progress";
  note?: string;
};
export type SkillGroup = { label: string; items: string[] };

export type Member = {
  id: string;
  name: string;
  role: string;
  color: string;
  tagline?: string;
  photo?: string;
  style?: "default" | "finance" | "developer";
  draft?: boolean;
  location?: string;
  cv?: string;
  bio?: string[];
  stats?: Stat[];
  skills?: string[];
  skillGroups?: SkillGroup[];
  languages?: { name: string; level?: string }[];
  experience?: Job[];
  education?: Education[];
  certifications?: Certification[];
  works?: Work[];
  socials?: Social[];
};

export type Team = {
  name: string;
  tagline?: string;
  description?: string;
  shuffle?: boolean;
  members: Member[];
};

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");
const PUBLIC = path.join(ROOT, "public");

function readJSON<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

export function getTeam(): Team {
  const team = readJSON<Omit<Team, "members"> & { members: string[] }>(path.join(CONTENT, "team.json"));
  const members = team.members.map((id) => readJSON<Member>(path.join(CONTENT, "members", `${id}.json`)));
  return { ...team, members };
}

export function getMember(id: string): Member | undefined {
  return getTeam().members.find((m) => m.id === id);
}

// Ảnh thành viên: trường photo nếu có, không thì public/images/members/<id>.webp (ảnh tự tách nền).
// Chưa có ảnh → null, giao diện hiện bóng người theo màu của người đó.
export function memberPhoto(m: Member): string | null {
  const src = m.photo || `images/members/${m.id}.webp`;
  return fs.existsSync(path.join(PUBLIC, src)) ? src : null;
}

// Dữ liệu gửi xuống trình duyệt: cả team (5 người, vài KB) nạp một lần,
// để chuyển giữa trang chủ và trang từng người chỉ là đổi state, không tải gì thêm.
export type JobView = Job & { tenure: string };
export type MemberView = Omit<Member, "experience"> & { photoSrc: string; experience?: JobView[] };
export type TeamView = Omit<Team, "members"> & { members: MemberView[] };

export function getTeamView(): TeamView {
  const team = getTeam();
  return {
    ...team,
    members: team.members.map((m) => {
      const photo = memberPhoto(m);
      return {
        ...m,
        photoSrc: photo ? asset(photo) : placeholderPhoto(m.color),
        // Tính sẵn lúc build; trình duyệt tính lại theo hôm nay (components/Tenure.tsx).
        experience: m.experience?.map((j) => ({ ...j, tenure: duration(j.start, j.end) })),
      };
    }),
  };
}
