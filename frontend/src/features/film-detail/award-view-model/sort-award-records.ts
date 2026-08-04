import type { AwardRecord } from "@cineroll/types";

export function sortAwardRecords(records: AwardRecord[]): AwardRecord[] {
  return [...records].sort(
    (a, b) =>
      Number(b.won) - Number(a.won) ||
      a.awardYear - b.awardYear ||
      a.category.localeCompare(b.category),
  );
}
