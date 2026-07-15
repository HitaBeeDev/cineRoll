import type { RollFilm } from "@/lib/api";
import type { DailyPick, PickSlot, PickSlotIcon } from "./domain-types";

export type MotionPreferenceProps = { shouldReduceMotion: boolean };
export type PickActionsProps = { film: RollFilm };
export type PickSlotIconProps = { icon: PickSlotIcon };
export type PicksListProps = MotionPreferenceProps & {
  dateLabel: string;
  picks: DailyPick[];
};
export type PickCardProps = {
  dateLabel: string;
  index: number;
  pick: DailyPick;
};
export type PicksPageContextProps = {
  dateLabel: string;
};
export type PickMetadataProps = { film: RollFilm };
export type PickBackdropProps = { film: RollFilm; priority: boolean };
export type PickCardContentProps = { pick: DailyPick };
export type PickSlotKickerProps = { slot: PickSlot };
