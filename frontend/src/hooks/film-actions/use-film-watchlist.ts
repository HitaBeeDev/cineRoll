"use client";

import { useState } from "react";
import { addFilmToWatchlist, removeFilmFromWatchlist } from "@/lib/api";
import {
  showAlreadySaved,
  showSaveError,
  showWatchlistAdded,
  showWatchlistRemoved,
} from "./film-action-toasts";
import type { AuthGate, Toast, UseFilmActionsOptions } from "./types";

export function useFilmWatchlist(
  options: UseFilmActionsOptions,
  triggerAuthGate: (gate: AuthGate) => void,
  toast: Toast,
) {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistPending, setWatchlistPending] = useState(false);

  async function toggleWatchlist(): Promise<void> {
    if (!options.isAuthenticated) {
      triggerAuthGate("watchlist");
      return;
    }
    if (watchlistPending) return;

    const next = !inWatchlist;
    setInWatchlist(next);
    setWatchlistPending(true);
    try {
      await persistWatchlistChange(options.filmId, next);
      completeWatchlistChange(options, next, toast);
    } catch (error) {
      handleWatchlistError(error, options, next, setInWatchlist, toast);
    } finally {
      setWatchlistPending(false);
    }
  }

  return { inWatchlist, watchlistPending, setInWatchlist, toggleWatchlist };
}

function persistWatchlistChange(filmId: string, add: boolean): Promise<void> {
  return add ? addFilmToWatchlist(filmId) : removeFilmFromWatchlist(filmId);
}

function completeWatchlistChange(
  options: UseFilmActionsOptions,
  added: boolean,
  toast: Toast,
): void {
  if (added) {
    showWatchlistAdded(toast, options.filmTitle);
    options.onSaved?.();
  } else {
    showWatchlistRemoved(toast, options.filmTitle);
  }
}

function handleWatchlistError(
  error: unknown,
  options: UseFilmActionsOptions,
  attemptedAdd: boolean,
  setInWatchlist: (value: boolean) => void,
  toast: Toast,
): void {
  if (getErrorCode(error) === "WATCHLIST_ALREADY_EXISTS") {
    showAlreadySaved(toast, options.filmTitle);
    options.onSaved?.();
    return;
  }
  setInWatchlist(!attemptedAdd);
  showSaveError(toast, options.filmTitle);
}

function getErrorCode(error: unknown): string | undefined {
  return error instanceof Error
    ? (error as Error & { code?: string }).code
    : undefined;
}
