import type { BanditLane, BetaArm, LaneBandit } from "@/lib/api";
import {
  LANE_BANDIT_LANES,
  LANE_BANDIT_MAX_STRENGTH,
  LANE_BANDIT_PRIORS,
} from "./lane-bandit-constants";

export function createLaneBanditPriors(): LaneBandit {
  return {
    safe: { ...LANE_BANDIT_PRIORS.safe },
    gem: { ...LANE_BANDIT_PRIORS.gem },
    wild: { ...LANE_BANDIT_PRIORS.wild },
  };
}

export function sanitizeStoredLaneBandit(value: unknown): LaneBandit {
  const bandit = createLaneBanditPriors();
  if (!value || typeof value !== "object") return bandit;

  const storedArms = value as Partial<Record<BanditLane, unknown>>;
  for (const lane of LANE_BANDIT_LANES) {
    const arm = sanitizeBetaArm(storedArms[lane]);
    if (arm) bandit[lane] = arm;
  }
  return bandit;
}

export function validateLaneBandit(value: unknown): LaneBandit | null {
  if (!value || typeof value !== "object") return null;
  const storedArms = value as Partial<Record<BanditLane, unknown>>;
  const safe = sanitizeBetaArm(storedArms.safe);
  const gem = sanitizeBetaArm(storedArms.gem);
  const wild = sanitizeBetaArm(storedArms.wild);
  return safe && gem && wild ? { safe, gem, wild } : null;
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

function sanitizeBetaArm(value: unknown): BetaArm | null {
  if (!value || typeof value !== "object") return null;
  const { alpha, beta } = value as Record<string, unknown>;
  if (!isPositiveFiniteNumber(alpha) || !isPositiveFiniteNumber(beta)) return null;
  return { alpha, beta };
}

function capArmStrength(arm: BetaArm): BetaArm {
  const strength = arm.alpha + arm.beta;
  if (strength <= LANE_BANDIT_MAX_STRENGTH) return arm;

  const scale = LANE_BANDIT_MAX_STRENGTH / strength;
  return { alpha: arm.alpha * scale, beta: arm.beta * scale };
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
