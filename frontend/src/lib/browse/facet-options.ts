import type { CategoryFacetCount, FacetCount } from "@cineroll/types";
import { AWARD_BODY_OPTIONS } from "@/lib/browse/options";

export type FacetOption = {
  value: string;
  label: string;
  group?: string;
};

export type CountedYear = { year: number; count: number };

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

/**
 * Options for a variable-length list control — genres, categories, countries,
 * languages.
 *
 * The counts decide membership and are then discarded: an option that would
 * return nothing is dropped, and the rest are listed with no number attached.
 * Dropping rather than dimming, because dimming works for a row of five chips but
 * a two-hundred-item category list where a chosen ceremony makes nine tenths
 * unreachable would leave the user scrolling a list that is mostly noise.
 *
 * A value the user has already selected always survives, whatever its count.
 * Filters can combine into an empty result, and an option that vanished from the
 * list it was selected in would leave no way to un-select it from that control.
 */
export function reachableOptions(
  counts: FacetCount[],
  selected: string[],
  label: (value: string) => string,
): FacetOption[] {
  return counts
    .filter((c) => c.count > 0 || selected.includes(c.value))
    .map((c) => ({ value: c.value, label: label(c.value) }));
}

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
