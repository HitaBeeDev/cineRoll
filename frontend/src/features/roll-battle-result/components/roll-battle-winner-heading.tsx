import { Trophy } from "lucide-react";
import type { RollBattleWinnerProps } from "../component-props";

export function RollBattleWinnerHeading({ film }: RollBattleWinnerProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="flex items-center justify-center gap-2">
        <Trophy className="h-4 w-4 shrink-0 text-[#D4AF37]" aria-hidden />
        <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.35em] text-[#D4AF37]">
          Roll Battle Winner
        </span>
        <Trophy className="h-4 w-4 shrink-0 text-[#D4AF37]" aria-hidden />
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[#F5F5F0] sm:text-4xl">
        {film.title}
      </h1>
    </div>
  );
}
