import type { AwardSummary } from "../domain-types";

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
