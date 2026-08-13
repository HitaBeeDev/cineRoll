import { cacheDailyPicks } from "@/features/daily-picks/daily-picks-cache/cache-daily-picks";
import { getDailyPicksCacheKey } from "@/features/daily-picks/daily-picks-cache/get-daily-picks-cache-key";
import { restoreDailyPicks } from "@/features/daily-picks/daily-picks-cache/restore-daily-picks";
import type { DailyPick } from "./domain-types";
import { getUtcDay } from "@/features/daily-picks/picks-date/get-utc-day";
import { selectDailyPicks } from "./select-daily-picks";

export async function loadDailyPicks(
  userId: string | undefined,
  storage: Storage | null,
  /** Each pick as it is chosen, so the page can show the first one without
   *  waiting on the rest. A cache hit returns them all at once and never
   *  calls it. */
  onPick?: (pick: DailyPick) => void,
): Promise<DailyPick[]> {
  const day = getUtcDay();
  const cacheKey = getDailyPicksCacheKey(day, userId);
  const cachedPicks = storage
    ? restoreDailyPicks(storage, cacheKey)
    : null;
  if (cachedPicks) return cachedPicks;

  const picks = await selectDailyPicks(day, userId, onPick);
  if (storage) cacheDailyPicks(storage, cacheKey, picks);
  return picks;
}
