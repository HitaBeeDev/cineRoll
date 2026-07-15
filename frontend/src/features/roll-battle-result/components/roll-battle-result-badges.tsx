import { formatRuntime } from "@/lib/format";
import { ROLL_BATTLE_BADGE_CLASS } from "../component-class-names";
import type { RollBattleWinnerProps } from "../component-props";

export function RollBattleResultBadges({ film }: RollBattleWinnerProps) {
  const runtime = formatRuntime(film.runtime);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`${ROLL_BATTLE_BADGE_CLASS} text-[#F5F5F0]/70`}>
        {film.year}
      </span>
      {runtime && (
        <span className={`${ROLL_BATTLE_BADGE_CLASS} text-[#F5F5F0]/70`}>
          {runtime}
        </span>
      )}
      <span className={`${ROLL_BATTLE_BADGE_CLASS} ${film.imdbRating == null ? "text-[#F5F5F0]/30" : "text-[#F5F5F0]/70"}`}>
        {film.imdbRating == null
          ? "No IMDb Score"
          : `IMDb ${film.imdbRating.toFixed(1)}`}
      </span>
      <span className={`${ROLL_BATTLE_BADGE_CLASS} ${film.rtScore == null ? "text-[#F5F5F0]/30" : "text-[#F5F5F0]/70"}`}>
        {film.rtScore == null ? "No RT Score" : `RT ${film.rtScore}%`}
      </span>
    </div>
  );
}
