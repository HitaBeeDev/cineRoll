import "server-only";
import { apiFetch } from "@/lib/apiWithAuth";
import type { WatchlistPage, WatchlistResult } from "./domain-types";

export async function fetchWatchlist(): Promise<WatchlistResult> {
  try {
    const response = await apiFetch("/api/user/watchlist");
    if (!response.ok) return { status: "error" };
    const data = (await response.json().catch(() => null)) as WatchlistPage | null;
    return data ? toWatchlistResult(data) : { status: "error" };
  } catch {
    return { status: "error" };
  }
}

function toWatchlistResult(data: WatchlistPage): WatchlistResult {
  return {
    status: "ok",
    entries: data.watchlist ?? [],
    nextCursor: data.nextCursor ?? null,
    total: data.total ?? null,
  };
}
