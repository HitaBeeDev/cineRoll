import { YEARS_PER_DECADE } from "./years-per-decade";
import type { YearRange } from "@/lib/browse/year-range/year-range";

/**
 * The decade this range represents, or null when it spans anything else — which
 * is what deselects the chips the moment the years are narrowed by hand.
 */
export function yearRangeToDecade({ yearMin, yearMax }: YearRange): number | null {
  if (yearMin == null || yearMax == null) return null;
  if (yearMin % YEARS_PER_DECADE !== 0) return null;

  return yearMax === yearMin + YEARS_PER_DECADE - 1 ? yearMin : null;
}
