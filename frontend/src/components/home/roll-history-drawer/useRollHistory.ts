"use client";

import { useEffect, useState } from "react";
import type { RollFilm } from "@/lib/api";
import {
  ROLL_HISTORY_STORAGE_KEY,
  MAX_ROLL_HISTORY_ITEMS,
} from "@/lib/home-storage";

/**
 * Loads this tab's roll history from sessionStorage each time the drawer opens,
 * capped to the most recent MAX_ROLL_HISTORY_ITEMS. Returns an empty list when
 * storage is missing or unparseable.
 */
export function useRollHistory(open: boolean): RollFilm[] {
  const [history, setHistory] = useState<RollFilm[]>([]);

  useEffect(() => {
    if (!open) return;

    const id = window.setTimeout(() => {
      try {
        const parsed = JSON.parse(
          window.sessionStorage.getItem(ROLL_HISTORY_STORAGE_KEY) ?? "[]",
        ) as RollFilm[];
        setHistory(parsed.slice(0, MAX_ROLL_HISTORY_ITEMS));
      } catch {
        setHistory([]);
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, [open]);

  return history;
}
