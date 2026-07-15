"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RollFilm } from "@/lib/api";
import { ROLL_BATTLE_COPY_STATUS_MS } from "./constants";
import type { RollBattleShareController } from "./domain-types";
import { shareBattleWinner } from "./share-battle-winner";

export function useBattleWinnerShare(): RollBattleShareController {
  const [status, setStatus] = useState<"idle" | "copied">("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shareWinner = useCallback(async (film: RollFilm) => {
    const result = await shareBattleWinner(film);
    if (result !== "copied") return;

    setStatus("copied");
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(
      () => setStatus("idle"),
      ROLL_BATTLE_COPY_STATUS_MS,
    );
  }, []);

  const resetShareStatus = useCallback(() => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = null;
    setStatus("idle");
  }, []);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  return { status, shareWinner, resetShareStatus };
}
