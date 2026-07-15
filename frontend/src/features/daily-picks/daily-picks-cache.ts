import type { RollFilm } from "@/lib/api";
import type { DailyPick } from "./domain-types";
import { PICK_SLOTS } from "./pick-slots";

type CachedPick = {
  film: RollFilm;
  slot: { num: string };
};

export function getDailyPicksCacheKey(
  day: string,
  userId: string | undefined,
): string {
  return `cinepicks-${day}-${userId ?? "guest"}`;
}

export function restoreDailyPicks(
  storage: Storage,
  key: string,
): DailyPick[] | null {
  try {
    const cached = storage.getItem(key);
    if (!cached) return null;
    const restored = restoreSlots(JSON.parse(cached) as CachedPick[]);
    if (hasEveryPickSlot(restored)) return restored;
    storage.removeItem(key);
  } catch {
    return null;
  }
  return null;
}

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

function restoreSlots(cachedPicks: CachedPick[]): DailyPick[] {
  if (!Array.isArray(cachedPicks)) return [];
  return cachedPicks.flatMap(({ film, slot }) => {
    const fullSlot = PICK_SLOTS.find((candidate) => candidate.num === slot?.num);
    return fullSlot ? [{ film, slot: fullSlot }] : [];
  });
}

function hasEveryPickSlot(picks: DailyPick[]): boolean {
  if (picks.length !== PICK_SLOTS.length) return false;
  const restoredSlots = new Set(picks.map((pick) => pick.slot.num));
  return PICK_SLOTS.every((slot) => restoredSlots.has(slot.num));
}
