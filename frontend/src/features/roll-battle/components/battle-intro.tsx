import { buildMatchupContext } from "../build-matchup-context";
import type { BattleIntroProps } from "../component-props";

export function BattleIntro({ leftFilm, rightFilm }: BattleIntroProps) {
  return (
    <>
      <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.35em] text-[#555568]">
        Roll Battle
      </span>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0] sm:text-3xl">
        Which film wins tonight?
      </h1>
      <p className="max-w-md text-sm leading-5 text-[#F5F5F0]/62">
        Pick the film you would save for tonight&apos;s screening. Five rounds
        crown your winner.
      </p>
      <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-[#D4AF37]/80">
        {buildMatchupContext(leftFilm, rightFilm)}
      </p>
    </>
  );
}
