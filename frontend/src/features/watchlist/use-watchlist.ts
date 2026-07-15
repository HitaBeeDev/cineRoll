"use client";

import { useState } from "react";
import { removeFilmFromWatchlist } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import type { WatchlistGridProps } from "./component-props";
import type { WatchlistController } from "./watchlist-controller";
import type { WatchlistFilm } from "./domain-types";
import { fetchWatchlistPage } from "./watchlist-page-repository";

export function useWatchlist({
  entries: initialEntries,
  initialNextCursor = null,
}: WatchlistGridProps): WatchlistController {
  const { toast } = useToast();
  const [entries, setEntries] = useState(initialEntries);
  const [removingFilmIds, setRemovingFilmIds] = useState<Set<string>>(new Set());
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  async function loadMore() {
    if (isLoadingMore || !nextCursor) return;
    setIsLoadingMore(true);
    try {
      const page = await fetchWatchlistPage(nextCursor);
      setEntries((current) => [...current, ...(page.watchlist ?? [])]);
      setNextCursor(page.nextCursor ?? null);
    } catch {
      showError("Couldn't load more");
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function removeFilm(film: WatchlistFilm) {
    if (removingFilmIds.has(film.id)) return;
    const previous = entries;
    setFilmRemoving(film.id, true);
    setEntries((current) => current.filter((entry) => entry.film.id !== film.id));
    try {
      await removeFilmFromWatchlist(film.id);
      toast({ title: "Removed from watchlist", description: film.title });
    } catch {
      setEntries(previous);
      showError("Couldn't remove");
    } finally {
      setFilmRemoving(film.id, false);
    }
  }

  function setFilmRemoving(filmId: string, removing: boolean) {
    setRemovingFilmIds((current) => {
      const next = new Set(current);
      if (removing) next.add(filmId);
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
    entries,
    hasMore: nextCursor !== null,
    isLoadingMore,
    removingFilmIds,
    loadMore,
    removeFilm,
  };
}
