import type { DailyPick, PickDiversity } from "./domain-types";
import { PICK_SLOTS } from "./pick-slots";
import { selectPick } from "./select-pick";

export async function selectDailyPicks(
  day: string,
  userId: string | undefined,
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
