import type { ReactNode } from "react";
import type { FilterState } from "@cineroll/types";
import type { BanditLane, RollFilm, TasteCardFilm } from "@/lib/api";

export type TasteCardsStatus = "idle" | "loading" | "ready" | "error";
export type OnboardingState = "show" | "done";

export type CurrentRoll = {
  film: RollFilm;
  engaged: boolean;
  rejected: boolean;
  lane?: BanditLane | undefined;
};

export type BanditFeedback = { lane: BanditLane; reward: number };

export type HomeClientProps = {
  initialOnboarded: boolean;
  hero: ReactNode;
};

export type HomeFilters = {
  filters: FilterState;
  genres: string[];
  hasActiveFilters: boolean;
  applyFilters: (updates: Partial<FilterState>) => void;
  clearFilters: () => void;
};

export type OnboardingView = {
  state: OnboardingState;
  tasteCards: TasteCardFilm[];
  tasteCardsStatus: TasteCardsStatus;
  retryTasteCards: () => void;
  completeOnboarding: (seed: { primaryGenre: string | null } | null) => void;
};
