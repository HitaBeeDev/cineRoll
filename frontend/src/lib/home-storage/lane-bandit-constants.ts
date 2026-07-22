import type { BanditLane, LaneBandit } from "@/lib/api";

export const LANE_BANDIT_STORAGE_KEY = "cineroll_lane_bandit";

export const LANE_BANDIT_PRIORS: LaneBandit = {
  safe: { alpha: 4, beta: 2 },
  gem: { alpha: 2, beta: 4 },
  wild: { alpha: 1, beta: 3 },
};

export const LANE_BANDIT_MAX_STRENGTH = 60;
export const LANE_BANDIT_LANES: BanditLane[] = ["safe", "gem", "wild"];
