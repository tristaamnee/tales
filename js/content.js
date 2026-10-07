// Tải nội dung từ content/team.json và content/members/<id>.json.

async function fetchJSON(url) {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Không tải được ${url} (HTTP ${res.status})`);
  try {
    return await res.json();
  } catch {
    throw new Error(`${url} không phải JSON hợp lệ (thừa/thiếu dấu phẩy hoặc ngoặc?)`);
  }
}

async function loadTeam() {
  const team = await fetchJSON("content/team.json");
  const members = await Promise.all(
    team.members.map((id) => fetchJSON(`content/members/${encodeURIComponent(id)}.json`))
  );
  return { ...team, members };
}

function showLoadError(err) {
  console.error(err);
  const hint =
    location.protocol === "file:"
      ? "Trình duyệt không cho đọc file JSON khi mở trực tiếp. Hãy chạy <code>python3 -m http.server</code> trong thư mục dự án rồi mở <code>http://localhost:8000</code>."
      : escapeHTML(err.message);
  const box = document.createElement("div");
  box.className = "load-error";
  box.innerHTML = `<strong>Không tải được dữ liệu team</strong><p>${hint}</p>`;
  document.body.append(box);
}
