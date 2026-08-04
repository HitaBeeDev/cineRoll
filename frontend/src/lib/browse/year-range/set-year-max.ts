import type { YearRange } from "@/lib/browse/year-range/year-range";

export function setYearMax(range: YearRange, yearMax: number | null): YearRange {
  const yearMin =
    yearMax != null && range.yearMin != null && yearMax < range.yearMin ? yearMax : range.yearMin;

  return { yearMin, yearMax };
}
