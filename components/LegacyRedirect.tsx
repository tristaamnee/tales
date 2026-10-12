// Trang chuyển hướng cho link cũ (vd /thanh-vien/<id>/ → /<id>/).
// Dùng đường dẫn tương đối nên đúng cả khi site nằm trong thư mục con (basePath).
export default function LegacyRedirect({ to, label }: { to: string; label: string }) {
  return (
    <main className="not-found">
      <meta httpEquiv="refresh" content={`0; url=${to}`} />
      <meta name="robots" content="noindex" />
      <script dangerouslySetInnerHTML={{ __html: `location.replace(${JSON.stringify(to).replace(/</g, "\\u003c")})` }} />
      <p>
        Trang đã chuyển sang địa chỉ mới: <a href={to}>{label}</a>
      </p>
    </main>
  );
}
