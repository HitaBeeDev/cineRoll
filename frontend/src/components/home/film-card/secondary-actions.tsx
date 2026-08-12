import { Share2 } from "lucide-react";
import { SharePopover } from "@/components/share-popover";
import { SaveToListButton } from "@/components/save-to-list-dialog";
import { cn } from "@/lib/utils/cn";
import type { RollFilm } from "@/lib/api";
import { ViewDetailsLink } from "@/components/home/film-card/view-details-link";

/** The bottom action row: View details, Add to list, and Share. */
export function SecondaryActions({
  film,
  isAuthenticated,
  onEngage,
  className,
  showViewDetails = true,
  showLabels = false,
}: {
  film: RollFilm;
  isAuthenticated: boolean;
  onEngage?: (() => void) | undefined;
  className?: string | undefined;
  /**
   * False in the roll panel, which carries View details in its footer instead —
   * the one place it is reachable without scrolling. Printing it here too would
   * put the same destination on screen twice.
   */
  showViewDetails?: boolean;
  /**
   * Spells the two out instead of leaving them as bare glyphs. On in the panel,
   * where they sit alone at the end of a column with no neighbouring text to
   * borrow meaning from; off in the page rail, where they flank a labelled
   * View details in a row too narrow for three sets of words.
   */
  showLabels?: boolean;
}) {
  // Built by branch rather than by override: `cn` is a plain join, so a base
  // `h-9` followed by an `h-11` would leave both in the class list.
  const button = cn(
    "flex items-center justify-center gap-2 px-3",
    "border border-edge text-[12px] text-fg-muted",
    "font-[family-name:var(--font-geist-mono)]",
    "transition-colors hover:border-edge-strong hover:text-fg-hi",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
    showLabels ? "h-9 flex-1 rounded-lg" : "h-11 rounded-xl",
  );

  return (
    <div className={cn("mt-1 flex items-center gap-2", className)}>
      {showViewDetails && (
        <ViewDetailsLink
          film={film}
          onEngage={onEngage}
          className={cn(
            "flex-1 rounded-xl py-3 text-[13px] text-fg-hi",
            "border border-edge-strong hover:border-edge-hover",
          )}
        />
      )}
      <SaveToListButton
        filmId={film.id}
        filmTitle={film.title}
        isAuthenticated={isAuthenticated}
        iconOnly={!showLabels}
        label="Add to list"
        className={button}
      />
      <SharePopover
        slug={film.slug}
        title={film.title}
        url={`${typeof window !== "undefined" ? window.location.origin : ""}/film/${film.slug}?from=roll`}
        caption={film.plot ?? undefined}
        triggerAriaLabel="Share this film"
        triggerClassName={button}
      >
        <Share2 className="h-4 w-4" aria-hidden />
        {showLabels && "Share"}
      </SharePopover>
    </div>
  );
}
