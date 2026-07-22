import { trackEvent } from "@/lib/analytics";
import { createApiError } from "./api-error";
import { JSON_HEADERS } from "./constants";

export async function addFilmToWatchlist(filmId: string): Promise<void> {
  await mutateWatchlist("POST", filmId, "Failed to save");
  trackEvent({
    type: "watchlist_add",
    filmId,
    context: { source: "watchlist_api" },
  });
}

export async function removeFilmFromWatchlist(filmId: string): Promise<void> {
  await mutateWatchlist("DELETE", filmId, "Failed to remove");
  trackEvent({
    type: "watchlist_remove",
    filmId,
    context: { source: "watchlist_api" },
  });
}

async function mutateWatchlist(
  method: "POST" | "DELETE",
  filmId: string,
  errorMessage: string,
): Promise<void> {
  const response = await fetch("/api/user/watchlist", {
    method,
    headers: JSON_HEADERS,
    body: JSON.stringify({ filmId }),
  });
  if (!response.ok) throw await createApiError(response, errorMessage);
}
