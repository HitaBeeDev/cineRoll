"use client";

import { useEffect, useState } from "react";
import type { DailyPick, DailyPicksController } from "./domain-types";
import { getBrowserStorage } from "./get-browser-storage";
import { loadDailyPicks } from "./load-daily-picks";

type LoadedPicks = {
  picks: DailyPick[];
  userKey: string;
};

export function useDailyPicks(
  userId: string | undefined,
  enabled = true,
): DailyPicksController {
  const userKey = userId ?? "guest";
  const [loaded, setLoaded] = useState<LoadedPicks | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const timeoutId = window.setTimeout(async () => {
      // Show each pick the moment it is chosen rather than after all three: the
      // slots resolve one after another, and holding the finished ones back put
      // the first hero image four seconds behind the page.
      const picks = await loadDailyPicks(userId, getBrowserStorage(), (pick) => {
        if (!active) return;
        setLoaded((prev) => ({
          picks: prev?.userKey === userKey ? [...prev.picks, pick] : [pick],
          userKey,
        }));
      });
      if (active) setLoaded({ picks, userKey });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [enabled, userId, userKey]);

  const hasCurrentPicks = loaded?.userKey === userKey;
  return {
    isLoading: !enabled || !hasCurrentPicks,
    picks: hasCurrentPicks ? loaded.picks : [],
  };
}
