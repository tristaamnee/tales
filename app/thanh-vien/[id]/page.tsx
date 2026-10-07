import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import Tenure from "@/components/Tenure";
import ThemeToggle from "@/components/ThemeToggle";
import TransitionLink from "@/components/TransitionLink";
import { getMember, getTeam, memberPhoto, type SkillGroup } from "@/lib/content";
import { SOCIAL_LABELS, WORK_TYPES, asset, duration, formatDate, period, placeholderPhoto } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

// Mỗi thành viên trong content/team.json có một trang HTML riêng, tạo sẵn lúc build.
export function generateStaticParams() {
  return getTeam().members.map((m) => ({ id: m.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = getMember((await params).id);
  return m ? { title: m.name, description: m.tagline || m.role } : {};
}

// Một mục của CV: tiêu đề bên trái, nội dung bên phải
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section className="cv-section" aria-labelledby={id}>
      <h2 className="cv-title" id={id}>
        {title}
      </h2>
      <div className="cv-body">{children}</div>
    </section>
  );
}

export default async function MemberPage({ params }: Props) {
  const team = getTeam();
  const m = getMember((await params).id);
  if (!m) notFound();

  const photo = memberPhoto(m);
  const works = [...(m.works || [])].sort((a, b) => (b.date || "").localeCompare(a.date || "")); // mới nhất lên đầu
  const groups: SkillGroup[] = [...(m.skillGroups || [])];
  if (m.languages?.length) {
    groups.push({ label: "Ngoại ngữ", items: m.languages.map((l) => (l.level ? `${l.name}: ${l.level}` : l.name)) });
  }
  const hasCV = Boolean(m.experience?.length || m.education?.length || m.certifications?.length || groups.length);

  return (
    <div className="page-member" data-style={m.style || "default"}>
      <a className="skip-link" href="#profile">
        Bỏ qua tới nội dung
      </a>

      <nav className="topbar" aria-label="Điều hướng">
        <TransitionLink className="wordmark" href="/" translate="no">
          {team.name}
        </TransitionLink>
        <div className="topbar-tools">
          <ThemeToggle />
          <TransitionLink className="back-link" href="/">
            Tất cả thành viên
          </TransitionLink>
        </div>
      </nav>

      <main id="profile" tabIndex={-1}>
        {m.draft && <p className="draft-note">Nội dung mẫu, sẽ được thay bằng thông tin thật.</p>}

        <section className="profile-hero">
          <figure className="portrait" style={{ "--accent": m.color } as CSSProperties}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo ? asset(photo) : placeholderPhoto(m.color)}
              alt={`Ảnh của ${m.name}`}
              width={900}
              height={1200}
              fetchPriority="high"
            />
          </figure>

          <div className="intro">
            <p className="role">
              {m.role}
              {m.location && <span className="location"> · {m.location}</span>}
            </p>
            <h1 className="name">{m.name}</h1>
            {m.tagline && <p className="tagline">{m.tagline}</p>}
            {m.bio?.length ? (
              <div className="bio">
                {m.bio.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            ) : null}
            {m.skills?.length && !groups.length ? (
              <div className="skills">
                <h2>Kỹ năng</h2>
                <ul>
                  {m.skills.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {m.socials?.length || m.cv ? (
              <div className="contact">
                {m.socials?.length ? (
                  <ul className="socials">
                    {m.socials.map((s) => {
                      const external = !s.url.startsWith("mailto:");
                      return (
                        <li key={s.url}>
                          <a href={s.url} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
                            {s.label || SOCIAL_LABELS[s.platform] || s.platform} <span aria-hidden="true">›</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
                {m.cv && (
                  <a className="cv-download" href={asset(m.cv)} target="_blank" rel="noopener">
                    Tải CV (PDF)
                  </a>
                )}
              </div>
            ) : null}
          </div>
        </section>

        {m.stats?.length ? (
          <section className="stats-band" aria-label="Số liệu chính">
            <dl className="stats">
              {m.stats.map((s) => (
                <div className="stat" key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {hasCV && (
          <div className="cv">
            {m.experience?.length ? (
              <Section id="cv-experience" title="Kinh nghiệm làm việc">
                <ol className="entries">
                  {m.experience.map((j) => (
                    <li className="entry" key={`${j.company}-${j.start}`}>
                      <p className="entry-when">
                        {period(j.start, j.end)}
                        {j.start && <Tenure start={j.start} end={j.end} initial={duration(j.start, j.end)} />}
                      </p>
                      <div className="entry-body">
                        <h3 className="entry-title">{j.title}</h3>
                        <p className="entry-org">{[j.company, j.location].filter(Boolean).join(" · ")}</p>
                        {j.highlights?.length ? (
                          <ul className="entry-points">
                            {j.highlights.map((h) => (
                              <li key={h}>{h}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </Section>
            ) : null}

            {m.education?.length ? (
              <Section id="cv-education" title="Học vấn">
                <ol className="entries">
                  {m.education.map((e) => (
                    <li className="entry" key={e.school}>
                      <p className="entry-when">{period(e.start, e.end, "")}</p>
                      <div className="entry-body">
                        <h3 className="entry-title">{e.school}</h3>
                        {e.degree && <p className="entry-org">{e.degree}</p>}
                        {e.note && <p className="entry-note">{e.note}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </Section>
            ) : null}

            {m.certifications?.length ? (
              <Section id="cv-certs" title="Chứng chỉ">
                <ul className="certs">
                  {m.certifications.map((c) => (
                    <li className="cert" key={c.name}>
                      <span className="cert-name">{c.name}</span>
                      <span className="cert-issuer">
                        {c.issuer}
                        {c.note && ` · ${c.note}`}
                      </span>
                      <span className="cert-date">{c.status === "in-progress" ? "Đang học" : formatDate(c.date)}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}

            {groups.length ? (
              <Section id="cv-skills" title="Kỹ năng">
                <div className="skill-groups">
                  {groups.map((g) => (
                    <div className="skill-group" key={g.label}>
                      <h3>{g.label}</h3>
                      <ul>
                        {g.items.map((i) => (
                          <li key={i}>{i}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Section>
            ) : null}
          </div>
        )}

        {works.length ? (
          <section className="works-band" aria-labelledby="works-title">
            <div className="works">
              <h2 id="works-title">Những thứ đã làm được</h2>
              <ol className="work-list">
                {works.map((w) => {
                  const meta = [WORK_TYPES[w.type || "project"] || w.type, w.role].filter(Boolean).join(" · ");
                  return (
                    <li className={`work${w.featured ? " is-featured" : ""}`} key={w.title}>
                      <p className="work-date">{w.date && <time dateTime={w.date}>{formatDate(w.date)}</time>}</p>
                      <div className="work-body">
                        <h3 className="work-title">{w.title}</h3>
                        <p className="work-meta">{meta}</p>
                        {w.summary && <p className="work-summary">{w.summary}</p>}
                        {w.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="work-image" src={asset(w.image)} alt={w.title} width={1600} height={900} loading="lazy" />
                        )}
                        {w.tags?.length ? <p className="work-tags">{w.tags.join(", ")}</p> : null}
                        {w.links?.length ? (
                          <p className="work-links">
                            {w.links.map((l) => (
                              <a key={l.url} href={l.url} target="_blank" rel="noopener">
                                {l.label} <span aria-hidden="true">›</span>
                              </a>
                            ))}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
