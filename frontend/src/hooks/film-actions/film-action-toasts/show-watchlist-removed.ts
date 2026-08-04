import type { Toast } from "../types";

export function showWatchlistRemoved(toast: Toast, filmTitle: string): void {
  toast({ title: "Removed from watchlist", description: filmTitle });
}
