import type { DailyPick, PickDiversity } from "./domain-types";
import { PICK_SLOTS } from "@/features/daily-picks/pick-slots/pick-slots";
import { selectPick } from "./select-pick";

export async function selectDailyPicks(
  day: string,
  userId: string | undefined,
  /** Called as each slot lands. The slots have to resolve in order — every one
   *  excludes the films the ones before it took — so waiting for all three put
   *  the hero, and therefore the hero's image request, several seconds behind a
   *  pick that was already decided. Handing them over one at a time costs
   *  nothing and lets pick 01 paint as soon as it exists. */
  onPick?: (pick: DailyPick) => void,
): Promise<DailyPick[]> {
  const picks: DailyPick[] = [];
  const usedIds: string[] = [];
  const diversity: PickDiversity = {
    usedDecades: new Set<number>(),
    usedGenres: new Set<string>(),
  };

  for (const slot of PICK_SLOTS) {
    const pick = await selectPick(slot, day, usedIds, diversity, userId);
    if (!pick) continue;
    picks.push(pick);
    recordSelection(pick, usedIds, diversity);
    onPick?.(pick);
  }
  return picks;
}

function recordSelection(
  pick: DailyPick,
  usedIds: string[],
  diversity: PickDiversity,
): void {
  usedIds.push(pick.film.id);
  diversity.usedDecades.add(Math.floor(pick.film.year / 10) * 10);
  const primaryGenre = pick.film.genres[0];
  if (primaryGenre) diversity.usedGenres.add(primaryGenre);
}
