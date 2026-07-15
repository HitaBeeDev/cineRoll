import type { BattleArenaProps } from "../component-props";
import { BattleHeading } from "./battle-heading";
import { BattleMatchup } from "./battle-matchup";

export function BattleStage({
  leftFilm,
  rightFilm,
  selectedFilm,
  pickedId,
  round,
  reducedMotion,
  onPick,
}: BattleArenaProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <BattleHeading
        leftFilm={leftFilm}
        rightFilm={rightFilm}
        selectedFilm={selectedFilm}
        round={round}
        reducedMotion={reducedMotion}
      />
      <BattleMatchup
        leftFilm={leftFilm}
        rightFilm={rightFilm}
        pickedId={pickedId}
        round={round}
        reducedMotion={reducedMotion}
        onPick={onPick}
      />
    </div>
  );
}
