import type { FacetCount } from "@cineroll/types";
import type { FacetOption } from "./facet-option";

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
