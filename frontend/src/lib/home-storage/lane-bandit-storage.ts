import type { BanditLane, LaneBandit } from "@/lib/api";
import {
  createLaneBanditPriors,
  sanitizeStoredLaneBandit,
  updateLanePosterior,
  validateLaneBandit,
} from "./lane-bandit-calculator";
import { LANE_BANDIT_STORAGE_KEY } from "./lane-bandit-constants";

export function getLaneBandit(): LaneBandit {
  try {
    const raw = window.localStorage.getItem(LANE_BANDIT_STORAGE_KEY);
    return sanitizeStoredLaneBandit(raw ? JSON.parse(raw) : null);
  } catch {
    return createLaneBanditPriors();
  }
}

export function setLaneBandit(bandit: LaneBandit): void {
  const validBandit = validateLaneBandit(bandit);
  if (validBandit) writeLaneBandit(validBandit);
}

export function updateLaneBandit(lane: BanditLane, reward: number): void {
  writeLaneBandit(updateLanePosterior(getLaneBandit(), lane, reward));
}

function writeLaneBandit(bandit: LaneBandit): void {
  try {
    window.localStorage.setItem(
      LANE_BANDIT_STORAGE_KEY,
      JSON.stringify(bandit),
    );
  } catch {
    // Lane learning must never interrupt rolling.
  }
}
