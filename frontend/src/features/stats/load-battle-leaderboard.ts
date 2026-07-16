import { fetchBattleLeaderboard } from "./battle-leaderboard-repository";
import type { FilmStat } from "./types";

export async function loadBattleLeaderboard(): Promise<FilmStat[]> {
  const response = await fetchBattleLeaderboard();

  return (
    response?.films.map(({ rating, ...film }) => ({
      ...film,
      count: rating,
    })) ?? []
  );
}
