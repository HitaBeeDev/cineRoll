import type { RerollPenalty, RollFilm } from "@/lib/api";
import { REROLL_MAX_PENALTY } from "@/lib/home-storage/reroll-penalty-constants/reroll-max-penalty";
import { REROLL_STRONG_PENALTY } from "@/lib/home-storage/reroll-penalty-constants/reroll-strong-penalty";
import { REROLL_WEAK_PENALTY } from "@/lib/home-storage/reroll-penalty-constants/reroll-weak-penalty";

function addWeight(currentWeight: number | undefined, amount: number): number {
  return Math.min((currentWeight ?? 0) + amount, REROLL_MAX_PENALTY);
}

function getPenaltyAmount(strength: "weak" | "strong"): number {
  return strength === "strong" ? REROLL_STRONG_PENALTY : REROLL_WEAK_PENALTY;
}

export function applyFilmRerollPenalty(
  penalty: RerollPenalty,
  film: RollFilm,
  strength: "weak" | "strong",
): RerollPenalty {
  const amount = getPenaltyAmount(strength);
  const genre = film.genres[0];
  const genreWeights = { ...penalty.genre };
  const contentTypeWeights = { ...penalty.contentType };
  if (genre) genreWeights[genre] = addWeight(genreWeights[genre], amount);
  if (film.contentType) {
    contentTypeWeights[film.contentType] = addWeight(
      contentTypeWeights[film.contentType],
      amount,
    );
  }
  return { genre: genreWeights, contentType: contentTypeWeights };
}
