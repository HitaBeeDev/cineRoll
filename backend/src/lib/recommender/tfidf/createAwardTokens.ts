import { AWARD_BODIES } from "./awardBodies";
import type { FeatureToken, TfidfFilm } from "./types";

export const createAwardTokens = (film: TfidfFilm): FeatureToken[] => {
  const tokens: FeatureToken[] = [];

  for (const body of AWARD_BODIES) {
    if (film[body.wins] > 0) {
      tokens.push(`award:${body.key}_winner`);
    } else if (film[body.nominations] > 0) {
      tokens.push(`award:${body.key}_nominee`);
    }
  }

  return tokens;
};
