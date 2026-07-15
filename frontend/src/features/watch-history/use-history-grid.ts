"use client";

import { useState } from "react";
import { markFilmWatched, removeFilmWatched } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
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
    sentiment: "like" | "dislike",
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
    setFilmBusy(film.id, true);
    setEntries((current) => current.filter((entry) => entry.film.id !== film.id));
    try {
      await removeFilmWatched(film.id);
      toast({ title: "Removed from history", description: film.title });
    } catch {
      setEntries(previous);
      showError("Couldn't remove");
    } finally {
      setFilmBusy(film.id, false);
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
