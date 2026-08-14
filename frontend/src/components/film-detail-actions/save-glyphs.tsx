import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { HoverTooltip } from "@/components/hover-tooltip";
import { SaveToListButton } from "@/components/save-to-list-dialog";
import { GlyphButton } from "@/components/film-detail-actions/glyph-button";
import { GLYPH_BUTTON } from "@/components/film-detail-actions/styles/glyph-button";
import { GLYPH_IDLE } from "@/components/film-detail-actions/styles/glyph-idle";

// Saved lights an accent ring and fills the bookmark — one step cooler than the
// heart's loved state (/50 and /15 against /70 and /20), which is the gap the
// rating ladder was already written around. Filling the shape is what keeps the
// two apart at a glance: a bookmark is not a heart.
const SAVED_ACTIVE = "border-accent/50 bg-accent/15 text-white";

/**
 * Saving, as two glyphs: the watchlist toggle, and filing the film in a named
 * list.
 *
 * These were one bordered split rectangle — a label welded to an icon square —
 * which put a second visual language in a row whose stated intent is circular
 * glyphs echoing the accolade medallions. The two are still one idea to the
 * reader, and now they say so by sitting next to each other in the same shape
 * as everything else, rather than by sharing a border no other control has.
 */
export function SaveGlyphs({
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
    <div className="flex items-center gap-2.5">
      <GlyphButton
        label={inWatchlist ? "Saved to watchlist" : "Watchlist"}
        active={inWatchlist}
        activeClassName={SAVED_ACTIVE}
        disabled={pending}
        onClick={onToggle}
      >
        <Bookmark
          className="h-4 w-4"
          fill={inWatchlist ? "currentColor" : "none"}
          aria-hidden
        />
      </GlyphButton>

      <HoverTooltip label="Add to a list">
        <SaveToListButton
          filmId={filmId}
          filmTitle={filmTitle}
          isAuthenticated={isAuthenticated}
          label="Add to a list"
          iconOnly
          className={cn(GLYPH_BUTTON, GLYPH_IDLE)}
        />
      </HoverTooltip>
    </div>
  );
}
