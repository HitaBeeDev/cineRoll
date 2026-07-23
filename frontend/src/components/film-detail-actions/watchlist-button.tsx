import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SECONDARY_BUTTON,
  SECONDARY_IDLE,
} from "@/components/film-detail-actions/styles";

/** Secondary CTA that toggles the film in the user's watchlist. */
export function WatchlistButton({
  inWatchlist,
  pending,
  onToggle,
}: {
  inWatchlist: boolean;
  pending: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={inWatchlist}
      disabled={pending}
      onClick={onToggle}
      className={cn(
        SECONDARY_BUTTON,
        inWatchlist ? "border-[#e8453c]/50 bg-[#e8453c]/15 text-white" : SECONDARY_IDLE,
      )}
    >
      <Bookmark
        className="h-3.5 w-3.5"
        fill={inWatchlist ? "currentColor" : "none"}
        aria-hidden
      />
      {inWatchlist ? "Saved" : "Watchlist"}
    </button>
  );
}
