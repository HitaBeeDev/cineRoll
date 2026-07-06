import type { ClueCard } from "./types";

type ClueCardItemProps = {
  card: ClueCard;
};

export function ClueCardItem({ card }: ClueCardItemProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#2a2a3e] bg-[#09090f]/80 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[#77778b]">
        {card.label}
      </span>
      <span className="font-[family-name:var(--font-display)] text-base font-bold leading-none">
        {card.value}
      </span>
    </div>
  );
}
