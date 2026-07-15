"use client";

import type { HistoryGridProps } from "../component-props";
import { useHistoryGrid } from "../use-history-grid";
import { HistoryCard } from "./history-card";
import { LoadMoreButton } from "./load-more-button";

export function HistoryGrid({
  entries,
  initialNextCursor = null,
}: HistoryGridProps) {
  const history = useHistoryGrid(entries, initialNextCursor);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {history.entries.map((entry) => (
          <HistoryCard
            key={entry.id}
            entry={entry}
            busy={history.busyFilmIds.has(entry.film.id)}
            onRate={(film, sentiment) => {
              void history.rateFilm(film, sentiment);
            }}
            onRemove={(film) => {
              void history.removeFilm(film);
            }}
          />
        ))}
      </div>
      {history.hasMore && (
        <LoadMoreButton
          isLoading={history.isLoadingMore}
          onClick={() => void history.loadMore()}
        />
      )}
    </>
  );
}
