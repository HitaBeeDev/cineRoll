import type { AwardRecord } from "@cineroll/types";
import type { AwardSummary } from "../domain-types";

function compareAwardRecords(a: AwardRecord, b: AwardRecord): number {
  return a.awardYear - b.awardYear || a.category.localeCompare(b.category);
}

export function getHighlightedAwardRecords(summary: AwardSummary): AwardRecord[] {
  const hasWins = summary.totalWins > 0;
  return summary.ceremonies
    .flatMap((ceremony) => ceremony.records)
    .filter((record) => (hasWins ? record.won : true))
    .sort(compareAwardRecords);
}
