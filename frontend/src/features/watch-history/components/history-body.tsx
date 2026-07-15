import type { HistoryBodyProps } from "../component-props";
import { ProfileCollectionError } from "@/components/profile-collection/profile-collection-error";
import { HistoryLoaded } from "./history-loaded";

export async function HistoryBody({ resultPromise }: HistoryBodyProps) {
  const result = await resultPromise;
  return result.status === "error" ? (
    <ProfileCollectionError collectionName="watch history" />
  ) : (
    <HistoryLoaded result={result} />
  );
}
