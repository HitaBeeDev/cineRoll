import type { RollLane } from "../rollScore";
import type { BetaArm, LanePosteriors } from "./types";

export const calculateLaneMeans = (
  posteriors: LanePosteriors,
): Record<RollLane, number> => ({
  safe: calculateArmMean(posteriors.safe),
  gem: calculateArmMean(posteriors.gem),
  wild: calculateArmMean(posteriors.wild),
});

const calculateArmMean = (arm: BetaArm): number =>
  arm.alpha / (arm.alpha + arm.beta);
