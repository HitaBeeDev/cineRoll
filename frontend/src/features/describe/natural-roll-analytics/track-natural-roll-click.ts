import type { RollFilm } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

export function trackNaturalRollClick(film: RollFilm): void {
  trackEvent({
    type: "recommendation_click",
    filmId: film.id,
    context: { source: "natural_roll", slug: film.slug },
  });
}
