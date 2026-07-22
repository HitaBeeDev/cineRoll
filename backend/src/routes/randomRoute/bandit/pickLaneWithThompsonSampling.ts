import type { RollLane } from "../rollScore";
import { LANES } from "./lanes";
import { sampleBeta } from "./sampleBeta";
import type { RandomSource } from "./sampleStandardNormal";
import type { LanePosteriors } from "./types";

export const pickLaneWithThompsonSampling = (
  posteriors: LanePosteriors,
  rng: RandomSource = Math.random,
): RollLane => {
  let bestLane: RollLane = "safe";
  let bestSample = -Infinity;

  for (const lane of LANES) {
    const { alpha, beta } = posteriors[lane];
    const sample = sampleBeta(alpha, beta, rng);
    if (sample > bestSample) {
      bestSample = sample;
      bestLane = lane;
    }
  }

  return bestLane;
};
