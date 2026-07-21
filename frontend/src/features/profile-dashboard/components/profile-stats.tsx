import type { ProfileStatsProps } from "../profile-component-types";
import { FavoriteGenres } from "./favorite-genres";
import { ProfileStat } from "./profile-stat";

export function ProfileStats({ summary }: ProfileStatsProps) {
  const hasNoActivity =
    summary.watchlist === 0 && summary.watched === 0;
  const hasRatedGenres =
    summary.genresFromSignals && summary.favoriteGenres.length > 0;

  return (
    <div className="mt-8 border-t border-[#1e1e2a] pt-7">
      <div className="flex flex-wrap gap-x-12 gap-y-5">
        <ProfileStat label="Watchlist" value={summary.watchlist} />
        <ProfileStat label="Watched" value={summary.watched} />
      </div>
      {hasNoActivity && (
        <p className="mt-5 font-[family-name:var(--font-geist-mono)] text-[13px] leading-relaxed text-[#b4b4c4]">
          Your stats fill in as you go — save films to your watchlist and mark
          what you’ve watched.
        </p>
      )}
      {hasRatedGenres && <FavoriteGenres genres={summary.favoriteGenres} />}
    </div>
  );
}
