import type { RecommendationDetailsProps } from "../recommendation-component-types";

export function RecommendationDetails({
  recommendation,
}: RecommendationDetailsProps) {
  return (
    <>
      <h3 className="mt-3 line-clamp-1 font-[family-name:var(--font-display)] text-sm font-bold text-[#F5F5F0]">
        {recommendation.title}
      </h3>
      <p className="font-[family-name:var(--font-geist-mono)] text-[12px] tracking-[0.08em] text-[#9a9aac]">
        {recommendation.year}
      </p>
      <p className="mt-1.5 line-clamp-2 min-h-[2.75rem] font-[family-name:var(--font-geist-mono)] text-[13px] leading-relaxed text-[#b4b4c4]">
        {recommendation.reason}
      </p>
    </>
  );
}
