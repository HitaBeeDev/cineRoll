import type { ProfileStatsProps } from "../profile-component-types";
import { FavoriteGenres } from "./favorite-genres";
import { ProfileStat } from "./profile-stat";

export function ProfileStats({ summary }: ProfileStatsProps) {
  const hasNoActivity =
    summary.rated === 0 && summary.watchlist === 0 && summary.watched === 0;
  const hasRatedGenres =
    summary.genresFromRatings && summary.favoriteGenres.length > 0;

  return (
    <div className="mt-8 border-t border-[#1e1e2a] pt-7">
      <div className="flex flex-wrap gap-x-12 gap-y-5">
        <ProfileStat label="Films rated" value={summary.rated} />
        <ProfileStat label="Watchlist" value={summary.watchlist} />
        <ProfileStat label="Watched" value={summary.watched} />
      </div>
      {hasNoActivity && (
        <p className="mt-5 font-[family-name:var(--font-geist-mono)] text-[11px] leading-relaxed text-[#9a9aac]">
          Your stats fill in as you go — roll films to rate them, save some to
          your watchlist, and mark what you’ve watched.
        </p>
      )}
      {hasRatedGenres && <FavoriteGenres genres={summary.favoriteGenres} />}
    </div>
  );
}
