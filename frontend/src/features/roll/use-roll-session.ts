"use client";

import { useCallback, useRef, useState } from "react";
import type { RollFilm } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { markPendingRoll } from "@/lib/home-storage";
import { recordRollResult } from "./record-roll-result";
import { requestNextRoll } from "./request-next-roll";
import type { UseRollSessionInput } from "./roll-session-types";
import { spendPendingRoll } from "./spend-pending-roll";

/**
 * The roll engine, one copy, shared by every surface that draws a film.
 *
 * It owns the loop rather than the layout: grade the outgoing draw, ask for the
 * next one carrying everything the session knows, file what comes back, and take
 * the marks that decide how this draw will be graded in turn. What a page does
 * with the result — a rail, a dialog, a toast, a countdown — is the page's
 * business and stays there.
 *
 * It exists because it used to be the home page's business too. Browse had its
 * own shorter loop: a twenty-item list of ids in a ref, no penalties, no bandit,
 * no history, gone on refresh. The same button, on two pages, taught the engine
 * different amounts — a difference the engine has no way to justify and the user
 * no way to see.
 */
export function useRollSession(input: UseRollSessionInput) {
  const [film, setFilm] = useState<RollFilm | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  // A ref, not the state above: the guard has to be readable by a call that
  // starts before the last one has repainted.
  const inFlight = useRef(false);

  const { filters, userId, source, requestContext, onRollStart, onResult, onError } = input;
  const personalized = Boolean(input.personalized) && Boolean(userId);

  const roll = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsRolling(true);
    setFilm(null);
    onRollStart?.();

    const spent = spendPendingRoll();
    void trackEvent({
      type: personalized ? "roll_personalized" : "roll",
      context: { source, filters, drawIndex: spent.drawIndex, ...requestContext },
    });

    try {
      const result = await requestNextRoll({ filters, userId, personalized, spent });
      recordRollResult({ result, filters, source, drawIndex: spent.drawIndex });
      setFilm(result.film);
      onResult?.(result);
    } catch (error) {
      onError?.(error);
    } finally {
      inFlight.current = false;
      setIsRolling(false);
    }
  }, [filters, userId, personalized, source, requestContext, onRollStart, onResult, onError]);

  // Marks only — the next roll spends them. Keyed by film id so a card left
  // behind by an earlier draw cannot grade the current one.
  const markEngaged = useCallback((filmId: string) => markPendingRoll(filmId, "engaged"), []);
  const markRejected = useCallback((filmId: string) => markPendingRoll(filmId, "rejected"), []);

  return { film, setFilm, isRolling, roll, markEngaged, markRejected };
}
