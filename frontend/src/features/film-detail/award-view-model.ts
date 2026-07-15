import type { AwardRecord } from "@cineroll/types";
import type { AwardSummary } from "./domain-types";

export function getHighlightedAwardRecords(summary: AwardSummary): AwardRecord[] {
  const hasWins = summary.totalWins > 0;
  return summary.ceremonies
    .flatMap((ceremony) => ceremony.records)
    .filter((record) => (hasWins ? record.won : true))
    .sort(compareAwardRecords);
}

export function getAwardBreakdown(summary: AwardSummary): string[] {
  const hasWins = summary.totalWins > 0;
  return summary.ceremonies
    .filter((ceremony) =>
      hasWins ? ceremony.wins > 0 : ceremony.nominations > 0,
    )
    .map(
      (ceremony) =>
        `${hasWins ? ceremony.wins : ceremony.nominations} ${ceremony.shortLabel}`,
    );
}

export function sortAwardRecords(records: AwardRecord[]): AwardRecord[] {
  return [...records].sort(
    (a, b) =>
      Number(b.won) - Number(a.won) ||
      a.awardYear - b.awardYear ||
      a.category.localeCompare(b.category),
  );
}

export function getAwardYearLabel(records: AwardRecord[]): string | null {
  if (records.length === 0) return null;
  const years = records.map((record) => record.awardYear);
  const firstYear = Math.min(...years);
  const lastYear = Math.max(...years);
  return firstYear === lastYear ? String(firstYear) : `${firstYear}–${lastYear}`;
}

function compareAwardRecords(a: AwardRecord, b: AwardRecord): number {
  return a.awardYear - b.awardYear || a.category.localeCompare(b.category);
}
