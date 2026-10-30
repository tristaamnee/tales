"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { MemberView, StoreView as Store } from "@/lib/content";
import AppLink from "./AppLink";
import ProductArt from "./ProductArt";
import ThemeToggle from "./ThemeToggle";
import { productsFromCsv, sheetCsvUrl } from "@/lib/sheet";

type Product = Store["products"][number];

const vnd = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + "₫";

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

// Bấm vào món → mở trang bán (Shopee…) ở tab mới; web không tự bán hay thanh toán.
// Chưa có link hoặc hết hàng thì thẻ không bấm được.
function buyLabel(p: Product): string {
  if (p.soldOut) return "Hết hàng";
  if (!p.url) return "Sắp mở bán";
  return "Mua ngay";
}

function ProductLink({ p, children }: { p: Product; children: React.ReactNode }) {
  return p.url && !p.soldOut ? (
    <a className="product-link" href={p.url} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <div className={`product-link is-off${p.soldOut ? " is-soldout" : ""}`}>{children}</div>
  );
}

// Trang cửa hàng của một thành viên (phong cách Solar Pop). Dữ liệu: content/stores/<id>.json.
export default function StoreView({ store, member }: { store: Store; member: MemberView }) {
  const { status, products, categories } = useLiveProducts(store);
  const [filter, setFilter] = useState<string>("all");

  const catLabel = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.label])), [categories]);
  const featured = products.filter((p) => p.featured);
  const active = categories.some((c) => c.id === filter) ? filter : "all";
  const shown = active === "all" ? products : products.filter((p) => p.category === active);

  // Bản cũ có giỏ hàng lưu trong trình duyệt; giờ mua qua Shopee nên dọn đi.
  useEffect(() => {
    try {
      localStorage.removeItem(`tales-cart-${member.id}`);
    } catch {}
  }, [member.id]);

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
                  <ProductLink p={p}>
                    <p className="product-cat">{catLabel[p.category]}</p>
                    <h3 className="featured-name">{p.name}</h3>
                    <p className="featured-price">
                      {vnd(p.price)}
                      {(p.soldOut || !p.url) && <span> · {buyLabel(p)}</span>}
                    </p>
                    <Thumb p={p} />
                    {p.url && !p.soldOut && (
                      <span className="round-go" aria-hidden="true">
                        ↗
                      </span>
                    )}
                  </ProductLink>
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
                <ProductLink p={p}>
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
                  <span className="add-btn">
                    {buyLabel(p)}
                    {p.url && !p.soldOut && <span aria-hidden="true"> ↗</span>}
                  </span>
                </ProductLink>
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
                <a href={`mailto:${store.contact.email}`}>{store.contact.email}</a>
              </li>
              {store.contact.location && <li>{store.contact.location}</li>}
            </ul>
          </div>
          <span className="store-sun" aria-hidden="true" />
          <div className="store-ask">
            <h2>{store.closing?.title || "Cần tư vấn?"}</h2>
            {store.closing?.text && <p>{store.closing.text}</p>}
            <a className="pill pill-solid" href={`mailto:${store.contact.email}`}>
              Nhắn {member.name.split(" ").pop()} <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
