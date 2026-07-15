import { RecommendationsSection } from "@/features/recommendations/components/recommendations-section";
import type { ProfileRecommendationsProps } from "../profile-component-types";
import { RecommendationsUnlockState } from "./recommendations-unlock-state";

export async function ProfileRecommendations({
  recommendationsPromise,
}: ProfileRecommendationsProps) {
  const result = await recommendationsPromise;

  if (result.recommendations.length > 0) {
    return (
      <RecommendationsSection
        recommendations={result.recommendations}
        coldStart={result.coldStart}
      />
    );
  }

  return result.notEnoughData ? <RecommendationsUnlockState /> : null;
}
