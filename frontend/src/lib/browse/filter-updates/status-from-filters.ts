import type { FilterState } from "@cineroll/types";
import type { AwardStatus } from "@/lib/browse/options/award-status";

export function statusFromFilters(f: FilterState): AwardStatus {
  if (f.winnerOnly)    return "won";
  if (f.nominatedOnly) return "nom";
  return "any";
}
