"use client";

import { createContext, useContext } from "react";

// go("/thanh-vien/nhung/") đổi màn hình ngay (đổi state theo slug), href() thêm basePath cho thẻ <a>.
export type Nav = { go: (path: string) => void; href: (path: string) => string };
export const NavContext = createContext<Nav>({ go: () => {}, href: (p) => p });
export const useNav = () => useContext(NavContext);
