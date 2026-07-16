"use client";

import { useEffect } from "react";
import { saveOnboardingGenres } from "@/lib/api";
import { readTasteSeedGenres } from "./read-taste-seed-genres";
import { isTasteSeedSynced, markTasteSeedSynced } from "./taste-seed-sync-storage";

export function useTasteSeedSync(userId: string | undefined): void {
  useEffect(() => {
    if (!userId || isTasteSeedSynced(userId)) return;
    const genres = readTasteSeedGenres();
    if (genres.length === 0) return;
    void saveOnboardingGenres(genres)
      .then(() => markTasteSeedSynced(userId))
      .catch(() => undefined);
  }, [userId]);
}
