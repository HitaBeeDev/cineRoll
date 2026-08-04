import type { BanditLane, LaneBandit } from "@/lib/api";
import { LANE_BANDIT_LANES } from "@/lib/home-storage/lane-bandit-constants/lane-bandit-lanes";
import { createLaneBanditPriors } from "./create-lane-bandit-priors";
import { sanitizeBetaArm } from "./sanitize-beta-arm";

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
