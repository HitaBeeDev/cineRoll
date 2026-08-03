import type { FacetCount } from "@cineroll/types";

export type CountedOption = { value: string; label: string; count: number };

export type CountedYear = { year: number; count: number };

/** One value's count, or 0 when the facet no longer carries it at all. */
export function countOf(counts: FacetCount[], value: string): number {
  return counts.find((c) => c.value === value)?.count ?? 0;
}

/**
 * Options for a variable-length list control — genres, categories, countries,
 * languages.
 *
 * Unreachable values are dropped rather than dimmed. Dimming works for a row of
 * five chips; for a two-hundred-item category list where a chosen ceremony makes
 * nine tenths of it unreachable, it would leave the user scrolling a list that is
 * mostly noise. What remains is exactly what can still be picked.
 *
 * A value the user has already selected always survives, whatever its count.
 * Filters can combine into an empty result, and an option that vanished from the
 * list it was selected in would leave no way to un-select it from that control.
 */
export function reachableOptions(
  counts: FacetCount[],
  selected: string[],
  label: (value: string) => string,
): CountedOption[] {
  return counts
    .filter((c) => c.count > 0 || selected.includes(c.value))
    .map((c) => ({ value: c.value, label: label(c.value), count: c.count }));
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

/**
 * Counts as they appear inside chips and toggle strips: "1.2k", not "1,204".
 *
 * Those controls are laid out in fixed rows, so a count that grows with the size
 * of the catalogue would wrap the row. The dropdown lists have a column to
 * themselves and use full numbers.
 */
export function compactCount(count: number): string {
  if (count < 1000) return String(count);

  const thousands = count / 1000;
  // 1.2k up to 9.9k, then whole thousands — "12.4k" reads as noise at this size.
  return thousands < 10 ? `${thousands.toFixed(1)}k` : `${Math.round(thousands)}k`;
}
