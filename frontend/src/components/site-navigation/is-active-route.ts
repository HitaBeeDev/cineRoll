/**
 * Whether a nav href is active for the current path. Routes are flat, so the
 * home link matches only the exact root; every other link also matches its
 * sub-routes (e.g. /film detail pages under a section).
 */
export function isActiveRoute(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(href + "/");
}
