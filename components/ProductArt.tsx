import type { ProductArt as Art } from "@/lib/content";

// Hình minh họa phẳng cho sản phẩm chưa có ảnh. Màu lấy từ class (token CSS) nên tự đổi theo sáng/tối:
// .pa-1 cam, .pa-2 hồng, .pa-3 vàng nắng, .pa-4 kem, .pa-line nét viền.
const SHAPES: Record<Art, React.ReactNode> = {
  candle: (
    <>
      <path className="pa-1" d="M100 40c10 14 14 24 6 34-4 5-12 5-16 0-8-10-2-20 10-34z" />
      <path className="pa-line" d="M100 76v14" />
      <rect className="pa-2" x="62" y="88" width="76" height="82" rx="14" />
      <rect className="pa-4" x="74" y="112" width="52" height="34" rx="6" />
      <circle className="pa-1" cx="100" cy="129" r="7" />
    </>
  ),
  mug: (
    <>
      <path className="pa-line" d="M82 46c-8 8 8 14 0 24M102 40c-8 8 8 14 0 24M122 46c-8 8 8 14 0 24" />
      <path className="pa-line pa-thick" d="M140 100c22 0 22 40 0 40" />
      <rect className="pa-1" x="56" y="82" width="88" height="88" rx="16" />
      <circle className="pa-3" cx="100" cy="126" r="16" />
    </>
  ),
  vase: (
    <>
      <path className="pa-line" d="M100 92V58M100 74l-16-14M100 70l18-16" />
      <circle className="pa-1" cx="84" cy="56" r="10" />
      <circle className="pa-3" cx="120" cy="50" r="10" />
      <circle className="pa-2" cx="100" cy="46" r="11" />
      <path className="pa-2" d="M84 90h32c0 10 18 22 18 44 0 22-14 36-34 36s-34-14-34-36c0-22 18-34 18-44z" />
      <rect className="pa-4" x="70" y="126" width="60" height="10" rx="5" />
    </>
  ),
  tote: (
    <>
      <path className="pa-line pa-thick" d="M78 82c0-30 44-30 44 0" />
      <path className="pa-4 pa-edge" d="M56 80h88l8 92H48z" />
      <circle className="pa-1" cx="100" cy="128" r="18" />
      <path
        className="pa-line"
        d="M100 98v-6M100 164v-6M70 128h-6M136 128h-6M79 107l-4-4M125 153l-4-4M79 149l-4 4M125 103l-4 4"
      />
    </>
  ),
  case: (
    <>
      <rect className="pa-2" x="66" y="34" width="68" height="134" rx="16" />
      <rect className="pa-4" x="76" y="44" width="26" height="30" rx="8" />
      <circle className="pa-line-fill" cx="84" cy="54" r="4" />
      <circle className="pa-line-fill" cx="94" cy="64" r="4" />
      <g className="pa-1" transform="translate(100 122)">
        <ellipse rx="7" ry="13" cy="-12" />
        <ellipse rx="7" ry="13" cy="-12" transform="rotate(72)" />
        <ellipse rx="7" ry="13" cy="-12" transform="rotate(144)" />
        <ellipse rx="7" ry="13" cy="-12" transform="rotate(216)" />
        <ellipse rx="7" ry="13" cy="-12" transform="rotate(288)" />
      </g>
      <circle className="pa-3" cx="100" cy="122" r="6" />
    </>
  ),
  earrings: (
    <>
      <path className="pa-line" d="M74 40c-10 0-10 16 0 16M126 40c-10 0-10 16 0 16" />
      <circle className="pa-3" cx="74" cy="66" r="10" />
      <circle className="pa-3" cx="126" cy="66" r="10" />
      <path className="pa-1" d="M74 80c16 22 20 38 0 52-20-14-16-30 0-52z" />
      <path className="pa-2" d="M126 80c16 22 20 38 0 52-20-14-16-30 0-52z" />
    </>
  ),
  notebook: (
    <>
      <rect className="pa-2" x="58" y="38" width="88" height="128" rx="10" />
      <rect className="pa-1" x="58" y="38" width="18" height="128" rx="8" />
      <rect className="pa-4" x="90" y="62" width="42" height="22" rx="5" />
      <path className="pa-line" d="M96 112h34M96 126h34M96 140h22" />
      <rect className="pa-3" x="128" y="38" width="10" height="44" />
    </>
  ),
  // Móc treo đồ: hình mặc định khi chưa có ảnh (tủ đồ chủ yếu là quần áo).
  hanger: (
    <>
      <path className="pa-line" d="M100 58v-6c0-6 10-6 10-14s-6-12-12-12-11 4-11 10" />
      <path className="pa-line pa-thick" d="M100 58 46 88h108z" />
      <path className="pa-2" d="M84 88c4 7 28 7 32 0l8 22-10 6 22 58H64l22-58-10-6z" />
      <rect className="pa-1" x="80" y="114" width="40" height="9" rx="4.5" />
      <circle className="pa-3" cx="100" cy="148" r="7" />
    </>
  ),
  card: (
    <>
      <path className="pa-4 pa-edge" d="M44 70h112v86H44z" />
      <path className="pa-1" d="M44 70l56 48 56-48z" />
      <path className="pa-2" d="M100 150c-22-14-30-26-22-36 6-7 16-5 22 3 6-8 16-10 22-3 8 10 0 22-22 36z" />
    </>
  ),
};

export default function ProductArt({ art = "hanger" }: { art?: Art }) {
  return (
    <svg className="product-art" viewBox="0 0 200 200" aria-hidden="true">
      {SHAPES[art]}
    </svg>
  );
}
