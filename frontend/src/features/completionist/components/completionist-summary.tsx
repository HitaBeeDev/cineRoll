import { CountUp } from "@/features/stats/components/count-up";
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
        <p className="mt-2 max-w-xl font-[family-name:var(--font-geist-mono)] text-[13px] leading-relaxed text-[#b4b4c4]">
          {overall.total.toLocaleString()} award-winning films in the archive —
          every one you watch fills a frame.
        </p>
      </div>
      <div className="shrink-0 sm:text-right">
        <CountUp
          value={overall.percentage}
          decimals={Number.isInteger(overall.percentage) ? 0 : 1}
          suffix="%"
          className="font-[family-name:var(--font-display)] text-5xl font-bold tabular-nums text-[#F5F5F0]"
        />
        <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.08em] text-[#b4b4c4]">
          <CountUp value={overall.watched} /> of{" "}
          {overall.total.toLocaleString()} watched
        </p>
      </div>
    </div>
  );
}
