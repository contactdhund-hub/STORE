"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { CartSidebar } from "../cart/CartSidebar";

export function HeaderWrapper() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/login")) return null;
  return (
    <>
      <Header />
      <CartSidebar />
    </>
  );
}
