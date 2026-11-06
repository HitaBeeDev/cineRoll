"use client";

import { useReducedMotion } from "framer-motion";
import { useSession } from "next-auth/react";
import { FirstVisitOnboarding } from "@/components/home/first-visit-onboarding";
import { buildPoolViewModel } from "../build-pool-view-model";
import type { HomeClientProps } from "../domain-types";
import { useAutoRoll } from "../use-auto-roll";
import { useFilteredFilmCount } from "../use-filtered-film-count";
import { useHomeCatalog } from "../use-home-catalog";
import { useHomeFilters } from "../use-home-filters";
import { useHomeOnboarding } from "../use-home-onboarding";
import { usePersonalizedRoll } from "../use-personalized-roll";
import { useRollEngine } from "../use-roll-engine";
import { useSpaceRollShortcut } from "../use-space-roll-shortcut";
import { useTasteSeedSync } from "../use-taste-seed-sync";
import { HomeExperience } from "./home-experience";

export function HomeClient({ initialOnboarded, initialTotalCount, hero }: HomeClientProps) {
  const reducedMotion = useReducedMotion();
  const userId = useSession().data?.user?.id;
  const homeFilters = useHomeFilters();
  const catalog = useHomeCatalog(initialTotalCount);
  const filteredPool = useFilteredFilmCount(homeFilters.filters, homeFilters.hasActiveFilters);
  const personalization = usePersonalizedRoll();
  const onboarding = useHomeOnboarding(initialOnboarded, homeFilters.setFilter);
  useTasteSeedSync(userId);

  const rollEngine = useRollEngine({
    filters: homeFilters.filters,
    hasActiveFilters: homeFilters.hasActiveFilters,
    userId,
    personalizedRoll: personalization.personalizedRoll,
    reducedMotion,
    onCountChange: filteredPool.setFilteredCount,
  });
  const showOnboarding = onboarding.onboardingState === "show";
  // Offered, never imposed: the link appears once the visitor has rolled a film.
  const offerTasteCheck = onboarding.onboardingState === "offer" && rollEngine.film !== null && !rollEngine.isRolling;
  useSpaceRollShortcut(rollEngine.roll, !showOnboarding);
  const { requestAutoRoll } = useAutoRoll(rollEngine.roll);

  const pool = buildPoolViewModel({
    hasActiveFilters: homeFilters.hasActiveFilters,
    filteredCount: filteredPool.filteredCount,
    totalCount: catalog.totalCount,
    countLoading: filteredPool.isFilteredCountLoading,
    rolling: rollEngine.isRolling,
    reducedMotion,
  });

  // The home page always renders open. The taste check is a layer the visitor
  // opens from "Tune your rolls" — never on arrival (see OnboardingState).
  return (
    <>
      <div inert={showOnboarding}>
        <HomeExperience hero={hero} filters={homeFilters.filters} genres={catalog.genres} hasActiveFilters={homeFilters.hasActiveFilters} pool={pool} film={rollEngine.film} isRolling={rollEngine.isRolling} isSearching={rollEngine.isSearching} reducedMotion={reducedMotion} userId={userId} personalizedRoll={personalization.personalizedRoll} onApplyFilters={homeFilters.applyFilters} onClearTrackedFilters={homeFilters.clearTrackedFilters} onResetFilters={homeFilters.resetFilters} onClearAndRoll={() => { homeFilters.resetFilters(); requestAutoRoll(); }} onTogglePersonalizedRoll={personalization.togglePersonalizedRoll} onRoll={rollEngine.roll} onEngage={rollEngine.markCurrentEngaged} onNotInterested={rollEngine.markCurrentRejected} onTuneRolls={offerTasteCheck ? onboarding.openTasteCheck : undefined} />
      </div>
      {showOnboarding && (
        <FirstVisitOnboarding tasteCards={onboarding.tasteCards} tasteCardsStatus={onboarding.tasteCardsStatus} onRetryTasteCards={onboarding.retryTasteCards} onContinue={onboarding.completeOnboarding} />
      )}
    </>
  );
}
