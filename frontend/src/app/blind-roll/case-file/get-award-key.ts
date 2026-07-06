import type { BlindRollAward } from "../types";

export function getAwardKey(award: BlindRollAward, index: number): string {
  return `${award.awardBody}-${award.awardYear}-${award.category}-${award.nominee}-${index}`;
}
