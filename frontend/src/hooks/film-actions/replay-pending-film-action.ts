import {
  addFilmToWatchlist,
  markFilmWatched,
  type FilmStatus,
} from "@/lib/api";
import { takePendingFilmAction } from "@/lib/pending-intent";
import type { FilmDecision } from "./types";

export type ReplayedFilmAction =
  | { type: "watchlist" }
  | { type: "decision"; decision: FilmDecision };

export async function replayPendingFilmAction(
  filmId: string,
  status: FilmStatus,
): Promise<ReplayedFilmAction | null> {
  const pendingAction = takePendingFilmAction(filmId);
  if (!pendingAction) return null;

  if (pendingAction === "watchlist") {
    if (status.inWatchlist) return null;
    await addFilmToWatchlist(filmId);
    return { type: "watchlist" };
  }

  const decision = pendingAction === "notInterested" ? "not-interested" : "watched";
  await markFilmWatched(filmId, decision === "not-interested");
  return { type: "decision", decision };
}
