import type { FilterState } from "@cineroll/types";

export type MoodPreset = {
  label: string;
  filters: Partial<FilterState>;
};

export const MOOD_PRESETS: MoodPreset[] = [
  {
    label: "Something from the 90s",
    filters: { decadeMin: 1990, decadeMax: 1999 },
  },
  {
    label: "Female director",
    filters: { femaleDirectorOnly: true },
  },
  {
    label: "Under 2 hours",
    filters: { runtimeMax: 119 },
  },
  {
    label: "Oscar Best Picture winner",
    filters: { awardBody: "oscar", category: "Best Picture", winnerOnly: true },
  },
  {
    label: "Cannes Palme d'Or",
    filters: { awardBody: "cannes", category: "Palme d'Or", winnerOnly: true },
  },
  {
    label: "Golden Globe drama winner",
    filters: { awardBody: "goldenglobe", category: "Best Motion Picture - Drama", winnerOnly: true },
  },
  {
    label: "Hidden gem (1 nomination only)",
    filters: { nominationCount: 1 },
  },
];
