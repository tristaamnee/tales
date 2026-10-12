"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { MemberView, StoreView as Store } from "@/lib/content";
import AppLink from "./AppLink";
import ProductArt from "./ProductArt";
import ThemeToggle from "./ThemeToggle";
import { productsFromCsv, sheetCsvUrl } from "@/lib/sheet";

type Product = Store["products"][number];
type Cart = Record<string, number>; // id sản phẩm -> số lượng

const vnd = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

// Giỏ hàng chỉ lưu trên trình duyệt của người xem (tiện quay lại vẫn còn), không gửi đi đâu.
// `ready` = đã có danh sách sản phẩm mới nhất; chỉ khi đó mới bỏ các món đã hết hàng/không còn bán,
// kẻo xoá nhầm món mới thêm trên Sheet mà bản dựng sẵn chưa có.
function useCart(key: string, products: Product[], ready: boolean) {
  const [cart, setCart] = useState<Cart>({});
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(key) || "{}");
      if (saved && typeof saved === "object") {
        // Chỉ nhận { id: số nguyên dương }, phòng dữ liệu hỏng/bị sửa tay.
        const ok = ([id, q]: [string, unknown]) => /^[a-z0-9-]+$/.test(id) && Number.isInteger(q) && (q as number) > 0;
        setCart(Object.fromEntries(Object.entries(saved).filter(ok).map(([id, q]) => [id, Math.min(q as number, 99)])));
      }
    } catch {}
    loaded.current = true;
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    setCart((c) => {
      const valid = Object.entries(c).filter(([id, q]) => q > 0 && products.some((p) => p.id === id && !p.soldOut));
      return valid.length === Object.keys(c).length ? c : Object.fromEntries(valid);
    });
  }, [ready, products]);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(cart));
    } catch {}
  }, [key, cart]);
  const add = (id: string, n = 1) => setCart((c) => ({ ...c, [id]: Math.min(99, Math.max(0, (c[id] || 0) + n)) }));
  const remove = (id: string) =>
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  return { cart, add, remove };
}

// Cửa hàng có Google Sheet: đọc lại mỗi lần mở trang để thấy ngay sản phẩm mới sửa.
type Live = { status: "static" | "loading" | "ok" | "error"; products: Product[]; categories: Store["categories"] };

function useLiveProducts(store: Store): Live {
  const [live, setLive] = useState<Live>({
    status: store.sheet ? "loading" : "static",
    products: store.products,
    categories: store.categories,
  });
  useEffect(() => {
    if (!store.sheet) return;
    const ctrl = new AbortController();
    fetch(sheetCsvUrl(store.sheet), { cache: "no-store", signal: ctrl.signal })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((text) => {
        const { products, categories, skipped } = productsFromCsv(text);
        if (skipped.length) console.warn("Sheet sản phẩm: bỏ qua", skipped);
        setLive({ status: "ok", products, categories });
      })
      .catch((e) => {
        if (ctrl.signal.aborted) return;
        console.warn("Không đọc được Sheet sản phẩm, dùng bản dựng sẵn.", e);
        setLive((l) => ({ ...l, status: "error" }));
      });
    return () => ctrl.abort();
  }, [store.sheet]);
  return live;
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Ảnh lỗi (link Drive hết quyền, gõ sai…) thì quay về hình minh họa.
function Thumb({ p }: { p: Product }) {
  const [broken, setBroken] = useState<string>();
  const img = useRef<HTMLImageElement>(null);
  // Ảnh có thể lỗi trước khi React kịp gắn onError (HTML dựng sẵn) → kiểm tra lại khi gắn.
  useEffect(() => {
    const el = img.current;
    if (el?.complete && !el.naturalWidth) setBroken(p.imageSrc);
  }, [p.imageSrc]);
  return (
    <span className="product-thumb" data-tint={p.tint || "peach"}>
      {p.imageSrc && broken !== p.imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={img} src={p.imageSrc} alt="" loading="lazy" onError={() => setBroken(p.imageSrc)} />
      ) : (
        <ProductArt art={p.art} />
      )}
    </span>
  );
}

