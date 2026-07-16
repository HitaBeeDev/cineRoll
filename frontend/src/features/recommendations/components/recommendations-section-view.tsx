import type { RecommendationsSectionViewProps } from "../recommendation-component-types";
import { RecommendationCard } from "./recommendation-card";

export function RecommendationsSectionView({
  recommendations,
  coldStart,
  onHidden,
}: RecommendationsSectionViewProps) {
  return (
    <section className="mt-16">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0]">
        Recommended for you
      </h2>
      <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[13px] text-[#b4b4c4]">
        {coldStart
          ? "Early recommendations — rate more films to improve your picks"
          : "Picked from your taste · not the global Pick of the Day"}
      </p>
      {recommendations.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {recommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onHidden={() => onHidden(recommendation.id)}
            />
          ))}
        </div>
      ) : (
        <p className="mt-6 font-[family-name:var(--font-geist-mono)] text-[13px] leading-relaxed text-[#b4b4c4]">
          That’s everything for now — roll and rate a few films to refresh your
          picks.
        </p>
      )}
    </section>
  );
}
