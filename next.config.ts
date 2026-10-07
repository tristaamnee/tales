import type { NextConfig } from "next";

// Xuất ra web tĩnh (thư mục out/) để deploy được lên GitHub Pages hoặc bất kỳ host tĩnh nào.
// Khi site nằm trong thư mục con (vd. https://<user>.github.io/tales), đặt NEXT_PUBLIC_BASE_PATH=/tales lúc build.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
