"use client";

import { useCallback, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import type { FilterState } from "@cineroll/types";
import { fetchRandom, type RollFilm } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

/**
 * Rolls a random film from the current filtered set and hands it back for the
 * roll dialog to show.
 *
 * It used to navigate straight to /film/[slug], which ended the session the roll
 * belonged to: the filters you spent a minute building were behind a back button,
 * a second opinion cost a round trip, and none of the roll-tuning signals the home
 * card collects were reachable from here at all. Keeping the result on the page
 * makes rolling repeatable, which is the only way it is any use — the answer to
 * "not that one" is another roll, not a page.
 */

/** How many recent films stay out of the pool, so rolling again does not hand
 *  back what it just showed. Capped because the exclusion narrows the set, and a
 *  tight filter plus an unbounded history eventually excludes everything. */
const RECENT_LIMIT = 20;

/** `empty` is the filters returning nothing — the user's problem to fix, and a
 *  different message from the network being down. */
export type BrowseRollError = "empty" | "failed";

export function useBrowseRoll(filters: FilterState) {
  const userId = useSession().data?.user?.id;
  const [isOpen, setIsOpen] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [film, setFilm] = useState<RollFilm | null>(null);
  const [error, setError] = useState<BrowseRollError | null>(null);

  // Refs, not state: neither belongs in a render, and the in-flight guard has to
  // be readable by a call that started before the last one repainted.
  const recentIds = useRef<string[]>([]);
  const inFlight = useRef(false);

  const roll = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;

    setIsOpen(true);
    setRolling(true);
    setError(null);
    setFilm(null);

    try {
      // The user id is what lets the server keep films this account has hidden or
      // already watched out of the draw — the card's own "Not interested" writes
      // that list, so without it a reroll could return what was just dismissed.
      const { film: rolled } = await fetchRandom(filters, userId, false, recentIds.current);

      recentIds.current = [rolled.id, ...recentIds.current].slice(0, RECENT_LIMIT);
      setFilm(rolled);
      trackEvent({ type: "roll", filmId: rolled.id, context: { source: "browse_results", filters } });
    } catch (caught) {
      const code = caught instanceof Error ? (caught as Error & { code?: string }).code : undefined;
      setError(code === "NO_FILMS_FOUND" ? "empty" : "failed");
    } finally {
      inFlight.current = false;
      setRolling(false);
    }
  }, [filters, userId]);

  const close = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  return { isOpen, rolling, film, error, roll, close };
}
