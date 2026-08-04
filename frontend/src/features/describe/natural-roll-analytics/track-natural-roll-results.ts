import type { NaturalRollResult } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

export function trackNaturalRollResults(
  result: NaturalRollResult,
  promptLength: number,
): void {
  result.films.forEach((film, index) => {
    trackEvent({
      type: "recommendation_served",
      filmId: film.id,
      context: {
        source: "natural_roll",
        rank: index + 1,
        promptLength,
        interpretedFilters: result.interpretedFilters,
        relaxed: result.relaxed,
      },
    });
  });
}
