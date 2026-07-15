import type { Film } from "@cineroll/types";
import { computeAwardSummary } from "./compute-award-summary";

export function getAwardSeoSummary(film: Film): string {
  const summary = computeAwardSummary(film);
  if (summary.totalWins > 0) {
    return `${summary.totalWins} wins across ${summary.totalNominations} major nominations.`;
  }

  const nominations = summary.ceremonies.map(
    (ceremony) => `${ceremony.nominations} ${ceremony.shortLabel}`,
  );
  if (nominations.length > 0) return `${nominations.join(", ")} nominations.`;
  return "Explore its CineRoll film profile.";
}
