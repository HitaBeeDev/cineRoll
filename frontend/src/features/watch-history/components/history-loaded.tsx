import type { HistoryLoadedProps } from "../component-props";
import { HistoryCount } from "./history-count";
import { HistoryEmptyState } from "./history-empty-state";
import { HistoryGrid } from "./history-grid";

export function HistoryLoaded({ result }: HistoryLoadedProps) {
  const total = result.total ?? result.entries.length;

  return (
    <>
      <HistoryCount total={total} />
      <div className="mt-8">
        {result.entries.length === 0 ? (
          <HistoryEmptyState />
        ) : (
          <HistoryGrid
            entries={result.entries}
            initialNextCursor={result.nextCursor}
          />
        )}
      </div>
    </>
  );
}
