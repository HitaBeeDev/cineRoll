import type { LaneBandit } from "@/lib/api";

export const LANE_BANDIT_PRIORS: LaneBandit = {
  safe: { alpha: 4, beta: 2 },
  gem: { alpha: 2, beta: 4 },
  wild: { alpha: 1, beta: 3 },
};
