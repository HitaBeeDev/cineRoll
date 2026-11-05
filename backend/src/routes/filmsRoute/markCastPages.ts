import { nameToSlug } from "../personsRoute/slug";

/**
 * Each cast member, flagged with whether CineRoll has a page for them. Person
 * pages exist only for names in the award data (directors and nominees); most
 * actors are neither, and linking them sent every film page's cast to 404s —
 * thousands of broken internal links for crawlers.
 */
export function markCastPages(cast: unknown, personSlugs: ReadonlyMap<string, string>): unknown {
  if (!Array.isArray(cast)) return cast;
  return cast.map(member => {
    if (!member || typeof member !== "object") return member;
    const name = (member as { name?: unknown }).name;
    return { ...member, hasPage: typeof name === "string" && personSlugs.has(nameToSlug(name)) };
  });
}
