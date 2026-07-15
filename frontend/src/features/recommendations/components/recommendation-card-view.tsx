import type { RecommendationCardViewProps } from "../recommendation-component-types";
import { RecommendationDetails } from "./recommendation-details";
import { RecommendationPoster } from "./recommendation-poster";

export function RecommendationCardView({
  recommendation,
  actions,
}: RecommendationCardViewProps) {
  return (
    <div className="flex flex-col">
      <RecommendationPoster
        recommendation={recommendation}
        actions={actions}
      />
      <RecommendationDetails recommendation={recommendation} />
    </div>
  );
}
