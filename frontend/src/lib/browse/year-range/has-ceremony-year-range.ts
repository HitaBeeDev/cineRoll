import { ceremonyYearRange } from "./ceremony-year-range";
import { hasYearRange } from "./has-year-range";

export function hasCeremonyYearRange(filters: {
  awardYearMin: number | null;
  awardYearMax: number | null;
}): boolean {
  return hasYearRange(ceremonyYearRange(filters));
}
