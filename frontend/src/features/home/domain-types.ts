import type { ReactNode } from "react";
import type { FilterState } from "@cineroll/types";
import type { TasteCardFilm } from "@/lib/api";

export type TasteCardsStatus = "idle" | "loading" | "ready" | "error";
/**
 * offer — not taken yet; the home page is fully open and, after the first roll,
 *         an inline "Tune your rolls" link offers the taste check.
 * show  — the taste check is open (only ever because the visitor asked).
 * done  — taken or skipped.
 * Never "show" on load: a full-screen layer on arrival hid the home page from
 * first-time visitors and from Google (which also can't load the cards — /api/
 * is disallowed in robots.txt).
 */
export type OnboardingState = "offer" | "show" | "done";

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
