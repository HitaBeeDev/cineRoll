import type { TfidfFilm } from "./types";

type AwardCountKey = keyof Pick<
  TfidfFilm,
  | "oscarWins"
  | "oscarNominations"
  | "ggWins"
  | "ggNominations"
  | "cannesWins"
  | "cannesNominations"
  | "berlinWins"
  | "berlinNominations"
>;

export type AwardBody = {
  key: string;
  wins: AwardCountKey;
  nominations: AwardCountKey;
};

export const AWARD_BODIES: readonly AwardBody[] = [
  { key: "oscar", wins: "oscarWins", nominations: "oscarNominations" },
  { key: "gg", wins: "ggWins", nominations: "ggNominations" },
  { key: "cannes", wins: "cannesWins", nominations: "cannesNominations" },
  { key: "berlin", wins: "berlinWins", nominations: "berlinNominations" },
];
