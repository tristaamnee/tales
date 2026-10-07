(function () {
  const roster = document.getElementById("roster");
  document.getElementById("team-name").textContent = TEAM.name;
  document.getElementById("team-tagline").textContent = TEAM.tagline;
  document.title = `${TEAM.name} — Our Team`;

  roster.innerHTML = TEAM.members
    .map(
      (m, i) => `
      <a class="card" href="member.html#${encodeURIComponent(m.id)}"
         style="--accent:${escapeHTML(m.color)}; --i:${i}"
         aria-label="${escapeHTML(m.name)} — ${escapeHTML(m.role)}">
        <div class="card-media">
          <img src="${escapeHTML(m.photo)}" alt="" loading="eager" />
        </div>
        <span class="card-index">${pad2(i + 1)}</span>
        <div class="card-info">
          <span class="card-role">${escapeHTML(m.role)}</span>
          <span class="card-name">${escapeHTML(m.name)}</span>
        </div>
        <span class="card-line" aria-hidden="true"></span>
      </a>`
    )
    .join("");

  const cards = [...roster.querySelectorAll(".card")];

  let current = null;

  function activate(card) {
    if (card === current) return;
    current = card;
    cards.forEach((c) => c.classList.toggle("is-active", c === card));
    roster.classList.toggle("has-active", Boolean(card));
    document.body.style.setProperty("--glow", card ? card.style.getPropertyValue("--accent") : "transparent");
  }

  // Màn hình hẹp (điện thoại): thẻ xếp dọc, cuộn tới thẻ nào thì thẻ đó sáng.
  const stacked = window.matchMedia("(max-width: 760px)");

  function lightCardAtCenter() {
    const mid = window.innerHeight / 2;
    let best = null;
    let bestDist = Infinity;
    for (const card of cards) {
      const r = card.getBoundingClientRect();
      const dist = Math.abs(r.top + r.height / 2 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = card;
      }
    }
    activate(best);
  }

  let ticking = false;
  function onScroll() {
    if (!stacked.matches || ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      lightCardAtCenter();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  stacked.addEventListener("change", () => (stacked.matches ? lightCardAtCenter() : activate(null)));
  if (stacked.matches) lightCardAtCenter();

  // Màn hình rộng: hover chuột để sáng, click để vào trang.
  // Màn hình rộng nhưng cảm ứng (tablet): chạm lần 1 để sáng, chạm lần 2 để vào trang.
  let firstTouch = false;

  cards.forEach((card) => {
    card.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse" && !stacked.matches) activate(card);
    });
    card.addEventListener("pointerdown", (e) => {
      firstTouch = e.pointerType !== "mouse" && !stacked.matches && !card.classList.contains("is-active");
    });
    card.addEventListener("focus", () => activate(card));
    card.addEventListener("click", (e) => {
      e.preventDefault();
      if (firstTouch) {
        firstTouch = false;
        activate(card);
        return;
      }
      navigateWithTransition(card.getAttribute("href"));
    });
  });

  roster.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse" && !stacked.matches) activate(null);
  });
  roster.addEventListener("focusout", (e) => {
    if (!stacked.matches && !roster.contains(e.relatedTarget)) activate(null);
  });
})();
