"use client";

import { useState } from "react";
import { fetchListPage, removeFilmFromList } from "@/lib/api";
import { useToast } from "@/components/ui/toast/use-toast";
import type { SavedFilm, SavedFilmEntry } from "@/types/saved-film";

const PAGE_SIZE = 20;

/**
 * State + mutations for a list's film grid: cursor-based pagination and
 * optimistic removal. Rendering lives entirely in the grid component.
 */
export function useListDetailGrid(
  listId: string,
  entries: SavedFilmEntry[],
  initialNextCursor: string | null,
) {
  const { toast } = useToast();
  const [films, setFilms] = useState(entries);
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [loadingMore, setLoadingMore] = useState(false);

  async function loadMore() {
    if (loadingMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const page = await fetchListPage(listId, nextCursor, PAGE_SIZE);
      setFilms((prev) => [...prev, ...page.films]);
      setNextCursor(page.nextCursor);
    } catch {
      toast({
        variant: "error",
        title: "Couldn't load more",
        description: "Check your connection and try again.",
      });
    } finally {
      setLoadingMore(false);
    }
  }

  async function remove(film: SavedFilm) {
    if (removing.has(film.id)) return;
    // Read the position before anything changes — it is what the rollback needs.
    const index = films.findIndex((entry) => entry.film.id === film.id);
    const removed = films[index];
    if (!removed) return;

    setRemoving((prev) => new Set(prev).add(film.id));
    setFilms((prev) => prev.filter((entry) => entry.film.id !== film.id));

    try {
      await removeFilmFromList(listId, film.id);
      toast({ title: "Removed from list", description: film.title });
    } catch {
      // Re-insert just this entry, where it was. The per-id guard above only
      // blocks a repeat removal of the SAME film, so restoring a whole snapshot
      // would resurrect another film removed meanwhile — or drop a page that
      // loadMore appended while this request was open.
      setFilms((prev) => {
        const next = [...prev];
        next.splice(Math.min(index, next.length), 0, removed);
        return next;
      });
      toast({
        variant: "error",
        title: "Couldn't remove",
        description: "Check your connection and try again.",
      });
    } finally {
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(film.id);
        return next;
      });
    }
  }

  return { films, removing, nextCursor, loadingMore, loadMore, remove };
}
