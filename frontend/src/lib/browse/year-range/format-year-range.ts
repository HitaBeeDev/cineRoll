import type { YearRange } from "@/lib/browse/year-range/year-range";
import { yearRangeToDecade } from "./year-range-to-decade";

/** Chip/summary text: "1990s", "1994–1996", "2001", "1994 onwards", "up to 1996". */
export function formatYearRange(range: YearRange): string {
  const decade = yearRangeToDecade(range);
  if (decade != null) return `${decade}s`;

  const { yearMin, yearMax } = range;
  // A single year is a range of one — "2001", never "2001–2001".
  if (yearMin != null && yearMin === yearMax) return String(yearMin);
  if (yearMin != null && yearMax != null) return `${yearMin}–${yearMax}`;
  if (yearMin != null) return `${yearMin} onwards`;
  if (yearMax != null) return `up to ${yearMax}`;

  return "Any year";
}
