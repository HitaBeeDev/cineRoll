import { decayRerollPenalty } from "@/lib/home-storage/reroll-penalty-calculator/decay-reroll-penalty";
import { getRerollPenalty } from "./get-reroll-penalty";
import { writeRerollPenalty } from "./write-reroll-penalty";

export function decayRerollPenalties(): void {
  writeRerollPenalty(decayRerollPenalty(getRerollPenalty()));
}
