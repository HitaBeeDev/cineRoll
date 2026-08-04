import type { LaneBandit } from "@/lib/api";
import { createLaneBanditPriors } from "@/lib/home-storage/lane-bandit-calculator/create-lane-bandit-priors";
import { sanitizeStoredLaneBandit } from "@/lib/home-storage/lane-bandit-calculator/sanitize-stored-lane-bandit";
import { LANE_BANDIT_STORAGE_KEY } from "@/lib/home-storage/lane-bandit-constants/lane-bandit-storage-key";

export function getLaneBandit(): LaneBandit {
  try {
    const raw = window.localStorage.getItem(LANE_BANDIT_STORAGE_KEY);
    return sanitizeStoredLaneBandit(raw ? JSON.parse(raw) : null);
  } catch {
    return createLaneBanditPriors();
  }
}
