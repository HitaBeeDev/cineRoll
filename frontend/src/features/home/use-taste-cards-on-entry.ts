"use client";

import { useEffect } from "react";
import type { OnboardingState } from "./domain-types";

export function useTasteCardsOnEntry(state: OnboardingState, loadTasteCards: () => void): void {
  useEffect(() => {
    if (state !== "show") return;
    const timer = window.setTimeout(loadTasteCards, 0);
    return () => window.clearTimeout(timer);
  }, [state, loadTasteCards]);
}
