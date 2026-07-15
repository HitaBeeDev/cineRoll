import { Bookmark } from "lucide-react";
import { ProfileCollectionCount } from "@/components/profile-collection/profile-collection-count";
import { ProfileCollectionEmpty } from "@/components/profile-collection/profile-collection-empty";
import type { WatchlistLoadedProps } from "../component-props";
import { WatchlistGrid } from "./watchlist-grid";

export function WatchlistLoaded({ result }: WatchlistLoadedProps) {
  const total = result.total ?? result.entries.length;

  return (
    <>
      <ProfileCollectionCount
        total={total}
        singularLabel="film saved"
        pluralLabel="films saved"
      />
      <div className="mt-8">
        {result.entries.length === 0 ? (
          <ProfileCollectionEmpty
            icon={<Bookmark className="h-5 w-5 text-[#7a7a8c]" />}
            title="Nothing saved yet"
            description="Save films from rolls, recommendations, or film pages and they’ll appear here."
          />
        ) : (
          <WatchlistGrid
            entries={result.entries}
            initialNextCursor={result.nextCursor}
          />
        )}
      </div>
    </>
  );
}
