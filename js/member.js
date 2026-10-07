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
    document.body.style.setProperty("--accent", m.color);

    const stats = (m.stats || [])
      .map(
        (s) => `
        <div class="stat">
          <span class="stat-value">${escapeHTML(s.value)}</span>
          <span class="stat-label">${escapeHTML(s.label)}</span>
        </div>`
      )
      .join("");

    const skills = (m.skills || []).map((s) => `<li>${escapeHTML(s)}</li>`).join("");

    const socials = (m.socials || [])
      .map((s) => {
        const label = s.label || SOCIAL_LABELS[s.platform] || s.platform;
        const external = !s.url.startsWith("mailto:");
        return `<a href="${escapeHTML(s.url)}"${external ? ' target="_blank" rel="noopener"' : ""}>${escapeHTML(label)} ↗</a>`;
      })
      .join("");

    const bio = [].concat(m.bio || []).map((p) => `<p class="hero-bio">${escapeHTML(p)}</p>`).join("");

    // Mới nhất lên đầu; mục không có ngày xuống cuối.
    const works = [...(m.works || [])].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    const projects = works
      .map((w, i) => {
        const tags = (w.tags || []).map((t) => `<span>${escapeHTML(t)}</span>`).join("");
        const image = w.image ? `<img class="project-image" src="${escapeHTML(w.image)}" alt="" loading="lazy" />` : "";
        const links = (w.links || [])
          .map((l) => `<a class="project-link" href="${escapeHTML(l.url)}" target="_blank" rel="noopener">${escapeHTML(l.label)} ↗</a>`)
          .join("");
        return `
          <article class="project reveal${w.featured ? " is-featured" : ""}" style="--d:${i}">
            ${image}
            <div class="project-head">
              <span class="project-type">${escapeHTML(WORK_TYPES[w.type || "project"] || w.type)}</span>
              <span class="project-year">${escapeHTML(formatDate(w.date))}</span>
            </div>
            <h3 class="project-title">${escapeHTML(w.title)}</h3>
            ${w.role ? `<p class="project-role">${escapeHTML(w.role)}</p>` : ""}
            ${w.summary ? `<p class="project-desc">${escapeHTML(w.summary)}</p>` : ""}
            ${tags || links ? `<div class="project-foot"><div class="project-tags">${tags}</div>${links ? `<div class="project-links">${links}</div>` : ""}</div>` : ""}
          </article>`;
      })
      .join("");

    document.getElementById("profile").innerHTML = `
      <section class="hero">
        <div class="hero-photo">
          <img src="${escapeHTML(memberPhoto(m))}" data-photo-color="${escapeHTML(m.color)}" alt="Ảnh của ${escapeHTML(m.name)}" />
        </div>

        <div class="hero-content">
          <p class="eyebrow">${escapeHTML(m.role)}</p>
          <h1 class="hero-name">${escapeHTML(m.name)}</h1>
          <p class="hero-tagline">${escapeHTML(m.tagline)}</p>
          ${bio}

          ${stats ? `<div class="stats">${stats}</div>` : ""}

          ${skills ? `<h2 class="label">Kỹ năng</h2><ul class="skills">${skills}</ul>` : ""}

          ${socials ? `<div class="socials">${socials}</div>` : ""}
        </div>
      </section>

      ${
        projects
          ? `<section class="works">
               <h2 class="section-title"><span>Những thứ đã làm được</span></h2>
               <div class="projects">${projects}</div>
             </section>`
          : ""
      }

      <nav class="member-nav" aria-label="Thành viên khác">
        <a href="member.html#${encodeURIComponent(prev.id)}" data-transition style="--c:${escapeHTML(prev.color)}">
          <small>← Trước</small><span>${escapeHTML(prev.name)}</span>
        </a>
        <a href="member.html#${encodeURIComponent(next.id)}" data-transition style="--c:${escapeHTML(next.color)}">
          <small>Tiếp →</small><span>${escapeHTML(next.name)}</span>
        </a>
      </nav>
    `;

    attachPhotoFallbacks(document.getElementById("profile"));

    // Hiện dần các thẻ dự án khi cuộn tới.
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  })
  .catch(showLoadError);
