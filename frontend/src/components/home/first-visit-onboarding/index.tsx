"use client";

import type { TasteCardFilm } from "@/lib/api";
import type { TasteSeed } from "@/lib/home-storage";
import type { TasteCardsStatus } from "@/components/home/first-visit-onboarding/types";
import { useTasteSelection } from "@/components/home/first-visit-onboarding/useTasteSelection";
import { OnboardingBackdrop } from "@/components/home/first-visit-onboarding/onboarding-backdrop";
import { OnboardingHeader } from "@/components/home/first-visit-onboarding/onboarding-header";
import { TasteCheckIntro } from "@/components/home/first-visit-onboarding/taste-check-intro";
import { TasteCardGrid } from "@/components/home/first-visit-onboarding/taste-card-grid";

export function FirstVisitOnboarding({
  tasteCards,
  tasteCardsStatus,
  onRetryTasteCards,
  onContinue,
}: {
  tasteCards: TasteCardFilm[];
  tasteCardsStatus: TasteCardsStatus;
  onRetryTasteCards: () => void;
  onContinue: (seed: TasteSeed | null) => void;
}) {
  const { selectedIds, selectedCount, toggle, done, skip } = useTasteSelection({
    tasteCards,
    onContinue,
  });

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#09090f] text-[#F5F5F0]">
      <OnboardingBackdrop />

      <OnboardingHeader onSkip={skip} />

      <main className="relative z-20 grid flex-1 grid-cols-1 gap-8 px-5 pb-8 pt-4 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-10 lg:px-10 lg:pb-10 lg:pt-0">
        <TasteCheckIntro selectedCount={selectedCount} onDone={done} onSkip={skip} />

        <TasteCardGrid
          tasteCards={tasteCards}
          status={tasteCardsStatus}
          selectedIds={selectedIds}
          onToggle={toggle}
          onRetry={onRetryTasteCards}
        />
      </main>
    </div>
  );
}
