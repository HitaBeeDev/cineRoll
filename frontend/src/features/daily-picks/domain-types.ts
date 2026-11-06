import type { FilterState } from "@cineroll/types";
import type { RollFilm } from "@/lib/api";

export type PickSlotNumber = "01" | "02" | "03";
export type PickSlotIcon = "trophy" | "clapperboard" | "star";

export type PickSlot = {
  num: PickSlotNumber;
  label: string;
  icon: PickSlotIcon;
  filters: Partial<FilterState>;
};

export type DailyPick = {
  film: RollFilm;
  slot: PickSlot;
};

/**
 * One seeded draw: the same seed, filters and exclusions give the same film.
 * Null when nothing matches or the request failed — a slot then moves on to
 * its next variant. Injected so the browser (per user, uncached) and the
 * server (guest, cached for the day) share one selection algorithm.
 */
export type SeededRoll = (
  seed: string,
  filters: Partial<FilterState>,
  excludeIds: string[],
) => Promise<RollFilm | null>;

export type PickDiversity = {
  usedDecades: Set<number>;
  usedGenres: Set<string>;
};

export type DailyPicksController = {
  isLoading: boolean;
  picks: DailyPick[];
};
