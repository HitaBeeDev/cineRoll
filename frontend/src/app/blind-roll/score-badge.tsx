import type { SessionScore } from "./types";

type ScoreBadgeProps = {
  score: SessionScore;
};

export function ScoreBadge({ score }: ScoreBadgeProps) {
  return (
    <div className="w-fit rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-4 py-2 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.12em] text-[#D4AF37]">
      {score.correct} solved · {score.total} attempted
    </div>
  );
}
