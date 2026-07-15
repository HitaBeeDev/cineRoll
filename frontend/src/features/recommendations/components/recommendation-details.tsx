import type { RecommendationDetailsProps } from "../recommendation-component-types";

export function RecommendationDetails({
  recommendation,
}: RecommendationDetailsProps) {
  return (
    <>
      <h3 className="mt-3 line-clamp-1 font-[family-name:var(--font-display)] text-sm font-bold text-[#F5F5F0]">
        {recommendation.title}
      </h3>
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.15em] text-[#7a7a8c]">
        {recommendation.year}
      </p>
      <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] font-[family-name:var(--font-geist-mono)] text-[11px] leading-relaxed text-[#888899]">
        {recommendation.reason}
      </p>
    </>
  );
}
