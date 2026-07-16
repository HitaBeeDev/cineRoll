import { STATS_API_URL } from "./config";
import type { BattleLeaderboardResponse } from "./types";

export async function fetchBattleLeaderboard(): Promise<BattleLeaderboardResponse | null> {
  try {
    const response = await fetch(`${STATS_API_URL}/api/roll-battle/leaderboard?limit=7`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return response.json() as Promise<BattleLeaderboardResponse>;
  } catch {
    return null;
  }
}
