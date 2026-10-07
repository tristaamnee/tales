import TransitionLink from "@/components/TransitionLink";

export default function NotFound() {
  return (
    <main className="not-found">
      <h1>Không tìm thấy trang</h1>
      <p>Trang này không tồn tại hoặc đã được đổi địa chỉ.</p>
      <TransitionLink className="back-link" href="/">
        Về trang chủ
      </TransitionLink>
    </main>
  );
}
