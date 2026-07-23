"use client";

import type { SavedFilmEntry } from "@/types/saved-film";
import { ListDetailCard } from "./list-detail-card";
import { useListDetailGrid } from "./use-list-detail-grid";

// A list entry carries the same film summary shape as a watchlist entry.
export type ListEntry = SavedFilmEntry;

export function ListDetailGrid({
  listId,
  entries,
  initialNextCursor = null,
}: {
  listId: string;
  entries: ListEntry[];
  initialNextCursor?: string | null;
}) {
  const { films, removing, nextCursor, loadingMore, loadMore, remove } =
    useListDetailGrid(listId, entries, initialNextCursor);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {films.map(({ id, film }) => (
          <ListDetailCard
            key={id}
            film={film}
            removing={removing.has(film.id)}
            onRemove={remove}
          />
        ))}
      </div>
      {nextCursor ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="inline-flex items-center rounded-xl border border-white/15 bg-[#0d0d1a] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#cfcadb] transition-colors hover:border-[#e8453c]/60 hover:text-[#e8453c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </>
  );
}
