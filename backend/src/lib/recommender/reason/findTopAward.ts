import type { CandidateFilm } from "../types";
import { AWARD_LABELS } from "./awardCopy";

type AwardKind = "win" | "nomination";
type AwardCount = [count: number, label: string];

const awardCountsFor = (film: CandidateFilm, kind: AwardKind): AwardCount[] =>
  kind === "win"
    ? [
        [film.oscarWins, AWARD_LABELS.oscar],
        [film.cannesWins, AWARD_LABELS.cannes],
        [film.ggWins, AWARD_LABELS.gg],
        [film.berlinWins, AWARD_LABELS.berlin],
      ]
    : [
        [film.oscarNominations, AWARD_LABELS.oscar],
        [film.cannesNominations, AWARD_LABELS.cannes],
        [film.ggNominations, AWARD_LABELS.gg],
        [film.berlinNominations, AWARD_LABELS.berlin],
      ];

export const findTopAward = (film: CandidateFilm, kind: AwardKind): string | null => {
  const award = awardCountsFor(film, kind).find(([count]) => count > 0);

  return award?.[1] ?? null;
};
