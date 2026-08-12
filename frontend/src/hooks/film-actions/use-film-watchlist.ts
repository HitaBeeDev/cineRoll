"use client";

import { useState } from "react";
import { addFilmToWatchlist, removeFilmFromWatchlist } from "@/lib/api";
import { showAlreadySaved } from "@/hooks/film-actions/film-action-toasts/show-already-saved";
import { showSaveError } from "@/hooks/film-actions/film-action-toasts/show-save-error";
import { showWatchlistAdded } from "@/hooks/film-actions/film-action-toasts/show-watchlist-added";
import { showWatchlistRemoved } from "@/hooks/film-actions/film-action-toasts/show-watchlist-removed";
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
    if (!options.inlineConfirmation) showWatchlistAdded(toast, options.filmTitle);
    options.onSaved?.();
  } else if (!options.inlineConfirmation) {
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
  const code = getErrorCode(error);

  // The server disagreeing about the STARTING state is not a failed save — the
  // end state is already the one the user asked for. So the optimistic flip
  // stands and we confirm it, the way the list dialog treats its own
  // already-there / already-gone codes. Each code can only arise from one
  // direction, so each branch checks the direction it belongs to.
  if (attemptedAdd && code === "WATCHLIST_ALREADY_EXISTS") {
    if (!options.inlineConfirmation) showAlreadySaved(toast, options.filmTitle);
    options.onSaved?.();
    return;
  }
  if (!attemptedAdd && code === "WATCHLIST_ENTRY_NOT_FOUND") {
    if (!options.inlineConfirmation) showWatchlistRemoved(toast, options.filmTitle);
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
