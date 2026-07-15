import type { ReactNode } from "react";
import type { Recommendation } from "@/types/recommendation";

export type RecommendationActionButtonProps = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
};

export type RecommendationCardProps = {
  recommendation: Recommendation;
  onHidden: () => void;
};

export type RecommendationCardActions = {
  inWatchlist: boolean;
  watchlistPending: boolean;
  decisionPending: boolean;
  onToggleWatchlist: () => void;
  onNotInterested: () => void;
};

export type RecommendationCardViewProps = {
  recommendation: Recommendation;
  actions: RecommendationCardActions;
};

export type RecommendationPosterProps = RecommendationCardViewProps;

export type RecommendationActionBarProps = {
  actions: RecommendationCardActions;
};

export type RecommendationDetailsProps = {
  recommendation: Recommendation;
};

export type RecommendationsSectionProps = {
  recommendations: Recommendation[];
  coldStart: boolean;
};

export type RecommendationsSectionViewProps = {
  recommendations: Recommendation[];
  coldStart: boolean;
  onHidden: (id: string) => void;
};
