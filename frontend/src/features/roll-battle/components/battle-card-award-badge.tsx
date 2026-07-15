import type { BattleCardAwardBadgeProps } from "../component-props";

export function BattleCardAwardBadge({ wins }: BattleCardAwardBadgeProps) {
  const colorClass = wins > 0
    ? "border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#D4AF37]"
    : "border-[#F5F5F0]/10 bg-[#09090f]/45 text-[#F5F5F0]/45";

  return (
    <div className={`absolute left-2 top-2 rounded-full border px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest ${colorClass}`}>
      {wins === 1 ? "1 Win" : `${wins} Wins`}
    </div>
  );
}
