import type { FacetCount } from "@cineroll/types";

/**
 * One value's count — 0 when the facet has been counted and this value missed
 * out, `undefined` when there is no count to show yet.
 *
 * The difference is the whole reason this isn't a one-liner. Controls disable
 * themselves at 0, so collapsing "not counted yet" into 0 greyed out every chip
 * and ceremony toggle on the page for the length of the first request, and would
 * have left them greyed out for good if that request ever failed. An empty facet
 * list means unknown, and unknown must read as "no number", not "none".
 */
export function countOf(counts: FacetCount[], value: string): number | undefined {
  if (counts.length === 0) return undefined;

  return counts.find((c) => c.value === value)?.count ?? 0;
}
