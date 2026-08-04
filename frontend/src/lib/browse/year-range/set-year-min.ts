import type { YearRange } from "@/lib/browse/year-range/year-range";

/**
 * Move one bound, pushing the other ahead of it rather than crossing it.
 *
 * A start after the end is an impossible range the API rejects outright (400),
 * so picking one drags the far bound along instead of stranding the user on an
 * error. Only ever widens toward the bound being set — never silently narrows.
 */
export function setYearMin(range: YearRange, yearMin: number | null): YearRange {
  const yearMax =
    yearMin != null && range.yearMax != null && yearMin > range.yearMax ? yearMin : range.yearMax;

  return { yearMin, yearMax };
}
