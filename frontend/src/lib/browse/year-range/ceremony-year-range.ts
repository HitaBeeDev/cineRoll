import type { YearRange } from "@/lib/browse/year-range/year-range";

/** The ceremony-year bounds, in the shape the shared range helpers expect. */
export function ceremonyYearRange(filters: {
  awardYearMin: number | null;
  awardYearMax: number | null;
}): YearRange {
  return { yearMin: filters.awardYearMin, yearMax: filters.awardYearMax };
}
