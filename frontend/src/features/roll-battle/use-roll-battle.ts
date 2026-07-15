"use client";

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  type MutableRefObject,
} from "react";
import {
  submitBattleResults,
  type BattleMatchResult,
  type RollFilm,
} from "@/lib/api";
import {
  ROLL_BATTLE_SELECTION_DELAY_MS,
  ROLL_BATTLE_TOTAL_ROUNDS,
} from "./constants";
import type { RollBattleController } from "./domain-types";
import { fetchBattlePool } from "./fetch-battle-pool";
import { getRollBattleView } from "./get-battle-view";
import { createInitialRollBattleState } from "./initial-state";
import { rollBattleReducer } from "./roll-battle-reducer";

export function useRollBattle(reducedMotion: boolean): RollBattleController {
  const [state, dispatch] = useReducer(
    rollBattleReducer,
    undefined,
    createInitialRollBattleState,
  );
  const matchLogRef = useRef<BattleMatchResult[]>([]);
  const requestIdRef = useRef(0);
  const pickLockedRef = useRef(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const view = getRollBattleView(state);

  const loadBattle = useCallback(async () => {
    resetPendingBattle(advanceTimerRef, pickLockedRef, matchLogRef);
    const requestId = ++requestIdRef.current;
    dispatch({ type: "loading_started" });
    try {
      const films = await fetchBattlePool();
      if (requestId === requestIdRef.current) {
        dispatch({ type: "pool_loaded", films });
      }
    } catch {
      if (requestId === requestIdRef.current) {
        dispatch({ type: "pool_failed" });
      }
    }
  }, []);

  const pickFilm = useCallback(
    (film: RollFilm) => {
      if (pickLockedRef.current || state.pickedId !== null) return;
      pickLockedRef.current = true;
      dispatch({ type: "film_picked", film });
      logMatchResult(film, view.leftFilm, view.rightFilm, matchLogRef.current);
      const delay = reducedMotion ? 0 : ROLL_BATTLE_SELECTION_DELAY_MS;
      advanceTimerRef.current = setTimeout(() => {
        pickLockedRef.current = false;
        if (state.round < ROLL_BATTLE_TOTAL_ROUNDS - 1) {
          dispatch({ type: "round_advanced", champion: film });
          return;
        }
        dispatch({ type: "battle_completed", champion: film });
        void submitBattleResults(matchLogRef.current);
      }, delay);
    },
    [reducedMotion, state.pickedId, state.round, view.leftFilm, view.rightFilm],
  );

  useEffect(() => {
    void loadBattle();
    return () => {
      requestIdRef.current += 1;
      clearAdvanceTimer(advanceTimerRef);
    };
  }, [loadBattle]);

  return { ...state, ...view, loadBattle, pickFilm };
}

function logMatchResult(
  winner: RollFilm,
  leftFilm: RollFilm | null,
  rightFilm: RollFilm | null,
  matchLog: BattleMatchResult[],
) {
  const opponent = winner.id === leftFilm?.id ? rightFilm : leftFilm;
  if (opponent) {
    matchLog.push({ winnerId: winner.id, loserId: opponent.id });
  }
}

function resetPendingBattle(
  timerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>,
  pickLockedRef: MutableRefObject<boolean>,
  matchLogRef: MutableRefObject<BattleMatchResult[]>,
) {
  clearAdvanceTimer(timerRef);
  pickLockedRef.current = false;
  matchLogRef.current = [];
}

function clearAdvanceTimer(
  timerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>,
) {
  if (timerRef.current) clearTimeout(timerRef.current);
  timerRef.current = null;
}
