import type { LaneBandit } from "@/lib/api";
import { validateLaneBandit } from "@/lib/home-storage/lane-bandit-calculator/validate-lane-bandit";
import { writeLaneBandit } from "./write-lane-bandit";

export function setLaneBandit(bandit: LaneBandit): void {
  const validBandit = validateLaneBandit(bandit);
  if (validBandit) writeLaneBandit(validBandit);
}
