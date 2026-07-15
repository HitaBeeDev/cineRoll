"use client";

import { useState } from "react";
import type { RecommendationsSectionProps } from "../recommendation-component-types";
import { RecommendationsSectionView } from "./recommendations-section-view";

export function RecommendationsSection({
  recommendations,
  coldStart,
}: RecommendationsSectionProps) {
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(new Set());
  const visibleRecommendations = recommendations.filter(
    (recommendation) => !hiddenIds.has(recommendation.id),
  );

  return (
    <RecommendationsSectionView
      recommendations={visibleRecommendations}
      coldStart={coldStart}
      onHidden={(id) => {
        setHiddenIds((currentIds) => new Set(currentIds).add(id));
      }}
    />
  );
}
