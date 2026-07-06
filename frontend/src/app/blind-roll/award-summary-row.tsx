import type { AwardSummary } from "./types";

type AwardSummaryRowProps = {
  summary: AwardSummary;
};

export function AwardSummaryRow({ summary }: AwardSummaryRowProps) {
  return (
    <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-[#77778b]">
          Award Trail
        </p>
        <p className="mt-0.5 truncate font-[family-name:var(--font-display)] text-sm font-bold text-[#F5F5F0]">
          {summary.bodies} · {summary.yearTrail} · {summary.count}{" "}
          {summary.count === 1 ? "record" : "records"}
        </p>
      </div>
      <span className="w-fit shrink-0 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#D4AF37]">
        {summary.status}
      </span>
    </div>
  );
}
