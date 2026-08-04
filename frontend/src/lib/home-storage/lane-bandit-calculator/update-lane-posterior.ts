import type { BanditLane, BetaArm, LaneBandit } from "@/lib/api";
import { LANE_BANDIT_MAX_STRENGTH } from "@/lib/home-storage/lane-bandit-constants/lane-bandit-max-strength";
function capArmStrength(arm: BetaArm): BetaArm {
  const strength = arm.alpha + arm.beta;
  if (strength <= LANE_BANDIT_MAX_STRENGTH) return arm;

  const scale = LANE_BANDIT_MAX_STRENGTH / strength;
  return { alpha: arm.alpha * scale, beta: arm.beta * scale };
}

export function updateLanePosterior(
  bandit: LaneBandit,
  lane: BanditLane,
  reward: number,
): LaneBandit {
  const clampedReward = Math.max(0, Math.min(1, reward));
  const updatedArm = capArmStrength({
    alpha: bandit[lane].alpha + clampedReward,
    beta: bandit[lane].beta + (1 - clampedReward),
  });
  return { ...bandit, [lane]: updatedArm };
}
