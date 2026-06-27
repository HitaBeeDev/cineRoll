"use client";

import { usePathname } from "next/navigation";

/**
 * The home page (`/`) is a deliberate single-screen experience (`h-screen
 * overflow-hidden`), so the global footer is hidden there to avoid introducing a
 * page scrollbar. Auth routes are also single-screen flows with their own
 * focused layout, so the global footer stays out of those pages too.
 */
const FULL_SCREEN_ROUTES = new Set([
  "/",
  "/auth/signin",
  "/auth/forgot-password",
  "/auth/reset-password",
]);

export function SiteFooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (FULL_SCREEN_ROUTES.has(pathname)) return null;
  return <>{children}</>;
}
