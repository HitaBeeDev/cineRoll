import { PICK_SLOTS } from "@/features/daily-picks/pick-slots/pick-slots";
import { getUtcDay } from "@/features/daily-picks/picks-date/get-utc-day";
import type { DailyPick } from "./domain-types";
import { selectDailyPicks } from "./select-daily-picks";
import { serverSeededRoll } from "./server-seeded-roll";

const DAY_MS = 86_400_000;

/**
 * Today's guest picks, chosen on the server so the page HTML carries them.
 * If today's draw comes back short (backend down, or a deploy built before it
 * was reachable), yesterday's are used instead — those draws are usually still
 * in the data cache. Empty only when both fail; the page then picks in the browser.
 */
export async function fetchServerDailyPicks(now = new Date()): Promise<DailyPick[]> {
  const today = await selectDailyPicks(getUtcDay(now), serverSeededRoll);
  if (today.length === PICK_SLOTS.length) return today;

  const yesterday = await selectDailyPicks(getUtcDay(new Date(now.getTime() - DAY_MS)), serverSeededRoll);
  return yesterday.length > today.length ? yesterday : today;
}
