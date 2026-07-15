import type { AwardSummaryProps } from "../component-props";
import {
  getAwardBreakdown,
  getHighlightedAwardRecords,
} from "../award-view-model";
import { HERO_AWARD_GOLD } from "../config";

export function AwardsDominance({ summary }: AwardSummaryProps) {
  if (summary.ceremonies.length === 0) return null;
  const hasWins = summary.totalWins > 0;
  const records = getHighlightedAwardRecords(summary);
  const breakdown = getAwardBreakdown(summary);

  return (
    <div className="relative mt-8 overflow-hidden border border-[#D4AF37]/20 bg-gradient-to-br from-[#16130b] via-[#0d0d14] to-[#0a0a10] p-7 sm:p-9">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${HERO_AWARD_GOLD}24, transparent 70%)` }}
      />
      <div className="relative grid gap-8 sm:grid-cols-[auto_1fr] sm:gap-10">
        <div className="sm:border-r sm:border-white/10 sm:pr-10">
          <p
            className="font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.4em]"
            style={{ color: `${HERO_AWARD_GOLD}cc` }}
          >
            {hasWins ? "Awards Dominance" : "Award Recognition"}
          </p>
          <div className="mt-3 flex items-end gap-7">
            {hasWins && (
              <div>
                <span
                  className="block font-[family-name:var(--font-display)] text-[4.5rem] font-bold leading-none tabular-nums"
                  style={{ color: HERO_AWARD_GOLD, textShadow: `0 0 40px ${HERO_AWARD_GOLD}40` }}
                >
                  {summary.totalWins}
                </span>
                <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.32em] text-white/40">
                  Wins
                </p>
              </div>
            )}
            <div className={hasWins ? "pb-1.5" : undefined}>
              <span
                className={`block font-[family-name:var(--font-display)] font-bold leading-none tabular-nums ${hasWins ? "text-[2.75rem] font-semibold text-white/45" : "text-[4.5rem]"}`}
                style={hasWins ? undefined : { color: HERO_AWARD_GOLD, textShadow: `0 0 40px ${HERO_AWARD_GOLD}40` }}
              >
                {summary.totalNominations}
              </span>
              <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.32em] text-white/40">
                Nominations
              </p>
            </div>
          </div>
          {breakdown.length > 1 && (
            <p className="mt-5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] text-[#9a8a55]">
              {breakdown.join(" · ")}
            </p>
          )}
        </div>
        {records.length > 0 && (
          <div>
            <p className="font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.4em] text-white/40">
              {hasWins ? "Won" : "Nominated"}
            </p>
            <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {records.map((record) => (
                <li
                  key={`${record.awardBody}-${record.awardYear}-${record.category}-${record.nominee}`}
                  className="flex items-baseline gap-2.5"
                >
                  <span className="shrink-0 text-[11px]" style={{ color: HERO_AWARD_GOLD }} aria-hidden>
                    ◆
                  </span>
                  <span className="text-[0.82rem] leading-5 text-[#e8ddb8]">
                    {record.category}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
