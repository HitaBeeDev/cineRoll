import type { FilterState } from "@cineroll/types";
import type { RandomResult } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { addToRolledBag, pushRollHistory, setLaneBandit } from "@/lib/home-storage";

export function recordRollResult(result: RandomResult, filters: FilterState): void {
  addToRolledBag(result.film.id);
  if (result.bandit) setLaneBandit(result.bandit);
  pushRollHistory(result.film);
  void trackEvent({
    type: "impression",
    filmId: result.film.id,
    context: { source: "roll_result", filters, total: result.total },
  });
}
