import "server-only";
import { apiFetch } from "@/lib/apiWithAuth";
import type { WatchedPage, WatchedResult } from "./domain-types";

export async function fetchWatched(): Promise<WatchedResult> {
  try {
    const response = await apiFetch("/api/user/watched");
    if (!response.ok) return { status: "error" };
    const data = (await response.json().catch(() => null)) as WatchedPage | null;
    return data ? toWatchedResult(data) : { status: "error" };
  } catch {
    return { status: "error" };
  }
}

function toWatchedResult(data: WatchedPage): WatchedResult {
  return {
    status: "ok",
    entries: data.watched ?? [],
    nextCursor: data.nextCursor ?? null,
    total: data.total ?? null,
  };
}
