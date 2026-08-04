import type { YearRange } from "@/lib/browse/year-range/year-range";

export function hasYearRange({ yearMin, yearMax }: YearRange): boolean {
  return yearMin != null || yearMax != null;
}
