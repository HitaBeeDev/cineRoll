import { trackEvent } from "@/lib/analytics";
import { mutateWatchlist } from "./mutate-watchlist";

export async function addFilmToWatchlist(filmId: string): Promise<void> {
  await mutateWatchlist("POST", filmId, "Failed to save");
  trackEvent({
    type: "watchlist_add",
    filmId,
    context: { source: "watchlist_api" },
  });
}
