import type { BetaArm } from "./types";

const MAXIMUM_ARM_STRENGTH = 60;

// Bounded evidence gives the posterior a sliding memory for changing tastes.
export const decayBetaArm = (arm: BetaArm): BetaArm => {
  const strength = arm.alpha + arm.beta;
  if (strength <= MAXIMUM_ARM_STRENGTH) return arm;

  const scale = MAXIMUM_ARM_STRENGTH / strength;
  return { alpha: arm.alpha * scale, beta: arm.beta * scale };
};
