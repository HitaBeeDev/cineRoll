import { ROLL_BATTLE_TOTAL_ROUNDS } from "../constants";
import type { BracketRailProps } from "../component-props";

export function BracketRail({
  champion,
  roundsLeft,
  nextBoutLabel,
}: BracketRailProps) {
  const roundLabel = champion
    ? `${roundsLeft} ${roundsLeft === 1 ? "round" : "rounds"} left`
    : `${ROLL_BATTLE_TOTAL_ROUNDS} rounds total`;

  return (
    <aside className="hidden pt-28 lg:block">
      <div className="border-r border-[#1e1e2a] pr-4 text-right">
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.24em] text-[#555568]">
          Bracket
        </p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-base font-bold leading-tight text-[#F5F5F0]/80">
          {roundLabel}
        </p>
        <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[#77778a]">
          {nextBoutLabel}
        </p>
      </div>
    </aside>
  );
}
