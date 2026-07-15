import { formatCompletionPercentage } from "../format-completion-percentage";
import type { CompletionistSummaryProps } from "../completionist-component-types";

export function CompletionistSummary({ overall }: CompletionistSummaryProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#1e1e2a] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8453c]">
          Completionist
        </p>
        <h2
          id="completionist-heading"
          className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0]"
        >
          Your archive progress
        </h2>
        <p className="mt-2 max-w-xl font-[family-name:var(--font-geist-mono)] text-[11px] leading-relaxed text-[#9a9aac]">
          Every film you mark watched moves you closer to completing the
          collection.
        </p>
      </div>
      <div className="shrink-0 sm:text-right">
        <span className="font-[family-name:var(--font-display)] text-4xl font-bold tabular-nums text-[#F5F5F0]">
          {formatCompletionPercentage(overall.percentage)}
        </span>
        <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#77778b]">
          {overall.watched.toLocaleString()} of {overall.total.toLocaleString()} watched
        </p>
      </div>
    </div>
  );
}
