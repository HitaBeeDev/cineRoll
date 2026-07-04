import { fetchBlindRoll } from "@/lib/api";
import type { BlindRound, Difficulty } from "./types";

export async function fetchBlindRound(
  difficulty: Difficulty,
  challengeSlug?: string,
): Promise<BlindRound> {
  const round = await fetchBlindRoll(difficulty, challengeSlug);

  if (!round.film) {
    throw new Error("No blind roll film found");
  }

  return round;
}
