import type { RollLane } from "../rollScore";
import { decayBetaArm } from "./decayBetaArm";
import type { BetaArm, LanePosteriors } from "./types";

export const updateLanePosterior = (
  posteriors: LanePosteriors,
  lane: RollLane,
  reward: number,
): LanePosteriors => {
  const clampedReward = Math.min(1, Math.max(0, reward));
  const currentArm = posteriors[lane];
  const updatedArm: BetaArm = {
    alpha: currentArm.alpha + clampedReward,
    beta: currentArm.beta + 1 - clampedReward,
  };

  return { ...posteriors, [lane]: decayBetaArm(updatedArm) };
};
