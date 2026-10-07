import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <h1>Không tìm thấy trang</h1>
      <p>Trang này không tồn tại hoặc đã được đổi địa chỉ.</p>
      <Link className="back-link" href="/">
        Về trang chủ
      </Link>
    </main>
  );
}
