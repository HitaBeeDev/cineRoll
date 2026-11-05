/**
 * A path as the kind of page it is, so vitals group by template, not by URL:
 * "/film/parasite-2019" → "/film/[…]", "/awards/oscars/best-picture" →
 * "/awards/[…]", "/" → "/". One page type is one layout — the thing a fix changes.
 */
export function pageType(pathname: string): string {
  const [first, ...rest] = pathname.split("/").filter(Boolean);
  if (!first) return "/";
  return rest.length > 0 ? `/${first}/[…]` : `/${first}`;
}
