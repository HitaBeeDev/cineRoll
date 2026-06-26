"use client";

import { usePathname } from "next/navigation";

/**
 * Some routes are deliberate single-screen experiences (`h-screen
 * overflow-hidden`) — the home page (`/`) and the daily picks page
 * (`/picks`) — so the global footer is hidden there to avoid introducing a
 * page scrollbar. Every other route renders it.
 */
const FULL_SCREEN_ROUTES = new Set(["/", "/picks"]);

export function SiteFooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (FULL_SCREEN_ROUTES.has(pathname)) return null;
  return <>{children}</>;
}
