import type { FacetCount } from "@cineroll/types";
import type { CountedYear } from "./counted-year";

/**
 * The same rule for the year controls, whose values are years rather than names.
 * `keep` lists years that must survive whatever their count — one per bound the
 * control holds, since the release-year range has two and narrowing one must not
 * strand the other on an option that has left the list.
 */
export function reachableYears(
  counts: FacetCount[],
  ...keep: (number | null)[]
): CountedYear[] {
  const kept = new Set(keep.filter((year): year is number => year != null));

  return counts
    .map((c) => ({ year: Number(c.value), count: c.count }))
    .filter(({ year, count }) => Number.isFinite(year) && (count > 0 || kept.has(year)));
}
