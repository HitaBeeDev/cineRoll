import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SaveToListButton } from "@/components/save-to-list-dialog";
import { SPLIT_HALF } from "@/components/film-detail-actions/styles/split-half";
import { SPLIT_SHELL } from "@/components/film-detail-actions/styles/split-shell";

const SHELL_IDLE = "border-white/30 bg-white/[0.12] text-white";
const SHELL_SAVED = "border-[#e8453c]/50 bg-[#e8453c]/15 text-white";

/**
 * Saving, as one control with two halves: the label toggles the watchlist, the
 * trailing icon files the film in a named list. Both are the same idea to the
 * person reading the row, so they share a border instead of competing for two
 * slots in it.
 */
export function WatchlistButton({
  filmId,
  filmTitle,
  isAuthenticated,
  inWatchlist,
  pending,
  onToggle,
}: {
  filmId: string;
  filmTitle: string;
  isAuthenticated: boolean;
  inWatchlist: boolean;
  pending: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={cn(SPLIT_SHELL, inWatchlist ? SHELL_SAVED : SHELL_IDLE)}>
      <button
        type="button"
        aria-pressed={inWatchlist}
        disabled={pending}
        onClick={onToggle}
        className={cn(SPLIT_HALF, "gap-2.5 px-5")}
      >
        <Bookmark
          className="h-3.5 w-3.5"
          fill={inWatchlist ? "currentColor" : "none"}
          aria-hidden
        />
        {inWatchlist ? "Saved" : "Watchlist"}
      </button>

      <span aria-hidden className="w-px bg-current opacity-25" />

      <SaveToListButton
        filmId={filmId}
        filmTitle={filmTitle}
        isAuthenticated={isAuthenticated}
        label="Add to a list"
        iconOnly
        className={cn(SPLIT_HALF, "w-12")}
      />
    </div>
  );
}
