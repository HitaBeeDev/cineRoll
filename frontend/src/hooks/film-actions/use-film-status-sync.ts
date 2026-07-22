"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";
import { fetchFilmStatus, type FilmStatus } from "@/lib/api";
import {
  showReplayedDecision,
  showWatchlistAdded,
} from "./film-action-toasts";
import { replayPendingFilmAction } from "./replay-pending-film-action";
import type { FilmActionState, Sentiment, Toast } from "./types";

type FilmStatusSyncOptions = {
  filmId: string;
  filmTitle: string;
  isAuthenticated: boolean;
  setAction: Dispatch<SetStateAction<FilmActionState>>;
  setSentiment: Dispatch<SetStateAction<Sentiment>>;
  setInWatchlist: Dispatch<SetStateAction<boolean>>;
  toast: Toast;
};

export function useFilmStatusSync({
  filmId,
  filmTitle,
  isAuthenticated,
  setAction,
  setSentiment,
  setInWatchlist,
  toast,
}: FilmStatusSyncOptions): void {
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    async function synchronizeStatus(): Promise<void> {
      try {
        const status = await fetchFilmStatus(filmId);
        if (cancelled) return;
        applyFilmStatus({ setAction, setSentiment, setInWatchlist }, status);

        const replayedAction = await replayPendingFilmAction(filmId, status);
        if (cancelled || !replayedAction) return;
        applyReplayedAction(
          { filmTitle, setAction, setInWatchlist, toast },
          replayedAction,
        );
      } catch {
        // Account reflection is non-blocking; the user can retry the action.
      }
    }

    void synchronizeStatus();
    return () => {
      cancelled = true;
    };
  }, [
    filmId,
    filmTitle,
    isAuthenticated,
    setAction,
    setInWatchlist,
    setSentiment,
    toast,
  ]);
}

type StatusSetters = Pick<
  FilmStatusSyncOptions,
  "setAction" | "setSentiment" | "setInWatchlist"
>;

function applyFilmStatus(
  setters: StatusSetters,
  status: FilmStatus,
): void {
  if (status.watched) {
    setters.setAction(status.doNotSuggest ? "not-interested" : "watched");
    setters.setSentiment(status.sentiment);
  }
  setters.setInWatchlist(status.inWatchlist);
}

type ReplaySetters = Pick<
  FilmStatusSyncOptions,
  "filmTitle" | "setAction" | "setInWatchlist" | "toast"
>;

function applyReplayedAction(
  options: ReplaySetters,
  replayedAction: Awaited<ReturnType<typeof replayPendingFilmAction>>,
): void {
  if (!replayedAction) return;
  if (replayedAction.type === "watchlist") {
    options.setInWatchlist(true);
    showWatchlistAdded(options.toast, options.filmTitle);
    return;
  }

  options.setAction(replayedAction.decision);
  showReplayedDecision(options.toast, replayedAction.decision, options.filmTitle);
}
