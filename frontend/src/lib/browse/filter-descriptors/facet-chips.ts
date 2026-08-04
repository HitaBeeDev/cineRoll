import type { FilterState } from "@cineroll/types";
import type { ActiveChip } from "./active-chip";
import type { SetFilters } from "./set-filters";

/** Build the per-value removable chips for one multi-select facet. */
export function facetChips<T extends string>(
  keyPrefix: string,
  values: T[],
  labelOf: (v: T) => string,
  clear: (remaining: T[]) => Partial<FilterState>,
  set: SetFilters,
): ActiveChip[] {
  return values.map((v) => ({
    key: `${keyPrefix}:${v}`,
    label: labelOf(v),
    onRemove: () => set({ ...clear(values.filter((x) => x !== v)), page: 1 }),
  }));
}
