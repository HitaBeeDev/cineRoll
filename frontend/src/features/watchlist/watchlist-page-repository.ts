import type { WatchlistPage } from "./domain-types";

export async function fetchWatchlistPage(
  cursor: string,
): Promise<WatchlistPage> {
  const response = await fetch(
    `/api/user/watchlist?cursor=${encodeURIComponent(cursor)}&limit=20`,
  );
  if (!response.ok) throw new Error("Failed to load watchlist");
  return (await response.json()) as WatchlistPage;
}
