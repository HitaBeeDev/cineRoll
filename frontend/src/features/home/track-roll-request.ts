import type { FilterState } from "@cineroll/types";
import { trackEvent } from "@/lib/analytics";

export function trackRollRequest(
  personalized: boolean,
  filters: FilterState,
  hasActiveFilters: boolean,
): void {
  void trackEvent({
    type: personalized ? "roll_personalized" : "roll",
    context: { source: "home_roll", filters, hasActiveFilters },
  });
}
