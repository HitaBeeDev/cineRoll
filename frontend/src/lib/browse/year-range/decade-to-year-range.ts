import { YEARS_PER_DECADE } from "./years-per-decade";
import type { YearRange } from "@/lib/browse/year-range/year-range";

/** The bounds a Decade chip writes. */
export function decadeToYearRange(decade: number): YearRange {
  return { yearMin: decade, yearMax: decade + YEARS_PER_DECADE - 1 };
}
