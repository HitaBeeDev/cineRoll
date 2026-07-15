import type { BattleCardRatingBadgeProps } from "../component-props";

export function BattleCardRatingBadge({
  rating,
}: BattleCardRatingBadgeProps) {
  return (
    <div className="absolute bottom-2 right-2 rounded-md border border-[#F5F5F0]/10 bg-[#09090f]/80 px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] backdrop-blur-sm">
      {rating == null ? (
        <span className="text-[#F5F5F0]/30">No IMDb</span>
      ) : (
        <span className="text-[#F5F5F0]/70">★ {rating.toFixed(1)}</span>
      )}
    </div>
  );
}
