import { formatAwardBody } from "../lib/award-formatters";
import type { BlindRollAward } from "../types";

type ExpandedAwardProps = {
  award: BlindRollAward | undefined;
};

export function ExpandedAward({ award }: ExpandedAwardProps) {
  if (!award) return null;

  return (
    <div className="mt-3 flex shrink-0 items-start justify-between gap-3 rounded-xl border border-[#D4AF37]/30 bg-[#09090f]/80 p-3">
      <div className="min-w-0">
        <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-[#e8453c]">
          {formatAwardBody(award.awardBody)} · Award Year {award.awardYear}
        </p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-[15px] font-bold leading-tight">
          {award.category}
        </p>
        {award.nominee && <p className="mt-1 text-xs text-[#aaaabc]">{award.nominee}</p>}
      </div>
      <span className="w-fit shrink-0 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#D4AF37]">
        {award.won ? "Won" : "Nominated"}
      </span>
    </div>
  );
}
