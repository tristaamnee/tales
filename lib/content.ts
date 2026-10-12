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
  quote?: string;
  photo?: string;
  style?: "default" | "finance" | "developer" | "pop" | "editorial";
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

// Cửa hàng của một thành viên: content/stores/<id>.json (schema: content/schema/store.schema.json)
export type ProductArt = "candle" | "mug" | "vase" | "tote" | "case" | "earrings" | "notebook" | "card";
export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAt?: number;
  description?: string;
  badge?: string;
  featured?: boolean;
  image?: string;
  art?: ProductArt;
  tint?: "peach" | "pink" | "sun";
  soldOut?: boolean;
};
export type Store = {
  member: string;
  name: string;
  announcement?: string;
  headline: string[];
  script?: string;
  intro?: string;
  badge?: string;
  about?: { title: string; text: string; signature?: string; promises?: string[] };
  categories: { id: string; label: string }[];
  products: Product[];
  perks?: { value: string; label: string }[];
  reviews?: { quote: string; name: string; note?: string }[];
  order: { email: string; note?: string; location?: string };
  closing?: { headline?: string; script?: string; title?: string; text?: string };
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

export function getStore(id: string): Store | undefined {
  const file = path.join(CONTENT, "stores", `${id}.json`);
  return fs.existsSync(file) ? readJSON<Store>(file) : undefined;
}

// Ảnh gốc (còn nền) cắt cùng khung với ảnh tách nền, làm lớp nền cho thẻ ở trang chủ.
export function memberBackground(m: Member): string | null {
  if (m.photo) return null; // ảnh tự chọn thì không có bản nền đi kèm
  const src = `images/members/${m.id}-bg.webp`;
  return fs.existsSync(path.join(PUBLIC, src)) ? src : null;
}

// Dữ liệu gửi xuống trình duyệt: cả team (5 người, vài KB) nạp một lần,
// để chuyển giữa trang chủ và trang từng người chỉ là đổi state, không tải gì thêm.
export type JobView = Job & { tenure: string };
export type StoreView = Omit<Store, "products"> & { products: (Product & { imageSrc?: string })[] };
export type MemberView = Omit<Member, "experience"> & {
  photoSrc: string;
  bgSrc?: string;
  experience?: JobView[];
  store?: StoreView;
};
export type TeamView = Omit<Team, "members"> & { members: MemberView[] };

function storeView(id: string): StoreView | undefined {
  const store = getStore(id);
  if (!store) return undefined;
  return { ...store, products: store.products.map((p) => (p.image ? { ...p, imageSrc: asset(p.image) } : p)) };
}

export function getTeamView(): TeamView {
  const team = getTeam();
  return {
    ...team,
    members: team.members.map((m) => {
      const photo = memberPhoto(m);
      return {
        ...m,
        photoSrc: photo ? asset(photo) : placeholderPhoto(m.color),
        ...(photo && memberBackground(m) ? { bgSrc: asset(memberBackground(m)!) } : {}),
        // Tính sẵn lúc build; trình duyệt tính lại theo hôm nay (components/Tenure.tsx).
        experience: m.experience?.map((j) => ({ ...j, tenure: duration(j.start, j.end) })),
        store: storeView(m.id),
      };
    }),
  };
}
