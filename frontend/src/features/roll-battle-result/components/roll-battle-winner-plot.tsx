import type { RollBattleWinnerProps } from "../component-props";

export function RollBattleWinnerPlot({ film }: RollBattleWinnerProps) {
  if (!film.plot) return null;

  return (
    <p className="text-sm leading-6 text-[#F5F5F0]/65 sm:text-base sm:leading-7">
      {film.plot}
    </p>
  );
}
