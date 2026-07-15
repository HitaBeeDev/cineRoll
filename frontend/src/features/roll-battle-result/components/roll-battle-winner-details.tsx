import type { RollBattleWinnerProps } from "../component-props";
import { RollBattleGenres } from "./roll-battle-genres";
import { RollBattleResultBadges } from "./roll-battle-result-badges";
import { RollBattleWinnerCredit } from "./roll-battle-winner-credit";
import { RollBattleWinnerPlot } from "./roll-battle-winner-plot";

export function RollBattleWinnerDetails({ film }: RollBattleWinnerProps) {
  return (
    <div className="flex flex-col gap-4">
      <RollBattleResultBadges film={film} />
      <RollBattleGenres genres={film.genres} />
      <RollBattleWinnerCredit film={film} />
      <RollBattleWinnerPlot film={film} />
    </div>
  );
}
