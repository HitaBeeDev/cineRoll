import type { WatchRegion } from "@cineroll/types";
import { config } from "../../config";
import { type TmdbWatchResponse, tmdbWatchRegions } from "./tmdbWatchRegions";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TIMEOUT_MS = 8000;

export type WatchFetchResult =
  | { status: "ok"; regions: WatchRegion[] }
  /** TMDB no longer knows the id — checked, streams nowhere. */
  | { status: "not-found" }
  /** Back off: stop the run, the rest waits for tomorrow. */
  | { status: "rate-limited" }
  /** Network or server trouble — leave the film for the next run. */
  | { status: "error" };

/** One title's subscription services from TMDB. Series use the tv endpoint. */
export async function fetchWatchRegions(tmdbId: number, contentType: string): Promise<WatchFetchResult> {
  const kind = contentType === "tv-series" ? "tv" : "movie";
  try {
    const response = await fetch(
      `${TMDB_BASE}/${kind}/${tmdbId}/watch/providers?api_key=${config.tmdbApiKey}`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) },
    );
    if (response.status === 404) return { status: "not-found" };
    if (response.status === 429) return { status: "rate-limited" };
    if (!response.ok) return { status: "error" };
    return { status: "ok", regions: tmdbWatchRegions((await response.json()) as TmdbWatchResponse) };
  } catch {
    return { status: "error" };
  }
}
