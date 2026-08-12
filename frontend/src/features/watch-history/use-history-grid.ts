"use client";

import { useState } from "react";
import { markFilmWatched, removeFilmWatched } from "@/lib/api";
import type { FilmSentiment } from "@/lib/api/sentiment";
import { useToast } from "@/components/ui/toast/use-toast";
import { showDecisionUndone } from "@/hooks/film-actions/film-action-toasts/show-decision-undone";
import type { HistoryGridController } from "./history-grid-controller";
import type { WatchedEntry, WatchedFilm } from "./domain-types";
import { fetchWatchedPage } from "./watched-page-repository";

export function useHistoryGrid(
  initialEntries: WatchedEntry[],
  initialNextCursor: string | null,
): HistoryGridController {
  const { toast } = useToast();
  const [entries, setEntries] = useState(initialEntries);
  const [busyFilmIds, setBusyFilmIds] = useState<Set<string>>(new Set());
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  async function loadMore() {
    if (isLoadingMore || !nextCursor) return;
    setIsLoadingMore(true);
    try {
      const page = await fetchWatchedPage(nextCursor);
      setEntries((current) => [...current, ...(page.watched ?? [])]);
      setNextCursor(page.nextCursor ?? null);
    } catch {
      showError("Couldn't load more");
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function rateFilm(
    film: WatchedFilm,
    sentiment: FilmSentiment,
  ) {
    if (busyFilmIds.has(film.id)) return;
    const previous = getSentiment(entries, film.id);
    const next = previous === sentiment ? null : sentiment;
    updateSentiment(film.id, next);
    setFilmBusy(film.id, true);
    try {
      await markFilmWatched(film.id, false, next);
    } catch {
      updateSentiment(film.id, previous);
      showError("Couldn't save");
    } finally {
      setFilmBusy(film.id, false);
    }
  }

  async function removeFilm(film: WatchedFilm) {
    if (busyFilmIds.has(film.id)) return;
    const previous = entries;
    const previousSentiment = getSentiment(entries, film.id);
    setFilmBusy(film.id, true);
    setEntries((current) => current.filter((entry) => entry.film.id !== film.id));
    try {
      await removeFilmWatched(film.id);
      showDecisionUndone(toast, "watched", film.title, () =>
        void restoreFilm(film, previous, previousSentiment),
      );
    } catch {
      setEntries(previous);
      showError("Couldn't remove");
    } finally {
      setFilmBusy(film.id, false);
    }
  }

  // Puts a removed entry back, rating included. The row returns to its old spot
  // on screen because the whole previous list is restored — but the server
  // stamps a fresh watchedAt, so a reload will sort it to the top.
  async function restoreFilm(
    film: WatchedFilm,
    previous: WatchedEntry[],
    sentiment: WatchedEntry["sentiment"],
  ) {
    setEntries(previous);
    try {
      await markFilmWatched(film.id, false, sentiment);
    } catch {
      setEntries((current) =>
        current.filter((entry) => entry.film.id !== film.id),
      );
      showError("Couldn't restore");
    }
  }

  function updateSentiment(
    filmId: string,
    sentiment: WatchedEntry["sentiment"],
  ) {
    setEntries((current) =>
      current.map((entry) =>
        entry.film.id === filmId ? { ...entry, sentiment } : entry,
      ),
    );
  }

  function setFilmBusy(filmId: string, busy: boolean) {
    setBusyFilmIds((current) => {
      const next = new Set(current);
      if (busy) next.add(filmId);
      else next.delete(filmId);
      return next;
    });
  }

  function showError(title: string) {
    toast({
      variant: "error",
      title,
      description: "Check your connection and try again.",
    });
  }

  return {
    busyFilmIds,
    entries,
    isLoadingMore,
    hasMore: nextCursor !== null,
    loadMore,
    rateFilm,
    removeFilm,
  };
}

function getSentiment(
  entries: WatchedEntry[],
  filmId: string,
): WatchedEntry["sentiment"] {
  return entries.find((entry) => entry.film.id === filmId)?.sentiment ?? null;
}
