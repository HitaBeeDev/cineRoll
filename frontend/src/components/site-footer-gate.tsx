"use client";

import { usePathname } from "next/navigation";

/**
 * The home page (`/`) is a deliberate single-screen experience (`h-screen
 * overflow-hidden`), so the global footer is hidden there to avoid introducing a
 * page scrollbar. Every other route — including daily picks (`/picks`) and
 * describe / mood match (`/describe`) — renders it.
 */
const FULL_SCREEN_ROUTES = new Set(["/"]);

export function SiteFooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (FULL_SCREEN_ROUTES.has(pathname)) return null;
  return <>{children}</>;
}
