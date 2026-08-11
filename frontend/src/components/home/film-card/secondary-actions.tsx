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
}: {
  film: RollFilm;
  isAuthenticated: boolean;
  onEngage?: (() => void) | undefined;
  className?: string | undefined;
  /**
   * False in the roll dialog, which carries View details in its pinned footer
   * instead — the one place it is reachable without scrolling. Printing it here
   * too would put the same destination on screen twice.
   */
  showViewDetails?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2 mt-1", className)}>
      {showViewDetails && (
        <ViewDetailsLink
          film={film}
          onEngage={onEngage}
          className={cn(
            "flex-1 rounded-xl py-3 text-[12px] tracking-[0.2em]",
            "border border-[#2a2a3e] hover:border-[#6a6a85]",
          )}
        />
      )}
      <SaveToListButton
        filmId={film.id}
        filmTitle={film.title}
        isAuthenticated={isAuthenticated}
        iconOnly
        label="Add to list"
        className={cn(
          "flex h-11 items-center justify-center rounded-xl px-3",
          "border border-[#1e1e2a] text-[#a8a8ba]",
          "transition-colors hover:border-[#2a2a3e] hover:text-[#F5F5F0]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        )}
      />
      <SharePopover
        slug={film.slug}
        title={film.title}
        url={`${typeof window !== "undefined" ? window.location.origin : ""}/film/${film.slug}?from=roll`}
        caption={film.plot ?? undefined}
        triggerAriaLabel="Share this film"
        triggerClassName={cn(
          "flex h-11 items-center justify-center rounded-xl px-3",
          "border border-[#1e1e2a] text-[#a8a8ba]",
          "transition-colors hover:border-[#2a2a3e] hover:text-[#F5F5F0]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        )}
      >
        <Share2 className="h-4 w-4" aria-hidden />
      </SharePopover>
    </div>
  );
}
