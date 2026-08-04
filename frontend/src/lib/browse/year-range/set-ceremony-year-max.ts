import { ceremonyYearRange } from "./ceremony-year-range";
import { setYearMax } from "./set-year-max";

export function setCeremonyYearMax(
  filters: { awardYearMin: number | null; awardYearMax: number | null },
  value: number | null,
) {
  const { yearMin, yearMax } = setYearMax(ceremonyYearRange(filters), value);
  return { awardYearMin: yearMin, awardYearMax: yearMax };
}