// Trang cửa hàng của một thành viên (phong cách Solar Pop). Dữ liệu: content/stores/<id>.json.
export default function StoreView({ store, member }: { store: Store; member: MemberView }) {
  const { status, products, categories } = useLiveProducts(store);
  const { cart, add, remove } = useCart(`tales-cart-${member.id}`, products, status === "static" || status === "ok");
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const catLabel = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.label])), [categories]);
  const featured = products.filter((p) => p.featured);
  const active = categories.some((c) => c.id === filter) ? filter : "all";
  const shown = active === "all" ? products : products.filter((p) => p.category === active);
  const lines = products.filter((p) => cart[p.id] > 0).map((p) => ({ p, qty: cart[p.id] }));
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.p.price, 0);

  const addToCart = (p: Product) => {
    if (p.soldOut) return;
    add(p.id);
    setJustAdded(p.id);
    window.setTimeout(() => setJustAdded((cur) => (cur === p.id ? null : cur)), 1400);
  };

  // Giỏ hàng mở: khoá cuộn trang, Esc để đóng, đưa focus vào giỏ.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const orderHref = useMemo(() => {
    const body = [
      `Chào ${store.name}, mình muốn đặt:`,
      "",
      ...lines.map((l) => `- ${l.p.name} × ${l.qty} = ${vnd(l.p.price * l.qty)}`),
      "",
      `Tạm tính: ${vnd(total)}`,
      "",
      "Họ tên:",
      "Số điện thoại:",
      "Địa chỉ nhận hàng:",
      "Ghi chú:",
    ].join("\n");
    return `mailto:${store.order.email}?subject=${encodeURIComponent(`Đơn hàng ${store.name}`)}&body=${encodeURIComponent(body)}`;
  }, [lines, total, store]);

  const memberPath = `/${member.id}/`;

  return (
    <div className="store" style={{ "--accent": member.color } as CSSProperties}>
      {store.announcement && <p className="store-announce">{store.announcement}</p>}

      <nav className="store-bar" aria-label="Cửa hàng">
        <button type="button" className="store-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          {store.name}
        </button>
        <ul className="store-nav">
          <li>
            <button type="button" onClick={() => scrollToId("san-pham")}>
              Sản phẩm
            </button>
          </li>
          {store.about && (
            <li>
              <button type="button" onClick={() => scrollToId("gioi-thieu")}>
                Giới thiệu
              </button>
            </li>
          )}
          <li>
            <button type="button" onClick={() => scrollToId("lien-he")}>
              Liên hệ
            </button>
          </li>
          <li>
            <AppLink to={memberPath}>Trang của {member.name.split(" ").pop()}</AppLink>
          </li>
        </ul>
        <div className="store-tools">
          <ThemeToggle />
          <button type="button" className="store-cart-btn" onClick={() => setOpen(true)} aria-haspopup="dialog">
            <span className="store-cart-label">Giỏ hàng</span> <span className="store-cart-count">{count}</span>
          </button>
        </div>
      </nav>

      <main>
        {/* ---- Đầu trang ---- */}
        <section className="store-hero">
          <div className="store-hero-text">
            <h1 className="store-headline">
              {store.headline.map((line) => (
                <span key={line}>{line}</span>
              ))}
              {store.script && <span className="store-script">{store.script}</span>}
            </h1>
            {store.intro && <p className="store-intro">{store.intro}</p>}
            <div className="store-actions">
              <button type="button" className="pill pill-solid" onClick={() => scrollToId("san-pham")}>
                Mua ngay <span aria-hidden="true">→</span>
              </button>
              <AppLink className="pill pill-ghost" to={memberPath}>
                Về {member.name.split(" ").pop()} <span aria-hidden="true">↗</span>
              </AppLink>
            </div>
          </div>
          <figure className="store-portrait">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={member.photoSrc} alt={`Ảnh của ${member.name}`} width={900} height={1200} fetchPriority="high" />
            {store.badge && <figcaption className="store-badge">{store.badge}</figcaption>}
          </figure>
        </section>

        {/* ---- Giới thiệu ---- */}
        {store.about && (
          <section className="store-about" id="gioi-thieu">
            <div className="store-about-art" aria-hidden="true">
              <ProductArt art="vase" />
            </div>
            <div className="store-about-text">
              <h2>{store.about.title}</h2>
              <p>{store.about.text}</p>
              {store.about.signature && <p className="store-signature">{store.about.signature} ♡</p>}
            </div>
            {store.about.promises?.length ? (
              <ul className="store-promises">
                {store.about.promises.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            ) : null}
          </section>
        )}

        {/* ---- Nổi bật ---- */}
        {featured.length > 0 && (
          <section className="store-featured" aria-labelledby="noi-bat">
            <div className="store-featured-head">
              <h2 id="noi-bat">Sản phẩm nổi bật</h2>
              <button type="button" className="pill pill-outline" onClick={() => scrollToId("san-pham")}>
                Xem tất cả <span aria-hidden="true">→</span>
              </button>
            </div>
            <ul className="featured-list">
              {featured.map((p) => (
                <li className="featured-card" key={p.id}>
                  <p className="product-cat">{catLabel[p.category]}</p>
                  <h3 className="featured-name">{p.name}</h3>
                  <p className="featured-price">{vnd(p.price)}</p>
                  <Thumb p={p} />
                  <button
                    type="button"
                    className="round-add"
                    onClick={() => addToCart(p)}
                    disabled={p.soldOut}
                    aria-label={`Thêm ${p.name} vào giỏ`}
                  >
                    {justAdded === p.id ? "✓" : "+"}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ---- Tất cả sản phẩm ---- */}
        <section className="store-catalog" id="san-pham" aria-labelledby="tat-ca">
          <div className="store-catalog-head">
            <h2 id="tat-ca">Tất cả sản phẩm</h2>
            <div className="chips" role="group" aria-label="Lọc theo loại">
              {[{ id: "all", label: "Tất cả" }, ...categories].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className="chip"
                  aria-pressed={active === c.id}
                  onClick={() => setFilter(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          {products.length === 0 && (
            <p className="store-empty" role="status">
              {status === "loading"
                ? "Đang tải sản phẩm…"
                : status === "error"
                  ? "Chưa tải được danh sách sản phẩm. Bạn thử tải lại trang nhé."
                  : "Tủ đang được sắp xếp lại, ghé lại sau nhé!"}
            </p>
          )}
          <ul className="product-grid">
            {shown.map((p) => (
              <li className="product-card" key={p.id}>
                <Thumb p={p} />
                {p.badge && <span className="product-badge">{p.badge}</span>}
                <p className="product-cat">{catLabel[p.category]}</p>
                <h3 className="product-name" title={p.name}>
                  {p.name}
                </h3>
                {p.description && (
                  <p className="product-desc" title={p.description}>
                    {p.description}
                  </p>
                )}
                <p className="product-price">
                  {vnd(p.price)}
                  {p.compareAt && <s>{vnd(p.compareAt)}</s>}
                </p>
                <button type="button" className="add-btn" onClick={() => addToCart(p)} disabled={p.soldOut}>
                  {p.soldOut ? "Hết hàng" : justAdded === p.id ? "Đã thêm ✓" : "Thêm vào giỏ"}
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* ---- Ưu đãi ---- */}
        {store.perks?.length ? (
          <section className="store-perks" aria-label="Ưu đãi">
            <dl>
              {store.perks.map((k) => (
                <div className="perk" key={k.label}>
                  <dt>{k.label}</dt>
                  <dd>{k.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {/* ---- Nhận xét (chỉ hiện khi có nhận xét thật) ---- */}
        {store.reviews?.length ? (
          <section className="store-reviews" aria-labelledby="nhan-xet">
            <h2 id="nhan-xet">Khách nói gì</h2>
            <ul>
              {store.reviews.map((r) => (
                <li key={r.name + r.quote}>
                  <blockquote>{r.quote}</blockquote>
                  <p>
                    — {r.name}
                    {r.note && <span> · {r.note}</span>}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ---- Cuối trang ---- */}
        <section className="store-closing" id="lien-he">
          <div className="store-closing-main">
            <p className="store-closing-head">
              {store.closing?.headline || "Ghé chơi nhé"}
              {store.closing?.script && <span className="store-script">{store.closing.script}</span>}
            </p>
            <ul className="store-contact">
              <li>
                <a href={`mailto:${store.order.email}`}>{store.order.email}</a>
              </li>
              {store.order.location && <li>{store.order.location}</li>}
            </ul>
          </div>
          <span className="store-sun" aria-hidden="true" />
          <div className="store-ask">
            <h2>{store.closing?.title || "Cần tư vấn?"}</h2>
            {store.closing?.text && <p>{store.closing.text}</p>}
            <a className="pill pill-solid" href={`mailto:${store.order.email}`}>
              Nhắn {member.name.split(" ").pop()} <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </main>

      {/* ---- Giỏ hàng ---- */}
      <div className={`cart-layer${open ? " is-open" : ""}`} aria-hidden={!open}>
        <button type="button" className="cart-scrim" tabIndex={-1} aria-label="Đóng giỏ hàng" onClick={() => setOpen(false)} />
        <div className="cart" role="dialog" aria-modal="true" aria-labelledby="cart-title" tabIndex={-1} ref={drawerRef}>
          <div className="cart-head">
            <h2 id="cart-title">Giỏ hàng</h2>
            <button type="button" className="cart-close" onClick={() => setOpen(false)} aria-label="Đóng">
              ×
            </button>
          </div>
          {lines.length === 0 ? (
            <p className="cart-empty">Giỏ đang trống. Chọn vài món xinh nhé!</p>
          ) : (
            <ul className="cart-lines">
              {lines.map(({ p, qty }) => (
                <li key={p.id}>
                  <Thumb p={p} />
                  <div>
                    <p className="cart-name">{p.name}</p>
                    <p className="cart-price">{vnd(p.price)}</p>
                    <div className="qty">
                      <button type="button" onClick={() => (qty > 1 ? add(p.id, -1) : remove(p.id))} aria-label="Bớt một">
                        −
                      </button>
                      <span aria-live="polite">{qty}</span>
                      <button type="button" onClick={() => add(p.id)} aria-label="Thêm một">
                        +
                      </button>
                    </div>
                  </div>
                  <button type="button" className="cart-remove" onClick={() => remove(p.id)} aria-label={`Bỏ ${p.name}`}>
                    Bỏ
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="cart-foot">
            <p className="cart-total">
              <span>Tạm tính</span>
              <strong>{vnd(total)}</strong>
            </p>
            {store.order.note && <p className="cart-note">{store.order.note}</p>}
            {lines.length > 0 ? (
              <a className="pill pill-solid cart-send" href={orderHref}>
                Gửi đơn qua email <span aria-hidden="true">→</span>
              </a>
            ) : (
              <button type="button" className="pill pill-solid cart-send" disabled>
                Gửi đơn qua email
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
