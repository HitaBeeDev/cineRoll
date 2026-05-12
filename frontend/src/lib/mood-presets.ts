import type { FilterState } from "@cineroll/types";

export type MoodPreset = {
  label: string;
  filters: Partial<FilterState>;
};

export const MOOD_PRESETS: MoodPreset[] = [];
