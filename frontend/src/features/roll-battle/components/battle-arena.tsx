import type { BattleArenaProps } from "../component-props";
import { getNextBoutLabel } from "../next-bout-label";
import { BattleStage } from "./battle-stage";
import { BracketRail } from "./bracket-rail";
import { ChampionRail } from "./champion-rail";

export function BattleArena(props: BattleArenaProps) {
  return (
    <div className="grid w-full max-w-5xl grid-cols-1 items-start gap-4 lg:grid-cols-[160px_minmax(0,672px)_160px]">
      <ChampionRail
        champion={props.championRailFilm}
        completedRound={props.completedRound}
      />
      <BattleStage {...props} />
      <BracketRail
        champion={props.championRailFilm}
        roundsLeft={props.roundsLeft}
        nextBoutLabel={getNextBoutLabel(props.round, props.films)}
      />
    </div>
  );
}
