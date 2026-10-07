(function () {
  const roster = document.getElementById("roster");
  document.getElementById("team-name").textContent = TEAM.name;
  document.getElementById("team-tagline").textContent = TEAM.tagline;
  document.title = `${TEAM.name} — Our Team`;

  roster.innerHTML = TEAM.members
    .map(
      (m, i) => `
      <a class="card" href="member.html?id=${encodeURIComponent(m.id)}"
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

  function activate(card) {
    cards.forEach((c) => c.classList.toggle("is-active", c === card));
    roster.classList.toggle("has-active", Boolean(card));
    document.body.style.setProperty("--glow", card ? card.style.getPropertyValue("--accent") : "transparent");
  }

  // Chuột: hover để sáng, click để vào trang.
  // Cảm ứng: chạm lần 1 để sáng, chạm lần 2 để vào trang.
  let firstTouch = false;

  cards.forEach((card) => {
    card.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") activate(card);
    });
    card.addEventListener("pointerdown", (e) => {
      firstTouch = e.pointerType !== "mouse" && !card.classList.contains("is-active");
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
    if (e.pointerType === "mouse") activate(null);
  });
  roster.addEventListener("focusout", (e) => {
    if (!roster.contains(e.relatedTarget)) activate(null);
  });
})();
