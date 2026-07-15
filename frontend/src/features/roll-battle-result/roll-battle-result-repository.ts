import "server-only";
import type { Film } from "@cineroll/types";
import {
  ROLL_BATTLE_RESULT_API_URL,
  ROLL_BATTLE_RESULT_REVALIDATE_SECONDS,
} from "./config";

export async function fetchRollBattleWinner(
  slug: string,
): Promise<Film | null> {
  const response = await fetch(
    `${ROLL_BATTLE_RESULT_API_URL}/api/films/${encodeURIComponent(slug)}`,
    { next: { revalidate: ROLL_BATTLE_RESULT_REVALIDATE_SECONDS } },
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to fetch film: ${response.status}`);
  }

  return response.json() as Promise<Film>;
}
