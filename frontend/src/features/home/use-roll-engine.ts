"use client";

import { useCallback, useMemo, useState } from "react";
import type { FilterState } from "@cineroll/types";
import type { RandomResult } from "@/lib/api";
import { useToast } from "@/components/ui/toast/use-toast";
import { useRollSession } from "@/features/roll/use-roll-session";
import { presentRollError } from "./present-roll-error";
import { pulseSearching } from "./pulse-searching";

type UseRollEngineInput = {
  filters: FilterState;
  hasActiveFilters: boolean;
  userId?: string | undefined;
  personalizedRoll: boolean;
  reducedMotion: boolean | null;
  onCountChange: (count: number) => void;
};

/**
 * The home page's roll: the shared session plus the things only this page does —
 * the searching pulse under a filtered pool, the pool count the result reports
 * back, and a toast when a roll cannot be served.
 */
export function useRollEngine(input: UseRollEngineInput) {
  const {
    filters,
    hasActiveFilters,
    userId,
    personalizedRoll,
    reducedMotion,
    onCountChange,
  } = input;
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);

  const onRollStart = useCallback(
    () => pulseSearching(hasActiveFilters, reducedMotion, setIsSearching),
    [hasActiveFilters, reducedMotion],
  );
  const onResult = useCallback(
    (result: RandomResult) => onCountChange(result.total),
    [onCountChange],
  );
  const onError = useCallback(
    (error: unknown) => presentRollError(error, onCountChange, toast),
    [onCountChange, toast],
  );
  const requestContext = useMemo(() => ({ hasActiveFilters }), [hasActiveFilters]);

  const session = useRollSession({
    filters,
    userId,
    personalized: personalizedRoll,
    source: "home_roll",
    requestContext,
    onRollStart,
    onResult,
    onError,
  });

  // The card fires these without an argument; the film on screen is the one the
  // session is holding, so the id comes from here rather than the caller.
  const markCurrentEngaged = useCallback(() => {
    if (session.film) session.markEngaged(session.film.id);
  }, [session]);
  const markCurrentRejected = useCallback(() => {
    if (session.film) session.markRejected(session.film.id);
  }, [session]);

  return {
    film: session.film,
    isRolling: session.isRolling,
    isSearching,
    roll: session.roll,
    markCurrentEngaged,
    markCurrentRejected,
  };
}
