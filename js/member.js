(function () {
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
    .map((s) => `<a href="${escapeHTML(s.url)}" target="_blank" rel="noopener">${escapeHTML(s.label)} ↗</a>`)
    .join("");

  const projects = (m.projects || [])
    .map((p, i) => {
      const tags = (p.tags || []).map((t) => `<span>${escapeHTML(t)}</span>`).join("");
      const image = p.image ? `<img class="project-image" src="${escapeHTML(p.image)}" alt="" loading="lazy" />` : "";
      const link = p.link
        ? `<a class="project-link" href="${escapeHTML(p.link)}" target="_blank" rel="noopener">Xem thêm ↗</a>`
        : "";
      return `
        <article class="project reveal" style="--d:${i}">
          ${image}
          <div class="project-head">
            <span class="project-no">${pad2(i + 1)}</span>
            <span class="project-year">${escapeHTML(p.year)}</span>
          </div>
          <h3 class="project-title">${escapeHTML(p.title)}</h3>
          <p class="project-desc">${escapeHTML(p.description)}</p>
          <div class="project-foot">
            <div class="project-tags">${tags}</div>
            ${link}
          </div>
        </article>`;
    })
    .join("");

  document.getElementById("profile").innerHTML = `
    <section class="hero">
      <div class="hero-photo">
        <img src="${escapeHTML(memberPhoto(m))}" data-photo-color="${escapeHTML(m.color)}" alt="Ảnh của ${escapeHTML(m.name)}" />
        <span class="hero-index">${pad2(index + 1)}</span>
      </div>

      <div class="hero-content">
        <p class="eyebrow">${escapeHTML(m.role)}</p>
        <h1 class="hero-name">${escapeHTML(m.name)}</h1>
        <p class="hero-tagline">${escapeHTML(m.tagline)}</p>
        <p class="hero-bio">${escapeHTML(m.bio)}</p>

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
})();
