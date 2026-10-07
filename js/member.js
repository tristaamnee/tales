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
    const total = TEAM.members.length;
    const prev = TEAM.members[(index - 1 + total) % total];
    const next = TEAM.members[(index + 1) % total];

    document.title = `${m.name} — ${TEAM.name}`;
    document.getElementById("topbar-team").textContent = TEAM.name;

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

    document.getElementById("profile").innerHTML = `
      <section class="profile-hero">
        <figure class="portrait" style="--accent:${escapeHTML(m.color)}">
          <img src="${escapeHTML(memberPhoto(m))}" data-photo-color="${escapeHTML(m.color)}"
               alt="Ảnh của ${escapeHTML(m.name)}" width="900" height="1200" fetchpriority="high" />
        </figure>

        <div class="intro">
          <p class="role">${escapeHTML(m.role)}</p>
          <h1 class="name">${escapeHTML(m.name)}</h1>
          ${m.tagline ? `<p class="tagline">${escapeHTML(m.tagline)}</p>` : ""}
          ${bio ? `<div class="bio">${bio}</div>` : ""}
          ${skills ? `<div class="skills"><h2>Kỹ năng</h2><ul>${skills}</ul></div>` : ""}
          ${socials ? `<ul class="socials">${socials}</ul>` : ""}
        </div>
      </section>

      ${stats ? `<section class="stats-band" aria-label="Con số"><dl class="stats">${stats}</dl></section>` : ""}

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

      <nav class="member-nav" aria-label="Thành viên khác">
        <a href="member.html#${encodeURIComponent(prev.id)}" data-transition>
          <small>Trước</small><span>${escapeHTML(prev.name)}</span>
        </a>
        <a href="member.html#${encodeURIComponent(next.id)}" data-transition>
          <small>Tiếp theo</small><span>${escapeHTML(next.name)}</span>
        </a>
      </nav>
    `;

    attachPhotoFallbacks(document.getElementById("profile"));
  })
  .catch(showLoadError);
