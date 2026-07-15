import type { ProfileSummary } from "./domain-types";

export function isNewProfile(summary: ProfileSummary): boolean {
  return (
    summary.watchlist === 0 &&
    summary.watched === 0 &&
    summary.hidden === 0
  );
}
