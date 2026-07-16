"use client";

import { useEffect, type RefObject } from "react";
import type { RollFilm } from "@/lib/api";
import { ROLL_RESULT_SCROLL_DELAY_MS } from "./constants";

export function useRollResultScroll(
  film: RollFilm | null,
  targetRef: RefObject<HTMLDivElement | null>,
  reducedMotion: boolean | null,
): void {
  useEffect(() => {
    if (!film) return;
    const timer = window.setTimeout(() => {
      targetRef.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }, ROLL_RESULT_SCROLL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [film, reducedMotion, targetRef]);
}
