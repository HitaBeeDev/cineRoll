"use client";

import { useCallback, useState } from "react";
import type { FilterState } from "@cineroll/types";
import { fetchOnboardingTasteCards, type TasteCardFilm } from "@/lib/api";
import type { TasteSeed } from "@/lib/home-storage";
import type { OnboardingState, TasteCardsStatus } from "./domain-types";
import { markOnboardedCookie } from "./mark-onboarded-cookie";
import { persistOnboardingFlag } from "./persist-onboarding-flag";
import { useLegacyOnboardingMigration } from "./use-legacy-onboarding-migration";
import { useTasteCardsOnEntry } from "./use-taste-cards-on-entry";

export function useHomeOnboarding(
  initialOnboarded: boolean,
  setFilter: (updates: Partial<FilterState>) => void,
) {
  const [state, setState] = useState<OnboardingState>(initialOnboarded ? "done" : "show");
  const [tasteCards, setTasteCards] = useState<TasteCardFilm[]>([]);
  const [status, setStatus] = useState<TasteCardsStatus>("idle");

  const loadTasteCards = useCallback(() => {
    setStatus("loading");
    void fetchOnboardingTasteCards()
      .then((films) => {
        setTasteCards(films);
        setStatus(films.length > 0 ? "ready" : "error");
      })
      .catch(() => setStatus("error"));
  }, []);

  useLegacyOnboardingMigration(initialOnboarded, setState);
  useTasteCardsOnEntry(state, loadTasteCards);

  const completeOnboarding = useCallback((seed: TasteSeed | null) => {
    if (seed?.primaryGenre) setFilter({ genres: [seed.primaryGenre], page: 1 });
    persistOnboardingFlag();
    markOnboardedCookie();
    setState("done");
  }, [setFilter]);

  return {
    onboardingState: state,
    tasteCards,
    tasteCardsStatus: status,
    retryTasteCards: loadTasteCards,
    completeOnboarding,
  };
}
