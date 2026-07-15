"use client";

import { ProfileCollectionLoadMore } from "@/components/profile-collection/profile-collection-load-more";
import type { WatchlistGridProps } from "../component-props";
import { useWatchlist } from "../use-watchlist";
import { WatchlistCard } from "./watchlist-card";

export function WatchlistGrid(props: WatchlistGridProps) {
  const watchlist = useWatchlist(props);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {watchlist.entries.map((entry) => (
          <WatchlistCard
            key={entry.id}
            entry={entry}
            isRemoving={watchlist.removingFilmIds.has(entry.film.id)}
            onRemove={(film) => void watchlist.removeFilm(film)}
          />
        ))}
      </div>
      {watchlist.hasMore && (
        <ProfileCollectionLoadMore
          isLoading={watchlist.isLoadingMore}
          onClick={() => void watchlist.loadMore()}
        />
      )}
    </>
  );
}
