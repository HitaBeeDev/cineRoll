import type { BattleCardPosterProps } from "../component-props";
import { getAwardWinCount } from "../film-signals";
import { BattleCardAwardBadge } from "./battle-card-award-badge";
import { BattleCardImage } from "./battle-card-image";
import { BattleCardRatingBadge } from "./battle-card-rating-badge";
import { BattleCardWinnerOverlay } from "./battle-card-winner-overlay";

export function BattleCardPoster({ film, isPicked }: BattleCardPosterProps) {
  return (
    <div className="relative h-[clamp(220px,34dvh,340px)] w-full overflow-hidden bg-[#07070d]">
      <BattleCardImage film={film} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d0d1a]/58 via-[#0d0d1a]/8 to-transparent" />
      <BattleCardWinnerOverlay visible={isPicked} />
      <BattleCardAwardBadge wins={getAwardWinCount(film)} />
      <BattleCardRatingBadge rating={film.imdbRating} />
    </div>
  );
}
