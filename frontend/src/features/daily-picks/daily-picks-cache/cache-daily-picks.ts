import type { DailyPick } from "../domain-types";

export function cacheDailyPicks(
  storage: Storage,
  key: string,
  picks: DailyPick[],
): void {
  try {
    storage.setItem(key, JSON.stringify(picks));
  } catch {
    // Storage is an optional performance optimization.
  }
}
