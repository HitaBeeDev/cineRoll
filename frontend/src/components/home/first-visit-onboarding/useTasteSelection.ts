"use client";

import { useState } from "react";
import type { TasteCardFilm } from "@/lib/api";
import {
  createTasteSeed,
  savePendingWatchedFilms,
  saveTasteSeed,
  type TasteSeed,
} from "@/lib/home-storage";

/**
 * Tracks which taste cards the visitor marks as "seen" and commits that first
 * signal. `done` persists the taste seed + pending watched films so the first
 * rolls are shaped by them; `skip` continues without saving, discarding picks.
 */
export function useTasteSelection({
  tasteCards,
  onContinue,
}: {
  tasteCards: TasteCardFilm[];
  onContinue: (seed: TasteSeed | null) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggle(filmId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(filmId)) {
        next.delete(filmId);
      } else {
        next.add(filmId);
      }
      return next;
    });
  }

  function done() {
    const selectedFilmIds = [...selectedIds];
    const seed = createTasteSeed(tasteCards, selectedFilmIds);
    savePendingWatchedFilms(selectedFilmIds);
    saveTasteSeed(seed);
    onContinue(seed);
  }

  function skip() {
    onContinue(null);
  }

  return { selectedIds, selectedCount: selectedIds.size, toggle, done, skip };
}
