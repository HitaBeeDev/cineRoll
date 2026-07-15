import type { AwardRow } from "./domain-types";

export function sortAwardRows(records: AwardRow[]): AwardRow[] {
  return [...records].sort(
    (a, b) =>
      Number(b.won) - Number(a.won) ||
      b.awardYear - a.awardYear ||
      a.category.localeCompare(b.category),
  );
}
