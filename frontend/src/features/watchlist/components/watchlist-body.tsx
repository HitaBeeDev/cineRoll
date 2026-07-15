import { ProfileCollectionError } from "@/components/profile-collection/profile-collection-error";
import type { WatchlistBodyProps } from "../component-props";
import { WatchlistLoaded } from "./watchlist-loaded";

export async function WatchlistBody({ resultPromise }: WatchlistBodyProps) {
  const result = await resultPromise;
  return result.status === "error" ? (
    <ProfileCollectionError collectionName="watchlist" />
  ) : (
    <WatchlistLoaded result={result} />
  );
}
