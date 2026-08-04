import type { CategoryFacetCount } from "@cineroll/types";
import { AWARD_BODY_OPTIONS } from "@/lib/browse/options/award-body-options";
import type { FacetOption } from "./facet-option";

/**
 * Category options, grouped under the ceremony that awards them.
 *
 * Without the grouping the list is 572 names in one alphabetical run, where
 * "Best Director" gives no clue whether it is the Oscar or the Golden Globe. The
 * ceremony order is the one the sticky strip uses, so the dropdown's sections
 * read in the same order as the toggles above it.
 *
 * The seven names two ceremonies both award are listed under each of them: the
 * filter matches the NAME across every selected ceremony, so this is one
 * selection shown twice, not two — and it ticks in both places, which is
 * precisely what selecting it does.
 */
export function categoryOptions(
  counts: CategoryFacetCount[],
  selected: string[],
): FacetOption[] {
  const reachable = counts.filter((c) => c.count > 0 || selected.includes(c.value));

  return AWARD_BODY_OPTIONS.flatMap(({ value: body, label }) =>
    reachable
      .filter((c) => c.bodies.includes(body))
      .map((c) => ({ value: c.value, label: c.value, group: label })),
  );
}
