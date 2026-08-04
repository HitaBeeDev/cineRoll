import type { LaneBandit } from "@/lib/api";
import { LANE_BANDIT_PRIORS } from "@/lib/home-storage/lane-bandit-constants/lane-bandit-priors";

export function createLaneBanditPriors(): LaneBandit {
  return {
    safe: { ...LANE_BANDIT_PRIORS.safe },
    gem: { ...LANE_BANDIT_PRIORS.gem },
    wild: { ...LANE_BANDIT_PRIORS.wild },
  };
}
