import type { LaneBandit } from "@/lib/api";
import { LANE_BANDIT_STORAGE_KEY } from "@/lib/home-storage/lane-bandit-constants/lane-bandit-storage-key";

export function writeLaneBandit(bandit: LaneBandit): void {
  try {
    window.localStorage.setItem(
      LANE_BANDIT_STORAGE_KEY,
      JSON.stringify(bandit),
    );
  } catch {
    // Lane learning must never interrupt rolling.
  }
}
