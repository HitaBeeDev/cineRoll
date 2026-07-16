"use client";

import { useCallback, useRef, useState } from "react";
import type { FilterState } from "@cineroll/types";
import type { RollFilm } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import type { CurrentRoll } from "./domain-types";
import { createCurrentRoll } from "./create-current-roll";
import { presentRollError } from "./present-roll-error";
import { processOutgoingRoll } from "./process-outgoing-roll";
import { pulseSearching } from "./pulse-searching";
import { recordRollResult } from "./record-roll-result";
import { requestNextRoll } from "./request-next-roll";
import { trackRollRequest } from "./track-roll-request";

type UseRollEngineInput = {
  filters: FilterState;
  hasActiveFilters: boolean;
  userId?: string | undefined;
  personalizedRoll: boolean;
  reducedMotion: boolean | null;
  onCountChange: (count: number) => void;
};

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
  const [film, setFilm] = useState<RollFilm | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const currentRollRef = useRef<CurrentRoll | null>(null);
  const rollingRef = useRef(false);

  const roll = useCallback(async () => {
    if (rollingRef.current) return;
    rollingRef.current = true;
    setIsRolling(true);
    setFilm(null);
    const feedback = processOutgoingRoll(currentRollRef.current);
    currentRollRef.current = null;
    const personalized = personalizedRoll && Boolean(userId);
    trackRollRequest(personalized, filters, hasActiveFilters);
    pulseSearching(hasActiveFilters, reducedMotion, setIsSearching);

    try {
      const result = await requestNextRoll({
        filters,
        userId,
        personalized,
        banditFeedback: feedback,
      });
      recordRollResult(result, filters);
      currentRollRef.current = createCurrentRoll(result.film, result.lane);
      setFilm(result.film);
      onCountChange(result.total);
    } catch (error) {
      presentRollError(error, onCountChange, toast);
    } finally {
      rollingRef.current = false;
      setIsRolling(false);
    }
  }, [filters, hasActiveFilters, userId, personalizedRoll, reducedMotion, onCountChange, toast]);

  const markCurrentEngaged = useCallback(() => {
    if (currentRollRef.current) currentRollRef.current.engaged = true;
  }, []);
  const rejectAndRoll = useCallback(() => {
    if (currentRollRef.current) currentRollRef.current.rejected = true;
    void roll();
  }, [roll]);

  return { film, isRolling, isSearching, roll, markCurrentEngaged, rejectAndRoll };
}
