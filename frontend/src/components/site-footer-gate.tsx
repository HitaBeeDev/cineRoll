"use client";

import { usePathname } from "next/navigation";

/**
 * The home page (`/`) is a deliberate single-screen experience
 * (`h-screen overflow-hidden`), so the global footer is hidden there to avoid
 * introducing a page scrollbar. Every other route renders it.
 */
export function SiteFooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <>{children}</>;
}
