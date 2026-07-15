import { Bookmark, EyeOff } from "lucide-react";
import type { RecommendationActionBarProps } from "../recommendation-component-types";
import { RecommendationActionButton } from "./recommendation-action-button";

export function RecommendationActionBar({
  actions,
}: RecommendationActionBarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-end gap-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
      <RecommendationActionButton
        label={actions.inWatchlist ? "Saved to watchlist" : "Save to watchlist"}
        active={actions.inWatchlist}
        disabled={actions.watchlistPending}
        onClick={actions.onToggleWatchlist}
        icon={
          <Bookmark
            className="h-4 w-4"
            fill={actions.inWatchlist ? "currentColor" : "none"}
            aria-hidden
          />
        }
      />
      <RecommendationActionButton
        label="Not interested"
        disabled={actions.decisionPending}
        onClick={actions.onNotInterested}
        icon={<EyeOff className="h-4 w-4" aria-hidden />}
      />
    </div>
  );
}
