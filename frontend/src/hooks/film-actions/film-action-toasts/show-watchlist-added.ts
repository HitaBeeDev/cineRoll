import type { Toast } from "../types";

export function showWatchlistAdded(toast: Toast, filmTitle: string): void {
  toast({ variant: "success", title: "Added to watchlist", description: filmTitle });
}
