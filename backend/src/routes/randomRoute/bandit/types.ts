import type { RollLane } from "../rollScore";

export type BetaArm = {
  alpha: number;
  beta: number;
};

export type LanePosteriors = Record<RollLane, BetaArm>;
