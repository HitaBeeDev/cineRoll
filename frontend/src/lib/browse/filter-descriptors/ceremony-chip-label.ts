import type { FilterState } from "@cineroll/types";
import { ceremonyYearRange } from "@/lib/browse/year-range/ceremony-year-range";
import { formatYearRange } from "@/lib/browse/year-range/format-year-range";
export function ceremonyChipLabel(filters: FilterState): string {
  const range = ceremonyYearRange(filters);
  const spansOneYear = range.yearMin != null && range.yearMin === range.yearMax;

  return `${formatYearRange(range)} ${spansOneYear ? "ceremony" : "ceremonies"}`;
}
