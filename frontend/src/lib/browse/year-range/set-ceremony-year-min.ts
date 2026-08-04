import { ceremonyYearRange } from "./ceremony-year-range";
import { setYearMin } from "./set-year-min";

/** Write a moved ceremony bound back, keeping the pair from crossing. */
export function setCeremonyYearMin(
  filters: { awardYearMin: number | null; awardYearMax: number | null },
  value: number | null,
) {
  const { yearMin, yearMax } = setYearMin(ceremonyYearRange(filters), value);
  return { awardYearMin: yearMin, awardYearMax: yearMax };
}
