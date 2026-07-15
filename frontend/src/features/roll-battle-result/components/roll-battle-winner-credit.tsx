import type { RollBattleWinnerProps } from "../component-props";
import { formatRollBattleAwardSummary } from "../format-award-summary";

export function RollBattleWinnerCredit({
  film,
  emptyAwardsLabel,
}: RollBattleWinnerProps) {
  return (
    <div className="space-y-2">
      {film.director && (
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#555568]">
          Directed by{" "}
          <span className="text-[#F5F5F0]/70">{film.director}</span>
        </p>
      )}
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#D4AF37]">
        {formatRollBattleAwardSummary(film, emptyAwardsLabel)}
      </p>
    </div>
  );
}
