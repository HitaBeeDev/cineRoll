import { trackEvent } from "@/lib/analytics";
import { mutateWatchlist } from "./mutate-watchlist";

export async function removeFilmFromWatchlist(filmId: string): Promise<void> {
  await mutateWatchlist("DELETE", filmId, "Failed to remove");
  trackEvent({
    type: "watchlist_remove",
    filmId,
    context: { source: "watchlist_api" },
  });
}
