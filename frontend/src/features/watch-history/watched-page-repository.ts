import type { WatchedPage } from "./domain-types";

export async function fetchWatchedPage(cursor: string): Promise<WatchedPage> {
  const response = await fetch(
    `/api/user/watched?cursor=${encodeURIComponent(cursor)}&limit=20`,
  );
  if (!response.ok) throw new Error("Failed to load watch history");
  return (await response.json()) as WatchedPage;
}
