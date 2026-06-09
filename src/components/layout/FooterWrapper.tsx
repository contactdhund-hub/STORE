"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

export function FooterWrapper() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/login")) return null;
  return <Footer />;
}
