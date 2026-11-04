import type { ReactNode } from "react";
import type { FilterState } from "@cineroll/types";
import type { TasteCardFilm } from "@/lib/api";

export type TasteCardsStatus = "idle" | "loading" | "ready" | "error";
export type OnboardingState = "show" | "done";

export type HomeClientProps = {
  initialOnboarded: boolean;
  /** Archive size from the server render; null when the API was unreachable. */
  initialTotalCount: number | null;
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
