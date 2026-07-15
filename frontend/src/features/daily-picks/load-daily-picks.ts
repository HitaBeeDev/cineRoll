import {
  cacheDailyPicks,
  getDailyPicksCacheKey,
  restoreDailyPicks,
} from "./daily-picks-cache";
import type { DailyPick } from "./domain-types";
import { getUtcDay } from "./picks-date";
import { selectDailyPicks } from "./select-daily-picks";

export async function loadDailyPicks(
  userId: string | undefined,
  storage: Storage | null,
): Promise<DailyPick[]> {
  const day = getUtcDay();
  const cacheKey = getDailyPicksCacheKey(day, userId);
  const cachedPicks = storage
    ? restoreDailyPicks(storage, cacheKey)
    : null;
  if (cachedPicks) return cachedPicks;

  const picks = await selectDailyPicks(day, userId);
  if (storage) cacheDailyPicks(storage, cacheKey, picks);
  return picks;
}
