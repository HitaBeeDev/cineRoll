import type { AwardRecord } from "@cineroll/types";

export function getAwardYearLabel(records: AwardRecord[]): string | null {
  if (records.length === 0) return null;
  const years = records.map((record) => record.awardYear);
  const firstYear = Math.min(...years);
  const lastYear = Math.max(...years);
  return firstYear === lastYear ? String(firstYear) : `${firstYear}–${lastYear}`;
}
