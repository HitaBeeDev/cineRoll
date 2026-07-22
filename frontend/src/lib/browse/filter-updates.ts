import type { FilterState } from "@cineroll/types";
import type { AwardStatus } from "@/lib/browse/options";

/** Add/remove `value` in a multi-select facet array. */
export function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function statusFromFilters(f: FilterState): AwardStatus {
  if (f.winnerOnly)    return "won";
  if (f.nominatedOnly) return "nom";
  return "any";
}

export function statusToUpdates(status: AwardStatus): Partial<FilterState> {
  return { winnerOnly: status === "won", nominatedOnly: status === "nom", page: 1 };
}
