import type { RerollPenalty } from "@/lib/api";
import { REROLL_DECAY } from "@/lib/home-storage/reroll-penalty-constants/reroll-decay";
import { REROLL_MIN_PENALTY } from "@/lib/home-storage/reroll-penalty-constants/reroll-min-penalty";
function decayWeights(weights: Record<string, number>): Record<string, number> {
  const decayedEntries = Object.entries(weights)
    .map(([key, weight]) => [key, weight * REROLL_DECAY] as const)
    .filter(([, weight]) => weight >= REROLL_MIN_PENALTY);
  return Object.fromEntries(decayedEntries);
}

export function decayRerollPenalty(penalty: RerollPenalty): RerollPenalty {
  return {
    genre: decayWeights(penalty.genre),
    contentType: decayWeights(penalty.contentType),
  };
}
