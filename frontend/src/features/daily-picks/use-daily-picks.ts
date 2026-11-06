"use client";

import { useEffect, useState } from "react";
import type { DailyPick, DailyPicksController } from "./domain-types";
import { getBrowserStorage } from "./get-browser-storage";
import { loadDailyPicks } from "./load-daily-picks";

type LoadedPicks = {
  picks: DailyPick[];
  userKey: string;
  complete: boolean;
};

/**
 * The page arrives with today's guest picks from the server. Guests keep them.
 * A signed-in user gets their own draw (watched and hidden films left out) —
 * same seeds, so usually the same films — and the server picks stay on screen
 * until it is complete. Without server picks (backend was down at render) the
 * browser draws, showing each pick as it lands.
 */
export function useDailyPicks(
  serverPicks: DailyPick[],
  userId: string | undefined,
  sessionReady: boolean,
): DailyPicksController {
  const userKey = userId ?? "guest";
  const needsOwnPicks = sessionReady && (userId != null || serverPicks.length === 0);
  const [loaded, setLoaded] = useState<LoadedPicks | null>(null);

  useEffect(() => {
    if (!needsOwnPicks) return;
    let active = true;
    const timeoutId = window.setTimeout(async () => {
      const picks = await loadDailyPicks(userId, getBrowserStorage(), (pick) => {
        if (!active) return;
        setLoaded((prev) => ({
          picks: prev?.userKey === userKey ? [...prev.picks, pick] : [pick],
          userKey,
          complete: false,
        }));
      });
      if (active) setLoaded({ picks, userKey, complete: true });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [needsOwnPicks, userId, userKey]);

  const own = needsOwnPicks && loaded?.userKey === userKey ? loaded : null;
  const showOwn = own != null && (own.complete || serverPicks.length === 0);
  const picks = showOwn ? own.picks : serverPicks;
  return {
    isLoading: picks.length === 0 && !own?.complete,
    picks,
  };
}
