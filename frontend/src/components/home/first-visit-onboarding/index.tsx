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
    // A modal layer over the home page, not a replacement for it: the home page
    // stays in the HTML underneath (inert while this is open), so search engines
    // — always first-time visitors — still read what CineRoll is.
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="taste-check-title"
      className="fixed inset-0 z-[60] flex min-h-screen flex-col overflow-y-auto overflow-x-hidden overscroll-contain bg-ink-900 text-fg-hi"
    >
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
