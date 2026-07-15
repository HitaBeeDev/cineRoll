import type { RollBattleWinnerProps } from "../component-props";
import { RollBattleWinnerDetails } from "./roll-battle-winner-details";
import { RollBattleWinnerPoster } from "./roll-battle-winner-poster";

export function RollBattleWinnerCard({
  film,
  emptyAwardsLabel,
}: RollBattleWinnerProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-[220px_1fr] sm:items-start">
      <RollBattleWinnerPoster
        imageUrl={film.posterUrl ?? film.backdropUrl}
        title={film.title}
      />
      <RollBattleWinnerDetails
        film={film}
        {...(emptyAwardsLabel ? { emptyAwardsLabel } : {})}
      />
    </div>
  );
}
