import type { BanditLane } from "@/lib/api";
import { updateLanePosterior } from "@/lib/home-storage/lane-bandit-calculator/update-lane-posterior";
import { getLaneBandit } from "./get-lane-bandit";
import { writeLaneBandit } from "./write-lane-bandit";

export function updateLaneBandit(lane: BanditLane, reward: number): void {
  writeLaneBandit(updateLanePosterior(getLaneBandit(), lane, reward));
}
