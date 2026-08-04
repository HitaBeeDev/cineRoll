import type { FilterState } from "@cineroll/types";
import type { AwardStatus } from "@/lib/browse/options/award-status";

export function statusToUpdates(status: AwardStatus): Partial<FilterState> {
  return { winnerOnly: status === "won", nominatedOnly: status === "nom", page: 1 };
}
