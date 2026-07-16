import type { ReactNode } from "react";
import type { FilterState } from "@cineroll/types";
import type { RollFilm } from "@/lib/api";
import type { PoolViewModel } from "./build-pool-view-model";

export type AnimatedPoolCountProps = { value: string };
export type HomeHeroFiltersProps = {
  hero: ReactNode;
  filters: FilterState;
  genres: string[];
  hasActiveFilters: boolean;
  onFiltersChange: (updates: Partial<FilterState>) => void;
  onClearFilters: () => void;
};
export type RollButtonProps = {
  disabled: boolean;
  effectiveCount: number | null;
  effectiveCountLoading: boolean;
  hasActiveFilters: boolean;
  isRolling: boolean;
  shouldPulse: boolean;
  onRoll: () => void;
};
export type PoolStatusProps = {
  displayCount: number | null;
  effectiveCount: number | null;
  effectiveCountLoading: boolean;
  poolCountLabel: string;
};
export type PersonalizedRollToggleProps = { enabled: boolean; onToggle: () => void };
export type RollControlsProps = {
  hasActiveFilters: boolean;
  isRolling: boolean;
  isSearching: boolean;
  pool: PoolViewModel;
  personalizedRoll: boolean;
  showPersonalizedRoll: boolean;
  onRoll: () => void;
  onTogglePersonalizedRoll: () => void;
};
export type HomeControlPanelProps = HomeHeroFiltersProps & RollControlsProps & {
  onOpenHistory: () => void;
};
export type RollResultPanelProps = {
  effectiveCount: number | null;
  film: RollFilm | null;
  isAuthenticated: boolean;
  isRolling: boolean;
  reducedMotion: boolean | null;
  rollAnnouncement: string;
  onClearFilters: () => void;
  onClearAndRoll: () => void;
  onEngage: () => void;
  onNotInterested: () => void;
  onRoll: () => void;
};
export type HomeExperienceProps = {
  hero: ReactNode;
  filters: FilterState;
  genres: string[];
  hasActiveFilters: boolean;
  pool: PoolViewModel;
  film: RollFilm | null;
  isRolling: boolean;
  isSearching: boolean;
  reducedMotion: boolean | null;
  userId?: string | undefined;
  personalizedRoll: boolean;
  onApplyFilters: (updates: Partial<FilterState>) => void;
  onClearTrackedFilters: () => void;
  onResetFilters: () => void;
  onClearAndRoll: () => void;
  onTogglePersonalizedRoll: () => void;
  onRoll: () => void;
  onEngage: () => void;
  onNotInterested: () => void;
};
