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

export type PickDiversity = {
  usedDecades: Set<number>;
  usedGenres: Set<string>;
};

export type DailyPicksController = {
  isLoading: boolean;
  picks: DailyPick[];
};
