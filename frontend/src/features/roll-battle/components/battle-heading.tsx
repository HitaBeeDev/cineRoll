import type { BattleHeadingProps } from "../component-props";
import { BattleIntro } from "./battle-intro";
import { RoundProgress } from "./round-progress";
import { SelectedFilmAnnouncement } from "./selected-film-announcement";

export function BattleHeading({
  leftFilm,
  rightFilm,
  selectedFilm,
  round,
  reducedMotion,
}: BattleHeadingProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <BattleIntro leftFilm={leftFilm} rightFilm={rightFilm} />
      <RoundProgress round={round} />
      <SelectedFilmAnnouncement
        film={selectedFilm}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}
