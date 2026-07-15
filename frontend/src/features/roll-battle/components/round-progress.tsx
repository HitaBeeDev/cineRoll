import { ROLL_BATTLE_TOTAL_ROUNDS } from "../constants";
import type { RoundProgressProps } from "../component-props";

export function RoundProgress({ round }: RoundProgressProps) {
  return (
    <>
      <div className="flex items-center gap-1.5 pt-0.5" aria-hidden>
        {Array.from({ length: ROLL_BATTLE_TOTAL_ROUNDS }).map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${getProgressClass(index, round)}`}
          />
        ))}
      </div>
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#555568]">
        Round {round + 1} of {ROLL_BATTLE_TOTAL_ROUNDS}
      </p>
    </>
  );
}

function getProgressClass(index: number, round: number): string {
  if (index < round) return "w-5 bg-[#e8453c]";
  if (index === round) return "w-5 bg-[#e8453c]/50";
  return "w-3 bg-[#1e1e2a]";
}
