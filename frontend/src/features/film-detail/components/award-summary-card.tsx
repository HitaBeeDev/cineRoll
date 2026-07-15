import { cn } from "@/lib/utils";
import { getAwardYearLabel, sortAwardRecords } from "../award-view-model";
import { HERO_AWARD_GOLD } from "../config";
import type { AwardSummaryCardProps } from "../component-props";

export function AwardSummaryCard(props: AwardSummaryCardProps) {
  const sortedRecords = sortAwardRecords(props.records);
  const yearLabel = getAwardYearLabel(props.records);

  return (
    <article className="overflow-hidden border border-[#1e1e30]">
      <div className="flex items-center justify-between border-b border-[#1a1a28] bg-[#0d0d18] px-5 py-4">
        <div>
          {yearLabel && (
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.55em] text-[#686888]">
              {yearLabel}
            </p>
          )}
          <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-lg font-bold leading-tight text-[#e0e0f0]">
            {props.title}
          </h3>
        </div>
        {props.showCounts && (
          <div className="flex items-baseline gap-6">
            <div className="text-right">
              <span
                className="block font-[family-name:var(--font-display)] text-2xl font-bold leading-none tabular-nums"
                style={{ color: props.wins > 0 ? HERO_AWARD_GOLD : "#4a4a68" }}
              >
                {props.wins}
              </span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.4em] text-[#686888]">Wins</span>
            </div>
            <div className="text-right">
              <span className="block font-[family-name:var(--font-display)] text-xl font-bold leading-none tabular-nums text-[#686888]">
                {props.nominations}
              </span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.4em] text-[#686888]">Noms</span>
            </div>
          </div>
        )}
      </div>
      {sortedRecords.length > 0 && (
        <div className="divide-y divide-[#0b0b12]">
          {sortedRecords.map((record) => (
            <div
              key={`${record.awardYear}-${record.category}-${record.nominee}`}
              className={cn(
                "grid grid-cols-[auto_1fr_auto] items-center gap-4 border-l-2 px-5 py-3.5",
                record.won
                  ? "border-l-[#D4AF37] bg-[#16130b]"
                  : "border-l-transparent bg-[#080810]",
              )}
            >
              <span
                className={cn(
                  "shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.4em]",
                  record.won ? "text-[#D4AF37]" : "text-[#2a2a3a]",
                )}
              >
                {record.won ? "◆ Won" : "Nom"}
              </span>
              <div className="min-w-0">
                <p className={cn("text-[0.8rem] font-medium leading-5", record.won ? "text-[#e8ddb8]" : "text-[#9090a8]")}>{record.category}</p>
                <p className="mt-1 text-[0.78rem] leading-5 text-[#85859e]" title={record.nominee}>{record.nominee}</p>
              </div>
              <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#525268]">{record.awardYear}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
