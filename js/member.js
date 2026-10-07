const WORK_TYPES = {
  project: "Dự án",
  award: "Giải thưởng",
  talk: "Diễn thuyết",
  cert: "Chứng chỉ",
  article: "Bài viết",
  other: "Khác",
};

const SOCIAL_LABELS = {
  github: "GitHub",
  gitlab: "GitLab",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X",
  behance: "Behance",
  dribbble: "Dribbble",
  website: "Website",
  email: "Email",
};

// "2026-03" -> "03/2026", "2026" -> "2026"
function formatDate(date) {
  if (!date) return "";
  const [y, mo] = date.split("-");
  return mo ? `${mo}/${y}` : y;
}

// Số tháng giữa hai mốc "YYYY-MM" (mốc cuối bỏ trống = hôm nay) -> "3 năm 7 tháng"
function duration(start, end) {
  if (!start) return "";
  const [sy, sm = "01"] = start.split("-").map(Number);
  const now = new Date();
  const [ey, em] = end ? end.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const months = (ey - sy) * 12 + ((em || 12) - sm) + 1;
  if (months <= 0) return "";
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y} năm`, m && `${m} tháng`].filter(Boolean).join(" ");
}

function period(start, end, ongoingLabel = "Hiện tại") {
  const a = start ? formatDate(start) : "";
  const b = end ? formatDate(end) : ongoingLabel;
  return a ? `${a} – ${b}` : b;
}

// Một mục của CV: tiêu đề bên trái, nội dung bên phải
function section(id, title, body, extraClass = "") {
  return `
    <section class="cv-section ${extraClass}" aria-labelledby="${id}">
      <h2 class="cv-title" id="${id}">${title}</h2>
      <div class="cv-body">${body}</div>
    </section>`;
}

loadTeam()
  .then((TEAM) => {
    // Hỗ trợ cả member.html#id lẫn member.html?id=id
    const id = decodeURIComponent(window.location.hash.slice(1)) || new URLSearchParams(window.location.search).get("id");
    const index = TEAM.members.findIndex((m) => m.id === id);

    // Bấm Trước/Tiếp chỉ đổi phần #id nên phải tự tải lại trang.
    window.addEventListener("hashchange", () => window.location.reload());

    if (index === -1) {
      window.location.replace("index.html");
      return;
    }

    const m = TEAM.members[index];

    document.title = `${m.name} — ${TEAM.name}`;
    document.getElementById("topbar-team").textContent = TEAM.name;
    document.body.dataset.style = m.style || "default";

    const stats = (m.stats || [])
      .map((s) => `<div class="stat"><dt>${escapeHTML(s.label)}</dt><dd>${escapeHTML(s.value)}</dd></div>`)
      .join("");

    const skills = (m.skills || []).map((s) => `<li>${escapeHTML(s)}</li>`).join("");

    const socials = (m.socials || [])
      .map((s) => {
        const label = s.label || SOCIAL_LABELS[s.platform] || s.platform;
        const external = !s.url.startsWith("mailto:");
        return `<li><a href="${escapeHTML(s.url)}"${external ? ' target="_blank" rel="noopener"' : ""}>${escapeHTML(label)} <span aria-hidden="true">›</span></a></li>`;
      })
      .join("");

    const bio = [].concat(m.bio || []).map((p) => `<p>${escapeHTML(p)}</p>`).join("");

    // Mới nhất lên đầu; mục không có ngày xuống cuối.
    const works = [...(m.works || [])]
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .map((w) => {
        const tags = (w.tags || []).map(escapeHTML).join(", ");
        const links = (w.links || [])
          .map((l) => `<a href="${escapeHTML(l.url)}" target="_blank" rel="noopener">${escapeHTML(l.label)} <span aria-hidden="true">›</span></a>`)
          .join("");
        const meta = [WORK_TYPES[w.type || "project"] || w.type, w.role].filter(Boolean).map(escapeHTML).join(" · ");
        return `
          <li class="work${w.featured ? " is-featured" : ""}">
            <p class="work-date">${w.date ? `<time datetime="${escapeHTML(w.date)}">${escapeHTML(formatDate(w.date))}</time>` : ""}</p>
            <div class="work-body">
              <h3 class="work-title">${escapeHTML(w.title)}</h3>
              <p class="work-meta">${meta}</p>
              ${w.summary ? `<p class="work-summary">${escapeHTML(w.summary)}</p>` : ""}
              ${w.image ? `<img class="work-image" src="${escapeHTML(w.image)}" alt="${escapeHTML(w.title)}" width="1600" height="900" loading="lazy" />` : ""}
              ${tags ? `<p class="work-tags">${tags}</p>` : ""}
              ${links ? `<p class="work-links">${links}</p>` : ""}
            </div>
          </li>`;
      })
      .join("");

    const experience = (m.experience || [])
      .map(
        (j) => `
          <li class="entry">
            <p class="entry-when">
              ${escapeHTML(period(j.start, j.end))}
              ${j.start ? `<span class="entry-sub">${escapeHTML(duration(j.start, j.end))}</span>` : ""}
            </p>
            <div class="entry-body">
              <h3 class="entry-title">${escapeHTML(j.title)}</h3>
              <p class="entry-org">${[j.company, j.location].filter(Boolean).map(escapeHTML).join(" · ")}</p>
              ${j.highlights?.length ? `<ul class="entry-points">${j.highlights.map((h) => `<li>${escapeHTML(h)}</li>`).join("")}</ul>` : ""}
            </div>
          </li>`
      )
      .join("");

    const education = (m.education || [])
      .map(
        (e) => `
          <li class="entry">
            <p class="entry-when">${escapeHTML(period(e.start, e.end, ""))}</p>
            <div class="entry-body">
              <h3 class="entry-title">${escapeHTML(e.school)}</h3>
              ${e.degree ? `<p class="entry-org">${escapeHTML(e.degree)}</p>` : ""}
              ${e.note ? `<p class="entry-note">${escapeHTML(e.note)}</p>` : ""}
            </div>
          </li>`
      )
      .join("");

    const certs = (m.certifications || [])
      .map(
        (c) => `
          <li class="cert">
            <span class="cert-name">${escapeHTML(c.name)}</span>
            <span class="cert-issuer">${escapeHTML(c.issuer || "")}${c.note ? ` · ${escapeHTML(c.note)}` : ""}</span>
            <span class="cert-date">${c.status === "in-progress" ? "Đang học" : escapeHTML(c.date ? formatDate(c.date) : "")}</span>
          </li>`
      )
      .join("");

    const groups = [...(m.skillGroups || [])];
    if (m.languages?.length) {
      groups.push({ label: "Ngoại ngữ", items: m.languages.map((l) => (l.level ? `${l.name}: ${l.level}` : l.name)) });
    }
    const skillGroups = groups
      .map(
        (g) => `
          <div class="skill-group">
            <h3>${escapeHTML(g.label)}</h3>
            <ul>${g.items.map((i) => `<li>${escapeHTML(i)}</li>`).join("")}</ul>
          </div>`
      )
      .join("");

    const cv = m.cv
      ? `<a class="cv-download" href="${escapeHTML(m.cv)}" target="_blank" rel="noopener">Tải CV (PDF)</a>`
      : "";

    document.getElementById("profile").innerHTML = `
      ${m.draft ? `<p class="draft-note">Nội dung mẫu, sẽ được thay bằng thông tin thật.</p>` : ""}

      <section class="profile-hero">
        <figure class="portrait" style="--accent:${escapeHTML(m.color)}">
          <img src="${escapeHTML(memberPhoto(m))}" data-photo-color="${escapeHTML(m.color)}"
               alt="Ảnh của ${escapeHTML(m.name)}" width="900" height="1200" fetchpriority="high" />
        </figure>

        <div class="intro">
          <p class="role">${escapeHTML(m.role)}${m.location ? `<span class="location"> · ${escapeHTML(m.location)}</span>` : ""}</p>
          <h1 class="name">${escapeHTML(m.name)}</h1>
          ${m.tagline ? `<p class="tagline">${escapeHTML(m.tagline)}</p>` : ""}
          ${bio ? `<div class="bio">${bio}</div>` : ""}
          ${skills && !skillGroups ? `<div class="skills"><h2>Kỹ năng</h2><ul>${skills}</ul></div>` : ""}
          ${socials || cv ? `<div class="contact">${socials ? `<ul class="socials">${socials}</ul>` : ""}${cv}</div>` : ""}
        </div>
      </section>

      ${stats ? `<section class="stats-band" aria-label="Số liệu chính"><dl class="stats">${stats}</dl></section>` : ""}

      ${
        experience || education || certs || skillGroups
          ? `<div class="cv">
               ${experience ? section("cv-experience", "Kinh nghiệm làm việc", `<ol class="entries">${experience}</ol>`) : ""}
               ${education ? section("cv-education", "Học vấn", `<ol class="entries">${education}</ol>`) : ""}
               ${certs ? section("cv-certs", "Chứng chỉ", `<ul class="certs">${certs}</ul>`) : ""}
               ${skillGroups ? section("cv-skills", "Kỹ năng", `<div class="skill-groups">${skillGroups}</div>`) : ""}
             </div>`
          : ""
      }

      ${
        works
          ? `<section class="works-band" aria-labelledby="works-title">
               <div class="works">
                 <h2 id="works-title">Những thứ đã làm được</h2>
                 <ol class="work-list">${works}</ol>
               </div>
             </section>`
          : ""
      }
    `;

    attachPhotoFallbacks(document.getElementById("profile"));
  })
  .catch(showLoadError);
