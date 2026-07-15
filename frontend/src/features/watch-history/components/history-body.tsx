import type { HistoryBodyProps } from "../component-props";
import { HistoryErrorState } from "./history-error-state";
import { HistoryLoaded } from "./history-loaded";

export async function HistoryBody({ resultPromise }: HistoryBodyProps) {
  const result = await resultPromise;
  return result.status === "error" ? (
    <HistoryErrorState />
  ) : (
    <HistoryLoaded result={result} />
  );
}
