// Elo rating for Roll Battle (Versus) pairwise duels.
//
// Every "which film wins tonight?" click is a pairwise preference judgment.
// Elo — the chess rating system — turns a stream of such 1-vs-1 outcomes into a
// single comparable rating per film, updated incrementally (no global refit
// needed). It is the canonical fit for aggregating sparse pairwise votes into a
// ranking. See docs/algorithms.md §10.
//
//   expected(A) = 1 / (1 + 10^((ratingB - ratingA) / 400))
//   ratingA'    = ratingA + K · (scoreA - expected(A))     scoreA ∈ {1 win, 0 loss}

export const INITIAL_RATING = 1500;

// K-factor controls step size. Films are "provisional" while they have few games
// (rating still far from true skill) so they move fast, then settle for
// stability — the standard USCF-style step-down.
export function kFactor(games: number): number {
  if (games < 10) return 40;
  if (games < 30) return 24;
  return 16;
}

export function expectedScore(rating: number, opponentRating: number): number {
  return 1 / (1 + 10 ** ((opponentRating - rating) / 400));
}

export type EloDelta = { winnerDelta: number; loserDelta: number };

// Rating change for one settled duel. Each side moves by its own K (which
// depends on its own game count), so a seasoned film and a fresh one adjust at
// the rate appropriate to each.
export function eloUpdate(
  winnerRating: number,
  winnerGames: number,
  loserRating: number,
  loserGames: number,
): EloDelta {
  const expectedWinner = expectedScore(winnerRating, loserRating);
  const expectedLoser = 1 - expectedWinner;

  return {
    winnerDelta: kFactor(winnerGames) * (1 - expectedWinner),
    loserDelta: kFactor(loserGames) * (0 - expectedLoser),
  };
}
